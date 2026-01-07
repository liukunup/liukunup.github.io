---
title: Vibe Kanban
tags:
  - ai coding
  - agent
createTime: 2026/01/07 12:16:16
permalink: /ai/app/vibe-kanban/
---

## 🔍 简介

[Vibe Kanban](https://www.vibekanban.com/) 是一个 AI 编码代理编排工具，允许开发者并行运行多个 AI 编码代理（如 Claude Code, OpenAI Codex, GitHub Copilot 等）。它通过 Git worktrees 为每个代理提供独立的工作空间，避免冲突，并提供内置的 Diff 工具来审查代理生成的代码。

## 🚀 主要特性

- **并行执行**：同时运行多个 AI 代理处理不同的任务，无需等待。
- **独立工作区**：基于 Git worktrees，每个代理在独立分支和工作区通过，互不干扰。
- **代码审查**：内置 Diff 工具，像审查人类代码一样审查、编辑和批准代理的更改。
- **GitHub 集成**：无缝集成 GitHub，自动创建 Pull Request，处理 Rebase 和 Merge。
- **多模型支持**：支持 Claude Code, Gemini CLI, Cursor CLI, OpenAI Codex 等多种代理。
- **VS Code 扩展**：提供 VS Code 插件，直接在 IDE 中管理任务。

## 💻 安装与使用

需要 Node.js 18+ 环境。

```bash
npx vibe-kanban
```

## 🔗 相关链接

- [官方网站](https://www.vibekanban.com/)
- [GitHub 仓库](https://github.com/BloopAI/vibe-kanban)
- [文档](https://vibekanban.com/docs)

