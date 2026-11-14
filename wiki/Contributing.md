# Contributing

Ideas and fixes are welcome.

1. Read the [Contributing guide](https://github.com/Abid109/Dopamine/blob/main/CONTRIBUTING.md).
2. Check [open issues](https://github.com/Abid109/Dopamine/issues) to avoid doubling up.
3. Fork, branch from `main`, and open a pull request using the template.

Please keep user data private, keep saved data compatible, and test on a real Android phone when you can. Everyone must follow the [Code of Conduct](https://github.com/Abid109/Dopamine/blob/main/CODE_OF_CONDUCT.md).

## Security checks

Pull requests run a CodeQL scan. Dependabot opens pull requests for library and GitHub Action updates; review them like any other change and test on a phone when they touch Capacitor. Libraries in `www/vendor/` are updated by hand. Report vulnerabilities privately as described in [SECURITY.md](https://github.com/Abid109/Dopamine/blob/main/SECURITY.md). See [Building from Source](Building-from-Source).

When you build HTML in JavaScript, escape anything a person typed, imported, received or synced with `shEsc()` (or use `textContent`), and pass IDs and dates to click handlers through `data-` attributes read with `this.dataset`, never inside a JavaScript string in `onclick`. See [CONTRIBUTING.md](https://github.com/Abid109/Dopamine/blob/main/CONTRIBUTING.md).

## Licensing

Dopamine is dual-licensed (AGPL-3.0, plus a commercial license from the maintainer). By opening a pull request you agree that your contribution is licensed under the AGPL-3.0 and that the maintainer may also license it commercially. You keep your copyright. See [License](License).

## Editing the wiki

Wiki pages live in the repository's `wiki/` folder. Edit them there, not in the GitHub wiki editor, because the **Sync wiki** workflow overwrites the wiki with that folder every time it changes on `main`.

**One-time setup for a new repository:** GitHub does not create the wiki until a page has been saved in the browser. Open the **Wiki** tab, click **Create the first page**, save it, then open **Actions**, **Sync wiki**, **Run workflow**. From then on every merge that touches `wiki/` updates the wiki. Until that first page exists the workflow fails with a message that says so.

Use plain links between pages, like `[Timers](Timers)`, and add new pages to `_Sidebar.md`.

## The documentation website

The same pages are also published as a website at [abid109.github.io/Dopamine/docs](https://abid109.github.io/Dopamine/docs/), built with MkDocs by the **Deploy website** workflow every time `wiki/` changes on `main`. The menu comes from `_Sidebar.md`, and a broken link between pages stops the build. To preview it on your computer:

```
pip install -r site/docs/requirements.txt
python site/docs/build_docs.py --out _site/docs
python -m http.server --directory _site
```

Then open `http://localhost:8000/docs/`. The builder and theme live in `site/docs/`.
