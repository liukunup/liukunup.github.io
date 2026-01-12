---
title: Keycloak
createTime: 2026/01/12 09:52:09
permalink: /homelab/deploy/keycloak/
---

## 🚀 部署指南

Keycloak 是一个开源的身份和访问管理解决方案。

### 准备工作

创建用于存储数据库数据的持久化目录：

```bash
mkdir -p /share/Container/keycloak/db
```

### 启动服务

::: tabs

@tab:active Docker Compose (推荐)

使用 Docker Compose 部署 Keycloak 和 PostgreSQL 数据库，确保数据持久化。

```yaml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:26.5.0
    container_name: keycloak
    # 开发模式启动，生产环境请参考官方文档配置 https 配置
    command: start-dev
    environment:
      # 数据库配置
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: password
      # 初始管理员账号
      KC_BOOTSTRAP_ADMIN_USERNAME: admin
      KC_BOOTSTRAP_ADMIN_PASSWORD: admin
    ports:
      - 8080:8080
    depends_on:
      - postgres
    restart: always

  postgres:
    image: postgres:15
    container_name: keycloak_db
    volumes:
      - /share/Container/keycloak/db:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: password
    restart: always
```

@tab Docker CLI (开发模式)

快速启动开发模式，即使重启数据也会丢失（因为使用内存 H2 数据库），仅供测试使用。

```bash
docker run -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26.5.0 \
  start-dev
```

:::

## 📝 初始配置

### 1. 登录管理控制台

1. 浏览器访问 [http://localhost:8080/admin](http://localhost:8080/admin)。
2. 使用环境变量中配置的管理员账号登录（Docker Compose 示例中为 `admin` / `admin`）。

### 2. 创建 Realm (领域)

Keycloak 中的 Realm 相当于一个租户空间。`master` realm 仅用于管理 Keycloak 本身，不建议用于业务应用。

1.  登录后，点击左上角的 **Master** 下拉菜单。
2.  选择 **Create Realm**。
3.  在 **Realm name** 输入框中填写名称，例如 `myrealm`。
4.  点击 **Create** 按钮。

### 3. 创建用户

1.  确保左上角显示的当前 Realm 是你刚创建的 `myrealm`。
2.  点击左侧菜单的 **Users**。
3.  点击 **Create new user**。
4.  填写 **Username**（如 `myuser`），其他信息可选，点击 **Create**。
5.  设置密码：
    *   点击用户详情页顶部的 **Credentials** 标签。
    *   点击 **Set password**。
    *   输入密码并确认。
    *   将 **Temporary** 选项关闭（off），否则用户首次登录时会被强制要求修改密码。
    *   点击 **Save**。

### 4. 验证配置

1.  访问用户账户控制台：[http://localhost:8080/realms/myrealm/account](http://localhost:8080/realms/myrealm/account)。
2.  使用刚才创建的普通用户（`myuser`）登录。
3.  如果能成功进入账户管理页面，说明 Keycloak 基础配置已完成。

## 🔗 参考链接

*   [Keycloak 官方网站](https://www.keycloak.org/)
*   [Keycloak Docker 入门指南](https://www.keycloak.org/getting-started/getting-started-docker)