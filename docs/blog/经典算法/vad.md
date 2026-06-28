---
title: VAD (语音活动检测) 通常是如何实现的
createTime: 2026/06/16 04:00:00
permalink: /blog/vad/
---

## 引言

VAD（Voice Activity Detection）的任务很简单——判断一段音频中**是否有人说话**。但就是这"简单"的一步，决定了整个语音系统的基础体验。

它的输出决定了后续流程走还是不走。在 VAD 上犯错，后续一切免谈。

---

## 1. VAD 的定位

在语音唤醒和语音处理的完整链路中，VAD 通常是**第一级处理**：

```
Audio → VAD → (有语音?) → KWS / ASR / 其他
                ↓
              (静音) → 丢弃，继续监听
```

- **在语音唤醒中**：VAD 过滤掉静音帧，避免 KWS 模型在无意义音频上做推理，节能 70-80%
- **在语音识别中**：VAD 确定语音段的起止点，告诉 ASR 系统"从这里开始识别，到这里结束"

### 核心要求

| 指标 | 说明 | 典型目标 |
|------|------|---------|
| 延迟 | 检测到语音后尽快响应 | < 100ms |
| 灵敏度 | 低信噪比下不遗漏语音 | SNR 0dB 可检测 |
| 稳健性 | 噪音环境下不频繁误触发 | 各种噪音类型 |
| 计算量 | 适合 Always-on 低功耗场景 | < 1 MIPS |

---

## 2. VAD 的三种实现路线

```
          ┌──────────────────────────────┐
          │          VAD 方案             │
          ├──────────────┬───────────────┤
          │  传统信号处理  │   深度学习    │
          ├──────────────┼───────────────┤
          │ 能量阈值      │ DNN / CNN    │
          │ 过零率        │ RNN / LSTM   │
          │ 频谱平坦度     │ Transformer  │
          │ 子带能量比    │ 专用小模型    │
          │ WebRTC VAD   │ Silero VAD   │
          │ ITU G.729B   │ DNS Challenge │
          └──────────────┴───────────────┘
```

---

## 3. 传统信号处理方案

### 3.1 能量阈值法

最直接的方案——计算帧能量，低于阈值判定为静音：

```python
import numpy as np

def energy_vad(audio, sr=16000, frame_ms=25, threshold_db=-40):
    frame_len = int(sr * frame_ms / 1000)
    energy_db_list = []

    for start in range(0, len(audio) - frame_len, frame_len // 2):
        frame = audio[start:start + frame_len]
        energy = np.sum(frame ** 2) / frame_len
        energy_db = 10 * np.log10(energy + 1e-10)
        energy_db_list.append(energy_db)

    # 高于阈值为语音
    is_speech = np.array(energy_db_list) > threshold_db
    return is_speech
```

**优点**：极简，计算量几乎为零
**缺点**：噪音下完全失效，阈值难以普适

### 3.2 过零率 (ZCR)

过零率衡量信号穿过零轴的频率。语音的过零率高于纯噪音（语音包含高频辅音）。

```python
def zcr_vad(frame):
    # 过零率
    zcr = np.sum(np.abs(np.diff(np.sign(frame)))) / (2 * len(frame))
    return zcr
```

**作用**：辅助判断。仅靠 ZCR 不够，但与能量结合可提升准确率。

### 3.3 频谱平坦度 (Spectral Flatness)

衡量频谱是"平坦"（噪音）还是"峰值明显"（语音）：

$$
\text{Flatness} = \frac{\sqrt[N]{\prod_{k} X(k)}}{\frac{1}{N} \sum_k X(k)}
$$

- 接近 1 → 白噪音
- 接近 0 → 有调性信号（语音、音乐）

```python
def spectral_flatness(fft_magnitude):
    n = len(fft_magnitude)
    geometric_mean = np.exp(np.sum(np.log(fft_magnitude + 1e-10)) / n)
    arithmetic_mean = np.mean(fft_magnitude)
    return geometric_mean / arithmetic_mean
```

### 3.4 子带能量比

语音的能量集中在特定频段（通常 300-3000Hz），背景噪音分布在整个频谱。

```python
def subband_energy_ratio(fft_magnitude, sr=16000, n_fft=512):
    freqs = np.linspace(0, sr/2, n_fft//2 + 1)

    # 语音频段 (300-3000Hz)
    speech_band = (freqs >= 300) & (freqs <= 3000)
    # 高频噪声段 (> 4000Hz)
    noise_band = freqs >= 4000

    speech_energy = np.sum(fft_magnitude[speech_band] ** 2)
    noise_energy = np.sum(fft_magnitude[noise_band] ** 2)

    ratio = speech_energy / (noise_energy + 1e-10)
    return ratio  # 越大越可能是语音
```

### 3.5 WebRTC VAD

WebRTC VAD 是信号处理方案的代表作，基于 **GMM (Gaussian Mixture Model)** 对噪声和语音分布建模：

```
每一帧 →
  ├── 计算子带特征 (6 个频段)
  ├── 计算噪声模型的似然
  ├── 计算语音模型的似然
  └── 似然比 > 阈值 → 语音
```

```c
// WebRTC VAD 接口 (C)
#include "webrtc/common_audio/vad/include/webrtc_vad.h"

VadInst* vad = WebRtcVad_Create();
WebRtcVad_Init(vad);
WebRtcVad_set_mode(vad, 1);  // 0=最宽松, 3=最严格

// 每 10ms 调用一次
int is_speech = WebRtcVad_Process(vad, 16000, audio_frame, 160);
// 返回 0=静音, 1=语音
```

**WebRTC VAD 模式**：

| 模式 | 行为 | 误触发 | 漏检 |
|------|------|--------|------|
| 0 (Normal) | 平衡 | 中 | 中 |
| 1 (Low Bitrate) | 偏严格 | 低 | 高 |
| 2 (Aggressive) | 严格 | 极低 | 高 |
| 3 (Very Aggressive) | 最严格 | 极低 | 极高 |

> WebRTC VAD 是传统方案中应用最广的。计算量极小（单帧在 MCU 上仅需几十 µs），在安静或中等噪音下效果不错，但在严重非平稳噪音下表现不佳。

---

## 4. 深度学习方案

### 4.1 Silero VAD

Silero VAD 是目前最流行的开源深度学习 VAD 方案：

**特点**：
- 模型 ~800 KB（ONNX INT8 量化后 ~300 KB）
- 在单帧 30ms 上推理（每 10ms 滑动一次）
- 在 CPU 上单帧推理 < 1ms
- 支持 8kHz / 16kHz
- 鲁棒性强，在复杂噪音下远优于 WebRTC

**架构**：

```
Input: 30ms 音频 (480 samples @16kHz)
    │
    ├── Log Mel Spectrogram (64 mel bands)
    │
    ├── Conv1D × 2 (轻量特征提取)
    │
    ├── GRU (时序建模，32 hidden)
    │
    └── Dense → Sigmoid → 语音概率 [0, 1]
```

```python
import torch

model, utils = torch.hub.load(
    repo_or_dir="snakers4/silero-vad",
    model="silero_vad"
)

(get_speech_timestamps, save_audio, read_audio, _, _) = utils

audio = read_audio("speech.wav", sampling_rate=16000)

# 获取语音段落的时间戳
timestamps = get_speech_timestamps(
    audio, model,
    threshold=0.5,          # 语音概率阈值
    sampling_rate=16000,
    min_speech_duration_ms=250,   # 最短语音段
    min_silence_duration_ms=100,  # 最短静音段
)

# timestamps: [{'start': 160, 'end': 24000}, ...]

# 实时流式调用
def vad_stream(model, audio_chunk):
    with torch.no_grad():
        # 单帧推理
        speech_prob = model(torch.from_numpy(audio_chunk).float())
    return speech_prob.item()  # > 0.5 → 语音
```

**Silero VAD 后处理**：

```
原始帧级概率:
  0.1  0.2  0.3  0.9  0.9  0.8  0.1  0.1  0.8  0.9  0.2

阈值 0.5 后:
  静音 │                ┌──────────┐       ┌──────┐
       │                │  语音段  │       │语音段│
       └────────────────┘          └───────┘      └─────

中间合并 (合并间隔 < 100ms 的语音段):
  静音 │                ┌──────────────────────┐
       │                │      语音段           │
       └────────────────┘                      └─────

丢弃短噪音 (< 250ms):
  静音 │                ┌──────────────────┐
       │                │  最终语音段        │
       └────────────────┘                  └─────
```

### 4.2 其他开源方案

| 方案 | 模型大小 | 延迟 | 特点 |
|------|---------|------|------|
| Silero VAD v5 | ~300 KB (INT8) | < 1ms/帧 | 最流行，鲁棒性好 |
| DNS Challenge VAD | ~500 KB | < 2ms/帧 | Microsoft 出品 |
| MarbleNet (NVIDIA) | ~200 KB | < 1ms/帧 | NeMo 框架 |
| Voice Activity Detection (WebRTC) | 0 (纯信号) | < 0.1ms/帧 | 极致轻量 |

### 4.3 DNN VAD vs 传统 VAD

| 对比 | 信号处理 VAD | 深度学习 VAD |
|------|------------|-------------|
| 计算量 | 极低 (数十 µs) | 中等 (数百 µs-数 ms) |
| 安静环境 | 良好 | 优秀 |
| 噪音环境 | 差 (非平稳噪音崩溃) | 良好 (训练数据覆盖) |
| 泛化性 | 需人工调参 | 数据驱动，自动泛化 |
| 模型大小 | 0 | 100 KB - 1 MB |
| 维护性 | 规则简单 | 需数据集维护 |

---

## 5. VAD 在 MCU 上的极端优化

当 VAD 需要跑在低功耗 DSP 或 MCU 上时，可以采用**最简化的特征 + 决策树**方案：

```
帧能量 → 噪声底噪跟踪 → SNR 估计
  ↓
过零率 → 区分语音/音乐
  ↓
子带能量比 → 低频 (辅音) / 高频 (噪音)
  ↓
简单阈值决策 → 语音/静音
```

### 噪声底噪跟踪

```python
# 噪声能量自适应更新
noise_floor = 0.0
alpha = 0.99  # 平滑系数

def adaptive_vad_frame(frame_energy_db):
    global noise_floor

    # 如果当前帧能量低于噪声底噪 + 阈值，视为噪音
    if frame_energy_db < noise_floor + 6:  # 6dB 阈值
        # 更新噪声底噪（慢速跟踪）
        noise_floor = alpha * noise_floor + (1 - alpha) * frame_energy_db
        return False
    else:
        # 语音帧，不更新噪声底噪
        return True
```

---

## 6. VAD 在语音唤醒链路中的具体位置

### 典型集成方式

```
Audio In
    │
    ▼
VAD ── 静音 ──→ 丢弃（保持 DSP 睡眠）
    │
    语音
    │
    ▼
特征提取 (MFCC / Mel)
    │
    ▼
KWS 模型推理 (只对语音段推理)
    │
    ▼
后处理 → 唤醒决策
```

**VAD 前置带来的节能效果**：

| 场景 | 无 VAD 前置 | 有 VAD 前置 |
|------|------------|------------|
| 推理频率 | 每 10ms 一次 | 仅在语音段 |
| 每日推理次数 | 864 万次 | ~50-200 万次 |
| 日均推理功耗 | ~10 mW | ~2-4 mW |

**hangover 机制**：检测到语音结束后，继续保持几帧不切换为静音，防止语音段尾部的弱音被切断。

---

## 7. VAD 的评估方法

### 7.1 帧级指标

| 指标 | 定义 |
|------|------|
| HIT (命中率) | 语音帧中被正确标记为语音的比例 |
| FA (误报率) | 噪音帧中被错误标记为语音的比例 |
| Detection Accuracy | 所有帧中预测正确的比例 |

### 7.2 段级指标

| 指标 | 定义 |
|------|------|
| 前端切割 (Front-end Clipping) | 语音起始段被当成静音丢弃 |
| 中间切割 (Mid-speech Clipping) | 语音中间的短暂停顿被判定为结束 |
| 语音漏检 | 完全没检测到某段语音 |
| 噪音尾随 (Noise Hangover) | 语音结束后把噪音当成了语音 |

### 7.3 测试数据集

| 数据集 | 内容 | 特点 |
|--------|------|------|
| TIMIT | 干净英语朗读 | 学术界标准 |
| Aurora-4 | 干净 + 噪音 | 噪声鲁棒性测试 |
| DNS Challenge | 真实 noisy 对话 | Microsoft 比赛用 |
| LibriCSS | 会议重叠语音 | 多人对话场景 |

---

## 8. 常见问题与对策

| 问题 | 原因 | 对策 |
|------|------|------|
| 噪音下频繁误触发 | 非平稳噪音被误判为语音 | 用深度学习 VAD / 加 hangover |
| 语音尾巴被斩断 | 句尾弱音能量低 | 增加 hangover 帧数 |
| 音乐/电视背景音误判 | 能量持续存在 | 增加频谱特征 (周期/平坦度) |
| 风声/敲击声误触发 | 突发脉冲噪音 | 前后帧平滑 / 能量变化率检测 |
| 首字被切 | VAD 响应慢 | 降低阈值 / 缩短帧移 |
| 回声误判为语音 | 扬声器播放被麦克风采集 | AEC (回声消除) 前置 |

---

## 9. 工程建议

| 场景 | 推荐方案 |
|------|---------|
| 安静环境，MCU 资源受限 | WebRTC VAD + 能量阈值 |
| 噪音环境，有 DSP/NPU 资源 | Silero VAD (ONNX / TFLite) |
| 手机 / 中高端芯片 | 深度学习 VAD + 自适应阈值 |
| 通话降噪 / 会议系统 | MarbleNet / DNS Challenge VAD |
| 极端低功耗 (µW 级) | 模拟 VAD (纯硬件) |

---

## 参考资料

- [Silero VAD: Pre-trained Enterprise-grade Voice Activity Detector](https://github.com/snakers4/silero-vad)
- [WebRTC VAD 源码](https://webrtc.googlesource.com/src/+/main/common_audio/vad/)
- [ITU-T G.729B VAD](https://www.itu.int/rec/T-REC-G.729-199601-S!AnnB/en)
- [DNS Challenge (Microsoft)](https://github.com/microsoft/DNS-Challenge)
- [MarbleNet: Deep Learning VAD (NVIDIA NeMo)](https://github.com/NVIDIA/NeMo)
- [Tinc VAD: VAD + 端点检测](https://github.com/tinc-vad/tinc-vad)
