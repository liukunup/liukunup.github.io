---
title: Distribution
createTime: 2025/10/15 17:12:25
permalink: /homelab/deploy/distribution/
---

CNCF [Distribution](https://distribution.github.io/distribution/)

## 安装部署

- 快速开始

```shell
docker run -d \
  -p 5000:5000 \
  --restart=always \
  --name=registry \
  registry:3
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
