---
title: HF-Mirror
createTime: 2025/10/13 11:45:45
permalink: /blog/t8r4muaz/
---

Hugging Face 无法访问？

[HF-Mirror](https://hf-mirror.com/)作为一个公益项目，致力于帮助国内AI开发者快速、稳定的下载模型、数据集。

## 使用说明

1. 安装工具

```shell
sudo apt install -y aria2 jq
```

2. 下载hfd

```shell
wget https://hf-mirror.com/hfd/hfd.sh
chmod a+x hfd.sh
```

3. 设置环境变量

- Linux

```shell
export HF_ENDPOINT=https://hf-mirror.com
```

- Windows

```powershell
$env:HF_ENDPOINT = "https://hf-mirror.com"
```

4.1 下载模型

```shell
./hfd.sh gpt2
```

4.2 下载数据集

```shell
./hfd.sh wikitext --dataset
```
