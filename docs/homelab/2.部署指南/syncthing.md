---
title: Syncthing
tags:
  - syncthing
  - sync
  - file-sync
  - self-hosted
createTime: 2025/10/05 10:00:00
permalink: /homelab/deploy/syncthing/
---

## 🏗️ 架构图

📖 [Syncthing Docs](https://docs.syncthing.net/)

📖 [Syncthing GitHub](https://github.com/syncthing/syncthing)

📖 [STdisco (Discovery Server)](https://github.com/syncthing/stdisco)

📖 [STrelay (Relay Server)](https://github.com/syncthing/relaysrv)

Syncthing 是一款开源的文件同步工具，采用点对点 (P2P) 架构，通过 BEP (Block Exchange Protocol) 协议进行设备间的直接通信。

### 核心组件

| 组件 | 作用 | 端口 |
|------|------|------|
| Syncthing | 主程序，文件同步客户端 | 8384 (Web UI) |
| STdisco | 全局发现服务器，帮助设备发现彼此 | 8447 |
| STrelay | 中继服务器，设备无法直连时通过中继传输 | 22067 |

## 🚀 部署指南

::: tabs

@tab:active Docker Compose

```yaml
services:
  syncthing:
    image: syncthing/syncthing:latest
    container_name: syncthing
    restart: unless-stopped
    ports:
      - "8384:8384"   # Web UI
      - "22000:22000/tcp"
      - "22000:22000/udp"
      - "21027:21027/udp"
    volumes:
      - /opt/syncthing/config:/syncthing/config
      - /opt/syncthing/data:/syncthing/data
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
    deploy:
      resources:
        limits:
          memory: 1g
          cpus: '1.0'

networks:
  default:
    name: syncthing-network
```

:::

## ⚙️ 配置样例

### 📦 Syncthing 配置

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration version="40">
    <!-- GUI 设置 -->
    <gui enabled="true" tls="false" debugging="false">
        <address>0.0.0.0:8384</address>
        <apikey>your-api-key-here</apikey>
        <theme>dark</theme>
    </gui>
    
    <!-- 监听地址 -->
    <listenAddress>default</listenAddress>
    <localNetworkAddresses>tcp://0.0.0.0:22000</localNetworkAddresses>
    
    <!-- 全局发现服务器 -->
    <globalEnabled>true</globalEnabled>
    <globalDiscoveryServers>
        <!-- 官方公共发现服务器 -->
        <discovery>https://覆盆子:sync sizes:30818n@discovery.syncthing.net</discovery>
        <!-- 自建发现服务器 -->
        <discovery>https://your-disco-domain.com</discovery>
    </globalDiscoveryServers>
    
    <!-- 中继服务器 -->
    <relaysEnabled>true</relaysEnabled>
    <relayServers>
        <!-- 官方公共中继服务器 -->
        <relay>relay://0.0.0.0:22067</relay>
        <!-- 自建中继服务器 -->
        <relay>relay://your-relay-domain.com:443</relay>
    </relayServers>
    
    <!-- NAT 遍历 -->
    <natEnabled>true</natEnabled>
    <natLeaseMinutes>20</natLeaseMinutes>
    <natRenewalMinutes>5</natRenewalMinutes>
    <natTimeoutSeconds>10</natTimeoutSeconds>
    
    <!-- 数据传输 -->
    <limits>
        <maxSendBatchSize>128</maxSendBatchSize>
        <maxRecvBatchSize>128</maxRecvBatchSize>
    </limits>
    
    <!-- 系统设置 -->
    <device></device>
    <folder></folder>
</configuration>
```

### 📦 自建 Discovery Server

STdisco 是 Syncthing 的全局发现服务器，帮助 Syncthing 节点在没有公网 IP 或无法直连时找到彼此。

#### Docker Compose 部署

```yaml
services:
  stdisco:
    image: syncthing/stdisco:latest
    container_name: stdisco
    restart: unless-stopped
    ports:
      - "8447:8447"
      - "8447:8447/udp"
    environment:
      - TZ=Asia/Shanghai
    command: -debug
    deploy:
      resources:
        limits:
          memory: 256m
          cpus: '0.5'

networks:
  default:
    name: syncthing-network
```

#### 二进制部署

```shell
# 下载
wget https://github.com/syncthing/stdisco/releases/latest/download/stdisco-linux-amd64-v1.0.0.tar.gz
tar -xzf stdisco-linux-amd64-v1.0.0.tar.gz

# 运行
./stdisco -listen :8447 -debug

# 或使用 systemd
sudo tee /etc/systemd/system/stdisco.service <<EOF
[Unit]
Description=Syncthing Discovery Server
After=network.target

[Service]
Type=simple
User=syncthing
ExecStart=/opt/stdisco/stdisco -listen :8447
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable --now stdisco
```

### 📦 自建 Relay Server

STrelay 是 Syncthing 的中继服务器，当设备之间无法建立直接连接时，通过中继服务器转发数据。

#### Docker Compose 部署

```yaml
services:
  strelay:
    image: syncthing/relaysrv:latest
    container_name: strelay
    restart: unless-stopped
    ports:
      - "22067:22067"
      - "22067:22067/udp"
    environment:
      - TZ=Asia/Shanghai
    command: >
      -listen=:22067
      -ping-interval=45s
      -ping-max=3
      -max-message-size=65536
      -max-log-file-size=10485760
    deploy:
      resources:
        limits:
          memory: 512m
          cpus: '1.0'

networks:
  default:
    name: syncthing-network
```

#### 带 TLS 的中继服务器

```yaml
services:
  strelay:
    image: syncthing/relaysrv:latest
    container_name: strelay
    restart: unless-stopped
    ports:
      - "443:22067"
    volumes:
      - /opt/strelay/certs:/certs:ro
    environment:
      - TZ=Asia/Shanghai
    command: >
      -listen=:22067
      -tls-cert=/certs/fullchain.pem
      -tls-key=/certs/privkey.pem
      -stun=stun.syncthing.net:3478
    deploy:
      resources:
        limits:
          memory: 512m
          cpus: '1.0'
```

#### 二进制部署

```shell
# 下载
wget https://github.com/syncthing/relaysrv/releases/latest/download/relaysrv-linux-amd64-v1.0.0.tar.gz
tar -xzf relaysrv-linux-amd64-v1.0.0.tar.gz

# 运行
./relaysrv -listen=:22067

# 使用 Let's Encrypt 证书
./relaysrv \
  -listen=:443 \
  -tls-cert=/path/to/fullchain.pem \
  -tls-key=/path/to/privkey.pem

# systemd 服务
sudo tee /etc/systemd/system/strelay.service <<EOF
[Unit]
Description=Syncthing Relay Server
After=network.target

[Service]
Type=simple
User=syncthing
ExecStart=/opt/strelay/relaysrv -listen=:22067 -ping-interval=45s
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable --now strelay
```

### 📦 Traefik 集成

```yaml
services:
  syncthing:
    image: syncthing/syncthing:latest
    container_name: syncthing
    restart: unless-stopped
    volumes:
      - /opt/syncthing/config:/syncthing/config
      - /opt/syncthing/data:/syncthing/data
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.syncthing.rule=Host(`sync.homelab.lan`)"
      - "traefik.http.routers.syncthing.entrypoints=websecure"
      - "traefik.http.routers.syncthing.tls=true"
      - "traefik.http.services.syncthing.loadbalancer.server.port=8384"

  stdisco:
    image: syncthing/stdisco:latest
    container_name: stdisco
    restart: unless-stopped
    command: -debug
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.stdisco.rule=Host(`disco.homelab.lan`)"
      - "traefik.http.routers.stdisco.entrypoints=websecure"
      - "traefik.http.routers.stdisco.tls=true"
      - "traefik.http.services.stdisco.loadbalancer.server.port=8447"

  strelay:
    image: syncthing/relaysrv:latest
    container_name: strelay
    restart: unless-stopped
    command: >
      -listen=:22067
      -pools= # 空表示不加入公共池
    ports:
      - "22067:22067"
      - "22067:22067/udp"
```

## 🔧 常用命令

```shell
# 查看容器状态
docker ps syncthing stdisco strelay

# 查看日志
docker logs -f syncthing
docker logs -f stdisco
docker logs -f strelay

# 重启服务
docker restart syncthing stdisco strelay

# 进入容器
docker exec -it syncthing /bin/sh

# 查看 Syncthing API
curl -u "your-api-key" http://localhost:8384/rest/system/config
curl -u "your-api-key" http://localhost:8384/rest/system/browse

# 获取设备 ID
curl -u "your-api-key" http://localhost:8384/rest/system/connections
```

## 💻 最佳实践

### 📁 完整部署套件

::: steps

1. 创建目录结构

    ```plaintext
    syncthing/
    ├── docker-compose.yml
    ├── config/
    │   └── config.xml      # Syncthing 配置
    ├── data/               # 同步数据目录
    └── certs/              # TLS 证书（可选）
    ```

2. 初始化配置

    ```shell
    # 首次启动生成配置
    docker run --rm \
      -v $(pwd)/config:/syncthing/config \
      syncthing/syncthing:latest \
      --generate /syncthing/config/config.xml
    ```

3. 配置自建发现/中继服务器

    编辑 `config/config.xml`：

    ```xml
    <globalDiscoveryServers>
        <discovery>https://disco.homelab.lan</discovery>
    </globalDiscoveryServers>

    <relayServers>
        <relay>relay://relay.homelab.lan:22067</relay>
    </relayServers>
    ```

4. 验证部署

    ```shell
    # 启动服务
    docker compose up -d

    # 检查状态
    curl http://localhost:8384/rest/system/ping
    curl http://localhost:8447/ping
    docker logs strelay | grep "listening"
    ```

:::

### 🔐 安全配置

```yaml
services:
  syncthing:
    image: syncthing/syncthing:latest
    container_name: syncthing
    restart: unless-stopped
    ports:
      - "127.0.0.1:8384:8384"  # 仅本地访问
      - "22000:22000/tcp"
      - "22000:22000/udp"
      - "21027:21027/udp"
    volumes:
      - /opt/syncthing/config:/syncthing/config
      - /opt/syncthing/data:/syncthing/data
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
    security_opt:
      - no-new-privileges:true
    read_only: false
    tmpfs:
      - /tmp
    networks:
      - internal

networks:
  internal:
    driver: bridge
```

### 📱 客户端连接配置

在 Syncthing Web UI 中配置发现服务器和中继服务器：

1. **设置 → 连接 → 发现服务器**

    ```plaintext
    # 自建发现服务器
    https://disco.homelab.lan
    
    # 官方公共发现服务器（备用）
    https://discovery.syncthing.net
    ```

2. **设置 → 连接 → 中继服务器**

    ```plaintext
    # 自建中继服务器
    relay://relay.homelab.lan:443
    
    # 官方公共中继服务器（备用）
    relay://relays.syncthing.net:443
    ```

3. **设备配置**

    - 添加设备时，使用对方的设备 ID
    - 设备 ID 可在 Web UI 设置中查看
    - 共享文件夹给对端设备

### 🔄 高可用配置

```yaml
services:
  syncthing:
    image: syncthing/syncthing:latest
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
    volumes:
      - syncthing-config:/syncthing/config
      - /opt/syncthing/data:/syncthing/data

volumes:
  syncthing-config:
    driver: local-persist
```

### 📊 监控配置

```shell
# 启用 Prometheus metrics
# 在 config.xml 中添加：

<metricsEnabled>true</metricsEnabled>

# 或通过 API 启用
curl -u "your-api-key" \
  -X POST \
  http://localhost:8384/rest/system/config \
  -d '{"metricsEnabled": true}'
```

Prometheus 抓取配置：

```yaml
scrape_configs:
  - job_name: 'syncthing'
    static_configs:
      - targets: ['syncthing:8384']
    metrics_path: /rest/events?stream
    scrape_interval: 30s
```

## 🆘 故障排查

### 常见问题

| 问题 | 解决方案 |
|------|----------|
| 设备无法发现 | 检查防火墙 22000 端口，确认发现服务器可达 |
| 连接不稳定 | 启用中继服务器，配置 STUN 服务器 |
| 同步速度慢 | 检查网络带宽，查看是否有连接限速 |
| Web UI 无法访问 | 检查 8384 端口，检查认证配置 |

### 日志分析

```shell
# 查看详细日志
docker logs -f syncthing --tail 100

# 开启调试模式
docker exec syncthing sed -i 's/<gui debugging="false"/<gui debugging="true"/g' /syncthing/config/config.xml
docker restart syncthing

# 查看连接日志
docker exec syncthing cat /syncthing/config/syncthing.log | grep -i "connection\|relay\|disco"
```

### 网络测试

```shell
# 测试端口连通性
nc -zv your-device-ip 22000
nc -zvu your-device-ip 22000

# 测试发现服务器
curl -v https://disco.homelab.lan/ping

# 测试中继服务器
wscat -c "ws://relay.homelab.lan:22067/v2/?id=<your-device-id>"

# 检查 NAT 类型
./stdisco -stun-server stun.syncthing.net:3478
```

## 💾 跨平台客户端同步

通过 Docker 在 Windows、Mac、Linux 上部署 Syncthing 客户端，挂载本地目录实现与服务器的同步。

### 📋 通用前提条件

::: steps

1. 安装 Docker

    ```shell
    # Linux
    curl -fsSL https://get.docker.com | sh

    # Mac / Windows
    # 下载 Docker Desktop: https://www.docker.com/products/docker-desktop
    ```

2. 创建同步目录

    ```shell
    # 创建用于同步的文件夹
    mkdir -p ~/Sync/Documents
    mkdir -p ~/Sync/Photos
    mkdir -p ~/Sync/Notes
    ```

3. 获取设备 ID

    首次运行后访问 Web UI (http://localhost:8384) 获取设备 ID，用于添加设备。

:::

### 🐧 Linux 客户端

#### Docker Compose 部署

```yaml
# docker-compose.yml
services:
  syncthing:
    image: syncthing/syncthing:latest
    container_name: syncthing
    restart: unless-stopped
    hostname: linux-client  # 唯一主机名
    ports:
      - "8384:8384"         # Web UI
      - "22000:22000/tcp"
      - "22000:22000/udp"
      - "21027:21027/udp"
    volumes:
      # 配置文件
      - ./config:/syncthing/config
      # 同步目录 - 挂载用户目录
      - ~/Sync/Documents:/syncthing/data/Documents
      - ~/Sync/Photos:/syncthing/data/Photos
      - ~/Sync/Notes:/syncthing/data/Notes
      # 可选：下载目录
      - ~/Downloads:/syncthing/data/Downloads
    environment:
      - PUID=1000           # 当前用户 ID
      - PGID=1000           # 当前用户组 ID
      - TZ=Asia/Shanghai
    # 网络模式 - 使用 host 模式避免端口冲突
    # network_mode: host

networks:
  default:
    name: syncthing-network
```

#### 启动与配置

```shell
# 启动
docker compose up -d

# 查看日志
docker logs -f syncthing

# 访问 Web UI
# http://localhost:8384

# 获取设备 ID
docker exec syncthing cat /syncthing/config/config.xml | grep -A1 'device id'
# 或在 Web UI 右下角查看
```

#### 自启动配置 (systemd)

```shell
# 创建 systemd 服务
sudo tee /etc/systemd/system/syncthing.service <<EOF
[Unit]
Description=Syncthing Docker
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/syncthing
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# 启用自启动
sudo systemctl enable syncthing
sudo systemctl start syncthing
```

### 🍎 macOS 客户端

#### Docker Compose 部署

```yaml
# docker-compose.yml
services:
  syncthing:
    image: syncthing/syncthing:latest
    container_name: syncthing
    restart: unless-stopped
    hostname: mac-client  # 唯一主机名
    ports:
      - "8384:8384"         # Web UI
      - "22000:22000/tcp"
      - "22000:22000/udp"
      - "21027:21027/udp"
    volumes:
      # 配置文件
      - ./config:/syncthing/config
      # 同步目录 - macOS 用户目录
      - ~/Sync/Documents:/syncthing/data/Documents
      - ~/Sync/Photos:/syncthing/data/Photos
      - ~/Sync/Notes:/syncthing/data/Notes
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
```

#### 创建同步目录

```shell
# 创建同步文件夹
mkdir -p ~/Sync/Documents
mkdir -p ~/Sync/Photos
mkdir -p ~/Sync/Notes

# 初始化 Docker Compose
cd ~/Sync
curl -O https://raw.githubusercontent.com/syncthing/syncthing/main/docker-compose.yml
# 修改 volume 挂载路径后启动
docker compose up -d

# 允许 Docker 访问用户目录 (macOS)
# 系统偏好设置 → 安全性与隐私 → 隐私 → 完全磁盘访问权限 → 添加 Docker
```

#### LaunchAgent 自启动

```shell
# 创建 LaunchAgent
mkdir -p ~/Library/LaunchAgents

cat > ~/Library/LaunchAgents/com.syncthing.docker.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.syncthing.docker</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/docker</string>
        <string>compose</string>
        <string>-f</string>
        <string>/Users/$(whoami)/Sync/docker-compose.yml</string>
        <string>up</string>
        <string>-d</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    <key>WorkingDirectory</key>
    <string>/Users/$(whoami)/Sync</string>
</dict>
</plist>
EOF

# 加载服务
launchctl load ~/Library/LaunchAgents/com.syncthing.docker.plist

# 查看状态
launchctl list | grep syncthing
```

### 🪟 Windows 客户端

#### Docker Compose 部署

```yaml
# docker-compose.yml
services:
  syncthing:
    image: syncthing/syncthing:latest
    container_name: syncthing
    restart: unless-stopped
    hostname: windows-client  # 唯一主机名
    ports:
      - "8384:8384"         # Web UI
      - "22000:22000/tcp"
      - "22000:22000/udp"
      - "21027:21027/udp"
    volumes:
      # 配置文件
      - ./config:/syncthing/config
      # 同步目录 - Windows 用户目录
      - C:/Users/用户名/Sync/Documents:/syncthing/data/Documents
      - C:/Users/用户名/Sync/Photos:/syncthing/data/Photos
      - C:/Users/用户名/Sync/Notes:/syncthing/data/Notes
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
```

#### PowerShell 部署脚本

```powershell
# 创建同步文件夹
$syncPath = "$env:USERPROFILE\Sync"
New-Item -ItemType Directory -Path "$syncPath\Documents" -Force
New-Item -ItemType Directory -Path "$syncPath\Photos" -Force
New-Item -ItemType Directory -Path "$syncPath\Notes" -Force
New-Item -ItemType Directory -Path "$syncPath\config" -Force

# 创建 docker-compose.yml
$composeContent = @"
services:
  syncthing:
    image: syncthing/syncthing:latest
    container_name: syncthing
    restart: unless-stopped
    hostname: windows-client
    ports:
      - "8384:8384"
      - "22000:22000/tcp"
      - "22000:22000/udp"
      - "21027:21027/udp"
    volumes:
      - ./config:/syncthing/config
      - ${env:USERPROFILE}\Sync\Documents:/syncthing/data/Documents
      - ${env:USERPROFILE}\Sync\Photos:/syncthing/data/Photos
      - ${env:USERPROFILE}\Sync\Notes:/syncthing/data/Notes
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
"@

Set-Content -Path "$syncPath\docker-compose.yml" -Value $composeContent

# 启动 Syncthing
Set-Location $syncPath
docker compose up -d

# 打开 Web UI
Start-Process "http://localhost:8384"

Write-Host "Syncthing 已启动!"
Write-Host "配置文件目录: $syncPath"
```

#### Windows 任务计划程序自启动

```powershell
# 创建计划任务
$action = New-ScheduledTaskAction `
    -Execute "docker" `
    -Argument "compose -f `"$env:USERPROFILE\Sync\docker-compose.yml`" up -d"

$trigger = New-ScheduledTaskTrigger `
    -AtLogOn

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable

Register-ScheduledTask `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -TaskName "Syncthing" `
    -Description "Syncthing 文件同步客户端"
```

### 📱 多设备同步配置

#### 添加设备到服务器

::: steps

1. 获取客户端设备 ID

    在各客户端的 Web UI (http://localhost:8384) 右下角显示设备 ID。

2. 交换设备 ID

    ```shell
    # 方式一：通过自建发现服务器
    # 确保所有设备配置了相同的发现服务器
    # https://disco.homelab.lan

    # 方式二：手动输入
    # 在服务器 Web UI → 操作 → 显示 ID
    # 复制后添加到客户端
    ```

3. 添加设备

    在 Syncthing Web UI：
    - 点击右下角「操作」→「设置」
    - 选择「设备」标签
    - 点击「添加设备」
    - 输入对方的设备 ID
    - 设置设备名称和共享文件夹

4. 接受设备邀请

    对端设备会收到连接请求，确认即可。

:::

#### 文件夹同步配置

```xml
<!-- 在 config.xml 中配置共享文件夹 -->
<folder id="documents" label="Documents" path="/syncthing/data/Documents" type="sendreceive" rescanIntervalS="60">
    <!-- 允许同步的设备 -->
    <device id="DEVICE-ID-1"></device>
    <device id="DEVICE-ID-2"></device>
    
    <!-- 文件版本控制 -->
    <versioning type="trashcan" />
    <!-- 或使用版本控制:
    <versioning type="simple" parameter="10" />
    -->
    
    <!-- 文件过滤 -->
    <ignorePatterns>
        <pattern ignoreCase="true">.DS_Store</pattern>
        <pattern ignoreCase="true">Thumbs.db</pattern>
        <pattern ignoreCase="true">*.tmp</pattern>
    </ignorePatterns>
</folder>
```

### 🔄 同步场景示例

#### 场景一：Documents 同步

```yaml
# Linux 挂载
- ~/Documents:/syncthing/data/Documents

# Mac 挂载
- /Users/用户名/Documents:/syncthing/data/Documents

# Windows 挂载
- C:/Users/用户名/Documents:/syncthing/data/Documents
```

#### 场景二：照片备份

```yaml
# 挂载照片目录
- ~/Photos:/syncthing/data/Photos
- ~/Pictures:/syncthing/data/Pictures

# 配置同步规则
# - 开启「仅发送」模式（从客户端到服务器）
# - 关闭「仅接收」模式（服务器到客户端）
```

#### 场景三：Obsidian 笔记同步

```yaml
# 挂载笔记目录
- ~/Obsidian/Vault:/syncthing/data/Vault

# config.xml 配置
<folder id="obsidian-vault" label="Obsidian Vault" path="/syncthing/data/Vault" type="sendreceive">
    <device id="SERVER-DEVICE-ID"></device>
    <minDiskFree unit="%">1</minDiskFree>
</folder>
```

### 🛡️ 权限问题排查

#### Linux 权限问题

```shell
# 查看当前用户 ID
id

# 修改同步目录权限
sudo chown -R $(id -u):$(id -g) ~/Sync

# 或在 docker-compose.yml 中设置正确的 PUID/PGID
environment:
  - PUID=1000
  - PGID=1000
```

#### macOS 权限问题

```shell
# Docker Desktop → 设置 → 资源 → 文件共享
# 添加 ~/Sync 目录

# 或使用 OrbStack 替代 Docker Desktop
```

#### Windows 权限问题

```powershell
# 以管理员身份运行 Docker Desktop

# 或修改文件夹权限
icacls "C:\Users\用户名\Sync" /grant "NETWORK SERVICE:RW" /T

# 使用 WSL2 后端
wsl -l -v  # 查看 WSL 版本
wsl --update  # 更新 WSL
```

### 📊 同步状态监控

```shell
# 查看同步状态
curl -s http://localhost:8384/rest/system/ping | jq

# 查看连接状态
curl -s http://localhost:8384/rest/system/connections | jq

# 查看文件夹状态
curl -s http://localhost:8384/rest/db/status | jq

# 获取统计信息
curl -s http://localhost:8384/rest/stats/device | jq
```

### 🚀 一键部署脚本

#### Linux/macOS

```shell
#!/bin/bash

# Syncthing 跨平台同步客户端安装脚本

set -e

SYNC_DIR="$HOME/Sync"

# 创建目录
mkdir -p "$SYNC_DIR/config"
mkdir -p "$SYNC_DIR/Documents"
mkdir -p "$SYNC_DIR/Photos"
mkdir -p "$SYNC_DIR/Notes"

# 创建 docker-compose.yml
cat > "$SYNC_DIR/docker-compose.yml" <<'EOF'
services:
  syncthing:
    image: syncthing/syncthing:latest
    container_name: syncthing
    restart: unless-stopped
    hostname: ${HOSTNAME:-syncthing-client}
    ports:
      - "8384:8384"
      - "22000:22000/tcp"
      - "22000:22000/udp"
      - "21027:21027/udp"
    volumes:
      - ./config:/syncthing/config
      - ./Documents:/syncthing/data/Documents
      - ./Photos:/syncthing/data/Photos
      - ./Notes:/syncthing/data/Notes
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
EOF

# 启动
cd "$SYNC_DIR"
docker compose up -d

echo "✅ Syncthing 已启动!"
echo "📂 配置文件: $SYNC_DIR/config"
echo "🌐 Web UI: http://localhost:8384"
echo ""
echo "查看日志: docker logs -f syncthing"
echo "停止服务: docker compose -f $SYNC_DIR/docker-compose.yml down"
```

#### Windows (PowerShell)

```powershell
# Syncthing 跨平台同步客户端安装脚本 (Windows)

$syncPath = "$env:USERPROFILE\Sync"

# 创建目录
New-Item -ItemType Directory -Path "$syncPath\config" -Force | Out-Null
New-Item -ItemType Directory -Path "$syncPath\Documents" -Force | Out-Null
New-Item -ItemType Directory -Path "$syncPath\Photos" -Force | Out-Null
New-Item -ItemType Directory -Path "$syncPath\Notes" -Force | Out-Null

# 创建 docker-compose.yml
@" 
services:
  syncthing:
    image: syncthing/syncthing:latest
    container_name: syncthing
    restart: unless-stopped
    hostname: windows-client
    ports:
      - "8384:8384"
      - "22000:22000/tcp"
      - "22000:22000/udp"
      - "21027:21027/udp"
    volumes:
      - ./config:/syncthing/config
      - ${env:USERPROFILE}\Sync\Documents:/syncthing/data/Documents
      - ${env:USERPROFILE}\Sync\Photos:/syncthing/data/Photos
      - ${env:USERPROFILE}\Sync\Notes:/syncthing/data/Notes
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
"@ | Out-File -FilePath "$syncPath\docker-compose.yml" -Encoding UTF8

# 启动
Set-Location $syncPath
docker compose up -d

Write-Host "✅ Syncthing 已启动!" -ForegroundColor Green
Write-Host "📂 配置文件: $syncPath\config"
Write-Host "🌐 Web UI: http://localhost:8384"
Write-Host ""
Write-Host "查看日志: docker logs -f syncthing"
Write-Host "停止服务: docker compose down"
```
