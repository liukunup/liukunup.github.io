---
title: Coder
tags:
  - coder
createTime: 2025/10/20 20:13:56
permalink: /homelab/deploy/coder
---

::tdesign:logo-github-filled:: [Coder](https://github.com/coder/coder)

[Coder Installation](https://coder.com/docs/install)

## 部署指南

::: tabs

@tab:active Docker

```shell
# 配置环境变量
export CODER_DATA=$HOME/.config/coderv2-docker
export DOCKER_GROUP=$(getent group docker | cut -d: -f3)
# 创建数据目录
mkdir -p $CODER_DATA
# 拉起目标容器
docker run --rm -it \
  -v $CODER_DATA:/home/coder/.config \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --group-add $DOCKER_GROUP \
  ghcr.io/coder/coder:latest
```

@tab Docker Compose

获取本机`Docker Group`

```shell
getent group docker | cut -d: -f3
```

- .env

```plaintext
# Registry
GHCR_REGISTRY=ghcr.io
DOCKER_REGISTRY=docker.io

# Docker Group
DOCKER_GROUP=988

# Coder
CODER_IMAGE=coder/coder:latest
CODER_PORT=7080
CODER_ACCESS_URL=http://xxx.coder.app

# Postgres
POSTGRES_IMAGE=postgres:17
POSTGRES_USERNAME=coder
POSTGRES_PASSWORD=
POSTGRES_DB=coder
```

- compose.yaml

```yaml
services:
  coder:
    image: ${GHCR_REGISTRY:-ghcr.io}/${CODER_IMAGE:-coder/coder:latest}
    ports:
      - ${CODER_PORT:-7080}:7080
    environment:
      CODER_HTTP_ADDRESS: "0.0.0.0:7080"
      CODER_ACCESS_URL: "${CODER_ACCESS_URL}"
      CODER_PG_CONNECTION_URL: "postgresql://${POSTGRES_USERNAME:-coder}:${POSTGRES_PASSWORD:?password is required}@database/${POSTGRES_DB:-coder}?sslmode=disable"
    group_add:
      - ${DOCKER_GROUP} # docker group on host
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - coder_home:/home/coder
    depends_on:
      database:
        condition: service_healthy
  database:
    image: ${DOCKER_REGISTRY:-docker.io}/${POSTGRES_IMAGE:-postgres:17}
    environment:
      POSTGRES_USER: ${POSTGRES_USERNAME:-coder}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?password is required}
      POSTGRES_DB: ${POSTGRES_DB:-coder}
    volumes:
      - coder_pg_data:/var/lib/postgresql/data
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "pg_isready -U ${POSTGRES_USERNAME:-coder} -d ${POSTGRES_DB:-coder}",
        ]
      interval: 5s
      timeout: 5s
      retries: 5
volumes:
  coder_home:
  coder_pg_data:
```

@tab Helm

```shell
kubectl create namespace coder

# Install PostgreSQL
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgresql bitnami/postgresql \
    --namespace coder \
    --set image.repository=bitnamilegacy/postgresql \
    --set auth.username=coder \
    --set auth.password=coder \
    --set auth.database=coder \
    --set primary.persistence.size=10Gi

helm repo add coder-v2 https://helm.coder.com/v2

helm install coder coder-v2/coder \
    --namespace coder \
    --values values.yaml \
    --version 2.26.2

helm install coder oci://ghcr.io/coder/chart/coder \
    --namespace coder \
    --values values.yaml \
    --version 2.26.2

kubectl get pods -n coder

kubectl get svc -n coder

helm repo update
helm upgrade coder coder-v2/coder \
  --namespace coder \
  -f values.yaml

```

- values.yaml

```yaml
coder:
  # You can specify any environment variables you'd like to pass to Coder
  # here. Coder consumes environment variables listed in
  # `coder server --help`, and these environment variables are also passed
  # to the workspace provisioner (so you can consume them in your Terraform
  # templates for auth keys etc.).
  #
  # Please keep in mind that you should not set `CODER_HTTP_ADDRESS`,
  # `CODER_TLS_ENABLE`, `CODER_TLS_CERT_FILE` or `CODER_TLS_KEY_FILE` as
  # they are already set by the Helm chart and will cause conflicts.
  env:
    - name: CODER_PG_CONNECTION_URL
      valueFrom:
        secretKeyRef:
          # You'll need to create a secret called coder-db-url with your
          # Postgres connection URL like:
          # postgres://coder:password@postgres:5432/coder?sslmode=disable
          name: coder-db-url
          key: url
    # For production deployments, we recommend configuring your own GitHub
    # OAuth2 provider and disabling the default one.
    - name: CODER_OAUTH2_GITHUB_DEFAULT_PROVIDER_ENABLE
      value: "false"

    # (Optional) For production deployments the access URL should be set.
    # If you're just trying Coder, access the dashboard via the service IP.
    # - name: CODER_ACCESS_URL
    #   value: "https://coder.example.com"

  #tls:
  #  secretNames:
  #    - my-tls-secret-name
```

:::
