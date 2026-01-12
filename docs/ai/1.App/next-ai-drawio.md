---
title: Next AI Draw.io
createTime: 2026/01/12 17:55:17
permalink: /ai/rfic672q/
---

[Next AI Draw.io](https://github.com/DayuanJiang/next-ai-draw-io) 是一个基于 Next.js 开发的 AI 驱动的图表创建工具，它集成了 AI 能力与 draw.io，允许用户通过自然语言命令来创建、修改和增强图表。

## 核心特性

- **LLM 驱动图表创建**：利用大语言模型（LLM）通过自然语言指令直接生成和操作 draw.io 图表。
- **图像复制与增强**：支持上传现有的图表或图像，AI 能够自动识别、复制并进行增强。
- **文档生成图表**：支持上传 PDF 文档或文本文件，AI 提取内容并自动生成相应的图表。
- **AI 推理展示**：支持展示 AI 的思考过程（适配 OpenAI o1/o3, Gemini, Claude 等模型）。
- **版本控制**：提供全面的图表历史记录，支持查看和恢复到任意历史版本。
- **交互式聊天**：通过实时聊天界面与 AI 沟通，逐步完善和调整图表细节。
- **云架构图支持**：专门针对 AWS、GCP、Azure 等云平台架构图进行优化支持。
- **动画连接器**：支持创建动态和带动画效果的连接线，增强可视化效果。

## 模型支持

支持多种主流 AI 模型提供商：
- ByteDance Doubao
- AWS Bedrock (默认)
- OpenAI
- Anthropic
- Google AI
- Azure OpenAI
- Ollama
- OpenRouter
- DeepSeek
- SiliconFlow
- ModelScope
- SGLang
- Vercel AI Gateway

## 技术实现

该项目主要采用以下技术栈：
- **Next.js**：作为前端框架和路由管理。
- **Vercel AI SDK**：用于处理流式 AI 响应和多模型支持。
- **react-drawio**：用于图表的渲染和交互操作。

图表以 XML 格式存储（draw.io 标准），AI 解析用户指令后生成或修改对应的 XML 数据。

## 部署与使用

### 在线体验
可以直接访问演示站点：[Live Demo](https://next-ai-drawio.jiang.jp/)

### 桌面应用
提供 Windows, macOS, Linux 版本的桌面客户端下载。

### 自行部署
支持多种部署方式：
- **Docker**：支持使用 Docker 容器化部署。详情见下文 [Docker 部署指南](#docker-部署指南)。
- **EdgeOne Pages**：支持一键部署到腾讯云 EdgeOne Pages。
- **Vercel**：支持部署到 Vercel 平台。
- **Cloudflare Workers**：支持部署到 Cloudflare Workers。

#### Docker 部署指南

如果您想在本地运行，推荐使用 Docker。

1. **安装 Docker**：确保系统已安装 [Docker](https://docs.docker.com/get-docker/)。

2. **直接运行命令**：
   ```bash
   docker run -d -p 3000:3000 \
     -e AI_PROVIDER=openai \
     -e AI_MODEL=gpt-4o \
     -e OPENAI_API_KEY=your_api_key \
     ghcr.io/dayuanjiang/next-ai-draw-io:latest
   ```

3. **使用环境变量文件运行**：
   ```bash
   # 复制示例配置文件
   cp env.example .env
   
   # 编辑 .env 文件配置相关环境变量(AI_PROVIDER, OPENAI_API_KEY 等)
   
   # 启动容器
   docker run -d -p 3000:3000 --env-file .env ghcr.io/dayuanjiang/next-ai-draw-io:latest
   ```

4. **访问应用**：启动成功后，打开浏览器访问 [http://localhost:3000](http://localhost:3000/)。

> **离线部署提示**：如果您的网络无法访问 `embed.diagrams.net`，请参考官方文档中的 [离线部署](https://github.com/DayuanJiang/next-ai-draw-io/blob/main/docs/en/offline-deployment.md) 配置说明。

### MCP Server (预览)
支持作为 MCP (Model Context Protocol) Server 运行，可集成到 Claude Desktop, Cursor, VS Code 等 AI 代理工具中，实现在编辑器内直接生成图表。

