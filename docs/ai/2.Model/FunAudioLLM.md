---
title: FunAudioLLM
createTime: 2026/06/18 00:00:00
permalink: /ai/model/funaudiollm/
---

## 概述

FunAudioLLM 是阿里通义语音实验室（Tongyi Speech Lab）开源的语音理解与生成模型家族，旨在实现人与大语言模型之间的自然语音交互。核心包含两大基础模型：SenseVoice（语音理解）和 CosyVoice（语音生成），后续扩展出 Fun-ASR（端到端 ASR 大模型）、Fun-Audio-Chat（语音对话模型）、MinMo（全双工语音模型）等。

## 模型家族

### SenseVoice — 语音理解

多语言语音识别、情感识别、音频事件检测。

- **SenseVoice-Small**：5 种语言（zh/en/ja/ko/yue），低延迟（<80ms），234M 参数
- **SenseVoice-Large**：50+ 语言高精度 ASR

### CosyVoice — 语音生成

多语言语音合成，支持零样本语音克隆、跨语言克隆、指令跟随。

- **CosyVoice**：170k+ 小时训练，5 种语言（ZH/EN/JP/Yue/KO）
- **CosyVoice 2**：改进版本

### Fun-ASR — 端到端 ASR 大模型

31 种语言、方言、口音、歌词、热词、时间戳、说话人日志。

- **Fun-ASR-Nano**：800M 参数，数千万小时训练
- **Fun-ASR-MLT-Nano**：31 种语言多语言版

### Fun-Audio-Chat — 语音对话模型

大型语音语言模型（LALM），支持语音问答、音频理解、语音函数调用、语音共情。

- **Fun-Audio-Chat-8B**：8B 参数，Dual-Resolution Speech Representations
- 支持全双工交互（Fun-Audio-Chat-Duplex）

### MinMo — 全双工语音模型

端到端全双工语音对话，支持实时打断和双向交互。

### InspireMusic — 音乐生成

AI 音乐生成模型。

## 资源链接

- GitHub 组织：[github.com/FunAudioLLM](https://github.com/FunAudioLLM)
- 论文：[FunAudioLLM: Voice Understanding and Generation Foundation Models](https://arxiv.org/abs/2407.04051)
- 官网：[funaudiollm.github.io](https://funaudiollm.github.io)
- 许可证：Apache-2.0 / MIT（具体视子项目而定）
