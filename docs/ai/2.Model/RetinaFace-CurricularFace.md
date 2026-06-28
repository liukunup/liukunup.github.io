---
title: RetinaFace + CurricularFace
createTime: 2026/06/18 00:00:00
permalink: /ai/model/retinaface-curricularface/
---

## 概述

bubbliiiing 整合的人脸识别模型，结合 RetinaFace（CVPR 2020，人脸检测+关键点定位）和 CurricularFace（课程学习人脸识别），实现端到端人脸检测、对齐、特征提取与身份比对。

## 流程

1. RetinaFace 检测人脸 + 5 关键点（双眼、鼻尖、嘴角）
2. 仿射变换对齐标准正脸姿态
3. CurricularFace 提取 512 维特征向量
4. 余弦相似度计算（阈值 > 0.4 判定同一人）

## 快速使用

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

pipeline_ = pipeline(
    Tasks.face_recognition,
    model='bubbliiiing/cv_retinafce_recognition',
)
result = pipeline_('face.jpg')
```

```bash
python inference_face.py --input1 photo1.jpg --input2 photo2.jpg -t 0.4
```

## 资源链接

- ModelScope：[bubbliiiing/cv_retinafce_recognition](https://modelscope.cn/models/bubbliiiing/cv_retinafce_recognition)
- GitHub：[bubbliiiing/retinaface-pytorch](https://github.com/bubbliiiing/retinaface-pytorch)
- 论文：RetinaFace (CVPR 2020) | CurricularFace
