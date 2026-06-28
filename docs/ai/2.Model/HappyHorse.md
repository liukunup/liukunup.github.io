---
title: Alibaba HappyHorse 1.0
createTime: 2026/06/18 00:00:00
permalink: /ai/model/happyhorse/
---

## 概述

HappyHorse 1.0（欢乐马）是阿里巴巴 ATH（Alibaba Token Hub）AI 创新事业部推出的视频生成模型系列，由淘宝未来生活实验室（Taotian Future Life Lab）张迪（前快手 VP、可灵 AI 技术负责人）带队研发。2026 年 4 月以匿名身份登陆 Artificial Analysis 视频竞技场后，迅速登顶文生视频与图生视频双榜第一，随后由阿里确认为自家模型。

## 模型规格

| 规格 | 值 |
|------|-----|
| 架构 | Transfusion（统一多模态 Transformer），40 层 |
| 参数量 | ~15B |
| 分辨率 | 720P、1080P |
| 时长 | 3-15 秒 |
| 宽高比 | 16:9、9:16、1:1、4:3、3:4 |
| 支持语言 | 中文、英文、日语、韩语、德语、法语 |
| 推理速度 | ~38 秒/1080P 片段（单卡 H100） |

## 功能列表

| 功能 | 说明 |
|------|------|
| T2V | 文生视频，支持 2500 字符提示词 |
| I2V | 图生视频，首帧图片驱动 + 文本引导 |
| 原生音频 | 音视频同步生成 |
| 视频编辑 | 基于参考视频编辑与续写 |
| 参考图 | 人物/服装/环境参考图引导 |

## 使用

### 阿里云百炼平台

```shell
# 模型 ID: happyhorse-1.0-t2v / happyhorse-1.0-i2v
```

### Replicate

```python
import replicate

output = replicate.run(
    "alibaba/happyhorse-1.0",
    input={
        "prompt": " cinematic footage of a sunset over mountains",
        "resolution": "1080p",
        "aspect_ratio": "16:9",
        "duration": 5,
    }
)
```

## 定价

| 分辨率 | 标准价格 | 会员折扣价 |
|--------|----------|-----------|
| 720P | $0.13/秒 | ~$0.06/秒 |
| 1080P | $0.24/秒 | ~$0.11/秒 |

## 资源链接

- 官网：[happyhorse.cn](https://www.happyhorse.cn)
- Replicate：[alibaba/happyhorse-1.0](https://replicate.com/alibaba/happyhorse-1.0)
- 平台：阿里云百炼、通义千问 App
