# Security Policy

## Supported versions

Only the latest build on the [Releases](https://github.com/Abid109/Dopamine/releases) page receives fixes.

## Reporting a vulnerability

Please do **not** open a public issue for security problems.

Use GitHub's private reporting: go to the **Security** tab of this repository and choose **Report a vulnerability**. Include the steps to reproduce and the Android version you tested on.

You can expect a first reply within a few days. Once a fix is released, the report can be made public.

## Scope

Dopamine stores data on the device. The optional account feature uses a hosted database where each user can only access their own backup. Reports about the following are most useful:

- Importing a crafted file or QR code that crashes the app or changes data that was not selected.
- Anything that sends user data off the phone without the user's action.
- Any way to read or change another user's cloud backup.
- Any way to make the in-app updater install a file that is not a genuine Dopamine build signed with the project key.

## How the app and its updates are protected

- **Release build.** The published APK is a signed release build. It is not debuggable, so it cannot be inspected or have its data read over USB debugging.
- **No Android backups.** Backup of the app's data by Android (cloud backup and `adb backup`) is turned off. Keep your own backup with **Export JSON** or by signing in.
- **Verified updates.** The in-app updater only downloads from this project's GitHub releases, checks the file's SHA-256 against the checksum in the release notes, checks that it is Dopamine with a newer version and the same signing key, and then hands it to Android's installer, where you confirm.
- **Checked builds.** Before a release is published, the workflow checks the APK signature, the signing key fingerprint and that the APK is not debuggable. A failed check stops the release.
- **Supply chain.** GitHub Actions are pinned to exact commits, the build runs with read-only permissions except where it must publish, Dependabot proposes library updates and CodeQL scans the code for vulnerabilities.

The checksum protects against a swapped or damaged file. It does not protect against someone who can change the release itself, which is why the signing key and the GitHub account must stay protected (below).

## Signing key

Builds are signed with a permanent key kept in a repository secret. Anyone who has that key can publish an APK that installs over the app, so keep it private and keep two-factor authentication on the GitHub account.

## Maintainer checklist (repository settings)

These are set on GitHub and cannot be set from the code:

- Two-factor authentication (a passkey or an authenticator app) on the owner account, and recovery codes saved.
- A branch rule or ruleset for `main`: require a pull request, block force pushes and block deletion.
- Code security: secret scanning with push protection, Dependabot alerts and private vulnerability reporting turned on.
- Settings, Actions, General: workflow permissions set to read-only, and approval required for workflows from first-time contributors.
- A private backup of the signing keystore and its passwords. If it is lost, no update can be installed over existing installs. If it leaks, rotate it and warn users.
- Personal access tokens: scoped to this repository, short expiry, and never pasted into chats or issues. Revoke any token that has been shared.
