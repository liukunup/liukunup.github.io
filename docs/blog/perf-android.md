---
title: perf-android
createTime: 2026/04/25 05:58:54
permalink: /blog/gfty9op4/
---

介绍如何在安卓设备上使用 Node Exporter，并结合 Prometheus 和 Grafana 进行监控。

安卓设备也能接入 Prometheus 监控？手把手教你用 Node Exporter

## 一、为什么要监控安卓设备？

在 IoT 设备、车机系统、Android 电视盒子、甚至旧手机改造的家庭服务器等场景中，我们经常需要监控设备的 CPU、内存、网络等性能指标。但安卓设备通常缺乏标准化的监控方案。

本文将介绍如何利用 Prometheus 生态的 Node Exporter，在安卓设备上采集系统指标，并通过 Grafana 进行可视化展示。

**最终效果**：你可以通过 Grafana 仪表盘实时查看安卓设备的 CPU 使用率、内存占用、网络流量等关键指标。

---

## 二、原理简介

Node Exporter 是 Prometheus 官方提供的用于采集主机指标的组件，它通过读取 Linux 内核暴露的 `/proc`、`/sys` 等文件系统获取系统信息。

安卓系统基于 Linux 内核，理论上可以运行 Node Exporter。但需要注意：

- **架构匹配**：大多数安卓设备使用 ARM 架构，需下载 `linux-arm64` 或 `linux-armv7` 版本
- **路径差异**：安卓的某些 `/proc` 路径可能与标准 Linux 不同，部分采集器会失败
- **权限要求**：需要 root 权限才能访问全部系统信息

本文将采用**白名单模式**，只启用安卓系统支持的采集器，避免大量错误日志。

---

## 三、环境准备

### 3.1 准备工作

- 一台已 **root** 的安卓设备（推荐）
- 电脑上安装好 **ADB** 工具
- 开启安卓设备的 **USB 调试** 模式

### 3.2 确认设备架构

```bash
adb shell getprop ro.product.cpu.abi
```

根据输出结果，选择对应的 Node Exporter 版本：

| 输出架构 | 下载版本 |
|---------|---------|
| `arm64-v8a` | `node_exporter-*.linux-arm64.tar.gz` |
| `armeabi-v7a` | `node_exporter-*.linux-armv7.tar.gz` |
| `x86_64` | `node_exporter-*.linux-amd64.tar.gz` |

### 3.3 下载 Node Exporter

从 [GitHub Releases](https://github.com/prometheus/node_exporter/releases) 下载对应版本：

```bash
# 示例：在电脑上下载 arm64 版本
wget https://github.com/prometheus/node_exporter/releases/download/v1.11.1/node_exporter-1.11.1.linux-arm64.tar.gz
tar -xzf node_exporter-1.11.1.linux-arm64.tar.gz
```

---

## 四、部署 Node Exporter 到安卓设备

### 4.1 推送文件

```bash
# 推送二进制文件到设备
adb push node_exporter-1.11.1.linux-arm64/node_exporter /data/local/tmp/

# 赋予执行权限
adb shell chmod 755 /data/local/tmp/node_exporter
```

### 4.2 启动 Node Exporter（白名单模式）

由于安卓系统缺少部分 Linux 标准路径，建议只启用支持的采集器：

```bash
adb shell "nohup /data/local/tmp/node_exporter \
  --web.listen-address=:9100 \
  --collector.disable-defaults \
  --collector.cpu.enabled \
  --collector.meminfo.enabled \
  --collector.loadavg.enabled \
  --collector.filesystem.enabled \
  --collector.stat.enabled \
  --collector.time.enabled \
  --collector.uname.enabled \
  --collector.netdev.enabled \
  --collector.netstat.enabled \
  > /data/local/tmp/node_exporter.log 2>&1 &"
```

**参数说明**：
- `--collector.disable-defaults`：禁用所有默认采集器
- `--collector.xxx.enabled`：只启用指定的采集器
- `--web.listen-address=:9100`：监听 9100 端口

### 4.3 验证运行状态

```bash
# 检查进程
adb shell ps -ef | grep node_exporter

# 查看日志
adb shell cat /data/local/tmp/node_exporter.log

# 转发端口到本地
adb forward tcp:9100 tcp:9100

# 测试指标获取
curl http://localhost:9100/metrics
```

如果能看到指标输出，说明部署成功！

---

## 五、配置 Prometheus

### 5.1 安装 Prometheus

参考 [官方文档](https://prometheus.io/download/) 下载安装。

### 5.2 编辑配置文件 `prometheus.yml`

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'android_device'
    static_configs:
      - targets: ['<安卓设备IP>:9100']
    # 如果使用 adb forward，可以写 localhost:9100
    # - targets: ['localhost:9100']
```

**注意**：
- 如果手机和 Prometheus 在同一局域网，直接填写手机 IP
- 如果使用 USB 连接，可以用 `adb forward` 转发后填写 `localhost:9100`

### 5.3 启动 Prometheus

```bash
./prometheus --config.file=prometheus.yml
```

访问 `http://localhost:9090`，在 Targets 页面查看状态是否为 UP。

---

## 六、配置 Grafana 可视化

### 6.1 安装 Grafana

参考 [官方文档](https://grafana.com/grafana/download) 安装。

### 6.2 添加 Prometheus 数据源

1. 访问 `http://localhost:3000`（默认账号 admin/admin）
2. 进入 **Configuration > Data Sources > Add data source**
3. 选择 **Prometheus**，URL 填写 `http://localhost:9090`
4. 点击 **Save & Test**

### 6.3 导入 Node Exporter 仪表盘

Node Exporter 官方提供了通用的仪表盘模板，虽然针对标准 Linux 设计，但大部分指标在安卓上也能正常显示。

**方法一：导入官方模板**
1. 进入 **Dashboards > Import**
2. 输入模板 ID：`1860`（Node Exporter Full）
3. 选择 Prometheus 数据源后导入

**方法二：手动创建简单的仪表盘**

你也可以手动创建一个简洁的仪表盘，包含以下面板：

| 面板名称 | 指标查询语句 |
|---------|-------------|
| CPU 使用率 | `100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)` |
| 内存使用率 | `(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100` |
| 系统负载 | `node_load1`、`node_load5`、`node_load15` |
| 网络流量 | `rate(node_network_receive_bytes_total[5m])` |
| 磁盘使用率 | `(node_filesystem_size_bytes{mountpoint="/data"} - node_filesystem_free_bytes{mountpoint="/data"}) / node_filesystem_size_bytes{mountpoint="/data"} * 100` |

**注意**：部分指标名称可能需要根据实际输出的 metrics 进行调整。你可以先访问 `http://localhost:9100/metrics` 查看所有可用指标。

---

## 七、常用运维命令

### 7.1 查看指标

```bash
# 直接查看原始指标
curl http://<手机IP>:9100/metrics

# 过滤特定指标
curl http://<手机IP>:9100/metrics | grep node_cpu
```

### 7.2 停止 Node Exporter

```bash
adb shell pkill node_exporter
```

### 7.3 清理文件

```bash
adb shell rm /data/local/tmp/node_exporter
adb shell rm /data/local/tmp/node_exporter.log
```

### 7.4 清理端口转发

```bash
adb forward --remove tcp:9100
```

---

## 八、效果展示

部署完成后，你可以在 Grafana 中看到类似下面的监控数据：

- **CPU 指标**：各核心使用率、负载平均值
- **内存指标**：总内存、可用内存、缓存使用量
- **网络指标**：各网卡收发字节数、数据包数量
- **系统信息**：内核版本、系统运行时间

---

## 九、常见问题

### Q1：启动后大量错误日志怎么办？

使用本文的白名单启动命令，只启用支持的采集器，可以有效减少错误日志。

### Q2：部分指标没有数据怎么办？

检查 Node Exporter 的 `/metrics` 输出，确认指标名称是否与 Grafana 查询语句一致。安卓系统的某些路径可能与标准 Linux 不同，需要调整采集器或查询语句。

### Q3：如何让 Node Exporter 开机自启？

可以使用 **Magisk** 模块或 **init.d** 脚本实现开机自启，具体方法取决于设备的 root 方案。

### Q4：iOS 或鸿蒙系统能用吗？

- **iOS**：不能直接运行，系统限制严格
- **鸿蒙 NEXT**：自研内核不兼容 Linux，官方不支持

---

## 十、总结

通过本文的介绍，我们成功地在安卓设备上部署了 Node Exporter，并通过 Prometheus 和 Grafana 实现了监控数据的采集与可视化。

**关键点回顾**：
1. 下载适配 ARM 架构的 Node Exporter 版本
2. 使用白名单模式只启用支持的采集器
3. 通过 ADB 部署到 `/data/local/tmp` 目录
4. 配置 Prometheus 抓取指标
5. 用 Grafana 创建监控仪表盘

这套方案特别适合监控 Android 电视盒子、车机设备、IoT 网关等场景。如果你有更多疑问或想要定制化的仪表盘，欢迎留言交流！

---

**参考资料**：
- [Node Exporter GitHub](https://github.com/prometheus/node_exporter)
- [Prometheus 官方文档](https://prometheus.io/docs/)
- [Grafana 官方文档](https://grafana.com/docs/)
