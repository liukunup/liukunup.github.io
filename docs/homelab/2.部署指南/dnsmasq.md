---
title: dnsmasq
tags:
  - DNS
createTime: 2025/10/30 17:21:37
permalink: /homelab/deploy/dnsmasq/
---

## 🚀 部署指南

::: tabs

@tab:active Docker

```shell
docker run -d \
  -p 53:53/udp \
  -p 53:53/tcp \
  -p 8080:8080 \
  -v /path/to/dnsmasq.conf:/etc/dnsmasq.conf \
  -v /path/to/dnsmasq.resolv.conf:/etc/dnsmasq.resolv.conf \
  -e HTTP_USER=admin \
  -e HTTP_PASS=pass \
  --log-opt "max-size=100m" \
  --cap-add=NET_ADMIN \
  --restart=unless-stopped \
  --name=dnsmasq \
  jpillora/dnsmasq:latest
```

@tab Docker Compose

```yaml
services:
  dnsmasq:
    image: jpillora/dnsmasq:latest
    container_name: dnsmasq
    restart: unless-stopped
    cap_add:
      - NET_ADMIN
    ports:
      - "53:53/udp"
      - "53:53/tcp"
      - "8080:8080"
    environment:
      HTTP_USER: ${HTTP_USERNAME:-admin}
      HTTP_PASS: ${HTTP_PASSWORD:-pass}
    volumes:
      - /path/to/dnsmasq.conf:/etc/dnsmasq.conf
      - /path/to/dnsmasq.resolv.conf:/etc/dnsmasq.resolv.conf
    logging:
      driver: json-file
      options:
        max-size: 100m
```

启动容器 `docker compose -p dnsmasq up -d`

:::

## ⚙️ 配置指南

### **dnsmasq.conf**

```plaintext
# =============================================================================
# dnsmasq 企业级配置文件
# 版本: 1.0.0
# 描述: 家庭局域网DNS解析服务配置 - homelab.lan 域
# =============================================================================

# ========================
# 局域网域名解析
# ========================

# --- 精确域名解析 ---
address=/codex.homelab.lan/192.168.100.81

# --- 泛域名解析 ---
address=/.codex.homelab.lan/192.168.100.81

# ========================
# 上游DNS服务器
# ========================

# 指定上游DNS服务器配置文件
resolv-file=/etc/dnsmasq.resolv.conf

# 严格按照resolv-file中的顺序查询上游DNS服务器
strict-order

# ========================
# 缓存与性能优化
# ========================

# 缓存大小（缓存条目数量）
cache-size=10000

# 最大缓存时间（秒）
max-cache-ttl=3600

# 最小缓存时间（秒）
min-cache-ttl=60

# 禁用负值缓存（加快解析失败后的重试）
no-negcache

# ========================
# 日志与调试配置
# ========================

# 记录所有DNS查询
log-queries

# 日志输出文件路径
log-facility=/var/log/dnsmasq.log

# 详细日志级别
log-dhcp
log-async=100

# ========================
# 安全加固配置
# ========================

# 禁用DHCP功能（纯DNS服务器）
no-dhcp-interface=

# 作为本地服务运行，降低权限
local-service

# 阻止Windows 2k特定的DNS请求
filterwin2k

# 阻止DNS重绑定攻击
stop-dns-rebind

# 伪造的NXDomain响应，用于屏蔽特定IP
bogus-nxdomain=223.5.5.5

# 限制查询频率（防止DNS攻击）
dns-forward-max=150

# ========================
# 高级功能配置
# ========================

# 本地域名设置（简化内网域名输入）
local=/homelab.lan/

# 扩展主机名（自动补全域名）
expand-hosts

# 域名标签（最多允许的域名组成部分）
domain-needed

# 不转发不含域名的简单主机名查询
bogus-priv

# ========================
# 性能调优配置
# ========================

# 异步操作，提高性能
async-dns=yes

# DNS转发并发数
dns-forward-max=150

# 重启后清空缓存
clear-on-reload

# 服务器组（负载均衡）
all-servers
```

### **dnsmasq.resolv.conf**

```plaintext
# 上游DNS服务器
nameserver 114.114.114.114
nameserver 223.5.5.5
nameserver 119.29.29.29

# DNS查询选项
options timeout:2
options attempts:3
options rotate
```

## 🔍 测试与验证

### 网页界面管理

部署完成后，可通过 http://localhost:8080 访问Web管理界面。

- 用户名：`admin`
- 密码：!!请从上述配置取!!
- 功能包括：实时监控、动态配置、查询日志查看

### 解析功能测试

```shell
# 互联网域名解析
dig @114.114.114.114 baidu.com      # dig 使用示例
nslookup baidu.com 114.114.114.114  # nslookup 使用示例

# 局域网域名解析
dig @localhost coder.homelab.lan      # 测试域名解析
dig @localhost any.coder.homelab.lan  # 测试泛域名解析
nslookup coder.homelab.lan localhost
nslookup any.coder.homelab.lan localhost
```

## ⚙️ 配置指南

### **域名解析配置**

- `address=/coder.homelab.lan/192.168.100.12`  - 精确域名解析
- `address=/.coder.homelab.lan/192.168.100.12` - 泛域名解析，匹配所有子域名

### **客户端配置**

::: tabs

@tab:active Linux

```bash
# 临时修改
sudo systemctl restart systemd-resolved
# 永久修改
echo "nameserver 192.168.100.101" | sudo tee /etc/dnsmasq.resolv.conf
```

@tab Docker

```yaml
services:
  myapp:
    image: myapp:latest
    dns: 192.168.100.101
```

:::

## 🔍 维护与故障排查

- **端口占用**

```bash
# 检查53端口是否被占用
netstat -tulpn | grep :53
```

- **容器网络问题**

```bash
# 检查容器网络
docker network ls
docker network inspect dns-net
```
