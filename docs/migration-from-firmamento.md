# Migration from Firmamento

Content, identity, and selected visual features were migrated from
`silencieuxzero/Firmamento` into this Fuwari-based site.

## What moved

| Source (Firmamento) | Destination (this repo) |
|---|---|
| `src/content/blog/*.md` (15 posts) | `src/content/posts/*.md` |
| `src/content/notes/*.md` (10 notes) | `src/content/notes/*.md` (new collection) |
| `config/author.toml` (avatar, name, bio, location, age) | `src/config.ts` → `profileConfig` |
| `config/site.toml` (`bg_image`) | `src/config.ts` → `siteConfig.backgroundImage` |
| `config/music.toml` (7 songs) | `src/config.ts` → `musicConfig` |
| `config/gallery.toml` (6 + 15 images) | `src/data/gallery.json` |
| `public/*.{png,jpg}` | `public/` (same names, so image paths resolve) |
| `public/music/*` | `public/music/` (8 files, ~20 MB) |
| `public/长征机头像1.png` | `src/assets/images/avatar.png` |

Post bodies are byte-for-byte identical to the originals. Only frontmatter was
translated, because the two themes use different field names:

| Firmamento | Fuwari |
|---|---|
| `pubDate` | `published` |
| `updatedDate` | `updated` |
| `heroImage` | `image` |
| `password` (SHA-256) | `encrypted: true` (see below) |

Not migrated (theme-specific structure, no equivalent here): the tutorials page,
friend-links page, GitHub repos page, and the `daosu` game. Categories and tags
are merged into Fuwari's `/archive/` page.

## Visual features

### Full-page background image

Set `siteConfig.backgroundImage` (default `/scp.jpg`). The rule is emitted from
`src/layouts/Layout.astro` and washes the image with the page colour so text
stays readable in both themes. Remove the key to disable it.

### Music player

`src/components/widget/MusicPlayer.astro`, mounted in `Layout.astro` outside the
Swup container so playback survives client-side navigation. The playlist comes
from `musicConfig` in `src/config.ts`; audio files live in `public/music/`.
Supports playlist, prev/next, seek, volume, and three loop modes.

### Gallery

`/gallery/` renders `galleryConfig` from `src/data/gallery.json` with a lightbox
and a per-image copyright dialog.

`/gallery/sub-gallery/` is password-protected **and** its image list is
encrypted — the list is not present in the repository or in the built output.
See below.

## Encryption

Firmamento protected posts by comparing a SHA-256 hash at request time. Fuwari is
a fully static site, so that approach cannot work here — and because the original
scheme kept the plaintext in Git, it offered no protection in a public repo.

This site instead encrypts content **before** it is committed:

- Scheme: PBKDF2-SHA256 (210,000 iterations) → AES-256-GCM
- The password never enters the repo, the build, or CI
- Readers type the password in the browser; decryption happens locally via
  WebCrypto. Nothing is sent to a server.
- Decryption helpers: `src/utils/webcrypto.ts`

| Encrypted payload | Ciphertext | Plaintext source (git-ignored) |
|---|---|---|
| `personoc`, `yanchui`, `story-4`, `story-br`, `luoshulv-bc` | `public/encrypted/<slug>.enc` | `private/source/<slug>.md` |
| Sub-gallery image list | `public/encrypted/sub-gallery.enc` | `private/source/sub-gallery.json` |

### Re-encrypting

The shipped ciphertext was generated with the real password; the placeholder it
originally used no longer decrypts anything. After changing the password, or after
editing a plaintext source, regenerate the affected payloads:

```bash
# posts (all five share one password)
POST_PASSWORD='<the real password>' pnpm encrypt personoc yanchui story-4 story-br luoshulv-bc

# sub-gallery image list (may use its own password)
POST_PASSWORD='<the gallery password>' pnpm encrypt-file private/source/sub-gallery.json
```

The password is never stored in the repo, so it cannot be recovered from here —
keep it wherever the plaintext is backed up, or the ciphertext becomes unreadable.

To add a new encrypted post:

1. Write the plaintext to `private/source/<slug>.md` (already git-ignored).
2. Set `encrypted: true` in the post's frontmatter and leave the body empty.
3. Run `pnpm encrypt <slug>`.

## Caveats

- The ciphertext is public. Protection rests entirely on password strength.
- An encrypted post's **title and description** still appear in the listing pages
  and RSS; only the body is secret.
- `docs/*.md` and text posts still contain the original site's *documentation*,
  including example config such as `password = "30days"`. Those are code-fence
  samples with placeholder values, not live credentials — but the real
  sub-gallery password is different from that old sample.
- `src/content/posts/firmamento.md` is the original theme's own customization
  guide. It documents Firmamento's TOML config, which does not apply to this
  site; treat it as a historical document.
