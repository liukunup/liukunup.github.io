---
title: LLM 推荐配置
createTime: 2025/10/15 16:48:57
permalink: /homelab/architecture/ml/
---

## 推荐配置

**CPU 16C** + **MEM 32G** + **DISK 200G**

**显卡**

- **RTX2080Ti 24G (魔改版)** 经济实惠，但很可惜是 ==Compute Capability 7.5==

## 操作系统

- ==Ubuntu 24.04 x86==

## 环境搭建

> 记得`sudo -i`切换到`root`进行安装哦

::: steps
1. [Docker](/docs/homelab/2.部署指南/docker.md)

    推荐通过`1Panel`进行附带安装；

    ```shell
    bash -c "$(curl -sSL https://resource.fit2cloud.com/1panel/package/v2/quick_start.sh)"
    ```

2. [Nvidia CUDA Toolkit](/docs/homelab/2.部署指南/cuda.md)

    推荐安装`12.8.1`版本；

3. [Nvidia Container Toolkit](/docs/homelab/2.部署指南/nvidia-container-toolkit.md)

    推荐安装`1.18.0-1`版本；

4. 安装 Miniconda 3

    推荐安装到`/opt/miniconda3`目录，并开启自动激活。

    ``` shell
    curl -O https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/Miniconda3-latest-Linux-x86_64.sh
    bash Miniconda3-latest-Linux-x86_64.sh
    ```

    安装依赖包

    ```shell
    # 激活环境
    source /root/.bashrc
    # 安装依赖
    pip install jupyterlab -i https://mirrors.aliyun.com/pypi/simple
    pip install modelscope -i https://mirrors.aliyun.com/pypi/simple
    pip install "huggingface_hub[cli]" -i https://mirrors.aliyun.com/pypi/simple
    ```

5. 配置 `/etc/docker/daemon.json`

    最终版本如下:

    ```json
    {
        "registry-mirrors": [
            "https://docker.1panel.live",
            "https://docker.realme.icu",
            "https://reg.homelab.lan"
        ],
        "insecure-registries": [
            "http://quts.homelab.lan:15000"
        ],
        "runtimes": {
            "nvidia": {
                "args": [],
                "path": "nvidia-container-runtime"
            }
        },
        "exec-opts": ["native.cgroupdriver=cgroupfs"]
    }
    ```

    重载配置以生效

    ```shell
    systemctl daemon-reload && systemctl restart docker
    ```

6. 更新 & 清理

    ```shell
    # 更新
    apt-get update && apt-get upgrade
    # 清理
    apt-get clean && apt-get autoremove
    rm -rf /tmp/*
    rm -rf ~/.cache/*
    rm -rf /var/log/*
    ```
:::

## 监控方案

::: steps

1. compose.yaml

    ```yaml
    networks:
      monitoring:
        driver: bridge

    services:
      # Node Exporter - 收集主机系统指标
      node-exporter:
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

      # DCGM Exporter - 收集 NVIDIA GPU 指标
      dcgm-exporter:
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

      # cAdvisor - 收集容器指标
      cadvisor:
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

    - 1Panel 请替换网络

    ```yaml
    networks:
      1panel-network:
        external: true
    ```

2. 拉起容器

    ```shell
    docker compose -p monitoring up -d
    ```
