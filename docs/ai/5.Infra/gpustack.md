---
title: GPUStack
createTime: 2025/10/13 11:53:44
permalink: /ai/infra/gpustack/
---

[GPUStack Docs](https://docs.gpustack.ai/latest/overview/)

![GPUStack Architecture](https://docs.gpustack.ai/latest/assets/gpustack-architecture.png)

## 部署指南

### **单机部署**

::: tabs

@tab:active Docker

- [快速开始](https://docs.gpustack.ai/latest/installation/nvidia-cuda/online-installation/)

```shell
docker run -d --name gpustack \
  --restart=unless-stopped \
  --gpus all \
  --network=host \
  --ipc=host \
  -v gpustack-data:/var/lib/gpustack \
  gpustack/gpustack
```

- 推荐配置

```shell
# Hugging Face Token
export HF_TOKEN=""
export HF_ENDPOINT="https://hf-mirror.com"
# settings: Hugging Face / Port / SSL / DB / OIDC and use CUDA 12.8
docker run -d \
  -e GPUSTACK_HF_TOKEN="${HF_TOKEN}" \
  -e GPUSTACK_HF_ENDPOINT="${HF_ENDPOINT}" \
  -e GPUSTACK_PORT="80" \
  -e GPUSTACK_SSL_KEYFILE="/path/to/keyfile" \
  -e GPUSTACK_SSL_CERTFILE="/path/to/certfile" \
  -e GPUSTACK_DATABASE_URL="postgresql://username:password@host:port/database_name" \
  -e GPUSTACK_OIDC_ISSUER="your-oidc-issuer-url" \
  -e GPUSTACK_OIDC_CLIENT_ID="your-client-id" \
  -e GPUSTACK_OIDC_CLIENT_SECRET="your-client-secret" \
  -e GPUSTACK_OIDC_REDIRECT_URI="{your-server-url}/auth/oidc/callback" \
  -e GPUSTACK_EXTERNAL_AUTH_NAME="email" \
  -e GPUSTACK_EXTERNAL_AUTH_FULL_NAME="name" \
  -e GPUSTACK_EXTERNAL_AUTH_AVATAR_URL="picture" \
  -v /path/to/gpustack:/var/lib/gpustack \
  -v /path/to/model:/model \
  --gpus all \
  --network=host \
  --ipc=host \
  --restart=unless-stopped \
  --name=gpustack \
  gpustack/gpustack:latest-cuda12.8
```

如何获取初始密码？

```shell
# 默认账户: admin
# 默认密码:
docker exec -it gpustack cat /var/lib/gpustack/initial_admin_password
```

如何获取`Token`？

```shell
docker exec -it gpustack cat /var/lib/gpustack/token
```

@tab Linux or macOS

[查看命令样例](https://docs.gpustack.ai/latest/installation/installation-script/)

```shell
curl -sfL https://get.gpustack.ai | sh -s -
```

如何获取初始密码？

```shell
# 默认账户: admin
# 默认密码:
cat /var/lib/gpustack/initial_admin_password
```

如何获取`Token`？

```shell
cat /var/lib/gpustack/token
```

@tab Windows

[查看命令样例](https://docs.gpustack.ai/latest/installation/installation-script/)

```powershell
Invoke-Expression (Invoke-WebRequest -Uri "https://get.gpustack.ai" -UseBasicParsing).Content
```

如何获取初始密码？

```powershell
# 默认账户: admin
# 默认密码:
Get-Content -Path "$env:APPDATA\gpustack\initial_admin_password" -Raw
```

:::

### **(可选) 添加工作节点**

前置工作：

1. 安装`Nvidia CUDA Toolkit 12.8`；
2. 安装`Python 3.12`；

::: tabs

@tab:active Docker

```shell
docker run -d \
  -v /path/to/gpustack:/var/lib/gpustack \
  --gpus all \
  --network=host \
  --ipc=host \
  --restart=unless-stopped \
  --name=gpustack \
  gpustack/gpustack:latest-cuda12.8 \
  --server-url http://your_gpustack_url --token your_gpustack_token
```

@tab Linux or macOS

```shell
curl -sfL https://get.gpustack.ai | sh -s - --server-url http://your_gpustack_url --token your_gpustack_token --worker-ip 192.168.100.60
```

@tab Windows

```shell
Invoke-Expression "& { $((Invoke-WebRequest -Uri 'https://get.gpustack.ai' -UseBasicParsing).Content) } -- --server-url 'http://your_gpustack_url' --token 'your_gpustack_token' --worker-ip '192.168.100.60'"
```

> ==Windows==操作系统可能需要在`高级安全 Windows Defender 防火墙`添加入站规则，允许TCP端口10150访问。 

:::

## 下载模型

```shell
# 配置镜像代理
export HF_ENDPOINT=https://hf-mirror.com
export HF_TOKEN=hf_token
# 下载模型
./hfd.sh <model>
```

**推荐模型列表**

[与Dify集成使用](https://docs.gpustack.ai/latest/integrations/integrate-with-dify/)

- `LLM` Qwen/Qwen3-8B
- `LLM` Qwen/Qwen2.5-VL-3B-Instruct
- `Embedding` BAAI/bge-m3
- `Rerank` BAAI/bge-reranker-v2-m3

推荐列表：

- `LLM` unsloth/DeepSeek-R1-Distill-Qwen-7B-GGUF
- `OCR` deepseek-ai/DeepSeek-OCR
- `TTS` FunAudioLLM/CosyVoice2-0.5B
- `TTS` FunAudioLLM/CosyVoice-300M
- `TTS` FunAudioLLM/CosyVoice-300M-SFT
- `TTS` FunAudioLLM/CosyVoice-300M-Instruct
- `ASR` FunAudioLLM/SenseVoiceSmall
- `ASR` openai/whisper-large-v3-turbo
