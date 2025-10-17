---
title: cAdvisor
createTime: 2025/10/17 23:30:11
permalink: /homelab/deploy/cadvisor/
---

## 部署指南

### 通过 docker 方式部署

```shell
VERSION=v0.49.1 # use the latest release version from https://github.com/google/cadvisor/releases

sudo docker run \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --volume=/dev/disk/:/dev/disk:ro \
  --publish=8080:8080 \
  --detach=true \
  --name=cadvisor \
  --privileged \
  --device=/dev/kmsg \
  gcr.io/cadvisor/cadvisor:$VERSION
```

### 通过 docker compose 方式部署

```yaml
services:
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:${VERSION:-v0.49.1}
    container_name: cadvisor
    restart: unless-stopped
    privileged: true
    ports:
      - "8080:8080"
    volumes:
      - "/:/rootfs:ro"
      - "/var/run:/var/run:ro"
      - "/sys:/sys:ro"
      - "/var/lib/docker/:/var/lib/docker:ro"
      - "/dev/disk/:/dev/disk:ro"
    devices:
      - "/dev/kmsg:/dev/kmsg"
```

在 1Panel 上部署

```yaml
networks:
  1panel-network:
    external: true
services:
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:${VERSION:-v0.49.1}
    container_name: cadvisor
    hostname: cadvisor
    restart: unless-stopped
    privileged: true
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    devices:
      - /dev/kmsg:/dev/kmsg
    labels:
      createdBy: Apps
    networks:
      - 1panel-network
```
