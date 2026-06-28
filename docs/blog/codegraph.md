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

| 工具 | 用途 |
|------|------|
| `codegraph_explore` | **主要工具**。一次调用回答几乎任何问题，返回相关符号的源代码及关系图 |
| `codegraph_node` | 查看单个符号的完整源代码及调用者/被调用者链 |
| `codegraph_search` | 按名称搜索符号 |
| `codegraph_callers` | 查找函数的所有调用点 |

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