---
title: Vector
tags:
  - vector
  - observability
  - logs
  - metrics
  - tracing
createTime: 2026/08/15 00:29:00
permalink: /homelab/deploy/vector/
---

## 🏗️ 架构图

📖 [Vector Docs](https://vector.dev/docs/)

📖 [Vector Remap Language (VRL)](https://vector.dev/docs/reference/vrl/)

📖 [Vector Configuration](https://vector.dev/docs/reference/configuration/)

![Vector Architecture](https://raw.githubusercontent.com/vectordotdev/vector/master/docs/images/vector-architecture.svg)

## 🚀 部署指南

### 📦 Windows

#### MSI 安装包

使用 PowerShell 下载并安装 Vector MSI 包：

```powershell
# 下载最新版本
$VERSION = (Invoke-RestMethod "https://vector.dev/releases/latest.json").musl_version
Invoke-WebRequest "https://packages.timber.io/vector/$VERSION/vector-$VERSION-x64.msi" -OutFile "vector-$VERSION-x64.msi"

# 安装
msiexec /i "vector-$VERSION-x64.msi"
```

::: tip

安装后，配置文件位于 `C:\ProgramData\vector\config\vector.toml`

数据目录位于 `C:\ProgramData\vector\data`

:::

#### 二进制压缩包

```powershell
# 下载
$VERSION = "0.42.0"
Invoke-WebRequest "https://packages.timber.io/vector/$VERSION/vector-$VERSION-x86_64-pc-windows-msvc.zip" -OutFile "vector.zip"

# 解压到指定目录
Expand-Archive -Path "vector.zip" -DestinationPath "C:\vector"

# 添加到 PATH
$env:PATH += ";C:\vector\bin"

# 验证
vector --version
```

#### 配置示例

创建 `C:\ProgramData\vector\config\vector.toml`：

```toml
[sources.docker]
type = "docker_logs"

[sinks.console]
type = "console"
inputs = ["docker"]
encoding.codec = "json"
```

### 📦 Linux

#### APT 包管理器 (Debian/Ubuntu)

```shell
# 添加 Vector APT 仓库
curl -1sLf \
  'https://repositories.timber.io/public/vector/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/vector-archive-keyring.gpg

curl -1sLf \
  'https://repositories.timber.io/public/vector/debian.pub' \
  | sudo tee /etc/apt/sources.list.d/vector.list > /dev/null

# 安装
sudo apt-get update
sudo apt-get install vector
```

#### YUM/DNF 包管理器 (RHEL/CentOS/Fedora)

```shell
# 添加 Vector YUM 仓库
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://rpm.timber.io/vector/vector.repo

# 安装
sudo yum install vector
```

#### Homebrew (macOS/Linux)

```shell
brew tap vectordotdev/brew && brew install vector
```

#### 二进制压缩包

```shell
# 下载并解压
VERSION={{< version >}}
mkdir -p vector && \
  curl -sSfL --proto '=https' --tlsv1.2 \
  https://packages.timber.io/vector/${VERSION}/vector-${VERSION}-x86_64-unknown-linux-musl.tar.gz | \
  tar xzf - -C vector --strip-components=2

# 验证
./vector --version
```

### 📦 Docker

::: tabs

@tab:active 单行命令

```shell
# 运行 Vector 容器
docker run -d \
  --name vector \
  -p 8686:8686 \
  -v "$PWD/vector.toml:/etc/vector/vector.toml:ro" \
  timberio/vector:{{< version >}}-alpine
```

@tab 后台运行

```shell
docker run -d \
  --name vector \
  -p 8686:8686 \
  -p 9598:9598 \
  -v "$PWD/vector.toml:/etc/vector/vector.toml:ro" \
  timberio/vector:{{< version >}}-alpine
```

@tab Docker Logs 收集

```shell
docker run -d \
  --name vector \
  --user root \
  -p 8686:8686 \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v "$PWD/vector.toml:/etc/vector/vector.toml:ro" \
  timberio/vector:{{< version >}}-alpine
```

:::

::: tip

**端口说明**：

- `8686` - Vector API 默认端口
- `9598` - Vector Prometheus Metrics 端口

:::

### 📦 Docker Compose

```yaml
services:
  vector:
    image: timberio/vector:{{< version >}}-alpine
    container_name: vector
    restart: unless-stopped
    ports:
      - "8686:8686"
      - "9598:9598"
    volumes:
      - ./vector.toml:/etc/vector/vector.toml:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro  # 如果需要收集 Docker 日志
    environment:
      - TZ=Asia/Shanghai
    healthcheck:
      test: ["CMD", "vector", "health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### 完整监控栈示例

```yaml
services:
  vector:
    image: timberio/vector:{{< version >}}-alpine
    container_name: vector
    restart: unless-stopped
    ports:
      - "8686:8686"
      - "9598:9598"
    volumes:
      - ./vector.toml:/etc/vector/vector.toml:ro
    networks:
      - monitoring

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./prometheus-data:/prometheus
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    networks:
      - monitoring

networks:
  monitoring:
    name: monitoring
    driver: bridge
```

### 📦 Kubernetes (Helm)

#### 添加 Helm 仓库

```shell
# 添加 Vector Helm 仓库
helm repo add vector https://charts.vector.dev
helm repo update
```

#### Agent 模式 (收集节点日志)

```yaml
# values-agent.yaml
role: Agent

# 数据来源配置
vector:
  api:
    enabled: true
    port: 8686

  sources:
    kubernetes_logs:
      type: kubernetes_logs
      extra_env_vars:
        POD_NAME: ${VECTOR_POD_NAME}
        VECTOR_SELF_POD_NAME: ${VECTOR_SELF_POD_NAME}

  sinks:
    stdout:
      type: console
      inputs:
        - kubernetes_logs
      encoding:
        codec: json
```

```shell
# 部署
kubectl create namespace vector
helm install vector vector/vector \
  --namespace vector \
  --create-namespace \
  --values values-agent.yaml
```

#### Aggregator 模式 (聚合日志)

```yaml
# values-aggregator.yaml
role: Stateless-Aggregator

# 服务配置
service:
  enabled: true
  port: 8686

# 数据来源 - 接收其他 Agent 的数据
vector:
  sources:
    vector_api:
      type: vector
      address: 0.0.0.0:6000

  # 数据输出
  sinks:
    elasticsearch:
      type: elasticsearch
      inputs:
        - vector_api
      endpoint: http://elasticsearch:9200
      index: vector-%Y%m%d
```

```shell
# 部署 Aggregator
kubectl create namespace vector
helm install vector-aggregator vector/vector \
  --namespace vector \
  --create-namespace \
  --values values-aggregator.yaml
```

#### 完整示例 - Vector Agent + Aggregator

```yaml
# values-full.yaml
role: Agent

# API 配置
vector:
  api:
    enabled: true
    port: 8686

# Agent 配置 - 收集本地日志发送到 Aggregator
vector:
  sources:
    docker_logs:
      type: docker_logs
    journald_logs:
      type: journald

  sinks:
    to_aggregator:
      type: vector
      address: vector-aggregator.vector.svc:6000
      version: "2"
```

## 📝 配置说明

### 基础配置示例

```toml
# vector.toml

# 数据来源 - Docker 日志
[sources.docker]
type = "docker_logs"

# 数据来源 - 文件
[sources.files]
type = "file"
include = ["/var/log/**/*.log"]

# 数据转换 - VRL
[transforms.parse_json]
type = "remap"
inputs = ["docker", "files"]
source = '''
. = parse_json!(string!(.message))
.timestamp = parse_timestamp!(.timestamp, format: "%Y-%m-%dT%H:%M:%S%.3fZ")
'''

# 数据输出 - 控制台
[sinks.console]
type = "console"
inputs = ["parse_json"]
encoding.codec = "json"
```

### 常用配置模板

#### 日志收集配置

```toml
[sources.app_logs]
type = "file"
include = ["/var/log/app/*.log"]
ignore_older = 3600

[transforms.filter]
type = "filter"
inputs = ["app_logs"]
condition = '.level != "debug"'

[sinks.elasticsearch]
type = "elasticsearch"
inputs = ["filter"]
endpoint = "http://elasticsearch:9200"
index = "app-logs-%Y-%m-%d"
```

#### 指标收集配置

```toml
[sources.host_metrics]
type = "host_metrics"
refresh_interval_secs = 15

[sources.internal_metrics]
type = "internal_metrics"
scrape_interval_secs = 15

[sinks.prometheus]
type = "prometheus_exporter"
inputs = ["host_metrics", "internal_metrics"]
port = 9598
```

## 🔧 常用命令

```shell
# 验证配置
vector validate --config-toml vector.toml

# 前台运行（调试）
vector --config vector.toml

# 查看版本
vector --version

# 查看帮助
vector --help

# Docker 命令
docker logs -f vector           # 查看日志
docker restart vector           # 重启服务
docker exec -it vector vector validate --config /etc/vector/vector.toml  # 验证配置
```

## 🔐 安全配置

### RBAC 配置 (Kubernetes)

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: vector
rules:
  - apiGroups: [""]
    resources:
      - namespaces
      - pods
      - nodes
    verbs:
      - list
      - watch
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: vector
  namespace: vector
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: vector
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: vector
subjects:
  - kind: ServiceAccount
    name: vector
    namespace: vector
```

### TLS 配置

```toml
[sinks.tls_sink]
type = "elasticsearch"
inputs = ["source"]
endpoint = "https://elasticsearch:9200"
tls.enabled = true
tls.verify_certificate = true
tls.ca_path = "/etc/vector/certs/ca.crt"
```

## 💻 最佳实践

### 📊 日志处理流程

::: steps

1. 收集

    使用 `docker_logs`、`file`、`journald` 等 source 收集日志

2. 解析

    使用 VRL 解析 JSON、提取字段、转换格式

3. 过滤

    使用 `filter` 转换移除不需要的日志

4. 输出

    输出到 Elasticsearch、ClickHouse、 Loki 等存储

:::

### 🔄 高可用部署

```yaml
# Kubernetes 高可用配置
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchLabels:
                    app: vector
                topologyKey: kubernetes.io/hostname
```

### 📈 资源限制

```yaml
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "1000m"
    memory: "512Mi"
```

## 📚 相关资源

| 资源 | 链接 |
|------|------|
| 官网 | [vector.dev](https://vector.dev) |
| 文档 | [vector.dev/docs](https://vector.dev/docs/) |
| GitHub | [vectordotdev/vector](https://github.com/vectordotdev/vector) |
| Docker Hub | [timberio/vector](https://hub.docker.com/r/timberio/vector) |
| Helm Chart | [charts.vector.dev](https://charts.vector.dev) |
| VRL 参考 | [vector.dev/docs/reference/vrl](https://vector.dev/docs/reference/vrl/) |
