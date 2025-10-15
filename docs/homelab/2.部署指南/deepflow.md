---
title: DeepFlow
createTime: 2025/10/15 09:30:10
permalink: /homelab/deploy/deepflow/
---

官方文档请查看[DeepFlow Docs](https://deepflow.io/docs/about/overview/)

## Deploy All-in-One DeepFlow

Download the DeepFlow docker-compose package

```shell
wget  https://deepflow-ce.oss-cn-beijing.aliyuncs.com/pkg/docker-compose/latest/linux/deepflow-docker-compose.tar
tar -zxf deepflow-docker-compose.tar
```

Configure the .env variables

```shell
vim ./deepflow-docker-compose/.env
DEEPFLOW_VERSION=v6.6  # FIXME: DeepFlow Version
NODE_IP_FOR_DEEPFLOW=192.168.101.116  # FIXME: Node IP
```

Install DeepFlow

```shell
docker compose -f deepflow-docker-compose/docker-compose.yaml up -d
```

## Deploy DeepFlow Agent

Refer to Monitor Traditional Servers to deploy deepflow-agent on this server.

## Access the Grafana Page

After deploying through docker compose, point your browser to http://<$NODE_IP_FOR_DEEPFLOW>:3000 to log in to the Grafana console.

::: info
Default credentials:
- Username: admin
- Password: deepflow
:::

## Download deepflow-ctl

deepflow-ctl is the command-line management tool for DeepFlow. It is recommended to deploy it on the K8s Node where deepflow-server is located for subsequent use in Agent group configuration management and other maintenance operations:

```shell
# Sync with the current server version
Version=v6.6

# Download using variables
curl -o /usr/bin/deepflow-ctl \
  "https://deepflow-ce.oss-cn-beijing.aliyuncs.com/bin/ctl/$Version/linux/$(arch | sed 's|x86_64|amd64|' | sed 's|aarch64|arm64|')/deepflow-ctl"

# Add execution permissions
chmod a+x /usr/bin/deepflow-ctl
```
