# Updating the App

Install a new version **over the old app**. You do not need to uninstall, and your data stays: workouts, notes, plans, profile and settings.

## Steps

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

Each build has a higher version number than the one before. Look at the date on the APK in the Releases page to see how new it is. See the [Changelog](https://github.com/Abid109/Dopamine/blob/main/CHANGELOG.md) for what changed.

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

The workflow sets the Android `versionCode` to the run number and `versionName` to `1.0.<run number>`, so every build is a valid upgrade.
