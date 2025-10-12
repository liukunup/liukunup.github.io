---
title: Docker
tags:
  - docker
createTime: 2025/10/11 21:27:22
permalink: /homelab/deploy/docker/
---

## 一键安装

```shell
# 1.切换到root
sudo -i

# 2.一键安装
curl -fsSL https://get.docker.com | sh

# 3.开机启动
systemctl --now enable docker
```

::: tip

如果你使用`1Panel`服务器面板，同样会附带安装docker服务

```shell
# 1.切换到root
sudo -i

# 2.一键安装
bash -c "$(curl -sSL https://resource.fit2cloud.com/1panel/package/v2/quick_start.sh)"
```

:::

::: tip

验证安装结果

```shell
docker run hello-world
```

:::

## 添加权限

```shell
# 1.添加用户到docker组
sudo usermod -aG docker username

# 如果没有docker组请先添加
sudo groupadd docker

# 2.给所有人添加读写权限
sudo chmod a+rw /var/run/docker.sock

# 3.查看信息(验证命令是否可用)
docker info
```

## 创建软链接

- Docker Buildx

```shell
# 1.生成`docker-buildx`命令的软链接
ln -s /usr/libexec/docker/cli-plugins/docker-buildx /usr/bin/docker-buildx

# 2.查看版本(验证命令是否可用)
docker-buildx version
```

- Docker Compose

```shell
# 1.生成`docker-compose`命令的软链接
ln -s /usr/libexec/docker/cli-plugins/docker-compose /usr/bin/docker-compose

# 2.查看版本(验证命令是否可用)
docker-compose --version
```

## 修改配置

```shell
vim /etc/docker/daemon.json
```

配置内容如下：

```json
{
  "registry-mirrors": [
    "https://reg.homelab.lan"
  ],
  "insecure-registries": [
  ]
}
```

## 修改路径

```shell
# 1.停止服务
systemctl stop docker

# 2.移动文件夹
mv /var/lib/docker /home/

# 3.创建软链接
ln -s /home/docker /var/lib/docker

# 4.重新启动服务
systemctl start docker

# 5.查看信息(确认路径已经改变)
docker info
```

## NVIDIA Container Toolkit

[Installing the NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)

::: warning
请前置安装[Nvidia CUDA Toolkit](cuda.md)
:::

1. 配置生产环境的软件仓库

```shell
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
```

(可选)使用实验特性

```shell
sudo sed -i -e '/experimental/ s/^#//g' /etc/apt/sources.list.d/nvidia-container-toolkit.list
```

2. 更新软件包

```shell
sudo apt-get update
```

3. 安装`NVIDIA Container Toolkit`包

```shell
# 1.设置版本号
export NVIDIA_CONTAINER_TOOLKIT_VERSION=1.17.8-1

# 2.开始安装
sudo apt-get install -y \
    nvidia-container-toolkit=${NVIDIA_CONTAINER_TOOLKIT_VERSION} \
    nvidia-container-toolkit-base=${NVIDIA_CONTAINER_TOOLKIT_VERSION} \
    libnvidia-container-tools=${NVIDIA_CONTAINER_TOOLKIT_VERSION} \
    libnvidia-container1=${NVIDIA_CONTAINER_TOOLKIT_VERSION}
```

4. 配置容器运行时

```shell
# 1.设置容器运行时
sudo nvidia-ctk runtime configure --runtime=docker

# 2.重启docker服务
sudo systemctl restart docker
```

5. 验证安装结果

```shell
sudo docker run --rm --runtime=nvidia --gpus all ubuntu nvidia-smi
```
