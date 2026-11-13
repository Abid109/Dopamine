# Architecture

## Overview

```
www/index.html        The app: markup, styles and most of the logic
www/tracker.js        Run and walk tracking (GPS, map, goals, history)
www/updater.js        In-app updates (check, download, install prompt)
www/vendor/           QR libraries, Supabase client and Leaflet (map)
www/assets/           Dashboard illustrations and poster images
www/tailwind.css      Prebuilt stylesheet
android-native/java/  Native Android code added by the build (reminders, updates)
android-res/          Launcher icons, notification icons, colours, strings and file paths
capacitor.config.json App id and name
wiki/                 These wiki pages (published by a workflow)
.github/workflows/    APK build, wiki sync and CodeQL scan
.github/dependabot.yml Automatic library and Action update pull requests
```

The app id is `com.dopamine.fitness`.

## Data storage

All data is kept in one JSON object saved in the browser storage of the app under the key `aegis_calisthenics_state_v2`.

```
profile       name, age, weight, height, goals, level, objective, avatar
settings      theme, accent, font size, rest default, clock format ...
logs          { "YYYY-MM-DD": [ { id, name, category, sets, reps, mins, cal, date } ] }
plans         { "YYYY-MM-DD": [ { id, name, items, completed } ] }
notes         [ { id, title, body, tag, created, updated } ]
sessionTimes  { "YYYY-MM-DD": seconds }
received      files received through Share & Receive (device only)
deleted       ids of deleted items, so deletions sync between devices
```

When loading, saved data is merged over the defaults so older saves keep working when new fields are added.

## Navigation

Pages are sections of the same document. `navigate(tab)` shows one and records history. A native back handler closes the menu or popup first, then returns to the previous page, then asks for a second press to exit.

## Native features

The web page talks to Capacitor plugins through `window.Capacitor.Plugins`:

- PDFs and share files are written to cache, then opened or shared
- The back button is handled in JavaScript
- `LocalNotifications` shows timer, session, calendar and goal notifications
- `BackgroundGeolocation` records GPS in a foreground service, and `Geolocation` checks and asks for the location permission
- `DopamineReminder` is the app's own plugin (`android-native/java/DopamineReminderPlugin.java`): full-screen reminders, the battery optimization helpers and the update methods

## Share and Receive

1. The selected data is turned into JSON and compressed with `CompressionStream` (deflate).
2. The result is Base64 encoded and cut into pieces of about 280 characters.
3. Each piece becomes one QR frame: `DPM1|mode|transferId|index|total|data`.
4. The receiver collects frames in any order, reassembles, decompresses and checks the data.
5. The data is cleaned: only known fields and types are kept, text is length limited and unsafe keys are removed.
6. It is stored under `received` until the user imports or deletes it.

Imports compare ids and content so that items already on the phone are skipped.

## Adding a feature

1. Add markup for the page and a button in the sidebar.
2. Add the page id to the list of tabs in `navigate`.
3. If it stores new data, add a default to `DEFAULT_DATA` so older saves still load.
4. Test in a browser, then on a phone with the APK from GitHub Actions.

## Account and cloud sync

Logging in is optional. When signed in, the app keeps one JSON backup per user in a `user_backups` table, protected by row-level security so each user can only read and write their own row.

A sync cycle:

1. Read the cloud row and its `updated_at`.
2. Merge it with the local data (see below).
3. If the merged result differs from the cloud copy, write it back only if `updated_at` has not changed since step 1. Otherwise someone else wrote first, so repeat from step 1.
4. Apply the merged data locally.

Merge rules:

| Data | Rule |
| --- | --- |
| Workout logs and plans | Union by id per day. Plans use a per-item timestamp for completion |
| Notes | Union by id. The note with the later `updated` time wins |
| Workout time | The larger value per day |
| Profile and settings | Per field: a field changed since the last sync wins, otherwise the cloud value is used |
| Deletions | Recorded as ids with a timestamp in `deleted` (kept 90 days), so a deleted item does not come back |

The sync metadata (last synced values and account id) is kept under the separate key `dopamine_sync_meta_v1`. Large profile photos are not uploaded.

## Versions and updates

Each build sets the Android version code to the workflow run number, so every build counts as a newer version than the last. Builds are signed with one permanent key, so Android accepts a new APK as an update to the installed app and keeps its saved data.

## Storage keys

| Key | Holds |
| --- | --- |
| `aegis_calisthenics_state_v2` | The main data object described above |
| `dopamine_avatar_v1` | The profile photo |
| `dopamine_prefs_v1` | A small copy of the look settings for the first paint |
| `dopamine_sync_meta_v1` | Cloud sync metadata |
| `dopamine_tracker_v1` | Run and walk goal, history and the unfinished activity. Device only, never synced |
| `dopamine_update_v1` | Last update check time and the version the user postponed |

**Reset All Data** clears the main data, the profile photo, the look settings and the run and walk data, resets the sync metadata (keeping the account id) and, if you are signed in and agree, deletes the cloud backup. `dopamine_update_v1` is kept; it holds no personal data.

## Settings menu

Settings is a menu (`#settings-home`) of floating cards (`.fc-group` with `.fc-row` rows). `openSettingsPage(key)` shows one `[data-stab]` section (`visual`, `alerts`, `data`, `privacy`, `updates`) with a back header and pushes a history entry, so the Android back button returns to the menu first. Rows that use `display` must not override the `.hidden` helper: `.fc-stack.hidden`, `.fc-group.hidden` and similar rules keep hidden pages hidden.

## Notifications

`notifInit()` creates the Android channels `timers_v2`, `session_v2`, `calendar_v2` and `tracking_v2` and deletes the old silent ones (a channel cannot be edited after creation). `notifyNow()` and `notifyAt()` post through `LocalNotifications` with the Dopamine small icon and large icon. The full-screen reminder uses its own native channel `reminder_fullscreen_v2` from `ReminderReceiver`.

## Run and walk tracking

`www/tracker.js` is loaded after the page. It keeps its state under `dopamine_tracker_v1`.

1. `trkStart()` checks the location permission, then starts a `BackgroundGeolocation` watcher with a foreground service notification. Outside the Android app it falls back to `navigator.geolocation` (foreground only).
2. Each fix goes through `onFix()`: it is ignored when the accuracy is worse than 35 m, when the step is smaller than the GPS jitter, or when the speed is impossible for a walk or run (after 3 such readings in a row the next one is accepted, so a real change of position is not locked out).
3. Distance is the sum of haversine steps. Time is kept as accumulated milliseconds plus the running segment, so it is exact even if timers are throttled in the background.
4. The active activity is saved about every 8 seconds and when the page is hidden. On the next launch an unfinished activity is shown as paused with Resume, Save and Discard.
5. Finishing simplifies the route (points at least 8 m apart, at most about 700 per segment) and stores it in the history.
6. The map is Leaflet (`www/vendor/leaflet.js`, loaded when the Run tab first opens) with OpenStreetMap tiles.

## In-app updates

`www/updater.js` and `android-native/java/UpdateHelper.java` work together:

1. The page reads `https://api.github.com/repos/Abid109/Dopamine/releases/tags/latest`. The release notes contain `build:<number>` and `changes:<line>`, and the release has one `.apk` asset.
2. If `build` is higher than the app's `versionCode` (read by `getAppVersion`), the Settings page and a prompt offer the update.
3. `startUpdateDownload` downloads the asset in a background thread. Only URLs under `https://github.com/Abid109/Dopamine/releases/` are accepted, redirects must stay on https, and the size must match.
4. `UpdateHelper.verify` checks that the file is `com.dopamine.fitness`, has a higher version code and the same signing certificate as the installed app.
5. `installUpdate` opens Android's installer through a `FileProvider` (`UpdateFileProvider`, authority `<app id>.updates`, path `cache/updates`). The user confirms there.

The build workflow adds the `REQUEST_INSTALL_PACKAGES` permission and the provider to the manifest.

## Performance

- **Prebuilt stylesheet:** `www/tailwind.css` replaces the in-browser style compiler.
- **On-demand libraries:** `vendor/qrcode.js`, `vendor/jsQR.js` and `vendor/supabase.js` load only when QR sharing, the scanner or sign in is used. The sign in library also loads at start if a saved session exists.
- **Profile photo storage:** the photo is saved under its own key (`dopamine_avatar_v1`) and only rewritten when it changes. The main data holds a short marker, so each save stays small.
- **Early appearance:** a tiny copy of the look settings (`dopamine_prefs_v1`) is applied before the first paint, so the theme, navigation style and Smooth mode appear instantly.
- **Smooth mode:** `html[data-perf="on"]` switches off blur, shadows, transitions and the decorative background.
- **Cheaper styles:** specific properties are animated instead of everything, and the pastel background is a fixed layer instead of a repainting background.
- **Fonts:** loaded without blocking the first screen.

## Navigation styles

`html[data-nav]` selects the style. The bars are built from one list of destinations (`NAV_ITEMS`) by `renderNav()`, and `navRefreshActive()` highlights the current page. The sidebar is hidden when another style is active.
