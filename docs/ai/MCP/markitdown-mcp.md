---
title: MarkItDown MCP
createTime: 2026/06/18 00:00:00
permalink: /ai/mcp/markitdown/
---

## 概述

微软官方 MarkItDown MCP 服务器，将各种文件格式转换为 Markdown。支持 PDF、Office 文档、图片、音频、网页内容、结构化数据等 20+ 格式。

## 核心特性

- **多格式支持**：PDF、DOCX、XLSX、PPTX、HTML、EPUB、CSV、JSON、图片（OCR）、音频（转录）
- **单工具接口**：一个 `convert_to_markdown(uri)` 工具处理所有格式
- **三传输模式**：STDIO / Streamable HTTP / SSE
- **URI 灵活**：支持 `http:`、`https:`、`file:`、`data:` 四种 URI

## 快速使用

```bash
pip install markitdown-mcp
markitdown-mcp
```

Streamable HTTP 模式：

```bash
markitdown-mcp --http --host 127.0.0.1 --port 3001
```

Claude Desktop 配置：

```json
{
  "mcpServers": {
    "markitdown": {
      "command": "markitdown-mcp"
    }
  }
}
```

## 资源链接

- GitHub：[microsoft/markitdown](https://github.com/microsoft/markitdown)
- PyPI：[markitdown-mcp](https://pypi.org/project/markitdown-mcp/)
- 文档：[microsoft.github.io/markitdown](https://microsoft.github.io/markitdown/)
- 许可证：MIT
