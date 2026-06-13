---
title: OpenClaw
tags:
  - openclaw
  - ai assistant
  - gateway
  - telegram
  - discord
  - whatsapp
  - self-hosted
createTime: 2025/10/28 10:00:00
permalink: /homelab/deploy/openclaw/
---

## 🏗️ 架构图

📖 [OpenClaw Docs](https://docs.openclaw.ai/)

📖 [OpenClaw GitHub](https://github.com/openclaw/openclaw)

**OpenClaw** is a _personal AI assistant_ you run on your own devices. It answers you on the channels you already use — WhatsApp, Telegram, Discord, Slack, Signal, iMessage, and more. The Gateway is just the control plane — the product is the assistant.

## 🚀 部署指南

::: tabs

@tab:active npm/pnpm/bun

```shell
# Node 24 (推荐) 或 Node 22.14+
npm install -g openclaw@latest

# 或使用 pnpm
pnpm add -g openclaw@latest

# 或使用 bun
bun add -g openclaw@latest
```

@tab Docker

```shell
# 下载 Docker 镜像
docker pull openclaw/openclaw:latest

# 运行容器
docker run -d \
  -p 18789:18789 \
  -v ~/.openclaw:/root/.openclaw \
  --name openclaw \
  --restart=unless-stopped \
  openclaw/openclaw:latest
```

@tab Nix

```shell
# 使用 Nix 安装
nix-run -p openclaw https://openclaw.ai/openclaw.nix
```

:::

## ⚙️ 配置样例

### 📦 初始化配置

```shell
# 推荐：引导式安装
openclaw onboard --install-daemon

# 快速启动
openclaw gateway --port 18789 --verbose

# 配置频道
openclaw channels login
```

### 📦 配置文件

```json
// ~/.openclaw/openclaw.json

{
  "gateway": {
    "port": 18789,
    "bind": "loopback",
    "auth": "token"
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4"
      }
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "your_bot_token"
    },
    "discord": {
      "enabled": true,
      "botToken": "your_bot_token"
    }
  }
}
```

### 📦 Docker Compose 配置

```yaml
services:
  openclaw:
    image: openclaw/openclaw:latest
    container_name: openclaw
    restart: unless-stopped
    ports:
      - "18789:18789"
    volumes:
      - ~/.openclaw:/root/.openclaw
    environment:
      - TZ=Asia/Shanghai
    security_opt:
      - no-new-privileges:true
    read_only: false
    tmpfs:
      - /tmp
```

## 🔧 常用命令

```shell
# 引导式安装
openclaw onboard --install-daemon

# 启动网关
openclaw gateway --port 18789 --verbose

# 登录频道
openclaw channels login

# 配置
openclaw configure

# 查看状态
openclaw status

# 更新
openclaw update

# 诊断问题
openclaw doctor

# 模型管理
openclaw models list
openclaw models set <provider/model>

# 任务管理
openclaw tasks list
openclaw tasks audit
```

## 💻 最佳实践

### 🔥 完整部署套件

::: steps

1. 安装

    ```shell
    npm install -g openclaw@latest
    ```

2. 引导配置

    ```shell
    openclaw onboard --install-daemon
    ```

3. 配置频道

    ```shell
    # Telegram
    openclaw channels login telegram

    # Discord
    openclaw channels login discord

    # WhatsApp
    openclaw channels login whatsapp
    ```

4. 启动网关

    ```shell
    openclaw gateway --port 18789 --verbose
    ```

5. 验证

    ```shell
    # 检查状态
    openclaw status

    # 诊断问题
    openclaw doctor
    ```

:::

### 📦 Telegram 配置

```shell
# 1. 在 Telegram 中搜索 @BotFather
# 2. 发送 /newbot
# 3. 获取 Bot Token

# 配置
openclaw configure --section telegram
```

### 📦 Discord 配置

```shell
# 1. 访问 https://discord.com/developers/applications
# 2. 创建新 Application
# 3. 添加 Bot
# 4. 获取 Bot Token

# 配置
openclaw configure --section discord
```

### 📦 WhatsApp 配置

```shell
# 配置 WhatsApp
openclaw channels login whatsapp

# 扫码连接
openclaw channels link whatsapp
```

### 🔐 安全配置

```json
// ~/.openclaw/openclaw.json

{
  "security": {
    "token": "your-secure-token",
    "allowedUsers": ["user-id-1", "user-id-2"],
    "dmOnly": true,
    "groupMode": "allowlist"
  },
  "sandbox": {
    "enabled": true,
    "backend": "docker"
  }
}
```

### 🧠 记忆系统配置

```json
// ~/.openclaw/openclaw.json

{
  "memory": {
    "search": {
      "enabled": true,
      "provider": "local"
    },
    "maxSize": 100,
    "persistInterval": 300
  }
}
```

### 📅 Cron 调度配置

```shell
# 设置定时任务
openclaw cron schedule "0 9 * * *" "发送每日摘要"

# 查看定时任务
openclaw cron list

# 删除定时任务
openclaw cron delete <job_id>
```

### 🔌 工具配置

```json
// ~/.openclaw/openclaw.json

{
  "tools": {
    "web": {
      "search": {
        "enabled": true,
        "provider": "parallel-free"
      }
    },
    "terminal": {
      "enabled": true,
      "backend": "local"
    }
  }
}
```

## 📱 支持的平台

| 平台 | 状态 | 说明 |
|------|------|------|
| WhatsApp | ✅ | 官方支持 |
| Telegram | ✅ | 官方支持 |
| Discord | ✅ | 官方支持 |
| Slack | ✅ | 官方支持 |
| Signal | ✅ | 官方支持 |
| iMessage | ✅ | 官方支持 |
| Microsoft Teams | ✅ | 官方支持 |
| Matrix | ✅ | 官方支持 |
| Google Chat | ✅ | 官方支持 |
| IRC | ✅ | 官方支持 |
| LINE | ✅ | 官方支持 |
| Mattermost | ✅ | 官方支持 |
| WeChat | ✅ | 社区支持 |
| QQ | ✅ | 社区支持 |

## 🔄 迁移到 Hermes Agent

如果你正在从 OpenClaw 迁移到 Hermes Agent：

```shell
# 在 Hermes Agent 中运行迁移
hermes claw migrate

# 预览迁移内容
hermes claw migrate --dry-run

# 仅迁移用户数据（不含密钥）
hermes claw migrate --preset user-data

# 覆盖已有冲突
hermes claw migrate --overwrite
```

**迁移内容包括：**
- SOUL.md — 个性文件
- Memories — MEMORY.md 和 USER.md
- Skills — 用户创建的技能
- Command allowlist — 命令审批模式
- Messaging settings — 平台配置
- API keys — API 密钥

## 📖 更多资源

- 📖 [官方文档](https://docs.openclaw.ai/)
- 💬 [Discord 社区](https://discord.gg/openclaw)
- 🐛 [问题反馈](https://github.com/openclaw/openclaw/issues)