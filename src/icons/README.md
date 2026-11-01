# src/icons

本地 SVG 图标放这里，astro-icon 会把它们暴露为 `Icon name="<文件名>"`。

目前站点只用 Iconify 图标集（`material-symbols:*`、`fa6-*:*`），这个目录保持为空即可 ——
但**不要删掉它**：astro-icon 的默认 `iconDir` 就是这里，目录不存在时它每次构建都会打一条
`Failed to load icons from "src/icons": ENOENT` 警告。
