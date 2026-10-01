# 🍥 Fuwari

![Node.js >= 22.12](https://img.shields.io/badge/node.js-%3E%3D22.12-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro 7](https://img.shields.io/badge/Astro-7-ff5d01?logo=astro)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![License MIT](https://img.shields.io/badge/license-MIT-green)

บล็อกแบบสแตติกสำหรับใช้งานส่วนตัว สร้างด้วย [Astro](https://astro.build)
ฟอร์กมาจากเทมเพลต [Fuwari](https://github.com/saicaca/fuwari)
และอัปเดตให้ตามเครื่องมือรุ่นใหม่กว่าแล้ว

🌏 ภาษาอื่น:
[**English**](../README.md) /
[**中文**](README.zh-CN.md) /
[**日本語**](README.ja.md) /
[**한국어**](README.ko.md) /
[**Español**](README.es.md) /
[**Tiếng Việt**](README.vi.md) /
[**Bahasa Indonesia**](README.id.md)

## เกี่ยวกับ

โปรเจกต์นี้เริ่มจากสำเนาของ Fuwari และปัจจุบันทำงานบนสแตกที่ใหม่กว่าเทมเพลตต้นทาง

| หัวข้อ | เทมเพลตต้นทาง | โปรเจกต์นี้ |
|:--|:--|:--|
| Astro | 5.x | **7.3** |
| Tailwind CSS | 3.x ผ่าน `@astrojs/tailwind` | **4.x ผ่าน `@tailwindcss/vite`** |
| คอลเลกชันเนื้อหา | `src/content/config.ts` แบบเก่า | **Content Layer API** (`src/content.config.ts`) |
| Svelte | 5.39 | **5.57** |

เนื่องจาก `@astrojs/tailwind` ไม่รองรับ Astro 6 ขึ้นไป การย้ายไป Tailwind CSS 4
จึงเป็นสิ่งที่จำเป็น ไม่ใช่ทางเลือก สไตล์ถูกกำหนดแบบ CSS-first ใน
[src/styles/app.css](../src/styles/app.css) แทนการใช้ `tailwind.config.js`

เนื้อหาบล็อกและการตั้งค่าเว็บยังเป็นค่าตั้งต้นของเทมเพลต — แก้ไข
[src/config.ts](../src/config.ts) เพื่อทำให้เป็นเว็บของคุณเอง

## ความสามารถ

- สร้างด้วย Astro และ Tailwind CSS โดยใช้ Svelte สำหรับคอมโพเนนต์ที่มีการโต้ตอบ
- เปลี่ยนหน้าอย่างนุ่มนวลด้วย [Swup](https://swup.js.org/)
- ค้นหาข้อความเต็มฝั่งไคลเอนต์ด้วย [Pagefind](https://pagefind.app/)
- โหมดสว่าง / มืด พร้อมปรับสีเน้นได้ เก็บค่าไว้ใน `localStorage`
- เลย์เอาต์ตอบสนอง แสดงสารบัญบนหน้าจอกว้าง
- ไฮไลต์โค้ดด้วย [Expressive Code](https://expressive-code.com/)
  พร้อมป้ายภาษา ปุ่มคัดลอก และบล็อกที่พับได้
- เรนเดอร์สูตรคณิตศาสตร์ด้วย [KaTeX](https://katex.org/)
- Markdown เพิ่มเติม: admonition และการ์ดรีโพ GitHub
- ไลต์บ็อกซ์รูปภาพด้วย [PhotoSwipe](https://photoswipe.com/) ปรับแต่งภาพด้วย Sharp
- สร้างฟีด RSS แผนผังเว็บไซต์ และ `robots.txt` ตอน build
- ข้อความในอินเทอร์เฟซแปลไว้ 10 ภาษา

## สิ่งที่ต้องมี

- **Node.js 22.12.0 ขึ้นไป**
- **pnpm 9 ขึ้นไป**

เวอร์ชัน pnpm ที่แน่นอนถูกล็อกผ่านฟิลด์ `packageManager` จึงเลือกเวอร์ชันที่เข้ากันได้
โดยอัตโนมัติ สคริปต์ `preinstall` จะปฏิเสธ npm และ Yarn

## เริ่มต้นใช้งาน

```sh
pnpm install     # ติดตั้ง dependencies
pnpm dev         # เริ่มเซิร์ฟเวอร์ที่ http://localhost:4321
```

จากนั้น:

1. แก้ไข [src/config.ts](../src/config.ts) —— ชื่อเว็บ คำโปรย ภาษา เฉดสีธีม แบนเนอร์
   สารบัญ และ favicon
2. รัน `pnpm new-post <filename>` เพื่อสร้างโครงบทความใน `src/content/posts/`
3. ตั้งค่า `site` และ `base` ใน [astro.config.mjs](../astro.config.mjs) ก่อน deploy

## โครงสร้างโปรเจกต์

```
src/
├── assets/         รูปภาพที่คอมโพเนนต์นำเข้า
├── components/     คอมโพเนนต์ Astro และ Svelte (control/, misc/, widget/)
├── constants/      ค่าคงที่เลย์เอาต์ ไอคอนตั้งต้น และพรีเซ็ตลิงก์นำทาง
├── content/        บทความบล็อกและคอลเลกชันหน้าอิสระ
├── i18n/           ข้อความอินเทอร์เฟซ หนึ่งโมดูลต่อภาษา
├── layouts/        Layout.astro และ MainGridLayout.astro
├── pages/          เส้นทาง: หน้าแรก คลังบทความ about บทความ RSS robots.txt
├── plugins/        ปลั๊กอิน remark / rehype และ Expressive Code
├── styles/         app.css (จุดเข้า Tailwind) และสไตล์ตามฟีเจอร์
├── types/          ไทป์ TypeScript ที่ใช้ร่วมกัน
└── utils/          การดึงเนื้อหา ยูทิลิตี URL และธีม
src/content.config.ts   นิยามคอลเลกชัน (Content Layer API)
```

## Frontmatter ของบทความ

บทความอยู่ที่ `src/content/posts/` และถูกตรวจสอบด้วยสคีมาใน
`src/content.config.ts`

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg        # สัมพันธ์กับไฟล์บทความ หรือเส้นทางใน public
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp                  # ใส่เฉพาะเมื่อภาษาบทความต่างจากภาษาของเว็บ
---
```

จำเป็นเพียง `title` และ `published` เท่านั้น ตั้ง `draft: true` เพื่อไม่ให้บทความ
ปรากฏในบิลด์โปรดักชัน แต่ยังเห็นได้ขณะพัฒนา

หากต้องการวางไฟล์ประกอบไว้ข้างบทความ ให้ใช้รูปแบบโฟลเดอร์ที่มี `index.md`:

```
src/content/posts/my-post/
├── index.md
└── cover.jpg
```

## ไวยากรณ์ Markdown เพิ่มเติม

นอกจาก [GitHub Flavored Markdown](https://github.github.com/gfm/) แล้ว พายป์ไลน์
การบิลด์ยังเพิ่ม:

- **Admonition** —— กล่อง `note`, `tip`, `important`, `caution`, `warning`
- **การ์ดรีโพ GitHub** —— ฝังสรุปรีโพพร้อมจำนวนดาวและสัญญาอนุญาต
- **บล็อกโค้ดขั้นสูง** —— ฟีเจอร์ของ Expressive Code เช่นบล็อกที่พับได้ เลขบรรทัด
  และป้ายภาษา
- **คณิตศาสตร์** —— สูตรแบบในบรรทัดและแบบบล็อกที่เรนเดอร์ด้วย KaTeX

ตัวอย่างที่รันได้ของแต่ละฟีเจอร์อยู่ในบทความตัวอย่างใน `src/content/posts/`

## คำสั่ง

รันทุกคำสั่งจากโฟลเดอร์รากของโปรเจกต์:

| คำสั่ง | การทำงาน |
|:--|:--|
| `pnpm install` | ติดตั้ง dependencies |
| `pnpm dev` | เริ่มเซิร์ฟเวอร์พัฒนาที่ `localhost:4321` |
| `pnpm build` | บิลด์เว็บไปที่ `./dist/` แล้วสร้างดัชนีด้วย Pagefind |
| `pnpm preview` | ดูตัวอย่างบิลด์โปรดักชันในเครื่อง |
| `pnpm check` | รัน `astro check` ตรวจไทป์และเทมเพลต |
| `pnpm format` | จัดรูปแบบ `src/` ด้วย Biome |
| `pnpm lint` | ตรวจและแก้ไข `src/` ด้วย Biome |
| `pnpm new-post <filename>` | สร้างบทความใหม่ |
| `pnpm astro ...` | รันคำสั่ง Astro CLI เช่น `astro add` |

`pnpm build` จะรัน `astro build` ต่อด้วย `pagefind --site dist` การค้นหาทำงานกับ
บิลด์โปรดักชันเท่านั้น จึงควรใช้ `pnpm build && pnpm preview` ในการทดสอบ

## การ deploy

ผลลัพธ์ใน `dist/` เป็นไฟล์สแตติกล้วน จึงโฮสต์ได้ทุกที่ Vercel, Netlify และ
Cloudflare Pages บิลด์ได้โดยไม่ต้องตั้งค่าเพิ่ม —— ตั้งคำสั่งบิลด์เป็น `pnpm build`
และโฟลเดอร์ผลลัพธ์เป็น `dist` แล้วดู
[คู่มือ deploy ของ Astro](https://docs.astro.build/en/guides/deploy/) สำหรับผู้ให้บริการของคุณ

อย่าลืมอัปเดต `site` ใน `astro.config.mjs` ก่อน เพราะแผนผังเว็บไซต์ ฟีด RSS และ
URL หลักขึ้นอยู่กับค่านี้

CI จะทำงานทุกครั้งที่ push และ pull request ผ่าน
[.github/workflows/build.yml](../.github/workflows/build.yml) และ
[.github/workflows/biome.yml](../.github/workflows/biome.yml)

## เครดิต

อ้างอิงจาก [Fuwari](https://github.com/saicaca/fuwari) โดย
[saicaca](https://github.com/saicaca) ซึ่งเป็นเจ้าของดีไซน์และการ implement ต้นฉบับ
ต้นทางติดตามผ่าน git remote ชื่อ `upstream`

ฟอนต์ที่มาพร้อมโปรเจกต์คือ [Roboto](https://fonts.google.com/specimen/Roboto) และ
[JetBrains Mono](https://www.jetbrains.com/lp/mono/) ส่วนไอคอนมาจาก
[Iconify](https://iconify.design/)

## สัญญาอนุญาต

[MIT](../LICENSE) —— เก็บประกาศลิขสิทธิ์เดิมไว้
