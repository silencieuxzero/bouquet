# 🍥 Fuwari

![Node.js >= 22.12](https://img.shields.io/badge/node.js-%3E%3D22.12-brightgreen)
![pnpm >= 10](https://img.shields.io/badge/pnpm-%3E%3D10-blue)
![Astro 7](https://img.shields.io/badge/Astro-7-ff5d01?logo=astro)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![License MIT](https://img.shields.io/badge/license-MIT-green)

Blog statis pribadi yang dibangun dengan [Astro](https://astro.build), di-fork dari
template [Fuwari](https://github.com/saicaca/fuwari) dan diperbarui ke perangkat
tooling yang lebih baru.

🌏 Bahasa lain:
[**English**](README.en.md) /
[**中文**](../README.md) /
[**日本語**](README.ja.md) /
[**한국어**](README.ko.md) /
[**Español**](README.es.md) /
[**ไทย**](README.th.md) /
[**Tiếng Việt**](README.vi.md)

## Tentang

Repositori ini awalnya adalah salinan Fuwari dan kini berjalan di atas stack yang lebih
baru daripada template aslinya:

| Aspek | Template asli | Repositori ini |
|:--|:--|:--|
| Astro | 5.x | **7.3** |
| Tailwind CSS | 3.x melalui `@astrojs/tailwind` | **4.x melalui `@tailwindcss/vite`** |
| Koleksi konten | `src/content/config.ts` lama | **Content Layer API** (`src/content.config.ts`) |
| Svelte | 5.39 | **5.57** |

Karena `@astrojs/tailwind` tidak pernah mendukung Astro 6 ke atas, migrasi ke Tailwind
CSS 4 menjadi wajib, bukan pilihan. Konfigurasi gaya kini ditulis dengan pendekatan CSS
terlebih dahulu di [src/styles/app.css](../src/styles/app.css), bukan `tailwind.config.js`.

Konten blog dan pengaturan situs masih memakai nilai bawaan template — sunting
[src/config.ts](../src/config.ts) untuk menjadikannya situs Anda.

## Fitur

- Dibangun dengan Astro dan Tailwind CSS, memakai Svelte untuk komponen interaktif
- Transisi halaman yang mulus melalui [Swup](https://swup.js.org/)
- Pencarian teks lengkap di sisi klien melalui [Pagefind](https://pagefind.app/)
- Mode terang / gelap dengan warna aksen yang dapat diubah, disimpan di `localStorage`
- Tata letak responsif, menampilkan daftar isi pada layar lebar
- Penyorotan sintaks kode melalui [Expressive Code](https://expressive-code.com/),
  lengkap dengan label bahasa, tombol salin, dan blok yang dapat dilipat
- Penulisan rumus matematika dengan [KaTeX](https://katex.org/)
- Markdown tambahan: admonition dan kartu repositori GitHub
- Lightbox gambar melalui [PhotoSwipe](https://photoswipe.com/), dioptimalkan dengan Sharp
- Feed RSS, sitemap, dan `robots.txt` dibuat saat build
- Teks antarmuka diterjemahkan ke 10 bahasa

## Kebutuhan

- **Node.js 22.12.0 atau lebih baru**
- **pnpm 10 atau lebih baru**

Versi pnpm yang tepat dipatok melalui kolom `packageManager`, sehingga versi yang
kompatibel dipilih secara otomatis. Skrip `preinstall` menolak npm dan Yarn.

## Memulai

```sh
pnpm install     # pasang dependensi
pnpm dev         # jalankan server pengembangan di http://localhost:4321
```

`pnpm dev` juga ikut menjalankan launcher lokal: pertama periksa apakah repositori ini punya
`launcher/server.mjs`, lalu variabel lingkungan `LAUNCHER_HOME` dan direktori sejajar
`../fuwari-launcher`, mana yang ditemukan dipakai; bila tidak ada sama sekali hanya situs yang
dijalankan, tanpa galat. Ingin menjalankan situs saja, gunakan `pnpm dev:astro` atau
`pnpm dev --no-launcher` (bisa juga dengan `LAUNCHER=0`).

Selanjutnya:

1. Sunting [src/config.ts](../src/config.ts) —— judul situs, subjudul, bahasa, hue tema,
   banner, daftar isi, dan favicon.
2. Jalankan `pnpm new-post <filename>` untuk membuat draf di `src/content/posts/`.
3. Tetapkan `site` dan `base` di [astro.config.mjs](../astro.config.mjs) sebelum deploy.

## Struktur Proyek

```
src/
├── assets/         gambar yang diimpor komponen
├── components/     komponen Astro dan Svelte (control/, misc/, widget/)
├── constants/      konstanta tata letak, ikon bawaan, preset tautan navigasi
├── content/        artikel blog dan koleksi halaman mandiri
├── i18n/           teks antarmuka, satu modul per bahasa
├── layouts/        Layout.astro dan MainGridLayout.astro
├── pages/          rute: beranda, arsip, about, artikel, RSS, robots.txt
├── plugins/        plugin remark / rehype dan Expressive Code
├── styles/         app.css (entri Tailwind) dan stylesheet per fitur
├── types/          tipe TypeScript bersama
└── utils/          kueri konten, utilitas URL dan tema
src/content.config.ts   definisi koleksi (Content Layer API)
scripts/                skrip pengembangan: dev.mjs (menjalankan situs + launcher), sync-branch.mjs (menyinkronkan cuplikan cabang)
launcher/               launcher lokal (antarmuka web untuk mengubah konfigurasi dan konten, pratinjau, deploy)
start-launcher.cmd      klik dua kali untuk menjalankan launcher di Windows
```

## Cabang

| Cabang | Isi | Kegunaan |
|:--|:--|:--|
| `main` | situs + launcher (`launcher/`, `start-launcher.cmd`) | pengembangan harian: `pnpm dev` menjalankan situs dan launcher sekaligus |
| `site` | hanya situs, tanpa launcher | salinan murni: dipakai bila hanya butuh blog, atau ingin `clone` tetap bersih |
| `launcher` | hanya launcher, tanpa situs | mengubah launcher tersendiri; arahkan `LAUNCHER_ROOT` ke checkout situs |

Ketiga cabang **tidak memiliki leluhur bersama** (masing-masing berisi riwayat orphan sendiri), dan itu
memang disengaja: git akan langsung menolak merge silang ketiga cabang
(`fatal: refusing to merge unrelated histories`), alih-alih diam-diam menghapus berkas cabang lain
seperti pada riwayat bersama. Karena itu:

- Jangan memakai `git merge` untuk menyinkronkan ketiga cabang ini; bila perlu sinkron, ambil direktorinya, atau pakai skrip di bawah.
- Sumber kebenaran konten selalu `main`: `site` adalah “`main` tanpa `launcher/`, `start-launcher.cmd`”,
  sedangkan `launcher` adalah “`README.md`/`package.json`/`start-launcher.cmd` milik cabang itu sendiri
  + `launcher/` dari `main`”.
- Riwayat lama sebelum pemisahan disimpan sebagai tag: `site-pre-split` (= `fa47b3d` lama),
  `launcher-pre-split` (= `b157a80` lama).

Skrip sinkron (jalankan di checkout `main`; skrip memakai perintah tingkat rendah git untuk menyusun
ulang tree tanpa menyentuh working tree):

```bash
node scripts/sync-branch.mjs site --dry-run      # lihat dulu berkas yang akan berubah
node scripts/sync-branch.mjs site --push         # perbarui site lalu push
node scripts/sync-branch.mjs launcher --push     # perbarui direktori launcher/ cabang launcher lalu push
```

Bila cabang `launcher` di-checkout di `E:\fuwari-launcher`, skrip akan menyarankan menjalankan
`git reset --hard <sha>` di direktori itu.

### Tiga direktori (worktree)

Ketiga cabang masing-masing di-checkout dalam satu direktori dan **berbagi satu `.git`** (bukan tiga
salinan repositori), jadi commit, push, dan daftar cabang di ketiga tempat itu sama:

```
E:\fuwari\             → main      pengembangan harian: situs + launcher
E:\fuwari-site\        → site      situs murni (tanpa launcher/)
E:\fuwari-launcher\    → launcher  dipakai saat mengubah launcher tersendiri
```

`git worktree list` menampilkan semua checkout. Membuat/menyusun ulang sebuah direktori:

```bash
git worktree add ../fuwari-site site
git worktree add ../fuwari-launcher launcher

# dependensi dipakai bersama direktori utama, pakai junction link alih-alih menyalin:
cmd //c mklink /J ..\fuwari-site\node_modules ..\fuwari\node_modules
cmd //c mklink /J ..\fuwari-launcher\node_modules ..\fuwari\node_modules
cmd //c mklink /J ..\fuwari-launcher\private ..\fuwari\private
```

Satu cabang tidak dapat di-checkout di dua direktori sekaligus (git akan menolak), jadi perubahan
manual di ketiga tempat secara alami tidak saling menimpa.

Saat menghapus direktori, **lepas junction lebih dulu baru hapus working tree**, kalau tidak
penghapusan akan ikut masuk ke direktori target:

```bash
cmd //c rmdir ..\fuwari-site\node_modules
git worktree remove ../fuwari-site
```

Catatan per direktori:

| Direktori | Catatan |
|:--|:--|
| `E:\fuwari` | `pnpm dev` menjalankan situs (localhost:4321) dan launcher (127.0.0.1:5199) sekaligus |
| `E:\fuwari-site` | Ingin pratinjau di direktori yang hanya berisi situs, pakai `pnpm dev:astro`; `pnpm dev` akan ikut mencari launcher di `..\fuwari-launcher` |
| `E:\fuwari-launcher` | **Jangan menjalankan `pnpm`** (`node_modules` adalah junction, pnpm akan menolak pemasangan dan mungkin mencoba menghapusnya); pakai `node launcher/server.mjs` atau klik dua kali `start-launcher.cmd`, dan arahkan ke direktori situs (`LAUNCHER_ROOT` atau `fuwari` sejajar sebagai bawaan) |

Perubahan manual di direktori `site` / `launcher` milik cabang itu dan tidak akan disatukan kembali ke
`main` oleh skrip sinkron; sebaliknya, menjalankan `sync-branch.mjs` akan menimpa seluruh tree `site`
dan direktori `launcher/` dengan isi dari `main`. Perubahan yang ingin dipertahankan lama sebaiknya
dibuat di `main`.

## Frontmatter Artikel

Artikel berada di `src/content/posts/` dan divalidasi dengan skema di
`src/content.config.ts`.

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg        # relatif terhadap berkas artikel, atau path absolut di public
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp                  # hanya bila bahasa artikel berbeda dari bahasa situs
---
```

Hanya `title` dan `published` yang wajib. Setel `draft: true` untuk mengecualikan
artikel dari build produksi namun tetap menampilkannya saat pengembangan.

Untuk menyimpan aset di samping artikel, gunakan bentuk folder dengan `index.md`:

```
src/content/posts/my-post/
├── index.md
└── cover.jpg
```

## Sintaks Markdown Tambahan

Selain [GitHub Flavored Markdown](https://github.github.com/gfm/), pipeline build
menambahkan:

- **Admonition** —— blok `note`, `tip`, `important`, `caution`, dan `warning`.
- **Kartu repositori GitHub** —— menyematkan ringkasan repo beserta bintang dan lisensi.
- **Blok kode lanjutan** —— fitur Expressive Code, termasuk blok yang dapat dilipat,
  nomor baris, dan label bahasa.
- **Matematika** —— rumus sebaris dan blok yang dirender dengan KaTeX.

Contoh yang dapat dijalankan untuk masing-masing ada di artikel demo dalam
`src/content/posts/`.

## Perintah

Jalankan semua perintah dari akar repositori:

| Perintah | Aksi |
|:--|:--|
| `pnpm install` | Memasang dependensi |
| `pnpm dev` | Menjalankan server pengembangan di `localhost:4321` |
| `pnpm build` | Build situs ke `./dist/`, lalu mengindeksnya dengan Pagefind |
| `pnpm preview` | Melayani hasil build produksi secara lokal |
| `pnpm check` | Menjalankan `astro check` untuk galat tipe dan template |
| `pnpm format` | Memformat `src/` dengan Biome |
| `pnpm lint` | Memeriksa dan memperbaiki `src/` dengan Biome |
| `pnpm new-post <filename>` | Membuat artikel baru |
| `pnpm astro ...` | Menjalankan perintah Astro CLI seperti `astro add` |

`pnpm build` menjalankan `astro build` lalu `pagefind --site dist`. Pencarian hanya
bekerja pada build produksi, jadi gunakan `pnpm build && pnpm preview` untuk mengujinya.

## Deploy

Keluaran di `dist/` sepenuhnya statis dan dapat dihosting di mana saja. Vercel,
Netlify, dan Cloudflare Pages semuanya dapat mem-build tanpa konfigurasi tambahan ——
setel perintah build ke `pnpm build` dan direktori keluaran ke `dist`, lalu ikuti
[panduan deploy Astro](https://docs.astro.build/en/guides/deploy/) untuk penyedia Anda.

Ingat untuk memperbarui `site` di `astro.config.mjs` terlebih dahulu: sitemap, feed
RSS, dan URL kanonis bergantung padanya.

CI berjalan pada setiap push dan pull request melalui
[.github/workflows/build.yml](../.github/workflows/build.yml) dan
[.github/workflows/biome.yml](../.github/workflows/biome.yml).

## Kredit

Berdasarkan [Fuwari](https://github.com/saicaca/fuwari) karya
[saicaca](https://github.com/saicaca), yang menyediakan desain dan implementasi asli.
Proyek asal dilacak melalui remote git `upstream`.

Font yang disertakan adalah [Roboto](https://fonts.google.com/specimen/Roboto) dan
[JetBrains Mono](https://www.jetbrains.com/lp/mono/); ikon berasal dari
[Iconify](https://iconify.design/).

## Lisensi

[MIT](../LICENSE) —— pemberitahuan hak cipta asli dipertahankan.
