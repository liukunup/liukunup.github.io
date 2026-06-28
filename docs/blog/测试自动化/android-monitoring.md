---
title: 安卓设备也能接入 Prometheus 监控？
tags:
  - Android
  - 安卓
  - Prometheus
  - 监控
createTime: 2026/04/25 05:58:54
permalink: /blog/gfty9op4/
---

## 为什么要监控安卓设备？

在 IoT 设备、车机系统、Android 电视盒子、甚至旧手机改造的家庭服务器等场景中，我们经常需要监控设备的 CPU、内存、网络等性能指标。但安卓设备通常缺乏标准化的监控方案。

本文将介绍如何利用 Prometheus 生态的 Node Exporter，在安卓设备上采集系统指标，并通过 Grafana 进行可视化展示。

**最终效果**：通过 Grafana 仪表盘实时查看安卓设备的 CPU 使用率、内存占用、网络流量等关键指标。

## 原理简介

Node Exporter 是 Prometheus 官方提供的用于采集主机指标的组件，它通过读取 Linux 内核暴露的 `/proc`、`/sys` 等文件系统获取系统信息。

安卓系统基于 Linux 内核，理论上可以运行 Node Exporter。但需要注意：

- **架构匹配**：大多数安卓设备使用 ARM 架构，需下载 `linux-arm64` 或 `linux-armv7` 版本
- **路径差异**：安卓的某些 `/proc` 路径可能与标准 Linux 不同，部分采集器会失败
- **权限要求**：需要 root 权限才能启动采集程序和访问全部系统信息

## 环境准备

### 1. 准备工作

- 一台已 **root** 的安卓设备
- 电脑上安装好 **ADB** 工具
- 开启安卓设备的 **USB 调试** 模式

### 2. 确认设备架构

```bash
adb shell getprop ro.product.cpu.abi
```

根据输出结果，选择对应的 Node Exporter 版本：

| 输出架构 | 下载版本 |
|---|---|
| `arm64-v8a` | `node_exporter-*.linux-arm64.tar.gz` |
| `armeabi-v7a` | `node_exporter-*.linux-armv7.tar.gz` |
| `x86_64` | `node_exporter-*.linux-amd64.tar.gz` |

### 3. 下载 Node Exporter

从 [GitHub Releases](https://github.com/prometheus/node_exporter/releases) 下载对应版本：

```bash
wget https://github.com/prometheus/node_exporter/releases/download/v1.11.1/node_exporter-1.11.1.linux-arm64.tar.gz
tar -xzf node_exporter-1.11.1.linux-arm64.tar.gz
```

## 部署 Node Exporter 到安卓设备

### 1. 推送文件

```bash
# 推送二进制文件到设备
adb push node_exporter-1.11.1.linux-arm64/node_exporter /data/local/tmp/

# 赋予执行权限
adb shell chmod 755 /data/local/tmp/node_exporter
```

### 2. 启动 Node Exporter

由于安卓系统缺少部分 Linux 标准路径，建议只启用支持的采集器：

```bash
adb shell "nohup /data/local/tmp/node_exporter > /data/local/tmp/node_exporter.log 2>&1 &"
```

### 3. 验证运行状态

```bash
# 检查进程
adb shell "ps -ef | grep node_exporter"

# 查看日志
adb shell cat /data/local/tmp/node_exporter.log

# 转发端口到本地
adb forward tcp:9100 tcp:9100

# 测试指标获取
curl http://localhost:9100/metrics
```

## 清理工作

### 1. 停止 Node Exporter

```bash
adb shell pkill node_exporter
```

### 2. 清理程序和日志

```bash
adb shell rm /data/local/tmp/node_exporter
adb shell rm /data/local/tmp/node_exporter.log
```

### 3. 清理端口转发

```bash
adb forward --remove tcp:9100
```
