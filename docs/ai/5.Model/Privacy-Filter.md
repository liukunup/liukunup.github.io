---
title: OpenAI Privacy Filter
createTime: 2026/06/18 00:00:00
permalink: /ai/model/privacy-filter/
---

## 概述

Privacy Filter 是 OpenAI 于 2026 年 4 月开源的双向 Token 分类模型，用于文本中 PII（个人身份信息）的检测与脱敏。支持 8 类隐私标签，128K 上下文窗口，单次前向传播即可标注整个序列，通过约束 Viterbi 解码输出连续的 Span。总参数量 1.5B，激活参数量仅 50M（MoE 架构）。在 PII-Masking-300k 基准上 F1 达 96%。

## 检测类别

| 标签 | 说明 |
|------|------|
| private_person | 人名 |
| private_location | 地址/位置 |
| private_contact | 邮箱/电话 |
| private_identifier | 证件号/账号 |
| private_credential | 密钥/密码/API Key |
| private_url | URL 链接 |
| private_date | 日期 |
| private_number | 数字标识 |

## 架构

- **基座**：gpt-oss 风格自回归预训练 → 转换为双向分类器
- **注意力**：Banded attention，band size 128（有效窗口 257 tokens）
- **解码**：BIOES Span + 约束 Viterbi
- **上下文**：128K tokens

## 快速使用

```python
from transformers import pipeline

classifier = pipeline(
    task="token-classification",
    model="openai/privacy-filter",
    aggregation_strategy="simple",
)

text = "My name is Alice and my email is alice@example.com"
spans = classifier(text)
print(spans)
```

```bash
# uv 单文件脚本
pip install transformers torch
python -c "from transformers import pipeline; pipe=pipeline('token-classification', model='openai/privacy-filter', aggregation_strategy='simple'); print(pipe('My email is test@example.com'))"
```

## 资源链接

- GitHub：[github.com/openai/privacy-filter](https://github.com/openai/privacy-filter)
- 博客：[openai.com/index/introducing-openai-privacy-filter](https://openai.com/index/introducing-openai-privacy-filter/)
- HuggingFace：[openai/privacy-filter](https://huggingface.co/openai/privacy-filter)
- 在线 Demo：[huggingface.co/spaces/openai/privacy-filter](https://huggingface.co/spaces/openai/privacy-filter)
- 许可证：Apache-2.0
