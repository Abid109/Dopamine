# Installation

## Requirements

- An Android phone
- An internet connection the first time you open the app (it loads styling and fonts)

## Steps

1. On your phone, open the [Releases page](https://github.com/Abid109/Dopamine/releases/latest).
2. Tap **Dopamine.apk** to download it.
3. Open the downloaded file.
4. If Android blocks the install, tap **Settings** in the prompt and allow installs from your browser or file manager, then go back and install.
5. Open **Dopamine** from your app drawer.

## Updating

Open **Settings**, **App updates** and tap **Download and install**, or download the newest **Dopamine.apk** and install it over the old one without uninstalling. Your data stays either way. See [Updating the App](App-Updates).

**Back up before the one-time switch.** Builds made before the fixed signing key was introduced cannot be installed over. If Android says the app conflicts with the existing one, sign in on the **Profile** page so your data syncs (or use **Export JSON**), uninstall, install the new APK, then sign in again. After that, updates never need an uninstall.

## Which build is newest?

The release named **Dopamine APK** with the tag `latest` is replaced every time the app is rebuilt. The date shown on the file is the build date. See the [Changelog](https://github.com/Abid109/Dopamine/blob/main/CHANGELOG.md) for what changed.

## Permissions

| Permission | Why |
| --- | --- |
| Camera | Only to scan QR codes in [Share and Receive](Share-and-Receive). Asked the first time you scan. |
| Location | Only to record a run or walk in [Run and Walk Tracking](Run-and-Walk-Tracking). Asked when you first press Start. |
| Notifications | Timer alerts, reminders, the tracking notification and goal alerts. |
| Battery optimization | Lets tracking keep running with the screen off. |
| Install unknown apps | Only needed for in-app updates. Lets Dopamine open Android's installer for a new version. Asked the first time you tap Update. |
| Internet | Only for map pictures, update checks and the optional sign in and sync. |

## Problems?

See [Troubleshooting](Troubleshooting).


## Web app (iPhone and any browser)

Open https://abid109.github.io/Dopamine/ . On an iPhone use Safari, tap Share, then **Add to Home Screen**. In Chrome or Edge use the install icon in the address bar. It works offline after the first load. On the web, alerts only fire while the app is open, GPS tracking needs the app in front with the screen on, and your data lives in the browser, so export a backup now and then.


## Desktop app (Windows, macOS, Linux)

Download the installer for your system from the Releases page (releases named "Dopamine desktop"). Windows and macOS builds are not signed with a paid certificate, so the system warns on first launch: on Windows choose More info, then Run anyway; on macOS right-click the app and choose Open. Compare the file with `SHA256SUMS.txt` on the release. Your data stays on the computer and is kept when you update. Use Backup & data to export or import a backup.
