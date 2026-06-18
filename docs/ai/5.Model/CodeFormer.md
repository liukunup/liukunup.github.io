---
title: CodeFormer
createTime: 2026/06/18 00:00:00
permalink: /ai/model/codeformer/
---

## 概述

CodeFormer 是南洋理工大学 S-Lab 开源的盲人脸修复算法（NeurIPS 2022）。通过 Codebook Lookup Transformer 将离散码本先验引入人脸修复，将问题转化为码预测任务，在严重退化输入下仍能恢复自然面部。支持面部修复、色彩增强、面部修补，可集成 Real-ESRGAN 增强背景。GitHub 18K+ Stars。

## 快速使用

```bash
git clone https://github.com/sczhou/CodeFormer.git
cd CodeFormer
conda create -n codeformer python=3.8 -y
conda activate codeformer
pip install -r requirements.txt
python basicsr/setup.py develop
```

```bash
# 已对齐人脸
python inference_codeformer.py --w 0.5 --has_aligned --test_path inputs

# 整图（含背景增强）
python inference_codeformer.py --w 0.7 --test_path inputs --bg_upsampler realesrgan
```

参数 `w`（0-1）：控制 fidelity 与 quality 的权衡，值越低 fidelity 越高。

## 资源链接

- GitHub：[github.com/sczhou/CodeFormer](https://github.com/sczhou/CodeFormer)
- 论文：[Towards Robust Blind Face Restoration with Codebook Lookup Transformer](https://arxiv.org/abs/2206.11253)
- HuggingFace：[sczhou/CodeFormer](https://huggingface.co/spaces/sczhou/CodeFormer)
- Replicate：[sczhou/codeformer](https://replicate.com/sczhou/codeformer)
- 许可证：S-Lab License 1.0（非商业）
