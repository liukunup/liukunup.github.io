---
title: MinIO
createTime: 2025/05/04 18:12:00
permalink: /homelab/deploy/minio/
---

## 🚀 部署指南

MinIO 是一个高性能的兼容 S3 的对象存储系统，适合存储非结构化数据，如照片、视频、日志文件、备份和容器/虚拟机镜像等。

### 准备工作

创建用于存储 MinIO 数据、证书和配置的持久化目录：

```bash
mkdir -p /share/Container/minio/data
mkdir -p /share/Container/minio/certs
```

创建配置文件：

```bash
# 创建配置文件目录
mkdir -p /share/Container/minio

# 创建配置文件
cat > /share/Container/minio/config.env << 'EOF'
# MinIO 根用户和密码（请修改为强密码）
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
EOF
```

::: warning

**安全提示**：在生产环境中，请务必修改默认的用户名和密码。

:::

### 启动服务

::: tabs

@tab:active Docker Compose

```yaml
services:
  minio:
    image: minio/minio:RELEASE.2025-04-08T15-41-24Z
    container_name: minio
    restart: unless-stopped
    environment:
      MINIO_CONFIG_ENV_FILE: /etc/config.env
    ports:
      - "9000:9000"   # API 端口
      - "9001:9001"   # Web 控制台端口
      - "8021:8021"   # FTP 端口
      - "30000-40000:30000-40000"  # FTP 被动模式端口范围
    volumes:
      - /share/Container/minio/data:/mnt/data
      - /share/Container/minio/certs:/opt/minio/certs
      - /share/Container/minio/config.env:/etc/config.env
    command: server \
      --address=":9000" \
      --console-address=":9001" \
      --ftp="address=:8021" \
      --ftp="passive-port-range=30000-40000" \
      --certs-dir="/opt/minio/certs"
```

@tab Docker CLI

```bash
docker run -d \
    -p 9000:9000 \
    -p 9001:9001 \
    -p 8021:8021 \
    -p 30000-40000:30000-40000 \
    -v /share/Container/minio/data:/mnt/data \
    -v /share/Container/minio/certs:/opt/minio/certs \
    -v /share/Container/minio/config.env:/etc/config.env \
    -e MINIO_CONFIG_ENV_FILE=/etc/config.env \
    --restart=unless-stopped \
    --name=minio \
    minio/minio:RELEASE.2025-04-08T15-41-24Z \
    server \
    --address=":9000" \
    --console-address=":9001" \
    --ftp="address=:8021" \
    --ftp="passive-port-range=30000-40000" \
    --certs-dir="/opt/minio/certs"
```

:::

### HTTPS/TLS 配置（可选）

如果需要启用 HTTPS，需要将证书文件放到 `/share/Container/minio/certs` 目录：

```bash
# 证书目录结构
/share/Container/minio/certs/
├── public.crt  # 证书文件
├── private.key # 私钥文件
```

## 📝 使用说明

### 访问服务

- **Web 控制台**: `http://<your-ip>:9001`
  - 默认用户名: `minioadmin`
  - 默认密码: `minioadmin`
- **API 端点**: `http://<your-ip>:9000`
- **FTP**: `ftp://<your-ip>:8021`

### 常用命令

1. **进入容器**

    ```bash
    docker exec -it minio sh
    ```

2. **查看日志**

    ```bash
    docker logs -f minio
    ```

3. **重启服务**

    ```bash
    docker restart minio
    ```

4. **停止服务**

    ```bash
    docker stop minio
    ```

### 创建 Bucket 和用户

通过 Web 控制台操作：

1. 登录控制台 `http://<your-ip>:9001`
2. 创建 Bucket：点击左侧 "Buckets" → "Create Bucket" → 输入名称 → 创建
3. 创建用户：点击左侧 "Identity" → "Users" → "Create User" → 设置权限
4. 设置访问策略：在 Bucket 的 "Access Policy" 中可以设置为 `public` 或 `private`

### 使用 MinIO Client (mc)

安装 MinIO 客户端：

```bash
# Linux/macOS
wget https://dl.min.io/client/mc/release/linux-amd64/mc -O /usr/local/bin/mc
chmod +x /usr/local/bin/mc

# macOS (Homebrew)
brew install minio/stable/mc
```

配置客户端连接：

```bash
# 添加服务器别名
mc alias set myminio http://<your-ip>:9000 minioadmin minioadmin

# 测试连接
mc admin info myminio

# 列出所有 bucket
mc ls myminio

# 创建 bucket
mc mb myminio/mybucket

# 上传文件
mc cp /path/to/file.txt myminio/mybucket/

# 下载文件
mc cp myminio/mybucket/file.txt /local/path/
```

## 🔗 参考链接

*   [MinIO 官方文档](https://min.io/docs/minio/linux/index.html)
*   [MinIO Docker Hub](https://hub.docker.com/r/minio/minio)
*   [MinIO Client 文档](https://min.io/docs/minio/linux/reference/minio-mc.html)
