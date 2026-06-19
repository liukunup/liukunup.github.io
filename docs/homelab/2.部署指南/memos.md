---
title: Memos
tags:
  - Memos
createTime: 2025/12/15 11:34:57
updateTime: 2026/06/19 00:00:00
permalink: /homelab/deploy/memos/
---

## 🚀 部署指南

### Docker 快速启动

```bash
docker run -d \
  --name memos \
  --restart unless-stopped \
  -p 5230:5230 \
  -v ~/.memos:/var/opt/memos \
  neosmemo/memos:stable
```

### Docker Compose（推荐用于生产环境）

::: tabs

@tab:active 基础配置

```yaml
services:
  memos:
    image: neosmemo/memos:stable
    container_name: memos
    restart: unless-stopped
    ports:
      - "5230:5230"
    volumes:
      - ./data:/var/opt/memos
    environment:
      MEMOS_PORT: 5230
      MEMOS_DRIVER: sqlite
      MEMOS_INSTANCE_URL: https://memos.example.com
```

@tab 带数据库（MySQL）

```yaml
services:
  memos:
    image: neosmemo/memos:stable
    container_name: memos
    restart: unless-stopped
    ports:
      - "5230:5230"
    volumes:
      - ./data:/var/opt/memos
    environment:
      MEMOS_PORT: 5230
      MEMOS_DRIVER: mysql
      MEMOS_DSN: "user:password@tcp(mysql-host:3306)/memos"
```

@tab 带数据库（PostgreSQL）

```yaml
services:
  memos:
    image: neosmemo/memos:stable
    container_name: memos
    restart: unless-stopped
    ports:
      - "5230:5230"
    volumes:
      - ./data:/var/opt/memos
    environment:
      MEMOS_PORT: 5230
      MEMOS_DRIVER: postgres
      MEMOS_DSN: "postgres://user:password@postgres:5432/memos?sslmode=disable"
```

@tab 带 Caddy 反向代理（HTTPS）

```yaml
services:
  memos:
    image: neosmemo/memos:stable
    container_name: memos
    restart: unless-stopped
    volumes:
      - ./memos-data:/var/opt/memos
    networks:
      - memos-net

  caddy:
    image: caddy:2
    container_name: memos-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./caddy-data:/data
      - ./caddy-config:/config
    networks:
      - memos-net

networks:
  memos-net:
```

对应的 Caddyfile：

```caddy
memos.example.com {
  reverse_proxy memos:5230
}
```

:::

**启动命令：**

```bash
docker compose up -d
```

**常用操作命令：**

```bash
docker compose logs -f    # 查看日志
docker compose down       # 停止服务
docker compose pull       # 拉取最新镜像
docker compose up -d      # 重启服务
```

## 📝 配置说明

### 端口与访问

- **端口**: 默认监听 `5230` 端口
- **访问**: 浏览器打开 `http://<host_ip>:5230` 即可进入 Web 界面，首次访问需注册管理员账号
- **HTTPS**: 推荐通过 Caddy/Nginx 反向代理实现

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `MEMOS_PORT` | `5230` | HTTP 监听端口 |
| `MEMOS_ADDR` | `` | 绑定地址（空 = 所有接口） |
| `MEMOS_DATA` | `/var/opt/memos` | 数据目录 |
| `MEMOS_DRIVER` | `sqlite` | 数据库类型：`sqlite`、`mysql`、`postgres` |
| `MEMOS_DSN` | auto | 数据库连接字符串 |
| `MEMOS_INSTANCE_URL` | `` | 公开访问的实例 URL |
| `MEMOS_DEMO` | `false` | 演示模式 |
| `MEMOS_ALLOW_PRIVATE_WEBHOOKS` | `false` | 允许私有 IP 范围的 Webhook |
| `MEMOS_LOG_LEVEL` | `info` | 日志级别：`debug`、`info`、`warn`、`error` |

### 数据持久化

- 容器内的 `/var/opt/memos` 目录包含 SQLite 数据库和附件文件
- 需挂载出来以防数据丢失
- 支持 MySQL/PostgreSQL 作为后端数据库

### Docker 镜像标签

| 标签 | 说明 |
|------|------|
| `stable` | ✅ **推荐** - 生产环境最安全 |
| `0.29.1` | 版本锁定部署 |
| `0.29` | 最新补丁版本 |
| `latest` | 开发版，不推荐生产环境 |

### 升级指南

```bash
docker pull neosmemo/memos:stable
docker stop memos
docker rm memos
docker run -d \
  --name memos \
  --restart unless-stopped \
  -p 5230:5230 \
  -v ~/.memos:/var/opt/memos \
  neosmemo/memos:stable
```

> **重要**: 升级前建议备份数据目录。重大版本（如 v0.27.0 → v0.28.0）可能包含数据库迁移。

## ✨ 新功能（v0.27.0+）

| 功能 | 说明 |
|------|------|
| **MCP Server** | 内置 MCP 端点（`/mcp`），支持 PAT 认证，提供 Memo CRUD、评论、附件等 API |
| **Server-Sent Events** | Web 端实时刷新，连接状态指示器 |
| **SSO 账户链接** | 外部身份提供商链接到本地用户而非作为本地用户名 |
| **实时预览刷新** | Memo、评论、反应变化自动推送到 Web 界面 |
| **安全加固** | 跨 Tab Token 同步刷新、会话恢复、敏感信息写入保护 |

## 📱 客户端

### iOS

[**Moe Memos**](https://apps.apple.com/app/id1645288588) - 功能最完善的第三方客户端

- ✅ 免费下载
- ✅ Markdown 编辑
- ✅ 图片/视频上传
- ✅ 标签管理
- ✅ 离线使用
- ✅ 深色模式
- ✅ 桌面小组件
- ✅ Share Sheet 快速保存

### Android

[**Memos Android**](https://github.com/memos-wm/memos-android) - 开源 Android 客户端

> **版本兼容性**：Memos 更新可能导致 API 变化，不同版本对客户端要求如下：
>
> | Memos 服务器版本 | Moe Memos 兼容性 |
> |---|---|
> | v0.27.0 及以上 | ✅ 兼容（需使用较新版本客户端） |
> | v0.22.0 - v0.26.2 | ❌ 不再支持，建议升级服务器或寻找旧版客户端 |
> | v0.21.0 及更早 | ✅ 兼容 |

## 🔗 相关资源

| 资源 | 链接 |
|------|------|
| GitHub | [usememos/memos](https://github.com/usememos/memos) |
| Docker Hub | [neosmemo/memos](https://hub.docker.com/r/neosmemo/memos) |
| 官方文档 | [usememos.com/docs](https://usememos.com/docs/deploy) |
| 最新版本 | [v0.29.1 (2026-06-05)](https://github.com/usememos/memos/releases/tag/v0.29.1) |
