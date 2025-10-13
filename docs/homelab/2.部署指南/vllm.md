---
title: vLLM
createTime: 2025/10/13 10:33:22
permalink: /homelab/deploy/vllm/
---

查看官方文档 [Quickstart](https://docs.vllm.ai/en/stable/getting_started/quickstart.html)

## 安装部署

### GPU

- Python: 3.9 -- 3.12
- OS: Linux
- GPU: compute capability 7.0 or higher (e.g., V100, T4, RTX20xx, A100, L4, H100, etc.)

#### 使用 Python

1. 创建Python环境

```shell
uv venv --python 3.12 --seed
source .venv/bin/activate
```

2. 安装预编译包

```shell
uv pip install vllm --torch-backend=auto
```

#### 使用 Docker

使用预构建镜像

```shell
export VLLM_COMMIT=33f460b17a54acb3b6cc0b03f4a17876cff5eafd # use full commit hash from the main branch
docker pull public.ecr.aws/q9t5s3a7/vllm-ci-postmerge-repo:${VLLM_COMMIT}
```

### CPU

#### 系统要求

- Python: 3.9 -- 3.12
- OS: Linux
- CPU flags: avx512f (Recommended), avx512_bf16 (Optional), avx512_vnni (Optional)

::: tip
使用`lscpu`来查看 CPU flags
:::

#### 使用 Python

1. 创建Python环境

```shell
uv venv --python 3.12 --seed
source .venv/bin/activate
```

2. 从源码构建

```shell
# 1.安装编译工具
sudo apt-get update -y
sudo apt-get install -y gcc-12 g++-12 libnuma-dev python3-dev
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-12 10 --slave /usr/bin/g++ g++ /usr/bin/g++-12

# 2.克隆代码仓库
git clone https://github.com/vllm-project/vllm.git vllm_source
cd vllm_source

# 3.安装依赖库
uv pip install -r requirements/cpu-build.txt --torch-backend cpu
uv pip install -r requirements/cpu.txt --torch-backend cpu

# 4.构建并安装
VLLM_TARGET_DEVICE=cpu uv pip install . --no-build-isolation
```

#### 使用 Docker

使用预构建镜像

```shell
export VLLM_VERSION=v0.10.2
docker pull public.ecr.aws/q9t5s3a7/vllm-cpu-release-repo:${VLLM_VERSION}
```

## 使用说明

- [使用 Docker 部署](https://docs.vllm.ai/en/stable/deployment/docker.html)
- [使用 Kubernetes 部署](https://docs.vllm.ai/en/stable/deployment/k8s.html)
- [CLI Reference](https://docs.vllm.ai/en/stable/cli/index.html)

### 使用 Docker 部署模型

- 使用官方镜像来部署模型

```shell
docker run --runtime nvidia --gpus all \
    -v ~/.cache/huggingface:/root/.cache/huggingface \
    --env "HUGGING_FACE_HUB_TOKEN=$HF_TOKEN" \
    -p 8000:8000 \
    --ipc=host \
    vllm/vllm-openai:latest \
    --model Qwen/Qwen3-0.6B
```

## 参考样例

### DeepSeek

::: tip
通过[HF-Mirror](https://hf-mirror.com/)提前下载模型文件
:::

1. 部署`OpenAI`兼容服务

```shell
docker run -d \
  --gpus all \
  --name vllm-deepseek \
  -p 8000:8000 \
  -v /path/to/your/models:/root/.cache/huggingface/hub \
  vllm/vllm-openai:latest \
  --model deepseek-ai/DeepSeek-V2-Lite-Chat \
  --served-model-name DeepSeek-V2-Lite-Chat \
  --tensor-parallel-size 1 \
  --max-model-len 4096 \
  --gpu-memory-utilization 0.9 \
  --trust-remote-code
```

2. 验证效果

```shell
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-V2-Lite-Chat",
    "messages": [
      {"role": "user", "content": "请介绍一下你自己。"}
    ],
    "temperature": 0.7,
    "max_tokens": 100
  }'
```
