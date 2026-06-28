---
title: Qwen-Image-Edit
createTime: 2026/06/18 00:00:00
permalink: /ai/model/qwen-image-edit/
---

## 概述

Qwen-Image-Edit 是阿里通义千问团队开源的图像编辑基础模型，基于 Qwen-Image（20B MMDiT）构建。采用双编码机制：Qwen2.5-VL 处理语义控制，VAE 处理视觉外观控制，实现语义编辑与外观编辑的统一。中英文文本编辑能力突出，中文单字渲染准确率 97.29%。GitHub 8K+ Stars。

## 模型版本

| 版本 | 日期 | 说明 |
|------|------|------|
| Qwen-Image-Edit | 2025/08 | 初始版，单图输入 |
| Qwen-Image-Edit-2509 | 2025/09 | 多图支持，一致性改进 |
| Qwen-Image-Edit-2511 | 2025/12 | 角色一致性大幅提升 |

## 架构

| 组件 | 参数量 |
|------|--------|
| Qwen2.5-VL（冻结） | 7B |
| VAE Enc/Dec | 54M / 73M |
| MMDiT | 20B |
| **总计** | ~27.1B |

## 核心能力

- **语义编辑**：修改图像语义内容（风格迁移、视角旋转、IP 角色创作）
- **外观编辑**：增删改元素，保持未修改区域不变（加招牌、去杂发、换背景）
- **精准文本编辑**：中英文文字增删改，保留字体/大小/样式
- **多图融合**：支持 1-3 张输入图片

## 快速使用

```bash
git clone https://github.com/QwenLM/Qwen-Image.git
cd Qwen-Image
```

API 调用（阿里云百炼）：

```python
# qwen-image-edit-max / qwen-image-edit-plus / qwen-image-edit
```

## 资源链接

- GitHub：[github.com/QwenLM/Qwen-Image](https://github.com/QwenLM/Qwen-Image)
- HuggingFace：[Qwen/Qwen-Image-Edit](https://huggingface.co/Qwen/Qwen-Image-Edit)
- 论文：[Qwen-Image-Edit Technical Report](https://arxiv.org/abs/2512.20156)
- NVIDIA NIM：[build.nvidia.com/qwen/qwen-image-edit](https://build.nvidia.com/qwen/qwen-image-edit)
- 许可证：Apache-2.0
