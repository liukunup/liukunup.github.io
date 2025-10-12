---
title: Dev Stack
createTime: 2025/10/11 23:55:06
permalink: /homelab/deploy/dev-stack/
---

## 使用指南

```shell
# 从模板创建环境变量文件（记得修改所需的参数）
cp .env.example .env

# 拉取镜像
docker compose --profile xxx pull

# 拉起指定服务
docker compose --profile xxx up -d
```

## 配置文件

- .env.example

```plaintext
# Docker Compose Project Name
COMPOSE_PROJECT_NAME=dev-stack

# Global settings
## Network name
NETWORK_NAME=dev-stack-network
## Registry
REGISTRY=docker.io
REGISTRY_QUAY=quay.io
## Host IP
HOST_IP=
## User and Group ID
PUID=1000
PGID=1000
## Timezone
TZ=Asia/Shanghai
## Language
LANG=en_US.UTF-8

# MySQL
MYSQL_IMAGE=mysql:8.4.6
MYSQL_PORT=3306
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=testing
MYSQL_USER=testing
MYSQL_PASSWORD=

# phpMyAdmin
PMA_IMAGE=phpmyadmin/phpmyadmin:5.2.2
PMA_PORT=8082
PMA_ARBITRARY=0

# Redis
REDIS_IMAGE=redis:8.2.1
REDIS_PORT=6379
REDIS_PASSWORD=

# Redis Commander
REDIS_COMMANDER_IMAGE=rediscommander/redis-commander:latest
REDIS_COMMANDER_PORT=8081
REDIS_COMMANDER_HTTP_USERNAME=admin
REDIS_COMMANDER_HTTP_PASSWORD=

# MinIO
MINIO_IMAGE=minio/minio:latest
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ROOT_USERNAME=admin
MINIO_ROOT_PASSWORD=

# etcd
ETCD_IMAGE=coreos/etcd:v3.6.4
ETCD_CLIENT_PORT=2379
ETCD_PEER_PORT=2380

# Kafka
ZOOKEEPER_IMAGE=zookeeper:3.9.4
ZOOKEEPER_PORT=2181
KAFKA_IMAGE=kafka:3.9.1
KAFKA_PORT=9092

# APISIX
APISIX_IMAGE=apache/apisix:3.13.0-debian
APISIX_HTTP_PORT=9080
APISIX_HTTPS_PORT=9443
APISIX_CONTROL_PORT=9090
APISIX_METRICS_PORT=9091
APISIX_ADMIN_PORT=9180
APISIX_API_KEY=

# code-server
CODE_SERVER_IMAGE=codercom/code-server:4.103.2
CODE_SERVER_PORT=8080

# Jupyter Notebook - Python
NOTEBOOK_PYTHON_IMAGE=jupyter/minimal-notebook:notebook-7.4.5
NOTEBOOK_PYTHON_PORT=8888
NOTEBOOK_PYTHON_PASSWORD=

# Jupyter Notebook - C++
NOTEBOOK_CPP_IMAGE=datainpoint/xeus-cling-notebook:latest
NOTEBOOK_CPP_PORT=8889
NOTEBOOK_CPP_PASSWORD=

# Jupyter Notebook - SQL
NOTEBOOK_SQL_IMAGE=datainpoint/xeus-sql-notebook:latest
NOTEBOOK_SQL_PORT=8890
NOTEBOOK_SQL_PASSWORD=

# nginx
NGINX_IMAGE=nginx:latest
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# grafana
GRAFANA_IMAGE=grafana/grafana:latest
GRAFANA_PORT=3000
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=

# InfluxDB
INFLUXDB_IMAGE=influxdb:2.7
INFLUXDB_HTTP_PORT=8086
INFLUXDB_ADMIN_USER=admin
INFLUXDB_ADMIN_PASSWORD=
INFLUXDB_ORG=testing
INFLUXDB_BUCKET=jmeter
INFLUXDB_TOKEN=

# ClickHouse 配置
CLICKHOUSE_IMAGE=clickhouse/clickhouse-server:23.8
CLICKHOUSE_HTTP_PORT=8123
CLICKHOUSE_TCP_PORT=9000
CLICKHOUSE_INTER_PORT=9009
CLICKHOUSE_DB=default
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
```

- docker-compose.yml

```yaml
# Dev Stack

networks:
  dev-stack:
    name: ${NETWORK_NAME}
    driver: bridge

volumes:
  mysql-data:
  redis-data:
  minio-data:
  etcd-data:
  kafka-data:
  zookeeper-data:
  apisix-data:
  code-server-config:
  notebook-python-data:
  notebook-cpp-data:
  notebook-sql-data:
  nginx-data:
  grafana-data:
  influxdb-data:
  influxdb-config:
  clickhouse-data:
  clickhouse-log:

services:

  # MySQL
  # https://dev.mysql.com/doc/refman/8.4/en/
  mysql:
    image: ${REGISTRY:-docker.io}/${MYSQL_IMAGE:-mysql:latest}
    container_name: mysql
    hostname: mysql
    restart: unless-stopped
    ports:
      - ${MYSQL_PORT:-3306}:3306
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:?root password is required}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-testing}
      MYSQL_USER: ${MYSQL_USER:-testing}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:?password is required}
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - dev-stack
    profiles:
      - all
      - base
      - database
      - mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p$$MYSQL_ROOT_PASSWORD"]
      interval: 30s
      timeout: 10s
      retries: 3

  phpmyadmin:
    image: ${REGISTRY:-docker.io}/${PMA_IMAGE:-phpmyadmin/phpmyadmin:latest}
    container_name: phpmyadmin
    hostname: phpmyadmin
    restart: unless-stopped
    ports:
      - ${PMA_PORT:-80}:80
    environment:
      PMA_ARBITRARY: ${PMA_ARBITRARY:-1}
      PMA_HOST: mysql
      PMA_PORT: ${MYSQL_PORT:-3306}:3306
    networks:
      - dev-stack
    depends_on:
      - mysql
    profiles:
      - all
      - base
      - database
      - mysql
      - phpmyadmin

  # Redis
  # https://redis.io/docs/latest/operate/oss_and_stack/
  redis:
    image: ${REGISTRY:-docker.io}/${REDIS_IMAGE:-redis:latest}
    container_name: redis
    hostname: redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD:?redis password is required}
    ports:
      - ${REDIS_PORT:-6379}:6379
    volumes:
      - redis-data:/data
    networks:
      - dev-stack
    profiles:
      - all
      - base
      - cache
      - redis
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "$$REDIS_PASSWORD", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis-commander:
    image: ${REGISTRY:-docker.io}/${REDIS_COMMANDER_IMAGE:-rediscommander/redis-commander:latest}
    container_name: redis-commander
    hostname: redis-commander
    restart: unless-stopped
    ports:
    - ${REDIS_COMMANDER_PORT:-8081}:8081
    environment:
      HTTP_USER: ${REDIS_COMMANDER_HTTP_USERNAME:-admin}
      HTTP_PASSWORD: ${REDIS_COMMANDER_HTTP_PASSWORD:?redis commander password is required}
      REDIS_HOST: redis
      REDIS_PORT: ${REDIS_PORT:-6379}:6379
      REDIS_PASSWORD: ${REDIS_PASSWORD:?redis password is required}
    networks:
      - dev-stack
    depends_on:
      - redis
    profiles:
      - all
      - base
      - cache
      - redis
      - redis-commander

  # MinIO
  minio:
    image: ${REGISTRY:-docker.io}/${MINIO_IMAGE:-minio/minio:latest}
    container_name: minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    ports:
      - ${MINIO_API_PORT:-9000}:9000
      - ${MINIO_CONSOLE_PORT:-9001}:9001
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USERNAME:-admin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:?password is required}
    volumes:
      - minio-data:/data
    networks:
      - dev-stack
    profiles:
      - all
      - base
      - storage
      - minio
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3

  # etcd
  etcd:
    image: ${REGISTRY_QUAY:-quay.io}/${ETCD_IMAGE:-coreos/etcd:latest}
    container_name: etcd
    restart: unless-stopped
    command:
      - /usr/local/bin/etcd
      - --data-dir /etcd-data
      - --name etcd-single-node
      - --initial-advertise-peer-urls http://etcd:2380
      - --listen-client-urls http://0.0.0.0:2379
      - --listen-peer-urls http://0.0.0.0:2380
      - --advertise-client-urls http://etcd:2379
      - --initial-cluster etcd-single-node=http://etcd:2380
    ports:
      - ${ETCD_CLIENT_PORT:-2379}:2379
      - ${ETCD_PEER_PORT:-2380}:2380
    volumes:
      - etcd-data:/etcd-data
    networks:
      - dev-stack
    profiles:
      - all
      - kv # key-value store
      - etcd
      - apisix # etcd is used by APISIX
    healthcheck:
      test: ["CMD", "curl", "-k", "http://localhost:2379/livez"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ZooKeeper
  zookeeper:
    image: ${REGISTRY:-docker.io}/${ZOOKEEPER_IMAGE:-zookeeper:3.9.4}
    container_name: zookeeper
    restart: unless-stopped
    ports:
      - ${ZOOKEEPER_PORT:-2181}:2181
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    volumes:
      - zookeeper-data:/data
    networks:
      - dev-stack
    profiles:
      - all
      - mq
      - zookeeper

  # Kafka
  kafka:
    image: ${REGISTRY:-docker.io}/${KAFKA_IMAGE:-kafka:3.9.1}
    container_name: kafka
    restart: unless-stopped
    ports:
      - ${KAFKA_PORT:-9092}:9092
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
    volumes:
      - kafka-data:/var/lib/kafka/data
    depends_on:
      - zookeeper
    networks:
      - dev-stack
    profiles:
      - all
      - mq
      - kafka

  # apisix
  apisix:
    image: ${REGISTRY:-docker.io}/${APISIX_IMAGE:-apache/apisix:3.13.0-debian}
    container_name: apisix
    restart: unless-stopped
    ports:
      - ${APISIX_HTTP_PORT:-9080}:9080     # HTTP
      - ${APISIX_HTTPS_PORT:-9443}:9443    # HTTPS
      - ${APISIX_CONTROL_PORT:-9090}:9090  # Control Plane
      - ${APISIX_METRICS_PORT:-9091}:9091  # Prometheus metrics
      - ${APISIX_ADMIN_PORT:-9180}:9180    # Admin API
    environment:
      APISIX_API_KEY: ${APISIX_API_KEY:?api key is required}
      APISIX_DEPLOYMENT_ETCD_HOST: etcd
      APISIX_DEPLOYMENT_ETCD_PORT: 2379
      APISIX_DEPLOYMENT_ETCD_USER: ${ETCD_ROOT_USERNAME:-admin}
      APISIX_DEPLOYMENT_ETCD_PASSWORD: ${ETCD_ROOT_PASSWORD:?root password is required}
    volumes:
      - apisix-data:/usr/local/apisix
    depends_on:
      - etcd
    networks:
      - dev-stack
    profiles:
      - all
      - api-gateway
      - gateway
      - apisix

  # code-server
  # https://github.com/coder/code-server
  code-server:
    image: ${REGISTRY:-docker.io}/${CODE_SERVER_IMAGE:-codercom/code-server:latest}
    container_name: code-server
    restart: unless-stopped
    ports:
      - ${HOST_IP:-127.0.0.1}:${CODE_SERVER_PORT:-8080}:8080
    volumes:
      - code-server-config:/home/coder/.config
      # Optional
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - dev-stack
    profiles:
      - all
      - ide
      - code-server
      - vscode

  # Jupyter Notebook - Python
  notebook-python:
    image: ${REGISTRY_QUAY:-quay.io}/${NOTEBOOK_PYTHON_IMAGE:-jupyter/minimal-notebook:latest}
    container_name: notebook-python
    hostname: notebook-python
    command: start-notebook.sh --NotebookApp.password=${NOTEBOOK_PYTHON_PASSWORD:?password is required}
    restart: unless-stopped
    environment:
      TZ: ${TZ:-Asia/Shanghai}
      LANG: ${LANG:-en_US.UTF-8}
      PUID: ${PUID:-1000}
      PGID: ${PGID:-1000}
      DOCKER_STACKS_JUPYTER_CMD: lab
      JUPYTER_ENABLE_LAB: yes
      GRANT_SUDO: yes
    volumes:
      - notebook-python-data:/home/jovyan/work
    ports:
      - ${NOTEBOOK_PYTHON_PORT:-8888}:8888
    networks:
      - dev-stack
    profiles:
      - all
      - notebook
      - python
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8888/lab"]
      interval: 30s
      timeout: 10s
      retries: 3

  # C++
  notebook-cpp:
    image: ${REGISTRY:-docker.io}/${NOTEBOOK_CPP_IMAGE:-datainpoint/xeus-cling-notebook:latest}
    container_name: notebook-cpp
    hostname: notebook-cpp
    command: start-notebook.sh --NotebookApp.password=${NOTEBOOK_CPP_PASSWORD:?password is required}
    restart: unless-stopped
    environment:
      TZ: ${TZ:-Asia/Shanghai}
      LANG: ${LANG:-en_US.UTF-8}
      PUID: ${PUID:-1000}
      PGID: ${PGID:-1000}
      DOCKER_STACKS_JUPYTER_CMD: lab
      JUPYTER_ENABLE_LAB: yes
      GRANT_SUDO: yes
    volumes:
      - notebook-cpp-data:/home/jovyan/work
    ports:
      - ${NOTEBOOK_CPP_PORT:-8889}:8888
    networks:
      - dev-stack
    profiles:
      - all
      - notebook
      - cpp
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8888/lab"]
      interval: 30s
      timeout: 10s
      retries: 3

  # SQL
  notebook-sql:
    image: ${REGISTRY:-docker.io}/${NOTEBOOK_SQL_IMAGE:-datainpoint/xeus-sql-notebook:latest}
    container_name: notebook-sql
    hostname: notebook-sql
    command: start-notebook.sh --NotebookApp.password=${NOTEBOOK_SQL_PASSWORD:?password is required}
    restart: unless-stopped
    environment:
      TZ: ${TZ:-Asia/Shanghai}
      LANG: ${LANG:-en_US.UTF-8}
      PUID: ${PUID:-1000}
      PGID: ${PGID:-1000}
      DOCKER_STACKS_JUPYTER_CMD: lab
      JUPYTER_ENABLE_LAB: yes
      GRANT_SUDO: yes
    volumes:
      - notebook-sql-data:/home/jovyan/work
    ports:
      - ${NOTEBOOK_SQL_PORT:-8890}:8888
    networks:
      - dev-stack
    profiles:
      - all
      - notebook
      - sql
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8888/lab"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx
  # https://nginx.org/en/docs/
  nginx:
    image: ${REGISTRY:-docker.io}/${NGINX_IMAGE:-nginx:latest}
    container_name: nginx
    restart: unless-stopped
    ports:
      - ${NGINX_HTTP_PORT:-80}:80
      - ${NGINX_HTTPS_PORT:-443}:443
    volumes:
      - nginx-data:/etc/nginx
    networks:
      - dev-stack
    profiles:
      - all
      - web
      - nginx
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Grafana
  # https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/
  grafana:
    image: ${REGISTRY:-docker.io}/${GRAFANA_IMAGE:-grafana/grafana:latest}
    container_name: grafana
    restart: unless-stopped
    ports:
      - ${GRAFANA_PORT:-3000}:3000
    environment:
      - TZ=Asia/Shanghai
      - LANG=en_US.UTF-8
      - GF_SECURITY_ADMIN_USER=${GRAFANA_ADMIN_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-changeit}
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - dev-stack
    profiles:
      - all
      - monitoring
      - grafana
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/robots.txt"]
      interval: 30s
      timeout: 10s
      retries: 3

  # InfluxDB
  # https://docs.influxdata.com/influxdb/v2/get-started/
  influxdb:
    image: ${REGISTRY:-docker.io}/${INFLUXDB_IMAGE:-influxdb:2.7}
    container_name: influxdb
    restart: unless-stopped
    ports:
      - ${INFLUXDB_HTTP_PORT:-8086}:8086
    environment:
      - TZ=Asia/Shanghai
      - LANG=en_US.UTF-8
      - DOCKER_INFLUXDB_INIT_MODE=${INFLUXDB_INIT_MODE:-setup}
      - DOCKER_INFLUXDB_INIT_USERNAME=${INFLUXDB_ADMIN_USER:-admin}
      - DOCKER_INFLUXDB_INIT_PASSWORD=${INFLUXDB_ADMIN_PASSWORD:-changeit}
      - DOCKER_INFLUXDB_INIT_ORG=${INFLUXDB_ORG:-myorg}
      - DOCKER_INFLUXDB_INIT_BUCKET=${INFLUXDB_BUCKET:-mybucket}
      - DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=${INFLUXDB_TOKEN:-my-super-secret-auth-token}
    volumes:
      - influxdb-data:/var/lib/influxdb2
      - influxdb-config:/etc/influxdb2
    networks:
      - dev-stack
    profiles:
      - all
      - database
      - monitoring
      - influxdb
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8086/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ClickHouse
  # https://clickhouse.com/docs/zh/install/docker
  clickhouse:
    image: ${REGISTRY:-docker.io}/${CLICKHOUSE_IMAGE:-clickhouse/clickhouse-server:latest}
    container_name: clickhouse
    restart: unless-stopped
    ports:
      - ${CLICKHOUSE_HTTP_PORT:-8123}:8123 # HTTP API 端口，用于查询和管理
      - ${CLICKHOUSE_TCP_PORT:-9000}:9000   # 原生TCP协议端口，用于客户端通信
      - ${CLICKHOUSE_INTER_PORT:-9009}:9009 # 副本间通信端口
    environment:
      - TZ=Asia/Shanghai
      - LANG=en_US.UTF-8
      - CLICKHOUSE_DB=${CLICKHOUSE_DB:-default}
      - CLICKHOUSE_USER=${CLICKHOUSE_USER:-default}
      - CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD:-changeit}
      #- CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 # 可选的：启用RBAC访问控制（较新版本）
    ulimits:
      nofile:
        soft: 262144
        hard: 262144
    volumes:
      - clickhouse-data:/var/lib/clickhouse # 数据目录
      - clickhouse-log:/var/log/clickhouse-server # 日志目录
      # 如果想自定义配置，可以挂载配置文件（注意：挂载后需自行提供完整配置）
      # - ./clickhouse/config.xml:/etc/clickhouse-server/config.xml
      # - ./clickhouse/users.xml:/etc/clickhouse-server/users.xml
    networks:
      - dev-stack
    profiles:
      - all
      - analytics
      - clickhouse
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8123/ping"]
      interval: 30s
      timeout: 10s
      retries: 3
```
