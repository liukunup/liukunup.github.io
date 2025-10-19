---
title: Grafana
createTime: 2025/10/19 22:22:17
permalink: /homelab/deploy/grafana/
---

## 配置OpenID

authentik [Integrate with Grafana](https://integrations.goauthentik.io/monitoring/grafana/)

```
networks:
  1panel-network:
    external: true
services:
  grafana:
    container_name: ${CONTAINER_NAME}
    deploy:
      resources:
        limits:
          cpus: ${CPUS}
          memory: ${MEMORY_LIMIT}
    image: grafana/grafana:12.2.0
    labels:
      createdBy: Apps
    networks:
      - 1panel-network
    ports:
      - ${HOST_IP}:${PANEL_APP_PORT_HTTP}:3000
    restart: always
    user: "0"
    volumes:
      - ./data:/var/lib/grafana
    environment:
      GF_AUTH_GENERIC_OAUTH_ENABLED: "true"
      GF_AUTH_GENERIC_OAUTH_NAME: "authentik"
      GF_AUTH_GENERIC_OAUTH_CLIENT_ID: "<Client ID from above>"
      GF_AUTH_GENERIC_OAUTH_CLIENT_SECRET: "<Client Secret from above>"
      GF_AUTH_GENERIC_OAUTH_SCOPES: "openid profile email"
      GF_AUTH_GENERIC_OAUTH_AUTH_URL: "https://authentik.company/application/o/authorize/"
      GF_AUTH_GENERIC_OAUTH_TOKEN_URL: "https://authentik.company/application/o/token/"
      GF_AUTH_GENERIC_OAUTH_API_URL: "https://authentik.company/application/o/userinfo/"
      GF_AUTH_SIGNOUT_REDIRECT_URL: "https://authentik.company/application/o/<application_slug>/end-session/"
      # Optionally enable auto-login (bypasses Grafana login screen)
      GF_AUTH_OAUTH_AUTO_LOGIN: "true"
      # Optionally map user groups to Grafana roles
      GF_AUTH_GENERIC_OAUTH_ROLE_ATTRIBUTE_PATH: "contains(groups[*], 'Grafana Admins') && 'Admin' || contains(groups[*], 'Grafana Editors') && 'Editor' || 'Viewer'"
      # Required if Grafana is running behind a reverse proxy
      GF_SERVER_ROOT_URL: "https://grafana.company"
```

记得到管理页面关闭TLS验证
