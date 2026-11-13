// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Dopamine-Commercial
// Copyright (c) 2026 Abid109. Licensed under the GNU AGPL-3.0 (see LICENSE) or, by separate written
// agreement, a commercial license (see COMMERCIAL-LICENSE.md). All other rights reserved.
/* Dopamine desktop app (Electron). It wraps the same web code as the phone app (../www) and loads only local
 * files, through a private app://dopamine/ address, so the page has a stable origin for its saved data.
 * Security: node integration off, context isolation and sandbox on, a strict content security policy,
 * only needed permissions allowed, external links open in the default browser. */
'use strict';
const { app, BrowserWindow, protocol, net, session, shell, dialog } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

const SCHEME = 'app';
const HOST = 'dopamine';
const ORIGIN = `${SCHEME}://${HOST}`;
const WWW = app.isPackaged ? path.join(process.resourcesPath, 'www') : path.join(__dirname, '..', 'www');
const DOWNLOAD_PAGE = 'https://abid109.github.io/Dopamine/download/';
const UPDATE_FEED = 'https://raw.githubusercontent.com/Abid109/Dopamine/desktop-update-feed/desktop.json';

// The page uses inline scripts and styles, so those stay allowed; everything else is limited to local files
// plus the three services the app talks to (sign in and sync, map pictures, none else).
const CSP = [
  "default-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
  "font-src 'self'",
  "media-src 'self' blob:",
  "connect-src 'self' https://ohbsudgdwebituirxvjj.supabase.co wss://ohbsudgdwebituirxvjj.supabase.co",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-src 'none'"
].join('; ');

protocol.registerSchemesAsPrivileged([
  { scheme: SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

if (!app.requestSingleInstanceLock()) { app.quit(); }

let win = null;

function isStoreBuild() {
  // Store builds update through their store, so they never check for updates themselves.
  return !!(process.windowsStore || process.mas || process.env.SNAP || process.env.FLATPAK_ID || process.env.DOPAMINE_STORE === '1');
}

function serveLocalFile(request) {
  const url = new URL(request.url);
  if (url.host !== HOST) return new Response('Not found', { status: 404 });
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  const file = path.normalize(path.join(WWW, rel));
  // Never leave the www folder (blocks .. tricks)
  if (file !== WWW && !file.startsWith(WWW + path.sep)) return new Response('Forbidden', { status: 403 });
  return net.fetch(pathToFileURL(file).toString()).then((res) => {
    const headers = new Headers(res.headers);
    headers.set('Content-Security-Policy', CSP);
    headers.set('X-Content-Type-Options', 'nosniff');
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }).catch(() => new Response('Not found', { status: 404 }));
}

function setupPermissions() {
  const allowed = new Set(['notifications', 'media', 'fullscreen', 'clipboard-sanitized-write']);
  const ok = (origin) => String(origin || '').startsWith(ORIGIN);
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback, details) => {
    callback(allowed.has(permission) && ok(details && details.requestingUrl));
  });
  session.defaultSession.setPermissionCheckHandler((wc, permission, origin) => allowed.has(permission) && ok(origin));
}

function openExternalSafe(url) {
  try {
    const u = new URL(url);
    if (u.protocol === 'https:' || u.protocol === 'http:') shell.openExternal(u.toString());
  } catch (e) { /* ignore */ }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1180, height: 820, minWidth: 900, minHeight: 600,
    backgroundColor: '#0a0a0d',
    title: 'Dopamine',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      spellcheck: false,
      devTools: !app.isPackaged
    }
  });
  // Links that would open a new window, or leave the app, go to the default browser instead.
  win.webContents.setWindowOpenHandler(({ url }) => { openExternalSafe(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(ORIGIN + '/')) { event.preventDefault(); openExternalSafe(url); }
  });
  win.loadURL(`${ORIGIN}/index.html`);
  win.on('closed', () => { win = null; });
}

function newer(a, b) {
  const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) { if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0); }
  return false;
}

// Tells the person when a newer desktop version exists and opens the download page. It never installs anything by itself.
async function checkForUpdate() {
  if (isStoreBuild() || !app.isPackaged) return;
  try {
    const res = await net.fetch(UPDATE_FEED, { cache: 'no-store' });
    if (!res.ok) return;
    const j = await res.json();
    if (!j || !/^\d+\.\d+\.\d+$/.test(j.version || '') || !newer(j.version, app.getVersion())) return;
    const r = await dialog.showMessageBox(win || undefined, {
      type: 'info', buttons: ['Open download page', 'Later'], defaultId: 0, cancelId: 1,
      title: 'Update available',
      message: `Dopamine ${j.version} is available`,
      detail: `You have ${app.getVersion()}. Your data is kept when you install the new version.`
    });
    if (r.response === 0) shell.openExternal(DOWNLOAD_PAGE);
  } catch (e) { /* offline or no feed yet: stay quiet */ }
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

app.whenReady().then(() => {
  app.setAppUserModelId('io.github.abid109.Dopamine');
  protocol.handle(SCHEME, serveLocalFile);
  setupPermissions();
  createWindow();
  setTimeout(checkForUpdate, 6000);
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
