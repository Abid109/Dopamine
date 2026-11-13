# Troubleshooting

## The app looks unstyled or plain

Styling loads from the internet on launch. Connect to Wi-Fi or mobile data and reopen the app.

## I cannot install the APK

- Allow installs from your browser or file manager when Android asks.
- If it says the app was not installed, free up storage and try again.
- If it conflicts with an older copy, install the newest APK over it. Do not uninstall first unless you have a backup.

## The PDF does not open

- Make sure you have a PDF viewer installed. If not, choose Save from the share sheet and open it later.
- The first PDF needs internet to load the PDF library.
- Still stuck? [Open an issue](https://github.com/Abid109/Dopamine/issues/new/choose) and tell us what happens when you tap the button.

## The QR scanner shows a black screen or says the camera is blocked

- Open Android Settings, Apps, Dopamine, Permissions, and allow Camera.
- Close other apps that may be using the camera.
- Reopen **Scan QR code**.

## The scanner is not picking up codes

- Increase brightness on the sending phone.
- Hold the phones 20 to 30 cm apart and keep them steady.
- Pause on one code with the **Pause** button if the scanner misses it.
- If there are many codes, use **Send as file** instead.

## "Could not read that data"

The codes came from different transfers, or one was damaged. Start a new transfer on the sending phone and scan again from the first code.

## The back button closes the app

The first press on the Dashboard shows a message. Press it again within about two seconds to exit. On other pages it goes to the previous page.

## My data disappeared

Data lives inside the app. It is lost if the app is uninstalled or if you used **Reset All Data** or **Import Backup** (which replaces current data). Keep regular backups with **Export JSON**.

## I did not get the email code

- Check your spam folder and wait a minute.
- Tap **Send a new code**. Email sending is limited, so too many requests in a short time are blocked.
- If your email contains a link instead of a code, tap the link to confirm, then come back and log in.

## Sync says offline or failed

- Check your internet connection. The app retries when it comes back online.
- Tap **Sync now** in the sign in card on the **Profile** page.
- If it keeps failing, sign out and sign in again.

## "App not installed" when updating

- Install the new APK **over** the old app. Do not uninstall first.
- If Android says the app conflicts with the existing one, the old app was installed from a build made before the fixed signing key. Back up your data (sign in on the **Profile** page so it syncs, or use **Export JSON**), uninstall once, and install the new APK. Every update after that installs over the old app. See [Updating the App](App-Updates).

## Run and walk tracking

**Start says location is needed or blocked.** Allow location when Android asks. If you chose "Don't allow" before, tap **Settings** on the Run tab's permission card (or **App info**) and allow Location for Dopamine.

**The distance is too low or the route is jumpy.** Start outdoors and wait for the GPS accuracy on the Run tab to drop below about 20 m. Fixes worse than about 35 m, tiny movements while standing still and impossible jumps are ignored on purpose. Keep the phone in a pocket or armband, not deep in a bag.

**Tracking stopped when the screen turned off.** Allow **Battery optimization** for Dopamine ([Notifications and Permissions](Notifications-and-Permissions)). On Xiaomi, Huawei, Samsung and some other phones also open the app info page and set Battery to **Unrestricted**, and allow notifications so the tracking notification can stay visible.

**The map is blank or grey.** The map pictures need internet. Your route is still recorded and drawn. Connect and reopen the Run tab.

**The app was closed during a run.** Reopen the Run tab. The route so far is kept, and you can **Resume**, **Save** or **Discard** it.

## Notifications

**No sound or pop-up.** Open Android **Settings**, **Apps**, **Dopamine**, **Notifications** and check the type's sound and importance. Check that Do Not Disturb and silent mode are off. If you upgraded from an older version, reopen the app once so the new alert channels are created.

**No notifications at all.** Turn on **Notifications** in **Settings**, **Timers & alerts**, and allow the notification permission in Android settings.

**Full-screen reminders do not open.** Tap **Allow** on the Full-screen reminders row in **Settings**, **Timers & alerts**. On Android 14 and later this is a separate permission page.

## In-app updates

**The button says Check for updates and nothing is found.** You already have the newest version, or the phone is offline. GitHub also limits how often it answers one network, so try again later.

**It asks me to allow installing unknown apps.** Allow "Install unknown apps" for Dopamine on the page that opens, go back and tap **Download and install** again. Android always asks you to confirm the install itself.

**"The update is not signed with the Dopamine key".** The new file was built with a different signing key than your installed app, so Android would refuse it. Back up your data (sign in, or **Export JSON**), uninstall once, and install the newest APK by hand. See [Updating the App](App-Updates).

**"The file does not match its checksum".** The download was changed or damaged, so it was thrown away. Try again on a different network. If it keeps happening, update by hand from the Releases page and [report it](https://github.com/Abid109/Dopamine/security/advisories/new).

**"This release has no checksum".** The app only installs releases that publish a checksum. Update by hand from the Releases page.

**"You already have this version" or "download was incomplete".** Tap the button again. The file is checked before Android opens it, so a broken download is thrown away safely.

**The first update has to be done by hand.** The app can update itself only after you have installed a version that includes in-app updates. See [Updating the App](App-Updates).

## Something else

[Report a bug](https://github.com/Abid109/Dopamine/issues/new/choose) with your phone model and Android version.
