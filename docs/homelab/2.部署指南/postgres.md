---
title: PostgreSQL
tags:
  - database
createTime: 2026/01/12 14:40:00
permalink: /homelab/deploy/postgresql/
---

PostgreSQL 是一个功能强大的开源对象关系数据库系统，经过 30 多年的积极开发，在可靠性、功能稳健性和性能方面赢得了极好的声誉。

## 准备工作

创建用于存储数据库数据的持久化目录

```bash
mkdir -p /share/Container/postgresql
```

## 启动服务

::: tabs

@tab:active Docker Compose

```yaml
services:
  # PostgreSQL - An object-relational database management system (ORDBMS)
  # https://postgresql.org/docs/current/index.html
  postgres:
    image: postgres  # https://hub.docker.com/_/postgres
    restart: unless-stopped
    ports:
      - 5432:5432
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-root}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
    volumes:
      - /share/Container/postgresql:/var/lib/postgresql
    healthcheck:
      test: |
        CMD-SHELL
        pg_isready -h 127.0.0.1 -p 5432 -q -U ${DB_USER}
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 30s

  adminer:
    image: adminer
    restart: always
    ports:
      - 8080:8080
```

@tab Docker CLI

```bash
docker run -d \
  -p 5432:5432 \
  -e POSTGRES_DB=db \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -v /share/Container/postgresql:/var/lib/postgresql \
  --restart unless-stopped \
  --name postgresql \
  postgres
```

:::

## 常用命令

- **连接数据库**

```bash
docker exec -it postgresql psql -U postgres
```

- **备份数据库 (dump)**

```bash
docker exec postgresql pg_dump -U postgres mydatabase > mydatabase_backup.sql
```

- **恢复数据库 (restore)**

```bash
cat mydatabase_backup.sql | docker exec -i postgresql psql -U postgres -d mydatabase
```

### 参考文档

- [PostgreSQL Docker Official Image](https://hub.docker.com/_/postgres)
