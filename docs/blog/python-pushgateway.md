---
title: Python 上传指标到 Pushgateway 完整指南
tags:
  - Python
  - Prometheus
  - Pushgateway
  - 监控
createTime: 2026/04/29 08:30:00
permalink: /blog/python-pushgateway/
---

## 什么是 Pushgateway

Pushgateway 是 Prometheus 生态中的重要组件，用于接收由**短期任务**或**无法被 Prometheus 直接抓取**的服务推送的指标。

### 何时使用 Pushgateway

| 场景 | 推荐方案 |
|------|----------|
| 批处理任务（Spark、Airflow） | Pushgateway |
| 短生命周期进程 | Pushgateway |
| 长期运行的服务 | Prometheus 直接抓取 |
| 定时任务/定时脚本 | Pushgateway |

### 工作原理

```
Python 脚本 ──push──> Pushgateway ──pull──> Prometheus ──> Grafana
```

## 环境准备

### 1. 安装 Pushgateway

```bash
# Docker 部署
docker run -d \
  --name pushgateway \
  -p 9091:9091 \
  prom/pushgateway

# 或下载二进制
wget https://github.com/prometheus/pushgateway/releases/download/v1.11.1/pushgateway-1.11.1.linux-amd64.tar.gz
tar -xzf pushgateway-1.11.1.linux-amd64.tar.gz
./pushgateway
```

### 2. 安装 Python 客户端

```bash
pip install prometheus-client
```

## 基础用法

### 推送 Counter（计数器）

```python
from prometheus_client import CollectorRegistry, Counter, push_to_gateway

registry = CollectorRegistry()

# 定义指标
requests_total = Counter(
    'requests_total',
    'Total requests',
    ['method', 'endpoint'],
    registry=registry
)

# 增加计数
requests_total.labels(method='GET', endpoint='/api/users').inc()
requests_total.labels(method='POST', endpoint='/api/login').inc()

# 推送到 Pushgateway
push_to_gateway(
    'localhost:9091',
    job='my_batch_job',
    registry=registry
)
```

### 推送 Gauge（仪表）

```python
from prometheus_client import CollectorRegistry, Gauge, push_to_gateway

registry = CollectorRegistry()

# 定义指标
cpu_temperature = Gauge(
    'cpu_temperature_celsius',
    'CPU temperature in Celsius',
    ['core'],
    registry=registry
)

# 设置值
cpu_temperature.labels(core='0').set(65.5)
cpu_temperature.labels(core='1').set(72.3)

# 推送
push_to_gateway(
    'localhost:9091',
    job='system_metrics',
    registry=registry
)
```

### 推送 Histogram（直方图）

```python
from prometheus_client import CollectorRegistry, Histogram, push_to_gateway
import time

registry = CollectorRegistry()

# 定义指标
request_duration = Histogram(
    'request_duration_seconds',
    'Request duration in seconds',
    ['endpoint'],
    buckets=(0.01, 0.05, 0.1, 0.5, 1.0, 5.0),
    registry=registry
)

# 观察值
request_duration.labels(endpoint='/api/users').observe(0.123)
request_duration.labels(endpoint='/api/login').observe(2.456)

# 推送
push_to_gateway(
    'localhost:9091',
    job='performance_metrics',
    registry=registry
)
```

## 进阶用法

### 1. 带分组推送

```python
from prometheus_client import CollectorRegistry, Counter, push_to_gateway

registry = CollectorRegistry()

requests_total = Counter(
    'requests_total',
    'Total requests',
    ['method', 'endpoint', 'instance'],
    registry=registry
)

requests_total.labels(
    method='GET',
    endpoint='/api/users',
    instance='server-01'
).inc()

# 使用 grouping 参数自定义标签
push_to_gateway(
    'localhost:9091',
    job='my_batch_job',
    registry=registry,
    grouping_key={'instance': 'server-01', 'env': 'production'}
)
```

### 2. 替换而非增量

默认情况下，推送到 Pushgateway 的指标会**累积**。使用 `pushadd_to_gateway` 可以增量添加，而 `replace=True` 会替换同名指标：

```python
from prometheus_client import CollectorRegistry, Gauge, push_to_gateway

registry = CollectorRegistry()

gauge = Gauge(
    'current_value',
    'Current value',
    registry=registry
)
gauge.set(100)

# 替换已有指标（不累积）
push_to_gateway(
    'localhost:9091',
    job='unique_job',
    registry=registry,
    replace=True  # 关键参数
)
```

### 3. 处理推送失败

```python
from prometheus_client import CollectorRegistry, Counter, push_to_gateway
import time

def push_with_retry(registry, job, max_retries=3, delay=1):
    """带重试的推送"""
    for attempt in range(max_retries):
        try:
            push_to_gateway('localhost:9091', job=job, registry=registry)
            print(f"Successfully pushed to Pushgateway")
            return True
        except Exception as e:
            print(f"Push failed (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(delay)
    return False

# 使用
registry = CollectorRegistry()
counter = Counter('test_counter', 'Test counter', registry=registry)
counter.inc()

if not push_with_retry(registry, 'retry_job'):
    print("Failed to push after retries")
```

### 4. 从 Pushgateway 删除指标

```python
from prometheus_client import delete_from_gateway

# 删除特定 job 的所有指标
delete_from_gateway('localhost:9091', job='my_batch_job')

# 删除特定分组
delete_from_gateway(
    'localhost:9091',
    job='my_batch_job',
    grouping_key={'instance': 'server-01'}
)
```

## 完整示例：定时任务监控

```python
#!/usr/bin/env python3
"""
定时任务指标上报示例
"""
from prometheus_client import CollectorRegistry, Counter, Gauge, Histogram, push_to_gateway
import random
import time

def collect_metrics(registry):
    """收集任务指标"""
    # 计数器：任务执行次数
    task_executions = Counter(
        'batch_task_executions_total',
        'Total task executions',
        ['task_name', 'status'],
        registry=registry
    )

    # Gauge：队列深度
    queue_depth = Gauge(
        'batch_queue_depth',
        'Current queue depth',
        ['queue_name'],
        registry=registry
    )

    # 直方图：任务耗时
    task_duration = Histogram(
        'batch_task_duration_seconds',
        'Task duration in seconds',
        ['task_name'],
        buckets=(0.1, 0.5, 1.0, 5.0, 10.0, 30.0, 60.0),
        registry=registry
    )

    # 模拟数据收集
    tasks = ['data_processing', 'report_generation', 'cache_refresh']
    for task in tasks:
        status = 'success' if random.random() > 0.1 else 'failure'
        task_executions.labels(task_name=task, status=status).inc()
        task_duration.labels(task_name=task).observe(random.uniform(0.5, 30))

    for i in range(3):
        queue_depth.labels(queue_name=f'queue_{i}').set(random.randint(0, 100))

def main():
    registry = CollectorRegistry()

    collect_metrics(registry)

    try:
        push_to_gateway(
            'localhost:9091',
            job='batch_job_monitor',
            registry=registry,
            replace=True
        )
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Metrics pushed successfully")
    except Exception as e:
        print(f"Failed to push metrics: {e}")

if __name__ == '__main__':
    main()
```

## 验证推送结果

```bash
# 查看 Pushgateway 页面
open http://localhost:9091

# 或直接获取指标
curl http://localhost:9091/metrics
```

## 常见问题

### 1. 指标累积导致数值不准

Pushgateway 默认保留所有推送的指标。如果推送脚本运行多次但没有 `replace=True`，数值会不断累积。

**解决**：每次推送时使用 `replace=True`，或在推送前先调用 `delete_from_gateway`。

### 2. 标签重复导致指标丢失

```python
# 错误：标签组合相同
gauge.labels(instance='A').set(1)
gauge.labels(instance='A').set(2)  # 会覆盖上面的值

# 正确：使用不同的标签值
gauge.labels(instance='A', region='us-east').set(1)
gauge.labels(instance='B', region='us-west').set(2)
```

### 3. Pushgateway 重启后指标丢失

Pushgateway 默认将指标存储在内存中，重启后会丢失。如果需要持久化，可以：

- 使用 `--persistence.file` 参数
- 配置 Pushgateway 的存储后端

## 总结

| 功能 | 函数 |
|------|------|
| 推送指标 | `push_to_gateway()` |
| 增量推送 | `pushadd_to_gateway()` |
| 删除指标 | `delete_from_gateway()` |
| 替换指标 | 使用 `replace=True` 参数 |

Pushgateway 适合用于短期任务和批处理作业的监控，配合 Prometheus 和 Grafana 可以实现完整的监控告警体系。
