---
title: MQTTX
tags:
  - MQTT
  - 物联网
  - 消息队列
createTime: 2026/04/27 10:40:00
permalink: /homelab/deploy/mqttx/
---

MQTTX 是一个跨平台的 MQTT 5.0 客户端工具，支持桌面端、命令行和 WebSocket。

## 准备工作

创建用于存储配置的目录

```bash
mkdir -p /share/Container/mqttx
```

## MQTT Broker (EMQX)

在使用 MQTTX 之前，需要有一个 MQTT Broker。推荐使用 EMQX。

::: tabs

@tab:active EMQX Docker Compose

```yaml
services:
  # EMQX - Scalable MQTT Broker
  # https://emqx.io/
  emqx:
    image: emqx/emqx:5.8
    restart: unless-stopped
    ports:
      - "1883:1883"    # MQTT TCP
      - "8883:8883"    # MQTT over TLS
      - "8083:8083"    # MQTT over WebSocket
      - "8084:8084"    # MQTT over WebSocket (SSL)
      - "18083:18083"  # Dashboard
    volumes:
      - /share/Container/mqttx/emqx_data:/opt/emqx/data
      - /share/Container/mqttx/emqx_log:/opt/emqx/log
    environment:
      EMQX_NAME: emqx
      EMQX_HOST: localhost
      EMQX_DASHBOARD__DEFAULT_PASSWORD: admin
    healthcheck:
      test: ["CMD", "/opt/emqx/bin/emqx", "ctl", "status"]
      interval: 30s
      timeout: 10s
      retries: 5
```

@tab EMQX Docker CLI

```bash
docker run -d \
  --name emqx \
  --restart unless-stopped \
  -p 1883:1883 \
  -p 8883:8883 \
  -p 8083:8083 \
  -p 8084:8084 \
  -p 18083:18083 \
  -v /share/Container/mqttx/emqx_data:/opt/emqx/data \
  -v /share/Container/mqttx/emqx_log:/opt/emqx/log \
  -e EMQX_NAME=emqx \
  -e EMQX_HOST=localhost \
  -e EMQX_DASHBOARD__DEFAULT_PASSWORD=admin \
  emqx/emqx:5.8
```

:::

## MQTTX CLI

MQTTX 命令行工具，用于测试和调试 MQTT 连接。

::: tabs

@tab:active Docker CLI (交互模式)

```bash
docker run -it --rm \
  --network host \
  emqx/mqttx-cli
```

@tab Docker CLI (单次命令)

```bash
# 连接测试
docker run --rm emqx/mqttx-cli mqttx conn -h localhost -p 1883

# 发布消息
docker run --rm emqx/mqttx-cli mqttx pub -t test -m "hello world" -h localhost

# 订阅主题
docker run --rm emqx/mqttx-cli mqttx sub -t test -h localhost
```

:::

### 常用命令

- **连接**

```bash
docker run --rm emqx/mqttx-cli mqttx conn -h <broker> -p <port> -u username -P password
```

- **发布**

```bash
docker run --rm emqx/mqttx-cli mqttx pub -t topic -m "message" -h <broker>
```

- **订阅**

```bash
docker run --rm emqx/mqttx-cli mqttx sub -t topic -h <broker>
```

- **查看帮助**

```bash
docker run --rm emqx/mqttx-cli mqttx --help
```

## MQTTX Web

也可以使用 MQTTX Web 版本，通过浏览器访问。

### Docker Compose

```yaml
services:
  mqttx-web:
    image: emqx/mqttx-web
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - MQTTX_WEB__DEFAULT_HOST=localhost:1883
      - MQTTX_WEB__DEFAULT_TOPIC=test
```

## 访问 Dashboard

- EMQX Dashboard: http://localhost:18083
  - 默认账号: admin / EMQX_DASHBOARD__DEFAULT_PASSWORD

- MQTTX Web: http://localhost:3000

## 端口说明

| 端口 | 服务 |
|------|------|
| 1883 | MQTT TCP |
| 8883 | MQTT TLS |
| 8083 | WebSocket |
| 8084 | WebSocket SSL |
| 18083 | Dashboard |

## 与 ThingsBoard 集成

ThingsBoard 内置 MQTT 传输，可以直接连接到 EMQX：

```yaml
# ThingsBoard 配置中添加
TB_QUEUE_TYPE: kafka
TB_KAFKA_SERVERS: kafka:9092
```

## 测试 MQTT 连接

使用 MQTTX CLI 进行快速测试：

```bash
# 测试发布
docker run --rm emqx/mqttx-cli mqttx pub \
  -t devices/+/attributes \
  -m '{"temperature": 25.5}' \
  -h localhost

# 测试订阅
docker run --rm emqx/mqttx-cli mqttx sub \
  -t devices/+/telemetry \
  -h localhost
```

## 参考链接

- [EMQX Official](https://www.emqx.io/)
- [MQTTX Official](https://mqttx.app/)
- [EMQX Docker Hub](https://hub.docker.com/r/emqx/emqx)
- [MQTTX CLI Docker Hub](https://hub.docker.com/r/emqx/mqttx-cli)