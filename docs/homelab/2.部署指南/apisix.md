---
title: APISIX
createTime: 2026/01/11 17:41:15
permalink: /homelab/deploy/apisix/
---

APISIX + etcd + apisix-dashboard 部署指南（含 OIDC 插件与 RBAC 权限控制）

## 1. 组件说明

- **APISIX**：高性能、可扩展的 API 网关。
- **etcd**：APISIX 的配置中心。
- **apisix-dashboard**：APISIX 的可视化管理界面。
- **OIDC 插件**：支持 OpenID Connect 认证。
- **RBAC**：基于角色的访问控制。

## 3. Docker Compose 部署

创建 `docker-compose.yml` 文件：

```yaml
services:
  etcd:
    image: bitnami/etcd:latest
    restart: unless-stopped
    ports:
      - 2379:2379
      - 2380:2380
    environment:
      - ALLOW_NONE_AUTHENTICATION=yes
      - ETCD_ADVERTISE_CLIENT_URLS=http://0.0.0.0:2379
      - ETCD_LISTEN_CLIENT_URLS=http://0.0.0.0:2379
      - ETCD_LISTEN_PEER_URLS=http://0.0.0.0:2380
      - ETCD_NAME=etcd-single
      - ETCD_DATA_DIR=/bitnami/etcd/data
    volumes:
      - ./data:/bitnami/etcd/data

  apisix:
    image: apache/apisix:latest
    restart: unless-stopped
    ports:
      - "9080:9080/tcp"
      - "9443:9443/tcp"
      - "9091:9091/tcp"
      - "9092:9092/tcp"
      - "9180:9180/tcp"
    volumes:
      - ./apisix.yaml:/usr/local/apisix/conf/config.yaml:ro
    depends_on:
      - etcd

  dashboard:
    image: apache/apisix-dashboard:latest
    restart: unless-stopped
    ports:
      - 9000:9000
    volumes:
      - ./apisix-dashboard.yaml:/usr/local/apisix-dashboard/conf/conf.yaml:ro
    environment:
      - TZ=Asia/Shanghai
    depends_on:
      - apisix
```

## 4. 配置 APISIX 支持 OIDC 插件

在 `./apisix_conf/config.yaml` 中启用 OIDC 插件：

```yaml
plugins:
	- ... # 其他插件
	- openid-connect
```

详细 OIDC 配置示例（以 Auth0 为例）：

```yaml
plugin_attr:
	openid-connect:
		client_id: <your-client-id>
		client_secret: <your-client-secret>
		discovery: "https://<your-auth0-domain>/.well-known/openid-configuration"
		scope: openid profile email
		redirect_uri: "http://<apisix-host>:9080/callback"
		logout_path: /logout
		session:
			secret: <random-secret>
			cookie:
				name: apisix_oidc
				secure: false
```

## 5. 配置 apisix-dashboard 支持 RBAC

编辑 `./dashboard_conf/conf.yaml`，启用 RBAC 并配置管理员账号：

```yaml
authentication:
	secret: <dashboard-jwt-secret>
	expire_time: 3600
	users:
		- username: admin
			password: <your-password>
			role: admin
		- username: viewer
			password: <your-password>
			role: viewer
```


## 6. 通过 APISIX 插件实现请求的 RBAC 权限控制

APISIX 可通过 `consumer-restriction`、`jwt-auth`、`openid-connect` 等插件结合实现 API 级别的 RBAC 权限控制。常见做法如下：

### 6.1 基于 consumer-restriction 插件

1. 创建不同的 Consumer，并为其分配不同的角色（如 admin、user、guest）。
2. 在路由上启用 `consumer-restriction` 插件，限制哪些 Consumer 可访问。

**示例：**

```json
{
	"uri": "/admin/*",
	"plugins": {
		"consumer-restriction": {
			"whitelist": ["admin"]
		}
	},
	"upstream": { ... }
}
```

### 6.2 结合 OIDC/JWT 插件实现细粒度 RBAC

1. 通过 OIDC/JWT 插件完成用户认证，令牌中携带角色（role/roles）等自定义字段。
2. 使用 `openid-connect` 或 `jwt-auth` 插件解析令牌。
3. 配合 `authz-keycloak`、`authz-casbin` 等插件实现基于角色的访问控制。

**authz-casbin 插件配置示例：**

```json
{
	"uri": "/api/*",
	"plugins": {
		"openid-connect": { ... },
		"authz-casbin": {
			"model_path": "/path/to/model.conf",
			"policy_path": "/path/to/policy.csv"
		}
	},
	"upstream": { ... }
}
```

**说明：**
- `model.conf` 定义 RBAC 权限模型，`policy.csv` 定义具体的角色-资源-操作权限。
- 用户登录后，APISIX 通过 OIDC/JWT 插件获取用户角色，再由 authz-casbin 插件判定是否有权访问。

### 6.3 参考文档
- [consumer-restriction 插件](https://apisix.apache.org/zh/docs/apisix/plugins/consumer-restriction/)
- [authz-casbin 插件](https://apisix.apache.org/zh/docs/apisix/plugins/authz-casbin/)
- [authz-keycloak 插件](https://apisix.apache.org/zh/docs/apisix/plugins/authz-keycloak/)

---
## 7. 启动服务

```bash
docker-compose up -d
```

## 8. 访问与验证

- APISIX 网关: http://localhost:9080
- APISIX Admin API: http://localhost:9180
- apisix-dashboard: http://localhost:9000

## 9. 参考文档

- [APISIX 官方文档](https://apisix.apache.org/docs/)
- [APISIX OIDC 插件](https://apisix.apache.org/docs/apisix/plugins/openid-connect/)
- [APISIX Dashboard RBAC](https://apisix.apache.org/docs/dashboard/user-guide/authentication/)

## 10. 附录

```yaml
apisix:
  node_listen: 9080
  enable_ipv6: false

  enable_control: true
  control:
    ip: "0.0.0.0"
    port: 9092

deployment:
  admin:
    allow_admin:
      - 0.0.0.0/0

    admin_key:
      - name: "admin"
        key: <your-password>
        role: admin
      - name: "viewer"
        key: <your-password>
        role: viewer

  etcd:
    host:
      - "http://192.168.100.102:2379"
    prefix: "/apisix"
    timeout: 30

plugins:
  - http-logger
  - limit-req
  - prometheus
  - key-auth
  - jwt-auth
  - cors
  - proxy-rewrite
  - redirect
  - server-info
  - openid-connect
  - echo

plugin_attr:
  prometheus:
    export_addr:
      ip: "0.0.0.0"
      port: 9091
  server-info:
    report_ttl: 60
```

```yaml
conf:
  listen:
    host: 0.0.0.0
    port: 9000

  etcd:
    endpoints:
      - 192.168.100.102:2379
    # username: "root"
    # password: ""
    prefix: "/apisix"

  log:
    error_log:
      level: warn
      file_path:
        /var/log/apisix_dashboard_error.log

authentication:
  secret:
    <your-password>
  expire_time: 3600
  users:
    - username: admin
      password: <your-password>

plugin_attr:
  prometheus:
    export_addr:
      ip: "0.0.0.0"
      port: 9091
```
