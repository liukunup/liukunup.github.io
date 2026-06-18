---
title: Real-ESRGAN
createTime: 2026/06/18 00:00:00
permalink: /ai/model/realesrgan/
---

## 概述

Real-ESRGAN 是腾讯 ARC Lab 开源的通用图像/视频超分辨率算法（ICCVW 2021），从 ESRGAN 扩展而来，采用纯合成数据训练的高阶退化建模，能有效处理真实世界退化。支持普通图像、动漫图像、动漫视频等多种场景。GitHub 36K+ Stars。

## 可用模型

| 模型 | 说明 |
|------|------|
| RealESRGAN_x4plus | 默认 4x 模型，适合照片/自然图像 |
| RealESRGAN_x4plus_anime_6B | 动漫图像优化，模型小巧 |
| realesr-animevideov3 | 动漫视频专用 |
| realesr-general-x4v3 | 通用 Tiny 模型，支持 -dn 降噪 |
| RealESRGAN_x2plus | 2x 放大 |
| RealESRNet_x4plus | 4x 替代模型 |

## 快速使用

```bash
pip install realesrgan
```

```bash
# 通用图像 4x 放大
wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth -P weights
python inference_realesrgan.py -i inputs -o outputs -n RealESRGAN_x4plus

# 动漫图像
python inference_realesrgan.py -i inputs -o outputs -n RealESRGAN_x4plus_anime_6B

# 人脸增强（集成 GFPGAN）
python inference_realesrgan.py -i inputs -o outputs --face_enhance
```

### NCNN 版本（跨平台 GPU）

```bash
# Real-ESRGAN-ncnn-vulkan 无需 Python 环境
./realesrgan-ncnn-vulkan -i input.jpg -o output.png -n realesrgan-x4plus
```

## 资源链接

- GitHub：[github.com/xinntao/Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN)
- NCNN：[github.com/xinntao/Real-ESRGAN-ncnn-vulkan](https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan)
- 论文：[Real-ESRGAN: Training Real-World Blind Super-Resolution with Pure Synthetic Data](https://arxiv.org/abs/2107.10833)
- PyPI：`pip install realesrgan`
- 许可证：BSD-3-Clause
