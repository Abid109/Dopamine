# Changelog

All notable changes to Dopamine are listed here.

## Desktop app [0.1.0] (tag `desktop-v0.1.0`)

The desktop app has its own version and release tags, separate from the Android app.

### Added
- **One-click desktop downloads.** Each desktop build also refreshes a release tagged `desktop-latest` with fixed file names (`Dopamine-win-x64.exe`, `Dopamine-mac-arm64.dmg`, `Dopamine-mac-x64.dmg`, `Dopamine-linux-x86_64.AppImage`, `.deb`, `.rpm`), so the links in the README and on the download page never change. Desktop releases are marked pre-release and never Latest, so the Android app and Obtainium ignore them.
- Windows, macOS and Linux app built with Electron (`desktop/`). It loads the same `www/` code from local files only, with a desktop layout (sidebar by default), desktop notifications while the app is open, normal save dialogs and downloads for backups and PDF reports, and links that open in the default browser.
- Hidden on desktop: the Run tab, the phone navigation styles, the in-app updater, full-screen reminders and battery optimization.
- Security: node integration off, context isolation and sandbox on, a content security policy, only local files, camera and notifications permissions only.
- The app checks a small feed for new desktop versions and opens the download page; it never installs by itself. Store builds skip this check.
- CI builds on Windows, macOS and Ubuntu and publishes installers and `SHA256SUMS.txt` to a `desktop-v*` release that is never marked Latest.
- Linux packaging files for Flathub in `desktop/linux/` (desktop file and AppStream metainfo).

## [Unreleased]

### Added
- **Map styles.** Settings, Map style lets you choose how the Run tab map looks: Classic (default, OpenStreetMap pictures) or ten drawn styles (Standard, Dark, Navy and amber, Brick and sand, Blue night, Violet, Black and white, Midnight terrain, Trail guide, Relief and water). The drawn styles use MapLibre GL with OpenFreeMap vector tiles and AWS terrain tiles for shading, and need internet and WebGL. If they cannot load, or Smooth mode is on, the app uses the Classic map. The three terrain looks are approximations of the reference designs.
- **Documentation website.** The wiki pages are also published as a website at `https://abid109.github.io/Dopamine/docs/` (MkDocs with the Material theme), with a side menu, search, light and dark modes and the app's own fonts and colours. It is built from the same `wiki/` folder as the GitHub wiki, loads nothing from other websites, and a broken link between pages stops the build. See `site/docs/`.
- **In-app updates.** Settings, App updates checks the project's latest release, shows what is new, and downloads and installs the new version without leaving the app. A prompt also appears when a new build is found (at most one automatic check every 6 hours; "Later" hides it for a day). The download is only accepted if it is Dopamine signed with the same key, and Android still asks you to confirm the install. Needs the "Install unknown apps" permission for Dopamine, which the app helps you open. Install this build by hand once; later updates can be done inside the app.
- Release notes now include a one-line summary of what changed.
- **Run & Walk tracking.** A new Run tab records a walk or run with the phone GPS, even with the screen off or while you use another app. It shows a live map, time, distance, pace and calories, with pause and resume, and keeps a history of routes. Uses a foreground service so Android keeps it alive. If the app is closed mid-activity, the route so far is recovered.
- **Goals.** Set a distance goal, a time goal, or drop a flag on the map. You get a notification when you reach it.
- **Permissions screen.** Settings, Timers & Alerts (and the Run tab) ask for notifications, location and battery optimization, and show which are allowed.
- **Full-screen reminders.** Reminders set in Calendar and Planning open a full screen (also over the lock screen) with a Dismiss button. Android 14 and later may ask you to allow full-screen alerts in Settings. Native code is in `android-native/` and is added by the build workflow.
- **Privacy details** section in Settings that explains what is stored, what leaves the phone, permissions and how to delete data.
- Three poster themes in Settings under "Soft & serif": **Dream** (navy and cream), **Aim High** (red) and **No Risk** (blue and green). Each has a poster banner with a caption at the top of the Dashboard, serif type and cream cards, and the colours are taken from the posters.
- **Licensing.** Dopamine is now dual-licensed: the GNU AGPL-3.0 for everyone, plus a separate commercial license from the copyright holder (`LICENSE`, `COMMERCIAL-LICENSE.md`). The name, logo, icons and artwork are not licensed. Third-party libraries are listed in `THIRD-PARTY-NOTICES.md`. Earlier versions stay available under the MIT License. Contributions are accepted under the AGPL-3.0 with the right for the maintainer to also license them commercially.
- A full wiki: new pages for notifications and permissions and for what is new, and every page brought up to date.

### Release and packaging
- **Version numbers are now one scheme.** `package.json` is `1.9.0`; every build is `<major>.<minor>.<run number>` (for example `1.9.42`) and the Android `versionCode` is the run number.
- **Tagged releases.** Each build publishes a normal release tagged `v<version>` (marked Latest) with `Dopamine.apk` under the same name every time, and the SHA-256 and signing certificate fingerprint in the notes. A pre-release tagged `latest` is still refreshed so apps installed before this change can update. The in-app updater now reads the Latest release.
- **Fixed: "GitHub is limiting requests" in App updates.** The app now reads a small `update.json` from the `update-feed` branch (published by every build) instead of the GitHub API, which limits requests per IP address and often blocks phones on shared mobile networks. The API is only a fallback. Install this build by hand once; later updates use the new method.
- **Web app (PWA).** Dopamine can be installed from a browser (Add to Home Screen on iPhone, Install in Chrome and Edge) and works offline. New: web manifest and icons (including a maskable icon), a service worker that caches the whole app, iPhone home-screen tags, and a `platform.js` helper that tells the code whether it runs in the Android app, a desktop app or a browser.
- On the web, notifications use the browser's own alerts (while the app is open), files save as downloads, and the Android-only parts (updater, full-screen reminders, battery optimization) are hidden. Notices explain the limits (no background timers or GPS on iPhone, foreground-only run tracking) and remind you to back up because browsers can clear web-app data. The app asks the browser to keep its storage.
- **Website deployment.** A new workflow publishes the web app and a download page to GitHub Pages.
- **Obtainium** install and update steps are in the README.
- **Fonts and the PDF library are bundled.** Inter, Newsreader and JetBrains Mono (`www/fonts/`) and jsPDF with AutoTable (`www/vendor/`) are inside the app, so nothing is loaded from Google Fonts or cdnjs and the app works fully offline.
- `PRIVACY.md` and `THIRD-PARTY-NOTICES.md` list what the app really loads and every bundled library and font with its license.

### Security
- **Dependabot** opens pull requests for npm library and GitHub Action updates.
- **CodeQL** scans the JavaScript and Java code on every change and every Monday.
- `SECURITY.md` lists the automated checks and the repository settings to turn on.

### Changed
- **Normal notifications again.** Alerts (rest timer, workout session, calendar, goals) now arrive as regular notifications with sound, vibration and a pop-up banner. The older silent channels are removed on first launch and replaced by new ones.
- Reminder notifications (full screen) also make sound and vibrate.
- Notifications show the Dopamine icon (status bar glyph and large icon).
- **Settings menu with floating cards.** Settings opens as a list of rounded cards with an icon, label and arrow on each row (Appearance & style, Timers & alerts, Run & walk tracking, Backup & data, Privacy). Tapping a row opens that page with a back arrow, and the phone's back gesture returns to the menu.
- The floating dock is now the default navigation style for new installs. Your saved choice is kept.
- The Sync wiki workflow now fails with a clear message until the wiki has been created once in the browser, instead of passing silently.
- Fixed: opening a Settings card no longer leaves the menu or the Timers & alerts section showing underneath.

## [1.8.0] - 2026-11-09

### Changed
- **More accurate calorie count.** The estimate now works out how long you actually work (sets x reps x seconds per rep), counts the rest between sets at a light intensity, and by default shows active calories only (without your resting burn). Weight, height and age personalise it. Earlier versions counted the whole duration at full effort and added a bonus per repetition, which overstated typical workouts by about two to three times.
- Exercise intensities were revised to match the 2024 Compendium of Physical Activities range. The custom intensity options are now Moderate 5.0, Standard 7.0, Vigorous 8.5 and High Explosive 10.0.
- The estimate on the Log screen shows how it was worked out (work and rest time). The session stopwatch uses the same method.

### Added
- Timed holds: the Forearm Plank and Hollow Body Hold now take seconds, and custom exercises can be counted in seconds.
- **Calorie Count** setting: Active calories (default) or Include resting.
- Workouts you logged earlier keep their saved numbers.

## [1.7.0] - 2026-11-09

### Added
- **Navigation styles** in Settings: Sidebar, Bottom bar, Floating dock, Center button, Top tabs, Side rail and Floating menu. The choice applies instantly and is remembered.
- **Smooth mode** (Settings, Navigation & Speed): removes shadows, blur and animations for older phones. The default, Auto, switches it on for slower devices.
- A redesigned sign in: welcome banner, icon fields, show/hide password, password strength meter, large code field and a cleaner signed-in card.

### Changed
- Removed the duplicate Profile & Bio entry from the sidebar list. Profile is still one tap away from your avatar and the profile card in the sidebar.
- Faster start and smoother scrolling: the app uses a prebuilt stylesheet instead of compiling styles in the browser, the sign in, QR and scanner tools load only when used, the profile photo is stored separately so saving stays quick, the dashboard picture is 80% smaller, and the sidebar clock no longer updates when nobody can see it.
- Styles load without needing the internet, and the fonts no longer delay the first screen.

## [1.6.0] - 2026-11-09

### Added
- Five soft pastel themes with a serif typeface, cream cards and rounded corners: **Sunrise**, **Blush**, **Mint**, **Sky** and **Lilac**. Choose them in Settings under "Soft & serif".
- A line-art athletes illustration across the top of the Dashboard in the soft themes.
- The default accent (Amber Gold) now takes on each soft theme's own colour. Other accents work as before.

## [1.5.0] - 2026-11-08

### Added
- A fixed signing key for all builds, so a new APK installs straight over the old app without uninstalling. Your data stays.
- Every build now has its own, higher version number so Android treats it as an update.

### Changed
- Sign in and sign out moved into the **Profile** page. The separate Account & Sync menu item is gone. The Profile menu item shows a green dot while you are signed in.
- "Log in" and "Log out" are now "Sign in" and "Sign out".

## [1.4.0] - 2026-11-08

### Added
- Optional email sign in with sign up, email code confirmation, password reset and sign out.
- Cloud backup and sync across devices. Profile, settings, workout logs, plans, notes and workout time stay in sync.
- Syncing merges two devices instead of overwriting, including deletions, so nothing is lost.
- Sync runs on opening the app, after changes and when the phone comes back online, with a Sync now button.
- Delete my cloud backup button.
- Logging in is optional. Without an account the app works exactly as before.

## [1.3.0] - 2026-11-08

### Added
- **Share & Receive** section in the sidebar.
- Send data as a loop of QR codes, or as a file through the Android share sheet.
- Scan QR codes with the in-app camera scanner, or import a shared file.
- Received files are stored in a list. Choose exactly which days, notes, plans, profile and settings to import, and delete received files at any time.
- Duplicate protection so importing the same data twice never creates copies.
- Bundled QR libraries so sharing works without internet.

### Changed
- The build now retries and falls back to a Gradle mirror if the download fails.

## [1.2.0] - 2026-11-08

### Fixed
- The Android back button now closes menus and popups first, then returns to the previous page. Pressing back twice on the Dashboard exits the app.

## [1.1.0] - 2026-11-08

### Fixed
- PDF reports now open in your phone's PDF viewer (or the share sheet) instead of doing nothing inside the app.
- JSON backups use the same native save and share method.

## [1.0.0] - 2026-11-08

### Added
- First Android release: Dashboard, Log Workout, Calendar Planner, Notes & Journal, Profile & Bio, Settings, timers, PDF report and JSON backup.
- Launcher icon and the app name "Dopamine".
- Automatic APK build and release through GitHub Actions.
