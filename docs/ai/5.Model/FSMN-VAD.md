---
title: FSMN-VAD
createTime: 2026/06/18 00:00:00
permalink: /ai/model/fsmn-vad/
---

## 概述

FSMN-VAD 是基于 Feedforward Sequential Memory Network 的语音活动检测（VAD）模型，由阿里达摩院 Speech Lab 开发，集成在 FunASR 工具包中。用于高精度、低延迟地检测音频中的语音起止边界，支持流式与离线两种模式。训练数据达 5000 小时工业级语料。

## 模型架构

```
┌─────────────────────────────────────────────────────────────┐
│                     音频输入 (16kHz 16bit PCM)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    WavFrontend 前端                          │
│           (分帧 → 加窗 → FBank 提取 → LFR)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Deep-FSMN Encoder                        │
│         (4 层 FSMN, proj_dim=128, lorder=20)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     VAD 后处理                               │
│     (阈值判断 → 滑窗检测 → 端点确认 → 语音段输出)              │
└─────────────────────────────────────────────────────────────┘
```

## 模型下载

| 来源 | 链接 |
|------|------|
| HuggingFace | [funasr/fsmn-vad](https://huggingface.co/funasr/fsmn-vad) |
| HuggingFace (ONNX) | [funasr/fsmn-vad-onnx](https://huggingface.co/funasr/fsmn-vad-onnx) |
| ModelScope | [iic/speech_fsmn_vad_zh-cn_16k-common](https://modelscope.cn/models/iic/speech_fsmn_vad_zh-cn_16k-common) |

## 使用

### FunASR (Python)

```python
from funasr import AutoModel

# 独立 VAD
model = AutoModel(model="funasr/fsmn-vad", hub="hf")
result = model.generate(input="long_audio.wav")
# 返回语音段: [[start_ms, end_ms], ...]
print(result[0]["value"])
```

### 作为 ASR 流水线的一部分

```python
from funasr import AutoModel

model = AutoModel(
    model="paraformer-zh",
    vad_model="fsmn-vad",
    punc_model="ct-punc",
    spk_model="cam++",
)
result = model.generate(input="meeting_2hours.wav")
print(result[0]["text"])
```

### ONNX Runtime

```python
from funasr_onnx import Fsmn_vad

model = Fsmn_vad(model_dir="./FSMN-VAD", quantize=True)
result = model("audio.wav")
print(result)
```

## 技术规格

| 规格 | 值 |
|------|-----|
| 架构 | Deep-FSMN (4 层) |
| 编码单元 | 单音素 (monophone) |
| 采样率 | 16kHz |
| 帧长 | 25ms |
| 帧移 | 10ms |
| LFR | 5 帧拼接 |
| FBank 维度 | 80 |
| 输入维度 | 400 (80×5) |
| 模式 | 流式 + 离线 |
| 训练数据 | 5000 小时 |

## VAD 后处理参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| max_end_silence_time | 800ms | 触发结束点的静音时长 |
| max_single_segment_time | 60000ms | 单段最大语音时长 |
| speech_noise_thres | 0.6 | 语音判决阈值 |
| lookback_time_start_point | 200ms | 起点前回看时长 |
| lookahead_time_end_point | 100ms | 终点后延拓时长 |
| sil_to_speech_time_thres | 150ms | 静音转语音的持续阈值 |
| speech_to_sil_time_thres | 150ms | 语音转静音的持续阈值 |

## 资源链接

- 论文：[Deep-FSMN for Large Vocabulary Continuous Speech Recognition](https://arxiv.org/abs/1803.05030)
- GitHub：[modelscope/FunASR](https://github.com/alibaba-damo-academy/FunASR)
- 文档：[modelscope.github.io/FunASR](https://modelscope.github.io/FunASR)
- 许可证：MIT
