# Novel Project Kit v1 设计

## 产品目标

Novel Project Kit 是面向 Codex、Claude Code 等文件型 Agent 的长篇小说工程协议。它不托管模型、不上传正文，也不要求账户。Agent 按 Novel Skill 维护一个本地小说目录；Validator 用确定性规则检查格式和引用；Viewer 在浏览器中直接读取该目录并把进度、人物、故事弧、时间线与伏笔呈现为创作者工作台。

第一版成功标准是一个真实闭环：用户能复制模板创建项目；Agent 能知道创建小说和续写章节时应该读写哪些文件；`novel validate` 能发现结构、状态和引用错误；静态 Viewer 能打开本地文件夹或内置示例，并浏览全部核心档案。文件不会离开浏览器，项目也不依赖数据库或 AI API。

## 系统边界与架构

系统由四层组成。Novel Project Format v1 是唯一交换协议，采用 Markdown + JSON + JSONL：正文、方向、风格和章计划使用 Markdown；人物、故事弧、支线、伏笔与当前状态使用 JSON；时间线使用逐行追加的 JSONL。Novel Skill 是 Director + Protocol，规定开书、规划、写章、审查、状态更新和分析时的最小上下文。Validator 是 Guardrail，负责 JSON Schema、必需文件、ID 唯一性、跨文件引用、章节号、时间线顺序和状态冲突。Viewer 是纯静态 Renderer，把用户选择的目录读取为内存中的文件映射，再调用与 CLI 相同的解析与校验核心。

`state/locks.json` 是用户 Canon 权限边界。文件锁禁止 Agent 改写整个文件；字段锁禁止改写指定 JSON 字段。Agent 只保存小说事实和创作决定，不保存内部思考过程。默认写章流程固定为：读取当前状态与锁定规则 → 组装相关记忆 → 生成 Chapter Plan → 一致性预检 → 一次生成整章 → 低成本复审与小修 → 更新摘要和状态 → 运行 Validator。

## Format v1

项目根目录包含 `novel.json`、`story/`、`characters/`、`world/`、`plots/`、`timeline/`、`plans/`、`chapters/`、`summaries/` 和 `state/`。`novel.json` 保存版本、书名、题材、目标长度和当前统计；`story/arcs.json` 保存可量化的长期故事弧；人物一人一档，避免一个巨型文件；`soft-plots.json` 保存可动态发展、合并或放弃的支线；`foreshadowing.json` 区分 open、developing、resolved、abandoned；`events.jsonl` 的事件包含稳定 ID、章节号、故事内日期和实体引用；每章正文、计划、摘要使用相同三位章节编号。

锁定优先级高于 Agent 生成内容。Validator 把引用不存在、解析失败和状态矛盾视为 error，把长期未推进、缺失可选内容等视为 warning。Viewer 即使遇到 warning 仍可打开项目；遇到局部解析错误时显示诊断，不向服务器发送任何数据。

## Viewer 体验与视觉系统

初始状态加载自带的《昨日醒来的人》示例，保证网站打开即能理解。主按钮“打开小说项目”触发文件夹选择；拖入目录也应工作。成功读取后，顶部显示标题、题材、隐私说明和项目切换入口。左侧导航提供总览、章节、人物、故事弧、时间线、伏笔、世界观。总览复现概念图中的进度带、活跃故事弧、最近写作、人物近况和伏笔状态；其他页面使用同一套编辑稿纸视觉，以列表、正文栏和时间线为主，不引入卡片瀑布流。

设计令牌：暖纸底 `#f4f0e8`，纸面 `#fffdf8`，墨色 `#1f211f`，次级墨色 `#6f6b63`，朱砂 `#b73524`，橄榄 `#68764b`，细线 `#d8d0c3`。内容标题使用中文衬线字体栈，界面控件使用系统无衬线字体。边角 4–10px、阴影极轻、无渐变。窄屏下导航折叠为顶部横向栏，内容改为单列，所有页面保持键盘焦点和可读对比度。

## 测试与完成条件

核心测试覆盖：有效示例零 error；缺少必需文件；JSON 解析失败；重复 ID；人物、地点、故事弧、支线和伏笔的悬空引用；resolved 伏笔仍列为 open；章节文件与 current 状态不一致；时间线倒序。CLI 验证有效示例退出 0、无效夹退出非 0。Viewer 构建必须通过 TypeScript 与 Vite，浏览器中应能加载示例、切换七个页面、打开本地目录并显示校验结果；桌面与窄屏都不得横向溢出。最终用概念图和浏览器截图逐点核对布局、颜色、字阶、导航、进度带和信息密度。
