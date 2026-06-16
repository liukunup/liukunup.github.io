---
title: DeepSeek
createTime: 2025/10/15 16:42:03
permalink: /ai/model/deepseek/
---

## 使用 Ollama 部署 DeepSeek-R1

```shell
# 1.拉取容器
docker run -d \
  --publish 11434:11434 \
  --volume ollama:/root/.ollama \
  --name=ollama \
  ollama/ollama

# 2.执行命令
docker exec -it ollama ollama run deepseek-r1
```
