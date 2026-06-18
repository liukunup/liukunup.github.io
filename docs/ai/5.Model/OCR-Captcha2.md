---
title: 验证码识别模型 2.0
createTime: 2026/06/18 00:00:00
permalink: /ai/model/ocr-captcha2/
---

## 概述

基于阿里达摩院读光 OCR 微调的验证码（CAPTCHA）识别模型。支持纯数字、数字+字母、纯字母（大小写）验证码，覆盖 4/5/6 位长度。

提供 small / big 两个版本：

| 版本 | 训练数据 | 图片量 | 轮次 | 精度 |
|------|---------|--------|------|------|
| Small | 700MB | ~8.4 万张 | 27 | ~100% |
| Big | 11GB | ~135 万张 | 1 | ~93.95% |

## 快速使用

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

# Small 版（推荐）
ocr_small = pipeline(
    Tasks.ocr_recognition,
    model='damo/cv_convnextTiny_ocr-recognition-general_damo',
    model_revision='v1.0.0',
)

# 识别验证码图片
result = ocr_small('captcha.png')
print(result['text'])
```

## 资源链接

- ModelScope：[xiaolv/ocr2](https://modelscope.cn/models/xiaolv/ocr2)
- HuggingFace：[xiaolv/ocr-captcha](https://huggingface.co/xiaolv/ocr-captcha)
- 许可证：Apache 2.0
