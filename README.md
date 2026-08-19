# 章法 · Novel Project Kit

章法把一部长篇小说当作可校验的软件项目：Agent 负责写作，Skill 负责流程，文件负责长期记忆，Validator 负责一致性，静态 Viewer 负责本地可视化。

**在线 Viewer：<https://mickeywzt.github.io/novel-project-kit/>**

## 已包含

- **Novel Project Format v1**：Markdown + JSON + JSONL 的稳定文件协议。
- **Novel Skill**：面向 Codex、Claude Code 等文件型 Agent 的选择性读取、章节规划、连续生成、复审和状态更新规则。
- **Validator CLI**：检查 JSON Schema、必需文件、重复 ID、跨文件引用、章节状态、时间线顺序、锁定目标和伏笔状态。
- **本地优先的静态 Viewer**：在浏览器里直接打开小说目录；总览、章节、人物、故事弧、时间线、伏笔和世界观全部可查看。
- **结构化界面演示**：《昨日醒来的人》提供 27 个章节位和短节选，用于展示项目结构与界面，不冒充完整小说正文。

Viewer 不包含账号、后端、数据库或 AI API。选择的小说文件只进入当前浏览器内存，不会上传；公开网站本身也不会保存你的小说。

## 开始使用

需要 Node.js 22 或更高版本。

最直接的方式是打开[在线 Viewer](https://mickeywzt.github.io/novel-project-kit/)，点击“打开小说项目”并选择包含 `novel.json` 的小说目录，也可以把目录拖入页面。

如果希望完全离线使用，Windows 最简单的方式是直接双击项目根目录中的 **`启动章法.cmd`**。它会启动本地服务器并自动打开正确网页。不要直接双击 `index.html`；`file://` 无法运行 Vite 模块。

也可以手动启动本地 Viewer：

```powershell
npm.cmd install
npm.cmd run dev -- --port 4173
```

然后打开 <http://localhost:4173/>。页面默认载入示例；点击“打开小说项目”可选择自己的项目文件夹，也可以把目录拖入页面。

生产构建：

```powershell
npm.cmd run build
```

生成的 `dist/` 是可部署到任意静态托管的站点。仓库中的 GitHub Actions 会在 `main` 更新后自动部署公开 Viewer。

## 创建与校验小说项目

```powershell
node bin/novel.mjs init D:\Novels\my-novel
node bin/novel.mjs validate D:\Novels\my-novel
node bin/novel.mjs stats D:\Novels\my-novel
```

机器可读校验：

```powershell
node bin/novel.mjs validate D:\Novels\my-novel --json
```

`init` 只会写入空目录，避免覆盖已有小说。

## 安装 Novel Skill

从 [Releases](https://github.com/MickeyWzt/novel-project-kit/releases) 下载 `manage-long-form-novel-skill.zip` 并解压到 Agent 的技能目录，或直接复制仓库中的 [`novel-skill`](./novel-skill) 目录。让 Agent 在创建、续写、复审或分析长篇小说时使用 `manage-long-form-novel`。Skill 会先读取 `state/locks.json`，用户锁定的 Canon 不会被 Agent 擅自覆盖，并会在合适的交付节点提示用户打开 Viewer 检查结果。

在 Codex 中，典型请求是：

```text
使用 manage-long-form-novel，在 D:\Novels\my-novel 创建一本青春悬疑小说。
```

或：

```text
继续写下一章。先给我看 Chapter Plan，通过后再生成整章。
```

完整格式与工作流分别位于：

- [`novel-skill/references/format-v1.md`](./novel-skill/references/format-v1.md)
- [`novel-skill/references/workflows.md`](./novel-skill/references/workflows.md)

## 目录

```text
core/                  共享解析、Schema、校验和统计
bin/                   novel CLI
novel-skill/           可分发的 Agent Skill 与项目模板
examples/              27 章示例小说
src/                   React Viewer
scripts/               示例与静态 demo 打包脚本
tests/                 核心与 CLI 测试
docs/                  设计、实施计划和视觉验收证据
```

`examples/yesterday-awake` 是格式与界面演示：章节文件仅含短节选，摘要中的目标字数用于模拟长篇项目状态，不代表仓库包含对应长度的完整正文。

## 发布状态

当前版本为 `v0.1.0-beta`。格式、Validator、Skill 与 Viewer 已形成可运行闭环，但仍欢迎真实长篇项目反馈与兼容性问题。请通过 [GitHub Issues](https://github.com/MickeyWzt/novel-project-kit/issues) 提交反馈。

## 验证

```powershell
npm.cmd test
npm.cmd run check
npm.cmd run build
npm.cmd run validate:template
npm.cmd run validate:demo
```
