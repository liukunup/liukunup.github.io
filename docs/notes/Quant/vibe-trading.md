---
title: Vibe-Trading 部署与使用指南：你的个人交易代理
createTime: 2026/06/28 23:00:00
permalink: /notes/quant/vibe-trading/
tags:
  - AI
  - LLM
  - Agent
  - 多智能体
  - 金融
  - 量化交易
  - MCP
  - 因子研究
description: HKUDS 出品的 Vibe-Trading 介绍：你的个人交易代理，覆盖 18+ 数据源、10 家券商连接器、Swarm 多 Agent 协作、456+ 学术因子库、Research Autopilot。
---

## 引言

[Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) 是由 **HKUDS**（香港大学 Data Science 实验室）开源的个人交易代理项目，标语为 *"Vibe-Trading: Your Personal Trading Agent"*。

> **一行命令让你的 Agent 拥有完整的交易能力**。Vibe-Trading 是面向量化研究全流程的多 Agent 系统：数据获取 → 因子发现 → 回测 → 归因 → 跟单，覆盖 18+ 数据源、10 家券商连接器、456+ 学术因子，提供 Swarm 协作、Research Autopilot、Shadow Account 等高级特性。

- 仓库：[HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading)
- 安装：`pip install vibe-trading-ai`
- 文档站：[vibetrading.wiki](https://vibetrading.wiki/)
- Stars：⭐ 13.6k+

> ⚠️ **重要说明**：本项目仅供学习与研究使用，不提供实盘交易指令，请勿用于真实投资决策。

## 项目亮点

### 一站式量化研究

Vibe-Trading 把量化研究的每个环节都接入了 LLM Agent：

- **多 Agent Swarm** - 投资委员会、量化研究台、风控委员会等多 Agent 协作
- **Research Autopilot** - 自动从假设 → 信号引擎 → 回测的闭环
- **Shadow Account** - 从回测自动提取规则并生成可执行策略引擎
- **学术因子库** - 456+ 经典学术因子（Jegadeesh 反转、Amihud 非流动性、Harvey-Siddique 偏度等）
- **严格 α 检验** - β 回归 + 市场状态分析 + 蒙特卡洛置换检验

### 18+ 数据源

覆盖全球主要市场：

| 数据源 | 覆盖市场 | 鉴权 |
|--------|---------|------|
| Tushare | A 股 | 需要 Token |
| AKShare | A 股 | 免费 |
| BaoStock | A 股 | 免费 |
| 东方财富 | A 股 | 免费 |
| 新浪财经 | A 股 | 免费 |
| yfinance | 全球 | 免费 |
| CCXT（Binance / OKX / Bybit） | 加密 | 可选 |
| Finnhub | 美股 | 需要 Key |
| Alpha Vantage | 美股 | 需要 Key |
| Tiingo | 美股 | 需要 Key |
| FMP | 美股 | 需要 Key |
| Stooq | 美股 | 免费 |
| Yahoo | 全球 | 免费 |
| 通达信（mootdx） | A 股 | 免费 |
| 本地文件（CSV / Parquet / DuckDB） | 自有数据 | — |
| SEC EDGAR + XBRL | 美股财报 | 免费 |
| 期权链 | 美股 | 取决于源 |

### 10 家券商连接器

| 券商 | 市场 | 实盘模式 |
|------|------|----------|
| IBKR（盈透） | 美股 / 全球 | Paper + Live（bounded） |
| Robinhood | 美股 | Live（OAuth + Mandate） |
| Tiger Trade | 港股 / 美股 | Paper + Live（bounded） |
| Longbridge（长桥） | 港股 / 美股 | Paper + Read-only |
| Alpaca | 美股 / ETF / 加密 | Paper + Live（bounded） |
| Binance | 加密 | Paper + Live（bounded） |
| OKX | 加密 | Paper + Live（bounded） |
| Futu（富途） | 港股 / 美股 | Paper + Live（bounded） |
| Dhan | 印度 NSE/BSE | Paper + Read-only |
| Shoonya | 印度 NSE/BSE | Paper + Read-only |

> ⚠️ 实盘执行受 **mandate（用户承诺）**、**文件系统 kill switch**、**pre-trade gate** 与 **完整审计日志** 保护。默认 paper-only，开启实盘需服务端显式解锁。

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│           CLI / Web UI / REST / MCP 入口                │
│        (FastAPI + React + agent/cli 终端 UI)             │
└─────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────┐
│           Agent 循环（68 工具）                          │
│  Swarm / Research Goal / Hypothesis → Signal → Backtest │
└─────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────────┐
        │ Data Loaders│  │ Alpha Zoo │   │ 券商连接器    │
        │  18 个     │   │ 456+ 因子 │   │  10 家       │
        └──────────┘    └──────────┘    └──────────────┘
                              │
                              ▼
                  ┌─────────────────────┐
                  │ Shadow Account       │
                  │ Research Autopilot   │
                  │ Strict α Bench       │
                  └─────────────────────┘
```

| 组件 | 技术栈 |
|------|--------|
| **核心** | Python 3.11+ |
| **后端** | FastAPI |
| **前端** | React |
| **协议** | MCP（68 个工具）、REST、SSE |
| **数据** | 18 个 loader（tushare / akshare / yfinance / CCXT / 通达信 / 本地文件 / …） |
| **可观测** | Provider Doctor、per-run token usage、per-run trace |

## 快速上手

### 安装

```bash
pip install vibe-trading-ai
```

### 启动 Web UI

```bash
vibe-trading webui
```

默认监听 `http://localhost:8000`，包含聊天、Alpha 因子库、Swarm 仪表板、回测 Run Library。

### CLI 使用

```bash
# 进入交互式 CLI（带 Claude Code 风格的活动栏）
vibe-trading

# 比较指定因子的表现
vibe-trading alpha compare alpha_1 alpha_2 alpha_3 --sort ir

# 恢复过去的 session
vibe-trading resume <session-id>

# Provider 健康检查
vibe-trading provider doctor
```

### Docker 部署

仓库自带 `docker-compose.yml`，**Docker 内 `localhost` 指向容器自身**，所以已默认使用 `host.docker.internal` 让宿主侧 Ollama 直连：

```bash
git clone https://github.com/HKUDS/Vibe-Trading.git
cd Vibe-Trading
docker compose up -d
```

> 持久化数据（memory、session 索引、用户 skill、shadow account、broker config）已改为 **命名 volume**，`docker compose up --build` 不会再清空数据。

## 核心特性详解

### Swarm 多 Agent 协作

启动多 Agent 投资委员会 / 量化研究台 / 风控委员会，**每个 worker 通过 MCP 拉取市场数据**（避免重复请求和 ad-hoc 脚本）。每类工作流有 21 个 worker × 13 种预设，事件通过 SSE 实时推送，状态卡实时显示 waiting / running / done / failed / blocked / retrying。

### Shadow Account

从历史回测中**自动提取交易规则**（RSI 区间、prior-return 区间），生成可执行的 `SignalEngine`：

```python
# 自动提取的条件
if 30 <= rsi14 <= 70 and -0.05 <= prior_5d_return <= 0.05:
    enter_position()
```

新版本（2026-06-26）统一了 `PRICE_FEATURES` 合约并保留四位小数精度，避免规则/codegen 漂移。

### Research Autopilot

端到端的「假设 → 信号引擎 → 回测」闭环：

1. `run_research_autopilot` 生成研究假设
2. `scaffold_signal_engine` 自动生成合约正确的引擎
3. `link_autopilot_backtest` 把回测指标反馈给假设
4. 共 68 个工具可用

### 严格 α 检验

每个 backtest 完成后会自动跑：

- **交易级别归因** - 胜者/败者分解
- **β 回归** - 拆解市场 beta 贡献
- **市场状态分析** - 牛市/熊市/震荡市表现
- **蒙特卡洛置换检验** - 检验显著性

并提供 `run_bench_strict()` 加 OOS 拆分 + 随机对照，捕捉仅跟踪市场 beta 的因子。

### 提供商可靠性

针对 DeepSeek hang、Kimi 访问、Opus 4.8+ 拒答等真实问题做了深度修复：

- **能力层（capability layer）** - 把 reasoning capture、Gemini thought signature、Kimi User-Agent、OpenRouter reasoning body 各自隔离，避免跨污染
- **流式失败** - 抛出 `provider_stream_error`，自动重试一次瞬时重置，确定性 4xx 立即失败
- **空响应** - 报 `empty_model_response` 而非"max iterations"
- **Kimi k2.x** - 自动应用 `temperature=1` 限制，端到端验证
- **Provider Doctor** - 一键打印 provider/model/package/proxy 快照

## 与 TradingAgents-CN 的差异

| 维度 | TradingAgents-CN | Vibe-Trading |
|------|------------------|--------------|
| **关注点** | 研报型多 Agent | 量化研究型多 Agent |
| **输出** | 单只股票深度报告 | 因子 + 策略 + 回测 |
| **数据源** | A 股 / 港股 / 美股（~4 个） | 18+ 跨全球市场 |
| **回测** | 无 | 内置（含严格 α 检验） |
| **券商执行** | ❌ 研报 | ✅ 10 家连接器 |
| **协议** | REST + WebSocket | REST + MCP（68 工具） |
| **学术因子库** | 无 | 456+ |
| **典型场景** | "分析茅台该不该买" | "自动挖因子并回测" |

## 注意事项

1. **合规使用** - 本项目仅供学习研究，不提供实盘交易信号
2. **实盘风险** - 所有"Live"模式都受 mandate + kill switch 保护，实验性功能
3. **数据准确性** - AI 分析结果仅供参考，投资决策请结合自身判断
4. **API 成本** - 频繁使用会消耗大量 Token，注意控制预算
5. **安全提示** - 项目明确警告：**官方 Discord 仅有 [HKUDS Discord](https://discord.gg/6TdQnT5xcF)**，曾有仿冒 Discord 实施钱包钓鱼诈骗，遇到"验证钱包"请立即拉黑

## 相关链接

- 仓库：[HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading)
- 安装：[pypi.org/project/vibe-trading-ai](https://pypi.org/project/vibe-trading-ai/)
- 文档站：[vibetrading.wiki](https://vibetrading.wiki/)
- 官方 Discord：[discord.gg/6TdQnT5xcF](https://discord.gg/6TdQnT5xcF)
- 关联项目：[HKUDS/AI-Trader](/notes/quant/ai-trader/)（HKUDS 同门）
- 关联项目：[brokermr810/QuantDinger](/notes/quant/quantdinger/)（量化基础设施）

> 💡 **关联阅读**：想要"AI 代理社区 + 跟单"方向，可参考 [AI-Trader](/notes/quant/ai-trader/)；想要"自托管量化生产平台"，可参考 [QuantDinger](/notes/quant/quantdinger/)。
