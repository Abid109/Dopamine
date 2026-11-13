# Changelog

All notable changes to Dopamine are listed here.

## [Unreleased]

### Added
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
