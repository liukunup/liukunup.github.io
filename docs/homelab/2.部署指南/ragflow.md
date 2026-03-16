---
title: RAGFlow 部署指南
createTime: 2026/03/14 22:47:36
permalink: /homelab/3l9bsb4s/
---

# RAGFlow 部署指南

> RAGFlow 是一款基于深层文档理解的开源 RAG（检索增强生成）引擎。结合大语言模型 (LLM)，它能够提供真诚的问答能力，并从各种复杂格式的数据中提供有据可查的引用。

## 1. 前提条件

| 项目 | 要求 |
|------|------|
| CPU | ≥ 4 核 (x86) |
| 内存 | ≥ 16 GB |
| 磁盘 | ≥ 50 GB |
| Docker | ≥ 24.0.0 |
| Docker Compose | ≥ v2.26.1 |
| gVisor | 仅当使用代码执行器（沙箱）功能时需要 |

## 2. 系统配置

### 2.1 设置 vm.max_map_count

```bash
# 检查当前值
sysctl vm.max_map_count

# 临时设置（重启后失效）
sudo sysctl -w vm.max_map_count=262144

# 永久设置
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 3. 安装部署

### 3.1 克隆代码并启动

```bash
# 克隆仓库
git clone https://github.com/infiniflow/ragflow.git
cd ragflow/docker

# 切换到稳定版本
git checkout -f v0.24.0

# 启动服务（CPU 版本）
docker compose -f docker-compose.yml up -d
```

### 3.2 镜像说明

| 镜像标签 | 大小 | 说明 |
|----------|------|------|
| v0.24.0 | ≈2 GB (压缩) | 稳定发行版 |
| nightly | ≈2 GB (压缩) | 不稳定的每日构建版 |

> 注意：Docker 镜像解压后约 7 GB

### 3.3 验证启动

```bash
# 查看日志
docker logs -f docker-ragflow-cpu-1
```

成功启动会看到：
```
____ ___ ______ ______ __   / __ \   / | / ____// ____// /____ _ __   / /_/ // /| | / / __ / /_  / // __ \ | | /| / / / _, _// ___ |/ /_/ // __/ / // /_/ / |/ |/ / /_/ |_|/_/  |_|\____//_/  |_|\____/ |__/|__/ 
* Running on all addresses (0.0.0.0)
```

### 3.4 访问服务

浏览器访问：`http://IP_OF_YOUR_MACHINE`（默认端口 80）

> ⚠️ 如果未完全启动就访问，会提示 `network anomaly` 错误

## 4. 配置 LLM

1. 点击右上角 **Logo** > **模型提供商**
2. 选择需要的 LLM 并填写 API Key
3. 点击 **系统模型设置** 选择默认模型：
   - 聊天模型
   - 嵌入模型
   - 多模态模型

## 5. 创建数据集

1. **创建数据集**：点击 **数据集** > **创建数据集**
2. **配置**：选择嵌入模型和切片模板
3. **上传文件**：**+ 添加文件** > **本地文件**
4. **解析**：点击播放按钮开始解析

### 支持的文件格式

- 文档：PDF、DOC、DOCX、TXT、MD、MDX
- 表格：CSV、XLSX、XLS
- 图片：JPEG、JPG、PNG、TIF、GIF
- 演示：PPT、PPTX

## 6. 创建聊天

1. 点击 **聊天** > **创建助理**
2. 配置聊天助手：
   - 命名助手
   - 关联数据集
   - 设置空回复（可选）
   - 更新提示词
   - 选择聊天模型
3. 开始对话

## 7. 常见问题

### 文件解析卡住

- 卡在 1% 以下：参考 FAQ
- 接近完成时卡住：参考 FAQ

### 无法连接 ES 集群

检查 `vm.max_map_count` 是否设置正确
