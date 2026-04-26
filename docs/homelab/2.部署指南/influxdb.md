---
title: InfluxDB
tags:
  - database
  - influxdb
  - time-series
  - monitoring
createTime: 2026/04/25 22:10:00
permalink: /homelab/deploy/influxdb/
---

## 🚀 部署指南

::: tabs

@tab:active Docker Compose

```yaml
services:
  # InfluxDB - 时序数据库
  # https://docs.influxdata.com/influxdb/v2/
  influxdb:
    image: ${REGISTRY:-docker.io}/${INFLUXDB_IMAGE:-influxdb:2.8.0}  # https://hub.docker.com/_/influxdb
    container_name: influxdb
    hostname: influxdb
    restart: unless-stopped
    ports:
      # 建议仅内网暴露
      - ${INFLUXDB_HOST:-127.0.0.1}:${INFLUXDB_PORT:-8086}:8086
    volumes:
      - path/to/influxdb/data:/var/lib/influxdb2  # 持久化数据目录
      - path/to/influxdb/config:/etc/influxdb2    # 配置文件目录
    environment:
      - TZ=Asia/Shanghai
      # ---- 初始化配置（仅在首次启动时生效）----
      - DOCKER_INFLUXDB_INIT_MODE=setup
      - DOCKER_INFLUXDB_INIT_USERNAME=${DOCKER_INFLUXDB_INIT_USERNAME:-admin}
      - DOCKER_INFLUXDB_INIT_PASSWORD=${DOCKER_INFLUXDB_INIT_PASSWORD:-changeme}
      - DOCKER_INFLUXDB_INIT_ORG=${DOCKER_INFLUXDB_INIT_ORG:-myorg}
      - DOCKER_INFLUXDB_INIT_BUCKET=${DOCKER_INFLUXDB_INIT_BUCKET:-mybucket}
    healthcheck: # (可选)健康检查
      test: ["CMD", "influx", "ping", "--host", "http://localhost:8086"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 30s
    logging: # (可选)日志轮转
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits: # (可选)资源限制
          cpus: ${INFLUXDB_CPU_LIMIT:-0.5}
          memory: ${INFLUXDB_MEM_LIMIT:-1g}
        reservations: # (可选)资源预留
          cpus: ${INFLUXDB_CPU_RESERVE:-0.1}
          memory: ${INFLUXDB_MEM_RESERVE:-256m}
```

@tab Docker CLI

```shell
docker run -d \
  -p 8086:8086 \
  -v /path/to/influxdb/data:/var/lib/influxdb2 \
  -v /path/to/influxdb/config:/etc/influxdb2 \
  -e TZ=Asia/Shanghai \
  -e DOCKER_INFLUXDB_INIT_MODE=setup \
  -e DOCKER_INFLUXDB_INIT_USERNAME=${DOCKER_INFLUXDB_INIT_USERNAME:-admin} \
  -e DOCKER_INFLUXDB_INIT_PASSWORD=${DOCKER_INFLUXDB_INIT_PASSWORD:-changeme} \
  -e DOCKER_INFLUXDB_INIT_ORG=${DOCKER_INFLUXDB_INIT_ORG:-myorg} \
  -e DOCKER_INFLUXDB_INIT_BUCKET=${DOCKER_INFLUXDB_INIT_BUCKET:-mybucket} \
  --restart=unless-stopped \
  --name=influxdb \
  influxdb:2.8.0
```

:::

## 数据写入

### Line Protocol

```shell
# 语法: measurement,tag1=val1,tag2=val2 field1=val1,field2=val2 <timestamp>

# 写入 CPU 指标
docker exec -i influxdb influx write \
  --bucket <bucket> \
  --org <org> \
  --token <your-token> \
  --precision s \
  --format=lp \
  <<EOF
cpu,host=server01,region=us-west usage_idle=95.5,usage_user=3.2,usage_system=1.3
cpu,host=server02,region=us-east usage_idle=92.1,usage_user=5.5,usage_system=2.4
EOF
```

### InfluxDB Client Library

- [Python](https://github.com/influxdata/influxdb-client-python)
- [Go](https://github.com/influxdata/influxdb-client-go)

## Grafana 集成

1. `Configuration` → `Data Sources` → `Add data source`
2. 选择 `InfluxDB`
3. 配置:
   - **URL**: `http://influxdb:8086`
   - **Organization**: `<org>`
   - **Token**: `<your-token>`
   - **Default Bucket**: `<bucket>`
4. 点击 `Save & Test`
