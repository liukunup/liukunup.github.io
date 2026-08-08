---
title: USB 全协议对比：从 1.0 到 USB4、Power Delivery 与 Thunderbolt
createTime: 2026/08/08 12:10:00
permalink: /blog/usb-protocol-comparison/
tags:
  - USB
  - USB PD
  - Thunderbolt
  - 嵌入式
  - 车载/PC外设
categories:
  - 嵌入式
---

## 概述

USB（Universal Serial Bus）是应用最广泛的外部总线标准。从 1996 年的 USB 1.0 到如今的 USB4、Power Delivery 和 Thunderbolt，协议演进围绕**传输速度、供电能力、协议兼容性和物理接口**四个维度展开。

本文覆盖以下协议：

| 类别 | 版本 | 最大速率 | 主要特点 |
|------|------|----------|----------|
| **USB 传统协议** | USB 1.0/1.1 | 1.5/12 Mbps | 开创性标准，半双工 |
| | USB 3.0 | 5 Gbps | 首次引入 SuperSpeed |
| | USB 3.1 Gen 2 | 10 Gbps | 10Gbps 时代 |
| | USB 3.2 | 20 Gbps | 双通道 10Gbps |
| **USB Power Delivery** | USB PD 2.0/3.0 | 100W | 灵活功率协商 |
| | USB PD 3.1 | 240W | EPR 扩展功率范围 |
| **Thunderbolt** | TB 1/2 | 10/20 Gbps | 融合 PCIe 与 DP |
| | TB 3/4 | 40 Gbps | 统一 USB-C 接口 |
| | TB 5 | 80 Gbps | 120Gbps 突发模式 |

## USB 传统协议

### USB 1.0/1.1

**发展历史**：USB 1.0 由 Intel、Compaq、Microsoft、NEC 等公司于 1996 年联合制定，1998 年修订为 USB 1.1。

**编码方式**：NRZI（Non-Return-to-Zero Inverted），无时钟同步，采用位填充确保同步。

**速率等级**：

| 模式 | 速率 | 典型应用 |
|------|------|----------|
| 低速（LS） | 1.5 Mbps | 键盘、鼠标、HID 设备 |
| 全速（FS） | 12 Mbps | 音频设备、压缩视频 |

**电气特性**：

```
电压：5V
电流：5V/100mA（低功率）或 5V/500mA（高功率）
线缆长度：最大 5 米（低速）/ 3 米（全速）
```

**物理接口**：Type-A、Type-B、Mini-A、Mini-B

### USB 3.0（SuperSpeed USB）

**发布年份**：2008 年，USB 3.0 规范正式发布。

**关键改进**：

1. **新增数据线**：从 4 针增加到 9 针，增加 SuperSpeed 专用通道
2. **全双工通信**：上下行可同时传输
3. **异步传输**：采用异步通知机制，不再轮询

**编码方式**：8b/10b 编码，损耗约 20% 带宽

**速率对比**：

| 版本 | 速率 | 编码 | 双工 |
|------|------|------|------|
| USB 2.0 | 480 Mbps | NRZI | 半双工 |
| USB 3.0 | 5 Gbps | 8b/10b | 全双工 |
| **效率提升** | **10 倍** | - | **2 倍** |

**电气特性**：

```
电压：5V
电流：5V/900mA
功率：4.5W
频率：2.5 GHz（SuperSpeed 通道）
```

**物理接口**：USB 3.0 Type-A（蓝色舌片）、USB 3.0 Type-B

### USB 3.1 Gen 2（SuperSpeed+）

**发布年份**：2013 年，USB 3.1 规范发布。

**核心改进**：

1. **速率翻倍**：从 5 Gbps 提升至 10 Gbps
2. **编码升级**：128b/132b 编码，损耗仅 3%
3. **供电增强**：5V/3A（15W）

**实际带宽**：

```
USB 3.0: 5 Gbps × 0.8 = 4 Gbps 有效带宽
USB 3.1: 10 Gbps × 0.97 = 9.7 Gbps 有效带宽
提升：约 143%
```

### USB 3.2（SuperSpeed USB 20Gbps）

**发布年份**：2017 年。

**关键特性**：引入**双通道**操作，利用 USB-C 接口的双面引脚同时传输。

| 模式 | 速率 | 说明 |
|------|------|------|
| Gen 1 | 5 Gbps | 与 USB 3.0 相同 |
| Gen 2x1 | 10 Gbps | 单通道 10Gbps |
| Gen 2x2 | 20 Gbps | 双通道各 10Gbps |

**注意**：Gen 2x2 模式仅支持 USB-C 接口，需要专用控制器。

## USB Power Delivery

### 概述

USB Power Delivery（USB PD）是 USB-IF 制定的电源管理协议，允许通过 USB 接口协商更高电压和电流，实现**动态功率调整**。

### USB PD 2.0

**发布时间**：2012 年。

**功率等级**：

| 固定档位 | 电压 | 最大电流 | 最大功率 |
|----------|------|----------|----------|
| 5V | 5V | 3A | 15W |
| 12V | 12V | 3A | 36W |
| 20V | 3A | 20V/3A | 60W |

**协商机制**：通过 CC（Configuration Channel）引脚进行功率协商

```
设备连接 → PD 通信 → 供电方提供能力列表 → 用电方请求所需功率 → 确认协商
```

### USB PD 3.0

**发布时间**：2015 年。

**新增特性**：

1. **PPS（Programmable Power Supply）**：可编程电源，步进 20mV/50mA 调节
2. **快速角色交换（Fast Role Swap）**：C-to-C 线缆热插拔时角色快速切换
3. **温度监控**：支持过温保护协议

### USB PD 3.1（EPR）

**发布时间**：2021 年。

**扩展功率范围（EPR）**：

| 类型 | 电压范围 | 最大电流 | 最大功率 |
|------|----------|----------|----------|
| 标准功率范围（SPR） | 5V-21V | 3A/5A | 60W/100W |
| **扩展功率范围（EPR）** | 28V/36V/48V | 5A | **240W** |

**新增电压档位**：

```
15V → 28V（笔记本电脑、游戏主机）
28V → 36V（显示器、工作站）
36V → 48V（电动工具、打印机）
```

### USB PD 代码示例

```python
# USB PD 协商模拟（伪代码）
class USB_PD_Controller:
    def __init__(self):
        self.source_caps = []  # 供电能力列表
        self.sink_request = None  # 用电请求
    
    def send_source_capabilities(self, voltage_current_pairs):
        """发送供电能力广播"""
        self.source_caps = voltage_current_pairs
        # CC 引脚发送 PD 消息
        self.cc_channel.transmit("Source_Capabilities", self.source_caps)
    
    def request_power(self, voltage, current):
        """请求指定功率"""
        self.sink_request = (voltage, current)
        self.cc_channel.transmit("Request", {
            'voltage': voltage,
            'current': current,
            'position': 0  # 请求第一个电源档位
        })
    
    def accept_negotiation(self):
        """接受协商结果"""
        response = self.cc_channel.receive()
        if response == "Accept":
            self.apply_power_profile(self.sink_request)
            return True
        return False
```

## Thunderbolt

### 概述

Thunderbolt 由 Intel 与 Apple 联合开发，融合 PCIe 和 DisplayPort 协议，最初定位为高性能扩展接口。

### Thunderbolt 1/2

**Thunderbolt 1**（2011）：

```
速率：10 Gbps（双向）
通道：双向各 10Gbps
物理：Mini DisplayPort 接口
协议：PCIe 2.0 × 4 + DP 1.1a
```

**Thunderbolt 2**（2013）：

```
改进：通道聚合，双向 20 Gbps
实际：同时支持 PCIe 和 DP 带宽共享
物理：Mini DisplayPort 接口（向后兼容）
```

### Thunderbolt 3

**发布时间**：2015 年。

**革命性变化**：采用 **USB-C** 接口形态，实现与 USB 的物理统一。

```
速率：40 Gbps（双向）
通道：PCIe 3.0 × 4（32 Gbps）+ DP 1.2（16 Gbps）
功率：15W（主机）/ 100W（USB PD）
总计带宽：40 Gbps
```

**带宽分配**：

```
┌─────────────────────────────────────────────────┐
│              Thunderbolt 3 (40 Gbps)            │
├──────────────────────┬──────────────────────────┤
│    PCIe 通道         │     DP 通道              │
│    32 Gbps           │     16 Gbps (双向)       │
│    (存储/扩展坞)     │     (外接显示器)         │
└──────────────────────┴──────────────────────────┘
```

**菊花链连接**：最多 6 台设备串联

```
主机 → 设备1 → 设备2 → 设备3 → ... → 设备6
```

### Thunderbolt 4

**发布时间**：2020 年。

**最小规格要求**（相比 TB3 的可选特性变成必选）：

| 特性 | TB3 | TB4 |
|------|-----|-----|
| 最小速率 | 20 Gbps | **40 Gbps** |
| PCIe 最低带宽 | 16 Gbps | **32 Gbps** |
| DP 最低带宽 | 8 Gbps | **32 Gbps** |
| PC 唤醒 | 可选 | **必选** |
| 端口强制配备 | 否 | **是** |
| 菊链设备数 | 6 | **4** |

### Thunderbolt 5

**发布时间**：2024 年初。

**关键指标**：

```
双向带宽：80 Gbps（对称模式）
突发模式：120 Gbps（单向）
总带宽：双向 160 Gbps
功率：最大 140W（充电）
```

**与 USB4 40 的关系**：

```
TB5 = USB4 40 + 额外带宽（40 Gbps → 80 Gbps）
TB5 支持 USB4 40 所有功能
USB4 40 设备可在 TB5 端口正常工作（限速至 40 Gbps）
```

## 协议对比

### 速度对比

| 协议 | 速率 | 年份 | 编码 |
|------|------|------|------|
| USB 1.0 LS | 1.5 Mbps | 1996 | NRZI |
| USB 1.1 FS | 12 Mbps | 1998 | NRZI |
| USB 3.0 | 5 Gbps | 2008 | 8b/10b |
| USB 3.1 | 10 Gbps | 2013 | 128b/132b |
| USB 3.2 | 20 Gbps | 2017 | 128b/132b |
| Thunderbolt 2 | 20 Gbps | 2013 | - |
| Thunderbolt 3/4 | 40 Gbps | 2015 | - |
| Thunderbolt 5 | 80 Gbps | 2024 | - |

### 供电能力对比

| 协议 | 最大功率 | 电压范围 | 说明 |
|------|----------|----------|------|
| USB 1.1 | 2.5W | 5V | 固定 |
| USB 3.0 | 4.5W | 5V | 900mA |
| USB PD 2.0 | 100W | 5/12/20V | 固定档位 |
| USB PD 3.1 | **240W** | 5-48V | EPR |
| Thunderbolt 3 | 100W | 20V | USB PD |
| Thunderbolt 4 | 140W | 20V | USB PD |
| Thunderbolt 5 | 140W | - | USB PD |

### 接口形态

| 协议 | 支持接口 |
|------|----------|
| USB 1.x | Type-A, Type-B, Mini-A/B |
| USB 3.0 | Type-A (蓝), Type-B |
| USB 3.1 | Type-A, Type-C, Type-B |
| USB PD | 必须 USB-C |
| Thunderbolt 3/4 | 必须 USB-C |
| Thunderbolt 5 | 必须 USB-C |

## 应用场景

```
场景                          推荐协议
─────────────────────────────────────────────────────
键盘/鼠标/简单HID              USB 1.1
U盘/移动硬盘（经济型）          USB 3.0
外接SSD高速存储                USB 3.1 Gen 2 / USB 3.2
外接显示器                     Thunderbolt 3/4
eGPU 扩展显卡                  Thunderbolt 3/4
专业视频采集                   Thunderbolt 4
笔记本充电（<100W）            USB PD 2.0/3.0
显示器/工作站充电（>100W）      USB PD 3.1 EPR
多显示器 + 存储 + 充电         Thunderbolt 4
创作者/工作站终极扩展           Thunderbolt 5
```

## 总结

| 协议 | 优势 | 适用场景 |
|------|------|----------|
| **USB 1.1** | 兼容性好、成本低 | 简单外设、HID |
| **USB 3.0/3.1** | 速度大幅提升、普及率高 | 存储、主流外设 |
| **USB PD 3.1** | 240W 供电、统一充电 | 笔记本、显示器、电动工具 |
| **Thunderbolt 3** | 40Gbps、多协议融合 | 专业扩展、eGPU |
| **Thunderbolt 4** | 规格统一、强制认证 | 高端笔记本、工作站 |
| **Thunderbolt 5** | 80Gbps、120G 突发 | 旗舰工作站、AI 加速 |

**未来趋势**：

1. USB-C 一统江湖，Type-A 逐渐退出历史舞台
2. USB PD 3.1 EPR 推动 240W 快充普及
3. Thunderbolt 与 USB4 协议层趋同
4. PCIe over USB / USB over PCIe 融合加速

## 参考资料

- [USB-IF Official](https://usb.org/)
- [Thunderbolt 5 Technology Brief](https://www.intel.com/content/www/us/en/products/docs/io/thunderbolt/thunderbolt-5-technology-brief.html)
- USB Power Delivery Specification 3.1
- USB 3.2 Specification
