# CodeGraph 博客增量补充设计

- **日期**：2026-06-28
- **目标**：将 `docs/blog/codegraph.md` 从约 158 行的精简版扩充为覆盖官方 GitHub README 全量新内容的版本。保留现有结构，新增 12 个章节，扩展 2 个章节（CLI 命令、MCP 工具），重写 1 个章节（基准测试），新增 front matter tags。
- **范围**：仅修改 `docs/blog/codegraph.md` 一个文件。
- **内容来源**：GitHub `colbymchenry/codegraph` 仓库 README（已通过 webfetch 抓取并完整解析），不做任何功能、命令、指标的自编。

## 现状

`docs/blog/codegraph.md`（158 行）当前已覆盖：

- 概述（带 README 链接）
- 核心特性（9 条 bullet）
- 工作原理（含 ASCII 架构图 + 4 步流程）
- 安装（macOS/Linux curl、Windows irm、npm、升级）
- 使用（install agent → init project → 重启）
- CLI 命令（13 条简化版）
- MCP 工具（4 条表格）
- 基准测试（聚合均数表 + 7 仓库简表）
- 支持的平台（Win/macOS/Linux x64/arm64）
- 资源链接（GitHub / 文档 / npm）

未覆盖且官方 README 已完整收录的：

- v1.0 发布说明与升级命令
- Auto-Sync 三层机制（watcher + per-file banner + connect-time catch-up）
- 完整 21 条 CLI 命令（缺 `uninstall` / `uninit` / `unlock` / `daemon` / `telemetry` / `files` / `affected` / `version` / `help`）
- 完整 8 条 MCP 工具 + 默认隐藏的 7 个 + `CODEGRAPH_MCP_TOOLS` 环境变量 + 单工具 vs 多工具的设计理由
- `codegraph install` flags 表与 `--print-config` 用法
- `codegraph affected` + CI 钩子集成示例
- 库嵌入 API（npm 包嵌入示例 + 底层构建块 + Node 22.5+ 要求）
- `codegraph.json` 配置（exclude + extensions）+ 默认排除清单
- 7 个环境变量
- 遥测透明度（收集项、不收集项、3 种关闭方式）
- 22 种语言的详细状态表
- 17 个 Web 框架的路由覆盖百分比
- 10 个跨语言边界桥接（Swift ↔ ObjC / RN bridge / RN TurboModules / RN events / Expo Modules / Fabric / Paper）
- 7 条故障排查 FAQ
- 跨文件覆盖率（22 种语言的实测覆盖率）

## 变更清单

### Front Matter

```yaml
---
title: CodeGraph - AI 代码智能助手
createTime: 2026/06/28 00:00:00
permalink: /blog/codegraph/
tags:
  - AI
  - 代码知识图谱
  - MCP
  - 开源工具
  - AI 编程助手
---
```

变更：

- `createTime`: `2026/06/14` → `2026/06/28`
- 新增 `tags` 数组（5 项中文精简组合）

### 现有章节：改写 3 处、保留 7 处

| 章节 | 类型 | 说明 |
|------|------|------|
| 概述 | 保留 | 不动 |
| 核心特性 | 保留 | 不动 |
| 工作原理 | 保留 | 不动 |
| 安装 | 保留 | 不动 |
| 使用 | 保留 | 不动 |
| CLI 命令 | **改写** | 13 行简化表 → 21 行完整表 + `install` flags 表 + `affected` 子章节 + CI 钩子示例 |
| MCP 工具 | **改写** | 4 行表 → 8 行表 + 默认暴露设计理由 + `CODEGRAPH_MCP_TOOLS` 重新启用说明 |
| 基准测试 | **改写** | 聚合均数 + 7 仓库简表 → 7 仓库 6 列明细 + 普适收益总结 + 成本规模性注解 + benchmark query 表 + methodology 说明 |
| 支持的平台 | 保留 | 不动 |
| 资源链接 | 保留 | 不动 |

### 新增章节：12 节（追加在「资源链接」之后）

按以下顺序追加：

1. **新增特性（v1.0）**
   - v1.0 已发布；`codegraph upgrade` 一键升级
   - 核心价值回顾（surgical context · fewer tool calls · faster · 100% local）

2. **始终新鲜：Auto-Sync 三层机制**
   - 第一层：原生文件监听 + 2000ms 防抖（`CODEGRAPH_WATCH_DEBOUNCE_MS`，clamp `[100ms, 60s]`）
   - 第二层：逐文件陈旧横幅（`⚠️` 引导代理直接 Read 待同步文件）
   - 第三层：连入时对账（`(size, mtime)` + content-hash reconciliation）
   - ASCII 流程图：`agent writes → watcher fires → debounce → sync → next query sees it`

3. **完整 CLI 命令**
   - 21 条命令完整列表（保留现有 13 条 + 新增 8 条）
   - 新增命令：`install` flags / `uninstall` / `init` / `uninit` / `index` / `sync` / `status` / `unlock` / `query` / `explore` / `node` / `files` / `callers` / `callees` / `impact` / `affected` / `daemon` / `telemetry` / `upgrade` / `version` / `help`
   - `codegraph install` flag 表：`--target` / `--location` / `--yes` / `--no-permissions` / `--print-config`

4. **`codegraph affected` + CI 集成**
   - 三个用法示例（参数列表 / `--stdin` 管道 / 自定义 `--filter`）
   - 5 个选项表（`--stdin` / `-d,--depth` / `-f,--filter` / `-j,--json` / `-q,--quiet`）
   - CI/钩子 bash 脚本完整示例（git diff → affected → vitest run）

5. **完整 MCP 工具**
   - 8 条工具表（含 `codegraph_explore` 是唯一默认暴露的设计理由）
   - `codegraph_explore`：核心工具，一次调用返回源代码 + 调用路径 + 爆炸半径
   - 默认隐藏工具：`codegraph_node` / `codegraph_search` / `codegraph_callers` / `codegraph_callees` / `codegraph_impact` / `codegraph_files` / `codegraph_status`
   - 重新启用方法：`CODEGRAPH_MCP_TOOLS=explore,node,search,callers`
   - 跨项目查询：`projectPath` 参数

6. **库嵌入 API**
   - npm 包导入示例：`import CodeGraph from '@colbymchenry/codegraph'`
   - 完整 API 演示：`init` / `indexAll` / `searchNodes` / `getCallers` / `buildContext` / `getImpactRadius` / `watch` / `unwatch` / `close`
   - 底层构建块：`DatabaseConnection` / `QueryBuilder` / `getDatabasePath` / `initGrammars` / `loadGrammarsForLanguages` / `FileLock`
   - 嵌入要求：Node 22.5+（Electron 内嵌 Node 需达标）；CLI 与 MCP 不受影响
   - TypeScript 类型与 `skipLibCheck: true` 提示

7. **配置文件 codegraph.json**
   - 零配置为默认；可选文件仅用于自定义
   - `exclude` 示例：`{"exclude": ["static/", "**/vendor/**"]}`
   - `extensions` 示例：`{"extensions": {".dota_lua": "lua", ".tpl": "php"}}`
   - 默认排除清单：`node_modules` / `vendor` / `dist` / `build` / `target` / `.venv` / `Pods` / `.next`、`.gitignore` 内容
   - 文件大小限制：> 1 MB 自动跳过
   - 添加后需 `codegraph index` 重建索引

8. **环境变量**
   - 6 个变量表：`CODEGRAPH_WATCH_DEBOUNCE_MS` / `CODEGRAPH_NO_DAEMON` / `CODEGRAPH_TELEMETRY` / `DO_NOT_TRACK` / `CODEGRAPH_MCP_TOOLS` / `CODEGRAPH_DIR`
   - 每个变量的用途 + 默认值 + 使用场景

9. **遥测与隐私**
   - 收集项：匿名统计（哪些工具/命令/语言被用）
   - 绝不收集：代码、路径、文件/符号名、查询、IP
   - 本地聚合：每日总数后才发送
   - 3 种关闭方式：`codegraph telemetry off` / `CODEGRAPH_TELEMETRY=0` / `DO_NOT_TRACK=1`
   - 隐私保证：100% 本地、SQLite、无 API Key、无外部服务
   - 许可证：MIT

10. **支持的语言（22 种详细表）**
    - 表格列：语言 / 扩展名 / 状态（Full / Partial）
    - 覆盖：TypeScript / JS / Python / Go / Rust / Java / C# / PHP / Ruby / C / C++ / Objective-C（Partial） / Swift / Kotlin / Scala / Dart / Svelte / Vue / Astro / Liquid / Pascal-Delphi / Lua / Luau / R

11. **框架感知路由（17 框架）**
    - 17 框架的路由识别形状表（Django path() / Flask @app.route / FastAPI @router.get / Express app.get / NestJS @Controller / Laravel Route::get / Drupal *.routing.yml / Rails get 'x', to: / Spring @GetMapping / Play conf.routes / Gin r.GET / Axum .route / ASP.NET [HttpGet] / Vapor app.get / React Router + SvelteKit / Vue Router + Nuxt / Astro src/pages/）
    - 框架路由覆盖率子表（16 框架实测覆盖百分比）

12. **跨语言桥接（iOS / RN / Expo）**
    - 10 边界桥接方式表：Swift→ObjC / ObjC→Swift / RN legacy bridge / RN TurboModules / RN native→JS events / Expo Modules / Fabric view components / Legacy Paper view managers
    - 每行说明 JS/Swift 侧调用 → 原生侧实现 + 桥接手段
    - 桥接验证仓库表（小/中/大各一）

13. **故障排查 FAQ**
    - 7 条常见问题：
      1. "CodeGraph not initialized" → 先 `codegraph init`
      2. 索引慢 → 排除 `node_modules` 等
      3. MCP `database is locked` → 旧版升级；文件系统不支持 WAL 换本地磁盘
      4. MCP server 连不上 → 检查项目初始化、路径、重跑 `codegraph install`
      5. MCP `Transport closed` → WSL2 + Windows 盘符；`CODEGRAPH_NO_DAEMON=1`
      6. 符号缺失 → 等自动同步或 `codegraph sync`；检查语言支持、`.gitignore`
      7. Windows / WSL 共享 checkout → 不同 `CODEGRAPH_DIR`（如 `.codegraph-win`）

## 验收标准

1. `docs/blog/codegraph.md` 文件存在，行数从 158 行增至约 450-550 行。
2. front matter 含 `tags` 数组（5 项），`createTime` 为 `2026/06/28`。
3. 现有 7 处保留章节的文字内容完全未变（标题、段落、列表、表格内容均一致）。
4. 「CLI 命令」「MCP 工具」「基准测试」三章按改写方案更新；改写后包含原章节的所有信息（不丢失现有信息）。
5. 「资源链接」之后追加 12 个新章节，按设计顺序排列。
6. 所有新增内容可溯源至 GitHub README，不存在自编的功能/命令/指标。
7. 所有 Markdown 表格 `|---|` 分隔符对齐；所有代码块围栏闭合。
8. 所有外链 URL 准确（GitHub / 文档站 / npm / 官方文档）。
9. `pnpm docs:dev` 本地预览，新章节渲染正常无报错。

## 实施范围

- 单一文件变更：`docs/blog/codegraph.md`。
- 不修改 `docs/.vuepress/collections.ts`、`docs/.vuepress/navbar.ts`、`docs/.vuepress/config.ts`。
- 不写测试（无代码改动）。
- 不提交到 git（按既有约定，待用户确认后由用户自行 commit）。