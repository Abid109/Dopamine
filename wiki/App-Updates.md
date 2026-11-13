# Updating the App

Install a new version **over the old app**. You do not need to uninstall, and your data stays: workouts, notes, plans, profile and settings.

## Update inside the app

1. Open **Settings, App updates**. The app also shows a prompt when a new version is found.
2. Tap **Download and install**.
3. The first time, Android asks you to allow Dopamine to **install unknown apps**. Allow it, come back, and tap the button again.
4. Tap **Update** when Android asks you to confirm.

The new version installs over the old one and your data stays. The app only accepts a download that is Dopamine signed with the same key, so a wrong or tampered file is rejected before Android opens it.

The app checks for a new version at most every six hours, and when you open App updates. Tapping **Later** on the prompt hides it for a day.

You need to install the first build that contains this feature by hand (see below). After that, updates can be done inside the app.

## Update by hand

1. Open the [Releases page](https://github.com/Abid109/Dopamine/releases/latest) on your phone.
2. Download the newest **Dopamine.apk**.
3. Open the file and tap **Update** (or **Install**).

That is all. Your data is kept because every build is signed with the same key, which tells Android it is the same app.

## If Android says the app conflicts or was not installed

Builds made before the fixed signing key was introduced were each signed with a different key. Android refuses to install over those.

1. Back up your data. Sign in on the **Profile** page so everything syncs, or open **Settings** and tap **Export JSON**.
2. Uninstall the old app once.
3. Install the new APK.
4. Sign in again (or use **Import Backup**) to get your data back.

After this one-time switch, every update installs over the old app.

## Which version do I have?

**Settings, App updates** shows the installed version and the newest one. Each build has a higher version number than the one before. See the [Changelog](https://github.com/Abid109/Dopamine/blob/main/CHANGELOG.md) for what changed.

## For developers

### One-time setup: signing key

Android only installs an update over an existing app if both are signed with the same key. The build reads the key from a repository secret named `ANDROID_KEYSTORE_B64`.

1. Create a keystore with the alias `androiddebugkey` and the password `android` for both the store and the key:
   ```
   keytool -genkeypair -keystore debug.keystore -storepass android -keypass android -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 36500 -dname "CN=Dopamine, O=Dopamine, C=BD"
   ```
2. Encode it: `base64 -w0 debug.keystore`
3. In the repository, go to **Settings, Secrets and variables, Actions, New repository secret**. Name it `ANDROID_KEYSTORE_B64` and paste the encoded text.
4. Keep a private copy of `debug.keystore`. If it is lost, new builds can no longer be installed over existing installs.

The build stops with a clear message if the secret is missing, so an APK signed with a random key is never published.

### Version numbers

The workflow sets the Android `versionCode` to the run number and `versionName` to `<major>.<minor>.<run number>`, where major and minor come from `version` in `package.json` (for example `1.9.0` gives `1.9.42`). The GitHub release tag is `v<versionName>`, so every build is a valid upgrade and the tag parses as a version for tools like Obtainium. Change the major or minor number in `package.json` when you want a new release line.

### How in-app updates find a build

Every build publishes a tagged release (for example `v1.9.42`, marked Latest) with `Dopamine.apk` and notes containing `build:<run number>`, `changes:<one line>`, the APK's SHA-256 and the signing certificate fingerprint. The app reads `api.github.com/repos/Abid109/Dopamine/releases/latest`, compares `build:` with its own `versionCode`, and downloads the APK. Keep those two note lines and the asset name ending in `.apk`, or the app will not find updates. The repository must stay public. Releases for other apps in this repository (the desktop app, tags starting `desktop-v`) must never be marked Latest, or the phone app would read them.

For apps installed before tagged releases, every build also refreshes a pre-release tagged `latest`. Those older apps read it, and it can be removed once everyone has updated.
