---
title: NocoBase
tags:
  - NocoBase
  - 无代码
  - 低代码
createTime: 2025/12/15 11:34:57
updateTime: 2026/06/19 00:00:00
permalink: /homelab/deploy/nocobase/
---

## 🚀 快速入门

### 前提条件

- Docker 和 Docker Compose 已安装
- 推荐配置：2核 CPU / 4GB 内存

### 1. 快速启动

```bash
git clone https://github.com/nocobase/nocobase.git
cd nocobase
docker compose up -d
```

### 2. 验证实例

启动后打开 Web UI：

- 本地访问: `http://localhost:13000`

默认管理员账户：

- **邮箱**: `admin@nocobase.com`
- **密码**: `admin123`

终端验证：

```bash
docker compose logs -f
```

### 3. 初始配置

首次访问后建议：

- ✅ 立即修改管理员密码
- ✅ 配置邮件服务（可选）
- ✅ 设置存储策略
- ✅ 创建第一个应用

---

## 🚀 部署指南

### Docker Compose（推荐用于生产环境）

NocoBase 推荐使用 Docker Compose 部署，支持 SQLite（开发）、PostgreSQL（生产）、MySQL（生产）等多种数据库。

::: tabs

@tab:active 基础配置（SQLite）

适用于开发和测试环境，单机部署。

```yaml
services:
  nocobase:
    image: nocobase/nocobase:latest
    container_name: nocobase
    restart: unless-stopped
    ports:
      - "13000:13000"
    volumes:
      - ./storage:/app/storage
    environment:
      - DB_DIALECT=sqlite
      - APP_PORT=13000
```

@tab PostgreSQL（推荐生产环境）

适用于生产环境，支持多副本部署。

```yaml
services:
  nocobase:
    image: nocobase/nocobase:latest
    container_name: nocobase
    restart: unless-stopped
    ports:
      - "13000:13000"
    volumes:
      - ./storage:/app/storage
    environment:
      - DB_DIALECT=postgres
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=nocobase
      - DB_USER=nocobase
      - DB_PASSWORD=nocobase_password
      - APP_PORT=13000
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    container_name: nocobase-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=nocobase
      - POSTGRES_PASSWORD=nocobase_password
      - POSTGRES_DB=nocobase
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
```

@tab MySQL

```yaml
services:
  nocobase:
    image: nocobase/nocobase:latest
    container_name: nocobase
    restart: unless-stopped
    ports:
      - "13000:13000"
    volumes:
      - ./storage:/app/storage
    environment:
      - DB_DIALECT=mysql
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_DATABASE=nocobase
      - DB_USER=nocobase
      - DB_PASSWORD=nocobase_password
      - APP_PORT=13000
    depends_on:
      - mysql

  mysql:
    image: mysql:8
    container_name: nocobase-mysql
    restart: unless-stopped
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=nocobase
      - MYSQL_USER=nocobase
      - MYSQL_PASSWORD=nocobase_password
    volumes:
      - ./mysql-data:/var/lib/mysql
    command: --default-authentication-plugin=mysql_native_password
```

@tab 带 Redis

```yaml
services:
  nocobase:
    image: nocobase/nocobase:latest
    container_name: nocobase
    restart: unless-stopped
    ports:
      - "13000:13000"
    volumes:
      - ./storage:/app/storage
    environment:
      - DB_DIALECT=postgres
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=nocobase
      - DB_USER=nocobase
      - DB_PASSWORD=nocobase_password
      - APP_PORT=13000
      - I18N_LOCALE=zh-CN
      - redis_url=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    container_name: nocobase-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=nocobase
      - POSTGRES_PASSWORD=nocobase_password
      - POSTGRES_DB=nocobase
    volumes:
      - ./postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: nocobase-redis
    restart: unless-stopped
    volumes:
      - ./redis-data:/data
```

@tab 带 Caddy 反向代理（HTTPS）

```yaml
services:
  nocobase:
    image: nocobase/nocobase:latest
    container_name: nocobase
    restart: unless-stopped
    volumes:
      - ./storage:/app/storage
    environment:
      - DB_DIALECT=postgres
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=nocobase
      - DB_USER=nocobase
      - DB_PASSWORD=nocobase_password
      - APP_PORT=13000
    networks:
      - nocobase-net

  postgres:
    image: postgres:15-alpine
    container_name: nocobase-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=nocobase
      - POSTGRES_PASSWORD=nocobase_password
      - POSTGRES_DB=nocobase
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
    networks:
      - nocobase-net

  caddy:
    image: caddy:2
    container_name: nocobase-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./caddy-data:/data
      - ./caddy-config:/config
    networks:
      - nocobase-net

networks:
  nocobase-net:
```

对应的 Caddyfile：

```caddy
nocobase.example.com {
  reverse_proxy nocobase:13000
}
```

:::

**启动命令：**

```bash
docker compose up -d
```

**常用操作命令：**

```bash
docker compose logs -f         # 查看日志
docker compose down             # 停止服务
docker compose pull            # 拉取最新镜像
docker compose up -d           # 重启服务
docker compose exec nocobase npm run db:push  # 同步数据库结构
```

### 二进制安装（Binary）

不使用 Docker 时，可直接在宿主机运行 NocoBase。

**基础运行命令：**

```bash
# 下载最新版本
curl -L https://github.com/nocobase/nocobase/releases/latest/download/nocobase.tar.gz | tar xz
cd nocobase

# 配置环境变量
export DB_DIALECT=sqlite
export APP_PORT=13000

# 启动
./start
```

### Kubernetes 部署

适用于已有 Kubernetes 集群的环境。

**核心资源：**

- `Deployment` - NocoBase 应用容器
- `Service` - 集群网络
- `Ingress` 或网关 - 公共访问
- `PersistentVolumeClaim` - 数据持久化
- `Secret` - 敏感配置

**典型部署配置：**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nocobase
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nocobase
  template:
    spec:
      containers:
        - name: nocobase
          image: nocobase/nocobase:latest
          ports:
            - containerPort: 13000
          env:
            - name: DB_DIALECT
              value: "postgres"
            - name: DB_HOST
              value: "postgres"
            - name: DB_PORT
              value: "5432"
            - name: DB_DATABASE
              value: "nocobase"
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: nocobase-secrets
                  key: db-user
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: nocobase-secrets
                  key: db-password
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "2Gi"
              cpu: "1000m"
          volumeMounts:
            - name: nocobase-storage
              mountPath: /app/storage
      volumes:
        - name: nocobase-storage
          persistentVolumeClaim:
            claimName: nocobase-storage
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: nocobase-storage
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 20Gi
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nocobase
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "100m"
spec:
  rules:
    - host: nocobase.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nocobase
                port:
                  number: 13000
```

### 源码构建（Build From Source）

适用于需要自定义或使用开发版功能的场景。

**构建步骤：**

```bash
git clone https://github.com/nocobase/nocobase.git
cd nocobase

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 生产构建
pnpm build

# 生产运行
pnpm start
```

**生产环境检查清单：**

- ✅ 配置 PostgreSQL 数据库
- ✅ 设置 `APP_KEY` 环境变量
- ✅ 配置邮件服务
- ✅ 设置文件存储（本地/S3/OSS）
- ✅ 部署前进行冒烟测试
- ✅ 备份数据目录

### 反向代理配置

生产环境建议通过反向代理提供 HTTPS 访问。

**Nginx 配置示例：**

```nginx
server {
    listen 443 ssl;
    server_name nocobase.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    client_max_body_size 100M;
    proxy_request_buffering off;

    location / {
        proxy_pass http://localhost:13000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
        
        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 📝 配置说明

### 端口与访问

- **端口**: 默认监听 `13000` 端口
- **访问**: 浏览器打开 `http://<host_ip>:13000` 即可进入 Web 界面
- **HTTPS**: 推荐通过 Caddy/Nginx 反向代理实现

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `APP_PORT` | `13000` | HTTP 监听端口 |
| `APP_KEY` | auto-generated | 应用密钥 |
| `DB_DIALECT` | `sqlite` | 数据库类型：`sqlite`、`postgres`、`mysql` |
| `DB_HOST` | `` | 数据库主机 |
| `DB_PORT` | `` | 数据库端口 |
| `DB_DATABASE` | `` | 数据库名称 |
| `DB_USER` | `` | 数据库用户名 |
| `DB_PASSWORD` | `` | 数据库密码 |
| `DB_UNDERSCORED` | `true` | 使用下划线命名 |
| `redis_url` | `` | Redis 连接字符串 |
| `I18N_LOCALE` | `en-US` | 默认语言 |
| `FILE_STORAGE_PREFIX` | `/storage` | 文件存储路径 |
| `SMTP_HOST` | `` | SMTP 服务器地址 |
| `SMTP_PORT` | `587` | SMTP 端口 |
| `SMTP_USER` | `` | SMTP 用户名 |
| `SMTP_PASSWORD` | `` | SMTP 密码 |

### 数据持久化

- 容器内的 `/app/storage` 目录包含上传文件、日志等数据
- 需挂载出来以防数据丢失
- 生产环境强烈建议使用 PostgreSQL/MySQL

### Docker 镜像标签

| 标签 | 说明 |
|------|------|
| `latest` | ✅ **推荐** - 最新稳定版 |
| `stable` | 生产环境最安全 |
| `v1.x.x` | 版本锁定部署 |
| `beta` | 测试版 |

### 升级指南

```bash
# 方式一：使用 Docker Compose
docker compose pull
docker compose up -d

# 方式二：手动升级
docker pull nocobase/nocobase:latest
docker stop nocobase
docker rm nocobase
docker run -d \
  --name nocobase \
  --restart unless-stopped \
  -p 13000:13000 \
  -v $(pwd)/storage:/app/storage \
  -e DB_DIALECT=postgres \
  -e DB_HOST=postgres \
  nocobase/nocobase:latest

# 同步数据库结构
docker compose exec nocobase npm run db:push
```

> **重要**: 升级前建议：
> 1. 备份数据库
> 2. 备份 storage 目录
> 3. 查看升级日志

### 备份与恢复

**备份：**

```bash
# 备份数据库（PostgreSQL）
docker compose exec postgres pg_dump -U nocobase nocobase > backup.sql

# 备份文件存储
tar -czvf storage-backup.tar.gz ./storage
```

**恢复：**

```bash
# 恢复数据库
docker compose exec -T postgres psql -U nocobase nocobase < backup.sql

# 恢复文件
tar -xzvf storage-backup.tar.gz
```

## 🔗 相关资源

| 资源 | 链接 |
|------|------|
| GitHub | [nocobase/nocobase](https://github.com/nocobase/nocobase) |
| 官网 | [nocobase.com](https://www.nocobase.com) |
| 文档 | [docs.nocobase.com](https://docs.nocobase.com) |
| Docker Hub | [nocobase/nocobase](https://hub.docker.com/r/nocobase/nocobase) |
| Demo | [demo.nocobase.com](https://demo.nocobase.com) |
| 中文文档 | [docs.nocobase.com/zh-CN](https://docs.nocobase.com/zh-CN) |
