---
title: Setup Development Environment
tags:
  - Python
createTime: 2025/10/09 10:25:10
permalink: /en/python/setup/
---

## Set Up Development Environment

### Option 1: Install `Python`

::: tabs

@tab:active Windows

1. Visit the Python official website

2. Click "Download Python x.x.x" (Recommended to download the latest version)

3. Run the downloaded installer

@tab macOS

```shell
brew install python
```

@tab Linux

Ubuntu/Debian:

```shell
sudo apt update
sudo apt install python3 python3-pip
```

CentOS/RHEL:

```shell
sudo yum install python3 python3-pip
```

:::

### Option 2: Install `Conda`

::: tabs

@tab:active Miniconda

1. Visit the Miniconda official website

2. Download the Windows 64-bit installer

3. Run the installer and follow the prompts to complete installation

@tab macOS

```shell
curl -O https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-x86_64.sh
bash Miniconda3-latest-MacOSX-x86_64.sh
```

@tab Linux

```shell
curl -O https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
```

:::
