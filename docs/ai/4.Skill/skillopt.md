---
title: SkillOpt
createTime: 2026/06/28 00:00:00
permalink: /ai/skill/skillopt/
---

## SkillOpt

[GitHub - microsoft/SkillOpt](https://github.com/microsoft/SkillOpt) — ⭐ 9.5k · Fork 908 · [PyPI](https://pypi.org/project/skillopt/) · MIT

> **Train agent skills like you train neural networks — with epochs, (mini-)batchsize, learning rates, and validation gates — but without touching model weights.**

SkillOpt 是微软开源的 **文本空间优化器**——把 skill 文档当作 frozen LLM agent 的"可训练参数"，用类 DL 的纪律去优化它，但完全不动模型权重。最终产物是一个紧凑的 `best_skill.md`（通常 300-2,000 tokens），可以直接挂回原模型使用，**零推理时额外模型调用**。

---

## 它解决什么问题

现代 agent skill 的三种主流生产方式都有"优化难"问题：

| 方式 | 痛点 |
| :--- | :--- |
| **手写** | 靠人经验，难规模化、难复现 |
| **强 LLM 一次性生成** | 没有反馈信号，不可控 |
| **松散的自修订循环** | 不像 DL 优化器那样有 validation gate，往往越改越差 |

SkillOpt 的解法：**让 skill 文档本身成为可训练状态**——一个独立的 optimizer model 拿到 scored rollouts 后，对单个 skill 文档做有界 add / delete / replace 编辑；只有当候选编辑**严格提升**了 held-out 验证集分数时才被接受。

---

## 核心思想

- **Trainable state = skill 文档**（不是模型权重）
- **Optimizer = 独立模型**，把 scored rollouts 翻译成有界编辑
- **Validation gate**：候选编辑只在 held-out 分数严格提升时落地
- **文本学习率预算** + rejected-edit buffer + epoch-wise slow / meta update → 让文本空间训练稳定
- **部署形态** = `best_skill.md` 300-2,000 tokens，挂回原模型用，**0 额外推理成本**

```
rollout → reflect → aggregate → select → update → evaluate
                                                  │
                            (held-out gate) ◄─────┘
```

---

## 关键结果（来自论文）

在 **6 个 benchmark × 7 个 target model × 3 种执行 harness**（direct chat、Codex CLI、Claude Code CLI）共 52 个 (model, benchmark, harness) 单元上：

- **全部 52 个单元上取得 best 或 tied-best**
- 在 **GPT-5.5** 上，no-skill 基线 → SkillOpt 后的提升：
  - Direct chat：**+23.5**
  - Codex agentic loop：**+24.8**
  - Claude Code：**+19.1**
- 优化得到的 skill artifact **跨模型规模可迁移**、**Codex ⇄ Claude Code harness 互通**、**能零成本迁移到临近 benchmark**

---

## 快速上手

### 安装

```bash
pip install skillopt
# 或源码（含 WebUI 依赖）
git clone https://github.com/microsoft/SkillOpt.git
cd SkillOpt
pip install -e ".[webui]"
```

### 启动 WebUI

```bash
python -m skillopt_webui.app --port 7860 --host 0.0.0.0
# 可选：--share 创建公开 Gradio 分享链接
```

| 标志 | 默认 | 说明 |
| :--- | :--- | :--- |
| `--port` | 7860 | 服务端口 |
| `--host` | `0.0.0.0` | 绑定地址 |
| `--share` | off | 创建 Gradio 公网分享链接 |

### 训练循环

> 完整安装、数据准备、训练/评估命令、配置参考、框架内部实现见 [Documentation & Reproduction Guide](https://microsoft.github.io/SkillOpt/docs/guideline.html)。

最小流程：`config/*.yaml` 选好 benchmark 和 backend → 启动训练 → 监控 WebUI → 产出 `ckpt/best_skill.md` → 挂回原 agent。

---

## 多后端支持

SkillOpt 训练阶段可以调用多种 chat / exec target：

| 类型 | 已有实现 |
| :--- | :--- |
| **Chat 后端** | `openai_chat` · `azure_chat` · `claude_chat` · `qwen_chat` · `minimax_chat` |
| **Exec 后端** | `codex_exec` · `claude_code_exec` |

新增后端需：
1. 在 `skillopt/model/<name>_backend.py` 实现接口
2. 在 `skillopt/model/common.py` + `backend_config.py` 注册
3. 在 `skillopt/model/__init__.py` 路由中接通

> `qwen_backend.py` 和 `minimax_backend.py` 是推荐的模板。

---

## SkillOpt-Sleep（preview · 2026-06-15）

夜间离线自进化伴侣，专为本地编码 agent（Claude Code / Codex / Copilot）设计：

- **回顾** 过去的会话
- **重放** 反复出现的任务
- **整合** 通过 held-out gate 校验的 skill

详见 [`docs/sleep/README.md`](https://github.com/microsoft/SkillOpt/blob/main/docs/sleep/README.md)。

---

## 内置 Benchmark

仓库自带 **6 个 benchmark**（每个 benchmark = `skillopt/envs/<name>/` 包，含 `dataloader.py`、`rollout.py`、`initial.md` 种子 skill）。最简参考实现见 `skillopt/envs/searchqa/`。

新增 benchmark 的契约见 [`docs/guide/new-benchmark.md`](https://github.com/microsoft/SkillOpt/blob/main/docs/guide/new-benchmark.md)。

---

## 生态集成

截至 2026-06-03，下列项目已集成 SkillOpt：

- **[gbrain](https://github.com/garrytan/gbrain)**
- **[gbrain-evals](https://github.com/garrytan/gbrain-evals)** — 评测集成，含 [2026-06-03 skillopt benchmark](https://github.com/garrytan/gbrain-evals/blob/main/docs/benchmarks/2026-06-03-skillopt.md)
- **[darwin-skill](https://github.com/alchaincyf/darwin-skill)**

---

## 与 Anthropic Skill Creator 的关系

| 维度 | Anthropic Skill Creator | Microsoft SkillOpt |
| :--- | :--- | :--- |
| **目的** | 教 Claude **如何写** Skill | 把已有 Skill **优化到最佳** |
| **方法** | 人工访谈 + 起草 → 评估 → 改进循环 | 自动化文本空间优化 + held-out gate |
| **产出** | 通用 Skill 创作方法论 | `best_skill.md` 部署产物 |
| **模型** | 调用 Claude 自身 | 引入独立 optimizer model |
| **自动化** | 半自动（人工驱动） | 全自动（epoch / batchsize / lr 调度） |

> 二者互补：先用人手或 Skill Creator 写好 v0，再用 SkillOpt 训练出 v1+。

---

## 引用

```bibtex
@article{yang2026skillopt,
  title={Skillopt: Executive strategy for self-evolving agent skills},
  author={Yang, Yifan and Gong, Ziyang and Huang, Weiquan and Yang, Qihao and Zhou, Ziwei and Huang, Zisu and Li, Yan and Gao, Xuemei and Dai, Qi and Liu, Bei and others},
  journal={arXiv preprint arXiv:2605.23904},
  year={2026}
}
```

---

## 相关链接

- 仓库：[github.com/microsoft/SkillOpt](https://github.com/microsoft/SkillOpt)
- 主页 / 文档：[microsoft.github.io/SkillOpt](https://microsoft.github.io/SkillOpt/)
- 短链：[aka.ms/skillopt](https://aka.ms/skillopt)
- 论文：[arXiv:2605.23904](https://arxiv.org/abs/2605.23904)
- PyPI：[pypi.org/project/skillopt](https://pypi.org/project/skillopt/)
- v0.1.0 Release：[github.com/microsoft/SkillOpt/releases/tag/v0.1.0](https://github.com/microsoft/SkillOpt/releases/tag/v0.1.0)
- 演示视频：[youtu.be/JUBMDTCiM0M](https://youtu.be/JUBMDTCiM0M)
- 协议：MIT
