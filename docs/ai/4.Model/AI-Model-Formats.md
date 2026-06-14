---
title: AI 模型格式与框架详解
createTime: 2026/06/14 00:00:00
permalink: /ai/model/formats/
---

## 概述

本文档详细介绍 AI 模型的各种格式与框架，包括 PyTorch、Safetensors、GGUF、ONNX、Diffusers 等主流格式，以及 Transformers、sentence-transformers 等常用框架。

## 模型格式对比

### PyTorch (.pt, .pth)

PyTorch 的原生模型格式，包含模型权重、结构和优化器状态。

**特点：**
- 包含 Python 对象序列化，需要 pickle 反序列化
- 可包含任意 Python 对象
- 文件可能较大
- 需要 PyTorch 环境运行

**适用场景：** PyTorch 模型训练、调试

### Safetensors (.safetensors)

HuggingFace 推出的安全模型格式。

**特点：**
- 仅存储张量数据，不含 Python 对象
- 加载速度快，内存安全
- 支持分层懒加载
- 无法执行任意代码，更安全

**适用场景：** 生产环境模型部署、跨平台分发

```python
from safetensors import safe_open
with safe_open("model.safetensors", framework="pt") as f:
    tensor = f.get_tensor("weight")
```

### GGUF (GGML Unified Format)

llama.cpp 推出的量化模型格式。

**特点：**
- 支持多种量化级别（Q2_K、Q4_0、Q4_1、Q5_K、Q6_K、Q8_0 等）
- 将元数据、模型权重、词汇表打包在一起
- 无需额外依赖，纯 C/C++ 可运行
- 支持 CPU 推理

**量化级别对比：**

| 格式 | 精度损失 | 内存占用 | 推荐场景 |
|------|----------|----------|----------|
| Q8_0 | 无 | 100% | 最高精度 |
| Q6_K | ~1% | ~75% | 平衡之选 |
| Q5_K_M | ~2% | ~62% | 实用之选 |
| Q4_0 | ~3% | ~55% | 内存受限 |
| Q3_K_M | ~5% | ~46% | 极低显存 |

**适用场景：** 本地推理、边缘设备、低显存环境

### ONNX (.onnx)

开放神经网络交换格式，各框架间的通用格式。

**特点：**
- 框架无关，支持 PyTorch、TensorFlow 等导出
- 跨平台（Windows、Linux、macOS、移动端）
- 支持硬件加速（TensorRT、OpenVINO 等）
- 可用推理引擎执行

**适用场景：** 跨平台部署、生产推理、硬件加速

```python
import onnxruntime as ort
session = ort.InferenceSession("model.onnx")
outputs = session.run(None, {"input": input_data})
```

### Diffusers (.bin, .safetensors)

HuggingFace 推出的扩散模型专用格式。

**特点：**
- 专为扩散模型设计（Stable Diffusion 等）
- 模块化架构（UNet、VAE、Text Encoder 分开存储）
- 支持流式加载、版本控制
- 兼容 Safetensors

**目录结构：**
```
model/
├── model_index.json      # 模型索引
├── scheduler/           # 调度器
├── unet/               # UNet 模型
├── vae/                # VAE 模型
└── text_encoder/        # 文本编码器
```

### TensorFlow (.pb, .ckpt, .h5)

TensorFlow 的模型格式。

**格式类型：**
- **SavedModel** (.pb) - TensorFlow 2 推荐格式
- **Checkpoint** (.ckpt) - 仅权重
- **HDF5** (.h5) - Keras 专用

**适用场景：** TensorFlow 生态、TF Serving

### TFLite (.tflite)

TensorFlow Lite，专为移动端和边缘设备优化的格式。

**特点：**
- 轻量级推理引擎
- 支持 Android、iOS、嵌入式系统
- 量化优化（int8、float16）
- 无需 Python 环境

**适用场景：** 移动端推理、边缘设备、资源受限环境

### TensorRT (.trt, .engine)

NVIDIA 的高性能推理优化引擎。

**特点：**
- NVIDIA GPU 深度优化
- 支持 FP16、INT8、INT4 量化
- 层融合、内核自动调优
- 支持动态形状

**适用场景：** 生产环境 NVIDIA GPU 推理、高吞吐量需求

```python
import tensorrt as trt

# TensorRT 转换后加载
with open("model.engine", "rb") as f:
    engine = trt.Runtime(trt.Logger()).deserialize_cuda_engine(f.read())
```

## 量化格式

### GGUF (GGML Unified Format)

llama.cpp 推出的量化模型格式。

**特点：**
- 支持多种量化级别（Q2_K、Q4_0、Q4_1、Q5_K、Q6_K、Q8_0 等）
- 将元数据、模型权重、词汇表打包在一起
- 无需额外依赖，纯 C/C++ 可运行
- 支持 CPU 推理

**量化级别对比：**

| 格式 | 精度损失 | 内存占用 | 推荐场景 |
|------|----------|----------|----------|
| Q8_0 | 无 | 100% | 最高精度 |
| Q6_K | ~1% | ~75% | 平衡之选 |
| Q5_K_M | ~2% | ~62% | 实用之选 |
| Q4_0 | ~3% | ~55% | 内存受限 |
| Q3_K_M | ~5% | ~46% | 极低显存 |

**适用场景：** 本地推理、边缘设备、低显存环境

### GPTQ

训练后量化格式，主要用于 GPU 推理。

**特点：**
- 4-bit 量化，内存占用低
- 推理速度快于 GGUF
- 需要 GPU 显存
- 与 EXL2 格式类似

**适用场景：** 高性能 GPU 推理

### AWQ (Activation-Aware Weight Quantization)

新兴的量化格式。

**特点：**
- 对激活值敏感的量化
- 高精度保持
- 适合多模态模型
- 支持多种框架

### bitsandbytes (bnb)

轻量级量化库。

**特点：**
- 8-bit 和 4-bit 量化
- 与 Transformers 无缝集成
- 支持参数高效微调
- 动态量化

```python
from transformers import AutoModelForCausalLM
from bitsandbytes import BitsAndBytesConfig

quantization_config = BitsAndBytesConfig(
    load_in_8bit=True,
    llm_int8_threshold=6.0
)
model = AutoModelForCausalLM.from_pretrained(
    "model_name",
    quantization_config=quantization_config
)
```

## 推理引擎

### vLLM

高效的大型语言模型推理引擎。

**特点：**
- PagedAttention 内存管理
- 高吞吐量
- 支持 TensorRT 集成
- 流式输出
- OpenAI 兼容 API

**适用场景：** 生产环境 LLM 服务、高并发需求

```bash
# 启动 vLLM 服务
vllm serve meta-llama/Llama-3-8B --tensor-parallel-size 2
```

### llama.cpp

纯 C/C++ 的 LLM 推理框架。

**特点：**
- 纯 CPU 推理
- 多种量化支持
- 跨平台
- 无外部依赖
- 大量模型格式支持

**适用场景：** CPU 推理、嵌入式设备、快速原型

### DeepSpeed

微软的深度学习优化库。

**特点：**
- ZeRO 优化（1/2/3）
- 混合精度训练
- 推理优化 (DeepSpeed-Inference)
- 支持 Pipeline Parallelism

**适用场景：** 分布式训练、高效率推理

### Accelerate

HuggingFace 的分布式训练工具。

**特点：**
- 统一的分布式训练 API
- 自动设备映射
- 支持多 GPU、TPU
- 混合精度训练

```python
from accelerate import Accelerator

accelerator = Accelerator()
model, optimizer, data = accelerator.prepare(model, optimizer, dataloader)
```

### EXL2 (ExLlamaV2)

专为 Llama 系列优化的推理库。

**特点：**
- 高性能量化
- 支持多量化级别（2-8 bit）
- GPU 加速
- 内存效率高

## 常用框架

### Transformers

HuggingFace 的核心框架，提供预训练模型加载、训练、微调功能。

**特点：**
- 统一 API（AutoModel、AutoTokenizer）
- 支持 50+ 任务类型
- 丰富的模型库（100,000+ 模型）
- 跨框架支持（PyTorch、TensorFlow、JAX）

```python
from transformers import AutoModel, AutoTokenizer

model = AutoModel.from_pretrained("meta-llama/Llama-3-8B")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3-8B")
```

### sentence-transformers

专注于句子嵌入的框架。

**特点：**
- 专门用于语义相似度任务
- 支持 100+ 预训练模型
- 优化了批量推理
- 支持多语言

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("BAAI/bge-m3")
embeddings = model.encode(["Hello world", "Hi there"])
```

### LoRA (Low-Rank Adaptation)

微调技术，非独立模型格式，常配合 Safetensors 使用。

**特点：**
- 参数高效微调（仅训练少量参数）
- 支持量化版本（QLoRA）
- 可合并到基础模型
- 多个 LoRA 可叠加

**文件结构：**
```
lora_adapter/
├── adapter_model.safetensors  # LoRA 权重
├── adapter_config.json       # 配置
└── tokenizer/               # 分词器
```

### MLX (Apple Silicon)

Apple Silicon 的机器学习框架。

**特点：**
- 针对 Apple Silicon 优化（M1/M2/M3/M4）
- 支持 GPU 加速
- 类似 PyTorch API
- 支持量化模型

**适用场景：** Apple 设备本地推理

### mlx-lm (Apple LLM Inference)

专门用于 Apple Silicon 的 LLM 推理库。

**特点：**
- 针对 MLX 优化
- 支持 LoRA 微调
- 量化支持（4bit、8bit）
- 简单易用的 API

```python
import mlx_lm

# 加载模型
model, tokenizer = mlx_lm.load_model("meta-llama/Llama-3-8B")

# 推理
response = mlx_lm.generate(model, tokenizer, prompt="Hello!")
```

### Ollama

本地模型运行管理工具。

**特点：**
- 一键运行模型
- 支持多种模型格式
- OpenAI 兼容 API
- 活跃的社区模型库

```bash
# 运行模型
ollama run llama3

# API 调用
curl http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "prompt": "Why is the sky blue?"
}'
```

### OpenVINO (Intel)

Intel 的推理优化工具包。

**特点：**
- Intel 硬件优化（CPU、iGPU、NPU）
- 模型量化与优化
- 支持 PyTorch、ONNX、TF 模型
- 延迟/吞吐量优化

**适用场景：** Intel 硬件部署、边缘设备

### Xinference

本地推理服务平台。

**特点：**
- 支持多种模型格式（GGUF、PyTorch 等）
- 支持多卡推理
- 提供 OpenAI 兼容 API
- Web UI 管理

**适用场景：** 本地模型服务、私有部署

### Llamafile

单文件可执行模型格式。

**特点：**
- 将模型和推理引擎打包成单个可执行文件
- 无需安装任何依赖
- 支持多种量化级别
- 跨平台（Windows、Linux、macOS）

**适用场景：** 快速部署、无法安装依赖的环境

## 格式选择指南

### 按场景选择

| 场景 | 推荐格式 |
|------|----------|
| 模型训练 | PyTorch (.pt) |
| 生产部署 | Safetensors (.safetensors) |
| 本地推理（低显存） | GGUF (.gguf) |
| 跨平台部署 | ONNX (.onnx) |
| 扩散模型 | Diffusers |
| Apple 设备 | MLX |
| Intel 硬件 | OpenVINO + ONNX |
| 快速分发 | Llamafile |
| 语义搜索 | sentence-transformers |

### 按硬件选择

| 硬件 | 推荐格式 |
|------|----------|
| NVIDIA GPU (高性能) | PyTorch / vLLM / TensorRT |
| NVIDIA GPU (本地推理) | GGUF / EXL2 |
| Apple Silicon | MLX / mlx-lm |
| Intel CPU/GPU | OpenVINO / ONNX |
| AMD GPU | ONNX / GGUF |
| CPU only | GGUF / llama.cpp |
| 移动端/边缘 | TFLite / ONNX |
| 嵌入式设备 | GGUF (Q4_K_M) |

### 按精度需求

| 精度需求 | 推荐格式 |
|----------|----------|
| 最高精度 (研究) | FP16 / BF16 PyTorch |
| 高精度 (生产) | INT8量化 / GPTQ |
| 实用精度 | Q5_K_M / Q4_K_M GGUF |
| 极致压缩 | Q3_K_M / AWQ |

## 格式转换

### PyTorch → Safetensors

```python
from transformers import AutoModel
import safetensors.torch as sf

model = AutoModel.from_pretrained("model_path")
state_dict = model.state_dict()
sf.save_file(state_dict, "model.safetensors")
```

### PyTorch → ONNX

```python
import torch.onnx

model = model.eval()
torch.onnx.export(
    model,
    dummy_input,
    "model.onnx",
    input_names=["input"],
    output_names=["output"]
)
```

### 模型 → GGUF (llama.cpp)

```bash
# 安装llama.cpp
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp

# 转换模型
python convert.py --model model_path --outfile model.gguf

# 量化
./llama-quantize model.gguf model-Q4_K_M.gguf Q4_K_M
```

### LoRA 合并到基础模型

```python
from transformers import AutoModelForCausalLM
from peft import PeftModel

base_model = AutoModelForCausalLM.from_pretrained("base_model")
model = PeftModel.from_pretrained(base_model, "lora_adapter")
merged_model = model.merge_and_unload()
merged_model.save_pretrained("merged_model")
```

### GGUF + LoRA 合并 (llama.cpp)

```bash
# 使用 llama.cpp 合并
./llama-merge \
    --base-model base.gguf \
    --lora lora.gguf \
    --output merged.gguf
```

## 模型大小估算

### LLM 参数量与显存关系

| 参数量 | FP16 权重 | Q8_0 | Q6_K | Q4_K_M | Q3_K_M |
|--------|-----------|------|------|--------|--------|
| 7B | ~14GB | ~10GB | ~7GB | ~5GB | ~4GB |
| 13B | ~26GB | ~18GB | ~13GB | ~9GB | ~7GB |
| 33B | ~66GB | ~45GB | ~33GB | ~24GB | ~18GB |
| 70B | ~140GB | ~95GB | ~70GB | ~50GB | ~38GB |

> 估算值仅供参考，实际显存占用受模型结构、上下文长度等因素影响。

### 多模态模型显存额外开销

| 组件 | 额外显存 |
|------|----------|
| ViT (视觉编码器) | +1-3GB |
| 音频编码器 | +0.5-2GB |
| 4096 ctx KV cache | +2-4GB |

## 常见问题与最佳实践

### 模型选择建议

**Q: 应该使用哪种量化格式？**
- CPU 推理优先 → GGUF
- 高性能 GPU 推理 → GPTQ / EXL2
- 移动端 → TFLite / ONNX
- Apple 设备 → MLX / mlx-lm

**Q: LoRA 和 QLoRA 区别？**
- LoRA：原精度（FP16）微调，合并后占用与基础模型相同
- QLoRA：4-bit 量化微调，极低显存需求，适合消费级 GPU

**Q: 什么时候用 ONNX 而不是其他格式？**
- 需要跨框架部署（PyTorch → TensorRT）
- 需要在多种硬件上运行
- 需要模型可视化/调试

### 性能优化技巧

1. **KV Cache 量化**：对 KV cache 进行量化可显著降低显存占用
2. **批处理大小**：根据显存调整，避免 OOM
3. **上下文长度**：长上下文需要更多显存，计划好量化策略
4. **动态量化 vs 静态量化**：动态量化更简单，静态量化性能更好
5. **混合精度**：BF16 比 FP16 更快，某些硬件需要显式指定

### 安全注意事项

1. **来源验证**：只从可信来源下载模型
2. **模型扫描**：使用 safetensors 避免 pickle 风险
3. **敏感数据**：某些格式会保留完整训练数据
4. **量化风险**：过度量化可能导致模型输出不稳定

## 资源链接

- [HuggingFace 模型库](https://huggingface.co/models)
- [llama.cpp](https://github.com/ggerganov/llama.cpp)
- [ONNX Runtime](https://onnxruntime.ai/)
- [OpenVINO](https://docs.openvino.ai/)
- [MLX](https://github.com/ml-explore/mlx)
- [sentence-transformers](https://sbert.net/)
- [vLLM](https://github.com/vllm-project/vllm)
- [DeepSpeed](https://github.com/microsoft/DeepSpeed)
- [Ollama](https://github.com/ollama/ollama)
- [TensorRT](https://developer.nvidia.com/tensorrt)
- [bitsandbytes](https://github.com/TimDettmers/bitsandbytes)
- [AWQ](https://github.com/mit-han-lab/llm-awq)
- [ExLlamaV2](https://github.com/turboderp/exllamav2)

- [HuggingFace 模型库](https://huggingface.co/models)
- [llama.cpp](https://github.com/ggerganov/llama.cpp)
- [ONNX Runtime](https://onnxruntime.ai/)
- [OpenVINO](https://docs.openvino.ai/)
- [MLX](https://github.com/ml-explore/mlx)
- [sentence-transformers](https://sbert.net/)