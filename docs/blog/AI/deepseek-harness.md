---
title: DeepSeek Harness
tags:
  - DeepSeek
  - AI Agent
  - Agent Harness
createTime: 2026/08/15 00:31:00
permalink: /blog/deepseek-harness/
---

## 概述

DeepSeek Harness（`dsh`）是由 [DeepSeek AI](https://deepseek.com) 开源的 Agent 测试框架。

它采用 **"一切皆插件"** 的架构设计，基于 [Cordis](https://github.com/cordiverse/cordis) 提供支持，相关设计理念参见论文 [_A Programming Paradigm for Spatiotemporal Composability_](https://github.com/cordiverse/paper)。

::: warning

DeepSeek Harness 目前处于 **开发者预览版** 阶段，迭代频繁，**可能会有破坏性变更**。

:::

## 运行

### npm 一键运行

安装 `Node.js` 后，直接运行：

```sh
npx @deepseek-ai/dsh web
```

默认访问地址：`http://127.0.0.1:3080`

详细使用指南请参阅 [Web UI guide](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/index.md)。

### 源码运行

```sh
# 克隆仓库
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness

# 安装依赖
pnpm install

# 构建
pnpm run build

# 启动
pnpm dsh web
```

## 相关资源

| 资源 | 链接 |
|------|------|
| GitHub | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) |
| Discord | [DeepSeek Harness 社区](https://discord.gg/Ycq5dCaS4) |
| 开发指南 | [Development Guide](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/development.md) |
| 架构文档 | [Architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) |
| Agent 开发 | [AGENTS.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/AGENTS.md) |
