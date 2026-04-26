---
title: LMDeploy
createTime: 2025/10/13 10:33:22
permalink: /ai/infra/lmdeploy/
---

## 简介

LMDeploy 是一个用于压缩、部署和服务 LLM 的工具包，由上海人工智能实验室开发。它提供了完整的 LLM 部署流程，包括模型量化、服务和推理。

查看官方文档 [LMDeploy](https://lmdeploy.readthedocs.io/zh-cn/latest/)

## 安装部署

### GPU

#### 系统要求

- Python: >= 3.8
- CUDA: 11.7 / 12.1 / 12.6

#### 使用 pip

```shell
# 1. 创建 Python 环境
uv venv --python 3.12 --seed
source .venv/bin/activate

# 2. 安装
uv pip install lmdeploy
```

#### 使用 Docker

```shell
docker pull openmmlab/lmdeploy:latest
```

## 使用说明

### 模型量化

```shell
# 4bit 量化
lmdeploy lite convert /path/to/llama-7b-hf --dst-path /path/to/llama-7b-4bit
```

### 部署模型

#### 使用命令行

```shell
# 启动 API 服务
lmdeploy serve api_server /path/to/llama-7b-4bit --server-name 0.0.0.0 --port 8000
```

#### 使用 Docker

```shell
docker run -d \
  --gpus all \
  --name lmdeploy \
  -p 8000:8000 \
  -v /path/to/your/models:/model \
  openmmlab/lmdeploy:latest \
  lmdeploy serve api_server /model --server-name 0.0.0.0 --port 8000
```

### 调用示例

```shell
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-7b",
    "messages": [
      {"role": "user", "content": "请介绍一下你自己。"}
    ],
    "temperature": 0.7,
    "max_tokens": 100
  }'
```

## 参考样例

### Qwen

::: tip
通过 [HF-Mirror](https://hf-mirror.com/) 提前下载模型文件
:::

1. 部署 `OpenAI` 兼容服务

```shell
docker run -d \
  --gpus all \
  --name lmdeploy-qwen \
  -p 8000:8000 \
  -v /path/to/your/models:/model \
  openmmlab/lmdeploy:latest \
  lmdeploy serve api_server /model/Qwen2.5-0.5B-Instruct
```

2. 验证效果

```shell
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen2.5-0.5B-Instruct",
    "messages": [
      {"role": "user", "content": "请介绍一下你自己。"}
    ],
    "temperature": 0.7,
    "max_tokens": 100
  }'
```

### DeepSeek

```shell
docker run -d \
  --gpus all \
  --name lmdeploy-deepseek \
  -p 8000:8000 \
  -v /path/to/your/models:/model \
  openmmlab/lmdeploy:latest \
  lmdeploy serve api_server /model/DeepSeek-V2-Lite-Chat
```

### WebUI 部署

```shell
# 启动 WebUI
lmdeploy serve gradio /path/to/llama-7b-4bit
```