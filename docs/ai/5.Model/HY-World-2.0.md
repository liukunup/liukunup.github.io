---
title: HY-World 2.0
createTime: 2026/06/18 00:00:00
permalink: /ai/model/hy-world-2/
---

## 概述

腾讯混元 HY-World 2.0 是多模态世界模型框架，支持世界生成和世界重建。输入文本、单图、多视图或视频，输出 3DGS / 网格 / 点云，可直接导入 Unity / Unreal Engine / Isaac。

## 核心能力

| 能力 | 输入 | 输出 |
|------|------|------|
| 世界生成 | 文本 / 单张图像 | 可导航 3D 世界（3DGS / 网格） |
| 世界重建 | 多视图图像 / 视频 | 深度、法线、相机参数、点云、3DGS |

## 世界生成流水线

| 阶段 | 组件 | 说明 |
|------|------|------|
| 1 | HY-Pano 2.0 | 文本/图像 → 360° 全景图 |
| 2 | WorldNav | VLM 轨迹规划，带避障 |
| 3 | WorldStereo 2.0 | 全景 → 多视角关键帧生成 |
| 4 | WorldMirror 2.0 + 3DGS | 3D 重建 → 高斯点云优化导出 |

## 模型库

| 模型 | 参数量 | 说明 |
|------|--------|------|
| HY-Pano-2 | ~80B | 文本/图像 → 360° 全景 |
| HY-Pano-2-Qwen | ~425M | 轻量全景生成 |
| WorldStereo 2.0 | ~17B | 全景 → 3DGS 世界 |
| WorldMirror 2.0 | ~1.2B | 多视图/视频 → 3D 重建 |

## 资源链接

- GitHub：[Tencent-Hunyuan/HY-World-2.0](https://github.com/Tencent-Hunyuan/HY-World-2.0)
- HuggingFace：[tencent/HY-World-2.0](https://huggingface.co/tencent/HY-World-2.0)
- 技术报告：[PDF](https://3d-models.hunyuan.tencent.com/world/world2_0/HY_World_2_0.pdf)
