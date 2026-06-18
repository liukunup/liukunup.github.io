---
title: OpenAI Whisper
createTime: 2026/06/18 00:00:00
permalink: /ai/model/whisper/
---

## 概述

Whisper 是 OpenAI 开源的通用语音识别模型，基于 Encoder-Decoder Transformer 架构，采用大规模弱监督训练（680,000 小时多语言数据）。支持多语言语音识别、语音翻译（转英文）和语言识别，具有优秀的噪声鲁棒性和口音适应性。

## 模型版本

| 版本 | 发布时间 | 说明 |
|------|----------|------|
| large-v1 | 2022/09 | 初始版 |
| large-v2 | 2022/12 | 更多训练轮次 + 正则化 |
| large-v3 | 2023/11 | 更多数据，128 Mel bins |
| large-v3-turbo | 2024/09 | 蒸馏版，Decoder 从 32 层减至 4 层 |

## 模型规格

| 模型 | 参数量 | 仅英文 | 多语言 | VRAM | 相对速度 |
|------|--------|--------|--------|------|----------|
| tiny | 39 M | tiny.en | tiny | ~1 GB | ~10x |
| base | 74 M | base.en | base | ~1 GB | ~7x |
| small | 244 M | small.en | small | ~2 GB | ~4x |
| medium | 769 M | medium.en | medium | ~5 GB | ~2x |
| large | 1550 M | — | large | ~10 GB | 1x |
| turbo | 809 M | — | turbo | ~6 GB | ~8x |

## 使用

```python
import whisper

model = whisper.load_model("turbo")
result = model.transcribe("audio.mp3")
print(result["text"])

# 指定语言
result = model.transcribe("audio.mp3", language="zh")

# 翻译为英文
result = model.transcribe("audio.mp3", task="translate")
```

### 命令行

```shell
whisper audio.mp3 --model turbo --language zh
whisper audio.mp3 --task translate
```

## 资源链接

- GitHub：[github.com/openai/whisper](https://github.com/openai/whisper)
- 论文：[Robust Speech Recognition via Large-Scale Weak Supervision](https://arxiv.org/abs/2212.04356)
- OpenAI 博客：[openai.com/whisper](https://openai.com/index/whisper/)
- PyPI：`pip install -U openai-whisper`
- 许可证：MIT
