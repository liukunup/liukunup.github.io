---
title: InsightFace
createTime: 2026/06/18 00:00:00
permalink: /blog/t9s4k2m1/
---

https://github.com/deepinsight/insightface

## 概述

InsightFace 是开源 2D&3D 深度人脸分析工具箱（29K+ Stars），基于 PyTorch / MXNet / ONNX，提供人脸检测、识别、对齐、属性分析、人脸交换等全栈能力。核心算法 ArcFace（CVPR 2019）为学术界和工业界广泛使用。

## 核心能力

| 模块 | 算法 | 说明 |
|------|------|------|
| 人脸识别 | ArcFace, SubCenter ArcFace, Partial FC, VPL | CVPR 2019 / ECCV 2020 / CVPR 2022 |
| 人脸检测 | RetinaFace, SCRFD | CVPR 2020 / Arxiv 2021 |
| 人脸对齐 | SDUNets, SimpleRegression | 2D 106 点 / 3D 68 点 |
| 属性分析 | Gender & Age | 基于 CelebA 训练 |
| 人脸交换 | Picsi.AI | Discord Bot 集成 |

## Python 快速使用

```python
import insightface
from insightface.app import FaceAnalysis

app = FaceAnalysis(name='buffalo_l')
app.prepare(ctx_id=0, det_size=(640, 640))

faces = app.get('image.jpg')
for face in faces:
    print(face.embedding.shape)   # 512-dim feature
    print(face.gender, face.age)  # attributes
    print(face.landmark_2d_106)   # landmarks
```

## Model Zoo

| 包名 | 检测模型 | 识别模型 | 大小 |
|------|---------|---------|------|
| antelopev2 | RetinaFace-10GF | ResNet100@Glint360K | 407MB |
| buffalo_l | RetinaFace-10GF | ResNet50@WebFace600K | 326MB |
| buffalo_m | RetinaFace-2.5GF | ResNet50@WebFace600K | 313MB |
| buffalo_s | RetinaFace-500MF | MBF@WebFace600K | 159MB |

## GUI 桌面应用

InsightFace Evaluation Studio，跨平台桌面 GUI（PySide6），支持：

- 1:1 人脸比对 / 1:N 人脸搜索
- 相册管理与人脸聚类（DBSCAN）
- 企业级评估报告（PDF 导出）
- 基础人脸交换

```bash
pip install insightface[gui]
insightface-gui
```

## 资源链接

- GitHub：[deepinsight/insightface](https://github.com/deepinsight/insightface)
- 官网：[insightface.ai](https://insightface.ai/)
- 许可证：MIT（代码）/ 非商业研究（预训练模型）
