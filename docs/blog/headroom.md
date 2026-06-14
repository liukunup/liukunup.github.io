---
title: Headroom - AI 代理上下文优化层
createTime: 2026/06/14 00:00:00
permalink: /blog/headroom/
---

## 概述

[Headroom](https://github.com/chopratejas/headroom) 是一个上下文优化层，用于压缩 AI 代理读取的所有内容——工具输出、日志、文件、RAG 检索结果、数据库结果——在它们到达 LLM 之前。同样的答案，只需要一小部分 token。

**核心优势：60–95% 更少 token · 相同答案 · 本地优先 · Apache 2.0**

## 核心特性

- **工具输出压缩**：实时压缩 MCP 服务器的工具输出结果
- **智能统计压缩**：智能分析压缩工具输出，保留原始 JSON 结构
- **RAG 优化**：压缩 RAG 检索结果，减少无关上下文
- **数据库结果压缩**：压缩 DB 查询结果，只保留相关项
- **文件读取优化**：压缩文件内容，保留关键信息
- **对话历史压缩**：压缩对话历史，控制上下文长度

## 工作原理

```
┌─────────────────────────────────────────────────────────────┐
│                      AI 代理                               │
│                  (Claude, GPT, etc.)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Headroom                              │
│              上下文优化层 (压缩层)                           │
│                                                               │
│   • 工具输出压缩                                              │
│   • 日志压缩                                                  │
│   • RAG 结果压缩                                              │
│   • 文件压缩                                                  │
│   • 对话历史压缩                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       LLM                                  │
│                   (更少 token, 更快响应)                    │
└─────────────────────────────────────────────────────────────┘
```

## 集成方式

### 1. MCP 代理

Headroom 提供 MCP 代理服务器，包装上游 MCP 服务器：

```python
from headroom.integrations.mcp import HeadroomMCPProxy

# 启动代理服务器
proxy = HeadroomMCPProxy(upstream_server="your-mcp-server")
proxy.start()
```

### 2. Strands 集成

```python
from headroom.integrations.strands import HeadroomHookProvider

# 实时压缩工具输出
hook = HeadroomHookProvider(config=HeadroomConfig())
```

### 3. LangChain 集成

```python
from langchain.callbacks import HeadroomCallbackHandler

handler = HeadroomCallbackHandler(
    smart_crusher_threshold=500,  # 压缩 > 500 token 的工具输出
    smart_crusher_max_items=20,  # 最多保留 20 项
)
```

### 4. 独立函数

```python
from headroom.integrations.mcp import compress_tool_result

# 压缩工具结果
compressed = compress_tool_result(original_result)
```

## 压缩配置

```python
from headroom.config import SmartCrusherConfig

config = SmartCrusherConfig(
    max_items_after_crush=10,  # 压缩后最多保留 10 项
)
```

### 智能压缩策略

- **相关性匹配**：保留与用户查询上下文匹配的项目
- **首尾项保留**：保留开头和结尾的项目以维持上下文
- **结构异常检测**：保留结构异常值（如罕见状态值）
- **错误保护**：可选从不压缩包含错误状态的结果

## 基准测试

| 场景 | Token 节省 |
|------|-----------|
| 工具输出压缩 | 60-95% |
| RAG 检索结果 | 显著减少 |
| 数据库查询结果 | 显著减少 |
| 对话历史 | 可控上下文长度 |

## 技术栈

- **编程语言**：Python
- **许可证**：Apache 2.0
- **部署方式**：本地优先
- **集成**：MCP、Strands、LangChain

## 资源链接

- GitHub：https://github.com/chopratejas/headroom
- 许可证：Apache-2.0