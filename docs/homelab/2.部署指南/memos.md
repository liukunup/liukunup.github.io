---
title: Memos
tags:
  - Memos
createTime: 2025/12/15 11:34:57
permalink: /homelab/deploy/memos/
---

## 🚀 部署指南

1. 创建数据目录：

    ```bash
    mkdir -p /share/Container/memos
    ```

2. 启动容器：

::: tabs

@tab:active Docker

```bash
docker run -d \
  --name memos \
  --restart=unless-stopped \
  -p 5230:5230 \
  -v /share/Container/memos:/var/opt/memos \
  neosmemo/memos:stable
```

@tab Docker Compose

```yaml
services:
  memos:
    image: neosmemo/memos:stable
    container_name: memos
    restart: unless-stopped
    volumes:
      - /share/Container/memos:/var/opt/memos
    ports:
      - 5230:5230
```

:::

## 📝 配置说明

- **端口**: 默认监听 `5230` 端口，Web 界面直接通过该端口访问。
- **数据持久化**: 容器内的 `/var/opt/memos` 目录包含 SQLite 数据库和附件文件，需挂载出来以防数据丢失。
- **访问**: 浏览器打开 `http://<host_ip>:5230` 即可进入 Web 界面，首次访问需注册管理员账号。
