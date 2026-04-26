---
title: TensorRT-LLM
createTime: 2025/10/13 10:33:22
permalink: /ai/infra/tensorrt-llm/
---

## 简介

TensorRT-LLM 是 NVIDIA 推出的大模型推理优化框架，提供了 TensorRT 优化的 LLM 推理引擎，支持高吞吐量和低延迟推理。

查看官方文档 [TensorRT-LLM](https://nvidia.github.io/TensorRT-LLM/)

## 安装部署

### GPU

#### 系统要求

- Python: 3.8 -- 3.11
- CUDA: 12.2 / 12.4 / 12.6 / 13.x
- TensorRT: 10.x (由 TensorRT-LLM 绑定)
- GPU: NVIDIA A100, H100, H200, L40s, RTX 4090 等

#### 使用 pip

```shell
# 1. 创建 Python 环境
uv venv --python 3.12 --seed
source .venv/bin/activate

# 2. 安装 TensorRT-LLM
uv pip install tensorrt-llm -i https://pypi.nvidia.com
```

#### 使用 Docker

```shell
# 使用 NVIDIA官方预构建镜像
docker pull nvidia/tensorrt-llm:latest
```

## 使用说明

### 构建 TensorRT 引擎

```shell
# 转换模型并构建引擎
python build.py --model_dir /path/to/model --dtype float16 --max_batch_size 8 --max_seq_len 4096
```

### 启动服务

#### 使用命令行

```shell
# 启动 TensorRT-LLM 服务
python run.py --engine_dir /path/to/engine --max_batch_size 8 --max_seq_len 4096
```

#### 使用 Docker

```shell
# 启动服务
docker run -d \
  --gpus all \
  --name tensorrt-llm \
  -p 8000:8000 \
  -v /path/to/engine:/engine \
  nvidia/tensorrt-llm:latest \
  python run.py --engine_dir /engine --max_batch_size 8 --max_seq_len 4096
```

### 调用示例

```shell
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tensorrt-llm",
    "messages": [
      {"role": "user", "content": "请介绍一下你自己。"}
    ],
    "temperature": 0.7,
    "max_tokens": 100
  }'
```

## 参考样例

### Llama

::: tip
通过 [HF-Mirror](https://hf-mirror.com/) 提前下载模型文件
:::

1. 构建引擎

```shell
# 下载模型
huggingface-cli download meta-llama/Llama-3.1-8B-Instruct

# 构建 TensorRT 引擎
python build.py --model_dir /path/to/Llama-3.1-8B-Instruct \
  --dtype float16 \
  --max_batch_size 8 \
  --max_seq_len 4096 \
  --output_dir /path/to/engine
```

2. 部署服务

```shell
docker run -d \
  --gpus all \
  --name tensorrt-llm-llama \
  -p 8000:8000 \
  -v /path/to/engine:/engine \
  nvidia/tensorrt-llm:latest \
  python run.py --engine_dir /engine --max_batch_size 8 --max_seq_len 4096
```

### Qwen

```shell
# 下载模型
huggingface-cli download Qwen/Qwen2.5-0.5B-Instruct

# 构建引擎
python build.py --model_dir /path/to/Qwen2.5-0.5B-Instruct \
  --dtype float16 \
  --max_batch_size 8 \
  --max_seq_len 4096
```

### DeepSeek

```shell
# 下载模型
huggingface-cli download deepseek-ai/DeepSeek-V2-Lite-Chat

# 构建引擎
python build.py --model_dir /path/to/DeepSeek-V2-Lite-Chat \
  --dtype float16 \
  --max_batch_size 8 \
  --max_seq_len 4096
```

## 性能调优

### Batch Size 优化

```shell
# 增加 batch size 提高吞吐量
python build.py --model_dir /path/to/model --dtype float16 --max_batch_size 64
```

### Quantization

```shell
# INT8 量化
python build.py --model_dir /path/to/model --dtype int8 --quantization_mode int8_weight_only

# FP8 量化
python build.py --model_dir /path/to/model --dtype fp8 --quantization_mode fp8
```

### 多卡并行

```shell
# Tensor 并行
python build.py --model_dir /path/to/model --dtype float16 --tensor_parallel 4
```