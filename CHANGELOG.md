# Changelog

All notable changes to Dopamine are listed here.

## [Unreleased]

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
