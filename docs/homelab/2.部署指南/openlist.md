---
title: OpenList
tags:
  - openlist
  - file sharing
  - file manager
  - docker
createTime: 2025/10/28 10:00:00
permalink: /homelab/deploy/openlist/
---

## 🏗️ 架构图

📖 [OpenList Docs](https://openlist.tech/)

📖 [OpenList GitHub](https://github.com/OpenListTeam/OpenList)

## 🚀 部署指南

::: tabs

@tab:active Docker

```shell
# 创建数据目录
mkdir -p /opt/openlist/data

# 启动 OpenList
docker run -d \
  -p 3000:3000 \
  -v /opt/openlist/data:/opt/openlist/data \
  -e TZ=Asia/Shanghai \
  --restart=unless-stopped \
  --name openlist \
  openlistteam/openlist:latest
```

@tab Docker Compose

```yaml
services:
  openlist:
    image: openlistteam/openlist:latest
    container_name: openlist
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - /opt/openlist/data:/opt/openlist/data
    environment:
      - TZ=Asia/Shanghai
    deploy:
      resources:
        limits:
          memory: 2g
          cpus: '1.0'
```

@tab Helm

```shell
# 添加仓库
helm repo add openlist https://openlistteam.github.io/helm-charts

# 更新仓库
helm repo update

# 安装部署
helm install openlist openlist/openlist
```

:::

## ⚙️ 配置样例

### 📦 环境变量配置

```yaml
services:
  openlist:
    image: openlistteam/openlist:latest
    container_name: openlist
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - /opt/openlist/data:/opt/openlist/data
    environment:
      - TZ=Asia/Shanghai
      - PASSWORD=your_admin_password
      - DB_TYPE=sqlite
      - DB_PATH=/opt/openlist/data/openlist.db
```

### 📦 SQLite 配置

```yaml
services:
  openlist:
    image: openlistteam/openlist:latest
    container_name: openlist
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - /opt/openlist/data:/opt/openlist/data
    environment:
      - TZ=Asia/Shanghai
      - DB_TYPE=sqlite
      - DB_PATH=/opt/openlist/data/openlist.db
```

### 📦 MySQL 配置

```yaml
services:
  openlist:
    image: openlistteam/openlist:latest
    container_name: openlist
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - /opt/openlist/data:/opt/openlist/data
    environment:
      - TZ=Asia/Shanghai
      - DB_TYPE=mysql
      - DB_HOST=mysql.homelab.lan
      - DB_PORT=3306
      - DB_USER=openlist
      - DB_PASSWORD=your_password
      - DB_NAME=openlist
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    container_name: openlist-mysql
    restart: unless-stopped
    ports:
      - "3306:3306"
    volumes:
      - /opt/openlist/mysql:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=openlist
      - MYSQL_USER=openlist
      - MYSQL_PASSWORD=your_password
    command: --default-authentication-plugin=mysql_native_password
```

### 📦 PostgreSQL 配置

```yaml
services:
  openlist:
    image: openlistteam/openlist:latest
    container_name: openlist
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - /opt/openlist/data:/opt/openlist/data
    environment:
      - TZ=Asia/Shanghai
      - DB_TYPE=postgres
      - DB_HOST=postgres.homelab.lan
      - DB_PORT=5432
      - DB_USER=openlist
      - DB_PASSWORD=your_password
      - DB_NAME=openlist
    depends_on:
      - postgres

  postgres:
    image: postgres:16
    container_name: openlist-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    volumes:
      - /opt/openlist/postgres:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=openlist
      - POSTGRES_USER=openlist
      - POSTGRES_PASSWORD=your_password
```

## 🔧 常用命令

```shell
# 查看容器状态
docker ps openlist

# 查看日志
docker logs -f openlist

# 重启服务
docker restart openlist

# 进入容器
docker exec -it openlist /bin/sh

# 更新服务
docker pull openlistteam/openlist:latest
docker stop openlist
docker rm openlist
docker run -d \
  -p 3000:3000 \
  -v /opt/openlist/data:/opt/openlist/data \
  -e TZ=Asia/Shanghai \
  --restart=unless-stopped \
  --name openlist \
  openlistteam/openlist:latest
```

## 💻 最佳实践

### 🔥 完整部署套件

::: steps

1. 目录结构

    ```plaintext
    openlist/
    ├── docker-compose.yml
    └── data/
    ```

2. 部署

    ```yaml
    services:
      openlist:
        image: openlistteam/openlist:latest
        container_name: openlist
        restart: unless-stopped
        ports:
          - "3000:3000"
        volumes:
          - ./data:/opt/openlist/data
        environment:
          - TZ=Asia/Shanghai
          - PASSWORD=admin_password
          - DB_TYPE=sqlite
        deploy:
          resources:
            limits:
              memory: 2g
              cpus: '1.0'
    ```

3. 配置反向代理

    ```yaml
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.openlist.rule=Host(`openlist.homelab.lan`)"
      - "traefik.http.routers.openlist.entrypoints=websecure"
      - "traefik.http.routers.openlist.tls=true"
      - "traefik.http.services.openlist.loadbalancer.server.port=3000"
    ```

4. 验证

    ```shell
    # 访问 Web UI
    curl http://localhost:3000

    # 检查健康状态
    curl http://localhost:3000/api/health
    ```

:::

### 📦 高可用配置

```yaml
services:
  openlist:
    image: openlistteam/openlist:latest
    container_name: openlist
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - /opt/openlist/data:/opt/openlist/data
    environment:
      - TZ=Asia/Shanghai
      - DB_TYPE=mysql
      - DB_HOST=mysql.homelab.lan
      - DB_PORT=3306
      - DB_USER=openlist
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=openlist
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 2g
          cpus: '2.0'
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 🔐 安全配置

```yaml
services:
  openlist:
    image: openlistteam/openlist:latest
    container_name: openlist
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - /opt/openlist/data:/opt/openlist/data
    environment:
      - TZ=Asia/Shanghai
      - PASSWORD=strong_admin_password
      - DB_TYPE=sqlite
      - SESSION_SECRET=your_session_secret
    security_opt:
      - no-new-privileges:true
    read_only: false
    tmpfs:
      - /tmp
```