# Launcher Contract

A local web launcher for this repo: a Node HTTP server on 127.0.0.1:5199 that reads
and writes repo files, plus a zero-build browser UI. This file is the interface
contract between the backend modules and the UI. Do not change this file; raise a
conflict to the dispatcher instead.

## Hard constraints

- Node 22 (v22.22.3), ESM only, files end in .mjs.
- **No new npm dependencies.** Standard library plus packages already in package.json
  (the typescript compiler API and markdown-it are available and already installed).
- All launcher files live under launcher/. Never modify files under src/ or scripts/;
  src files change only through the runtime API paths described below.
- Tab indentation, double quotes for JS strings, UTF-8. UI copy is Chinese.
- Bind 127.0.0.1 only. No auth.
- Runtime state (backups, trash, logs, pid) goes to .launcher/ at repo root.

## Layout

    launcher/
      server.mjs              # entry: server shell, module loader, static UI, boot
      core/http.mjs           # body readers, JSON envelope helpers, FailError
      core/router.mjs         # method+path matching, route registry
      core/paths.mjs          # repo root, safe path resolution, whitelists
      core/backup.mjs         # snapshot + list + restore
      core/config-ast.mjs     # read / patch src/config.ts via typescript compiler API
      core/config-schema.mjs  # field metadata for the UI
      core/data-json.mjs      # gallery.json / tutorials.json read+write
      core/upload.mjs         # raw-body file upload into whitelisted dirs
      core/deploy.mjs         # git status / diff / commit / push
      core/preview.mjs        # astro dev child process management
      modules/*.routes.mjs    # route registrations (auto-loaded, sorted)
      content/collections.mjs # collection discovery
      content/frontmatter.mjs # minimal frontmatter parse / key-level patch
      content/articles.mjs    # article list/read/create/update/archive
      content/encryption.mjs  # runs scripts/encrypt-post.mjs
      ui/index.html, app.mjs, api.mjs, style.css, views/*.mjs
      test/*.mjs              # optional node:test unit tests

## Server shell API (server.mjs + core/router.mjs)

Every file in launcher/modules/ is imported in sorted filename order and must export
exactly: export function register(app) { ... }

The app object exposes:

- app.get(pattern, handler) / app.post / app.put / app.delete. pattern is an absolute
  path such as /api/config or /api/content/:collection/:slug.
- A handler receives one ctx object:
  - ctx.params (string map), ctx.query (URLSearchParams), ctx.req, ctx.res, ctx.headers
    (lowercased incoming headers)
  - ctx.json(value) -> 200 success envelope; ctx.json(value, status)
  - ctx.fail(status, code, message, details?) -> error envelope, returns immediately
  - await ctx.readJson({ limit = 32 * 1024 * 1024 }) -> parsed JSON body
  - await ctx.readRaw({ limit = 64 * 1024 * 1024 }) -> Buffer
- Handlers may be async. A thrown error becomes 500 with code internal. Throwing
  FailError (exported from core/http.mjs, constructor(status, code, message, details))
  produces the matching envelope instead.

Envelope: success {"ok":true,"data":<value>}, failure
{"ok":false,"error":{"code":string,"message":string,"details":any}}.

Static UI: every GET that is not under /api/ is served from launcher/ui/ (index at /),
with correct Content-Type, no path traversal, 404 otherwise. /api/* with no matching
route -> 404 envelope with code not-found.

## Endpoint surface (all under /api)

### Config (src/config.ts)
- GET /api/config -> data {site, nav, profile, license, expressiveCode, music,
  bannerHeights}: the evaluated literal values of siteConfig, navBarConfig.links,
  profileConfig, licenseConfig, expressiveCodeConfig, musicConfig, bannerHeights.
  Values that are not plain literals are reported as refs: {"__ref":"LinkPreset.Home"}
  (same for I18nKey.*). Anything else unevaluable:
  {"__ref":"<source text>","__unresolved":true}.
- GET /api/config/schema -> {fields:[{path,label,type,group,unit?,options?,min?,max?}]}.
  type: string | text | number | boolean | enum | json | ref. Keep the list in
  core/config-schema.mjs. Cover at least: siteConfig.title, subtitle, lang,
  backgroundImage, themeColor.hue, themeColor.fixed, banner.enable, banner.src,
  banner.position, banner.height, banner.homeHeight, banner.credit.enable,
  banner.credit.text, banner.credit.url, toc.enable, toc.depth, favicon (json),
  navBarConfig.links (json), profileConfig (json), licenseConfig (json),
  expressiveCodeConfig.theme, musicConfig (json).
- POST /api/config/patch body {edits:[{path, value}], dryRun?:boolean} ->
  {changed:[path...], backupId, diff}. dryRun computes the diff without writing.
  Everything else in src/config.ts must stay byte-identical (comments, tabs, order).

Path grammar: <root>.<prop>(.<prop>|[<index>])* where <root> is one of siteConfig,
navBarConfig, profileConfig, licenseConfig, expressiveCodeConfig, musicConfig.
Examples: siteConfig.banner.height, navBarConfig.links[3].name,
musicConfig.songs[0].title. Whole arrays/objects may be replaced (musicConfig.songs,
navBarConfig.links). value is any JSON value, or {"__ref":"LinkPreset.Home"} to emit
a source expression.

Implementation rule: parse with the typescript package, locate the property assignment
or array element node, and replace ONLY that node text range with the serialized value
(tabs, one tab per nesting level, matching the file style). After writing, re-parse and
confirm exactly the requested paths changed and that every other byte is unchanged; on
mismatch restore the backup and fail with code verify-failed.

### JSON data (src/data/*.json)
- GET /api/data/:name (name in gallery|tutorials) -> parsed JSON as stored.
- PUT /api/data/:name body = full JSON document -> {backupId}. Pretty-print with tabs
  and a trailing newline. Reject non-object bodies and unknown names.

### Content
- GET /api/content/collections -> [{key,dir,label}] for posts/essay/oc/spec.
- GET /api/content/:key -> [{slug,path,title,published,draft,encrypted,size,mtime}].
- GET /api/content/:key/:slug -> {slug,path,frontmatter,body,raw}.
- POST /api/content/:key body {slug,frontmatter?,body?} -> {path} (409 exists).
- PUT /api/content/:key/:slug body {frontmatter?,body?} -> {backupId,changedKeys}.
  Frontmatter patching is key level: only changed/added keys are rewritten in place,
  untouched lines stay byte-identical, a key whose value is null is removed.
- POST /api/content/:key/:slug/archive -> move the file into .launcher/trash/ ->
  {archivedTo}. No hard delete endpoint.
- POST /api/content/preview body {body} -> {html} rendered by markdown-it
  (html:false, linkify:true; KaTeX/highlighting out of scope for v1).
- POST /api/content/encrypt body {slugs:[...], password?, statsOnly?:boolean} ->
  spawns node scripts/encrypt-post.mjs <slugs...> [--stats-only] with POST_PASSWORD in
  env when a password is given, cwd = repo root, timeout 120s -> {code,stdout,stderr}.
  Non-zero exit -> 409 encrypt-failed with output in details.

### Uploads and files
- POST /api/upload: raw body = file bytes; headers x-filename (URI-encoded) and x-dir
  (one of public, public/music, public/favicon, src/assets/images), optional
  x-overwrite: 1 -> {path, bytes, replaced}. Existing file without x-overwrite ->
  409 exists. Sanitize: strip / \ : * ? " < > |, reject empty names and any ..; keep
  unicode; reject bodies over 64 MiB.
- GET /api/files?dir=public -> [{name,path,bytes}] for whitelisted dirs only (LIST_DIRS = upload dirs + private/source, read-only).

### Backups
- GET /api/backups -> [{id,createdAt,files:[{path,bytes}],reason}], newest first, max 50.
- POST /api/backups/:id/restore -> restores every file in that snapshot (snapshotting
  current content first) -> {restored:[path...]}.

### Deploy
- GET /api/deploy/status -> {branch,remote,files:[{path,status}],ahead,behind,clean}.
- GET /api/deploy/diff?path=<repo-relative> -> {diff} (untracked file: new-file header
  plus the first 200 lines).
- POST /api/deploy/commit body {message, paths?} -> {commit, files} (409 nothing-to-commit).
- POST /api/deploy/push -> {code,stdout,stderr} (timeout 180s, non-zero -> 409 push-failed).
  Every git command: git --no-pager, cwd = repo root, env GIT_TERMINAL_PROMPT=0.

### Preview
- GET /api/preview/status -> {running,url,pid,lines:[...last 200 log lines]}.
- POST /api/preview/start -> spawn pnpm astro dev --port 4321 --host 127.0.0.1,
  capture output, wait until http://127.0.0.1:4321/ answers (max 90s) ->
  {running,url,pid}; on failure 409 preview-failed with the log tail.
- POST /api/preview/stop -> kill the child tree -> {running:false}.

### Launcher UI settings (.launcher/ui-settings.json)
- GET /api/ui-settings -> {theme,accent,fontSize,density,radius,showIcons}. Missing file
  or unparsable JSON falls back to the defaults; unknown keys are dropped.
- PUT /api/ui-settings body = partial settings, merged onto the stored value, written
  atomically (tmp + rename) -> the full merged object. Invalid values ->
  400 settings-invalid with details {key, allowed?/min?/max?}.
- Allowed values: theme light|dark|system; accent blue|cyan|indigo|teal|slate;
  fontSize 12..20 (integer); density compact|normal|relaxed; radius square|soft;
  showIcons boolean. Defaults: light / blue / 15 / normal / square / true.

## Frontmatter subset

Only top-level key: value lines between the --- fences are parsed. Supported value
forms: double-quoted string, single-quoted string, bare scalar, true/false, number, ISO
date (kept as a string), flow arrays like [a, "b c"]. Block sequences (- item) are
read for listing but rewritten as flow arrays only when that key is edited. Unknown or
unsupported lines are preserved verbatim; if a key that must be edited cannot be
parsed, fail with code frontmatter-unsupported instead of guessing.

## Paths

- `CODE_DIR` — the checkout that holds this launcher (launcher/ui, launcher/modules).
- `ROOT` — the repository the launcher reads and writes; `CODE_DIR` unless
  `LAUNCHER_ROOT` names another checkout. Every repo-relative path resolves against
  `ROOT`; UI assets and route modules always come from `CODE_DIR`, so one copy of the
  launcher can drive another checkout.

## UI conventions

- Static files under launcher/ui/, native ES modules, fetch to /api/*, no framework, no
  build step, no CDN assets (offline-safe): plain CSS only.
- Chinese labels. Left sidebar sections: 站点外观 / 图片 / 导航与资料 / 音乐与画廊 /
  文章 / 加密 / 数据 / 备份 / 部署 / 预览 / 设置. Sidebar icons are inline SVG from the
  site's own dependency @iconify-json/material-symbols (Material Symbols, 24x24,
  fill=currentColor), baked into launcher/ui/icons.mjs — no icon font, no CDN, no new
  dependency; unknown keys fall back to a text glyph.
- Appearance is variable-driven: theme.mjs writes data-theme / data-accent on <html>
  plus --font-size / --density / --radius / --nav-icon-display, and style.css reads
  only those. Default look is a white Metro style (square corners, thin borders,
  accent bars). Anything visual must go through theme.mjs so 设置 keeps working.
- Every write action shows the returned diff (or the changed field list) and offers
  rollback through the produced backupId (backups endpoint).
- Errors render error.message plus error.code; never silent-fail.
- The bottom status toast (announce()) clears itself 5s after being set, with a 450ms
  fade-out. Messages describing a state the user must keep seeing (running dev
  server, a pending start) pass {sticky:true} and stay until replaced or cleared.
