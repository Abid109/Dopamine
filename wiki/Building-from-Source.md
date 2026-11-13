# Building from Source

Dopamine is one web page wrapped as an Android app with [Capacitor](https://capacitorjs.com).

## Automatic build (recommended)

Every push to `main` runs the **Build Dopamine APK** workflow, which:

1. Installs Node and Java 17
2. Adds the Android platform with Capacitor
3. Applies the launcher icons, app name and a version number that goes up with every build, adds the camera, notification, battery optimization and install permissions, and adds the native files from `android-native/` (full-screen reminders and in-app updates)
4. Builds a debug APK with Gradle (with retries and a mirror fallback)
5. Publishes `Dopamine.apk` to the **latest** release

The build signs the APK with a permanent key stored in the `ANDROID_KEYSTORE_B64` repository secret. See [Updating the App](App-Updates) for the one-time setup.

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
| `@capacitor/local-notifications` | Timer, session, calendar and goal notifications |
| `@capacitor/geolocation` | Checking and asking for the location permission |
| `@capacitor-community/background-geolocation` | GPS recording in a foreground service for run and walk tracking |

## Libraries in `www/vendor/`

| Library | Used for |
| --- | --- |
| `qrcode-generator` | Creating QR codes |
| `jsQR` | Reading QR codes from the camera |
| `supabase-js` | Optional email login and cloud backup |
| `leaflet` | The map in the Run tab |

The QR libraries and Leaflet are included in the app so they work without downloading code. Map pictures still come from OpenStreetMap.

## Releases and in-app updates

Every build deletes and recreates the GitHub release tagged `latest` with `Dopamine.apk`. The release notes contain two lines the app reads: `build:<run number>` and `changes:<one line from the merge commit>`. Do not rename them or the asset, and keep the repository public, or in-app updates stop working. See [Updating the App](App-Updates) and [Architecture](Architecture).

## Wiki

The pages in `wiki/` are copied to the GitHub wiki by the **Sync wiki** workflow whenever they change on `main`. GitHub only creates the wiki repository after one page is saved in the browser, so do that once: open the **Wiki** tab, click **Create the first page**, save, then run **Sync wiki** from the **Actions** tab. See [Contributing](Contributing).

## Cloud backup setup (optional)

The app talks to a [Supabase](https://supabase.com) project. To use your own, create a project, run `supabase/setup.sql` in the SQL Editor, and set `SUPABASE_URL` and `SUPABASE_KEY` (the publishable key) near the top of the account code in `www/index.html`. Never put a secret or service-role key in the app.

## Styles

The app uses one prebuilt stylesheet, `www/tailwind.css`, instead of compiling Tailwind in the browser. After you change classes in `www/index.html`, rebuild it:

```bash
npm install
npm run build:css
```

The GitHub workflow rebuilds it on every build, so the published app is always up to date.
