---
title: Semantica - 上下文图谱与决策智能引擎
tags:
  - AI
  - 知识图谱
  - 决策智能
  - 因果推理
  - Agent
createTime: 2026/01/20 11:00:00
permalink: /blog/semantica/
---

## 什么是 Semantica？

Semantica 是一个开源的 **Graph-Native Infrastructure（图原生基础设施）**，专注于为 AI 系统提供**结构化上下文**、**因果推理**和**完整决策溯源**。它使 AI 系统的每个答案都能追溯到"为什么会这样给出"。

> Semantica 不是在解释 LLM 的内部推理，而是在解释模型之外的一切。

## 核心定位：黑盒智能的玻璃盒替代方案

传统的 AI 系统往往是黑盒的：输入文本，得到输出，中间发生了什么无从得知。Semantica 致力于成为**玻璃盒（Glass-Box）**替代方案，让 AI 的每一个决策都透明可追溯。

## 解决 AI 部署的六大痛点

### 1. 数据孤岛问题

**问题**：数据库、PDF、API、内部工具各自独立，AI 只能看到显式提供的数据，无法理解数据间的关系。

**解决方案**：
- 语义提取从任意来源摄取数据
- 实体解析统一识别
- 构建单一可查询的上下文图谱

### 2. 黑盒问题

**问题**：AI 给出推荐、分类或行动时，你无法知道**为什么**。

**解决方案**：
- 每个决策记录为带输入、置信度、推理链的一等对象
- 完整的决策日志和审计轨迹
- W3C PROV-O 标准兼容

### 3. 缺失的上下文层

**问题**：向量数据库只做相似性检索，不理解实体、关系或时间变化。

**解决方案**：
- 提供活的可查询实体、关系、决策图谱
- 内置推理和治理
- 跨 Agent 和会话共享

### 4. 调试之墙

**问题**：AI 给出了错误答案，但日志里无法定位是哪条数据或规则导致。

**解决方案**：
- 每条事实都链接到来源
- 可追溯到产生它的确切数据和推理步骤
- 图遍历定位根因

### 5. 幻觉风险

**问题**：LLM 会编造事实，以完全自信的方式给出错误答案。

**解决方案**：
- 每个答案都基于知识图谱
- LLM 响应前先查询已验证的来源事实
- 置信度评分

### 6. 合规噩梦

**问题**：GDPR、EU AI Act、HIPAA 要求可解释性，但大多数团队无法提供满意的审计轨迹。

**解决方案**：
- W3C PROV-O 兼容的谱系记录
- 谁动、什么数据、什么规则全程可查
- 完整可导出的审计轨迹

## 核心模块

Semantica 提供了 13 个生产级模块，分为 8 大能力领域：

### 1. 上下文图谱 (Context Graphs)

知识图谱的基础模块：

| 功能 | 说明 |
|------|------|
| 实体管理 | 统一实体识别和存储 |
| 类型化关系 | 强类型的实体连接 |
| 时间有效性 | 时间窗口内的有效事实 |
| SPARQL 查询 | 标准图查询语言 |

### 2. 决策智能 (Decision Intelligence)

将每个 AI 决策记录为可追溯对象：

```python
import semantica as sm

# 记录决策
decision = sm.add_decision(
    action="approve_loan",
    inputs={"credit_score": 750, "income": 80000},
    outputs={"approved": True, "limit": 50000},
    confidence=0.92
)

# 查找先例
similar = sm.find_precedents(
    decision_type="approve_loan",
    similarity_threshold=0.8
)
```

### 3. 溯源追踪 (Provenance)

W3C PROV-O 标准兼容的谱系追踪：

| 功能 | 说明 |
|------|------|
| 实体溯源 | 每条事实的来源追踪 |
| 关系溯源 | 连接的来源记录 |
| 算法追踪 | 推理过程的完整记录 |
| RDF 导出 | 标准格式输出 |

### 4. 推理引擎 (Reasoning Engines)

可解释的基于规则的推理：

| 引擎 | 特点 |
|------|------|
| Forward Chaining | IF/THEN 规则前向推理 |
| Rete Network | 高吞吐模式匹配 |
| Datalog | 递归查询支持 |
| SPARQL Reasoning | RDF 三元组推理 |

### 5. 本体管理 (Ontology Management)

Schema-First 知识工程：

- 自动生成 OWL 本体
- 导入 OWL/RDF/Turtle/JSON-LD 模式
- HermiT/Pellet 验证
- 自动生成 SHACL 形状

### 6. 时间智能 (Temporal Intelligence)

时序图谱推理：

| 功能 | 说明 |
|------|------|
| Allen Interval | 13 种时间关系 |
| Bi-Temporal | 双时态事实记录 |
| Temporal GraphRAG | 时间感知的 RAG |
| TemporalNormalizer | 智能日期解析 |

### 7. 向量存储 (Vector Store)

语义和混合搜索：

```python
from semantica.embeddings import Embedder

# 统一 API 支持多种后端
embedder = Embedder(provider="fastembed")  # 或 openai, sentence-transformers, bge

# 混合搜索
results = sm.hybrid_search(
    query="客户投诉处理流程",
    vector_weight=0.7,
    graph_weight=0.3,
    fusion="rrf"  # Reciprocal Rank Fusion
)
```

### 8. 图算法 (Graph Algorithms)

网络分析工具集：

| 算法 | 用途 |
|------|------|
| PageRank | 节点重要性 |
| Betweenness Centrality | 桥梁节点识别 |
| Louvain Community | 社区检测 |
| Node2Vec | 图嵌入 |
| Link Prediction | 链接预测 |

## 技术架构

```
┌────────────────────────────────────────────────────────────────┐
│                         Semantica                              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    AI Frameworks                         │  │
│  │   LangGraph · CrewAI · LlamaIndex · AutoGen · Claude   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Layer (REST + MCP)                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │  Context   │ │  Decision  │ │  Reasoning  │ │  Ontology  │ │
│  │   Graphs   │ │Intelligence│ │  Engines   │ │ Management │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │  Temporal  │ │  Vector    │ │  Graph     │ │  Provenance │ │
│  │ Intelligence│ │   Store    │ │  Storage   │ │            │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
│                              │                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Polyglot Graph Storage                      │  │
│  │   Neo4j · FalkorDB · RDF · Apache Jena · AWS Neptune    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Enterprise Data Platforms                    │  │
│  │        Snowflake · Databricks · Unity Catalog           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## 兼容的 AI 框架

### Agentic 框架

| 框架 | 状态 |
|------|------|
| Agno | ✅ 原生支持 |
| LangGraph | 🔄 开发中 |
| CrewAI | 🔄 开发中 |
| LlamaIndex | 🔄 开发中 |
| AutoGen | 🔄 开发中 |
| Claude Code | ✅ 原生支持 |

### 图数据库后端

| 数据库 | 查询语言 |
|--------|----------|
| Neo4j | Cypher |
| FalkorDB | Cypher |
| AWS Neptune | Gremlin / SPARQL |
| Apache AGE | Cypher |
| Blazegraph | SPARQL |
| Apache Jena | SPARQL |

### 向量存储后端

| 后端 | 特点 |
|------|------|
| FAISS | Meta 开源，多索引类型 |
| Pinecone | 托管服务 |
| Weaviate | AI 原生搜索 |
| Qdrant | 高性能向量 |
| Milvus | 可扩展相似性 |
| PgVector | PostgreSQL 扩展 |

## 快速开始

### 安装

```bash
pip install semantica
```

### 基本使用

```python
import semantica as sm

# 初始化
sm.init(project="my_ai_app")

# 添加上下文
sm.add_context(
    entities=[
        {"id": "customer_001", "type": "Customer", "name": "张三"},
        {"id": "order_001", "type": "Order", "amount": 50000}
    ],
    relations=[
        {"from": "customer_001", "to": "order_001", "type": "placed"}
    ]
)

# 查询
results = sm.query("张三下了什么订单？")

# 查看决策溯源
trace = sm.get_provenance(results[0])
print(trace.sources)  # [(entity_id, confidence, source_doc)]
```

## 适用领域

Semantica 专为**容错性要求高、受监管的领域**设计：

| 领域 | 合规要求 |
|------|----------|
| 能源 | 审计追踪 |
| 金融 | 监管合规 |
| 医疗健康 | HIPAA |
| 制药与生命科学 | 完整溯源 |
| 法律 | 可解释决策 |
| 主权基础设施 | 数据主权 |

## 优势与劣势

### 优势

| 特性 | 说明 |
|------|------|
| 完全开源 | MIT 许可，完全可审计 |
| 零锁定 | 可在任意基础设施运行 |
| 完整溯源 | W3C PROV-O 标准 |
| 因果推理 | 13 种时间关系 |
| 多后端支持 | 统一 API 切换图数据库 |
| 企业集成 | Snowflake、Databricks 原生支持 |

### 劣势

| 问题 | 说明 |
|------|------|
| 相对年轻 | v0.6.6，生产验证中 |
| 学习曲线 | 需要理解图谱和因果概念 |
| 资源需求 | 知识图谱维护需要资源 |

## 相关资源

- [官方文档](https://docs.getsemantica.ai/)
- [GitHub 仓库](https://github.com/semantica-agi/semantica)
- [Discord 社区](https://discord.com/invite/sV34vps5hH)

## 总结

Semantica 为构建**可信赖、可解释的 AI 系统**提供了图原生的基础设施。通过上下文图谱、决策智能和完整溯源的组合，它解决了 AI 部署中的六大核心痛点。MIT 许可的开源策略和零锁定设计使其成为企业级 AI 落地的可靠选择。
