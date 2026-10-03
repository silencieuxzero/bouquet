---
title: "Character 模板使用指南"
published: 2026-07-16T21:49:00
description: "全面介绍 Character 模板的使用方法和参数详解，适合新用户入门参考。"
image: "/长征机头像.png"
category: "教程"
tags: ["教程", "Fandom", "模板"]
draft: false
---

# Character 模板使用指南

Character 模板是本 Wiki 中用于快速创建角色信息页的标准模板。它提供了一套预定义的信息框结构，帮助编辑者统一展示角色的核心设定资料。

### 1 模板调用方式

在角色页面中，将以下代码放在页面最顶部即可调用 Character 模板：

```wikitext
{{Character
|file=
|link=
|name=
|gender=
|age=
|id=
|born=
|status=
|content=
|process=
|skill=
|about=
|art=
}}
```

### 2 参数详解

| 参数 | 说明 | 示例 |
|------|------|------|
| `file` | 角色立绘文件名（必填） | `长征61.jpeg` |
| `link` | 角色链接（必填） | `User:Appennino` |
| `name` | 角色名称（必填） | `洛疏律` |
| `gender` | 性别 | `男`、`女` |
| `age` | 年龄 | `24岁` |
| `id` | 角色身份（必填） | `茶客` |
| `born` | 归属地（必填） | `中华人民共和国` |
| `status` | 当前状态 | `存活`、`已故`、`失踪` |
| `content` | 角色描述（必填） | `一个可爱的男生` |
| `process` | 角色经历（必填） | `出生于中华人民共和国` |
| `skill` | 角色技能（必填） | `技能占位符。` |
| `about` | 角色关于（必填） | `关于占位符。` |
| `art` | 角色图片（必填） | `艺术占位符。` |

### 3 完整示例

以下是一个完整的角色页面示例：

```wikitext
{{Character
|file=长征61.jpeg
|link=User:Appennino
|name=洛疏律
|gender=男
|age=17
|id=茶客
|born=中华人民共和国
|status=<span style="color:#27ae60">活跃</span>
|content=一个可爱的男生
|process=出生于中华人民共和国
|skill=
技能占位符。
|about=
关于占位符。
|art=
<gallery type="slider">
长征61.jpeg|长征机|link=长征机|linktext=<small>自动化！</small>
</gallery>
}}
```

### 4 注意事项

1. **参数顺序无关**：模板支持命名参数，参数可以按任意顺序书写
2. **可选参数可省略**：不需要的参数直接不写即可
3. **图片格式**：图片需先上传到 Wiki，然后填写文件名

### 5 扩展技巧

**多图展示：**

在 `gallery` 参数中可使用 `<gallery>` 标签：

```wikitext
<gallery type="slider">
长征61.jpeg|长征机|link=长征机|linktext=<small>自动化！</small>
长征62.jpeg|长征机|link=长征机|linktext=<small>自动化！</small>
</gallery>
```

---
