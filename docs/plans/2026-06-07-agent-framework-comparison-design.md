# Agent 框架深度对比 — 设计文档

## Metadata

- **Date**: 2026-06-07
- **Author**: Sisyphus
- **Type**: Blog Post (Part A of B+A Series)
- **Related**: B 篇 `docs/blog/agent-design-patterns.md`

## Overview

作为 B 篇（模式理论）的实践延伸，一文看尽 LangGraph / CrewAI / AutoGen / OpenAI Agents SDK 四框架的深度差异，可直接用于技术选型。

## Content Structure

### Part 1：模式实现深度对比

6 种模式 → 4 框架对照表：

| 模式 | LangGraph | CrewAI | AutoGen | OpenAI Agents SDK |
|------|-----------|--------|---------|-------------------|
| ReAct | | | | |
| Plan-Execute | | | | |
| EE | | | | |
| MCP | | | | |
| Handoff | | | | |
| Supervisor | | | | |

每框架简短点评（100-150 字）。

### Part 2：架构哲学差异

每框架核心抽象 + 设计哲学 + 适用边界（100-150 字/框架）。

### Part 3：实战场景选型

4 个场景 × 4 框架矩阵：

| 场景 | 推荐框架 | 备选 | 不推荐 |
|------|---------|------|--------|
| 客服 | | | |
| 代码生成/调试 | | | |
| 数据分析 | | | |
| 内容创作 | | | |

### Part 4：深度功能对比

| 功能 | LangGraph | CrewAI | AutoGen | OpenAI Agents SDK |
|------|-----------|--------|---------|-------------------|
| 上下文管理 | | | | |
| 工具注册 | | | | |
| 多 Agent 协作 | | | | |
| 容错/重试 | | | | |
| 持久化/状态 | | | | |
| 监控/可观测性 | | | | |

## File Path

`docs/blog/agent-framework-comparison.md`

## Frontmatter

```yaml
---
title: Agent 框架深度对比：LangGraph vs CrewAI vs AutoGen vs OpenAI Agents SDK
createTime: 2026/06/07 00:00:00
permalink: /blog/agent-framework-comparison/
tags:
  - AI Agent
  - LangGraph
  - CrewAI
  - AutoGen
  - OpenAI Agents SDK
  -框架对比
---
```

## Status

- [x] Design approved
- [ ] Content written
- [ ] Committed
- [ ] Pushed