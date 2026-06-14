---
title: Alpamayo-R1 (AR1)
createTime: 2026/06/14 00:00:00
permalink: /ai/model/alpamayo-r1/
---

## 概述

Alpamayo-R1 (AR1) 是 NVIDIA 开发的自动驾驶推理模型，旨在弥合推理与动作预测之间的鸿沟，实现通用化自动驾驶。2026 年 1 月在 CES 2026 上正式发布，后更名为 Alpamayo 1。

**核心特性：因果链推理 · 动作预测 · 通用化自动驾驶**

## 模型信息

| 属性 | 说明 |
|------|------|
| 模型 ID | nvidia/Alpamayo-R1-10B |
| 参数量 | 10B |
| 开发者 | NVIDIA |
| 发布时间 | 2026 年 1 月 (CES 2026) |
| 后继版本 | Alpamayo 1.5 (2026 年 3 月) |

## 核心创新

### 因果链推理

Alpamayo-R1 引入"因果链"数据集，训练 AI 理解驾驶决策背后的"为什么"，突破黑盒自动驾驶时代。

### 推理与动作预测桥接

将大型语言模型的推理能力与自动驾驶的动作预测相结合，实现更可解释、更通用的自动驾驶系统。

### PhysicalAI-AV 数据集

基于 NVIDIA [PhysicalAI-Autonomous-Vehicles](https://huggingface.co/datasets/nvidia/PhysicalAI-Autonomous-Vehicles) 数据集进行训练和测试。

## 使用

### 基础推理

```python
import torch
from alpamayo_r1 import AlpamayoR1
from alpamayo_r1.inference import load_physical_aiavdataset, create_message, get_processor

# 加载模型
model = AlpamayoR1.from_pretrained(
    "nvidia/Alpamayo-R1-10B",
    dtype=torch.bfloat16
).to("cuda")

# 获取处理器
processor = get_processor(model.tokenizer)

# 加载数据
clip_id = "example_clip"
data = load_physical_aiavdataset(clip_id, t0_us=5_100_000)
messages = create_message(data["image_frames"].flatten(0, 1))

# 推理
inputs = processor.apply_chat_template(
    messages,
    tokenize=True,
    add_generation_prompt=True
)

outputs = model.generate(**inputs)
```

### AlpaSim 仿真器集成

Alpamayo-R1 可与 NVIDIA [AlpaSim](https://github.com/NVlabs/alpasim) 自动驾驶仿真器集成：

```yaml
# alpasim 配置
model:
  model_type: alpamayo1
  checkpoint_path: "nvidia/Alpamayo-R1-10B"
  device: "cuda"
```

## 资源链接

- GitHub：https://github.com/NVlabs/alpamayo
- HuggingFace：https://huggingface.co/nvidia/Alpamayo-R1-10B
- AlpaSim：https://github.com/NVlabs/alpasim
- 论文：https://arxiv.org/abs/2511.00088
- 许可证：Apache-2.0