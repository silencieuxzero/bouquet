# 博客本地启动器（launcher）

在浏览器里改这台机器的 fuwari 站点配置与内容：外观、图片、导航、音乐、画廊、文章、加密、数据、备份、部署、预览，以及启动器自己的外观设置。
只监听 `127.0.0.1`，不出网，无第三方资源，前端零构建（原生 ESM）。

## 启动

```bash
pnpm launcher
# 然后打开 http://127.0.0.1:5199/
```

换端口：`LAUNCHER_PORT=5300 pnpm launcher`。

`pnpm dev` 也会顺带把启动器拉起来（先找本仓库的 `launcher/server.mjs`，再找 `LAUNCHER_HOME`、同级 `../fuwari-launcher`，都没有就只起站点）：一条命令同时得到
`localhost:4321` 的站点与 `127.0.0.1:5199` 的启动器，关掉站点时启动器一起退。只想起站点用 `pnpm dev:astro` 或 `pnpm dev --no-launcher`（或 `LAUNCHER=0`）。

Windows 上还有 `start-launcher.cmd`（仓库根，双击即可）：它自动把「编辑哪个 checkout」指向同级的 `fuwari` 目录，也可以用第一个参数或 `LAUNCHER_ROOT` 覆盖：

```bat
start-launcher.cmd              :: 自动挑同级 fuwari，没有就编辑自己所在目录
start-launcher.cmd D:\some\repo  :: 显式指定被编辑的仓库
```

启动器默认操作**代码所在的那个 checkout**。要让一个启动器副本驱动别的 checkout（例如代码在 `E:\fuwari-launcher`、内容在 `E:\fuwari`）：

```bash
cd E:\fuwari
LAUNCHER_ROOT=E:\fuwari node E:\fuwari-launcher\launcher\server.mjs
```

此时 `ROOT`（改哪里）由 `LAUNCHER_ROOT` 决定，而界面文件与路由模块仍从这个副本自己的目录读（`CODE_DIR`）。启动日志第二行会打印 `target repository: ...`，先看这一行确认它指向正确的目录。

## 外观

默认是**白底 Metro 风**（直角、细边框、强调色左边条、无阴影）。所有颜色与尺寸都是 CSS 变量，设置页只改这些变量，不动站点本身：

- 配色模式：浅色（默认）/ 深色 / 跟随系统；
- 强调色：Metro 蓝、青、靛蓝、松绿、石板灰；
- 排版：正文字号、界面密度、卡片圆角、是否显示侧边栏图标。
- 侧边栏图标取自站点同款 Material Symbols（`@iconify-json/material-symbols`），已内联成 `launcher/ui/icons.mjs`，离线可用、无 CDN、不加新依赖。

偏好保存在 `.launcher/ui-settings.json`（随 `.launcher/` 一起被 gitignore）。改动在页面上即时预览，点「保存设置」才落盘。

## 十一个分区能做什么

| 分区 | 作用 | 落盘位置 |
| --- | --- | --- |
| 站点外观 | schema 驱动的表单（标题、横幅、目录、主题色…），先看 diff 再保存 | `src/config.ts`（AST 原位改写，注释不动） |
| 图片 | 背景图 / 横幅图 / 头像（输入框 + 缩略图预览 + 上传）、图标列表 favicon 的逐行编辑、public 图片资源库（缩略图 + 一键选用） | `src/config.ts`、`public/` |
| 导航与资料 | 导航链接、Profile、许可协议、代码主题 | `src/config.ts` |
| 音乐与画廊 | 歌曲增删排序、画廊逐图编辑与上传 | `src/config.ts`、`src/data/gallery.json`、`public/` |
| 文章 | posts/essay/oc/spec 四集合：列表、frontmatter 表单、markdown 左编辑右预览、新建、归档 | `src/content/**`、`.launcher/trash/` |
| 加密 | 封装 `scripts/encrypt-post.mjs`，展示 stdout/stderr，列出 `private/source` 里可加密的明文与已加密文章 | `public/encrypted/*.enc` |
| 数据 | `tutorials.json` 条目编辑 | `src/data/tutorials.json` |
| 备份 | 快照列表与一键恢复 | `.launcher/backups/<id>/` |
| 部署 | 仓库状态、单文件 diff、提交、推送（触发 Netlify 构建） | git 历史 |
| 预览 | 起停 `astro dev` 并 iframe 嵌入（默认 4321） | 无 |
| 设置 | 启动器自身外观：配色模式、强调色、字号、密度、圆角、分区图标开关 | `.launcher/ui-settings.json` |

## 安全网

- **每次写盘前自动快照**到 `.launcher/backups/<id>/`（`manifest.json` + 文件镜像），写后回读字节校验。
- 保存结果卡片会展示**变更字段 + 真实 unified diff + 备份 ID**，并提供「回滚到备份」按钮。
- 文章归档不是删除：移到 `.launcher/trash/`。
- 部署**不会**自动提交或推送；commit / push 都要你手动点，push 前有确认框。
- `.launcher/` 已在 `.gitignore` 中，快照不会被提交。

## 目录

```
launcher/
  server.mjs          # 启动 + 静态服务 + 自动加载 modules/*.mjs
  core/               # http、router、paths、backup、config-ast、data-json、upload、deploy、preview、config-schema、ui-settings
  modules/            # 每个端点的路由模块，各导出 register(app)
  content/            # 内容集合、frontmatter 键级改写、文章 CRUD、加密封装
  ui/                 # index.html + style.css + app.mjs + api.mjs + theme.mjs + components/ + views/
  test/               # node:test（core 6 + content 25 + ui-models 7 + ui-settings 5）
  CONTRACT.md         # 端点、信封、路径语法等完整契约
```

## 接口约定（供二次开发）

- 统一信封：成功 `{ok:true,data}`，失败 `{ok:false,error:{code,message,details}}`。
- 配置路径语法：`siteConfig.banner.height`、`navBarConfig.links[3].name`、`musicConfig.songs`；非字面量值以 `{"__ref":"LinkPreset.Home"}` 形式读写。
- 端点全集见 `CONTRACT.md`。
- 底部提示框默认 5 秒后淡出（450ms 淡出动画）；表示「正在运行/正在启动」这类必须持续可见的状态会带 `{sticky:true}` 常驻，直到被替换。

## 测试

```bash
node --test launcher/test/ui-settings.test.mjs launcher/test/ui-models.test.mjs
node --test launcher/test/core.test.mjs launcher/test/content.test.mjs
```

## 环境变量

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `LAUNCHER_PORT` | `5199` | 启动器端口 |
| `LAUNCHER_ROOT` | 代码所在 checkout | 被操作的仓库根（读写的 config/内容/备份都在这里）；指向不存在的目录会直接退出 |
| `LAUNCHER_PREVIEW_PORT` | `4321` | 预览用的 astro dev 端口 |
| `LAUNCHER_PREVIEW_ARGS` | 空 | 追加给 astro dev 的参数（如 `--ignore-lock`，仅调试用） |

## 已知限制

- 单用户、无鉴权：仅绑 `127.0.0.1`，不要改 `HOST` 后暴露到公网。
- 预览需要 4321 空闲；端口被占时启动会明确返回 `409 preview-failed / port-busy`，请先停掉你自己的 `pnpm dev`。
- 加密需要密码：脚本在非 TTY 且无 `POST_PASSWORD` 时会先报「未提供密码」，请在加密面板里填。
- frontmatter 只支持契约描述的子集；块映射、锚点、重复键会返回 `400 frontmatter-unsupported` 而不是猜着写。
- 上传走文件选择器或 `POST /api/upload`（`x-filename` + `x-dir`），默认遇同名返回 `409`，需显式覆盖。

## 回滚

- 单次改动：结果卡片上的「回滚到备份」，或 `POST /api/backups/<id>/restore`。
- 整体回到某个提交：`git checkout -- src/`（启动器从不自动提交，所以 git 状态始终可读）。
