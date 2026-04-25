---
title: Hermes Agent 部署指南：接入 MiniMax、飞书和微信
createTime: 2026/04/25 20:21:17
permalink: /ai/jva8pene/
tags:
  - Hermes Agent
  - AI Agent
  - MiniMax
  - 飞书
  - 微信
  - 部署
---

# Hermes Agent 部署指南：接入 MiniMax、飞书和微信

> Hermes Agent 是 Nous Research 开源的自托管 AI Agent 框架，支持多平台消息网关接入。本文详细介绍如何从零部署 Hermes Agent，配置 MiniMax 大模型，并接入飞书和微信两大国内主流 IM 平台。

<!-- more -->

## 环境要求

| 组件 | 最低要求 | 推荐配置 |
|------|---------|---------|
| 系统 | Linux / macOS / WSL2 | Ubuntu 22.04 LTS |
| 内存 | 1 GB RAM | 2 GB+ RAM |
| 磁盘 | 10 GB 可用空间 | 20 GB+ SSD |
| 网络 | 可访问外部 API | 稳定公网 IP（用于飞书 Webhook） |

## 一、安装 Hermes Agent

### 方式一：一键安装脚本（推荐）

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

安装完成后，重新加载 Shell 环境：

```bash
source ~/.bashrc   # 或 source ~/.zshrc
```

### 方式二：Docker 部署

```bash
docker pull ghcr.io/nousresearch/hermes-agent:latest

docker run -d \
  --name hermes \
  --restart unless-stopped \
  -v ~/.hermes:/root/.hermes \
  -p 127.0.0.1:8642:8642 \
  nousresearch/hermes-agent:latest
```

> 💡 推荐使用 Docker 部署，隔离性好，版本管理方便。生产环境建议使用 `docker-compose` 并锁定版本标签（如 `:v2026.4.16`）而非 `:latest`。

### 方式三：Web UI 部署（可选）

如果你希望拥有浏览器端管理界面：

```bash
docker pull ghcr.io/nesquena/hermes-webui:latest

docker run -d \
  --name hermes-webui \
  -e WANTED_UID=$(id -u) \
  -e WANTED_GID=$(id -g) \
  -v ~/.hermes:/home/hermeswebui/.hermes \
  -v ~/workspace:/workspace \
  -p 8787:8787 \
  ghcr.io/nesquena/hermes-webui:latest
```

## 二、基础配置

### 交互式配置向导

```bash
hermes setup
```

向导会依次引导你完成：

1. **LLM Provider 选择** — 选择推理服务提供商
2. **API Key 输入** — 填入你的密钥
3. **Gateway 配置** — 选择消息平台（Telegram / Discord / Slack 等）
4. **Profile 创建** — 创建你的第一个 Profile

### 手动配置模型

安装完成后，先选择模型：

```bash
hermes model
```

## 三、配置 MiniMax 大模型

Hermes Agent 原生支持 MiniMax，提供全球版和中国版两个接入点。

### MiniMax 介绍

MiniMax 是国内领先的 AI 大模型提供商，旗下 **MiniMax-M2.7** 模型拥有 200K 上下文窗口，定价 $10/月无限用量，性价比极高。详细见 [MiniMax 官方 Token Plan](https://platform.minimax.io/docs/token-plan/hermes-agent)。

### 方式一：交互式配置（推荐）

```bash
hermes model
```

1. 从 Provider 列表中选择 **"MiniMax (global endpoint)"**
2. 输入你的 MiniMax Token Plan API Key
3. 选择模型 **MiniMax-M2.7**
4. 等待验证连接成功

### 方式二：手动配置

**1. 设置环境变量**

```bash
# ~/.hermes/.env
MINIMAX_API_KEY=sk-your-api-key-here
```

**2. 修改配置文件**

```yaml
# ~/.hermes/config.yaml
provider: minimax
model:
  default: MiniMax-M2.7
```

**3. 国内用户使用中国端点**

```bash
# ~/.hermes/.env
MINIMAX_CN_API_KEY=sk-your-cn-api-key-here
```

```yaml
# ~/.hermes/config.yaml
provider: minimax-cn
model:
  default: MiniMax-M2.7
```

> ⚠️ **注意事项**：MiniMax API 使用 Anthropic Messages 格式（`/anthropic/v1/messages`），不是 OpenAI 的 `/chat/completions` 格式。Hermes 会自动处理，但如果你手动配置 `base_url`，需要注意区分。

### 配置备用 Provider（推荐生产使用）

为了防止主模型不可用，建议配置备用 Provider：

```yaml
# ~/.hermes/config.yaml
provider: minimax
model:
  default: MiniMax-M2.7
  fallback_provider:
    provider: anthropic
    model: claude-sonnet-4-5

# 或者使用 Ollama 本地模型作为备用
model:
  default: MiniMax-M2.7
  fallback_provider:
    provider: ollama
    model: qwen3.5:32b
```

## 四、部署到 VPS（24/7 运行）

### VPS 推荐配置

- **DigitalOcean / Hetzner / Vultr**：$5-6/月即可
- 最低 1GB RAM，无本地 LLM 需求

### SSH 连接到服务器

```bash
ssh root@your-server-ip
```

### 安装 Hermes

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.bashrc
```

### 使用 PM2 保持后台运行

```bash
# 安装 PM2
npm i -g pm2

# 启动 Hermes
pm2 start hermes --name hermes-agent

# 设置开机自启
pm2 startup && pm2 save
```

### 内存限制（防止内存溢出）

```bash
pm2 start hermes --name hermes-agent -- /usr/bin/hermes
pm2 restart hermes-agent --update-env -- max-memory-restart 1500M
```

### 防火墙配置（如需 Webhook）

```bash
ufw allow 8443/tcp   # Webhook 模式需要
ufw allow 80/tcp     # Caddy HTTP
ufw allow 443/tcp    # Caddy HTTPS
```

## 五、接入飞书（Lark）

飞书是 Hermes 原生支持的消息平台之一，推荐使用 **WebSocket 模式**，无需公网回调地址。

### 方式一：交互式配置（推荐）

```bash
hermes gateway setup
```

1. 选择 **Feishu / Lark**
2. 支持扫码创建应用，或手动填入 App ID 和 App Secret
3. 连接模式选择 **WebSocket**（推荐）

### 方式二：手动配置

**1. 创建飞书应用**

前往 [飞书开放平台](https://open.feishu.cn/app) 创建应用：

- 添加机器人能力
- 配置权限：`im:message`、`im:message.receive_v1`
- 获取 `App ID` 和 `App Secret`

**2. 配置环境变量**

```bash
# ~/.hermes/.env
FEISHU_APP_ID=cli_xxx
FEISHU_APP_SECRET=secret_xxx
FEISHU_DOMAIN=feishu              # 国内用 feishu，国际用 lark
FEISHU_CONNECTION_MODE=websocket  # 推荐 WebSocket 模式
FEISHU_ALLOWED_USERS=ou_xxx       # 允许的用户 Open ID 列表（可选但推荐）
FEISHU_HOME_CHANNEL=oc_xxx        # Home Channel（可选）
```

**3. Webhook 模式（可选，需要公网地址）**

如果选择 Webhook 模式，还需要：

```bash
FEISHU_CONNECTION_MODE=webhook
FEISHU_WEBHOOK_HOST=127.0.0.1     # 默认
FEISHU_WEBHOOK_PORT=8765           # 默认
FEISHU_WEBHOOK_PATH=/feishu/webhook
FEISHU_ENCRYPT_KEY=your-key        # 强烈推荐设置加密密钥
```

### 飞书配置参数说明

| 参数 | 必需 | 默认值 | 说明 |
|------|------|--------|------|
| `FEISHU_APP_ID` | ✅ | — | 飞书应用 App ID |
| `FEISHU_APP_SECRET` | ✅ | — | 飞书应用 App Secret |
| `FEISHU_DOMAIN` | — | `feishu` | `feishu`（中国）或 `lark`（国际） |
| `FEISHU_CONNECTION_MODE` | — | `websocket` | `websocket`（推荐）或 `webhook` |
| `FEISHU_ALLOWED_USERS` | — | （空） | 允许的用户 Open ID 列表，逗号分隔 |
| `FEISHU_HOME_CHANNEL` | — | — | 默认 Home Channel ID |
| `FEISHU_ENCRYPT_KEY` | — | （空） | 消息加密密钥（Webhook 模式推荐） |

### 启动飞书网关

```bash
hermes gateway start
```

**使用注意事项**：

- **私聊**：直接发消息，AI 会自动回复
- **群聊**：需要 **@机器人** 才会响应
- **设置 Home Channel**：在聊天中发送 `/set-home`

## 六、接入微信（WeChat）

Hermes Agent 通过腾讯官方 **iLink Bot API** 实现微信个人号接入，稳定合规，支持私聊和群聊。

> ⚠️ **免责声明**：微信个人号接入涉及第三方协议，请谨慎使用，注意账号安全。建议使用微信小号而非主号。

### 方式一：交互式配置（推荐）

```bash
hermes gateway setup
```

1. 选择 **WeChat (iLink / ClawBot)**
2. 选择 DM 授权方式：
   - `Use DM pairing approval (recommended)` — 推荐，需审批才可私聊
   - `open` — 完全开放
   - `allowlist` — 仅白名单用户

### 方式二：手动配置

**1. 安装依赖**

```bash
pip install httpx cryptography
```

**2. 获取 iLink Bot 凭证**

前往微信 iLink Bot 平台申请 Bot，获取 `account_id` 和 `token`。

**3. 二维码登录**

```bash
python -m hermes_tools.scripts.wechat_login
```

终端会显示二维码，用微信扫描登录。

**4. 配置环境变量**

```bash
# ~/.hermes/.env
WECHAT_ACCOUNT_ID=your_account_id
WECHAT_BOT_TOKEN=your_bot_token
WECHAT_BASE_URL=https://ilinkai.weixin.qq.com
WECHAT_DM_POLICY=open              # open / allowlist / disabled / pairing
WECHAT_GROUP_POLICY=disabled       # open / allowlist / disabled
```

**5. 启动网关**

```bash
hermes gateway start
```

### 微信配置参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `account_id` | — | iLink Bot Account ID（必需） |
| `token` | — | iLink Bot Token（必需） |
| `base_url` | `https://ilinkai.weixin.qq.com` | iLink API 地址 |
| `cdn_base_url` | `https://novac2c.cdn.weixin.qq.com/c2c` | CDN 地址（媒体传输） |
| `dm_policy` | `open` | 私聊策略：`open`/`allowlist`/`disabled`/`pairing` |
| `group_policy` | `disabled` | 群聊策略：`open`/`allowlist`/`disabled` |
| `allow_from` | `[]` | 私聊白名单用户 ID |
| `group_allow_from` | `[]` | 群聊白名单群 ID |

### 常见问题

**Q：扫码后账号显示不在线？**

```bash
hermes gateway start
```

重新启动网关，重新扫码。

**Q：微信发消息 AI 不回复？**

1. 检查网关是否启动成功（终端显示 `Gateway started successfully`）
2. 确认扫码登录的账号与配置一致
3. 检查 DM 策略是否正确设置

## 七、部署架构示例

### Docker Compose 完整部署

```yaml
# docker-compose.yml
services:
  hermes:
    image: ghcr.io/nousresearch/hermes-agent:latest
    container_name: hermes
    restart: unless-stopped
    ports:
      - "127.0.0.1:8642:8642"
    environment:
      MINIMAX_API_KEY: "${MINIMAX_API_KEY}"
      FEISHU_APP_ID: "${FEISHU_APP_ID}"
      FEISHU_APP_SECRET: "${FEISHU_APP_SECRET}"
      FEISHU_DOMAIN: "feishu"
      FEISHU_CONNECTION_MODE: "websocket"
    volumes:
      - ./hermes.json:/app/hermes.json:ro
      - ./credentials:/root/.hermes/credentials
      - ./data:/root/.hermes/data
      - ./logs:/root/.hermes/logs

  caddy:
    image: caddy:2
    container_name: caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config

volumes:
  caddy_data:
  caddy_config:
```

```bash
# 创建必要目录
mkdir -p credentials data logs

# 启动
docker compose up -d

# 查看日志
docker compose logs -f hermes
```

### Caddy 反向代理配置

```bash
# Caddyfile
hermes.example.com {
    reverse_proxy localhost:8642
    encode gzip
}
```

## 八、常用命令速查

| 命令 | 说明 |
|------|------|
| `hermes` | 启动 CLI 交互界面 |
| `hermes model` | 选择/配置 LLM Provider |
| `hermes tools` | 配置启用的工具 |
| `hermes gateway setup` | 配置消息网关 |
| `hermes gateway start` | 启动消息网关 |
| `hermes doctor` | 诊断配置问题 |
| `pm2 logs hermes-agent` | 查看运行日志 |
| `pm2 restart hermes-agent` | 重启 Agent |

## 九、参考资料

- [Hermes Agent 官方文档](https://hermes-agent.nousresearch.com/docs)
- [MiniMax Token Plan 配置](https://platform.minimax.io/docs/token-plan/hermes-agent)
- [飞书/Lark 接入文档](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/feishu)
- [微信接入文档](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/weixin)
- [GitHub 仓库](https://github.com/NousResearch/hermes-agent)

---

> 🚀 部署完成后，你将拥有一个 24/7 在线、自记忆、自进化的 AI 助手，通过飞书或微信随时随地与你交流。MiniMax M2.7 的 200K 上下文窗口可以支撑长程任务，而飞书和微信的接入让 AI 真正融入你的日常工作流。
