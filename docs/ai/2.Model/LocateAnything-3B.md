---
title: LocateAnything-3B
createTime: 2026/06/19 00:00:00
permalink: /ai/model/LocateAnything-3B/
---

## 简介

**LocateAnything-3B** 是 NVIDIA 发布的 3B 参数视觉语言模型，专注于高效视觉定位（Visual Grounding）任务。采用 **Parallel Box Decoding (PBD)** 技术，可实现高达 2.5 倍的推理加速。

## 核心能力

### 支持的任务

- **指代表达定位** (Referring Expression Grounding)
- **多目标检测** (Multi-object Detection)
- **GUI 元素定位** (GUI Element Grounding)
- **文本/OCR 定位** (Text/OCR Localization)
- **开放世界检测** (Open-world Detection)
- **基于点的指向** (Point-based Pointing)

### 技术特点

| 特性 | 说明 |
|------|------|
| **视觉编码器** | MoonViT-SO-400M |
| **语言模型** | Qwen2.5-3B-Instruct |
| **多模态投影器** | MLP Projector |
| **输出形式** | Block-based 结构化预测 |
| **并行解码** | Parallel Box Decoding (PBD) |
| **参数规模** | 3B |
| **训练数据** | 12M 图像, 138M+ 查询, 785M 边界框 |
| **输入分辨率** | 原生分辨率 (最高 ~2.5K) |
| **Prompt 长度** | 最长 24K tokens |

## 架构设计

LocateAnything 采用 **Parallel Box Decoding (PBD)** 创新架构：

1. **块级多令牌预测**：不再逐个坐标 token 自回归生成，而是并行预测完整边界框
2. **几何一致性保持**：结构化单元预测保证几何一致性
3. **混合优化**：联合优化 next-token 预测和多令牌预测，平衡推理能力与并行效率
4. **四阶段训练流程**：
   - 多模态知识适应（captioning, VQA, OCR 等）
   - 定位微调
   - 密集场景定位微调

## 性能对比

| 指标 | 提升 |
|------|------|
| 解码吞吐量 | 高达 2.5× |
| 高精度定位 (高 IoU) | 改善 |

## 应用场景

- **GUI Agents**: 自动化界面交互
- **机器人/具身智能**: 视觉导航与操作
- **文档理解**: 文档布局分析与定位
- **OCR/文本定位**: 文本检测与识别
- **自动驾驶**: 场景理解与目标定位

## 模型资源

| 类型 | 链接 |
|------|------|
| **Hugging Face** | [nvidia/LocateAnything-3B](https://huggingface.co/nvidia/LocateAnything-3B) |
| **GitHub** | [NVlabs/LocateAnything](https://github.com/NVlabs/LocateAnything) |
| **项目主页** | [locate-anything.github.io](https://locate-anything.github.io/) |

## 许可证

NVIDIA Non-Commercial License - 仅允许学术和非商业研究用途

## 相关模型

- [DAM-3B](./DAM-3B.md) - Describe Anything Model，专注于图像区域描述
- [Alpamayo-R1](./Alpamayo-R1.md) - NVIDIA 自动驾驶模型
