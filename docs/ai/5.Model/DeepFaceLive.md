---
title: DeepFaceLive
createTime: 2026/06/18 00:00:00
permalink: /ai/model/deepfacelive/
---

## 概述

DeepFaceLive 是 iperov 开源的实时人脸替换工具，用于 PC 直播或视频通话场景。基于 DeepFaceLab 训练的 DFM 模型，支持使用预训练模型或自行训练的人脸模型进行实时换脸。提供 Face Swap（DFM 模型）、Face Swap（Insight 单照片）、Face Animator（面部动画驱动）三种模式。

## 核心功能

| 功能 | 说明 |
|------|------|
| Face Swap (DFM) | 使用训练好的 DFM 模型进行高质量换脸 |
| Face Swap (Insight) | 仅需单张照片即可换脸 |
| Face Animator | 用摄像头或视频驱动静态面部图片 |

## 系统要求

- Windows 10 x64（官方构建）
- GPU：NVIDIA（GT730+）、AMD、Intel（DirectX12 构建）
- Linux：支持 Docker 构建

## 使用方式

Windows 下直接下载零依赖便携包（自解压文件夹），安装显卡驱动即可运行。

### 模型训练

使用 [DeepFaceLab](https://github.com/iperov/DeepFaceLab) 训练自定义 DFM 模型：

```text
1. 收集目标人脸数据集（10000+ 图像）
2. 在 DeepFaceLab 中训练模型（1-2 百万迭代）
3. 导出为 .dfm 格式
4. 放入 DeepFaceLive models 目录
```

## 内置预训练模型

DeepFaceLive 内置 25+ 预训练模型，包括 Keanu Reeves、Jackie Chan、Mr. Bean、Joker 等角色模型。

## 资源链接

- GitHub：[github.com/iperov/DeepFaceLive](https://github.com/iperov/DeepFaceLive)（已归档只读）
- DeepFaceLab：[github.com/iperov/DeepFaceLab](https://github.com/iperov/DeepFaceLab)
- 许可证：GPL-3.0
