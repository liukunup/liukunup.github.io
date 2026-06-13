---
title: Obsidian LiveSync
tags:
  - obsidian
  - livesync
  - sync
  - note
  - self-hosted
createTime: 2025/10/28 10:00:00
permalink: /homelab/deploy/obsidian-livesync/
---

## 🏗️ 架构图

📖 [Obsidian LiveSync Docs](https://docs.livesync.vrtmrz.com/)

📖 [Obsidian LiveSync GitHub](https://github.com/vrtmrz/obsidian-livesync)

## 🚀 部署指南

::: tabs

@tab:active Docker

```shell
# 创建数据目录
mkdir -p /opt/obsidian-livesync/data

# 启动 CouchDB
docker run -d \
  -p 5984:5984 \
  -v /opt/obsidian-livesync/data:/opt/couchdb/data \
  -e COUCHDB_USER=admin \
  -e COUCHDB_PASSWORD=your_password \
  --restart=unless-stopped \
  --name obsidian-livesync \
  couchdb:latest
```

@tab Docker Compose

```yaml
services:
  obsidian-livesync:
    image: couchdb:latest
    container_name: obsidian-livesync
    restart: unless-stopped
    ports:
      - "5984:5984"
    volumes:
      - /opt/obsidian-livesync/data:/opt/couchdb/data
    environment:
      - COUCHDB_USER=admin
      - COUCHDB_PASSWORD=your_password
      - TZ=Asia/Shanghai
    deploy:
      resources:
        limits:
          memory: 2g
          cpus: '1.0'
```

:::

## ⚙️ 配置样例

### 📦 CouchDB 基础配置

```ini
# local.ini

[couchdb]
single_node=true
max_document_size = 4294967296

[chttpd]
require_valid_user = true
bind_address = 0.0.0.0
port = 5984

[chttpd_require_valid_user]
read = true
write = true

[httpd]
enable_cors = true

[cors]
origins = *
credentials = true
headers = accept, authorization, content-type, origin, referer
methods = GET, PUT, POST, HEAD, DELETE
max = 2048
```

### 📦 Docker Compose 完整配置

```yaml
services:
  obsidian-livesync:
    image: couchdb:latest
    container_name: obsidian-livesync
    restart: unless-stopped
    ports:
      - "5984:5984"
    volumes:
      - /opt/obsidian-livesync/data:/opt/couchdb/data
    environment:
      - COUCHDB_USER=admin
      - COUCHDB_PASSWORD=your_password
      - TZ=Asia/Shanghai
    deploy:
      resources:
        limits:
          memory: 2g
          cpus: '1.0'
```

### 📦 Haproxy 配置（可选）

```plaintext
# haproxy.cfg

frontend obsidian-livesync
    bind *:5984
    mode http
    default_backend obsidian-livesync

backend obsidian-livesync
    mode http
    option httpchk GET /
    server couchdb localhost:5984 check inter 5s rise 2 fall 3
```

## 🔧 常用命令

```shell
# 查看容器状态
docker ps obsidian-livesync

# 查看日志
docker logs -f obsidian-livesync

# 重启服务
docker restart obsidian-livesync

# 进入容器
docker exec -it obsidian-livesync /bin/sh

# 创建数据库
curl -X PUT http://admin:your_password@localhost:5984/vaultdb

# 查看所有数据库
curl -u admin:your_password http://localhost:5984/_all_dbs
```

## 💻 最佳实践

### 🔥 完整部署套件

::: steps

1. 目录结构

    ```plaintext
    obsidian-livesync/
    ├── docker-compose.yml
    └── data/
    ```

2. 部署

    ```yaml
    services:
      obsidian-livesync:
        image: couchdb:latest
        container_name: obsidian-livesync
        restart: unless-stopped
        ports:
          - "5984:5984"
        volumes:
          - ./data:/opt/couchdb/data
        environment:
          - COUCHDB_USER=admin
          - COUCHDB_PASSWORD=your_secure_password
          - TZ=Asia/Shanghai
        deploy:
          resources:
            limits:
              memory: 2g
              cpus: '1.0'
    ```

3. 配置反向代理（可选）

    ```yaml
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.obsidian-livesync.rule=Host(`livesync.homelab.lan`)"
      - "traefik.http.routers.obsidian-livesync.entrypoints=websecure"
      - "traefik.http.routers.obsidian-livesync.tls=true"
      - "traefik.http.services.obsidian-livesync.loadbalancer.server.port=5984"
    ```

4. 验证

    ```shell
    # 访问 Futon UI
    curl http://localhost:5984/_utils/

    # 检查状态
    curl -u admin:your_password http://localhost:5984/
    ```

:::

### 📦 CouchDB + LiveSync 插件配置

```json
{
  "liveSync": {
    "CouchDB URI": "http://admin:your_password@your-domain.com:5984",
    "CouchDB Name": "vaultdb",
    "Username": "admin",
    "Password": "your_password"
  }
}
```

### 🔐 安全配置

```yaml
services:
  obsidian-livesync:
    image: couchdb:latest
    container_name: obsidian-livesync
    restart: unless-stopped
    ports:
      - "5984:5984"
    volumes:
      - /opt/obsidian-livesync/data:/opt/couchdb/data
    environment:
      - COUCHDB_USER=admin
      - COUCHDB_PASSWORD=your_strong_password
      - TZ=Asia/Shanghai
    security_opt:
      - no-new-privileges:true
    read_only: false
    tmpfs:
      - /tmp
    networks:
      - internal

networks:
  internal:
    driver: bridge
```

### 📱 移动端配置

::: steps

1. 安装 Obsidian 移动端

    从 App Store（iOS）或 Google Play（Android）安装 Obsidian。

2. 安装 LiveSync 插件

    在社区插件中搜索并安装 `obsidian-livesync`。

3. 配置连接

    - CouchDB URI: `http://your-domain.com:5984`
    - Database Name: `vaultdb`
    - Username: `admin`
    - Password: `your_password`

4. 同步

    启用实时同步，确保持久化连接。

:::