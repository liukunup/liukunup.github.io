---
title: Skill Creator
createTime: 2026/06/16 05:00:00
permalink: /ai/skill/skill-creator/
---

## Anthropic Skill Creator

[GitHub - anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/skill-creator) — ⭐ 151k

> 一个用于创建新 Skill、迭代改进已有 Skill 并衡量其性能的 Skill。

Skill 是包含指令、脚本和资源的文件夹，Claude 在回答时会动态加载它们以提升特定任务的性能。Skill Creator 本身也是一个 Skill，用来教 Claude 如何创建和优化其他 Skill。

---

## 什么是 Skill

Skill 是一个遵循特定结构的文件夹：

```
skill-name/
├── SKILL.md （必需）
│   ├── YAML frontmatter（name, description 必需）
│   └── Markdown 指令内容
└── 资源（可选）
    ├── scripts/    —— 可执行代码
    ├── references/ —— 按需加载的文档
    └── assets/     —— 模板、图标、字体等
```

### 三级加载机制

1. **Metadata**（name + description）—— 始终在上下文中（~100 词）
2. **SKILL.md 正文** —— Skill 触发时加载（理想 < 500 行）
3. **Bundled resources** —— 按需加载（无大小限制，脚本可直接执行）

---

## 创建 Skill 的完整流程

### 1. 捕获意图

首先理解用户的意图，明确四个问题：

- 这个 Skill 应该让 Claude 能做什么？
- 什么情况下触发？（用户的哪些短语/上下文）
- 输出格式是什么？
- 是否需要设置测试用例？

对于有客观可验证输出的任务（文件转换、数据提取、代码生成、固定工作流）建议编写测试用例；主观任务（写作风格、艺术创作）通常不需要。

### 2. 调研

主动询问边界情况、输入/输出格式、示例文件、成功标准、依赖项。

### 3. 编写 SKILL.md

基于访谈结果填充以下组件：

#### frontmatter 字段

```yaml
---
name: my-skill
description: 清晰描述该 Skill 的功能及触发场景
---
```

- **name**: Skill 标识符（小写，连词符分隔空格）
- **description**: 最主要的触发机制。要同时写明白 Skill 做什么 **和** 何时使用它。需要注意 Claude 有"欠触发"倾向——在应当使用 Skill 时没有触发。因此 description 要写得稍微"强势"一点。

#### 正文写作

- **定义输出格式**：使用模板展示期望的输出结构
- **示例**：用 Input / Output 格式展示用例
- **解释原因**：解释为什么某件事重要，而不是用一堆 MUST/NEVER。LLM 很聪明，理解意图后会做得更好
- **避免过拟合**：不要让 Skill 只对测试用例有效；保持通用性

### 4. 渐进式披露

当 Skill 支持多个领域/框架时，按变体组织：

```
cloud-deploy/
├── SKILL.md（工作流 + 选择逻辑）
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

Claude 只读取相关的参考文件。

### 5. 编写测试用例

编写 2-3 个真实的测试 prompt，保存到 `evals/evals.json`：

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "用户的任务描述",
      "expected_output": "期望结果的描述",
      "files": []
    }
  ]
}
```

### 6. 运行与评估

核心评估循环：**起草 → 测试 → 审查 → 改进 → 重复**

**并发运行**: 每个测试用例同时启动两个 subagent——一个带 Skill，一个不带（baseline）。同时启动以保证结果同时完成。

**评分**: 使用 `agents/grader.md` 中的指令，对每个 assertion 评分。将结果保存为 `grading.json`。

**聚合生成 benchmark**:

```bash
python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>
```

**生成审查视图**:

```bash
nohup python <skill-creator-path>/eval-viewer/generate_review.py \
  <workspace>/iteration-N \
  --skill-name "my-skill" \
  --benchmark <workspace>/iteration-N/benchmark.json \
  > /dev/null 2>&1 &
```

审查视图提供两个标签页：
- **Outputs** —— 逐个查看每个测试用例的输出，可留下反馈
- **Benchmark** —— 定量对比（通过率、耗时、token 用量）

### 7. 改进 Skill

根据反馈迭代：
- **从反馈中概括**：不要只修补特定失败案例，要理解根本原因
- **保持 prompt 精简**：检查 transcripts，移除不产生实际价值的指令
- **解释为什么**：用 why 替代 MUST/NEVER
- **提取重复工作**：如果多个测试用例都写了相似的辅助脚本，将其打包到 `scripts/` 中

迭代停止条件：
- 用户满意
- 反馈全部为空（一切正常）
- 没有实质性进展

### 8. Description 优化

Skill 的 `description` 字段决定了 Claude 是否调用该 Skill。提供专门的优化流程：

**创建触发评估查询**: 生成 20 个评估查询（8-10 个应该触发 + 8-10 个不应触发），保存为 JSON。这组查询应覆盖不同表述方式、边缘情况和近义词混淆情况。

**运行优化循环**:

```bash
python -m scripts.run_loop \
  --eval-set <path-to-trigger-eval.json> \
  --skill-path <path-to-skill> \
  --model <model-id> \
  --max-iterations 5 \
  --verbose
```

该脚本将评估集分为 60% 训练集和 40% 保留测试集，每次迭代使用 Claude 提出改进，最多 5 轮。最终选取测试集得分最高的 description 作为最佳结果。

### 9. 打包分发

```bash
python -m scripts.package_skill <path/to/skill-folder>
```

生成 `.skill` 文件，可供用户安装。

---

## 在各平台使用

| 平台 | 说明 |
|------|------|
| **Claude Code** | `/plugin marketplace add anthropics/skills` 安装插件后即可使用 |
| **Claude.ai** | 付费计划已内置这些 Skill；也可上传自定义 Skill |
| **Claude API** | 通过 [Skills API Quickstart](https://docs.claude.com/en/api/skills-guide) 上传和使用 |

---

## 核心原则

- **无惊喜原则**：Skill 不应包含恶意代码或误导性内容
- **解释优于指令**：用理论解释代替生硬的 MUST/NOT
- **从反馈中泛化**：不要只修测试用例，要让 Skill 具备通用性
- **保持简洁**：SKILL.md 控制在 500 行以内
