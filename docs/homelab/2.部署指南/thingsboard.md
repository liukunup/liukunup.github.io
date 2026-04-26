---
title: ThingsBoard
tags:
  - IoT
  - 物联网平台
createTime: 2026/04/27 10:00:00
permalink: /homelab/deploy/thingsboard/
---

ThingsBoard 是一个开源的物联网平台，用于设备管理、数据收集、处理和可视化。

## 准备工作

创建用于存储数据的持久化目录

```bash
mkdir -p /share/Container/thingsboard
```

## 启动服务

::: tabs

@tab:active Docker Compose (In Memory)

In Memory 队列实现内置且为默认配置，适用于开发（PoC）环境，不适合生产部署或集群部署。

```yaml
services:
  # ThingsBoard CE - Open-source IoT Platform
  # https://thingsboard.io/docs/user-guide/install/docker/
  postgres:
    image: postgres:16
    restart: unless-stopped
    ports:
      - 5432:5432
    environment:
      POSTGRES_DB: thingsboard
      POSTGRES_PASSWORD: postgres
    volumes:
      - /share/Container/thingsboard/postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d thingsboard"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  thingsboard:
    image: thingsboard/tb-node:4.3.1.1
    restart: unless-stopped
    ports:
      - "8080:8080"    # HTTP API
      - "7070:7070"    # Edge RPC
      - "1883:1883"    # MQTT
      - "8883:8883"    # MQTT over SSL
      - "5683-5688:5683-5688/udp"  # COAP/LwM2M
    volumes:
      - /share/Container/thingsboard/logs:/var/log/thingsboard
    environment:
      TB_SERVICE_ID: tb-ce-node
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/thingsboard
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
    depends_on:
      postgres:
        condition: service_healthy
    logging:
      driver: json-file
      options:
        max-size: 100m
        max-file: "10"
```

@tab Docker Compose (Kafka)

Kafka 队列推荐用于生产部署。

```yaml
services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    ports:
      - 5432:5432
    environment:
      POSTGRES_DB: thingsboard
      POSTGRES_PASSWORD: postgres
    volumes:
      - /share/Container/thingsboard/postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d thingsboard"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  kafka:
    image: bitnamilegacy/kafka:4.0
    restart: unless-stopped
    ports:
      - 9092:9092
    environment:
      ALLOW_PLAINTEXT_LISTENER: "yes"
      KAFKA_CFG_LISTENERS: "PLAINTEXT://:9092,CONTROLLER://:9093"
      KAFKA_CFG_ADVERTISED_LISTENERS: "PLAINTEXT://:9092"
      KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP: "CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT"
      KAFKA_CFG_INTER_BROKER_LISTENER_NAME: "PLAINTEXT"
      KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE: "false"
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: "1"
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: "1"
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: "1"
      KAFKA_CFG_PROCESS_ROLES: "controller,broker"
      KAFKA_CFG_NODE_ID: "0"
      KAFKA_CFG_CONTROLLER_LISTENER_NAMES: "CONTROLLER"
      KAFKA_CFG_CONTROLLER_QUORUM_VOTERS: "0@kafka:9093"
      KAFKA_CFG_LOG_RETENTION_MS: "300000"
      KAFKA_CFG_SEGMENT_BYTES: "26214400"
    volumes:
      - /share/Container/thingsboard/kafka-data:/bitnami

  thingsboard:
    image: thingsboard/tb-node:4.3.1.1
    restart: unless-stopped
    ports:
      - "8080:8080"
      - "7070:7070"
      - "1883:1883"
      - "8883:8883"
      - "5683-5688:5683-5688/udp"
    volumes:
      - /share/Container/thingsboard/logs:/var/log/thingsboard
    environment:
      TB_SERVICE_ID: tb-ce-node
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/thingsboard
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
      TB_QUEUE_TYPE: kafka
      TB_KAFKA_SERVERS: kafka:9092
    depends_on:
      postgres:
        condition: service_healthy
      kafka:
        condition: service_started
    logging:
      driver: json-file
      options:
        max-size: 100m
        max-file: "10"
```

:::

## 初始化数据库

首次启动前，需要初始化数据库 schema 和系统资源：

```bash
# 使用演示数据初始化（包含示例租户、设备和仪表板）
docker compose run --rm -e INSTALL_TB=true -e LOAD_DEMO=true thingsboard

# 或不使用演示数据（仅安装核心数据库 schema）
docker compose run --rm -e INSTALL_TB=true thingsboard
```

## 启动并查看日志

```bash
docker compose up -d && docker compose logs -f thingsboard
```

## 访问 Web UI

启动后，打开 http://localhost:8080 使用以下默认账号登录：

| 角色 | 用户名 | 密码 |
|------|--------|------|
| System Administrator | sysadmin@thingsboard.org | sysadmin |
| Tenant Administrator | tenant@thingsboard.org | tenant |
| Customer User | customer@thingsboard.org | customer |

## 常用命令

- **查看日志**

```bash
docker compose logs -f thingsboard
```

- **停止服务**

```bash
docker compose down
```

- **重启服务**

```bash
docker compose restart thingsboard
```

## 端口说明

| 端口 | 协议 | 说明 |
|------|------|------|
| 8080 | HTTP | Web UI 和 REST API |
| 7070 | HTTP | Edge RPC |
| 1883 | MQTT | MQTT 协议 |
| 8883 | MQTT/SSL | MQTT over SSL |
| 5683-5688 | UDP | COAP 和 LwM2M |

## 升级 ThingsBoard

请注意，升级应按顺序进行（例如 v4.0.2 → v4.1.0 → v4.2.0），以维护数据库完整性。

1. 停止服务

```bash
docker compose down
```

2. 拉取新版本镜像

```bash
docker pull thingsboard/tb-node:<NEW_VERSION>
```

3. 更新 `docker-compose.yml` 中的镜像版本

4. 重新启动

```bash
docker compose up -d
```

## 参考链接

- [ThingsBoard Official Docs](https://thingsboard.io/docs/user-guide/install/docker/)
- [ThingsBoard GitHub](https://github.com/thingsboard/thingsboard)
- [ThingsBoard Docker Hub](https://hub.docker.com/r/thingsboard/tb-node)