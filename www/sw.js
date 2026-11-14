// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Dopamine-Commercial
// Copyright (c) 2026 Abid109. Licensed under the GNU AGPL-3.0 (see LICENSE) or, by separate written
// agreement, a commercial license (see COMMERCIAL-LICENSE.md). All other rights reserved.
/* Dopamine service worker (website / PWA only; never registered in the Android or desktop app).
 * Caches every file of the app on first load so it starts and works offline. Cached files are served at once
 * and refreshed in the background, so a new version arrives on the next launch. Cross-origin requests
 * (map tiles, sign in and sync) always go to the network. Bump VERSION to drop the old cache. */
var VERSION = 'dopamine-pwa-1';
var FILES = [
  './', 'index.html', 'tailwind.css', 'platform.js', 'tracker.js', 'updater.js', 'manifest.webmanifest',
  'fonts/fonts.css',
  'fonts/inter-latin-300-normal.woff2', 'fonts/inter-latin-400-normal.woff2', 'fonts/inter-latin-500-normal.woff2',
  'fonts/inter-latin-600-normal.woff2', 'fonts/inter-latin-700-normal.woff2', 'fonts/inter-latin-800-normal.woff2',
  'fonts/newsreader-latin-400-normal.woff2', 'fonts/newsreader-latin-500-normal.woff2', 'fonts/newsreader-latin-600-normal.woff2',
  'fonts/newsreader-latin-700-normal.woff2', 'fonts/newsreader-latin-800-normal.woff2',
  'fonts/jetbrains-mono-latin-400-normal.woff2', 'fonts/jetbrains-mono-latin-500-normal.woff2',
  'fonts/jetbrains-mono-latin-600-normal.woff2', 'fonts/jetbrains-mono-latin-700-normal.woff2',
  'vendor/leaflet.css', 'vendor/leaflet.js', 'vendor/jsQR.js', 'vendor/qrcode.js', 'vendor/supabase.js',
  'vendor/jspdf.umd.min.js', 'vendor/jspdf.plugin.autotable.min.js',
  'assets/hero-athletes.webp', 'assets/poster-aimhigh.webp', 'assets/poster-dream.webp', 'assets/poster-norisk.webp',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    // One missing file must not stop the install, so add them one by one.
    return Promise.all(FILES.map(function (f) { return c.add(new Request(f, { cache: 'reload' })).catch(function () { }); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // The documentation site (/docs/) is a separate site under the same address: leave it to the browser.
  if (url.pathname.indexOf('/docs/') !== -1) return;
  e.respondWith(caches.open(VERSION).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      var fresh = fetch(req).then(function (res) {
        if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
        return res;
      }).catch(function () { return null; });
      if (hit) { e.waitUntil(fresh); return hit; }
      return fresh.then(function (res) {
        if (res) return res;
        if (req.mode === 'navigate') return cache.match('index.html');
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    });
  }));
});

// Tapping a notification focuses the app and tells it which screen to open.
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var extra = (e.notification && e.notification.data) || {};
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    if (list.length) {
      var c = list[0];
      c.postMessage({ type: 'dopamine-notification', extra: extra });
      return c.focus ? c.focus() : null;
    }
    return self.clients.openWindow('./#' + (extra.open || 'dashboard'));
  }));
});
