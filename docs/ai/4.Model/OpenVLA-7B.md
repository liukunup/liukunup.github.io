---
title: OpenVLA-7B
createTime: 2026/06/14 00:00:00
permalink: /ai/model/openvla/
---

## 概述

OpenVLA-7B 是斯坦福大学等机构开发的开源视觉-语言-动作（VLA）模型，用于机器人控制。基于 7B 参数规模的 LLM，结合视觉编码器和动作预测头，实现图像/文本输入到机器人动作的端到端映射。

**核心特性：开源 VLA · 7B 参数 · 端到端机器人控制 · 支持 NanoLLM**

## 模型架构

```
┌─────────────────────────────────────────────────────────────┐
│                     图像输入 (224x224)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Vision Encoder (ViT - DINOv2)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Projector (FusedMLPProjector)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              LLM Backbone (7B)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Action Head (OpenVLAHead)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              动作输出 (x, y, z, roll, pitch, yaw, gripper)  │
└─────────────────────────────────────────────────────────────┘
```

## 模型下载

| 模型 | HuggingFace |
|------|-------------|
| OpenVLA-7B (基础) | [openvla/openvla-7b](https://huggingface.co/openvla/openvla-7b) |
| OpenVLA-7B + LIBERO-10 | [moojink/openvla-7b-finetuned-libero-10](https://huggingface.co/moojink/openvla-7b-finetuned-libero-10) |
| OpenVLA-7B + Spatial | [moojink/openvla-7b-oft-finetuned-libero-spatial](https://huggingface.co/moojink/openvla-7b-oft-finetuned-libero-spatial) |
| OpenVLA-7B + Object | [moojink/openvla-7b-oft-finetuned-libero-object](https://huggingface.co/moojink/openvla-7b-oft-finetuned-libero-object) |

## 使用

### NanoLLM

```python
from nano_llm import NanoLLM

model = NanoLLM.from_pretrained(
    "openvla/openvla-7b",
    quantization="q4f16_ft"
)

# 输入图像和文本，输出动作
result = model.generate(
    image=image_array,
    text="pick up the red cup"
)
```

### vLLM

```python
from vllm import LLM

llm = LLM(model="openvla/openvla-7b")
```

### 原始模型推理

```python
from transformers import AutoModelForVisionText2Seq, AutoProcessor
from PIL import Image

model = AutoModelForVisionText2Seq.from_pretrained("openvla/openvla-7b")
processor = AutoProcessor.from_pretrained("openvla/openvla-7b")

image = Image.open("robot_camera.jpg")
inputs = processor(text="put the object in the bin", images=image, return_tensors="pt")
outputs = model.generate(**inputs, do_sample=False, max_new_tokens=100)
actions = processor.batch_decode(outputs, skip_special_tokens=True)
```

## 动作空间

OpenVLA 输出 7 维动作向量：

| 维度 | 说明 |
|------|------|
| x, y, z | 末端执行器位置增量 |
| roll, pitch, yaw | 末端执行器姿态增量 |
| gripper | 夹爪开合 (0=开, 1=合) |

## 数据集支持

- Bridge Dataset
- Open-X Embodiment
- LIBERO 系列
- DROID

## 资源链接

- GitHub：https://github.com/openvla/openvla
- HuggingFace：https://huggingface.co/openvla/openvla-7b
- 许可证：MIT