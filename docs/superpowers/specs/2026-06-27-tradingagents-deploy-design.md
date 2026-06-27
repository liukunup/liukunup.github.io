# TradingAgents 部署指南文档设计

- **日期**：2026-06-27
- **目标文件**：`docs/ai/2.Agent/tradingagents-deploy.md`
- **permalink**：`/ai/agent/tradingagents-deploy/`
- **资料来源**：https://github.com/TauricResearch/TradingAgents 上游仓库 README

## 背景

`docs/ai/2.Agent/` 目录下已有 `tradingagents-cn.md`（中文增强版 `hsliuping/TradingAgents-CN` 部署指南）。该文章多次引用上游原版 [TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents)，但本仓库目前没有专门的原版部署文档。新增本文件以补齐这一缺口，使 `/ai/agent/` 形成"原版 ↔ 中文增强版"的对照体系。

## 文档大纲

### Frontmatter

```yaml
---
title: TradingAgents 部署指南：多智能体 LLM 金融交易框架
createTime: 2026/06/27 22:00:00
permalink: /ai/agent/tradingagents-deploy/
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
```

### 章节

1. **引言**：项目定位（Tauric Research 出品、多智能体 LLM 金融交易框架、89.1k⭐ / 17.2k Fork、Apache-2.0、arXiv 2412.20138）；Star History 官方 SVG；与 `tradingagents-cn.md`（同目录中文增强版）的关系。
2. **News / 版本演进**：从 v0.3.0 (2026-06) 回溯到 v0.2.0 的关键里程碑；Trading-R1 技术报告预告。
3. **核心架构**：Analyst Team → Researcher Team → Trader Agent → Risk Management → Portfolio Manager；附架构图官方 PNG 链接与 LangGraph 实现说明。
4. **环境要求**：Python 3.12 + conda；可选 Docker。
5. **安装部署**：
   - 源码 `pip install .`
   - Docker `docker compose run --rm tradingagents`
   - Ollama profile `docker compose --profile ollama run --rm tradingagents-ollama`
6. **API 与模型配置**：多 LLM Provider（OpenAI、Google、Anthropic、xAI、DeepSeek、Qwen DashScope 双区、GLM Z.AI / BigModel、MiniMax Global + China、OpenRouter、Ollama、Bedrock、Azure OpenAI、OpenAI-compatible）；数据源 Alpha Vantage、FRED、Polymarket；env 变量清单。
7. **市场与代码**：US / HK / Tokyo / London / India / Canada / Australia / A 股 / Crypto 的 ticker 写法。
8. **CLI 使用**：`tradingagents` 交互式 CLI；附 `cli_init.png`、`cli_news.png`、`cli_transaction.png` 官方截图。
9. **Python 包用法**：`TradingAgentsGraph` 初始化、`propagate()`、自定义 `DEFAULT_CONFIG`（`llm_provider`、`deep_think_llm`、`quick_think_llm`、`max_debate_rounds` 等）。
10. **持久化与恢复**：Decision log（`~/.tradingagents/memory/trading_memory.md`，`TRADINGAGENTS_MEMORY_LOG_PATH` 可覆盖）；Checkpoint resume（`--checkpoint` / `--clear-checkpoints`，LangGraph SQLite）。
11. **可复现性**：LLM 采样不确定性、temperature 配置、推理模型行为差异。
12. **已知限制与免责声明**：仅用于研究、不构成投资建议、回测结果不可保证。
13. **与 TradingAgents-CN 的关系**：上游原版 vs 中文增强版，链接同目录 `tradingagents-cn.md`。
14. **结语**：引用 BibTeX、相关链接（论文、Discord、X、微信公众号、Trading-R1）。

### 风格约定

- 参考 `docs/ai/2.Agent/hermes-agent-deploy.md` / `openclaw-deploy.md` / `tradingagents-cn.md` 的章节组织、表格与引用块风格。
- frontmatter 的 `tags`、`description` 与 `createTime` 沿用同目录现有文件格式。
- 中文叙述为主，专有名词 / 命令 / 路径保留英文原样。
- 官方 star-history 图使用 `https://api.star-history.dev/svg?repo=TauricResearch/TradingAgents&type=Date`。
- 官方架构图与 CLI 截图直接引用 GitHub raw URL。

## 与既有内容的关系

- 新增文档与同目录 `tradingagents-cn.md` 形成互补；不修改既有文件。
- `tradingagents-cn.md` 末尾"原版"链接（[TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents)）保持原样，本文件负责承接。
- 不修改 `docs/.vuepress/collections.ts`，沿用现有 `aiDoc` collection（`dir: 'ai'`，`linkPrefix: '/ai'`），permalink 前缀自动匹配 `/ai/agent/`。

## 验收标准

1. 文件落地于 `docs/ai/2.Agent/tradingagents-deploy.md`，git 状态显示为新增。
2. frontmatter `permalink` 为 `/ai/agent/tradingagents-deploy/`，与同目录 `openclaw-deploy.md` 风格一致。
3. 14 个章节齐备，技术细节（API Provider 列表、Docker 命令、Python 用法代码、持久化路径）准确，与上游 README 保持一致。
4. 与 `tradingagents-cn.md` 之间通过显式链接互引。
5. 不引入 emoji（除官方徽章 / 截图说明中的引用外）；不使用未经验证的图片 URL。

## 实施范围

- 单文件新增，零代码改动。
- 不修改 collection 配置，不修改既有文章。
- 不构建、不运行；不写测试（文档类内容，无可执行行为可测）。
- 不提交到 git（按既有约定，待用户确认后自行 commit）。

## 后续可选

- 如需批量补齐 `/ai/agent/` 主题，可基于本模板复制改写。
- 若 `tradingagents-cn.md` 末尾"原版"链接希望改为指向本文件而非 GitHub，可在本次或后续单独处理（本次不做）。