---
title: IR 与 PRD：两条需求线的对比
tags:
  - 产品经理
  - 敏捷开发
  - IPD
  - 需求管理
createTime: 2026/08/22 10:00:00
permalink: /blog/prd-agile-requirements/
---

## 概述

产品开发中有两条主要的需求线：
- **IR（IPD Requirements）**：IPD 需求线，流程驱动
- **PRD（Product Requirements Document）**：敏捷需求线，用户驱动

核心目标一致：**把用户诉求转化为可交付的产品功能**，但理念和术语不同。

## 需求术语对照表

| PRD/敏捷 | IPD | 说明 |
|-----------|-----|------|
| Epic | Charter | 战略愿景，定义项目目标 |
| Feature | Requirement | 业务功能，客户可感知 |
| User Story | HLR/LLR | 可执行需求描述 |
| Task | Work Item | 团队任务 |
| Backlog | PTS | 需求池管理 |

## IR vs PRD 核心对比

| 维度 | IR（IPD） | PRD（敏捷） |
|------|-----------|-------------|
| **核心理念** | 流程驱动，阶段门控 | 用户驱动，迭代交付 |
| **术语** | Charter/Requirement/HLR/LLR | Epic/Feature/User Story |
| **颗粒度** | 粗 → 细 | 细 → 粗 |
| **变更控制** | 严格变更流程 | 拥抱变化 |
| **文档** | 详细规格文档 | 轻量故事卡 |
| **交付** | 阶段式，大批量 | 迭代式，持续交付 |

## 需求层级对比

```
PRD 线：用户痛点 → Epic → Feature → User Story → AC
IR 线：   愿景   → Charter → Requirement → HLR/LLR → 验收准则
```

## PRD 敏捷术语

### Epic → Feature → User Story

```
Epic（史诗）：战略愿景
  └── Feature（特性）：业务功能
        └── User Story（用户故事）：可交付需求
              └── Task（任务）：开发任务
```

### User Story 标准格式

```
作为 [角色]，我 [想要] [功能]，以便 [目标]
```

**示例：**
```
作为管理员，我能够进行会员积分管理，
以便于划分消费等级提供增值服务
```

### INVEST 原则

| 字母 | 含义 | 说明 |
|------|------|------|
| **I** | Independent | 独立的 |
| **N** | Negotiable | 可协商的 |
| **V** | Valuable | 有价值的 |
| **E** | Estimable | 可估算的 |
| **S** | Small | 小的 |
| **T** | Testable | 可测试的 |

### 3C 原则

- **Card**：书面描述
- **Conversation**：团队讨论
- **Confirmation**：验收标准

### 验收标准示例

```
Given 用户已登录
When 点击"加入心愿单"
Then 商品出现在心愿单列表
And 显示成功提示
```

## IPD 需求术语

### Charter → Requirement → HLR/LLR

```
Charter（任务书）：战略目标
  └── Requirement（需求）：产品需求
        └── HLR（高层需求）：系统级需求
              └── LLR（详细需求）：模块级需求
```

### 需求评审点

| 评审点 | 说明 |
|--------|------|
| TR1 | 需求评审 |
| TR2 | 设计规格评审 |
| TR3 | 概要设计评审 |
| TR4 | 详细设计评审 |

## 何时用哪条线

| 场景 | 推荐 |
|------|------|
| 大型硬件项目 | IR（IPD） |
| 软件产品迭代 | PRD（敏捷） |
| 法规合规需求 | IR（详细文档） |
| MVP 快速验证 | PRD（敏捷） |
| 跨部门协作复杂 | IR（流程管控） |
| 小团队快速响应 | PRD（敏捷） |

## 总结

| | IR（IPD） | PRD（敏捷） |
|---|-----------|-------------|
| **适合** | 大型、复杂、硬件为主 | 小型、软件为主、快速迭代 |
| **优势** | 流程规范、风险可控 | 响应快、用户驱动 |
| **劣势** | 周期长、变更成本高 | 文档少、长期规划难 |

## 参考资料

- [Atlassian - 用户故事](https://www.atlassian.com/zh/agile/project-management/user-stories)
- [华为云 - 敏捷需求管理](https://support.huaweicloud.com/intl/zh-cn/bestpractice-projectman/projectman_practice_1007.html)
