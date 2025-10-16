---
title: GPU Stack
createTime: 2025/10/13 11:53:44
permalink: /ai/infra/gpustack/
---

## 安装部署

::: tabs

@tab:active Docker

```shell
docker run -d \
  -e GPUSTACK_HF_TOKEN="$HF_TOKEN" \
  -e GPUSTACK_HF_ENDPOINT="https://hf-mirror.com" \
  -v /path/to/gpustack:/var/lib/gpustack \
  --gpus all \
  --network=host \
  --ipc=host \
  --restart=unless-stopped \
  --name=gpustack \
  gpustack/gpustack:v0.7.1
```

如何获取密码?

```shell
docker exec -it gpustack cat /var/lib/gpustack/initial_admin_password
```

@tab Linux or macOS

```shell
curl -sfL https://get.gpustack.ai | sh -s -
```

如何获取密码?

```shell
cat /var/lib/gpustack/initial_admin_password
```

@tab Windows

```powershell
Invoke-Expression (Invoke-WebRequest -Uri "https://get.gpustack.ai" -UseBasicParsing).Content
```

如何获取密码?

```powershell
Get-Content -Path "$env:APPDATA\gpustack\initial_admin_password" -Raw
```

:::
