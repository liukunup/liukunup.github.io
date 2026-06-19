---
title: Memos
tags:
  - Memos
createTime: 2025/12/15 11:34:57
updateTime: 2026/06/19 00:00:00
permalink: /homelab/deploy/memos/
---

## 🚀 快速入门

### 前提条件

- Docker 已安装在运行 Memos 的机器上

### 1. 启动本地实例

```bash
docker run -d \
  --name memos \
  -p 5230:5230 \
  -v ~/.memos:/var/opt/memos \
  neosmemo/memos:stable
```

### 2. 验证实例

启动后打开 UI：

- Docker 默认: `http://localhost:5230`
- 二进制默认: `http://localhost:8081`

终端验证：

```bash
docker logs memos
```

### 3. 创建第一个管理员账户

第一个注册的用户自动成为管理员（Host），可配置注册、认证、存储等全局设置。

**建议操作：**

- ✅ 设置强密码
- ✅ 确认实例 URL（如果通过反向代理访问）
- ✅ 决定是否开放用户注册
- ✅ 决定是否允许公开备忘录

### 4. 创建第一个备忘录

使用首页顶部的编辑器，尝试以下示例：

```markdown
# Welcome to Memos

这是我的第一个备忘录。

## 任务列表
- [x] 安装 Memos
- [ ] 写一条真正的笔记

## 标签
试试 #memos 和 #getting-started

## 代码
```ts
console.log("hello from memos");
```
```

**可以尝试的功能：**

- 设置备忘录可见性：`PRIVATE`、`PROTECTED` 或 `PUBLIC`
- 添加待办清单：`- [ ]`
- 上传截图或文档
- 内联创建标签：`#标签名`
- 置顶重要备忘录

### 5. 可见性级别

每个备忘录有三种可见性级别：

| 级别 | 说明 |
|------|------|
| `PRIVATE` | 仅自己可读 |
| `PROTECTED` | 实例上已认证用户可读 |
| `PUBLIC` | 知道 URL 的任何人都可读 |

对于私人团队或个人实例，禁用公开备忘录通常是最安全的选择。

### 6. 常见首发问题

- 如果 `http://localhost:5230` 无法加载，检查 `docker logs memos`
- 如果数据目录不可写，检查 `~/.memos` 权限
- 如果通过反向代理运行，设置 `MEMOS_INSTANCE_URL` 为公开 URL

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

### 二进制安装（Binary）

不使用 Docker 时，可直接在宿主机运行 Memos 二进制文件。

**支持平台：**

- Linux: `amd64`, `arm64`, `armv7`
- macOS: Intel 和 Apple Silicon
- Windows: `amd64`

**基础运行命令：**

```bash
./memos --port 5230 --data /var/lib/memos
```

> 默认端口为 `8081`，默认使用 SQLite 数据库。

**连接外部数据库：**

```bash
# MySQL
./memos \
  --driver mysql \
  --dsn "user:password@tcp(localhost:3306)/memos"

# PostgreSQL
./memos \
  --driver postgres \
  --dsn "postgres://user:password@localhost:5432/memos?sslmode=disable"
```

**服务管理：**

| 系统 | 建议 |
|------|------|
| Linux | systemd |
| macOS | launchd |
| Windows | 服务包装器或 supervisor |

### Kubernetes 部署

适用于已有 Kubernetes 集群的环境。

**核心资源：**

- `Deployment` - Memos 容器
- `Service` - 集群网络
- `Ingress` 或网关 - 公共访问
- `PersistentVolumeClaim` - 数据持久化
- `Secret` - 敏感配置（如 DSN）

**典型部署配置：**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: memos
spec:
  replicas: 1  # SQLite 只能单副本
  template:
    spec:
      enableServiceLinks: false  # 避免 K8s 注入 MEMOS_PORT 环境变量
      containers:
        - name: memos
          image: neosmemo/memos:stable
          env:
            - name: MEMOS_PORT
              value: "5230"
            - name: MEMOS_INSTANCE_URL
              value: "https://memos.example.com"
          volumeMounts:
            - name: memos-data
              mountPath: /var/opt/memos
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
      volumes:
        - name: memos-data
          persistentVolumeClaim:
            claimName: memos-data
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: memos-data
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 5Gi
```

**注意事项：**

- 使用 SQLite 时只能单副本运行
- `MEMOS_PORT` 环境变量可能与 K8s Service 注入冲突，需设置 `enableServiceLinks: false`
- 推荐使用外部 MySQL/PostgreSQL 以支持多副本
- 通过 Ingress 配置 TLS 终端

### 源码构建（Build From Source）

适用于需要自定义或使用 fork 的场景。

**构建步骤：**

```bash
git clone https://github.com/usememos/memos.git
cd memos
git checkout v0.29.1  # 锁定版本

# 安装依赖
pnpm install

# 构建
pnpm build:release
```

**运行构建产物：**

```bash
./memos --port 5230 --data /var/lib/memos
```

**生产环境检查清单：**

- ✅ 设置 `MEMOS_INSTANCE_URL` 和数据库环境变量
- ✅ 部署前进行冒烟测试
- ✅ 备份数据目录

### 反向代理配置

生产环境建议通过反向代理提供 HTTPS 访问。

**推荐配置：**

```nginx
# Nginx 配置示例
server {
    listen 443 ssl;
    server_name memos.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:5230;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**关键检查项：**

- `MEMOS_INSTANCE_URL` 必须设置为公开访问的 URL
- 转发标准代理头：`Host`, `X-Forwarded-Proto`, `X-Forwarded-For`
- 公开链接和 Cookie 必须使用正确的域名
- 上传的资产通过公开路由仍然可访问

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
