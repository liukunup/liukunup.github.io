---
title: pytest-mcp-plugin
createTime: 2026/06/18 00:00:00
permalink: /ai/mcp/pytest-mcp/
---

## 概述

Anthropic 官方出品的 MCP 服务器测试框架。提供 pytest fixtures、协议合规性验证、安全测试套件，支持 stdio 和 Streamable-HTTP 两种传输模式。

## 核心特性

- **协议合规**：内置 `@modelcontextprotocol/conformance` 测试套件 CI 集成
- **安全测试**：内置路径遍历、SQL 注入、凭据泄漏、shell 元字符注入检测套件
- **双传输**：stdio + Streamable-HTTP 同一套 fixture 和断言
- **CI 就绪**：JUnit XML 输出，失败自动 dump 通信日志，`mcp-test` GitHub Action

## 快速使用

```bash
pip install pytest-mcp-plugin
```

```python
# conftest.py
@pytest.fixture
def mcp_server():
    return {"command": "python", "args": ["my_server.py"]}

# test_server.py
def test_tools_exist(mcp_server):
    tools = mcp_server.list_tools()
    assert len(tools) > 0

def test_tool_call(mcp_server):
    result = mcp_server.call_tool("hello", {"name": "world"})
    assert result.content[0].text == "Hello, world!"
```

```bash
pytest --mcp-server "python my_server.py"
```

## 资源链接

- GitHub：[github.com/0-co/mcp-test](https://github.com/0-co/mcp-test)
- PyPI：[pytest-mcp-plugin](https://pypi.org/project/pytest-mcp-plugin/)
