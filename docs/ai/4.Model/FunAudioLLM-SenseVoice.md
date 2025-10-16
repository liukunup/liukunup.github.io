---
title: FunAudioLLM SenseVoice
createTime: 2025/10/15 16:17:32
permalink: /ai/model/sensevoice/
---

## 部署说明

```shell
git clone https://github.com/FunAudioLLM/SenseVoice.git

pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/ --trusted-host=mirrors.aliyun.com
```

```shell
export SENSEVOICE_DEVICE=cuda:0
fastapi run --port 50000
```

## 启动服务

```shell
python webui.py
```
