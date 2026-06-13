---
title: DataEase
tags:
  - dataease
  - bi
  - data visualization
  - dashboard
  - docker
createTime: 2025/10/28 10:00:00
permalink: /homelab/deploy/dataease/
---

## 🏗️ 架构图

📖 [DataEase Docs](https://dataease.com/docs/)

📖 [DataEase GitHub](https://github.com/dataease/dataease)

![Architecture](https://dataease.com/images/architecture.png)

## 🚀 部署指南

::: tabs

@tab:active Docker Compose

```shell
# 下载安装包
wget https://github.com/dataease/dataease/releases/download/v2.9.1/dataease-v2.9.1.tar.gz

# 解压
tar -zxvf dataease-v2.9.1.tar.gz

# 进入目录
cd dataease-v2.9.1

# 一键启动
docker-compose up -d
```

@tab 单机部署

```shell
# 下载安装包
wget https://github.com/dataease/dataease/releases/download/v2.9.1/dataease-v2.9.1.tar.gz

# 解压
tar -zxvf dataease-v2.9.1.tar.gz

# 进入目录
cd dataease-v2.9.1

# 修改配置
vim .env

# 启动服务
docker-compose up -d
```

@tab Kubernetes

```shell
# 添加 Helm 仓库
helm repo add dataease https://dataease.github.io/helm-charts

# 更新仓库
helm repo update

# 安装部署
helm install dataease dataease/dataease
```

:::

## ⚙️ 配置样例

### 📦 环境变量配置

```plaintext
# .env

# DataEase 版本
DE_VERSION=2.9.1

# 基础配置
DE_BASE_DIR=/opt/dataease

# 数据库配置
DE_MYSQL_HOST=mysql.homelab.lan
DE_MYSQL_PORT=3306
DE_MYSQL_DB=dataease
DE_MYSQL_USER=dataease
DE_MYSQL_PASSWORD=your_password

# Redis 配置
DE_REDIS_HOST=redis.homelab.lan
DE_REDIS_PORT=6379
DE_REDIS_PASSWORD=your_password

# 端口配置
DE_PORT=8080
DE_EXTERNAL_PORT=8080
```

### 📦 Docker Compose 配置

```yaml
services:
  dataease:
    image: dataease/dataease:${DE_VERSION:-2.9.1}
    container_name: dataease
    restart: unless-stopped
    ports:
      - "${DE_EXTERNAL_PORT:-8080}:8080"
    volumes:
      - ${DE_BASE_DIR:-./dataease}/logs:/dataease/logs
      - ${DE_BASE_DIR:-./dataease}/data:/dataease/data
      - ${DE_BASE_DIR:-./dataease}/cache:/dataease/cache
    environment:
      - TZ=Asia/Shanghai
      - DE_MYSQL_HOST=${DE_MYSQL_HOST:-mysql.homelab.lan}
      - DE_MYSQL_PORT=${DE_MYSQL_PORT:-3306}
      - DE_MYSQL_DB=${DE_MYSQL_DB:-dataease}
      - DE_MYSQL_USER=${DE_MYSQL_USER:-dataease}
      - DE_MYSQL_PASSWORD=${DE_MYSQL_PASSWORD:-your_password}
      - DE_REDIS_HOST=${DE_REDIS_HOST:-redis.homelab.lan}
      - DE_REDIS_PORT=${DE_REDIS_PORT:-6379}
      - DE_REDIS_PASSWORD=${DE_REDIS_PASSWORD:-your_password}
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    container_name: dataease-mysql
    restart: unless-stopped
    ports:
      - "3306:3306"
    volumes:
      - ${DE_BASE_DIR:-./dataease}/mysql:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=dataease
      - MYSQL_USER=dataease
      - MYSQL_PASSWORD=your_password
    command: --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

  redis:
    image: redis:7-alpine
    container_name: dataease-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - ${DE_BASE_DIR:-./dataease}/redis:/data
    command: redis-server --requirepass your_password
```

### 📦 外部数据库配置

```yaml
services:
  dataease:
    image: dataease/dataease:${DE_VERSION:-2.9.1}
    container_name: dataease
    restart: unless-stopped
    ports:
      - "${DE_EXTERNAL_PORT:-8080}:8080"
    volumes:
      - ${DE_BASE_DIR:-./dataease}/logs:/dataease/logs
      - ${DE_BASE_DIR:-./dataease}/data:/dataease/data
    environment:
      - TZ=Asia/Shanghai
      - DE_MYSQL_HOST=mysql.homelab.lan
      - DE_MYSQL_PORT=3306
      - DE_MYSQL_DB=dataease
      - DE_MYSQL_USER=dataease
      - DE_MYSQL_PASSWORD=your_password
      - DE_REDIS_HOST=redis.homelab.lan
      - DE_REDIS_PORT=6379
      - DE_REDIS_PASSWORD=your_password
```

## 🔧 常用命令

```shell
# 查看容器状态
docker ps dataease

# 查看日志
docker logs -f dataease

# 重启服务
docker restart dataease

# 进入容器
docker exec -it dataease /bin/bash

# 更新服务
cd /opt/dataease
docker-compose down
docker-compose pull
docker-compose up -d

# 备份数据
tar -zcvf dataease-backup-$(date +%Y%m%d).tar.gz dataease/
```

## 💻 最佳实践

### 🔥 完整部署套件

::: steps

1. 目录结构

    ```plaintext
    dataease/
    ├── docker-compose.yml
    ├── .env
    ├── data/
    │   ├── logs/
    │   ├── data/
    │   ├── cache/
    │   ├── mysql/
    │   └── redis/
    └── backup/
    ```

2. 部署

    ```shell
    # 创建目录
    mkdir -p /opt/dataease/{data/{logs,data,cache,mysql,redis},backup}

    # 下载安装包
    wget https://github.com/dataease/dataease/releases/download/v2.9.1/dataease-v2.9.1.tar.gz

    # 解压
    tar -zxvf dataease-v2.9.1.tar.gz -C /opt/dataease

    # 配置
    cd /opt/dataease/dataease-v2.9.1
    vim .env

    # 启动
    docker-compose up -d
    ```

3. 配置反向代理

    ```yaml
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dataease.rule=Host(`dataease.homelab.lan`)"
      - "traefik.http.routers.dataease.entrypoints=websecure"
      - "traefik.http.routers.dataease.tls=true"
      - "traefik.http.services.dataease.loadbalancer.server.port=8080"
    ```

4. 验证

    ```shell
    # 检查服务状态
    docker ps

    # 检查日志
    docker logs dataease

    # 访问 Web UI
    curl http://localhost:8080
    ```

:::

### 📦 高可用配置

```yaml
services:
  dataease:
    image: dataease/dataease:${DE_VERSION:-2.9.1}
    container_name: dataease
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - /opt/dataease/logs:/dataease/logs
      - /opt/dataease/data:/dataease/data
      - /opt/dataease/cache:/dataease/cache
    environment:
      - TZ=Asia/Shanghai
      - DE_MYSQL_HOST=mysql.homelab.lan
      - DE_MYSQL_PORT=3306
      - DE_MYSQL_DB=dataease
      - DE_MYSQL_USER=dataease
      - DE_MYSQL_PASSWORD=${DB_PASSWORD}
      - DE_REDIS_HOST=redis.homelab.lan
      - DE_REDIS_PORT=6379
      - DE_REDIS_PASSWORD=${REDIS_PASSWORD}
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 4g
          cpus: '2.0'
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - dataease-network

networks:
  dataease-network:
    driver: bridge
```

### 🔐 安全配置

```yaml
services:
  dataease:
    image: dataease/dataease:${DE_VERSION:-2.9.1}
    container_name: dataease
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - /opt/dataease/logs:/dataease/logs
      - /opt/dataease/data:/dataease/data
    environment:
      - TZ=Asia/Shanghai
      - DE_MYSQL_HOST=mysql.homelab.lan
      - DE_MYSQL_PORT=3306
      - DE_MYSQL_DB=dataease
      - DE_MYSQL_USER=dataease
      - DE_MYSQL_PASSWORD=${DB_PASSWORD}
      - DE_REDIS_HOST=redis.homelab.lan
      - DE_REDIS_PORT=6379
      - DE_REDIS_PASSWORD=${REDIS_PASSWORD}
    security_opt:
      - no-new-privileges:true
    read_only: false
    tmpfs:
      - /tmp
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
```

### 📱 移动端配置

::: steps

1. 访问 Web UI

    使用浏览器访问 `http://your-domain:8080`

2. 管理员登录

    默认管理员账号：`admin`
    默认管理员密码：`dataease`

3. 首次配置

    - 修改默认密码
    - 配置数据源
    - 创建用户和角色
    - 配置仪表板

4. 移动端访问

    支持响应式布局，直接使用移动端浏览器访问即可

:::