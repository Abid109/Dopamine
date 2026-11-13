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

## Signing key

Builds are signed with a permanent key kept in a repository secret. Anyone who has that key can publish an APK that installs over the app, so keep it private and keep two-factor authentication on the GitHub account.

## Automated checks

- **CodeQL** scans the JavaScript and Java code on every change and every Monday. Results are under the repository's **Security** tab.
- **Dependabot** opens pull requests when an npm library or a GitHub Action has a new version. Libraries copied into `www/vendor/` are not covered: check them by hand now and then.

## Maintainer checklist (repository settings)

These are set on GitHub and cannot be set from the code:

- Two-factor authentication (a passkey or an authenticator app) on the owner account, and recovery codes saved.
- A branch rule or ruleset for `main`: require a pull request, block force pushes and block deletion.
- Code security: secret scanning with push protection, Dependabot alerts and private vulnerability reporting turned on.
- Settings, Actions, General: workflow permissions set to read-only, and approval required for workflows from first-time contributors.
- A private backup of the signing keystore and its passwords. If it is lost, no update can be installed over existing installs. If it leaks, rotate it and warn users.
- Personal access tokens: scoped to this repository, short expiry, and never pasted into chats or issues. Revoke any token that has been shared.
