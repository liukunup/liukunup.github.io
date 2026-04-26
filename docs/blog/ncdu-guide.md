---
title: 使用 ncdu 分析和清理磁盘空间
createTime: 2026/04/26 22:59:02
permalink: /blog/ncdu-guide/
---

ncdu (NCurses Disk Usage) 是一个用于分析磁盘空间的命令行工具,提供交互式界面帮你找出占用空间最多的文件和目录。

## 安装

```sh
# Ubuntu/Debian
sudo apt install ncdu -y

# CentOS/RHEL
sudo yum install ncdu -y

# macOS
brew install ncdu
```

## 基本使用

```sh
# 分析当前目录
ncdu

# 分析根目录 (需要 sudo 查看系统目录)
sudo ncdu /

# 分析指定目录
ncdu /home/user

# 扫描时排除某些目录
ncdu --exclude=/proc --exclude=/sys /
```

## 交互操作

| 按键 | 功能 |
|------|------|
| `↑/↓` | 导航目录 |
| `→/Enter` | 进入子目录 |
| `←` | 返回上级目录 |
| `n` | 按名称排序 |
| `s` | 按大小排序 |
| `d` | 删除选中文件/目录 |
| `t` | 按修改时间排序 |
| `i` | 显示详细信息 |
| `c` | 显示文件数量 |

## 常用场景

### 1. 清理日志文件

```sh
# 分析 /var 目录
sudo ncdu /var
```

常见大文件位置:
- `/var/log/` - 系统日志
- `/var/cache/` - 应用缓存
- `/var/tmp/` - 临时文件

### 2. 清理 Docker

```sh
# 查看 Docker 占用的空间
sudo ncdu /var/lib/docker
```

清理命令:
```sh
# 清理无用镜像
docker system prune -a

# 清理悬空镜像
docker image prune

# 清理构建缓存
docker builder prune
```

## 导出报告

```sh
# 扫描并导出 JSON
ncdu -o scan.json /

# 导出时忽略特定目录
ncdu -o scan.json --exclude=/proc --exclude=/sys /
```
