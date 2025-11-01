---
title: Docker
createTime: 2025/10/31 22:47:49
permalink: /blog/v8unuhyp/
---

## 常见问题

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
