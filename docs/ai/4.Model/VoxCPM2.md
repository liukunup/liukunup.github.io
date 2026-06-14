---
title: VoxCPM 2
createTime: 2026/06/14 00:00:00
permalink: /ai/model/voxcpm2/
---

## 概览

VoxCPM 2 是最新的大版本发布，一个在 236 万小时多语言数据上训练的 2B 参数模型。相较于 1.x 系列，它在容量、质量与可控性上都有显著跃升。

**关键特性：**

- 通过 AudioVAE V2 实现 48kHz 音频输出（非对称 16kHz 编码 → 48kHz 解码）
- 支持 30 种语言的多语言生成
- Voice Design：通过自然语言描述创建声音，无需参考音频
- Style Control：通过文本标签控制克隆声音的情绪、节奏与说话风格
- 为声音克隆提供隔离式参考通道（无需配套转写文本）
- Concat-Projection 残差 LM 融合，结合多 token DiT 条件输入，带来更强的表现力
- 基于 MiniCPM-4 骨干构建

## 语言支持

VoxCPM 2 支持跨多个语系的 **30 种语言**：

| 语系 | 语言 |
| --- | --- |
| **东亚** | 中文、日语、韩语 |
| **东南亚** | 缅甸语、印尼语、高棉语、老挝语、马来语、他加禄语、泰语、越南语 |
| **南亚** | 印地语 |
| **欧洲（日耳曼语族）** | 丹麦语、荷兰语、英语、芬兰语、德语、挪威语、瑞典语 |
| **欧洲（罗曼语族）** | 法语、意大利语、葡萄牙语、西班牙语 |
| **欧洲（其他）** | 希腊语、波兰语、俄语、土耳其语 |
| **闪米特语族** | 阿拉伯语、希伯来语 |
| **非洲** | 斯瓦希里语 |

## 模型架构

VoxCPM 2 保留 VoxCPM 的四阶段流水线——**Local Encoder → Text-Semantic LM → Residual Acoustic LM → Local DiT (CFM)**，同时重新设计三条核心信息流路径。

### 特性对比

| 特性 | VoxCPM 1 / 1.5 | VoxCPM 2 |
| --- | --- | --- |
| **Patch 大小** | 2 / 4 | 4 |
| **Residual LM 层数** | 6 | 8 |
| **FSQ 潜变量维度** | 256 | 512 |
| **最大序列长度** | 4096 | 8192 |
| **AudioVAE 输出** | 16kHz / 44.1kHz | 48kHz |
| **编解码采样率** | 对称（相同采样率） | 非对称（16kHz → 48kHz） |
| **Residual LM 融合** | 加法 | 拼接 + 投影 |
| **DiT 条件化** | 单 token（相加） | 多 token（拼接） |
| **参考音频** | Prompt 续写 | 隔离参考通道 |
| **语言** | 2（zh、en） | 30 |
| **可控性** | -- | 声音设定与风格控制 |

## 可控生成

### 声音设定 (Voice Design)

用自然语言描述，无需任何参考音频即可创建声线：

```python
from voxcpm import VoxCPM
import soundfile as sf

model = VoxCPM.from_pretrained("openbmb/VoxCPM2")

wav = model.generate(
   text="(A warm, gentle female voice in her 30s with a calm and soothing tone) "
        "Welcome to VoxCPM 2, the next generation of realistic speech synthesis.",
   cfg_value=2.0,
   inference_timesteps=10,
)
sf.write("voice_design.wav", wav, model.tts_model.sample_rate)
```

### 风格控制 (Style Control)

在使用参考音频做声音克隆时控制说话风格：

```python
wav = model.generate(
   text="(Speaking slowly with a whispering, mysterious tone) "
        "The secret lies hidden in the ancient library, waiting to be discovered.",
   reference_wav_path="reference_speaker.wav",
   cfg_value=2.0,
   inference_timesteps=10,
)
sf.write("style_control.wav", wav, model.tts_model.sample_rate)
```

## 安装

```shell
pip install voxcpm
```

## 使用

### Python API

```python
from voxcpm import VoxCPM
import soundfile as sf

model = VoxCPM.from_pretrained(
    "openbmb/VoxCPM2",
    load_denoiser=False,
)

wav = model.generate(
    text="VoxCPM 2 is the current recommended release for realistic multilingual speech synthesis.",
    cfg_value=2.0,
    inference_timesteps=10,
)
sf.write("demo.wav", wav, model.tts_model.sample_rate)
print("saved: demo.wav")
```

### 命令行

```shell
# 直接合成
voxcpm design \
    --text "Hello from VoxCPM!" \
    --output out.wav

# 参考音频克隆
voxcpm clone \
    --text "This is a cloned voice sample." \
    --reference-audio path/to/voice.wav \
    --output out.wav \
    --denoise

# 强制使用 CPU 或 MPS
voxcpm design --text "Hello from VoxCPM!" --device cpu --output out.wav
```

### 网页演示

```shell
git clone https://github.com/OpenBMB/VoxCPM.git
cd VoxCPM
pip install -e .
python app.py
```

## 部署

### NanoVLLM-VoxCPM

基于 Nano-vLLM 的高吞吐推理引擎，支持流式推理和 FastAPI 演示服务。

```shell
pip install nano-vllm-voxcpm
```

```python
import asyncio
import numpy as np
from nanovllm_voxcpm import VoxCPM

async def main():
    server = VoxCPM.from_pretrained(
        model="/path/to/model_dir",
        devices=[0],
        max_num_batched_tokens=8192,
        max_num_seqs=16,
        gpu_memory_utilization=0.95,
    )
    await server.wait_for_ready()

    chunks = []
    async for chunk in server.generate(target_text="Hello world"):
        chunks.append(chunk)

    wav = np.concatenate(chunks, axis=0)
    await server.stop()

asyncio.run(main())
```

### 其他部署方案

| 方案 | 说明 |
| --- | --- |
| vLLM-Omni | 基于 vLLM 的推理 |
| VoxCPM.cpp | C++ 推理 |
| VoxCPM-ONNX | ONNX 部署 |
| VoxCPMANE | Apple ANE 加速 |
| MLX-Audio | Apple MLX 加速 |
| VoxCPM-RKNN2 | RKNN 部署 |
| voxcpm_rs | Rust 实现 |

## 资源链接

- Hugging Face：https://huggingface.co/openbmb/VoxCPM2
- ModelScope：https://modelscope.cn/models/OpenBMB/VoxCPM2
- 官方文档：https://voxcpm.readthedocs.io/zh-cn/latest/models/voxcpm2.html