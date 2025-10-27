---
title: 大模型命名规则
createTime: 2025/10/27 19:17:03
permalink: /ai/model/naming-rule/
---

本文档整理了主流AI大模型的命名规则和标识含义，帮助开发者快速理解模型特性。

## Common Mark

### 量化精度标识
- **FP8**：8位浮点量化，兼顾精度与性能
- **INT4**：4位整数量化，极致压缩
- **NF4**：4位NormalFloat量化，优化数值分布

## DeepSeek

### 版本标识
| 标识 | 样例 | 说明 |
|-----|------|------|
| V3 | DeepSeek-V3 | 第三代通用大语言模型 |
| R1 | DeepSeek-R1 | 强化学习优化版本 |
| Coder | DeepSeek-Coder | 代码专用模型 |
| Math | DeepSeek-Math | 数学推理专用 |
| Voice | DeepSeek-Voice | 语音处理模型 |

### 后缀含义
- **-Lite**：轻量级版本
- **-Quant**：量化版本
- **-Instruct**：指令调优版本

## Qwen

### 功能标识
| 标识 | 样例 | 说明 |
|-----|------|------|
| VL | Qwen3-VL-235B-A22B-Instruct | 视觉语言多模态模型 |
| Omni | Qwen2.5-Omni-7B | 全能型多模态模型 |
| Next | Qwen2.5-Next | 下一代技术预览 |
| Guard | Qwen2.5-Guard-7B | 安全防护专用 |
| Coder | Qwen2.5-Coder | 代码生成与理解 |
| Image | Qwen2.5-Image | 图像理解专用 |
| Audio | Qwen2.5-Audio | 音频处理专用 |
| Math | Qwen2.5-Math | 数学推理专用 |
| Reranker | Qwen2.5-Reranker | 检索重排序模型 |
| Embedding | Qwen2.5-Embedding | 文本嵌入模型 |
| WorldPM | Qwen2.5-WorldPM | 世界知识处理模型 |
| QVQ | Qwen2.5-QVQ | 量化感知训练版本 |
| QwQ | Qwen2.5-QwQ-32B | 混合专家模型 |
| Thinking | Qwen2.5-Thinking | 思维链优化版本 |
| Instruct | Qwen2.5-7B-Instruct | 指令跟随版本 |

### 规格标识
- **7B/14B/72B**：参数量（70亿/140亿/720亿）
- **A22B**：激活参数量
- **MoE**：混合专家架构

## OpenAI

### 模型系列
| 标识 | 样例 | 说明 |
|-----|------|------|
| GPT | GPT-4、GPT-4o | 核心大语言模型系列 |
| O | O1、O3 | 复杂逻辑推理优化系列 |
| DALL·E | DALL·E 3 | 图像生成与编辑模型 |
| Whisper | Whisper-1 | 语音转文本模型 |
| TTS | tts-1、tts-1-hd | 文本转语音模型 |
| Embedding | text-embedding-3-small | 文本向量化模型 |
| Moderation | text-moderation-latest | 内容审核模型 |

### 版本特征
- **Turbo**：响应速度优化版本
- **o**（omni）：全能多模态版本
- **mini**：轻量级版本
- **日期后缀**（-0613）：特定版本快照

## Google

### Gemini系列
| 标识 | 样例 | 说明 |
|-----|------|------|
| Ultra | Gemini Ultra | 最大规模版本 |
| Pro | Gemini Pro | 平衡性能版本 |
| Flash | Gemini Flash | 高速推理版本 |
| Nano | Gemini Nano | 端侧轻量版本 |

### 功能后缀
- **-Vision**：视觉能力增强
- **-Multimodal**：多模态支持
- **-Code**：代码能力专项优化

## Meta

### Llama系列
| 标识 | 样例 | 说明 |
|-----|------|------|
| Llama | Llama 3.1 | 基础语言模型 |
| Code | Code Llama | 代码专用模型 |
| Vision | Llama Vision | 视觉语言模型 |

### 版本规则
- **参数量**：7B、13B、34B、70B、405B
- **功能标识**：
  - **-Instruct**：指令调优版本
  - **-Python**：Python代码优化
  - **-Base**：基础预训练版本

## Grok

### 版本演进
| 标识 | 样例 | 说明 |
|-----|------|------|
| Grok | Grok-1 | 第一代基础模型 |
| Grok | Grok-2 | 第二代改进版本 |
| Vision | Grok-Vision | 视觉能力扩展 |

### 特性标识
- **-Beta**：测试版本
- **-Preview**：预览版本
- 主要版本号表示架构重大更新

## 通用命名模式

### 版本号语义
- **主版本**（v1→v2）：架构重大变革
- **次版本**（v2.0→v2.1）：重要功能更新
- **修订版本**（v2.1.0→v2.1.1）：问题修复与优化

### 功能标识惯例
- **Multimodal/Omni**：多模态能力
- **Vision/VL**：视觉语言理解
- **Audio/Speech**：语音处理
- **Code/Coder**：编程能力
- **Math/Reasoning**：数学推理
- **Chat/Instruct**：对话交互
- **Embedding**：向量表示
- **Reranker**：检索优化

### 规模标识
- **Nano/Tiny**：极轻量级（<1B）
- **Mini/Small**：轻量级（1B-7B）
- **Medium/Base**：中等规模（7B-30B）
- **Large/Pro**：大规模（30B-100B）
- **Ultra/Giant**：超大规模（>100B）
