---
title: kestra
createTime: 2025/11/02 14:56:17
permalink: /ai/app/kestra/
---

[kestra docs](https://kestra.io/docs/getting-started/quickstart)

## 🚀 部署指南

```shell
docker run -d \
  -p 8080:8080 \
  --user=root \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /tmp:/tmp \
  kestra/kestra:latest \
  server local
```
