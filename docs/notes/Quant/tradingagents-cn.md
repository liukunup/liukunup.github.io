---
title: TradingAgents-CN Linux 源码部署指南
createTime: 2026/06/28 22:00:00
permalink: /notes/quant/tradingagents-cn/
tags:
  - AI
  - LLM
  - 多智能体
  - 金融
  - 股票分析
  - Linux
  - TradingAgents
description: 基于多智能体 LLM 的中文金融交易框架 TradingAgents-CN 在 Linux 下的源码部署与使用详解，配合现有 MongoDB 与 Redis 实例，纯 Python 启动。
---

## 引言

[TradingAgents](https://github.com/TauricResearch/TradingAgents) 是由 [Tauric Research](https://github.com/TauricResearch) 团队开源的多智能体金融交易框架，模拟真实交易公司的多角色协作（基本面分析师、技术分析师、情绪分析师、研究员、交易员、风控等），由大语言模型驱动决策与反思。

对于中文用户来说，原版在使用体验、数据源、模型选择、报告输出等方面存在诸多不便。**TradingAgents-CN**（[hsliuping/TradingAgents-CN](https://github.com/hsliuping/TradingAgents-CN)）是基于原版的中文增强版，专为中文用户和 A 股/港股/美股市场做了大量本地化与增强工作。

![Star History](https://api.star-history.dev/svg?repo=hsliuping/TradingAgents-CN&type=Date)

> ⚠️ **重要说明**：本项目仅供学习与研究使用，不提供实盘交易指令，请勿用于真实投资决策。

## 项目亮点

### 中文增强特色

相比原版，TradingAgents-CN 做了大量本地化与功能增强：

- **完整 A 股支持** - 集成 Tushare、AKShare、BaoStock 等国内数据源
- **多 LLM 厂商** - 阿里百炼、DeepSeek、Google AI、OpenAI、硅基流动、智谱等
- **动态供应商管理** - Web 界面可视化添加/管理 LLM 供应商与模型
- **模型选择持久化** - 用户偏好跨会话保存，快速切换不同模型
- **专业报告导出** - 支持 Markdown、Word、PDF 多格式输出
- **智能新闻分析** - 多层次新闻过滤与质量评估
- **完整中文界面** - 前后端全中文，符合国内用户使用习惯

### 核心功能

| 模块 | 功能 |
|------|------|
| **多智能体分析** | 基本面、技术面、情绪面、新闻面多 Agent 协作 |
| **多市场支持** | A 股、港股、美股统一接入 |
| **批量分析** | 多只股票同时分析，提升效率 |
| **自选股管理** | 分组收藏、跟踪管理 |
| **智能筛选** | 基于多维度指标的股票筛选与排序 |
| **模拟交易** | 虚拟交易环境验证策略 |
| **实时通知** | SSE + WebSocket 双通道实时推送 |
| **用户权限** | 完整认证、角色管理、操作日志 |

## 技术架构

`v1.0.0-preview` 起采用前后端分离架构：

| 组件 | 技术栈 |
|------|--------|
| **后端** | FastAPI + Uvicorn + Python 3.10+ |
| **前端** | Vue 3 + Vite + Element Plus |
| **数据库** | MongoDB 4.4+ + Redis 6.0+ |
| **API 架构** | RESTful API + WebSocket |
| **LLM 抽象** | 统一 `llm_clients` 接口，支持多家厂商 |

```
┌─────────────────────────────────────────────────────────────┐
│                  Vue 3 前端 (Port 3000)                     │
│            Element Plus · Vite · TypeScript                 │
└─────────────────────────────────────────────────────────────┘
                              │ HTTP / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI 后端 (Port 8000)                        │
│        多智能体编排 · 报告生成 · 用户管理 · 实时通知         │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────────┐
        │ MongoDB  │    │  Redis   │    │   LLM 厂商   │
        │  数据存储 │    │ 缓存/队列 │    │ DeepSeek等   │
        └──────────┘    └──────────┘    └──────────────┘
```

## 部署方式

项目提供 **两种部署方式**，可根据实际环境选择其一，章节之间相互独立：

| 方式 | 适用场景 | 数据库来源 | 启动入口 |
|------|---------|-----------|----------|
| **方式一：Linux 源码部署** | 已有外部 MongoDB/Redis，需要深度定制或复用现有组件 | 外部现成服务 | `python -m app` |
| **方式二：Docker Compose 部署** | 一键拉起完整隔离环境，适合快速体验或独立部署 | 容器内置 | `docker compose up -d` |

> 💡 **选择建议**：
> - 服务器上 **已经运行 MongoDB/Redis**、希望复用 → 选 **方式一**
> - 服务器 **无现成数据库**，或希望与现有服务完全隔离 → 选 **方式二**
> - 两种方式共享同一份代码与 `.env` 配置项，迁移成本极低

---

## 方式一：Linux 源码部署

本节面向 **Linux 服务器** 环境，假设 **MongoDB 与 Redis 已由运维提供**，我们只需部署应用本体并正确连接即可。

### 系统要求

| 项目 | 最低版本 | 推荐 |
|------|---------|------|
| Python | 3.10+ | 3.10 或 3.11（兼容性最佳） |
| Node.js | 18+ | 20 LTS |
| MongoDB | 4.4+ | 5.0+（外部提供） |
| Redis | 6.0+ | 7+（外部提供） |
| Git | 任意 | 最新版 |
| CPU | 2 核 | 4 核以上 |
| 内存 | 4GB | 8GB 以上 |
| 存储 | 20GB | 50GB |

### 项目结构

```
TradingAgentsCN/
├── app/                   # 后端源码目录
│   ├── main.py            # FastAPI 主应用
│   ├── api/               # API 路由
│   ├── core/              # 核心配置
│   ├── models/            # 数据模型
│   └── services/          # 业务逻辑
├── frontend/              # 前端源码目录
│   ├── package.json       # Node.js 依赖
│   ├── src/               # Vue 3 源码
│   └── vite.config.js     # Vite 配置
├── requirements.txt       # Python 依赖
├── .env.example           # 环境变量模板
└── scripts/               # 初始化脚本
```

### 1. 克隆项目

```bash
git clone https://github.com/hsliuping/TradingAgents-CN.git
cd TradingAgents-CN
```

### 2. 确认外部服务可用

假设 MongoDB 和 Redis 已经在内网或本机运行，请先确认连通性：

```bash
# 测试 MongoDB 连通性（请替换为实际地址）
mongosh "mongodb://admin:tradingagents123@<mongo-host>:27017/admin"

# 测试 Redis 连通性
redis-cli -h <redis-host> -p 6379 -a tradingagents123 ping
```

> 💡 后续配置中的 `<mongo-host>` / `<redis-host>` 请替换为运维实际分配的地址。若数据库为本地运行，可使用 `127.0.0.1` 或 `localhost`。

### 3. 配置后端环境

#### 3.1 创建 Python 虚拟环境

```bash
# 创建虚拟环境（确保 Python 版本在 3.10-3.12 之间）
python3 -m venv venv
source venv/bin/activate

# 验证 Python 版本
python --version
```

#### 3.2 安装 Python 依赖

```bash
# 配置清华镜像加速
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
pip config list

# 安装依赖
pip install -r requirements.txt
```

#### 3.3 配置环境变量

```bash
cp .env.example .env
nano .env
```

在 `.env` 中重点配置以下内容：

```env
# ========== MongoDB（外部实例）==========
MONGODB_URL=mongodb://admin:tradingagents123@<mongo-host>:27017/tradingagents?authSource=admin

# ========== Redis（外部实例）==========
REDIS_URL=redis://:tradingagents123@<redis-host>:6379/0

# ========== API 配置 ==========
API_BASE_URL=http://localhost:8000
CORS_ORIGINS=["http://localhost:3000"]

# ========== LLM 提供商（按需启用）==========
# DeepSeek（推荐，性价比高）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_ENABLED=true

# 阿里百炼
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
DASHSCOPE_ENABLED=false

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_ENABLED=false

# 硅基流动
SILICONFLOW_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
SILICONFLOW_ENABLED=false

# ========== 股票数据源 ==========
DEFAULT_CHINA_DATA_SOURCE=akshare

# Tushare（可选）
TUSHARE_TOKEN=your_tushare_token
TUSHARE_ENABLED=false

# ========== 安全配置（生产环境务必修改）==========
SECRET_KEY=please-change-me-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
REFRESH_TOKEN_EXPIRE_DAYS=30
CSRF_SECRET=please-change-me-in-production
BCRYPT_ROUNDS=12

# ========== 调试与日志 ==========
DEBUG=false
LOG_LEVEL=INFO
```

**连接串格式说明**：

- **MongoDB**：`mongodb://<user>:<password>@<host>:<port>/<database>?authSource=admin`，其中 `authSource=admin` 表示在 admin 数据库中完成认证。
- **Redis**：`redis://:<password>@<host>:<port>/<db>`，空用户名 + 密码的写法。

> ⚠️ **重要提示**：生产环境务必修改 `SECRET_KEY` 和 `CSRF_SECRET`，并使用强密码。

### 4. 配置前端环境

```bash
cd frontend
# 推荐使用 yarn
yarn install
# 或使用 npm
# npm install
cd ..
```

### 5. 初始化数据库

> 🔴 **关键步骤**：首次部署必须执行数据库初始化，否则登录会提示「系统配置缺失」或 API 返回 404。

```bash
# 激活虚拟环境（如果未激活）
source venv/bin/activate

# 导入配置 + 创建默认管理员用户（admin / admin123）
python scripts/import_config_and_create_user.py --host
```

该脚本会完成：

- 导入系统配置数据（LLM 提供商、市场分类、基础参数等）到 MongoDB
- 创建默认管理员用户（用户名 `admin`，密码 `admin123`）
- 初始化基础集合与索引

如果配置文件不存在，可仅创建用户：

```bash
python scripts/import_config_and_create_user.py --create-user-only --host
```

执行成功后可通过 MongoDB 校验：

```bash
mongosh "mongodb://admin:tradingagents123@<mongo-host>:27017/tradingagents?authSource=admin"
> show collections
> db.users.find({ username: "admin" })
```

### 6. 启动应用

#### 6.1 启动后端

```bash
# 激活虚拟环境
source venv/bin/activate

# 启动 FastAPI（监听 0.0.0.0:8000）
python -m app
```

后端启动后默认监听 `http://localhost:8000`，可通过 `/health` 与 `/api/health` 检查状态。

#### 6.2 启动前端

```bash
cd frontend
yarn dev
# 或 npm run dev
```

前端开发服务默认监听 `http://localhost:3000`（或 `5173`，视 Vite 配置而定）。

### 7. 验证安装

```bash
# 后端健康检查
curl http://localhost:8000/api/health
# 预期：{"status":"healthy","timestamp":"..."}

# 检查系统配置（确认数据库初始化成功）
curl http://localhost:8000/api/system/config

# 浏览器访问
# API 文档：  http://localhost:8000/docs
# 前端界面：  http://localhost:3000
```

**默认管理员账号**：

- 用户名：`admin`
- 密码：`admin123`

> ⚠️ **首次登录后请立即修改默认密码！**

---

## 方式二：Docker Compose 部署

> 📌 **本章节与方式一完全独立**，无需在 Linux 上安装 Python 虚拟环境、MongoDB、Redis，所有依赖都通过容器编排拉起。如果已阅读方式一，可直接跳到本节。

### 部署架构

`docker-compose.hub.nginx.yml` 编排了 **5 个容器**（Nginx + 前端 + 后端 + MongoDB + Redis），通过 Nginx 统一对外暴露 `80` 端口：

```
┌─────────────────────────────────────────────────────────────┐
│                   Nginx (宿主机 :80)                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  前端静态资源 (/)                                    │     │
│  │  API 反向代理  (/api → backend:8000)                │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                  │                            │
                  ▼                            ▼
        ┌──────────────────┐         ┌──────────────────┐
        │  frontend        │         │  backend         │
        │  Vue 3 + Nginx   │         │  FastAPI         │
        │  容器 :80        │         │  容器 :8000      │
        └──────────────────┘         └──────────────────┘
                                            │
                          ┌─────────────────┴─────────────────┐
                          ▼                                   ▼
                  ┌──────────────────┐                ┌──────────────────┐
                  │  mongodb         │                │  redis           │
                  │  mongo:4.4       │                │  redis:7-alpine  │
                  │  :27017          │                │  :6379           │
                  │  数据持久化       │                │  缓存加速         │
                  └──────────────────┘                └──────────────────┘
```

用户只需访问 `http://服务器IP` 即可使用完整系统。

### 1. 系统要求

| 项目 | 最低 | 推荐 |
|------|------|------|
| CPU | 2 核 | 4 核+ |
| 内存 | 4 GB | 8 GB+ |
| 磁盘 | 20 GB | 50 GB+ |
| 网络 | 10 Mbps | 100 Mbps+ |
| Docker | 20.10+ | 最新稳定版 |
| Docker Compose | 2.0+ | V2 插件版 |

### 2. 安装 Docker（Linux）

```bash
# Ubuntu / Debian
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动并设开机自启
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户加入 docker 组（避免每次使用 sudo）
sudo usermod -aG docker $USER
newgrp docker

# 验证
docker --version
docker compose version
```

> 镜像拉取慢可参考 [Docker 镜像加速](/blog/mirror_docker_image/)。

### 3. 准备部署目录

```bash
mkdir -p ~/tradingagents-demo && cd ~/tradingagents-demo
```

### 4. 下载部署文件

```bash
# 主 Docker Compose 编排（含 Nginx 反向代理 + 全部服务）
curl -O https://raw.githubusercontent.com/hsliuping/TradingAgents-CN/main/docker-compose.hub.nginx.yml

# 环境变量模板
curl -O https://raw.githubusercontent.com/hsliuping/TradingAgents-CN/main/.env.docker
mv .env.docker .env

# Nginx 反向代理配置
mkdir -p nginx
curl -o nginx/nginx.conf https://raw.githubusercontent.com/hsliuping/TradingAgents-CN/main/nginx/nginx.conf
```

最终目录结构：

```
~/tradingagents-demo/
├── docker-compose.hub.nginx.yml   # Compose 编排
├── .env                           # 环境变量
└── nginx/
    └── nginx.conf                 # 反向代理配置
```

### 5. 编辑 `.env` 配置

`nano .env`，至少配置 **一个 LLM 厂商的 API Key**：

```env
# ========== 必需：至少一个 LLM 提供商 ==========
# DeepSeek（推荐，性价比高）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_ENABLED=true

# 阿里百炼（国产稳定）
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
DASHSCOPE_ENABLED=false

# ========== 股票数据源 ==========
DEFAULT_CHINA_DATA_SOURCE=akshare

# Tushare（可选，专业 A 股数据）
TUSHARE_TOKEN=your_tushare_token
TUSHARE_ENABLED=false
```

> Compose 中 MongoDB / Redis 已被编排进 `tradingagents-network`，**无需手动配置** `MONGODB_HOST` / `REDIS_HOST`，容器之间使用服务名直连。

### 6. 启动服务

```bash
# 拉取镜像（首次约 2~5 分钟）
docker compose -f docker-compose.hub.nginx.yml pull

# 后台启动
docker compose -f docker-compose.hub.nginx.yml up -d

# 查看服务状态（等待所有服务变为 healthy）
docker compose -f docker-compose.hub.nginx.yml ps
```

预期输出：

```
NAME                       STATUS
tradingagents-backend       Up (healthy)
tradingagents-frontend      Up (healthy)
tradingagents-mongodb       Up (healthy)
tradingagents-nginx          Up
tradingagents-redis         Up (healthy)
```

### 7. 初始化数据

> 🔴 **关键步骤**：首次部署必须执行，否则登录会提示「系统配置缺失」。

```bash
docker exec -it tradingagents-backend python scripts/import_config_and_create_user.py
```

脚本会完成：

- 导入系统配置（LLM 厂商、市场分类等）到 MongoDB
- 创建默认管理员用户（`admin` / `admin123`）
- 初始化基础集合与索引

### 8. 访问系统

| 服务 | 地址 | 说明 |
|------|------|------|
| **主入口** | `http://localhost` 或 `http://<服务器IP>` | Nginx 统一入口 |
| **后端 API（直连）** | `http://localhost:8000` | RESTful API |
| **API 文档** | `http://localhost:8000/docs` | Swagger UI |

**默认管理员账号**：

- 用户名：`admin`
- 密码：`admin123`

> ⚠️ **首次登录后请立即修改默认密码！**

### 9. 常用运维命令

```bash
# 查看所有容器状态
docker compose -f docker-compose.hub.nginx.yml ps

# 实时查看后端日志
docker logs -f tradingagents-backend

# 重启服务
docker compose -f docker-compose.hub.nginx.yml restart

# 停止服务（保留数据）
docker compose -f docker-compose.hub.nginx.yml down

# 停止并清理数据卷（⚠️ 慎用，会删除所有数据）
docker compose -f docker-compose.hub.nginx.yml down -v

# 进入后端容器调试
docker exec -it tradingagents-backend bash

# 进入 MongoDB
docker exec -it tradingagents-mongodb mongosh -u admin -p tradingagents123 --authenticationDatabase admin
```

### 10. 端口冲突处理

如果宿主机 `80` 端口被占用（如 Apache、Nginx、IIS），修改 `docker-compose.hub.nginx.yml`：

```yaml
services:
  nginx:
    ports:
      - "8080:80"   # 改为 8080
```

然后访问 `http://localhost:8080`。

### 11. 数据备份

```bash
# 备份 MongoDB 数据卷
docker run --rm \
  -v tradingagents_mongodb_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mongodb_$(date +%Y%m%d).tar.gz /data

# 备份 Redis 数据卷
docker run --rm \
  -v tradingagents_redis_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/redis_$(date +%Y%m%d).tar.gz /data
```

### 12. 更新升级

```bash
# 拉取最新镜像
docker compose -f docker-compose.hub.nginx.yml pull

# 重启服务
docker compose -f docker-compose.hub.nginx.yml up -d
```

---

## 关键配置详解

### LLM 提供商选择

| 提供商 | 价格 | 推荐场景 | 优势 |
|--------|------|---------|------|
| **DeepSeek** | ¥0.001/1k tokens | 日常分析 | 性价比最高 |
| **阿里百炼** | ¥0.002/1k tokens | 生产环境 | 国产稳定 |
| **Google AI** | 免费额度 | 体验试用 | 免费用 |
| **OpenAI** | $0.01/1k tokens | 效果优先 | 效果最好 |
| **硅基流动** | 多种 | 多模型切换 | 模型丰富 |
| **智谱 AI** | 国产 | GLM 系列 | 国产 GLM |

**推荐配置**：日常使用 DeepSeek 即可，成本极低，效果足够；需要更优效果时切换到 GPT-4o 或 Claude。

### 股票数据源

| 数据源 | 覆盖市场 | 费用 | 特点 |
|--------|---------|------|------|
| **AKShare** | A 股为主 | 免费 | 无需密钥，开箱即用 |
| **Tushare** | A 股全面 | 积分制 | 专业数据，需 2000+ 积分 |
| **BaoStock** | A 股历史 | 免费 | 历史 K 线数据 |
| **FinnHub** | 美股 | 免费额度 | 美股数据 |

推荐组合：A 股使用 **AKShare** + 美股使用 **FinnHub**。

### 多代理（NO_PROXY）配置

如果使用代理访问国外 LLM，但需要直连国内数据源（如东方财富），需要配置 `NO_PROXY`：

```env
NO_PROXY=localhost,127.0.0.1,eastmoney.com,push2.eastmoney.com,gtimg.cn,sinaimg.cn,api.tushare.pro,baostock.com
```

### 后端常用环境变量

```env
# 缓存
CACHE_TTL=3600
CACHE_MAX_SIZE=1000

# 日志
LOG_LEVEL=INFO
LOG_FILE=logs/app.log

# 数据库连接池
MONGODB_MAX_POOL_SIZE=100
REDIS_MAX_CONNECTIONS=50
```

## 快速上手使用

### 1. 首次配置检查

启动后访问 `http://localhost:3000`，进入 **配置中心**：

- 添加 LLM 厂商（填写 API Key、Base URL）
- 添加数据源（Tushare Token 等）
- 选择默认模型

### 2. 同步股票数据

> ⚠️ **重要**：在分析股票前，必须先同步数据，否则分析结果会出错。

进入 **数据管理** → **股票数据同步**，选择市场（A 股/港股/美股），点击同步。系统会拉取基础信息、K 线、财务数据等。

### 3. 发起股票分析

进入 **股票分析**：

| 参数 | 推荐选择 | 说明 |
|------|---------|------|
| 股票代码 | `600519`（贵州茅台） | A 股 6 位代码 |
| 港股 | `00700.HK` | 带 `.HK` 后缀 |
| 美股 | `AAPL` | 字母代码 |
| 分析师组合 | 完整分析 | 全部 4 类 Agent |
| 研究深度 | 标准 | 平衡速度与质量 |
| LLM 模型 | DeepSeek | 性价比 |

点击 **开始分析**，等待 3~10 分钟，系统会输出多 Agent 协作报告。

### 4. 查看与导出报告

分析完成后：

- 在线查看：报告详情页
- 导出 PDF：用于存档
- 导出 Word：用于编辑
- 导出 Markdown：用于二次处理

## 常见问题

### 后端启动失败：端口被占用

```bash
# 查找占用 8000 端口的进程
lsof -i :8000

# 终止进程
kill -9 <pid>
```

修改启动端口（启动时指定）：

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Python 依赖安装失败

```bash
# 升级 pip
pip install --upgrade pip

# 清理缓存后重试
pip cache purge
pip install -r requirements.txt --force-reinstall
```

### MongoDB 连接失败

```bash
# 测试连通性
mongosh "mongodb://admin:tradingagents123@<mongo-host>:27017/tradingagents?authSource=admin"

# 检查防火墙
sudo ufw status
sudo iptables -L -n | grep 27017

# 确认 .env 中连接串格式正确（注意 authSource 参数）
```

### Redis 连接失败

```bash
# 测试连通性
redis-cli -h <redis-host> -p 6379 -a tradingagents123 ping

# 确认 .env 中连接串格式（空用户名 + 密码）
# redis://:tradingagents123@<host>:6379/0
```

### 登录时报「系统配置缺失」或 API 404

**根因**：未执行数据库初始化脚本。

```bash
source venv/bin/activate
python scripts/import_config_and_create_user.py --host
```

如果脚本找不到配置文件，使用：

```bash
python scripts/import_config_and_create_user.py --create-user-only --host
```

验证：

```bash
curl http://localhost:8000/api/system/config
# 应返回 JSON 配置信息，而非 404
```

### 默认用户 admin/admin123 无法登录

1. 确认初始化脚本已执行：`python scripts/import_config_and_create_user.py --host`
2. 检查用户是否存在：
   ```bash
   mongosh "mongodb://admin:tradingagents123@<mongo-host>:27017/tradingagents?authSource=admin"
   > use tradingagents
   > db.users.find({ username: "admin" })
   ```
3. 不存在则重建：
   ```bash
   python scripts/import_config_and_create_user.py --create-user-only --host
   ```

### API Key 无效

1. 检查复制是否有空格或换行
2. 确认账户有足够余额
3. 部分厂商需要在 `.env` 中显式启用（`XXX_ENABLED=true`）

### 分析速度慢

- 切换到更快的模型（如 DeepSeek V3 Flash）
- 降低研究深度（浅度 / 轻度）
- 关闭不需要的分析师（只保留 1~2 个）

### 前端构建失败

```bash
# 检查 Node.js 版本
node --version

# 内存不足时增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
yarn dev
```

## 生产部署建议

### 以 systemd 托管后端

创建 `/etc/systemd/system/tradingagents.service`：

```ini
[Unit]
Description=TradingAgents-CN Backend
After=network.target

[Service]
Type=simple
User=trading
WorkingDirectory=/opt/TradingAgents-CN
Environment="PATH=/opt/TradingAgents-CN/venv/bin"
ExecStart=/opt/TradingAgents-CN/venv/bin/python -m app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

启用：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now tradingagents
sudo systemctl status tradingagents
```

### Nginx 反向代理（可选）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

### 数据备份

```bash
# 备份 MongoDB
mongodump --uri "mongodb://admin:tradingagents123@<mongo-host>:27017/tradingagents?authSource=admin" \
          --out ./backup/$(date +%Y%m%d)

# 备份 Redis
redis-cli -h <redis-host> -a tradingagents123 SAVE
```

## 注意事项

1. **合规使用** - 本项目仅供学习研究，不提供实盘交易信号
2. **数据准确性** - AI 分析结果仅供参考，投资决策请结合自身判断
3. **API 成本** - 频繁分析会消耗大量 Token，注意控制预算
4. **混合许可** - `app/`（后端）与 `frontend/`（前端）需商业授权，开源部分采用 Apache 2.0
5. **官方渠道** - 仅 [GitHub 仓库](https://github.com/hsliuping/TradingAgents-CN) 为唯一官方渠道，注意识别未经授权的第三方网站

## 总结

本文档针对 Linux 服务器 + 现成 MongoDB/Redis 的部署场景，给出了从克隆、配置、初始化到 systemd 托管的完整流程。核心要点：

1. 始终使用 `python scripts/import_config_and_create_user.py --host` 完成数据库初始化
2. `.env` 中连接外部 MongoDB/Redis 时，注意认证参数（`authSource`、空用户名写法）
3. 生产环境务必修改默认密码与 `SECRET_KEY`

无论是想学习多智能体 LLM 应用的架构设计，还是希望搭建自己的股票分析研究环境，TradingAgents-CN 都是一个值得尝试的开源项目。

---

**相关链接**：

- GitHub: [hsliuping/TradingAgents-CN](https://github.com/hsliuping/TradingAgents-CN)
- 原版: [TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents)
- 论文: *TradingAgents: Multi-Agents LLM Financial Trading Framework*
- 公众号: 微信搜索 `TradingAgents-CN`
