#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Dopamine-Commercial
# Copyright (c) 2026 Abid109. Licensed under the GNU AGPL-3.0 (see LICENSE) or, by separate written
# agreement, a commercial license (see COMMERCIAL-LICENSE.md). All other rights reserved.
"""Builds the documentation website from the wiki pages.

The wiki/ folder stays the single source: the same Markdown files feed the GitHub Wiki (sync-wiki workflow)
and this site. This script prepares a copy of the pages for MkDocs and runs it:

  * wiki links such as [Installation](Installation) become real page links (Installation.md)
  * Home.md becomes the site's front page (index.md)
  * the menu is read from wiki/_Sidebar.md (bold lines are groups, list items are pages)
  * pages missing from the sidebar still get built and are listed under "More"
  * the build fails (mkdocs --strict) on a broken link, so a typo is caught before it is published

Usage:  python site/docs/build_docs.py [--wiki wiki] [--out _site/docs]
"""
import argparse
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent

# Links added at the end of the menu
EXTRA_NAV = [
    ("Get Dopamine", [
        ("Download page", "https://abid109.github.io/Dopamine/download/"),
        ("Open the web app", "https://abid109.github.io/Dopamine/"),
        ("Source code on GitHub", "https://github.com/Abid109/Dopamine"),
    ]),
]

LINK = re.compile(r"\]\(([A-Za-z0-9_-]+)(#[^)\s]*)?\)")
SIDEBAR_GROUP = re.compile(r"^\*\*(.+?)\*\*\s*$")
SIDEBAR_ITEM = re.compile(r"^\s*[-*]\s+\[(.+?)\]\(([A-Za-z0-9_-]+)\)\s*$")


def page_file(name: str) -> str:
    return "index.md" if name == "Home" else name + ".md"


def rewrite_links(text: str, pages: set, source: str) -> str:
    """Point wiki links at page files. Code blocks are left alone."""
    out, in_fence = [], False
    for line in text.splitlines():
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
        if not in_fence:
            if "[[" in line:
                print(f"::warning::{source}: wiki-style [[link]] is not supported: {line.strip()[:80]}")

            def fix(m):
                name, frag = m.group(1), m.group(2) or ""
                if name in pages:
                    return f"]({page_file(name)}{frag})"
                return m.group(0)

            line = LINK.sub(fix, line)
        out.append(line)
    return "\n".join(out) + "\n"


def read_sidebar(path: Path, pages: set):
    """Returns [(group title, [(page title, file)])] from _Sidebar.md."""
    groups, current = [], None
    if path.exists():
        for raw in path.read_text(encoding="utf-8").splitlines():
            g = SIDEBAR_GROUP.match(raw)
            if g:
                current = (g.group(1).strip(), [])
                groups.append(current)
                continue
            i = SIDEBAR_ITEM.match(raw)
            if i and current is not None and i.group(2) in pages:
                current[1].append((i.group(1).strip(), page_file(i.group(2))))
    used = {f for _, items in groups for _, f in items}
    rest = [(n.replace("-", " "), page_file(n)) for n in sorted(pages) if page_file(n) not in used]
    if rest:
        groups.append(("More", rest))
    return groups


def yq(s: str) -> str:
    """Quote a value for YAML."""
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def nav_yaml(groups) -> str:
    lines = ["", "nav:"]
    for title, items in groups:
        lines.append(f"  - {yq(title)}:")
        for t, target in items:
            lines.append(f"      - {yq(t)}: {yq(target)}")
    return "\n".join(lines) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--wiki", default=str(ROOT / "wiki"))
    ap.add_argument("--out", default=str(ROOT / "_site" / "docs"))
    args = ap.parse_args()

    wiki, out = Path(args.wiki).resolve(), Path(args.out).resolve()
    files = sorted(p for p in wiki.glob("*.md") if not p.name.startswith("_"))
    if not any(p.stem == "Home" for p in files):
        print("::error::wiki/Home.md is missing; the site needs a front page")
        return 1
    pages = {p.stem for p in files}

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        docs = tmp / "docs"
        (docs / "stylesheets").mkdir(parents=True)
        (docs / "assets").mkdir()

        for p in files:
            text = rewrite_links(p.read_text(encoding="utf-8"), pages, p.name)
            (docs / page_file(p.stem)).write_text(text, encoding="utf-8")

        shutil.copy(HERE / "extra.css", docs / "stylesheets" / "extra.css")
        shutil.copy(ROOT / "www" / "icons" / "icon-192.png", docs / "assets" / "icon.png")
        shutil.copy(ROOT / "www" / "icons" / "favicon-32.png", docs / "assets" / "favicon.png")

        groups = read_sidebar(wiki / "_Sidebar.md", pages) + [(t, items) for t, items in EXTRA_NAV]
        config = (HERE / "mkdocs.base.yml").read_text(encoding="utf-8") + nav_yaml(groups)
        (tmp / "mkdocs.yml").write_text(config, encoding="utf-8")

        out.parent.mkdir(parents=True, exist_ok=True)
        cmd = [sys.executable, "-m", "mkdocs", "build", "--strict", "-f", str(tmp / "mkdocs.yml"), "-d", str(out)]
        print("+", " ".join(cmd))
        return subprocess.call(cmd)


if __name__ == "__main__":
    sys.exit(main())
