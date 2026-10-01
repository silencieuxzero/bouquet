# 🍥 Fuwari

![Node.js >= 22.12](https://img.shields.io/badge/node.js-%3E%3D22.12-brightgreen)
![pnpm >= 10](https://img.shields.io/badge/pnpm-%3E%3D10-blue)
![Astro 7](https://img.shields.io/badge/Astro-7-ff5d01?logo=astro)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![License MIT](https://img.shields.io/badge/license-MIT-green)

Blog tĩnh cá nhân được xây dựng bằng [Astro](https://astro.build), fork từ mẫu
[Fuwari](https://github.com/saicaca/fuwari) và đã được cập nhật lên bộ công cụ mới hơn.

🌏 Ngôn ngữ khác:
[**English**](README.en.md) /
[**中文**](../README.md) /
[**日本語**](README.ja.md) /
[**한국어**](README.ko.md) /
[**Español**](README.es.md) /
[**ไทย**](README.th.md) /
[**Bahasa Indonesia**](README.id.md)

## Giới thiệu

Kho lưu trữ này khởi đầu là một bản sao của Fuwari và hiện chạy trên nền tảng mới hơn
mẫu gốc:

| Hạng mục | Mẫu gốc | Kho lưu trữ này |
|:--|:--|:--|
| Astro | 5.x | **7.3** |
| Tailwind CSS | 3.x qua `@astrojs/tailwind` | **4.x qua `@tailwindcss/vite`** |
| Bộ sưu tập nội dung | `src/content/config.ts` cũ | **Content Layer API** (`src/content.config.ts`) |
| Svelte | 5.39 | **5.57** |

Vì `@astrojs/tailwind` chưa từng hỗ trợ Astro 6 trở lên, việc chuyển sang Tailwind
CSS 4 là bắt buộc chứ không phải tùy chọn. Cấu hình style nay được viết theo hướng CSS
trước trong [src/styles/app.css](../src/styles/app.css) thay vì `tailwind.config.js`.

Nội dung blog và cấu hình site vẫn là giá trị mặc định của mẫu — hãy sửa
[src/config.ts](../src/config.ts) để biến nó thành site của bạn.

## Tính năng

- Xây dựng bằng Astro và Tailwind CSS, dùng Svelte cho các thành phần tương tác
- Chuyển trang mượt mà nhờ [Swup](https://swup.js.org/)
- Tìm kiếm toàn văn phía client bằng [Pagefind](https://pagefind.app/)
- Chế độ sáng / tối với màu nhấn tùy chỉnh, lưu trong `localStorage`
- Bố cục đáp ứng, hiển thị mục lục trên màn hình rộng
- Tô sáng mã nguồn bằng [Expressive Code](https://expressive-code.com/), kèm nhãn
  ngôn ngữ, nút sao chép và khối thu gọn
- Hiển thị công thức toán bằng [KaTeX](https://katex.org/)
- Markdown mở rộng: admonition và thẻ kho GitHub
- Lightbox ảnh bằng [PhotoSwipe](https://photoswipe.com/), ảnh tối ưu bằng Sharp
- Tạo feed RSS, sitemap và `robots.txt` khi build
- Chuỗi giao diện đã dịch sang 10 ngôn ngữ

## Yêu cầu

- **Node.js 22.12.0 trở lên**
- **pnpm 10 trở lên**

Phiên bản pnpm chính xác được ghim qua trường `packageManager`, nên bản tương thích
sẽ được chọn tự động. Script `preinstall` sẽ từ chối npm và Yarn.

## Bắt đầu

```sh
pnpm install     # cài đặt phụ thuộc
pnpm dev         # chạy dev server tại http://localhost:4321
```

Sau đó:

1. Sửa [src/config.ts](../src/config.ts) —— tiêu đề, phụ đề, ngôn ngữ, màu chủ đề,
   banner, mục lục và favicon.
2. Chạy `pnpm new-post <filename>` để tạo bản nháp trong `src/content/posts/`.
3. Đặt `site` và `base` trong [astro.config.mjs](../astro.config.mjs) trước khi triển khai.

## Cấu trúc dự án

```
src/
├── assets/         ảnh được các component import
├── components/     component Astro và Svelte (control/, misc/, widget/)
├── constants/      hằng số bố cục, icon mặc định, liên kết điều hướng
├── content/        bài viết blog và bộ sưu tập trang riêng
├── i18n/           chuỗi giao diện, mỗi ngôn ngữ một module
├── layouts/        Layout.astro và MainGridLayout.astro
├── pages/          route: trang chủ, lưu trữ, about, bài viết, RSS, robots.txt
├── plugins/        plugin remark / rehype và Expressive Code
├── styles/         app.css (điểm vào Tailwind) và stylesheet theo tính năng
├── types/          kiểu TypeScript dùng chung
└── utils/          truy vấn nội dung, tiện ích URL và chủ đề
src/content.config.ts   định nghĩa bộ sưu tập (Content Layer API)
```

## Frontmatter của bài viết

Bài viết nằm trong `src/content/posts/` và được kiểm tra theo schema trong
`src/content.config.ts`.

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg        # tương đối với tệp bài viết, hoặc đường dẫn tuyệt đối trong public
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp                  # chỉ khi ngôn ngữ bài viết khác ngôn ngữ site
---
```

Chỉ `title` và `published` là bắt buộc. Đặt `draft: true` để loại bài viết khỏi bản
build production nhưng vẫn hiển thị khi phát triển.

Muốn để tài nguyên cạnh bài viết, hãy dùng dạng thư mục với `index.md`:

```
src/content/posts/my-post/
├── index.md
└── cover.jpg
```

## Cú pháp Markdown mở rộng

Ngoài [GitHub Flavored Markdown](https://github.github.com/gfm/), pipeline build còn
bổ sung:

- **Admonition** —— các khối `note`, `tip`, `important`, `caution`, `warning`.
- **Thẻ kho GitHub** —— nhúng tóm tắt kho kèm số sao và giấy phép.
- **Khối mã nâng cao** —— các tính năng của Expressive Code như khối thu gọn, số dòng
  và nhãn ngôn ngữ.
- **Toán học** —— công thức trong dòng và dạng khối do KaTeX kết xuất.

Ví dụ chạy được của từng tính năng nằm trong các bài viết mẫu ở `src/content/posts/`.

## Lệnh

Chạy mọi lệnh từ thư mục gốc của kho lưu trữ:

| Lệnh | Tác dụng |
|:--|:--|
| `pnpm install` | Cài đặt phụ thuộc |
| `pnpm dev` | Chạy dev server tại `localhost:4321` |
| `pnpm build` | Build site vào `./dist/` rồi lập chỉ mục bằng Pagefind |
| `pnpm preview` | Xem trước bản build production tại máy |
| `pnpm check` | Chạy `astro check` để tìm lỗi kiểu và template |
| `pnpm format` | Định dạng `src/` bằng Biome |
| `pnpm lint` | Kiểm tra và tự sửa `src/` bằng Biome |
| `pnpm new-post <filename>` | Tạo bài viết mới |
| `pnpm astro ...` | Chạy lệnh Astro CLI như `astro add` |

`pnpm build` chạy `astro build` rồi `pagefind --site dist`. Tìm kiếm chỉ hoạt động
với bản build production, nên hãy dùng `pnpm build && pnpm preview` để thử.

## Triển khai

Kết quả trong `dist/` hoàn toàn tĩnh và có thể host ở bất kỳ đâu. Vercel, Netlify và
Cloudflare Pages đều build được mà không cần cấu hình thêm —— đặt lệnh build là
`pnpm build` và thư mục đầu ra là `dist`, rồi xem
[hướng dẫn triển khai của Astro](https://docs.astro.build/en/guides/deploy/) cho nhà
cung cấp của bạn.

Hãy cập nhật `site` trong `astro.config.mjs` trước: sitemap, feed RSS và URL chính
tắc đều phụ thuộc vào nó.

CI chạy mỗi khi push và pull request qua
[.github/workflows/build.yml](../.github/workflows/build.yml) và
[.github/workflows/biome.yml](../.github/workflows/biome.yml).

## Ghi công

Dựa trên [Fuwari](https://github.com/saicaca/fuwari) của
[saicaca](https://github.com/saicaca), nơi cung cấp thiết kế và phần triển khai gốc.
Bản gốc được theo dõi qua remote `upstream` của git.

Phông chữ đi kèm là [Roboto](https://fonts.google.com/specimen/Roboto) và
[JetBrains Mono](https://www.jetbrains.com/lp/mono/); icon đến từ
[Iconify](https://iconify.design/).

## Giấy phép

[MIT](../LICENSE) —— giữ nguyên thông báo bản quyền gốc.
