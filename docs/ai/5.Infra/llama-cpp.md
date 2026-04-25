---
title: llama.cpp
createTime: 2026/04/25 20:27:06
permalink: /ai/infra/llama-cpp/
---

::tdesign:logo-github-filled:: [llama.cpp](https://github.com/gpustack/llama-box) 基于 [llama.cpp](https://github.com/ggml-org/llama.cpp) 构建的高性能 LLM 推理服务，支持 GGUF 格式模型，可在 Linux、macOS 和 Windows 上运行。

## 安装部署

### GPUStack

GPUStack 内置了对 llama.cpp 的支持，推荐通过 GPUStack 部署。

::: tabs

@tab:active Docker

参考 [官方文档](https://docs.gpustack.ai/latest/installation/nvidia-cuda/online-installation/) 进行部署：

```shell
docker run -d --name gpustack \
  --restart=unless-stopped \
  --gpus all \
  --network=host \
  --ipc=host \
  -v gpustack-data:/var/lib/gpustack \
  gpustack/gpustack
```

@tab Linux or macOS

```shell
curl -sfL https://get.gpustack.ai | sh -s -
```

@tab Windows

```powershell
Invoke-Expression (Invoke-WebRequest -Uri "https://get.gpustack.ai" -UseBasicParsing).Content
```

:::

### 独立部署 llama.cpp

如果你只需要运行 llama.cpp 而不需要 GPUStack 的管理功能，可以直接下载预编译的二进制文件。

#### 下载二进制

访问 [llama.cpp releases](https://github.com/ggml-org/llama.cpp/releases) 页面，根据你的操作系统下载对应的压缩包。

| 平台 | 推荐版本 |
| ---- | -------- |
| Linux | `llama-linux-x86_64-avx512-v3.zip` |
| macOS (Apple Silicon) | `llama-mac-arm64.zip` |
| macOS (Intel) | `llama-mac-x86_64.zip` |
| Windows | `llama-win64-x64.zip` |

#### 从源码编译

```shell
# 1.克隆代码仓库
git clone https://github.com/ggml-org/llama.cpp
cd llama.cpp

# 2.安装编译工具
# Linux (Ubuntu/Debian)
sudo apt-get update -y
sudo apt-get install -y build-essential cmake ninja-build libprotobuf-dev protobuf-compiler

# macOS
xcode-select --install
brew install cmake protobuf

# 3.编译
mkdir build && cd build
cmake .. -DLLAMA_BUILD_SERVER=ON -DLLAMA_BUILD_EXAMPLES=ON
cmake --build . --config Release

# 4.（可选）安装到系统路径
sudo cmake --install .
```

## 下载模型

llama.cpp 主要使用 GGUF 格式的模型。你可以从以下来源获取模型：

### Hugging Face

通过 Hugging Face 下载 GGUF 格式模型：

```shell
# 设置镜像（可选）
export HF_ENDPOINT=https://hf-mirror.com

# 下载模型，例如 TheBloke 的量化模型
# https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF
```

### 推荐模型列表

| 模型 | 参数量 | 量化 | 大小 | 适用场景 |
| ---- | ------ | ---- | ---- | -------- |
| Qwen2.5-0.5B | 0.5B | Q4_0 | 370MB | 轻量级任务 |
| Qwen2.5-1.5B | 1.5B | Q4_0 | 1GB | 轻量级任务 |
| Qwen2.5-3B | 3B | Q4_K_M | 2GB | 日常对话 |
| llama3.2-1b | 1B | Q4_0 | 620MB | 轻量级任务 |
| llama3.2-3b | 3B | Q4_K_M | 2GB | 日常对话 |
| deepseek-r1-distill-qwen-7b | 7B | Q4_K_M | 5GB | 复杂推理 |

## 使用说明

### 命令行推理

使用 `llama-cli` 进行命令行推理：

```shell
./llama-cli \
  -m /path/to/model.gguf \
  -p "### User: 你好，请介绍一下你自己\n### Assistant:" \
  -n 256 \
  --temp 0.7 \
  -t 8
```

常用参数说明：

| 参数 | 说明 | 示例 |
| ---- | ---- | ---- |
| `-m` | 模型文件路径 | `-m model.gguf` |
| `-p` | 提示词 | `-p "你好"` |
| `-n` | 生成 token 数量 | `-n 256` |
| `-t` | 线程数 | `-t 8` |
| `--temp` | 温度参数 | `--temp 0.7` |
| `--ctx-size` | 上下文窗口大小 | `--ctx-size 4096` |
| `-i` | 交互模式 | `-i` |

### 交互模式

```shell
./llama-cli -m /path/to/model.gguf -i -p "### User:\n\n### Assistant:"
```

### 启动 API 服务器

使用 `llama-server` 启动 OpenAI 兼容的 API 服务器：

```shell
./llama-server \
  -m /path/to/model.gguf \
  -host 0.0.0.0 \
  -port 8080 \
  -ctx-size 4096 \
  -ngl 99
```

常用参数说明：

| 参数 | 说明 | 示例 |
| ---- | ---- | ---- |
| `-host` | 监听地址 | `-host 0.0.0.0` |
| `-port` | 监听端口 | `-port 8080` |
| `-ctx-size` | 上下文窗口大小 | `-ctx-size 4096` |
| `-ngl` | GPU 层数（99 表示全部） | `-ngl 99` |
| `--flash-attention` | 启用 Flash Attention | `--flash-attention` |

### 调用 API

启动服务后，可以通过 OpenAI 兼容的 API 进行调用：

```shell
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2",
    "messages": [
      {"role": "user", "content": "请介绍一下你自己"}
    ],
    "temperature": 0.7,
    "max_tokens": 256
  }'
```

### 使用 GPUStack 管理

通过 GPUStack 的 Web 界面可以更方便地管理模型和推理服务：

1. 访问 GPUStack Web UI
2. 进入「模型」页面，添加 GGUF 模型
3. 启动推理服务
4. 通过 API 访问

> [!TIP]
> GPUStack 提供了图形化界面和模型管理功能，适合需要管理多个模型的场景。

## 常见问题

### GPU 加速不生效

确保 CUDA 可用，检查 NVIDIA 驱动：

```shell
nvidia-smi
```

如果使用 CUDA 版本编译，确认 `ngl` 参数设置正确（通常设为 99）。

### 内存不足

- 降低 `ctx-size` 参数
- 使用更小的量化版本（如 Q4_K_M 而非 Q8_0）
- 关闭其他占用内存的程序

### 推理速度慢

- 增加 `-t` 参数（线程数，建议设为 CPU 核心数）
- 确保使用了 GPU 加速（检查日志中是否有 `BLAS` 或 `CUDA` 标识）
- 考虑使用更小的量化版本

## 参考链接

- [llama.cpp GitHub](https://github.com/ggml-org/llama.cpp)
- [GPUStack Docs](https://docs.gpustack.ai/latest/)
- [GGUF 模型下载](https://huggingface.co/models?filter=gguf)