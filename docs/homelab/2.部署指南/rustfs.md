---
title: RustFS
tags:
  - S3
  - RustFS
createTime: 2026/01/07 11:57:19
permalink: /homelab/deploy/rustfs/
---

## 🚀 部署指南

1. 创建数据目录：

    ```bash
    mkdir -p rustfs/data
    ```

2. 设置目录权限（RustFS 容器默认使用 UID `10001`）：

    ```bash
    chown -R 10001:10001 rustfs/data
    ```

3. 启动容器：

::: tabs

@tab:active Docker

```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  -v ./rustfs/data:/data \
  -e RUSTFS_CONSOLE_ENABLE=true \
  -e RUSTFS_ACCESS_KEY=rustfsadmin \
  -e RUSTFS_SECRET_KEY=rustfsadmin \
  --restart=unless-stopped \
  --name=rustfs \
  rustfs/rustfs:latest \
  --console-enable \
  /data
```

@tab Docker Compose

```bash
# RustFS - A high-performance, distributed file system written in Rust
# https://docs.rustfs.com/installation/docker/
rustfs:
  image: rustfs/rustfs:latest
  command: --console-enable /data
  ports:
    - 9000:9000
    - 9001:9001
  volumes:
    - ./rustfs/data:/data
  restart: unless-stopped
  environment:
    - RUSTFS_CONSOLE_ENABLE=true
    - RUSTFS_ACCESS_KEY=rustfsadmin
    - RUSTFS_SECRET_KEY=rustfsadmin
```

:::

- API/控制台端口：`9000`
- 默认账号：`rustfsadmin`
- 默认密码：`rustfsadmin`

## 生产环境样例

```yaml
services:
  rustfs:
    image: rustfs/rustfs:latest
    container_name: rustfs
    restart: unless-stopped
    ports:
      - 9000:9000
      - 9001:9001
    volumes:
      - /share/Container/rustfs/tls:/opt/tls
      - /share/Container/rustfs/data:/data
    environment:
      RUSTFS_TLS_PATH: /opt/tls
      RUSTFS_ACCESS_KEY: rustfsadmin
      RUSTFS_SECRET_KEY: rustfsadmin
      RUSTFS_CONSOLE_ENABLE: true
      RUSTFS_SERVER_DOMAINS: rustfs.exmaple.com:9000
    network_mode: bridge
    healthcheck:
      test: ["CMD", "sh", "-c", "curl -f http://localhost:9000/health && curl -f http://localhost:9001/health"]
      interval: 60s
      timeout: 5s
      retries: 3
      start_period: 30s
```
