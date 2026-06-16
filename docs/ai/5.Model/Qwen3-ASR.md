---
title: Qwen3-ASR
createTime: 2026/06/14 00:00:00
permalink: /ai/model/qwen3-asr/
---

## 概述

Qwen3-ASR 是基于 Qwen3 大语言模型的自动语音识别（ASR）系统，支持 52 种语言的语音转文本。由阿里云通义千问团队开发，采用 Qwen3 文本骨干 + HuBERT 衍生的音频投影头架构。

**核心版本：**
- Qwen3-ASR-0.6B：轻量版，约 4GB GPU 显存
- Qwen3-ASR-1.7B：高精度版，约 8GB GPU 显存

## 模型架构

```
┌─────────────────────────────────────────────────────────────┐
│                     音频输入 (80-bin mel frames)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              WhisperFeatureExtractor 前端                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Audio MMProj 投影头 (HuBERT 衍生)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Qwen3 文本骨干                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      ASR 输出                              │
└─────────────────────────────────────────────────────────────┘
```

## 模型下载

### HuggingFace

| 模型 | 链接 |
|------|------|
| Qwen3-ASR-0.6B | [Qwen/Qwen3-ASR-0.6B](https://huggingface.co/Qwen/Qwen3-ASR-0.6B) |
| Qwen3-ASR-1.7B | [Qwen/Qwen3-ASR-1.7B](https://huggingface.co/Qwen/Qwen3-ASR-1.7B) |

### GGUF 量化版本

| 模型 | 链接 |
|------|------|
| Qwen3-ASR-0.6B GGUF | [ggml-org/Qwen3-ASR-0.6B-GGUF](https://huggingface.co/ggml-org/Qwen3-ASR-0.6B-GGUF) |
| Qwen3-ASR-1.7B GGUF | [ggml-org/Qwen3-ASR-1.7B-GGUF](https://huggingface.co/ggml-org/Qwen3-ASR-1.7B-GGUF) |

### MLX 版本 (Apple Silicon)

| 模型 | 链接 |
|------|------|
| Qwen3-ASR-0.6B MLX | [mlx-community/Qwen3-ASR-0.6B-4bit](https://huggingface.co/mlx-community/Qwen3-ASR-0.6B-4bit) |

## 使用

### FunASR

```python
from funasr import AutoModel

model = AutoModel(
    model="iic/Qwen3-ASR-0.6B",
    model_revision="v1.0.0"
)

result = model.generate(
    input="path/to/audio.wav",
    batch_size=5
)
print(result)
```

### vLLM

```python
from vllm import LLM

llm = LLM(model="Qwen/Qwen3-ASR-1.7B")
```

### sherpa-onnx

```python
#!/usr/bin/env python3
import sherpa_onnx

model = sherpa_onnx.OfflineRecognizerConfig(
    qwen3_asr_encoder="encoder.onnx",
    qwen3_asr_decoder="decoder.onnx",
    qwen3_asr_tokenizer="tokenizer",
).recognizer

recognizer = sherpa_onnx.OfflineRecognizer(model)
result = recognizer.decode_file("audio.wav")
print(result.text)
```

### RealtimeSTT

```python
from RealtimeSTT import AudioToTextRecorder

def process_text(text):
    print(f"识别结果: {text}")

recorder = AudioToTextRecorder(
    model="Qwen/Qwen3-ASR-1.7B",
    language="zh"
)
recorder.start(process_text)
```

## 技术规格

| 规格 | Qwen3-ASR-0.6B | Qwen3-ASR-1.7B |
|------|-----------------|---------------|
| 参数量 | 0.6B | 1.7B |
| GPU 显存 | ~4GB | ~8GB |
| 支持语言 | 52 种 | 52 种 |
| 前端 | WhisperFeatureExtractor | WhisperFeatureExtractor |
| 音频投影 | HuBERT mmproj | HuBERT mmproj |

## 集成支持

- **vLLM**：内置 Qwen3ASR 配置支持
- **sherpa-onnx**：完整的 offline 识别支持
- **FunASR**：AutoModel 接口直接调用
- **RealtimeSTT**：实时语音识别
- **LocalAI**：llama.cpp 音频转录封装
- **MLX-Audio**：Apple Silicon 原生加速
- **elizaOS**：AGENTS 项目集成

## 资源链接

- GitHub：https://github.com/Qwen/Qwen3-ASR
- HuggingFace：https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- ModelScope：https://modelscope.cn/models/Qwen/Qwen3-ASR-1.7B
- 许可证：Apache-2.0