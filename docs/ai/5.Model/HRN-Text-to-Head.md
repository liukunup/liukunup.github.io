---
title: HRN Text-to-Head
createTime: 2026/06/18 00:00:00
permalink: /ai/model/hrn-text-to-head/
---

## 概述

阿里达摩院基于 HRN（Hierarchical Representation Network，CVPR 2023）的文本生成 3D 头部模型。输入文本描述，输出高保真 3D 头部网格（含几何与纹理）。

## HRN 核心技术

层次化表征网络，将人脸几何解耦为三部分分别建模：

| 层级 | 说明 |
|------|------|
| 低频 | 3DMM 基础形状 |
| 中频 | Deformation map（形变细节） |
| 高频 | Displacement map（位移细节，如皱纹、酒窝） |

## 使用流程

1. 文本 → Stable Diffusion 生成头像图
2. 头像图 → HRN 重建 3D 头部
3. 输出 `.obj` / `.mtl` / `.jpg`，可导入 Unity / UE

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

pipeline_ = pipeline(Tasks.face_reconstruction, model='damo/cv_HRN_text-to-head')
result = pipeline_('https://example.com/face.jpg')
```

## 资源链接

- ModelScope：[iic/cv_HRN_text-to-head](https://modelscope.cn/models/iic/cv_HRN_text-to-head)
- HRN 项目主页：[younglbw.github.io/HRN-homepage](https://younglbw.github.io/HRN-homepage/)
- 论文：[CVPR 2023] HRN: A Hierarchical Representation Network for Accurate and Detailed Face Reconstruction
