---
title: 在 Ubuntu 上运行 redroid 远程 Android
createTime: 2026/04/05 13:02:00
permalink: /blog/xr1lem6a/
description: 通过 Docker 在 Ubuntu 上运行 redroid 远程 Android 模拟器，并通过 ADB 和 scrcpy 进行连接控制。
---

## 简介

[redroid](https://github.com/remote-android/redroid-doc) 是远程 Android（Remote Android）的缩写，是一个通过 Docker 运行的 Android 模拟器，支持 ARM 和 x86 架构。它适合用于远程调试、自动化测试等场景。

## 环境信息

- **宿主机**: Ubuntu 24.04 (Linux 6.8.0-90-generic)
- **Android 版本**: Android 15 (redroid 15.0.0)

## 安装步骤

### 1. 安装内核模块

redroid 需要加载 `binder_linux` 内核模块来提供 Android Binder 通信支持。

```bash
# 切换到 root 用户
sudo -i

# 安装内核模块
apt install linux-modules-extra-$(uname -r)

# 加载必要的内核模块
modprobe binder_linux devices="binder,hwbinder,vndbinder"
modprobe ashmem_linux
```

> **注意**: `ashmem_linux` 模块在较新的内核版本中可能不可用，可以忽略此错误继续。

### 2. 拉取 redroid 镜像

```bash
# 推荐选择 Android 15 版本
docker pull redroid/redroid:15.0.0_64only-latest
```

### 3. 创建数据目录

```bash
mkdir -p ~/android/data
```

### 4. 运行 redroid 容器

```bash
docker run -d \
  -p 5555:5555 \
  -v ~/android/data:/data \
  --privileged \
  --name redroid \
  redroid/redroid:15.0.0_64only-latest \
  androidboot.redroid_width=1080 \
  androidboot.redroid_height=1920
```

**参数说明**:

| 参数 | 说明 |
|------|------|
| `-p 5555:5555` | 映射 ADB 端口 |
| `-v ~/android/data:/data` | 数据持久化目录 |
| `--privileged` | 授予容器特权模式，必需 |
| `androidboot.redroid_width` | 屏幕宽度 (px) |
| `androidboot.redroid_height` | 屏幕高度 (px) |

### 5. 管理容器

```bash
# 停止容器
docker stop redroid

# 重新启动
docker start redroid
```

## 连接 Android 设备

### 通过 ADB 连接

```bash
# 连接设备
adb connect localhost:5555

# 查看已连接设备
adb devices -l
```

**输出示例**:

```
List of devices attached
192.168.103.101:5555   device product:redroid_x86_64_only model:redroid15_x86_64_only device:redroid_x86_64_only transport_id:4
```

### 通过 scrcpy 操控

scrcpy 可以直接投影并控制 Android 设备屏幕：

```bash
scrcpy -s localhost:5555
```

**输出示例**:

```
INFO: ADB device found:
INFO:     --> (tcpip)  192.168.103.101:5555            device  redroid15_x86_64_only
[server] INFO: Device: [redroid] redroid redroid15_x86_64_only (Android 15)
INFO: Renderer: metal
INFO: Texture: 1080x1920
```

## 常见问题

### ashmem_linux 模块不存在

较新的 Linux 内核已移除 `ashmem_linux` 模块。redroid 容器通常能正常工作，可以忽略此错误。

## 参考链接

- [redroid 官方文档](https://github.com/remote-android/redroid-doc)
- [scrcpy](https://github.com/Genymobile/scrcpy)
