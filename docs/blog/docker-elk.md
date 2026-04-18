---
title: Docker ELK Stack 部署指南
createTime: 2026/04/18 10:00:00
permalink: /blog/docker-elk-deployment/
---

## 简介

[docker-elk](https://github.com/deviantony/docker-elk) 是基于 Docker 和 Docker Compose 部署 Elastic Stack (ELK) 的开源项目，支持 Elasticsearch、Logstash、Kibana 三大组件的快速启动。

## 架构组件

| 服务 | 端口 | 说明 |
|------|------|------|
| Elasticsearch | 9200, 9300 | 分布式搜索与分析引擎 |
| Logstash | 5044, 50000, 9600 | 日志收集、过滤、转发 |
| Kibana | 5601 | 数据可视化 Web UI |

## 快速部署

### 1. 克隆仓库

```shell
git clone https://github.com/deviantony/docker-elk.git
cd docker-elk
```

### 2. 配置密码

复制环境变量模板文件：

```shell
cp .env.example .env
```

或手动创建 `.env` 文件：

```shell
ELASTIC_PASSWORD=your_password
LOGSTASH_INTERNAL_PASSWORD=your_password
KIBANA_SYSTEM_PASSWORD=your_password
METRICBEAT_INTERNAL_PASSWORD=your_password
FILEBEAT_INTERNAL_PASSWORD=your_password
HEARTBEAT_INTERNAL_PASSWORD=your_password
MONITORING_INTERNAL_PASSWORD=your_password
BEATS_SYSTEM_PASSWORD=your_password
ELASTIC_VERSION=8.12.0
```

### 3. 启动服务

```shell
# 1. 初始化 Elasticsearch 用户和密码
docker compose up setup

# 2. 启动所有服务
docker compose up
```

可选：生成 Kibana 加密密钥（推荐）

```shell
docker compose up kibana-genkeys
```

启动完成后，Kibana 大约需要一分钟初始化。默认访问：

- Kibana: http://localhost:5601
- Elasticsearch: http://localhost:9200

默认凭证：
- 用户名：`elastic`
- 密码：`changeme`（首次启动后建议修改）

### 4. 访问服务

- Kibana: http://localhost:5601
- Elasticsearch: http://localhost:9200

默认用户：`elastic`，密码为 `ELASTIC_PASSWORD` 设置的值。

## Docker Compose 配置解析

```yaml
services:
  elasticsearch:
    build:
      context: elasticsearch/
      args:
        ELASTIC_VERSION: ${ELASTIC_VERSION}
    volumes:
      - ./elasticsearch/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro,Z
      - elasticsearch:/usr/share/elasticsearch/data:Z
    ports:
      - 9200:9200
      - 9300:9300
    environment:
      node.name: elasticsearch
      ES_JAVA_OPTS: -Xms512m -Xmx512m
      ELASTIC_PASSWORD: ${ELASTIC_PASSWORD:-}
      discovery.type: single-node  # 单节点模式
    restart: unless-stopped

  logstash:
    build:
      context: logstash/
      args:
        ELASTIC_VERSION: ${ELASTIC_VERSION}
    volumes:
      - ./logstash/config/logstash.yml:/usr/share/logstash/config/logstash.yml:ro,Z
      - ./logstash/pipeline:/usr/share/logstash/pipeline:ro,Z
    ports:
      - 5044:5044
      - 50000:50000/tcp
      - 50000:50000/udp
      - 9600:9600
    environment:
      LS_JAVA_OPTS: -Xms256m -Xmx256m
      LOGSTASH_INTERNAL_PASSWORD: ${LOGSTASH_INTERNAL_PASSWORD:-}
    depends_on:
      - elasticsearch
    restart: unless-stopped

  kibana:
    build:
      context: kibana/
      args:
        ELASTIC_VERSION: ${ELASTIC_VERSION}
    volumes:
      - ./kibana/config/kibana.yml:/usr/share/kibana/config/kibana.yml:ro,Z
    ports:
      - 5601:5601
    environment:
      KIBANA_SYSTEM_PASSWORD: ${KIBANA_SYSTEM_PASSWORD:-}
    depends_on:
      - elasticsearch
    restart: unless-stopped

networks:
  elk:
    driver: bridge

volumes:
  elasticsearch:
```

## 生产环境注意事项

### 内存配置

根据服务器资源调整 JVM 堆大小：

```shell
# Elasticsearch
ES_JAVA_OPTS: -Xms2g -Xmx2g

# Logstash
LS_JAVA_OPTS: -Xms1g -Xmx1g
```

### 数据持久化

默认使用 Docker Volume 持久化 Elasticsearch 数据：

```shell
# 查看 volume
docker volume ls | grep docker-elk_elasticsearch
```

### 暴露端口

生产环境建议通过 Nginx 反向代理访问 Kibana，并配置 HTTPS 和身份认证。

### 健康检查

```shell
# 检查服务状态
docker compose ps

# 查看日志
docker compose logs -f elasticsearch
docker compose logs -f logstash
docker compose logs -f kibana
```

## 发送日志到 Logstash

### 使用 Filebeat

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/*.log

output.logstash:
  hosts: ["localhost:5044"]
```

### 使用 Logback

```xml
<appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
  <destination>localhost:50000</destination>
</appender>
```

## 常见问题

### Q: Kibana 无法连接 Elasticsearch？

检查 `KIBANA_SYSTEM_PASSWORD` 是否正确设置，并确保已运行 `setup` 服务初始化用户。

### Q: 如何修改默认端口？

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "127.0.0.1:9200:9200"    # 仅本地访问
  - "127.0.0.1:5601:5601"    # 仅本地访问
```

### Q: 如何升级 ELK 版本？

```shell
# 1. 修改 .env 中的 ELASTIC_VERSION
# 2. 重新构建镜像
docker compose build

# 3. 重启服务
docker compose up -d
```

## 参考链接

- [GitHub: deviantony/docker-elk](https://github.com/deviantony/docker-elk)
- [Elasticsearch 官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)
- [Kibana 官方文档](https://www.elastic.co/guide/en/kibana/current/docker.html)
