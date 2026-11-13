# Privacy Policy

_Last updated: 13 November 2026_

Dopamine is built to keep your fitness data on your own phone.

## What the app stores

Your profile, workout logs, plans, notes, timers and settings are saved in the app's storage on your phone. This includes an optional profile photo.

## What the app does not do

- No analytics, advertising or tracking.
- No account is required. Everything works without logging in.
- The developer does not read your data.

## When data leaves your phone

Only when you decide:

- **Sign in and sync (optional):** if you sign in with an email on the Profile page, a copy of your profile, settings, workout logs, plans, notes and workout time is stored in a private cloud database (hosted by Supabase) so your devices can stay in sync. Each user can only read and change their own row. Your email and a hashed password are held by the same service for login. A very large profile photo stays on the device and is not uploaded. Signing out stops syncing. You can delete your cloud backup in the app at any time.
- **Share & Receive:** you choose what to include and how to send it (QR codes, or a file through the Android share sheet). The other person's phone receives only that.
- **PDF report and JSON backup:** these are created on your phone and opened or shared by you.

## Permissions

- **Camera:** used only on the QR scanning screen, only while it is open. Images are never saved or sent anywhere.
- **Location (GPS):** used only while you record a run or walk in the Run tab. While recording, Android shows a notification so you know GPS is on. Routes, times and distances are stored on the phone only. They are not included in sign in and sync, Share & Receive or reports, and are removed by deleting the activity, **Reset All Data** or uninstalling.
- **Notifications:** used for timers, reminders, the tracking notification and goal alerts. They are created on the phone.
- **Battery optimization:** the app asks to be exempt so Android does not stop GPS tracking in the background. It does not read any battery data.
- **App updates:** the app asks GitHub (api.github.com) for the newest release now and then and downloads the APK from github.com only when you tap Update. GitHub sees your IP address like any website visit. Nothing from the app or your data is sent. Needs the "Install unknown apps" permission to open Android's installer; Android asks you to confirm each install.
- **Internet:** the app needs the internet only for the features below. Fonts, styles, the QR tools and the PDF library are bundled inside the app, so nothing is loaded from Google Fonts or other content networks.
  - **Map tiles (OpenStreetMap):** the map in the Run tab loads pictures (tiles) from OpenStreetMap. Those requests reveal the map area you are viewing to that service.
  - **Update check (GitHub):** see App updates above.
  - **Optional sign in and sync (Supabase):** see Sign in and sync above.
  No personal data is included in any of these requests, apart from what is stated for sign in and sync.

## Web version

If you use Dopamine in a browser (the website or an installed web app) the same rules apply, with these differences. Your data is stored in that browser on your device, and the browser, not Dopamine, decides when it can be cleared, so export a backup now and then. The website is hosted on GitHub Pages, so GitHub sees your IP address when you open it, like any website visit. There are no cookies set by Dopamine and no analytics. Location is used only while a run or walk is recording, only if you allow it in the browser. Notifications use the browser's own permission and only appear while the app is open.

## Deleting your data

- Delete your cloud backup from the **Profile** page, then **Delete my cloud backup**.
- Delete a received file from the **Share & Receive** screen.
- Use **Settings, Reset All Data** to erase everything the app stores.
- Uninstalling the app removes all of its stored data.

## Contact

Questions about privacy can be raised by opening an issue on this repository.
