---
title: NVIDIA Container Toolkit
tags:
  - nvidia
  - Container Toolkit
createTime: 2025/10/11 23:56:08
permalink: /homelab/deploy/nvidia-container-toolkit/
---

官方文档见[Installing the NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)

::: warning
请提前安装[Nvidia CUDA Toolkit](cuda.md)
:::

1. 配置生产环境的软件仓库

```shell
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
```

(可选)使用实验特性

```shell
sudo sed -i -e '/experimental/ s/^#//g' /etc/apt/sources.list.d/nvidia-container-toolkit.list
```

2. 更新软件包

```shell
sudo apt-get update
```

3. 安装`NVIDIA Container Toolkit`包

```shell
# 1.设置版本号
export NVIDIA_CONTAINER_TOOLKIT_VERSION=1.17.8-1
# 2.开始安装
sudo apt-get install -y \
    nvidia-container-toolkit=${NVIDIA_CONTAINER_TOOLKIT_VERSION} \
    nvidia-container-toolkit-base=${NVIDIA_CONTAINER_TOOLKIT_VERSION} \
    libnvidia-container-tools=${NVIDIA_CONTAINER_TOOLKIT_VERSION} \
    libnvidia-container1=${NVIDIA_CONTAINER_TOOLKIT_VERSION}
```

4. 配置容器运行时

```shell
# 1.设置容器运行时
sudo nvidia-ctk runtime configure --runtime=docker
# 2.重启docker服务
sudo systemctl restart docker
```

5. 验证

```shell
sudo docker run --rm --runtime=nvidia --gpus all ubuntu nvidia-smi
```
