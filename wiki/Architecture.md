# Architecture

## Overview

```
www/index.html        The whole app: markup, styles and logic
www/vendor/           QR libraries (qrcode.js, jsQR.js)
android-res/          Launcher icons and colours applied in the build
capacitor.config.json App id and name
.github/workflows/    APK build and wiki sync
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

## App updates

The build stamps its run number into the app (`APP_BUILD`) and into the Android version code. On launch the app asks the GitHub API for the latest release, reads the `build:N` line from its notes, and compares N with its own number. If N is higher, it offers the update.

Applying an update downloads `Dopamine-bundle.zip` with the updater plugin and switches to it. The app calls `notifyAppReady` as the first thing on every launch, so a version that fails to start is rolled back automatically. Saved data lives in the same browser storage before and after an update.

Development builds (where the build number is not stamped) never offer updates.
