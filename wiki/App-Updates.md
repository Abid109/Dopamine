# App Updates

New versions of Dopamine install **inside the app**. There is nothing to download or install by hand, and your data is never touched.

## Updating

1. A banner appears at the bottom of the screen when a new version is ready. Tap **Update**.
2. Or open **Settings**, tap **Check for updates**, then **Update now**.

The app downloads the new version, restarts, and carries on with all your workouts, notes and settings intact. You need an internet connection to update.

## If something goes wrong

- If the download fails, nothing changes. Try again later.
- If a new version cannot start, the app switches back to the previous working version by itself.

## What updates inside the app

The app is built from web files wrapped in an Android shell. Updates swap the web files, which covers almost every change: screens, features, fixes and design.

Changes to the Android shell itself, such as a new permission or a new built-in plugin, need a new APK. Download **Dopamine.apk** from the [Releases page](https://github.com/Abid109/Dopamine/releases/tag/latest) and install it over the old app. Your data stays, because every build is signed with the same key.

## Version number

The version is shown on the **Settings** page, for example 1.0.23. The number goes up with every build.

## For developers

Each build publishes two files to the **latest** release: `Dopamine.apk` and `Dopamine-bundle.zip` (the web files). The release notes contain a line such as `build:23`. The app compares that number with its own version.

### One-time setup: signing key

Android only installs an update over an existing app if both are signed with the same key. The build reads the key from a repository secret named `ANDROID_KEYSTORE_B64`.

1. Create a keystore with the alias `androiddebugkey` and the password `android` for both the store and the key:
   ```
   keytool -genkeypair -keystore debug.keystore -storepass android -keypass android -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 36500 -dname "CN=Dopamine, O=Dopamine, C=BD"
   ```
2. Encode it: `base64 -w0 debug.keystore`
3. In the repository, go to **Settings, Secrets and variables, Actions, New repository secret**. Name it `ANDROID_KEYSTORE_B64` and paste the encoded text.
4. Keep a private copy of `debug.keystore`. If it is lost, builds can no longer be installed over existing installs.

The build stops with a clear message if the secret is missing, so an APK signed with a random key is never published.

### How the in-app update works

The updater is the `@capgo/capacitor-updater` plugin in manual mode, with its statistics reporting turned off. It downloads `Dopamine-bundle.zip` from the release, unpacks it, and switches the app to it. The app confirms a successful start on every launch. If a launch is not confirmed within 15 seconds, the plugin rolls back.
