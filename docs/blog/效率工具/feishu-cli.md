---
title: 飞书 CLI
createTime: 2026/06/18 00:00:00
permalink: /blog/r5v7n6m1/
---

https://bytedance.larkoffice.com/wiki/ILuTww7Xcimb6GkhH0mcK2f4nS7

## 概述

飞书 CLI（Feishu CLI / Lark CLI）是飞书官方开源的命令行工具，让人类和 AI Agent 都能在终端中操作飞书。覆盖消息、文档、多维表格、电子表格、幻灯片、日历、邮箱、任务、会议、知识库等 14+ 业务域，提供 200+ 命令及 22+ AI Agent Skills。

## 安装

一行命令安装：

```bash
npx @larksuite/cli@latest install
```

AI agent 工具帮助安装：

```bash
帮我安装飞书 CLI：https://open.feishu.cn/document/no_class/mcp-archive/feishu-cli-installation-guide.md
```

更新：

```bash
lark-cli update
```

## 业务域能力

| 类别 | 能力 |
|------|------|
| 💬 即时通讯 | 发送/回复消息，创建和管理群聊，查看聊天记录与话题，搜索消息，下载媒体文件 |
| 📄 云文档 | 创建、读取、更新文档，搜索文档，读写素材与画板 |
| 📁 云空间 | 上传和下载文件，搜索文档与知识库，管理评论 |
| 📊 多维表格 | 创建和管理数据表、字段、记录、视图、仪表盘、自动化流程、表单、角色权限 |
| 📈 电子表格 | 创建、读取、写入、追加、查找和导出表格数据 |
| 🖼️ 幻灯片 | 创建和管理演示文稿，读取内容，增删页面 |
| 📅 日历 | 查看、创建和更新日程，邀请参会人，查找会议室，回复日程邀请 |
| 🎥 视频会议 | 搜索会议记录，查询会议纪要产物与录制 |
| 📧 邮箱 | 浏览、搜索、阅读邮件，发送、回复、转发、归档邮件，管理草稿 |
| ✅ 任务 | 创建、查询、更新和完成任务，管理子任务、评论与提醒 |
| 📚 知识库 | 创建和管理知识空间、节点和文档 |
| 👤 通讯录 | 按姓名/邮箱/手机号搜索用户，获取用户信息 |
| 🎯 OKR | 查询、创建、更新 OKR，管理目标、关键结果、对齐关系 |
| ✍️ 审批 | 查询审批实例，处理审批任务（同意/拒绝/转交） |

## AI Agent 配置

支持 Claude Code、Cursor、Codex、Trae、GitHub Copilot、Windsurf 等主流 AI 工具。

配置完成后重启 Agent，即可通过自然语言操作飞书。

## 三层命令架构

| 层级 | 说明 |
|------|------|
| 快捷命令 | `+` 前缀，人机友好，内置智能默认值和 dry-run 预览 |
| API 命令 | 100+ 精选命令，与飞书开放平台端点一一对应 |
| 通用 API | `lark api` 直接 HTTP 调用全部 2500+ 端点 |

## 资源链接

- GitHub：[larksuite/cli](https://github.com/larksuite/cli)
- npm：[`@larksuite/cli`](https://www.npmjs.com/package/@larksuite/cli)
- 飞书官网：[feishu.cn/feishu-cli](https://www.feishu.cn/feishu-cli)
- 开发者文档：[open.feishu.cn](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu)
- 许可证：MIT
