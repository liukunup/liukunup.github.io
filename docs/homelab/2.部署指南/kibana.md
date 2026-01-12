---
title: Kibana
tags:
  - ELK
createTime: 2025/10/16 15:26:52
permalink: /homelab/deploy/kibana/
---

## 部署指南

Kibana 是一个免费且开放的用户界面，能够让您对 Elasticsearch 数据进行可视化，并让您在 Elastic Stack 中进行导航。

### 准备工作

创建用于存储数据的持久化目录：

```bash
mkdir -p /share/Container/kibana/data
```

### 启动服务

::: tabs

@tab:active Docker Compose

```yaml
services:
  kibana:
    image: bitnami/kibana:latest
    container_name: kibana
    restart: always
    ports:
      - "5601:5601"
    environment:
      # 指向您的 Elasticsearch 实例地址
      - KIBANA_ELASTICSEARCH_URL=http://elasticsearch:9200
    volumes:
      - /share/Container/kibana/data:/bitnami/kibana
    # 确保与 Elasticsearch 在同一网络下
    # networks:
    #   - elk-net
```

@tab Docker CLI

```bash
docker run -d \
  --name kibana \
  --restart always \
  -p 5601:5601 \
  -e KIBANA_ELASTICSEARCH_URL=http://elasticsearch:9200 \
  -v /share/Container/kibana/data:/bitnami/kibana \
  bitnami/kibana:latest
```

:::

### 参考文档

- [Bitnami Kibana README](https://github.com/bitnami/containers/blob/main/bitnami/kibana/README.md)
