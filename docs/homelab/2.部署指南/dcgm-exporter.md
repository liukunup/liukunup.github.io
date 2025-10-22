---
title: DCGM-Exporter
tags:
  - nvidia
createTime: 2025/10/18 00:00:00
permalink: /homelab/deploy/dcgm-exporter/
---

::tdesign:logo-github-filled:: [DCGM-Exporter](https://github.com/NVIDIA/dcgm-exporter)

::logos:grafana:: [Grafana Dashboard](https://grafana.com/grafana/dashboards/12239) use `12239`

## 部署指南

::: tabs

@tab:active Docker

```shell
export DCGM_VERSION=4.4.1-4.6.0
docker run -d \
  -p 9400:9400 \
  --gpus all \
  --cap-add SYS_ADMIN \
  --restart=unless-stopped \
  --name=dcgm-exporter \
  nvcr.io/nvidia/k8s/dcgm-exporter:${DCGM_VERSION}-ubuntu22.04
```

@tab Docker Compose

```yaml
services:
  dcgm-exporter:
    image: nvcr.io/nvidia/k8s/dcgm-exporter:{DCGM_VERSION:-4.4.1-4.6.0}-ubuntu22.04
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

@tab Helm

1. 添加仓库

```shell
helm repo add gpu-helm-charts https://nvidia.github.io/dcgm-exporter/helm-charts
```

2. 更新仓库

```shell
helm repo update
```

3. 安装部署

```shell
helm install --generate-name gpu-helm-charts/dcgm-exporter
```

:::

## 查看指标

```shell
curl localhost:9400/metrics
```
