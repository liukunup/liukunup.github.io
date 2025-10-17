---
title: DCGM-Exporter
createTime: 2025/10/18 00:00:00
permalink: /homelab/deploy/dcgm-exporter/
---

## 部署指南

### 通过 docker 方式部署

```shell
docker run -d \
  -p 9400:9400 \
  --gpus all \
  --cap-add SYS_ADMIN \
  --restart=unless-stopped \
  --name=dcgm-exporter \
  nvcr.io/nvidia/k8s/dcgm-exporter:4.4.1-4.6.0-ubuntu22.04
```

### 通过 docker compose 方式部署

```yaml
services:
  dcgm-exporter:
    image: nvcr.io/nvidia/k8s/dcgm-exporter:4.4.1-4.6.0-ubuntu22.04
    container_name: dcgm-exporter
    restart: unless-stopped
    runtime: nvidia
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]
    cap_add:
      - SYS_ADMIN
    ports:
      - "9400:9400"
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
```

### 通过 helm 方式部署

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
