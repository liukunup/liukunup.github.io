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

## 概述

[CodeGraph](https://github.com/colbymchenry/codegraph) 是一个预索引代码知识图谱工具，可自动同步代码变更，为 Claude Code、Cursor、Codex、Gemini 等 AI 编程助手提供语义代码智能。

**核心优势：节省 ~16% 成本 · 减少 ~58% 工具调用 · 100% 本地运行**

## 核心特性

- **智能上下文构建**：一次工具调用返回入口点、相关符号和代码片段，无需昂贵的探索代理
- **全文搜索**：基于 FTS5 的全文本搜索，即时按名称查找代码
- **影响分析**：追踪调用者、被调用者及任何符号的完整影响半径
- **始终新鲜**：文件监视器使用原生 OS 事件（FSEvents/inotify/ReadDirectoryChangesW），自动同步零配置
- **20+ 编程语言**：TypeScript、JavaScript、Python、Go、Rust、Java、C#、PHP、Ruby、C、C++、Objective-C、Swift、Kotlin、Scala、Dart、Lua、R、Svelte、Vue、Astro 等
- **框架感知路由**：识别 17 种 Web 框架的路由文件，将 URL 模式链接到处理器
- **跨语言桥接**：iOS/React Native/Expo 混合代码库的符号连接
- **100% 本地**：数据不离开你的机器，无需 API 密钥，纯 SQLite 数据库

## 工作原理

```
┌───────────────────────────────────────────────────────────────────┐
│                            Claude Code                            │
│                                                                   │
│   "How does a request reach the database?"                        │
│       calls CodeGraph tools directly — no Explore sub-agent       │
│                                 │                                 │
└─────────────────────────────────┼─────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│                        CodeGraph MCP Server                       │
│                                                                   │
│       explore · search · callers · callees · impact · node        │
│                                 │                                 │
│                                 ▼                                 │
│                       SQLite knowledge graph                      │
│          symbols · edges · files · FTS5 full-text search          │
└───────────────────────────────────────────────────────────────────┘
```

1. **提取** — tree-sitter 将源代码解析为 AST，提取节点（函数、类、方法）和边（调用、导入、扩展）
2. **存储** — 所有内容存入本地 SQLite 数据库，配备 FTS5 全文搜索
3. **解析** — 解析引用：函数调用→定义、导入→源文件、类继承和框架特定模式
4. **自动同步** — MCP 服务器使用原生 OS 文件事件监视项目，变更经 2 秒防抖窗口后增量同步

## 安装

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh
```

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.ps1 | iex
```

### 或使用 npm

```bash
npm i -g @colbymchenry/codegraph
```

### 升级

```bash
codegraph upgrade
```

## 使用

### 1. 配置代理

```bash
codegraph install
```

自动检测并配置 Claude Code、Cursor、Codex CLI、opencode、Hermes Agent、Gemini CLI、Antigravity IDE 和 Kiro。

### 2. 初始化项目

```bash
cd your-project
codegraph init
```

### 3. 重启代理

重启你的 AI 编程助手，MCP 服务器将自动加载。

## CLI 命令

```bash
codegraph                         # 运行交互式安装器
codegraph install                 # 运行安装器（显式）
codegraph uninstall               # 从代理中卸载 CodeGraph
codegraph init [path]             # 初始化项目 + 构建图谱
codegraph uninit [path]           # 从项目中移除（--force 跳过确认）
codegraph index [path]            # 完整索引（--force 重建，--quiet 精简输出）
codegraph sync [path]             # 增量更新
codegraph status [path]           # 显示统计信息
codegraph unlock [path]           # 移除阻塞索引的过期锁文件
codegraph query <search>          # 搜索符号（--kind, --limit, --json）
codegraph explore <query>         # 一次返回相关符号的源码 + 调用路径
codegraph node <symbol|file>      # 单个符号的源码 + 调用者，或带行号读文件
codegraph files [path]            # 显示文件结构（--format, --filter, --max-depth, --json）
codegraph callers <symbol>        # 查找调用者（--limit, --json）
codegraph callees <symbol>        # 查找被调用者（--limit, --json）
codegraph impact <symbol>         # 分析影响范围（--depth, --json）
codegraph affected [files...]     # 查找受影响的测试文件（见下文）
codegraph daemon                  # 管理后台守护进程（别名：daemons）
codegraph telemetry [on|off]      # 显示或切换匿名使用遥测
codegraph upgrade [version]       # 升级（--check 检查更新，--force 强制）
codegraph version                 # 打印已安装版本（同 -v / --version）
codegraph help [command]          # 显示帮助，可指定具体命令
```

### `codegraph install` 选项

| Flag | 取值 | 默认 |
|------|------|------|
| `--target` | `auto` / `all` / `none` / csv（如 `claude,cursor,...`） | 提示 |
| `--location` | `global` / `local` | 提示 |
| `--yes` | boolean | 每步提示 |
| `--no-permissions` | boolean，跳过 Claude 自动允许列表 | 启用权限 |
| `--print-config <id>` | 仅打印某个代理的配置片段，不写文件 | — |

非交互式示例：

```bash
codegraph install --yes                              # 自动检测代理，全局安装
codegraph install --target=cursor,claude --yes       # 显式目标列表
codegraph install --target=auto --location=local     # 检测到的代理，项目本地
codegraph install --print-config codex               # 打印 codex 片段
```

### `codegraph affected` + CI 集成

沿 import 依赖传递追踪，找出改动源文件影响到的测试文件：

```bash
codegraph affected src/utils.ts src/api.ts         # 显式传入文件
git diff --name-only | codegraph affected --stdin  # 从 git diff 管道输入
codegraph affected src/auth.ts --filter "e2e/*"    # 自定义测试文件 glob
```

| 选项 | 描述 | 默认 |
|------|------|------|
| `--stdin` | 从 stdin 读取文件列表 | `false` |
| `-d, --depth <n>` | 最大依赖遍历深度 | `5` |
| `-f, --filter <glob>` | 自定义测试文件匹配 glob | 自动检测 |
| `-j, --json` | 输出 JSON | `false` |
| `-q, --quiet` | 仅输出文件路径 | `false` |

CI / 钩子示例：

```bash
#!/usr/bin/env bash
AFFECTED=$(git diff --name-only HEAD | codegraph affected --stdin --quiet)
if [ -n "$AFFECTED" ]; then
  npx vitest run $AFFECTED
fi
```

## MCP 工具

CodeGraph 作为 MCP 服务器运行时，按设计**只暴露一个工具**——`codegraph_explore`。行为测量表明单一强工具比一组窄工具更能引导代理，减少误选并节省每轮会话的上下文。其余工具**功能完整但默认隐藏**，因其返回值已内联在 `codegraph_explore` 的爆炸半径、关系图、符号源码中。

| 工具 | 用途 |
|------|------|
| `codegraph_explore` | **主要工具**。一次调用回答几乎任何问题——「X 怎么工作」、流程（「X 如何到达 Y」）、区域调研——返回相关符号的完整源码按文件分组，附带调用路径与爆炸半径。能呈现 grep 无法跟随的动态分派跳跃（callback、React re-render、interface→impl）。在 query 中指名文件或符号即可读到当前带行号的源码。 |
| `codegraph_node` | 单个符号的源码 + 调用者，或带行号读取文件 |
| `codegraph_search` | 按名称在整个代码库搜索符号 |
| `codegraph_callers` | 查找调用函数/方法的所有点 |
| `codegraph_callees` | 查找函数/方法调用的所有内容 |
| `codegraph_impact` | 分析改变某符号会影响哪些代码 |
| `codegraph_files` | 显示项目文件结构 |
| `codegraph_status` | 显示项目统计信息 |

通过 `CODEGRAPH_MCP_TOOLS` 环境变量可重新启用隐藏工具，例如：

```bash
CODEGRAPH_MCP_TOOLS=explore,node,search,callers
```

即使服务器所在根目录没有 `.codegraph/` 索引，工具仍然可用：通过 `projectPath` 参数查询任何已建立索引的项目。

## 基准测试

在 7 个真实开源代码库上测试（Claude Opus 4.8，2026-06-02 复验，每个场景中位数 4 次）：

**普适收益（每个仓库都成立）：58% 更少工具调用 · 22% 更快 · 文件读取归零**

| 代码库     | 语言           | 工具调用 Δ    | 时间 Δ       | 文件读取 | Token Δ    | 成本 Δ         |
|------------|----------------|---------------|--------------|----------|------------|----------------|
| VS Code    | TypeScript ~10k | 4 → 21 (81%↓) | 1m59s→2m13s  | 0 vs 9   | 640k→1.79M | $0.68→$0.83 (18%↓) |
| Excalidraw | TypeScript ~640 | 9 → 15 (40%↓) | 1m32s→2m06s  | 0 vs 7   | 1.27M→1.69M | $0.78→$0.78 (持平) |
| Django     | Python ~3k      | 3 → 13 (77%↓) | 1m43s→1m58s  | 0 vs 9   | 559k→1.41M | $0.57→$0.62 (8%↓)  |
| Tokio      | Rust ~790       | 6 → 14 (57%↓) | 1m55s→2m20s  | 0 vs 8   | 1.08M→1.73M | $0.82→$0.82 (持平) |
| OkHttp     | Java ~645       | 5 → 10 (50%↓) | 1m01s→1m29s  | 0 vs 4   | 502k→1.10M | $0.41→$0.55 (25%↓) |
| Gin        | Go ~110         | 5 → 9 (44%↓)  | 1m14s→1m37s  | 1 vs 6   | 651k→847k  | $0.46→$0.57 (19%↓) |
| Alamofire  | Swift ~110      | 5 → 12 (58%↓) | 1m35s→2m21s  | 0 vs 9   | 766k→2.10M | $0.57→$0.95 (40%↓) |

> **关于成本**：CodeGraph 在每个代码库上的稳定收益是**精度与速度**——更少工具调用、更快响应。Token 和成本节省是真实存在的，但**随规模变化**——小型代码库上数值较小且噪声大，仅当代码库变大变复杂、团队全员每日高频使用代理时，成本节省才会累积成显著条目。在 500 文件的项目上，使用 CodeGraph 是为了**速度**；成本节省在代码库与团队规模化后才显现。

## 支持的平台

| 平台 | 架构 |
|------|------|
| Windows | x64, arm64 |
| macOS | x64, arm64 |
| Linux | x64, arm64 |

## 资源链接

- GitHub：https://github.com/colbymchenry/codegraph
- 文档：https://colbymchenry.github.io/codegraph/
- npm：https://www.npmjs.com/package/@colbymchenry/codegraph

## 新增特性（v1.0）

**1.0 已正式发布。** 已安装的用户可通过 `codegraph upgrade` 一键升级到最新版本；安装器会自动检测安装方式（bundle / npm / npx）并原地更新。`codegraph upgrade --check` 仅检查是否有更新；`codegraph upgrade <version>` 锁定到指定版本。

**核心价值回顾**

- **Surgical Context** — 一次工具调用返回入口点、相关符号和代码片段，无需昂贵的文件逐个探索
- **Fewer Tool Calls** — 实测在 7 个真实代码库中平均减少 58% 工具调用
- **Faster Answers** — 同一组测试中平均快 22%，文件读取近乎为零
- **100% Local** — 数据不离开机器，无需 API Key，纯 SQLite 数据库

## 始终新鲜：Auto-Sync 三层机制

当你或代理改动代码时，CodeGraph 通过三层机制保证索引永不过期——即便代理在防抖窗口内发起查询，也不会给出静默的错误答案：

1. **文件监听 + 防抖同步** — 原生 `FSEvents` / `inotify` / `ReadDirectoryChangesW` 监听源码变更，防抖窗口（默认 `2000ms`，可通过 `CODEGRAPH_WATCH_DEBOUNCE_MS` 调节，clamp `[100ms, 60s]`）内批量编辑会折叠为一次同步。
2. **逐文件陈旧横幅** — 防抖窗口内，若 MCP 工具响应引用了尚未同步完成的文件，会在响应顶部插入 `⚠️` 横幅并指引代理 `Read` 该文件。未被引用但仍在等待的待同步文件以小型页脚呈现。无论哪种，代理都会得到明确信号——已在 Claude Code 上验证代理会读横幅后说「Reading the file directly for the live content」。
3. **连入时追赶** — MCP 服务器每次（重）连时，先用 `(size, mtime)` + content-hash 对账工作树，再回答首次查询——确保代理空闲期间通过 `git pull`、其他编辑器或上一次会话造成的编辑在下次会话首调用时即被吸收。

```
agent writes src/Widget.ts
  → watcher fires (<100ms)
  → debounce (default 2s)
  → sync; Widget.ts is in the index
  → next agent query sees it
```

任何时候可通过 `codegraph status` 验证同步状态——若存在待同步文件，会显示 `### Pending sync:` 段落并列出文件名与编辑时长。

少数需要手动 `codegraph sync` 的情形：监听被禁用（沙箱环境或 `CODEGRAPH_NO_DAEMON=1`）、或在代理会话之外以脚本方式访问索引需要在脚本开头做一次预同步。

## 库嵌入 API

CodeGraph 可作为 npm 包直接嵌入到其他 Node.js 应用（如 Electron 工具链），不限于 MCP / CLI 场景：

```js
import CodeGraph from '@colbymchenry/codegraph';
// CommonJS 也可用：
//   const { CodeGraph } = require('@colbymchenry/codegraph');

const cg = await CodeGraph.init('/path/to/project');
// 或：const cg = await CodeGraph.open('/path/to/project');

await cg.indexAll({
  onProgress: (p) => console.log(`${p.phase}: ${p.current}/${p.total}`)
});

const results = cg.searchNodes('UserService');
const callers = cg.getCallers(results[0].node.id);
const context = await cg.buildContext('fix login bug', { maxNodes: 20, includeCode: true, format: 'markdown' });
const impact = cg.getImpactRadius(results[0].node.id, 2);

cg.watch();   // 文件变更时自动同步
cg.unwatch(); // 停止监听
cg.close();
```

**底层构建块**也从同一入口导出，可用于更精细的集成：

- `DatabaseConnection`
- `QueryBuilder`
- `getDatabasePath`
- `initGrammars` / `loadGrammarsForLanguages`
- `FileLock`

**嵌入要求**

- 从 npm 安装（`npm i @colbymchenry/codegraph`）以拉取匹配的 per-platform 包
- API 需要 **Node 22.5+** 以使用内置 `node:sqlite`（Electron 当其捆绑 Node ≥ 22.5 时亦可用）
- CLI 与 MCP 服务器不受此限制——它们跑在自包含的 bundled runtime 上
- TypeScript 类型随包发布；建议保持 `@types/node` 可用并设置 `skipLibCheck: true`

## 配置文件 codegraph.json

CodeGraph **默认零配置**。项目根目录可选的 `codegraph.json` 仅在需要自定义时使用。

**默认排除清单**（无需配置即生效）：

- 依赖、构建、缓存目录：`node_modules` / `vendor` / `dist` / `build` / `target` / `.venv` / `Pods` / `.next`
- 你的 `.gitignore` 内容（git 仓库中通过 git 读取；非 git 项目直接读 `.gitignore`）
- 大于 1 MB 的文件（生成产物、压缩 JS、vendored blob）

**排除已提交目录**（例如 vendored 主题位于 `static/` 下）：

```json
{
  "exclude": ["static/", "**/vendor/**"]
}
```

**自定义文件扩展名**：

```json
{
  "extensions": {
    ".dota_lua": "lua",
    ".tpl": "php"
  }
}
```

- 每个 value 是受支持的语言 ID
- 映射合并在built-in默认值之上，冲突时自定义优先
- 语言 ID 拼错或文件畸形会被警告并跳过——不会破坏索引
- 添加或修改映射后需要 `codegraph index` 重建索引

## 环境变量

| 变量 | 用途 | 默认 |
|------|------|------|
| `CODEGRAPH_WATCH_DEBOUNCE_MS` | 调节文件监听防抖窗口，clamp `[100ms, 60s]` | `2000` |
| `CODEGRAPH_NO_DAEMON` | 设为 `1` 时跳过共享服务器，每个会话独立进程；WSL2 + Windows 盘符下排错用 | 关闭 |
| `CODEGRAPH_TELEMETRY` | 设为 `0` 时禁用遥测 | 启用 |
| `DO_NOT_TRACK` | 设为 `1` 时禁用遥测（与 `CODEGRAPH_TELEMETRY=0` 等价） | 关闭 |
| `CODEGRAPH_MCP_TOOLS` | 重新启用被隐藏的 MCP 工具，逗号分隔（如 `explore,node,search,callers`） | 仅 `explore` |
| `CODEGRAPH_DIR` | 自定义 `.codegraph` 目录名（如 `.codegraph-win` 用于 Windows / WSL 共享 checkout） | `.codegraph` |

## 遥测与隐私

CodeGraph 收集**匿名使用统计**——哪些工具和命令被使用、哪些语言被索引，用于指导开发优先级。

**绝不收集**：代码、路径、文件或符号名、查询、IP 地址。

**聚合方式**：使用情况在本地聚合成每日总数后再发送。

**Ingest 端点**：[仓库内公开代码 `telemetry-worker/`](https://github.com/colbymchenry/codegraph/blob/main/telemetry-worker)，强制执行文档化的字段清单。

**三种关闭方式**（任选其一）：

```bash
codegraph telemetry off    # 切换开关
CODEGRAPH_TELEMETRY=0      # 环境变量
DO_NOT_TRACK=1             # 通用退出信号
```

**隐私保证**

- 100% 本地：数据不离开机器
- 无 API Key
- 无外部服务
- 纯 SQLite 数据库

**许可证**：MIT

## 支持的语言

| 语言 | 扩展名 | 状态 |
|------|--------|------|
| TypeScript | `.ts`, `.tsx` | 完整支持 |
| JavaScript | `.js`, `.jsx`, `.mjs` | 完整支持 |
| Python | `.py` | 完整支持 |
| Go | `.go` | 完整支持 |
| Rust | `.rs` | 完整支持 |
| Java | `.java` | 完整支持 |
| C# | `.cs` | 完整支持 |
| PHP | `.php` | 完整支持 |
| Ruby | `.rb` | 完整支持 |
| C | `.c`, `.h` | 完整支持 |
| C++ | `.cpp`, `.hpp`, `.cc` | 完整支持 |
| Objective-C | `.m`, `.mm`, `.h` | 部分支持（class、protocol、method、`@property`、`#import`、message send；`.mm` ObjC++ 可能解析不全） |
| Swift | `.swift` | 完整支持 |
| Kotlin | `.kt`, `.kts` | 完整支持 |
| Scala | `.scala`, `.sc` | 完整支持（class、trait、method、type alias、Scala 3 enum） |
| Dart | `.dart` | 完整支持 |
| Svelte | `.svelte` | 完整支持（script 抽取、Svelte 5 runes、SvelteKit 路由） |
| Vue | `.vue` | 完整支持（script + script-setup 抽取、Nuxt page/API/middleware 路由） |
| Astro | `.astro` | 完整支持（frontmatter + script 抽取、模板组件/调用引用、`src/pages/` 路由） |
| Liquid | `.liquid` | 完整支持 |
| Pascal / Delphi | `.pas`, `.dpr`, `.dpk`, `.lpr` | 完整支持（class、record、interface、enum、DFM/FMX 表单文件） |
| Lua | `.lua` | 完整支持（function、带 receiver 的 method、local 变量、`require` import、call edge） |
| Luau | `.luau` | 完整支持（Lua 全部 + `type`/`export type` alias、typed signature、Roblox instance-path `require`） |
| R | `.R`, `.r` | 完整支持（任意赋值形式的 function、S4/R5/R6 class with method、`library`/`require` import、`source()` 文件引用、call edge） |

## 框架感知路由

CodeGraph 识别 Web 框架的路由文件，并发出 `route` 节点通过 `references` 边链接到 handler class 或 function。查询某个 view/controller 的调用者时，会同时呈现绑定它的 URL pattern。

| 框架 | 识别形状 |
|------|----------|
| Django | `urls.py` 中的 `path()`、`re_path()`、`url()`、`include()`（CBV `.as_view()`、dotted path） |
| Flask | `@app.route('/path', methods=[...])`、blueprint route |
| FastAPI | `@app.get(...)`、`@router.post(...)` 等所有标准方法 |
| Express | `app.get(...)`、`router.post(...)` 含 middleware chain |
| NestJS | `@Controller` + `@Get/@Post/...`，GraphQL `@Resolver` + `@Query/@Mutation`，`@MessagePattern`/`@EventPattern`，`@SubscribeMessage` |
| Laravel | `Route::get()`、`Route::resource()`、`Controller@action`、tuple 语法 |
| Drupal | `*.routing.yml` route（`_controller`、`_form`、entity handler）；`.module`/`.theme`/`.install`/`.inc` 中的 `hook_*` 实现 |
| Rails | `get '/x', to: 'users#index'`、hash-rocket `=>` 语法 |
| Spring | method 上的 `@GetMapping`、`@PostMapping`、`@RequestMapping` |
| Play | `conf/routes` 中的 `GET`/`POST`/… verb route → `Controller.method` action（Scala + Java） |
| Gin / chi / gorilla / mux | `r.GET(...)`、`router.HandleFunc(...)` |
| Axum / actix / Rocket | `.route("/x", get(handler))` |
| ASP.NET | action method 上的 `[HttpGet("/x")]` attribute |
| Vapor | `app.get("x", use: handler)` |
| React Router / SvelteKit | route component 节点 |
| Vue Router / Nuxt | `pages/` file-based route、`server/api/` endpoint、route middleware |
| Astro | `src/pages/` file-based route（`.astro` page + `.ts` endpoint，`[param]`/`[...rest]` 语法） |

**框架路由实测覆盖率**（每个框架的 canonical app）：

| 框架 | 覆盖率 |
|------|--------|
| Express | 100% |
| FastAPI | 98% |
| Flask | 100% |
| NestJS | 96.8% |
| Gin | 96.5% |
| Axum | 100% |
| Rocket | 93.8% |
| Vapor | 100% |
| Laravel | 92% |
| Rails | 89.6% |
| React Router | 100% |
| ASP.NET | 83.9% |
| Spring | 83.3% |
| Drupal | 78.9% |
| Play | 76.3% |
| Django | 74.1% |

## 跨语言桥接（iOS / RN / Expo）

真实的 iOS 与 React Native 代码库跨越多种语言——Swift 调用方触发 Objective-C selector（已自动桥接），JS 文件通过 RN bridge 调用原生模块，JSX 组件委托给原生 view manager。静态 tree-sitter 抽取会在每种语言边界停止。CodeGraph 桥接这些边界，使 `codegraph_explore` 端到端连通整个流程——调用路径与爆炸半径跨过边界而非止于边界。

| 边界 | JS / Swift 侧 | 原生侧 | 桥接方式 |
|------|---------------|--------|----------|
| Swift → ObjC | Swift `obj.foo(bar:)` | ObjC selector `-fooWithBar:` | `@objc` 自动桥接规则（含 init/property/protocol 形式）+ Cocoa 前缀（`With`/`For`/`By`/`In`/`On`/`At`/…） |
| ObjC → Swift | ObjC `[obj fooWithBar:]` | Swift `@objc func foo(bar:)` | 反向桥接候选名；从源码验证 `@objc` 暴露 |
| React Native legacy bridge | JS `NativeModules.X.fn(...)` | ObjC `RCT_EXPORT_METHOD` / `RCT_REMAP_METHOD` · Java/Kotlin `@ReactMethod` | 解析宏/注解声明构建 JS-name → 原生-method 映射 |
| React Native TurboModules | JS `import M from './NativeM'; M.fn(...)` | 匹配 Codegen spec 的原生实现 | 将 `Native<X>.ts` spec interface 视为 ground truth |
| RN native → JS events | JS `new NativeEventEmitter(...).addListener('e', cb)` | ObjC `[self sendEventWithName:@"e" body:...]` · Swift `sendEvent(withName: "e", ...)` · Java/Kotlin `.emit("e", ...)` | 按字面 event name 合成的跨语言 event channel |
| Expo Modules | JS `requireNativeModule('X').fn(...)` | Swift / Kotlin `Module { Name("X"); AsyncFunction("fn") { ... } }` | 解析 Expo DSL 字面量；合成 method 节点通过现有 name-match 解析 |
| Fabric view components | JSX `<MyView prop={v}/>` | TS Codegen spec + 原生实现类 | Spec → `component` 节点；约定俗成的 name+suffix 查找（`View`/`ComponentView`/`Manager`/`ViewManager`）桥接到原生 |
| Legacy Paper view managers | JSX `<MyView prop={v}/>` | ObjC `RCT_EXPORT_VIEW_PROPERTY` · Java/Kotlin `@ReactProp` | 同 Fabric——Paper 时期声明同样产出 `component` + `property` 节点 |

**桥接验证仓库**（每个桥接覆盖小/中/大三种规模）：

| 桥接 | 小 | 中 | 大 |
|------|----|----|----|
| Swift ↔ ObjC | [Charts](https://github.com/danielgindi/Charts) | [realm-swift](https://github.com/realm/realm-swift) | [Wikipedia-iOS](https://github.com/wikimedia/wikipedia-ios) |
| RN legacy bridge | [AsyncStorage](https://github.com/react-native-async-storage/async-storage) | [react-native-svg](https://github.com/software-mansion/react-native-svg) | [react-native-firebase](https://github.com/invertase/react-native-firebase) |
| RN native → JS events | [RNGeolocation](https://github.com/Agontuk/react-native-geolocation-service) | — | react-native-firebase |
| Expo Modules | expo-haptics | expo-camera | expo SDK sweep (7 packages) |
| Fabric / Paper views | [react-native-segmented-control](https://github.com/react-native-segmented-control/segmented-control) | [react-native-screens](https://github.com/software-mansion/react-native-screens) | [react-native-skia](https://github.com/Shopify/react-native-skia) |

每条桥接产出的边标记 `provenance:'heuristic'` 且 `metadata.synthesizedBy:` 设为稳定的 channel 名（如 `swift-objc-bridge`、`rn-event-channel`、`fabric-native-impl`、`expo-module-extract`），代理据此一眼看出某个跳跃是如何进入图的。