---
title: Sub2API 一站式开源 AI API 中转服务
createTime: 2026/04/05 20:43:36
permalink: /blog/h3sf53on/
tags:
  - AI
  - API Gateway
  - Open Source
  - Claude
  - OpenAI
---

## 引言

如果你正在使用 Claude、OpenAI、Gemini 或 Antigravity 的订阅服务，却苦恼于配额管理和成本分摊，**Sub2API** 或许正是你需要的解决方案。

[Sub2API](https://github.com/Wei-Shaw/sub2api) 是一个开源的 AI API 网关平台，专门用于分发和管理 AI 产品订阅的 API 配额。用户通过平台生成的 API Key 调用上游 AI 服务，平台负责鉴权、计费、负载均衡和请求转发。

![Sub2API Star History](https://api.star-history.dev/svg?repo=Wei-Shaw/sub2api&type=Date)

## 核心特性

### 多账号统一接入

Sub2API 支持多种上游账号类型：

- **OAuth 授权** - 支持 Google、GitHub 等 OAuth 登录
- **API Key 直连** - 支持原生 API Key 配置

无论是哪种方式，平台都能统一管理、灵活调度。

### 智能调度与粘性会话

平台内置智能账号选择算法，支持**粘性会话（Sticky Session）**，确保同一会话的请求路由到同一账号，避免上下文断裂。

### 精细化计费

- **Token 级用量追踪** - 精确到每一个 Token 的消耗
- **实时成本计算** - 按模型、账号分组统计
- **拼车共享** - 多用户共享订阅配额，成本分摊更高效

### 并发与限流控制

- **单用户并发限制** - 防止单一用户耗尽资源
- **单账号并发限制** - 保护上游账号稳定性
- **请求速率限制** - 可配置 QPS 上限
- **Token 速率限制** - 按输入/输出 Token 分别限流

### 管理后台

提供完整的 Web 管理界面：

- 用户管理
- 账号池管理
- 用量监控
- 财务报表
- 系统配置

还支持通过 iframe 嵌入外部系统（如支付、工单），轻松扩展功能。

## 技术架构

| 组件 | 技术栈 |
|------|--------|
| 后端 | Go 1.25.7, Gin, Ent ORM |
| 前端 | Vue 3.4+, Vite 5+, TailwindCSS |
| 数据库 | PostgreSQL 15+ |
| 缓存/队列 | Redis 7+ |
| 部署 | Docker |

整体架构简洁高效，适合自建或私有部署。

## 快速部署

### 方式一：一键脚本（推荐）

```bash
curl -sSL https://raw.githubusercontent.com/Wei-Shaw/sub2api/main/deploy/install.sh | sudo bash
```

安装完成后访问 `http://YOUR_SERVER_IP:8080` 进入引导配置。

### 方式二：Docker Compose

```bash
# 创建部署目录
mkdir -p sub2api-deploy && cd sub2api-deploy

# 下载部署脚本
curl -sSL https://raw.githubusercontent.com/Wei-Shaw/sub2api/main/deploy/docker-deploy.sh | bash

# 启动服务
docker compose up -d
```

### 方式三：源码构建

```bash
git clone https://github.com/Wei-Shaw/sub2api.git
cd sub2api

# 构建前端
cd frontend && pnpm install && pnpm run build && cd ..

# 构建后端（嵌入前端）
cd backend
go build -tags embed -o sub2api ./cmd/server

# 配置并运行
cp ../deploy/config.example.yaml ./config.yaml
./sub2api
```

## API 使用示例

获取 API Key 后，即可通过标准 OpenAI 兼容格式调用：

```bash
# OpenAI 兼容格式
curl https://your-sub2api-domain/v1/chat/completions \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"model": "claude-sonnet-4-20250514", "messages": [{"role": "user", "content": "Hello"}]}'

# Claude 直连格式
curl https://your-sub2api-domain/antigravity/v1/messages \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"model": "claude-sonnet-4-20250514", "messages": [{"role": "user", "content": "Hello"}]}'
```

### Claude Code 配置

```bash
export ANTHROPIC_BASE_URL="http://localhost:8080/antigravity"
export ANTHROPIC_AUTH_TOKEN="sk-xxx"
anthropic claude
```

## 生态系统

Sub2API 周边生态不断完善：

| 项目 | 功能 |
|------|------|
| [Sub2ApiPay](https://github.com/Wei-Shaw/sub2api-pay) | 自助支付系统，支持微信、支付宝、Stripe |
| [sub2api-mobile](https://github.com/Wei-Shaw/sub2api-mobile) | 移动端管理App（iOS/Android/Web） |

## 注意事项

> ⚠️ **服务风险提示**：使用本项目可能违反 Anthropic 等服务商的使用条款。请在使用前仔细阅读相关用户协议，因使用本项目导致的账号封禁、服务中断等风险由用户自行承担。

> 本项目仅供技术学习与研究使用，作者不对任何因使用本项目造成的损失负责。

## 结语

Sub2API 为个人开发者和小型团队提供了一个优雅的解决方案：将分散的 AI 订阅账号统一管理，通过 API Key 分发给团队成员或用户，实现配额共享和成本分摊。如果你有多账号管理需求，不妨一试。

**GitHub**: [Wei-Shaw/sub2api](https://github.com/Wei-Shaw/sub2api)  
**官网**: [sub2api.org](https://sub2api.org)  
**演示**: [demo.sub2api.org](https://demo.sub2api.org)（账号: `admin@sub2api.org` / `admin123`）
