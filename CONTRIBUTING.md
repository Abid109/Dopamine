# Contributing to Dopamine

Thanks for taking the time to help. This guide keeps things quick for everyone.

## Reporting a bug

Open an issue with the **Bug report** form. Please include:

- What you did, what you expected, and what happened instead.
- Your phone model and Android version.
- Which build you installed (see the release date on the Releases page).

## Suggesting a feature

Open an issue with the **Feature request** form and describe the problem you want solved, not just the solution.

## Making a change

1. Fork the repository and create a branch from `main`.
2. Make your change. The whole app lives in `www/index.html`, so keep edits focused.
3. Test it in a desktop browser by opening `www/index.html`, then on an Android phone using the APK built by GitHub Actions.
4. Open a pull request using the template.

## Guidelines

- **Keep user data private.** Do not add analytics, accounts or network calls that send user data anywhere.
- **Keep the app working offline** after first launch wherever possible.
- **Never break saved data.** If you change the data format, old saved data must still load. See [Architecture](https://github.com/Abid109/Dopamine/wiki/Architecture).
- **Match the existing style:** the same colour variables, card layout and button styles.
- Write short, clear commit messages, for example `Fix rest timer reset on tab switch`.

## Documentation

Wiki pages live in the `wiki/` folder. Edit them there and open a pull request. They are published to the GitHub wiki automatically after merge.

## Code of conduct

Everyone taking part must follow the [Code of Conduct](CODE_OF_CONDUCT.md).
