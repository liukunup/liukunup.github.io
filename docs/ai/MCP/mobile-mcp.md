---
title: mobile-mcp
createTime: 2026/06/18 00:00:00
permalink: /ai/mcp/mobile-mcp/
---

## 概述

跨平台移动设备自动化 MCP 服务器，支持 iOS（真机/模拟器）和 Android（真机/模拟器），通过无障碍快照或坐标实现 LLM 驱动的移动应用交互。

## 核心特性

- **跨平台**：iOS 通过 WebDriverAgent，Android 通过 ADB + UI Automator
- **两种交互模式**：无障碍树（首选）或截图坐标（后备）
- **结构化数据提取**：从屏幕上提取可见的格式化数据

## 可用工具

| 工具 | 说明 |
|------|------|
| `mobile_screenshot` | 截取屏幕 |
| `mobile_get_screen_elements` | 列出元素坐标和属性 |
| `mobile_click_on_screen_at_coordinates` | 点击坐标 |
| `mobile_swipe_on_screen` | 滑动 |
| `mobile_type` | 输入文本 |
| `mobile_open_url` | 打开 URL |
| `mobile_press_button` | 按下硬件键 |

## 配置

```json
{
  "mcpServers": {
    "mobile-mcp": {
      "command": "npx",
      "args": ["-y", "@mobilenext/mobile-mcp@latest"]
    }
  }
}
```

## 资源链接

- GitHub：[mobile-next/mobile-mcp](https://github.com/mobile-next/mobile-mcp)
- npm：[`@mobilenext/mobile-mcp`](https://www.npmjs.com/package/@mobilenext/mobile-mcp)
- 许可证：Apache 2.0
