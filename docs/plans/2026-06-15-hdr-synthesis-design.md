# 多帧 HDR 合成技术设计方案

**创建时间**: 2026/06/15
**状态**: 已批准

## 1. 目标与范围

### 1.1 文章定位
面向全层次读者（入门科普 → 深入原理 → 移动端部署）的多帧 HDR 合成技术文章。

### 1.2 技术范围
- **输入源**: 手机相机 RAW + 专业相机 RAW（曝光包围）
- **嵌入式**: ARM + OpenCL/OpenVX/NNAPI
- **云端**: WebGL/WASM
- **输出**: 照片类 JPEG HDR / HEIF / PNG 16-bit

### 1.3 实现重点
全流程 Pipeline：RAW 读取 → 特征对齐 → 多曝光融合 → 色调映射 → 16-bit 输出

---

## 2. 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    HDR Pipeline                         │
├─────────────────────────────────────────────────────────┤
│  输入层   │ RAW 读取 + 坏点校正 + 黑电平补偿              │
├─────────────────────────────────────────────────────────┤
│  对齐层   │ 特征点检测 / 光流估计 / 曝光补偿              │
├─────────────────────────────────────────────────────────┤
│  融合层   │ 多曝光融合（传统+轻量NN混合架构）            │
├─────────────────────────────────────────────────────────┤
│  映射层   │ 色调映射（全局 TM + 局部 TM）                │
├─────────────────────────────────────────────────────────┤
│  输出层   │ 16-bit 编码 → JPEG HDR / HEIF / PNG         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. 详细设计

### 3.1 RAW 读取与预处理

**嵌入式（ARM + OpenCL）**:
- 使用 libraw / dcraw 解析 RAW 数据
- 坏点校正（缺陷像素检测与插值）
- 暗电流补偿（Dark Frame Subtraction）
- 露天污点校正（FPN 去除）

**云端（WebGL）**:
- 从 ArrayBuffer 读取 RAW 二进制数据
- JavaScript 解析 RAW 元数据（EXIF、RAW 元数据）

### 3.2 特征对齐与曝光补偿

**对齐算法**:
- 特征点检测：ORB / AKAZE（抗尺度变换）
- 光流估计：Lucas-Kanade + 粗细策略
- 像素级对齐：Guided Filter 细化

**曝光补偿**:
- 估计相机响应函数（Gamma 曲线）
- 反演每个曝光帧到 HDR 辐照度

### 3.3 多曝光融合算法

**混合架构**:

| 场景 | 算法 |
|------|------|
| 简单场景 | Mertens Merge（对比度/饱和度/曝光质量加权） |
| 复杂场景 | 轻量级 CNN（Edge-aware HDR Fusion，~500K 参数） |

**嵌入式 NN 加速**:
- 使用 NNAPI 加载 ONNX 模型
- 量化模型（INT8）适配移动端

### 3.4 色调映射（Tone Mapping）

**分层策略**:

| 类型 | 算法 | 适用场景 |
|------|------|----------|
| 全局 TM | Reinhard / Filmic / ACES | 整体亮度调节 |
| 局部 TM | Muilti-scale TM / Dale | 避免光晕伪影 |

**WebGL 实现**:
- GLSL fragment shader 实现快速 TM
- 16-bit float render target

### 3.5 16-bit 输出与编码

**输出格式对比**:

| 格式 | 位深 | 压缩率 | 兼容性 | 推荐场景 |
|------|------|--------|--------|----------|
| PNG 16-bit | 16 | 无损 | 通用 | 工业/科研 |
| JPEG HDR | 12 | 高 | 现代设备 | 日常摄影 |
| HEIF | 10-12 | 高 | iOS/新 Android | 高效存储 |

**编码实现**:
- 嵌入式：libjpeg-turbo / libheif
- 云端：WASM + jpeg-js / heif.js

---

## 4. 嵌入式实现（ARM）

### 4.1 技术栈
- **语言**: C++17
- **计算加速**: OpenCL 1.2 / OpenVX 1.2
- **AI 加速**: Android NNAPI
- **图像编解码**: libjpeg-turbo / libheif
- **构建**: CMake + NDK

### 4.2 模块划分

```
src/
├── raw/
│   ├── RawDecoder.cpp       # RAW 文件解析
│   └── BadPixelCorrector.cpp
├── align/
│   ├── FeatureDetector.cpp  # ORB/AKAZE
│   └── FlowEstimator.cpp     # 光流估计
├── fuse/
│   ├── MertensFusion.cpp    # 传统融合
│   └── NNFusion.cpp         # 神经网络融合
├── tonemap/
│   └── ToneMapper.cpp       # 色调映射
└── encoder/
    ├── JpegEncoder.cpp      # JPEG HDR
    └── HeifEncoder.cpp       # HEIF
```

---

## 5. 云端 WebGL/WASM 实现

### 5.1 技术栈
- **WebGL 2.0**: GPU 计算
- **WASM**: 原生库编译（libjpeg、libheif）
- **JavaScript**: 流程控制

### 5.2 Shader 设计

```glsl
// 核心 TM Fragment Shader
precision highp float;

uniform sampler2D uHDRTexture;
uniform float uExposure;      // 曝光调整
uniform int uTMType;          // 0=Reinhard, 1=Filmic, 2=ACES

varying vec2 vTexCoord;

vec3 reinhard(vec3 color) {
    return color / (color + vec3(1.0));
}

vec3 filmic(vec3 color) {
    color = max(vec3(0.0), color - 0.004);
    color = (color * (6.2 * color + 0.5)) / (color * (6.2 * color + 1.7) + 0.06);
    return color;
}

void main() {
    vec3 hdr = texture2D(uHDRTexture, vTexCoord).rgb;
    vec3 mapped = (uTMType == 0) ? reinhard(hdr) :
                   (uTMType == 1) ? filmic(hdr) : hdr;
    gl_FragColor = vec4(mapped, 1.0);
}
```

---

## 6. 性能目标

| 平台 | 分辨率 | 延迟目标 | 功耗目标 |
|------|--------|----------|----------|
| Android (ARM + NNAPI) | 12MP | < 800ms | < 1.5W |
| iOS (Metal + Accelerate) | 12MP | < 500ms | < 1W |
| WebGL/WASM (浏览器) | 4K | < 2s | N/A |

---

## 7. 文章大纲

```
## 1. HDR 概述与多帧合成原理
   - HDR 概念、动态范围与人眼感知
   - 多帧合成的必要性（单帧 vs 多帧）
   - 应用场景（手机拍照/专业摄影/工业检测）

## 2. 相机响应函数与曝光模型
   - 相机响应函数（CRF）定义与估计
   - 曝光包围与辐照度恢复
   - 伽马校正与线性化

## 3. 全流程 Pipeline 设计
   3.1 RAW 读取与预处理
   3.2 特征对齐与曝光补偿
   3.3 多曝光融合算法
   3.4 色调映射（Tone Mapping）
   3.5 16-bit 输出与编码

## 4. 嵌入式实现（ARM + OpenCL）
   - OpenCL Kernel 设计
   - NNAPI 轻量模型加载
   - 性能调优（内存拷贝/流水线）

## 5. 云端 WebGL/WASM 实现
   - WebGL 渲染管线
   - WASM 原生库编译
   - 16-bit 输出与编码

## 6. 输出格式对比与选择
   - JPEG HDR / HEIF / PNG 16-bit 详细对比
   - 场景化推荐

## 7. 常见问题与调优
   - 鬼影（Ghost）抑制
   - 噪声放大控制
   - 色调偏移修正
```

---

## 8. 插图清单

| 文件名 | 说明 |
|--------|------|
| `hdr-pipeline-overview.svg` | HDR Pipeline 整体架构图 |
| `exposure-bracketing.svg` | 曝光包围示意图 |
| `crf-response-curve.svg` | 相机响应函数曲线 |
| `feature-alignment.svg` | 特征对齐示意图 |
| `tonemap-comparison.svg` | 色调映射算法对比 |
| `webgl-pipeline.svg` | WebGL 处理管线 |
| `arm-opencl-architecture.svg` | ARM OpenCL 架构图 |

---

## 9. 参考资料

- Debevec & Malik. "Recovering High Dynamic Range Radiance Maps from Photographs"
- Reinhard et al. "Photographic Tone Reproduction for Digital Images"
- Mertens et al. "Exposure Fusion"
- OpenCV HDR Module Documentation
- WebGL 2.0 Specification
