---
title: Prometheus
tags:
  - monitoring
createTime: 2025/10/27 09:46:50
permalink: /homelab/deploy/prometheus/
---

[Prometheus Docs](https://prometheus.io/docs/introduction/overview/)

![Architecture](https://prometheus.io/assets/docs/architecture.svg)

## 部署指南

::: tabs

@tab:active Docker

```shell
docker run -d \
  -p 9090:9090 \
  -v /path/to/config:/etc/prometheus \  # 挂载配置文件目录
  -v /path/to/data:/prometheus \        # 挂载数据目录，确保数据持久化
  -e TZ=Asia/Shanghai \
  --memory="2g" \
  --cpus="1.0" \
  --user="$(id -u):$(id -g)" \
  --restart=unless-stopped \
  --name=prometheus \
  prom/prometheus:latest \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/prometheus \
  --storage.tsdb.retention.time=30d \
  --web.enable-lifecycle
```

@tab Docker Compose

查看当前用户的`UID`和`GID`

```shell
id
```

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    user: "${UID}:${GID}"
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - /path/to/config:/etc/prometheus  # 挂载配置文件目录
      - /path/to/data:/prometheus        # 挂载数据目录，确保数据持久化
    environment:
      - TZ=Asia/Shanghai
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
    deploy:
      resources:
        limits:
          memory: '2g'
          cpus: '1.0'
```

:::

## 配置样例

### Prometheus (itself)

```yaml
global:
  scrape_interval: 15s      # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s  # Evaluate rules every 15 seconds. The default is every 1 minute.
  scrape_timeout: 10s       # scrape_timeout is set to the global default (10s).

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

# Load rules once and periodically evaluate them according to the global 'evaluation_interval'.
rule_files:
# - "first_rules.yml"
# - "second_rules.yml"

# A scrape configuration containing exactly one endpoint to scrape:
# Here it's Prometheus itself.
scrape_configs:

  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: 'prometheus'
    scrape_interval: 30s
    static_configs:
      - targets: [ 'localhost:9090' ]
```

### [Node exporter](https://github.com/prometheus/node_exporter)

::: steps

1. 部署

    - Docker

    ```shell
    docker run -d \
      --net="host" \
      --pid="host" \
      -v "/:/host:ro,rslave" \
      --restart=unless-stopped \
      --name=node-exporter \
      quay.io/prometheus/node-exporter:latest \
      --path.rootfs=/host
    ```

    - Docker Compose

    ```yaml
    services:
      node-exporter:
        image: quay.io/prometheus/node-exporter:latest
        container_name: node-exporter
        restart: unless-stopped
        network_mode: host
        pid: host
        command:
          - '--path.rootfs=/host'
        volumes:
          - '/:/host:ro,rslave'
    ```

2. 配置

    ```yaml
    scrape_configs:

      - job_name: 'node-exporter'
        scrape_interval: 15s
        static_configs:
          - targets:
            - 'target.homelab.lan:9100'
        relabel_configs:
          # 使用 域名 或 IP地址 作为 实例名
          - source_labels: [__address__]
            target_label: instance
            regex: '([^:]+):\d+'  # 捕获域名或IP地址
            replacement: '${1}'
          # 如果匹配 *.homelab.lan 表达式则自动设置 主机名
          - source_labels: [instance]
            target_label: hostname
            regex: '(.+)\.homelab\.lan'
            replacement: '${1}'
    ```

3. 重启

    重启Prometheus服务以使配置生效，或采用文件服务发现，方法如下：

    ```yaml{5-8}
    scrape_configs:

      - job_name: 'node-exporter'
        scrape_interval: 15s
        file_sd_configs:
          - files:
              - '/etc/prometheus/targets/node-exporters.yml'
            refresh_interval: 1m
        relabel_configs:
          # 使用 域名 或 IP地址 作为 实例名
          - source_labels: [__address__]
            target_label: instance
            regex: '([^:]+):\d+'  # 捕获域名或IP地址
            replacement: '${1}'
          # 如果匹配 *.homelab.lan 表达式则设置 主机名
          - source_labels: [instance]
            target_label: hostname
            regex: '(.+)\.homelab\.lan'
            replacement: '${1}'
    ```

    - /etc/prometheus/targets/node-exporters.yml

    ```yaml
    - targets:
        - 'server1.homelab.lan:9100'
        - 'server2.homelab.lan:9100'
        - 'server3.homelab.lan:9100'
      labels:
        group: 'production'
    ```

:::

### cAdvisor

::: steps

1. 部署

2. 配置

  ```yaml
  scrape_configs:

    - job_name: 'cadvisor'
      scrape_interval: 15s
      static_configs:
        - targets:
          - 'docker.homelab.lan:8080'
          - 'standby.homelab.lan:8080'
          - 'quts.homelab.lan:8080'
          - 'gpu.homelab.lan:8080'
      relabel_configs:
        - source_labels: [job]
          target_label: job
          regex: '(.*)'
          replacement: 'node-exporter'
        - source_labels: [__address__]
          target_label: instance
          regex: '([^:]+)\.homelab\.lan:\d+'
          replacement: '${1}'
  ```

3. 重启

:::

### DCGM Exporter

::: steps

1. 部署

2. 配置

  ```yaml
  scrape_configs:

    - job_name: 'dcgm-exporter'
      scrape_interval: 15s
      metrics_path: /metrics
      static_configs:
        - targets:
          - 'gpu.homelab.lan:9400'
      relabel_configs:
        - source_labels: [__address__]
          target_label: instance
          regex: '([^:]+)\.homelab\.lan:\d+'
          replacement: '${1}'
  ```

3. 重启

:::

### MinIO

::: steps

1. 部署

2. 配置

  ```yaml
  scrape_configs:

    - job_name: 'minio-main'
      bearer_token: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJwcm9tZXRoZXVzIiwic3ViIjoiTGVoWEJvVlRoeXlEVTN2WiIsImV4cCI6NDkxMDk0MjkxNn0.WmoOYi0povXim89zN1D3LsbIF9Wb-UB6YgZalN01I3x0fnpjW7SEqDd3LW3JIYQwJ0N1SARXh51lDBOtC8DdmA
      metrics_path: /minio/v2/metrics/cluster
      scheme: https
      tls_config:
        insecure_skip_verify: true
      scrape_interval: 60s
      static_configs:
        - targets: ['minio.homelab.lan:9000']
          labels:
            instance: 'main'

    - job_name: 'minio-staging'
      bearer_token: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJwcm9tZXRoZXVzIiwic3ViIjoiTGVoWEJvVlRoeXlEVTN2WiIsImV4cCI6NDkxMDk0MzAxNX0.jHpV2ceWx00MklIsnrLqkCUj_2UmRm52xzUPknkS1tT_vOaw9wrZ_Byq0ZmSPAwW_e8W_Z5KXdHOgK3jAObYkg
      metrics_path: /minio/v2/metrics/cluster
      scheme: https
      tls_config:
        insecure_skip_verify: true
      scrape_interval: 60s
      static_configs:
        - targets: ['minio.staging.homelab.lan:9000']
          labels:
            instance: 'staging'
  ```

3. 重启

:::

### [MySQL Server Exporter](https://github.com/prometheus/mysqld_exporter)

::: steps

1. 部署

2. 配置

  ```yaml
  scrape_configs:

    - job_name: mysql
      scrape_interval: 30s
      metrics_path: /probe
      static_configs:
        - targets:
          - mysql.homelab.lan:3306
          - mysql.staging.homelab.lan:3306
      relabel_configs:
        - source_labels: [__address__]
          target_label: __param_target
          regex: '([^:]+)\.homelab\.lan:(\d+)'
          replacement: '${1}.homelab.lan:${2}'
        - source_labels: [__address__]
          target_label: instance
          regex: '([^:]+)\.homelab\.lan:\d+'
          replacement: '${1}'
        - target_label: __address__
          replacement: 'docker.homelab.lan:9104'
        - source_labels: [instance]
          target_label: environment
          regex: 'mysql\.staging'
          replacement: 'staging'
        - source_labels: [instance]
          target_label: environment
          regex: 'mysql\.homelab'
          replacement: 'prod'
        - target_label: service
          replacement: 'mysql'
        - target_label: db_system
          replacement: 'mysql'
  ```

3. 重启

:::

### [Prometheus Valkey & Redis Metrics Exporter](https://github.com/oliver006/redis_exporter)

::: steps

1. 部署

2. 配置

  ```yaml
  scrape_configs:

    - job_name: redis
      scrape_interval: 30s
      metrics_path: /scrape
      static_configs:
        - targets:
          - redis://redis.homelab.lan:6379
          - redis://redis.staging.homelab.lan:6379
      relabel_configs:
        - source_labels: [__address__]
          target_label: __param_target
          regex: 'redis://([^:]+\.homelab\.lan:\d+)'
          replacement: 'redis://${1}'
        - source_labels: [__param_target]
          target_label: instance
          regex: 'redis://([^:]+)\.homelab\.lan:\d+'
          replacement: '${1}'
        - target_label: __address__
          replacement: 'docker.homelab.lan:9121'
        - source_labels: [instance]
          target_label: environment
          regex: 'redis\.staging'
          replacement: 'staging'
        - source_labels: [instance]
          target_label: environment
          regex: 'redis\.homelab'
          replacement: 'prod'
        - target_label: job
          replacement: 'redis-exporter'
        - target_label: monitored_by
          replacement: 'redis_exporter'
  ```

3. 重启

:::

### [PostgreSQL Server Exporter](https://github.com/prometheus-community/postgres_exporter)

::: steps

1. 部署

2. 配置

  ```yaml
  scrape_configs:

    - job_name: postgres
      scrape_interval: 30s
      static_configs:
        - targets:
          - docker.homelab.lan:9187
          labels:
            component: 'database'
            db_type: 'postgresql'
  ```

3. 重启

:::

### [APISIX prometheus plugin](https://apisix.apache.org/docs/apisix/plugins/prometheus/)

::: steps

1. 部署

2. 配置

  ```yaml
  scrape_configs:

    - job_name: 'apisix'
      scrape_interval: 5s
      metrics_path: /apisix/prometheus/metrics
      static_configs:
        - targets:
          - 'apisix:9091'
          labels:
            service: 'apisix-gateway'
            component: 'api-gateway'
  ```

3. 重启

:::

### [Blackbox exporter](https://github.com/prometheus/blackbox_exporter)

::: steps

1. 部署

  Note: You may want to [enable ipv6 in your docker configuration](https://docs.docker.com/v17.09/engine/userguide/networking/default_network/ipv6/)

  ```shell
  docker run --rm \
    -p 9115/tcp \
    -v $(pwd):/config \
    --name blackbox_exporter \
    quay.io/prometheus/blackbox-exporter:latest \
    --config.file=/config/blackbox.yml
  ```

2. 配置

  ```yaml
  scrape_configs:

    - job_name: blackbox_all
      metrics_path: /probe
      params:
        module: [ http_2xx ]  # Look for a HTTP 200 response.
      dns_sd_configs:
        - names:
            - example.com
            - prometheus.io
          type: A
          port: 443
      relabel_configs:
        - source_labels: [__address__]
          target_label: __param_target
          replacement: https://$1/  # Make probe URL be like https://1.2.3.4:443/
        - source_labels: [__param_target]
          target_label: instance
        - target_label: __address__
          replacement: 127.0.0.1:9115  # The blackbox exporter's real hostname:port.
        - source_labels: [__meta_dns_name]
          target_label: __param_hostname  # Make domain name become 'Host' header for probe requests
        - source_labels: [__meta_dns_name]
          target_label: vhost  # and store it in 'vhost' label
  ```

3. 重启

:::
