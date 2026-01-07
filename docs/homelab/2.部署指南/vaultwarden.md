---
title: Vaultwarden
tags:
  - PasswordManager
createTime: 2025/12/15 11:34:57
permalink: /homelab/deploy/vaultwarden/
---

## 🚀 部署指南

1. 创建数据目录：

    ```bash
    mkdir -p /share/Container/vaultwarden/data
    ```

2. 启动容器：

::: tabs

@tab:active Docker

```bash
docker run -d \
  --name vaultwarden \
  --restart=unless-stopped \
  -p 8080:80 \
  -v /share/Container/vaultwarden/data:/data \
  -e DOMAIN="https://vaultwarden.example.com" \
  -e SIGNUPS_ALLOWED=false \
  -e ADMIN_TOKEN=some_random_token_as_admin_password \
  vaultwarden/server:latest
```

@tab Docker Compose

```yaml
services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: unless-stopped
    volumes:
      - /share/Container/vaultwarden/data:/data
    ports:
      - 8080:80
    environment:
      - DOMAIN=https://vaultwarden.example.com
      - SIGNUPS_ALLOWED=false
      - ADMIN_TOKEN=some_random_token_as_admin_password
```

:::

## 📝 配置说明

- **DOMAIN**: 设置域名，对于 WebAuthn/FIDO2 是必须的。
- **SIGNUPS_ALLOWED**: 设置为 `false` 以禁止新用户注册（建议自己在 Admin 页面或首次启动时注册完账号后关闭）。
- **ADMIN_TOKEN**: 启用 `/admin` 管理页面的认证 Token，建议生成一个复杂的字符串。
- **数据持久化**: 容器内的 `/data` 目录需要挂载出来，保存数据库和密钥文件。
