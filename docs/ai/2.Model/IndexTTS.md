---
title: IndexTTS
createTime: 2026/06/14 00:00:00
permalink: /ai/model/indextts/
---

## 概述

IndexTTS 是哔哩哔哩开发的工业级可控高效零样本 Text-to-Speech 系统。IndexTTS2 在此基础上实现了情感表达与时长可控的自回归零样本语音合成突破。

**主要特性：**

- 情感与说话人身份解耦，可独立控制音色和情感
- 支持精确时长控制与自然时长生成
- 零样本声音克隆
- 多模态情感控制（音频参考、向量、文本描述）
- 支持中英文等多语言

## 模型下载

| 版本 | HuggingFace | ModelScope |
| --- | --- | --- |
| IndexTTS-2 | [IndexTTS-2](https://huggingface.co/IndexTeam/IndexTTS-2) | [IndexTTS-2](https://modelscope.cn/models/IndexTeam/IndexTTS-2) |
| IndexTTS-1.5 | [IndexTTS-1.5](https://huggingface.co/IndexTeam/IndexTTS-1.5) | [IndexTTS-1.5](https://modelscope.cn/models/IndexTeam/IndexTTS-1.5) |
| IndexTTS | [Index-TTS](https://huggingface.co/IndexTeam/Index-TTS) | [Index-TTS](https://modelscope.cn/models/IndexTeam/Index-TTS) |

## 环境配置

```bash
# 1. 启用 Git-LFS
git lfs install

# 2. 下载代码
git clone https://github.com/index-tts/index-tts.git && cd index-tts
git lfs pull

# 3. 安装 uv 包管理器
pip install -U uv

# 4. 安装依赖
uv sync --all-extras

# 5. 下载模型 (HuggingFace)
uv tool install "huggingface-hub[cli,hf_xet]"
hf download IndexTeam/IndexTTS-2 --local-dir=checkpoints

# 或 ModelScope
uv tool install "modelscope"
modelscope download --model IndexTeam/IndexTTS-2 --local_dir checkpoints
```

> [!TIP]
> 中国大陆用户可使用国内镜像：
> ```bash
> uv sync --all-extras --default-index "https://mirrors.aliyun.com/pypi/simple"
> ```

## 使用

### Web 演示

```bash
uv run webui.py
```

浏览器访问 `http://127.0.0.1:7860`

### Python API

1. **音色克隆（单一参考音频）**

```python
from indextts.infer_v2 import IndexTTS2
tts = IndexTTS2(cfg_path="checkpoints/config.yaml", model_dir="checkpoints")
text = "Translate for me, what is a surprise!"
tts.infer(spk_audio_prompt='examples/voice_01.wav', text=text, output_path="gen.wav")
```

2. **指定情感参考音频**

```python
tts.infer(spk_audio_prompt='examples/voice_07.wav', text=text, output_path="gen.wav",
          emo_audio_prompt="examples/emo_sad.wav")
```

3. **调节情感权重**

```python
tts.infer(spk_audio_prompt='examples/voice_07.wav', text=text, output_path="gen.wav",
          emo_audio_prompt="examples/emo_sad.wav", emo_alpha=0.9)
```

4. **指定 8 维情感向量**

情感向量格式：`[高兴, 愤怒, 悲伤, 害怕, 厌恶, 忧郁, 惊讶, 平静]`

```python
tts.infer(spk_audio_prompt='examples/voice_09.wav', text=text, output_path="gen.wav",
          emo_vector=[0, 0, 0.8, 0, 0, 0, 0, 0])
```

5. **根据文本自动生成情感**

```python
tts.infer(spk_audio_prompt='examples/voice_12.wav', text=text, output_path="gen.wav",
          emo_alpha=0.6, use_emo_text=True)
```

6. **文本描述控制情感**

```python
emo_text = "你吓死我了！你是鬼吗？"
tts.infer(spk_audio_prompt='examples/voice_12.wav', text=text, output_path="gen.wav",
          emo_alpha=0.6, use_emo_text=True, emo_text=emo_text)
```

### 旧版 IndexTTS1 使用

```python
from indextts.infer import IndexTTS
tts = IndexTTS(model_dir="checkpoints", cfg_path="checkpoints/config.yaml")
text = "大家好，我现在正在bilibili体验ai科技..."
tts.infer(voice, text, 'gen.wav')
```

## 资源链接

- GitHub：https://github.com/index-tts/index-tts
- 论文：https://arxiv.org/abs/2506.21619
- Demo：https://index-tts.github.io/index-tts2.github.io/
- 邮箱：indexspeech@bilibili.com
- QQ群：663272642