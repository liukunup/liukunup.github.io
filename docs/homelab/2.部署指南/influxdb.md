---
title: InfluxDB
tags:
  - database
  - influxdb
  - time-series
  - monitoring
createTime: 2026/04/25 22:10:00
permalink: /homelab/deploy/influxdb/
---

## 🚀 部署指南

::: tabs

@tab:active Docker Compose

查看当前用户的 `UID` 和 `GID`

```shell
id
```

```yaml
services:
  # InfluxDB - 时序数据库
  # https://docs.influxdata.com/influxdb/v2/
  influxdb:
    image: influxdb:2.7  # https://hub.docker.com/_/influxdb
    container_name: influxdb
    restart: unless-stopped
    ports:
      - "8086:8086"
    volumes:
      - ./influxdb/data:/var/lib/influxdb2  # 持久化数据目录
      - ./influxdb/config:/etc/influxdb2    # 配置文件目录
    environment:
      - TZ=Asia/Shanghai
    deploy:
      resources:
        limits:
          memory: '1g'
          cpus: '0.5'
```

@tab Docker CLI

```shell
docker run -d \
  -p 8086:8086 \
  -v /path/to/influxdb:/var/lib/influxdb2 \
  -v /path/to/influxdb/config:/etc/influxdb2 \
  -e TZ=Asia/Shanghai \
  --memory="1g" \
  --cpus="0.5" \
  --restart=unless-stopped \
  --name=influxdb \
  influxdb:2.7
```

:::

## 初始化配置

### Web UI

首次访问 `http://<IP>:8086` 进入初始化向导

1. **用户**: 设置管理员用户名和密码
2. **组织 (Organization)**: 设置组织名称，如 `homelab`
3. **Bucket**: 创建初始存储桶，如 `metrics`
4. **完成**: 获取 API Token 并记录

### CLI 初始化

```shell
# 进入容器
docker exec -it influxdb influx

# 或一步执行
docker exec -it influxdb influx setup \
  --username admin \
  --password admin123 \
  --org homelab \
  --bucket metrics \
  --force
```

## 常用命令

### CLI 操作

```shell
# 进入 InfluxDB CLI
docker exec -it influxdb influx

# 查看所有 Bucket
influx bucket list

# 创建 Bucket
influx bucket create -n my-bucket -o homelab

# 查看所有组织
influx org list

# 查看所有 Token
influx auth list

# 创建 Token
influx auth create \
  --org homelab \
  --description "Grafana Access" \
  --read-bucket <bucket-id> \
  --write-bucket <bucket-id>

# 查看帮助
influx --help
```

### 备份与恢复

```shell
# 备份
docker exec influxdb influx backup /tmp/backup -b my-bucket
docker cp influxdb:/tmp/backup ./influxdb-backup

# 恢复
docker cp ./influxdb-backup influxdb:/tmp/backup
docker exec influxdb influx restore /tmp/backup -b my-bucket -o homelab
```

## 数据写入

### Line Protocol

```shell
# 语法: measurement,tag1=val1,tag2=val2 field1=val1,field2=val2 <timestamp>

# 写入 CPU 指标
docker exec -i influxdb influx write \
  --bucket metrics \
  --org homelab \
  --token <your-token> \
  --precision s \
  --format=lp \
  <<EOF
cpu,host=server01,region=us-west usage_idle=95.5,usage_user=3.2,usage_system=1.3
cpu,host=server02,region=us-east usage_idle=92.1,usage_user=5.5,usage_system=2.4
EOF
```

### InfluxDB Client Library

- [Python](https://github.com/influxdata/influxdb-client-python)
- [Go](https://github.com/influxdata/influxdb-client-go)
- [JavaScript](https://github.com/influxdata/influxdb-client-js)

## Telegraf 采集器

[Telegraf](https://github.com/influxdata/telegraf) 是 InfluxDB 的官方采集代理

::: tabs

@tab Docker Compose

```yaml
services:
  telegraf:
    image: telegraf:1.30  # https://hub.docker.com/_/telegraf
    container_name: telegraf
    restart: unless-stopped
    volumes:
      - ./telegraf/telegraf.conf:/etc/telegraf/telegraf.conf
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - TZ=Asia/Shanghai
      - HOST_PROC=/host/proc
      - HOST_SYS=/host/sys
      - HOST_ETC=/host/etc
    network_mode: host
    depends_on:
      - influxdb
```

@tab Docker CLI

```shell
docker run -d \
  --name telegraf \
  --restart unless-stopped \
  -v /path/to/telegraf.conf:/etc/telegraf/telegraf.conf \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e HOST_PROC=/host/proc \
  -e HOST_SYS=/host/sys \
  -e HOST_ETC=/host/etc \
  --network host \
  telegraf:1.30
```

:::

## Grafana 集成

登录 Grafana 后:

1. `Configuration` → `Data Sources` → `Add data source`
2. 选择 `InfluxDB`
3. 配置:
   - **URL**: `http://influxdb:8086`
   - **Organization**: `homelab`
   - **Token**: `<your-token>`
   - **Default Bucket**: `metrics`
4. 点击 `Save & Test`

## 参考文档

- [InfluxDB 2.7 Documentation](https://docs.influxdata.com/influxdb/v2/)
- [InfluxDB Docker Image](https://hub.docker.com/_/influxdb)
- [Telegraf Documentation](https://docs.influxdata.com/telegraf/v1/)
