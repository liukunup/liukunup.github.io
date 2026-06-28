---
title: RexUniNLU
createTime: 2026/06/18 00:00:00
permalink: /ai/model/rexuninlu/
---

## 概述

RexUniNLU 是阿里巴巴达摩院开发的零样本通用自然语言理解模型，基于 DeBERTa-v2 架构。通过显式 Schema 约束机制，在统一框架下支持 10+ 种 NLU 任务，包括信息抽取（实体识别、关系抽取、事件抽取）和文本分类等，无需微调即可直接使用。发布在 ModelScope: `iic/nlp_deberta_rex-uninlu_chinese-base`。

## 支持任务

| 任务 | 说明 |
|------|------|
| 命名实体识别 (NER) | 识别人名、地名、机构名等实体 |
| 关系抽取 (RE) | 识别实体间语义关系 |
| 事件抽取 (EE) | 提取时间、地点、参与者等事件信息 |
| 文本分类 | 新闻分类、主题分类等 |
| 情感分析 | 正面/负面/中性情感判断 |
| 自然语言推理 (NLI) | 判断句子间逻辑关系 |
| 属性情感抽取 (ABSA) | 针对特定属性的情感分析 |
| 机器阅读理解 | 根据文章回答问题 |
| 共指消解 | 识别指向同一实体的不同表述 |
| 文本匹配 | 判断文本相似度或相关性 |

## 架构

- **基座**：DeBERTa-v2（解耦注意力机制）
- **方法**：RexUniNLU — Recursive Method with Explicit Schema Instructor
- **层次**：字符、词语、句子三级同步语义关联
- **模型大小**：~400MB（Base 版本）

## 快速使用

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

nlp = pipeline(
    task=Tasks.nli,
    model='iic/nlp_deberta_rex-uninlu_chinese-base',
)

result = nlp("今天的天气真好")
print(result)
```

关系抽取：

```python
extractor = pipeline(
    task='rex-uninlu',
    model='iic/nlp_deberta_rex-uninlu_chinese-base',
)

result = extractor("马云创立了阿里巴巴")
print(result)
```

## 资源链接

- ModelScope：[damo/nlp_deberta_rex-uninlu_chinese-base](https://modelscope.cn/models/damo/nlp_deberta_rex-uninlu_chinese-base)
- 论文：[RexUniNLU: Recursive Method with Explicit Schema Instructor for Universal NLU](https://arxiv.org/abs/2409.05275)
- GitHub：[thyecust/rexuninlu_chinese](https://github.com/thyecust/rexuninlu_chinese)
- 许可证：Apache-2.0
