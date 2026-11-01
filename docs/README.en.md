# 🍥 Fuwari

![Node.js >= 22.12](https://img.shields.io/badge/node.js-%3E%3D22.12-brightgreen)
![pnpm >= 10](https://img.shields.io/badge/pnpm-%3E%3D10-blue)
![Astro 7](https://img.shields.io/badge/Astro-7-ff5d01?logo=astro)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![License MIT](https://img.shields.io/badge/license-MIT-green)

A personal static blog built with [Astro](https://astro.build), forked from the
[Fuwari](https://github.com/saicaca/fuwari) template and kept up to date with the
current toolchain.

🌏 README in
[**中文**](../README.md) /
[**日本語**](README.ja.md) /
[**한국어**](README.ko.md) /
[**Español**](README.es.md) /
[**ไทย**](README.th.md) /
[**Tiếng Việt**](README.vi.md) /
[**Bahasa Indonesia**](README.id.md)

## About

This repository started as a copy of Fuwari and has since been upgraded to a newer
stack than the upstream template:

| Area | Upstream template | This repository |
|:--|:--|:--|
| Astro | 5.x | **7.3** |
| Tailwind CSS | 3.x via `@astrojs/tailwind` | **4.x via `@tailwindcss/vite`** |
| Content collections | legacy `src/content/config.ts` | **Content Layer API** (`src/content.config.ts`) |
| Svelte | 5.39 | **5.57** |

Because `@astrojs/tailwind` never supported Astro 6+, the Tailwind CSS 4 migration was
required rather than optional. Styles are now configured CSS-first in
[`src/styles/app.css`](../src/styles/app.css) instead of `tailwind.config.js`.

The blog content and site settings are still the template defaults — edit
[`src/config.ts`](../src/config.ts) to make it your own.

## Features

- Built with Astro and Tailwind CSS, with Svelte for interactive components
- Smooth page transitions via [Swup](https://swup.js.org/)
- Client-side full-text search via [Pagefind](https://pagefind.app/)
- Light / dark mode with a customizable accent hue, persisted in `localStorage`
- Responsive layout with a table of contents on wide screens
- Syntax-highlighted code blocks via [Expressive Code](https://expressive-code.com/),
  with language badges, copy buttons and collapsible sections
- Math typesetting via [KaTeX](https://katex.org/)
- Extended Markdown: admonitions, GitHub repository cards
- Image lightbox via [PhotoSwipe](https://photoswipe.com/), optimized with Sharp
- RSS feed, sitemap and `robots.txt` generated at build time
- UI strings translated into 10 languages

## Requirements

- **Node.js ≥ 22.12.0**
- **pnpm ≥ 10**

The exact pnpm version is pinned through the `packageManager` field, so a compatible
release is selected automatically. The `preinstall` script rejects npm and Yarn.

## Getting Started

```sh
pnpm install     # install dependencies
pnpm dev         # start the dev server at http://localhost:4321
```

`pnpm dev` also brings up the local launcher: it first looks for `launcher/server.mjs` in
this repository, then at the `LAUNCHER_HOME` environment variable, then at a sibling
`../fuwari-launcher` directory, and uses whichever it finds; if none exists it starts the
site alone and does not fail. To start the site only, use `pnpm dev:astro` or
`pnpm dev --no-launcher` (or set `LAUNCHER=0`).

Then:

1. Edit [`src/config.ts`](../src/config.ts) — site title, subtitle, language, theme hue,
   banner, table of contents and favicons.
2. Run `pnpm new-post <filename>` to scaffold a post in `src/content/posts/`.
3. Set the `site` and `base` values in [`astro.config.mjs`](../astro.config.mjs) before
   deploying.

## Project Structure

```
src/
├── assets/         images imported by components
├── components/     Astro and Svelte components (control/, misc/, widget/)
├── constants/      layout constants, icon defaults, nav link presets
├── content/        blog posts and the standalone pages collection
├── i18n/           UI strings, one module per language
├── layouts/        Layout.astro and MainGridLayout.astro
├── pages/          routes: index, archive, about, posts, RSS, robots.txt
├── plugins/        remark / rehype and Expressive Code plugins
├── styles/         app.css (Tailwind entry) and per-feature stylesheets
├── types/          shared TypeScript types
└── utils/          content queries, URL and theme helpers
src/content.config.ts   collection definitions (Content Layer API)
scripts/                dev scripts: dev.mjs (site + launcher), sync-branch.mjs (branch snapshot sync)
launcher/               local launcher (web UI to edit config and content, preview, deploy)
start-launcher.cmd      double-click to start the launcher on Windows
```

## Branches

| Branch | Contents | Purpose |
|:--|:--|:--|
| `main` | the site itself + the launcher (`launcher/`, `start-launcher.cmd`) | daily development: `pnpm dev` starts the site and the launcher together |
| `site` | the site itself only, no launcher | clean copy: for when you only need the blog, or want a clean `clone` |
| `launcher` | the launcher only, no site | editing the launcher on its own; point `LAUNCHER_ROOT` at the site checkout |

The three branches **share no common ancestor** (each has its own independent orphan
history), and that is deliberate: git simply refuses to merge the three into one another
(`fatal: refusing to merge unrelated histories`) instead of silently deleting the other
side's files the way a shared history would. Therefore:

- Do not use `git merge` to synchronise these three branches; synchronise by taking
  directories, or with the script below.
- The source of truth for content is always `main`: `site` is "`main` minus `launcher/`,
  `start-launcher.cmd`", and `launcher` is "the branch's own
  `README.md`/`package.json`/`start-launcher.cmd` + `main`'s `launcher/`".
- The pre-split history is preserved as tags: `site-pre-split` (= the original `fa47b3d`)
  and `launcher-pre-split` (= the original `b157a80`).

The sync script (run it in the `main` checkout; it rebuilds the tree with git plumbing
commands and does not touch the working tree):

```bash
node scripts/sync-branch.mjs site --dry-run      # see which files would change first
node scripts/sync-branch.mjs site --push         # update site and push
node scripts/sync-branch.mjs launcher --push     # update launcher's launcher/ directory and push
```

When the `launcher` branch is checked out at `E:\fuwari-launcher`, the script tells you to
run `git reset --hard <sha>` in that directory.

### Three directories (worktrees)

Each of the three branches is checked out in its own directory, and **they share a single
`.git`** (not three copies of the repository), so commits, pushes and the branch list are
the same set in all three places:

```
E:\fuwari\             → main      daily development: site + launcher
E:\fuwari-site\        → site      clean site (no launcher/)
E:\fuwari-launcher\    → launcher  for editing the launcher on its own
```

`git worktree list` shows every checkout. To create or recreate one of the directories:

```bash
git worktree add ../fuwari-site site
git worktree add ../fuwari-launcher launcher

# dependencies are shared with the main directory — link them with junctions instead of copying:
cmd //c mklink /J ..\fuwari-site\node_modules ..\fuwari\node_modules
cmd //c mklink /J ..\fuwari-launcher\node_modules ..\fuwari\node_modules
cmd //c mklink /J ..\fuwari-launcher\private ..\fuwari\private
```

The same branch cannot be checked out in two directories at once (git refuses), so hand
edits made in the three places can never overwrite each other.

When deleting a directory, **unlink the junction first, then remove the worktree**,
otherwise the delete follows the link into the target directory:

```bash
cmd //c rmdir ..\fuwari-site\node_modules
git worktree remove ../fuwari-site
```

Caveats per directory:

| Directory | Caveat |
|:--|:--|
| `E:\fuwari` | `pnpm dev` starts both the site (localhost:4321) and the launcher (127.0.0.1:5199) |
| `E:\fuwari-site` | to preview inside this site-only directory, use `pnpm dev:astro`; `pnpm dev` will also go looking for a launcher in `..\fuwari-launcher` |
| `E:\fuwari-launcher` | **do not run `pnpm`** here (`node_modules` is a junction, pnpm refuses to install and may try to delete it); use `node launcher/server.mjs` or double-click `start-launcher.cmd`, and point it at the site directory (`LAUNCHER_ROOT`, or the default sibling `fuwari`) |

Hand edits made in the `site` / `launcher` directories belong to that branch and are not
merged back into `main` by the sync script; conversely, running `sync-branch.mjs`
overwrites the whole `site` tree and `launcher`'s `launcher/` directory with the contents of
`main`. Make any change you want to keep in the long run in `main`.

## Post Frontmatter

Posts live in `src/content/posts/` and are validated against the schema in
`src/content.config.ts`.

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg        # relative to the post file, or an absolute / public URL
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp                  # only when the post differs from the site language
---
```

Only `title` and `published` are required. Set `draft: true` to exclude a post from
production builds while keeping it visible in development.

To keep a post's assets next to it, use a folder with an `index.md`:

```
src/content/posts/my-post/
├── index.md
└── cover.jpg
```

## Markdown Extensions

On top of [GitHub Flavored Markdown](https://github.github.com/gfm/), the build
pipeline adds:

- **Admonitions** — `note`, `tip`, `important`, `caution` and `warning` callouts.
- **GitHub repository cards** — embed a repo summary with its stars and license.
- **Enhanced code blocks** — Expressive Code features, including collapsible
  sections, line numbers and language badges.
- **Math** — inline and block formulas rendered with KaTeX.

Runnable examples of each live in the demo posts under `src/content/posts/`.

## Commands

Run all commands from the repository root:

| Command | Action |
|:--|:--|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the dev server at `localhost:4321` |
| `pnpm build` | Build the site to `./dist/`, then index it with Pagefind |
| `pnpm preview` | Serve the production build locally |
| `pnpm check` | Run `astro check` for type and template errors |
| `pnpm format` | Format `src/` with Biome |
| `pnpm lint` | Lint and auto-fix `src/` with Biome |
| `pnpm new-post <filename>` | Scaffold a new post |
| `pnpm astro ...` | Run Astro CLI commands such as `astro add` |

`pnpm build` runs `astro build` followed by `pagefind --site dist`. Search only works
against a production build, so use `pnpm build && pnpm preview` to test it.

## Deployment

The output in `dist/` is fully static and can be hosted anywhere. Vercel, Netlify and
Cloudflare Pages all build it without extra configuration — set the build command to
`pnpm build` and the output directory to `dist`, then follow the
[Astro deployment guides](https://docs.astro.build/en/guides/deploy/) for your host.

Remember to update `site` in `astro.config.mjs` first: it feeds the sitemap, RSS feed
and canonical URLs.

Continuous integration runs on every push and pull request through
[`.github/workflows/build.yml`](../.github/workflows/build.yml) and
[`.github/workflows/biome.yml`](../.github/workflows/biome.yml).

## Credits

Based on [Fuwari](https://github.com/saicaca/fuwari) by
[saicaca](https://github.com/saicaca), which provided the original design and
implementation. Upstream is tracked through the `upstream` git remote.

Bundled fonts are [Roboto](https://fonts.google.com/specimen/Roboto) and
[JetBrains Mono](https://www.jetbrains.com/lp/mono/); icons come from
[Iconify](https://iconify.design/).

## License

[MIT](../LICENSE) — the original copyright notice is retained.
