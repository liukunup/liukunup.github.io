---
title: MinerU
tags:
  - OCR
createTime: 2025/10/10 00:00:00
permalink: /ai/app/mineru/
---

==MinerU==是一款将PDF转化为机器可读格式的工具（如markdown、json），可以很方便地抽取为任意格式。 

[MinerU官方文档](https://opendatalab.github.io/MinerU/zh/)

| **解析后端** | **pipeline** | **vlm-transformers** | **vlm-vllm** |
|---|---|---|---|
| 操作系统 | Linux / Windows / macOS | Linux / Windows | Linux / Windows (via WSL2) |
| CPU推理支持 | ✅ | ❌ | ❌ |
| GPU要求 | Turing及以后架构，6G显存以上或Apple Silicon | Turing及以后架构，8G显存以上 | Turing及以后架构，8G显存以上 |
| 内存要求 | 最低16G以上，推荐32G以上 | - | - |
| 磁盘空间要求 | 20G以上，推荐使用SSD | - | -|
| Python版本 | 3.10 - 3.13 | - | - |

## 安装指南

### **使用`pip`或`uv`安装 MinerU**

```shell
# (推荐) 使用 Conda 创建环境
conda create -n MinerU python=3.13
# 激活环境
conda activate MinerU

# 安装 uv
pip install --upgrade pip -i https://mirrors.aliyun.com/pypi/simple
pip install uv -i https://mirrors.aliyun.com/pypi/simple

# 安装 mineru[core]
uv pip install -U "mineru[core]" -i https://mirrors.aliyun.com/pypi/simple

# (可选) 安装 mineru[all] (即 mineru[core,vllm])
uv pip install -U "mineru[all]" -i https://mirrors.aliyun.com/pypi/simple
```

### **使用`Dockerfile`构建 MinerU 镜像**

```shell
# 获取 Dockerfile
wget https://gcore.jsdelivr.net/gh/opendatalab/MinerU@master/docker/china/Dockerfile

# 构建
docker build -t mineru-vllm:latest -f Dockerfile .
```

::: warning
Dockerfile默认使用`vllm/vllm-openai:v0.10.1.1`作为基础镜像， 该版本的vLLM v1 engine对显卡型号支持有限，如您无法在Turing及更早架构的显卡上使用vLLM加速推理，可通过更改基础镜像为`vllm/vllm-openai:v0.10.2`来解决该问题。
:::

::: note
使用vllm加速VLM模型推理，需要满足的条件是：

- 设备包含Turing及以后架构的显卡，且可用显存大于等于8G。
- 物理机的显卡驱动应支持 ==CUDA 12.8== 或更高版本，可通过`nvidia-smi`命令检查驱动版本。
- docker中能够访问物理机的显卡设备。
:::

## 使用指南

### 快速配置模型源

::: tip
MinerU默认使用`huggingface`作为模型源。
若用户网络无法访问Hugging Face，可以通过环境变量便捷地切换模型源为`modelscope`。
:::

```shell
export MINERU_MODEL_SOURCE=modelscope
```

### 通过命令行使用

MinerU内置了命令行工具，用户可以通过命令行快速使用MinerU进行PDF解析。

```shell
# 默认使用pipeline后端解析
mineru -p <input_path> -o <output_path>
```

### 通过 python api 调用

[Python 调用示例](https://github.com/opendatalab/MinerU/blob/master/demo/demo.py)

### 通过 fast api 调用

```shell
mineru-api --host 0.0.0.0 --port 8000
```

::: tip
在浏览器中访问 http://127.0.0.1:8000/docs 查看API文档。
:::

### 启动 gradio webui 可视化前端

```shell
# 使用 pipeline/vlm-transformers/vlm-http-client 后端
mineru-gradio --server-name 0.0.0.0 --server-port 7860

# 或使用 vlm-vllm-engine/pipeline 后端（需安装vllm环境）
mineru-gradio --server-name 0.0.0.0 --server-port 7860 --enable-vllm-engine true
```

::: tip
- 在浏览器中访问 http://127.0.0.1:7860 使用 Gradio WebUI。
- 访问 http://127.0.0.1:7860/?view=api 使用 Gradio API。
:::

### 使用 http-client/server 方式调用

```shell
# 启动 vllm server（需安装vllm环境）
mineru-vllm-server --port 30000
```

::: tip
在另一个终端中通过http client连接vllm server（只需cpu与网络，不需要vllm环境）
```shell
mineru -p <input_path> -o <output_path> -b vlm-http-client -u http://127.0.0.1:30000
```
:::

## 部署指南

我们提供了compose.yml文件，您可以通过它来快速启动MinerU服务。

```shell
wget https://gcore.jsdelivr.net/gh/opendatalab/MinerU@master/docker/compose.yaml
```

::: note
- compose.yaml文件中包含了MinerU的多个服务配置，您可以根据需要选择启动特定的服务。
- 不同的服务可能会有额外的参数配置，您可以在compose.yaml文件中查看并编辑。
- 由于vllm推理加速框架预分配显存的特性，您可能无法在同一台机器上同时运行多个vllm服务，因此请确保在启动vlm-vllm-server服务或使用vlm-vllm-engine后端时，其他可能使用显存的服务已停止。
:::

---

### **启动 vLLM Server 服务**

并通过vlm-http-client后端连接vllm-server

```shell
docker compose -f compose.yaml --profile vllm-server up -d
```

::: tip
在另一个终端中通过http client连接vllm server（只需cpu与网络，不需要vllm环境）
```shell
mineru -p <input_path> -o <output_path> -b vlm-http-client -u http://<server_ip>:30000
```
:::

---

### **启动 Web API 服务**

```shell
docker compose -f compose.yaml --profile api up -d
```

::: tip
在浏览器中访问 http://<server_ip>:8000/docs 查看API文档。
:::

---

### **启动 Gradio WebUI 服务**

```shell
docker compose -f compose.yaml --profile gradio up -d
```

::: tip
- 在浏览器中访问 http://<server_ip>:7860 使用 Gradio WebUI。
- 访问 http://<server_ip>:7860/?view=api 使用 Gradio API。
:::

## 帮助信息

- mineru

```plaintext
mineru --help
Usage: mineru [OPTIONS]

Options:
  -v, --version                   显示版本并退出
  -p, --path PATH                 输入文件路径或目录（必填）
  -o, --output PATH               输出目录（必填）
  -m, --method [auto|txt|ocr]     解析方法：auto（默认）、txt、ocr（仅用于 pipeline 后端）
  -b, --backend [pipeline|vlm-transformers|vlm-vllm-engine|vlm-http-client]
                                  解析后端（默认为 pipeline）
  -l, --lang [ch|ch_server|ch_lite|en|korean|japan|chinese_cht|ta|te|ka|th|el|latin|arabic|east_slavic|cyrillic|devanagari]
                                  指定文档语言（可提升 OCR 准确率，仅用于 pipeline 后端）
  -u, --url TEXT                  当使用 http-client 时，需指定服务地址
  -s, --start INTEGER             开始解析的页码（从 0 开始）
  -e, --end INTEGER               结束解析的页码（从 0 开始）
  -f, --formula BOOLEAN           是否启用公式解析（默认开启）
  -t, --table BOOLEAN             是否启用表格解析（默认开启）
  -d, --device TEXT               推理设备（如 cpu/cuda/cuda:0/npu/mps，仅 pipeline 后端）
  --vram INTEGER                  单进程最大 GPU 显存占用(GB)（仅 pipeline 后端）
  --source [huggingface|modelscope|local]
                                  模型来源，默认 huggingface
  --help                          显示帮助信息
```

- mineru-api

```plaintext
mineru-api --help
Usage: mineru-api [OPTIONS]

Options:
  --host TEXT     服务器主机地址（默认：127.0.0.1）
  --port INTEGER  服务器端口（默认：8000）
  --reload        启用自动重载（开发模式）
  --help          显示此帮助信息并退出
```

- mineru-gradio

```plaintext
mineru-gradio --help
Usage: mineru-gradio [OPTIONS]

Options:
  --enable-example BOOLEAN        启用示例文件输入(需要将示例文件放置在当前
                                  执行命令目录下的 `example` 文件夹中)
  --enable-vllm-engine BOOLEAN    启用 vllm 引擎后端以提高处理速度
  --enable-api BOOLEAN            启用 Gradio API 以提供应用程序服务
  --max-convert-pages INTEGER     设置从 PDF 转换为 Markdown 的最大页数
  --server-name TEXT              设置 Gradio 应用程序的服务器主机名
  --server-port INTEGER           设置 Gradio 应用程序的服务器端口
  --latex-delimiters-type [a|b|all]
                                  设置在 Markdown 渲染中使用的 LaTeX 分隔符类型
                                  ('a' 表示 '$' 类型，'b' 表示 '()[]' 类型，
                                  'all' 表示两种类型都使用)
  --help                          显示此帮助信息并退出
```

## 环境变量

MinerU命令行工具的某些参数存在相同功能的环境变量配置，通常环境变量配置的优先级高于命令行参数，且在所有命令行工具中都生效。

- `MINERU_DEVICE_MODE`
  - 用于指定推理设备
  - 支持`cpu/cuda/cuda:0/npu/mps`等设备类型
  - 仅对`pipeline`后端生效

- `MINERU_VIRTUAL_VRAM_SIZE`
  - 用于指定单进程最大 GPU 显存占用(GB)
  - 仅对`pipeline`后端生效

- `MINERU_MODEL_SOURCE`
  - 用于指定模型来源
  - 支持`huggingface/modelscope/local`
  - 默认为`huggingface`可通过环境变量切换为`modelscope`或使用本地模型

- `MINERU_TOOLS_CONFIG_JSON`
  - 用于指定配置文件路径
  - 默认为用户目录下的`mineru.json`，可通过环境变量指定其他配置文件路径

- `MINERU_FORMULA_ENABLE`
  - 用于启用公式解析
  - 默认为`true`，可通过环境变量设置为`false`来禁用公式解析

- `MINERU_TABLE_ENABLE`
  - 用于启用表格解析
  - 默认为`true`，可通过环境变量设置为`false`来禁用表格解析
