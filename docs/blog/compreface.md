---
title: CompreFace
createTime: 2026/06/18 00:00:00
permalink: /blog/r8m2k4p7/
---

https://github.com/exadel-inc/CompreFace

## 概述

Exadel CompreFace 是免费开源的人脸识别服务，提供 REST API 实现人脸识别、人脸验证、人脸检测、关键点检测、口罩检测、头部姿态检测、年龄和性别识别。基于 FaceNet + InsightFace，Docker 一键部署，支持 CPU / GPU。

## 核心特性

- **REST API**：人脸识别、验证、检测，开箱即用
- **插件系统**：年龄、性别、关键点、口罩、头部姿态等
- **Docker 部署**：`docker-compose up` 一键启动
- **Web UI**：可视化管理人脸集合和服务
- **高精度**：LFW 数据集 99.83% 准确率

## 服务类型

| 服务 | 说明 |
|------|------|
| Face Recognition | 人脸识别，先注册已知人脸再识别 |
| Face Detection | 人脸检测，返回边界框 |
| Face Verification | 验证两张人脸是否同一人 |

## 插件

| 插件 | 说明 |
|------|------|
| age | 年龄范围估计 |
| gender | 性别识别 |
| landmarks | 5 关键点（眼、鼻、嘴） |
| mask | 口罩检测（无/不正确/正确佩戴） |
| pose | 头部姿态（pitch/roll/yaw） |
| calculator | 人脸 embedding 提取 |

## 快速开始

```bash
git clone https://github.com/exadel-inc/CompreFace.git
cd CompreFace
docker-compose up -d
```

访问 `http://localhost:8000` 进入 Web UI，创建 API key 后调用 REST API：

```bash
# 注册人脸
curl -X POST "http://localhost:8000/api/v1/recognition/faces/?subject=john" \
  -H "x-api-key: <API_KEY>" \
  -F "file=@john.jpg"

# 识别
curl -X POST "http://localhost:8000/api/v1/recognition/recognize" \
  -H "x-api-key: <API_KEY>" \
  -F "file=@unknown.jpg"
```

## 资源链接

- GitHub：[exadel-inc/CompreFace](https://github.com/exadel-inc/CompreFace)
- 官网：[exadel.com/accelerator-showcase/compreface](https://exadel.com/accelerator-showcase/compreface/)
- API 文档：[Postman](https://documenter.getpostman.com/view/17578263/UUxzAnde)
- 许可证：Apache 2.0
