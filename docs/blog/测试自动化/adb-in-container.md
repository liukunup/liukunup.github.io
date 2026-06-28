---
title: 如何在容器中使用 adb 操作宿主机挂载的手机设备
tags:
  - Android
  - adb
  - Docker
  - 容器
  - 移动调试
  - 物联网
createTime: 2026/04/29 11:00:00
permalink: /blog/adb-in-container/
---

## 为什么需要在容器中使用 adb

在以下场景中，我们需要通过容器内的 adb 操作宿主机上连接的手机设备：

- CI/CD 流水线（如 GitHub Actions、Jenkins）中实现真机自动化测试
- 隔离的开发环境，避免 adb 版本冲突或依赖污染宿主机
- 批量管理多台设备时，用容器封装标准化测试环境
- 云端设备管理场景，宿主机挂载设备，容器负责调度

## 核心原理：adb 通信机制

adb 包含三个核心组件：

| 组件 | 作用 | 通信方式 |
|------|------|----------|
| **adb client** | 命令行工具（如 `adb devices`） | 连接 adb server 的 5037 端口 |
| **adb server** | 后台守护进程，管理设备连接 | 监听 `tcp:localhost:5037`，与设备端的 `adbd` 通信 |
| **adbd** | 手机端的 adb 守护进程 | 支持 USB 或 TCP/IP 两种连接方式 |

容器操作宿主机设备的本质：**要么让容器直接访问宿主机的 USB 设备，要么让容器通过 TCP/IP 或端口映射连接宿主机的 adb server。**

## 方法一：Docker USB 设备直通（最贴近原生体验）

直接将宿主机的 USB 设备挂载到容器中，容器内 adb 可像宿主机一样识别设备。

### 前置条件

1. 手机开启 **USB 调试**，连接到宿主机
2. 宿主机安装 Docker，且用户有 docker 执行权限
3. （Linux 宿主机）将用户加入 `plugdev` 组避免权限问题：

```bash
sudo usermod -aG plugdev $USER
```

### 操作步骤

#### 1. 验证宿主机已识别设备

```bash
# 宿主机执行
adb devices
# 输出示例：
# List of devices attached
# 4df1234567890123    device
```

#### 2. 运行容器并挂载 USB 设备

```bash
# 方式 1：挂载整个 USB 总线（简单但权限较宽）
docker run -it --rm \
  -v /dev/bus/usb:/dev/bus/usb \
  --privileged \
  ubuntu:22.04 /bin/bash

# 方式 2：挂载指定 USB 设备（更安全，需先查设备路径）
# 宿主机执行 lsusb 找到设备，例如 Bus 001 Device 002: ID 18d1:4ee2 Google Inc.
docker run -it --rm \
  --device /dev/bus/usb/001/002 \
  ubuntu:22.04 /bin/bash
```

#### 3. 容器内验证

```bash
# 容器内执行
apt update && apt install -y adb
adb devices
# 输出应与宿主机一致，说明设备已识别
```

### 优缺点

| 优点 | 缺点 |
|------|------|
| 无需额外网络配置，操作逻辑与宿主机完全一致 | 仅支持本地 Docker 环境，`--privileged` 存在安全风险 |
| 支持所有 adb 命令（包括 push/pull/install 等） | USB 设备拔插后需重启容器才能重新识别 |

## 方法二：adb 无线调试（TCP/IP 模式，更灵活）

无需挂载 USB 设备，通过 TCP/IP 让容器内 adb 连接宿主机管理的无线设备，支持远程场景。

### 操作步骤

#### 1. 宿主机开启手机无线 adb

```bash
# 宿主机执行（手机先通过 USB 连接）
adb tcpip 5555  # 让手机端 adbd 监听 5555 端口
adb shell ip addr show wlan0 | grep inet  # 查看手机 IP，例如 192.168.1.100
adb connect 192.168.1.100:5555  # 宿主机连接无线设备
adb devices  # 验证连接成功
```

#### 2. 容器内连接无线设备

```bash
# 运行容器（使用 host 网络模式，或保证容器与手机在同一网段）
docker run -it --rm --network=host ubuntu:22.04 /bin/bash

# 容器内执行
apt update && apt install -y adb
adb connect 192.168.1.100:5555
adb devices
```

### 优缺点

| 优点 | 缺点 |
|------|------|
| 无需 USB 直通，支持远程设备 | 需要初始 USB 配置，依赖 WiFi 网络稳定性 |
| 适合多设备集群管理 | 拔插 USB 后需重新执行 `adb tcpip 5555` |

## 方法三：共享宿主机 adb Server（最轻量）

利用 adb server 的端口转发能力，让容器内 adb 客户端直接连接宿主机的 adb server，无需关心设备挂载细节。

### 操作步骤

#### 1. 宿主机启动 adb server

```bash
# 宿主机执行（若未启动会自动拉起）
adb start-server
# 验证监听端口
ss -tlnp | grep 5037
# 输出示例：LISTEN 0  128  127.0.0.1:5037  0.0.0.0:*
```

#### 2. 运行容器并映射 adb server 端口

```bash
# Docker Desktop（Mac/Windows）环境
docker run -it --rm \
  --add-host=host.docker.internal:host-gateway \
  -e ADB_SERVER_SOCKET=tcp:host.docker.internal:5037 \
  ubuntu:22.04 /bin/bash

# Linux 宿主机环境（需替换为宿主机 docker 桥接 IP，通常为 172.17.0.1）
docker run -it --rm \
  --add-host=host.docker.internal:172.17.0.1 \
  -e ADB_SERVER_SOCKET=tcp:host.docker.internal:5037 \
  ubuntu:22.04 /bin/bash
```

#### 3. 容器内验证

```bash
# 容器内执行
apt update && apt install -y adb
adb devices  # 直接读取宿主机 adb server 的设备列表
```

### 优缺点

| 优点 | 缺点 |
|------|------|
| 无需挂载设备或配置网络，极轻量 | 容器内 adb 版本需与宿主机一致，否则报版本不匹配错误 |
| 支持 CI/CD 流水线快速集成 | 依赖宿主机 adb server 存活 |

## 方法四：使用 adb -H 内置参数（最简单）

`adb -H` 是 adb 内置参数，可以直接指定 adb server 的主机地址，比设置环境变量更简洁。

### 操作步骤

#### 1. 宿主机确保 adb server 运行

```bash
# 宿主机执行
adb start-server
```

#### 2. 运行容器，直接使用 -H 参数

```bash
# Docker Desktop（Mac/Windows）环境
docker run -it --rm --network=host ubuntu:22.04 \
  bash -c "apt update && apt install -y adb && adb -H host.docker.internal -p 5037 devices"

# Linux 宿主机环境
docker run -it --rm --network=host ubuntu:22.04 \
  bash -c "apt update && apt install -y adb && adb -H 172.17.0.1 -p 5037 devices"
```

#### 3. 封装为别名使用

```bash
# 在宿主机 ~/.bashrc 或 ~/.zshrc 中添加别名
echo 'alias adb-container="docker run -it --rm --network=host ubuntu:22.04 adb -H \$(docker network inspect bridge --format=\"{{range .IPAM.Config}}{{.Gateway}}{{end}}\") -p 5037"' >> ~/.bashrc
source ~/.bashrc

# 之后直接使用
adb-container devices
```

### 封装为独立工具镜像

```dockerfile
FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y wget unzip && \
    wget https://dl.google.com/android/repository/platform-tools_r33.0.3-linux.zip && \
    unzip platform-tools_r33.0.3-linux.zip && \
    mv platform-tools/adb /usr/local/bin/ && \
    chmod +x /usr/local/bin/adb && \
    rm -rf platform-tools* && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 默认使用 host.docker.internal 连接宿主机 adb server
ENV ADB_HOST=host.docker.internal
ENV ADB_PORT=5037

ENTRYPOINT ["adb", "-H", "${ADB_HOST}", "-p", "${ADB_PORT}"]
```

```bash
# 构建并使用
docker build -t adb-remote .
docker run -it --rm --network=host adb-remote devices
```

### 优缺点

| 优点 | 缺点 |
|------|------|
| 最简单直接，无需环境变量 | 需要每次指定 -H 参数（或使用封装镜像） |
| 语义清晰，一看就懂 | 依赖容器网络访问宿主机 |
| 可轻松封装为独立工具镜像 | |

## 完整示例：封装 adb 工具容器

### 1. 编写 Dockerfile

```dockerfile
FROM ubuntu:22.04

# 安装与宿主机匹配的 adb 版本（示例为 1.0.41，需与宿主机一致）
RUN apt-get update && \
    apt-get install -y wget unzip && \
    wget https://dl.google.com/android/repository/platform-tools_r33.0.3-linux.zip && \
    unzip platform-tools_r33.0.3-linux.zip && \
    mv platform-tools/adb /usr/local/bin/ && \
    chmod +x /usr/local/bin/adb && \
    rm -rf platform-tools* && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /work
ENTRYPOINT ["adb"]
```

### 2. 构建并运行

```bash
# 构建镜像
docker build -t adb-tool .

# 运行（共享宿主机 adb server 模式）
docker run -it --rm \
  --add-host=host.docker.internal:host-gateway \
  -e ADB_SERVER_SOCKET=tcp:host.docker.internal:5037 \
  adb-tool devices
```

## 常见问题与解决

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `adb server version (39) doesn't match this client (41)` | 容器与宿主机 adb 版本不一致 | 确保 Dockerfile 中安装的 adb 版本与宿主机一致（`adb version` 查看宿主机版本） |
| 容器内 `adb devices` 无输出 | adb server 端口未正确映射 | 检查 `ADB_SERVER_SOCKET` 环境变量，或改用 `--network=host` 模式 |
| 无线连接 `adb connect` 超时 | 容器与手机不在同一网段 | 使用 `--network=host` 运行容器，或配置容器网络路由 |
| USB 设备权限拒绝 | 容器无访问 USB 设备的权限 | 添加 `--privileged` 参数，或 Linux 下将用户加入 `plugdev` 组 |

## 方法对比总结

| 方案 | 适用场景 | 复杂度 | 安全性 |
|------|----------|--------|--------|
| USB 设备直通 | 本地开发、单设备调试 | 低 | 低（`--privileged`） |
| 无线 TCP/IP | 远程设备、多设备管理 | 中 | 高 |
| 共享 adb Server | CI/CD 流水线、快速集成 | 低 | 高 |
| `adb -H` 内置参数 | 快速验证、临时使用 | 最低 | 高 |

推荐生产环境优先选择 **`adb -H`** 或 **共享 adb Server** 方案，无需 `--privileged`，安全性高且使用简单。
