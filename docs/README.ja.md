# 🍥 Fuwari

![Node.js >= 22.12](https://img.shields.io/badge/node.js-%3E%3D22.12-brightgreen)
![pnpm >= 10](https://img.shields.io/badge/pnpm-%3E%3D10-blue)
![Astro 7](https://img.shields.io/badge/Astro-7-ff5d01?logo=astro)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![License MIT](https://img.shields.io/badge/license-MIT-green)

[Astro](https://astro.build) で構築した個人向けの静的ブログです。
[Fuwari](https://github.com/saicaca/fuwari) テンプレートをフォークし、より新しい
ツールチェーンに追随させています。

🌏 他の言語:
[**English**](README.en.md) /
[**中文**](../README.md) /
[**한국어**](README.ko.md) /
[**Español**](README.es.md) /
[**ไทย**](README.th.md) /
[**Tiếng Việt**](README.vi.md) /
[**Bahasa Indonesia**](README.id.md)

## 概要

本リポジトリは Fuwari のコピーから始まり、現在は上流テンプレートより新しいスタックで
動作しています。

| 項目 | 上流テンプレート | 本リポジトリ |
|:--|:--|:--|
| Astro | 5.x | **7.3** |
| Tailwind CSS | 3.x（`@astrojs/tailwind` 経由） | **4.x（`@tailwindcss/vite` 経由）** |
| コンテンツコレクション | 旧 `src/content/config.ts` | **Content Layer API**（`src/content.config.ts`） |
| Svelte | 5.39 | **5.57** |

`@astrojs/tailwind` は Astro 6 以降をサポートしていないため、Tailwind CSS 4 への移行は
任意ではなく必須でした。スタイル設定は `tailwind.config.js` ではなく
[`src/styles/app.css`](../src/styles/app.css) で CSS ファースト方式に変更されています。

ブログ本文とサイト設定はまだテンプレートの初期値です。
[`src/config.ts`](../src/config.ts) を編集して自分のサイトにしてください。

## 機能

- Astro と Tailwind CSS で構築し、インタラクティブな部分は Svelte を使用
- [Swup](https://swup.js.org/) による滑らかなページ遷移
- [Pagefind](https://pagefind.app/) によるクライアント側の全文検索
- ライト / ダークモード。アクセント色は変更でき `localStorage` に保存
- レスポンシブ対応。広い画面では目次を表示
- [Expressive Code](https://expressive-code.com/) によるコードのシンタックス
  ハイライト（言語バッジ、コピーボタン、折りたたみに対応）
- [KaTeX](https://katex.org/) による数式表示
- 拡張 Markdown：Admonition、GitHub リポジトリカード
- [PhotoSwipe](https://photoswipe.com/) によるライトボックス。画像は Sharp で最適化
- ビルド時に RSS フィード、サイトマップ、`robots.txt` を生成
- UI の文言は 10 言語に翻訳済み

## 動作環境

- **Node.js 22.12.0 以上**
- **pnpm 10 以上**

pnpm の正確なバージョンは `packageManager` フィールドで固定されているため、互換版が
自動的に選択されます。`preinstall` スクリプトは npm と Yarn を拒否します。

## はじめに

```sh
pnpm install     # 依存関係をインストール
pnpm dev         # http://localhost:4321 で開発サーバーを起動
```

その後:

1. [`src/config.ts`](../src/config.ts) を編集 —— サイト名、サブタイトル、言語、テーマの
   色相、バナー、目次、ファビコン。
2. `pnpm new-post <filename>` を実行し、`src/content/posts/` に記事の雛形を作成。
3. デプロイ前に [`astro.config.mjs`](../astro.config.mjs) の `site` と `base` を設定。

## プロジェクト構成

```
src/
├── assets/         コンポーネントが読み込む画像
├── components/     Astro と Svelte のコンポーネント（control/、misc/、widget/）
├── constants/      レイアウト定数、アイコンの既定値、ナビゲーションのプリセット
├── content/        ブログ記事と独立ページのコレクション
├── i18n/           UI 文言（言語ごとに 1 モジュール）
├── layouts/        Layout.astro と MainGridLayout.astro
├── pages/          ルート：ホーム、アーカイブ、About、記事、RSS、robots.txt
├── plugins/        remark / rehype と Expressive Code のプラグイン
├── styles/         app.css（Tailwind エントリ）と機能別スタイルシート
├── types/          共有 TypeScript 型
└── utils/          コンテンツ取得、URL、テーマのヘルパー
src/content.config.ts   コレクション定義（Content Layer API）
```

## 記事の Frontmatter

記事は `src/content/posts/` に置かれ、`src/content.config.ts` のスキーマで検証されます。

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg        # 記事ファイルからの相対パス、または public の絶対パス
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp                  # 記事の言語がサイト言語と異なる場合のみ
---
```

必須なのは `title` と `published` のみです。`draft: true` にすると本番ビルドから除外され、
開発時には表示されたままになります。

記事と画像を同じ場所に置きたい場合は、`index.md` を使うフォルダ形式にします：

```
src/content/posts/my-post/
├── index.md
└── cover.jpg
```

## Markdown 拡張構文

[GitHub Flavored Markdown](https://github.github.com/gfm/) に加えて、ビルド
パイプラインは以下を提供します：

- **Admonition** —— `note`、`tip`、`important`、`caution`、`warning` の 5 種類。
- **GitHub リポジトリカード** —— スター数とライセンスを含む概要を埋め込みます。
- **拡張コードブロック** —— 折りたたみ、行番号、言語バッジなどの Expressive Code 機能。
- **数式** —— インラインおよびブロックの数式を KaTeX で描画。

それぞれの実行例は `src/content/posts/` のサンプル記事にあります。

## コマンド

すべてリポジトリのルートで実行します：

| コマンド | 内容 |
|:--|:--|
| `pnpm install` | 依存関係をインストール |
| `pnpm dev` | `localhost:4321` で開発サーバーを起動 |
| `pnpm build` | `./dist/` にビルドし、Pagefind でインデックスを作成 |
| `pnpm preview` | 本番ビルドをローカルで表示 |
| `pnpm check` | `astro check` で型とテンプレートのエラーを検査 |
| `pnpm format` | Biome で `src/` を整形 |
| `pnpm lint` | Biome で `src/` を検査し自動修正 |
| `pnpm new-post <filename>` | 新しい記事を作成 |
| `pnpm astro ...` | `astro add` などの Astro CLI コマンドを実行 |

`pnpm build` は `astro build` に続けて `pagefind --site dist` を実行します。検索は
本番ビルドに対してのみ機能するため、`pnpm build && pnpm preview` で確認してください。

## デプロイ

`dist/` の出力は完全な静的ファイルで、どこにでもホストできます。Vercel、Netlify、
Cloudflare Pages はいずれも追加設定なしでビルドできます —— ビルドコマンドを
`pnpm build`、出力ディレクトリを `dist` に設定し、お使いのホストについて
[Astro のデプロイガイド](https://docs.astro.build/ja/guides/deploy/) を参照してください。

先に `astro.config.mjs` の `site` を更新してください。サイトマップ、RSS フィード、
正規 URL がこれに依存しています。

プッシュとプルリクエストのたびに
[`.github/workflows/build.yml`](../.github/workflows/build.yml) と
[`.github/workflows/biome.yml`](../.github/workflows/biome.yml) で CI が実行されます。

## クレジット

[saicaca](https://github.com/saicaca) による
[Fuwari](https://github.com/saicaca/fuwari) を基にしています。元のデザインと実装は
同テンプレートによるものです。上流は git の `upstream` リモートで追跡しています。

同梱フォントは [Roboto](https://fonts.google.com/specimen/Roboto) と
[JetBrains Mono](https://www.jetbrains.com/lp/mono/)、アイコンは
[Iconify](https://iconify.design/) です。

## ライセンス

[MIT](../LICENSE) —— 元の著作権表示を保持しています。
