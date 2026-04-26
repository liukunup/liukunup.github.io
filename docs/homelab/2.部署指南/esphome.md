---
title: ESPHome
tags:
  - IoT
  - 智能家居
createTime: 2026/04/27 10:30:00
permalink: /homelab/deploy/esphome/
---

ESPHome 是一个用于控制 ESP8266/ESP32 设备的框架，通过 YAML 配置文件定义设备行为，支持从简单的传感器到复杂自动化的一切。

## 准备工作

创建用于存储配置文件的目录

```bash
mkdir -p /share/Container/esphome
```

## 启动服务

::: tabs

@tab:active Docker Compose

```yaml
services:
  # ESPHome - Smart Home device control
  # https://esphome.io/
  esphome:
    image: esphome/esphome:latest
    restart: unless-stopped
    ports:
      - "6052:6052"    # Web Dashboard
      - "6053:6053"    # Web Dashboard (SSL)
    volumes:
      - /share/Container/esphome:/config
    environment:
      - ESPHOME_DASHBOARD_USE_SSL=0
    network_mode: host
    privileged: true
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6052/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

@tab Docker CLI

```bash
docker run -d \
  --name esphome \
  --restart unless-stopped \
  --network host \
  -v /share/Container/esphome:/config \
  -p 6052:6052 \
  -p 6053:6053 \
  --privileged \
  esphome/esphome:latest
```

:::

## 访问 Dashboard

启动后，打开 http://localhost:6052 访问 ESPHome 管理界面

## 常用命令

进入容器执行 ESPHome 命令

```bash
docker exec -it esphome esphome --help
```

### 配置与编译

- **验证配置文件**

```bash
docker exec -it esphome esphome config /config/my_device.yaml
```

- **编译固件**

```bash
docker exec -it esphome esphome run /config/my_device.yaml
```

- **编译并上传**

```bash
docker exec -it esphome esphome run /config/my_device.yaml --upload-port /192.168.1.100
```

### 查看日志

- **实时日志**

```bash
docker exec -it esphome esphome logs /config/my_device.yaml
```

- **带时间戳的日志**

```bash
docker exec -it esphome esphome logs /config/my_device.yaml --serial-port /dev/ttyUSB0 --serial-baudrate 115200 --log-level debug
```

### 设备管理

- **列出所有设备**

```bash
docker exec -it esphome esphome device list
```

- **查看设备信息**

```bash
docker exec -it esphome esphome device info my_device
```

- **OTA 更新**

```bash
docker exec -it esphome esphome uploadungkan /config/my_device.yaml
```

## 配置文件示例

创建一个基础配置文件 `my_device.yaml`：

```yaml
esphome:
  name: my_esp_device
  platformio_options:
    board: esp32dev
    framework:
      type: arduino

# 启用 WiFi
wifi:
  ssid: "YourSSID"
  password: "YourPassword"

# 启用 AP 模式（备用）
ap:
  ssid: "My ESP Device"
  password: "12345678"

# 启用 Web 服务器
web_server:
  port: 80

# 启用 API
api:
  password: "api_password"

# 启用 OTA
ota:
  password: "ota_password"

# 传感器示例
sensor:
  - platform: wifi_signal
    name: "WiFi Signal"
    id: wifi_signal
    update_interval: 60s

  - platform: template
    name: "Temperature"
    id: temperature
    unit_of_measurement: "°C"
    accuracy_decimals: 1

# 开关示例
switch:
  - platform: gpio
    name: " LED"
    pin: GPIO2

# 输出日志
logger:
  level: DEBUG
```

## 端口说明

| 端口 | 说明 |
|------|------|
| 6052 | Web Dashboard (HTTP) |
| 6053 | Web Dashboard (HTTPS) |

## 升级 ESPHome

```bash
# 拉取最新镜像
docker pull esphome/esphome:latest

# 重建容器
docker compose up -d --force-recreate
```

## 集成 Home Assistant

在 `configuration.yaml` 中添加：

```yaml
esphome:
  url: http://192.168.1.x:6052
  password: "api_password"
```

## 参考链接

- [ESPHome Official Docs](https://esphome.io/)
- [ESPHome GitHub](https://github.com/esphome/esphome)
- [ESPHome Docker Hub](https://hub.docker.com/r/esphome/esphome)