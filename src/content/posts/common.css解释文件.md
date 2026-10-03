---
title: "common.css解释文件"
published: 2026-07-14T13:43:00
description: "代码详解"
image: "/长征机头像.png"
category: "教程"
tags: ["教程", "Fandom", "CSS"]
draft: false
---

# `common.css` 代码解释文档

> 本文件是 [Backrooms Fandom 中文维基](https://backrooms.fandom.com/zh/wiki) 的全局样式表，适用于所有皮肤。
> 文件路径：`e:\daosu_fd\common.css`
> 总行数：约 1930 行

---

## 目录

1. [外部资源导入](#1-外部资源导入)
2. [自定义字体](#2-自定义字体)
3. [通用内容创作块样式](#3-通用内容创作块样式)
4. [图片样式](#4-图片样式)
5. [动画与特效文字](#5-动画与特效文字)
6. [引用与书签框](#6-引用与书签框)
7. [标题块与通知框](#7-标题块与通知框)
8. [首页布局（Scutoid's Main Page）](#8-首页布局scutoids-main-page)
9. [导航栏动效](#9-导航栏动效)
10. [代码与目录样式](#10-代码与目录样式)
11. [首页模块样式](#11-首页模块样式)
12. [黑幕（Heimu）样式](#12-黑幕heimu样式)
13. [GoodWork2 模板](#13-goodwork2-模板)
14. [票模板（红黄票）](#14-票模板红黄票)
15. [Mbox 消息框模板](#15-mbox-消息框模板)
16. [Documentation 模板](#16-documentation-模板)
17. [Quote 引用模板](#17-quote-引用模板)
18. [Special:Community 页面修复](#18-specialcommunity-页面修复)
19. [FANDOM 图标字体与导航](#19-fandom-图标字体与导航)
20. [Headerblock 与页面头部](#20-headerblock-与页面头部)
21. [Tabber、跨语言链接等杂项](#21-tabber跨语言链接等杂项)
22. [数据表与模板数据样式](#22-数据表与模板数据样式)
23. [图片渲染与粘性头修复](#23-图片渲染与粘性头修复)
24. [站点图标与卡片动效](#24-站点图标与卡片动效)
25. [日间/夜间模式切换](#25-日间夜间模式切换)
26. [页眉滚栏与背景](#26-页眉滚栏与背景)
27. [楼层列表与实体条目](#27-楼层列表与实体条目)
28. [Blurimage 与 Blurquote](#28-blurimage-与-blurquote)
29. [全屏背景与覆盖层](#29-全屏背景与覆盖层)
30. [SD Banner 修复](#30-sd-banner-修复)
31. [Overflow 布局修复](#31-overflow-布局修复)
32. [图片适配工具类](#32-图片适配工具类)
33. [字符装饰工具类](#33-字符装饰工具类)
34. [GoodWork2 完整版](#34-goodwork2-完整版)
35. [票模板链接颜色修复](#35-票模板链接颜色修复)

---

## 1. 外部资源导入

### 1.1 Fandom Dev Wiki 资源

```css
@import url("/load.php?mode=articles&only=styles&articles=u:dev:MediaWiki:...");
```

通过 Fandom 的 `load.php` 批量导入来自 **Fandom Dev Wiki** 的大量社区 CSS 模块，包括：

| 模块 | 用途 |
|------|------|
| `AjaxPoll.Modern.css` | 投票样式 |
| `BalancedBloglists.css` | 博客列表 |
| `BalancedCategories.css` | 分类样式 |
| `BalancedComments.css` | 评论区 |
| `BalancedMessageBoxes.css` | 消息框 |
| `BalancedPageBottom.css` | 页面底部 |
| `BalancedProfile.css` | 用户档案 |
| `BalancedScrollbar.css` | 滚动条 |
| `BalancedSearch.css` | 搜索框 |
| `BalancedSlider.css` | 滑块 |
| `BalancedTabber.css` | 标签切换 |
| `LocalNavExploreIcons.css` | 本地导航图标 |
| `CSS3Tooltip.css` | 工具提示 |
| `Highlight.css` | 高亮 |
| `LeafyStrap.css` | 未知/综合 |
| `ThemeBasedStyling.css` | 主题适配 |
| `ThemeColorClasses.css` | 主题颜色类 |
| `ProgressBar.css` | 进度条 |
| `SpoilerBlur.css` | 剧透模糊 |
| `Heimu.css` | 黑幕效果 |
| `UserAnimations.css` | 用户动画 |

### 1.2 Google Fonts 字体导入

导入了大量 Google Fonts，覆盖中英文与装饰性字体：

- **中文字体**：`Long Cang`（长仓）、`Ma Shan Zheng`（马善政）、`Noto Serif SC`、`ZCOOL XiaoWei`、`Zhi Mang Xing`、`ZCOOL QingKe HuangYou`、`Noto Sans SC`
- **英文字体**：`Lobster`、`Comfortaa`、`Silkscreen`、`Oxygen Mono`、`Overpass Mono`、`Lato`、`PT Mono`、`Poppins`、`Share Tech Mono`、`Anonymous Pro`、`Island Moments`、`Baumans`、`Graduate`、`Kelly Slab`、`Kumar One`、`Tulpen One`

---

## 2. 自定义字体

通过 `@font-face` 定义了 5 种自托管字体：

| 字体名 | 来源 | 说明 |
|--------|------|------|
| `glitch_black` | Backrooms Wiki 静态资源 | 一款故障风格黑体 |
| `Genshin55W` | 原神 Wiki 静态资源 | 原神游戏字体（55W 字重） |
| `Genshin75W` | 原神 Wiki 静态资源 | 原神游戏字体（75W 字重） |
| `CangerW02` | jsDelivr CDN | 仓耳与墨字体 |
| `Zhousong` | Backrooms Wiki 静态资源 | 周边宋体 |

---

## 3. 通用内容创作块样式

这些样式是 Backrooms 维基内容创作中最常用的 div 块容器，灵感来源于 Wikidot。

### 3.1 `darkblock` — 深色块

使用主题强调色作背景，白色文字，带阴影。适合用于警示、重要信息。

### 3.2 `lightblock` — 浅色块

使用页面次要背景色，适合普通内容区分。

### 3.3 `borderblock` — 带边框深色块

在 `darkblock` 基础上增加边框（使用链接悬停色）。

### 3.4 `light-borderblock` — 带边框浅色块

在浅色背景上增加主题混合色边框。

### 3.5 `light-logoblock` — 浅色 Logo 水印块

浅色背景 + 半透明站点 Logo 水印（通过 `::after` 伪元素实现）。

### 3.6 `light-border-logoblock` — 带边框的 Logo 水印块

在 `light-logoblock` 基础上增加主题混合色边框。

---

## 4. 图片样式

### 4.1 `right-image` / `right-image2` / `right-image3` — 右侧可放大图片

- 浮动在右侧，最大宽度 40%
- 圆角右上角
- 使用金褐色配色（`#fbe7b5`、`#857858`、`#4f4834`）
- 悬停时图片放大并左移（`scale(1.4~1.5) translateX(-3rem)`），带延迟

### 4.2 `left-image` — 左侧可放大图片

与右侧版对称，浮动在左侧，悬停时向右放大。

### 4.3 结构说明

每个图片容器包含：
- `img` — 图片本身，宽度溢出容器边缘以制造装饰效果
- `p` — 下方的说明文字
- 悬停效果带 `transition-delay`，使放大动作有节奏感

### 4.4 `right-sound` — 右侧音频块

白色主题的音频容器，用于放置音频播放器。

---

## 5. 动画与特效文字

### 5.1 `@keyframes hide` — 淡出动画

从 `opacity: 1` → `opacity: 0`，用于元素消失效果。

### 5.2 `.rainbow_text` — 彩虹文字

使用 `linear-gradient` + `background-clip: text` 实现文字渐变，通过 `rainbow_animation` 让渐变位置持续移动，形成彩虹流动效果。

### 5.3 `.wavy-text` — 波浪抖动文字

- 每个字符用 `span` 包裹
- 每个 `span` 应用 `jiggle` 动画，不同的 `animation-delay` 产生依次抖动的波浪效果
- `@keyframes jiggle`：在 `translateY(-2px)` 和 `translateY(2px)` 之间来回切换

### 5.4 `.slider` — 滑动条

- 金褐色背景，左侧粗边框
- 使用 `Genshin75W` 字体
- 悬停时右移并降低透明度

### 5.5 `.text-coverer` — 文字遮蔽器

- 绝对定位，覆盖在文字上方
- 悬停时渐变为透明，露出下方文字

---

## 6. 引用与书签框

### 6.1 `styled-quote` — 浅色引用框

- 左侧有 0.5rem 的彩色竖条（主题混合色）
- 浅色背景，带阴影
- 适合书签风格引用

### 6.2 `dark-styled-quote` — 深色引用框

类似但使用深色主题色背景，白色文字。

### 6.3 链接颜色修复

```css
.dark-styled-quote a,
.darkblock a {
    color: white;
}
```

确保深色块内的链接保持白色可读。

---

## 7. 标题块与通知框

### 7.1 `titleblock` / `titlebox` — 标题块

- `titleblock` 是外框，带边框和阴影
- `titlebox` 是内部的标题标签，使用负 `top` 值上移，制造标签重叠效果

### 7.2 `featurebox` — 通知框

- 金褐色圆角框
- 高 `z-index`（`99999 !important`）确保显示在最上层
- 黑色文字，适合公告通知

---

## 8. 首页布局（Scutoid's Main Page）

来自 Scutoid 的首页布局方案。

### 8.1 Flex 布局

- `.flex-container` — Flex 容器，不换行
- `.textbox` — 文本块
- `.fifty` — 宽度 50%，悬停时放大
- `.seventy` / `.thirty` — 宽度 70%/30%
- `.hundred` — 宽度 100%（`!important`）
- `.authorlink` — 作者链接，小字号

### 8.2 日间/夜间模式适配

```css
.theme-fandomdesktop-light .texttop { ... }
.theme-fandomdesktop-light .textmain { ... }
.theme-fandomdesktop-dark .texttop { ... }
.theme-fandomdesktop-dark .textmain { ... }
```

- 浅色模式：棕色顶栏 + 米色内容区
- 深色模式：深灰顶栏 + 灰内容区

### 8.3 `dbtop` / `dbmain` — 深色主题块

- 绿色顶栏 + 黑色内容区
- 用于特殊页面风格

### 8.4 `scroller` — 滚动背景

使用外部图片作为背景，通过 `slide3` 动画缓慢移动，产生滚动效果。

### 8.5 `scan` — 扫描线动画

- 7px 高的扫描线，在 20 秒内从顶部移到底部
- 极高 `z-index`（`999999`）

---

## 9. 导航栏动效

```css
.wds-dropdown__toggle-chevron,
.fandom-community-header__local-navigation .wds-list .wds-dropdown-chevron {
    transition: .3s;
}
```

- 下拉菜单的箭头在展开时旋转 180°
- 嵌套菜单的箭头默认保持 0°，避免旋转冲突

---

## 10. 代码与目录样式

### 10.1 `.insert-code` — 编辑工具按钮

用于 `MediaWiki:Edittools` 中的代码插入按钮，内联块显示。

### 10.2 `.faketoc` — 仿真目录

- 可点击的目录项
- 悬停时显示橙色半透明背景

### 10.3 代码元素样式

`code`、`tt`、`kbd`、`pre` 统一字体族（等宽字体），带边框和背景色。

### 10.4 `.page-content` 溢出修复

```css
.page-content {
    overflow: visible !important;
}
```

防止内容被裁切。

---

## 11. 首页模块样式

### 11.1 `.mainpage-banner` / `.mainpage-block`

- 使用次要背景色，带边框和阴影
- `banner` 右上角圆角
- `block` 全部圆角

### 11.2 首页目录

```css
.mainpage .toc {
    border: none;
    font-size: 12px;
    margin: 0 10% 1% 7%;
    width: 670px;
}
```

隐藏首页的目录边框并调整尺寸。

### 11.3 首页分类隐藏

```css
.mainpage .article-categories,
.mainpage .page-footer__categories {
    display: none;
}
```

### 11.4 联系图标

浅色模式下对联系图标应用 `sepia` + `invert` 滤镜，深色模式取消。

---

## 12. 黑幕（Heimu）样式

经典的 ACG 文化"黑幕"效果——文字默认被黑色掩盖，悬停时显示。

- 默认背景色 `#252525`
- 文字颜色与背景相同（`#252525`），实现"隐形"
- 悬停/激活时文字变为白色
- 链接在悬停时变为红色（`#c85b5b`）
- 已访问链接变为灰色
- 新窗口链接（`.new`）变为亮红色（`#e91e1e`）

---

## 13. GoodWork2 模板

用于展示"优秀作品"的卡片模板（`Template:GoodWork2`）。

### 核心结构

| 类名 | 用途 |
|------|------|
| `.viewport` | 视口容器，裁剪溢出 |
| `.slide_image` | 背景图片，可横向滑动 |
| `.image_mask` | 渐变遮罩，制造从图片到纯色的过渡 |
| `.linkbox` | 可点击链接区域 |
| `.gtitle_c` | 标题文字 |
| `.gdes` | 描述文字 |

### 交互效果

- 悬停时遮罩右移，露出更多图片
- 图片同时左移
- 支持日间/夜间模式的配色切换

---

## 14. 票模板（红黄票）

用于 Backrooms 维基的"红票"/"黄票"评审模板（`Template:Ticket`、`Template:Yellow-Ticket`、`Template:Red-Ticket`、`Template:Black-Ticket`）。

### 颜色变体

| 类名 | 背景 | 边框 |
|------|------|------|
| `.yellow-ticket` | 黄色 `#f0eb97` | 黄色 |
| `.red-ticket` | 浅红 `#ebb9b9` | 红色 |
| `.black-ticket` | 黑色 `#101010` | 红色，红字 |

### 结构

- `.ticket`/`.ticket-modpanel` — 主容器
- `.ticket-header` — 标题
- `.ticket-image` — 左侧图片区
- `.ticket-content` — 内容区，最后一段右对齐
- `.ticket-footer` — 底部

---

## 15. Mbox 消息框模板

`Template:Mbox` 的通用消息框。

### 主题变量

通过 CSS 自定义属性分别在日间/夜间模式下定义颜色变量：

```
--mbox-text-color
--mbox-border-color
--mbox-border-left-color
--mbox-background-color
```

### 布局

- 宽度 80%，居中
- 左侧 8px 粗边框（颜色区分类型）
- `.mbox-tiny` 紧凑模式
- `.mbox-row` 使用 Flex 布局
- `.mbox-image` 左侧图标
- `.mbox-content` 中间内容
- `.mbox-aside` 右侧附加信息

---

## 16. Documentation 模板

`Template:Documentation` 的样式。

### 结构

- `.documentation-header` — 头部，含操作菜单
- `.documentation-actions` — 浮动右侧的操作按钮
- `.documentation-action-menu` — 下拉菜单，默认隐藏，悬停显示
- `.documentation-content` — 主要内容区
- `.documentation-footer` — 底部

### 交互

悬停操作按钮时显示下拉菜单，带渐入动画。

---

## 17. Quote 引用模板

`Template:Quote` 的样式。

- 使用 `display: table` 布局
- 左右两侧显示大号引号（`"`）
- 中间为引用内容
- 底部为来源（`caption-side: bottom`）

---

## 18. Special:Community 页面修复

修复社区页面的样式问题：

- 移除待办事项模块的边框
- 调整卡片徽章为圆形（48px）
- 自定义卡片路径图标样式

---

## 19. FANDOM 图标字体与导航

### 19.1 字体定义

```css
@font-face {
    font-family: 'FANDOM-Icons';
    src: url('...') format('woff2');
}
```

从 Dev Wiki 加载 FANDOM 图标字体。

### 19.2 导航图标应用

为全局导航和用户菜单中的列表项添加图标：

- 使用 `:before` 伪元素插入图标
- 设置 `font-family: 'FANDOM-Icons' !important`
- 开启连字特性（`font-feature-settings: "liga"`）

### 19.3 右侧栏修复

```css
.rail-module {
    background: transparent;
}
```

修复右侧浮块背景色问题。

---

## 20. Headerblock 与页面头部

用于 `MediaWiki:Newarticletext` 等页面顶部的通知块。

### 样式

- 左侧 15px 粗绿色边框（`#b4b082`）
- 右侧有半透明背景图片（`::before` 伪元素）
- 链接悬停时出现背景色和阴影

### 图片

背景图来自茶馆 Wiki（`daosuchaguan`）的一张图片。

---

## 21. Tabber、跨语言链接等杂项

### 21.1 Tabber

```css
.wds-tabber {
    overflow: visible;
}
```

防止 Tabber 内容被裁切。

### 21.2 跨语言链接

- 当前选中语言加粗
- 悬停无下划线

### 21.3 嵌入通知

```css
.transclude-notice-top,
.transclude-notice-bottom
```

嵌入模板的顶部/底部通知条。

### 21.4 导航栏动画

```css
@keyframes dropdown-topnav {
    from { opacity: 0; top: 30px }
    to { opacity: 1; top: 40px }
}
```

下拉菜单展开时的淡入 + 下滑动画。

---

## 22. 数据表与模板数据样式

### 22.1 DataTable

- 移除宽表格前的阴影
- `JSobject` 列使用等宽字体
- `data-attr` 列使用斜体

### 22.2 TemplateData

- 段落和定义列表边距重置
- OOUI 小部件背景透明

---

## 23. 图片渲染与粘性头修复

### 23.1 图片渲染

```css
.mw-parser-output img {
    image-rendering: crisp-edges;
}
```

对小图片禁用抗锯齿，保持清晰像素风格。

### 23.2 粘性头层级修复

- `.fandom-sticky-header.is-visible` 设为 `z-index: 499`
- 通知头设为 `z-index: 500`
- 防止"全部标记为已读"按钮被遮挡

---

## 24. 站点图标与卡片动效

### 24.1 站点图标放大

```css
.fandom-community-header__image img {
    transform: scale(1.5);
    transition: all 0.68s ease;
}
.fandom-community-header__image img:hover {
    transform: scale(1.61) rotate(1.2deg);
}
```

站点图标放大 1.5 倍，悬停时进一步放大并轻微旋转。

### 24.2 卡片浮起效果

```css
.el-card {
    box-shadow: none;
    transition: all .38s ease-in-out;
}
.el-card:hover {
    box-shadow: 0 1.2px 6px rgba(0, 0, 0, .2);
}
```

卡片悬停时产生阴影浮起效果。

### 24.3 缩放卡片

```css
.sl-card:hover {
    transform: scale(1.08);
}
```

悬停时卡片放大 1.08 倍。

---

## 25. 日间/夜间模式切换

```css
.theme-fandomdesktop-light .onlydark { display: none; }
.theme-fandomdesktop-dark .onlylight { display: none; }
```

- 在日间模式下隐藏".onlydark"元素
- 在夜间模式下隐藏".onlylight"元素
- 实现同一页面在不同主题下显示不同内容

---

## 26. 页眉滚栏与背景

### 26.1 Level 37 页眉

`.headerbox` + `.scrollheader2` 配合实现：
- 金褐色渐变背景
- 底部滚动图片（`37ScrollHeader.png`）
- `slide2` 动画 120 秒循环

### 26.2 Level 1 页眉

`.header_box1` + `.scroll_header1` 配合实现：
- 类似结构
- 使用 Level 1 的背景图
- `slide1`（横向）或 `slide3`（纵向）动画

### 26.3 动画说明

| 动画 | 方向 | 时间 | 说明 |
|------|------|------|------|
| `slide1` | 横向 | — | 背景左右往返滑动 |
| `slide2` | 横向 | 120s | 无限循环向左滚动 |
| `slide3` | 纵向 | 120s | 背景上下往返滑动 |

### 26.4 `featureflavor`

金褐色圆角块，带悬停过渡效果。

---

## 27. 楼层列表与实体条目

用于 Backrooms 楼层（Level）和实体列表页面。

### 27.1 `.entityentry` — 实体条目

- 次要背景色，带边框和阴影
- 80% 字号，斜体
- `.entitylistname` — 加粗大号名称

### 27.2 `.entries` — 列表

- 无列表样式
- 每个条目样式与 `entityentry` 类似
- 一级条目链接字号 150%
- 子条目（`.sub-entries`）链接字号 120%  
- 子条目标记为 `↳`

---

## 28. Blurimage 与 Blurquote

### 28.1 工具类

- `.no-margin-p p` — 移除段落的全部边距
- `.blurbehind` — 毛玻璃效果容器（`backdrop-filter: blur(4px)`）

### 28.2 Blurquote 变体

- `.blurquote-noperson` — 隐藏引用来源
- `.blurquote-noborder` — 移除深色块内边距

---

## 29. 全屏背景与覆盖层

### 29.1 `.backgroundplate` — 背景板

- 固定全屏定位
- `object-fit: cover` 确保铺满
- `z-index: -2` 置于页面内容下方
- 禁止交互和选中

### 29.2 `.coverplate` — 覆盖层

- 类似结构，但 `z-index: 100000`
- 用于页面最顶层的覆盖效果

---

## 30. SD Banner 修复

针对 Survival Difficulty（生存难度）横幅的修复：

- 在宽度 ≤ 1200px 时隐藏六边形元素（`#class-hexagon` 等）
- `flex-columns` 在小屏时改为纵向排列
- `.sd-fix p` 移除段落边距
- 站点名称和图标增加顶部内边距

---

## 31. Overflow 布局修复

一次性修复大量 Fandom 元素的 `overflow` 问题：

```css
.fandom-community-header__community-name,
.fandom-sticky-header__sitename,
/* ...更多选择器... */
.post__og-summary {
    overflow: visible !important;
}
```

防止标题、导航、侧栏等元素的内容被意外裁切。

`h2` 单独设置：横向 `visible`，纵向 `hidden`。

---

## 32. 图片适配工具类

来自用户 `0.Phixley` 的样式（`User:0.Phixley/styles/An.css`）：

| 类名 | 行为 |
|------|------|
| `.fit-image` | 图片自适应（`object-fit: contain`），保持比例 |
| `.cover-image` | 图片铺满容器（`object-fit: cover`） |

---

## 33. 字符装饰工具类

来自用户 `0.Phixley` 的样式（`User:0.Phixley/styles/Character.css`），通过 `::after` 伪元素在元素后插入特定字符：

| 类名 | 插入内容 |
|------|---------|
| `.dash` | `——`（中文破折号） |
| `.single-dash` | `—`（单破折号） |
| `.separator` | `/`（分隔符） |
| `.ampersand` | `&` |
| `.space` | 空格 |
| `.en-space` | 半角空格（` `） |
| `.em-space` | 全角空格（` `） |

### 全局链接装饰

```css
:root {
    --theme-link-decoration: none;
}
```

移除全局链接下划线。

---

## 34. GoodWork2 完整版

这是一个对 `Template:GoodWork2` 的完整重写，包含嵌套 SCSS 风格的 `.goodwork2 { ... }` 包裹块。

### 主要特性

- **外框**：有边框、阴影、相对定位
- **视口**：绝对定位的裁剪容器
- **遮罩**：渐变遮罩覆盖在图片上，从透明渐变到背景色
- **交互**：悬停时遮罩和图片分别移动，露出更多背景
- **日间/夜间适配**：`.theme-fandomdesktop-dark &` 嵌套修改配色
- **标题**：`.gtitle_c`，不同主题下颜色不同（浅色: `#8b171d`，深色: `#e8621a`）
- **描述**：`.gdes`，60% 宽度，位于左下区域

---

## 35. 票模板链接颜色修复

```css
.theme-fandomdesktop-light .ticket a,
.theme-fandomdesktop-dark .ticket a {
    color: #922C2C !important;
}
.theme-fandomdesktop-light .ticket a:hover,
.theme-fandomdesktop-dark .ticket a:hover {
    color: #431414 !important;
}
```

无论日间/夜间模式，票模板中的链接统一使用深红色，悬停时进一步加深。

---

## 总结

`common.css` 是一个面向 **Backrooms Fandom 中文维基** 的大型全局样式表，涵盖了：

- **基础设施**：字体导入、图标字体、CSS 变量
- **内容创作工具**：各种 div 块容器（深色、浅色、带边框、带水印）
- **图片展示**：可放大图片（左/右浮动）、自适应图片
- **动效文字**：彩虹渐变、波浪抖动
- **模板样式**：票模板、消息框、引用、文档、优秀作品
- **首页布局**：Flex 响应式布局
- **主题适配**：全面支持日间/夜间模式
- **Bug 修复**：Overflow、层级、布局等 Fandom 常见问题
- **页面定制**：页眉滚栏、背景板、楼层列表等

该文件是 Fandom 维基自定义 CSS 的典型范例，展示了如何在 MediaWiki 平台上利用 CSS 自定义属性、`@import`、`@font-face`、动画和响应式设计来打造沉浸式的 Wiki 浏览体验。
