# 🍥 Fuwari

![Node.js >= 22.12](https://img.shields.io/badge/node.js-%3E%3D22.12-brightgreen)
![pnpm >= 10](https://img.shields.io/badge/pnpm-%3E%3D10-blue)
![Astro 7](https://img.shields.io/badge/Astro-7-ff5d01?logo=astro)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![License MIT](https://img.shields.io/badge/license-MIT-green)

基于 [Astro](https://astro.build) 的个人静态博客，Fork 自
[Fuwari](https://github.com/saicaca/fuwari) 模板，并已跟进至较新的工具链。

🌏 其他语言版本：
[**English**](docs/README.en.md) /
[**日本語**](docs/README.ja.md) /
[**한국어**](docs/README.ko.md) /
[**Español**](docs/README.es.md) /
[**ไทย**](docs/README.th.md) /
[**Tiếng Việt**](docs/README.vi.md) /
[**Bahasa Indonesia**](docs/README.id.md)

## 关于

本仓库最初是 Fuwari 的副本，目前技术栈已比上游模板更新：

| 方面 | 上游模板 | 本仓库 |
|:--|:--|:--|
| Astro | 5.x | **7.3** |
| Tailwind CSS | 3.x，经 `@astrojs/tailwind` | **4.x，经 `@tailwindcss/vite`** |
| 内容集合 | 旧版 `src/content/config.ts` | **Content Layer API**（`src/content.config.ts`） |
| Svelte | 5.39 | **5.57** |

由于 `@astrojs/tailwind` 从未支持 Astro 6 及更高版本，Tailwind CSS 4 的迁移是必需的
而非可选项。样式配置现改为 CSS 优先，写在
[`src/styles/app.css`](src/styles/app.css) 中，不再使用 `tailwind.config.js`。

博客内容与站点设置目前仍是模板默认值——编辑
[`src/config.ts`](src/config.ts) 即可改成你自己的站点。

## 功能特性

- 基于 Astro 与 Tailwind CSS 构建，交互组件使用 Svelte
- 通过 [Swup](https://swup.js.org/) 实现流畅的页面过渡
- 通过 [Pagefind](https://pagefind.app/) 实现客户端全文搜索
- 亮色 / 暗色模式，主题色相可自定义并持久化在 `localStorage`
- 响应式布局，宽屏下显示文内目录
- 通过 [Expressive Code](https://expressive-code.com/) 实现代码块高亮，
  支持语言徽章、复制按钮与可折叠区块
- 通过 [KaTeX](https://katex.org/) 渲染数学公式
- 扩展 Markdown：提示块（admonitions）、GitHub 仓库卡片
- 通过 [PhotoSwipe](https://photoswipe.com/) 实现图片灯箱，图片经 Sharp 优化
- 构建时生成 RSS 订阅、站点地图与 `robots.txt`
- 界面文案已翻译为 10 种语言

## 环境要求

- **Node.js ≥ 22.12.0**
- **pnpm ≥ 10**

pnpm 的确切版本由 `packageManager` 字段锁定，会自动选用兼容版本。`preinstall`
脚本会拒绝 npm 与 Yarn。

## 快速开始

```sh
pnpm install     # 安装依赖
pnpm dev         # 启动开发服务器 http://localhost:4321（顺带启动启动器，见下）
```

`pnpm dev` 会顺带把本地启动器一起拉起来：先看本仓库有无 `launcher/server.mjs`，
再看环境变量 `LAUNCHER_HOME` 与同级目录 `../fuwari-launcher`，找到哪个就用哪个；
一个都没有就只启动站点，不报错。想只起站点，用 `pnpm dev:astro` 或 `pnpm dev --no-launcher`
（也可令 `LAUNCHER=0`）。

随后：

1. 编辑 [`src/config.ts`](src/config.ts) —— 站点标题、副标题、语言、主题色相、
   横幅、文内目录与站点图标。
2. 执行 `pnpm new-post <filename>` 在 `src/content/posts/` 中生成文章草稿。
3. 部署前先设置 [`astro.config.mjs`](astro.config.mjs) 中的 `site` 与 `base`。

## 项目结构

```
src/
├── assets/         组件引用的图片
├── components/     Astro 与 Svelte 组件（control/、misc/、widget/）
├── constants/      布局常量、图标默认值、导航链接预设
├── content/        博客文章与独立页面集合
├── i18n/           界面文案，每种语言一个模块
├── layouts/        Layout.astro 与 MainGridLayout.astro
├── pages/          路由：首页、归档、关于、文章、RSS、robots.txt
├── plugins/        remark / rehype 与 Expressive Code 插件
├── styles/         app.css（Tailwind 入口）与各功能样式表
├── types/          共享 TypeScript 类型
└── utils/          内容查询、URL 与主题辅助函数
src/content.config.ts   集合定义（Content Layer API）
scripts/                开发脚本：dev.mjs（起站点 + 启动器）、sync-branch.mjs（同步分支快照）
launcher/               本地启动器（改配置与内容、预览、部署的 Web 界面）
start-launcher.cmd      Windows 下双击启动启动器
```

## 分支

| 分支 | 内容 | 用途 |
|:--|:--|:--|
| `main` | 站点本体 + 启动器（`launcher/`、`start-launcher.cmd`） | 日常开发：`pnpm dev` 同时拉起站点与启动器 |
| `site` | 只有站点本体，没有启动器 | 纯净副本：只需要博客、或想让 `clone` 干净时用 |
| `launcher` | 只有启动器，没有站点本体 | 单独改启动器；用 `LAUNCHER_ROOT` 指向站点 checkout |

三条分支**没有共同祖先**（各自独立的 orphan 历史），这是刻意的：git 会直接拒绝三方互整枝合并
（`fatal: refusing to merge unrelated histories`），而不会像共享历史那样静默删掉对方的文件。所以：

- 不要用 `git merge` 同步这三个分支；要同步就取目录，或者用下面的脚本。
- 内容真源永远是 `main`：`site` 是「`main` 去掉 `launcher/`、`start-launcher.cmd`」，`launcher` 是「分支自己的
  `README.md`/`package.json`/`start-launcher.cmd` + `main` 的 `launcher/`」。
- 拆分前的旧历史保留了标签：`site-pre-split`（= 原 `fa47b3d`）、`launcher-pre-split`（= 原 `b157a80`）。

同步脚本（在 `main` 的 checkout 里跑，脚本用 git 底层命令重建树，不动工作区）：

```bash
node scripts/sync-branch.mjs site --dry-run      # 先看会改哪些文件
node scripts/sync-branch.mjs site --push         # 更新 site 并推送
node scripts/sync-branch.mjs launcher --push     # 更新 launcher 的 launcher/ 目录并推送
```

`launcher` 分支被签出在 `E:\fuwari-launcher` 时，脚本会提示去那个目录执行 `git reset --hard <sha>`。

### 三个目录（worktree）

三条分支各自签出在一个目录里，**共用一个 `.git`**（不是三份仓库拷贝），所以三处提交、推送、分支列表都是同一套：

```
E:\fuwari\             → main      日常开发：站点 + 启动器
E:\fuwari-site\        → site      纯净站点（无 launcher/）
E:\fuwari-launcher\    → launcher  单独改启动器时用
```

`git worktree list` 可查看全部签出。新建/重建某个目录：

```bash
git worktree add ../fuwari-site site
git worktree add ../fuwari-launcher launcher

# 依赖共用主目录，用 junction 链接而不是复制：
cmd //c mklink /J ..\fuwari-site\node_modules ..\fuwari\node_modules
cmd //c mklink /J ..\fuwari-launcher\node_modules ..\fuwari\node_modules
cmd //c mklink /J ..\fuwari-launcher\private ..\fuwari\private
```

同一个分支不能同时签出到两个目录（git 会拒绝），所以三处的手改天然不会互相覆盖。

删除目录时**先摘掉 junction 再删工作区**，否则删除会跟进目标目录：

```bash
cmd //c rmdir ..\fuwari-site\node_modules
git worktree remove ../fuwari-site
```

各目录的注意点：

| 目录 | 注意 |
|:--|:--|
| `E:\fuwari` | `pnpm dev` 同时起站点（localhost:4321）与启动器（127.0.0.1:5199） |
| `E:\fuwari-site` | 想在这个只有站点的目录里预览，用 `pnpm dev:astro`；`pnpm dev` 会顺带去 `..\fuwari-launcher` 找启动器 |
| `E:\fuwari-launcher` | **不要跑 `pnpm`**（`node_modules` 是 junction，pnpm 会拒绝安装并可能试图删除它）；用 `node launcher/server.mjs` 或双击 `start-launcher.cmd`，并让它指向站点目录（`LAUNCHER_ROOT` 或默认的同级 `fuwari`） |

在 `site` / `launcher` 目录里的手改属于那条分支，不会被同步脚本合回 `main`；反过来，跑 `sync-branch.mjs` 会用 `main` 的内容覆盖 `site` 的整棵树、`launcher` 的 `launcher/` 目录。想长期保留的改动请改在 `main`。

## 文章 Frontmatter

文章位于 `src/content/posts/`，由 `src/content.config.ts` 中的 schema 校验。

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg        # 相对文章文件，或 public 目录的绝对路径
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp                  # 仅当文章语言与站点语言不同时设置
---
```

只有 `title` 与 `published` 是必填项。设置 `draft: true` 可让文章在生产构建中不出现，
但在开发环境下仍可见。

若希望文章与其配图放在一起，可使用 `index.md` 的目录形式：

```
src/content/posts/my-post/
├── index.md
└── cover.jpg
```

## Markdown 扩展语法

在 [GitHub Flavored Markdown](https://github.github.com/gfm/) 的基础上，构建流程
额外提供：

- **提示块（Admonitions）** —— `note`、`tip`、`important`、`caution`、`warning` 五种
  强调块。
- **GitHub 仓库卡片** —— 嵌入仓库概要，含 Star 数与许可证。
- **增强代码块** —— Expressive Code 的特性，包括可折叠区块、行号与语言徽章。
- **数学公式** —— 行内与块级公式由 KaTeX 渲染。

以上每项均可在 `src/content/posts/` 的示例文章中找到可运行范例。

## 指令

下列指令均在仓库根目录执行：

| 指令 | 作用 |
|:--|:--|
| `pnpm install` | 安装依赖 |
| `pnpm dev` | 在 `localhost:4321` 启动开发服务器；若找到启动器则同时启动 |
| `pnpm dev:astro` | 只启动开发服务器，不启动启动器 |
| `pnpm build` | 构建站点至 `./dist/`，随后用 Pagefind 建立索引 |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm check` | 执行 `astro check`，检查类型与模板错误 |
| `pnpm format` | 用 Biome 格式化 `src/` |
| `pnpm lint` | 用 Biome 检查并自动修复 `src/` |
| `pnpm new-post <filename>` | 创建新文章 |
| `pnpm astro ...` | 执行 `astro add` 等 Astro CLI 指令 |

`pnpm build` 会依次运行 `astro build` 与 `pagefind --site dist`。搜索功能仅对生产
构建生效，因此需用 `pnpm build && pnpm preview` 来测试。

## 部署

`dist/` 中的产物是纯静态文件，可托管在任何平台。Vercel、Netlify 与 Cloudflare
Pages 均无需额外配置即可构建——将构建命令设为 `pnpm build`、输出目录设为 `dist`，
再参考 [Astro 部署指南](https://docs.astro.build/zh-cn/guides/deploy/) 完成后续步骤。

请先更新 `astro.config.mjs` 中的 `site`：站点地图、RSS 订阅与规范链接都依赖它。

每次推送与拉取请求都会通过
[`.github/workflows/build.yml`](.github/workflows/build.yml) 与
[`.github/workflows/biome.yml`](.github/workflows/biome.yml) 运行持续集成。

## 致谢

基于 [saicaca](https://github.com/saicaca) 的
[Fuwari](https://github.com/saicaca/fuwari) 项目，原设计与实现均来自该模板。
上游通过 git 的 `upstream` 远程跟踪。

内置字体为 [Roboto](https://fonts.google.com/specimen/Roboto) 与
[JetBrains Mono](https://www.jetbrains.com/lp/mono/)；图标来自
[Iconify](https://iconify.design/)。

## 许可证

[MIT](LICENSE) —— 保留了原始版权声明。
