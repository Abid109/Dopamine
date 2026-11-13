// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Dopamine-Commercial
// Copyright (c) 2026 Abid109. Licensed under the GNU AGPL-3.0 (see LICENSE) or, by separate written
// agreement, a commercial license (see COMMERCIAL-LICENSE.md). All other rights reserved.
/* Dopamine - where is the code running?
 * One place that answers "Android app, desktop app, or a browser/PWA?". Shared code asks Platform instead of
 * checking window.Capacitor (or anything else) directly. Loaded first, before the app code.
 *   Platform.kind()        'capacitor' (Android app) | 'desktop' (Tauri or Electron) | 'browser' (website or PWA)
 *   Platform.isCapacitor() / isDesktop() / isBrowser()
 *   Platform.isIOS()       iPhone, iPad
 *   Platform.isStandalone() installed to the home screen / opened as an app window
 * The page also gets data-platform="<kind>" on <html>, so CSS can show or hide things:
 *   .native-only   shown only in the Android app      .web-only   shown everywhere except the Android app
 *   .desktop-only  shown only in the desktop app      .phone-only hidden in the desktop app
 */
(function (g) {
  'use strict';
  function capacitor() {
    try { return !!(g.Capacitor && g.Capacitor.isNativePlatform && g.Capacitor.isNativePlatform()); } catch (e) { return false; }
  }
  function desktop() {
    try {
      var ua = (g.navigator && g.navigator.userAgent) || '';
      return !!(g.__TAURI__ || g.__TAURI_INTERNALS__ || g.dopamineDesktop || /\bElectron\//.test(ua));
    } catch (e) { return false; }
  }
  function kind() { return capacitor() ? 'capacitor' : (desktop() ? 'desktop' : 'browser'); }
  function ios() {
    try {
      var n = g.navigator || {};
      return /iPad|iPhone|iPod/.test(n.userAgent || '') || (n.platform === 'MacIntel' && n.maxTouchPoints > 1);
    } catch (e) { return false; }
  }
  function standalone() {
    try { return (g.matchMedia && g.matchMedia('(display-mode: standalone)').matches) || (g.navigator && g.navigator.standalone === true); } catch (e) { return false; }
  }
  var P = {
    kind: kind,
    isCapacitor: function () { return kind() === 'capacitor'; },
    isDesktop: function () { return kind() === 'desktop'; },
    isBrowser: function () { return kind() === 'browser'; },
    isIOS: ios,
    isStandalone: standalone
  };
  g.Platform = P;
  try { g.document.documentElement.setAttribute('data-platform', kind()); } catch (e) { }
})(window);
