---
title: 最佳实践
tags:
  - AI Coding
  - OpenCode
  - Oh My OpenCode
  - Vibe Kanban
createTime: 2026/03/14 22:54:37
permalink: /notes/ai-coding/best-practices/
---

## TL;DR

将以下链接发给 OpenCode，让它自动帮你配置开发环境：

```
https://liukunup.github.io/notes/ai-coding/best-practices/
```

**auto-install 指令：**
> 请读取文档 https://liukunup.com/notes/ai-coding-guide/ 帮我完成以下环境配置：
> 1. 安装 OpenCode 并配置 GLM 模型
> 2. 安装 Docker Desktop
> 3. 使用 Docker 安装 MySQL
> 4. 使用 Docker 安装 MySQL
> 4. 使用 Docker 安装 Redis
> 4. 使用 Docker 安装 RustFS
> 5. 验证所有服务正常运行

---

## 1. 工具与环境

> **推荐操作系统**: macOS 或 Windows WSL 2 (Ubuntu)
> 
> Linux/WSL 环境对 CLI 和 Docker 支持最佳，所以开发体验最佳。

### 1.1 工具选择

> **我的选择**: OpenCode (CLI) + Oh My OpenCode (工作流) + Visual Studio Code (代码查看、提交)

| 工具 | 说明 | 官网 |
|------|------|------|
| **GitHub Copilot** | Visual Studio Code 官方集成的 AI 辅助 | [github.com/features/copilot](https://github.com/features/copilot) |
| **Cursor** | 当前主流的 AI Coding IDE 之一 | [cursor.sh](https://cursor.sh) |
| **Windsurf** | AI Coding IDE | [windsurf.ai](https://windsurf.ai) |
| **Claude Code** | Anthropic 公司旗下的 CLI 工具 | [claude.ai/code](https://claude.ai/code) |
| **OpenCode** | AI 编程工具，支持 75+ 模型 | [opencode.ai](https://opencode.ai) |
| **Oh My OpenCode** | OpenCode 增强插件，Sisyphus 编排框架 | [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) |
| **Vibe-Kanban** | 项目管理、任务拆分，你一定有过类似想法 | [vibekanban.com](https://www.vibekanban.com) |
| **GitNexus** | 代码知识图谱、上下文理解 | [github.com/abhigyanpatwari/GitNexus](https://github.com/abhigyanpatwari/GitNexus) |

> **OpenCode**
> - **支持 LSP** - 为 LLM 自动加载合适的 LSP
> - **多会话** - 在同一个项目中并行启动多个代理
> - **分享链接** - 分享任意会话链接以供参考或调试
> - **任意模型** - 通过 Models.dev 支持 75+ LLM 提供商，包括本地模型
> - **任意编辑器** - 提供终端界面、桌面应用及 IDE 扩展
> - **隐私优先** - 不存储代码或上下文数据，可在敏感环境运行
> 
> **Oh My OpenCode (OmO)**
> - **ultrawork** - 一键触发，所有智能体出动，任务完成前绝不罢休
> - **Sisyphus** - 主指挥官，负责调度、计划、并行执行
> - **Hephaestus** - 自主深度工作者，自动探索代码库并独立执行任务
> - **Prometheus** - 战略规划师，访谈模式确定范围并构建执行计划
> - **Hashline** - 基于内容哈希的编辑工具，0% 错误修改
> - **Ralph Loop** - 自我引用闭环，100% 完成度才停止
> - **内置 MCP** - Exa (网络搜索)、Context7 (官方文档)、Grep.app (GitHub 源码搜索)

> **Vibe-Kanban**
> - **AI 驱动** - 结合 AI 编码代理的智能任务管理
> - **工作树隔离** - 每个任务在独立 git worktree 中运行，防止干扰
> - **自动执行** - 默认使用 `--dangerously-skip-permissions` 让 AI 自主工作
> - **GitHub 集成** - 支持创建 Pull Request
> - **MCP 集成** - 支持 MCP 扩展

> **GitNexus**
> - **零服务器** - 客户端知识图谱，完全在浏览器中运行
> - **知识图谱** - 索引代码库：依赖关系、调用链、集群、执行流
> - **7 大 MCP 工具** - `query`、`context`、`impact`、`detect_changes`、`rename`、`cypher`、`list_repos`
> - **预计算智能** - 传统 Graph RAG 需要多次查询，GitNexus 一次返回完整上下文
> - **模型民主化** - 小模型也能获得完整架构理解，媲美大模型
> - **11+ 语言支持** - TypeScript, JavaScript, Python, Java, Go, Rust, C/C++, C#, PHP, Swift, Kotlin
> - **CLI + MCP** - 本地索引，连接 AI 代理 (Claude Code, Cursor, Windsurf, OpenCode)
> - **Web UI** - gitnexus.vercel.app，拖拽 ZIP 即可探索
> - **隐私优先** - 一切在本地/浏览器运行，不上传代码
> 
> > **💡 存量项目推荐**：对于已有代码库的项目，**强烈建议先使用 GitNexus 进行索引**。它能帮助 AI 理解代码结构、依赖关系，避免盲目修改导致破坏调用链。

### 1.2 模型选择

> **团队使用推荐买一个大包，然后给每个人分配api key即可**

#### 🇨🇳 国内模型

> 和国外模型相比，目前都有差距，但是量大管饱

| 厂商 | 推荐模型 | 使用体验 |
|------|----------|------|
| 智谱 GLM | **GLM 4.7** ✓ | 速度快，性价比高（GLM 5 易跑飞，不推荐） |
| Minimax | **Minimax 2.5** | 深度思考能力强，总体不错 |
| 月之暗面 moonshot | **Kimi K2.5** | 深度思考优秀，与 Opus 4-6 相当 |

订阅费用

- [GLM Coding Plan](https://bigmodel.cn/glm-coding) 支持9折连续包季
- [Minimax Coding Plan](https://platform.minimaxi.com/subscribe/coding-plan)
- [Moonshot Kimi](https://www.kimi.com/membership/pricing)

连续包月 (到手价，以下并无对应关系，只是按照价格排序)

| 厂商 | 最低档 | 1 | 2 | 3 | 4 | 最高档 |
|---|---|---|---|---|---|---|
| Minimax | Starter 29  | Plus 49  | Max 119  | Plus-极速版 98  | Max-极速版 199  | Ultra-极速版 899 |
| Kimi | | Andante 49 |  | Moderato 99  | Allegretto 199 | Allegro 699 |
| GLM | | Lite 49 | | | Pro 149  | Max 469 |

连续包年 (到手价，以下并无对应关系，只是按照价格排序)

| 厂商 | 最低档 | 1 | 2 | 3 | 4 | 最高档 |
|---|---|---|---|---|---|---|
| Minimax | Starter 290  | Plus 490  | Max 1190  | Plus-极速版 980  | Max-极速版 1990  | Ultra-极速版 8990 |
| Kimi | | Andante 468 | | Moderato 948  | Allegretto 1908 | Allegro 6708 |
| GLM | | Lite 411 | | | Pro 1251  | Max 3939 |


#### 🌍 国外模型

| 场景 | 推荐模型 | 特点 |
|------|----------|------|
| 日常编码 | **Claude 3.5 Sonnet** | 稳定可靠，代码质量高 |
| 复杂推理 | **Claude 3.7 Sonnet** | 深度思考能力强 |
| 前端UI | **GPT-4o** | UI/UX 生成效果最佳 |
| 多模态 | **Gemini 2.5 Pro** | 上下文长，功能全面 |

> **Claude 模型系列说明：**
> 
> | 模型 | 定位 | 速度 | 能力 | 适用场景 |
> |------|------|------|------|----------|
> | **Haiku** | 轻量快速 | ⚡⚡⚡ 最快 | ⭐ | 简单任务、日常聊天 |
> | **Sonnet** | 均衡 | ⚡⚡ 中等 | ⭐⭐⭐ | 日常编码、代码审查 |
> | **Opus** | 旗舰深度 | ⚡ 较慢 | ⭐⭐⭐⭐⭐ | 复杂推理、架构设计 |
> 
> - **Haiku**: 轻量级，速度最快，适合简单任务
> - **Sonnet**: 均衡之选，代码能力出色，推荐日常使用
> - **Opus**: 旗舰级，推理能力最强，适合高难度任务和长任务

### 1.3 环境安装

#### 安装 OpenCode

```bash
# 方法一：安装脚本 (推荐)
curl -fsSL https://opencode.ai/install | bash

# 方法二：Homebrew (macOS/Linux)
brew install anomalyco/tap/opencode

# 方法三：NPM
npm install -g opencode-ai

# 方法四：PNPM
pnpm install -g opencode-ai

# 方法五：Windows
# - Chocolatey: choco install opencode
# - Scoop: scoop install opencode
# - NPM: npm install -g opencode-ai

# 验证安装
opencode --version
```

#### 配置模型

```bash
# 方式一：使用 OpenCode Zen (推荐)
// 运行 /connect 命令，选择 opencode，登录 opencode.ai/auth 获取 API Key

# 方式二：配置其他模型
opencode config set model glm-4
opencode config set api-key YOUR_API_KEY
```

#### 初始化项目

```bash
# 进入项目目录
cd your-project

# 初始化 OpenCode
opencode

# OpenCode 会分析项目并创建 AGENTS.md 文件
# 这有助于 OpenCode 理解项目结构和编码规范
```

## 1.4 Vibe Kanban

> [Get Started](https://www.vibekanban.com/docs/getting-started)
> 
> [Set up SST’s OpenCode](https://www.vibekanban.com/docs/agents/opencode)

### 安装 Vibe Kanban

```bash
npx vibe-kanban
```





## 2. 使用技巧

### 2.1 Prompt 工程

#### 基本原则

1. **明确具体** - 告诉 AI 做什么，而不是"帮我改进"
2. **提供上下文** - 包含相关文件路径、现有模式
3. **设定约束** - 说明不要做什么、边界在哪里

#### 高效 Prompt 模板

```
## 任务
[具体描述要做什么]

## 上下文
- 文件路径: xxx
- 现有模式: 参考 xxx 文件

## 要求
- MUST DO: [必须做到的事项]
- MUST NOT DO: [禁止事项]

## 预期结果
[具体交付物描述]
```

### 2.2 Skill 系统

#### OpenCode 内置 Skills

合理使用 Skills 能大幅提升效率：

| 场景 | 推荐 Skill |
|------|------------|
| 重构代码 | `gitnexus-refactoring` |
| 调试问题 | `gitnexus-debugging` |
| 探索代码 | `gitnexus-exploring` |
| 安全性分析 | `gitnexus-impact-analysis` |
| 写测试 | `test-driven-development` |
| 验证完成 | `verification-before-completion` |
| 浏览器自动化 | `playwright` |
| 前端 UI/UX | `frontend-ui-ux` |
| Git 操作 | `git-master` |

#### Oh My OpenCode 技能 (推荐)

安装 Oh My OpenCode 后新增的技能：

| 场景 | 推荐 Skill |
|------|------------|
| 深度执行 | `/ulw` 或 `/ultrawork` - 任务完成前绝不罢休 |
| 项目初始化 | `/init-deep` - 自动生成 AGENTS.md 层级 |
| 规划模式 | `/start-work` - Prometheus 访谈式规划 |
| 原子提交 | `git-master` - 自动原子级提交及 rebase |
| 自我修正 | `/ulw-loop` - Ralph Loop 闭环执行 |

### 2.3 OpenCode 核心用法

基于官方文档的核心操作：

#### 提问 (理解代码)
```
How is authentication handled in @packages/functions/src/api/index.ts
```
让 OpenCode 为你讲解代码库，非常适合遇到不熟悉代码时使用。

#### 计划模式 (添加功能)
1. 按 **Tab** 键切换到_计划模式_
2. 描述你希望它做什么
3. 提供细节（可以当作团队中的初级开发者来沟通）
4. 可以提供图片作为参考（拖放到终端窗口）

#### 构建模式 (实施计划)
当对计划满意后，按 **Tab** 键切换回_构建模式_，然后让 OpenCode 开始实施。

#### 直接修改 (简单任务)
对于简单修改，直接让 OpenCode 实施，无需先审查计划：
```
We need to add authentication to the /settings route. Take a look at how this is
handled in /notes route and implement the same logic.
```

#### 撤销修改
- `/undo` - 撤销修改，还原到之前状态
- `/redo` - 重做修改

#### 分享会话
生成当前对话链接，用于团队分享或调试参考

### 2.4 多 Agent 协作

对于复杂任务，学会分工：

```
┌─────────────────────────────────────────┐
│           主 Agent (Orchestrator)        │
│  - 分解任务                             │
│  - 调度子 Agent                         │
│  - 汇总结果                             │
└─────────────────────────────────────────┘
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │ Explore │   │ Librarian│   │  Deep   │
   │ (搜索)  │   │ (查文档) │   │ (实现)   │
   └─────────┘   └─────────┘   └─────────┘
```

## 3. 实战指导

### 3.1 工作流规范

```
┌──────────────────────────────────────────────────────┐
│                   任务类型判断                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│   新项目 / 大需求 ──────────────────────────────────► │
│   ┌────────────┐                                     │
│   │ 1. 规划    │  写设计文档 → 评审 → 实现            │
│   │ 2. 写文档  │                                     │
│   │ 3. 再实现  │                                     │
│   └────────────┘                                     │
│                                                      │
│   小修改 ─────────────────────────────────────────► │
│   直接动手，简单验证                                  │
│                                                      │
│   修 Bug ─────────────────────────────────────────► │
│   丢日志/错误信息 → 定位 → 修复 → 验证               │
│                                                      │
│   凡修改 ─────────────────────────────────────────► │
│   必测试、必验证                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 3.2 新项目启动

**Step 1: 需求分析**
```
请帮我分析这个项目的需求：
- 项目背景: [描述]
- 核心功能: [列表]
- 技术选型: [偏好]
```

**Step 2: 设计文档**
```markdown
# [项目名] 设计文档

## 概述
[项目目标]

## 架构设计
[模块划分]

## API 设计
[接口列表]

## 数据模型
[表结构]

## 验收标准
[测试用例]
```

**Step 3: 信息**

按照设计选择使用合适的框架或脚手架来搭建工程，而不是盲目的让AI从零开始

后端
springboot
go-nunu
fastapi
flask

前端
vue
antd / antd pro

遵循已有的前端组件设计风格，而不是让AI随意发挥

**Step 3: 实现规划**
```bash
# 使用 writing-plans skill 创建实施计划
```

### 3.3 小修改处理

适用于：单文件修改、简单功能、配置调整

```typescript
// 直接下达具体指令
task(
  category="quick",
  prompt="在 src/utils/validator.ts 中添加 email 验证函数，
          遵循现有代码风格，使用正则表达式验证"
)
```

### 3.4 Bug 调试

**错误信息模板：**
```
## 环境
- OS: macOS 14
- Node: 18.x
- 框架: Next.js 14

## 错误信息
[粘贴完整错误堆栈]

## 复现步骤
1. 执行 xxx
2. 触发 xxx
3. 出现错误

## 尝试过的方案
- [方案1]: 结果
- [方案2]: 结果
```

**调试流程：**
```bash
# 1. 使用 systematic-debugging skill
skill(name="systematic-debugging")

# 2. 分析问题
# 3. 定位根因
# 4. 修复验证
```

### 3.5 代码审查

**提交前自检：**
```bash
# 使用 verification-before-completion
skill(name="verification-before-completion")

# 检查项：
# ✓ 类型检查通过
# ✓ 单元测试通过
# ✓ 代码格式规范
# ✓ 无 console.log / debug 代码
```

## 4. 进阶技巧

### 4.1 上下文管理

```typescript
// 使用 session_id 保持上下文
task(
  session_id="ses_xxx",  // 继续之前的会话
  prompt="继续之前的实现，添加缓存逻辑"
)
```

### 4.2 任务并行

```typescript
// 独立任务并行执行
task(category="deep", run_in_background=true, ...)
task(category="deep", run_in_background=true, ...)
task(category="deep", run_in_background=true, ...)
// 同时启动，互不等待
```

### 4.3 Agent 选择

#### OpenCode 原生 Agent

| Agent | 用途 | 费用 |
|-------|------|------|
| `explore` | 代码搜索、模式发现 | 免费 |
| `librarian` | 外部文档、库查询 | 便宜 |
| `oracle` | 架构咨询、高手点拨 | 昂贵 |
| `metis` | 任务规划、 ambiguity 分析 | 昂贵 |
| `momus` | 方案评审、质量把控 | 昂贵 |

#### Oh My OpenCode 自律军团 (推荐)

| Agent | 模型 | 用途 |
|-------|------|------|
| **Sisyphus** | Opus 4-6 / Kimi K2.5 / GLM-5 | 主指挥官，制定计划、分配任务、激进并行 |
| **Hephaestus** | GPT-5.3 Codex | 自主深度工作者，独立执行任务 |
| **Prometheus** | Opus 4-6 / Kimi K2.5 / GLM-5 | 战略规划师，访谈式需求分析 |

#### Agent 类别调度 (Oh My OpenCode)

| 类别 | 作用领域 |
| :--- | :--- |
| `visual-engineering` | 前端、UI/UX、设计 |
| `deep` | 深度自主调研与执行 |
| `quick` | 单文件修改、修错字 |
| `ultrabrain` | 复杂硬核逻辑、架构决策 |

只需说明工作类型，系统自动选择最合适的模型。

## 5. 最佳实践

### 5.1 Prompt 优化

**❌ 避免**
- "帮我优化这段代码"
- "把这个功能加上"
- "为什么会报错"

**✅ 推荐**
- "将 utils/auth.ts 中的 token 验证重构为异步函数，遵循 src/api/middleware/auth.ts 的模式"
- "在 Dashboard 页面添加数据导出功能，支持 CSV 格式，参考 components/ExportButton 的实现"
- "用户登录后出现 'undefined is not a function' 错误，堆栈显示在 auth.js:45:12，请问可能的原因？"

### 5.2 质量保障

```
1. 修改前：理解现有代码结构
2. 修改时：遵循项目规范
3. 修改后：验证通过再提交
4. 提交时：使用 atomic commit
```

### 5.3 常见陷阱

| 陷阱 | 解决方案 |
|------|----------|
| 过度信任 AI | 始终验证输出 |
| 模糊指令 | 提供具体示例 |
| 忽略边界 | 明确 MUST NOT DO |
| 盲目追加 | 先理解再修改 |

## 6. 总结

AI Coding 不是取代程序员，而是**放大程序员的能力**：

- **新手** → AI 充当导师，快速学习
- **熟手** → AI 处理琐事，专注架构
- **专家** → AI 扩展脑力，突破极限

核心心法：
> **AI 负责执行，人负责思考。**
> **给出具体要求，收获精准结果。**

---

## 7. 推荐资源

| 平台 | 账号 | 理由 |
|------|------|------|
| 抖音 | **慢学AI** | 概念为主，通俗易懂，适用于提升认知 |

---

### OpenCode MCP 配置

为了让 OpenCode 能够直接调用数据库服务，配置 MCP：

#### MySQL MCP

```bash
# 安装
npm install -g @modelcontextprotocol/server-mysql

# OpenCode 配置 (~/.config/opencode/config.json)
{
  "mcp": {
    "mysql": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-mysql"],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "13306",
        "MYSQL_USER": "root",
        "MYSQL_PASSWORD": "wZ6try8MCNGi6n8P",
        "MYSQL_DATABASE": "testing"
      }
    }
  }
}
```

#### PostgreSQL MCP

```bash
# 安装
pip install mcp-server-postgres

# OpenCode 配置
{
  "mcp": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "mcp-server-postgres"],
      "env": {
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "15432",
        "POSTGRES_USER": "testing",
        "POSTGRES_PASSWORD": "strong@Pass123!",
        "POSTGRES_DATABASE": "testing"
      }
    }
  }
}
```

#### Redis MCP

```bash
# 安装
npm install -g @modelcontextprotocol/server-redis

# OpenCode 配置
{
  "mcp": {
    "redis": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-redis"],
      "env": {
        "REDIS_URL": "redis://:Ggi057AOL8ZRrvxv@localhost:16379"
      }
    }
  }
}
```

#### RustFS (S3) MCP

```bash
# 安装 (如需要)
# RustFS 本身支持 S3 协议，可以使用 AWS CLI 或 S3 MCP

# OpenCode 配置 (使用 S3 MCP)
{
  "mcp": {
    "s3": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-s3"],
      "env": {
        "AWS_ACCESS_KEY_ID": "LehXBoVThyyDU3vZ",
        "AWS_SECRET_ACCESS_KEY": "Ggi057AOL8ZRrvxv",
        "AWS_REGION": "us-east-1",
        "S3_ENDPOINT": "http://localhost:19000"
      }
    }
  }
}
```

> **注意**：配置完成后重启 OpenCode，然后可以使用自然语言查询数据库：
> - "查询 users 表中最近10条记录"
> - "统计订单总额"
> - "查看 Redis 中的所有 key"

#### Mobile MCP (移动端自动化)

```bash
# 安装
npm install -g @mobile-mcp/server

# OpenCode 配置
{
  "mcp": {
    "mobile": {
      "command": "npx",
      "args": ["-y", "@mobile-mcp/server"]
    }
  }
}
```

> **Mobile MCP 特性：**
> - 支持 iOS/Android 真机、模拟器、虚拟机
> - 无需了解 iOS 或 Android 特定知识
> - 基于 Accessibility 树的交互，或截图坐标点击
> - 可用于自动化测试、数据抓取、表单填写等

---


---

## 1.5 Docker 开发环境 (PostgreSQL + MySQL + Redis + RustFS)

> 使用 docker-compose 一键启动完整开发栈

### 安装 Docker Desktop

```bash
# macOS 安装
brew install --cask docker

# WSL (Ubuntu) 安装
sudo apt update
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER
# 启动 Docker 服务
sudo service docker start
```

启动 Docker Desktop 后，验证安装：

```bash
docker --version
docker-compose --version
```

### 快速部署

```bash
# 创建工作目录
mkdir -p ~/dev-stack
cd ~/dev-stack

# 创建配置文件
cat > .env << 'EOF'
# Name
COMPOSE_PROJECT_NAME=dev-stack

# Database
DB_NAME=testing
DB_USER=testing
DB_PASSWORD=strong@Pass123!

# PostgreSQL
POSTGRES_PORT=15432

# MySQL
MYSQL_PORT=13306
MYSQL_ROOT_PASSWORD=strong@Pass123!

# Redis
REDIS_PORT=16379
REDIS_PASSWORD=strong@Pass123!

# S3 Compatible Storage (RustFS)
S3_ENDPOINT_PORT=19000
S3_CONSOLE_PORT=19001
S3_ACCESS_KEY=testing
S3_SECRET_KEY=strong@Pass123!
EOF

# 创建 docker-compose.yml
cat > docker-compose.yml << 'EOF'
networks:
  dev-stack:
    driver: bridge

volumes:
  postgresql-data:
  mysql-data:
  redis-data:
  rustfs-data:

services:

  # PostgreSQL
  postgres:
    image: postgres:18
    restart: unless-stopped
    ports:
      - ${POSTGRES_PORT:-15432}:5432
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgresql-data:/var/lib/postgresql
    networks:
      - dev-stack
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$DB_USER -d $$DB_NAME"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 30s

  # MySQL
  mysql:
    image: mysql:8.4
    restart: unless-stopped
    ports:
      - ${MYSQL_PORT:-13306}:3306
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - dev-stack
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -u root -p$$MYSQL_ROOT_PASSWORD"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 30s

  # Redis
  redis:
    image: redis:8.0-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - ${REDIS_PORT:-16379}:6379
    volumes:
      - redis-data:/data
    networks:
      - dev-stack
    healthcheck:
      test: ["CMD-SHELL", "REDISCLI_AUTH=$$REDIS_PASSWORD redis-cli ping | grep -q PONG"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 30s

  # RustFS (S3 兼容存储)
  rustfs:
    image: rustfs/rustfs
    restart: unless-stopped
    command: --console-enable /data
    ports:
      - ${S3_ENDPOINT_PORT:-19000}:9000
      - ${S3_CONSOLE_PORT:-19001}:9001
    environment:
      RUSTFS_CONSOLE_ENABLE: true
      RUSTFS_ACCESS_KEY: ${S3_ACCESS_KEY}
      RUSTFS_SECRET_KEY: ${S3_SECRET_KEY}
    volumes:
      - rustfs-data:/data
    networks:
      - dev-stack
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9001/health || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 30s
EOF

# 启动所有服务
docker-compose up -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 服务端口

| 服务 | 外部端口 | 内部端口 | 用途 |
|------|----------|----------|------|
| PostgreSQL | 15432 | 5432 | 关系型数据库 |
| MySQL | 13306 | 3306 | 关系型数据库 |
| Redis | 16379 | 6379 | 缓存/消息队列 |
| RustFS (S3) | 19000 | 9000 | 对象存储 API |
| RustFS Console | 19001 | 9001 | 对象存储管理后台 |

### 验证服务

```bash
# 测试 MySQL
docker exec -it mysql-dev mysql -uroot -proot123 -e "SELECT VERSION();"

# 测试 Redis
docker exec -it redis-dev redis-cli -a redis123 ping
```

### 极简安装 (不使用 docker-compose)

如果只需要快速启动单个服务：

```bash
# MySQL 快速启动
docker run -d \
  --name mysql-dev \
  -p 13306:3306 \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=devdb \
  mysql:8.0

# Redis 快速启动
docker run -d \
  --name redis-dev \
  -p 16379:6379 \
  redis:7.0-alpine redis-server --requirepass redis123
```

### 常用命令

```bash
# 启动/停止
docker-compose start
docker-compose stop

# 重启
docker-compose restart

# 查看日志
docker-compose logs -f mysql
docker-compose logs -f redis

# 进入容器
docker exec -it mysql-dev bash
docker exec -it redis-dev sh

# 删除容器（数据保留）
docker-compose down

# 删除容器 + 数据（危险！）
docker-compose down -v
```

### 应用连接配置

```typescript
// MySQL 连接 (Node.js 示例)
const mysql = require('mysql2/promise');
const db = await mysql.createPool({
  host: 'localhost',
  port: 13306,  // 外部端口 13306 (内部 3306)
  user: 'root',
  password: 'root123',
  database: 'devdb'
});

// Redis 连接 (Node.js 示例)
const redis = require('ioredis');
const redisClient = new redis({
  host: 'localhost',
  port: 16379,  // 外部端口 16379 (内部 6379)
  password: 'redis123'
});
```

## 8. FAQ

**Q: GLM 5 和 GLM 4.7 哪个更稳定？**

A: **推荐使用 GLM 4.7**。GLM 5 在长对话中容易"跑飞"（上下文丢失、角色扮演失控），GLM 4.7 稳定性更好，性价比也更高。

**Q: Minimax 2.5 表现如何？**

A: **总体不错**。Minimax 2.5 在复杂推理、代码理解方面表现优秀，适合处理架构设计、bug 定位等高难度任务。缺点是响应速度稍慢，费用较高。
