# Building from Source

Dopamine is one web page wrapped as an Android app with [Capacitor](https://capacitorjs.com).

## Automatic build (recommended)

Every push to `main` runs the **Build Dopamine APK** workflow, which:

1. Installs Node and Java 17
2. Adds the Android platform with Capacitor
3. Applies the launcher icons, app name, camera permission and a version number that goes up with every build
4. Builds a debug APK with Gradle (with retries and a mirror fallback)
5. Packages the web files as `Dopamine-bundle.zip` for in-app updates
6. Publishes `Dopamine.apk` and `Dopamine-bundle.zip` to the **latest** release

The build signs the APK with a permanent key stored in the `ANDROID_KEYSTORE_B64` repository secret. See [App Updates](App-Updates) for the one-time setup.

Changes that only touch documentation do not trigger a build.

## Run the page in a browser

Open `www/index.html` in a desktop browser. Most features work, apart from native sharing, file opening and the Android back button.

## Build locally

Requirements: Node 20, Java 17, Android SDK.

```bash
npm install
npx cap add android
# copy android-res/* into android/app/src/main/res/ and set the app name
npx cap sync android
cd android
./gradlew assembleDebug
```

The APK is created at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Capacitor plugins

| Plugin | Used for |
| --- | --- |
| `@capacitor/filesystem` | Writing PDFs and share files to temporary storage |
| `@capacitor/share` | The Android share sheet |
| `@capacitor-community/file-opener` | Opening PDFs in a viewer |
| `@capacitor/app` | The Android back button |
| `@capgo/capacitor-updater` | In-app updates (manual mode, statistics off) |

## Libraries in `www/vendor/`

| Library | Used for |
| --- | --- |
| `qrcode-generator` | Creating QR codes |
| `jsQR` | Reading QR codes from the camera |
| `supabase-js` | Optional email login and cloud backup |

The QR libraries are included in the app so QR sharing works offline.

## Cloud backup setup (optional)

The app talks to a [Supabase](https://supabase.com) project. To use your own, create a project, run `supabase/setup.sql` in the SQL Editor, and set `SUPABASE_URL` and `SUPABASE_KEY` (the publishable key) near the top of the account code in `www/index.html`. Never put a secret or service-role key in the app.
