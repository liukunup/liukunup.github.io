---
title: Logstash
tags:
  - ELK
createTime: 2025/10/16 15:25:23
permalink: /homelab/deploy/logstash/
---

## 部署指南

Logstash 是一个开源的服务器端数据处理管道，能够同时从多个来源采集数据，转换数据，然后将数据发送到您最喜欢的“存储库”中（通常是 Elasticsearch）。

### 准备工作

创建用于存储数据和配置的持久化目录：

```bash
mkdir -p /share/Container/logstash/data
mkdir -p /share/Container/logstash/pipeline
```

创建默认的 pipeline 配置文件 `logstash.conf`：

```bash
cat <<EOF > /share/Container/logstash/pipeline/logstash.conf
input {
  beats {
    port => 5044
  }
}

output {
  stdout {
    codec => rubydebug
  }
  # elasticsearch {
  #   hosts => ["http://elasticsearch:9200"]
  #   index => "%{[@metadata][beat]}-%{[@metadata][version]}-%{+YYYY.MM.dd}"
  # }
}
EOF
```

### 启动服务

::: tabs

@tab:active Docker Compose

```yaml
services:
  logstash:
    image: bitnami/logstash:latest
    container_name: logstash
    restart: always
    ports:
      - "5044:5044"
      - "9600:9600"
    volumes:
      - /share/Container/logstash/data:/bitnami/logstash
      - /share/Container/logstash/pipeline:/opt/bitnami/logstash/pipeline
    # environment:
    #   - LS_JAVA_OPTS=-Xmx256m -Xms256m
    # networks:
    #   - elk-net
```

@tab Docker CLI

```bash
docker run -d \
  --name logstash \
  --restart always \
  -p 5044:5044 \
  -p 9600:9600 \
  -v /share/Container/logstash/data:/bitnami/logstash \
  -v /share/Container/logstash/pipeline:/opt/bitnami/logstash/pipeline \
  bitnami/logstash:latest
```

:::

### 参考文档

- [Bitnami Logstash README](https://github.com/bitnami/containers/blob/main/bitnami/logstash/README.md)
- [Logstash 官方文档](https://www.elastic.co/guide/en/logstash/current/index.html)
