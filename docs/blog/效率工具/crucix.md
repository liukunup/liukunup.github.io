---
title: Crucix - 个人智能情报代理
createTime: 2026/06/14 00:00:00
permalink: /blog/crucix/
---

## 概述

[Crucix](https://github.com/calesthio/Crucix) 是一个个人智能情报代理，从多个数据源监控世界变化并在发生变更时及时通知你。

**特点：8K+ Stars · JavaScript · 自托管**

## 核心特性

- **多数据源监控**：支持 OpenSky、ACLED、Telegram、FIRMS、Maritime 等多种数据源
- **变更检测**：自动检测数据变化并生成简报
- **Web 仪表盘**：直观的 Web 界面查看监控状态和历史数据
- **Docker 部署**：一键 Docker Compose 部署
- **自托管**：数据完全本地存储，隐私安全
- **优雅降级**：数据源失败时自动降级，使用最近的非空快照

## 数据源

| 数据源 | 说明 |
|--------|------|
| OpenSky | 空中交通数据，公共 API 可能返回 HTTP 429 |
| ALED | 全球冲突数据 |
| Telegram | 消息监控 |
| FIRMS | 火情监测数据 |
| Maritime | 海事数据 |

## 快速开始

### Docker Compose 部署

```yaml
services:
  crucix:
    build: .
    ports:
      - "${PORT:-3117}:${PORT:-3117}"
    env_file:
      - .env
    volumes:
      - ./runs:/app/runs
    restart: unless-stopped
```

### 环境变量

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑配置
vim .env
```

### 启动服务

```bash
docker-compose up -d
```

访问 `http://localhost:3117` 打开仪表盘。

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Crucix 仪表盘                         │
│                    Web Dashboard                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据处理层                             │
│               变更检测 · 简报生成                           │
└─────────────────────────────────────────────────────────────┘
                              │
    ┌──────────┬──────────┬──────────┬──────────┬──────────┐
    ▼          ▼          ▼          ▼          ▼          ▼
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│OpenSky│  │ACLED │  │Telegram│ │FIRMS │  │Maritime│ │ ... │
└──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘
```

## 安全

- XSS 或 HTML/脚本注入防护
- 混合来源外部内容安全渲染
- 认证和密钥安全处理
- 服务端注入或路径遍历防护
- 依赖链安全问题监控

发现问题请私下报告：celesthioailabs@gmail.com

## 项目结构

```
Crucix/
├── app/              # 主应用代码
├── runs/             # 运行时数据存储
├── docker-compose.yml
├── .env.example
└── docs/
    └── sources/     # 数据源文档
```

## 资源链接

- GitHub：https://github.com/calesthio/Crucix
- 安全报告：celesthioailabs@gmail.com