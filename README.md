# fuwari-launcher

这个分支**只放启动器本身**，不含站点本体。站点（`src/`、`public/`、文章、配置）住在 `main` 分支。

- 启动器说明与全部功能：[`launcher/README.md`](launcher/README.md)
- 接口与内部契约：[`launcher/CONTRACT.md`](launcher/CONTRACT.md)

## 启动

启动器要改的是**站点所在的 checkout**，所以必须告诉它目标在哪里：

```bash
# 代码在本目录，改 E:\fuwari 的站点
LAUNCHER_ROOT=E:\fuwari node launcher/server.mjs   # → http://127.0.0.1:5199/
```

Windows 上双击 `start-launcher.cmd` 即可：它默认把目标指向同级的 `fuwari` 目录（也可用第一个参数或 `LAUNCHER_ROOT` 覆盖）。

这个分支没有 `package.json` 依赖、也没有 lockfile，**不要在这里跑 `pnpm`**（它会因为 `node_modules` 是别人的 junction 而拒绝安装）。用 `node` 直接跑即可。启动器处理 `src/config.ts` 时要靠 `node_modules` 里的 `typescript`，用一个 junction 指到站点 checkout 的就够：

```bat
mklink /J node_modules ..\fuwari\node_modules
```

## 不要做的事

- 不要把 `main` 合并进这个分支：那会把整个站点本体搬回来。要读站点内容，用 `LAUNCHER_ROOT` 指过去。
- 这个分支不参与站点构建与 CI，也不要在这里执行 `astro build`。

站点侧（`main`）的 `pnpm dev` 会自动发现同级的这个目录，把启动器和 `localhost:4321` 的预览一起拉起来。
