---
title: 读光-文字识别-手写
createTime: 2026/06/18 00:00:00
permalink: /ai/model/ocr-damo-handwritten/
---

## 概述

阿里达摩院读光（Duguang）OCR 系列的手写文本行识别模型。基于 ConvNeXt-Tiny + ConvTransformer + CTC 架构，专用于单行中英文手写文本识别。

## 模型信息

| 属性 | 值 |
|------|-----|
| 模型ID | `iic/cv_convnextTiny_ocr-recognition-handwritten_damo` |
| 架构 | ConvNeXt-Tiny + ConvTransformer + CTC |
| 领域 | CV |
| 任务 | ocr-recognition |
| 语言 | 中文、英文 |
| 许可证 | Apache 2.0 |

## 快速使用

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

ocr_recognition = pipeline(
    Tasks.ocr_recognition,
    model='damo/cv_convnextTiny_ocr-recognition-handwritten_damo',
)

# 图片 URL
img_url = 'http://example.com/handwritten.jpg'
result = ocr_recognition(img_url)
print(result['text'])
```

输入图片应为包含单行手写文字的图片，输出对应文本字符串。

## 相关模型

达摩院读光 OCR 同系列行识别模型（均为 ConvNeXt-Tiny 架构）：

| 场景 | 模型ID |
|------|--------|
| 通用 | `damo/cv_convnextTiny_ocr-recognition-general_damo` |
| 文档 | `damo/cv_convnextTiny_ocr-recognition-document_damo` |
| 自然场景 | `damo/cv_convnextTiny_ocr-recognition-scene_damo` |
| 车牌 | `damo/cv_convnextTiny_ocr-recognition-licenseplate_damo` |

## 资源链接

- ModelScope：[iic/cv_convnextTiny_ocr-recognition-handwritten_damo](https://modelscope.cn/models/iic/cv_convnextTiny_ocr-recognition-handwritten_damo)
