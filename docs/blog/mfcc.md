---
title: Mel-Frequency Cepstral Coefficients (MFCC) 详解
createTime: 2026/06/16 03:00:00
permalink: /blog/mfcc/
---

## 引言

梅尔频率倒谱系数（MFCC）是语音信号处理领域最经典的特征之一，广泛用于语音识别、说话人识别、语音唤醒、情感识别等任务。它将人耳听觉特性与信号处理技术结合，将高维的原始音频波形压缩为低维、紧凑、信息丰富的特征向量。

---

## 1. 为什么需要 MFCC

原始音频波形 16kHz 采样下每秒 16000 个采样点，直接作为模型输入不仅维度高，而且包含大量与语义无关的信息（音色、环境噪音等）。

人耳对声音的感知并非线性：
- **频率感知**：对低频变化敏感，对高频变化迟钝 —— Mel 刻度
- **响度感知**：对数关系，而非线性 —— Log 压缩

MFCC 正是模拟了这两条听觉特性。

---

## 2. 算法流程总览

```
原始音频 (16kHz PCM)
    │
    ▼
1. 预加重 (Pre-emphasis)
    │ 增强高频，补偿声门脉冲的衰减
    ▼
2. 分帧 + 加窗 (Framing & Windowing)
    │ 将连续信号切为短时平稳帧（~25ms）
    ▼
3. FFT → 频谱 (Spectrum)
    │ 时域 → 频域
    ▼
4. Mel 滤波器组 (Mel Filter Bank)
    │ 模拟人耳对频率的非线性感知
    ▼
5. Log 压缩 (Logarithm)
    │ 模拟人耳对响度的对数感知
    ▼
6. DCT → MFCC (Discrete Cosine Transform)
    │ 去相关，能量压缩到低维系数
    ▼
    输出: MFCC 特征向量 (通常 13-40 维)
```

---

## 3. 逐步推导

### 3.1 预加重

语音信号中高频分量通常能量较低，需要用高通滤波器提升：

$$
y(t) = x(t) - \alpha \cdot x(t-1)
$$

其中 $\alpha$ 通常取 0.95 ~ 0.99。

**作用**：
- 补偿声门脉冲的 6dB/oct 衰减
- 增强高频共振峰
- 数值稳定性（使频谱更平坦）

### 3.2 分帧与加窗

语音信号是**非平稳**信号，但在短时间（10-30ms）内可视为**平稳**。分帧将长信号切为短帧，帧移通常为帧长的 50%。

**帧长**：25ms（400 采样点 @16kHz）
**帧移**：10ms（160 采样点 @16kHz）

加窗是为了减少 FFT 的频谱泄漏（spectral leakage），常用 **Hamming 窗**：

$$
w(n) = 0.54 - 0.46 \cos\left(\frac{2\pi n}{N-1}\right), \quad 0 \leq n \leq N-1
$$

```
        ┌──────────────────┐
        │  原始信号片段     │ ← 截取 25ms
        └──────────────────┘
               ×
        ┌──────────────────┐
        │   Hamming 窗      │ ← 两端平滑归零
        └──────────────────┘
               =
        ┌──────────────────┐
        │   加窗后的帧      │
        └──────────────────┘
```

### 3.3 FFT → 幅度谱

对每一帧做 N 点 FFT（通常 N = 512 或 1024），得到复数频谱，取幅度（或能量）：

$$
X(k) = \sum_{n=0}^{N-1} x(n) e^{-j2\pi kn/N}, \quad k = 0, 1, \dots, N-1
$$

$$
P(k) = |X(k)|^2 \quad (\text{能量谱})
$$

此时得到 N/2+1 个频点（对称共轭），例如 512点 FFT → 257个频点。

### 3.4 Mel 刻度

Mel 刻度模拟人耳对频率的非线性感知：

- 低频分辨率高（人耳能区分 200Hz 和 210Hz）
- 高频分辨率低（人耳难以区分 5000Hz 和 5100Hz）

**Hz → Mel 转换**：

$$
m = 2595 \cdot \log_{10}\left(1 + \frac{f}{700}\right)
$$

**Mel → Hz 转换**：

$$
f = 700 \cdot (10^{m/2595} - 1)
$$

```
频率 (Hz) │  Mel 刻度
   200    │    240
   500    │    570
  1000    │   1000
  2000    │   1667
  4000    │   2400
  8000    │   3125
```

### 3.5 Mel 滤波器组

在 Mel 刻度上均匀放置一组三角滤波器（通常 40-80 个），然后将每个滤波器的能量谱加权求和：

```
幅度
  │
  │  /\
  │ /  \    /\    /\
  │/    \  /  \  /  \
  └──────────────────────────→ 频率
        滤波器 1  2  3 ...
```

```python
import numpy as np
import librosa

# 计算 Mel 滤波器组
sr = 16000
n_fft = 512
n_mels = 40
mel_filters = librosa.filters.mel(sr=sr, n_fft=n_fft, n_mels=n_mels)

print(mel_filters.shape)  # (40, 257)  40个滤波器 × 257个频点
```

### 3.6 Log 压缩

将经过 Mel 滤波器组的能量取对数：

$$
S(m) = \ln\left(\sum_k |X(k)|^2 \cdot H_m(k)\right)
$$

其中 $H_m(k)$ 是第 m 个 Mel 滤波器的频率响应。

**取对数的原因**：
- 人耳对响度的感知近似对数
- 将乘性噪声（如信道响应）变为加性，便于后续处理

### 3.7 DCT — 倒谱域

离散余弦变换（DCT）对 Log-Mel 能量做去相关和降维：

$$
C(n) = \sum_{m=0}^{M-1} S(m) \cos\left(\frac{\pi n (m + 0.5)}{M}\right), \quad n = 0, 1, \dots, L-1
$$

**为什么用 DCT 而不是 IDFT**：
- Mel 滤波器组之间有重叠，能量存在相关性
- DCT 有良好的去相关能力，能量集中到前几个系数
- 通常取前 13-40 个系数，去掉高阶系数（包含更多噪音和细节）

**C₀ (第 0 个系数)**：代表帧能量的总体水平，通常丢弃或单独使用。

### 3.8 Δ 和 ΔΔ（一阶和二阶差分）

单帧 MFCC 只包含静态信息，语音是动态过程，需要加入帧间的变化信息：

```python
# 一阶差分 (Δ)
delta = librosa.feature.delta(mfcc, order=1)
# 二阶差分 (ΔΔ)
delta2 = librosa.feature.delta(mfcc, order=2)

# 最终特征: 13 (MFCC) + 13 (Δ) + 13 (ΔΔ) = 39 维
feature = np.vstack([mfcc, delta, delta2])
```

---

## 4. 完整计算代码

```python
import numpy as np
import librosa

def extract_mfcc(audio_path, sr=16000):
    """从音频文件提取 MFCC 特征"""
    audio, _ = librosa.load(audio_path, sr=sr)

    mfcc = librosa.feature.mfcc(
        y=audio, sr=sr,
        n_mfcc=13,            # 保留 13 个系数
        n_fft=512,            # FFT 窗口大小
        hop_length=160,       # 帧移 10ms
        win_length=320,       # 帧长 20ms
        n_mels=40,            # Mel 滤波器数量
        fmin=0,               # 最低频率
        fmax=sr // 2,         # 最高频率 (Nyquist)
    )
    # mfcc.shape: (13, T)  T = 总帧数

    # 一阶、二阶差分
    delta = librosa.feature.delta(mfcc)
    delta2 = librosa.feature.delta(mfcc, order=2)

    # 拼接为 39 维特征
    feature = np.concatenate([mfcc, delta, delta2], axis=0)
    # feature.shape: (39, T)

    return feature


# 可视化
import matplotlib.pyplot as plt

mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
plt.figure(figsize=(10, 4))
librosa.display.specshow(mfcc, x_axis='time', sr=sr, hop_length=160)
plt.colorbar()
plt.title('MFCC')
plt.tight_layout()
```

---

## 5. MFCC 参数调优

| 参数 | 典型值 | 影响 |
|------|--------|------|
| n_mfcc | 13-40 | 太低丢失信息；太高引入噪音 |
| n_fft | 512 / 1024 | 频率分辨率，低频信号需更大 |
| hop_length | 160 (10ms) | 帧重叠，影响时序分辨率 |
| win_length | 320-400 (20-25ms) | 帧长，语音平稳性假设 |
| n_mels | 40-80 | 更多滤波器保留更细粒度信息 |
| fmin / fmax | 0 / sr/2 | 只关注特定频段可提升鲁棒性 |
| window | hamming / hann | 频谱泄漏控制 |
| power | 2.0 (能量) | 2.0 能量谱，1.0 幅度谱 |

### 不同场景的推荐配置

| 场景 | n_mfcc | n_mels | hop_length | 说明 |
|------|--------|--------|-----------|------|
| 语音识别 | 13 | 40 | 10ms | 标准配置 |
| 说话人识别 | 20-30 | 64 | 10ms | 需要更多声纹细节 |
| 语音唤醒 (KWS) | 10-13 | 40 | 10ms | 轻量，实时 |
| 情感识别 | 20-40 | 64-80 | 10ms | 保留韵律信息 |
| 鸟类/动物声音 | 20-40 | 80 | 10-20ms | 高频成分多 |

---

## 6. FBank vs MFCC vs Spectrogram

| 特征 | 维度 | 去相关 | 信息量 | 适用场景 |
|------|------|--------|-------|---------|
| Spectrogram | 257 | ❌ | 多 | 可视化、传统方法 |
| Mel Spectrogram (FBank) | 40-80 | ⚠️ 部分 | 多 | **深度学习模型首选** |
| MFCC | 13-40 | ✅ DCT | 少 | 传统 GMM/DNN、小模型 |

### 为什么深度学习模型更喜欢 FBank

传统 MFCC 的 DCT 步骤做了去相关，但**去相关意味着信息损失**。深度学习模型（CNN / Transformer）有能力自己学习特征间的相关性，因此直接使用 Mel Spectrogram（FBank）效果往往更好。

```python
# 深度学习输入通常用 Mel Spectrogram 而非 MFCC
mel_spec = librosa.feature.melspectrogram(
    y=audio, sr=sr,
    n_mels=80, n_fft=512, hop_length=160
)
# 取 log
log_mel = np.log(mel_spec + 1e-8)
# 输入 CNN: (80, T, 1)
```

**经验法则**：
- 传统模型（GMM / DNN / 小参数量网络）→ **MFCC**
- 深度学习模型（CNN / RNN / Transformer）→ **Log Mel Spectrogram (FBank)**

---

## 7. 变体与改进

| 变体 | 改进 | 适用场景 |
|------|------|---------|
| PNCC (Power-Normalized Cepstral Coefficients) | 替代 log 步骤的幂律非线性，增加中值时间滤波 | **噪音鲁棒** |
| GFCC (Gammatone Cepstral Coefficients) | 用 gammatone 滤波器替代 Mel 滤波器 | **听觉模型更精确** |
| PLP (Perceptual Linear Prediction) | 结合等响度曲线和强度-响度幂律 | **说话人识别** |
| BFCC (Bark Cepstral Coefficients) | 用 Bark 刻度替代 Mel 刻度 | **心理声学替代方案** |
| Spectral Subband Centroids | 用子带质心替代滤波器组能量 | **噪音鲁棒** |

---

## 8. 局限与注意事项

| 局限 | 说明 | 缓解 |
|------|------|------|
| **噪音敏感** | MFCC 在噪声环境下性能下降明显 | 加 VAD、数据增强、噪声鲁棒特征替代 |
| **信息损失** | DCT 截断丢弃了高阶系数 | 改用 FBank（深度学习场景） |
| **短时窗限制** | 20ms 窗口无法捕获长时韵律 | 加入 Δ + ΔΔ，或使用 RNN/Transformer |
| **采样率依赖** | 特征分布随采样率变化 | 统一预处理到 16kHz |
| **非通用性** | MFCC 专为语音设计，非语音音频效果一般 | 改用其他特征（如 VGGish、CLAP） |

---

## 9. 可视化对比

```
         时域波形                     Log Mel Spectrogram                    MFCC
    ┌──────────┐               ┌──────────────┐                 ┌──────────────┐
    │          │               │              │                 │              │
    │  ✨✨    │    FFT+Mel+   │ ████░░░░     │   DCT+截断     │ █░░░▒▒▓▓    │
    │  ✨      │    ────→      │ ██░░▒▒▓▓     │   ────→        │ ▒▒▓▓░░░░    │
    │   ✨✨   │    Log        │ ░░▒▒▓▓██     │                 │ ░░░░▒▒▓▓    │
    │         │               │              │                 │              │
    └──────────┘               └──────────────┘                 └──────────────┘
    amplitude vs time          frequency vs time               compressed features
```

---

## 参考资料

- [Davis & Mermelstein, "Comparison of Parametric Representations for Monosyllabic Word Recognition", 1980](https://ieeexplore.ieee.org/document/1163420)
- [librosa MFCC 文档](https://librosa.org/doc/main/generated/librosa.feature.mfcc.html)
- [librosa Mel 滤波器组](https://librosa.org/doc/main/generated/librosa.filters.mel.html)
- [Wikipedia: Mel-frequency cepstrum](https://en.wikipedia.org/wiki/Mel-frequency_cepstrum)
- [Aurora 项目: 噪声鲁棒特征提取](https://en.wikipedia.org/wiki/Aurora_(project))
- [PNCC: Robust Speech Feature](https://ieeexplore.ieee.org/document/5477163)
