---
title: Jenkins
tags:
  - CI/CD
  - automation
createTime: 2026/05/05 00:00:00
permalink: /homelab/deploy/jenkins/
---

## 🚀 部署指南

Jenkins 是一个开源的自动化服务器，用于构建、测试和部署软件。

::: tabs

@tab:active Docker Compose

```yaml
services:

  docker:
    image: docker:dind
    container_name: jenkins-docker
    restart: unless-stopped
    command: --storage-driver overlay2
    privileged: true
    environment:
      DOCKER_TLS_CERTDIR: /certs
    ports:
      - 2376:2376
    volumes:
      - jenkins-data:/var/jenkins_home
      - jenkins-docker-certs:/certs/client
    networks:
      jenkins:
        aliases:
          - docker

  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins-blueocean
    restart: unless-stopped
    environment:
      DOCKER_HOST: tcp://docker:2376
      DOCKER_CERT_PATH: /certs/client
      DOCKER_TLS_VERIFY: 1
    ports:
      - 8080:8080
      - 50000:50000
    volumes:
      - jenkins-data:/var/jenkins_home
      - jenkins-docker-certs:/certs/client:ro
    networks:
      - jenkins

volumes:
  jenkins-data:
  jenkins-docker-certs:

networks:
  jenkins:
    driver: bridge
```

@tab Docker CLI

- Linux & macOS

```bash
# 1. 创建网络
docker network create jenkins

# 2. 启动 docker:dind 容器
docker run \
  --name jenkins-docker \
  --rm \
  --detach \
  --privileged \
  --network jenkins \
  --network-alias docker \
  --env DOCKER_TLS_CERTDIR=/certs \
  --publish 2376:2376 \
  --volume jenkins-data:/var/jenkins_home \
  --volume jenkins-docker-certs:/certs/client \
  docker:dind \
  --storage-driver overlay2

# 3. 启动 jenkins 容器
docker run \
  --name jenkins-blueocean \
  --restart=on-failure \
  --detach \
  --network jenkins \
  --env DOCKER_HOST=tcp://docker:2376 \
  --env DOCKER_CERT_PATH=/certs/client \
  --env DOCKER_TLS_VERIFY=1 \
  --publish 8080:8080 \
  --publish 50000:50000 \
  --volume jenkins-data:/var/jenkins_home \
  --volume jenkins-docker-certs:/certs/client:ro \
  jenkins/jenkins:lts
```

- Windows

```bash
# 1. 创建网络
docker network create jenkins

# 2. 启动 docker:dind 容器
docker run --name jenkins-docker --rm --detach ^
  --privileged --network jenkins --network-alias docker ^
  --env DOCKER_TLS_CERTDIR=/certs ^
  --publish 2376:2376 ^
  --volume jenkins-data:/var/jenkins_home ^
  --volume jenkins-docker-certs:/certs/client ^
  docker:dind

# 3. 启动 jenkins 容器
docker run --name jenkins-blueocean --restart=on-failure --detach ^
  --network jenkins --env DOCKER_HOST=tcp://docker:2376 ^
  --env DOCKER_CERT_PATH=/certs/client --env DOCKER_TLS_VERIFY=1 ^
  --publish 8080:8080 --publish 50000:50000 ^
  --volume jenkins-data:/var/jenkins_home ^
  --volume jenkins-docker-certs:/certs/client:ro ^
  jenkins/jenkins:lts
```

@tab Kubernetes (Helm)

```bash
# 1. 添加 Helm 仓库
helm repo add jenkinsci https://charts.jenkins.io
helm repo update

# 2. 创建命名空间
kubectl create namespace jenkins

# 3. 安装部署
helm install -f values.yaml jenkins jenkinsci/jenkins -n jenkins
```

- values.yaml

```yaml :collapsed-lines
controller:
  ingress:
    enabled: true
    hostName: jenkins.homelab.lan
  installPlugins:
    - kubernetes:4186.v1d804571d5d4
    - workflow-aggregator:596.v8c21c963d92d
    - git:5.2.1
    - configuration-as-code:1775.v810dc950b_514
    - ldap:711.vb_d1a_491714dc
    - blueocean:1.27.11
    - github:1.38.0
  JCasC:
    configScripts:
      welcome-message: |
        jenkins:
          systemMessage: Welcome to our CI\CD server.
      ldap-settings: |
        jenkins:
          securityRealm:
            ldap:
              configurations:
                - server: "ldap://quts.homelab.lan:389"
                  rootDN: "dc=quts,dc=homelab,dc=lan"
                  userSearchBase: "ou=people"
                  userSearch: "(uid={0})"
                  managerDN: "cn=admin,dc=quts,dc=homelab,dc=lan"
                  managerPasswordSecret: "changeme"
      jenkins-casc-configs: |
        credentials:
          system:
            domainCredentials:
            - credentials:
              - usernamePassword:
                  id: "Billy"
                  username: "billy"
                  password: "changeme"
                  scope: GLOBAL
                  description: "It's me."
    authorizationStrategy: |-
      loggedInUsersCanDoAnything:
        allowAnonymousRead: false

agent:
  podTemplates:
    python: |
      - name: python
        namespace: jenkins
        label: python
        serviceAccount: jenkins
        inheritFrom: python
        containers:
          - name: python
            image: python:3.12-slim
            command: "/bin/sh -c"
            args: "cat"
            ttyEnabled: true
            privileged: true
            resourceRequestCpu: "500m"
            resourceRequestMemory: "512Mi"
            resourceLimitCpu: "4"
            resourceLimitMemory: "8Gi"

persistence:
  enabled: true
  storageClass: standard
  size: 100Gi
```

@tab Kubernetes (YAML)

```yaml :collapsed-lines
---
apiVersion: v1
kind: Namespace
metadata:
  name: devops-tools
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: jenkins-admin
rules:
  - apiGroups: [""]
    resources: ["*"]
    verbs: ["*"]
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: jenkins-admin
  namespace: devops-tools
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: jenkins-admin
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: jenkins-admin
subjects:
- kind: ServiceAccount
  name: jenkins-admin
  namespace: devops-tools
---
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: local-storage
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: jenkins-pv
  labels:
    type: local
spec:
  storageClassName: local-storage
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/jenkins
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: jenkins-pvc
  namespace: devops-tools
spec:
  storageClassName: local-storage
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jenkins
  namespace: devops-tools
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jenkins
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: jenkins
    spec:
      securityContext:
        fsGroup: 1000
        runAsUser: 1000
      serviceAccountName: jenkins-admin
      containers:
        - name: jenkins
          image: jenkins/jenkins:lts-jdk21
          imagePullPolicy: Always
          resources:
            limits:
              memory: "2Gi"
              cpu: "1000m"
            requests:
              memory: "500Mi"
              cpu: "500m"
          ports:
            - name: http
              containerPort: 8080
            - name: jnlp
              containerPort: 50000
          livenessProbe:
            httpGet:
              path: "/login"
              port: 8080
            initialDelaySeconds: 90
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 5
          readinessProbe:
            httpGet:
              path: "/login"
              port: 8080
            initialDelaySeconds: 60
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          volumeMounts:
            - name: jenkins-data
              mountPath: /var/jenkins_home
      volumes:
        - name: jenkins-data
          persistentVolumeClaim:
            claimName: jenkins-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: jenkins-service
  namespace: devops-tools
spec:
  selector:
    app: jenkins
  type: NodePort
  ports:
    - port: 8080
      targetPort: 8080
      nodePort: 32000
```

```bash
kubectl apply -f jenkins-k8s.yaml
```

:::

## 📝 初始配置

### 1. 获取初始管理员密码

::: tabs

@tab Docker

```bash
docker exec jenkins-blueocean cat /var/jenkins_home/secrets/initialAdminPassword
# 或者查看容器日志
docker logs jenkins-blueocean 2>&1 | grep -A 5 "Administrator password"
```

@tab Kubernetes

```bash
# 方式一：通过 Secret (Helm 安装)
kubectl get secret -n jenkins jenkins -o jsonpath="{.data.jenkins-admin-password}" | base64 --decode

# 方式二：通过 Pod 日志
kubectl logs -n devops-tools -l app=jenkins 2>&1 | grep -A 5 "Administrator password"

# 方式三：直接读取文件
kubectl exec -n devops-tools deploy/jenkins -- cat /var/jenkins_home/secrets/initialAdminPassword
```

:::

### 2. 完成设置向导

1. 浏览器访问 `http://<服务器IP>:8080`（Kubernetes NodePort 部署访问 `http://<节点IP>:32000`）
2. 粘贴初始管理员密码，点击 **Continue**
3. 选择 **Install suggested plugins** 安装推荐插件
4. 创建第一个管理员用户
5. 点击 **Start using Jenkins**

### 3. 配置中文界面

1. 进入 **Manage Jenkins** → **Plugins**
2. 搜索并安装 **Locale** 插件
3. 进入 **Manage Jenkins** → **System** → **Locale**
4. 设置 **Default Language** 为 `zh_CN`
5. 勾选 **Ignore browser preference and force this language to all users**
6. 保存后刷新页面即可

## Configuration as Code

```yaml
jenkins:
  systemMessage: "Jenkins configured automatically by Jenkins Configuration as Code plugin\n\n"
```

1. 将上述`jenkins.yaml`映射到`/var/jenkins_home/casc_configs`目录下
2. 配置环境变量`CASC_JENKINS_CONFIG=/var/jenkins_home/casc_configs/jenkins.yaml`
3. 安装`Configuration as Code`插件
4. 重启容器使其生效

想了解更多配置样例请移步 👉 [demos](https://github.com/jenkinsci/configuration-as-code-plugin/tree/master/demos)

### 修改插件镜像源

```yaml
jenkins:
  updateCenter:
    sites:
    - id: "default"
      url: "https://updates.jenkins.io/update-center.json"
```

### Cloud

> 记得将`/var/run/docker.sock`挂载到`jenkins`容器内

```yaml
jenkins:
  clouds:
  - docker:
      name: "docker-cloud"
      dockerApi:
        dockerHost:
          uri: "unix:///var/run/docker.sock"
      templates:
      - labelString: ""
        dockerTemplateBase:
          image: "jenkins/inbound-agent"
        remoteFs: "/home/jenkins/agent"
        connector: "attach"
        instanceCapStr: "10"
        retentionStrategy:
          idleMinutes: 1
```

### LDAP

配置[demo](https://github.com/jenkinsci/configuration-as-code-plugin/tree/master/demos/ldap)

```yaml
jenkins:
  securityRealm:
    ldap:
      configurations:
        - server: "ldap://quts.homelab.lan:389"
          rootDN: "dc=quts,dc=homelab,dc=lan"
          managerDN: "cn=admin,dc=quts,dc=homelab,dc=lan"
          managerPasswordSecret: "changeme"
          userSearchBase: "ou=people"
          userSearch: "(uid={0})"
```

## 🔐 LDAP 登录配置

### 前置条件

安装 **LDAP** 插件（Jenkins 核心自带，无需额外安装）。

### 配置步骤

1. 进入 **Manage Jenkins** → **Security** → **Security Realm**
2. 选择 **LDAP**
3. 填写 LDAP 服务器信息：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| Server | LDAP 服务器地址 | `ldap://ldap.example.com:389` |
| root DN | 搜索根节点 | `dc=example,dc=com` |
| User search base | 用户搜索路径 | `ou=people` |
| User search filter | 用户搜索过滤器 | `uid={0}` 或 `sAMAccountName={0}` (AD) |
| Group search base | 组搜索路径 | `ou=groups` |
| Manager DN | 绑定管理员 DN | `cn=admin,dc=example,dc=com` |
| Manager Password | 绑定密码 | `your-password` |

::: tip 使用 LDAPS (SSL)
如果 LDAP 服务器启用了 SSL，使用 `ldaps://` 协议：
```
ldaps://ldap.example.com:636
```

支持配置多个服务器作为故障转移，用空格分隔：
```
ldap://ldap1.example.com:389 ldap://ldap2.example.com:389
```
:::

### JCasC 配置示例

```yaml
jenkins:
  securityRealm:
    ldap:
      configurations:
        - server: ldap.example.com
          rootDN: dc=example,dc=com
          managerDN: "cn=admin,dc=example,dc=com"
          managerPasswordSecret: ${LDAP_PASSWORD}
          userSearch: "(&(objectCategory=User)(sAMAccountName={0}))"
          groupSearchFilter: "(&(cn={0})(objectclass=group))"
          groupMembershipStrategy:
            fromGroupSearch:
              filter: "(&(objectClass=group)(|(cn=DevOps)(cn=Developers)))"
      cache:
        size: 100
        ttl: 10
      userIdStrategy: CaseInsensitive
      groupIdStrategy: CaseSensitive
```

### 测试配置

配置完成后，点击 **Test LDAP settings** 按钮：
- 输入自己的用户名和密码验证能正常登录
- 输入其他用户名和空密码验证用户解析
- 验证组成员查找功能

::: warning 注意
配置 LDAP 前请确保至少有一个管理员账户可以回退，避免配置错误导致无法登录。
:::

## 🔑 OAuth (OpenID Connect) 登录配置

### 前置条件

安装 **OpenId Connect Authentication** 插件 (`oic-auth`)。

### 在 OIDC 提供商注册 Jenkins

在 Keycloak / Authentik / Google / GitLab 等 OIDC 提供商中注册 Jenkins 客户端：

| 配置项 | 值 |
|--------|------|
| Client ID | `jenkins` |
| Client Secret | 自动生成后复制 |
| Redirect URIs | `${JENKINS_URL}/securityRealm/finishLogin` |
| Logout Redirect URIs | `${JENKINS_URL}/OicLogout` |
| Grant Type | `authorization_code` |
| Scopes | `openid profile email` |

### 在 Jenkins 中配置

1. 进入 **Manage Jenkins** → **Security** → **Security Realm**
2. 选择 **OpenID Connect**
3. 填写配置：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| Client ID | OIDC 客户端 ID | `jenkins` |
| Client Secret | OIDC 客户端密钥 | 从提供商获取 |
| Well-Known OpenID Connect configuration URL | 自动发现端点 | `https://auth.example.com/.well-known/openid-configuration` |
| Scopes | 请求的权限 | `openid profile email` |

::: tip 使用 Well-Known URL（推荐）
大多数 OIDC 提供商提供 `/.well-known/openid-configuration` 端点，Jenkins 会自动发现所有需要的端点信息。只需填写这个 URL 即可。

常见提供商的 Well-Known URL：
- Keycloak: `https://<host>/realms/<realm>/.well-known/openid-configuration`
- Authentik: `https://<host>/application/o/<app>/.well-known/openid-configuration`
- Google: `https://accounts.google.com/.well-known/openid-configuration`
:::

### JCasC 配置示例

```yaml
jenkins:
  securityRealm:
    oicSecurityRealm:
      clientId: jenkins
      clientSecret: ${OIC_CLIENT_SECRET}
      wellKnownOpenIDConfigurationUrl: https://auth.example.com/.well-known/openid-configuration
      scopes: openid profile email
      userNameField: preferred_username
      fullNameField: name
      emailFieldName: email
```

### API Token 使用

启用 OIDC 后，脚本客户端无法使用基本身份验证。需要使用 API Token：

1. 登录 Jenkins → 点击右上角用户名 → **Configure**
2. 在 **API Token** 区域点击 **Add new Token**
3. 复制生成的 Token 用于脚本认证

## 🐳 Docker Agent 配置

### 方式一：流水线中直接使用 Docker（推荐）

在 `Jenkinsfile` 中指定构建环境的 Docker 镜像，Jenkins 会自动启动容器执行构建：

```groovy
pipeline {
    agent {
        docker { image 'node:20-alpine' }
    }
    stages {
        stage('Build') {
            steps {
                sh 'node --version'
                sh 'npm ci && npm run build'
            }
        }
    }
}
```

**多阶段不同环境**：

```groovy
pipeline {
    agent none
    stages {
        stage('Backend') {
            agent { docker { image 'maven:3-eclipse-temurin-21' } }
            steps { sh 'mvn -B package' }
        }
        stage('Frontend') {
            agent { docker { image 'node:20-alpine' } }
            steps { sh 'npm ci && npm run build' }
        }
        stage('Test') {
            agent { docker { image 'python:3.12' } }
            steps { sh 'python -m pytest' }
        }
    }
}
```

**使用项目 Dockerfile**：

```groovy
pipeline {
    agent { dockerfile true }
    stages {
        stage('Test') {
            steps { sh 'make test' }
        }
    }
}
```

**缓存依赖**：

```groovy
pipeline {
    agent {
        docker {
            image 'maven:3-eclipse-temurin-21'
            args '-v $HOME/.m2:/root/.m2'
        }
    }
    stages {
        stage('Build') {
            steps { sh 'mvn -B package' }
        }
    }
}
```

**Python / pytest 完整示例**：

```groovy
pipeline {
    agent {
        docker {
            image 'python:3.12-slim'
            args '-v $HOME/.cache/pip:/root/.cache/pip'
        }
    }
    stages {
        stage('Install Dependencies') {
            steps {
                sh 'pip install -r requirements.txt'
            }
        }
        stage('Run Tests') {
            steps {
                sh 'pytest tests/ -v --junitxml=results.xml --cov=src --cov-report=xml'
            }
        }
        stage('Collect Reports') {
            steps {
                junit 'results.xml'
                publishHTML([
                    reportDir: 'htmlcov',
                    reportFiles: 'index.html',
                    reportName: 'Coverage Report'
                ])
            }
        }
    }
}
```

::: tip 依赖安装优化
如果不想每次构建都安装依赖，可以基于 `python:3.12-slim` 自定义镜像：

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
```

然后在流水线中使用 `dockerfile true` 或自定义镜像名即可跳过安装步骤。
:::

### 方式二：静态 Docker Agent

1. **在 Jenkins 中创建节点**

   **Manage Jenkins** → **Nodes** → **New Node** → 选择 **Permanent Agent**

2. **启动 Docker Agent 容器**

   ```bash
   # 拉取镜像
   docker pull jenkins/inbound-agent:lts-jdk21

   # 启动容器（secret 和节点名称从 Jenkins 节点页面获取）
   docker run -d \
     --name jenkins-agent-1 \
     --restart unless-stopped \
     jenkins/inbound-agent:lts-jdk21 \
     -url http://<jenkins-ip>:8080 \
     -workDir=/home/jenkins \
     <secret> \
     <agent-name>
   ```

3. **自定义构建工具**

   默认 agent 容器是空的，需要自定义镜像或挂载工具：

   ```bash
   # 方式A：挂载构建工具
   docker run -d \
     --name jenkins-agent-1 \
     -v /usr/local/apache-maven:/home/jenkins/maven \
     -v /usr/local/node:/home/jenkins/node \
     jenkins/inbound-agent:lts-jdk21 \
     -url http://<jenkins-ip>:8080 \
     -workDir=/home/jenkins \
     <secret> <agent-name>
   ```

   ```dockerfile
   # 方式B：自定义 Dockerfile
   FROM jenkins/inbound-agent:lts-jdk21
   USER root
   RUN apt-get update && apt-get install -y \
       maven nodejs npm git \
       && rm -rf /var/lib/apt/lists/*
   USER jenkins
   ```

### 方式三：动态 Docker Cloud Agent

通过 **Docker Plugin** 实现按需创建和销毁 Agent 容器。

1. **安装插件**：**Docker** 和 **Docker Pipeline**

2. **配置 Docker Cloud**

   **Manage Jenkins** → **Clouds** → **New cloud** → **Docker**

   | 配置项 | 说明 | 示例 |
   |--------|------|------|
   | Docker Host URI | Docker 守护进程地址 | `unix:///var/run/docker.sock` 或 `tcp://docker:2376` |
   | Container Cap | 最大容器数 | `10` |

3. **添加 Agent 模板**

   | 配置项 | 说明 | 示例 |
   |--------|------|------|
   | Labels | 节点标签 | `docker-agent` |
   | Docker Image | 镜像 | `jenkins/inbound-agent:lts-jdk21` |
   | Remote File System Root | 远程工作目录 | `/home/jenkins` |
   | Connect method | 连接方式 | `JNLP`（推荐） |
   | Instance Capacity | 实例数量 | `5` |
   | Idle timeout | 空闲超时（秒） | `600` |

4. **在流水线中使用**

   ```groovy
   pipeline {
       agent {
           label 'docker-agent'
       }
       stages {
           stage('Build') {
               steps {
                   sh 'echo "Running on dynamic Docker agent"'
               }
           }
       }
   }
   ```

### Docker Compose 部署 Agent

在 Docker Compose 中加入 Agent 服务：

```yaml
services:
  # ... jenkins 和 docker 服务 ...

  agent:
    image: jenkins/inbound-agent:lts-jdk21
    container_name: jenkins-agent
    restart: unless-stopped
    networks:
      - jenkins
    environment:
      - JENKINS_URL=http://jenkins:8080
      - JENKINS_SECRET=<从Jenkins节点页面获取>
      - JENKINS_AGENT_NAME=docker-agent
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

## 📊 Grafana 监控面板

### 前置条件

安装 **Prometheus metrics** 插件。

### 配置步骤

#### 1. Jenkins 端配置

1. 进入 **Manage Jenkins** → **Plugins** → 搜索安装 **Prometheus metrics**
2. 安装完成后，Jenkins 自动暴露 metrics 端点：`http://<jenkins-ip>:8080/prometheus/`

::: tip 自定义端点
可通过环境变量修改端点路径：
```bash
PROMETHEUS_ENDPOINT=/metrics/
PROMETHEUS_NAMESPACE=jenkins_
```
:::

#### 2. Prometheus 端配置

在 `prometheus.yml` 中添加 Jenkins 抓取任务：

```yaml
scrape_configs:
  - job_name: 'jenkins'
    metrics_path: '/prometheus'
    scrape_interval: 15s
    static_configs:
      - targets: ['<jenkins-ip>:8080']
        labels:
          instance: 'jenkins-ci'
```

如果使用 Docker Compose 部署，可以直接在同一网络中通过容器名访问：

```yaml
# docker-compose.yml 中添加 prometheus
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    networks:
      - jenkins

volumes:
  prometheus-data:
```

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'jenkins'
    metrics_path: '/prometheus'
    scrape_interval: 15s
    static_configs:
      - targets: ['jenkins-blueocean:8080']
```

#### 3. Grafana 仪表盘

在 Grafana 中导入预构建的 Jenkins 仪表盘：

| 仪表盘 | ID | 说明 |
|--------|------|------|
| Jenkins Performance & Health Overview | `13751` | 队列速度、执行器、节点状态 |
| Jenkins Dashboard | `6479` | 构建统计、JVM 资源使用 |
| Jenkins Exporter Summary | `10762` | 构建成功率、队列分析 |

**导入方法**：
1. Grafana → **Dashboards** → **+ Import**
2. 输入仪表盘 ID（如 `13751`）→ **Load**
3. 选择 Prometheus 数据源 → **Import**

### 主要监控指标

| 指标 | 说明 |
|------|------|
| `jenkins_runs_success_total` | 成功构建总数 |
| `jenkins_runs_failure_total` | 失败构建总数 |
| `jenkins_node_online_value` | 在线节点数 |
| `jenkins_executor_count_value` | 执行器总数 |
| `jenkins_executor_free_value` | 空闲执行器数 |
| `jenkins_queue_blocked_value` | 阻塞队列任务数 |
| `jenkins_queue_pending_value` | 等待队列任务数 |
| `jenkins_plugins_active` | 已激活插件数 |
| `jenkins_plugins_withUpdate` | 可更新插件数 |
| `http_responseCodes_ok_total` | HTTP 200 响应数 |
| `http_responseCodes_serverError_total` | HTTP 5xx 错误数 |

## 🔧 常用操作

### 进入容器

```bash
docker exec -it jenkins-blueocean bash
```

### 查看日志

```bash
docker logs -f jenkins-blueocean
```

### 安装插件

在 Jenkins Web 界面：**Manage Jenkins** → **Plugins** → **Available plugins**

完整插件推荐清单：

| 插件 | 用途 |
|------|------|
| `docker-workflow` | 流水线中操作 Docker |
| `docker` | Docker Cloud 动态 Agent |
| `kubernetes` | 动态 K8s 代理 |
| `git` | Git 版本控制 |
| `pipeline` | 流水线支持 |
| `configuration-as-code` | 配置即代码 (JCasC) |
| `blueocean` | 现代化 UI 界面 |
| `prometheus` | Prometheus 监控指标 |
| `ldap` | LDAP 认证 |
| `oic-auth` | OpenID Connect 认证 |
| `locale` | 界面本地化 |

### 数据备份

```bash
# 备份 Jenkins 数据目录
tar -czf jenkins-backup-$(date +%Y%m%d).tar.gz /share/Container/jenkins/data
```

## 🔗 参考链接

*   [Jenkins 官方文档](https://jenkins.ac.cn/doc/)
*   [Jenkins Docker Hub](https://hub.docker.com/r/jenkins/jenkins/)
*   [Jenkins Helm Chart](https://github.com/jenkinsci/helm-charts)
*   [Jenkins Kubernetes Plugin](https://plugins.jenkins.io/kubernetes/)
*   [Jenkins Prometheus Plugin](https://plugins.jenkins.io/prometheus/)
*   [Jenkins LDAP Plugin](https://plugins.jenkins.io/ldap/)
*   [Jenkins OIDC Plugin](https://plugins.jenkins.io/oic-auth/)
*   [Jenkins Docker Plugin](https://plugins.jenkins.io/docker/)
*   [Grafana Jenkins Dashboards](https://grafana.com/grafana/dashboards/)
*   [Configuration as Code](https://plugins.jenkins.io/configuration-as-code/)
