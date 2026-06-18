---
title: ArXiv MCP
createTime: 2026/06/18 00:00:00
permalink: /ai/mcp/arxiv/
---

## 概述

ArXiv MCP 服务器，让 AI 助手能够搜索、检索和分析 arXiv 学术论文。支持关键词搜索、作者查询、分类浏览、PDF 全文提取。

## 核心特性

- **论文搜索**：支持关键词、作者、标题、分类等多维度搜索
- **全文提取**：下载 PDF 并提取文本内容
- **本地缓存**：已下载论文本地缓存，加速重复访问
- **排序分页**：支持按相关度、日期排序及分页

## 工具

| 工具 | 说明 |
|------|------|
| `search_papers` | 搜索论文，支持关键词、作者、分类、日期范围 |
| `get_paper` | 获取指定论文元数据 |
| `download_paper` | 下载论文全文 |
| `read_paper` | 阅读已下载论文内容 |

## 配置

```json
{
  "mcpServers": {
    "arxiv": {
      "command": "uv",
      "args": ["run", "arxiv-mcp-server"]
    }
  }
}
```

## 资源链接

- GitHub：[blazickjp/arxiv-mcp-server](https://github.com/blazickjp/arxiv-mcp-server)
- arXiv 官方 API：[info.arxiv.org](https://info.arxiv.org/help/api/index.html)
