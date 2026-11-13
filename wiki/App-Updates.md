# Updating the App

Install a new version **over the old app**. You do not need to uninstall, and your data stays: workouts, notes, plans, profile and settings.

## Update inside the app

1. Open **Settings, App updates**. The app also shows a prompt when a new version is found.
2. Tap **Download and install**.
3. The first time, Android asks you to allow Dopamine to **install unknown apps**. Allow it, come back, and tap the button again.
4. Tap **Update** when Android asks you to confirm.

The new version installs over the old one and your data stays. The app checks the download before Android opens it: its SHA-256 checksum must match the one published with the release, and it must be Dopamine with a newer version signed with the same key. A wrong, damaged or tampered file is rejected and deleted.

The app checks for a new version at most every six hours, and when you open App updates. Tapping **Later** on the prompt hides it for a day.

You need to install the first build that contains this feature by hand (see below). After that, updates can be done inside the app.

## Update by hand

1. Open the [Releases page](https://github.com/Abid109/Dopamine/releases/tag/latest) on your phone.
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
4. Keep a private copy of `debug.keystore` (the name is historical: this key signs the published release build). If it is lost, new builds can no longer be installed over existing installs.

The build stops with a clear message if the secret is missing, so an APK signed with a random key is never published.

### Version numbers

The workflow sets the Android `versionCode` to the run number and `versionName` to `1.0.<run number>`, so every build is a valid upgrade.

### How in-app updates find a build

Every build recreates the GitHub release tagged `latest` with `Dopamine.apk` and notes containing `build:<run number>`, `changes:<one line>` and `sha256:<checksum>`. The app reads `api.github.com/repos/Abid109/Dopamine/releases/tags/latest`, compares `build:` with its own `versionCode`, downloads the APK and checks it against `sha256:`. Keep those three note lines and the asset name ending in `.apk`, or the app will not find or install updates. The repository must stay public.
