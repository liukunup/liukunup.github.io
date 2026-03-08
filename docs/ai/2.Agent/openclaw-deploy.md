---
title: OpenClaw 部署指南
createTime: 2026/03/08 23:16:00
permalink: /ai/agent/openclaw-deploy/
---

# OpenClaw 部署指南

## 什么是 OpenClaw？

OpenClaw 是一个开源的个人 AI 助手平台，支持本地部署、连接多种大语言模型（Claude、OpenAI 等），并可通过 WhatsApp、Telegram、Discord 等消息平台进行交互。

## 系统要求

| 配置项 | 最低要求 | 推荐配置 |
| :--- | :--- | :--- |
| 内存 | 8GB | 16GB |
| 存储 | 10GB | 20GB |
| Node.js | v22+ | v22+ (最新 LTS) |
| 操作系统 | Win 10 (WSL2) / macOS 12 / Ubuntu 20.04 | 最新稳定版 |

## 安装方式

### 方式一：安装脚本（推荐）

这是最快速的安装方式，脚本会自动检测并安装 Node.js 22。

**macOS / Linux / WSL2：**

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

**Windows (PowerShell)：**

```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

如需跳过 onboarding 步骤：

```bash
# macOS / Linux
curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard

# Windows
& ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -NoOnboard
```

安装器支持两种安装方式：
- `npm`（默认）：`npm install -g openclaw@latest`
- `git`：从 GitHub 克隆/构建并从源代码运行

常用安装器标志：
- `--install-method npm|git` - 指定安装方式
- `--git-dir` - Git 目录（默认：`~/openclaw`）
- `--no-git-update` - 使用现有 checkout 时跳过 `git pull`
- `--no-prompt` - 禁用提示（CI/自动化中必需）
- `--dry-run` - 打印将要执行的操作，但不做任何更改

### 方式二：npm / pnpm 手动安装

如果你已安装 Node.js 22+，可使用 npm 或 pnpm 手动安装：

**npm：**

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

> **Note**: 如果遇到 `sharp` 构建错误，可尝试：
> ```bash
> SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
> ```

**pnpm：**

```bash
pnpm add -g openclaw@latest
pnpm approve-builds -g  # 批准构建脚本
pnpm add -g openclaw@latest # 重新运行以执行 postinstall 脚本
openclaw onboard --install-daemon
```

### 方式三：源码构建

适用于开发者或需要深度定制的用户：

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm ui:build  # 首次运行时自动安装 UI 依赖
pnpm build
pnpm link --global
openclaw onboard --install-daemon
```

### 方式四：Docker 部署

Docker 是**可选的**。仅当你想要容器化的 Gateway 或在没有本地安装的主机上运行 OpenClaw 时使用。

#### 快速启动（推荐）

```bash
./docker-setup.sh
```

该脚本会：
- 构建 Gateway 镜像
- 运行 onboarding 向导
- 启动 Gateway
- 生成 token 并写入 `.env`

完成后：
- 在浏览器中打开 `http://127.0.0.1:18789/`
- 将令牌粘贴到控制 UI（设置 → token）

#### 手动流程（compose）

```bash
docker build -t openclaw:local -f Dockerfile .
docker compose run --rm openclaw-cli onboard
docker compose up -d openclaw-gateway
```

#### 使用预构建镜像

```bash
export OPENCLAW_IMAGE="ghcr.io/openclaw/openclaw:latest"
./docker-setup.sh
```

常用镜像标签：
- `main` - 最新构建
- `<版本号>` - 如 `2026.2.26`
- `latest` - 最新稳定版

#### 常用环境变量

| 变量 | 说明 |
| :--- | :--- |
| `OPENCLAW_IMAGE` | 使用远程镜像替代本地构建 |
| `OPENCLAW_SANDBOX` | 启用 Agent 沙箱 (`1`, `true`, `yes`, `on`) |
| `OPENCLAW_HOME_VOLUME` | 持久化容器内的 `/home/node` 到命名卷 |
| `OPENCLAW_EXTRA_MOUNTS` | 添加额外的宿主机绑定挂载 |
| `OPENCLAW_DOCKER_APT_PACKAGES` | 在构建期间安装额外的 apt 包 |

#### 额外挂载

如果你想将额外的主机目录挂载到容器中：

```bash
export OPENCLAW_EXTRA_MOUNTS="$HOME/.codex:/home/node/.codex:ro,$HOME/github:/home/node/github:rw"
./docker-setup.sh
```

#### 持久化容器 home

如果你想让 `/home/node` 在容器重建后持久化：

```bash
export OPENCLAW_HOME_VOLUME="openclaw_home"
./docker-setup.sh
```

#### 渠道配置

WhatsApp（QR）：
```bash
docker compose run --rm openclaw-cli channels login
```

Telegram（bot token）：
```bash
docker compose run --rm openclaw-cli channels add --channel telegram --token ""
```

Discord（bot token）：
```bash
docker compose run --rm openclaw-cli channels add --channel discord --token ""
```

#### 健康检查

```bash
# 简单健康检查
curl -fsS http://127.0.0.1:18789/healthz
curl -fsS http://127.0.0.1:18789/readyz

# 详细健康状态
docker compose exec openclaw-gateway node dist/index.js health --token "$OPENCLAW_GATEWAY_TOKEN"
```

#### 权限问题

容器以 `node` (uid 1000) 用户运行，确保宿主机挂载目录的权限：

```bash
sudo chown -R 1000:1000 /path/to/openclaw-config /path/to/openclaw-workspace
```

## Agent 沙箱（可选）

当启用 `agents.defaults.sandbox` 时，**非主会话**在 Docker 容器内运行工具。Gateway 保持在你的主机上，但工具执行是隔离的。

### 启用沙箱

```bash
export OPENCLAW_SANDBOX=1
./docker-setup.sh
```

### 配置选项

```json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "non-main",  // off | non-main | all
        "scope": "agent",    // session | agent | shared
        "workspaceAccess": "none",  // none | ro | rw
        "docker": {
          "image": "openclaw-sandbox:bookworm-slim",
          "network": "none",
          "memory": "1g",
          "memorySwap": "2g",
          "cpus": 1,
          "setupCommand": "apt-get update && apt-get install -y git curl jq"
        },
        "prune": {
          "idleHours": 24,
          "maxAgeDays": 7
        }
      }
    }
  }
}
```

### 默认行为

- **镜像**: `openclaw-sandbox:bookworm-slim`
- **容器**: 每个 Agent 一个容器
- **网络**: 默认为 `none`（无出站）
- **自动清理**: 空闲 > 24h 或 年龄 > 7d

### 工具策略

- **默认允许**: `exec`, `process`, `read`, `write`, `edit`, `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `session_status`
- **默认拒绝**: `browser`, `canvas`, `nodes`, `cron`, `discord`, `gateway`

### 沙箱浏览器镜像

要在沙箱内运行浏览器工具：

```bash
scripts/sandbox-browser-setup.sh
```

配置：
```json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "browser": {
          "enabled": true
        }
      }
    }
  }
}
```

## VPS / 云端部署

### 推荐 VPS 提供商

- **Railway** - 一键部署
- **Northflank** - 一键部署
- **Oracle Cloud** - 永久免费
- **Hetzner** - 性价比高
- **Fly.io** - 现代化容器部署
- **AWS (EC2/Lightsail)** - 企业级支持
- **GCP (Compute Engine)** - 稳定可靠

### 云部署工作原理

- Gateway 运行在 VPS 上并拥有状态 + 工作区
- 你通过控制 UI 或 Tailscale/SSH 从笔记本电脑/手机连接
- 将 VPS 视为数据源并备份状态 + 工作区

### 安全建议

- **绑定模式**: 建议将 Gateway 绑定到 loopback，通过 SSH 隧道访问
- **Token 保护**: 如需公开访问，必须配置 `gateway.auth.token` 或 `gateway.auth.password`
- **定期备份**: 备份 `~/.openclaw` 和 `~/.openclaw/workspace` 目录
- **防火墙**: 仅开放必要端口

### Hetzner VPS 部署示例

1. **创建 VPS**: 选择 Ubuntu 22.04 LTS，2 vCPU / 4GB RAM
2. **安装 Docker**:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
3. **克隆仓库**:
   ```bash
   git clone https://github.com/openclaw/openclaw.git
   cd openclaw
   ```
4. **配置并启动**:
   ```bash
   export OPENCLAW_SANDBOX=1
   ./docker-setup.sh
   ```

## 常用命令

| 命令 | 说明 |
| :--- | :--- |
| `openclaw doctor` | 检查配置问题 |
| `openclaw status` | 查看 Gateway 状态 |
| `openclaw health` | 查看健康状态 |
| `openclaw dashboard` | 打开浏览器控制台 |
| `openclaw gateway start` | 启动 Gateway |
| `openclaw gateway stop` | 停止 Gateway |
| `openclaw message send` | 发送测试消息 |

## 安装后

- 运行新手引导：`openclaw onboard --install-daemon`
- 快速检查：`openclaw doctor`
- 检查 Gateway 健康状态：`openclaw status` + `openclaw health`
- 打开仪表板：`openclaw dashboard`

## 故障排除

### `openclaw` 命令找不到

```bash
# 诊断
node -v
npm -v
npm prefix -g

# 修复 (添加到 shell 配置文件)
export PATH="$(npm prefix -g)/bin:$PATH"
```

### Docker 权限问题

容器以 `node` (uid 1000) 用户运行，确保宿主机挂载目录的权限：

```bash
sudo chown -R 1000:1000 /path/to/openclaw-config /path/to/openclaw-workspace
```

### 端口占用

默认端口为 18789，如被占用可通过 `--port` 参数指定其他端口：

```bash
openclaw gateway --port 18790
```

### 控制 UI 授权问题

如果你看到 "unauthorized" 或 "disconnected (1008): pairing required"：

```bash
docker compose run --rm openclaw-cli dashboard --no-open
docker compose run --rm openclaw-cli devices list
docker compose run --rm openclaw-cli devices approve <device-id>
```

## 更新与卸载

### 更新 OpenClaw

```bash
# 使用安装脚本重新安装
curl -fsSL https://openclaw.ai/install.sh | bash

# 或通过 npm
npm install -g openclaw@latest
```

### 卸载 OpenClaw

```bash
npm uninstall -g openclaw

# 如需彻底清除配置
rm -rf ~/.openclaw
```

## 相关资源

- [官方文档](https://docs.openclaw.ai/zh-CN/)
- [GitHub 仓库](https://github.com/openclaw/openclaw)
- [Docker 部署详解](https://docs.openclaw.ai/zh-CN/install/docker)

## 模型提供商配置

### Ollama（本地模型）

Ollama 是一个本地 LLM 运行时，可以轻松在机器上运行开源模型。

**安装 Ollama 并拉取模型：**
```bash
ollama pull llama3.3
ollama pull qwen2.5-coder:32b
ollama pull deepseek-r1:32b
```

**启用 Ollama：**
```bash
export OLLAMA_API_KEY="ollama-local"
# 或
openclaw config set models.providers.ollama.apiKey "ollama-local"
```

**配置模型：**
```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "ollama/llama3.3",
        "fallbacks": ["ollama/qwen2.5-coder:32b"]
      }
    }
  }
}
```

**查看模型列表：**
```bash
ollama list
openclaw models list
```

> **Note**: OpenClaw 会自动发现支持工具调用的模型。

### Qwen（通义千问）

Qwen 提供免费层 OAuth 流程（每天 2,000 次请求）。

**启用插件：**
```bash
openclaw plugins enable qwen-portal-auth
```

**登录认证：**
```bash
openclaw models auth login --provider qwen-portal --set-default
```

**使用模型：**
```bash
openclaw models set qwen-portal/coder-model
```

模型 ID：
- `qwen-portal/coder-model`
- `qwen-portal/vision-model`

### NVIDIA NGC

NVIDIA 提供多种 AI 模型，可通过 Ngc 平台部署。

访问 [NVIDIA Build](https://build.nvidia.com/models) 获取更多模型。

---

## 相关资源

- [官方文档](https://docs.openclaw.ai/zh-CN/)
- [GitHub 仓库](https://github.com/openclaw/openclaw)
- [Docker 部署](https://docs.openclaw.ai/zh-CN/install/docker)
- [VPS 托管](https://docs.openclaw.ai/zh-CN/vps)
- [飞书渠道](https://docs.openclaw.ai/zh-CN/channels/feishu)
- [ClawHub](https://docs.openclaw.ai/zh-CN/tools/clawhub)
- [Ollama 提供商](https://docs.openclaw.ai/zh-CN/providers/ollama)
- [Qwen 提供商](https://docs.openclaw.ai/zh-CN/providers/qwen)
- [NVIDIA Models](https://build.nvidia.com/models)
