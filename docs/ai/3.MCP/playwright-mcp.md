---
title: Playwright MCP
createTime: 2026/06/18 00:00:00
permalink: /ai/mcp/playwright-mcp/
---

## 概述

微软官方 Playwright MCP 服务器，通过结构化无障碍快照为 LLM 提供浏览器自动化能力，无需视觉模型。支持 Chrome、Firefox、WebKit、Edge。

## 核心特性

- **无障碍树驱动**：基于 Accessibility Tree，非像素/截图方案，200-400 tokens/快照
- **40+ 工具**：导航、点击、表单填充、网络 Mock、存储、追踪、视频录制
- **跨浏览器**：Chromium、Firefox、WebKit、Edge
- **持久会话**：登录状态和 Cookie 默认跨会话保持

## 主要工具

| 工具 | 说明 |
|------|------|
| `browser_navigate` | 导航到 URL |
| `browser_click` | 按 ref 点击元素 |
| `browser_type` | 输入文本 |
| `browser_fill_form` | 批量填写表单 |
| `browser_snapshot` | 获取无障碍快照 |
| `browser_take_screenshot` | 截图 |
| `browser_tabs` | 标签页管理 |
| `browser_run_code_unsafe` | 执行 Playwright 脚本 |
| `browser_wait_for` | 等待条件 |

## 配置

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

## 资源链接

- 官网：[playwright.dev/mcp](https://playwright.dev/mcp)
- 文档：[playwright.dev/docs/getting-started-mcp](https://playwright.dev/docs/getting-started-mcp)
- GitHub：[microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- npm：[`@playwright/mcp`](https://www.npmjs.com/package/@playwright/mcp)
- 许可证：Apache 2.0
