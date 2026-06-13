---
title: Watchtower
tags:
  - watchtower
  - docker
  - auto-update
  - container
createTime: 2025/10/28 10:00:00
permalink: /homelab/deploy/watchtower/
---

## 🏗️ 架构图

📖 [Watchtower Docs](https://containrrr.dev/watchtower/)

📖 [Watchtower GitHub](https://github.com/containrrr/watchtower)

## 🚀 部署指南

::: tabs

@tab:active Docker

```shell
docker run -d \
  -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /root/.docker/config.json:/config.json \
  --restart=unless-stopped \
  --name watchtower \
  containrrr/watchtower:latest
```

@tab Docker Compose

```yaml
services:
  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /root/.docker/config.json:/config.json:ro
    environment:
      - TZ=Asia/Shanghai
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_INCLUDE_STOPPED=true
      - WATCHTOWER_POLL_INTERVAL=300
```

:::

## ⚙️ 配置样例

### 📦 基础配置

```yaml
services:
  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - TZ=Asia/Shanghai
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_REMOVE_VOLUMES=true
```

### 📦 轮询间隔配置

```yaml
services:
  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - TZ=Asia/Shanghai
      - WATCHTOWER_POLL_INTERVAL=3600
      - WATCHTOWER_SCHEDULE="0 0 4 * * *"
```

### 📦 邮件通知配置

```yaml
services:
  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - TZ=Asia/Shanghai
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_NOTIFICATIONS=email
      - WATCHTOWER_NOTIFICATION_EMAIL_FROM=from@example.com
      - WATCHTOWER_NOTIFICATION_EMAIL_TO=to@example.com
      - WATCHTOWER_NOTIFICATION_EMAIL_SERVER=smtp.example.com
      - WATCHTOWER_NOTIFICATION_EMAIL_SERVER_PORT=587
      - WATCHTOWER_NOTIFICATION_EMAIL_SERVER_USER=user
      - WATCHTOWER_NOTIFICATION_EMAIL_SERVER_PASSWORD=password
```

### 📦 Slack 通知配置

```yaml
services:
  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - TZ=Asia/Shanghai
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_NOTIFICATIONS=slack
      - WATCHTOWER_NOTIFICATION_SLACK_HOOK_URL=https://hooks.slack.com/services/xxx
      - WATCHTOWER_NOTIFICATION_SLACK_CHANNEL=#docker
      - WATCHTOWER_NOTIFICATION_SLACK_IDENTIFIER=watchtower
```

## 🔧 常用命令

```shell
# 查看容器状态
docker ps watchtower

# 查看日志
docker logs -f watchtower

# 手动检查更新
docker exec watchtower watchtower --run-once

# 重启服务
docker restart watchtower

# 停止服务
docker stop watchtower

# 更新指定容器
docker exec watchtower watchtower container-name

# 查看帮助
docker exec watchtower watchtower --help
```

## 💻 最佳实践

### 🔥 完整部署套件

::: steps

1. 目录结构

    ```plaintext
    watchtower/
    └── docker-compose.yml
    ```

2. 部署

    ```yaml
    services:
      watchtower:
        image: containrrr/watchtower:latest
        container_name: watchtower
        restart: unless-stopped
        ports:
          - "8080:8080"
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock
          - /root/.docker/config.json:/config.json:ro
        environment:
          - TZ=Asia/Shanghai
          - WATCHTOWER_CLEANUP=true
          - WATCHTOWER_REMOVE_VOLUMES=true
          - WATCHTOWER_POLL_INTERVAL=3600
          - WATCHTOWER_TIMEOUT=30
          - WATCHTOWER_DEBUG=true
    ```

3. 验证

    ```shell
    # 查看日志确认启动
    docker logs watchtower

    # 手动触发一次检查
    docker exec watchtower watchtower --run-once
    ```

:::

### 📦 仅监控特定容器

```yaml
services:
  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - TZ=Asia/Shanghai
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_MONITORED_ONLY=true
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
```

### 📦 排除特定容器

```yaml
services:
  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - TZ=Asia/Shanghai
      - WATCHTOWER_CLEANUP=true
    # 排除不更新的容器
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /home/user/data:/data:ro
```

### 🔐 安全配置

```yaml
services:
  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - TZ=Asia/Shanghai
      - WATCHTOWER_CLEANUP=true
    security_opt:
      - no-new-privileges:true
    read_only: false
    tmpfs:
      - /tmp
```

### 📱 多平台部署

```yaml
services:
  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /root/.docker/config.json:/config.json:ro
    environment:
      - TZ=Asia/Shanghai
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=3600
      - WATCHTOWER_NOTIFICATIONS= Shoutrrr
      - WATCHTOWER_NOTIFICATION_URL=shoutrrr:// thermos-notifier:shoutrrr123@telegram.bot.com?channels=alerts
      - WATCHTOWER_DEBUG=true
```