---
title: BIND 9
tags:
  - DNS
createTime: 2025/10/30 15:58:25
permalink: /homelab/deploy/bind9/
---

## 🚀 部署指南

1. 创建目录用于数据持久化；

    ```bash
    mkdir -p /opt/bind9/{config,cache,records}
    cd /opt/bind9
    ```

2. 设置目录权限；

    ```bash
    chmod -R 755 /opt/bind9
    chown -R 1000:1000 /opt/bind9  # 适配镜像的默认用户
    ```

3. 通过容器部署；

::: tabs

@tab Docker

    ```bash
    docker run -d \
      -p 53:53 \
      -p /opt/bind9/config:/etc/bind \
      -p /opt/bind9/cache:/var/cache/bind \
      -p /opt/bind9/records:/var/lib/bind \  
      -e TZ=Asia/Shanghai \
      -e BIND9_USER=bind \
      --restart=unless-stopped \
      --name=bind9 \
      ubuntu/bind9:9.18-24.04_beta
    ```

@tab:active Docker Compose

    ```yaml
    services:
      bind9:
        image: ubuntu/bind9:9.18-24.04_beta
        container_name: bind9
        restart: unless-stopped
        ports:
          - "53:53"
        volumes:
          - /opt/bind9/config:/etc/bind
          - /opt/bind9/cache:/var/cache/bind
          - /opt/bind9/records:/var/lib/bind
        environment:
          - TZ=Asia/Shanghai
          - BIND9_USER=bind
    ```

    启动服务 `docker-compose -p bind9 up -d`

:::

## ⚙️ 配置指南

::: steps

1. 主配置文件

    创建或修改 `/opt/bind9/config/named.conf`

    ```plaintext
    // BIND9 主配置文件
    options {
        directory "/var/lib/bind";
        pid-file "/var/run/named/named.pid";
        session-keyfile "/var/run/named/session.key";
        
        // 监听配置
        listen-on port 53 { any; };
        listen-on-v6 port 53 { none; };
        
        // 访问控制
        allow-query { any; };
        allow-recursion { any; };
        allow-query-cache { any; };
        
        // 转发器配置（外网DNS）
        forwarders { 
            114.114.114.114;
            223.5.5.5;
        };
        forward only;
        
        // DNSSEC配置
        dnssec-validation auto;
        
        // 性能调优
        max-cache-size 256M;
        max-udp-size 4096;
        
        // 日志配置
        version "DNS Server - homelab.lan";
    };

    // 区域文件包含
    include "/etc/bind/named.conf.local";
    include "/etc/bind/named.conf.options";
    ```

2. 区域配置文件

    创建`/opt/bind9/config/named.conf.local`

    ```plaintext
    // homelab.lan 正向区域
    zone "homelab.lan" {
        type master;
        file "/etc/bind/zones/db.homelab.lan";
        allow-transfer { none; };
        allow-update { none; };
    };

    // 反向解析区域（可选）
    zone "100.168.192.in-addr.arpa" {
        type master;
        file "/etc/bind/zones/db.192.168.100";
        allow-transfer { none; };
    };
    ```

3. 区域数据文件

    创建`/opt/docker-bind9/zones/db.homelab.lan`

    ```plaintext
    ; homelab.lan 区域文件
    $TTL    604800
    @       IN      SOA     ns1.homelab.lan. admin.homelab.lan. (
                                  2024103001 ; 序列号
                                      10800 ; 刷新时间 3小时
                                      3600 ; 重试时间 1小时
                                    604800 ; 过期时间 1周
                                      86400 ; 最小TTL 1天
                                      )

    ; 名称服务器记录
    @       IN      NS      ns1.homelab.lan.
    ns1     IN      A       192.168.100.1

    ; A记录定义
    @       IN      A       192.168.100.1
    ikuai   IN      A       192.168.100.1

    ; 开发工具域名
    coder   IN      A       192.168.100.12
    *.coder IN      A       192.168.100.12
    vscode  IN      A       192.168.100.13

    ; 其他服务可以在此添加
    ```

    创建反向解析文件`/opt/docker-bind9/zones/db.192.168.100`

    ```plaintext
    ; 192.168.100.0/24 反向区域文件
    $TTL    604800
    @       IN      SOA     ns1.homelab.lan. admin.homelab.lan. (
                                  2024103001
                                      10800
                                      3600
                                    604800
                                      86400
                                      )

    @       IN      NS      ns1.homelab.lan.

    ; PTR记录
    1       IN      PTR     ikuai.homelab.lan.
    12      IN      PTR     coder.homelab.lan.
    13      IN      PTR     vscode.homelab.lan.
    ```

4. 权限与验证

    设置文件权限

    ```bash
    chmod 644 /opt/docker-bind9/zones/db.*
    ```

    验证配置文件语法

    ```bash
    docker exec bind9-server named-checkconf
    docker exec bind9-server named-checkzone homelab.lan /etc/bind/zones/db.homelab.lan
    ```

:::

## 🎯 客户端配置

配置客户端使用您的DNS服务器

- **Linux**: 在`/etc/resolv.conf`中添加`nameserver 192.168.100.1`
- **Windows**: 在网络适配器设置中指定DNS服务器地址
- **路由器**: 在DHCP设置中将DNS服务器指向`192.168.100.1`

## 🔍 测试与验证

### 正向解析测试

使用以下命令测试DNS解析

    ```bash
    # 测试基础域名解析
    nslookup homelab.lan 192.168.100.1

    # 测试具体域名
    nslookup coder.homelab.lan 192.168.100.1
    nslookup test.coder.homelab.lan 192.168.100.1  # 通配符测试
    nslookup vscode.homelab.lan 192.168.100.1
    nslookup ikuai.homelab.lan 192.168.100.1

    # 使用dig命令进行详细查询
    dig @192.168.100.1 coder.homelab.lan A
    ```

### 反向解析测试

    ```bash
    nslookup 192.168.100.12 192.168.100.1
    nslookup 192.168.100.13 192.168.100.1
    ```

## 📊 监控配置

- prometheus

    创建`/opt/docker-bind9/etc/named.conf.options`启用统计通道

    ```bash
    options {        
        // 统计通道配置
        statistics-channels {
            inet 127.0.0.1 port 8053 allow { 127.0.0.1; };
        };
    };
    ```
