---
title: 语音识别里的 CTC / AED / Transducer
createTime: 2026/06/16 04:30:00
permalink: /blog/asr-ctc-aed-transducer/
---

## 引言

语音识别（ASR）的核心问题是：给定一段音频特征序列，找到最可能的文本序列。这里的核心矛盾在于音频帧数远大于输出文本长度，如何解决"长度对齐"问题是 ASR 模型设计的核心挑战。

主流的三种建模方式分别是 **CTC**、**AED（Attention Encoder-Decoder）** 和 **Transducer（RNN-T）**。

---

## 1. 全景概览

| 模型 | 核心思想 | 对齐方式 | 是否条件独立 | 从左到右流式 | 代表系统 |
|------|---------|---------|------------|------------|---------|
| **CTC** | 引入 blank 标签，路径合并 | 单调硬对齐 | ✅ 帧间独立 | ✅ | DeepSpeech, WeNet, Whisper (部分) |
| **AED** | Attention 自动对齐 | 软对齐 | ❌ 依赖上下文 | ❌ 需要整句 | LAS, Whisper, Google USM |
| **Transducer** | 联合网络 + 循环对齐 | 单调软对齐 | ❌ 依赖历史 | ✅ | RNN-T (Google), Conformer-Transducer (NVIDIA), Zipformer (k2) |

---

## 2. CTC (Connectionist Temporal Classification)

CTC 发表于 2006 年（Graves et al.），是最早解决序列对齐问题的端到端方案。

### 2.1 核心思想

在输出标签集中加入 **blank (-)** 符号，允许模型输出重复标签和 blank，然后通过一条合并规则将模型输出变为最终文本：

```
规则: 合并连续重复 -> 删除 blank

例如:
模型输出:  hh-e---l---l--o---
合并后:    hello

原始对齐:  h > h > - > e > - > - > - > l > - > - > l > - > - > o > - > -
最终结果:  h     e                 l                 l               o
```

这允许 T 帧音频输出 T 个标签（每帧一个），然后合并为远少于 T 的文本。

### 2.2 模型结构

```
Input: X = (x1, x2, ..., xT)  (音频特征)
    │
    ▼
Encoder (CNN + RNN / Transformer / Conformer)
    │
    ▼
Dense + Softmax  (输出每个时刻的概率分布)
    │
    ▼
Output: 每个时刻输出一个 token (含 blank)
```

### 2.3 模型公式

```
P(Y|X) = sum_{所有对齐路径 pi} P(pi|X)

P(pi|X) 是每条路径上各帧概率的乘积
```

训练时用**前向后向算法**高效计算所有合法路径的概率和，无需知道对齐位置。

### 2.4 前向后向算法示意

CTC 的前向后向算法在时间步和标签序列上构造网格，所有从左上到右下、只能向右或向下走的路径都是合法对齐：

```
    y3  ┌─────┐─────┐─────┐
    y2  ┌─────┐─────┐─────┐
    y1  ┌─────┐─────┐─────┐
    y0  ┌─────┐─────┐─────┐  (y0 = blank)
        t1    t2    t3    t4
```

每条路径的概率是路径上各时刻输出概率的乘积，总概率是所有路径的概率和。

### 2.5 解码策略

```python
# 贪心解码 (Greedy)
def ctc_greedy_decode(logits):
    """
    logits: (T, vocab_size)
    """
    tokens = logits.argmax(dim=-1)  # 每个时刻取最大概率
    # 合并重复
    merged = []
    prev = None
    for t in tokens:
        if t != prev:
            merged.append(t)
            prev = t
    # 删除 blank
    result = [t for t in merged if t != blank_id]
    return result


# Beam Search 解码
def ctc_beam_search(logits, beam_size=10):
    """CTC Beam Search 考虑所有路径的概率"""
    T, V = logits.shape
    beams = [([], 0.0)]  # (token序列, log概率)

    for t in range(T):
        new_beams = {}
        for prefix, score in beams:
            for v in range(V):
                new_score = score + logits[t, v]
                if v == blank_id:
                    key = prefix
                elif prefix and v == prefix[-1]:
                    # 重复非 blank 字符可能表示连续
                    key = prefix + (v,)  # 用特殊标记区分
                else:
                    key = prefix + (v,)

                if key not in new_beams or new_score > new_beams[key]:
                    new_beams[key] = new_score

        beams = sorted(new_beams.items(), key=lambda x: x[1], reverse=True)[:beam_size]

    # 去除 blank 并返回最优路径
    return [t for t in beams[0][0] if t != blank_id]
```

### 2.6 优缺点

| 优点 | 缺点 |
|------|------|
| 结构简单，纯 Encoder | 帧间独立假设过强 |
| 流式友好（每帧独立输出） | 无法建模输出之间的依赖关系 |
| 训练稳定，容易收敛 | 需要语言模型辅助才能达到最优效果 |
| 内存占用低 | 对长序列的建模能力有限 |

---

## 3. AED (Attention-based Encoder-Decoder)

AED 也叫 LAS (Listen, Attend and Spell)，是经典 Encoder-Decoder + Attention 架构在 ASR 上的应用。

### 3.1 核心思想

Encoder 将音频编码为隐层序列，Decoder 在 Attention 的帮助下逐个生成输出 token：

```
Audio ──→ Encoder ──→ Attention ──→ Decoder ──→ "<sos> hello <eos>"
                   ↑              │
                   └──────────────┘
                   (Cross Attention)
```

Decoder 在生成第 t 个 token 时，会通过 Attention 从 Encoder 输出中获取所需的信息。

### 3.2 模型结构

```
Input: X = (x1, x2, ..., xT)
    │
    ▼
Encoder (Conformer / Transformer)
    │ 输出: H = (h1, h2, ..., hT)
    │
    ▼
Cross Attention (Query = Decoder 状态, Key/Value = H)
    │
    ▼
Decoder (自回归) ─── 前一个输出作为当前输入 ───┐
    │                                            │
    ▼                                            │
Dense + Softmax                                  │
    │                                            │
Output: y_t                                      │
    └────────────────────────────────────────────┘
```

### 3.3 Teacher Forcing 训练

训练时，Decoder 使用真实的上一时刻标签作为输入，而不是自己的预测：

```python
def train_step(encoder_output, y_true):
    """
    y_true: 目标文本序列, 如 ["<sos>", "h", "e", "l", "l", "o", "<eos>"]
    """
    decoder_input = y_true[:-1]  # 去掉 <eos>
    decoder_target = y_true[1:]  # 去掉 <sos>

    # Decoder 用真实历史进行预测
    logits = decoder(encoder_output, decoder_input)
    # logits: (U, vocab_size)

    loss = cross_entropy(logits, decoder_target)
    return loss
```

### 3.4 自回归推理

```python
def aed_decode(encoder_output, sos_id, eos_id, max_len=100):
    """
    逐个生成 token，直到遇到 <eos>
    """
    ys = [sos_id]
    for _ in range(max_len):
        logits = decoder(encoder_output, ys)
        next_token = logits[-1].argmax()  # 取最后一个位置
        ys.append(next_token)
        if next_token == eos_id:
            break
    return ys[1:-1]  # 去除 sos 和 eos
```

### 3.5 Attention 可视化

```
Attention 权重矩阵 (Decoder 输出位置 × Encoder 输入位置):

        音频帧 t1  t2  t3  t4  t5  t6  t7  t8
输出 y1   0.9 0.1  0   0   0   0   0   0      ← "h" 对齐到 t1
输出 y2   0.1 0.3 0.5 0.1  0   0   0   0      ← "e" 对齐到 t2-t3
输出 y3    0   0  0.2 0.6 0.2  0   0   0      ← "l" 对齐到 t3-t5
输出 y4    0   0   0   0  0.3 0.5 0.2  0      ← "l" 对齐到 t5-t7
输出 y5    0   0   0   0   0  0.2 0.4 0.4     ← "o" 对齐到 t6-t8
```

AED 的 Attention 是**软对齐**，不强制单调，Decoder 可以灵活地关注任意音频位置。

### 3.6 优缺点

| 优点 | 缺点 |
|------|------|
| 建模输出间的依赖关系 | 推理时无法并行（自回归） |
| 对长距离依赖建模强 | 不能流式（需整句音频） |
| 不需要语言模型辅助 | Attention 可能存在对齐漂移 |
| 在非流式场景下精度最高 | 训练和推理的 mismatch (Exposure Bias) |

---

## 4. Transducer (RNN-T)

Transducer（RNN Transducer）发表于 Graves 2012，结合了 CTC 的单调对齐和 AED 的建模能力。

### 4.1 核心思想

Transducer 引入了两个网络 + 一个联合网络：

```
音频 Encoder (Audio Encoder)         文本 Decoder (Prediction Network)
    │                                         │
    ▼                                         ▼
音频隐层 h1, h2, ..., hT             文本隐层 gu (基于历史输出)
    │                                         │
    └──────────────┬──────────────────────────┘
                   ▼
          Joint Network (联合网络)
                   │
                   ▼
              Softmax 输出
```

在时间 t，模型在输出若干个 token 后，可以选择进入下一帧（用 blank 表示"该帧处理完了"）。

### 4.2 对齐路径示例

```
音频帧:   t1         t2          t3
         │           │            │
输出:    h → e → - → l → l → - → o → - → - → <eos>
         │         │           │
         t1 输出3个  t2 输出2个   t3 输出2个
         token      token       token
```

Transducer 的对齐路径指定了两件事：
1. 每个音频帧上输出几个 token（可以为 0）
2. 输出顺序由 Prediction Network 的循环状态决定

### 4.3 模型详解

```
Encoder:  将 T 帧音频编码为 H_enc = (h1, h2, ..., hT)
Prediction: 将 U 个历史文本 token 编码为 H_pred = (pu, pu, ..., pu)

Joint: z_t,u = Joint(h_t, p_u)

输出: y_t,u = Softmax(z_t,u)
```

### 4.4 前向后向算法

与 CTC 类似，Transducer 也用前向后向算法在二维网格上求和所有合法路径：

```
    y3  ┌─────┐─────┐─────┐
    y2  ┌─────┐─────┐─────┐
    y1  ┌─────┐─────┐─────┐
    y0  ┌─────┐─────┐─────┐  (y0 = blank)
        t1    t2    t3    t4
```

在 Transducer 的网格中：
- **向右移动**：输出下一个非 blank token（依赖于之前的历史输出）
- **向下移动**：输出 blank，表示当前帧处理完毕，移动到下一帧

### 4.5 流式推理

```
def transducer_streaming_decode(encoder_stream, prediction, blank_id):
    """
    encoder_stream: 逐帧输出的 Encoder 隐层
    """
    y = []  # 解码结果
    p_state = prediction.initial_state()  # Prediction Network 的初始状态

    for h in encoder_stream:  # 逐帧输入
        # 在当前帧上尽可能多地输出 token
        while True:
            p, p_state = prediction.step(y[-1] if y else blank_id, p_state)
            logits = joint(h, p)
            token = logits.argmax()

            if token == blank_id:
                break  # 当前帧处理完毕，进入下一帧
            else:
                y.append(token)  # 输出一个预测 token

    return y
```

### 4.6 优缺点

| 优点 | 缺点 |
|------|------|
| 天然支持流式 | 训练比 CTC 复杂 |
| 建模输出间依赖 | 推理速度比 CTC 慢（内循环） |
| 不需要外部语言模型 | 实现复杂度高 |
| 被 Google 大规模验证 | 长文本可能存在偏差 (Label Bias) |

---

## 5. 三种模型详细对比

### 5.1 对齐方式

```
Audio: [t1] [t2] [t3] [t4] [t5]
Text:   h    e    l    l    o

CTC:      t1→h  t2→e  t3→l  t4→blank  t4→l  t5→o
          每帧必须输出一个 token（含 blank）

AED:      Decoder 通过 Attention 自动关注相关帧
          不要求单调对齐

Transducer:  t1→h→e→blank  t2→l→blank  t3→l→blank  t4→o
            每帧输出 0~N 个 token，blank 表示帧结束
```

### 5.2 条件独立性

| 模型 | P(y_u | 音频, 历史) | 说明 |
|------|-------------|------|
| CTC | P(y_t | X) | 每帧独立，历史依赖仅来自解码时的合并规则 |
| AED | P(y_u | X, y_1:u-1) | Decoder 自回归，完全依赖历史 |
| Transducer | P(y_u | X, y_1:u-1, t) | 依赖音频、历史输出和当前帧位置 |

### 5.3 训练和推理复杂度

| 模型 | 训练计算量 | 推理计算量 | 解码速度 |
|------|-----------|-----------|---------|
| CTC | O(TV) | O(TV) | 最快 |
| AED | O(TU) | O(U^2 + TU) | 最慢（自回归） |
| Transducer | O(TU) | O(TU) | 中等（内循环） |

(T=帧数, U=文本长度, V=词表大小)

---

## 6. 混合方案

很多现代 ASR 系统融合了多种方法：

### CTC + AED (Joint Training)

```
Loss = lambda * Loss_ctc + (1 - lambda) * Loss_aed
```

Encoder 共享，同时训练两个分支。推理时可以用 CTC 做前缀束搜索或 AED 自回归。

代表：**Whisper** 使用了 AED，但训练时也用了 CTC 辅助损失。**WeNet** 将 CTC 和 AED 做了联合训练和动态解码。

### CTC + Transducer

```
Loss = lambda * Loss_ctc + Loss_transducer
```

CTC 辅助 Transducer 训练已在多家公司的产品中得到验证。

---

## 7. 选型建议

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| 离线高精度 | AED (Conformer + Transformer Decoder) | 精度最高，无延迟约束 |
| 流式实时 | Transducer (Conformer / Zipformer) | 延迟低，效果好 |
| 资源受限设备 | CTC (DS-CNN / Mamba) | 结构简单，参数量小 |
| 兼顾离线和流式 | WeNet (CTC + AED 联合) | 统一模型，两种模式 |
| 多语种 | Whisper (AED) | 训练数据量大，泛化好 |

---

## 8. 开源项目参考

| 项目 | 模型类型 | 语言 | 特点 |
|------|---------|------|------|
| [Whisper](https://github.com/openai/whisper) | AED | Python | OpenAI 出品，多语言 |
| [WeNet](https://github.com/wenet-e2e/wenet) | CTC + AED | Python/C++ | 联合训练，工业级 |
| [k2 / icefall](https://github.com/k2-fsa/icefall) | CTC / Transducer | Python/C++ | 基于 FSA，效率高 |
| [NVIDIA NeMo](https://github.com/NVIDIA/NeMo) | CTC / AED / Transducer | Python | 全方案覆盖 |
| [FunASR](https://github.com/modelscope/FunASR) | CTC / AED / Transducer | Python | 达摩院，中文友好 |
| [Espnet](https://github.com/espnet/espnet) | CTC / AED / Transducer | Python | 学术界主流 |

---

## 参考资料

- [Graves et al., "Connectionist Temporal Classification", ICML 2006](https://www.cs.toronto.edu/~graves/icml_2006.pdf)
- [Graves, "Sequence Transduction with Recurrent Neural Networks", 2012](https://arxiv.org/abs/1211.3711)
- [Chan et al., "Listen, Attend and Spell", 2015](https://arxiv.org/abs/1508.01211)
- [Google RNN-T: Streamable End-to-end Speech Recognition](https://arxiv.org/abs/1811.06621)
- [Conformer: Convolution-augmented Transformer for Speech Recognition](https://arxiv.org/abs/2005.08100)
- [Zipformer: A Faster and Better Encoder for ASR](https://arxiv.org/abs/2305.15930)
- [WeNet: Production First End-to-End Speech Recognition Toolkit](https://arxiv.org/abs/2102.01547)
