---
title: FunASR
createTime: 2026/06/18 00:00:00
permalink: /ai/model/funasr/
---

## 概述

FunASR 是阿里达摩院（ModelScope）开源的工业级端到端语音识别工具包，旨在缩小学术研究与工业应用之间的差距。支持语音识别（ASR）、语音活动检测（VAD）、标点恢复、说话人日志、情感识别、音频事件检测等功能，提供统一的 Python API。推理速度可达 Whisper 的 170 倍，支持 50+ 语言。

## 核心能力

| 功能 | 说明 |
|------|------|
| ASR | 端到端语音识别，50+ 语言，含 7 种中文方言和 26 种地区口音 |
| VAD | 毫秒级语音活动检测，自适应静音阈值 |
| 标点恢复 | 自动添加标点，反文本正则化（ITN） |
| 说话人日志 | 识别"谁说了什么"，每句标注说话人 ID |
| 情感识别 | 识别高兴、悲伤、生气、中性等情感状态 |
| 音频事件 | 检测背景音乐、掌声、笑声、哭声等 |

## 支持模型

| 模型 | 任务 | 语言 | 参数量 |
|------|------|------|--------|
| Fun-ASR-Nano | ASR + 时间戳 | 31 种语言 | 800M |
| SenseVoiceSmall | ASR + 情感 + 事件 | zh/en/ja/ko/yue | 234M |
| Paraformer-zh | ASR + 时间戳 | zh/en | 220M |
| Paraformer-zh-streaming | 流式 ASR | zh | 220M |
| Qwen3-ASR | ASR | 52 种语言 | 1.7B |
| fsmn-vad | VAD | zh/en | 0.4M |
| ct-punc | 标点恢复 | zh/en | 290M |
| cam++ | 说话人验证/日志 | — | 7.2M |
| emotion2vec+large | 情感识别 | — | 300M |

## 使用示例

```python
from funasr import AutoModel

# 一键完成 VAD + ASR + 标点 + 说话人日志
model = AutoModel(
    model="paraformer-zh",
    vad_model="fsmn-vad",
    punc_model="ct-punc",
    spk_model="cam++",
)
result = model.generate(input="meeting.wav")
print(result[0]["text"])
```

## 部署服务

```shell
# 一键启动 OpenAI 兼容 API
funasr-server --device cuda

# 客户端调用（与 OpenAI Whisper API 兼容）
from openai import OpenAI
client = OpenAI(base_url="http://localhost:8899")
result = client.audio.transcriptions.create(
    model="fun-asr-nano",
    file=open("audio.wav", "rb"),
)
print(result.text)
```

## 技术特点

- **高性能**：CPU 下 17x 实时，GPU 下 170x 实时，远快于 Whisper
- **vLLM 加速**：批量推理可达 340x 实时
- **流式支持**：WebSocket 实时语音识别
- **多后端**：PyTorch、ONNX、libtorch、TensorRT
- **OpenAI 兼容**：标准 `/v1/audio/transcriptions` 端点
- **低资源**：CPU 可运行，无需 GPU

## 资源链接

- GitHub：[github.com/modelscope/FunASR](https://github.com/modelscope/FunASR)
- 官方文档：[funasr.com](https://www.funasr.com)
- 论文：[FunASR: A Fundamental End-to-End Speech Recognition Toolkit](https://arxiv.org/abs/2305.11013)
- PyPI：`pip install funasr`
- 许可证：MIT
