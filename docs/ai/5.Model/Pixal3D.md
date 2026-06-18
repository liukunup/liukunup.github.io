---
title: Pixal3D
createTime: 2026/06/18 00:00:00
permalink: /ai/model/pixal3d/
---

## 概述

Pixal3D 是腾讯 ARC Lab 与清华大学等联合提出的图像转 3D 模型（SIGGRAPH 2026）。通过像素反投影（pixel back-projection）将图像特征显式提升到 3D 特征体，建立直接的像素到 3D 对应关系，实现接近重建级别的高保真 3D 资产生成。

## 架构

三级级联生成，逐步提升分辨率：

| 阶段 | 模型 | 分辨率 |
|------|------|--------|
| 1 | Sparse Structure | 32 → 64 |
| 2 | Shape | 256 → 512 → 1024 |
| 3 | Texture | 256 → 512 → 1024 |

每个阶段使用像素对齐投影条件 + 视图对齐隐变量（默认 2 视图）。

## 分支

| 分支 | 说明 |
|------|------|
| `main` | 最新版，基于 Trellis.2 主干，性能更优 |
| `paper` | 论文版，基于 Direct3D-S2 主干，对应 SIGGRAPH 2026 论文结果 |

## 资源链接

- GitHub：[TencentARC/Pixal3D](https://github.com/TencentARC/Pixal3D)
- HuggingFace：[TencentARC/Pixal3D](https://huggingface.co/TencentARC/Pixal3D)
- 在线 Demo：[HF Spaces](https://huggingface.co/spaces/TencentARC/Pixal3D)
- 项目主页：[ldyang694.github.io/projects/pixal3d](https://ldyang694.github.io/projects/pixal3d/)
- 论文：[arXiv 2605.10922](https://arxiv.org/abs/2605.10922)
- 许可证：MIT
