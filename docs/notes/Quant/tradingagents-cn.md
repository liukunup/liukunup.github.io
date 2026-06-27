---
title: TradingAgents-CN 中文增强版部署与使用指南
createTime: 2026/06/26 22:00:00
permalink: /notes/quant/tradingagents-cn/
tags:
  - AI
  - LLM
  - 多智能体
  - 金融
  - 股票分析
  - Docker
  - TradingAgents
description: 基于多智能体 LLM 的中文金融交易框架 TradingAgents-CN 的部署与使用详解，包括 Docker 部署、源码部署、配置、首次使用与常见问题。
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
- **Docker 多架构** - 一键部署，支持 amd64 / arm64（Apple Silicon、树莓派）
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

`v1.0.1` 版本完成了从 Streamlit 单体应用到现代前后端分离架构的全面升级：

| 组件 | 技术栈 |
|------|--------|
| **后端** | FastAPI + Uvicorn + Python 3.10+ |
| **前端** | Vue 3 + Vite + Element Plus |
| **数据库** | MongoDB 4.4+ + Redis 7+ |
| **API 架构** | RESTful API + WebSocket |
| **部署** | Docker Compose 多架构支持 |
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

## 三种部署方式

项目提供 **绿色版**（仅 Windows）、**Docker 版**、**源码版** 三种部署方式，下面重点介绍后两种通用方案。

### 方式一：Docker 部署（推荐）

Docker 部署是最稳定、最通用的方案，支持 macOS、Linux、Windows 上的所有平台。

#### 1. 环境准备

确保已安装 [Docker](https://www.docker.com/) 与 Docker Compose：

```bash
docker --version
docker compose version
```

#### 2. 创建部署目录

```bash
mkdir -p ~/tradingagents-cn && cd ~/tradingagents-cn
```

#### 3. 下载配置文件

```bash
curl -O https://raw.githubusercontent.com/hsliuping/TradingAgents-CN/main/docker-compose.yml
curl -O https://raw.githubusercontent.com/hsliuping/TradingAgents-CN/main/.env.example
mv .env.example .env
```

#### 4. 编辑 `.env` 配置

至少配置 **数据库连接** 与 **一个 LLM 厂商的 API Key**：

```env
# ========== 必需：MongoDB ==========
MONGODB_HOST=mongodb
MONGODB_PORT=27017
MONGODB_USERNAME=admin
MONGODB_PASSWORD=tradingagents123
MONGODB_DATABASE=tradingagents
MONGODB_AUTH_SOURCE=admin

# ========== 必需：Redis ==========
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=tradingagents123

# ========== 必需：安全密钥 ==========
# 生产环境务必修改为随机字符串
JWT_SECRET=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
CSRF_SECRET=$(python -c "import secrets; print(secrets.token_urlsafe(32))")

# ========== 至少配置一个 LLM 提供商 ==========
# DeepSeek（推荐，性价比高）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_ENABLED=true

# 阿里百炼（国产稳定）
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx

# ========== 股票数据源 ==========
DEFAULT_CHINA_DATA_SOURCE=akshare

# Tushare（专业 A 股数据，可选）
TUSHARE_TOKEN=your_tushare_token
TUSHARE_ENABLED=false
```

#### 5. 启动服务

```bash
docker compose up -d
```

第一次启动会拉取镜像并构建，可能需要 5~10 分钟。查看日志：

```bash
docker compose logs -f backend
```

#### 6. 访问服务

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端界面** | http://localhost:3000 | 主应用入口 |
| **后端 API** | http://localhost:8000 | RESTful API |
| **API 文档** | http://localhost:8000/docs | Swagger UI |
| **健康检查** | http://localhost:8000/api/health | 服务状态 |

**默认管理员账号**：

- 用户名：`admin`
- 密码：`admin123`

> ⚠️ **首次登录后请立即修改默认密码！**

#### 7. 常用运维命令

```bash
# 查看所有容器状态
docker compose ps

# 查看后端日志
docker compose logs -f backend

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 停止并清理数据卷（慎用）
docker compose down -v

# 进入后端容器调试
docker compose exec backend bash
```

### 方式二：源码部署

适合需要深度定制的开发者。

#### 1. 安装基础依赖

- Python 3.10+
- MongoDB 4.4+
- Redis 6.2+
- Node.js 18+（前端构建）

#### 2. 克隆代码

```bash
git clone https://github.com/hsliuping/TradingAgents-CN.git
cd TradingAgents-CN
```

#### 3. 后端启动

```bash
# 创建虚拟环境
python -m venv env
source env/bin/activate  # Windows: env\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 复制并编辑环境配置
cp .env.example .env
nano .env

# 初始化数据库
python scripts/import_config_and_create_user.py

# 启动 FastAPI 后端
python -m app
```

后端默认监听 `http://localhost:8000`，API 文档位于 `/docs`。

#### 4. 前端启动

```bash
cd frontend
pnpm install  # 或 npm install
pnpm dev      # 开发模式
# 或
pnpm build    # 生产构建
```

开发模式默认监听 `http://localhost:5173`。

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

> Windows 不支持通配符 `*`，必须使用完整域名。

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

### 启动失败 / 端口被占用

修改 `docker-compose.yml` 中的端口映射：

```yaml
services:
  backend:
    ports:
      - "8001:8000"  # 改为 8001
  frontend:
    ports:
      - "3001:80"    # 改为 3001
```

### MongoDB 连接失败

```bash
# Docker 环境
docker compose logs mongodb

# 确认 mongodb 健康状态
docker compose ps
```

### API Key 无效

1. 检查复制是否有空格或换行
2. 确认账户有足够余额
3. 部分厂商需要在 `provider` 配置页面启用（`XXX_ENABLED=true`）

### 分析速度慢

- 切换到更快的模型（如 DeepSeek V3 Flash）
- 降低研究深度（浅度 / 轻度）
- 关闭不需要的分析师（只保留 1~2 个）

### 镜像拉取慢

参考之前的 [Docker 镜像加速](/blog/mirror_docker_image/) 配置镜像加速器，或在 `.env` 中加入：

```env
DOCKER_REGISTRY_MIRROR=https://your-mirror.com
```

## 注意事项

1. **合规使用** - 本项目仅供学习研究，不提供实盘交易信号
2. **数据准确性** - AI 分析结果仅供参考，投资决策请结合自身判断
3. **API 成本** - 频繁分析会消耗大量 Token，注意控制预算
4. **混合许可** - `app/`（后端）与 `frontend/`（前端）需商业授权，开源部分采用 Apache 2.0
5. **官方渠道** - 仅 [GitHub 仓库](https://github.com/hsliuping/TradingAgents-CN) 为唯一官方渠道，注意识别未经授权的第三方网站

## 总结

TradingAgents-CN 是在原版 TradingAgents 基础上，针对中文用户精心打磨的多智能体金融分析平台。它解决了原版在国内使用的数据源、模型、界面三大痛点，同时通过 Docker 多架构、动态供应商管理、专业报告导出等特性，提供了生产可用的完整体验。

无论是想学习多智能体 LLM 应用的架构设计，还是希望搭建自己的股票分析研究环境，TradingAgents-CN 都是一个值得尝试的开源项目。

---

**相关链接**：

- GitHub: [hsliuping/TradingAgents-CN](https://github.com/hsliuping/TradingAgents-CN)
- 原版: [TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents)
- 论文: *TradingAgents: Multi-Agents LLM Financial Trading Framework*
- 公众号: 微信搜索 `TradingAgents-CN`
