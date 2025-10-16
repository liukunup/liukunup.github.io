---
title: Distribution
createTime: 2025/10/15 17:12:25
permalink: /homelab/deploy/distribution/
---

CNCF [Distribution](https://distribution.github.io/distribution/)

## 安装部署

- docker-compose.yaml

```yaml
services:

  registry:
    image: docker.io/registry:3
    container_name: registry
    hostname: registry
    restart: unless-stopped
    ports:
      - "15000:15000"
      - "15001:15001"
    volumes:
      - /path/to/registry/config.yml:/etc/docker/registry/config.yml:ro
      - /path/to/registry/data:/var/lib/registry
```

- config.yml

```yaml
version: 0.1

log:
  accesslog:
    disabled: true
  level: info
  formatter: text
  fields:
    service: registry
    environment: prod

storage:
  filesystem:
    rootdirectory: /var/lib/registry
    maxthreads: 100
  tag:
    concurrencylimit: 8
  delete:
    enabled: false
  redirect:
    disable: false
  cache:
    blobdescriptor: redis
    blobdescriptorsize: 10000
  maintenance:
    uploadpurging:
      enabled: true
      age: 168h
      interval: 24h
      dryrun: false
    readonly:
      enabled: false

http:
  addr: 0.0.0.0:15000
  debug:
    addr: 0.0.0.0:15001
    prometheus:
      enabled: true
      path: /metrics
  headers:
    X-Content-Type-Options: [nosniff]

redis:
  addrs: [192.168.1.x:6379]
  password: pass
  db: 0
  dialtimeout: 10ms
  readtimeout: 10ms
  writetimeout: 10ms
  maxidleconns: 16
  poolsize: 64
  connmaxidletime: 300s

proxy:
  remoteurl: https://docker.example.com
  ttl: 168h
```

部署应用

```shell
docker compose up -d
```

## 使用说明

```shell
# 拉取镜像用于测试
docker pull hello-world

# 将测试镜像打上标签
docker tag hello-world localhost:5000/my-hello-world
# 推送已经打标签的测试镜像到仓库
docker push localhost:5000/my-hello-world

# 删除本地镜像
docker image remove hello-world
docker image remove localhost:5000/my-hello-world

# 验证从仓库拉取镜像
docker pull localhost:5000/my-hello-world
```
