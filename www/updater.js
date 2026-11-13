// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Dopamine-Commercial
// Copyright (c) 2026 Abid109. Licensed under the GNU AGPL-3.0 (see LICENSE) or, by separate written
// agreement, a commercial license (see COMMERCIAL-LICENSE.md). All other rights reserved.
/* Dopamine - in-app updates
 * Checks the project's GitHub "latest" release, and (Android app only) downloads the new APK and opens
 * Android's installer. Every build is signed with the same key, so the update installs over the old app
 * and keeps all data. Nothing about you is sent: the check is a plain public request to api.github.com.
 * Uses globals from index.html: isNativeApp, fsPlugin, showToast, navigate, openSettingsPage.
 * Native side: DopamineReminderPlugin (getAppVersion, canInstallPackages, startUpdateDownload, ...).
 */
(function () {
  'use strict';

  // Android releases are tagged v<major>.<minor>.<build> and marked "Latest" on GitHub. Desktop releases use
  // desktop-v* tags and are never marked Latest, so this call always returns the Android release.
  // The old release tagged "latest" is kept as a fallback so apps from before this change can still update.
  var API = 'https://api.github.com/repos/Abid109/Dopamine/releases/latest';
  var API_OLD = 'https://api.github.com/repos/Abid109/Dopamine/releases/tags/latest';
  // Main source: a tiny JSON file the build publishes on the "update-feed" branch. It is served by
  // raw.githubusercontent.com, which is not subject to the strict per-IP limit of api.github.com (many phones
  // share one IP on mobile networks and quickly hit "GitHub is limiting requests"). The API is the fallback.
  var FEED = 'https://raw.githubusercontent.com/Abid109/Dopamine/update-feed/update.json';
  var URL_PREFIX = 'https://github.com/Abid109/Dopamine/releases/';
  var KEY = 'dopamine_update_v1';
  var CHECK_EVERY = 6 * 3600 * 1000;   // automatic check at most every 6 hours
  var DISMISS_FOR = 24 * 3600 * 1000;  // "Later" hides the prompt for a day

  function $(id) { return document.getElementById(id); }
  function native() { try { return typeof isNativeApp === 'function' && isNativeApp(); } catch (e) { return false; } }
  function plugin() { try { return native() && typeof fsPlugin === 'function' ? fsPlugin() : null; } catch (e) { return null; } }
  function call(name, args) {
    var p = plugin();
    if (!p || typeof p[name] !== 'function') return Promise.reject(new Error('This part needs the newest installed app. Install the latest APK once by hand.'));
    return p[name](args || {});
  }
  function toast(m) { try { showToast(m); } catch (e) { } }

  function load() { try { var j = JSON.parse(localStorage.getItem(KEY)); if (j && typeof j === 'object') return j; } catch (e) { } return {}; }
  var S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

  var cur = null;       // { code, name } of the installed app
  var remote = null;    // { build, url, size, date, changes } of the newest release
  var busy = false;
  var status = '';      // line of text under the versions
  var progress = null;  // 0..100 while downloading, otherwise null

  function versionLabel() { return remote ? (remote.name || ('build ' + remote.build)) : ''; }
  function available() { return !!(cur && remote && remote.build > cur.code); }

  // ---------- reading the release ----------
  function fetchLatest() {
    return fetchFeed()
      .catch(function () { return fetchRelease(API); })
      .catch(function (e) {
        if (e && e.notFound) return fetchRelease(API_OLD);
        throw e;
      });
  }

  function fetchFeed() {
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 12000) : null;
    return fetch(FEED + '?t=' + Math.floor(Date.now() / 60000), { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
      .then(function (r) {
        if (timer) clearTimeout(timer);
        if (!r.ok) throw new Error('feed ' + r.status);
        return r.json();
      })
      .then(function (j) {
        var build = parseInt(j && j.build, 10);
        if (!build || String(j.url || '').indexOf(URL_PREFIX) !== 0 || !/\.apk$/i.test(j.url)) throw new Error('bad feed');
        return { build: build, name: /^\d+\.\d+\.\d+$/.test(j.name || '') ? j.name : '', url: j.url, size: Number(j.size) || 0, date: j.date || '', changes: String(j.changes || '').slice(0, 160) };
      });
  }

  function fetchRelease(api) {
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 15000) : null;
    return fetch(api, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store', signal: ctl ? ctl.signal : undefined })
      .then(function (r) {
        if (timer) clearTimeout(timer);
        if (r.status === 404) { var nf = new Error('No release was found yet.'); nf.notFound = true; throw nf; }
        if (r.status === 403) throw new Error('GitHub is limiting requests from this network right now. Try again in a while, or download the newest Dopamine.apk from the Releases page.');
        if (!r.ok) throw new Error('GitHub answered ' + r.status + '.');
        return r.json();
      })
      .then(function (j) {
        var m = /build:\s*(\d+)/.exec(j.body || '');
        var asset = (j.assets || []).filter(function (a) { return /\.apk$/i.test(a.name || ''); })[0];
        if (!m || !asset || String(asset.browser_download_url || '').indexOf(URL_PREFIX) !== 0) throw new Error('The release has no usable app file.');
        var ch = /changes:\s*(.+)/.exec(j.body || '');
        var tag = /^v(\d+\.\d+\.\d+)$/.exec(j.tag_name || '');
        return { build: parseInt(m[1], 10), name: tag ? tag[1] : '', url: asset.browser_download_url, size: asset.size || 0, date: j.published_at || asset.updated_at || '', changes: ch ? ch[1].trim() : '' };
      });
  }

  function loadCurrent() {
    if (cur) return Promise.resolve(cur);
    return call('getAppVersion').then(function (v) { cur = { code: Number(v.versionCode) || 0, name: v.versionName || '' }; return cur; });
  }

  function fmtDate(s) {
    var d = new Date(s); if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ---------- screen ----------
  function setText(id, v) { var e = $(id); if (e && e.textContent !== v) e.textContent = v; }
  function render() {
    var nat = native();
    setText('upd-cur', cur ? (cur.name || ('build ' + cur.code)) : (nat ? '...' : 'Browser'));
    setText('upd-latest', remote ? (versionLabel() + (remote.date ? ' \u00b7 ' + fmtDate(remote.date) : '')) : '--');
    var row = $('upd-changes-row'); if (row) row.classList.toggle('hidden', !(remote && remote.changes && available()));
    setText('upd-changes', remote && remote.changes ? remote.changes : '');
    var line = status;
    if (!line) {
      if (!nat) line = 'Updates are installed from the Android app. In a browser you always see the newest version.';
      else if (!cur || !remote) line = 'Tap the button to look for a new version.';
      else line = available() ? 'A new version is ready.' : 'You have the newest version.';
    }
    setText('upd-status', line);
    var w = $('upd-bar-wrap'); if (w) w.classList.toggle('hidden', progress === null);
    var b = $('upd-bar'); if (b && progress !== null) b.style.width = Math.max(2, progress) + '%';
    var btn = $('upd-btn');
    if (btn) {
      btn.classList.toggle('hidden', !nat);
      btn.disabled = busy;
      btn.style.opacity = busy ? '0.6' : '1';
      btn.textContent = busy ? 'Working...' : (available() ? 'Download and install' : 'Check for updates');
    }
    var mv = $('sh-upd-val');
    if (mv) {
      if (available()) { mv.textContent = 'Update available'; mv.style.color = 'var(--accent-text)'; }
      else { mv.textContent = cur ? (cur.name || '') : ''; mv.style.color = ''; }
    }
  }
  function setStatus(t) { status = t || ''; render(); }

  // ---------- checking ----------
  function check(manual) {
    if (!native()) { render(); return Promise.resolve(); }
    if (busy) return Promise.resolve();
    busy = true; if (manual) setStatus('Looking for updates...');
    return loadCurrent().then(fetchLatest).then(function (r) {
      remote = r; S.lastCheck = Date.now(); save();
      status = '';
      busy = false; render();
      if (!manual && available()) maybePrompt();
      else if (manual && !available()) toast('You have the newest version');
    }).catch(function (e) {
      busy = false;
      if (manual) setStatus('Could not check: ' + (e && e.message ? e.message : 'no connection'));
      else render();
    });
  }

  // ---------- downloading and installing ----------
  function pollDownload() {
    return new Promise(function (resolve, reject) {
      var started = Date.now();
      (function tick() {
        call('getUpdateStatus').then(function (st) {
          if (st.state === 'ready') { progress = 100; render(); resolve(); return; }
          if (st.state === 'error') { reject(new Error(st.error || 'download failed')); return; }
          progress = Number(st.percent) || 0;
          setStatus('Downloading... ' + progress + '%');
          if (Date.now() - started > 10 * 60 * 1000) { reject(new Error('the download took too long')); return; }
          setTimeout(tick, 400);
        }).catch(reject);
      })();
    });
  }

  function install() {
    if (busy || !available()) return Promise.resolve();
    busy = true; progress = null; setStatus('Getting ready...');
    return call('canInstallPackages').then(function (r) {
      if (!r.value) {
        setStatus('Allow "Install unknown apps" for Dopamine on the screen that opens, then come back and tap the button again.');
        busy = false; render();
        return call('openInstallSettings').then(function () { return 'stop'; });
      }
      return call('getUpdateStatus').then(function (st) {
        if (st.state === 'ready' && S.downloadedBuild === remote.build) return null;
        return call('resetUpdate').then(function () {
          progress = 0; setStatus('Downloading... 0%');
          return call('startUpdateDownload', { url: remote.url, size: remote.size });
        }).then(pollDownload).then(function () { S.downloadedBuild = remote.build; save(); });
      });
    }).then(function (stop) {
      if (stop === 'stop') return;
      progress = null;
      setStatus('Opening the installer. Tap Update when Android asks. Your data is kept.');
      return call('installUpdate');
    }).catch(function (e) {
      progress = null;
      setStatus('Update failed: ' + (e && e.message ? e.message : 'unknown problem'));
    }).then(function () { busy = false; render(); });
  }

  // ---------- "update available" prompt ----------
  function trackingActive() {
    try { var t = JSON.parse(localStorage.getItem('dopamine_tracker_v1')); return !!(t && t.active); } catch (e) { return false; }
  }
  function maybePrompt() {
    if (!available() || trackingActive() || $('upd-prompt')) return;
    var d = S.dismissed;
    if (d && d.build === remote.build && Date.now() - d.at < DISMISS_FOR) return;
    var ov = document.createElement('div');
    ov.id = 'upd-prompt';
    ov.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;padding:16px;background:rgba(0,0,0,.55)';
    var card = document.createElement('div');
    card.className = 'fc-group';
    card.style.cssText = 'width:100%;max-width:420px;padding:22px 22px 18px';
    var h = document.createElement('div'); h.className = 'fc-title'; h.style.fontSize = '17px'; h.textContent = 'Update available';
    var p = document.createElement('p'); p.className = 'fc-sub'; p.style.cssText = 'margin:6px 0 0;font-size:13px';
    p.textContent = 'Version ' + versionLabel() + (remote.date ? ' \u00b7 ' + fmtDate(remote.date) : '') + (remote.changes ? '. ' + remote.changes : '');
    var row = document.createElement('div'); row.style.cssText = 'display:flex;gap:10px;margin-top:18px';
    function btn(label, primary) { var b = document.createElement('button'); b.className = 'fc-btn' + (primary ? ' primary' : ''); b.style.cssText = 'flex:1;padding:13px;font-size:14px'; b.textContent = label; return b; }
    var later = btn('Later', false), now = btn('Update now', true);
    function close() { if (ov.parentNode) ov.parentNode.removeChild(ov); }
    later.onclick = function () { S.dismissed = { build: remote.build, at: Date.now() }; save(); close(); };
    now.onclick = function () {
      close();
      try { navigate('settings'); openSettingsPage('updates'); } catch (e) { }
      install();
    };
    ov.onclick = function (e) { if (e.target === ov) later.onclick(); };
    row.appendChild(later); row.appendChild(now);
    card.appendChild(h); card.appendChild(p); card.appendChild(row); ov.appendChild(card);
    document.body.appendChild(ov);
  }

  // ---------- hooks used by index.html ----------
  window.updAction = function () { if (available()) install(); else check(true); };
  window.updOpen = function () {
    render();
    if (!native()) return;
    loadCurrent().then(render).catch(function () { });
    if (!remote || Date.now() - (S.lastCheck || 0) > 10 * 60 * 1000) check(true);
  };

  function autoCheck() {
    if (!native() || busy) return;
    if (Date.now() - (S.lastCheck || 0) < CHECK_EVERY) {
      // checked recently: still show the menu hint from the stored result
      loadCurrent().then(render).catch(function () { });
      return;
    }
    check(false);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    var pg = $('upd-status');
    if (pg && pg.offsetParent !== null && !busy) { render(); }   // came back from the Android permission screen
    autoCheck();
  });

  var css = '.upd-bar{height:8px;border-radius:999px;background:var(--bg-input);overflow:hidden;margin-top:10px}' +
    '.upd-bar.hidden{display:none}.upd-bar i{display:block;height:100%;width:2%;background:var(--accent);border-radius:999px;transition:width .3s}' +
    '#upd-btn{width:100%;padding:13px;font-size:14px}#upd-btn.hidden{display:none}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  setTimeout(function () { render(); autoCheck(); }, 4000);
})();
