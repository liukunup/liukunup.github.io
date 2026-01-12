---
title: Authentik
tags:
  - OAuth 2.0
createTime: 2026/01/12 14:34:48
permalink: /homelab/deploy/authentik/
---

## 部署指南

Authentik 是一个开源的身份提供商（IdP），专注于灵活性和多功能性。它可以用作 OAuth2/OpenID Connect 提供商、LDAP 提供商或 SAML 服务提供商。

### 准备工作

创建用于存储数据的持久化目录：

```bash
mkdir -p /share/Container/authentik/data
mkdir -p /share/Container/authentik/media
mkdir -p /share/Container/authentik/certs
mkdir -p /share/Container/authentik/postgres
mkdir -p /share/Container/authentik/redis
mkdir -p /share/Container/authentik/custom-templates
```

生成一个随机密钥，用于配置 `AUTHENTIK_SECRET_KEY`：

```bash
openssl rand -base64 32
# 或者使用 pwgen
# pwgen -s 50 1
```

### 启动服务

::: tabs

@tab:active Docker Compose

**注意**：
1. 请将 `AUTHENTIK_SECRET_KEY` 替换为您生成的密钥。
2. 确保 `POSTGRES_PASSWORD` 和 `AUTHENTIK_POSTGRESQL__PASSWORD` 保持一致且足够复杂。

```yaml
services:
  postgresql:
    image: docker.io/library/postgres:16-alpine
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -d $${POSTGRES_DB} -U $${POSTGRES_USER}"]
      start_period: 20s
      interval: 30s
      retries: 5
      timeout: 5s
    volumes:
      - /share/Container/authentik/postgres:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: "secure_postgres_password" # 请修改
      POSTGRES_USER: "authentik"
      POSTGRES_DB: "authentik"

  redis:
    image: docker.io/library/redis:alpine
    command: --save 60 1 --loglevel warning
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "redis-cli ping | grep PONG"]
      start_period: 20s
      interval: 30s
      retries: 5
      timeout: 3s
    volumes:
      - /share/Container/authentik/redis:/data

  server:
    image: ghcr.io/goauthentik/server:2024.12
    restart: always
    command: server
    environment:
      AUTHENTIK_REDIS__HOST: redis
      AUTHENTIK_POSTGRESQL__HOST: postgresql
      AUTHENTIK_POSTGRESQL__USER: authentik
      AUTHENTIK_POSTGRESQL__NAME: authentik
      AUTHENTIK_POSTGRESQL__PASSWORD: "secure_postgres_password" # 必须与 postgresql 服务配置一致
      AUTHENTIK_SECRET_KEY: "please_generate_a_secret_key" # 必须修改
      # 初始管理员相关，可用于恢复或初始设置
      # AUTHENTIK_BOOTSTRAP_PASSWORD: "password"
      # AUTHENTIK_BOOTSTRAP_EMAIL: "admin@example.com"
    volumes:
      - /share/Container/authentik/media:/media
      - /share/Container/authentik/certs:/certs
      - /share/Container/authentik/custom-templates:/templates
    ports:
      - "9000:9000"
      - "9443:9443"
    depends_on:
      - postgresql
      - redis

  worker:
    image: ghcr.io/goauthentik/server:2024.12
    restart: always
    command: worker
    environment:
      AUTHENTIK_REDIS__HOST: redis
      AUTHENTIK_POSTGRESQL__HOST: postgresql
      AUTHENTIK_POSTGRESQL__USER: authentik
      AUTHENTIK_POSTGRESQL__NAME: authentik
      AUTHENTIK_POSTGRESQL__PASSWORD: "secure_postgres_password" # 必须与 postgresql 服务配置一致
      AUTHENTIK_SECRET_KEY: "please_generate_a_secret_key" # 必须修改
    user: root
    volumes:
      - /share/Container/authentik/media:/media
      - /share/Container/authentik/certs:/certs
      - /share/Container/authentik/custom-templates:/templates
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - postgresql
      - redis
```

:::

### 参考文档

- [Authentik Docker Compose Installation](https://goauthentik.io/docs/installation/docker-compose)
