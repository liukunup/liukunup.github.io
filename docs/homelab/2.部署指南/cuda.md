---
title: Nvidia CUDA Toolkit
tags:
  - nvidia
  - CUDA
createTime: 2025/10/11 23:55:06
permalink: /homelab/deploy/cuda/
---

::: tip
版本说明
- **最新版本** 13.0.2
- **主流版本** 12.8.1 (推荐) / 12.6.3 / 11.8
:::

安装最新版本 [Download Latest CUDA Toolkit](https://developer.nvidia.com/cuda-downloads)

安装历史版本 [Archive of Previous CUDA Releases](https://developer.nvidia.com/cuda-toolkit-archive)

在[Ubuntu 24.04](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=Ubuntu&target_version=24.04&target_type=deb_local)上安装

## **CUDA Toolkit 13.0 Update 2 Downloads**

Install on **Ubuntu 24.04** (x86_64)

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

## **CUDA Toolkit 12.9 Update 1 Downloads**

Install on **Ubuntu 24.04** (x86_64)

::: info
CUDA Toolkit Installer
```shell
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-ubuntu2404.pin
sudo mv cuda-ubuntu2404.pin /etc/apt/preferences.d/cuda-repository-pin-600
wget https://developer.download.nvidia.com/compute/cuda/12.9.1/local_installers/cuda-repo-ubuntu2404-12-9-local_12.9.1-575.57.08-1_amd64.deb
sudo dpkg -i cuda-repo-ubuntu2404-12-9-local_12.9.1-575.57.08-1_amd64.deb
sudo cp /var/cuda-repo-ubuntu2404-12-9-local/cuda-*-keyring.gpg /usr/share/keyrings/
sudo apt-get update
sudo apt-get -y install cuda-toolkit-12-9
```
:::

::: info
Driver Installer
```shell
sudo apt-get install -y cuda-drivers
```
:::

## **CUDA Toolkit 12.8 Update 1 Downloads**

Install on **Ubuntu 24.04** (x86_64)

::: info
CUDA Toolkit Installer
```shell
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-ubuntu2404.pin
sudo mv cuda-ubuntu2404.pin /etc/apt/preferences.d/cuda-repository-pin-600
wget https://developer.download.nvidia.com/compute/cuda/12.8.1/local_installers/cuda-repo-ubuntu2404-12-8-local_12.8.1-570.124.06-1_amd64.deb
sudo dpkg -i cuda-repo-ubuntu2404-12-8-local_12.8.1-570.124.06-1_amd64.deb
sudo cp /var/cuda-repo-ubuntu2404-12-8-local/cuda-*-keyring.gpg /usr/share/keyrings/
sudo apt-get update
sudo apt-get -y install cuda-toolkit-12-8
```
:::

::: info
Driver Installer
```shell
sudo apt-get install -y cuda-drivers
```
:::

## **CUDA Toolkit 12.6 Update 3 Downloads**

Install on **Ubuntu 24.04** (x86_64)

::: info
CUDA Toolkit Installer
```shell
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-ubuntu2404.pin
sudo mv cuda-ubuntu2404.pin /etc/apt/preferences.d/cuda-repository-pin-600
wget https://developer.download.nvidia.com/compute/cuda/12.6.3/local_installers/cuda-repo-ubuntu2404-12-6-local_12.6.3-560.35.05-1_amd64.deb
sudo dpkg -i cuda-repo-ubuntu2404-12-6-local_12.6.3-560.35.05-1_amd64.deb
sudo cp /var/cuda-repo-ubuntu2404-12-6-local/cuda-*-keyring.gpg /usr/share/keyrings/
sudo apt-get update
sudo apt-get -y install cuda-toolkit-12-6
```
:::

::: info
Driver Installer
```shell
sudo apt-get install -y cuda-drivers
```
:::

## **CUDA Toolkit 11.8 Downloads**

Install on **Ubuntu 22.04** (x86_64)

::: info
CUDA Toolkit Installer
```shell
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-ubuntu2204.pin
sudo mv cuda-ubuntu2204.pin /etc/apt/preferences.d/cuda-repository-pin-600
wget https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda-repo-ubuntu2204-11-8-local_11.8.0-520.61.05-1_amd64.deb
sudo dpkg -i cuda-repo-ubuntu2204-11-8-local_11.8.0-520.61.05-1_amd64.deb
sudo cp /var/cuda-repo-ubuntu2204-11-8-local/cuda-*-keyring.gpg /usr/share/keyrings/
sudo apt-get update
sudo apt-get -y install cuda
```
:::
