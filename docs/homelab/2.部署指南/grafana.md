---
title: Grafana
tags:
  - monitoring
  - grafana
  - prometheus
  - influxdb
createTime: 2025/10/19 22:22:17
permalink: /homelab/deploy/grafana/
---

## 🚀 部署指南

::: tabs

@tab:active Docker

### Grafana

```shell
docker run -d \
  -p 3000:3000 \
  -v /path/to/grafana/data:/var/lib/grafana \
  -e TZ=Asia/Shanghai \
  --memory="1g" \
  --cpus="0.5" \
  --restart=unless-stopped \
  --name=grafana \
  grafana/grafana:12.0.0
```

### Prometheus

```shell
docker run -d \
  -p 9090:9090 \
  -v /path/to/config:/etc/prometheus \
  -v /path/to/data:/prometheus \
  -e TZ=Asia/Shanghai \
  --memory="2g" \
  --cpus="1.0" \
  --restart=unless-stopped \
  --name=prometheus \
  prom/prometheus:latest \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/prometheus \
  --storage.tsdb.retention.time=30d \
  --web.enable-lifecycle
```

### InfluxDB

```shell
docker run -d \
  -p 8086:8086 \
  -v /path/to/influxdb:/var/lib/influxdb2 \
  -v /path/to/influxdb/config:/etc/influxdb2 \
  -e TZ=Asia/Shanghai \
  --memory="1g" \
  --cpus="0.5" \
  --restart=unless-stopped \
  --name=influxdb \
  influxdb:2.7
```

@tab Docker Compose

查看当前用户的 `UID` 和 `GID`

```shell
id
```

### 完整监控栈

```yaml
services:
  # Grafana - 可视化监控面板
  # https://grafana.com/docs/grafana/latest/
  grafana:
    image: grafana/grafana:12.0.0  # https://hub.docker.com/r/grafana/grafana
    container_name: grafana
    user: "${UID:-1000}:${GID:-1000}"
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./grafana/data:/var/lib/grafana  # 持久化数据目录
    environment:
      - TZ=Asia/Shanghai
    depends_on:
      - prometheus
    networks:
      - monitoring
    deploy:
      resources:
        limits:
          memory: '1g'
          cpus: '0.5'

  # Prometheus - 时序数据库监控系统
  # https://prometheus.io/docs/introduction/overview/
  prometheus:
    image: prom/prometheus:latest  # https://hub.docker.com/r/prom/prometheus
    container_name: prometheus
    user: "${UID:-1000}:${GID:-1000}"
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/config:/etc/prometheus  # 配置文件目录
      - ./prometheus/data:/prometheus         # 数据目录
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
    environment:
      - TZ=Asia/Shanghai
    networks:
      - monitoring
    deploy:
      resources:
        limits:
          memory: '2g'
          cpus: '1.0'

  # InfluxDB - 时序数据库
  # https://docs.influxdata.com/influxdb/v2/
  influxdb:
    image: influxdb:2.7  # https://hub.docker.com/_/influxdb
    container_name: influxdb
    restart: unless-stopped
    ports:
      - "8086:8086"
    volumes:
      - ./influxdb/data:/var/lib/influxdb2  # 持久化数据目录
      - ./influxdb/config:/etc/influxdb2    # 配置文件目录
    environment:
      - TZ=Asia/Shanghai
    networks:
      - monitoring
    deploy:
      resources:
        limits:
          memory: '1g'
          cpus: '0.5'

networks:
  monitoring:
    driver: bridge
```

:::

authentik [Integrate with Grafana](https://integrations.goauthentik.io/monitoring/grafana/)

```
networks:
  1panel-network:
    external: true
services:
  grafana:
    container_name: ${CONTAINER_NAME}
    deploy:
      resources:
        limits:
          cpus: ${CPUS}
          memory: ${MEMORY_LIMIT}
    image: grafana/grafana:12.2.0
    labels:
      createdBy: Apps
    networks:
      - 1panel-network
    ports:
      - ${HOST_IP}:${PANEL_APP_PORT_HTTP}:3000
    restart: always
    user: "0"
    volumes:
      - ./data:/var/lib/grafana
    environment:
      GF_AUTH_GENERIC_OAUTH_ENABLED: "true"
      GF_AUTH_GENERIC_OAUTH_NAME: "authentik"
      GF_AUTH_GENERIC_OAUTH_CLIENT_ID: "<Client ID from above>"
      GF_AUTH_GENERIC_OAUTH_CLIENT_SECRET: "<Client Secret from above>"
      GF_AUTH_GENERIC_OAUTH_SCOPES: "openid profile email"
      GF_AUTH_GENERIC_OAUTH_AUTH_URL: "https://authentik.company/application/o/authorize/"
      GF_AUTH_GENERIC_OAUTH_TOKEN_URL: "https://authentik.company/application/o/token/"
      GF_AUTH_GENERIC_OAUTH_API_URL: "https://authentik.company/application/o/userinfo/"
      GF_AUTH_SIGNOUT_REDIRECT_URL: "https://authentik.company/application/o/<application_slug>/end-session/"
      # Optionally enable auto-login (bypasses Grafana login screen)
      GF_AUTH_OAUTH_AUTO_LOGIN: "true"
      # Optionally map user groups to Grafana roles
      GF_AUTH_GENERIC_OAUTH_ROLE_ATTRIBUTE_PATH: "contains(groups[*], 'Grafana Admins') && 'Admin' || contains(groups[*], 'Grafana Editors') && 'Editor' || 'Viewer'"
      # Required if Grafana is running behind a reverse proxy
      GF_SERVER_ROOT_URL: "https://grafana.company"
```

记得到管理页面关闭TLS验证

## 常用命令

- **进入 Grafana 容器**

```bash
docker exec -it grafana bash
```

- **查看 Grafana 日志**

```bash
docker logs -f grafana
```

- **重置 Grafana 管理员密码**

```bash
docker exec -it grafana grafana-admin reset-admin-password <new_password>
```

- **InfluxDB CLI**

```bash
docker exec -it influxdb influx
```

- **InfluxDB 创建 Bucket**

```bash
docker exec -it influxdb influx bucket create -n my-bucket -o my-org
```

- **InfluxDB 查看 Bucket**

```bash
docker exec -it influxdb influx bucket list
```

- **Prometheus 配置文件热重载**

```bash
curl -X POST http://localhost:9090/-/reload
```

## 数据源配置

### Prometheus

登录 Grafana 后，进入 `Configuration` → `Data Sources` → `Add data source` → 选择 `Prometheus`

配置 URL: `http://prometheus:9090` (Docker Compose 服务名) 或 `http://<IP>:9090` (Docker CLI)

### InfluxDB

登录 Grafana 后，进入 `Configuration` → `Data Sources` → `Add data source` → 选择 `InfluxDB`

配置:
- **URL**: `http://influxdb:8086` (Docker Compose 服务名) 或 `http://<IP>:8086` (Docker CLI)
- **Organization**: `my-org`
- **Token**: 从 InfluxDB UI 或 `docker exec influxdb influx auth list` 获取
- **Default Bucket**: `my-bucket`

## 导入图表

Grafana Dashboard ID:

- `1860` - [Node Exporter Full](https://grafana.com/grafana/dashboards/1860)
- `19908` - [cAdvisor Docker Insights](https://grafana.com/grafana/dashboards/19908)
- `12239` - [NVIDIA DCGM Exporter Dashboard](https://grafana.com/grafana/dashboards/12239)
