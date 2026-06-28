---
title: Deep-Live-Cam
createTime: 2026/06/18 00:00:00
permalink: /ai/model/deep-live-cam/
---

## 概述

Deep-Live-Cam 是 hacksider 开源的高性能实时换脸工具，仅需一张源照片即可在直播、视频通话、录播中实现实时换脸。基于预训练推理（无需训练），支持图像/视频/摄像头三种模式，集成 OBS 虚拟摄像头可直接推流。最新版本 v2.7，GitHub 94K+ Stars。

## 核心功能

| 功能 | 说明 |
|------|------|
| 单张照片换脸 | 无需训练，一次推理即可 |
| 实时摄像头换脸 | 支持 OBS 虚拟摄像头推流 |
| 视频换脸 | 支持批量视频处理 |
| 面部增强 | 内置 GPEN 256/512 增强模型 |
| 口型/下巴/眼部遮罩 | 精细化融合控制 |
| 帧插值 (RIFE) | 平滑帧率过渡 |
| LUT 调色 | 一键色彩匹配 |

## 支持模型引擎

| 模型 | 说明 |
|------|------|
| Inswapper | 默认换脸模型（128x128） |
| HyperSwap | 高精度换脸（256x256，200% 提升） |
| ReSwapper | 新一代换脸引擎 |
| Decart Live | 云端实时扩散换脸 |
| FLUX Live | 实时提示词面部编辑（30fps，需 RTX 5090/6000） |

## 快速开始

```bash
git clone https://github.com/hacksider/Deep-Live-Cam.git
cd Deep-Live-Cam
python run.py
```

首次运行自动下载模型（~300MB）。

## 预构建版本

| 平台 | 后端 | 说明 |
|------|------|------|
| Windows | DirectML | 任何 GPU，即下即用 |
| Windows | CUDA | NVIDIA GPU，最佳性能 |
| Windows | OpenVINO | Intel GPU 优化 |
| macOS | CoreML | Apple Silicon 原生 |

## 资源链接

- GitHub：[github.com/hacksider/Deep-Live-Cam](https://github.com/hacksider/Deep-Live-Cam)
- 官网：[deeplivecam.net](https://deeplivecam.net)
- 许可证：AGPL-3.0
