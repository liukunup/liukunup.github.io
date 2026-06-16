---
title: PaddleOCR-VL
createTime: 2025/11/02 15:01:09
permalink: /ai/model/paddleocr-vl/
---

[PaddleOCR-VL Docs](https://www.paddleocr.ai/main/version3.x/algorithm/PaddleOCR-VL/PaddleOCR-VL.html)

```shell
docker run \
    -it \
    --rm \
    --gpus all \
    --network host \
    ccr-2vdh3abv-pub.cnc.bj.baidubce.com/paddlepaddle/paddlex-genai-vllm-server \
    paddlex_genai_server --model_name PaddleOCR-VL-0.9B --host 0.0.0.0 --port 8118 --backend vllm
```
