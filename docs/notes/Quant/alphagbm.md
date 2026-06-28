---
title: AlphaGBM 介绍与使用指南：实时期权与股票研究智能平台
createTime: 2026/06/28 00:00:00
permalink: /notes/quant/alphagbm/
tags:
  - AI
  - LLM
  - Agent
  - 金融
  - 量化交易
  - 期权
  - Skills
  - AlphaGBM
description: AlphaGBM 介绍：实时期权与股票研究智能平台，29 个 AI Skills 覆盖美股/港股/A股/商品期权。
---

## 引言

[**AlphaGBM**](https://www.alphagbm.com/) 是一个 **AI 驱动的实时期权与股票研究智能平台**，slogan 为 *"Real data, not LLM guesswork."*

> 每一行数字都来自真实市场数据——IV、Greeks、VRP、Skew、Flow——而不是 LLM 幻觉。AlphaGBM 把这套"真实数据层"打包成 29 个可被 AI Agent 直接调用的 Skills（Claude Code / Cursor / Windsurf 等），并提供 Web SaaS、CLI 和 REST API 三种接入方式。

- 网站：[alphagbm.com](https://www.alphagbm.com/)
- GitHub：[github.com/AlphaGBM](https://github.com/AlphaGBM)（165 followers）
- 核心开源仓库：[AlphaGBM/skills](https://github.com/AlphaGBM/skills)（⭐ 1.1k · Fork 157 · 100% Python · MIT）
- 辅助开源仓库：[AlphaGBM/investment-masters](https://github.com/AlphaGBM/investment-masters)（⭐ 125）— 12 位投资大师方法论
- 知识星球：AlphaGBM 投研圈
- 语言：EN + CN（中英双语）
- 自称规模：10,000+ 交易者使用，3 个月实盘验证

> ⚠️ **重要说明**：本项目仅供学习与研究使用，不提供实盘交易指令；所有评分、信号、推荐仅供参考，请勿作为唯一投资依据。

## 项目亮点

### 真实数据 vs LLM 瞎编 vs 通用 API

| 维度 | LLM 角色扮演工具 | 通用金融 API | **AlphaGBM** |
| :--- | :--- | :--- | :--- |
| **数据来源** | LLM 生成 | 延迟/基础 | **实时期权数据** |
| **可验证性** | "85% 把握" | 部分可验证 | **每个数字都有来源** |
| **期权深度** | 无 | 基础 chain | **IV/HV/VRP/Greeks/Skew/Surface** |
| **评分** | 主观 | 无 | **量化评分（期权 0-100、股票 1-10）** |
| **分析模型** | 无 | 无 | **G = B + M（Basics + Momentum）** |
| **实战检验** | 否 | 不定 | **3 个月实盘验证** |
| **覆盖范围** | 仅美股 | 不定 | **US + HK + CN + 商品** |

### 核心能力

- **📊 实时期权数据** — IV / HV / VRP / Greeks / Skew / Vol Surface 全部来自真实行情
- **🎯 量化评分** — 期权合约 0-100 分、股票 1-10 分，可对比可复现
- **🤖 29 个 AI Skills** — Claude Code / Cursor / Windsurf 开箱即用
- **💬 自然语言驱动** — 直接问 "Analyze AAPL" 即可触发完整分析链
- **🔌 多种接入方式** — Web SaaS、Python CLI、REST API
- **🎓 投资大师方法论** — Buffett / Marks / Tepper / 段永平 风格量化器

## 核心数据模型

> 摘自 [AlphaGBM/skills README](https://github.com/AlphaGBM/skills)，所有公式都是公开定义，可逐条复核。

| 指标 | 值 | 计算方式 |
| :--- | :--- | :--- |
| **IV（隐含波动率）** | 例如 32.5% | 用真实 bid/ask 价做 Black-Scholes 反推 |
| **IV Rank** | 例如 58 | 当前 IV vs 过去 252 个交易日 |
| **VRP** | 例如 +4.0% | `Implied Vol − Historical Vol`，衡量期权是否高估 |
| **Option Score** | 0-100 | 加权：premium yield + 支撑/阻力 + 安全垫 + 趋势 + PoP + 流动性 + 时间衰减 |
| **Stock Score** | 1-10 | `G = B + M` — Basics（PE/PEG/增长/毛利）+ Momentum（VIX/技术/资金流） |
| **Risk** | 1-10 | 加和：估值 +2、增长 +2、流动性 +2、市场 +1.5、技术 +1 |
| **EV（期望收益）** | 例如 +5.2% | `50% × 1w + 30% × 1m + 20% × 3m` |

> **核心哲学**：这不是 *"基于我的训练数据"* 或 *"我估计有 85% 把握"*——这是市场数据上的数学。

## 市场覆盖

| 市场 | 股票 | 期权 | 数据点 |
| :--- | :---: | :--- | :--- |
| **US（美股）** | 200+ | 完整 chains | IV / HV / VRP / Greeks / Skew / Surface |
| **HK（港股）** | 35+ | 完整 chains | IV / HV / VRP / Greeks |
| **CN（A 股）** | 20+ ETF | 完整 chains | IV / HV / VRP / Greeks |
| **Commodities（商品）** | Au / Ag / Cu / Al | 期货期权 | IV / Greeks / 交割风险 |

## 30 秒快速上手（无需 API Key）

所有 Skills 内置 **AAPL / NVDA / SPY / TSLA / META** 五个标的的 mock data，零配置就能用。

### Claude Code

```bash
# 克隆到项目内的 Claude Skills 目录
git clone https://github.com/AlphaGBM/skills.git .claude/skills/alphagbm
```

然后直接在 Claude Code 中说：

> "Analyze AAPL stock using AlphaGBM"
> "Score NVDA options"
> "Show me TSLA's volatility surface"
> "What's the best bullish strategy for META?"

### Cursor

```bash
git clone https://github.com/AlphaGBM/skills.git .cursor/skills/alphagbm
```

## 详细安装

### 方式一：作为 Claude Code Skills 安装

```bash
# 项目级（推荐，每个项目独立）
git clone https://github.com/AlphaGBM/skills.git .claude/skills/alphagbm

# 或作为子模块（便于升级）
git submodule add https://github.com/AlphaGBM/skills.git .claude/skills/alphagbm
```

### 方式二：Cursor / Windsurf

```bash
# Cursor
git clone https://github.com/AlphaGBM/skills.git .cursor/skills/alphagbm

# Windsurf 类似，使用 .windsurf/skills/ 目录
```

### 方式三：Python CLI

```bash
# 克隆仓库
git clone https://github.com/AlphaGBM/skills.git
cd skills/cli
pip install -e .

# 配置 API Key（详见下节"API 集成"）
alphagbm config set-key agbm_xxxxxxxxxxxxxxxx

# 立即使用
alphagbm stock analyze AAPL
alphagbm options score NVDA
```

完整 CLI 文档见 [cli/README.md](https://github.com/AlphaGBM/skills/blob/main/cli/README.md)。

## CLI 使用

```bash
# 配置 API Key
alphagbm config set-key agbm_xxxxxxxxxxxxxxxx

# 股票分析（G=B+M 模型）
alphagbm stock analyze AAPL

# 期权评分（0-100，4 大策略：Sell Put / Sell Call / Buy Put / Buy Call）
alphagbm options score NVDA
```

CLI 把"AI 交互"翻译成"脚本化调用"，适合嵌入自己的研报流水线或定时任务。

## API 集成

### 申请 API Key

前往 [alphagbm.com/api-keys](https://alphagbm.com/api-keys) 申请免费 Key。

### 配额

| 套餐 | 股票分析 | 期权分析 | 快速行情 |
| :--- | :---: | :---: | :---: |
| **Free** | 2 / 天 | 1 / 天 | 不限 |
| **Plus** | 1,000 / 月 | 1,000 / 月 | 不限 |
| **Pro** | 5,000 / 月 | 5,000 / 月 | 不限 |

### 环境变量

```bash
# 必填
export ALPHAGBM_API_KEY=agbm_xxxxxxxxxxxxxxxx

# 可选：覆盖默认 base URL（默认就是 https://alphagbm.zeabur.app）
export ALPHAGBM_BASE_URL=https://alphagbm.zeabur.app
```

### 健康检查（无需鉴权）

```bash
curl https://alphagbm.zeabur.app/api/health
```

返回 API 状态、可用数据字段、数据源健康度、市场覆盖——Agent 在调用前可用此端点验证可用性。

### 端到端调用示例

> 来自 README：用户说 *"Analyze AAPL, then find the best options play"*，Agent 自动串联以下调用：

```
1. GET  /api/stock/quick-quote/AAPL            → $261.40 (-0.8%)
2. POST /api/stock/analyze-sync                → G=B+M score 7.0/10, EV +5.2%, BUY
   {"ticker": "AAPL", "style": "balanced"}       Risk 4/10, target $275, stop-loss $239

3. GET  /api/options/snapshot/AAPL             → IV 32.5%, IV Rank 58, VRP +4.0%
4. POST /api/options/chain-sync                → Sell Put scores: 80, 78, 75...
   {"symbol": "AAPL", "expiry_date": "..."}       Buy Call scores: 76, 74, 72...

5. POST /api/options/tools/strategy/build      → Bull Call Spread 265/280
   {"template_id": "bull_call_spread"}            Max profit $1085, max loss $415

6. POST /api/options/tools/simulate            → Breakeven $269.15, PoP 44.5%
   {"symbol": "AAPL", "legs": [...]}
```

> *"Is that IV expensive?"*

```
7. GET  /api/options/snapshot/AAPL             → IV Rank 58 (moderate)
8. GET  /api/options/tools/vol-surface/AAPL    → ATM IV in contango, earnings in 26d
```

全部基于真实 API 调用，全部可验证。

## 29 个 Skills 全景

> 完整列表见 [github.com/AlphaGBM/skills](https://github.com/AlphaGBM/skills/tree/main/skills)。所有 Skill 名称可点击跳转到对应源码。

### 1. Core Analysis 核心分析（7 个）

| Skill | 作用 | 示例查询 |
| :--- | :--- | :--- |
| [Stock Analysis](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-stock-analysis) | G=B+M 模型：基本面、动量、EV、风险评分、AI 报告 | "Analyze AAPL" |
| [Options Score](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-options-score) | 4 大策略（Sell Put/Call、Buy Put/Call）0-100 评分 | "Best NVDA call to buy" |
| [Options Strategy](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-options-strategy) | 策略构建器 + 扫描器，15+ 模板 | "Bullish play on TSLA" |
| [Vol Surface](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-vol-surface) | 跨 strike & expiry 的 3D 隐含波动率 | "Is AAPL IV expensive?" |
| [Vol Smile](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-vol-smile) | 单到期日的 skew 分析 | "NVDA put skew" |
| [Greeks](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-greeks) | Greeks 计算器 + 隐含波动率求解器 | "Greeks for AAPL 220C" |
| [P&L Simulator](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-pnl-simulator) | 任意仓位的 what-if 分析 | "Simulate my iron condor" |

### 2. Data Intelligence 数据智能（6 个）

| Skill | 作用 | 示例查询 |
| :--- | :--- | :--- |
| [IV Rank](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-iv-rank) | 当前 IV 相对 252 日历史的百分位 | "Is TSLA IV high?" |
| [Earnings IV Panel](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-earnings-crush) | 财报前 IV Crush 历史 + 隐含波动 + IV Rank 标签 + Iron Condor 定价 | "Iron Condor for META earnings" |
| [Unusual Activity](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-unusual-activity) | 聪明钱 / 大单检测 | "Unusual options flow today" |
| [Market Sentiment](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-market-sentiment) | VIX、Put/Call、Fear & Greed 仪表盘 | "Market sentiment now" |
| [VIX Status](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-vix-status) ✨ | 5 档恐惧温度计：calm / normal / 卖方甜区 / caution / 极度恐惧 | "Is this a good time for BPS?" |
| [FearScore](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-fear-score) ✨ | 单标的 6 指标恐慌综合分；≥60 是 BPS 入场信号 | "Fear score QQQ", "is NVDA oversold" |

### 3. Workflow Tools 工作流工具（4 个）

| Skill | 作用 | 示例查询 |
| :--- | :--- | :--- |
| [Compare](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-compare) | 股票 + 期权并排对比 | "AAPL vs MSFT" |
| [Watchlist](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-watchlist) | 监控 ticker 关键变化 | "Add NVDA to watchlist" |
| [Alert](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-alert) | 设置 IV、价格、异动告警 | "Alert if TSLA IV > 80" |
| [Polymarket](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-polymarket) | 预测市场 vs 期权定价 | "Rate cut odds vs options" |

### 4. Risk & Portfolio Discipline 风控与仓位（3 个）✨

> 退出、对冲、仓位大小决策全部基于真实数据量化，而非主观判断。

| Skill | 作用 | 示例查询 |
| :--- | :--- | :--- |
| [Hedge Advisor](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-hedge-advisor) ✨ | 已有仓位的场景化对冲（Fall Knife / Bottom Fishing / Gain Protection），返回定价后的 Long Put / Collar / Tier-down 规格 | "Hedge my AAPL at cost 140, now 180" |
| [BPS Backtest](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-bps-backtest) ✨ | Bull Put Spread 走步前向回测，一次返回"有信号 vs 无信号"对照 | "Backtest BPS on QQQ — does FearScore work?" |
| [Take-Profit Lab](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-take-profit) ✨ | 任意 ticker 15 策略退出回测；用新颖的"rollercoaster rate"指标自动判断是否可长期持有或需分层止盈 | "Should I hold TQQQ long-term?" |

### 5. Investor Masters 投资大师方法论（4 个）🎓

> 把特定投资人的哲学机械化为可一键调用的工具。

| Skill | 作用 | 示例查询 |
| :--- | :--- | :--- |
| [Duan-Yongping Analysis](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-duan-analysis) | 段永平三联面板（按愿买价 Sell Put / Covered Call 收息 / VIX 阶梯式恐慌买入） | "Duan-style analysis on AAPL" |
| [Buffett Analysis](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-buffett-analysis) ✨ | 4 维评分（生意 / 护城河 / 管理层 / 估值）→ 加权得 HOLDABLE / WATCHABLE / AVOID | "Buffett analysis on KO" |
| [Marks Cycle](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-marks-cycle) ✨ | Howard Marks 周期定位 0-100：VIX + IV Rank + P/C + 估值 → 攻守姿态映射 | "Where are we in the cycle?" |
| [Tepper Signal](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-tepper-signal) ✨ | 量化 Tepper 2009/2020 恐慌买入检测：VIX≥35 + FearScore≥80 + 质量过滤 → armed / watch / near / cold | "Is this a Tepper buy signal?" |

### 6. Knowledge Base — Research Brain 投研脑（5 个）

> 构建个人化、可监控的研究工作区。Profile 自动刷新、Thesis 自动核对触发器、系统每周自检。

| Skill | 作用 | 示例查询 |
| :--- | :--- | :--- |
| [Company Profile](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-company-profile) | 自动建档：基本面、PE/PB Band、红旗、事件雷达 | "Add NVDA to my knowledge base" |
| [Investment Thesis](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-investment-thesis) | 买入理由 + 结构化卖出触发器，自动监控 | "Why did I buy AAPL?" |
| [Macro View](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-macro-view) | 跟踪 VIX / US10Y / DXY / 黄金，含组合感知的影响分析 | "Track VIX and US10Y" |
| [Theme Research](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-theme-research) | 把 ticker 归到主题（AI infra / HK dividend）+ 关键词新闻监控 | "Create an AI infra theme" |
| [Health Check](https://github.com/AlphaGBM/skills/blob/main/skills/alphagbm-health-check) | 周度体检：陈旧 profile、thesis 漂移、孤儿页 → 0-100 评分 | "Audit my research brain" |

### 关联项目

- [Investment Masters](https://github.com/AlphaGBM/investment-masters) — 12 位大师方法论（Buffett / Dalio / Soros / Marks / 梁文锋 / Raschke…）+ 13F 持仓跟踪

## 架构与数据流

```
你 / 你的 AI Agent
        │  (自然语言)
        ▼
┌────────────────────────────────────────┐
│         AlphaGBM Skills (本仓库)         │
│                                        │
│  Stock    Options   Vol    Strategy    │
│  Analysis  Score   Surface  Builder    │
│  Greeks  ...                            │
└────────────────────┬────────────────────┘
                     │
              ┌──────┴──────┐
              ▼             ▼
        Mock Data       AlphaGBM API
     (内置, 免费)    (alphagbm.zeabur.app)
                   实时市场数据
                   IV / HV / VRP / Greeks / Skew
```

### Skills 协作关系

```
Stock Analysis ──► Options Score ──► Options Strategy ──► P&L Simulator
       │                │                    │
       ▼                ▼                    ▼
   Compare          Vol Surface          Greeks
                    Vol Smile
                    IV Rank ──► Earnings Crush

Market Sentiment ──► Unusual Activity ──► Alert
                                          Watchlist

Polymarket ──► Market Sentiment ──► Options Strategy
```

Skills 不是孤立的——它们互相引用形成完整工作流。

## 与同目录其他工具的差异

| 维度 | AI-Trader | QuantDinger | Vibe-Trading | TradingAgents-CN | **AlphaGBM** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **定位** | Agent 交易社区 | 量化生产平台 | 个人交易代理 | 研报型多 Agent | **实时期权/股票研究平台** |
| **核心输出** | 信号 + 跟单 | 策略 + 回测 + 实盘 | 18+ 数据源 + 456 因子 | 深度研报 | **29 个可调用 Skills** |
| **数据来源** | Alpha Vantage + yfinance | CCXT / Alpaca / IBKR | 多源聚合 | A 股 / 港股 / 美股 | **真实期权数据（自有）** |
| **评分模型** | 无 | 因子库 | 因子库 | 多 Agent 辩论 | **G=B+M、Option Score、VRP** |
| **市场覆盖** | 美股 / 加密 / 外汇 / 期权 | 加密 / 美股 / 外汇 | 18+ 数据源 | A 股 / 港股 / 美股 | **US 200+ / HK 35+ / CN 20+ ETF / 商品** |
| **接入方式** | REST + SKILL.md | REST + Agent Gateway + MCP | REST + Agent | REST + WebSocket | **Web / CLI / Skills / REST API** |
| **典型场景** | "让 AI 代理社区跑起来" | "从策略到实盘的工厂" | "个人量化研究助手" | "分析茅台该不该买" | **"AAPL IV 贵不贵、该选哪个 Strike"** |

> **关联阅读**：
> - 想做"AI 代理社区 + 跟单" → [AI-Trader](/notes/quant/ai-trader/)
> - 想搭"自托管量化生产平台" → [QuantDinger](/notes/quant/quantdinger/)
> - 想做"个人量化研究助手" → [Vibe-Trading](/notes/quant/vibe-trading/)
> - 想做"研报型多 Agent" → [TradingAgents-CN](/notes/quant/tradingagents-cn/)
> - 本篇：**AlphaGBM** — 实时期权/股票研究 + 29 个可调用的 Skills

## 注意事项

1. **合规使用** — 本项目仅供学习研究，不构成投资建议；评分、信号、推荐仅供参考
2. **数据准确性** — 真实数据来自市场，但仍可能延迟、缺失或异常，请结合自身判断
3. **API 配额** — Free 用户每天只有 2 次股票分析 + 1 次期权分析；高频使用请升级到 Plus / Pro
4. **mock vs live** — 没有 API Key 时使用内置 mock data（仅 AAPL/NVDA/SPY/TSLA/META 五只票）；需真实数据请先 [申请 Key](https://alphagbm.com/api-keys)
5. **Skills 与 API 解耦** — Skills 是开源的（MIT），但调用真实数据需要 API Key；仅用 mock data 完全免费
6. **不在中国** — 平台定位国际市场；A 股仅 20+ ETF 覆盖，未深入个股

## 相关链接

- 网站：[alphagbm.com](https://www.alphagbm.com/)
- 文档：[alphagbm.com/docs](https://alphagbm.com/docs)
- API Keys 申请：[alphagbm.com/api-keys](https://alphagbm.com/api-keys)
- 核心仓库：[github.com/AlphaGBM/skills](https://github.com/AlphaGBM/skills)
- 投资大师：[github.com/AlphaGBM/investment-masters](https://github.com/AlphaGBM/investment-masters)
- 贡献指南：[CONTRIBUTING.md](https://github.com/AlphaGBM/skills/blob/main/CONTRIBUTING.md)
- Discord：[discord.gg/alphagbm](https://discord.gg/alphagbm)
- Twitter/X：[x.com/alphagbm](https://x.com/alphagbm)
- 知识星球：AlphaGBM 投研圈
- 协议：MIT（Skills 部分）

---

> **AlphaGBM** — *Real data. Real signals. Real edge.*
> 29 Skills · 真实期权数据 · 3 个月实盘验证 · 10,000+ 交易者
