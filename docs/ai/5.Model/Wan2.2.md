---
title: Wan2.2
createTime: 2026/06/18 00:00:00
permalink: /ai/model/wan2.2/
---

## 概述

Wan2.2 是阿里通义万相实验室（Tongyi Wanxiang Lab）开源的大规模视频生成模型系列，基于 MoE（Mixture-of-Experts）架构，支持文生视频、图生视频、语音驱动视频、角色动画等任务。训练数据相比 Wan2.1 图像数据增加 65.6%、视频数据增加 83.2%。

## 模型系列

| 模型 | 参数量 | 说明 |
|------|--------|------|
| T2V-A14B | 27B (激活 14B) | 文生视频 MoE，支持 480P & 720P |
| I2V-A14B | 27B (激活 14B) | 图生视频 MoE，支持 480P & 720P |
| TI2V-5B | 5B (Dense) | 高压缩 VAE，T2V+I2V 统一框架，720P，单卡消费级 GPU 可用 |
| S2V-14B | 14B | 语音驱动视频生成，支持 480P & 720P |
| Animate-14B | 14B | 角色动画与替换 |

## 架构特点

- **双专家 MoE 设计**：高噪声专家负责场景布局，低噪声专家负责细节纹理，每步仅激活 14B 参数
- **Wan2.2-VAE**：压缩比 4×16×16（时间×高×宽），总压缩率 64
- **Patchification**：TI2V-5B 总压缩率可达 4×32×32
- **输出规格**：5 秒视频，720P@24fps，单卡 4090 可在 9 分钟内完成

## 模型下载

| 模型 | HuggingFace | ModelScope |
|------|-------------|------------|
| T2V-A14B | [Wan-AI/Wan2.2-T2V-A14B](https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B) | [ModelScope](https://modelscope.cn/models/Wan-AI/Wan2.2-T2V-A14B) |
| I2V-A14B | [Wan-AI/Wan2.2-I2V-A14B](https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B) | [ModelScope](https://modelscope.cn/models/Wan-AI/Wan2.2-I2V-A14B) |
| TI2V-5B | [Wan-AI/Wan2.2-TI2V-5B](https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B) | [ModelScope](https://modelscope.cn/models/Wan-AI/Wan2.2-TI2V-5B) |
| S2V-14B | [Wan-AI/Wan2.2-S2V-14B](https://huggingface.co/Wan-AI/Wan2.2-S2V-14B) | [ModelScope](https://modelscope.cn/models/Wan-AI/Wan2.2-S2V-14B) |
| Animate-14B | [Wan-AI/Wan2.2-Animate-14B](https://huggingface.co/Wan-AI/Wan2.2-Animate-14B) | [ModelScope](https://modelscope.cn/models/Wan-AI/Wan2.2-Animate-14B) |

## 使用

```python
import torch
from wan.pipeline import WanPipeline

pipe = WanPipeline.from_pretrained(
    "Wan-AI/Wan2.2-T2V-A14B",
    torch_dtype=torch.bfloat16,
    device="cuda",
)

video = pipe(
    prompt=" cinematic footage of a sunset over mountains",
    num_frames=81,
    width=1280,
    height=720,
)[0]
```

## 资源链接

- GitHub：[github.com/Wan-Video/Wan2.2](https://github.com/Wan-Video/Wan2.2)
- 官网：[wan.video](https://wan.video)
- Diffusers 集成：T2V / I2V / TI2V
- 许可证：Apache-2.0
