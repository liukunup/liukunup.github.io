---
title: Neo4j
tags:
  - database
createTime: 2026/04/25 00:00:00
permalink: /homelab/deploy/neo4j/
---

Neo4j 是一个高性能的图数据库，将数据存储为节点和边，支持一键遍历关系，适用于知识图谱、推荐系统、欺诈检测等场景。

## 准备工作

创建用于存储数据的持久化目录：

```bash
mkdir -p /share/Container/neo4j/data
```

## 启动服务

::: tabs

@tab:active Docker Compose

```yaml
services:
  neo4j:
    image: neo4j:5
    container_name: neo4j
    restart: unless-stopped
    ports:
      - 7474:7474   # HTTP 接口
      - 7687:7687   # Bolt 协议
    environment:
      NEO4J_AUTH: neo4j/password123
      NEO4J_PLUGINS: '["apoc"]'
      NEO4J_server_memory_heap_max__size: 2G
      NEO4J_server_memory_pagecache_size: 1G
    volumes:
      - /share/Container/neo4j/data:/data
      - /share/Container/neo4j/logs:/logs
    healthcheck:
      test: ["CMD-SHELL", "cypher-shell -u neo4j -p password123 'RETURN 1' || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

@tab Docker CLI

```bash
docker run -d \
  --name neo4j \
  --restart unless-stopped \
  -p 7474:7474 \
  -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password123 \
  -e NEO4J_PLUGINS='["apoc"]' \
  -e NEO4J_server_memory_heap_max__size=2G \
  -e NEO4J_server_memory_pagecache_size=1G \
  -v /share/Container/neo4j/data:/data \
  -v /share/Container/neo4j/logs:/logs \
  neo4j:5
```

:::

## 常用命令

### 连接数据库

**Cypher Shell（命令行）**

```bash
docker exec -it neo4j cypher-shell -u neo4j -p password123
```

**Browser UI**

打开浏览器访问 `http://<your-host>:7474`，使用 `neo4j / password123` 登录。

### 常用 Cypher 语句

```cypher
-- 查看所有节点
MATCH (n) RETURN n LIMIT 25;

-- 创建节点
CREATE (p:Person {name: 'Alice', age: 30});

-- 创建关系
MATCH (a:Person {name: 'Alice'}), (b:Person {name: 'Bob'})
CREATE (a)-[:KNOWS]->(b);

-- 查询路径
MATCH path = (a)-[:KNOWS*1..3]-(b)
WHERE a.name = 'Alice'
RETURN path;
```

### 数据备份

```bash
# 导出数据库到 dump 文件
docker exec neo4j neo4j-admin database dump neo4j --to-path=/data/backups/

# 停止数据库
docker exec neo4j neo4j stop

# 恢复数据库
docker exec neo4j neo4j-admin database load neo4j --from-path=/data/backups/ --overwrite-destination
docker exec neo4j neo4j start
```

### 清理

```bash
# 停止并删除容器（保留数据）
docker stop neo4j && docker rm neo4j

# 删除容器并删除数据
docker stop neo4j && docker rm neo4j
sudo rm -rf /share/Container/neo4j
```

## 参考文档

- [Neo4j Docker Official Image](https://neo4j.com/docs/operations-manual/current/docker/)
- [Neo4j Documentation](https://neo4j.com/docs/)
- [APOC Plugin](https://neo4j.com/docs/apoc/)
