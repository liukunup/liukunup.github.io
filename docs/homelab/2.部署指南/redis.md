---
title: Redis
createTime: 2025/10/10 00:00:00
permalink: /homelab/deploy/redis/
---

## 🚀 部署指南

Redis 是一个开源（BSD许可）的内存数据结构存储，用作数据库、缓存、消息代理和流引擎。

### 准备工作

创建用于存储 Redis 数据的持久化目录：

```bash
mkdir -p /share/Container/redis/data
```

### 启动服务

::: tabs

@tab:active Docker Compose

```yaml
services:
  redis:
    image: redis:7
    container_name: redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - /share/Container/redis/data:/data
    # 开启 AOF 持久化并设置密码
    command: redis-server --appendonly yes --requirepass "my-secret-pw"
```

@tab Docker CLI

```bash
docker run -d \
  --name redis \
  --restart always \
  -p 6379:6379 \
  -v /share/Container/redis/data:/data \
  redis:7 \
  redis-server --appendonly yes --requirepass "my-secret-pw"
```

:::

## 📝 使用说明

### 常用命令

1. **连接 Redis CLI**

    ```bash
    docker exec -it redis redis-cli -a my-secret-pw
    ```

2. **简单测试**

    ```bash
    # 连接后执行
    ping
    # 返回 PONG
    set mykey "Hello World"
    get mykey
    ```

3. **数据备份**

    Redis 默认会将快照保存为 `dump.rdb`，开启 AOF 后会有 `appendonly.aof`，都在挂载的 `/share/Container/redis/data` 目录下。

### 配置说明

如果需要使用自定义 `redis.conf` 配置文件：

1. 下载默认配置文件或新建配置文件。
2. 挂载配置文件到容器中：

```yaml
    volumes:
      - /share/Container/redis/data:/data
      - /share/Container/redis/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
```
