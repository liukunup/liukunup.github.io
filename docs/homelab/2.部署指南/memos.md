---
title: Memos
tags:
  - Memos
createTime: 2025/12/15 11:34:57
permalink: /homelab/deploy/memos/
---

## 🚀 部署指南

1. 创建数据目录：

    ```bash
    mkdir -p /share/Container/memos
    ```

2. 启动容器：

::: tabs

@tab:active Docker

```bash
docker run -d \
  --name memos \
  --restart=unless-stopped \
  -p 5230:5230 \
  -v /share/Container/memos:/var/opt/memos \
  neosmemo/memos:stable
```

@tab Docker Compose

```yaml
services:
  memos:
    image: neosmemo/memos:stable
    container_name: memos
    restart: unless-stopped
    volumes:
      - /share/Container/memos:/var/opt/memos
    ports:
      - 5230:5230
```

:::

## 📝 配置说明

- **端口**: 默认监听 `5230` 端口，Web 界面直接通过该端口访问。
- **数据持久化**: 容器内的 `/var/opt/memos` 目录包含 SQLite 数据库和附件文件，需挂载出来以防数据丢失。
- **访问**: 浏览器打开 `http://<host_ip>:5230` 即可进入 Web 界面，首次访问需注册管理员账号。
- **iOS 客户端**: [**Moe Memos**](https://apps.apple.com/app/id1645288588) 是功能最完善的第三方客户端，免费下载，支持 Markdown 编辑、图片/视频上传、标签管理、离线使用、深色模式、桌面小组件等，并通过 Share Sheet 从其他 App 快速保存内容。

  > **版本兼容性**：Memos 更新可能导致 API 变化，不同版本对客户端要求如下：
  >
  > | Memos 服务器版本 | Moe Memos 兼容性 |
  > |---|---|
  > | v0.27.0 及以上 | 兼容（需使用较新版本客户端） |
  > | v0.22.0 - v0.26.2 | ❌ 不再支持，建议升级服务器或寻找旧版客户端 |
  > | v0.21.0 及更早 | 兼容 |
