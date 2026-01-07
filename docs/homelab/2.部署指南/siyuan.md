---
title: SiYuan Note
tags:
  - SiYuan
  - Note
createTime: 2026/01/07 11:57:33
permalink: /homelab/deploy/siyuan/
---

## 🚀 部署指南

### 🔗 相关链接

- [Official Website](https://b3log.org/siyuan/)
- [Docker Hub](https://hub.docker.com/r/b3log/siyuan)
- [GitHub](https://github.com/siyuan-note/siyuan)

### 💻 部署命令

1. 创建工作目录并设置权限 (uid 1000)：

```bash
mkdir -p /share/Container/siyuan/workspace
chown -R 1000:1000 /share/Container/siyuan
```

2. 启动容器：

::: tabs

@tab:active Docker

```bash
docker run -d \
  -p 6806:6806 \
  -v ./siyuan/workspace:/siyuan/workspace \
  -e TZ=Asia/Shanghai \
  --restart=unless-stopped \
  --name=siyuan \
  b3log/siyuan:latest \
  --workspace=/siyuan/workspace/ \
  --accessAuthCode="your_access_auth_code"
```

@tab Docker Compose

```yaml
services:
  # SiYuan - A local-first, markdown-based knowledge management software
  # https://github.com/siyuan-note/siyuan/blob/master/README_zh_CN.md
  siyuan:
    image: b3log/siyuan:latest
    command: ["--workspace=/siyuan/workspace/", "--accessAuthCode=your_access_auth_code"]
    ports:
      - "6806:6806"
    volumes:
      - ./siyuan/workspace:/siyuan/workspace
    restart: unless-stopped
    environment:
      - TZ=Asia/Shanghai
```

:::
