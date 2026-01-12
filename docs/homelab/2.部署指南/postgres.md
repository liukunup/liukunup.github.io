---
title: PostgreSQL
createTime: 2026/01/12 14:40:00
permalink: /homelab/deploy/postgresql/
---

## 部署指南

PostgreSQL 是一个功能强大的开源对象关系数据库系统，经过 30 多年的积极开发，在可靠性、功能稳健性和性能方面赢得了极好的声誉。

### 准备工作

创建用于存储数据库数据的持久化目录：

```bash
mkdir -p /share/Container/postgresql/data
```

### 启动服务

::: tabs

@tab:active Docker Compose

```yaml
services:
  postgresql:
    image: postgres:16
    container_name: postgresql
    restart: always
    environment:
      POSTGRES_PASSWORD: mysecretpassword
      # 可选：初始化创建一个数据库和用户
      # POSTGRES_DB: mydatabase
      # POSTGRES_USER: myuser
    ports:
      - "5432:5432"
    volumes:
      - /share/Container/postgresql/data:/var/lib/postgresql/data
    # 优化配置（可选）
    # command: postgres -c 'max_connections=200' -c 'shared_buffers=1GB'
```

@tab Docker CLI

```bash
docker run -d \
  --name postgresql \
  --restart always \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -v /share/Container/postgresql/data:/var/lib/postgresql/data \
  postgres:16
```

:::

### 常用命令

- **连接数据库**:

```bash
docker exec -it postgresql psql -U postgres
```

- **备份数据库 (dump)**:

```bash
docker exec postgresql pg_dump -U postgres mydatabase > mydatabase_backup.sql
```

- **恢复数据库 (restore)**:

```bash
cat mydatabase_backup.sql | docker exec -i postgresql psql -U postgres -d mydatabase
```

### 参考文档

- [PostgreSQL Docker Official Image](https://hub.docker.com/_/postgres)
