---
title: Oh My OpenCode
tags:
  - ai coding
  - agent
createTime: 2026/01/07 12:17:34
permalink: /ai/app/oh-my-opencode/
---

## 🔍 简介

[Oh My OpenCode](https://github.com/code-yeongyu/oh-my-opencode) 是一个功能强大的 OpenCode 代理编排插件（Agent Harness），旨在让 AI 生成的代码无限接近甚至超越人类代码。它的核心代理 **Sisyphus**（西西弗斯）是一个拥有强大执行力的编排者，能够自动分拆任务、调用专用子代理（如 Oracle, Librarian, Frontend Engineer）并利用 LSP 和 AST 工具进行精准的各种代码操作。

## 🚀 主要特性

- **Sisyphus 核心代理**：基于 Claude Opus 4.5/High，负责任务规划、分发和执行。
- **专业子代理团队**：
    - **Oracle**: 架构设计与代码审查 (GPT-5.2)
    - **Librarian**: 文档查询与代码库探索 (Claude Sonnet 4.5)
    - **Frontend Engineer**: UI/UX 设计与前端开发 (Gemini 3 Pro)
- **后台代理 (Background Agents)**：支持并发运行多个后台代理，大幅提高效率。
- **高级工具集成**：
    - **LSP 支持**：利用语言服务器进行准确的引用查找、跳转定义和重构。
    - **MCP 集成**：内置 Exa (联网搜索), Context7 (官方文档), Grep.app (GitHub 代码搜索)。
    - **AST-Grep**：基于语法树的代码搜索与替换。
- **Ultrawork 模式**：通过关键词 `ultrawork` 或 `ulw` 开启全自动、并行的极致工作模式。
- **Ralph Loop**：自我纠正的开发循环，直到任务完成。

## 💻 安装与使用

推荐使用 `bun` 进行安装：

```bash
bunx oh-my-opencode install
```

或者使用 `npx`：

```bash
npx oh-my-opencode install
```

安装后，它会引导你配置 OpenCode 环境及相关的 AI 模型订阅（Anthropic, OpenAI, Google 等）。

## 🔗 相关链接

- [GitHub 仓库](https://github.com/code-yeongyu/oh-my-opencode)
- [中文 README](https://github.com/code-yeongyu/oh-my-opencode/blob/dev/README.zh-cn.md)

