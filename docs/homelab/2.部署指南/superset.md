---
title: Superset
tags:
  - apache
  - superset
  - bi
  - analytics
createTime: 2026/06/15 06:00:00
permalink: /homelab/deploy/superset/
---

https://superset.apache.org/user-docs/

## 🚀 部署指南

::: tabs

@tab:active Docker Compose

https://superset.apache.org/user-docs/quickstart

https://superset.apache.org/admin-docs/installation/docker-compose

```bash
# 1. 克隆仓库
git clone https://github.com/apache/superset

# 2. 签出版本
cd superset
git checkout tags/6.1.0

# 3. 拉取服务
docker compose -f docker-compose-image-tag.yml up
```

@tab Kubernetes (Helm)

https://superset.apache.org/admin-docs/installation/kubernetes

```bash
# 1. 添加 Helm 仓库
helm repo add superset https://apache.github.io/superset
helm search repo superset

# 2. 安装 Superset
helm upgrade --install --values my-values.yaml superset superset/superset
```

:::

- 默认账号：`admin`
- 默认密码：`admin`
- 访问地址：`http://localhost:8088`
