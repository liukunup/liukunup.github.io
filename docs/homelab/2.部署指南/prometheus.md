---
title: Prometheus
tags:
  - monitoring
createTime: 2025/10/27 09:46:50
permalink: /homelab/deploy/prometheus/
---

[Prometheus Docs](https://prometheus.io/docs/introduction/overview/)

![Architecture](https://prometheus.io/assets/docs/architecture.svg)

## 🚀 部署指南

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

## ⚙️ 配置样例

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

    ```yaml
    scrape_configs:

      - job_name: 'node-exporter'
        scrape_interval: 15s
        static_configs:                 #  [!code --]
          - targets:                    #  [!code --]
            - 'server.homelab.lan:9100' #  [!code --]
        file_sd_configs:                                     #  [!code ++]
          - files:                                           #  [!code ++]
              - '/etc/prometheus/targets/node-exporters.yml' #  [!code ++]
            refresh_interval: 1m                             #  [!code ++]
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

### [cAdvisor](https://github.com/google/cadvisor)

::: steps

1. 部署

    - Docker

    ```shell
    VERSION=v0.49.1 # use the latest release version from https://github.com/google/cadvisor/releases
    sudo docker run \
      --volume=/:/rootfs:ro \
      --volume=/var/run:/var/run:ro \
      --volume=/sys:/sys:ro \
      --volume=/var/lib/docker/:/var/lib/docker:ro \
      --volume=/dev/disk/:/dev/disk:ro \
      --publish=8080:8080 \
      --detach=true \
      --name=cadvisor \
      --privileged \
      --device=/dev/kmsg \
      gcr.io/cadvisor/cadvisor:$VERSION
    ```

    - Docker Compose

    ```yaml
    services:
      cadvisor:
        image: gcr.io/cadvisor/cadvisor:${VERSION:-v0.49.1} # use the latest release version from https://github.com/google/cadvisor/releases
        container_name: cadvisor
        privileged: true
        ports:
          - "8080:8080"
        volumes:
          - '/:/rootfs:ro'
          - '/var/run:/var/run:ro'
          - '/sys:/sys:ro'
          - '/var/lib/docker/:/var/lib/docker:ro'
          - '/dev/disk/:/dev/disk:ro'
        devices:
          - '/dev/kmsg:/dev/kmsg'
    ```

2. 配置

    ```yaml
    scrape_configs:

      - job_name: 'cadvisor'
        scrape_interval: 15s
        static_configs:
          - targets:
            - 'server.homelab.lan:8080'
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

3. 重启

    重启Prometheus服务以使配置生效，或采用文件服务发现。

:::

### [DCGM-Exporter](https://github.com/NVIDIA/dcgm-exporter)

::tdesign:logo-github-filled:: [DCGM-Exporter](https://github.com/NVIDIA/dcgm-exporter)

::logos:grafana:: [Grafana Dashboard](https://grafana.com/grafana/dashboards/12239) use `12239`

::: steps

1. 部署

    - Docker

    ```shell
    VERSION=4.4.1-4.6.0
    docker run -d \
      -p 9400:9400 \
      --gpus all \
      --cap-add SYS_ADMIN \
      --restart=unless-stopped \
      --name=dcgm-exporter \
      nvcr.io/nvidia/k8s/dcgm-exporter:${VERSION}-ubuntu22.04
    ```

    - Docker Compose

    ```yaml
    services:
      dcgm-exporter:
        image: nvcr.io/nvidia/k8s/dcgm-exporter:{VERSION:-4.4.1-4.6.0}-ubuntu22.04
        container_name: dcgm-exporter
        restart: unless-stopped
        ports:
          - "9400:9400"
        deploy:
          resources:
            reservations:
              devices:
                - driver: nvidia
                  capabilities: [utility]
                  count: all
        cap_add:
          - SYS_ADMIN
    ```

    - Helm

    ```shell
    # 添加仓库
    helm repo add gpu-helm-charts https://nvidia.github.io/dcgm-exporter/helm-charts
    # 更新仓库
    helm repo update
    # 安装部署
    helm install --generate-name gpu-helm-charts/dcgm-exporter
    ```

2. 配置

    ```yaml
    scrape_configs:

      - job_name: 'dcgm-exporter'
        scrape_interval: 15s
        metrics_path: /metrics
        static_configs:
          - targets:
            - 'server.homelab.lan:9400'
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

3. 重启

    重启Prometheus服务以使配置生效，或采用文件服务发现。

:::

### [nvidia_gpu_exporter](https://github.com/utkuozdemir/nvidia_gpu_exporter)

::: steps

1. 部署

    ```shell
    docker run -d \
      --name nvidia_smi_exporter \
      --restart unless-stopped \
      --device /dev/nvidiactl:/dev/nvidiactl \
      --device /dev/nvidia0:/dev/nvidia0 \
      -v /usr/lib/x86_64-linux-gnu/libnvidia-ml.so:/usr/lib/x86_64-linux-gnu/libnvidia-ml.so \
      -v /usr/lib/x86_64-linux-gnu/libnvidia-ml.so.1:/usr/lib/x86_64-linux-gnu/libnvidia-ml.so.1 \
      -v /usr/bin/nvidia-smi:/usr/bin/nvidia-smi \
      -p 9835:9835 \
      utkuozdemir/nvidia_gpu_exporter:1.3.1
    ```

2. 配置

3. 重启

    重启Prometheus服务以使配置生效，或采用文件服务发现。

:::

### MinIO

::: steps

1. 部署

    不涉及。

2. 配置

    - 目录结构

    ```plaintext
    /etc/prometheus/
    ├── prometheus.yml
    ├── file_sd/
    │   └── minio-targets.yml
    └── secrets/
        ├── minio-token-prod
        └── minio-token-staging
    ```

    ```yaml
    scrape_configs:

      - job_name: 'minio-cluster'
        scrape_interval: 15s
        metrics_path: /minio/v2/metrics/cluster
        scheme: https
        tls_config:
          insecure_skip_verify: false
        file_sd_configs:
          - files:
              - '/etc/prometheus/file_sd/minio-targets.yml'
            refresh_interval: 1m
        relabel_configs:
          # 从目标元数据中提取 Bearer Token 文件路径
          - source_labels: [__meta_minio_auth_token_file]
            target_label: __bearer_token_file
            replacement: /etc/prometheus/secrets/${1}
          # 动态配置 TLS
          - source_labels: [__meta_minio_tls_skip_verify]
            target_label: __tls_insecure_skip_verify
            regex: "false"
            replacement: "true"
          # 环境标识
          - source_labels: [__meta_minio_environment]
            target_label: environment
          - source_labels: [__meta_minio_cluster]
            target_label: cluster
          - source_labels: [__meta_minio_region]
            target_label: region
          # 使用 域名 或 IP地址 作为 实例名
          - source_labels: [__address__]
            target_label: instance
            regex: '([^:]+):\d+'  # 捕获域名或IP地址
            replacement: '${1}'
          - target_label: job
            replacement: "minio"
    ```

    - /etc/prometheus/file_sd/minio-targets.yml

    ```yaml
    - targets:
        - 'minio.homelab.lan:9000'
      labels:
        # 环境标识
        environment: 'prod'
        cluster: 'xxx'
        region: 'us-east-1'
        # 元数据配置
        __meta_minio_auth_token_file: 'minio-token-prod'
        __meta_minio_tls_skip_verify: 'false'

    - targets:
        - 'minio.staging.homelab.lan:9000'
      labels:
        environment: 'staging'
        cluster: 'yyy'
        region: 'us-east-1'
        __meta_minio_auth_token_file: 'minio-token-staging'
        __meta_minio_tls_skip_verify: 'true'

    - targets:
        - 'minio.testing.homelab.lan:9000'
      labels:
        environment: 'testing'
        cluster: 'zzz'
        region: 'us-east-1'
        __meta_minio_auth_token_file: 'minio-token-testing'
        __meta_minio_tls_skip_verify: 'true'
    ```

3. 重启

    重启Prometheus服务以使配置生效，或采用文件服务发现。

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

    重启Prometheus服务以使配置生效，或采用文件服务发现。

:::

### [Prometheus Valkey & Redis Metrics Exporter](https://github.com/oliver006/redis_exporter)

::: steps

1. 部署

    ```shell
    docker run -d \
      -p 9121:9121 \
      --name redis_exporter \
      oliver006/redis_exporter
    ```

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

    重启Prometheus服务以使配置生效，或采用文件服务发现。

:::

### [PostgreSQL Server Exporter](https://github.com/prometheus-community/postgres_exporter)

::: steps

1. 部署

    ```shell
    # Start an example database
    docker run --net=host -it --rm -e POSTGRES_PASSWORD=password postgres
    # Connect to it
    docker run \
      --net=host \
      -e DATA_SOURCE_URI="localhost:5432/postgres?sslmode=disable" \
      -e DATA_SOURCE_USER=postgres \
      -e DATA_SOURCE_PASS=password \
      quay.io/prometheuscommunity/postgres-exporter
    ```

2. 配置

    ```yaml
    scrape_configs:

      - job_name: postgres
        scrape_interval: 15s
        metrics_path: /probe
        static_configs:
          - targets:
            - server1:5432
            - server2:5432
        relabel_configs:
          - source_labels: [__address__]
            target_label: __param_target
          - source_labels: [__param_target]
            target_label: instance
          - target_label: __address__
            replacement: 127.0.0.1:9116  # The postgres exporter's real hostname:port.
    ```

3. 重启

    重启Prometheus服务以使配置生效，或采用文件服务发现。

:::

### [APISIX prometheus plugin](https://apisix.apache.org/docs/apisix/plugins/prometheus/)

::: steps

1. 部署

    修改`config.yaml`配置文件

    ```yaml
    plugin_attr:
      prometheus:                               # Plugin: prometheus attributes
        export_uri: /apisix/prometheus/metrics  # Set the URI for the Prometheus metrics endpoint.
        metric_prefix: apisix_                  # Set the prefix for Prometheus metrics generated by APISIX.
        enable_export_server: true              # Enable the Prometheus export server.
        export_addr:                            # Set the address for the Prometheus export server.
          ip: 127.0.0.1                         # Set the IP.
          port: 9091                            # Set the port.
        # metrics:                              # Create extra labels for metrics.
        #  http_status:                         # These metrics will be prefixed with `apisix_`.
        #    extra_labels:                      # Set the extra labels for http_status metrics.
        #      - upstream_addr: $upstream_addr
        #      - status: $upstream_status
        #    expire: 0                          # The expiration time of metrics in seconds.
                                                # 0 means the metrics will not expire.
        #  http_latency:
        #    extra_labels:                      # Set the extra labels for http_latency metrics.
        #      - upstream_addr: $upstream_addr
        #    expire: 0                          # The expiration time of metrics in seconds.
                                                # 0 means the metrics will not expire.
        #  bandwidth:
        #    extra_labels:                      # Set the extra labels for bandwidth metrics.
        #      - upstream_addr: $upstream_addr
        #    expire: 0                          # The expiration time of metrics in seconds.
                                                # 0 means the metrics will not expire.
        # default_buckets:                      # Set the default buckets for the `http_latency` metrics histogram.
        #   - 10
        #   - 50
        #   - 100
        #   - 200
        #   - 500
        #   - 1000
        #   - 2000
        #   - 5000
        #   - 10000
        #   - 30000
        #   - 60000
        #   - 500
    ```

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

    重启Prometheus服务以使配置生效，或采用文件服务发现。

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

    重启Prometheus服务以使配置生效，或采用文件服务发现。

:::

### [Windows exporter](https://github.com/prometheus-community/windows_exporter)

::: steps

1. 部署


    ```shell
    docker run -d \
      --restart=unless-stopped \
      --name=windows-exporter \
      prometheuscommunity/windows-exporter
    ```

2. 配置

3. 重启

    重启Prometheus服务以使配置生效，或采用文件服务发现。

:::


## 💻 最近实践

### 🔥 主机&容器

::: steps

1. 部署

    ```yaml :collapsed-lines
    networks:
      monitoring:
        driver: bridge

    services:
      node-exporter:  # Node Exporter - 收集主机系统指标
        image: quay.io/prometheus/node-exporter:latest
        container_name: node-exporter
        restart: unless-stopped
        ports:
          - "9100:9100"
        volumes:
          - /:/host:ro,rslave
        command:
          - --path.rootfs=/host
          - --path.procfs=/host/proc
          - --path.sysfs=/host/sys
          - --collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)
        networks:
          - monitoring

      cadvisor:  # cAdvisor - 收集容器指标
        image: gcr.io/cadvisor/cadvisor:v0.49.1
        container_name: cadvisor
        restart: unless-stopped
        privileged: true
        ports:
          - "8080:8080"
        volumes:
          - /:/rootfs:ro
          - /var/run:/var/run:ro
          - /sys:/sys:ro
          - /var/lib/docker/:/var/lib/docker:ro
          - /dev/disk/:/dev/disk:ro
        devices:
          - /dev/kmsg:/dev/kmsg
        networks:
          - monitoring
    ```

2. 配置

    ```yaml :collapsed-lines
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

      - job_name: 'cadvisor'
        scrape_interval: 15s
        static_configs:
          - targets:
            - 'server.homelab.lan:8080'
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

3. 数据看板

:::

### 1Panel 数据库三套件

::: steps

1. 部署

    ```yaml :collapsed-lines

    ```

2. 配置

    ```yaml :collapsed-lines
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

      - job_name: postgres
        scrape_interval: 15s
        metrics_path: /probe
        static_configs:
          - targets:
            - server1:5432
            - server2:5432
        relabel_configs:
          - source_labels: [__address__]
            target_label: __param_target
          - source_labels: [__param_target]
            target_label: instance
          - target_label: __address__
            replacement: 127.0.0.1:9116  # The postgres exporter's real hostname:port.

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

3. 数据看板

:::

### GPU

::: steps

1. 部署

    ```yaml :collapsed-lines
    networks:
      monitoring:
        driver: bridge

    services:
      dcgm-exporter:  # DCGM Exporter - 收集 NVIDIA GPU 指标
        image: nvcr.io/nvidia/k8s/dcgm-exporter:4.4.1-4.6.0-ubuntu22.04
        container_name: dcgm-exporter
        restart: unless-stopped
        ports:
          - "9400:9400"
        deploy:
          resources:
            reservations:
              devices:
                - driver: nvidia
                  capabilities: [utility]
                  count: all
        cap_add:
          - SYS_ADMIN
        networks:
          - monitoring
    ```

2. 配置

    ```yaml :collapsed-lines
    scrape_configs:

      - job_name: 'dcgm-exporter'
        scrape_interval: 15s
        metrics_path: /metrics
        static_configs:
          - targets:
            - 'server.homelab.lan:9400'
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

3. 数据看板

:::
