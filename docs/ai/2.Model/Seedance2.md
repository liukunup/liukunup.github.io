---
title: ByteDance Seedance 2.0
createTime: 2026/06/18 00:00:00
permalink: /ai/model/seedance2/
---

## 概述

Seedance 2.0 是字节跳动（ByteDance）于 2026 年 2 月发布的下一代视频生成模型，采用统一的多模态音视频联合生成架构。支持文本、图片、音频、视频四种输入模态，集成图像参考、视频参考、视频编辑与扩展等功能，输出原生同步音频的视频内容。集成于剪映（CapCut）、即梦（Dreamina）等平台。

## 模型系列

| 模型 | 说明 |
|------|------|
| Seedance 2.0 | 标准版，4-15 秒，480P & 720P |
| Seedance 2.0 Fast | 快速版，牺牲少量画质换取更高速度 |

## 核心能力

- **多模态参考输入**：最多 9 张图片 + 3 段视频 + 3 段音频混合输入
- **原生音视频同步生成**：对话、音效、背景音乐与画面同步输出
- **视频编辑与扩展**：基于参考视频进行修改或续写
- **智能时长**：支持自动选择最佳时长（-1）
- **自适应宽高比**：支持 16:9、4:3、1:1、3:4、9:16、21:9
- **多镜头叙事**：复杂运动场景、物理效果、微表情表现优异

## 技术规格

| 规格 | 值 |
|------|-----|
| 架构 | 稀疏架构（Sparse），统一多模态联合生成 |
| 输入模态 | 文本、图片、音频、视频 |
| 输出时长 | 4-15 秒 |
| 分辨率 | 480P、720P |
| 帧率 | 24fps |
| 音频 | 原生同步生成 |

## 使用

### API（Volcano Engine）

```shell
# 模型 ID: doubao-seedance-2-0-260128
```

### Replicate

```python
import replicate

output = replicate.run(
    "bytedance/seedance-2.0",
    input={
        "prompt": " cinematic footage of a sunset over mountains",
        "duration": 5,
        "aspect_ratio": "16:9",
        "resolution": "720p",
        "generate_audio": True,
    }
)
```

## 资源链接

- 官网：[seed.bytedance.com/seedance2_0](https://seed.bytedance.com/en/seedance2_0)
- 论文：[Seedance 2.0: Advancing Video Generation for World Complexity](https://arxiv.org/abs/2604.14148)
- Replicate：[bytedance/seedance-2.0](https://replicate.com/bytedance/seedance-2.0)
- 平台：剪映 CapCut、即梦 Dreamina、火山引擎
