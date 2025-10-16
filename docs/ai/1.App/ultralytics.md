---
title: Ultralytics YOLO
createTime: 2025/10/12 21:39:47
permalink: /ai/app/ultralytics/
---

查看[Ultralytics YOLO 文档](https://docs.ultralytics.com/zh/)

## 部署指南

::: tabs

@tab:active Pip 安装（推荐）

安装或更新 ultralytics 通过运行以下命令，使用 pip 安装软件包 pip install -U ultralytics。有关更多详细信息，请参阅 ultralytics 软件包，请访问 Python 包索引 (PyPI).

```shell
# Install the ultralytics package from PyPI
pip install ultralytics
```

@tab Conda 安装

Conda 可以用作 pip 的替代包管理器。有关更多详细信息，请访问 Anaconda。用于更新 conda 软件包的 Ultralytics feedstock 存储库可在 GitHub 上找到。

```shell
# Install the ultralytics package using conda
conda install -c conda-forge ultralytics
```

@tab Git 克隆

@tab Docker

```shell
# Set image name as a variable
t=ultralytics/ultralytics:latest

# Pull the latest ultralytics image from Docker Hub
sudo docker pull $t

# Run the ultralytics image in a container with GPU support
sudo docker run -it --ipc=host --runtime=nvidia --gpus all $t            # all GPUs
sudo docker run -it --ipc=host --runtime=nvidia --gpus '"device=2,3"' $t # specify GPUs
```

:::

## 使用说明
