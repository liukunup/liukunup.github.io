# TradingAgents 部署指南 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `docs/ai/2.Agent/tradingagents-deploy.md`，作为 TradingAgents 上游原版的完整部署指南，与同目录 `tradingagents-cn.md` 形成对照。

**Architecture:** 单文件 Markdown 文档，遵循 vuepress-theme-plume 的 frontmatter 规范与同目录 `hermes-agent-deploy.md` / `openclaw-deploy.md` 的章节组织风格。内容来源于上游 README（[TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents)），使用中文叙述 + 英文专有名词混排。

**Tech Stack:** Markdown、vuepress-theme-plume frontmatter、GitHub raw 资源引用。

## Global Constraints

- **目标文件**：`docs/ai/2.Agent/tradingagents-deploy.md`（来自 spec，不得更改）
- **permalink**：`/ai/agent/tradingagents-deploy/`（来自 spec）
- **章节数**：14 个章节（来自 spec 章节清单）
- **风格基线**：参考 `docs/ai/2.Agent/hermes-agent-deploy.md`、`docs/ai/2.Agent/openclaw-deploy.md`、`docs/ai/2.Agent/tradingagents-cn.md`
- **不引入 emoji**：除官方徽章与截图引用外不主动添加
- **不修改既有文件**：不改动 `tradingagents-cn.md` 末尾的原版链接
- **不修改 collection 配置**：沿用 `docs/.vuepress/collections.ts` 中 `aiDoc`（`linkPrefix: '/ai'`）
- **不写测试**：文档类内容无可执行行为

## File Structure

| 文件 | 状态 | 职责 |
|------|------|------|
| `docs/ai/2.Agent/tradingagents-deploy.md` | 新建 | 14 章节完整正文 + frontmatter |
| `docs/ai/2.Agent/tradingagents-cn.md` | 不动 | 仅在新文档中作为交叉引用对象 |
| `docs/.vuepress/collections.ts` | 不动 | `aiDoc` 现有配置已覆盖 `/ai/agent/` 前缀 |

---

### Task 1: 创建 tradingagents-deploy.md 完整正文

**Files:**
- Create: `docs/ai/2.Agent/tradingagents-deploy.md`

**Interfaces:**
- Consumes: spec `docs/superpowers/specs/2026-06-27-tradingagents-deploy-design.md` 章节清单、上游 README（已通过 webfetch 获取）
- Produces: 完整 markdown 文档，permalink `/ai/agent/tradingagents-deploy/`；与同目录 `tradingagents-cn.md`、`openclaw-deploy.md` 风格一致

**Step 1.1：写入 frontmatter + 第 1~3 章**

使用 `write` 工具创建 `docs/ai/2.Agent/tradingagents-deploy.md`，先写 frontmatter 与引言、News、核心架构三章。frontmatter 必须包含 `title`、`createTime: 2026/06/27 22:00:00`、`permalink: /ai/agent/tradingagents-deploy/`、`tags`、`description`。

内容来源（要点）：
- 引言：项目定位 + Star History 图 `https://api.star-history.dev/svg?repo=TauricResearch/TradingAgents&type=Date` + 89.1k⭐ / 17.2k Fork + Apache-2.0 + arXiv 2412.20138 + 与 `tradingagents-cn.md` 关系
- News：v0.3.0 (2026-06) → v0.2.0 (2026-02) 七个里程碑 + Trading-R1 论文预告
- 核心架构：Analyst Team / Researcher Team / Trader Agent / Risk Management / Portfolio Manager；附架构图 `https://raw.githubusercontent.com/TauricResearch/TradingAssets/main/assets/schema.png`（实际地址以仓库 `assets/schema.png` 为准）；LangGraph 实现说明

**Step 1.2：追加第 4~7 章**

使用 `edit` 工具追加章节。同一文件多次 append 时，按顺序：
- 环境要求（Python 3.12 + conda）
- 安装部署（源码 `pip install .` / Docker / Ollama profile）
- API 与模型配置（多 Provider 列表：OpenAI、Google、Anthropic、xAI、DeepSeek、Qwen DashScope 双区、GLM Z.AI / BigModel、MiniMax Global + China、OpenRouter、Ollama、Bedrock、Azure OpenAI、OpenAI-compatible；数据源 Alpha Vantage、FRED、Polymarket；env 变量清单表格）
- 市场与代码（US/HK/JP/London/India/Canada/Australia/A股/Crypto 的 ticker 写法）

**Step 1.3：追加第 8~11 章**

继续使用 `edit` 工具追加：
- CLI 使用（`tradingagents` 命令、`python -m cli.main`、官方截图 `assets/cli/cli_init.png`、`assets/cli/cli_news.png`、`assets/cli/cli_transaction.png`）
- Python 包用法（`TradingAgentsGraph`、`propagate()`、`DEFAULT_CONFIG` 字段：`llm_provider`/`deep_think_llm`/`quick_think_llm`/`max_debate_rounds`/`temperature`/`checkpoint_enabled`，附两段代码示例）
- 持久化与恢复（Decision log 默认路径 `~/.tradingagents/memory/trading_memory.md`、环境变量 `TRADINGAGENTS_MEMORY_LOG_PATH`；Checkpoint resume `--checkpoint` / `--clear-checkpoints`、SQLite 路径 `~/.tradingagents/cache/checkpoints/<TICKER>.db`、环境变量 `TRADINGAGENTS_CACHE_DIR`）
- 可复现性（LLM 采样不确定性、temperature 配置示例、推理模型行为差异）

**Step 1.4：追加第 12~14 章**

继续使用 `edit` 工具追加：
- 已知限制与免责声明（仅研究、不构成投资、回测结果不可保证，链接 Tauric 免责声明）
- 与 TradingAgents-CN 的关系（上游原版 vs 中文增强版，明确链接到同目录 `tradingagents-cn.md`）
- 结语（引用 BibTeX `xiao2025tradingagentsmultiagentsllmfinancial`、相关链接：论文 arXiv 2412.20138、Discord、X、微信公众号、Trading-R1 技术报告）

**Step 1.5：本地校验文档结构**

```bash
wc -l docs/ai/2.Agent/tradingagents-deploy.md
grep -c "^## " docs/ai/2.Agent/tradingagents-deploy.md
grep -E "permalink: /ai/agent/tradingagents-deploy/" docs/ai/2.Agent/tradingagents-deploy.md
```

期望：
- 行数 ≥ 250（经验阈值，最终行数由内容决定）
- `^## ` 计数为 14（一级章节数）
- permalink 行存在且唯一

**Step 1.6：交叉引用检查**

```bash
grep -n "tradingagents-cn" docs/ai/2.Agent/tradingagents-deploy.md
grep -n "TauricResearch/TradingAgents" docs/ai/2.Agent/tradingagents-deploy.md
```

期望：
- 第 13 章中显式包含同目录 `tradingagents-cn.md` 的相对路径链接（如 `../tradingagents-cn/` 或文件名引用，由实现决定）
- 至少一处上游仓库 URL `https://github.com/TauricResearch/TradingAgents`

**Step 1.7：暂存**

```bash
git add docs/ai/2.Agent/tradingagents-deploy.md
git status --short
```

期望输出包含 `A  docs/ai/2.Agent/tradingagents-deploy.md`。

---

## Self-Review

1. **Spec coverage**：spec 列出 14 章 + frontmatter + 验收 5 项 → Task 1 的 7 个 step 覆盖全部；验收标准 1-5 在 Step 1.5 / 1.6 / 1.7 中得到验证。
2. **Placeholder scan**：未使用 "TBD"、"TODO"、"fill in"、"similar to" 等占位。
3. **Type consistency**：文档无类型/签名概念；交叉引用一致使用 `tradingagents-cn.md`（不带路径前缀，在同目录 vuepress 链接中可使用文件名）。
4. **范围**：单一文档新增，未越界修改既有内容。

## 执行交接

Plan 已保存到 `docs/superpowers/plans/2026-06-27-tradingagents-deploy.md`。两种执行方式：

1. **Subagent-Driven (推荐)** — 每个 task 派遣独立 subagent，task 间 review
2. **Inline Execution** — 在当前会话中按 executing-plans 执行

请选择执行方式。