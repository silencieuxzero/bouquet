# Migration: pending decisions

Items found while filling the migration gaps from the original
[Firmamento](https://luoshulv.netlify.app/) blog into this Fuwari build
(`E:\fuwari`). Everything listed here was either **skipped on purpose**, is a
**divergence from the original**, or is a **call only the site owner can make**.

Scope rule applied throughout: **no stylesheet from the original site was
imported**, the current site's CSS was not broken, and any item that could not be
done with the current site's existing CSS was skipped rather than forced.

---

## 1. The most important finding: the domain still serves the OLD site

As of this audit `https://luoshulv.netlify.app/` is still the **original
Firmamento site** — this repository has never been deployed to it.

| Route | old site (live) | this build |
|---|---|---|
| `/` | 200 (`<title>Firmamento</title>`, Astro v7.0.7) | 200 |
| `/blog/` | 200 | 301 → `/archive/` |
| `/categories/` `/tags/` | 200 | 200 (index pages, newly built) |
| `/links/` `/tutorials/` `/repos/` `/notes/` `/gallery/` | 200 | 200 |
| `/games/daosu/` | 200 | 200 |
| `/archive/` | **404** | 200 |
| `/posts/` | **404** | **404** (no listing route; nothing links to it) |

Consequence: **the 15 legacy `/blog/<slug>/` permalinks and 18 taxonomy URLs are
live and indexed today.** Cutover without redirects would be a real regression, not
a theoretical one. The `site:` value in `astro.config.mjs` is therefore correct as
it stands and was deliberately left unchanged.

---

## 2. Will break after cutover — needs your decision  ★ highest priority

The old site's sitemap (`/sitemap-0.xml`, 30 URLs) is the authoritative list of
what is indexed. Checked against this build:

### 2a. 18 taxonomy detail URLs — RESOLVED, plus two follow-ups for you

These would have hard-404'd:

```
/categories/创作/  /categories/教程/  /categories/设定/  /categories/随笔/
/tags/Astro/  /tags/CSS/  /tags/Fandom/  /tags/IF线/  /tags/Minecraft/
/tags/Wikitext/  /tags/人物/  /tags/创作/  /tags/原创/  /tags/后室/
/tags/教程/  /tags/模板/  /tags/设定/  /tags/随笔/
```

The original site had a **page per category and per tag**; this theme instead
routes taxonomy to `/archive/?tag=…` / `/archive/?category=…`. A redirect table was
rejected: `/archive/` filtering is client-side and **exact-match**
(`src/components/ArchivePanel.svelte:52` —
`post.data.tags.some((tag) => tags.includes(tag))`), so each redirect would have to
reproduce the stored casing, and the CJK names are percent-encoded.

Instead, real routes were added — `src/pages/categories/[category].astro` and
`src/pages/tags/[tag].astro`, enumerating `getCategoryList()` / `getTagList()` via
`getStaticPaths()`. All 18 URLs now render. Two follow-ups:

**2a-i. ~~The new detail pages are orphaned (nothing links to them).~~ — RESOLVED**

*Decision (2026-10): point the helpers at the new routes.* `getCategoryUrl()` /
`getTagUrl()` in `src/utils/url-utils.ts` now emit `/categories/<name>/` and
`/tags/<name>/`, so PostMeta, the sidebar Tags widget and both index pages link
straight to the detail pages. Verified in the built output: zero
`/archive/?tag=` / `?category=` query links remain in `dist/`; the
uncategorized fallback still routes to the archive filter.
(Commit `bde7bca`.)

**2a-ii. Latin tag casing flips, and needs a check after the first real deploy.**
Tag routes are emitted with the **stored** casing (`/tags/CSS/`, `/tags/Astro/`,
`/tags/Fandom/`, `/tags/Minecraft/`, `/tags/Wikitext/`). The live site's canonical
form is lower-case: `/tags/CSS/` 301s to `/tags/css/`, which is the URL in its
sitemap. Testing the live host shows this is Netlify's case-correction, not the
site's own rule — it only redirects when a case-insensitive match exists
(`/ABOUT/` → 301 `/about/`, but `/NOTAREALPATH/` → plain 404), and it folds
mid-path segments too (`/Tags/css/` → 301 `/tags/css/`).

Expected outcome after cutover: `/tags/css/` resolves via a case-correction 301 to
`/tags/CSS/`, so nothing 404s — but the canonical casing *flips* from what search
engines have indexed. Worth confirming on the real deploy; if you want the indexed
lower-case form kept as canonical, the route should lower-case its param instead.

The CJK tags are unaffected.

### 2b. The 15 legacy `/blog/<slug>/` permalinks

Handled: `public/_redirects` + a matching `redirects` map in `astro.config.mjs`
(301 → `/posts/<slug>/`). End-to-end verified 15/15 (including the CJK slug
`/blog/commoncss解释文件/`). `/blog/` itself → `/archive/` because the original
`/blog` index has no counterpart here.

---

## 3. Divergences from the original — confirm or correct

| # | Item | Original | Here | Note |
|---|---|---|---|---|
| D1 | **Licence** | `CC-BY-SA 3.0` (`/licenses/by-sa/3.0/`) in the footer | `CC BY-NC-SA 4.0` (`config.ts:98`) as a per-post block | **RESOLVED (2026-10): keep 4.0 and the per-post licence block.** The original had *no* non-commercial restriction; the author chose the 4.0 terms deliberately. |
| D2 | Per-post licence block | — | rendered on every post **and** note | The original has none (0 hits for `license-container` / `creative-commons` in every fetched old post page). This is an addition, not a migration. |
| D3 | Context menu | 9 actions + a "导航" header row; "blog" → `/blog` | the same 9 actions, no header row; "archive" → `/archive/` | `/blog` has no listing route here, so that item was repointed rather than dropped. |
| D4 | Copy confirmation | `✓ 已复制` text | a checkmark **icon** | No `ctxCopied` key exists in this theme; the icon avoids inventing one. |
| D5 | Theme menu item | two labels (`ctx.light` / `ctx.dark`) | one label + a sun/moon icon that swaps | Same reason. |
| D6 | `ctxNav` header | present | omitted | Same reason. |
| D7 | New-page subtitles | — | `/tutorials/` "一些实用教程的集合" and `/repos/` "…" come **raw out of JSON**, not through `i18n()` | Titles are translated; these subtitle strings are data. Non-Chinese locales would still show Chinese. |
| D8 | Image-host brand | translated per locale in the original | kept as `蜜蜂图床` in all locales | A brand name; translating it was judged wrong, but say the word and it can be keyed. |
| D9 | Search | **no pagefind**; a client-side title filter on `/notes/` and `/tutorials/` only | pagefind site-wide; `/tutorials/` keeps a filter, `/notes/` has **none** | See §5. |
| D10 | Mobile long-press context menu | not implemented upstream either | not implemented | Verified: the original `ctx.js` has no long-press code and relies only on the native `contextmenu` event. Parity, not a gap. |
| D11 | Taxonomy page headings | `分类：教程` / `共 6 篇文章` | `分类 · 教程` / `6 篇文章` | Built from existing keys (`I18nKey.categories` + `I18nKey.postsCount`); the separator and wording differ from the original. Matching it exactly needs 2 new keys × 10 locales. |
| D12 | Original detail pages had a sidebar category widget | present | not ported | This theme's sidebar widgets already cover it. |
| D13 | Favicon set | 2 tags: `/favicon.svg` + `/favicon.ico` | 6 tags: the same 2 **plus** 4 PNG sizes (`32/128/180/192`) | Same artwork, purely additive. No `type` attribute is emitted (Fuwari's `Favicon` type has no such field). The `180x180` entry is an apple-touch-icon size the original lacked. |
| D14 | Dark-mode favicon | — | none | This blog has one icon set, so no entry sets `theme` and no `prefers-color-scheme` gate is emitted. |
| D15 | `public/favicon.svg` is a raster wrapped in SVG | — | same but wrapped | It is one `<image xlink:href="data:image/png;base64,…">` whose payload is pixel-identical to `logo-256.png` (0/65536 diffs). It renders correctly but does not actually scale. |

---

## 4. Original features this build does NOT have — DECIDED: will NOT be built

These exist on the live old site and were **not** requested in the migration
brief, so they were inventoried rather than built. **The author has decided
(2026-10) that none of these will be implemented** — this section is a record,
not a backlog.

| Feature | Old-site evidence |
|---|---|
| Home banner: `Firmamento` + "欢迎来到属于我的星空，坐在这里陪我一会吧~" | `.home-banner`, `.banner-title`, `#banner-subtitle` |
| Latest-post block | `article.latest-post` |
| Author picks / featured posts | `section.featured-posts` |
| Site-tools column (announcement, stats, categories, nav) | `aside.site-tools`, `div.tool-block` |
| FAB that collapses TOC / reader / music widgets | `#fab-root`, `#fab-btn` ("更多功能" / "收起") |
| Reading-progress bar | `.scroll-progress` |
| Reveal-on-scroll animations | `IntersectionObserver` over `.post-card, .friend-card, .gallery-item, .tutorial-card, .repo-card, .latest-post, .featured-posts` |
| Avatar rotation on hover | script-driven `requestAnimationFrame` spin |
| Reader-mode toggle | `.reader-fixed-wrapper` (hidden without `.prose`) |
| `is-scrolled` header state | `documentElement.classList.toggle("is-scrolled", …)` |
| Encrypted-post badge as `加密` pill on the home lists | `.password-badge` — **this one WAS built** (task `t14`, via i18n) |

Note: a "typewriter" effect was suspected but has **no evidence** — the literal
occurs 0 times in the live page. Avatar rotation does exist but as script logic,
not a class name.

---

## 5. pagefind coverage

`pagefind` indexes pages carrying `data-pagefind-body`; once any page has it,
**pages without it are excluded**. Before task `t18` the index held 26 pages:
`/about/` + the 10 notes + the 15 posts.

Added in task `t18`: `/tutorials/`, `/repos/`, `/links/` — the pages with genuinely
unique body text. The index is now **29 pages**.

Deliberately **not** indexed: `/`, `/2/`…, `/archive/`, `/categories/`, `/tags/`,
`/gallery/`. These are aggregations whose titles ("归档", "分类", "标签") would
compete with the real content in search results.

The original site had **no pagefind at all**, so this is an enhancement — nothing
here is "restoring" original behaviour.

---

## 6. Housekeeping — no decision strictly needed, listed for completeness

| # | Item | Detail |
|---|---|---|
| H1 | Dead dependency | `package.json:30` still lists `@fontsource/roboto ^5.2.9`; the import was removed and only a comment references it. `Roboto` survives only as one entry in Tailwind's fallback stack. |
| H2 | Dead images | `public/blog-placeholder-{1,2,3,about}.jpg` — 4 files, ~115 KB, **zero** references in `src/`. |
| H3 | Stale doc | `docs/migration-from-firmamento.md:30-32` still says the tutorials page, friend-links page, repos page and the `daosu` game were *not* migrated, and that categories/tags are merged into `/archive/`. All of those now exist as real pages. |
| H4 | Six draft posts | `draft.md`, `expressive-code.md`, `markdown.md`, `markdown-extended.md`, `video.md`, `guide/index.md` — all Fuwari sample content, all git-tracked; five were flipped `false`→`true` during migration. None is the author's own draft, none was deleted. |
| H5 | `.gitignore` | Does not ignore `.agent-teams/`, `.tmp-*/`, `.workbuddy/` — agent/scratch directories. |
| H6 | `vercel.json` | Contains `{}` and is git-tracked. Harmless, but it implies a Vercel deployment that does not exist (the site is Netlify). |
| H7 | Upstream placeholder favicons kept | `src/constants/icon.ts` still defines 8 `favicon-{light,dark}-{32,128,180,192}.png` files added by Fuwari's original 2023 commit. They are now unreachable (config populates the array, so the fallback never fires) but were deliberately not deleted — they are the migration seed's only survivors and keep the fallback honest. |
| H8 | Unwired asset | `public/favicon/logo-256.png` is a 256×256 full logo, not an icon size, so it was left out of the favicon array on purpose. |
| H9 | Truncated fetch artifacts | `.tmp-fetch/dl_favicon_svg` is truncated (no closing `</svg>`, Chrome rejects it) and `.tmp-fetch/dl_favicon_png` is Netlify's HTML error page, not an image. Both are scratch files; the live `/favicon.svg` itself also truncates on download (`Content-Length: 2305304`). Use `.ico` if re-fetching — it is verified complete. |

---

## 7. Authoritative build verification

All figures below come from a real `pnpm run build` (`astro build && pagefind --site dist`),
not from a dev server — the dev server renders `draft: true` posts, so its taxonomy
counts are wrong (it reports "6 分类 · 21 篇文章"; production is 4 / 15).

| Check | Result |
|---|---|
| Build | exit 0, `dist/` rebuilt |
| pagefind | **29** pages indexed, up from 26 (added `/tutorials/`, `/repos/`, `/links/`) — `dist/pagefind/pagefind-entry.json` `page_count: 29`, and 29 `*.pf_fragment` files on disk |
| `/categories/` | **`4 分类 · 15 篇文章`** — matches the original exactly |
| `/tags/` | **`14 标签 · 15 篇文章`** — matches the original exactly |
| 18 legacy taxonomy URLs | all 18 present in `dist/` as real `index.html` files |
| 15 legacy `/blog/<slug>/` | all 15 redirect stubs in `dist/blog/`; each carries `<meta name="robots" content="noindex">` and a refresh to `/posts/<slug>/` |
| `/blog/` stub | refreshes to **`/archive/`** (the `trailingSlash` edge case did not materialise) |
| `dist/_redirects` | byte-identical to `public/_redirects` (2213 B) |
| sitemap | 56 URLs, 20 of them taxonomy; **0** `/blog/` entries (redirect stubs do not pollute it) |
| `og:image` | `…/scp.jpg` on the home page, `…/LZH1958.jpg` on `/posts/wiki/` — per-post covers now reach the head |
| favicon | exactly 6 `<link rel="icon">` tags with real artwork |
| notes | 10 in `/notes/`, 10 in `/archive/`, 5 on the home page, 10 in `rss.xml` (25 feed items = 15 posts + 10 notes) |
| upstream CSS | no `--gray-light` / `--gray-dark` / `--radius-card` / `--box-shadow` / `rgba(var(--` anywhere in `dist/_astro/*.css` |
| upstream class names | 0 hits in the built HTML of `/categories/教程/`, `/tags/CSS/`, `/links/`, `/repos/`; `/tutorials/` matches only on its own `data-tutorial-card` attribute, not a class |

---

## 8. What WAS completed

P0, the nav 「更多」 dropdown + custom context menu, P2 and P3 as briefed:

- **P0** — 404 page; `/blog/:slug` → `/posts/:slug` redirects; `/links/`;
  `/tutorials/`; `/repos/`; `/games/daosu/`; `/categories/` + `/tags/` index pages;
  and the per-name `/categories/<name>/` + `/tags/<name>/` detail pages that keep
  the 18 legacy taxonomy URLs alive.
- **Nav** — 「更多」 group (links, tutorials, repos, games, categories, tags),
  working on both desktop and the mobile panel.
- **Context menu** — 9 actions, keyboard-navigable, swup-safe. A capture-phase
  `blur` listener bug that silently broke keyboard nav and all 6 JS-only actions
  was found and fixed (`ContextMenu.astro:386-394`).
- **P2** — `og:image` / `twitter:image` / JSON-LD image (previously **always
  empty**), canonical, sitemap link, own favicon, Atkinson Hyperlegible body font.
- **P3** — encrypted badge, footer image-host credit, i18n sweep (87 keys × 10
  locales), notes into archive/home/RSS with optional covers, pagefind on list
  pages, placeholder covers replaced in all 15 live posts.

**Zero** original-site CSS was imported. Every page carries **0** `<style>` blocks
that came from upstream; the only `<style>` blocks are pre-existing theme files or
migration-era files that were rewritten against this site's own tokens.
