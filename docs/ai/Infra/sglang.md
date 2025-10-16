---
title: SGLang
tags:
  - 推理引擎
createTime: 2025/10/16 09:58:45
permalink: /ai/infra/sglang/
---

[SGLang官方文档](https://docs.sglang.ai/index.html)

## 安装指南

### Method 1: With pip or uv

```shell
pip install --upgrade pip
pip install uv
uv pip install sglang --upgrade
```

### Method 3: Using docker

```shell
docker run --gpus all \
    --shm-size 32g \
    -p 30000:30000 \
    -v ~/.cache/huggingface:/root/.cache/huggingface \
    --env "HF_TOKEN=<secret>" \
    --ipc=host \
    lmsysorg/sglang:latest \
    python3 -m sglang.launch_server --model-path meta-llama/Llama-3.1-8B-Instruct --host 0.0.0.0 --port 30000
```

### Method 5: Using docker compose

```yaml
services:
  sglang:
    image: lmsysorg/sglang:latest
    container_name: sglang
    volumes:
      - ${HOME}/.cache/huggingface:/root/.cache/huggingface
      # If you use modelscope, you need mount this directory
      # - ${HOME}/.cache/modelscope:/root/.cache/modelscope
    restart: always
    network_mode: host # required by RDMA
    privileged: true # required by RDMA
    # Or you can only publish port 30000
    # ports:
    #   - 30000:30000
    environment:
      HF_TOKEN: <secret>
      # if you use modelscope to download model, you need set this environment
      # - SGLANG_USE_MODELSCOPE: true
    entrypoint: python3 -m sglang.launch_server
    command: --model-path meta-llama/Llama-3.1-8B-Instruct
      --host 0.0.0.0
      --port 30000
    ulimits:
      memlock: -1
      stack: 67108864
    ipc: host
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:30000/health || exit 1"]
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              device_ids: ["0"]
              capabilities: [gpu]
```

```shell
docker compose up -d
```
