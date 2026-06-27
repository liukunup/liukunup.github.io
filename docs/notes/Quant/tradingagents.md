---
title: TradingAgents 部署指南：多智能体 LLM 金融交易框架
createTime: 2026/06/27 22:00:00
permalink: /notes/quant/tradingagents/
tags:
  - TradingAgents
  - AI Agent
  - 多智能体
  - LLM
  - 金融
  - 量化交易
  - LangGraph
  - Docker
description: 由 Tauric Research 出品的多智能体 LLM 金融交易框架 TradingAgents 的部署与使用详解，覆盖源码安装、Docker、CLI、Python API、多 LLM Provider 配置、持久化与可复现性说明。
---

## 引言

[TradingAgents](https://github.com/TauricResearch/TradingAgents) 是由 [Tauric Research](https://github.com/TauricResearch) 团队开源的多智能体金融交易框架。它模拟真实交易公司的多角色协作 —— 由基本面、情绪、新闻、技术四类分析师组成 Analyst Team，再由多空研究员辩论、交易员决策、风控团队审视，最后由 Portfolio Manager 拍板 —— 整个决策链由大语言模型驱动并支持反思。

截至本文撰写时，项目在 GitHub 上已获得 **89.1k Star / 17.2k Fork**，采用 **Apache-2.0** 协议开源，配套论文 *TradingAgents: Multi-Agents LLM Financial Trading Framework* 已发布于 arXiv（[2412.20138](https://arxiv.org/abs/2412.20138)）。

![Star History](https://api.star-history.dev/svg?repo=TauricResearch/TradingAgents&type=Date)

> ⚠️ **重要声明**：TradingAgents 仅用于学术研究，**不构成任何投资建议**，回测结果亦不保证可复现。详见 [Tauric 官方免责声明](https://tauric.ai/disclaimer/)。

对于中文用户以及聚焦 A 股 / 港股市场的研究者，可以参考同目录的中文增强版 [TradingAgents-CN 部署与使用指南](./tradingagents-cn.md)（仓库：[hsliuping/TradingAgents-CN](https://github.com/hsliuping/TradingAgents-CN)），它在原版基础上补齐了 A 股数据源、国产 LLM 厂商与中文 Web 管理界面。

## News / 版本演进

TradingAgents 自开源以来持续迭代，按时间倒序排列：

- **[2026-06] TradingAgents v0.3.0** 发布，引入经验证的数据访问契约、扩展的 Provider 注册表（NVIDIA、Kimi、Groq、Mistral、Bedrock 及任意 OpenAI-compatible 端点）、FRED 与 Polymarket 数据供应商、当代模型目录与 CI 闸门。详见 [CHANGELOG.md](https://github.com/TauricResearch/TradingAgents/blob/main/CHANGELOG.md)。
- **[2026-05] TradingAgents v0.2.5** 发布，新增 Grounded Sentiment Analyst、GPT-5.5 等模型覆盖、Qwen / GLM / MiniMax 双区支持、`TRADINGAGENTS_*` 环境变量配置（API Key 自动识别）、远程 Ollama、非美股 alpha 基准、ticker 路径遍历加固。
- **[2026-04] TradingAgents v0.2.4** 发布，引入结构化输出 Agent（Research Manager / Trader / Portfolio Manager）、LangGraph checkpoint 恢复、持久化决策日志、DeepSeek / Qwen / GLM / Azure Provider 支持、Docker 部署与 Windows UTF-8 编码修复。
- **[2026-03] TradingAgents v0.2.3** 发布，新增多语言支持、GPT-5.4 系列模型、统一模型目录、回测日期保真度、代理支持。
- **[2026-03] TradingAgents v0.2.2** 发布，扩展 GPT-5.4 / Gemini 3.1 / Claude 4.6 模型覆盖、五级评级量表、OpenAI Responses API、Anthropic effort 控制、跨平台稳定性。
- **[2026-02] TradingAgents v0.2.0** 发布，多 Provider LLM 支持（GPT-5.x、Gemini 3.x、Claude 4.x、Grok 4.x），系统架构全面升级。
- **[2026-01] Trading-R1 [技术报告](https://arxiv.org/abs/2509.11420)** 发布，[Terminal](https://github.com/TauricResearch/Trading-R1) 版本预计随后推出。

## 核心架构

TradingAgents 框架将复杂的交易任务拆解为多个专业角色，按照真实交易公司的组织方式协同工作：

### Analyst Team（分析师团队）

- **Fundamentals Analyst**：评估公司财务与业绩指标，识别内在价值与潜在风险。
- **Sentiment Analyst**：汇总新闻、StockTwits、Reddit 讨论的情绪信号，判断短期市场情绪。
- **News Analyst**：监控全球新闻与宏观经济指标，解读事件对市场的影响。
- **Technical Analyst**：利用 MACD、RSI 等技术指标识别交易形态并预测价格走势。

![分析师团队](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/assets/analyst.png)

### Researcher Team（研究员团队）

包含多头（Bullish）与空头（Bearish）研究员，通过结构化辩论平衡潜在收益与固有风险。

![研究员团队](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/assets/researcher.png)

### Trader Agent（交易员）

综合分析师与研究员的报告做出具体的交易决策，确定交易时机与仓位。

![交易员](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/assets/trader.png)

### Risk Management 与 Portfolio Manager

- **Risk Management**：持续评估市场波动率、流动性等风险因素，输出评估报告给 Portfolio Manager。
- **Portfolio Manager**：批准或拒绝交易提案；批准后指令下发到模拟交易所执行。

![风控与组合经理](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/assets/risk.png)

### 实现细节

整个框架使用 [LangGraph](https://github.com/langchain-ai/langgraph) 实现，借助图结构工作流保证灵活性与模块化。下图为完整框架结构：

![架构图](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/assets/schema.png)

> TradingAgents 框架面向**研究用途**。回测表现受模型、温度、时间段、数据质量等多种不可控因素影响，结果不可保证。

## 环境要求

| 组件 | 最低要求 | 推荐配置 |
|------|---------|---------|
| Python | 3.12 | 3.12 最新补丁版 |
| 包管理 | conda / venv | conda |
| Docker（可选） | 24.0+ | 最新稳定版 |
| 操作系统 | Linux / macOS / WSL2 | Ubuntu 22.04 LTS |

Python 3.12 由上游 `default_config.py` 与 conda 环境文件指定；低于 3.12 时部分依赖（如 LangGraph 新版本）可能无法正确安装。建议通过 `conda create -n tradingagents python=3.12` 创建隔离环境。

## 安装部署

### 方式一：源码安装（推荐）

**1. 克隆仓库**

```bash
git clone https://github.com/TauricResearch/TradingAgents.git
cd TradingAgents
```

**2. 创建并激活虚拟环境**

```bash
conda create -n tradingagents python=3.12
conda activate tradingagents
```

**3. 安装包及其依赖**

```bash
pip install .
```

如需 AWS Bedrock 支持：

```bash
pip install ".[bedrock]"
```

### 方式二：Docker 部署

**1. 准备环境变量**

```bash
cp .env.example .env
# 编辑 .env，至少填入一个 LLM 厂商的 API Key
```

**2. 启动**

```bash
docker compose run --rm tradingagents
```

### 方式三：Docker + Ollama profile（本地模型）

```bash
docker compose --profile ollama run --rm tradingagents-ollama
```

该 profile 会拉起本地 Ollama 服务，适合不便访问外部 API 的场景。如需指向远程 Ollama 服务，可在 `.env` 中设置：

```bash
OLLAMA_BASE_URL=http://your-ollama-host:11434/v1
```

## API 与模型配置

### 支持的 LLM Provider

TradingAgents 内置多 Provider 支持，按需启用：

| Provider | 覆盖模型 | 环境变量 | 备注 |
|----------|---------|---------|------|
| OpenAI | GPT-5.x 系列 | `OPENAI_API_KEY` | 默认 Provider |
| Google | Gemini 3.x | `GOOGLE_API_KEY` | 支持 thinking level |
| Anthropic | Claude 4.x | `ANTHROPIC_API_KEY` | 支持 effort 控制 |
| xAI | Grok 4.x | `XAI_API_KEY` | |
| DeepSeek | DeepSeek V3 / R1 | `DEEPSEEK_API_KEY` | 性价比高 |
| Qwen（国际） | Qwen3 等 | `DASHSCOPE_API_KEY` | 端点 dashscope-intl.aliyuncs.com |
| Qwen（国内） | Qwen3 等 | `DASHSCOPE_CN_API_KEY` | 端点 dashscope.aliyuncs.com |
| GLM（Z.AI 国际） | GLM-4.6 等 | `ZHIPU_API_KEY` | |
| GLM（BigModel 国内） | GLM-4.6 等 | `ZHIPU_CN_API_KEY` | 端点 open.bigmodel.cn |
| MiniMax（Global） | MiniMax-M2.7 等 | `MINIMAX_API_KEY` | 端点 api.minimax.io |
| MiniMax（中国） | MiniMax-M2.7 等 | `MINIMAX_CN_API_KEY` | 端点 api.minimaxi.com |
| OpenRouter | 多模型路由 | `OPENROUTER_API_KEY` | |
| Mistral | Mistral Large 等 | `MISTRAL_API_KEY` | |
| Moonshot | Kimi | `MOONSHOT_API_KEY` | |
| Groq | Llama 3 等 | `GROQ_API_KEY` | 低延迟推理 |
| NVIDIA | Nemotron 等 | `NVIDIA_API_KEY` | |
| Ollama | 本地模型 | `OLLAMA_BASE_URL`（可选） | 默认 `http://localhost:11434/v1` |
| AWS Bedrock | Claude / Llama 等 | AWS 凭证链 + `AWS_DEFAULT_REGION` | 需 `pip install ".[bedrock]"` |
| Azure OpenAI | GPT 系列 | `.env.enterprise` | 复制 `.env.enterprise.example` |
| OpenAI-compatible | vLLM / LM Studio / llama.cpp 等 | `OPENAI_COMPATIBLE_API_KEY`（可选） | `llm_provider: "openai_compatible"` |

### 数据源（Data Vendors）

`DEFAULT_CONFIG["data_vendors"]` 决定每个数据类别的 Vendor 选择：

| 数据源 | 类别 | 环境变量 | 备注 |
|--------|------|---------|------|
| yfinance | core_stock_apis / technical_indicators / fundamental_data / news_data | 无需 Key | 内置回退 |
| Alpha Vantage | 同上 | `ALPHA_VANTAGE_API_KEY` | 免费层可用 |
| FRED | macro_data | `FRED_API_KEY` | 免费：[申请地址](https://fred.stlouisfed.org/docs/api/api_key.html) |
| Polymarket | prediction_markets | 无需 Key | keyless |

默认配置示例：

```python
"data_vendors": {
    "core_stock_apis":     "yfinance",      # alpha_vantage | yfinance
    "technical_indicators":"yfinance",
    "fundamental_data":    "yfinance",
    "news_data":           "yfinance",
    "macro_data":          "fred",          # 需 FRED_API_KEY
    "prediction_markets":  "polymarket",    # keyless
},
```

可通过 `tool_vendors` 字段按工具粒度覆盖，例如 `{"get_stock_data": "alpha_vantage"}`。同一类别支持逗号分隔的有序回退链（如 `"yfinance,alpha_vantage"`），框架**不会**静默路由到未在链中声明的 Vendor。

### 完整环境变量清单

| 类别 | 变量 | 说明 |
|------|------|------|
| LLM | `OPENAI_API_KEY` | OpenAI |
| LLM | `GOOGLE_API_KEY` | Google Gemini |
| LLM | `ANTHROPIC_API_KEY` | Anthropic Claude |
| LLM | `XAI_API_KEY` | xAI Grok |
| LLM | `DEEPSEEK_API_KEY` | DeepSeek |
| LLM | `DASHSCOPE_API_KEY` | Qwen 国际（dashscope-intl） |
| LLM | `DASHSCOPE_CN_API_KEY` | Qwen 国内（dashscope） |
| LLM | `ZHIPU_API_KEY` | GLM Z.AI 国际 |
| LLM | `ZHIPU_CN_API_KEY` | GLM BigModel 国内 |
| LLM | `MINIMAX_API_KEY` | MiniMax Global |
| LLM | `MINIMAX_CN_API_KEY` | MiniMax 中国 |
| LLM | `OPENROUTER_API_KEY` | OpenRouter |
| LLM | `MISTRAL_API_KEY` | Mistral |
| LLM | `MOONSHOT_API_KEY` | Moonshot Kimi |
| LLM | `GROQ_API_KEY` | Groq |
| LLM | `NVIDIA_API_KEY` | NVIDIA NIM |
| LLM | `OPENAI_COMPATIBLE_API_KEY` | OpenAI-compatible（可选） |
| 数据 | `ALPHA_VANTAGE_API_KEY` | Alpha Vantage |
| 数据 | `FRED_API_KEY` | FRED 宏观经济 |
| Bedrock | `AWS_DEFAULT_REGION` / `AWS_PROFILE` | AWS 凭证链 + 区域 |
| Ollama | `OLLAMA_BASE_URL` | 远程 Ollama 端点 |
| 配置覆盖 | `TRADINGAGENTS_LLM_PROVIDER` | 覆盖 `llm_provider` |
| 配置覆盖 | `TRADINGAGENTS_DEEP_THINK_LLM` | 覆盖 `deep_think_llm` |
| 配置覆盖 | `TRADINGAGENTS_QUICK_THINK_LLM` | 覆盖 `quick_think_llm` |
| 配置覆盖 | `TRADINGAGENTS_LLM_BACKEND_URL` | 覆盖 `backend_url` |
| 配置覆盖 | `TRADINGAGENTS_OUTPUT_LANGUAGE` | 覆盖 `output_language` |
| 配置覆盖 | `TRADINGAGENTS_MAX_DEBATE_ROUNDS` | 覆盖 `max_debate_rounds`（int） |
| 配置覆盖 | `TRADINGAGENTS_MAX_RISK_ROUNDS` | 覆盖 `max_risk_discuss_rounds`（int） |
| 配置覆盖 | `TRADINGAGENTS_CHECKPOINT_ENABLED` | 覆盖 `checkpoint_enabled`（bool） |
| 配置覆盖 | `TRADINGAGENTS_BENCHMARK_TICKER` | 覆盖 `benchmark_ticker` |
| 配置覆盖 | `TRADINGAGENTS_TEMPERATURE` | 覆盖 `temperature`（float） |
| 配置覆盖 | `TRADINGAGENTS_OPENAI_REASONING_EFFORT` | OpenAI 推理 effort |
| 配置覆盖 | `TRADINGAGENTS_GOOGLE_THINKING_LEVEL` | Google 思考等级 |
| 配置覆盖 | `TRADINGAGENTS_ANTHROPIC_EFFORT` | Anthropic effort |
| 路径 | `TRADINGAGENTS_RESULTS_DIR` | 覆盖 `results_dir` |
| 路径 | `TRADINGAGENTS_CACHE_DIR` | 覆盖 `data_cache_dir` |
| 路径 | `TRADINGAGENTS_MEMORY_LOG_PATH` | 覆盖 `memory_log_path` |

> 环境变量类型由 `DEFAULT_CONFIG` 中相应字段的类型自动转换（bool / int / float / str），例如 `TRADINGAGENTS_CHECKPOINT_ENABLED=true` 会转成 `True`；非法值会在启动时抛 `ValueError` 提醒。CLI 在设置 LLM provider / models / backend URL / language 时也会跳过对应交互选择（便于无人工值守与 OpenAI-compatible 端点的批量运行）。

## 市场与代码

TradingAgents 通过 Yahoo Finance 覆盖任意市场，**使用带交易所后缀的 ticker**。公司标识与 alpha 基准会根据后缀自动解析。

| 市场 | 后缀 | 样例 ticker |
|------|------|------------|
| 美股 | （无后缀） | `AAPL`、`SPY`、`NVDA` |
| 香港 | `.HK` | `0700.HK` |
| 东京 | `.T` | `7203.T` |
| 伦敦 | `.L` | `AZN.L` |
| 印度 NSE | `.NS` | `RELIANCE.NS` |
| 印度 BSE | `.BO` | `RELIANCE.BO` |
| 加拿大 | `.TO` | `SHOP.TO` |
| 澳大利亚 | `.AX` | `BHP.AX` |
| A 股（沪） | `.SS` | `600519.SS`（贵州茅台） |
| A 股（深） | `.SZ` | `000001.SZ`（平安银行） |
| 加密货币 | `-USD` | `BTC-USD`、`ETH-USD` |

对应的 alpha 基准默认在 `DEFAULT_CONFIG["benchmark_map"]` 中预设：

```python
"benchmark_map": {
    ".NS":  "^NSEI",       # NSE Nifty 50
    ".BO":  "^BSESN",      # BSE Sensex
    ".T":   "^N225",       # Nikkei 225
    ".HK":  "^HSI",        # Hang Seng
    ".L":   "^FTSE",       # FTSE 100
    ".TO":  "^GSPTSE",     # TSX Composite
    ".AX":  "^AXJO",       # ASX 200
    ".SS":  "000001.SS",   # SSE Composite
    ".SZ":  "399001.SZ",   # SZSE Component
    "":     "SPY",         # 美股默认
}
```

如需为全部 ticker 强制使用同一基准，可通过 `TRADINGAGENTS_BENCHMARK_TICKER` 覆盖。

## CLI 使用

### 启动交互式 CLI

```bash
tradingagents              # 已安装命令
python -m cli.main         # 直接从源码运行
```

CLI 启动后会引导你依次选择 ticker、分析日期、LLM Provider、研究深度等参数。

![CLI 初始化](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/assets/cli/cli_init.png)

分析过程中，界面会实时显示各 Agent 的进度：

![CLI 新闻分析](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/assets/cli/cli_news.png)

最终的交易决策由 Portfolio Manager 输出：

![CLI 交易输出](https://raw.githubusercontent.com/TauricResearch/TradingAgents/main/assets/cli/cli_transaction.png)

## Python 包用法

### 最小示例

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

ta = TradingAgentsGraph(debug=True, config=DEFAULT_CONFIG.copy())

# 前向传播一次决策
_, decision = ta.propagate("NVDA", "2026-01-15")
print(decision)
```

### 自定义配置

可在 `DEFAULT_CONFIG.copy()` 基础上覆盖任何字段：

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

config = DEFAULT_CONFIG.copy()
config["llm_provider"]       = "openai"        # openai / google / anthropic / deepseek / groq / ollama / openai_compatible ...
config["deep_think_llm"]     = "gpt-5.5"       # 复杂推理模型
config["quick_think_llm"]    = "gpt-5.4-mini"  # 快速任务模型
config["max_debate_rounds"]  = 2               # 多空辩论轮数
config["temperature"]        = 0.0             # 降低采样随机性
config["checkpoint_enabled"] = True            # 启用断点恢复

ta = TradingAgentsGraph(debug=True, config=config)
_, decision = ta.propagate("NVDA", "2026-01-15")
print(decision)
```

### `DEFAULT_CONFIG` 关键字段

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `llm_provider` | str | `"openai"` | 当前使用的 LLM Provider 标识 |
| `deep_think_llm` | str | `"gpt-5.5"` | 复杂推理使用的模型 |
| `quick_think_llm` | str | `"gpt-5.4-mini"` | 快速任务使用的模型 |
| `backend_url` | str \| None | `None` | 自定义 OpenAI-compatible 端点 |
| `max_debate_rounds` | int | `1` | 多空研究员辩论轮数 |
| `max_risk_discuss_rounds` | int | `1` | 风控团队讨论轮数 |
| `temperature` | float \| None | `None` | 采样温度，越低越稳定 |
| `checkpoint_enabled` | bool | `False` | 是否启用 LangGraph checkpoint |
| `output_language` | str | `"English"` | 分析师报告与最终决策的输出语言 |
| `memory_log_path` | str | `~/.tradingagents/memory/trading_memory.md` | 决策日志路径 |

完整字段说明见 [`tradingagents/default_config.py`](https://github.com/TauricResearch/TradingAgents/blob/main/tradingagents/default_config.py)。

## 持久化与恢复

TradingAgents 跨运行持久化两类状态。

### 决策日志（Decision log）

决策日志默认**始终启用**。每次完成分析后，结果会追加到 `~/.tradingagents/memory/trading_memory.md`。在下次对同一 ticker 分析时，框架会：

1. 获取该 ticker 的实际收益（绝对值与相对 SPY 或区域基准的 alpha）；
2. 生成一段反思；
3. 将最近的同 ticker 决策与跨 ticker 经验注入 Portfolio Manager 的 prompt。

这意味着每次分析都会"继承"历史经验——做对的被复用，做错的被规避。可通过环境变量覆盖路径：

```bash
export TRADINGAGENTS_MEMORY_LOG_PATH=/path/to/custom_memory.md
```

### Checkpoint 恢复

Checkpoint 通过 `--checkpoint` 显式启用。启用后 LangGraph 会在每个节点完成后保存状态，崩溃或中断的运行可以从最近一次成功的步骤恢复（而非从头开始）。日志中会显示：

- 恢复运行：`Resuming from step N for <TICKER> on <date>`
- 新运行：`Starting fresh`

成功完成后 checkpoint 会自动清理。按 ticker 分文件的 SQLite 数据库位于：

```
~/.tradingagents/cache/checkpoints/<TICKER>.db
```

可通过 `TRADINGAGENTS_CACHE_DIR` 覆盖基础目录；`--clear-checkpoints` 会在运行前清空所有 checkpoint。

**CLI 用法：**

```bash
tradingagents analyze --checkpoint           # 本次运行启用
tradingagents analyze --clear-checkpoints    # 运行前重置
```

**Python 用法：**

```python
config = DEFAULT_CONFIG.copy()
config["checkpoint_enabled"] = True
ta = TradingAgentsGraph(config=config)
_, decision = ta.propagate("NVDA", "2026-01-15")
```

## 可复现性

TradingAgents 由 LLM 驱动，**同一 ticker + 日期的两次运行可能产生不同结果**。这在基于语言模型的研究工具中是正常现象，而非缺陷。差异主要来自以下几个方面。

### 模型采样的非确定性

即便设置固定的 `temperature`，各 Provider 也不保证不同次调用之间的输出完全一致。**推理模型**（默认的 GPT-5.x 系列以及任何开启 thinking-mode 的模型）差异最大，因为其内部推理过程本身也是采样出来的。

### 实时数据在变化

新闻、StockTwits、Reddit 在不同时刻返回不同内容，因此即便对同一历史交易日，"今天跑"与"上周跑"看到的输入是不同的。固定 `analysis_date` 可以锁定价格与指标窗口，但社交与新闻源仍然反映"现在"。

### 降低差异的方法

**降低采样温度**。在配置中设置 `temperature`（或在 `.env` 中设置 `TRADINGAGENTS_TEMPERATURE`）：

```python
config = DEFAULT_CONFIG.copy()
config["llm_provider"] = "openai"
config["temperature"] = 0.0
# 推理模型会忽略 temperature。如需更严格的复现性，请显式设置非推理模型
# （例如通过 CLI 的 "Custom model ID" 选项）。
```

当前策划的模型以推理优先，大多不响应 `temperature`；因此如需更严格的复现性，请使用**非推理模型**，可通过 CLI 的 "Custom model ID" 选项显式指定。

### 已经稳定的部分

- 公司身份：从 ticker 解析的"分析哪家公司"已确定性绑定，**早先"不同次运行分析到不同公司"的报告已修复**。
- 价格与指标：Market Analyst 已经在经验证的数据快照中固化，**早先"不同次运行价格不一致"的报告已修复**。

### 回测结果说明

**回测结果不保证与任何已发布数字一致**。收益受模型、温度、日期范围、数据质量与上述采样机制影响。请将本框架视为研究多智能体分析过程的脚手架，而不是具有固定可复现收益的策略。

## 已知限制与免责声明

- TradingAgents 框架**仅用于研究**，不构成任何投资建议。
- 回测表现受模型、温度、时间段、数据质量等多种因素影响，**结果不可保证**。
- 框架本身**不发送实盘交易指令**，仅在模拟交易所中执行决策。
- 完整免责声明请参阅 [Tauric 官方声明](https://tauric.ai/disclaimer/)。

## 与 TradingAgents-CN 的关系

[TradingAgents](https://github.com/TauricResearch/TradingAgents) 是上游原版项目，由 [Tauric Research](https://github.com/TauricResearch) 团队维护。本文介绍的是该原版的部署与使用方式。

本仓库同目录的 [TradingAgents-CN 部署与使用指南](./tradingagents-cn.md) 介绍的是中文增强版 [hsliuping/TradingAgents-CN](https://github.com/hsliuping/TradingAgents-CN)，它在原版基础上做了大量本地化与增强：

| 维度 | TradingAgents（原版） | TradingAgents-CN（中文增强版） |
|------|---------------------|------------------------------|
| A 股 / 港股数据 | Yahoo Finance（`.SS` / `.SZ` / `.HK`） | Tushare、AKShare、BaoStock 等国内数据源 |
| LLM 厂商 | 多家国际 + 国产双区 | 阿里百炼、DeepSeek、智谱、硅基流动等深度适配 |
| 界面 | CLI / Python API | CLI + Web 管理界面（Vue 3 + FastAPI） |
| 用户管理 | 无 | 完整认证 + 角色 + 操作日志 |
| 报告输出 | Markdown | Markdown / Word / PDF 多格式 |
| Docker | 基础支持 | 多架构（amd64 / arm64），Apple Silicon 开箱即用 |
| 持久化 | 决策日志 + Checkpoint | 上述 + 自选股、批量分析、模拟交易 |

如果你是中文用户，或者主要研究 A 股 / 港股，建议优先阅读 [TradingAgents-CN 部署与使用指南](./tradingagents-cn.md)。

## 结语

TradingAgents 用 LangGraph 把"研究公司 → 多空辩论 → 交易决策 → 风控审视 → Portfolio Manager 拍板"完整跑通，是研究多智能体 LLM 在金融场景下协同行为的优秀脚手架。它不是交易系统，而是一个**研究多智能体决策过程的实验台**。

如果本项目对你的研究有帮助，请引用：

```bibtex
@misc{xiao2025tradingagentsmultiagentsllmfinancial,
      title={TradingAgents: Multi-Agents LLM Financial Trading Framework},
      author={Yijia Xiao and Edward Sun and Di Luo and Wei Wang},
      year={2025},
      eprint={2412.20138},
      archivePrefix={arXiv},
      primaryClass={q-fin.TR},
      url={https://arxiv.org/abs/2412.20138},
}
```

---

**相关链接**：

- 上游仓库：[TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents)
- 论文：[arXiv:2412.20138](https://arxiv.org/abs/2412.20138)
- 中文增强版：[TradingAgents-CN 部署与使用指南](./tradingagents-cn.md) · 仓库 [hsliuping/TradingAgents-CN](https://github.com/hsliuping/TradingAgents-CN)
- Discord：[TradingResearch](https://discord.com/invite/hk9PGKShPK)
- X (Twitter)：[@TauricResearch](https://x.com/TauricResearch)
- 微信公众号：搜索 `TauricResearch`
- Trading-R1 技术报告：[arXiv:2509.11420](https://arxiv.org/abs/2509.11420) · [Terminal 仓库](https://github.com/TauricResearch/Trading-R1)
