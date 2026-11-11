/* Dopamine - Run & Walk tracker
 * GPS tracking (works in the background through a foreground service on Android), live map, goals, history.
 * Everything is stored on this phone only (localStorage key "dopamine_tracker_v1"); nothing is sent anywhere
 * except map tile requests to OpenStreetMap.
 * Uses globals from index.html: appState, showToast, notifyNow, notifPlugin, fsPlugin, isNativeApp.
 */
(function () {
  'use strict';

  var KEY = 'dopamine_tracker_v1';
  var MAX_ACC = 35;          // ignore GPS fixes less accurate than this (metres)
  var TARGET_RADIUS = 25;    // metres: "reached" distance for a map-pin goal
  var MAX_HISTORY = 300;
  var NOTIF_GOAL_ID = 1004;

  function $(id) { return document.getElementById(id); }
  function native() { try { return typeof isNativeApp === 'function' && isNativeApp(); } catch (e) { return false; } }
  function plugin(name) {
    try {
      var C = window.Capacitor;
      if (!C || !native()) return null;
      return (C.Plugins && C.Plugins[name]) || (C.registerPlugin && C.registerPlugin(name)) || null;
    } catch (e) { return null; }
  }
  function toast(m) { try { showToast(m); } catch (e) { } }

  // ---------- storage ----------
  function defaults() { return { goal: { type: 'distance', value: 5, target: null }, mode: 'walk', history: [], active: null, askedBatt: false }; }
  function load() {
    try {
      var j = JSON.parse(localStorage.getItem(KEY));
      if (j && typeof j === 'object') {
        var d = defaults();
        for (var k in d) if (j[k] === undefined) j[k] = d[k];
        if (!j.goal || typeof j.goal !== 'object') j.goal = d.goal;
        if (!Array.isArray(j.history)) j.history = [];
        return j;
      }
    } catch (e) { }
    return defaults();
  }
  var S = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); return true; }
    catch (e) { toast('Could not save: phone storage is full'); return false; }
  }

  // ---------- maths ----------
  function hav(a, b) {
    var R = 6371000, r = Math.PI / 180;
    var dLa = (b[0] - a[0]) * r, dLo = (b[1] - a[1]) * r;
    var x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
  }
  function elapsedMs(a) { return a.accMs + (a.segStart ? Date.now() - a.segStart : 0); }
  function fmtTime(ms) {
    var t = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return (h ? h + ':' + p(m) : m) + ':' + p(s);
  }
  function fmtKm(m) { return (m / 1000).toFixed(2); }
  function fmtPace(ms, m) {
    if (m < 30 || ms <= 0) return '--:--';
    var sPerKm = (ms / 1000) / (m / 1000);
    if (sPerKm > 5999) return '--:--';
    var mm = Math.floor(sPerKm / 60), ss = Math.round(sPerKm % 60);
    if (ss === 60) { mm++; ss = 0; }
    return mm + ':' + (ss < 10 ? '0' : '') + ss;
  }
  // Energy estimate (ACSM walking / running equations) using the weight from the profile and the app's calorie mode.
  function kcalFor(mode, dist, ms) {
    var min = ms / 60000;
    if (min <= 0 || dist <= 0) return 0;
    var v = dist / min; // metres per minute
    var vo2 = (mode === 'run' ? 0.2 : 0.1) * v + 3.5;
    if ((appState.settings.calorieMode || 'active') !== 'total') vo2 -= 3.5;
    var kg = (appState.profile && appState.profile.weight > 0) ? appState.profile.weight : 70;
    return Math.max(0, vo2 * kg / 1000 * 5 * min);
  }
  function simplify(seg, minStep) {
    if (seg.length <= 2) return seg.map(function (p) { return [+p[0].toFixed(5), +p[1].toFixed(5)]; });
    var out = [seg[0]], last = seg[0];
    for (var i = 1; i < seg.length - 1; i++) { if (hav(last, seg[i]) >= minStep) { out.push(seg[i]); last = seg[i]; } }
    out.push(seg[seg.length - 1]);
    while (out.length > 700) out = out.filter(function (_, i) { return i % 2 === 0 || i === out.length - 1; });
    return out.map(function (p) { return [+p[0].toFixed(5), +p[1].toFixed(5)]; });
  }

  // ---------- location source (native plugin, or the browser as a foreground-only fallback) ----------
  var activeWatch = null, previewWatch = null, lastFix = null;

  function watch(opts, cb) {
    var BG = plugin('BackgroundGeolocation');
    if (BG) {
      var id = null, stopped = false;
      var p = BG.addWatcher(opts, function (loc, err) { if (err) { cb(null, err); return; } cb(loc); });
      Promise.resolve(p).then(function (wid) { id = wid; if (stopped) { try { BG.removeWatcher({ id: wid }); } catch (e) { } } }).catch(function () { cb(null, { code: 'FAILED' }); });
      return { stop: function () { stopped = true; if (id != null) { try { BG.removeWatcher({ id: id }); } catch (e) { } } } };
    }
    if (navigator.geolocation) {
      var wid = navigator.geolocation.watchPosition(function (pos) {
        var c = pos.coords;
        cb({ latitude: c.latitude, longitude: c.longitude, accuracy: c.accuracy, speed: c.speed, time: pos.timestamp });
      }, function (err) { cb(null, { code: err && err.code === 1 ? 'NOT_AUTHORIZED' : 'FAILED' }); }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
      return { stop: function () { navigator.geolocation.clearWatch(wid); } };
    }
    return null;
  }

  // ---------- permissions ----------
  async function permState() {
    var st = { notif: 'na', loc: 'prompt', batt: null };
    try {
      var LN = typeof notifPlugin === 'function' ? notifPlugin() : null;
      if (LN) { var r = await LN.checkPermissions(); st.notif = r.display === 'granted' ? 'granted' : (r.display === 'denied' ? 'denied' : 'prompt'); }
    } catch (e) { }
    try {
      var G = plugin('Geolocation');
      if (G) { var g = await G.checkPermissions(); st.loc = g.location === 'granted' ? 'granted' : (g.location === 'denied' ? 'denied' : 'prompt'); }
      else if (navigator.permissions && navigator.permissions.query) { var q = await navigator.permissions.query({ name: 'geolocation' }); st.loc = q.state; }
    } catch (e) { }
    try {
      var F = typeof fsPlugin === 'function' ? fsPlugin() : null;
      if (F && F.isIgnoringBatteryOptimizations) st.batt = (await F.isIgnoringBatteryOptimizations()).value === true;
    } catch (e) { }
    return st;
  }

  function setRow(prefix, key, ok, subText, btnLabel) {
    var sub = $(prefix + key + '-sub'), btn = $(prefix + key + '-btn');
    if (sub) sub.innerHTML = '<span class="fc-dot ' + (ok === true ? 'ok' : (ok === false ? 'bad' : '')) + '"></span>' + subText;
    if (btn) { btn.classList.toggle('hidden', ok === true || ok === null); if (btnLabel) btn.textContent = btnLabel; }
  }

  window.trkRefreshPermUi = async function () {
    var st = await permState();
    ['perm-', 'tperm-'].forEach(function (pre) {
      if (st.notif === 'na') setRow(pre, 'notif', null, 'Available in the Android app');
      else if (st.notif === 'granted') setRow(pre, 'notif', true, 'Allowed. Tracking and goal alerts show in the notification bar');
      else if (st.notif === 'denied') setRow(pre, 'notif', false, 'Blocked. Open settings to allow it', 'Settings');
      else setRow(pre, 'notif', false, 'Needed so the tracking notification and goal alerts can show', 'Allow');

      if (st.loc === 'granted') setRow(pre, 'loc', true, 'Allowed. GPS keeps working with the screen off');
      else if (st.loc === 'denied') setRow(pre, 'loc', false, 'Blocked. Open settings and allow location', 'Settings');
      else setRow(pre, 'loc', false, 'Needed to record where you run or walk', 'Allow');

      if (st.batt === null) setRow(pre, 'batt', null, 'Available in the Android app');
      else if (st.batt) setRow(pre, 'batt', true, 'Unrestricted. Android will not pause tracking');
      else setRow(pre, 'batt', false, 'Recommended so Android does not stop tracking in the background', 'Allow');
    });
    var card = $('trk-perm-card');
    if (card) card.classList.toggle('hidden', st.loc === 'granted' && st.notif !== 'denied' && st.notif !== 'prompt' && st.batt !== false);
    return st;
  };

  window.trkOpenAppSettings = function () {
    var BG = plugin('BackgroundGeolocation');
    if (BG && BG.openSettings) { try { BG.openSettings(); return; } catch (e) { } }
    var F = typeof fsPlugin === 'function' ? fsPlugin() : null;
    if (F && F.requestIgnoreBatteryOptimizations) { try { F.requestIgnoreBatteryOptimizations(); } catch (e) { } }
  };

  async function askNotif(st) {
    var LN = typeof notifPlugin === 'function' ? notifPlugin() : null;
    if (!LN) return;
    if (st && st.notif === 'denied') { window.trkOpenAppSettings(); return; }
    try { if (typeof notifInit === 'function') await notifInit(true); else await LN.requestPermissions(); } catch (e) { }
  }
  async function askLoc(st) {
    if (st && st.loc === 'denied') { window.trkOpenAppSettings(); return; }
    var G = plugin('Geolocation');
    try {
      if (G) await G.requestPermissions({ permissions: ['location'] });
      else if (navigator.geolocation) await new Promise(function (res) { navigator.geolocation.getCurrentPosition(res, res, { timeout: 15000 }); });
    } catch (e) { }
  }
  async function askBatt() {
    var F = typeof fsPlugin === 'function' ? fsPlugin() : null;
    if (!F || !F.requestIgnoreBatteryOptimizations) return;
    try { await F.requestIgnoreBatteryOptimizations(); } catch (e) { }
  }

  window.trkAskPermission = async function (kind) {
    var st = await permState();
    if (kind === 'notif') await askNotif(st);
    else if (kind === 'loc') await askLoc(st);
    else if (kind === 'batt') await askBatt();
    window.trkRefreshPermUi();
    if (kind === 'loc') maybeStartPreview();
  };

  // ---------- map ----------
  var map = null, L_ = null, line = null, meMarker = null, accCircle = null, startMarker = null, targetMarker = null, targetLine = null, follow = true, viewLayer = null;

  function accentColor() {
    try { return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#f59e0b'; } catch (e) { return '#f59e0b'; }
  }
  function loadLeaflet() {
    if (window.L) return Promise.resolve(true);
    if (loadLeaflet._p) return loadLeaflet._p;
    loadLeaflet._p = new Promise(function (resolve) {
      var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'vendor/leaflet.css'; document.head.appendChild(css);
      var sc = document.createElement('script'); sc.src = 'vendor/leaflet.js';
      sc.onload = function () { resolve(true); };
      sc.onerror = function () { loadLeaflet._p = null; resolve(false); };
      document.head.appendChild(sc);
    });
    return loadLeaflet._p;
  }
  async function ensureMap() {
    var el = $('trk-map'); if (!el) return false;
    if (map) { setTimeout(function () { map.invalidateSize(); }, 60); return true; }
    var ok = await loadLeaflet();
    if (!ok || !window.L) { el.innerHTML = '<div class="trk-maperr">The map could not load. Distance and time still record.</div>'; return false; }
    L_ = window.L;
    map = L_.map(el, { zoomControl: false, attributionControl: true, tap: true });
    map.attributionControl.setPrefix(false);
    L_.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors', className: 'trk-tiles' }).addTo(map);
    map.setView(lastFix ? [lastFix.lat, lastFix.lng] : [20, 0], lastFix ? 16 : 2);
    line = L_.polyline([], { color: accentColor(), weight: 5, opacity: 0.95, lineJoin: 'round', lineCap: 'round' }).addTo(map);
    map.on('dragstart', function () { follow = false; var b = $('trk-center'); if (b) b.classList.remove('hidden'); });
    map.on('click', function (e) {
      if (S.goal.type !== 'target') return;
      S.goal.target = [e.latlng.lat, e.latlng.lng];
      if (S.active) { S.active.goal = JSON.parse(JSON.stringify(S.goal)); S.active.goalDone = false; }
      save(); drawTarget(); render();
    });
    setTimeout(function () { map.invalidateSize(); }, 60);
    drawTarget();
    if (S.active) drawActive(true);
    return true;
  }
  function meIcon() { return L_.divIcon({ className: 'trk-me', html: '<span></span>', iconSize: [22, 22], iconAnchor: [11, 11] }); }
  function updateMe(p, acc) {
    if (!map) return;
    var ll = [p[0], p[1]];
    if (!meMarker) meMarker = L_.marker(ll, { icon: meIcon(), interactive: false, keyboard: false }).addTo(map); else meMarker.setLatLng(ll);
    if (!accCircle) accCircle = L_.circle(ll, { radius: acc || 10, color: accentColor(), weight: 1, opacity: 0.4, fillOpacity: 0.08, interactive: false }).addTo(map);
    else { accCircle.setLatLng(ll); accCircle.setRadius(acc || 10); }
    if (follow) map.setView(ll, Math.max(map.getZoom(), 16), { animate: true });
  }
  function drawTarget() {
    if (!map) return;
    if (targetMarker) { map.removeLayer(targetMarker); targetMarker = null; }
    if (targetLine) { map.removeLayer(targetLine); targetLine = null; }
    var hint = $('trk-pinhint');
    if (hint) hint.classList.toggle('hidden', S.goal.type !== 'target');
    if (S.goal.type !== 'target' || !S.goal.target) return;
    targetMarker = L_.marker(S.goal.target, { icon: L_.divIcon({ className: 'trk-flag', html: '<b>&#9873;</b>', iconSize: [28, 28], iconAnchor: [6, 26] }), keyboard: false }).addTo(map);
    if (lastFix) targetLine = L_.polyline([[lastFix.lat, lastFix.lng], S.goal.target], { color: accentColor(), weight: 2, dashArray: '6 8', opacity: 0.7, interactive: false }).addTo(map);
  }
  function drawActive(fit) {
    if (!map || !S.active) return;
    var segs = S.active.segs.map(function (sg) { return sg.map(function (p) { return [p[0], p[1]]; }); });
    line.setLatLngs(segs);
    var first = S.active.segs[0] && S.active.segs[0][0];
    if (first && !startMarker) startMarker = L_.circleMarker([first[0], first[1]], { radius: 6, color: '#fff', weight: 2, fillColor: '#34d399', fillOpacity: 1, interactive: false }).addTo(map);
    if (fit && first && !follow) { try { map.fitBounds(line.getBounds(), { padding: [30, 30] }); } catch (e) { } }
  }
  function clearRoute() {
    if (!map) return;
    line.setLatLngs([]);
    if (startMarker) { map.removeLayer(startMarker); startMarker = null; }
    if (viewLayer) { map.removeLayer(viewLayer); viewLayer = null; }
  }
  window.trkCenter = function () {
    follow = true;
    var b = $('trk-center'); if (b) b.classList.add('hidden');
    if (map && lastFix) map.setView([lastFix.lat, lastFix.lng], Math.max(map.getZoom(), 16), { animate: true });
  };
  window.trkClearPin = function () { S.goal.target = null; if (S.active) { S.active.goal.target = null; } save(); drawTarget(); render(); };

  // ---------- fixes ----------
  function onFix(l) {
    if (!l || typeof l.latitude !== 'number') return;
    var p = [l.latitude, l.longitude, l.time || Date.now()];
    lastFix = { lat: p[0], lng: p[1], acc: l.accuracy, t: p[2] };
    updateMe(p, l.accuracy);
    var a = S.active;
    if (!a || !a.segStart) { render(); return; }
    if (l.accuracy > MAX_ACC) { render(); return; }
    var seg = a.segs[a.segs.length - 1], prev = seg[seg.length - 1];
    if (!prev) { seg.push(p); drawActive(); persistSoon(); render(); return; }
    var d = hav(prev, p), dt = (p[2] - prev[2]) / 1000;
    if (d < Math.max(3, Math.min(l.accuracy, 20) * 0.4)) { render(); return; }      // standing still / GPS jitter
    var vmax = a.mode === 'run' ? 12 : 6;                                           // m/s: reject jumps (bad fix, vehicle)
    if (dt > 0 && d / dt > vmax && (a.rejects || 0) < 3) { a.rejects = (a.rejects || 0) + 1; render(); return; }
    a.rejects = 0;
    seg.push(p); a.dist += d;
    drawActive(); persistSoon(); checkGoal(a); render();
  }
  function onWatchError(err) {
    if (err && err.code === 'NOT_AUTHORIZED') { toast('Location is blocked. Allow it in Settings > Timers & Alerts'); window.trkRefreshPermUi(); }
  }

  var _persistT = 0;
  function persistSoon() { var n = Date.now(); if (n - _persistT > 8000) { _persistT = n; save(); } }

  // ---------- goals ----------
  function goalInfo(a) {
    var g = a.goal || { type: 'none' }, last = null, i = a.segs.length;
    while (i-- > 0) { if (a.segs[i].length) { last = a.segs[i][a.segs[i].length - 1]; break; } }
    if (g.type === 'distance' && g.value > 0) { var t = g.value * 1000; return { frac: a.dist / t, text: fmtKm(a.dist) + ' / ' + g.value + ' km', done: a.dist >= t }; }
    if (g.type === 'time' && g.value > 0) { var ms = g.value * 60000, e = elapsedMs(a); return { frac: e / ms, text: fmtTime(e) + ' / ' + g.value + ' min', done: e >= ms }; }
    if (g.type === 'target' && g.target) {
      if (!last) return { frac: 0, text: 'Waiting for GPS', done: false };
      var rem = hav(last, g.target);
      if (a.targetStart == null) a.targetStart = rem;
      var f = a.targetStart > 0 ? 1 - rem / a.targetStart : 0;
      return { frac: f, text: (rem >= 1000 ? (rem / 1000).toFixed(2) + ' km' : Math.round(rem) + ' m') + ' to the flag', done: rem <= TARGET_RADIUS };
    }
    return null;
  }
  function checkGoal(a) {
    if (a.goalDone) return;
    var gi = goalInfo(a);
    if (gi && gi.done) {
      a.goalDone = true; save();
      toast('Goal reached!');
      try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) { }
      try { if (typeof notifyNow === 'function') notifyNow(NOTIF_GOAL_ID, 'tracking', 'Goal reached!', 'You hit your ' + (a.mode === 'run' ? 'run' : 'walk') + ' goal. Keep going or finish in the app.', { open: 'track' }); } catch (e) { }
    }
  }

  // ---------- rendering ----------
  function seg(ids, onId) { ids.forEach(function (i) { var b = $(i[0]); if (b) b.classList.toggle('on', i[1] === onId); }); }
  function setText(id, v) { var e = $(id); if (e && e.textContent !== v) e.textContent = v; }
  function render() {
    if (!$('tab-track') || $('tab-track').classList.contains('hidden')) return;
    var a = S.active;
    seg([['trk-mode-walk', 'walk'], ['trk-mode-run', 'run']], a ? a.mode : S.mode);
    seg([['trk-gt-distance', 'distance'], ['trk-gt-time', 'time'], ['trk-gt-target', 'target'], ['trk-gt-none', 'none']], S.goal.type);
    var needVal = S.goal.type === 'distance' || S.goal.type === 'time';
    var row = $('trk-goal-valrow'); if (row) row.classList.toggle('hidden', !needVal);
    setText('trk-goal-unit', S.goal.type === 'time' ? 'minutes' : 'kilometres');
    var inp = $('trk-goal-val'); if (inp && document.activeElement !== inp && needVal) inp.value = S.goal.value;

    var dist = a ? a.dist : 0, ms = a ? elapsedMs(a) : 0;
    setText('trk-time', fmtTime(ms));
    setText('trk-dist', fmtKm(dist));
    setText('trk-pace', fmtPace(ms, dist));
    setText('trk-kcal', String(Math.round(kcalFor(a ? a.mode : S.mode, dist, ms))));
    var spd = ms > 0 && dist > 0 ? (dist / 1000) / (ms / 3600000) : 0;
    var accTxt = lastFix && lastFix.acc != null ? 'GPS \u00b1' + Math.round(lastFix.acc) + ' m' : 'Waiting for GPS...';
    setText('trk-meta', (a ? spd.toFixed(1) + ' km/h avg \u00b7 ' : '') + accTxt);

    var gi = a ? goalInfo(a) : null;
    var gp = $('trk-goalbox'); if (gp) gp.classList.toggle('hidden', !gi);
    if (gi) {
      var f = Math.max(0, Math.min(1, gi.frac));
      var bar = $('trk-goalbar'); if (bar) bar.style.width = (f * 100).toFixed(1) + '%';
      setText('trk-goaltxt', gi.done ? 'Goal reached! ' + gi.text : gi.text);
    }
    var running = !!(a && a.segStart), paused = !!(a && !a.segStart);
    [['trk-btn-start', !a], ['trk-btn-pause', running], ['trk-btn-resume', paused], ['trk-btn-finish', !!a]].forEach(function (x) { var b = $(x[0]); if (b) b.classList.toggle('hidden', !x[1]); });
    var st = $('trk-state'); if (st) st.textContent = !a ? 'Ready' : (running ? 'Recording' : 'Paused');
    if (st) st.className = 'trk-state ' + (running ? 'rec' : (paused ? 'pau' : ''));
  }

  function renderHistory() {
    var box = $('trk-history'); if (!box) return;
    if (!S.history.length) { box.innerHTML = '<div class="fc-row"><div class="fc-text"><div class="fc-sub">Your finished runs and walks will appear here.</div></div></div>'; return; }
    box.innerHTML = S.history.slice(0, 50).map(function (r) {
      var d = new Date(r.startedAt);
      var when = d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' \u00b7 ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return '<div class="fc-row">'
        + '<button class="trk-hist" onclick="trkView(\'' + r.id + '\')"><span class="fc-title">' + (r.mode === 'run' ? 'Run' : 'Walk') + ' \u00b7 ' + fmtKm(r.dist) + ' km</span>'
        + '<span class="fc-sub">' + when + ' \u00b7 ' + fmtTime(r.ms) + ' \u00b7 ' + fmtPace(r.ms, r.dist) + ' /km \u00b7 ' + Math.round(r.kcal || 0) + ' kcal' + (r.goalDone ? ' \u00b7 goal reached' : '') + '</span></button>'
        + '<button class="fc-btn" onclick="trkDelete(\'' + r.id + '\')" aria-label="Delete">Delete</button></div>';
    }).join('');
  }

  // ---------- actions ----------
  window.trkSetMode = function (m) { if (S.active) return; S.mode = m; save(); render(); };
  window.trkSetGoalType = function (t) {
    S.goal.type = t; save();
    if (S.active) { S.active.goal = JSON.parse(JSON.stringify(S.goal)); S.active.goalDone = false; S.active.targetStart = null; }
    drawTarget(); render();
  };
  window.trkSetGoalVal = function (v) {
    var n = parseFloat(String(v).replace(',', '.'));
    if (!(n > 0) || n > 1000) return;
    S.goal.value = n; save();
    if (S.active) { S.active.goal = JSON.parse(JSON.stringify(S.goal)); S.active.goalDone = false; }
    render();
  };

  var tick = null;
  function startTick() { if (!tick) tick = setInterval(function () { var a = S.active; if (a && a.segStart) checkGoal(a); render(); }, 1000); }
  function stopTick() { if (tick) { clearInterval(tick); tick = null; } }

  function beginWatch() {
    if (previewWatch) { previewWatch.stop(); previewWatch = null; }
    if (activeWatch) { activeWatch.stop(); activeWatch = null; }
    var mode = S.active ? S.active.mode : S.mode;
    activeWatch = watch({
      backgroundTitle: 'Dopamine is tracking your ' + (mode === 'run' ? 'run' : 'walk'),
      backgroundMessage: 'GPS is recording. Tap to open the app.',
      requestPermissions: false, stale: false, distanceFilter: 3
    }, function (loc, err) { if (err) onWatchError(err); else onFix(loc); });
    if (!activeWatch) toast('GPS is not available on this device');
  }

  window.trkStart = async function () {
    if (S.active) return;
    var st = await permState();
    if (st.loc !== 'granted') {
      if (st.loc === 'denied') { toast('Location is blocked. Opening settings...'); window.trkOpenAppSettings(); return; }
      await askLoc(st);
      st = await permState();
      if (st.loc !== 'granted') { toast('Location permission is needed to track'); window.trkRefreshPermUi(); return; }
    }
    if (st.notif === 'prompt') await askNotif(st);
    var g = JSON.parse(JSON.stringify(S.goal));
    if (g.type === 'target' && !g.target) { toast('Tap the map to place your goal flag first'); return; }
    S.active = { id: 'a' + Date.now().toString(36), mode: S.mode, startedAt: Date.now(), goal: g, segs: [[]], dist: 0, accMs: 0, segStart: Date.now(), goalDone: false, rejects: 0, targetStart: null };
    follow = true; clearRoute(); save();
    beginWatch(); startTick(); drawActive(); render();
    toast('Tracking started');
    window.trkRefreshPermUi().then(function (s2) {
      if (s2.batt === false && !S.askedBatt) { S.askedBatt = true; save(); askBatt(); }
    });
  };
  window.trkPause = function () {
    var a = S.active; if (!a || !a.segStart) return;
    a.accMs += Date.now() - a.segStart; a.segStart = null; save(); render();
  };
  window.trkResume = function () {
    var a = S.active; if (!a || a.segStart) return;
    a.segStart = Date.now(); a.segs.push([]); a.rejects = 0;
    if (!activeWatch) beginWatch();
    startTick(); save(); render();
  };
  window.trkFinish = function () {
    var a = S.active; if (!a) return;
    var ms = elapsedMs(a);
    if (a.dist < 10) {
      if (!confirm('Almost nothing was recorded. Discard this activity?')) return;
      endActive(); toast('Activity discarded'); return;
    }
    if (!confirm('Finish and save this ' + (a.mode === 'run' ? 'run' : 'walk') + '?')) return;
    var rec = {
      id: a.id, mode: a.mode, startedAt: a.startedAt, endedAt: Date.now(), dist: Math.round(a.dist), ms: ms,
      kcal: Math.round(kcalFor(a.mode, a.dist, ms)), goalDone: !!a.goalDone,
      goal: { type: a.goal.type, value: a.goal.value },
      segs: a.segs.filter(function (s) { return s.length; }).map(function (s) { return simplify(s, 8); })
    };
    S.history.unshift(rec);
    if (S.history.length > MAX_HISTORY) S.history.length = MAX_HISTORY;
    endActive(rec);
    toast('Saved: ' + fmtKm(rec.dist) + ' km in ' + fmtTime(rec.ms));
  };
  function endActive(rec) {
    if (activeWatch) { activeWatch.stop(); activeWatch = null; }
    S.active = null; save(); stopTick();
    renderHistory(); render();
    if (rec) showRoute(rec); else clearRoute();
    maybeStartPreview();
  }

  function showRoute(rec) {
    if (!map) return;
    clearRoute();
    viewLayer = L_.featureGroup().addTo(map);
    rec.segs.forEach(function (sg) { L_.polyline(sg, { color: accentColor(), weight: 5, opacity: 0.95, lineJoin: 'round' }).addTo(viewLayer); });
    var f = rec.segs[0] && rec.segs[0][0], l = rec.segs.length && rec.segs[rec.segs.length - 1].slice(-1)[0];
    if (f) L_.circleMarker(f, { radius: 6, color: '#fff', weight: 2, fillColor: '#34d399', fillOpacity: 1, interactive: false }).addTo(viewLayer);
    if (l) L_.circleMarker(l, { radius: 6, color: '#fff', weight: 2, fillColor: '#f87171', fillOpacity: 1, interactive: false }).addTo(viewLayer);
    follow = false; var b = $('trk-center'); if (b) b.classList.remove('hidden');
    try { map.fitBounds(viewLayer.getBounds(), { padding: [30, 30] }); } catch (e) { }
  }
  window.trkView = function (id) {
    if (S.active) { toast('Finish the current activity first'); return; }
    var r = S.history.filter(function (x) { return x.id === id; })[0]; if (!r) return;
    ensureMap().then(function (ok) { if (ok) { showRoute(r); var m = $('trk-map'); if (m && m.scrollIntoView) m.scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
  };
  window.trkDelete = function (id) {
    if (!confirm('Delete this activity?')) return;
    S.history = S.history.filter(function (x) { return x.id !== id; });
    save(); renderHistory();
  };

  // ---------- recovery (app was closed or killed while tracking) ----------
  function recoverBanner() {
    var a = S.active, box = $('trk-recover'); if (!box) return;
    box.classList.toggle('hidden', !(a && !activeWatch && !a.segStart && a._recovered));
  }
  function recoverOnLoad() {
    var a = S.active; if (!a) return;
    if (a.segStart) {
      var lastT = 0; a.segs.forEach(function (s) { if (s.length) lastT = Math.max(lastT, s[s.length - 1][2]); });
      a.accMs += Math.max(0, (lastT || a.segStart) - a.segStart);
      a.segStart = null;
    }
    a._recovered = true; save();
  }
  window.trkRecoverAction = function (what) {
    var a = S.active; if (!a) return;
    if (what === 'resume') { delete a._recovered; window.trkResume(); }
    else if (what === 'finish') { delete a._recovered; window.trkFinish(); }
    else if (what === 'discard') { if (confirm('Discard this unfinished activity?')) { endActive(); } }
    recoverBanner(); render();
  };

  // ---------- tab lifecycle ----------
  function maybeStartPreview() {
    if (previewWatch || activeWatch) return;
    permState().then(function (st) {
      if (st.loc !== 'granted' || previewWatch || activeWatch) return;
      var tabEl = $('tab-track'); if (!tabEl || tabEl.classList.contains('hidden')) return;
      previewWatch = watch({ requestPermissions: false, stale: true }, function (loc, err) { if (!err) onFix(loc); });
    });
  }
  window.renderTrackTab = async function () {
    renderHistory(); render(); recoverBanner();
    window.trkRefreshPermUi();
    await ensureMap();
    render();
    if (S.active) { startTick(); drawActive(); }
    drawTarget();
    maybeStartPreview();
  };
  window.trkOnHide = function () {
    if (previewWatch) { previewWatch.stop(); previewWatch = null; }
  };

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (S.active) save(); return; }
    if ($('tab-track') && !$('tab-track').classList.contains('hidden')) { window.trkRefreshPermUi(); render(); if (map) map.invalidateSize(); }
    else if ($('tab-settings') && !$('tab-settings').classList.contains('hidden')) window.trkRefreshPermUi();
  });
  window.addEventListener('pagehide', function () { if (S.active) save(); });

  // ---------- styles ----------
  var css = '' +
    '#trk-map{height:320px;width:100%;background:var(--bg-input);position:relative;z-index:0}' +
    '.trk-maperr{padding:24px;text-align:center;font-size:12px;color:var(--text-muted)}' +
    '.trk-mapwrap{position:relative}' +
    '.trk-center{position:absolute;right:12px;bottom:12px;z-index:500;padding:8px 14px;border-radius:999px;border:1px solid var(--border-strong);background:var(--bg-card);color:var(--text-primary);font-size:12px;font-weight:600;box-shadow:var(--fc-shadow)}' +
    '.trk-center.hidden{display:none}' +
    '.trk-pinhint{position:absolute;left:12px;right:12px;top:10px;z-index:500;padding:7px 12px;border-radius:12px;background:var(--bg-card);border:1px solid var(--border-subtle);font-size:11px;color:var(--text-muted);text-align:center;display:flex;gap:8px;align-items:center;justify-content:center}' +
    '.trk-pinhint.hidden{display:none}' +
    '.trk-pinhint button{font-weight:700;color:var(--accent-text)}' +
    '.trk-me span{display:block;width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 6px rgba(59,130,246,.25)}' +
    '.trk-flag b{display:block;font-size:26px;line-height:26px;color:#ef4444;text-shadow:0 1px 3px rgba(0,0,0,.5)}' +
    '[data-theme="dark"] .trk-tiles,[data-theme="charcoal"] .trk-tiles,[data-theme="midnight"] .trk-tiles,[data-theme="cyberpunk"] .trk-tiles,[data-theme="forest"] .trk-tiles{filter:invert(1) hue-rotate(180deg) brightness(.92) contrast(.88) saturate(.7)}' +
    '.leaflet-container{font:inherit;background:var(--bg-input)}' +
    '.leaflet-control-attribution{font-size:9px!important;background:rgba(255,255,255,.7)!important}' +
    '.trk-seg{display:flex;gap:6px;padding:4px;border-radius:14px;background:var(--bg-input);border:1px solid var(--border-subtle)}' +
    '.trk-seg button{flex:1;padding:9px 6px;border-radius:10px;font-size:12px;font-weight:600;color:var(--text-muted);border:1px solid transparent}' +
    '.trk-seg button.on{background:var(--accent-glow);border-color:var(--accent);color:var(--text-primary)}' +
    '.trk-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center}' +
    '.trk-stat b{display:block;font-family:var(--font-mono);font-size:19px;font-weight:700;color:var(--text-primary)}' +
    '.trk-stat span{display:block;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted);margin-top:2px}' +
    '.trk-meta{font-size:11px;color:var(--text-muted);text-align:center;margin-top:10px}' +
    '.trk-state{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:3px 9px;border-radius:999px;background:var(--bg-input);color:var(--text-muted)}' +
    '.trk-state.rec{background:rgba(248,113,113,.15);color:#f87171}.trk-state.pau{background:var(--accent-glow);color:var(--accent-text)}' +
    '.trk-bar{height:8px;border-radius:999px;background:var(--bg-input);overflow:hidden;margin-top:8px}' +
    '.trk-bar i{display:block;height:100%;width:0;background:var(--accent);border-radius:999px;transition:width .4s}' +
    '.trk-goaltxt{font-size:12px;font-weight:600;color:var(--text-primary);display:flex;justify-content:space-between}' +
    '.trk-ctrl{display:flex;gap:10px}' +
    '.trk-ctrl button{flex:1;padding:14px;border-radius:16px;font-size:14px;font-weight:700;border:1px solid var(--border-strong);background:var(--bg-input);color:var(--text-primary)}' +
    '.trk-ctrl button.go{background:var(--accent);border-color:var(--accent);color:#000}' +
    '.trk-ctrl button.stop{background:rgba(248,113,113,.14);border-color:rgba(248,113,113,.5);color:#f87171}' +
    '.trk-ctrl button.hidden{display:none}' +
    '.trk-goalinput{display:flex;align-items:center;gap:10px}' +
    '.trk-goalinput input{width:90px;padding:9px 12px;border-radius:12px;border:1px solid var(--border-strong);background:var(--bg-input);color:var(--text-primary);font-family:var(--font-mono);font-size:15px;font-weight:700;text-align:center}' +
    '.trk-hist{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;min-width:0;flex:1}' +
    '.trk-types{display:grid;grid-template-columns:repeat(4,1fr)}' +
    '.fc-group.hidden,.fc-block.hidden,#trk-goalbox.hidden{display:none}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---------- init ----------
  recoverOnLoad();
  if (S.active && S.active.segStart === null) { /* stays paused until the user chooses */ }
})();
