---
title: waifu2x
createTime: 2026/06/18 00:00:00
permalink: /ai/model/waifu2x/
---

## 概述

waifu2x 是 nagadomi 开源的动漫风格图像超分辨率工具，基于深度卷积神经网络，支持 2x/4x 放大与降噪。同时支持照片模型（GAN-based）。后续社区衍生出 waifu2x-caffe、waifu2x-ncnn-vulkan、Waifu2x-Extension-GUI 等多种实现。GitHub 28K+ Stars。

## 功能

| 方法 | 放大倍数 | 降噪 | 说明 |
|------|----------|------|------|
| scale | 2x | — | 仅放大 |
| scale4x | 4x | — | 4x 放大 |
| noise | 1x | Level 0-3 | 仅降噪 |
| noise_scale | 2x | Level 0-3 | 降噪 + 2x 放大 |

支持风格：art（动漫）、photo（照片）、scan（扫描件）。

## 快速使用

### 原始 Lua 版

```bash
git clone --depth 1 https://github.com/nagadomi/waifu2x.git
cd waifu2x
# 2x 放大
th waifu2x.lua -m scale -i input.png -o output.png
# 降噪 + 2x 放大
th waifu2x.lua -m noise_scale -noise_level 1 -i input.png -o output.png
```

### PyTorch 版（nunif）

```bash
git clone https://github.com/nagadomi/nunif.git
cd nunif
python -m waifu2x.cli -m scale -i input.png -o output.png
```

### NCNN 版（跨平台 GPU）

```bash
./waifu2x-ncnn-vulkan -i input.png -o output.png -n 2 -s 2
```

## 社区衍生项目

| 项目 | 说明 |
|------|------|
| [waifu2x-caffe](https://github.com/lltcggie/waifu2x-caffe) | Windows GUI 版 |
| [waifu2x-ncnn-vulkan](https://github.com/nihui/waifu2x-ncnn-vulkan) | NCNN 跨平台 GPU 版 |
| [Waifu2x-Extension-GUI](https://github.com/AaronFeng753/Waifu2x-Extension-GUI) | 多引擎集成 GUI（16K+ Stars） |

## 资源链接

- GitHub：[github.com/nagadomi/waifu2x](https://github.com/nagadomi/waifu2x)
- PyTorch 版：[github.com/nagadomi/nunif](https://github.com/nagadomi/nunif)
- 在线 Demo：[waifu2x.udp.jp](https://waifu2x.udp.jp/)
- 许可证：MIT
