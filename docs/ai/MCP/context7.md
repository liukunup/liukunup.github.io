---
title: Context7
createTime: 2026/06/18 00:00:00
permalink: /ai/mcp/context7/
---

## 概述

Upstash 出品的 Context7 MCP 服务器，为 LLM 提供最新、版本精准的编程库文档和代码示例。支持 1000+ 编程库，自动匹配版本。

## 核心特性

- **版本精准**：自动匹配并检索对应版本的库文档
- **智能检索**：支持自然语言查询，自动重排序
- **覆盖广泛**：1000+ 编程库，覆盖主流语言和框架
- **双模式**：MCP 协议 + CLI 两种使用方式

## 工具

| 工具 | 说明 |
|------|------|
| `resolve-library-id` | 将库名解析为 Context7 兼容 ID |
| `query-docs` | 按库 ID 和自然语言查询检索文档 |

## 配置

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

一键安装：

```bash
npx ctx7 setup
```

## 资源链接

- GitHub：[upstash/context7](https://github.com/upstash/context7)
- npm：[`@upstash/context7-mcp`](https://www.npmjs.com/package/@upstash/context7-mcp)
- 官网：[context7.com](https://context7.com)
- 许可证：MIT
