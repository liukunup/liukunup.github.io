---
title: minio mc mirror 数据同步
createTime: 2026/06/13 10:30:00
permalink: /blog/minio-mc-mirror/
---

## 背景

在分布式存储系统中，经常需要将数据从 MinIO 同步到自研的 RustFS 存储系统。本文介绍如何利用 `mc mirror` 命令实现高效的数据同步。

## 前提条件

1. 安装 MinIO Client (`mc`)

```shell
# 下载安装 mc
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/
```

2. 配置 MinIO 访问别名

```shell
mc alias set minio https://minio.example.com ACCESS_KEY SECRET_KEY
```

## mc mirror 同步命令

### 基本用法

```shell
# 将 MinIO bucket 同步到本地目录
mc mirror minio/mybucket /local/rustfs-storage/

# 带删除同步（目标端有而源端没有的文件会被删除）
mc mirror --overwrite --remove minio/mybucket /local/rustfs-storage/
```

### 常用参数

| 参数 | 说明 |
|------|------|
| `--overwrite` | 覆盖已存在的文件 |
| `--remove` | 同步删除操作 |
| `--watch` | 实时监听并同步变化 |
| `--threads` | 并发线程数 |
| `--storage-class` | 指定存储类别 |

### 实时同步

```shell
# 监听模式，持续同步增量变化
mc mirror --watch minio/mybucket /local/rustfs-storage/
```

## 与 RustFS 对接

### 数据校验

同步完成后建议进行数据校验：

```shell
# 对比源端和目标端的数据完整性
md5sum /local/rustfs-storage/* > local_md5.txt
mc cat minio/mybucket/* | md5sum > minio_md5.txt
diff local_md5.txt minio_md5.txt
```

### 增量同步策略

配合定时任务实现增量同步：

```shell
# crontab 示例，每小时同步一次
0 * * * * mc mirror --overwrite minio/mybucket /local/rustfs-storage/
```

## 注意事项

1. **网络带宽**：大数据量同步考虑在离线时段进行
2. **磁盘空间**：确保目标端有足够存储空间
3. **权限控制**：合理设置 ACCESS_KEY 和 SECRET_KEY 权限范围
4. **监控告警**：建议对接监控系统监控同步任务状态

## 参考链接

- [MinIO Client 官方文档](https://min.io/docs/minio/linux/reference/minio-mc.html)
- [mc mirror 命令详解](https://min.io/docs/minio/linux/reference/minio-mc/mc-mirror.html)