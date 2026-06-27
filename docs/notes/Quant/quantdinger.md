---
title: QuantDinger 部署与使用指南：开源 AI 量化基础设施
createTime: 2026/06/28 23:00:00
permalink: /notes/quant/quantdinger/
tags:
  - AI
  - LLM
  - Agent
  - 多智能体
  - 金融
  - 量化交易
  - MCP
  - 加密货币
description: QuantDinger 介绍：开源 AI 量化基础设施层，覆盖加密 / 股票 / 外汇，多 LLM 投研、Python 原生策略、服务端回测、多券商实盘执行。
---

## 引言

[QuantDinger](https://github.com/brokermr810/QuantDinger) 是由 **brokermr810** 开源的自托管 AI 量化基础设施项目，标语为 *"The open-source AI infrastructure layer for quant trading"*。

> **把交易想法变成 Python 策略、回测、模拟盘、实盘执行——全部在一个自托管栈中完成**。AI 研究 → 策略代码 → 回测 → 模拟/实盘执行 → 监控，QuantDinger 把量化全流程统一到一套生产级栈中。
>
> *AI research -> Strategy code -> Backtest -> Paper/Live execution -> Monitoring*

- 仓库：[brokermr810/QuantDinger](https://github.com/brokermr810/QuantDinger)
- 在线试用：[ai.quantdinger.com](https://ai.quantdinger.com)
- AWS Marketplace：[ThinkCloud AMI](https://aws.amazon.com/marketplace/pp/prodview-naanrb7d2mbc6)
- Stars：⭐ 8.9k+

> ⚠️ **重要说明**：本项目仅供学习与研究使用，不提供实盘交易指令，请勿用于真实投资决策。

## 项目亮点

### 全栈量化 OS

QuantDinger 不是"加了个 AI 按钮的回测器"，而是 **从市场数据采集到实盘执行的端到端基础设施**：

- **专业 KLine 图表 UI**
- **Indicator IDE** - 编写和测试技术指标
- **AI 研究 / 多 LLM 集成** - 多 LLM 集成分析
- **服务端回测** - 真实的回测，含权益曲线、回撤、交易日志
- **实盘机器人** - 7×24 策略机器人
- **快捷交易** - 手动快速下单
- **券商账户管理** - 统一的多券商多账户管理
- **Notifications** - Telegram / Email / SMS / Discord / Webhook

### 双策略运行时

| 策略类型 | 适用场景 | 特点 |
|---------|---------|------|
| **`IndicatorStrategy`** | 研究、信号生成 | 向量化 dataframe，buy/sell 信号 + 图表叠加 |
| **`ScriptStrategy`** | 生产、复杂逻辑 | 事件驱动 `on_bar`，显式 `ctx.buy()` / `ctx.sell()` |

研究和生产使用 **同一份代码库**，策略从回测到上线无缝迁移。

### 多市场 + 多券商执行

| 资产 | 数据源 | 券商 |
|------|--------|------|
| **加密货币** | CCXT（Binance / OKX / Bybit / …） | CCXT 对接的 10+ 交易所 |
| **美股 / ETF / 加密** | Alpaca / yfinance / FinnHub | Alpaca |
| **外汇** | MT5 数据 | MT5 |
| **美股 / 全球** | IBKR 数据 | IBKR（TWS / IB Gateway） |

统一通过 **Broker Accounts** 页面管理多租户、多账户、隔离会话。

### Agent Gateway + MCP

第一类公民的 **Agent 原生支持**：

- **`/api/agent/v1` 端点** - Cursor、Claude Code、Codex 都能调用
- **`quantdinger-mcp` 包** - 上 PyPI，把 Agent Gateway 包装成 MCP 工具
- **审计日志** - 每次 agent 调用都留痕
- **Paper-only 默认** - Agent Token 默认是模拟盘
- **Live 解锁** - 需要 server 端 `AGENT_LIVE_TRADING_ENABLED=true` + token 显式 `paper_only=false`

> **安全模型**：交换所密钥始终留在用户自己的部署中，不会上传到 QuantDinger SaaS。每次 agent 调用都 append-only 审计。开启 live-trading 需双向显式确认。

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                  Nginx (宿主机 :8888)                    │
│             Vue SPA (ghcr.io 镜像)                       │
└─────────────────────────────────────────────────────────┘
                              ▲ HTTP
                              │
┌─────────────────────────────────────────────────────────┐
│           Flask + Gunicorn API (:5000)                  │
│  Strategy · AI Analysis · Billing · Agent Gateway       │
└─────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────────┐
        │PostgreSQL│    │  Redis   │    │ 日志/运行数据 │
        │   16     │    │    7     │    │              │
        └──────────┘    └──────────┘    └──────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │        External Adapters             │
        │  LLM · Crypto Exchanges · IBKR/MT5   │
        │  Alpaca · Market Data · Payment       │
        │  Notifications · MCP                 │
        └──────────────────────────────────────┘
```

| 组件 | 技术栈 |
|------|--------|
| **前端** | Vue 3 + Vite（GHCR 镜像 `ghcr.io/brokermr810/quantdinger-frontend`） |
| **后端** | Flask + Gunicorn（Python 3.10+） |
| **数据库** | PostgreSQL 16（系统记录） |
| **缓存** | Redis 7（缓存 + Worker 协调） |
| **数据/状态** | 双策略运行时（IndicatorStrategy / ScriptStrategy） |
| **Agent** | Agent Gateway (`/api/agent/v1`) + `quantdinger-mcp`（PyPI） |
| **基础设施** | Docker Compose（多架构 amd64/arm64） + AWS Marketplace AMI |

## 快速上手

### 方式一：一行命令安装（最快）

Linux / macOS：

```bash
curl -fsSL https://raw.githubusercontent.com/brokermr810/QuantDinger/main/install.sh | bash
```

Windows PowerShell：

```powershell
irm https://raw.githubusercontent.com/brokermr810/QuantDinger/main/install.ps1 | iex
```

> 无需 `git clone`、无需 `npm`、无需 Vue 源码。安装器会询问管理员账号、写安全密钥、拉 GHCR 镜像、启动 Docker Compose。

安装到 `~/quantdinger`（Linux/macOS）或 `$HOME\quantdinger`（Windows）。启动后访问 `http://localhost:8888`。

### 方式二：手动克隆

```bash
git clone https://github.com/brokermr810/QuantDinger.git
cd QuantDinger

cp backend_api_python/env.example backend_api_python/.env
./scripts/generate-secret-key.sh

# 编辑 backend_api_python/.env，至少配置：
#   ADMIN_USER=your_admin_user
#   ADMIN_PASSWORD=your_secure_password

docker compose pull
docker compose up -d
```

> **Node.js 不需要**：`frontend` 服务直接从 GHCR 拉镜像，Nginx 提供 SPA 服务。

### 方式三：仅两个文件，零仓库安装

```bash
curl -O https://raw.githubusercontent.com/brokermr810/QuantDinger/main/docker-compose.ghcr.yml
curl -o backend.env https://raw.githubusercontent.com/brokermr810/QuantDinger/main/backend_api_python/env.example

docker compose -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.ghcr.yml up -d
```

后端入口会自动生成随机 `SECRET_KEY` 并应用 schema。

### 镜像加速

如果 `docker pull` 慢（中国大陆 / 启用 VPN），在仓库根 `.env` 添加：

```env
IMAGE_PREFIX=docker.m.daocloud.io/library/
```

或在 **Docker Desktop → Proxies** 中配置代理（仅系统 VPN 常常不够）。

### 验证

| 检查 | URL / 命令 |
|------|-----------|
| Web UI | `http://localhost:8888`（可通过 root `.env` 中 `FRONTEND_HOST` / `FRONTEND_PORT` 覆盖） |
| API 健康 | `http://localhost:5000/api/health` |
| 日志 | `docker compose logs -f backend` |

> ⚠️ **生产密码**：默认 `123456` 仅用于本地首次启动，**生产或共享环境必须** 设置 `ADMIN_PASSWORD` 为非默认强密码。**`SECRET_KEY` 默认为占位符时 API 会拒绝启动**（防止意外不安全部署）。

### 启用 AI 功能

`backend_api_python/.env` 中启用 LLM Provider（任选其一）：

```env
# OpenRouter（推荐，国际聚合）
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx

# 或 OpenAI 兼容
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxx

# 或 AtlasCloud（OpenAI 兼容）
LLM_PROVIDER=atlascloud
ATLASCLOUD_API_KEY=your_key
ATLASCLOUD_MODEL=openai/gpt-5.4
ATLASCLOUD_BASE_URL=https://api.atlascloud.ai/v1
```

修改后重启后端：

```bash
docker compose restart backend
```

## 常用运维命令

```bash
docker compose ps
docker compose logs -f backend
docker compose restart backend
docker compose pull
docker compose up -d
docker compose up -d --build backend   # 仅后端代码变更
docker compose down
```

## 关键配置（root `.env`）

`backend_api_python/.env` 控制 **绝大部分运行时行为**（数据库 URL、管理员、LLM Key、Worker、Billing 开关等），而仓库根 `.env` 只调整 **Compose 编排层**（端口、镜像前缀）：

```env
# 端口
FRONTEND_PORT=3000
BACKEND_PORT=127.0.0.1:5001

# 镜像加速
IMAGE_PREFIX=docker.m.daocloud.io/library/

# 版本钉死（lockstep）
IMAGE_TAG=4.0.1
# 或单边
# BACKEND_TAG=4.0.1
# FRONTEND_TAG=4.0.1
```

## 项目结构

```
QuantDinger/
├── backend_api_python/   # Flask 后端
├── QuantDinger-Vue/      # 前端源码（独立仓库，ghcr.io 镜像发布）
├── docs/                 # 多语言文档
│   ├── api/              # OpenAPI 规范
│   ├── agent/            # Agent Gateway + MCP
│   └── *.md              # 部署、配置、API、Agent 设计
├── mcp_server/           # quantdinger-mcp 包
├── scripts/              # generate-secret-key.sh 等工具
├── docker-compose.yml    # 主编排（拉 GHCR 镜像）
├── docker-compose.ghcr.yml  # 零仓库精简编排
└── docker-compose.build.yml  # 本地构建前端覆盖
```

## 安全模型

| 项 | 行为 |
|----|------|
| **Agent Token** | 默认 paper-only，live 需 token `paper_only=false` + 服务端 `AGENT_LIVE_TRADING_ENABLED=true` |
| **Exchange Key** | 始终在用户自己的部署中，不上传 SaaS |
| **SECRET_KEY** | 默认占位符时 API 拒绝启动 |
| **审计日志** | append-only 记录每次 agent 调用 |
| **TronGrid / USDT** | Billing 模块支持 USDT 支付 |
| **不提供投资建议** | 软件仅供合法研究与执行 |

## 与 TradingAgents-CN 的差异

| 维度 | TradingAgents-CN | QuantDinger |
|------|------------------|-------------|
| **关注点** | 研报型多 Agent | 量化生产平台（端到端） |
| **输出** | 深度研报 | 策略 + 回测 + 实盘 |
| **后端** | FastAPI | Flask + Gunicorn |
| **数据库** | MongoDB + Redis | PostgreSQL 16 + Redis 7 |
| **数据源** | A 股 / 港股 / 美股 | 加密 / 美股 / 外汇 |
| **实盘执行** | ❌ 研报 | ✅ 10+ 加密 + IBKR/MT5/Alpaca |
| **回测** | 无 | 服务端，含权益曲线 / 回撤 / 交易日志 |
| **策略引擎** | 无 | IndicatorStrategy + ScriptStrategy |
| **协议** | REST + WebSocket | REST + Agent Gateway + MCP |
| **典型场景** | "分析茅台该不该买" | "从策略到实盘的工厂" |

## 关联仓库

| 仓库 | 用途 |
|------|------|
| **[brokermr810/QuantDinger](https://github.com/brokermr810/QuantDinger)** | 后端 + Compose 编排 + 文档（本仓库） |
| **[brokermr810/QuantDinger-Vue](https://github.com/brokermr810/QuantDinger-Vue)** | Web 前端源码（Vue），tag v\* → 自动发布 GHCR 镜像 |
| **[brokermr810/QuantDinger-Mobile](https://github.com/brokermr810/QuantDinger-Mobile)** | 开源移动端，配合自托管/SaaS 后端 |

## 注意事项

1. **合规使用** - 本项目仅供学习研究，不提供实盘交易信号
2. **数据准确性** - AI 分析结果仅供参考，投资决策请结合自身判断
3. **API 成本** - 频繁使用会消耗大量 Token，注意控制预算
4. **生产安全** - `SECRET_KEY`、管理员密码、券商 API Key **必须** 改强；启用 live-trading 前阅读 `docs/` 全部安全章节
5. **备份** - Postgres volume 是状态核心，建议 `docker run --rm -v <volume>:/data -v $(pwd):/backup alpine tar czf ...` 定期备份

## 相关链接

- 仓库：[brokermr810/QuantDinger](https://github.com/brokermr810/QuantDinger)
- 官网：[quantdinger.com](https://www.quantdinger.com)
- 在线试用：[ai.quantdinger.com](https://ai.quantdinger.com)
- AWS Marketplace：[ThinkCloud AMI](https://aws.amazon.com/marketplace/pp/prodview-naanrb7d2mbc6)
- MCP 包：[pypi.org/project/quantdinger-mcp](https://pypi.org/project/quantdinger-mcp/)
- API 文档：[docs/api/openapi.yaml](https://github.com/brokermr810/QuantDinger/blob/main/docs/api/openapi.yaml)
- Telegram：[t.me/quantdinger](https://t.me/quantdinger)
- Discord：[discord.gg/tyx5B6TChr](https://discord.com/invite/tyx5B6TChr)
- 关联项目：[HKUDS/AI-Trader](/notes/quant/ai-trader/)（Agent 社区方向）
- 关联项目：[HKUDS/Vibe-Trading](/notes/quant/vibe-trading/)（个人代理方向）

> 💡 **关联阅读**：想要"AI 代理社区 + 跟单"方向，可参考 [AI-Trader](/notes/quant/ai-trader/)；想要"个人量化研究助手"，可参考 [Vibe-Trading](/notes/quant/vibe-trading/)。
