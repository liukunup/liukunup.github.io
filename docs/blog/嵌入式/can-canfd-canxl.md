---
title: CAN CANFD CANXL 协议对比
createTime: 2026/07/26 01:03:00
permalink: /blog/can-canfd-canxl/
tags:
  - CAN
  - CANFD
  - CANXL
  - 嵌入式
  - 车载网络
categories:
  - 嵌入式
---

## 概述

CAN（Controller Area Network）是广泛应用于汽车和工业控制领域的串行通信协议。从最初的 CAN 标准发展到 CANFD，再到现在最新的 CANXL，三代协议在数据传输速率、帧格式、兼容性等方面都有显著差异。

| 特性 | CAN | CANFD | CANXL |
|------|-----|-------|-------|
| **标准年份** | 1986 | 2012 | 2019 |
| **最大速率** | 1 Mbps | 8 Mbps | 20 Mbps |
| **数据长度** | 8 字节 | 64 字节 | 64 字节 |
| **帧结构** | 固定 | 可变 | 可变 |
| **兼容性** | - | CAN | CANFD |
| **典型应用** | 车身控制 | ADAS、信息娱乐 | 自动驾驶 |

## CAN 协议

### 简介

CAN 协议由 Bosch 在 1986 年开发，是汽车网络的事实标准。其采用差分信号传输，具有很强的抗干扰能力。

### 帧结构

CAN 帧主要分为标准帧（11 位 ID）和扩展帧（29 位 ID）。

```
+----------+-------------+--------+------------------+------+----------+
| SOF (1)  | Arbitration (12/32) | Control (6) | Data (0-64) | CRC (16) | ACK | EOF |
+----------+-------------+--------+------------------+------+----------+
```

- **SOF**: 帧起始位
- **Arbitration**: 仲裁场（ID + RTR）
- **Control**: 控制场（DLC + IDE + r0）
- **Data**: 数据场（0-8 字节）
- **CRC**: 循环冗余校验
- **ACK**: 应答位
- **EOF**: 帧结束

### 特点

- 最大速率 1 Mbps（在 40 米以内）
- 最大数据长度 8 字节
- 采用非破坏性仲裁机制
- CRC 校验（15 位）

### 代码示例

```c
// STM32 HAL CAN 发送示例
CAN_TxHeaderTypeDef TxHeader;
uint8_t TxData[8] = {0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08};

TxHeader.StdId = 0x100;
TxHeader.DLC = 8;
TxHeader.IDE = CAN_ID_STD;
TxHeader.RTR = CAN_RTR_DATA;

uint32_t TxMailbox;
if (HAL_CAN_AddTxMessage(&hcan, &TxHeader, TxData, &TxMailbox) == HAL_OK) {
    // 发送成功
}
```

## CANFD 协议

### 简介

CANFD（CAN with Flexible Data-rate）是对 CAN 协议的扩展，主要解决了 CAN 协议数据长度受限和速率上限的问题。

### 改进点

1. **可变数据速率**: 仲裁段保持 1 Mbps，数据段可达 8 Mbps
2. **更长数据场**: 数据场从 8 字节扩展到 64 字节
3. **更优的 CRC**: 采用 17 位或 21 位 CRC

### 帧结构对比

```
CAN:
  Arbitration: 1 Mbps
  Data:        1 Mbps, 最大 8 字节

CANFD:
  Arbitration: 1 Mbps (与 CAN 兼容)
  Data:        最高 8 Mbps, 最大 64 字节
```

### 代码示例

```c
// STM32 CANFD 配置示例
CANFD_TxHeaderTypeDef FdTxHeader;

FdTxHeader.Identifier = 0x100;
FdTxHeader.DataLength = 64;  // DLC 编码: CANFD_DLC_BYTES_64
FdTxHeader.FDFormat = CAN_FD_FORMAT;
FdTxHeader.BitRateSwitch = CAN_BRS_ON;

uint8_t FdTxData[64];
// 填充数据...

CANFD_AddTxMessage(&hcanfd, &FdTxHeader, FdTxData, &FdTxMailbox);
```

## CANXL 协议

### 简介

CANXL（CAN with Extended Length）是第三代 CAN 协议，于 2019 年发布，专为高速数据传输和自动驾驶场景设计。

### 关键特性

| 特性 | 说明 |
|------|------|
| **数据速率** | 最高 20 Mbps |
| **数据长度** | 最高 2048 字节（实际 64 字节） |
| **优先级** | 11 位 SDT（服务数据单元）+ 32 位 ID |
| **安全** | 内置加密/解密支持 |
| **兼容性** | 可与 CANFD 共存 |

### 应用场景

- 自动驾驶高速数据传输
- 车载以太网网关
- 大容量诊断数据
- 软件更新（OTA）

## 三者对比

### 性能参数

| 参数 | CAN | CANFD | CANXL |
|------|-----|-------|-------|
| **波特率** | 125K~1M | 125K~1M + 2M~8M | 10M~20M |
| **数据长度** | 8 字节 | 64 字节 | 64 字节* |
| **CRC 长度** | 15 位 | 17/21 位 | 21/25 位 |
| **帧头大小** | 4~5 字节 | 4~5 字节 | ~3 字节 |

> *CANXL 物理上支持 2048 字节，但当前标准化为 64 字节

### 传输效率对比

假设传输 64 字节数据：

```
CAN:     需要 8 个帧 (8 字节/帧 × 8 帧 = 64 字节)
         有效载荷率: 8/108 ≈ 7.4%

CANFD:   只需 1 个帧
         有效载荷率: 64/128 ≈ 50%

CANXL:   只需 1 个帧，更优的帧头
         有效载荷率: 64/80 ≈ 80%
```

### 选型建议

```
应用场景                    推荐协议
------------------------------------------
简单车身控制                 CAN
ADAS 传感器融合              CANFD
自动驾驶高速数据              CANXL
CAN 与 CANFD 混合网络        CANFD (兼容)
高速与低速混合网关            CANXL
```

## 总结

- **CAN**: 成熟稳定，适合简单场景，仍是车身网络主流
- **CANFD**: 平衡性能与成本，是当前升级首选
- **CANXL**: 面向未来，支持更高速率和安全特性

## 参考资料

- [CAN in Automation (CiA)](https://www.can-cia.org/)
- ISO 11898-1:2015 (CAN)
- ISO 11898-2:2016 (CAN FD)
- CiA 610-3 (CANXL)
