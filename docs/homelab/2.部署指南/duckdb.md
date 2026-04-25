---
title: DuckDB
tags:
  - database
createTime: 2026/04/25 00:00:00
permalink: /homelab/deploy/duckdb/
---

DuckDB 是一个嵌入式（in-process）分析型数据库，专为 OLAP 场景优化，支持 SQL 接口，具有高性能、低资源消耗的特点，常用于数据分析、ETL、机器学习特征工程等场景。

## 准备工作

创建用于存储数据库文件的目录：

```bash
mkdir -p /share/Container/duckdb
```

## 启动服务

::: tabs

@tab:active Docker Compose

```yaml
services:
  duckdb:
    image: duckdb/duckdb:latest
    container_name: duckdb
    restart: unless-stopped
    # DuckDB 为嵌入式数据库，无网络端口暴露
    # 通过 docker exec 在容器内交互
    volumes:
      - /share/Container/duckdb:/data
    command: /data/duckdb -c ".read /data/init.sql"
```

@tab Docker CLI

```bash
# 交互式模式
docker run -it --rm \
  -v /share/Container/duckdb:/data \
  duckdb/duckdb

# 或执行 SQL 文件
docker run -it --rm \
  -v /share/Container/duckdb:/data \
  duckdb/duckdb /data/init.sql
```

:::

如果需要持续运行一个 HTTP API 服务（供外部程序查询），可以使用 Python HTTP server：

```bash
# 启动 DuckDB HTTP Server
docker run -d \
  --name duckdb \
  --restart unless-stopped \
  -p 5000:5000 \
  -v /share/Container/duckdb:/data \
  duckdb/duckdb httpfs --httpfs d1=/data,readonly=false,archive=:false,filetype=csv,header=true
```

## 初始化配置

创建 `/share/Container/duckdb/init.sql`，在容器首次启动时自动执行：

```sql
-- 安装常用扩展
INSTALL postgres;
LOAD postgres;
INSTALL httpfs;
LOAD httpfs;
INSTALL sqlite;
LOAD sqlite;
INSTALL parquet;
LOAD parquet;

-- 创建示例数据库
CREATE TABLE IF NOT EXISTS events AS
SELECT * FROM 'https://raw.githubusercontent.com/duckdb/duckdb/main/examples/benchmark/tpch/sf1/lineitem.tbl' ( delimiter '|' );
```

## 常用命令

### 交互式 CLI

```bash
# 直接进入交互式命令行
docker exec -it duckdb duckdb

# 退出
.exit
```

### 常用 SQL

```sql
-- 查看所有表
SHOW TABLES;

-- 查看表结构
DESCRIBE events;

-- 简单查询
SELECT * FROM events LIMIT 10;

-- 聚合分析
SELECT l_returnflag, l_linestatus, SUM(l_quantity) AS total_qty, AVG(l_extendedprice) AS avg_price
FROM events
GROUP BY l_returnflag, l_linestatus;

-- 导出为 Parquet
COPY (SELECT * FROM events) TO '/data/events.parquet' (FORMAT PARQUET);

-- 导入 CSV
CREATE TABLE my_data AS SELECT * FROM read_csv_auto('/data/data.csv');
```

### 持久化数据库文件

```bash
# 在宿主机关闭数据库后，复制数据库文件
docker stop duckdb
cp /share/Container/duckdb/my.db /path/to/backup/

# 恢复
cp /path/to/backup/my.db /share/Container/duckdb/my.db
docker start duckdb
```

### 清理

```bash
# 删除容器（保留数据）
docker stop duckdb && docker rm duckdb

# 删除容器并删除数据
docker stop duckdb && docker rm duckdb
sudo rm -rf /share/Container/duckdb
```

## 参考文档

- [DuckDB Documentation](https://duckdb.org/docs/)
- [DuckDB Docker Official Image](https://hub.docker.com/r/duckdb/duckdb)
- [DuckDB SQL Query Examples](https://duckdb.org/docs/sql/examples)
