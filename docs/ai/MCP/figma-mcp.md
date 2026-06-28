---
title: Figma MCP
createTime: 2026/06/18 00:00:00
permalink: /ai/mcp/figma/
---

## 概述

Figma 官方 MCP 服务器，将 Figma 设计上下文直接带入开发工作流。支持设计转代码、设计上下文提取、组件映射、变量和样式读取。

## 核心特性

- **设计转代码**：选择 Figma 图层，获取 React + Tailwind 代码
- **设计上下文**：提取变量、组件、布局信息到 IDE
- **Code Connect**：将 Figma 节点映射到代码库组件
- **远程/本地双模式**：推荐远程模式，无需安装 Figma 桌面版

## 工具

| 工具 | 说明 |
|------|------|
| `get_design_context` | 获取选中图层/URL 的设计上下文（React + Tailwind） |
| `get_variable_defs` | 提取颜色、间距、排版等变量定义 |
| `use_figma`（远程） | 通用工具，支持创建/编辑 Figma 内容 |
| `get_code_connect_map` | 获取 Figma 节点与代码组件的映射 |
| `whoami`（远程） | 返回当前认证用户信息 |

## 配置

```json
{
  "mcpServers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

Claude Code：

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

## 资源链接

- 开发者文档：[developers.figma.com/docs/figma-mcp-server](https://developers.figma.com/docs/figma-mcp-server/)
- 帮助中心：[help.figma.com](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
- GitHub：[figma/mcp-server-guide](https://github.com/figma/mcp-server-guide)
- 博客：[figma.com/blog/introducing-figma-mcp-server](https://www.figma.com/blog/introducing-figma-mcp-server/)
