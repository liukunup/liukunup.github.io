---
title: 使用 adb dumpsys meminfo 检测 Android 内存泄露
tags:
  - Android
  - ADB
  - Prometheus
  - InfluxDB
  - 内存泄露
  - Python
createTime: 2026/04/25 20:40:11
permalink: /blog/android-memory-leak-detection/
---

## 背景

在 Android 应用开发和测试中，内存泄露是一个常见且棘手的问题。它会导致应用越来越卡顿，最终可能导致 OOM（内存溢出）崩溃。

本文介绍一种基于 `adb shell dumpsys meminfo <pid>` 的内存监控方案：
- 定期采集内存指标
- 同时对接 **Prometheus**（用于实时告警）和 **InfluxDB**（用于历史趋势分析）
- 通过 Grafana 可视化展示内存增长趋势，辅助判断是否存在内存泄露

## dumpsys meminfo 输出格式解析

```bash
adb shell dumpsys meminfo <pid>
```

典型输出包含以下关键指标：

```
SQL:
  MEMINFO_DATABASES: 180 KB

Native Heap:
  Size: 10240 KB
  Alloc: 8192 KB
  Free: 2048 KB

Java Heap:
  Size: 16384 KB
  Alloc: 12288 KB
  Free: 4096 KB

Code:
  Code: 4864 KB
  Data: 2048 KB

Stack:
  Stack: 512 KB

Graphics:
  Graphics: 2048 KB

Private Other:
  Private Other: 4096 KB

System:
  System: 8192 KB

TOTAL:
  TOTAL: 53248 KB

Memory: 53248 KB
```

> **数据来源说明**：以上为简化示例。真实设备输出可能因 Android 版本和厂商定制而略有差异。建议先在目标设备上运行一次确认实际格式。

## 快速验证：手动采集一条数据

```bash
# 连接设备
adb connect localhost:5555

# 获取 Java 进程 PID
adb shell toolbox ps -A | grep java | awk '{print $2}'

# 采集单次 meminfo
adb shell dumpsys meminfo <PID>
```

## 内存泄露判断标准

符合以下任一条件可能存在内存泄露：

| 模式 | 说明 | 阈值参考 |
|------|------|----------|
| **持续增长** | 内存每小时增长超过 50MB 且不回落 | `rate()` 持续为正 |
| **堆内存饱和** | Java Heap 接近配置上限 | 达到上限的 80%+ |
| **Native 泄漏** | Native Heap 持续增长且 GC 后不释放 | 持续增长不回落 |
| **图形内存积累** | Graphics 内存持续增长可能是 bitmap 泄漏 | Graphics 占比 > 30% |

详细分析思路可参考 [Perfetto Memory Case Study](https://perfetto.dev/docs/case-studies/memory)。

## 时间序列采集脚本（Bash 版）

不想写 Python？可以用 Bash 快速搭建时间序列采集：

```bash
#!/bin/bash
# meminfo-collector.sh - 时间序列内存数据采集

PKG="com.example.myapp"  # 修改为你的包名
OUTPUT_DIR="./meminfo_logs"
INTERVAL=10

mkdir -p $OUTPUT_DIR
FILENAME="meminfo-$(date +%Y%m%d.%H%M.%S).tsv"

# 表头
echo -e "timestamp\tJava_Heap_Size\tJava_Heap_Alloc\tNative_Heap_Size\tNative_Heap_Alloc\tTotal" > "$OUTPUT_DIR/$FILENAME"

while true; do
    PID=$(adb shell pidof $PKG 2>/dev/null)
    if [ -n "$PID" ]; then
        TS=$(date +%Y-%m-%d\ %H:%M:%S)
        # 采集并解析（简化版正则）
        RAW=$(adb shell dumpsys meminfo $PID 2>/dev/null)
        JAVA_HEAP=$(echo "$RAW" | grep -A2 "Java Heap" | grep "Size:" | awk '{print $2}')
        NATIVE_HEAP=$(echo "$RAW" | grep -A2 "Native Heap" | grep "Size:" | awk '{print $2}')
        TOTAL=$(echo "$RAW" | grep -A1 "TOTAL:" | tail -1 | awk '{print $2}')

        echo -e "$TS\t$JAVA_HEAP\t$NATIVE_HEAP\t$TOTAL" >> "$OUTPUT_DIR/$FILENAME"
        echo "[$(date +%H:%M:%S)] Collected: PID=$PID, Java=$JAVA_HEAP KB, Native=$NATIVE_HEAP KB"
    fi
    sleep $INTERVAL
done
```

运行方式：
```bash
chmod +x meminfo-collector.sh
./meminfo-collector.sh
```

Python 完整版脚本见下一节。

## Python 采集脚本

```python
#!/usr/bin/env python3
"""
Android 内存指标采集器
通过 adb shell dumpsys meminfo 采集内存数据，对接 Prometheus 和 InfluxDB
"""

import subprocess
import re
import time
import logging
from datetime import datetime
from typing import Optional

from prometheus_client import Gauge, Counter, start_http_server
from influxdb import InfluxDBClient

# ==================== 配置 ====================
ADB_DEVICE = "localhost:5555"  # ADB 设备地址
ADJ_INTERVAL = 5               # 采集间隔（秒）
TARGET_PIDS = None             # None 表示自动发现所有 Java 进程

# InfluxDB 配置
INFLUX_HOST = "localhost"
INFLUX_PORT = 8086
INFLUX_USER = "admin"
INFLUX_PASSWORD = "admin"
INFLUX_DATABASE = "android_memory"
INFLUX_MEASUREMENT = "meminfo"

# Prometheus 端口
PROMETHEUS_PORT = 9240

# ==================== 日志 ====================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== Prometheus 指标定义 ====================
JAVA_HEAP_SIZE = Gauge(
    'android_java_heap_size_kb',
    'Java heap size in KB',
    ['device', 'pid', 'process_name']
)
JAVA_HEAP_ALLOC = Gauge(
    'android_java_heap_alloc_kb',
    'Java heap allocated in KB',
    ['device', 'pid', 'process_name']
)
NATIVE_HEAP_SIZE = Gauge(
    'android_native_heap_size_kb',
    'Native heap size in KB',
    ['device', 'pid', 'process_name']
)
NATIVE_HEAP_ALLOC = Gauge(
    'android_native_heap_alloc_kb',
    'Native heap allocated in KB',
    ['device', 'pid', 'process_name']
)
TOTAL_MEMORY = Gauge(
    'android_total_memory_kb',
    'Total memory in KB',
    ['device', 'pid', 'process_name']
)
GRAPHICS_MEMORY = Gauge(
    'android_graphics_memory_kb',
    'Graphics memory in KB',
    ['device', 'pid', 'process_name']
)
CODE_MEMORY = Gauge(
    'android_code_memory_kb',
    'Code memory in KB',
    ['device', 'pid', 'process_name']
)
COLLECTION_ERRORS = Counter(
    'android_meminfo_collection_errors_total',
    'Total collection errors',
    ['device']
)

# ==================== ADB 交互 ====================
def adb_shell(device: str, command: str, timeout: int = 10) -> Optional[str]:
    """执行 ADB 命令"""
    try:
        cmd = ['adb', '-s', device, 'shell', command]
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        logger.error(f"ADB command timeout: {command}")
        return None
    except Exception as e:
        logger.error(f"ADB command failed: {e}")
        return None


def get_process_pids(device: str, package_name: Optional[str] = None) -> list:
    """获取进程 PID 列表"""
    if package_name:
        # 查找指定包名进程
        output = adb_shell(device, f"pidof {package_name}")
        if output:
            return [p.strip() for p in output.split() if p.strip()]
    else:
        # 查找所有 Java 进程
        output = adb_shell(device, "toolbox ps -A | grep java | awk '{print $2}'")
        if output:
            return [p.strip() for p in output.split('\n') if p.strip()]
    return []


def parse_meminfo(output: str) -> dict:
    """解析 dumpsys meminfo 输出"""
    meminfo = {}

    # 解析 Native Heap
    native_match = re.search(
        r'Native Heap:\s*\n\s*Size:\s*(\d+)\s*KB\s*\n\s*Alloc:\s*(\d+)\s*KB',
        output
    )
    if native_match:
        meminfo['native_heap_size'] = int(native_match.group(1))
        meminfo['native_heap_alloc'] = int(native_match.group(2))

    # 解析 Java Heap
    java_match = re.search(
        r'Java Heap:\s*\n\s*Size:\s*(\d+)\s*KB\s*\n\s*Alloc:\s*(\d+)\s*KB',
        output
    )
    if java_match:
        meminfo['java_heap_size'] = int(java_match.group(1))
        meminfo['java_heap_alloc'] = int(java_match.group(2))

    # 解析 Graphics
    graphics_match = re.search(r'Graphics:\s*(\d+)\s*KB', output)
    if graphics_match:
        meminfo['graphics'] = int(graphics_match.group(1))

    # 解析 Code
    code_match = re.search(r'Code:\s*(\d+)\s*KB', output)
    if code_match:
        meminfo['code'] = int(code_match.group(1))

    # 解析 TOTAL
    total_match = re.search(r'TOTAL:\s*\n\s*TOTAL:\s*(\d+)\s*KB', output)
    if not total_match:
        total_match = re.search(r'Memory:\s*(\d+)\s*KB', output)
    if total_match:
        meminfo['total'] = int(total_match.group(1))

    return meminfo


def get_process_name(device: str, pid: str) -> str:
    """获取进程名称"""
    output = adb_shell(device, f"ps -p {pid} -o NAME= 2>/dev/null || cat /proc/{pid}/cmdline 2>/dev/null | tr '\\0' ' '")
    return output.strip() if output else f"unknown_{pid}"


# ==================== InfluxDB 交互 ====================
def init_influxdb(client: InfluxDBClient, database: str):
    """初始化 InfluxDB 数据库"""
    # 创建数据库
    client.create_database(database)
    # 创建保留策略
    client.create_retention_policy(
        name='30day',
        duration='30d',
        database=database,
        replication='1',
        default=True
    )


def write_to_influxdb(client: InfluxDBClient, measurement: str, tags: dict, fields: dict):
    """写入数据到 InfluxDB"""
    point = {
        "measurement": measurement,
        "tags": tags,
        "fields": fields,
        "time": datetime.utcnow().isoformat() + "Z"
    }
    try:
        client.write_points([point])
    except Exception as e:
        logger.error(f"Failed to write to InfluxDB: {e}")


# ==================== 采集循环 ====================
def collect_memory(device: str, pid: str, influx_client: Optional[InfluxDBClient] = None):
    """采集单个进程内存"""
    try:
        # 获取进程名称
        process_name = get_process_name(device, pid)

        # 执行 dumpsys meminfo
        output = adb_shell(device, f"dumpsys meminfo {pid}", timeout=30)
        if not output:
            COLLECTION_ERRORS.labels(device=device).inc()
            return

        # 解析输出
        meminfo = parse_meminfo(output)
        if not meminfo:
            logger.warning(f"Failed to parse meminfo for PID {pid}")
            COLLECTION_ERRORS.labels(device=device).inc()
            return

        # 更新 Prometheus 指标
        labels = {'device': device, 'pid': pid, 'process_name': process_name}

        JAVA_HEAP_SIZE.labels(**labels).set(meminfo.get('java_heap_size', 0))
        JAVA_HEAP_ALLOC.labels(**labels).set(meminfo.get('java_heap_alloc', 0))
        NATIVE_HEAP_SIZE.labels(**labels).set(meminfo.get('native_heap_size', 0))
        NATIVE_HEAP_ALLOC.labels(**labels).set(meminfo.get('native_heap_alloc', 0))
        TOTAL_MEMORY.labels(**labels).set(meminfo.get('total', 0))
        GRAPHICS_MEMORY.labels(**labels).set(meminfo.get('graphics', 0))
        CODE_MEMORY.labels(**labels).set(meminfo.get('code', 0))

        # 写入 InfluxDB
        if influx_client:
            tags = {'device': device, 'pid': pid, 'process_name': process_name}
            fields = {k: v for k, v in meminfo.items()}
            write_to_influxdb(influx_client, INFLUX_MEASUREMENT, tags, fields)

        logger.debug(f"Collected meminfo for PID {pid} ({process_name})")

    except Exception as e:
        logger.error(f"Error collecting meminfo for PID {pid}: {e}")
        COLLECTION_ERRORS.labels(device=device).inc()


def main():
    logger.info(f"Starting Android Memory Collector")
    logger.info(f"Prometheus endpoint: http://localhost:{PROMETHEUS_PORT}/metrics")

    # 初始化 InfluxDB
    influx_client = InfluxDBClient(
        host=INFLUX_HOST,
        port=INFLUX_PORT,
        username=INFLUX_USER,
        password=INFLUX_PASSWORD
    )
    try:
        init_influxdb(influx_client, INFLUX_DATABASE)
        logger.info(f"InfluxDB connected: {INFLUX_HOST}:{INFLUX_PORT}/{INFLUX_DATABASE}")
    except Exception as e:
        logger.warning(f"InfluxDB connection failed: {e}, continuing without InfluxDB")
        influx_client = None

    # 启动 Prometheus HTTP 服务器
    start_http_server(PROMETHEUS_PORT)
    logger.info(f"Prometheus metrics server started on port {PROMETHEUS_PORT}")

    # 主循环
    while True:
        try:
            pids = get_process_pids(ADB_DEVICE, package_name=None)
            if not pids:
                logger.debug("No Java processes found, waiting...")

            for pid in pids:
                collect_memory(ADB_DEVICE, pid, influx_client)

        except Exception as e:
            logger.error(f"Error in main loop: {e}")

        time.sleep(ADJ_INTERVAL)


if __name__ == '__main__':
    main()
```

## 安装依赖

```bash
pip install prometheus_client influxdb
```

## 运行方式

```bash
# 后台运行
python android_memory_collector.py &

# 或使用 systemd 管理
sudo cp android_memory_collector.py /usr/local/bin/
sudo vim /etc/systemd/system/android-memory-collector.service
```

systemd 服务文件：

```ini
[Unit]
Description=Android Memory Collector
After=network.target

[Service]
ExecStart=/usr/bin/python3 /usr/local/bin/android_memory_collector.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable android-memory-collector
sudo systemctl start android-memory-collector
```

## Prometheus 配置

在 `prometheus.yml` 中添加抓取任务：

```yaml
scrape_configs:
  - job_name: 'android-memory'
    static_configs:
      - targets: ['localhost:9240']
    scrape_interval: 15s
```

## Grafana 仪表盘

### 内存增长趋势图

```promql
# Java Heap 增长趋势
rate(android_java_heap_alloc_kb{device="localhost:5555"}[5m])

# 检测内存泄露：内存持续增长
predict_linear(android_java_heap_alloc_kb{device="localhost:5555"}[1h], 3600) - android_java_heap_alloc_kb
```

### 告警规则

```yaml
groups:
  - name: android_memory
    rules:
      # Java Heap 超过阈值
      - alert: AndroidJavaHeapHigh
        expr: android_java_heap_size_kb / 1024 > 512  # 超过 512MB
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Android Java Heap 过高"
          description: "设备 {{ $labels.device }} 进程 {{ $labels.process_name }} (PID: {{ $labels.pid }}) Java Heap 达到 {{ $value }}MB"

      # 内存持续增长（疑似泄露）
      - alert: AndroidMemoryLeakSuspect
        expr: |
          (android_java_heap_alloc_kb - android_java_heap_alloc_kb offset 1h) / 1024 > 50
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "疑似内存泄露"
          description: "设备 {{ $labels.device }} 进程 {{ $labels.process_name }} 过去 1 小时内存增长超过 50MB"
```

## InfluxDB 数据保留策略

```sql
-- 创建 30 天保留策略
CREATE RETENTION POLICY "30day" ON "android_memory"
    DURATION 30d
    REPLICATION 1
    DEFAULT;

-- 创建连续查询（用于降采样）
CREATE CONTINUOUS QUERY "cq_1h_avg" ON "android_memory"
BEGIN
    SELECT mean(java_heap_alloc) AS avg_heap
    INTO "30day".downsampled_1h
    FROM meminfo
    GROUP BY time(1h), device, pid, process_name
END;
```

## Grafana 面板配置

### 面板 1: 实时内存概览

| 指标 | 告警阈值 | 危险阈值 |
|------|----------|----------|
| Java Heap Alloc | > 200MB | > 400MB |
| Native Heap Alloc | > 100MB | > 200MB |
| Total Memory | > 500MB | > 800MB |

### 面板 2: 内存增长速率

使用 `rate()` 函数计算内存增长率：
- `rate(android_java_heap_alloc_kb[5m])` - Java Heap 增长速度
- `rate(android_native_heap_alloc_kb[5m])` - Native Heap 增长速度

### 面板 3: 进程内存排名

```promql
topk(10, sum by (process_name, pid) (android_java_heap_alloc_kb))
```

## 内存泄露判断标准

符合以下任一条件可能存在内存泄露：

| 模式 | 说明 | 阈值参考 |
|------|------|----------|
| **持续增长** | 内存每小时增长超过 50MB 且不回落 | `rate()` 持续为正 |
| **堆内存饱和** | Java Heap 接近配置上限 | 达到上限的 80%+ |
| **Native 泄漏** | Native Heap 持续增长且 GC 后不释放 | 持续增长不回落 |
| **图形内存积累** | Graphics 内存持续增长可能是 bitmap 泄漏 | Graphics 占比 > 30% |

详细分析思路可参考 [Perfetto Memory Case Study](https://perfetto.dev/docs/case-studies/memory)。实际阈值应根据应用规模和设备内存总量调整。

## 完整架构图

```
┌─────────────┐     adb shell          ┌──────────────────┐
│  Android    │ ────────────────────── │  Python Collector │
│  Device     │   dumpsys meminfo      │                  │
│  (redroid)  │                         │  ┌────────────┐  │
└─────────────┘                         │  │  Parser    │  │
                                        │  └────────────┘  │
                                        │        │          │
                    ┌───────────────────┼────────┤          │
                    │                   │        │          │
                    ▼                   ▼        ▼          ▼
            ┌───────────────┐   ┌──────────────┐  ┌─────────┐
            │   InfluxDB    │   │  Prometheus  │  │ Grafana │
            │  (历史趋势)   │   │  (实时告警)  │  │ (可视化)│
            └───────────────┘   └──────────────┘  └─────────┘
```

## 常见问题

### Q: 为什么有时候采集不到数据？

可能是 ADB 连接断开。建议添加重连逻辑：

```python
def ensure_adb_connected(device: str, max_retries: int = 3):
    """确保 ADB 已连接"""
    for i in range(max_retries):
        result = subprocess.run(
            ['adb', 'devices'],
            capture_output=True,
            text=True
        )
        if device.split(':')[0] in result.stdout:
            return True
        subprocess.run(['adb', 'connect', device])
        time.sleep(2)
    return False
```

### Q: 如何监控特定应用？

```python
# 修改 TARGET_PIDS 或调用时指定包名
pids = get_process_pids(ADB_DEVICE, package_name="com.example.myapp")
```

### Q: 如何处理多设备？

```python
DEVICES = [
    "localhost:5555",
    "192.168.1.100:5555",
]

for device in DEVICES:
    for pid in get_process_pids(device):
        collect_memory(device, pid, influx_client)
```

## 扩展阅读

- [安卓设备也能接入 Prometheus 监控？](/blog/gfty9op4/) - Node Exporter 部署
- [Docker ELK Stack 部署指南](/blog/docker-elk-deployment/) - 日志收集方案
- [Prometheus 部署指南](/homelab/deploy/prometheus/) - 监控系统搭建

## 参考链接

- [Android dumpsys meminfo 官方文档](https://developer.android.com/studio/command-line/dumpsys)
- [Prometheus Client Python](https://github.com/prometheus/client_python)
- [InfluxDB Python Client](https://github.com/influxdata/influxdb-client-python)
- [Perfetto Memory Case Study](https://perfetto.dev/docs/case-studies/memory) - 内存分析官方指南
- [Android App Memory Analysis](https://github.com/Gracker/Android-App-Memory-Analysis) - meminfo 解析工具参考
- [Memory Monitor Gist](https://gist.github.com/rkavalap/bb062f36c66cd7ae928535600bf05de2) - 时间序列采集脚本示例