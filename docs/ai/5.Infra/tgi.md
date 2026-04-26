---
title: TGI
createTime: 2025/10/13 10:33:22
permalink: /ai/infra/tgi/
---

## 简介

Text Generation Inference (TGI) 是 Hugging Face 推出的大模型推理服务框架，支持多种模型格式和服务优化特性。

查看官方文档 [Hugging Face TGI](https://huggingface.co/docs/text-generation-inference/index)

## 安装部署

### GPU

#### 系统要求

- CUDA: 11.8.0 / 12.1 / 12.6 / 13.x
- 驱动: NVIDIA Driver >= 525.60.13

#### 使用 Docker

```shell
# Intel GPU
docker pull ghcr.io/huggingface/text-generation-inference:2.0-intel

# NVIDIA GPU
docker pull ghcr.io/huggingface/text-generation-inference:latest
```

#### 使用 Python

```shell
# 1. 创建 Python 环境
uv venv --python 3.12 --seed
source .venv/bin/activate

# 2. 安装
uv pip install text-generation-inference

# 3. 下载模型
 huggingface-cli download meta-llama/Llama-3.1-8B-Instruct
```

### CPU

#### 使用 Docker

```shell
docker pull ghcr.io/huggingface/text-generation-inference:2.0-intel
```

## 使用说明

### 基本使用

```shell
# 启动服务
text-generation-launcher --model-id meta-llama/Llama-3.1-8B-Instruct
```

### Docker 部署模型

```shell
# NVIDIA GPU
docker run -d \
  --gpus all \
  --name tgi \
  -p 8000:80 \
  -v $PWD/data:/data \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id meta-llama/Llama-3.1-8B-Instruct

# Intel GPU
docker run -d \
  --device /dev/dri \
  --name tgi-intel \
  -p 8000:80 \
  -v $PWD/data:/data \
  ghcr.io/huggingface/text-generation-inference:2.0-intel \
  --model-id meta-llama/Llama-3.1-8B-Instruct
```

### 调用示例

```shell
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/Llama-3.1-8B-Instruct",
    "messages": [
      {"role": "user", "content": "请介绍一下你自己。"}
    ],
    "temperature": 0.7,
    "max_tokens": 100
  }'
```

## 参考样例

### DeepSeek

::: tip
通过 [HF-Mirror](https://hf-mirror.com/) 提前下载模型文件
:::

1. 部署 `OpenAI` 兼容服务

```shell
docker run -d \
  --gpus all \
  --name tgi-deepseek \
  -p 8000:80 \
  -v /path/to/your/models:/data \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id deepseek-ai/DeepSeek-V2-Lite-Chat
```

2. 验证效果

```shell
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-ai/DeepSeek-V2-Lite-Chat",
    "messages": [
      {"role": "user", "content": "请介绍一下你自己。"}
    ],
    "temperature": 0.7,
    "max_tokens": 100
  }'
```