---
title: MySQL
createTime: 2025/10/10 00:00:00
permalink: /homelab/deploy/mysql/
---

## 🚀 部署指南

MySQL 是最流行的开源关系型数据库管理系统之一。

### 准备工作

创建用于存储数据库数据的持久化目录：

```bash
mkdir -p /share/Container/mysql/data
mkdir -p /share/Container/mysql/conf.d
```

### 启动服务

::: tabs

@tab:active Docker Compose

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: my-secret-pw
      # 可选：初始化创建一个数据库和用户
      # MYSQL_DATABASE: mydatabase
      # MYSQL_USER: myuser
      # MYSQL_PASSWORD: mypassword
    ports:
      - "3306:3306"
    volumes:
      - /share/Container/mysql/data:/var/lib/mysql
      - /share/Container/mysql/conf.d:/etc/mysql/conf.d
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
```

@tab Docker CLI

```bash
docker run -d \
  --name mysql \
  --restart always \
  -p 3306:3306 \
  -v /share/Container/mysql/data:/var/lib/mysql \
  -v /share/Container/mysql/conf.d:/etc/mysql/conf.d \
  -e MYSQL_ROOT_PASSWORD=my-secret-pw \
  mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci
```

:::

## 📝 使用说明

### 常用命令

1. **进入容器**

    ```bash
    docker exec -it mysql bash
    ```

2. **登录数据库**

    ```bash
    mysql -u root -p
    # 输入密码: my-secret-pw
    ```

3. **备份数据库**

    ```bash
    docker exec mysql mysqldump -u root -pmy-secret-pw --all-databases > all_databases.sql
    ```

### 配置文件

如果需要修改 MySQL 配置，可以在 `/share/Container/mysql/conf.d` 目录下创建 `.cnf` 文件。例如创建 `custom.cnf`:

```ini
[mysqld]
max_connections=1000
default-time-zone='+08:00'
```

重启容器生效：

```bash
docker restart mysql
```

## 🔗 参考链接

*   [MySQL Docker Hub](https://hub.docker.com/_/mysql)
*   [MySQL 官方文档](https://dev.mysql.com/doc/)
