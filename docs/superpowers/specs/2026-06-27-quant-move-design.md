# 量化三篇文章迁入 /notes/Quant/ 设计

- **日期**：2026-06-27
- **目标**：将本会话刚刚完成的 3 篇量化/金融交易相关文档从 `docs/ai/2.Agent/` 移动到 `docs/notes/Quant/`，统一以 `/notes/quant/<file>/` 形式呈现，与 `docs/notes/` 下其他分类目录（AI Coding / Python / Go / 等）保持一致。
- **相关背景**：
  - 上一次任务（`docs/superpowers/specs/2026-06-27-tradingagents-deploy-design.md`）刚把这 3 个文件从 `docs/blog/` 迁到 `docs/ai/2.Agent/`，permalink 为 `/ai/agent/<file>/`。
  - 本次任务是对前次落点的二次调整：归入 `notes` 集合下的 `Quant` 子分类。

## 移动清单

| 源 | 目标 | 旧 permalink | 新 permalink |
|----|------|-------------|-------------|
| `docs/ai/2.Agent/jin-ce-zhi-suan.md` | `docs/notes/Quant/jin-ce-zhi-suan.md` | `/ai/agent/jin-ce-zhi-suan/` | `/notes/quant/jin-ce-zhi-suan/` |
| `docs/ai/2.Agent/tradingagents-cn.md` | `docs/notes/Quant/tradingagents-cn.md` | `/ai/agent/tradingagents-cn/` | `/notes/quant/tradingagents-cn/` |
| `docs/ai/2.Agent/tradingagents-deploy.md` | `docs/notes/Quant/tradingagents-deploy.md` | `/ai/agent/tradingagents-deploy/` | `/notes/quant/tradingagents-deploy/` |

## 操作清单

1. **移动文件**：使用 `git mv` 三个文件，保留 git rename 检测（预期 similarity ≈ 99%，仅 permalink 行差异）。
2. **更新 permalink**：在三个文件中将 `permalink: /ai/agent/<file>/` 改为 `permalink: /notes/quant/<file>/`。
3. **校验文件内交叉引用**：
   - `tradingagents-deploy.md` 内有 4 处引用 `tradingagents-cn.md`（line 27、454、466、492）；移动后两者仍在同一目录，使用 `./tradingagents-cn.md` 或文件名引用均可保持有效，需在移动后 grep 复核一次。
4. **补充 `docs/notes/Quant/README.md`**：当前仅占位 5 行（含 `permalink: /notes/quant/`），追加三个文章的简要列表 + 一句话定位。
5. **全仓校验**：grep 全仓确认无遗留 `/ai/agent/jin-ce-zhi-suan/`、`/ai/agent/tradingagents-cn/`、`/ai/agent/tradingagents-deploy/` 旧 permalink。

## 现有结构与配置

- `docs/notes/Quant/README.md` 已存在，仅含 frontmatter 占位。
- `docs/.vuepress/collections.ts` 中 `notesDoc` 已配置 `type: 'doc'`、`dir: 'notes'`、`linkPrefix: '/notes'`、`sidebar: 'auto'`，子目录自动接管。
- `docs/.vuepress/navbar.ts:71` 已存在 `/notes/quant/` 导航项，无需修改。
- 兄弟目录 `docs/notes/AI Coding/`、`docs/notes/Python/` 等已使用 `/notes/<category>/<file>/` permalink 模式。

## README.md 草案

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

## 验收标准

1. 三个文件落地于 `docs/notes/Quant/`，git 状态显示为 rename（similarity 99%）。
2. 三个文件的 frontmatter `permalink` 全部更新为 `/notes/quant/<file>/`。
3. `docs/notes/Quant/README.md` 含三个文章链接的列表。
4. 全仓 `grep` 无残留旧 permalink `/ai/agent/(jin-ce-zhi-suan|tradingagents-cn|tradingagents-deploy)/`。
5. `docs/ai/2.Agent/` 目录下不再含上述三个文件。
6. 不修改 `docs/.vuepress/collections.ts`、`docs/.vuepress/navbar.ts`。

## 实施范围

- 单次 git 操作：三个文件移动 + 各自 permalink 修改 + README.md 补充。
- 不修改 vuepress 配置。
- 不写测试（无代码改动）。
- 不提交到 git（按既有约定，待用户确认后自行 commit）。