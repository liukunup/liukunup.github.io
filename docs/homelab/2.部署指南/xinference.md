---
title: Xinference
createTime: 2025/10/13 11:42:25
permalink: /homelab/deploy/xinference/
---

## 安装部署

::: tip
通过[HF-Mirror](https://hf-mirror.com/)提前下载模型文件
:::

```shell
docker run -d \
  -p 9997:9997 \
  -e HF_ENDPOINT=https://hf-mirror.com \
  -e HF_TOKEN="$HF_TOKEN" \
  -v /path/to/xprobe/.xinference:/root/.xinference \
  -v /path/to/xprobe/.cache/huggingface:/root/.cache/huggingface \
  -v /path/to/xprobe/.cache/modelscope:/root/.cache/modelscope \
  --gpus all \
  --restart=unless-stopped \
  --name=xinference \
  docker.io/xprobe/xinference:v1.5.0 \
  xinference-local --host 0.0.0.0
```

## 使用说明
