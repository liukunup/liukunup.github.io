---
title: MinIO 或 RustFS 如何进行数据同步&迁移
tags:
  - S3
  - MinIO
  - RustFS
createTime: 2026/06/13 10:30:00
permalink: /blog/minio-mc-mirror/
---

## 前提条件

1. 安装 MinIO Client `mc`

::: tabs

@tab:active Linux

```shell
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/
```

@tab macOS

```shell
brew install minio/stable/mc
```

:::

2. 配置访问别名

```shell
mc alias list
mc alias set minio https://minio.example.com ACCESS_KEY SECRET_KEY
```

## 同步命令

### 基本用法

```shell
# 同步到本地路径
mc mirror minio/mybucket /local/path/
# 实例间数据同步
mc mirror minio/ rustfs/
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
mc mirror --watch minio/mybucket /local/path/
```

## 注意事项

1. **网络带宽**：大数据量同步考虑在离线时段进行
2. **磁盘空间**：确保目标端有足够存储空间
3. **权限控制**：合理设置 ACCESS_KEY 和 SECRET_KEY 权限范围
4. **监控告警**：建议对接监控系统监控同步任务状态

## 参考链接

- [MinIO Client 官方文档](https://min.io/docs/minio/linux/reference/minio-mc.html)
- [mc mirror 命令详解](https://min.io/docs/minio/linux/reference/minio-mc/mc-mirror.html)