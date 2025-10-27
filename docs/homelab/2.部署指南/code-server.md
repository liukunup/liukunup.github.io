---
title: Code Server
tags:
  - code-server
createTime: 2025/10/20 20:13:56
permalink: /homelab/deploy/code-server/
---

[linuxserver/code-server](https://docs.linuxserver.io/images/docker-code-server/)

## 部署指南

::: tabs

@tab:active Docker

```shell
docker run -d \
  -p 8443:8443 \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e PASSWORD=password `#optional` \
  -e HASHED_PASSWORD= `#optional` \
  -e SUDO_PASSWORD=password `#optional` \
  -e SUDO_PASSWORD_HASH= `#optional` \
  -e PROXY_DOMAIN=code-server.my.domain `#optional` \
  -e DEFAULT_WORKSPACE=/config/workspace `#optional` \
  -e PWA_APPNAME=code-server `#optional` \
  -v /path/to/code-server/config:/config \
  --restart unless-stopped \
  --name=code-server \
  lscr.io/linuxserver/code-server:latest
```

@tab Docker Compose

```shell
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
      - TZ=Etc/UTC
      - PASSWORD=password #optional
      - HASHED_PASSWORD= #optional
      - SUDO_PASSWORD=password #optional
      - SUDO_PASSWORD_HASH= #optional
      - PROXY_DOMAIN=code-server.my.domain #optional
      - DEFAULT_WORKSPACE=/config/workspace #optional
      - PWA_APPNAME=code-server #optional
    volumes:
      - /path/to/code-server/config:/config
```

:::
