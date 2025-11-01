---
title: Code Server
tags:
  - code-server
createTime: 2025/10/20 20:13:56
permalink: /homelab/deploy/code-server/
---

## 🚀 部署指南

### 💿 lscr.io/linuxserver/code-server

[linuxserver/code-server](https://docs.linuxserver.io/images/docker-code-server/)

::: tabs

@tab:active Docker

```shell
docker run -d \
  -p 8443:8443 \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Asia/Shanghai \
  -e PASSWORD=password `#optional` \
  -e HASHED_PASSWORD= `#optional` \
  -e SUDO_PASSWORD=password `#optional` \
  -e SUDO_PASSWORD_HASH= `#optional` \
  -e PROXY_DOMAIN=code-server.my.domain `#optional` \
  -e DEFAULT_WORKSPACE=/config/workspace `#optional` \
  -e PWA_APPNAME=code-server `#optional` \
  -v "${HOME}/.config:/config" \
  -v "${PWD}:/config/project" \
  --restart unless-stopped \
  --name=code-server \
  lscr.io/linuxserver/code-server:latest
```

@tab Docker Compose

```yaml
services:
  code-server:
    image: lscr.io/linuxserver/code-server:latest
    container_name: code-server
    restart: unless-stopped
    ports:
      - 8443:8443
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
      - PASSWORD=password #optional
      - HASHED_PASSWORD= #optional
      - SUDO_PASSWORD=password #optional
      - SUDO_PASSWORD_HASH= #optional
      - PROXY_DOMAIN=code-server.my.domain #optional
      - DEFAULT_WORKSPACE=/config/workspace #optional
      - PWA_APPNAME=code-server #optional
    volumes:
      - "${HOME}/.config:/config"
      - "${PWD}:/config/project"
```

:::

### 💿 ghcr.io/codercom/code-server

[codercom/code-server](https://github.com/coder/code-server)

::: steps

1. 创建目录结构以便数据持久化

    ```shell
    mkdir -p $HOME/.local
    mkdir -p $HOME/.config
    ```

2. 获取必要参数

    ```shell
    id  # 获取当前用户的UID和GID
    ```

    - USER 选择docker组下的用户
    - HOST_IP 留空 或 宿主机IP
    - PORT_HTTP 留空 或 自选端口号

3. 部署容器

    - Docker

    ```shell
    docker run -d \
      -p "${HOST_IP:-127.0.0.1}:{PORT_HTTP:-8080}:8080" \
      -v "${HOME}/.local:/home/coder/.local" \
      -v "${HOME}/.config:/home/coder/.config" \
      -v "${PWD}:/home/coder/project" \
      -u "$(id -u):$(id -g)" \
      -e "DOCKER_USER=${USER}" \
      --name=code-server \
      codercom/code-server:latest
    ```

    - Docker Compose

    ```yaml
    services:
      code-server:
        image: ghcr.io/codercom/code-server:latest
        container_name: code-server
        restart: unless-stopped
        user: "${UID}:${GID}"
        ports:
          - "${HOST_IP:-127.0.0.1}:{PORT_HTTP:-8080}:8080"
        volumes:
          - "${HOME}/.local:/home/coder/.local"
          - "${HOME}/.config:/home/coder/.config"
          - "${PWD}:/home/coder/project"
        environment:
          TZ: Asia/Shanghai
          DOCKER_USER: "${USER}"
    ```

:::

## ⚙️ 配置指南

- 配置Git

    1. 将你的ssh key拷贝到`/config/.ssh`目录下
    2. 配置用户名和邮箱

    ```shell
    git config --global user.name "username"
    git config --global user.email "email address"
    ```
