---
title: Docker
tags:
  - docker
  - container
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

**(推荐)** 如果你使用`1Panel`服务器面板，同样会附带安装docker服务，更方便。

```shell
# 1.切换到root
sudo -i

# 2.一键安装
bash -c "$(curl -sSL https://resource.fit2cloud.com/1panel/package/v2/quick_start.sh)"
```

:::

::: tip

验证

```shell
docker run hello-world
```

:::

## 添加权限

给其他用户添加使用权限

```shell
# 1.添加用户到docker组
sudo usermod -aG docker username

# (可选) 如果没有docker组请先添加
sudo groupadd docker

# 2.给所有人添加读写权限
sudo chmod a+rw /var/run/docker.sock

# 3.查看信息(验证命令是否可用)
docker info
```

## 修改配置

```shell
vim /etc/docker/daemon.json
```

配置内容如下：

```json
{
  "registry-mirrors": [
    "https://docker.1panel.live",
    "https://reg.homelab.lan"
  ],
  "insecure-registries": [
  ]
}
```

## 修改路径

适用于磁盘空间不够的情形

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
