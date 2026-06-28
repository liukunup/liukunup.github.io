---
title: GFPGAN
createTime: 2026/06/18 00:00:00
permalink: /ai/model/gfpgan/
---

## 概述

GFPGAN（Generative Facial Prior GAN）是腾讯 ARC Lab 开源的盲人脸修复算法，CVPR 2021 论文。利用预训练 StyleGAN2 中丰富的先验知识，在单次前向传播中同时修复面部细节并增强色彩，无需像 GAN Inversion 方法那样在推理时进行昂贵的逐图像优化。支持背景增强（集成 Real-ESRGAN）。GitHub 37K+ Stars。

## 模型版本

| 版本 | 模型文件 | 说明 |
|------|----------|------|
| V1.4 | GFPGANv1.4.pth | 更多细节，更好身份保持 |
| V1.3 | GFPGANv1.3.pth | 更自然效果，低/高质量输入均表现更好 |
| V1.2 | GFPGANCleanv1-NoCE-C2.pth | 无着色，无需 CUDA 扩展 |
| V1 | GFPGANv1.pth | 论文原始模型，带着色 |

## 快速使用

```bash
pip install gfpgan
```

```python
from gfpgan import GFPGANer

restorer = GFPGANer(
    model_path="experiments/pretrained_models/GFPGANv1.4.pth",
    upscale=2,
)

cropped_faces, restored_faces, restored_img = restorer.enhance(
    img,
    has_aligned=False,
    only_center_face=True,
    paste_back=True,
)
```

### 命令行

```bash
# 下载模型
wget https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth \
  -P experiments/pretrained_models

# 推理（单人脸）
python inference_gfpgan.py -i inputs/whole_imgs -o results -v 1.4

# 推理（已对齐人脸）
python inference_gfpgan.py -i inputs/cropped_faces -o results -v 1.4 --aligned
```

## 资源链接

- GitHub：[github.com/TencentARC/GFPGAN](https://github.com/TencentARC/GFPGAN)
- 论文：[GFP-GAN: Towards Real-World Blind Face Restoration with Generative Facial Prior](https://arxiv.org/abs/2101.04061)
- HuggingFace：[TencentARC/GFPGANv1](https://huggingface.co/TencentARC/GFPGANv1)
- Replicate：[tencentarc/gfpgan](https://replicate.com/tencentarc/gfpgan)
- PyPI：`pip install gfpgan`
- 许可证：Apache-2.0
