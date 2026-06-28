---
title: HYPIR
createTime: 2026/06/18 00:00:00
permalink: /ai/model/hypir/
---

## 概述

HYPIR（Harnessing Diffusion-Yielded Score Priors for Image Restoration）是 XPixel Group（中科院深圳先进院）开源的图像修复算法，SIGGRAPH Asia 2025 论文。利用预训练扩散模型初始化修复模型 + 对抗训练微调，不依赖扩散损失、迭代采样或额外 Adapter，单次前向传播即可。支持文本引导修复、纹理丰富度调节、生成-保真度权衡。GitHub 1K+ Stars。

## 架构特点

- 基于 Stable Diffusion 2.1 初始化 + LoRA 微调
- 支持分辨率 2K+
- 可选 GPT 提示词生成
- Patch 分块处理（可配置 patch size / stride）

## 快速使用

```bash
git clone https://github.com/XPixelGroup/HYPIR.git
cd HYPIR
conda create -n hypir python=3.10 -y
conda activate hypir
pip install -r requirements.txt
```

```bash
python app.py --config configs/sd2_gradio.yaml --local --device cuda
```

## 资源链接

- GitHub：[github.com/XPixelGroup/HYPIR](https://github.com/XPixelGroup/HYPIR)
- 官网：[hypir.xpixel.group](https://hypir.xpixel.group/)
- 论文：[Harnessing Diffusion-Yielded Score Priors for Image Restoration](https://arxiv.org/abs/2507.20590)
- 许可证：非商业使用 only
