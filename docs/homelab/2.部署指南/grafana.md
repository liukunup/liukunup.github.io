---
title: Grafana
tags:
  - grafana
  - monitoring
createTime: 2025/10/19 22:22:17
permalink: /homelab/deploy/grafana/
---

## 🚀 部署指南

::: tabs

@tab:active Docker

```shell
docker run -d \
  -p 3000:3000 \
  -v path/to/grafana/data:/var/lib/grafana \
  -e TZ=Asia/Shanghai \
  -e GF_SECURITY_ADMIN_USER=admin \
  -e GF_SECURITY_ADMIN_PASSWORD=changeme \
  --restart=unless-stopped \
  --name=grafana \
  grafana/grafana:latest
```

@tab Docker Compose

```yaml
services:
  # Grafana - 可视化监控面板
  # https://grafana.com/docs/grafana/latest/
  grafana:
    image: ${REGISTRY:-docker.io}/${GRAFANA_IMAGE:-grafana/grafana:latest}  # https://hub.docker.com/r/grafana/grafana
    container_name: grafana
    hostname: grafana
    restart: unless-stopped
    user: ${UID:-1000}:${GID:-1000}
    ports:
      - ${GRAFANA_PORT:-3000}:3000
    volumes:
      - path/to/grafana/data:/var/lib/grafana # 持久化数据目录
      - path/to/grafana/provisioning:/etc/grafana/provisioning:ro # 预置数据源
      - path/to/grafana/dashboards:/var/lib/grafana/dashboards:ro # 预置仪表盘
    environment:
      - TZ=Asia/Shanghai
      - GF_SECURITY_ADMIN_USER=${GRAFANA_ADMIN_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-changeme}
```

@tab 1Panel & OAuth

authentik [Integrate with Grafana](https://integrations.goauthentik.io/monitoring/grafana/)

```yaml
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
    image: grafana/grafana:latest
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

:::

## ⚙️ 配置指南

- 自动配置数据源

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
    jsonData:
      timeInterval: 15s
      queryTimeout: 30s
      httpMethod: POST
```

```yaml
apiVersion: 1

datasources:
  - name: InfluxDB
    type: influxdb
    access: proxy
    url: http://influxdb:8086
    jsonData:
      version: Flux
      organization: your_org
      defaultBucket: your_bucket
      tlsSkipVerify: true
    secureJsonData:
      token: your_token
```

- 自动配置仪表盘

```yaml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
      foldersFromFilesStructure: true
```
