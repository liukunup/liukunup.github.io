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

## Java 接入示例

### Maven 依赖

```xml
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>
```

### Logback 配置

创建 `src/main/resources/logback.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
        <destination>localhost:50000</destination>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <customFields>{"service":"my-app"}</customFields>
        </encoder>
    </appender>

    <appender name="ASYNC_LOGSTASH" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="LOGSTASH"/>
        <queueSize>512</queueSize>
        <discardingThreshold>0</discardingThreshold>
    </appender>

    <root level="INFO">
        <appender-ref ref="ASYNC_LOGSTASH"/>
    </root>
</configuration>
```

### 基本用法

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Main {
    private static final Logger logger = LoggerFactory.getLogger(Main.class);

    public static void main(String[] args) {
        logger.info("Application started");
        logger.warn("Warning message with param: {}", "value");
        logger.error("Error occurred", new RuntimeException("Test exception"));
    }
}
```

### 发送结构化日志

```java
import net.logstash.logback.argument.StructuredArguments;
import net.logstash.logback.markers.Markers;

public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public void login(String userId, String ip) {
        logger.info("User login",
            StructuredArguments.kv("user_id", userId),
            StructuredArguments.kv("ip", ip),
            StructuredArguments.kv("action", "login")
        );
    }

    public void processOrder(String orderId, double amount) {
        logger.info("Order processed",
            Markers.append("order_id", orderId),
            Markers.append("amount", amount),
            Markers.append("currency", "USD"),
            "Order completed successfully"
        );
    }
}
```

### Spring Boot 集成

```yaml
# application.yml
logging:
  level:
    root: INFO
    com.example: DEBUG
```

```java
// 配置 Logstash
import net.logstash.logback.logger.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LogstashConfig {
    @Bean
    public Logger logstashLogger() {
        return LoggerFactory.getLogger("logstash");
    }
}
```

---

## Go 接入示例

### 安装依赖

```shell
go get github.com/elastic/go-elasticsearch/v8
go get github.com/sirupsen/logrus
go get github.com/lestrrat-go/logjson
```

### 基本用法 (Logrus + JSON)

```go
package main

import (
    "encoding/json"
    "fmt"
    "net"
    "os"
    "time"

    "github.com/sirupsen/logrus"
)

func main() {
    // 创建 TCP 连接发送 JSON 格式日志到 Logstash
    conn, err := net.DialTimeout("tcp", "localhost:50000", 5*time.Second)
    if err != nil {
        fmt.Println("Failed to connect to Logstash:", err)
        os.Exit(1)
    }
    defer conn.Close()

    // 使用 Logrus
    log := logrus.New()
    log.SetOutput(conn)
    log.SetFormatter(&logrus.JSONFormatter{})

    log.WithFields(logrus.Fields{
        "service": "my-go-app",
        "env":     "production",
    }).Info("Application started")

    log.WithFields(logrus.Fields{
        "user_id": 1001,
        "action":  "login",
    }).Info("User logged in")
}
```

### 使用 go-elasticsearch 客户端

```go
package main

import (
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "log"

    "github.com/elastic/go-elasticsearch/v8"
)

type LogEntry struct {
    Message  string    `json:"message"`
    Level    string    `json:"level"`
    Service  string    `json:"service"`
    UserID   int       `json:"user_id"`
    Duration float64   `json:"duration_ms"`
}

func main() {
    es, err := elasticsearch.NewClient(elasticsearch.Config{
        Addresses: []string{"http://localhost:9200"},
    })
    if err != nil {
        log.Fatalf("Error creating client: %s", err)
    }

    // 直接写入 Elasticsearch
    entry := LogEntry{
        Message:  "Request processed",
        Level:    "info",
        Service:  "my-go-app",
        UserID:   1001,
        Duration: 125.5,
    }

    data, _ := json.Marshal(entry)
    res, err := es.Index(
        "my-logs",
        bytes.NewReader(data),
        es.Index.WithContext(context.Background()),
        es.Index.WithRefresh("true"),
    )
    if err != nil {
        log.Fatalf("Error indexing: %s", err)
    }
    defer res.Body.Close()

    fmt.Println("Log indexed:", res.Status)
}
```

### Logstash Input 配置

确保 Logstash 有 TCP input 接收 Go 应用发送的日志。编辑 `logstash/pipeline/logstash.conf`：

```conf
input {
  tcp {
    port  => 50000
    codec => json_lines
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "my-app-%{+YYYY.MM.dd}"
  }
}
```

Go 应用发送示例：

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net"
    "time"
)

type LogMessage struct {
    "@timestamp" string `json:"@timestamp"`
    Message     string `json:"message"`
    Level       string `json:"level"`
    Service     string `json:"service"`
    TraceID     string `json:"trace_id"`
}

func main() {
    conn, err := net.Dial("tcp", "localhost:50000")
    if err != nil {
        log.Fatal(err)
    }
    defer conn.Close()

    msg := LogMessage{
        "@timestamp": time.Now().Format(time.RFC3339),
        Message:     "User action: click_button",
        Level:       "info",
        Service:     "web-frontend",
        TraceID:     "abc123",
    }

    data, _ := json.Marshal(msg)
    fmt.Fprintf(conn, "%s\n", data)
}
```

### Gin 框架集成

```go
package main

import (
    "bytes"
    "encoding/json"
    "net"
    "time"

    "github.com/gin-gonic/gin"
)

var logstashConn net.Conn

func init() {
    var err error
    logstashConn, err = net.DialTimeout("tcp", "localhost:50000", 5*time.Second)
    if err != nil {
        panic("Failed to connect to Logstash")
    }
}

func LoggerMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()

        c.Next()

        logEntry := map[string]interface{}{
            "@timestamp": time.Now().Format(time.RFC3339),
            "method":     c.Request.Method,
            "path":       c.Request.URL.Path,
            "status":     c.Writer.Status(),
            "duration":   time.Since(start).Milliseconds(),
            "client_ip":  c.ClientIP(),
        }

        data, _ := json.Marshal(logEntry)
        logstashConn.Write(append(data, '\n'))
    }
}

func main() {
    r := gin.New()
    r.Use(LoggerMiddleware())
    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "ok"})
    })
    r.Run(":8080")
}
```

---

## Python 接入示例

### 安装依赖

```shell
pip install python-logstash
```

### 基本用法

```python
import logging
import logstash

logger = logging.getLogger('python-logstash')
logger.setLevel(logging.INFO)

# 添加 Logstash handler
logger.addHandler(logstash.LogstashHandler('localhost', 50000, version=1))

# 发送日志
logger.info('Hello from Python', extra={'env': 'production'})
logger.error('Something went wrong', extra={'error_code': 1001})
```

### 异步发送

使用 `python-logstash-async` 实现异步发送，避免阻塞主线程：

```shell
pip install python-logstash-async
```

```python
import logging
from logstash_async.handler import AsynchronousLogstashHandler

logger = logging.getLogger('python-logstash-async')
logger.setLevel(logging.INFO)

handler = AsynchronousLogstashHandler(
    host='localhost',
    port=50000,
    database_path='logstash.db'  # 本地缓存，未发送的日志会持久化到这里
)
logger.addHandler(handler)

# 发送日志
logger.info('Async log message')
logger.warning('Warning message', extra={'user_id': 12345})
```

### Django/Flask 集成

**Django:**

```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'logstash': {
            'level': 'INFO',
            'class': 'logstash.LogstashHandler',
            'host': 'localhost',
            'port': 50000,
            'version': 1,
        },
    },
    'root': {
        'handlers': ['logstash'],
    },
}
```

**Flask:**

```python
from flask import Flask
import logging
import logstash

app = Flask(__name__)

logger = logging.getLogger('flask-logstash')
logger.setLevel(logging.INFO)
logger.addHandler(logstash.LogstashHandler('localhost', 50000, version=1))

@app.route('/')
def index():
    logger.info('Index page accessed')
    return 'OK'
```

### 发送结构化日志

```python
import json
import logstash

logger = logging.getLogger('structured')
logger.setLevel(logging.INFO)
logger.addHandler(logstash.LogstashHandler('localhost', 50000, version=1))

# 使用 extra 字段发送结构化数据
logger.info('User action', extra={
    'action': 'login',
    'user_id': 1001,
    'ip': '192.168.1.100',
    'metadata': {
        'browser': 'Chrome',
        'os': 'macOS'
    }
})

# 也可以直接发送 JSON 格式的消息
class JsonLogstashHandler(logstash.LogstashHandler):
    def makePickle(self, record):
        msg = self.formatter.format(record)
        return json.dumps(msg).encode('utf-8')
```

### Docker Compose 中运行 Python 应用

```yaml
services:
  myapp:
    build: .
    environment:
      - LOGSTASH_HOST=logstash
      - LOGSTASH_PORT=50000
    depends_on:
      - logstash
    networks:
      - elk
```

应用配置：

```python
import os
import logstash

host = os.getenv('LOGSTASH_HOST', 'localhost')
port = int(os.getenv('LOGSTASH_PORT', 50000))

logger = logging.getLogger('myapp')
logger.addHandler(logstash.LogstashHandler(host, port, version=1))
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
