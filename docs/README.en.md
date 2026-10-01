# 🍥 Fuwari

![Node.js >= 22.12](https://img.shields.io/badge/node.js-%3E%3D22.12-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
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
- **pnpm ≥ 9**

The exact pnpm version is pinned through the `packageManager` field, so a compatible
release is selected automatically. The `preinstall` script rejects npm and Yarn.

## Getting Started

```sh
pnpm install     # install dependencies
pnpm dev         # start the dev server at http://localhost:4321
```

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
```

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
