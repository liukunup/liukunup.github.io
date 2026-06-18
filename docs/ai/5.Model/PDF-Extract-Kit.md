---
title: PDF-Extract-Kit 1.0
createTime: 2026/06/18 00:00:00
permalink: /ai/model/pdf-extract-kit/
---

## 概述

PDF-Extract-Kit 1.0 是上海人工智能实验室 OpenDataLab 开源的高质量 PDF 内容提取工具包。采用模块化设计，集成版面检测、公式检测、公式识别、OCR、表格识别等功能，支持从复杂多样的 PDF 文档中高效提取高质量内容。GitHub 10K+ Stars。

## 功能模块

| 模块 | 说明 |
|------|------|
| 版面检测 | DocLayout-YOLO（默认）、YOLO-v10、LayoutLMv3 |
| 公式检测 | 识别文档中的数学公式区域 |
| 公式识别 | 识别公式内容并输出 LaTeX |
| OCR | 文字检测与识别 |
| 表格识别 | StructTable-InternVL2-1B，支持 LaTeX/HTML/Markdown 输出 |

## 快速使用

```bash
conda create -n pdf-extract-kit-1.0 python=3.10 -y
conda activate pdf-extract-kit-1.0
pip install -r requirements.txt
```

```bash
python pdf_extract.py --pdf input.pdf --output-dir outputs
```

下载模型权重：

```python
from huggingface_hub import snapshot_download

snapshot_download(
    repo_id='opendatalab/pdf-extract-kit-1.0',
    local_dir='./models',
    max_workers=20,
)
```

## 关联项目

- **MinerU**：基于 PDF-Extract-Kit 的 PDF 转 Markdown 工程化工具

## 资源链接

- GitHub：[github.com/opendatalab/PDF-Extract-Kit](https://github.com/opendatalab/PDF-Extract-Kit)
- HuggingFace：[opendatalab/PDF-Extract-Kit-1.0](https://huggingface.co/opendatalab/PDF-Extract-Kit-1.0)
- 许可证：AGPL-3.0
