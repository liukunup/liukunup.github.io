---
title: MinerU
tags:
  - OCR
createTime: 2025/10/10 00:00:00
permalink: /homelab/deploy/mineru/
---

查看[MinerU官方文档](https://opendatalab.github.io/MinerU/zh/)

## 前置条件

| **解析后端** | **pipeline** | **vlm-transformers** | **vlm-vllm** |
|---|---|---|---|
| 操作系统 | Linux / Windows / macOS | Linux / Windows | Linux / Windows (via WSL2) |
| CPU推理支持 | ✅ | ❌ | ❌ |
| GPU要求 | Turing及以后架构，6G显存以上或Apple Silicon | Turing及以后架构，8G显存以上 | 同vlm-transformers |
| 内存要求 | 最低16G以上，推荐32G以上 | - | - |
| 磁盘空间要求 | 20G以上，推荐使用SSD | - | -|
| Python版本 | 3.10-3.13 | - | - |

## 部署指南

### **使用pip或uv安装 MinerU**

```shell
pip install --upgrade pip -i https://mirrors.aliyun.com/pypi/simple
pip install uv -i https://mirrors.aliyun.com/pypi/simple
uv pip install -U "mineru[core]" -i https://mirrors.aliyun.com/pypi/simple 
```

::: tip
最简单的命令行调用方式

```shell
mineru -p <input_path> -o <output_path>
```

您可以通过命令行、API、WebUI等多种方式使用MinerU进行PDF解析，具体使用方法请参考[使用指南](https://opendatalab.github.io/MinerU/zh/usage/)。
:::

### **通过源码安装 MinerU**

```shell
git clone https://github.com/opendatalab/MinerU.git
cd MinerU
uv pip install -e .[core] -i https://mirrors.aliyun.com/pypi/simple
```

::: tip
mineru[core]包含除vllm加速外的所有核心功能，兼容Windows / Linux / macOS系统，适合绝大多数用户。 如果您有使用vllm加速VLM模型推理，或是在边缘设备安装轻量版client端等需求，可以参考文档扩展模块安装指南。
:::

### **使用 Dockerfile 构建镜像**

```shell
wget https://gcore.jsdelivr.net/gh/opendatalab/MinerU@master/docker/china/Dockerfile
docker build -t mineru-vllm:latest -f Dockerfile .
```

::: warning
Dockerfile默认使用vllm/vllm-openai:v0.10.1.1作为基础镜像， 该版本的vLLM v1 engine对显卡型号支持有限，如您无法在Turing及更早架构的显卡上使用vLLM加速推理，可通过更改基础镜像为vllm/vllm-openai:v0.10.2来解决该问题。
:::

Docker说明

Mineru的docker使用了vllm/vllm-openai作为基础镜像，因此在docker中默认集成了vllm推理加速框架和必需的依赖环境。因此在满足条件的设备上，您可以直接使用vllm加速VLM模型推理。

::: note
使用vllm加速VLM模型推理需要满足的条件是：

- 设备包含Turing及以后架构的显卡，且可用显存大于等于8G。
- 物理机的显卡驱动应支持CUDA 12.8或更高版本，可通过nvidia-smi命令检查驱动版本。
- docker中能够访问物理机的显卡设备。
:::

### **启动 Docker 容器**

```shell
docker run --gpus all \
  --shm-size 32g \
  -p 30000:30000 -p 7860:7860 -p 8000:8000 \
  --ipc=host \
  -it mineru-vllm:latest \
  /bin/bash
```

执行该命令后，您将进入到Docker容器的交互式终端，并映射了一些端口用于可能会使用的服务，您可以直接在容器内运行MinerU相关命令来使用MinerU的功能。 您也可以直接通过替换/bin/bash为服务启动命令来启动MinerU服务，详细说明请参考通过命令启动服务。

## 使用说明

我们提供了compose.yml文件，您可以通过它来快速启动MinerU服务。

```shell
# 下载 compose.yaml 文件
wget https://gcore.jsdelivr.net/gh/opendatalab/MinerU@master/docker/compose.yaml
```

::: note
- compose.yaml文件中包含了MinerU的多个服务配置，您可以根据需要选择启动特定的服务。
- 不同的服务可能会有额外的参数配置，您可以在compose.yaml文件中查看并编辑。
- 由于vllm推理加速框架预分配显存的特性，您可能无法在同一台机器上同时运行多个vllm服务，因此请确保在启动vlm-vllm-server服务或使用vlm-vllm-engine后端时，其他可能使用显存的服务已停止。
:::

---

### **启动 vllm-server 服务**

并通过vlm-http-client后端连接vllm-server

```shell
docker compose -f compose.yaml --profile vllm-server up -d
```

::: tip
在另一个终端中通过http client连接vllm server（只需cpu与网络，不需要vllm环境）
```shell
mineru -p <input_path> -o <output_path> -b vlm-http-client -u http://<server_ip>:30000
```
:::

---

### **启动 Web API 服务**

```shell
docker compose -f compose.yaml --profile api up -d
```

::: tip
在浏览器中访问 http://<server_ip>:8000/docs 查看API文档。
:::

---

### **启动 Gradio WebUI 服务**

```shell
docker compose -f compose.yaml --profile gradio up -d
```

::: tip
- 在浏览器中访问 http://<server_ip>:7860 使用 Gradio WebUI。
- 访问 http://<server_ip>:7860/?view=api 使用 Gradio API。
:::
