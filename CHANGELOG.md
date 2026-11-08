# Changelog

All notable changes to Dopamine are listed here.

## [Unreleased]

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
