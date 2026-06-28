---
title: 读光-文字识别-通用
createTime: 2026/06/18 00:00:00
permalink: /ai/model/ocr-damo-general/
---

## 概述

阿里达摩院读光（Duguang）OCR 系列的通用文本行识别模型。基于 ConvNeXt-Tiny + ConvTransformer + CTC 架构，适用于各类通用场景下的印刷体和部分手写体文字识别（文档、名片、广告牌等）。

## 模型信息

| 属性 | 值 |
|------|-----|
| 模型ID | `iic/cv_convnextTiny_ocr-recognition-general_damo` |
| 架构 | ConvNeXt-Tiny + ViTSTR (ConvTransformer) + CTC |
| 参数量 | ~19.2M |
| 模型大小 | ~77MB |
| 输入尺寸 | `[B, 3, H, W]`（内部转灰度） |
| 分块机制 | 宽度 > 300px 自动切块并行处理 |
| 训练数据 | MTWI + 收集数据 ~6M 张 |
| 许可证 | Apache 2.0 |

## 快速使用

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

ocr_recognition = pipeline(
    Tasks.ocr_recognition,
    model='damo/cv_convnextTiny_ocr-recognition-general_damo',
)

# 使用图片 URL
img_url = 'http://duguang-labelling.oss-cn-shanghai.aliyuncs.com/mass_img_tmp_20220922/ocr_recognition.jpg'
result = ocr_recognition(img_url)
print(result['text'])
```

```python
# 配合文本检测模型实现端到端 OCR
ocr_detection = pipeline(
    Tasks.ocr_detection,
    model='damo/cv_resnet18_ocr-detection-line-level_damo',
)
det_result = ocr_detection(image_full)
for i in range(det_result['polygons'].shape[0]):
    crop = crop_image(image_full, det_result['polygons'][i])
    result = ocr_recognition(crop)
    print(f"text: {result['text']}")
```

## 资源链接

- ModelScope：[iic/cv_convnextTiny_ocr-recognition-general_damo](https://modelscope.cn/models/iic/cv_convnextTiny_ocr-recognition-general_damo)
- HuggingFace：[damo/cv_convnextTiny_ocr-recognition-general_damo](https://huggingface.co/damo/cv_convnextTiny_ocr-recognition-general_damo)
