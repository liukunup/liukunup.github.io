---
title: Etcd
createTime: 2026/01/13 14:53:32
permalink: /homelab/deploy/etcd/
---

Etcd 是一个分布式键值存储系统，主要用于共享配置和服务发现。本指南介绍如何使用 [bitnami/etcd](https://github.com/bitnami/containers/tree/main/bitnami/etcd) 镜像进行部署。

## 1. 单节点部署

单节点模式适用于开发测试环境。

### Docker Compose

```yaml
version: '3'

services:
  etcd:
    image: docker.io/bitnami/etcd:3.5
    container_name: etcd-standalone
    environment:
      - ALLOW_NONE_AUTHENTICATION=yes
      - ETCD_ADVERTISE_CLIENT_URLS=http://etcd:2379
    ports:
      - "2379:2379"
      - "2380:2380"
    volumes:
      - etcd_data:/bitnami/etcd

volumes:
  etcd_data:
    driver: local
```

## 2. 集群模式 (3节点)

生产环境建议使用奇数个节点组成 HA 集群。

### Docker Compose

```yaml
version: '3'

services:
  etcd1:
    image: docker.io/bitnami/etcd:3.5
    container_name: etcd1
    environment:
      - ALLOW_NONE_AUTHENTICATION=yes
      - ETCD_NAME=etcd1
      - ETCD_INITIAL_ADVERTISE_PEER_URLS=http://etcd1:2380
      - ETCD_LISTEN_PEER_URLS=http://0.0.0.0:2380
      - ETCD_LISTEN_CLIENT_URLS=http://0.0.0.0:2379
      - ETCD_ADVERTISE_CLIENT_URLS=http://etcd1:2379
      - ETCD_INITIAL_CLUSTER_TOKEN=etcd-cluster
      - ETCD_INITIAL_CLUSTER=etcd1=http://etcd1:2380,etcd2=http://etcd2:2380,etcd3=http://etcd3:2380
      - ETCD_INITIAL_CLUSTER_STATE=new
    volumes:
      - etcd1_data:/bitnami/etcd

  etcd2:
    image: docker.io/bitnami/etcd:3.5
    container_name: etcd2
    environment:
      - ALLOW_NONE_AUTHENTICATION=yes
      - ETCD_NAME=etcd2
      - ETCD_INITIAL_ADVERTISE_PEER_URLS=http://etcd2:2380
      - ETCD_LISTEN_PEER_URLS=http://0.0.0.0:2380
      - ETCD_LISTEN_CLIENT_URLS=http://0.0.0.0:2379
      - ETCD_ADVERTISE_CLIENT_URLS=http://etcd2:2379
      - ETCD_INITIAL_CLUSTER_TOKEN=etcd-cluster
      - ETCD_INITIAL_CLUSTER=etcd1=http://etcd1:2380,etcd2=http://etcd2:2380,etcd3=http://etcd3:2380
      - ETCD_INITIAL_CLUSTER_STATE=new
    volumes:
      - etcd2_data:/bitnami/etcd

  etcd3:
    image: docker.io/bitnami/etcd:3.5
    container_name: etcd3
    environment:
      - ALLOW_NONE_AUTHENTICATION=yes
      - ETCD_NAME=etcd3
      - ETCD_INITIAL_ADVERTISE_PEER_URLS=http://etcd3:2380
      - ETCD_LISTEN_PEER_URLS=http://0.0.0.0:2380
      - ETCD_LISTEN_CLIENT_URLS=http://0.0.0.0:2379
      - ETCD_ADVERTISE_CLIENT_URLS=http://etcd3:2379
      - ETCD_INITIAL_CLUSTER_TOKEN=etcd-cluster
      - ETCD_INITIAL_CLUSTER=etcd1=http://etcd1:2380,etcd2=http://etcd2:2380,etcd3=http://etcd3:2380
      - ETCD_INITIAL_CLUSTER_STATE=new
    volumes:
      - etcd3_data:/bitnami/etcd

volumes:
  etcd1_data:
  etcd2_data:
  etcd3_data:
```

## 3. 配置说明

| 变量名 | 说明 | 示例值 |
| :--- | :--- | :--- |
| `ALLOW_NONE_AUTHENTICATION` | 是否允许无密码访问（'yes' 或 'no'）。 | `yes` |
| `ETCD_ROOT_PASSWORD` | 如果不允许无密访问，设置 root 用户密码。 | `s3cr3t` |
| `ETCD_NAME` | 当前节点的唯一及其名称。 | `etcd1` |
| `ETCD_ADVERTISE_CLIENT_URLS` | 广播给客户端此节点可达的地址 (通常是容器名或IP)。 | `http://etcd1:2379` |
| `ETCD_LISTEN_CLIENT_URLS` | 监听客户端请求的地址。 | `http://0.0.0.0:2379` |
| `ETCD_INITIAL_ADVERTISE_PEER_URLS` | 广播给集群其他节点此节点可达的地址 (集群通信)。 | `http://etcd1:2380` |
| `ETCD_LISTEN_PEER_URLS` | 监听集群其他节点请求的地址。 | `http://0.0.0.0:2380` |
| `ETCD_INITIAL_CLUSTER` | **集群引导的关键配置**，列出所有节点的通信地址。 | `etcd1=http://etcd1:2380,etcd2=...` |
| `ETCD_INITIAL_CLUSTER_TOKEN` | 集群的唯一令牌，用于区分不同集群。 | `etcd-cluster-1` |
| `ETCD_INITIAL_CLUSTER_STATE` | 集群初始状态，`new` 表示新建集群，`existing` 表示加入现有集群。 | `new` |

## 4. 持久化存储

Bitnami 镜像将数据存储在容器内的 `/bitnami/etcd` 目录。
为了防止容器删除后数据丢失，你需要将此目录挂载到宿主机或 Docker Volume。

```yaml
volumes:
  - ./etcd_data:/bitnami/etcd
```

## 5. 参考文档

*   [Bitnami Etcd Docker Image](https://hub.docker.com/r/bitnami/etcd)
*   [Etcd Official Documentation](https://etcd.io/docs/)
