---
title: GoatFlow
tags:
  - GoatFlow
  - 工作流
createTime: 2025/12/15 11:34:57
updateTime: 2026/06/19 00:00:00
permalink: /homelab/deploy/goatflow/
---

## 🚀 快速入门

### 前提条件

- Docker 已安装在运行 GoatFlow 的机器上
- 推荐配置：2核 CPU / 4GB 内存

### 1. 快速启动

```bash
docker run -d \
  --name goatflow \
  -p 3000:3000 \
  goatflow/goatflow:latest
```

### 2. 验证实例

启动后打开 Web UI：

- 本地访问: `http://localhost:3000`

终端验证：

```bash
docker logs goatflow
```

### 3. 初始配置

首次访问需要完成以下设置：

- 创建管理员账户
- 配置实例名称
- 设置邮件通知（可选）

---

## 🚀 部署指南

### Docker 快速启动

```bash
docker run -d \
  --name goatflow \
  --restart unless-stopped \
  -p 3000:3000 \
  goatflow/goatflow:latest
```

### Docker Compose（推荐用于生产环境）

::: tabs

@tab:active 基础配置

```yaml
services:
  goatflow:
    image: goatflow/goatflow:latest
    container_name: goatflow
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/var/opt/goatflow
    environment:
      - NODE_ENV=production
      - PORT=3000
```

@tab 带 PostgreSQL

```yaml
services:
  goatflow:
    image: goatflow/goatflow:latest
    container_name: goatflow
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/var/opt/goatflow
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://user:password@postgres:5432/goatflow
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    container_name: goatflow-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=goatflow
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
```

@tab 带 Caddy 反向代理（HTTPS）

```yaml
services:
  goatflow:
    image: goatflow/goatflow:latest
    container_name: goatflow
    restart: unless-stopped
    volumes:
      - ./data:/var/opt/goatflow
    networks:
      - goatflow-net

  caddy:
    image: caddy:2
    container_name: goatflow-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./caddy-data:/data
      - ./caddy-config:/config
    networks:
      - goatflow-net

networks:
  goatflow-net:
```

对应的 Caddyfile：

```caddy
goatflow.example.com {
  reverse_proxy goatflow:3000
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

不使用 Docker 时，可直接在宿主机运行 GoatFlow 二进制文件。

**基础运行命令：**

```bash
./goatflow --port 3000 --data /var/lib/goatflow
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

- `Deployment` - GoatFlow 容器
- `Service` - 集群网络
- `Ingress` 或网关 - 公共访问
- `PersistentVolumeClaim` - 数据持久化
- `Secret` - 敏感配置

**典型部署配置：**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: goatflow
spec:
  replicas: 2
  selector:
    matchLabels:
      app: goatflow
  template:
    spec:
      containers:
        - name: goatflow
          image: goatflow/goatflow:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "3000"
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
          volumeMounts:
            - name: goatflow-data
              mountPath: /var/opt/goatflow
      volumes:
        - name: goatflow-data
          persistentVolumeClaim:
            claimName: goatflow-data
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: goatflow-data
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 10Gi
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: goatflow
spec:
  rules:
    - host: goatflow.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: goatflow
                port:
                  number: 3000
```

### 源码构建（Build From Source）

适用于需要自定义或使用 fork 的场景。

**构建步骤：**

```bash
git clone https://github.com/goatflow/goatflow.git
cd goatflow
git checkout main

# 安装依赖
pnpm install

# 构建
pnpm build

# 运行
pnpm start
```

**生产环境检查清单：**

- ✅ 配置数据库连接环境变量
- ✅ 设置 JWT Secret
- ✅ 部署前进行冒烟测试
- ✅ 备份数据目录

### 反向代理配置

生产环境建议通过反向代理提供 HTTPS 访问。

**Nginx 配置示例：**

```nginx
server {
    listen 443 ssl;
    server_name goatflow.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📝 配置说明

### 端口与访问

- **端口**: 默认监听 `3000` 端口
- **访问**: 浏览器打开 `http://<host_ip>:3000` 即可进入 Web 界面
- **HTTPS**: 推荐通过 Caddy/Nginx 反向代理实现

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3000` | HTTP 监听端口 |
| `NODE_ENV` | `development` | 运行环境 |
| `DATABASE_URL` | `` | 数据库连接字符串 |
| `JWT_SECRET` | auto-generated | JWT 密钥 |
| `SESSION_SECRET` | auto-generated | Session 密钥 |
| `REDIS_URL` | `` | Redis 连接字符串（可选） |
| `SMTP_HOST` | `` | SMTP 服务器地址 |
| `SMTP_PORT` | `587` | SMTP 端口 |
| `SMTP_USER` | `` | SMTP 用户名 |
| `SMTP_PASS` | `` | SMTP 密码 |

### 数据持久化

- 容器内的 `/var/opt/goatflow` 目录包含应用数据和上传文件
- 需挂载出来以防数据丢失
- 支持 PostgreSQL/MySQL 作为后端数据库

### Docker 镜像标签

| 标签 | 说明 |
|------|------|
| `latest` | ✅ **推荐** - 最新稳定版 |
| `stable` | 生产环境最安全 |
| `v1.x.x` | 版本锁定部署 |

### 升级指南

```bash
docker pull goatflow/goatflow:latest
docker stop goatflow
docker rm goatflow
docker run -d \
  --name goatflow \
  --restart unless-stopped \
  -p 3000:3000 \
  -v $(pwd)/data:/var/opt/goatflow \
  goatflow/goatflow:latest
```

> **重要**: 升级前建议备份数据目录。

## 🔗 相关资源

| 资源 | 链接 |
|------|------|
| 官网 | [goatflow.io](https://goatflow.io) |
| GitHub | [goatflow/goatflow](https://github.com/goatflow/goatflow) |
| 文档 | [docs.goatflow.io](https://goatflow.io/docs) |
| Docker Hub | [goatflow/goatflow](https://hub.docker.com/r/goatflow/goatflow) |
