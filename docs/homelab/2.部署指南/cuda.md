---
title: Nvidia CUDA Toolkit
createTime: 2025/10/11 23:55:06
permalink: /homelab/deploy/cuda/
---

安装最新版本 [Download Latest CUDA Toolkit](https://developer.nvidia.com/cuda-downloads)

安装历史版本 [Archive of Previous CUDA Releases](https://developer.nvidia.com/cuda-toolkit-archive)

在[Ubuntu 24.04](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=Ubuntu&target_version=24.04&target_type=deb_local)上安装

- CUDA Toolkit 13.0 Update 2 Downloads

::: info

CUDA Toolkit Installer

```shell
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-ubuntu2404.pin
sudo mv cuda-ubuntu2404.pin /etc/apt/preferences.d/cuda-repository-pin-600
wget https://developer.download.nvidia.com/compute/cuda/13.0.2/local_installers/cuda-repo-ubuntu2404-13-0-local_13.0.2-580.95.05-1_amd64.deb
sudo dpkg -i cuda-repo-ubuntu2404-13-0-local_13.0.2-580.95.05-1_amd64.deb
sudo cp /var/cuda-repo-ubuntu2404-13-0-local/cuda-*-keyring.gpg /usr/share/keyrings/
sudo apt-get update
sudo apt-get -y install cuda-toolkit-13-0
```

:::

::: info

Driver Installer

```shell
sudo apt-get install -y cuda-drivers
```

:::
