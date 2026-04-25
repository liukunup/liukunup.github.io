---
title: 金策智算 · 智能投研决策系统
createTime: 2026/04/25 22:32:52
permalink: /blog/jin-ce-zhi-suan/
tags:
  - 量化交易
  - 投资研究
  - Python
  - 回测系统
  - 开源
---

## 引言

如果你厌倦了凭情绪买卖、追逐小道消息的投资方式，**[金策智算](https://github.com/ScottZt/jin-ce-zhi-suan)** 或许是一个值得关注的开源项目。这是一个基于"三省六部"思想构建的量化投研决策系统，将策略生成、风控审核、执行清算分层解耦，专注于用客观数据辅助投资决策。

![Star History](https://api.star-history.dev/svg?repo=ScottZt/jin-ce-zhi-suan&type=Date)

## 核心理念

金策智算的产品定位非常清晰——**不荐股、不指导买卖、不预测行情、不承诺收益**。它本质上是一个本地化私有行情数据服务与历史回测工具，帮助你把主观想法变成可验证的交易规则，用历史数据检验方法有效性，通过指标监控约束随意操作、控制回撤风险。

整个系统的设计哲学借鉴了唐朝的三省六部制度：

- **不靠情绪**：一切交易决策需经过系统化验证
- **不追消息**：以客观数据为唯一依据
- **有纪律**：通过风控机制约束随意操作

## 架构设计

系统采用"**三省六部**"分层架构，将量化交易的核心流程拆分为决策链路和职能部门：

### 三省（决策主链路）

| 部门 | 职能 |
|------|------|
| 太子院 | 行情数据源接入、前置校验与分发 |
| 中书省 | 策略信号生成 |
| 门下省 | 风控审核与一票否决（止损/回撤/仓位约束） |
| 尚书省 | 执行调度与资金清算 |

### 六部（职能部门）

| 部门 | 职能 |
|------|------|
| 吏部 | 策略注册与生命周期管理 |
| 户部 | 现金、成本、净值核算 |
| 礼部 | 业绩报表与策略排行 |
| 兵部 | 撮合执行与交易管理 |
| 刑部 | 违规记录与风险事件 |
| 工部 | 行情清洗与指标计算 |

这样的分权设计确保了每个环节职责明确，风控独立于策略生成，避免了策略与风控"自己人"的问题。

## 核心功能

### 回测模式

系统支持完整的回测闭环：从数据获取、信号执行到结果分析全链路打通。内置多种回测模板，支持：

- 单标的单策略回测
- 多策略组合回测（投票模式、加权模式）
- 批量任务编排

### 多数据源支持

| 数据源 | 配置项 | 特点 |
|--------|--------|------|
| Default API | `source=default` + API URL/Key | 统一分钟线、批量回测 |
| Tushare | `source=tushare` + Token | 标准化行情、历史补数 |
| AkShare | `source=akshare` | 无需 Token，快速验证 |
| MySQL | `source=mysql` | 本地库直读、低延迟 |
| PostgreSQL | `source=postgresql` | 本地库直读、低延迟 |

### 新增能力（V1.3.0）

- **通达信公式转换**：`POST /api/tdx/compile`
- **通达信公式一键入库**：`POST /api/tdx/import_strategy`
- **BLK 文件解析**：`POST /api/blk/parse`
- **多策略组合回测**：支持投票/加权模式
- **批量任务编排**：BLK 导入标的池 + 公式包导入策略池

### Web 面板

`server.py + dashboard.html` 提供可视化的操作面板，支持策略配置、任务控制、报告查看。

## 快速开始

### 环境要求

- Python 3.8+

### 安装依赖

```bash
git clone https://github.com/ScottZt/jin-ce-zhi-suan.git
cd jin-ce-zhi-suan
pip install -r requirements.txt
pip install tushare akshare fastapi uvicorn
```

### 配置文件

主配置为 `config.json`，密钥类配置推荐写入 `config.private.json`（已被 `.gitignore` 忽略）：

```json
{
  "data_provider": {
    "tushare_token": "your_token",
    "default_api_key": "your_api_key",
    "llm_api_key": "your_llm_key"
  }
}
```

### 启动方式

```bash
# 回测模式（浏览器打开 Web 面板）
python server.py

# 命令行回测
python run_backtest.py --stock 600036.SH --start 2025-01-01 --end 2025-12-31 --capital 1000000

# 实盘监控
python run_live.py
```

Windows 用户可双击 `scripts/win一键启动.bat`，Linux/macOS 用户运行对应 Shell 脚本即可。

## 技术栈

| 组件 | 技术 |
|------|------|
| 后端核心 | Python, FastAPI |
| 策略引擎 | Pandas, NumPy |
| 数据获取 | AkShare, Tushare |
| 前端面板 | 原生 HTML + JavaScript |
| 数据库 | MySQL / PostgreSQL（可选） |

## 安全提示

- **禁止**将 Token/Key 写入 `config.json`，统一写入 `config.private.json` 或环境变量
- `.gitignore` 已忽略 `config.private.json` 与 `.env*`
- Web 面板密钥字段已改为密码框，但**不等于后端鉴权**，请勿在公网暴露未鉴权服务

## 已知限制

- `main.py` 回测时间区间默认写死在代码内（2024-2025），灵活性有限
- 数据源切换依赖配置正确性，配置缺失时会报"无有效数据，回测终止"
- 仪表盘密钥字段仅前端遮挡，不等同于传输加密

## 授权说明

本项目采用 **"个人非商业免费 + 商业需授权"** 模式。个人学习、学术研究、本地自用可免费使用；任何商业托管、SaaS、收费服务需联系作者书面授权。

## 结语

金策智算是一个将系统化思维融入量化研究的开源尝试。"三省六部"的架构设计让策略、风控、执行三者各司其职，减少了人为干预和情绪化决策的空间。对于希望自建量化研究工具的开发者或量化爱好者来说，这是一个值得研究的参考实现。

**GitHub**: [ScottZt/jin-ce-zhi-suan](https://github.com/ScottZt/jin-ce-zhi-suan)（465 ⭐ / 170 Fork）
