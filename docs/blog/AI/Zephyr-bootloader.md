---
title: Zephyr MCUboot 引导加载器详解
tags:
  - 嵌入式
  - Zephyr
  - bootloader
  - MCUboot
createTime: 2026/08/23 01:58:58
permalink: /blog/zephyr-mcuboot/
---

> MCUboot 是 Zephyr RTOS 官方推荐的安全引导加载器，支持镜像签名验证、回滚保护、双镜像插槽等特性，是嵌入式设备 OTA 升级的基础设施。

## 什么是 MCUboot？

MCUboot 是一个专为微控制器设计的 **安全引导加载器**，主要特性包括：

| 特性 | 说明 |
| --- | --- |
| **镜像签名验证** | 支持 RSA、ECDSA、Ed25519 等算法 |
| **双镜像插槽** | 主插槽 + 备份插槽，支持无缝升级 |
| **回滚保护** | 防止降级到有漏洞的旧版本 |
| **镜像加密** | 支持 AES-128/256 加密 |
| **最小化 flash** | 专为资源受限设备优化 |

## Zephyr 中的 MCUboot

### 架构概览

```
┌─────────────────────────────────────┐
│           Flash Memory              │
├─────────────────────────────────────┤
│  0x00000 - 0x08000  │   MCUboot   │  ← Bootloader (48KB)
├─────────────────────────────────────┤
│  0x08000 - 0x40000  │ Primary     │  ← 运行插槽
│                      │ Slot       │
├─────────────────────────────────────┤
│  0x40000 - 0x78000  │ Secondary   │  ← 升级插槽
│                      │ Slot       │     (OTA 写入)
├─────────────────────────────────────┤
│  0x78000 - 0x80000  │ Scratch     │  ← 交换暂存区
└─────────────────────────────────────┘
```

### 编译 MCUboot

```bash
# 使用 Zephyr West 工具编译
west build -b <board_name> zephyr/bootloader/mcuboot/bootstore/zephyr

# 或者使用 Kconfig 启用 MCUboot
# 在 prj.conf 中添加：
CONFIG_BOOTLOADER_MCUBOOT=y
```

### 关键配置选项

```kconfig
# prj.conf - MCUboot 配置

# 启用 MCUboot
CONFIG_BOOTLOADER_MCUBOOT=y

# Flash 布局
CONFIG_FLASH_SIZE=512
CONFIG_FLASH_BASE_ADDRESS=0x0
CONFIG_MCUBOOT_PRIMARY_1_OFFSET=0x10000
CONFIG_MCUBOOT_PRIMARY_1_SIZE=0x40000
CONFIG_MCUBOOT_SECONDARY_1_OFFSET=0x50000
CONFIG_MCUBOOT_SECONDARY_1_SIZE=0x40000

# 安全特性
CONFIG_MCUBOOT_SIGNATURE_TYPE_RSA=y
CONFIG_MCUBOOT_SIGNATURE_KEY_FILE="root-rsa-2048.pem"

# 加密支持（可选）
CONFIG_MCUBOOT_ENCRYPTION_TYPE_AES256=y
CONFIG_MCUBOOT_ENCRYPTION_KEY_FILE="enc-key.bin"

# 镜像版本
CONFIG_MCUBOOT_IMAGE_VERSION="1.0.0"

# 回滚保护
CONFIG_MCUBOOT_DOWNGRADE_PREVENTION=y
CONFIG_MCUBOOT_MINIMUM_REQUIRED_VERSION="1.0.0"
```

## 签名与验签

### 生成签名密钥

```bash
# RSA-2048 密钥
imgtool keygen -t rsa-2048 -k root-rsa-2048.pem

# RSA-3072 密钥（更安全）
imgtool keygen -t rsa-3072 -k root-rsa-3072.pem

# ECDSA P-256
imgtool keygen -t ecdsa-p256 -k ecdsa-p256.pem

# Ed25519（推荐）
imgtool keygen -t ed25519 -k ed25519.pem
```

### 签名固件镜像

```bash
# 使用 imgtool 签名
imgtool sign \
    --key root-rsa-2048.pem \
    --header-size 0x200 \
    --align 8 \
    --version 1.0.0 \
    --output zephyr-app.signed.bin \
    zephyr-app.bin

# 带加密签名
imgtool sign \
    --key root-rsa-2048.pem \
    --encrypt enc-key.bin \
    --header-size 0x200 \
    --align 8 \
    --version 1.0.0 \
    --output zephyr-app.encrypted.signed.bin \
    zephyr-app.bin
```

### 签名验证流程

```
MCUboot 启动流程:

1. 检查 Primary Slot 镜像
   │
   ├── 读取镜像头部
   │   ├── magic number
   │   ├── 版本号
   │   ├── 载荷大小
   │   └── 签名信息
   │
   ├── 验证签名
   │   └── 使用公钥验证镜像完整性
   │
   ├── 版本检查
   │   └── 确保不低于最低版本要求
   │
   └── 跳转到镜像
       └── 设置 SP 和 PC，跳转到应用
```

## 双槽位升级机制

### 镜像插槽布局

| 插槽 | 地址 | 用途 |
| --- | --- | --- |
| Primary Slot | 0x10000 | 运行中的固件 |
| Secondary Slot | 0x50000 | OTA 下载的新固件 |
| Scratch | 0x90000 | 镜像交换时的临时区 |

### 升级流程

```
状态 1: 正常运行
┌─────────────┬─────────────┬─────────┐
│ MCUboot     │ Primary     │Secondary│
│ 0x0-0x10000│ 0x10000     │0x50000  │
│             │ (v1.0.0)    │(空)     │
└─────────────┴─────────────┴─────────┘

状态 2: OTA 下载完成
┌─────────────┬─────────────┬─────────┐
│ MCUboot     │ Primary     │Secondary│
│             │ (v1.0.0)    │(v1.1.0)│ ← 新固件
└─────────────┴─────────────┴─────────┘

状态 3: 交换中 (Scratch 辅助)
┌─────────────┬─────────────┬─────────┬────────┐
│ MCUboot     │ Primary     │Secondary│Scratch │
└─────────────┴─────────────┴─────────┴────────┘
     │           │             │          │
     ▼           ▼             ▼          ▼
   读取       交换           交换      备份

状态 4: 升级完成
┌─────────────┬─────────────┬─────────┐
│ MCUboot     │ Primary     │Secondary│
│             │ (v1.1.0) ✓ │(v1.0.0) │ ← 回滚备用
└─────────────┴─────────────┴─────────┘
```

### 交换算法

MCUboot 支持多种交换模式：

```kconfig
# 交换模式配置
CONFIG_MCUBOOT_SWAP_USING_SCRATCH=y
# 或者
CONFIG_MCUBOOT_SWAP_USING_MOVE=y
# 或者 (无交换，测试用)
CONFIG_MCUBOOT_OVERWRITE_ONLY=y
```

| 模式 | 特点 | Scratch 大小 | 适用场景 |
| --- | --- | --- | --- |
| Swap using Scratch | 完整交换，失败可回滚 | = 1 slot | 生产环境 |
| Swap using Move | 直接移动，节省空间 | 无 | 空间受限 |
| Overwrite only | 只读 primary | 无 | 简单场景 |

## 安全特性

### 镜像签名验证

```c
// MCUboot 签名验证示意
int boot_verify_signature(const struct image_header *hdr,
                         const void *image_ptr,
                         size_t image_size)
{
    // 1. 提取公钥
    const uint8_t *pubkey = get_public_key(hdr->ih_key_id);

    // 2. 获取镜像数据
    const void *hash = compute_sha256(image_ptr, image_size);

    // 3. 验证签名
    return verify_signature(hash, pubkey, &hdr->signature);
}
```

### 回滚保护

```kconfig
# 启用回滚保护
CONFIG_MCUBOOT_DOWNGRADE_PREVENTION=y

# 设置允许的最低版本
CONFIG_MCUBOOT_MINIMUM_REQUIRED_VERSION="1.0.0"
```

### Flash 写保护

```dts
/* board.dts - Flash 保护配置 */
&flash0 {
    partitions {
        bootlader: partition@0 {
            reg = <0x0 0x10000>;
            read-only;
        };
        primary: partition@10000 {
            reg = <0x10000 0x40000>;
        };
    };
};
```

## 与 TF-M 集成

MCUboot 可以与 ARM Trusted Firmware-M (TF-M) 集成，实现安全启动：

```kconfig
# TF-M + MCUboot 配置
CONFIG_TRUSTED_EXECUTABLE_LOADER=y
CONFIG_TFM_BL2=y

# TF-M 镜像签名
TF_M_KEYS=../../keys/tf-m_root_of_trust.pem
```

## 常见问题与调试

### 调试日志

```kconfig
# 启用 MCUboot 调试输出
CONFIG_MCUBOOT_HW_DEBUG=y
CONFIG_MCUBOOT_SERIAL=y

# 串口配置
CONFIG_MCUBOOT_SERIAL_UART_DEV="UART_0"
CONFIG_MCUBOOT_SERIAL_UART_BAUDRATE=115200
```

### 常见错误

| 错误码 | 含义 | 解决方案 |
| --- | --- | --- |
| 0x01 | 无有效镜像 | 检查签名或加密配置 |
| 0x02 | 签名验证失败 | 确认公钥匹配 |
| 0x03 | 版本太低 | 禁用回滚或升级最低版本 |
| 0x04 | Flash 错误 | 检查 flash 驱动 |
| 0x05 | 交换失败 | 增加 scratch 大小 |

### 调试命令

```bash
# 使用 mcumgr 管理设备
mcumgr conn add serial type=serial,baudrate=115200,dev=/dev/ttyUSB0
mcumgr -c serial image list
mcumgr -c serial image upload firmware.bin
mcumgr -c serial image test <hash>
mcumgr -c serial reset
```

## 总结

MCUboot 是 Zephyr 生态中不可或缺的组件，提供了：

- ✅ **安全启动**：签名验证 + 加密支持
- ✅ **可靠升级**：双槽位 + 交换机制 + 回滚保护
- ✅ **资源高效**：专为 MCU 优化
- ✅ **生态完善**：与 TF-M、Zephyr OTA 深度集成

> **推荐配置**：生产环境使用 RSA-2048/3072 签名 + Swap using Scratch 模式，确保升级可靠性和安全性。

---

## 参考资源

- [MCUboot 官方文档](https://docs.mcuboot.com/)
- [Zephyr MCUboot 文档](https://docs.zephyrproject.org/latest/services/bootloader/mcuboot.html)
- [MCUboot imgtool](https://pypi.org/project/imgtool/)
