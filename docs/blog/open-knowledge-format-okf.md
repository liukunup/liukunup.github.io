---
title: Open Knowledge Format (OKF) 规范解读
tags:
  - 知识管理
  - AI
  - 数据格式
  - Google Cloud
createTime: 2026/06/19 00:00:00
updateTime: 2026/06/19 00:00:00
permalink: /blog/open-knowledge-format-okf/
---

## 前言

随着 AI Agent 的快速发展，如何让 Agent 高效获取和理解知识成为一个关键问题。近日 Google Cloud 发布了 **Open Knowledge Format (OKF)** 规范草案，这是一个开放的、对人和 Agent 都友好的知识表示格式。

## OKF 是什么

OKF 是一个用于表示**知识**（围绕数据和系统的元数据、上下文和精选洞察）的开放格式。它的设计目标是：

- **人类可读** - 无需工具即可阅读
- **Agent 可解析** - 无需定制 SDK 即可解析
- **版本控制友好** - 可在 Git 中对比差异
- **跨工具和组织可移植** - 不依赖特定平台

OKF 刻意保持极简：仅是包含 YAML frontmatter 的 Markdown 文件目录。没有 Schema 注册表、没有中心权威、没有强制工具要求。

## 核心术语

| 术语 | 定义 |
|------|------|
| **Knowledge Bundle** | 自包含的、分层的知识文档集合，分布式单元 |
| **Concept** | Bundle 内的单个知识单元，表示为一个 Markdown 文档 |
| **Concept ID** | 概念文件的路径（去除 `.md` 后缀），如 `tables/users.md` → `tables/users` |
| **Frontmatter** | 文件顶部的 YAML 元数据块 |
| **Body** | Frontmatter 之后的所有内容 |
| **Link** | 概念之间的标准 Markdown 链接 |
| **Citation** | 指向外部来源的链接，用于支撑正文中的声明 |

## Bundle 结构

Bundle 是一个 Markdown 文件的目录树：

```
path/to/bundle/
├── index.md                      # 可选。目录列表，支持渐进式披露
├── log.md                        # 可选。时间顺序的更新历史
├── <concept>.md                  # 根目录的概念
└── <subdirectory>/               # 子目录组织概念分组
    ├── index.md
    ├── <concept>.md
    └── <subdirectory>/
        └── …
```

### 3.1 保留文件名

| 文件名 | 用途 |
|--------|------|
| `index.md` | 目录列表 |
| `log.md` | 更新历史 |

## Concept 文档

每个 Concept 是一个 UTF-8 Markdown 文件，包含两部分：

### 4.1 Frontmatter

```yaml
---
type: <类型名称>                  # 必需
title: <可选显示名>
description: <可选单行摘要>
resource: <底层资源的规范 URI>
tags: [<标签>, <标签>, …]        # 可选
timestamp: <ISO 8601 日期时间>     # 可选最后修改时间
# … 其他生产者定义的键值对
---
```

**必需字段：**

- `type` - 标识概念类型的短字符串。示例：`BigQuery Table`、`API Endpoint`、`Metric`、`Playbook`

**推荐字段（按优先级）：**

- `title` - 人类可读的显示名
- `description` - 单句摘要
- `resource` - 底层资产的唯一标识符
- `tags` - 跨切面分类的标签列表
- `timestamp` - ISO 8601 格式的最后修改时间

### 4.2 Body

Body 是标准 Markdown。建议使用结构化 Markdown（标题、列表、表格、代码块）而非自由文本。

**约定标题：**

| 标题 | 用途 |
|------|------|
| `# Schema` | 资产列/字段的结构化描述 |
| `# Examples` | 具体使用示例 |
| `# Citations` | 支撑正文声明的外部来源 |

### 4.3 示例：绑定到资源的 Concept

```markdown
---
type: BigQuery Table
title: Customer Orders
description: 每个渠道每行一个已完成客户订单。
resource: https://console.cloud.google.com/bigquery?p=acme&d=sales&t=orders
tags: [sales, orders, revenue]
timestamp: 2026-05-28T14:30:00Z
---

# Schema

| Column        | Type      | Description                              |
|---------------|-----------|------------------------------------------|
| `order_id`    | STRING    | 全球唯一订单标识符。        |
| `customer_id` | STRING    | 关联到 [customers](/tables/customers.md) 的外键。 |
| `total_usd`   | NUMERIC   | 美元订单总额。               |
| `placed_at`   | TIMESTAMP | 客户提交订单的时间。         |

# Joins

通过 `customer_id` 与 [customers](/tables/customers.md) 关联。

# Citations

[1] [BigQuery table schema](https://console.cloud.google.com/bigquery?p=acme&d=sales&t=orders)
```

### 4.4 示例：不绑定资源的 Concept

```markdown
---
type: Playbook
title: Incident response — data freshness alert
description: 分诊订单管道新鲜度警报的步骤。
tags: [oncall, incident]
timestamp: 2026-04-12T09:00:00Z
---

# Trigger

当 `orders` 延迟超过预期 SLA 30 分钟时触发新鲜度警报。
参见 [orders table](/tables/orders.md)。

# Steps

1. 检查 [ingestion job dashboard](https://example.com/dash)。
2. …
```

## 跨链接

Concept 可以使用标准 Markdown 链接相互链接：

### 5.1 绝对（bundle 相对）链接

以 `/` 开头，相对于 bundle 根目录解释：

```markdown
参见 [customers table](/tables/customers.md) 了解连接键。
```

**推荐使用此形式**，因为它在文档在子目录内移动时保持稳定。

### 5.2 相对链接

标准 Markdown 相对路径：

```markdown
参见 [相邻概念](./other.md)。
```

### 5.3 链接语义

从概念 A 指向概念 B 的链接表示一种**关系**。关系的具体类型（父/子、引用、关联、依赖等）由周围文本传达，而非链接本身。

## Index 文件

`index.md` 可以出现在任何目录中，枚举目录内容以支持**渐进式披露**：

```markdown
# Section / Group Heading

* [Title 1](relative-url-1) - 项目的简短描述
* [Title 2](relative-url-2) - 项目的简短描述

# Another Section

* [Subdirectory](subdir/) - 子目录的简短描述
```

## Log 文件（可选）

`log.md` 记录变更历史，最新的在前：

```markdown
# Directory Update Log

## 2026-05-22
* **Update**: 为 [Customer Metrics](/tables/customer-metrics.md) 添加了新的 BigQuery 表引用。
* **Creation**: 建立了 [Dataplex Playbook](/playbooks/dataplex.md)。

## 2026-05-15
* **Initialization**: 创建了基础目录结构。
* **Update**: 在根 [index](/index.md) 添加了渐进式披露指南。
```

日期标题必须使用 ISO 8601 `YYYY-MM-DD` 格式。

## 引用

正文引用外部材料时，应在文档底部列出 `# Citations`：

```markdown
# Citations

[1] [BigQuery public dataset announcement](https://cloud.google.com/blog/products/data-analytics/...)
[2] [Internal data quality runbook](https://wiki.acme.internal/data/quality)
```

## 一致性要求

Bundle 在以下条件下符合 OKF v0.1：

1. 树中每个非保留 `.md` 文件包含可解析的 YAML frontmatter 块
2. 每个 frontmatter 块包含非空的 `type` 字段
3. 每个保留文件名（`index.md`、`log.md`）在存在时遵循相应结构

**重要**：消费者不得因以下原因拒绝 Bundle：
- 缺少可选 frontmatter 字段
- 未知 `type` 值
- 未知额外 frontmatter 键
- 损坏的跨链接
- 缺少 `index.md` 文件

这种宽松的消费模式是刻意的——OKF 旨在随着 Bundle 增长、重构和被 Agent 部分生成时保持有用。

## 与其他格式的关系

OKF 刻意接近以下几种成熟模式：

- **LLM "wiki" 仓库** - 使用 Markdown + frontmatter 作为 Agent 可读的知识库
- **个人知识工具** - 如 Obsidian 和 Notion，使用分层 Markdown 和跨链接
- **"Metadata as code"** - 将目录元数据与源代码一起存储，而非单独注册表

OKF 的主要区别在于它是**有规范的**——仅固定互操作性所需的一小部分规则，不强制规定工具。

## 版本控制

本文档指定 OKF 版本 **0.1**。未来修订将采用 `<major>.<minor>` 形式版本：

- **小版本** 升级引入向后兼容的添加（新可选字段、新约定章节标题）
- **大版本** 升级可能做出破坏性更改（重命名必需字段、更改保留文件名）

Bundle 可以通过在 bundle 根 `index.md` 中包含 `okf_version: "0.1"` 来声明目标 OKF 版本。

## 最小示例 Bundle

```
my_bundle/
├── index.md
├── datasets/
│   ├── index.md
│   └── sales.md
└── tables/
    ├── index.md
    ├── orders.md
    └── customers.md
```

## 总结

OKF 的核心价值在于**极简 + 约定**：

| 特性 | OKF 做法 |
|------|----------|
| 可读性 | 纯文本 Markdown |
| 可解析性 | 标准 YAML frontmatter |
| 可版本控制 | 目录树结构 |
| 可移植性 | 无中心依赖 |
| 互操作性 | 仅规定必需字段 |

OKF 不是要取代现有的领域特定 Schema（Avro、Protobuf、OpenAPI 等），而是作为它们的**上层包装**，提供人类和 Agent 都能理解的知识层。

对于 AI Agent 应用场景，OKF 提供了一种简单而实用的知识表示标准，特别适合构建企业内部知识库、API 文档系统、数据字典等场景。

## 相关资源

| 资源 | 链接 |
|------|------|
| OKF 规范原文 | [GoogleCloudPlatform/knowledge-catalog](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) |
| 官方仓库 | [github.com/GoogleCloudPlatform/knowledge-catalog](https://github.com/GoogleCloudPlatform/knowledge-catalog) |
