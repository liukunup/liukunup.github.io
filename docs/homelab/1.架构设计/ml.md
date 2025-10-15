---
title: Machine Learning
createTime: 2025/10/15 16:48:57
permalink: /homelab/architecture/ml/
---

## 硬件选型

- CPU 16C
- RAM 32G
- RTX2080Ti 24G (魔改版)
- DISK 100G

## 操作系统

- Ubuntu 24.04

## 环境搭建

### Nvidia

[Nvidia CUDA Toolkit](/docs/homelab/2.部署指南/cuda.md)

### Container

[Docker](/docs/homelab/2.部署指南/docker.md)

[Nvidia Container Toolkit](/docs/homelab/2.部署指南/nvidia-container-toolkit.md)

### Software

- Miniconda3

``` shell
curl -O https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
```

```shell
conda create -n ML python=3.12
conda activate ML
```

- Jupyter Notebook

```shell
conda install jupyter notebook
```

- ModelScope

```shell
pip install modelscope
```

- Hugging Face

```shell
pip install huggingface_hub 
```
