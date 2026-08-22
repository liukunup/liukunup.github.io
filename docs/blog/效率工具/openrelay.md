---
title: 打破 AI 孤岛：OpenRelay 一站式配额管理神器
createTime: 2026/04/26 17:30:00
permalink: /blog/openrelay/
tags:
  - AI
  - Open Source
  - Claude
  - Kiro
  - Tool
---

## 痛点

在日常开发中，你是否遇到过这样的困境？

- Claude Pro 订阅只能在 Claude Desktop 里用
- Kiro 的免费配额被困在 Kiro IDE 里
- Groq 免费 API 要给每个工具单独配置
- Cursor 500 次用完了，只能停下来等下个月

每个 AI 订阅都是一座孤岛，配额无法共享，工具无法打通。

**OpenRelay** 正是为解决这一问题而生。

## OpenRelay 是什么

[OpenRelay](https://github.com/romgX/openrelay) 是一个本地 AI 配额聚合与路由工具。它能：

1. **自动发现**你机器上所有 AI 订阅（Claude Desktop、Claude Code、Kiro、Windsurf、OpenCode 等）
2. 将这些配额**共享给任意工具**（Claude Code、Aider、Goose、Cursor 等）
3. 支持 **32 个 Provider**（24 个直连 API + 8 个 IDE 内置订阅）
4. 通过**模型组**实现跨 Provider 自动故障转移

一句话：**把所有 AI 配额汇总成一个端点，让任意工具都能用。**

## 核心功能

### 1. 自动发现所有配额

启动 OpenRelay，它瞬间扫描你机器上每一份 AI 订阅：

| Provider | 配额说明 |
|----------|---------|
| Claude Desktop | 你的 Pro/Max 订阅 |
| Claude Code | 你的 Pro/Max 订阅 |
| Kiro (AWS) | 50 credits/月 + 500 新用户 credits，免费 Claude Sonnet |
| Windsurf | 无限自动补全 + 25 credits/月 |
| OpenCode | 内置 GLM-4.7，无限使用 |
| VS Code Copilot | 你的 GitHub Copilot 订阅 |

所有配额一目了然，无需手动配置。

### 2. 一个端点，全部可用

设置一个环境变量，你的 Claude Pro 配额就能驱动任意工具：

```bash
# macOS / Linux
export ANTHROPIC_BASE_URL=http://localhost:18765
export ANTHROPIC_API_KEY=unused
```

```powershell
# Windows (PowerShell)
$env:ANTHROPIC_BASE_URL="http://localhost:18765"
$env:ANTHROPIC_API_KEY="unused"
```

现在 Claude Code 用的是你的 Claude Desktop 配额，Aider 也可以用，Goose也可以用。

想在 Aider 里用 Kiro 的免费 Claude Sonnet？改个 URL 即可：

```bash
export ANTHROPIC_BASE_URL=http://localhost:18765/kiro
```

### 3. 模型组：永不停机

这是 OpenRelay 最杀手级的功能——将多个 Provider 组合成一个虚拟模型：

```
"fast-group" = Groq (Llama 90B) + Cerebras (Llama 70B) + SambaNova (Llama 405B)
```

Groq 免费额度用完 → 自动切换到 Cerebras → 再切 SambaNova。**AI 永不中断。**

### 4. IDE 无缝集成

| IDE | 接入方式 | 效果 |
|-----|---------|------|
| Cursor | RPC 代理 (ConnectRPC) | 用任意 Provider 替换 Cursor 内置模型 |
| Windsurf | RPC 代理 | 同上 |
| VS Code Copilot | Ollama BYOK 桥接 | 任意模型作为 Copilot 后端 |
| Antigravity | Gemini REST 代理 | 通过任意 Provider 路由 |

在 Web 面板启动代理，IDE 完全无感。

### 5. 支持 24 个直连 API Provider

除了 IDE 订阅，你还可以输入自己的 API Key，接入：

| Provider | 免费额度 |
|----------|---------|
| Groq | 14,400 次/天，Llama 3.3 70B，速度极快 |
| Cerebras | 100 万 tokens/天 |
| SambaNova | Llama 405B，200K tokens/天 |
| Gemini | 免费额度大，100 万上下文 |
| DeepSeek | 注册送 500 万 tokens |
| Mistral | 10 亿 tokens/月 |
| xAI (Grok) | $25 注册 + $150/月 |
| Cloudflare AI | 10,000 Neurons/天，无需信用卡 |

……以及 Together AI、Fireworks、SiliconFlow、Zhipu、DashScope、Volcengine、Moonshot 等 20+ Provider。

## 安装与使用

### 下载安装

无需 Node.js，直接下载二进制运行：

**macOS**：
```bash
# 下载并执行
chmod +x openrelay-macos
xattr -d com.apple.quarantine openrelay-macos
./openrelay-macos
```

**Windows**：下载 `.exe` 双击运行即可。

**Linux**：下载对应二进制，执行即可。

### 启动后配置

1. 启动后打开 `http://localhost:18765`
2. Web 面板自动发现所有 IDE 订阅（绿点表示已连接）
3. 添加自己的 API Key（直连 Provider）
4. 在 **Work** 页面一键配置 CLI 工具，在 **IDE** 页面启动代理

## 安全吗？

OpenRelay 的安全设计：

- **凭据不离开本机** — 所有 API Key、Token、Cookie 仅在本地内存中，不上传任何服务器
- **直连 AI 后端** — 请求从你的机器直接发到 Provider，中间无中转
- **不记录聊天内容** — 日志仅包含错误信息和请求元数据
- **代码可审计** — 核心凭据处理代码公开可查

它本质上是一个本地代理工具（类似 Charles Proxy、Fiddler），只读取你自己已安装应用中的凭据，不涉及任何账号共享或数据上传。

## 许可证模式

OpenRelay 采用 **Open Core** 模式：

- **免费版**：32 个 Provider 全部可用，每日 30 请求限制
- **Pro 版**：无限请求 + 自定义模型组 + 优先支持

框架代码（代理、格式转换、配置）采用 MIT 许可证。

## 总结

OpenRelay 解决的是一个非常具体的问题：**你的 AI 配额散落在各处，互不相通。**

它不是一个 AI 服务，而是一个本地路由层——把来自 Claude Code、Kiro、Groq、Gemini 的所有配额聚合起来，统一输出，让任何工具都能按需调用。

如果你同时使用多个 AI 工具和订阅，OpenRelay 值得一试。

**GitHub**: [romgX/openrelay](https://github.com/romgX/openrelay)