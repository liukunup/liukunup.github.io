---
title: Docker 高级用法
createTime: 2025/10/31 22:47:49
permalink: /blog/v8unuhyp/
---

## 健康检查

```yaml
services:
  myapp:
    # ===== (可选)健康检查 =====
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s     # 每30秒执行一次检查
      timeout: 5s       # 单次检查超时时间
      retries: 3        # 连续失败3次才判定为不健康
      start_period: 30s # 启动后等待30秒才开始检查
```

## 日志轮转

```yaml
services:
  myapp:
    # ===== (可选)日志轮转 =====
    logging:
      driver: "json-file" # 日志驱动类型
      options:
        max-size: "10m"   # 单个日志文件最大10MB
        max-file: "3"     # 最多保留3个日志文件
```

## 资源设置

```yaml
services:
  myapp:
    deploy:
      resources:
        limits: # (可选)资源限制
          cpus: ${CPU_LIMIT:-0.5}
          memory: ${MEM_LIMIT:-1g}
        reservations: # (可选)资源预留
          cpus: ${CPU_RESERVE:-0.1}
          memory: ${MEM_RESERVE:-256m}
```

## 常见问题

- 容器访问宿主机上的服务

```bash
# 在容器内部访问宿主机端口 8080
curl http://host.docker.internal:8080

# 或者访问宿主机上的 MySQL
mysql -h host.docker.internal -P 3306 -u root -p
```

- 容器配置`/etc/hosts`

::: tabs

@tab:active Docker

```shell
docker run \
  --add-host subdomain.yourdomain.lan:192.168.100.88 \
  hello-world
```

@tab Docker Compose

```yaml
services:
  myapp:
    image: hello-world
    extra_hosts:
      - "subdomain.yourdomain.lan:192.168.100.88"
```

:::

- 容器配置 DNS 服务器

::: tabs

@tab:active Docker

```shell
docker run \
  --dns 114.114.114.114 \
  --dns 8.8.8.8 \
  hello-world
```

@tab Docker Compose

```yaml
services:
  myapp:
    image: hello-world
    dns:
      - 114.114.114.114
      - 8.8.8.8
    dns_search:
      - subdomain.yourdomain.lan
```

:::

- 容器配置证书

::: tabs

@tab:active 镜像构建时(推荐)

```dockerfile
# 复制证书
COPY ssl/certs/ca.crt /usr/local/share/ca-certificates/
# 更新证书
RUN update-ca-certificates
```

@tab 挂载主机目录(共享)

```yaml
services:
  myapp:
    image: hello-world
    volumes:
      - /etc/ssl/certs:/etc/ssl/certs:ro
```

@tab 直接挂载证书

通常情况下都有效，但是不推荐！

```yaml
services:
  myapp:
    image: hello-world
    volumes:
      - ./certs/server.crt:/etc/ssl/certs/server.crt:ro
      - ./certs/server.key:/etc/ssl/private/server.key:ro
      - ./certs/ca.crt:/etc/ssl/certs/ca.crt:ro
    environment:
      - SSL_CERT_FILE=/etc/ssl/certs/server.crt
      - SSL_KEY_FILE=/etc/ssl/private/server.key
```

:::
