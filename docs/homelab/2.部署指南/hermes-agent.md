---
title: Hermes Agent
tags:
  - hermes-agent
  - ai agent
  - nous research
  - self-improving
  - telegram
  - discord
createTime: 2025/10/28 10:00:00
permalink: /homelab/deploy/hermes-agent/
---

## 🏗️ 架构图

📖 [Hermes Agent Docs](https://hermes-agent.nousresearch.com/docs/)

📖 [Hermes Agent GitHub](https://github.com/NousResearch/hermes-agent)

**The self-improving AI agent built by Nous Research.** It's the only agent with a built-in learning loop — it creates skills from experience, improves them during use, nudges itself to persist knowledge, searches its own past conversations, and builds a deepening model of who you are across sessions.

## 🚀 部署指南

::: tabs

@tab:active Linux / macOS

```shell
# 快速安装
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# 或使用备用源
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

@tab Windows

```shell
# 使用 PowerShell 安装
powershell -ExecutionPolicy ByPass -c "irm https://hermes-agent.nousresearch.com/install.ps1 | iex"
```

@tab Docker

```shell
# 下载安装包
wget https://github.com/NousResearch/hermes-agent/releases/latest/download/hermes-agent-docker.tar.gz

# 加载镜像
docker load < hermes-agent-docker.tar.gz

# 运行容器
docker run -d \
  -p 8080:8080 \
  -v ~/.hermes:/root/.hermes \
  --name hermes-agent \
  --restart=unless-stopped \
  hermesagent/hermes-agent:latest
```

:::

## ⚙️ 配置样例

### 📦 初始化配置

```shell
# 完整设置向导
hermes setup

# 使用 Nous Portal（推荐）
hermes setup --portal

# 手动配置模型提供商
hermes model

# 配置工具
hermes tools

# 设置单个配置值
hermes config set MODEL anthropic/claude-sonnet-4
hermes config set OPENROUTER_API_KEY sk-or-...
```

### 📦 config.yaml 配置

```yaml
# ~/.hermes/config.yaml

# 模型配置
model: anthropic/claude-sonnet-4

# 终端后端配置
terminal:
  backend: docker  # local, docker, ssh, singularity, modal
  docker:
    image: hermesagent/hermes-terminal:latest
    network: host

# TTS 配置
tts:
  provider: elevenlabs
  voice: default

# 压缩配置
compression:
  enabled: true
  threshold: 10000

# 内存配置
memory:
  max_memories: 100
  persist_interval: 300

# 工具配置
tools:
  enabled:
    - websearch
    - browser
    - file_read
    - terminal
  disabled: []
```

### 📦 .env 配置

```plaintext
# ~/.hermes/.env

# API Keys
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...
ANTHROPIC_API_KEY=sk-ant-...

# Nous Portal
NOUS_PORTAL_TOKEN=your_portal_token

# 消息平台配置
TELEGRAM_BOT_TOKEN=your_telegram_token
DISCORD_BOT_TOKEN=your_discord_token
SLACK_BOT_TOKEN=your_slack_token
SLACK_SIGNING_SECRET=your_signing_secret

# 邮件配置
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=password
```

### 📦 Docker Compose 配置

```yaml
services:
  hermes-agent:
    image: hermesagent/hermes-agent:latest
    container_name: hermes-agent
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ~/.hermes:/root/.hermes
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - TZ=Asia/Shanghai
      - HERMES_TELEMETRY=false
    security_opt:
      - no-new-privileges:true
    read_only: false
    tmpfs:
      - /tmp
```

## 🔧 常用命令

```shell
# 启动交互式 CLI
hermes

# 选择模型提供商
hermes model

# 配置工具
hermes tools

# 设置配置值
hermes config set KEY VALUE

# 查看当前配置
hermes config

# 编辑配置文件
hermes config edit

# 检查配置完整性
hermes config check

# 启动消息网关
hermes gateway

# 更新到最新版本
hermes update

# 诊断问题
hermes doctor

# 从 OpenClaw 迁移
hermes claw migrate
```

## 💻 最佳实践

### 🔥 完整部署套件

::: steps

1. 安装

    ```shell
    curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
    ```

2. 配置

    ```shell
    # 完整设置向导
    hermes setup --portal

    # 或手动配置
    hermes model
    hermes tools
    hermes config set OPENROUTER_API_KEY sk-or-...
    ```

3. 配置消息网关

    ```shell
    # 启动 Telegram Bot
    hermes gateway telegram

    # 启动 Discord Bot
    hermes gateway discord

    # 查看所有可用网关
    hermes gateway --list
    ```

4. 验证

    ```shell
    # 检查状态
    hermes doctor

    # 测试对话
    hermes chat "Hello, how are you?"
    ```

:::

### 📦 Telegram 网关配置

```shell
# 创建 Telegram Bot
# 1. 在 Telegram 中搜索 @BotFather
# 2. 发送 /newbot
# 3. 获取 Bot Token

# 配置环境变量
hermes config set TELEGRAM_BOT_TOKEN your_token

# 启动网关
hermes gateway telegram
```

### 📦 Discord 网关配置

```shell
# 创建 Discord Application
# 1. 访问 https://discord.com/developers/applications
# 2. 创建新 Application
# 3. 添加 Bot
# 4. 获取 Bot Token

# 配置环境变量
hermes config set DISCORD_BOT_TOKEN your_token

# 启动网关
hermes gateway discord
```

### 🔐 安全配置

```yaml
# ~/.hermes/config.yaml

security:
  # 命令审批模式
  approval_mode: ask  # ask, auto_approve, deny

  # 容器隔离
  sandbox:
    enabled: true
    backend: docker
    network: isolate
    capabilities: drop

  # DM 配对
  dm_pairing:
    enabled: true
    require_auth: true

  # 敏感信息过滤
  redact_secrets: true
  log_level: info
```

### 🧠 记忆系统配置

```yaml
# ~/.hermes/config.yaml

memory:
  # 最大记忆数量
  max_memories: 100

  # 持久化间隔（秒）
  persist_interval: 300

  # 记忆类型
  types:
    - episodic
    - semantic
    - procedural

  # 用户画像
  user_profile:
    enabled: true
    persist_path: ~/.hermes/memories/USER.md
```

### 📅 Cron 调度配置

```shell
# 设置定时任务
hermes cron schedule "0 9 * * *" "早安，给我今天的天气和新闻摘要"

# 查看定时任务
hermes cron list

# 删除定时任务
hermes cron delete <job_id>
```

### 🔌 MCP 集成配置

```yaml
# ~/.hermes/config.yaml

mcp:
  servers:
    - name: filesystem
      command: npx
      args:
        - -y
        - @modelcontextprotocol/server-filesystem
      env:
        PWD: /home/user/projects

    - name: github
      command: npx
      args:
        - -y
        - @modelcontextprotocol/server-github
      env:
        GITHUB_PERSONAL_ACCESS_TOKEN: your_token
```

### 🎭 个性化配置

```markdown
# ~/.hermes/SOUL.md

# 系统身份

你是一个有帮助的 AI 助手，名为 Hermes。
你由 Nous Research 开发。

## 行为准则

- 保持专业但友好的语气
- 主动学习和适应用户习惯
- 在不确定时诚实表达

## 专业领域

- 软件开发
- 系统管理
- 数据分析
- 自动化任务
```

## 📱 移动端配置

::: steps

1. 配置 Telegram/Discord Bot

    按照上面的配置指南设置消息网关。

2. 连接移动端

    - Telegram: 直接在 Telegram 中与你的 Bot 对话
    - Discord: 加入配置好的 Discord 服务器

3. 开始对话

    从任何设备继续你的对话，Hermes 会记住上下文。

:::

## 🛠️ 工具集配置

```yaml
# ~/.hermes/config.yaml

tools:
  # 启用的工具
  enabled:
    - websearch          # 网页搜索
    - browser            # 浏览器自动化
    - file_read          # 文件读取
    - file_write         # 文件写入
    - terminal           # 终端命令
    - python             # Python 解释器
    - memory             # 记忆管理
    - skill_manage       # 技能管理

  # 禁用的工具
  disabled:
    - dangerous_command

  # 工具参数
  params:
    browser:
      headless: true
      viewport:
        width: 1920
        height: 1080
```