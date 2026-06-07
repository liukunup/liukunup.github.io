# Agent 设计模式全解 — 设计文档

## Metadata

- **Date**: 2026-06-07
- **Author**: Sisyphus
- **Type**: Blog Post (Part B of B+A Series)

## Overview

面向应用开发者（B），系统化梳理当前主流 Agent 架构模式，每种模式均从概念、流程、伪代码、框架实现四个维度展开，可作为"模式词典"长期参考。

## Content Structure

### 模式清单（6个）

| 层级 | 模式 | 核心问题 |
|------|------|---------|
| **感知层** | ReAct | 如何让 Agent 在推理中调用工具？ |
| **规划层** | Plan-Execute | 如何将复杂任务拆解为子任务？ |
| **评审层** | EE（Evaluation-Agent） | 如何在执行后自动校验结果质量？ |
| **协作层** | MCP（Model-Centralized-Protocol） | 如何标准化工具/资源调用？ |
| **协作层** | Handoff | 如何在智能体之间传递控制权？ |
| **编排层** | Supervisor | 如何用树结构编排多智能体？ |

### 每种模式的讲解结构

1. **概念** — 解决的问题域、核心思想
2. **图解** — 架构图/流程图（mermaid）
3. **伪代码** — 核心数据流和控制流
4. **框架对照** — CrewAI / LangGraph / AutoGen / OpenAI Agents SDK 中的对应实现

### 目标读者

- 有一定 AI 开发经验，想基于模式知识更好地设计 Agent 系统
- 已经了解过 Agent 框架（LangGraph / CrewAI 等），想建立系统化认知

## File Path

`docs/blog/agent-design-patterns.md`

## Frontmatter

```yaml
---
title: Agent 设计模式全解：从 ReAct 到 Supervisor
createTime: 2026/06/07 00:00:00
permalink: /blog/agent-design-patterns/
tags:
  - AI Agent
  - 设计模式
  - ReAct
  - Plan-Execute
  - LangGraph
  - CrewAI
---
```

## Status

- [x] Design approved
- [ ] Implementation (writing-plans skill)
- [ ] Content written
- [ ] Committed