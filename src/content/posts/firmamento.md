---
title: "Firmamento 自定义指南"
published: 2026-07-17T08:45:00
description: "自定义 Firmamento，快速实现站点个性化定制"
image: "/ds.png"
category: "教程"
tags: ["教程", "Astro"]
draft: false
---

# 前言

本指南面向想要基于 Firmamento 主题进行深度定制的用户，覆盖站点信息、外观样式、功能模块、内容扩展、部署与维护的完整流程。

---

## 1. 全局配置：`config/` 目录

主题的所有站点数据以 TOML 格式分散在 `config/` 目录下，`src/consts.ts` 只负责读取并导出，无需手动修改。修改配置后重新构建项目（`astro build`）即可生效。

### 1.1 站点基础信息（`config/site.toml`）

```toml
[site]
title = "Firmamento"                    # 站点标题，显示在浏览器标签和页头
description = "欢迎来到这个小站！"      # 站点描述，用于 SEO 和 Banner 副标题
url = "https://luoshulv.netlify.app/"   # 站点完整 URL，用于 RSS、Sitemap
language = "zh-CN"                      # HTML lang 属性值
author = "花束（洛疏律）"               # 作者名称，显示在页脚和个人信息栏
bg_image = "/scp.jpg"                   # 全屏背景图路径，支持本地和远程图片
announcement = "欢迎来到我的个人小站！" # 站点公告，显示在右侧工具栏
launch_date = "2026-07-10"              # 建站日期（用于计算运行天数）

featured_posts = ["story-1"]            # 首页推荐文章 slug 或 ID
```

**Banner 配置（`config/banner.toml`）：**

```toml
[banner]
title = "Firmamento"
subtitle = "欢迎来到属于我的星空，坐在这里陪我一会吧~"
bg_start = "#38bdf8"
bg_end = "#0284c7"
bg_opacity_start = "15%"
bg_opacity_end = "5%"
border_opacity = "10%"
shadow_opacity = "35%"
typing_speed = 120        # 打字速度（ms/字符）
typing_delete_speed = 60  # 删除速度（ms/字符）
typing_pause = 2000       # 完成后暂停时间（ms）
typing_loop = true        # 是否循环
```

**Banner 视觉参数说明：**

- `bg_start` / `bg_end`：渐变背景的起始色和结束色
- `bg_opacity_start` / `bg_opacity_end`：渐变背景的起始和结束透明度
- `border_opacity`：Banner 边框透明度
- `shadow_opacity`：Banner 阴影发光透明度
- `typing_speed`：打字动画中每个字符的显示速度
- `typing_delete_speed`：打字动画中每个字符的删除速度
- `typing_pause`：打字完成后的停留时间
- `typing_loop`：是否循环播放打字动画

### 1.2 作者信息（`config/author.toml`）

```toml
[author]
avatar = "/avatar.png"                          # 头像图片路径，支持本地和远程
id = "花束（洛疏律）"                           # 作者昵称/ID，显示在个人信息栏
bio = "血液的作用之一，是为信仰付出代价。"      # 个人简介
location = "中华人民共和国"                      # 所在地
age = "17"                                      # 年龄
```

### 1.3 社交链接（`config/author.toml`）

```toml
[[social_links]]
name = "GitHub"
href = "https://github.com/silencieuxzero"
icon = "github"

[[social_links]]
name = "Fandom"
href = "https://backrooms.fandom.com/zh/wiki/User:Appennino"
icon = "fandom"
```

- `name`：显示名称
- `href`：链接地址
- `icon`：图标标识，需在 `src/utils/icons.ts` 中有对应 SVG 映射

**添加新社交链接：**

1. 在 `config/author.toml` 中添加 `[[social_links]]` 条目
2. 在 `src/utils/icons.ts` 的 `iconMap` 中添加对应 SVG 图标

### 1.4 仓库展示（`config/repos.toml`）

```toml
[repos]
username = "silencieuxzero"   # GitHub 用户名，用于 API 调用
page_title = "GitHub 仓库"    # 仓库页面标题
page_subtitle = "仓库副标题"  # 仓库页面副标题
display_mode = "selected"     # "all" 或 "selected"

[[displayed_repos]]
owner = "silencieuxzero"
repo = "backrooms_escape"

[[displayed_repos]]
owner = "E33EPUS"
repo = "E33EPUS-s-ChatScreen"
```

- `display_mode`：`"all"` 显示用户所有仓库，`"selected"` 只显示指定仓库
- `[[displayed_repos]]`：指定仓库列表，可包含自己和他人的仓库

### 1.5 首页推荐（`config/site.toml`）

```toml
[site]
featured_posts = ["story-1"]
```

填入博客文章 slug 或 ID，可同时推荐多篇文章。首页会自动展示最新文章和推荐文章。

### 1.6 音乐播放器（`config/music.toml`）

```toml
[music]
loop_mode = "all"   # "none" 不循环 / "one" 单曲循环 / "all" 列表循环
autoplay = false
volume = 0.3        # 默认音量（0.0 ~ 1.0）

[[songs]]
url = "/music/song.mp3"
title = "歌曲名"

# 网易云音乐：使用 id 字段
# [[songs]]
# id = "3379996850"
# title = "网易云音乐歌曲"
```

- 本地音乐：放入 `public/music/`，使用 `url` 字段
- 网易云音乐：使用 `id` 字段（注意：网易云外链可能存在访问限制，且受版权保护）
- `loop_mode`：`none` 不循环，`one` 单曲循环，`all` 列表循环
- `autoplay`：是否自动播放
- `volume`：默认音量（0.0 ~ 1.0）

**音乐文件建议：**
- 格式：MP3（兼容性最好）、M4A、OGG
- 大小：单个文件建议小于 10MB，大文件会导致加载缓慢
- 放置位置：`public/music/` 目录下

### 1.7 画廊配置（`config/gallery.toml`）

```toml
[[gallery.images]]
src = "/image.jpg"      # 图片路径，支持本地和远程 URL
alt = "图片描述"        # 用于无障碍访问和灯箱预览
copyright = "版权方"    # 版权方名称
source = "来源链接"     # 图片来源链接
```

- `src`：图片路径，支持本地和远程 URL
- `alt`：图片描述，用于无障碍访问和灯箱预览
- `copyright`：版权方名称
- `source`：图片来源链接

### 1.8 子画廊（密码保护）（`config/gallery.toml`）

```toml
[sub_gallery]
page_title = "三十天友谊挑战"
page_subtitle = "描述文字"
password = "30days"   # 留空则不启用密码

[[sub_gallery.images]]
src = "/image.jpg"
alt = "第1天"
```

- `password`：设置密码后，访问子画廊需要输入密码
- 密码通过 Cookie 持久化，关闭浏览器后需重新输入

### 1.9 友情链接（`config/links.toml`）

```toml
[[friend_links]]
name = "站点名"
url = "https://example.com/"
description = "站点描述"
avatar = "https://example.com/avatar.png"
```

- `name`：站点名称
- `url`：站点链接
- `description`：站点描述
- `avatar`：头像 URL

### 1.10 其他站点设置

| 配置项 | 所在文件 | 说明 |
|---|---|---|
| `announcement` | `site.toml` | 站点公告，显示在右侧工具栏 |
| `footer.text` | `links.toml` | 页脚版权文本，留空自动生成 `© 当前年份 作者名` |
| `footer.license` | `links.toml` | 许可协议文本，显示在文章底部 |

---

## 2. 博客内容配置

### 2.1 内容集合 Schema

博客文章的类型定义在 `src/content.config.ts`：

```ts
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    password: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});
```

**添加自定义字段：**

如需在 Frontmatter 中使用自定义字段，需在此 schema 中声明：

```ts
schema: z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  password: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  // 自定义字段示例
  draft: z.boolean().optional(),  // 草稿标记
  pinned: z.boolean().optional(), // 置顶标记
})
```

### 2.2 文章 Frontmatter

```yaml
---
title: 文章标题
description: 文章简介
pubDate: 2026-07-10
updatedDate: 2026-07-11       # 可选
heroImage: ./path/to/image.jpg # 可选
password: <SHA-256 哈希值>     # 可选，启用加密
category: 分类名               # 可选
tags: [标签1, 标签2]           # 可选
draft: true                    # 可选，草稿标记（需在 schema 中声明）
pinned: true                   # 可选，置顶标记（需在 schema 中声明）
---
```

**Frontmatter 字段说明：**

- `title`：文章标题，必填
- `description`：文章简介，用于 SEO 和列表页展示，必填
- `pubDate`：发布日期，必填，格式：`YYYY-MM-DD`
- `updatedDate`：更新日期，可选
- `heroImage`：封面图片路径，可选
- `password`：密码哈希，可选，启用文章加密
- `category`：文章分类，可选，单值
- `tags`：文章标签，可选，数组形式

### 2.3 密码加密

文章设置 `password` 后，访问时需输入密码验证。

**生成密码哈希：**

```bash
node scripts/hash-password.mjs <your-password>
```

将输出填入 Frontmatter 的 `password` 字段。

**密码验证流程：**
1. 用户访问加密文章时弹出密码输入框
2. 前端对输入进行 SHA-256 哈希
3. 与 Frontmatter 中的哈希值比对
4. 验证通过后通过 Cookie 持久化，24 小时内免重复输入

### 2.4 文章模板

新建文章时，推荐使用以下模板：

```yaml
---
title: ''
description: ''
pubDate: 2026-07-17
updatedDate: 2026-07-17
heroImage: ''
category: ''
tags: []
---

## 文章正文

在这里开始写作...
```

### 2.5 分类与标签

分类和标签在文章列表页自动生成链接：

- 分类页面：`/categories/分类名`
- 标签页面：`/tags/标签名`

分类和标签在首页和文章详情页会显示为可点击的徽章。

---

## 3. 教程页面配置

教程页面通过 `config/tutorials.toml` 独立配置，无需修改代码。修改后需重新构建项目（`astro build`）才能生效。

### 3.1 页面信息

```toml
[page]
title = "教程"
subtitle = "一些实用教程的集合"
description = ""  # SEO 描述，留空则继承站点全局描述
```

### 3.2 布局

```toml
[layout]
columns_mode = "auto"    # "auto" 自适应 / "fixed" 固定列数
fixed_columns = 3        # 固定列数（1~6）
card_min_width = 280     # 卡片最小宽度（px）
items_per_page = 6       # 每页显示数量（1~24）
```

**布局模式说明：**

- `auto`：根据容器宽度自动填充，适合响应式布局
- `fixed`：固定列数，适合需要严格控制布局的场景

### 3.3 显示选项

```toml
[display]
show_thumbnail = true
show_category_badge = true
show_date = true
show_word_count = true
show_description = true
thumbnail_height = 120  # 60 ~ 300
```

### 3.4 搜索

```toml
[search]
enabled = true
debounce_delay = 200      # 防抖延迟（ms），50 ~ 1000
search_title = true
search_description = true
```

### 3.5 分类筛选

```toml
[filter]
enabled = true
```

### 3.6 分页

```toml
[pagination]
enabled = true
show_page_numbers = true
show_prev_next = true
```

### 3.7 动画

```toml
[animation]
card_enter_animation = true
animation_duration = 0.4    # 0.1 ~ 1.0
animation_stagger = 0.06    # 0 ~ 0.3，建议 0.03 ~ 0.1
hover_translate_y = 3       # 0 ~ 20
```

### 3.8 外观

```toml
[appearance]
card_border_radius = 8      # 0 ~ 20
card_border_opacity = 0.15  # 0 ~ 1
thumbnail_gradient_opacity_start = 0.2  # 0 ~ 1
thumbnail_gradient_opacity_end = 0.07   # 0 ~ 1
```

### 3.9 分类颜色

```toml
[categories.colors]
"前端开发" = "#38bdf8"
"后端开发" = "#34d399"
"DevOps"   = "#f472b6"
"设计"     = "#a78bfa"
"编程语言" = "#fb923c"
```

### 3.10 教程数据

```toml
[[tutorials]]
title = "教程标题"
description = "教程描述"
pubDate = "2026-07-14"
category = "分类名"
url = "/blog/slug"  # 链接到对应博客文章或外部链接
```

> **注意**：`wordCount` 字段已废弃，系统会自动从对应 URL 的文章统计字数。

### 3.11 导航集成

```toml
[integration]
show_in_navbar = true
navbar_link_text = "教程"
```

---

## 4. 样式定制

### 4.1 CSS 变量

主题通过 CSS 变量管理颜色系统，修改 `src/styles/global.css` 中的 `:root` 即可全局换色：

```css
:root {
  --accent: #38bdf8;          /* 主色调 */
  --accent-dark: #0284c7;     /* 主色调深色 */
  --black: 15, 18, 25;        /* 主要文字色（RGB 值） */
  --gray: 96, 115, 159;       /* 次要文字色 */
  --gray-light: 229, 233, 240; /* 浅色背景 */
  --gray-dark: 34, 41, 57;    /* 深色文字 */
  --gray-gradient: rgba(var(--gray-light), 50%), #fff;
  --box-shadow:
    0 1px 3px rgba(var(--gray), 15%),
    0 4px 12px rgba(var(--gray), 18%);
}
```

**CSS 变量说明：**

| 变量 | 说明 | 用途 |
|---|---|---|
| `--accent` | 主色调 | 链接、按钮、高亮 |
| `--accent-dark` | 主色调深色 | 悬停状态 |
| `--black` | 主要文字色 | 标题、正文 |
| `--gray` | 次要文字色 | 辅助信息 |
| `--gray-light` | 浅色背景 | 卡片背景 |
| `--gray-dark` | 深色文字 | 正文文字 |
| `--gray-gradient` | 背景渐变 | 页面背景 |
| `--box-shadow` | 通用阴影 | 卡片阴影 |

**暗色模式覆盖：**

```css
[data-theme="dark"] {
  --black: 229, 233, 240;
  --gray: 156, 163, 175;
  --gray-light: 31, 41, 55;
  --gray-dark: 229, 233, 240;
  --gray-gradient: rgba(31, 41, 55, 50%), #0f1219;
  --box-shadow:
    0 1px 3px rgba(0, 0, 0, 25%),
    0 4px 12px rgba(0, 0, 0, 30%);
}
```

### 4.2 自定义字体

字体配置在 `astro.config.mjs` 中：

```js
fonts: [
  {
    provider: fontProviders.local(),
    name: 'Atkinson',
    cssVariable: '--font-atkinson',
    fallbacks: ['sans-serif'],
    options: {
      variants: [
        { src: ['./src/assets/fonts/atkinson-regular.woff'], weight: 400, style: 'normal' },
        { src: ['./src/assets/fonts/atkinson-bold.woff'], weight: 700, style: 'normal' },
      ],
    },
  },
];
```

**更换字体步骤：**

1. 将字体文件放入 `src/assets/fonts/`
2. 修改 `astro.config.mjs` 中的 `src` 路径
3. 调整 `weight` 和 `style` 以匹配字体文件

**添加 Google Fonts：**

```js
fonts: [
  {
    provider: fontProviders.google(),
    name: 'Noto Sans SC',
    cssVariable: '--font-noto',
    fallbacks: ['sans-serif'],
  },
];
```

### 4.3 组件样式

每个 Astro 组件都包含内联 `<style>`，可直接在对应组件文件中修改样式。

**主要组件样式文件：**

| 组件 | 样式位置 | 说明 |
|---|---|---|
| `Header.astro` | 内联 `<style>` | 导航栏、主题切换 |
| `Footer.astro` | 内联 `<style>` | 页脚 |
| `AuthorCard.astro` | 内联 `<style>` | 作者信息卡 |
| `SiteTools.astro` | 内联 `<style>` | 右侧工具栏 |
| `MusicPlayer.astro` | 内联 `<style>` | 音乐播放器 |
| `BlogPost.astro` | 内联 `<style>` | 文章布局 |
| `global.css` | 全局样式 | 全局 CSS 变量、表格、代码块等 |

### 4.4 响应式断点

主题使用以下响应式断点：

| 断点 | 说明 |
|---|---|
| `1000px` | 三栏转单栏，侧边栏移至内容下方 |
| `768px` | 缩小文章内边距和标题字号 |
| `600px` | 进一步缩小间距，Banner 适配 |
| `480px` | 移动端优化，触摸目标增大 |
| `380px` | 超小屏幕适配 |

### 4.5 主题切换

主题切换逻辑在 `src/components/Header.astro` 的 `<script>` 中：

```js
const html = document.documentElement;
const btn = document.querySelector('.theme-toggle');
const stored = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (stored === 'dark' || (!stored && prefersDark)) {
  html.setAttribute('data-theme', 'dark');
}
btn?.addEventListener('click', () => {
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
});
```

**自定义主题切换行为：**

- 修改 `localStorage` 的 key 可更改存储位置
- 添加 `transition` 可实现主题切换动画

---

## 5. 功能模块定制

### 5.1 代码块增强

`src/plugins/rehype-code-block.mjs` 为 Markdown 代码块添加 macOS 风格标题栏和自动折叠。

**修改折叠阈值：**

```js
const COLLAPSE_THRESHOLD = 15;  // 超过多少行自动折叠
```

**自定义代码块样式：**

代码块样式在 `src/styles/global.css` 的 `.code-block-wrapper` 相关样式中。

**禁用代码块增强：**

在 `astro.config.mjs` 中移除 `rehypeCodeBlock` 插件：

```js
// markdown: {
//   processor: unified({
//     rehypePlugins: [rehypeCodeBlock],
//   }),
// },
```

### 5.2 音乐播放器

- 配置项：`config/music.toml` → `[music]` 与 `[[songs]]`
- 组件：`src/components/MusicPlayer.astro`
- 样式：组件内联 `<style>`

**自定义音乐播放器：**

1. 修改 `config/music.toml` 中的歌曲列表与播放参数
2. 修改 `MusicPlayer.astro` 中的 HTML 结构调整布局
3. 修改组件内的 `<style>` 调整样式

**播放器功能：**

- 播放/暂停、上一首/下一首
- 进度条拖拽
- 音量控制
- 播放列表展开/收起
- 三种循环模式切换
- 空格键播放/暂停（全局快捷键）

### 5.3 画廊系统

- 配置项：`config/gallery.toml` → `[gallery]`、`[sub_gallery]`
- 页面：`src/pages/gallery.astro`、`src/pages/gallery/sub-gallery.astro`
- 功能：灯箱预览、版权信息弹窗、密码保护

**画廊功能说明：**

- 主画廊：网格布局，点击图片打开灯箱预览
- 版权信息：每张图片可设置版权方和来源，点击 © 按钮查看
- 子画廊：独立页面，可设置密码保护
- 灯箱：支持 ESC 关闭、点击背景关闭

### 5.4 GitHub 仓库展示

页面：`src/pages/repos.astro`  
配置：`config/repos.toml` → `[repos]`、`[[displayed_repos]]`

**仓库展示模式：**

- `all`：显示该用户所有公开仓库
- `selected`：只显示 `[[displayed_repos]]` 中指定的仓库

### 5.5 友情链接

页面：`src/pages/links.astro`  
配置：`config/links.toml` → `[[friend_links]]`

### 5.6 分类与标签

分类和标签页面已自动生成：

- 分类列表：`/categories/`
- 标签列表：`/tags/`
- 分类页面：`/categories/分类名`
- 标签页面：`/tags/标签名`

### 5.7 搜索功能

项目使用 Astro 的内容集合，可通过 Astro 的搜索功能或集成第三方搜索服务（如 Algolia）。

---

## 6. 组件系统

### 6.1 Astro 组件

主题使用 Astro 组件构建页面，组件位于 `src/components/`：

| 组件 | 说明 |
|---|---|
| `AuthorCard.astro` | 左侧作者信息卡 |
| `BaseHead.astro` | HTML `<head>` 公共部分 |
| `ContextMenu.astro` | 右键菜单 |
| `Footer.astro` | 页脚 |
| `FormattedDate.astro` | 日期格式化 |
| `Header.astro` | 导航栏（含主题切换） |
| `HeaderLink.astro` | 导航链接 |
| `MusicPlayer.astro` | 音乐播放器主体 |
| `MusicToggle.astro` | 音乐播放器展开/收起 |
| `ReaderToggle.astro` | 阅读模式切换 |
| `SiteTools.astro` | 右侧工具栏 |

### 6.2 使用组件

```astro
---
import Header from '../components/Header.astro';
---

<Header />
```

### 6.3 组件 Props

组件可通过 Props 传递数据：

```astro
---
// 定义 Props 类型
interface Props {
  title: string;
  count?: number;
}
const { title, count = 0 } = Astro.props;
---

<div>{title} - {count}</div>
```

---

## 7. 页面路由

Astro 基于文件系统生成路由：

### 7.1 静态路由

| 文件路径 | 路由地址 |
|---|---|
| `src/pages/index.astro` | `/` |
| `src/pages/about.astro` | `/about` |
| `src/pages/gallery.astro` | `/gallery` |
| `src/pages/links.astro` | `/links` |
| `src/pages/repos.astro` | `/repos` |
| `src/pages/tutorials.astro` | `/tutorials` |

### 7.2 动态路由

| 文件路径 | 路由地址 |
|---|---|
| `src/pages/blog/[...slug].astro` | `/blog/:slug` |
| `src/pages/blog/index.astro` | `/blog` |
| `src/pages/categories/[category].astro` | `/categories/:category` |
| `src/pages/categories/index.astro` | `/categories/` |
| `src/pages/tags/[tag].astro` | `/tags/:tag` |
| `src/pages/tags/index.astro` | `/tags/` |
| `src/pages/gallery/sub-gallery.astro` | `/gallery/sub-gallery` |

### 7.3 新增页面

1. 在 `src/pages/` 下创建 `.astro` 文件
2. 如需新增导航链接，修改 `src/components/Header.astro` 中的 `<HeaderLink>` 列表

**示例：创建新页面**

```astro
---
// src/pages/projects.astro
import BaseHead from '../components/BaseHead.astro';
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';
import { SITE_TITLE } from '../consts';
---

<!doctype html>
<html lang="zh-CN">
  <head>
    <BaseHead title={`项目 - ${SITE_TITLE}`} description="我的项目展示" />
  </head>
  <body>
    <Header />
    <main>
      <h1>我的项目</h1>
      <!-- 页面内容 -->
    </main>
    <Footer />
  </body>
</html>
```

### 7.4 动态路由参数

在动态路由页面中获取参数：

```astro
---
// src/pages/blog/[...slug].astro
const { slug } = Astro.params;
---
```

---

## 8. 部署配置

### 8.1 Netlify

项目已配置 Netlify Adapter，`astro.config.mjs` 中：

```js
adapter: netlify(),
```

**部署到 Netlify 的步骤：**

1. 将项目推送到 GitHub/GitLab
2. 在 Netlify 中导入项目
3. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `22.12.0` 或更高
4. 点击 Deploy

**环境变量配置：**

在 Netlify 面板的 Site settings → Environment variables 中配置：

- `NODE_VERSION`: `22.12.0`

### 8.2 其他部署平台

**Vercel：**

```bash
npm install -g vercel
vercel
```

**Cloudflare Pages：**

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `22.12.0`

**自托管：**

```bash
npm run build
# 将 dist/ 目录部署到任意静态托管服务
```

### 8.3 环境要求

- Node.js >= 22.12.0
- npm（随 Node.js 附带）

---

## 9. 命令速查

| 命令 | 作用 |
|---|---|
| `npm install` | 安装依赖 |
| `npm run dev` | 启动开发服务器（`http://localhost:4321`） |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 本地预览生产构建 |
| `npm run astro -- --help` | Astro CLI 帮助 |
| `astro dev --background` | 后台运行开发服务器 |
| `astro dev stop` | 停止后台服务器 |
| `astro dev status` | 查看后台服务器状态 |
| `astro dev logs` | 查看后台服务器日志 |

---

## 10. 图标系统

图标映射定义在 `src/utils/icons.ts`，通过 `iconMap` 对象按名称引用 SVG：

```ts
export const iconMap = {
  github: '<svg>...</svg>',
  fandom: '<svg>...</svg>',
  sun: '<svg>...</svg>',
  moon: '<svg>...</svg>',
  folder: '<svg>...</svg>',
  tag: '<svg>...</svg>',
};
```

在组件中使用：

```astro
<span class="icon" set:html={iconMap['github'] || ''} />
```

**添加新图标：**

1. 在 `src/utils/icons.ts` 的 `iconMap` 中添加新条目
2. 在 `config/author.toml` 的 `[[social_links]]` 中引用对应 `icon` 名

---

## 11. 常见自定义场景

### 11.1 修改主题色

**步骤：**

1. 修改 `src/styles/global.css` 中的 `--accent` 和 `--accent-dark` 变量
2. 修改 `config/banner.toml` 中 `bg_start` / `bg_end` 等颜色值
3. 如需修改按钮、链接等元素颜色，搜索 `--accent` 在组件中的使用

**示例：将主题色改为紫色**

```css
:root {
  --accent: #a78bfa;
  --accent-dark: #7c3aed;
}
```

```toml
[banner]
bg_start = "#a78bfa"
bg_end = "#7c3aed"
```

### 11.2 添加新页面

1. 在 `src/pages/` 创建 `.astro` 文件
2. 如需新增导航链接，修改 `src/components/Header.astro` 中的 `<HeaderLink>` 列表

### 11.3 修改布局

- 三栏布局：左侧作者卡 + 中间内容 + 右侧工具栏
- 响应式断点：`1000px` 切换为单栏，`768px` / `600px` / `480px` 逐步缩小间距和字号
- 布局样式主要在 `BlogPost.astro` 和 `index.astro` 的内联 `<style>` 中

### 11.4 禁用功能模块

| 功能 | 禁用方法 |
|---|---|
| 音乐播放器 | 从页面模板中移除 `<MusicPlayer />` 或 `<MusicToggle />` |
| 代码块增强 | 在 `astro.config.mjs` 中移除 `rehypeCodeBlock` 插件 |
| Sitemap | 在 `astro.config.mjs` 中移除 `sitemap()` 集成 |
| MDX | 在 `astro.config.mjs` 中移除 `mdx()` 集成 |
| 主题切换 | 在 `Header.astro` 中移除主题切换按钮和相关脚本 |

### 11.5 添加第三方服务

**评论系统：**

在 `src/pages/blog/[...slug].astro` 中添加评论组件 HTML。

**统计分析：**

在 `src/components/BaseHead.astro` 中添加统计代码。

**访问计数器：**

可在 `SiteTools.astro` 中添加访问计数逻辑。

---

## 12. SEO 优化

### 12.1 Meta 标签

Meta 标签配置在 `src/components/BaseHead.astro`：

```astro
---
export interface Props {
  title?: string;
  description?: string;
  image?: string;
}
const { 
  title = SITE_TITLE, 
  description = SITE_DESCRIPTION,
  image = `${SITE_URL}/og-image.png`
} = Astro.props;
---

<head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
  <meta property="og:type" content="website" />
  <link rel="canonical" href={Astro.url.href} />
</head>
```

### 12.2 结构化数据

可在 `BaseHead.astro` 中添加 JSON-LD 结构化数据：

```astro
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "{SITE_TITLE}",
  "description": "{SITE_DESCRIPTION}"
}
</script>
```

---

## 13. 故障排查

### 13.1 开发服务器启动失败

- 检查 Node.js 版本是否 >= 22.12.0
- 删除 `node_modules/` 和 `package-lock.json`，重新运行 `npm install`

### 13.2 图片不显示

- 确认图片路径正确（区分 `public/` 和 `src/`）
- `public/` 下的文件会直接复制到 `dist/`
- `src/` 下的文件需要通过 `import` 或 Astro 的 `Image` 组件使用

### 13.3 样式不生效

- 检查 CSS 变量名是否拼写正确
- 检查组件内联 `<style>` 是否有语法错误
- 清除浏览器缓存

### 13.4 构建失败

- 检查 `astro.config.mjs` 配置是否正确
- 检查 TypeScript 类型错误
- 查看构建日志定位具体错误

---

## 14. 性能优化

### 14.1 图片优化

- 使用 Astro 的 `Image` 组件自动优化
- 使用 WebP 格式减小文件大小
- 添加 `loading="lazy"` 延迟加载非首屏图片

### 14.2 代码分割

Astro 默认进行代码分割，组件级 JS 按需加载。

### 14.3 缓存策略

Netlify 自动配置缓存，可自定义 `_headers` 文件：

```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

---

## 15. 贡献与许可

- 基于 [Bear Blog](https://github.com/HermanMartinus/bearblog/) 的 CSS 风格
- 背景图来源于 SCP 基金会
- 由 [DeepSeek](https://deepseek.com/) 辅助开发
- MIT License

---

## 16. 获取帮助

- [Astro 官方文档](https://docs.astro.build)
- [Astro Discord](https://astro.build/chat)
- [项目 Issues](https://github.com/silencieuxzero/Firmamento/issues)
