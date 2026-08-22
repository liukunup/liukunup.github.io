---
title: IR 与 PRD：两条需求线的术语对比
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
- **PRD（敏捷需求）**：敏捷需求线，用户驱动

## 需求术语全景对照

```
PRD 线：Epic → Feature → User Story → Task
IPD 线：SF → IR → SR → AR
```

## 一、PRD 敏捷需求线

### 需求层级

```
Epic（史诗）：战略愿景，数月完成
  └── Feature（特性）：业务功能，数周完成
        └── User Story（用户故事）：可交付需求，一个 Sprint
              └── Task（任务）：开发任务
```

### User Story 标准格式

```
作为 [角色]，我 [想要] [功能]，以便 [目标]
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

## 二、IPD 需求线

### 需求层级

```
SF（系统特性）：产品卖点和销售亮点
  └── IR（初始需求）：客户/市场视角的需求
        └── SR（系统需求）：研发视角，可测试的功能和非功能需求
              └── AR（分配需求）：分配到子系统/模块的需求
```

### 术语详解

| 术语 | 全称 | 说明 | 视角 |
|------|------|------|------|
| **SF** | System Feature | 系统特性，产品卖点和亮点 | 市场/销售 |
| **IR** | Initial Requirement | 初始需求，客户/市场视角 | 客户 |
| **SR** | System Requirement | 系统需求，研发视角，可测试 | 研发 |
| **AR** | Assigned Requirement | 分配需求，分配到子系统/模块 | 子系统 |

### IR → SR → AR 分解关系

```
IR（初始需求）
  ├── 分解
  └── SR（系统需求）
        ├── 分解
        └── AR（分配需求）
              └── 分配到子系统/模块
```

**分解规则：**
- IR → SR：IR 可分解为 SR
- SR → AR：SR 可分解为 AR
- **AR 是最小单位**：不可继续分解
- **状态卷积**：下级需求状态自动向上级卷积

## 三、IR vs PRD 核心对比

| 维度 | IPD 需求线 | 敏捷需求线 |
|------|-----------|-------------|
| **术语** | SF → IR → SR → AR | Epic → Feature → Story |
| **颗粒度** | 粗 → 细 | 细 → 粗 |
| **变更控制** | 严格变更流程 | 拥抱变化 |
| **适用场景** | 硬件/复杂系统 | 软件/互联网产品 |

## 四、需求层级对照表

| PRD 敏捷 | IPD 需求 | 说明 |
|-----------|----------|------|
| Epic | SF（系统特性） | 战略愿景，产品卖点 |
| Feature | IR（初始需求） | 客户视角需求 |
| User Story | SR（系统需求） | 研发视角，可测试需求 |
| Task | AR（分配需求） | 分配到子系统的需求 |

## 五、何时用哪条线

| 场景 | 推荐 |
|------|------|
| 大型硬件项目 | IPD 需求线（SF→IR→SR→AR） |
| 软件产品迭代 | 敏捷需求线（Epic→Story） |
| 法规合规需求 | IPD 需求线（文档详细） |
| MVP 快速验证 | 敏捷需求线 |
| 跨部门协作复杂 | IPD 需求线 |
| 小团队快速响应 | 敏捷需求线 |

## 六、总结

| | IPD 需求线 | 敏捷需求线 |
|---|-----------|-------------|
| **术语** | SF → IR → SR → AR | Epic → Feature → Story → Task |
| **适合** | 硬件、复杂系统 | 软件、互联网产品 |
| **优势** | 流程规范、可追溯 | 响应快、用户驱动 |
| **文档** | 详细规格文档 | 轻量故事卡 |

## 参考资料

- [华为云 CodeArts 需求管理](https://support.huaweicloud.com/intl/zh-cn/productdesc-projectman/codeartsreq_07_2008.html)
- [Atlassian - 用户故事](https://www.atlassian.com/zh/agile/project-management/user-stories)
