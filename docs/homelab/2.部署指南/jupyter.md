---
title: Jupyter Notebook
tags:
  - data-science
  - notebook
createTime: 2026/04/25 00:00:00
permalink: /homelab/deploy/jupyter/
---

Jupyter Notebook/Lab 是一个开源的交互式开发环境，支持 Python、R、Julia 等多种编程语言，常用于数据分析、机器学习和科学计算。

## 准备工作

创建用于存储工作文件的持久化目录：

```bash
mkdir -p /share/Container/jupyter
```

## 启动服务

::: tabs

@tab:active Docker Compose

```yaml
services:
  jupyter:
    image: jupyter/minimal-notebook:latest
    container_name: jupyter
    restart: unless-stopped
    ports:
      - 8888:8888
    environment:
      JUPYTER_TOKEN: my-secret-token
      TZ: Asia/Shanghai
      LANG: en_US.UTF-8
      GRANT_SUDO: yes
    volumes:
      - /share/Container/jupyter:/home/jovyan/work
    command: start-notebook.sh --NotebookApp.password='' --NotebookApp.token='my-secret-token'
```

@tab Docker CLI

```bash
docker run -d \
  --name jupyter \
  --restart unless-stopped \
  -p 8888:8888 \
  -e JUPYTER_TOKEN=my-secret-token \
  -e TZ=Asia/Shanghai \
  -e LANG=en_US.UTF-8 \
  -e GRANT_SUDO=yes \
  -v /share/Container/jupyter:/home/jovyan/work \
  jupyter/minimal-notebook:latest \
  start-notebook.sh --NotebookApp.password='' --NotebookApp.token='my-secret-token'
```

:::

## 常用变体镜像

| 镜像 | 说明 | 典型场景 |
|---|---|---|
| `jupyter/minimal-notebook` | 最小化 Python 环境 | 基础使用 |
| `jupyter/scipy-notebook` | 含 SciPy 生态 | 数据分析 |
| `jupyter/tensorflow-notebook` | 含 TensorFlow | 深度学习 |
| `jupyter/pytorch-notebook` | 含 PyTorch | 深度学习 |
| `jupyter/datascience-notebook` | R + Python | 数据科学 |

切换镜像只需修改 `image` 字段，其他配置保持不变。

## 常用命令

### 访问服务

启动后访问 `http://<your-host>:8888`，输入 token `my-secret-token` 登录。

### 验证容器运行状态

```bash
docker ps | grep jupyter
```

### 进入容器终端

```bash
docker exec -it jupyter bash
```

### 安装额外依赖

```bash
docker exec -it jupyter pip install numpy pandas matplotlib
```

### 清理

```bash
# 停止并删除容器（保留数据）
docker stop jupyter && docker rm jupyter

# 删除容器并删除数据
docker stop jupyter && docker rm jupyter
sudo rm -rf /share/Container/jupyter
```

## 参考文档

- [Jupyter Docker Stacks](https://jupyter-docker-stacks.readthedocs.io/)
- [jupyter/minimal-notebook - Docker Hub](https://hub.docker.com/r/jupyter/minimal-notebook)
