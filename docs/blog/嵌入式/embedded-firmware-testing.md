---
title: 嵌入式固件测试工程：从 Bootloader 到 OTA 的全链路测试方案
tags:
  - 嵌入式
  - 固件测试
  - bootloader
  - OTA
  - 测试工程
createTime: 2026/08/23 02:26:26
permalink: /blog/embedded-firmware-testing/
---

> 嵌入式固件测试是硬件、软件与实时系统的交叉领域，需要覆盖从芯片上电到 OTA 升级的完整链路。本文提供一套完整的嵌入式固件测试工程方案，涵盖 Bootloader 测试、App 测试、OTA 测试、安全测试、硬件在环测试等全维度内容。

## 目录

1. [测试体系架构](#1-测试体系架构)
2. [测试环境搭建](#2-测试环境搭建)
3. [Bootloader 测试](#3-bootloader-测试)
4. [固件完整性测试](#4-固件完整性测试)
5. [安全测试](#5-安全测试)
6. [OTA 升级测试](#6-ota-升级测试)
7. [硬件在环测试 (HIL)](#7-硬件在环测试-hil)
8. [性能与压力测试](#8-性能与压力测试)
9. [测试自动化框架](#9-测试自动化框架)
10. [CI/CD 集成](#10-cicd-集成)
11. [测试度量与报告](#11-测试度量与报告)

---

## 1. 测试体系架构

### 1.1 测试金字塔

```
┌─────────────────────────────────────────────────────────────────┐
│                     嵌入式测试金字塔                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                           ▲                                     │
│                          ╱ ╲                                    │
│                         ╱   ╲         系统测试                   │
│                        ╱     ╲        (System Testing)          │
│                       ╱───────╲       - 端到端功能验证          │
│                      ╱         ╲      - OTA 完整流程           │
│                     ╱───────────╲     - 多模块集成              │
│                    ╱             ╲    - 边界条件               │
│                   ╱───────────────╲                              │
│                  ╱                 ╲   集成测试                 │
│                 ╱───────────────────╲  (Integration Testing)     │
│                ╱                     ╲ - Bootloader + App       │
│               ╱───────────────────────╲- Flash 读写              │
│              ╱                         ╲- 外设通信               │
│             ╱───────────────────────────╲- 中断验证               │
│            ╱                             ╲                       │
│           ╱───────────────────────────────╲ 组件测试              │
│          ╱                                 ╲(Component Testing)    │
│         ╱───────────────────────────────────╲- 签名验证           │
│        ╱                                     ╲- 版本检查           │
│       ╱───────────────────────────────────────╲- Flash 管理        │
│      ╱                                         ╲- 状态机           │
│     ╱───────────────────────────────────────────╲                 │
│    ╱                                             ╲ 单元测试       │
│   ╱───────────────────────────────────────────────╲(Unit Testing) │
│  ╱                                                 ╲- 算法验证     │
│ ╱───────────────────────────────────────────────────╲- 数据结构    │
│                                                         ╲- 业务逻辑 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                        测试覆盖率要求                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ 单元测试 │  │ 组件测试 │  │ 集成测试 │  │ 系统测试 │      │
│  │  80%+   │  │  90%+   │  │  85%+   │  │  100%   │      │
│  │ 分支覆盖 │  │ 函数覆盖 │  │ 接口覆盖 │  │ 场景覆盖 │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 测试分类矩阵

| 测试类型 | 目标 | 自动化程度 | 执行频率 | 反馈周期 |
| --- | --- | --- | --- | --- |
| **单元测试** | 算法逻辑正确性 | 100% | 每次提交 | < 5 分钟 |
| **组件测试** | 模块接口正确性 | 95% | 每次提交 | < 10 分钟 |
| **集成测试** | 模块间协作正确性 | 90% | 每日构建 | < 30 分钟 |
| **系统测试** | 端到端功能正确性 | 80% | 发布前 | < 2 小时 |
| **压力测试** | 极限条件稳定性 | 100% | 每周 | < 4 小时 |
| **安全测试** | 漏洞与攻击防护 | 70% | 每月 | < 8 小时 |

### 1.3 嵌入式测试的特殊性

```c
// 嵌入式测试的特殊考虑

/* 1. 硬件依赖 */
typedef struct {
    bool jtag_connected;      // JTAG 调试器连接状态
    bool flash_erased;        // Flash 是否已擦除
    bool target_powered;      // 目标板供电状态
    bool uart_connected;     // 串口连接状态
} HardwareContext;

/* 2. 资源限制 */
typedef struct {
    size_t ram_size;          // 可用 RAM
    size_t flash_size;        // 可用 Flash
    size_t stack_depth;       // 栈深度
    size_t heap_available;    // 堆可用大小
} ResourceConstraints;

/* 3. 实时性要求 */
typedef struct {
    uint32_t isr_latency_max;    // 中断响应时间上限
    uint32_t context_switch_time; // 上下文切换时间
    uint32_t task_deadline;       // 任务截止时间
    uint32_t watchdog_timeout;    // 看门狗超时
} RealTimeRequirements;
```

---

## 2. 测试环境搭建

### 2.1 测试环境架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    测试环境架构                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    测试管理服务器                          │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │  │
│  │  │ Test Runner │ │ CI/CD      │ │ Results DB │      │  │
│  │  │ (执行器)    │ │ Pipeline   │ │ (结果存储) │      │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐              │
│         ▼                  ▼                  ▼              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐        │
│  │  DUT #1    │   │  DUT #2    │   │  DUT #N    │        │
│  │ ┌─────────┐ │   │ ┌─────────┐ │   │ ┌─────────┐ │        │
│  │ │硬件目标板│ │   │ │硬件目标板│ │   │ │硬件目标板│ │        │
│  │ └────┬────┘ │   │ └────┬────┘ │   │ └────┬────┘ │        │
│  │      │      │   │      │      │   │      │      │        │
│  │ ┌────▼────┐ │   │ ┌────▼────┐ │   │ ┌────▼────┐ │        │
│  │ │测试适配器│ │   │ │测试适配器│ │   │ │测试适配器│ │        │
│  │ └────┬────┘ │   │ └────┬────┘ │   │ └────┬────┘ │        │
│  └──────┼───────┘   └──────┼───────┘   └──────┼───────┘        │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    测试仪器矩阵                            │  │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐     │  │
│  │  │示波器 │ │逻辑仪 │ │ 电源 │ │频谱仪 │ │ 电流表 │     │  │
│  │  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 测试夹具设计

```python
# test_fixture.py
import pyvisa
import serial
from enum import Enum
from dataclasses import dataclass
from typing import Optional
import time

class PowerState(Enum):
    OFF = 0
    ON = 1
    STANDBY = 2

@dataclass
class TestFixture:
    """测试夹具基类"""
    visa_resource: Optional[str] = None
    serial_port: Optional[str] = None
    target_voltage: float = 3.3
    target_current_limit: float = 2.0

    def __post_init__(self):
        self.rm = pyvisa.ResourceManager()
        self.power_supply = None
        self.dmm = None
        self.scope = None
        self.uart = None

    def connect(self):
        """连接测试设备"""
        if self.visa_resource:
            self.power_supply = self.rm.open_resource(self.visa_resource)
        if self.serial_port:
            self.uart = serial.Serial(
                self.serial_port,
                baudrate=115200,
                timeout=1
            )

    def power_on(self, voltage: float = 3.3, delay_ms: int = 100):
        """给目标板上电"""
        self.power_supply.write(f"VOLT {voltage}")
        self.power_supply.write("OUTP ON")
        time.sleep(delay_ms / 1000)

    def power_off(self):
        """下电"""
        self.power_supply.write("OUTP OFF")

    def read_voltage(self) -> float:
        """读取电压"""
        return float(self.dmm.query("MEAS:VOLT:DC?"))

    def read_current(self) -> float:
        """读取电流"""
        return float(self.dmm.query("MEAS:CURR:DC?"))

    def send_uart(self, data: bytes):
        """通过 UART 发送数据"""
        self.uart.write(data)

    def recv_uart(self, timeout_ms: int = 1000) -> bytes:
        """接收 UART 数据"""
        self.uart.timeout = timeout_ms / 1000
        return self.uart.read_all()
```

### 2.3 硬件连接配置

```yaml
# test_hardware.yaml
hardware:
  power_supply:
    type: Keysight_E3631A
    address: GPIB0::6::INSTR
    default_voltage: 3.3
    default_current_limit: 2.0

  multimeter:
    type: Keysight_34461A
    address: GPIB0::22::INSTR

  oscilloscope:
    type: Keysight_DSOX3024T
    address: TCPIP0::192.168.1.100::inst0

  logic_analyzer:
    type: Saleae_Logic8
    address: USB

  jtag_debugger:
    type: SEGGER_J-Link
    interface: SWD
    speed: 4000  # kHz

  uart:
    port: /dev/ttyUSB0
    baudrate: 115200
    parity: none
    stopbits: 1

target_boards:
  - name: STM32F407VG
    type: STM32
    flash_base: 0x08000000
    flash_size: 1024  # KB
    ram_base: 0x20000000
    ram_size: 192  # KB
    jtag_id: 0x4ba00477

  - name: ESP32_WROOM
    type: ESP32
    flash_base: 0x1000
    flash_size: 4096  # KB
    ram_base: 0x3FF00000
    ram_size: 320  # KB
```

---

## 3. Bootloader 测试

### 3.1 Bootloader 测试矩阵

| 测试类别 | 测试用例 | 预期结果 | 覆盖率 |
| --- | --- | --- | --- |
| **启动测试** | 正常启动流程 | 成功跳转到 App | MC/DC |
| **启动测试** | Flash 空启动 | 进入 DFU 模式 | C0 |
| **启动测试** | Flash 损坏启动 | 进入 DFU 或安全模式 | C1 |
| **签名验证** | 正确签名 | 验证通过 | C1 |
| **签名验证** | 错误签名 | 拒绝启动 | C1 |
| **签名验证** | 无签名 | 可配置接受/拒绝 | C0 |
| **版本检查** | 版本升级 | 允许启动 | C1 |
| **版本检查** | 版本回滚 | 拒绝启动 | C1 |
| **版本检查** | 版本相同 | 允许启动 | C0 |
| **Flash 操作** | Slot 读取 | 数据正确 | C0 |
| **Flash 操作** | Slot 写入 | 数据正确 | C0 |
| **Flash 操作** | Slot 擦除 | 全 0xFF | C0 |
| **交换测试** | 正常交换 | 交换成功 | C1 |
| **交换测试** | 交换中断 | 回滚到原状态 | C1 |
| **交换测试** | Scratch 不足 | 拒绝交换 | C0 |

### 3.2 Bootloader 单元测试

```c
// test_bootloader.c

#include <unity.h>
#include <string.h>
#include "bootutil/image.h"
#include "bootutil/crypto.h"
#include "bootutil/bootutil.h"

/* ========== 版本比较测试 ========== */

void test_version_compare_newer_major(void)
{
    struct image_version v1 = {1, 0, 0, 0};
    struct image_version v2 = {2, 0, 0, 0};

    TEST_ASSERT_GREATER_THAN(0, img_ver_compatible(&v2, &v1));
}

void test_version_compare_newer_minor(void)
{
    struct image_version v1 = {1, 2, 0, 0};
    struct image_version v2 = {1, 3, 0, 0};

    TEST_ASSERT_GREATER_THAN(0, img_ver_compatible(&v2, &v1));
}

void test_version_compare_newer_revision(void)
{
    struct image_version v1 = {1, 0, 2, 0};
    struct image_version v2 = {1, 0, 3, 0};

    TEST_ASSERT_GREATER_THAN(0, img_ver_compatible(&v2, &v1));
}

void test_version_compare_newer_build(void)
{
    struct image_version v1 = {1, 0, 0, 100};
    struct image_version v2 = {1, 0, 0, 200};

    TEST_ASSERT_GREATER_THAN(0, img_ver_compatible(&v2, &v1));
}

void test_version_compare_equal(void)
{
    struct image_version v1 = {1, 2, 3, 456};
    struct image_version v2 = {1, 2, 3, 456};

    TEST_ASSERT_EQUAL(0, img_ver_compatible(&v2, &v1));
}

void test_version_compare_rollback(void)
{
    struct image_version v1 = {2, 0, 0, 0};
    struct image_version v2 = {1, 0, 0, 0};

    TEST_ASSERT_LESS_THAN(0, img_ver_compatible(&v2, &v1));
}

/* ========== 签名验证测试 ========== */

static const uint8_t test_public_key[] = {
    /* RSA-2048 公钥 */
};

static const uint8_t test_signature[] = {
    /* 有效签名 */
};

static const uint8_t invalid_signature[] = {
    /* 无效签名 */
};

void test_signature_verify_valid(void)
{
    struct image_header hdr = {
        .ih_magic = IMAGE_MAGIC,
        .ih_ver = {.iv_major = 1, .iv_minor = 0, .iv_revision = 0, .iv_build_num = 1},
        .ih_hdr_size = 32,
        .ih_img_size = 1024,
        .ih_protect_tlv_size = 0,
    };

    uint8_t image_data[2048] = {0};
    fill_test_image(image_data, sizeof(image_data));

    int result = bootutil_verify_signature(&hdr, image_data,
                                          test_public_key, sizeof(test_public_key),
                                          test_signature, sizeof(test_signature));

    TEST_ASSERT_EQUAL(0, result);
}

void test_signature_verify_invalid(void)
{
    struct image_header hdr = {
        .ih_magic = IMAGE_MAGIC,
        .ih_ver = {.iv_major = 1, .iv_minor = 0, .iv_revision = 0, .iv_build_num = 1},
        .ih_hdr_size = 32,
        .ih_img_size = 1024,
    };

    uint8_t image_data[2048] = {0};

    int result = bootutil_verify_signature(&hdr, image_data,
                                          test_public_key, sizeof(test_public_key),
                                          invalid_signature, sizeof(invalid_signature));

    TEST_ASSERT_NOT_EQUAL(0, result);
}

void test_signature_verify_wrong_key(void)
{
    const uint8_t wrong_public_key[] = { /* 另一个公钥 */ };

    int result = bootutil_verify_signature(&hdr, image_data,
                                          wrong_public_key, sizeof(wrong_public_key),
                                          test_signature, sizeof(test_signature));

    TEST_ASSERT_NOT_EQUAL(0, result);
}

/* ========== Flash 操作测试 ========== */

void test_flash_read_write(void)
{
    uint32_t test_addr = 0x08010000;
    uint8_t write_data[256];
    uint8_t read_data[256];

    /* 生成测试数据 */
    for (int i = 0; i < sizeof(write_data); i++) {
        write_data[i] = i & 0xFF;
    }

    /* 写入 */
    int result = flash_write(test_addr, write_data, sizeof(write_data));
    TEST_ASSERT_EQUAL(0, result);

    /* 读取 */
    result = flash_read(test_addr, read_data, sizeof(read_data));
    TEST_ASSERT_EQUAL(0, result);

    /* 验证 */
    TEST_ASSERT_EQUAL_MEMORY(write_data, read_data, sizeof(write_data));
}

void test_flash_erase(void)
{
    uint32_t test_addr = 0x08010000;
    uint8_t read_data[256];

    /* 先写入数据 */
    uint8_t write_data[256] = {0xAA};
    flash_write(test_addr, write_data, sizeof(write_data));

    /* 擦除 (4KB 扇区) */
    int result = flash_erase(test_addr, 4096);
    TEST_ASSERT_EQUAL(0, result);

    /* 读取验证 - 擦除后应为 0xFF */
    flash_read(test_addr, read_data, sizeof(read_data));
    for (int i = 0; i < 256; i++) {
        TEST_ASSERT_EQUAL_HEX8(0xFF, read_data[i]);
    }
}

void test_flash_boundary(void)
{
    /* 测试扇区边界 */
    uint32_t sector_start = 0x08010000;
    uint32_t sector_end = 0x08010FFF;  /* 4KB 扇区 */

    uint8_t data_start[4] = {0x11, 0x22, 0x33, 0x44};
    uint8_t data_end[4] = {0xAA, 0xBB, 0xCC, 0xDD};

    /* 写入起始位置 */
    flash_write(sector_start, data_start, sizeof(data_start));

    /* 写入结束位置 */
    flash_write(sector_end - 3, data_end, sizeof(data_end));

    /* 验证 */
    uint8_t verify[4];
    flash_read(sector_start, verify, sizeof(verify));
    TEST_ASSERT_EQUAL_MEMORY(data_start, verify, sizeof(data_start));

    flash_read(sector_end - 3, verify, sizeof(verify));
    TEST_ASSERT_EQUAL_MEMORY(data_end, verify, sizeof(data_end));
}

/* ========== 镜像头部解析测试 ========== */

void test_image_header_parse_valid(void)
{
    uint8_t header_data[32] = {
        0x96, 0x00, 0x00, 0x00,  /* Magic */
        0x00, 0x00, 0x10, 0x00,  /* Load Address */
        0x20, 0x00, 0x00, 0x00,  /* Header Size = 32 */
        0x00, 0x01, 0x00, 0x00,  /* Protected TLV Size */
        0x00, 0x04, 0x00, 0x00,  /* Image Size = 1024 */
        0x00, 0x00, 0x00, 0x00,  /* Flags */
        0x01, 0x00, 0x00, 0x00,  /* Version: 1.0.0.0 */
    };

    struct image_header hdr;
    int result = parse_image_header(header_data, sizeof(header_data), &hdr);

    TEST_ASSERT_EQUAL(0, result);
    TEST_ASSERT_EQUAL(IMAGE_MAGIC, hdr.ih_magic);
    TEST_ASSERT_EQUAL(32, hdr.ih_hdr_size);
    TEST_ASSERT_EQUAL(1024, hdr.ih_img_size);
    TEST_ASSERT_EQUAL(1, hdr.ih_ver.iv_major);
    TEST_ASSERT_EQUAL(0, hdr.ih_ver.iv_minor);
}

void test_image_header_parse_invalid_magic(void)
{
    uint8_t header_data[32] = {
        0x00, 0x00, 0x00, 0x00,  /* Invalid Magic */
        /* ... */
    };

    struct image_header hdr;
    int result = parse_image_header(header_data, sizeof(header_data), &hdr);

    TEST_ASSERT_NOT_EQUAL(0, result);
}

/* 设置测试组 */
void setUp(void) {
    /* 初始化测试环境 */
    mock_flash_init();
    mock_crypto_init();
}

void tearDown(void) {
    /* 清理测试环境 */
    mock_flash_cleanup();
    mock_crypto_cleanup();
}
```

### 3.3 Bootloader 集成测试

```python
# test_bootloader_integration.py
import pytest
import serial
import time
import struct
from pathlib import Path
from typing import Optional

class BootloaderTester:
    """Bootloader 集成测试器"""

    def __init__(self, serial_port: str, baudrate: int = 115200):
        self.uart = serial.Serial(serial_port, baudrate, timeout=1)
        self.bootloader_output = []

    def reset_target(self):
        """复位目标设备"""
        # 发送复位命令或控制 RTS 引脚
        self.uart.setRTS(True)
        time.sleep(0.1)
        self.uart.setRTS(False)
        time.sleep(0.5)

    def read_bootloader_log(self, timeout: float = 2.0) -> str:
        """读取 Bootloader 日志"""
        start_time = time.time()
        output = []
        while time.time() - start_time < timeout:
            if self.uart.in_waiting:
                data = self.uart.read(self.uart.in_waiting)
                output.append(data.decode('utf-8', errors='ignore'))
            else:
                time.sleep(0.01)
        return ''.join(output)

    def get_boot_status(self) -> dict:
        """获取启动状态"""
        self.uart.write(b'boot status\n')
        time.sleep(0.2)
        response = self.read_bootloader_log(0.5)

        return {
            'boot_source': self._parse_field(response, 'Source:'),
            'image_version': self._parse_field(response, 'Version:'),
            'swap_status': self._parse_field(response, 'Swap:'),
            'result': 'ok' if 'Boot OK' in response else 'failed'
        }

    def _parse_field(self, text: str, field: str) -> str:
        """解析日志字段"""
        for line in text.split('\n'):
            if field in line:
                return line.split(field)[1].strip()
        return None


class TestBootloaderIntegration:
    """Bootloader 集成测试"""

    @pytest.fixture
    def dut(self):
        """设备 Under Test"""
        tester = BootloaderTester('/dev/ttyUSB0')
        yield tester
        tester.uart.close()

    @pytest.fixture
    def flash_programmer(self):
        """Flash 编程器"""
        return FlashProgrammer('/dev/ttyUSB1')

    def test_normal_boot_flow(self, dut, flash_programmer):
        """测试正常启动流程"""
        # 1. 编程有效固件
        firmware = self._load_firmware('test_app_v1.bin')
        flash_programmer.erase(0x08010000, len(firmware))
        flash_programmer.write(0x08010000, firmware)
        flash_programmer.verify(0x08010000, firmware)

        # 2. 复位目标
        dut.reset_target()

        # 3. 等待启动完成
        log = dut.read_bootloader_log(timeout=3.0)

        # 4. 验证启动成功
        assert 'MCUboot' in log
        assert 'Image verified' in log or 'Signature OK' in log
        assert 'Booting image' in log

        # 5. 验证应用启动
        assert 'Application started' in log or 'Welcome to' in log

    def test_invalid_signature_rejected(self, dut, flash_programmer):
        """测试无效签名被拒绝"""
        # 1. 编程带错误签名的固件
        firmware = self._load_firmware('test_app_invalid_sig.bin')
        flash_programmer.write(0x08010000, firmware)

        # 2. 复位
        dut.reset_target()

        # 3. 读取启动日志
        log = dut.read_bootloader_log()

        # 4. 验证拒绝启动
        assert 'Signature verification failed' in log or 'Image invalid' in log
        assert 'Booting image' not in log or 'Failed' in log

    def test_rollback_prevention(self, dut, flash_programmer):
        """测试回滚保护"""
        # 1. 编程 v2.0.0
        v2_firmware = self._load_firmware('test_app_v2.bin')
        flash_programmer.write(0x08010000, v2_firmware)
        dut.reset_target()
        dut.read_bootloader_log()

        # 2. 尝试刷入 v1.0.0
        v1_firmware = self._load_firmware('test_app_v1.bin')
        flash_programmer.write(0x08050000, v1_firmware)  # Secondary Slot

        # 触发 OTA 交换
        dut.uart.write(b'ota swap\n')
        dut.reset_target()

        log = dut.read_bootloader_log()

        # 3. 验证回滚被阻止
        assert 'Version too low' in log or 'Downgrade prevented' in log

    def test_swap_interruption_recovery(self, dut, flash_programmer):
        """测试交换中断恢复"""
        # 1. 准备 v1.0.0 在 Primary
        v1_firmware = self._load_firmware('test_app_v1.bin')
        flash_programmer.write(0x08010000, v1_firmware)

        # 2. 准备 v2.0.0 在 Secondary
        v2_firmware = self._load_firmware('test_app_v2.bin')
        flash_programmer.write(0x08050000, v2_firmware)

        # 3. 开始交换
        dut.uart.write(b'ota swap\n')
        dut.reset_target()

        # 4. 模拟在交换过程中断电 (实际测试时需要硬件控制)
        # power_supply.set_voltage(0)
        time.sleep(0.5)  # 在交换中途切断

        # 5. 重新上电
        # power_supply.set_voltage(3.3)
        dut.reset_target()

        log = dut.read_bootloader_log()

        # 6. 验证恢复机制
        status = dut.get_boot_status()
        assert status['result'] == 'ok'
        # 应该是 v1.0.0 或 v2.0.0，不能是损坏的状态
        assert status['image_version'] in ['1.0.0', '2.0.0']

    def test_flash_corruption_detection(self, dut, flash_programmer):
        """测试 Flash 损坏检测"""
        # 1. 编程正常固件
        firmware = self._load_firmware('test_app_v1.bin')
        flash_programmer.write(0x08010000, firmware)

        # 2. 模拟 Flash 损坏 (翻转几个位)
        corrupted_data = bytearray(firmware)
        corrupted_data[100] ^= 0xFF  # 翻转多位
        flash_programmer.write(0x08010000, bytes(corrupted_data))

        # 3. 复位
        dut.reset_target()

        log = dut.read_bootloader_log()

        # 4. 验证检测到损坏
        assert 'Image corrupted' in log or 'CRC mismatch' in log or 'Hash mismatch' in log
```

---

## 4. 固件完整性测试

### 4.1 完整性测试策略

```python
# test_firmware_integrity.py

class FirmwareIntegrityTest:
    """固件完整性测试"""

    def __init__(self, target: TargetInterface):
        self.target = target

    def test_crc32_integrity(self):
        """CRC32 完整性测试"""
        # 读取固件 CRC
        stored_crc = self.target.read_persistent(CRC_ADDRESS)

        # 计算当前固件 CRC
        flash_size = self.target.get_flash_size()
        calculated_crc = self.target.calculate_crc32(FLASH_BASE, flash_size)

        assert stored_crc == calculated_crc, \
            f"CRC mismatch: stored={stored_crc:#010x}, calculated={calculated_crc:#010x}"

    def test_sha256_integrity(self):
        """SHA256 完整性测试"""
        stored_hash = self.target.read_persistent(HASH_ADDRESS)

        calculated_hash = self.target.calculate_sha256(FLASH_BASE, FLASH_SIZE)

        assert stored_hash == calculated_hash, \
            "SHA256 hash mismatch - firmware may be corrupted"

    def test_memory_integrity(self):
        """内存完整性测试"""
        test_patterns = [
            0x55555555,
            0xAAAAAAAA,
            0xFFFFFFFF,
            0x00000000,
            0xA5A5A5A5,
            0x5A5A5A5A,
        ]

        test_address = 0x20000000  # SRAM 起始

        for pattern in test_patterns:
            # 写入测试模式
            self.target.write_memory(test_address, struct.pack('<I', pattern))

            # 读取验证
            read_data = self.target.read_memory(test_address, 4)
            read_pattern = struct.unpack('<I', read_data)[0]

            assert read_pattern == pattern, \
                f"Memory test failed: wrote {pattern:#010x}, read {read_pattern:#010x}"

            test_address += 4

    def test_stack_integrity(self):
        """栈完整性测试"""
        # 填充栈区域
        stack_top = 0x20020000
        stack_size = 0x4000  # 16KB stack

        fill_pattern = 0xDEADBEEF
        self.target.fill_memory(stack_top - stack_size, stack_size, fill_pattern)

        # 运行一段时间
        self.target.delay(1000)  # 1 second

        # 检查栈使用情况
        # 找到第一个非填充模式的位置
        current_sp = stack_top
        while current_sp > stack_top - stack_size:
            data = self.target.read_memory(current_sp, 4)
            value = struct.unpack('<I', data)[0]
            if value != fill_pattern:
                break
            current_sp -= 4

        stack_used = stack_top - current_sp
        stack_usage_percent = (stack_used / stack_size) * 100

        # 验证栈未溢出
        assert stack_usage_percent < 80, \
            f"Stack usage too high: {stack_usage_percent:.1f}%"

        print(f"Stack usage: {stack_used} bytes ({stack_usage_percent:.1f}%)")

    def test_nvram_persistence(self):
        """NVSRAM 持久化测试"""
        test_data = b"TestPattern123"

        # 写入测试数据
        self.target.write_nvram(TEST_NVRAM_ADDR, test_data)

        # 软件复位
        self.target.reset()

        # 读取验证
        read_data = self.target.read_nvram(TEST_NVRAM_ADDR, len(test_data))

        assert read_data == test_data, \
            "NVSRAM data lost after reset - persistence test failed"
```

### 4.2 启动完整性测试

```c
// test_startup_integrity.c

typedef struct {
    uint32_t magic;
    uint32_t checksum;
    uint32_t timestamp;
    uint32_t version;
} StartupRecord;

#define STARTUP_LOG_BASE 0x0807F000
#define STARTUP_LOG_MAGIC 0xDEADBEEF

/* 启动完整性测试 */
void test_startup_sequence(void)
{
    StartupRecord records[10];
    uint32_t num_records = 0;

    /* 读取启动记录 */
    flash_read(STARTUP_LOG_BASE, records, sizeof(records));

    /* 验证记录数量 */
    num_records = records[0].magic == STARTUP_LOG_MAGIC ?
                  (sizeof(records) / sizeof(StartupRecord)) : 0;

    TEST_ASSERT_GREATER_THAN(0, num_records);

    /* 验证启动序列的连续性 */
    for (int i = 1; i < num_records; i++) {
        if (records[i].magic != STARTUP_LOG_MAGIC) {
            break;
        }

        /* 验证时间戳递增 */
        TEST_ASSERT_GREATER_THAN(records[i-1].timestamp,
                                records[i].timestamp);

        /* 验证校验和 */
        uint32_t calculated_checksum =
            calculate_checksum(&records[i], sizeof(StartupRecord) - sizeof(uint32_t));
        TEST_ASSERT_EQUAL(records[i].checksum, calculated_checksum);
    }

    /* 验证最后一次启动 */
    StartupRecord *last = &records[0];
    TEST_ASSERT_EQUAL(STARTUP_LOG_MAGIC, last->magic);
    TEST_ASSERT_GREATER_THAN(0, last->timestamp);
}

/* CRC 启动测试 */
void test_crc_validation_at_boot(void)
{
    /* 读取存储的 CRC */
    uint32_t stored_crc = *((uint32_t *)CRC_STORAGE_ADDR);

    /* 计算当前固件 CRC */
    uint32_t calculated_crc = crc32((void *)APP_BASE_ADDR, APP_SIZE);

    TEST_ASSERT_EQUAL(stored_crc, calculated_crc);
}

/* 内存初始化测试 */
void test_ram_initialization(void)
{
    volatile uint32_t *ram_start = (volatile uint32_t *)SRAM_BASE;
    volatile uint32_t *ram_end = (volatile uint32_t *)(SRAM_BASE + SRAM_SIZE);

    /* 检查 .bss 段是否清零 */
    extern uint32_t __bss_start;
    extern uint32_t __bss_end;

    for (uint32_t *p = &__bss_start; p < &__bss_end; p++) {
        TEST_ASSERT_EQUAL_HEX32(0, *p);
    }

    /* 检查 .data 段是否正确复制 */
    extern uint32_t __data_start;
    extern uint32_t __data_end;
    extern uint32_t __data_load;

    uint32_t *load = &__data_load;
    for (uint32_t *p = &__data_start; p < &__data_end; p++) {
        TEST_ASSERT_EQUAL(*load++, *p);
    }
}
```

---

## 5. 安全测试

### 5.1 安全测试矩阵

| 安全领域 | 测试用例 | 攻击向量 | 防护措施 |
| --- | --- | --- | --- |
| **安全启动** | 签名绕过 | 恶意镜像 | 签名验证 |
| **安全启动** | 公钥替换 | 伪造公钥 | 公钥哈希验证 |
| **安全启动** | 版本回滚 | 旧版漏洞 | 回滚保护 |
| **密钥管理** | 密钥提取 | 侧信道 | 安全存储 |
| **密钥管理** | 密钥硬编码 | 代码逆向 | 安全密钥加载 |
| **通信安全** | 中间人攻击 | 网络嗅探 | TLS/加密 |
| **通信安全** | 重放攻击 | 数据重发 | 序列号/时间戳 |
| **调试接口** | JTAG 攻击 | 硬件调试 | JTAG 禁用 |
| **调试接口** | SWD 攻击 | 芯片提取 | 读保护 |
| **物理安全** | 侧信道 | 功耗分析 | 掩码/随机化 |
| **物理安全** | 故障注入 | 电压/时钟 | 冗余检查 |

### 5.2 安全启动测试

```python
# test_secure_boot.py

class SecureBootTest:
    """安全启动测试"""

    def test_signature_validation_disabled(self, target):
        """测试禁用签名验证时的行为"""
        # 读取安全配置
        security_config = target.read_security_config()

        if not security_config['signature_required']:
            pytest.skip("Signature verification is disabled by design")

        # 尝试绕过签名验证
        result = target.disable_signature_check()
        assert not result, "Should not allow disabling signature check"

    def test_public_key_immutable(self, target):
        """测试公钥不可修改"""
        # 读取当前公钥
        original_key = target.read_public_key()

        # 尝试写入新公钥
        fake_key = self._generate_fake_key()
        result = target.write_public_key(fake_key)

        assert not result, "Should not allow modifying public key"

        # 验证原公钥未变
        current_key = target.read_public_key()
        assert current_key == original_key

    def test_jtag_security(self, target):
        """测试 JTAG 安全"""
        # 检查 JTAG 是否禁用
        assert not target.jtag_enabled(), "JTAG should be disabled in production"

        # 尝试启用 JTAG
        result = target.enable_jtag()
        assert not result, "Should not allow enabling JTAG in secure mode"

    def test_readout_protection(self, target):
        """测试读出保护 (RDP)"""
        # 检查 RDP 级别
        rdp_level = target.get_rdp_level()

        # 生产版本应为 RDP Level 2
        assert rdp_level >= 2, \
            f"RDP Level {rdp_level} is insufficient, should be >= 2"

    def test_secure_boot_enforced(self, target):
        """测试安全启动强制执行"""
        # 准备未签名镜像
        unsigned_firmware = self._create_unsigned_firmware()

        # 刷入并尝试启动
        target.flash_write(0x08010000, unsigned_firmware)
        target.reset()

        # 验证启动失败
        boot_status = target.get_boot_status()
        assert boot_status['result'] == 'failed'
        assert 'signature' in boot_status['error'].lower()

    def test_rollback_attack_prevented(self, target):
        """测试回滚攻击防护"""
        # 读取当前版本
        current_version = target.get_image_version()

        # 尝试安装旧版本
        old_firmware = self._load_firmware('v1.0.0_signed.bin')
        target.flash_write(0x08050000, old_firmware)
        target.reset()

        # 验证被阻止
        status = target.get_boot_status()
        assert 'version' in status['error'].lower() or \
               'rollback' in status['error'].lower()

        # 验证仍然运行新版本
        assert target.get_image_version() == current_version

    def test_encrypted_firmware_rejected_plaintext(self, target):
        """测试加密固件不能以明文运行"""
        # 准备未加密固件 (预期应该是加密的)
        plain_firmware = self._create_plain_firmware()

        target.flash_write(0x08010000, plain_firmware)
        target.reset()

        # 验证拒绝启动
        status = target.get_boot_status()
        assert status['result'] == 'failed'
```

### 5.3 渗透测试

```python
# test_penetration.py

class PenetrationTest:
    """渗透测试"""

    def test_memory_dump_via_jtag(self, target):
        """测试通过 JTAG 导出内存"""
        if not target.jtag_enabled():
            pytest.skip("JTAG is disabled")

        # 尝试读取 Flash 内容
        flash_content = target.jtag_read(FLASH_BASE, FLASH_SIZE)

        # 验证读出的是加密的或无效的
        assert not self._is_plaintext_firmware(flash_content), \
            "Flash content should not be readable via JTAG"

    def test_firmware_extraction_via_uart(self, target):
        """测试通过 UART 提取固件"""
        # 发送读取固件命令
        target.uart.send(b'read_flash 0x08000000 1024\n')

        response = target.uart.recv(timeout=2.0)

        # 验证响应不包含固件内容
        assert not self._contains_firmware_code(response), \
            "Firmware should not be readable via UART"

    def test_debug_commands_disabled(self, target):
        """测试调试命令已禁用"""
        debug_commands = [
            'dump_mem',
            'read_flash',
            'write_flash',
            'read_reg',
            'write_reg',
            'go',
            'halt',
        ]

        for cmd in debug_commands:
            response = target.uart.send_and_recv(f'{cmd}\n')
            assert 'unknown command' in response.lower() or \
                   'not available' in response.lower(), \
                   f"Debug command '{cmd}' should be disabled"

    def test_uart_bof_protection(self, target):
        """测试 UART 缓冲区溢出保护"""
        # 发送超长字符串
        long_string = 'A' * 1000
        target.uart.send(long_string + '\n')

        # 验证不崩溃
        target.uart.send('version\n')
        response = target.uart.recv(timeout=1.0)

        assert 'error' not in response.lower()
        assert 'firmware' in response.lower()
```

---

## 6. OTA 升级测试

### 6.1 OTA 测试状态机

```
┌─────────────────────────────────────────────────────────────────┐
│                     OTA 测试状态机                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│           ┌──────────────┐                                      │
│           │   IDLE       │                                      │
│           │  (空闲)      │                                      │
│           └──────┬───────┘                                      │
│                  │                                              │
│                  ▼                                              │
│           ┌──────────────┐      ┌──────────────┐              │
│           │ CHECK_UPDATE │─────▶│ NO_UPDATE    │              │
│           │  (检查更新)  │ no   │  (无更新)    │              │
│           └──────┬───────┘      └──────────────┘              │
│                  │ yes                                          │
│                  ▼                                              │
│           ┌──────────────┐                                      │
│           │  DOWNLOADING │────────────────────────────────┐   │
│           │  (下载中)    │                                  │   │
│           └──────┬───────┘                                  │   │
│                  │                                          │   │
│         ┌───────┴───────┐                                  │   │
│         ▼               ▼                                   │   │
│  ┌──────────────┐ ┌──────────────┐                       │   │
│  │  DOWNLOAD_OK │ │DOWNLOAD_ERR │                       │   │
│  │  (下载成功)  │ │ (下载失败)  │                       │   │
│  └──────┬───────┘ └──────────────┘                       │   │
│         │                                                   │   │
│         ▼                                                   │   │
│  ┌──────────────┐                                          │   │
│  │   VERIFYING  │───────────────────────────────────────┘   │
│  │  (验证中)    │                                          │
│  └──────┬───────┘                                          │
│         │                                                  │
│         ▼                                                  │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │  VERIFY_OK   │─────▶│ VERIFY_FAIL  │                   │
│  │  (验证成功)  │ no   │  (验证失败)  │                   │
│  └──────┬───────┘      └──────────────┘                   │
│         │ yes                                           │
│         ▼                                                 │
│  ┌──────────────┐                                         │
│  │   APPLYING   │ (应用升级)                             │
│  └──────┬───────┘                                         │
│         │                                                 │
│         ▼                                                 │
│  ┌──────────────┐      ┌──────────────┐                  │
│  │   REBOOTING  │─────▶│  APPLY_ERR   │                  │
│  │  (重启中)    │      │  (应用失败)  │                  │
│  └──────┬───────┘      └──────────────┘                  │
│         │                                                 │
│         ▼                                                 │
│  ┌──────────────┐                                         │
│  │CONFIRM_WAIT │ (确认等待)                             │
│  └──────┬───────┘                                         │
│         │                                                 │
│         ▼                                                 │
│  ┌──────────────┐      ┌──────────────┐                  │
│  │   CONFIRMED  │─────▶│  REVERTING   │                  │
│  │  (已确认)    │ no   │  (回滚中)    │                  │
│  └──────────────┘      └──────┬───────┘                  │
│                                │                           │
│                                ▼                           │
│                         ┌──────────────┐                  │
│                         │REVERTED/IDLE│                  │
│                         └──────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 OTA 测试用例

```python
# test_ota.py

class OTATest:
    """OTA 升级测试"""

    @pytest.fixture
    def ota_server(self, tmp_path):
        """OTA 测试服务器"""
        server = OTAServer(tmp_path)
        server.start()
        yield server
        server.stop()

    def test_successful_upgrade(self, target, ota_server):
        """测试成功升级流程"""
        initial_version = target.get_version()

        # 1. 上传新版本固件到服务器
        new_firmware = self._load_firmware('v2.0.0.bin')
        ota_server.add_firmware('v2.0.0', new_firmware)

        # 2. 触发更新检查
        target.check_for_update()

        # 3. 验证发现新版本
        update_info = target.get_pending_update()
        assert update_info is not None
        assert update_info['version'] == '2.0.0'

        # 4. 下载固件
        download_progress = []
        target.download_update(
            progress_callback=lambda p: download_progress.append(p)
        )

        # 5. 验证下载进度
        assert download_progress[-1] == 100
        assert len(download_progress) > 1  # 有进度更新

        # 6. 验证固件完整性
        assert target.verify_downloaded_image()

        # 7. 应用更新
        target.apply_update()

        # 8. 重启
        target.reset()

        # 9. 验证升级成功
        new_version = target.get_version()
        assert new_version == '2.0.0'
        assert new_version != initial_version

    def test_download_interruption_recovery(self, target, ota_server):
        """测试下载中断恢复"""
        ota_server.add_firmware('v2.0.0', self._load_firmware('v2.0.0.bin'))

        # 模拟在 50% 处中断
        def fail_at_50(progress):
            if progress >= 50:
                raise ConnectionError("Simulated network failure")

        # 开始下载
        with pytest.raises(ConnectionError):
            target.download_update(
                progress_callback=fail_at_50,
                timeout=30
            )

        # 验证部分下载被保存
        partial_size = target.get_downloaded_size()
        assert partial_size > 0

        # 恢复下载
        target.resume_download()

        # 验证最终成功
        assert target.verify_downloaded_image()

    def test_corrupted_update_rejected(self, target, ota_server):
        """测试损坏更新被拒绝"""
        # 准备损坏的固件
        corrupted_firmware = bytearray(self._load_firmware('v2.0.0.bin'))
        corrupted_firmware[100] ^= 0xFF
        corrupted_firmware[200] ^= 0xFF

        ota_server.add_firmware('v2.0.0', bytes(corrupted_firmware))

        target.check_for_update()
        target.download_update()

        # 验证失败
        assert not target.verify_downloaded_image()

        # 验证仍然运行旧版本
        assert target.get_version() == '1.0.0'

    def test_power_loss_during_update(self, target, ota_server, power_supply):
        """测试更新期间断电"""
        ota_server.add_firmware('v2.0.0', self._load_firmware('v2.0.0.bin'))

        target.check_for_update()
        target.download_update()

        # 在应用阶段模拟断电
        def interrupt_at_apply():
            if target.get_state() == 'APPLYING':
                power_supply.set_voltage(0)
                time.sleep(0.1)
                power_supply.set_voltage(3.3)

        # 启动更新并中断
        interrupt_thread = threading.Thread(target=interrupt_at_apply)
        interrupt_thread.start()

        with pytest.raises(PowerLossError):
            target.apply_update()

        interrupt_thread.join()

        # 重启
        target.reset()

        # 验证恢复 - 应该回滚或重新进入更新流程
        status = target.get_boot_status()
        assert status['result'] == 'ok'

        # 验证一致性
        assert target.verify_image_integrity()

    def test_rollback_after_failure(self, target, ota_server):
        """测试失败后回滚"""
        ota_server.add_firmware('v2.0.0', self._load_firmware('v2.0.0.bin'))

        # 准备会崩溃的固件 (注入故障)
        bad_firmware = self._create_crash_firmware()
        ota_server.add_firmware('v2.0.0', bad_firmware)

        initial_version = target.get_version()

        target.check_for_update()
        target.download_update()
        target.apply_update()
        target.reset()

        # 等待看门狗复位
        time.sleep(10)

        # 验证回滚到旧版本
        current_version = target.get_version()
        assert current_version == initial_version

        # 验证状态机进入回滚状态
        status = target.get_ota_status()
        assert status['state'] in ['IDLE', 'REVERTED']
        assert status['last_error'] is not None

    def test_update_with_insufficient_space(self, target, ota_server):
        """测试空间不足处理"""
        # 模拟空间不足
        target.set_available_flash(1024)  # 1KB

        ota_server.add_firmware('v2.0.0', self._load_firmware('v2.0.0.bin'))

        target.check_for_update()

        # 验证提示空间不足
        update_info = target.get_pending_update()
        assert update_info['size'] > target.get_available_flash()

        # 尝试下载应失败
        with pytest.raises(InsufficientSpaceError):
            target.download_update()

    def test_update_persistence_across_power_cycles(self, target, ota_server):
        """测试更新状态在断电后持久化"""
        ota_server.add_firmware('v2.0.0', self._load_firmware('v2.0.0.bin'))

        target.check_for_update()
        target.download_update()

        # 断电
        target.power_off()
        time.sleep(1)
        target.power_on()

        # 验证下载状态保留
        status = target.get_ota_status()
        assert status['downloaded'] == True
        assert status['download_progress'] == 100

        # 完成更新
        target.apply_update()
        target.reset()

        # 验证更新成功
        assert target.get_version() == '2.0.0'
```

### 6.3 OTA 压力测试

```python
# test_ota_stress.py

class OTA_STRESS_TEST:
    """OTA 压力测试"""

    def test_repeated_upgrades(self, target, ota_server):
        """测试反复升级"""
        versions = ['v1.0.0', 'v2.0.0', 'v3.0.0', 'v1.0.0']

        current = 'v1.0.0'

        for target_ver in versions:
            # 准备目标版本
            firmware = self._load_firmware(f'{target_ver}.bin')
            ota_server.add_firmware(target_ver, firmware)

            # 执行升级
            target.check_for_update()
            target.download_update()
            target.apply_update()
            target.reset()

            # 验证
            assert target.get_version() == target_ver
            current = target_ver

    def test_network_instability(self, target, ota_server):
        """测试网络不稳定"""
        ota_server.add_firmware('v2.0.0', self._load_firmware('v2.0.0.bin'))

        # 模拟网络不稳定
        ota_server.set_network_quality(50)  # 50% 丢包率

        # 多次尝试下载
        for attempt in range(5):
            try:
                target.download_update(timeout=60)
                break
            except ConnectionError:
                continue

        # 验证最终成功
        assert target.verify_downloaded_image()

    def test_update_with_background_tasks(self, target, ota_server):
        """测试后台任务运行时的更新"""
        ota_server.add_firmware('v2.0.0', self._load_firmware('v2.0.0.bin'))

        # 启动后台任务
        target.start_background_tasks()

        # 执行更新
        target.check_for_update()
        target.download_update()

        # 验证后台任务仍在运行
        assert target.is_background_task_running()

        target.apply_update()
        target.reset()

        # 验证更新成功且后台任务正常
        assert target.get_version() == 'v2.0.0'
        assert target.is_background_task_running()
```

---

## 7. 硬件在环测试 (HIL)

### 7.1 HIL 测试架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    硬件在环测试架构 (HIL)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                   仿真服务器                             │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │  │
│  │  │ Plant Model │ │Sensor Model│ │ Actuator    │      │  │
│  │  │   (被控对象) │ │  (传感器)   │ │   (执行器)  │      │  │
│  │  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘      │  │
│  │         │                │                │             │  │
│  │         └────────────────┼────────────────┘             │  │
│  │                          ▼                               │  │
│  │                 ┌───────────────┐                       │  │
│  │                 │  I/O Interface │                       │  │
│  │                 │  (实时接口)    │                       │  │
│  │                 └───────┬───────┘                       │  │
│  └─────────────────────────┼───────────────────────────────┘  │
│                            │                                   │
│         ┌──────────────────┼──────────────────┐              │
│         ▼                  ▼                  ▼              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐        │
│  │    DAC     │   │    ADC     │   │    GPIO    │        │
│  │  (模拟输出) │   │  (模拟输入) │   │ (数字IO)   │        │
│  └──────┬─────┘   └──────┬─────┘   └──────┬─────┘        │
│         │                 │                │               │
│         └─────────────────┼────────────────┘               │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                      被测系统 (SUT)                       │  │
│  │                      ┌───────────────┐                  │  │
│  │                      │  嵌入式固件   │                  │  │
│  │                      │               │                  │  │
│  │                      │ 控制器        │                  │  │
│  │                      │ (Controller) │                  │  │
│  │                      └───────────────┘                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 HIL 测试用例

```python
# test_hil.py

class HILTest:
    """硬件在环测试"""

    def __init__(self, hil_system: HILSystem):
        self.hil = hil_system

    def test_motor_control_response_time(self):
        """测试电机控制响应时间"""
        # 配置电机模型
        self.hil.set_plant_model('motor', {
            'inertia': 0.01,
            'damping': 0.1,
            'voltage_range': (-24, 24),
        })

        # 配置传感器模型
        self.hil.set_sensor_model('encoder', {
            'resolution': 4096,  # 每转脉冲数
            'noise': 0.01,
        })

        # 注入测试信号 - 阶跃响应
        start_time = time.time()
        self.hil.inject_adc_voltage('motor_voltage', 12.0)  # 12V 阶跃

        # 等待转速达到稳态
        while True:
            rpm = self.hil.read_encoder_rpm('motor')
            if abs(rpm - 3000) < 50:  # 目标转速 3000 RPM
                break
            if time.time() - start_time > 5:
                pytest.fail("Motor did not reach target speed")

            time.sleep(0.001)

        response_time = time.time() - start_time

        # 验证响应时间
        assert response_time < 0.5, \
            f"Motor response time {response_time*1000:.1f}ms exceeds 500ms"

    def test_sensor_fusion_accuracy(self):
        """测试传感器融合精度"""
        # 配置多传感器
        self.hil.configure_sensors([
            {'type': 'accelerometer', 'noise': 0.01, 'bias': 0.05},
            {'type': 'gyroscope', 'noise': 0.02, 'bias': 0.1},
            {'type': 'magnetometer', 'noise': 0.05, 'bias': 0.2},
        ])

        # 注入已知运动
        self.hil.simulate_motion({
            'acceleration': (0, 0, 9.81),
            'rotation': (0, 0, 0.1),  # 0.1 rad/s
            'heading': 45,  # 45度
        })

        # 运行传感器融合算法
        self.hil.run_sensor_fusion(duration=1.0)

        # 获取融合结果
        fused_state = self.hil.get_fused_state()

        # 验证精度
        assert abs(fused_state['heading'] - 45) < 2.0, \
            f"Heading error {abs(fused_state['heading'] - 45):.2f}° exceeds 2°"

    def test_failsafe_trigger_conditions(self):
        """测试故障安全触发条件"""
        failsafe_tests = [
            {'condition': 'overcurrent', 'value': 5.5, 'expected_action': 'shutdown'},
            {'condition': 'overtemperature', 'value': 85.0, 'expected_action': 'reduce_power'},
            {'condition': 'overspeed', 'value': 6000, 'expected_action': 'limit_speed'},
            {'condition': 'undervoltage', 'value': 10.0, 'expected_action': 'shutdown'},
            {'condition': 'communication_loss', 'duration': 0.5, 'expected_action': 'safe_mode'},
        ]

        for test in failsafe_tests:
            with self.subtest(test['condition']):
                # 注入故障条件
                self.hil.inject_fault(test['condition'], test['value'])

                # 观察响应
                response = self.hil.wait_for_response(timeout=1.0)

                # 验证故障安全动作
                assert response['action'] == test['expected_action']
                assert response['executed'] == True

                # 恢复正常
                self.hil.clear_fault(test['condition'])
                self.hil.reset_system()

    def test_timing_constraints(self):
        """测试时序约束"""
        constraints = [
            {'event': 'sensor_read', 'max_latency': 0.001},      # 1ms
            {'event': 'control_loop', 'max_period': 0.01},       # 10ms
            {'event': 'fault_detection', 'max_latency': 0.005},   # 5ms
            {'event': 'actuator_update', 'max_latency': 0.002},  # 2ms
        ]

        for constraint in constraints:
            with self.subtest(constraint['event']):
                # 测量实际延迟
                latencies = []
                for _ in range(100):
                    start = time.time()
                    self.hil.trigger_event(constraint['event'])
                    elapsed = time.time() - start
                    latencies.append(elapsed)

                avg_latency = sum(latencies) / len(latencies)
                max_measured = max(latencies)

                if 'max_latency' in constraint:
                    assert max_measured < constraint['max_latency'], \
                        f"{constraint['event']}: max latency {max_measured*1000:.2f}ms > {constraint['max_latency']*1000:.2f}ms"
                else:
                    period_variance = max(latencies) - min(latencies)
                    assert period_variance < constraint['max_period'] * 0.1, \
                        f"{constraint['event']}: period variance too high"
```

---

## 8. 性能与压力测试

### 8.1 性能测试指标

```python
# test_performance.py

class PerformanceTest:
    """性能测试"""

    def test_boot_time(self, target):
        """测试启动时间"""
        measurements = []

        for _ in range(10):
            target.power_off()
            time.sleep(0.5)

            start = time.time()
            target.power_on()

            # 等待应用启动完成
            target.wait_for_app_ready(timeout=10.0)

            boot_time = time.time() - start
            measurements.append(boot_time)

        avg_boot_time = sum(measurements) / len(measurements)
        max_boot_time = max(measurements)
        min_boot_time = min(measurements)

        print(f"Boot time: avg={avg_boot_time*1000:.1f}ms, "
              f"min={min_boot_time*1000:.1f}ms, max={max_boot_time*1000:.1f}ms")

        # 验证启动时间符合要求
        assert avg_boot_time < 2.0, \
            f"Average boot time {avg_boot_time*1000:.1f}ms exceeds 2000ms"

    def test_ram_usage(self, target):
        """测试 RAM 使用情况"""
        target.reset()

        # 获取运行时内存使用
        mem_info = target.get_memory_info()

        print(f"RAM Usage:")
        print(f"  Total: {mem_info['total']} bytes")
        print(f"  Used: {mem_info['used']} bytes")
        print(f"  Free: {mem_info['free']} bytes")
        print(f"  Usage: {mem_info['used'] / mem_info['total'] * 100:.1f}%")

        # 验证 RAM 使用率
        assert mem_info['used'] / mem_info['total'] < 0.8, \
            "RAM usage exceeds 80%"

    def test_flash_wear(self, target):
        """测试 Flash 磨损"""
        # 读取 Flash 擦除计数
        wear_info = target.get_flash_wear_info()

        max_erase_count = max(wear_info['sector_counts'])

        print(f"Flash Wear:")
        print(f"  Max erase count: {max_erase_count}")
        print(f"  Average erase count: {sum(wear_info['sector_counts'])/len(wear_info['sector_counts']):.1f}")

        # 验证未超过预期寿命
        # 假设 Flash 额定 10000 次擦除
        assert max_erase_count < 10000, \
            f"Flash wear too high: {max_erase_count} erase cycles"

    def test_power_consumption(self, target, power_supply, dmm):
        """测试功耗"""
        measurements = {
            'idle': [],
            'active': [],
            'sleep': [],
        }

        # 空闲功耗
        target.set_mode('idle')
        time.sleep(1)
        for _ in range(100):
            current = dmm.read_current()
            measurements['idle'].append(current)
            time.sleep(0.01)

        # 活动功耗
        target.set_mode('active')
        target.start_workload()
        time.sleep(1)
        for _ in range(100):
            current = dmm.read_current()
            measurements['active'].append(current)
            time.sleep(0.01)

        # 睡眠功耗
        target.set_mode('sleep')
        time.sleep(1)
        for _ in range(100):
            current = dmm.read_current()
            measurements['sleep'].append(current)
            time.sleep(0.01)

        # 统计分析
        for mode, values in measurements.items():
            avg = sum(values) / len(values)
            max_val = max(values)
            print(f"{mode.capitalize()}: avg={avg*1000:.2f}mA, max={max_val*1000:.2f}mA")

        # 验证功耗符合规格
        assert sum(measurements['idle']) / len(measurements['idle']) < 0.050, \
            "Idle current exceeds 50mA"

    def test_realtime_performance(self, target):
        """测试实时性能"""
        # 测试中断延迟
        interrupt_latencies = []

        target.enable_interrupt_timing()
        for _ in range(1000):
            target.trigger_test_interrupt()
            latency = target.get_interrupt_latency()
            interrupt_latencies.append(latency)

        avg_latency = sum(interrupt_latencies) / len(interrupt_latencies)
        max_latency = max(interrupt_latencies)
        jitter = max_latency - min(interrupt_latencies)

        print(f"Interrupt Latency: avg={avg_latency*1000:.3f}ms, "
              f"max={max_latency*1000:.3f}ms, jitter={jitter*1000:.3f}ms")

        assert max_latency < 0.010, "Interrupt latency exceeds 10ms"
        assert jitter < 0.005, "Interrupt jitter exceeds 5ms"

    def test_stress_ram(self, target):
        """RAM 压力测试"""
        # 分配和释放大量内存
        for i in range(1000):
            addr = target.allocate_memory(1024)  # 1KB
            target.write_memory(addr, b'TEST' * 256)
            data = target.read_memory(addr, 1024)
            assert data == b'TEST' * 256
            target.free_memory(addr)

        # 验证无内存泄漏
        mem_before = target.get_memory_info()['used']
        time.sleep(1)
        mem_after = target.get_memory_info()['used']

        assert abs(mem_after - mem_before) < 100, \
            f"Memory leak detected: {mem_after - mem_before} bytes"
```

---

## 9. 测试自动化框架

### 9.1 框架架构

```python
# test_framework/
# ├── __init__.py
# ├── core/
# │   ├── __init__.py
# │   ├── test_runner.py
# │   ├── fixture_manager.py
# │   └── report_generator.py
# ├── targets/
# │   ├── __init__.py
# │   ├── target_base.py
# │   ├── stm32_target.py
# │   └── esp32_target.py
# ├── instruments/
# │   ├── __init__.py
# │   ├── power_supply.py
# │   ├── oscilloscope.py
# │   └── logic_analyzer.py
# └── utils/
#     ├── __init__.py
#     ├── flash_utils.py
#     └── serial_utils.py

# test_framework/core/test_runner.py
import pytest
import threading
import queue
from dataclasses import dataclass
from typing import List, Callable
import time

@dataclass
class TestResult:
    name: str
    status: str  # 'passed', 'failed', 'skipped', 'error'
    duration: float
    message: str = ""
    traceback: str = ""
    metadata: dict = None

class ParallelTestRunner:
    """并行测试运行器"""

    def __init__(self, max_workers: int = 4):
        self.max_workers = max_workers
        self.results: List[TestResult] = []
        self.queue = queue.Queue()
        self.lock = threading.Lock()

    def run_tests(self, tests: List[Callable], fixtures: dict):
        """并行运行测试"""
        threads = []

        for test_func in tests:
            t = threading.Thread(
                target=self._run_single_test,
                args=(test_func, fixtures)
            )
            threads.append(t)
            t.start()

        for t in threads:
            t.join()

        return self.results

    def _run_single_test(self, test_func, fixtures):
        """运行单个测试"""
        result = TestResult(
            name=test_func.__name__,
            status='error',
            duration=0,
            metadata={}
        )

        start_time = time.time()

        try:
            # 准备 fixtures
            test_fixtures = {}
            for name, fixture_func in fixtures.items():
                test_fixtures[name] = fixture_func()

            # 运行测试
            test_func(**test_fixtures)

            result.status = 'passed'
            result.message = "Test passed"

        except AssertionError as e:
            result.status = 'failed'
            result.message = str(e)
            result.traceback = traceback.format_exc()

        except Exception as e:
            result.status = 'error'
            result.message = str(e)
            result.traceback = traceback.format_exc()

        finally:
            result.duration = time.time() - start_time

            # 清理 fixtures
            for name, fixture in test_fixtures.items():
                if hasattr(fixture, 'cleanup'):
                    fixture.cleanup()

            with self.lock:
                self.results.append(result)

# test_framework/targets/target_base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class TargetInfo:
    name: str
    type: str
    flash_base: int
    flash_size: int
    ram_base: int
    ram_size: int
    jtag_id: str = None

class TargetBase(ABC):
    """目标设备基类"""

    def __init__(self, connection_params: dict):
        self.connection_params = connection_params
        self.info: TargetInfo = None
        self.connected = False

    @abstractmethod
    def connect(self) -> bool:
        """连接目标设备"""
        pass

    @abstractmethod
    def disconnect(self):
        """断开连接"""
        pass

    @abstractmethod
    def reset(self, mode: str = 'soft'):
        """复位目标"""
        pass

    @abstractmethod
    def flash_write(self, address: int, data: bytes) -> bool:
        """写入 Flash"""
        pass

    @abstractmethod
    def flash_read(self, address: int, size: int) -> bytes:
        """读取 Flash"""
        pass

    @abstractmethod
    def memory_write(self, address: int, data: bytes) -> bool:
        """写入内存"""
        pass

    @abstractmethod
    def memory_read(self, address: int, size: int) -> bytes:
        """读取内存"""
        pass

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()
```

### 9.2 pytest 配置

```python
# conftest.py
import pytest
import sys
from pathlib import Path

# 添加测试框架路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from test_framework import TargetManager, FixtureManager

@pytest.fixture(scope="session")
def target_manager():
    """目标管理器"""
    manager = TargetManager()
    yield manager
    manager.cleanup()

@pytest.fixture(scope="session")
def stm32_target(target_manager):
    """STM32 目标设备"""
    target = target_manager.get_target(
        'stm32f407',
        connection_params={'jlink': '/dev/jlink'}
    )
    target.connect()
    yield target
    target.disconnect()

@pytest.fixture(scope="function")
def fresh_target(stm32_target):
    """每个测试的干净目标状态"""
    stm32_target.reset('hard')
    stm32_target.erase_all()
    stm32_target.flash_firmware('production.bin')
    stm32_target.reset('soft')
    stm32_target.wait_for_app_ready(timeout=5.0)
    yield stm32_target
    stm32_target.reset('soft')

@pytest.fixture(scope="session")
def power_supply():
    """电源供应"""
    from test_framework.instruments import PowerSupply
    ps = PowerSupply('GPIB0::6::INSTR')
    ps.set_voltage(3.3)
    ps.set_current_limit(2.0)
    ps.enable()
    yield ps
    ps.disable()

@pytest.fixture(scope="session")
def oscilloscope():
    """示波器"""
    from test_framework.instruments import Oscilloscope
    scope = Oscilloscope('TCPIP0::192.168.1.100::inst0')
    yield scope
    scope.close()

# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short --strict-markers
markers =
    unit: Unit tests
    integration: Integration tests
    system: System tests
    security: Security tests
    performance: Performance tests
    slow: Slow running tests
filterwarnings =
    ignore::DeprecationWarning
log_cli = true
log_cli_level = INFO
log_format = %(asctime)s [%(levelname)8s] %(message)s
log_date_format = %Y-%m-%d %H:%M:%S
```

---

## 10. CI/CD 集成

### 10.1 GitHub Actions 工作流

```yaml
# .github/workflows/firmware-test.yml

name: Firmware Testing

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  # 构建配置
  TOOLCHAIN_VERSION: "10.3.1"
  ZEPHYR_VERSION: "3.4.0"

jobs:
  # ============ 单元测试 ============
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install pytest pytest-cov pytest-xdist
          pip install -r requirements.txt

      - name: Run unit tests
        run: |
          pytest tests/unit/ \
            --cov=src \
            --cov-report=xml \
            --cov-report=html \
            -v

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml

  # ============ 组件测试 ============
  component-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up ARM toolchain
        uses: awalsh128/cache-apt-pkgs-action@latest
        with:
          packages: gcc-arm-none-eabi

      - name: Build bootloader
        run: |
          west build -b stm32f407_disco zephyr/bootloader/mcuboot

      - name: Build application
        run: |
          west build -b stm32f407_disco \
            -- -DCONFIG_MCUBOOT_HAVE_LOGGING=y

      - name: Run component tests
        run: |
          pytest tests/component/ \
            --target=stm32f407 \
            --hardware=none  # 无硬件模式

  # ============ 集成测试 ============
  integration-tests:
    runs-on: self-hosted
    container:
      image: ghcr.io/zephyrproject-rtos/zephyr-build:latest
    steps:
      - uses: actions/checkout@v4

      - name: Flash devices
        run: |
          for device in /dev/ttyACM{0,1,2,3}; do
            pyocd flash --target stm32f407vg build/zephyr/zephyr.hex
          done

      - name: Run integration tests
        run: |
          pytest tests/integration/ \
            --targets=/dev/ttyACM0,/dev/ttyACM1 \
            --parallel=2 \
            -v

      - name: Upload test results
        uses: actions/upload-artifact@v4
        with:
          name: integration-test-results
          path: test-results/

  # ============ 安全测试 ============
  security-tests:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4

      - name: Run security tests
        run: |
          pytest tests/security/ \
            --target=stm32f407 \
            --hardware=true \
            -v --tb=short

      - name: Upload security report
        uses: actions/upload-artifact@v4
        with:
          name: security-test-report
          path: reports/security/

  # ============ 性能测试 ============
  performance-tests:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4

      - name: Run performance tests
        run: |
          pytest tests/performance/ \
            --target=stm32f407 \
            --iterations=100 \
            --report=perf-report.html

      - name: Upload performance report
        uses: actions/upload-artifact@v4
        with:
          name: performance-report
          path: perf-report.html

  # ============ 固件签名验证 ============
  firmware-signature:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Verify firmware signature
        run: |
          python scripts/verify_signature.py \
            --firmware build/zephyr/zephyr.signed.bin \
            --public-key keys/production.pub

  # ============ 发布前测试 ============
  pre-release-tests:
    needs: [unit-tests, component-tests, integration-tests]
    runs-on: self-hosted
    if: github.event_name == 'push' && startsWith(github.ref, 'refs/tags/')
    steps:
      - uses: actions/checkout@v4

      - name: Full regression test
        run: |
          pytest tests/ \
            --target=stm32f407 \
            --hardware=true \
            --all-markers \
            -v --tb=short

      - name: Generate release report
        run: |
          python scripts/generate_release_report.py \
            --output release-report.html

      - name: Upload release report
        uses: actions/upload-artifact@v4
        with:
          name: release-report
          path: release-report.html
```

### 10.2 本地测试脚本

```bash
#!/bin/bash
# run_tests.sh - 本地测试脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="${SCRIPT_DIR}/build"
REPORT_DIR="${SCRIPT_DIR}/test-reports"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 创建报告目录
mkdir -p "${REPORT_DIR}"

# 解析参数
TEST_TYPE="${1:-all}"
PARALLEL="${2:-1}"

log_info "Running ${TEST_TYPE} tests with ${PARALLEL} parallel workers"

# 运行单元测试
run_unit_tests() {
    log_info "Running unit tests..."
    pytest tests/unit/ \
        --cov=src \
        --cov-report=html:"${REPORT_DIR}/coverage" \
        --cov-report=term \
        --html="${REPORT_DIR}/unit-report.html" \
        --self-contained-html \
        -v

    log_info "Unit tests completed"
}

# 运行集成测试
run_integration_tests() {
    log_info "Running integration tests..."

    # 检查硬件连接
    if [ ! -e /dev/ttyACM0 ]; then
        log_warn "Hardware not connected, skipping integration tests"
        return 0
    fi

    pytest tests/integration/ \
        --target=/dev/ttyACM0 \
        --html="${REPORT_DIR}/integration-report.html" \
        --self-contained-html \
        -v

    log_info "Integration tests completed"
}

# 运行所有测试
run_all_tests() {
    run_unit_tests
    run_integration_tests
}

# 主函数
case "${TEST_TYPE}" in
    unit)
        run_unit_tests
        ;;
    integration)
        run_integration_tests
        ;;
    all)
        run_all_tests
        ;;
    *)
        log_error "Unknown test type: ${TEST_TYPE}"
        echo "Usage: $0 [unit|integration|all] [parallel]"
        exit 1
        ;;
esac

# 生成汇总报告
log_info "Generating summary report..."
python scripts/generate_summary.py \
    --input "${REPORT_DIR}" \
    --output "${REPORT_DIR}/summary.html"

log_info "Test reports available in: ${REPORT_DIR}"
```

---

## 11. 测试度量与报告

### 11.1 测试度量指标

```python
# metrics/test_metrics.py

from dataclasses import dataclass, field
from typing import List, Dict
from datetime import datetime
import json

@dataclass
class TestMetrics:
    """测试度量"""

    # 执行统计
    total_tests: int = 0
    passed: int = 0
    failed: int = 0
    skipped: int = 0
    errors: int = 0

    # 时间统计
    total_duration: float = 0.0
    avg_duration: float = 0.0
    min_duration: float = 0.0
    max_duration: float = 0.0

    # 覆盖率统计
    line_coverage: float = 0.0
    branch_coverage: float = 0.0
    function_coverage: float = 0.0
    condition_coverage: float = 0.0

    # 缺陷统计
    defects_found: int = 0
    defects_fixed: int = 0
    defects_open: int = 0
    defect_density: float = 0.0  # 每 KLOC 缺陷数

    # 测试用例详情
    test_cases: List[Dict] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            'execution': {
                'total': self.total_tests,
                'passed': self.passed,
                'failed': self.failed,
                'skipped': self.skipped,
                'errors': self.errors,
                'pass_rate': f"{self.passed / self.total_tests * 100:.1f}%" if self.total_tests > 0 else "N/A",
            },
            'timing': {
                'total': f"{self.total_duration:.2f}s",
                'average': f"{self.avg_duration:.3f}s",
                'min': f"{self.min_duration:.3f}s",
                'max': f"{self.max_duration:.3f}s",
            },
            'coverage': {
                'line': f"{self.line_coverage:.1f}%",
                'branch': f"{self.branch_coverage:.1f}%",
                'function': f"{self.function_coverage:.1f}%",
                'condition': f"{self.condition_coverage:.1f}%",
            },
            'defects': {
                'found': self.defects_found,
                'fixed': self.defects_fixed,
                'open': self.defects_open,
                'density': f"{self.defect_density:.2f}/KLOC",
            },
            'generated_at': datetime.now().isoformat(),
        }

    def to_json(self, path: str):
        with open(path, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)

    def generate_report_html(self, path: str):
        """生成 HTML 报告"""
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - {datetime.now().strftime('%Y-%m-%d')}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ background: #2c3e50; color: white; padding: 20px; }}
        .metrics {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }}
        .metric-card {{ background: #ecf0f1; padding: 20px; border-radius: 8px; }}
        .metric-value {{ font-size: 2em; font-weight: bold; color: #2c3e50; }}
        .metric-label {{ color: #7f8c8d; }}
        .passed {{ color: #27ae60; }}
        .failed {{ color: #e74c3c; }}
        .skipped {{ color: #f39c12; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        th, td {{ padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }}
        th {{ background: #34495e; color: white; }}
        .status-passed {{ background: #d4edda; }}
        .status-failed {{ background: #f8d7da; }}
        .status-skipped {{ background: #fff3cd; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Embedded Firmware Test Report</h1>
        <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>

    <div class="metrics">
        <div class="metric-card">
            <div class="metric-value">{self.total_tests}</div>
            <div class="metric-label">Total Tests</div>
        </div>
        <div class="metric-card">
            <div class="metric-value passed">{self.passed}</div>
            <div class="metric-label">Passed</div>
        </div>
        <div class="metric-card">
            <div class="metric-value failed">{self.failed}</div>
            <div class="metric-label">Failed</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{self.line_coverage:.1f}%</div>
            <div class="metric-label">Coverage</div>
        </div>
    </div>

    <h2>Test Cases</h2>
    <table>
        <tr>
            <th>Test Name</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Category</th>
        </tr>
"""

        for tc in self.test_cases:
            status_class = f"status-{tc['status']}"
            html += f"""
        <tr class="{status_class}">
            <td>{tc['name']}</td>
            <td>{tc['status']}</td>
            <td>{tc['duration']:.3f}s</td>
            <td>{tc.get('category', 'N/A')}</td>
        </tr>
"""

        html += """
    </table>
</body>
</html>
"""

        with open(path, 'w') as f:
            f.write(html)
```

### 11.2 趋势报告

```python
# metrics/trend_analysis.py

class TrendAnalyzer:
    """趋势分析"""

    def __init__(self, history_file: str):
        self.history_file = history_file
        self.history = self._load_history()

    def add_snapshot(self, metrics: TestMetrics):
        """添加新的测试快照"""
        snapshot = {
            'timestamp': datetime.now().isoformat(),
            'metrics': metrics.to_dict(),
        }
        self.history.append(snapshot)
        self._save_history()

    def get_pass_rate_trend(self, days: int = 30) -> List[dict]:
        """获取通过率趋势"""
        cutoff = datetime.now() - timedelta(days=days)
        snapshots = [
            s for s in self.history
            if datetime.fromisoformat(s['timestamp']) > cutoff
        ]

        return [
            {
                'date': s['timestamp'][:10],
                'pass_rate': float(s['metrics']['execution']['pass_rate'].rstrip('%'))
            }
            for s in snapshots
        ]

    def get_coverage_trend(self, days: int = 30) -> List[dict]:
        """获取覆盖率趋势"""
        cutoff = datetime.now() - timedelta(days=days)
        snapshots = [
            s for s in self.history
            if datetime.fromisoformat(s['timestamp']) > cutoff
        ]

        return [
            {
                'date': s['timestamp'][:10],
                'line_coverage': float(s['metrics']['coverage']['line'].rstrip('%')),
                'branch_coverage': float(s['metrics']['coverage']['branch'].rstrip('%')),
            }
            for s in snapshots
        ]

    def predict_quality_score(self) -> float:
        """预测质量分数 (0-100)"""
        if not self.history:
            return 0.0

        latest = self.history[-1]['metrics']

        # 加权计算
        pass_rate = float(latest['execution']['pass_rate'].rstrip('%')) * 0.4
        line_cov = float(latest['coverage']['line'].rstrip('%')) * 0.3
        branch_cov = float(latest['coverage']['branch'].rstrip('%')) * 0.2
        defect_factor = max(0, 100 - latest['defects']['open'] * 5) * 0.1

        return pass_rate + line_cov + branch_cov + defect_factor
```

---

## 总结

嵌入式固件测试工程需要系统性方法论：

| 层级 | 关键点 | 自动化目标 |
| --- | --- | --- |
| **单元测试** | 算法逻辑、边界条件 | 100% |
| **组件测试** | 接口协议、状态机 | 95% |
| **集成测试** | 模块协作、硬件交互 | 90% |
| **系统测试** | 端到端功能、用户体验 | 80% |
| **安全测试** | 攻击向量、漏洞发现 | 70% |
| **压力测试** | 极限条件、长期稳定性 | 100% |

**最佳实践**：

1. **测试左移**：尽早发现问题，减少修复成本
2. **持续集成**：每次提交都运行测试
3. **硬件抽象**：测试代码与硬件解耦
4. **度量驱动**：用数据指导测试改进
5. **安全优先**：安全测试贯穿始终

> **核心原则**：测试不是事后验证，而是设计的一部分。从架构设计阶段就考虑可测试性。

---

## 参考资源

- [MCUboot 测试指南](https://docs.mcuboot.com/testplan.html)
- [Zephyr 测试文档](https://docs.zephyrproject.org/latest/test/index.html)
- [Google Test](https://github.com/google/googletest)
- [Unity Test Framework](https://github.com/ThrowTheSwitch/Unity)
- [pytest-embedded](https://docs.pytest.org/)
