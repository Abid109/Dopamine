# Contributing

Ideas and fixes are welcome.

1. Read the [Contributing guide](https://github.com/Abid109/Dopamine/blob/main/CONTRIBUTING.md).
2. Check [open issues](https://github.com/Abid109/Dopamine/issues) to avoid doubling up.
3. Fork, branch from `main`, and open a pull request using the template.

Please keep user data private, keep saved data compatible, and test on a real Android phone when you can. Everyone must follow the [Code of Conduct](https://github.com/Abid109/Dopamine/blob/main/CODE_OF_CONDUCT.md).

## Editing the wiki

Wiki pages live in the repository's `wiki/` folder. Edit them there, not in the GitHub wiki editor, because the **Sync wiki** workflow overwrites the wiki with that folder every time it changes on `main`.

**One-time setup for a new repository:** GitHub does not create the wiki until a page has been saved in the browser. Open the **Wiki** tab, click **Create the first page**, save it, then open **Actions**, **Sync wiki**, **Run workflow**. From then on every merge that touches `wiki/` updates the wiki. Until that first page exists the workflow fails with a message that says so.

Use plain links between pages, like `[Timers](Timers)`, and add new pages to `_Sidebar.md`.
