---
title: BSHM 人像抠图
createTime: 2026/06/18 00:00:00
permalink: /ai/model/unet-portrait-matting/
---

## 概述

阿里达摩院 BSHM 人像抠图模型，自动识别人像并分离前景背景。无需 Trimap，端到端输出四通道 RGBA 结果。

## 架构

UNet 双子网络架构：

| 子网络 | 说明 |
|--------|------|
| 粗分割网络 | 预测人像语义分割 mask |
| 精细抠图网络 | 基于原图 + 粗 mask 预测精细 Alpha 通道 |

## 快速使用

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys
import cv2

matting = pipeline(Tasks.portrait_matting, model='damo/cv_unet_image-matting')
result = matting('input.jpg')
cv2.imwrite('output.png', result[OutputKeys.OUTPUT_IMG])
```

## 资源链接

- ModelScope：[iic/cv_unet_image-matting](https://modelscope.cn/models/iic/cv_unet_image-matting)
