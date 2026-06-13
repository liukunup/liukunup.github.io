---
title: Traefik
tags:
  - traefik
  - reverse proxy
  - proxy
  - docker
createTime: 2025/10/28 10:00:00
permalink: /homelab/deploy/traefik/
---

## 🏗️ 架构图

📖 [Traefik Docs](https://doc.traefik.io/traefik/)

📖 [Traefik Dashboard](https://doc.traefik.io/traefik/operations/dashboard/)

📖 [Traefik Docker Provider](https://doc.traefik.io/traefik/providers/docker/)

## 🚀 部署指南

::: tabs

@tab:active Docker

```shell
# 创建网络
docker network create traefik

# 启动 Traefik
docker run -d \
  -p 80:80 \
  -p 443:443 \
  -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ./traefik.yml:/traefik.yml \
  -v ./acme.json:/acme.json \
  --network traefik \
  --name traefik \
  --restart=unless-stopped \
  traefik:v3.1
```

@tab Docker Compose

```yaml
services:
  traefik:
    image: traefik:v3.1
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/traefik.yml
      - ./acme.json:/acme.json
    networks:
      - traefik
    environment:
      - TZ=Asia/Shanghai

networks:
  traefik:
    name: traefik
    driver: bridge
```

:::

## ⚙️ 配置样例

### 📦 Traefik 基础配置

```yaml
# traefik.yml

# API 配置
api:
  dashboard: true
  insecure: true

# 日志配置
log:
  level: INFO
  format: json

# 入口点配置
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

# 证书配置
certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: acme.json
      httpChallenge:
        entryPoint: web

# Docker 配置
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: traefik
  file:
    directory: /etc/traefik/dynamic
    watch: true
```

### 📦 Docker Labels 示例

```yaml
services:
  whoami:
    image: traefik/whoami
    container_name: whoami
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whoami.rule=Host(`whoami.homelab.lan`)"
      - "traefik.http.routers.whoami.entrypoints=web"
      - "traefik.http.routers.whoami.service=whoami-service"
      - "traefik.http.services.whoami-service.loadbalancer.server.port=80"
    networks:
      - traefik

networks:
  traefik:
    name: traefik
    external: true
```

### 📦 中间件配置

```yaml
# dynamic/middlewares.yml

http:
  middlewares:
    # 基础认证
    auth:
      basicAuth:
        users:
          - "admin:$apr1$H6uskkkW$IgXLF6fF/ny6A2FRtITGZ0"

    # 速率限制
    rate-limit:
      rateLimit:
        average: 100
        burst: 50

    # 重试
    retry:
      retry:
        attempts: 3

    # 压缩
    compress:
      compress: {}

    # 安全头
    secure-headers:
      headers:
        frameDeny: true
        contentTypeNosniff: true
        browserXssFilter: true
        referrerPolicy: "strict-origin-when-cross-origin"

    # 重定向
    redirect:
      redirectRegex:
        regex: "^http://(.*)"
        replacement: "https://$1"
        permanent: true
```

### 📦 服务配置示例

```yaml
# dynamic/services.yml

http:
  services:
    # 负载均衡服务
    my-service:
      loadBalancer:
        servers:
          - url: "http://192.168.1.100:8080"
          - url: "http://192.168.1.101:8080"
        healthCheck:
          path: /health
          interval: 10s
```

### 📦 路由配置示例

```yaml
# dynamic/routes.yml

http:
  routers:
    # 基础路由
    whoami:
      rule: Host(`whoami.homelab.lan`)
      service: whoami-service
      entryPoints:
        - web
      middlewares:
        - secure-headers

    # HTTPS 路由
    whoami-secure:
      rule: Host(`whoami.homelab.lan`)
      service: whoami-service
      entryPoints:
        - websecure
      tls:
        certResolver: letsencrypt

  services:
    whoami-service:
      loadBalancer:
        servers:
          - url: "http://whoami:80"
```

## 🔧 常用命令

```shell
# 查看容器状态
docker ps traefik

# 查看日志
docker logs -f traefik

# 重启服务
docker restart traefik

# 更新配置
docker exec traefik sh -c "touch /traefik.yml"

# 验证配置
docker exec traefik traefik config verify
```

## 💻 最佳实践

### 🔥 反向代理完整套件

::: steps

1. 目录结构

    ```plaintext
    traefik/
    ├── docker-compose.yml
    ├── traefik.yml
    ├── acme.json
    └── dynamic/
        ├── middlewares.yml
        ├── services.yml
        └── routes.yml
    ```

2. 部署

    ```yaml
    services:
      traefik:
        image: traefik:v3.1
        container_name: traefik
        restart: unless-stopped
        ports:
          - "80:80"
          - "443:443"
          - "8080:8080"
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock:ro
          - ./traefik.yml:/traefik.yml
          - ./acme.json:/acme.json
          - ./dynamic:/etc/traefik/dynamic
        networks:
          - traefik

      whoami:
        image: traefik/whoami
        container_name: whoami
        restart: unless-stopped
        labels:
          - "traefik.enable=true"
          - "traefik.http.routers.whoami.rule=Host(`whoami.homelab.lan`)"
          - "traefik.http.routers.whoami.entrypoints=web"
          - "traefik.http.services.whoami.loadbalancer.server.port=80"
        networks:
          - traefik

    networks:
      traefik:
        name: traefik
        driver: bridge
    ```

3. 验证

    ```shell
    # 访问 Dashboard
    curl http://localhost:8080/api/overview

    # 测试路由
    curl -H "Host: whoami.homelab.lan" http://localhost
    ```

:::

### 📱 移动端配置

```yaml
# dynamic/mobile.yml

http:
  middlewares:
    mobile-headers:
      headers:
        customRequestHeaders:
          X-Forwarded-Proto: "https"
        customResponseHeaders:
          Access-Control-Allow-Origin: "*"
```

### 🌐 多域名配置

```yaml
# dynamic/multidomain.yml

http:
  routers:
    app1:
      rule: Host(`app1.homelab.lan`)
      service: app1-service
      entryPoints:
        - websecure
      tls:
        certResolver: letsencrypt

    app2:
      rule: Host(`app2.homelab.lan`)
      service: app2-service
      entryPoints:
        - websecure
      tls:
        certResolver: letsencrypt
```