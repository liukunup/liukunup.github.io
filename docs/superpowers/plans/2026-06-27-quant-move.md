# Quant 文章迁入 /notes/Quant/ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `docs/ai/2.Agent/` 下的 3 篇量化/金融交易文档迁入 `docs/notes/Quant/`，并更新 `permalink` 与 `README.md`。

**Architecture:** 单 git 操作完成三文件 rename + permalink 更新；附加 `docs/notes/Quant/README.md` 内容填充。沿用 vuepress-theme-plume `notesDoc` collection（`dir: 'notes'`、`linkPrefix: '/notes'`）的子目录自动接管机制，不修改 `collections.ts` / `navbar.ts`。

**Tech Stack:** Git rename detection、Markdown frontmatter、vuepress-theme-plume。

## Global Constraints

- **目标目录**：`docs/notes/Quant/`（来自 spec，不得更改）
- **目标 permalink 前缀**：`/notes/quant/`（来自 spec）
- **移动文件数**：3（来自 spec 移动清单）
- **不修改**：`docs/.vuepress/collections.ts`、`docs/.vuepress/navbar.ts`、`docs/notes/Quant/README.md` 的 frontmatter
- **风格基线**：`docs/notes/AI Coding/best-practices.md`、`docs/notes/Python/` 等兄弟目录的文件
- **不写测试**：文档类内容无可执行行为

## File Structure

| 文件 | 状态 | 职责 |
|------|------|------|
| `docs/ai/2.Agent/jin-ce-zhi-suan.md` | 删除 | 由 rename 取代 |
| `docs/ai/2.Agent/tradingagents-cn.md` | 删除 | 由 rename 取代 |
| `docs/ai/2.Agent/tradingagents-deploy.md` | 删除 | 由 rename 取代 |
| `docs/notes/Quant/jin-ce-zhi-suan.md` | 新增（rename） | 同上文件，新路径 |
| `docs/notes/Quant/tradingagents-cn.md` | 新增（rename） | 同上文件，新路径 |
| `docs/notes/Quant/tradingagents-deploy.md` | 新增（rename） | 同上文件，新路径 |
| `docs/notes/Quant/README.md` | 修改 | 追加三个文章列表 |

---

### Task 1: 移动三个文件 + 更新 permalink + 补充 README

**Files:**
- Move: `docs/ai/2.Agent/jin-ce-zhi-suan.md` → `docs/notes/Quant/jin-ce-zhi-suan.md`
- Move: `docs/ai/2.Agent/tradingagents-cn.md` → `docs/notes/Quant/tradingagents-cn.md`
- Move: `docs/ai/2.Agent/tradingagents-deploy.md` → `docs/notes/Quant/tradingagents-deploy.md`
- Modify: `docs/notes/Quant/jin-ce-zhi-suan.md`（permalink 行）
- Modify: `docs/notes/Quant/tradingagents-cn.md`（permalink 行）
- Modify: `docs/notes/Quant/tradingagents-deploy.md`（permalink 行）
- Modify: `docs/notes/Quant/README.md`（追加文章列表正文）

**Interfaces:**
- Consumes: spec `docs/superpowers/specs/2026-06-27-quant-move-design.md` 的移动清单与 README 草案
- Produces: 三文件落地于 `docs/notes/Quant/` 且 permalink 为 `/notes/quant/<file>/`；README.md 含三个文章链接

**Step 1.1：git mv 移动三个文件**

执行（按顺序）：
```bash
git mv docs/ai/2.Agent/jin-ce-zhi-suan.md docs/notes/Quant/jin-ce-zhi-suan.md
git mv docs/ai/2.Agent/tradingagents-cn.md docs/notes/Quant/tradingagents-cn.md
git mv docs/ai/2.Agent/tradingagents-deploy.md docs/notes/Quant/tradingagents-deploy.md
```

期望：`git status` 显示三行 `R`（rename），similarity ≈ 99%。

**Step 1.2：更新 jin-ce-zhi-suan.md 的 permalink**

```bash
# 用 edit 工具替换 frontmatter 第一行 permalink
oldString: permalink: /ai/agent/jin-ce-zhi-suan/
newString: permalink: /notes/quant/jin-ce-zhi-suan/
```

文件：`docs/notes/Quant/jin-ce-zhi-suan.md`

**Step 1.3：更新 tradingagents-cn.md 的 permalink**

```bash
oldString: permalink: /ai/agent/tradingagents-cn/
newString: permalink: /notes/quant/tradingagents-cn/
```

文件：`docs/notes/Quant/tradingagents-cn.md`

**Step 1.4：更新 tradingagents-deploy.md 的 permalink**

```bash
oldString: permalink: /ai/agent/tradingagents-deploy/
newString: permalink: /notes/quant/tradingagents-deploy/
```

文件：`docs/notes/Quant/tradingagents-deploy.md`

**Step 1.5：补全 docs/notes/Quant/README.md**

使用 `edit` 工具，将 README.md 内容替换为：

```markdown
---
title: Quant
createTime: 2026/06/27 00:00:00
permalink: /notes/quant/
---

## 量化与多智能体交易

- **[金策智算 · 智能投研决策系统](/notes/quant/jin-ce-zhi-suan/)**：基于"三省六部"思想构建的量化投研决策系统，将策略生成、风控审核、执行清算分层解耦，专注于用客观数据辅助投资决策。
- **[TradingAgents-CN 中文增强版部署指南](/notes/quant/tradingagents-cn/)**：基于多智能体 LLM 的中文金融交易框架 TradingAgents-CN 的部署与使用详解，针对中文用户和 A 股/港股/美股市场做了大量本地化与增强工作。
- **[TradingAgents 部署指南](/notes/quant/tradingagents-deploy/)**：TradingAgents 上游原版（Tauric Research 出品）的部署与使用详解，覆盖源码安装、Docker、CLI、Python API、多 LLM Provider 配置、持久化与可复现性说明。
```

oldString（README.md 现有内容，前 5 行）:
```markdown
---
title: Quant
createTime: 2026/06/27 00:00:00
permalink: /notes/quant/
---

```

**Step 1.6：本地校验**

```bash
# 1) 旧 permalink 全仓清零
grep -rn "/ai/agent/jin-ce-zhi-suan/\|/ai/agent/tradingagents-cn/\|/ai/agent/tradingagents-deploy/" docs/ || echo "OK: no stale permalinks"

# 2) 新 permalink 三处出现
grep -n "permalink: /notes/quant/" docs/notes/Quant/*.md

# 3) docs/ai/2.Agent/ 目录不再含这三个文件
ls docs/ai/2.Agent/ | grep -E "(jin-ce-zhi-suan|tradingagents-cn|tradingagents-deploy)" && echo "FAIL: files still present" || echo "OK: files moved"

# 4) README 含三篇文章链接
grep -c "/notes/quant/" docs/notes/Quant/README.md
```

期望：
- (1) 仅输出 `OK: no stale permalinks`
- (2) 输出 4 行（README + 三个文件）
- (3) 仅输出 `OK: files moved`
- (4) ≥ 4（README 含自身 permalink + 三个文章链接）

**Step 1.7：暂存**

```bash
git add -A
git status --short
```

期望输出（rename + 1 modified README）：
```
R  docs/ai/2.Agent/jin-ce-zhi-suan.md -> docs/notes/Quant/jin-ce-zhi-suan.md
R  docs/ai/2.Agent/tradingagents-cn.md -> docs/notes/Quant/tradingagents-cn.md
R  docs/ai/2.Agent/tradingagents-deploy.md -> docs/notes/Quant/tradingagents-deploy.md
M  docs/notes/Quant/README.md
```

---

## Self-Review

1. **Spec coverage**：spec 列出 6 项验收标准 + 移动清单 + README 草案 → Task 1 的 7 个 step 覆盖全部。
2. **Placeholder scan**：未使用 "TBD"、"TODO"、"fill in"、"similar to" 等占位。
3. **Type consistency**：文档无类型/签名概念；permalink 命名一致 `/notes/quant/<file>/`；README 链接路径与 permalink 完全一致。
4. **范围**：单文件集合移动 + 1 个 README 修改，未越界修改既有内容（vuepress 配置不动）。

## 执行交接

Plan 已保存到 `docs/superpowers/plans/2026-06-27-quant-move.md`。两种执行方式：

1. **Subagent-Driven (推荐)** — 每个 task 派遣独立 subagent，task 间 review
2. **Inline Execution** — 在当前会话中按 executing-plans 执行

请选择执行方式。