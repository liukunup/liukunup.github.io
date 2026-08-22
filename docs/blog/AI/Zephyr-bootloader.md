---
title: Zephyr MCUboot 深度解析：架构、配置与实战
tags:
  - 嵌入式
  - Zephyr
  - bootloader
  - MCUboot
  - OTA
createTime: 2026/08/23 02:00:57
permalink: /blog/zephyr-mcuboot/
---

> MCUboot 是 Zephyr RTOS 生态中最重要的高安全引导加载器，支持签名验证、加密、镜像交换、回滚保护等企业级功能。本文深入解析其内部原理、配置选项和实战技巧。

## 目录

1. [架构概述](#1-架构概述)
2. [Flash 布局详解](#2-flash-布局详解)
3. [镜像格式与头部](#3-镜像格式与头部)
4. [签名与验签机制](#4-签名与验签机制)
5. [交换模式详解](#5-交换模式详解)
6. [加密支持](#6-加密支持)
7. [回滚保护](#7-回滚保护)
8. [配置选项汇总](#8-配置选项汇总)
9. [实战配置示例](#9-实战配置示例)
10. [调试与故障排除](#10-调试与故障排除)

---

## 1. 架构概述

### 1.1 系统启动流程

```
┌──────────────────────────────────────────────────────────────────┐
│                         系统启动流程                              │
└──────────────────────────────────────────────────────────────────┘

上电/复位
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  MCUboot Bootloader                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Image       │  │ Swap       │  │ Crypto     │            │
│  │ Validation  │─▶│ Manager    │─▶│ Engine     │            │
│  │ (验证)      │  │ (交换管理)  │  │ (加解密)   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Application (应用程序)                                          │
│  - Zephyr RTOS 或裸机程序                                       │
│  - 使用 MCUboot 提供的 API 进行 OTA 升级                         │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 MCUboot 组件架构

```
┌─────────────────────────────────────────────────────────────┐
│                    MCUboot 内部架构                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────┐    ┌───────────────┐                   │
│  │  Boot Utility │    │  Image Tool  │                    │
│  │  (引导工具)    │    │  (镜像工具)  │                    │
│  └───────┬───────┘    └───────┬───────┘                   │
│          │                    │                             │
│          ▼                    ▼                             │
│  ┌─────────────────────────────────────────┐              │
│  │           Bootloader Core                │              │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ │              │
│  │  │ Image   │ │  Swap   │ │ Crypto  │ │              │
│  │  │ Manager │ │ Manager │ │ Engine  │ │              │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ │              │
│  │       │            │            │      │              │
│  │       └────────────┼────────────┘      │              │
│  │                    ▼                   │              │
│  │           ┌───────────────┐            │              │
│  │           │ Flash Layout │            │              │
│  │           │ Manager      │            │              │
│  │           └───────┬─────┘            │              │
│  └───────────────────┼─────────────────┘              │
│                      ▼                                   │
│  ┌─────────────────────────────────────────┐              │
│  │         HAL / SoC Drivers               │              │
│  │  - Flash Read/Write/Erase              │              │
│  │  - Crypto HW Acceleration              │              │
│  │  - Watchdog                           │              │
│  └─────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 MCUboot 与 Zephyr 的关系

```
┌─────────────────────────────────────────────────────────────┐
│                    Zephyr Project                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Zephyr RTOS / Application               │  │
│  └──────────────────────────┬──────────────────────────┘  │
│                             │                              │
│                             ▼                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │            MCUboot (Bootloader)                     │  │
│  │  - img_mgmt: OTA 镜像管理 (MCUmgr)                │  │
│  │  - bootutil: 引导核心                              │  │
│  │  - bootutil_public: 公共 API                       │  │
│  └──────────────────────────┬──────────────────────────┘  │
│                             │                              │
│                             ▼                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              SoC / Board HAL                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Flash 布局详解

### 2.1 默认布局

```
┌─────────────────────────────────────────────────────────────────┐
│                    STM32F4 Flash 布局 (512KB)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  0x08000000 ┌───────────────────┐                              │
│             │    MCUboot       │  48KB                        │
│             │   Bootloader     │                               │
│             │                   │                               │
│  0x0800C000 ├───────────────────┤  ← Bootloader 结束         │
│             │                   │                              │
│             │  Primary Slot    │  200KB                       │
│             │  (运行固件)      │  存放当前运行的固件          │
│             │                   │                              │
│  0x0803E000 ├───────────────────┤  ← Primary 结束            │
│             │                   │                              │
│             │  Secondary Slot  │  200KB                       │
│             │  (升级固件)      │  OTA 下载的新固件存放位置     │
│             │                   │                              │
│  0x08070000 ├───────────────────┤  ← Secondary 结束          │
│             │                   │                              │
│             │     Scratch       │  48KB                        │
│             │  (交换暂存区)     │  镜像交换时使用             │
│             │                   │                              │
│  0x08080000 └───────────────────┘  ← Flash 结束              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Zephyr 中的 Flash 分区定义

```dts
/* board.dts - STM32F4 分区配置 */
&flash0 {
    #address-cells = <1>;
    #size-cells = <1>;

    partitions {
        compatible = "fixed-partitions";
        #address-cells = <1>;
        #size-cells = <1>;

        /* MCUboot Bootloader */
        boot_partition: partition@0 {
            label = "mcuboot";
            reg = <0x00000000 0x0000C000>;  /* 48KB */
            read-only;
        };

        /* Primary Slot - 运行固件 */
        slot0_partition: partition@c000 {
            label = "image-0";
            reg = <0x0000C000 0x00032000>;  /* 200KB */
        };

        /* Secondary Slot - 升级固件 */
        slot1_partition: partition@3e000 {
            label = "image-1";
            reg = <0x0003E000 0x00032000>;  /* 200KB */
        };

        /* Scratch - 交换暂存 */
        scratch_partition: partition@70000 {
            label = "scratch";
            reg = <0x00070000 0x0000C000>;  /* 48KB */
        };
    };
};
```

### 2.3 多镜像布局 (Multi-Image)

对于多核处理器或复杂系统：

```
┌─────────────────────────────────────────────────────────────────┐
│                    多镜像布局 (Dual-Image)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Bootloader     ┌───────────────────┐  48KB                     │
│                 │    MCUboot       │                           │
│                 └───────────────────┘                          │
│                                                                 │
│  Image 0 (APP) ┌───────────────────┐  256KB                    │
│  (主应用)       │ Primary Slot 0    │                           │
│                 ├───────────────────┤                           │
│                 │ Secondary Slot 0  │  256KB                    │
│                 └───────────────────┘                           │
│                                                                 │
│  Image 1 (RT)  ┌───────────────────┐  128KB                    │
│  (无线固件)     │ Primary Slot 1    │                           │
│                 ├───────────────────┤                           │
│                 │ Secondary Slot 1  │  128KB                   │
│                 └───────────────────┘                           │
│                                                                 │
│  Scratch       ┌───────────────────┐  64KB                      │
│                 │     Scratch       │                           │
│                 └───────────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

```dts
/* 多镜像配置 */
&flash0 {
    partitions {
        boot_partition: partition@0 {
            reg = <0x00000000 0x0000C000>;
            read-only;
        };

        /* Image 0 - 主应用 */
        slot0_partition: partition@c000 {
            reg = <0x0000C000 0x00040000>;
        };
        slot1_partition: partition@4c000 {
            reg = <0x0004C000 0x00040000>;
        };

        /* Image 1 - 无线/通信固件 */
        slot2_partition: partition@8c000 {
            reg = <0x0008C000 0x00020000>;
        };
        slot3_partition: partition@ac000 {
            reg = <0x000AC000 0x00020000>;
        };

        scratch_partition: partition@cc000 {
            reg = <0x000CC000 0x00004000>;
        };
    };
};
```

---

## 3. 镜像格式与头部

### 3.1 镜像头部结构

```
┌─────────────────────────────────────────────────────────────────┐
│                        镜像文件格式                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Image Header (固定 32 字节)                  │  │
│  │  ┌───────────────┬─────────────────────────────────┐   │  │
│  │  │ magic         │ 4B: 0x96 (IMAGE_MAGIC)          │   │  │
│  │  ├───────────────┼─────────────────────────────────┤   │  │
│  │  │ load_addr     │ 4B: 加载地址 (0 = 无固定地址)   │   │  │
│  │  ├───────────────┼─────────────────────────────────┤   │  │
│  │  │ hdr_size      │ 4B: 头部大小 (通常 32/512)     │   │  │
│  │  ├───────────────┼─────────────────────────────────┤   │  │
│  │  │ protected_tlv │ 4B: 受保护 TLV 区域大小        │   │  │
│  │  ├───────────────┼─────────────────────────────────┤   │  │
│  │  │ img_size      │ 4B: 镜像大小 (不含头部)         │   │  │
│  │  ├───────────────┼─────────────────────────────────┤   │  │
│  │  │ flags        │ 4B: 标志位                      │   │  │
│  │  │               │   - 0x01: ENCRYPTED             │   │  │
│  │  │               │   - 0x02: RAM_LOAD              │   │  │
│  │  │               │   - 0x04: ROM_DISABLE           │   │  │
│  │  ├───────────────┼─────────────────────────────────┤   │  │
│  │  │ ver          │ 4B: 版本号结构体                │   │  │
│  │  │               │   - major (8b)                  │   │  │
│  │  │               │   - minor (8b)                  │   │  │
│  │  │               │   - revision (8b)                │   │  │
│  │  │               │   - build (8b)                   │   │  │
│  │  └───────────────┴─────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Protected TLV (Type-Length-Value)          │  │
│  │  存储安全相关数据 (如公钥哈希)                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Image Payload (固件本体)                   │  │
│  │  实际的可执行代码和数据                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Image TLV (签名/哈希)                     │  │
│  │  ┌─────────────┬─────────────┬────────────────────┐  │  │
│  │  │ type (1B)  │ len (2B)   │ value (变长)       │  │  │
│  │  │             │            │                    │  │  │
│  │  │ 0x10 SHA256 │ 32        │ 哈希值            │  │  │
│  │  │ 0x21 RSA2048│ 256       │ RSA 签名          │  │  │
│  │  │ 0x22 ECDSA  │ 72        │ ECDSA 签名       │  │  │
│  │  └─────────────┴─────────────┴────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 版本号格式

```c
/* 版本号结构 */
struct image_version {
    uint8_t iv_major;    // 主版本号 (不兼容的 API 变更)
    uint8_t iv_minor;    // 次版本号 (向后兼容的功能添加)
    uint16_t iv_revision; // 修订号 (向后兼容的 Bug 修复)
    uint32_t iv_build_num; // 构建号 (每次构建递增)
};

// 示例
#define VERSION_1_0_0  {1, 0, 0, 0}
#define VERSION_1_2_3  {1, 2, 3, 456}
```

### 3.3 TLV (Type-Length-Value) 格式

```c
/* TLV 类型定义 */
#define IMAGE_TLV_SHA256      0x10   // SHA256 哈希
#define IMAGE_TLV_RSA2048     0x21   // RSA-2048 签名
#define IMAGE_TLV_RSA3072     0x22   // RSA-3072 签名
#define IMAGE_TLV_ECDSA256    0x23   // ECDSA-P256 签名
#define IMAGE_TLV_ED25519     0x24   // Ed25519 签名
#define IMAGE_TLV_BOOTUTIL    0x01   // Boot utility marker

/* TLV 结构 */
struct image_tlv {
    uint8_t  it_type;    // 类型
    uint16_t it_len;     // 长度 (不含头部)
    // followed by it_len bytes of value
} __attribute__((packed));
```

---

## 4. 签名与验签机制

### 4.1 签名流程

```
┌─────────────────────────────────────────────────────────────────┐
│                     固件签名流程                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 准备阶段                                                    │
│     ┌─────────────────────────────────────────┐                │
│     │  原始固件                              │                │
│     │  (bin 文件)                            │                │
│     └──────────────────┬────────────────────┘                │
│                        │                                       │
│                        ▼                                       │
│  2. 添加头部 (imgtool sign)                                   │
│     ┌─────────────────────────────────────────┐                │
│     │  ┌────────────────┐                    │                │
│     │  │ Image Header   │                    │                │
│     │  │ magic=0x96     │                    │                │
│     │  │ version=1.2.3  │                    │                │
│     │  │ size=xxx       │                    │                │
│     │  └────────────────┘                    │                │
│     │  ┌────────────────┐                    │                │
│     │  │ Protected TLV  │ ← 公钥哈希         │                │
│     │  └────────────────┘                    │                │
│     │  ┌────────────────┐                    │                │
│     │  │ Image Payload  │                    │                │
│     │  │ (原始固件)      │                    │                │
│     │  └────────────────┘                    │                │
│     └──────────────────┬────────────────────┘                │
│                        │                                       │
│                        ▼                                       │
│  3. 计算哈希                                                    │
│     ┌─────────────────────────────────────────┐                │
│     │  Hash = SHA256(Header + Protected TLV +  │                │
│     │                Payload)                  │                │
│     └──────────────────┬────────────────────┘                │
│                        │                                       │
│                        ▼                                       │
│  4. 签名                                                        │
│     ┌─────────────────────────────────────────┐                │
│     │  Signature = RSA/ECDSA_Sign(Hash,       │                │
│     │                      PrivateKey)        │                │
│     └──────────────────┬────────────────────┘                │
│                        │                                       │
│                        ▼                                       │
│  5. 添加签名 TLV                                               │
│     ┌─────────────────────────────────────────┐                │
│     │  ┌────────────────┐ ┌────────────────┐ │                │
│     │  │ Signature TLV  │ │ Hash TLV       │ │                │
│     │  │ type=0x21     │ │ type=0x10     │ │                │
│     │  │ len=256       │ │ len=32       │ │                │
│     │  │ [签名数据]    │ │ [哈希值]     │ │                │
│     │  └────────────────┘ └────────────────┘ │                │
│     └────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 验签流程

```c
/* MCUboot 验签伪代码 */
int boot_verify_image(struct image_header *hdr, uint8_t *image_ptr)
{
    /* 1. 验证头部 magic */
    if (hdr->ih_magic != IMAGE_MAGIC) {
        return BOOT_EBADIMAGE;
    }

    /* 2. 获取受保护的 TLV 区域 (公钥哈希) */
    struct image_tlv *tlv;
    tlv = (struct image_tlv *)(image_ptr + hdr->ih_hdr_size +
                                hdr->ih_protect_tlv_size);
    uint16_t tlv_end = hdr->ih_hdr_size + hdr->ih_protect_tlv_size;

    /* 3. 计算镜像哈希 */
    uint8_t hash[32];
    bootutil_hash(image_ptr + hdr->ih_hdr_size,
                  hdr->ih_img_size + tlv_end - hdr->ih_hdr_size,
                  hash);

    /* 4. 查找匹配的公钥 */
    const struct bootutil_key *pub_key = NULL;
    while (tlv->it_type != 0xFF) {
        if (tlv->it_type == IMAGE_TLV_KEYHASH) {
            /* 查找公钥 */
            pub_key = find_key_by_hash(tlv->it_value);
            break;
        }
        tlv = (struct image_tlv *)((uint8_t *)tlv +
                sizeof(*tlv) + tlv->it_len);
    }

    /* 5. 验证签名 */
    uint8_t *sig = NULL;
    uint16_t sig_len = 0;
    while (tlv < image_end) {
        if (tlv->it_type == IMAGE_TLV_SIGNATURE) {
            sig = tlv->it_value;
            sig_len = tlv->it_len;
            break;
        }
        tlv = (struct image_tlv *)((uint8_t *)tlv +
                sizeof(*tlv) + tlv->it_len);
    }

    /* 6. 密码学验证 */
    if (pub_key && sig) {
        if (!bootutil_verify(hash, sig, sig_len, pub_key)) {
            return BOOT_EBADIMAGE;  // 验签失败
        }
    }

    return 0;  // 验证成功
}
```

### 4.3 密钥生成与管理

```bash
# 安装 imgtool
pip install imgtool

# 生成 RSA-2048 密钥对
imgtool keygen -t rsa-2048 -k root-rsa-2048.pem

# 生成 RSA-3072 密钥对 (更安全)
imgtool keygen -t rsa-3072 -k root-rsa-3072.pem

# 生成 ECDSA P-256 密钥对
imgtool keygen -t ecdsa-p256 -k ecdsa-p256.pem

# 生成 Ed25519 密钥对 (推荐)
imgtool keygen -t ed25519 -k ed25519.pem

# 查看密钥信息
imgtool info -k root-rsa-2048.pem

# 导出公钥 (用于嵌入 bootloader)
imgtool extract-cert -k root-rsa-2048.pem -p root-rsa-2048_pub.c
```

### 4.4 签名命令详解

```bash
# 基本签名
imgtool sign \
    --key root-rsa-2048.pem \
    --header-size 0x200 \
    --align 8 \
    --version 1.0.0 \
    --pad-header \
    --slot-size 0x32000 \
    --max-sectors 100 \
    --output zephyr-app.signed.bin \
    zephyr-app.bin

# 详细参数说明
imgtool sign [options] infile

# 必需参数
--key FILE          # 私钥文件
--version VERSION   # 版本号 (x.y.z)

# 可选参数
--header-size      # 镜像头部大小 (默认 0x200)
--align            # Flash 对齐要求 (1/2/4/8 字节)
--slot-size        # 插槽大小
--max-sectors      # 最大扇区数
--pad-header       # 填充头部到对齐边界
--confirm          # 签名后直接标记为可运行

# 加密选项
--encrypt FILE     # 加密密钥文件

# 输出选项
--output FILE      # 输出文件

# 示例：带加密的签名
imgtool sign \
    --key root-rsa-2048.pem \
    --encrypt enc-aes256-keys.pem \
    --header-size 0x200 \
    --align 8 \
    --version 2.0.0 \
    --confirm \
    --output zephyr-app-enc.signed.bin \
    zephyr-app.bin
```

---

## 5. 交换模式详解

### 5.1 三种交换模式对比

| 模式 | Scratch 要求 | 安全性 | 空间效率 | 适用场景 |
| --- | --- | --- | --- | --- |
| **Swap using Scratch** | = 1 slot | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 生产环境 |
| **Swap using Move** | 无 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 空间受限 |
| **Overwrite only** | 无 | ⭐⭐ | ⭐⭐⭐⭐⭐ | 开发测试 |

### 5.2 Swap using Scratch (推荐)

**原理**：使用 Scratch 区域作为临时交换区，失败可回滚。

```
阶段 1: 初始状态
┌────────────┬────────────┬────────────┐
│ Primary    │ Secondary  │ Scratch    │
│ (v1.0.0)  │ (空)       │ (空)       │
└────────────┴────────────┴────────────┘

阶段 2: OTA 下载完成
┌────────────┬────────────┬────────────┐
│ Primary    │ Secondary  │ Scratch    │
│ (v1.0.0)  │ (v2.0.0)  │ (空)       │
│  ←──────   │            │            │
└────────────┴────────────┴────────────┘

阶段 3: 交换过程 (分区移动)
┌────────────┬────────────┬────────────┐
│ Primary    │ Secondary  │ Scratch    │
│ (v1.0.0)  │ (空)       │ (v2.0.0)  │ ← 从 Secondary 复制
│  ←──────   │            │            │
└────────────┴────────────┴────────────┘

阶段 4: 继续交换
┌────────────┬────────────┬────────────┐
│ Primary    │ Secondary  │ Scratch    │
│ (空)       │ (v1.0.0)  │ (v2.0.0)  │
│            │  ←──────   │            │
└────────────┴────────────┴────────────┘

阶段 5: 交换完成
┌────────────┬────────────┬────────────┐
│ Primary    │ Secondary  │ Scratch    │
│ (v2.0.0)✓│ (v1.0.0)  │ (空)       │ ← 回滚备用
└────────────┴────────────┴────────────┘
```

**配置**：

```kconfig
CONFIG_BOOT_SWAP_USING_SCRATCH=y
```

### 5.3 Swap using Move

**原理**：直接移动镜像，无 Scratch，节省空间但无回滚保护。

```
阶段 1: 初始状态
┌────────────┬────────────┐
│ Primary    │ Secondary  │
│ (v1.0.0)  │ (空)       │
└────────────┴────────────┘

阶段 2: 移动 Primary 到 Secondary
┌────────────┬────────────┐
│ Primary    │ Secondary  │
│ (空)       │ (v1.0.0)  │
└────────────┴────────────┘

阶段 3: 复制 Secondary 到 Primary
┌────────────┬────────────┐
│ Primary    │ Secondary  │
│ (v2.0.0)✓│ (v1.0.0)  │
└────────────┴────────────┘

⚠️ 如果阶段 3 失败，无法回滚到 v1.0.0
```

**配置**：

```kconfig
CONFIG_BOOT_SWAP_USING_MOVE=y
```

### 5.4 Overwrite Only

**原理**：直接覆盖 Primary Slot，无交换，最简单但风险最高。

```
阶段 1: 初始状态
┌────────────┬────────────┐
│ Primary    │ Secondary  │
│ (v1.0.0)  │ (空)       │
└────────────┴────────────┘

阶段 2: OTA 下载
┌────────────┬────────────┐
│ Primary    │ Secondary  │
│ (v1.0.0)  │ (v2.0.0)  │
└────────────┴────────────┘

阶段 3: 重启验证
    │
    ▼
Bootloader 检测 Secondary 有有效镜像
    │
    ▼
┌────────────┬────────────┐
│ Primary    │ Secondary  │
│ (v2.0.0)✓│ (v1.0.0)  │ ← 丢弃
└────────────┴────────────┘

⚠️ 如果 v2.0.0 有问题，无法回滚
```

**配置**：

```kconfig
CONFIG_BOOT_SWAP_USING_NONE=y
# 或
CONFIG_BOOT_OVERWRITE_ONLY=y
```

### 5.5 Test/Revert 机制

MCUboot 支持特殊的测试模式，用于验证新固件后再确认。

```
正常交换后的状态:
┌────────────┬────────────┐
│ Primary    │ Secondary  │
│ (v2.0.0)✓│ (v1.0.0)  │
└────────────┴────────────┘

Test 模式 (标记 Secondary 为可测试):
┌────────────┬────────────┐
│ Primary    │ Secondary  │
│ (v2.0.0)✓│ (v1.0.0)  │ ← 标记为 test 状态
└────────────┴────────────┘

重启后，Bootloader 检测:
- Primary 有效 → 运行 Primary
- Secondary 是 test → 验证通过后交换

Revert 机制:
如果应用运行失败，主动调用:
    boot_request_upgrade(BOOT_SWAP_REQ_REVERT)
重启后回滚到旧版本
```

---

## 6. 加密支持

### 6.1 加密流程

```
┌─────────────────────────────────────────────────────────────────┐
│                     镜像加密流程                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 生成镜像 (明文)                                             │
│     ┌─────────────────────────────────────────┐                │
│     │  Image Header + Payload                 │                │
│     └─────────────────────────────────────────┘                │
│                        │                                        │
│                        ▼                                        │
│  2. 使用 AES-256 加密 Payload                                   │
│     ┌─────────────────────────────────────────┐                │
│     │  Image Header + Encrypted Payload        │                │
│     └─────────────────────────────────────────┘                │
│                        │                                        │
│                        ▼                                        │
│  3. 添加加密 TLV (密钥 ID)                                      │
│     ┌─────────────────────────────────────────┐                │
│     │  Header | Encrypted Payload | TLV       │                │
│     │                          └── ENC Key ID │                │
│     └─────────────────────────────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 生成加密密钥

```bash
# 生成 AES-256 加密密钥
openssl rand -out enc-aes256-keys.pem 32

# 或使用 imgtool 生成
python3 -c "
import os
key = os.urandom(32)
print(' '.join(f'{b:02x}' for b in key))
" > enc-key.hex
```

### 6.3 加密签名镜像

```bash
imgtool sign \
    --key root-rsa-2048.pem \
    --encrypt enc-aes256-keys.pem \
    --header-size 0x200 \
    --align 8 \
    --version 1.0.0 \
    --confirm \
    --output zephyr-app.encrypted.signed.bin \
    zephyr-app.bin
```

### 6.4 解密配置

```kconfig
# 启用解密支持
CONFIG_BOOT_DECRYPT=y

# 指定解密密钥
CONFIG_BOOT_ENCRYPTION_KEY_FILE="enc-key.pem"
```

---

## 7. 回滚保护

### 7.1 回滚机制原理

```c
/* 版本比较逻辑 */
static int boot_version_compatible(struct image_version *new_ver,
                                   struct image_version *old_ver,
                                   struct image_version *min_ver)
{
    /* 1. 检查最低版本要求 */
    if (compare_versions(new_ver, min_ver) < 0) {
        return -1;  // 低于最低版本，拒绝
    }

    /* 2. 检查是否比当前版本新 */
    if (compare_versions(new_ver, old_ver) <= 0) {
        return -1;  // 不比当前新，拒绝 (防止回滚)
    }

    return 0;  // 通过
}

/* 版本比较函数 */
int compare_versions(struct image_version *a, struct image_version *b)
{
    if (a->iv_major != b->iv_major)
        return a->iv_major > b->iv_major ? 1 : -1;
    if (a->iv_minor != b->iv_minor)
        return a->iv_minor > b->iv_minor ? 1 : -1;
    if (a->iv_revision != b->iv_revision)
        return a->iv_revision > b->iv_revision ? 1 : -1;
    if (a->iv_build_num != b->iv_build_num)
        return a->iv_build_num > b->iv_build_num ? 1 : -1;
    return 0;  // 版本相同
}
```

### 7.2 镜像状态标记

MCUboot 使用 Flash 中的 magic 标记来表示镜像状态：

```c
/* 镜像状态 magic */
#define IMAGE_MAGIC      0x96    // 有效镜像
#define IMAGE_MAGIC_NONE 0      // 无镜像
#define IMAGE_MAGIC_BAD  0x01   // 损坏的镜像

/* Scratch 状态 magic */
#define SWAP_MAGIC_NONE  0
#define SWAP_MAGIC_TEST  1  // 测试模式
#define SWAP_MAGIC_PERM  2  // 永久交换
#define SWAP_MAGIC_REVERT 3  // 回滚

/* 状态持久化 */
typedef struct {
    uint32_t magic;           // SWAP_MAGIC_*
    uint8_t swap_type;        // 交换类型
    uint8_t image_ok;         // 镜像验证通过
    uint8_t image_pand;       // 镜像 PANic
} boot_swap_state_t;
```

### 7.3 永久镜像标记

应用可以请求永久使用新镜像：

```c
/* 在应用中请求永久升级 */
#include <bootutil/bootutil.h>

void permanent_upgrade_request(void)
{
    struct boot_status status;
    int rc;

    /* 设置永久交换标志 */
    rc = boot_set_confirmed();
    if (rc != 0) {
        /* 错误处理 */
        printk("Failed to confirm: %d\n", rc);
    }
}
```

---

## 8. 配置选项汇总

### 8.1 Flash 布局配置

```kconfig
# Flash 基地址和大小
CONFIG_FLASH_BASE_ADDRESS=0x08000000
CONFIG_FLASH_SIZE=512

# 插槽配置
CONFIG_BOOTLOADER_REGION_START=0x08000000
CONFIG_BOOT_FIRMWARE_UPGRADE_LOCATION=slot1_partition
CONFIG_MCUBOOT_MAX_IMG_SECTORS=256

# Scratch 配置
CONFIG_MCUBOOT_SCRATCH_SIZE=0xC000
```

### 8.2 安全配置

```kconfig
# 签名配置
CONFIG_BOOT_SIGNATURE_TYPE_RSA=y
# 或
CONFIG_BOOT_SIGNATURE_TYPE_ECDSA_P256=y
# 或
CONFIG_BOOT_SIGNATURE_TYPE_ED25519=y

# 公钥配置
CONFIG_BOOT_SIGNATURE_KEY_FILE="keys/default_rsa.pem"

# 加密配置
CONFIG_BOOT_ENCRYPTION_TYPE_AES256=y
CONFIG_BOOT_ENCRYPTION_KEY_FILE="keys/enc-key.pem"

# 回滚保护
CONFIG_BOOT_DOWNGRADE_PREVENTION=y
CONFIG_BOOT_MINIMUM_REQUIRED_VERSION="1.0.0"
```

### 8.3 交换模式配置

```kconfig
# 选择交换模式
CONFIG_BOOT_SWAP_USING_SCRATCH=y
# 或
CONFIG_BOOT_SWAP_USING_MOVE=y
# 或
CONFIG_BOOT_SWAP_USING_NONE=y
```

### 8.4 调试配置

```kconfig
# 串口调试
CONFIG_BOOT_SERIAL=y
CONFIG_BOOT_SERIAL_UART="UART_0"
CONFIG_BOOT_SERIAL_BAUD=115200

# 日志
CONFIG_LOG=y
CONFIG_BOOT_LOG_LEVEL=LOG_LEVEL_DBG
```

---

## 9. 实战配置示例

### 9.1 STM32F4 完整配置

```kconfig
# prj.conf - STM32F407VG

# ====== MCUboot 配置 ======
CONFIG_BOOTLOADER_MCUBOOT=y

# ====== Flash 布局 ======
CONFIG_FLASH_BASE_ADDRESS=0x08000000
CONFIG_FLASH_SIZE=1024
CONFIG_MCUBOOT_MAX_IMG_SECTORS=256

# ====== 插槽配置 ======
CONFIG_MCUBOOT_PRIMARY_1_OFFSET=0x10000
CONFIG_MCUBOOT_PRIMARY_1_SIZE=0x40000
CONFIG_MCUBOOT_SECONDARY_1_OFFSET=0x50000
CONFIG_MCUBOOT_SECONDARY_1_SIZE=0x40000

# ====== Scratch 配置 ======
CONFIG_MCUBOOT_SCRATCH_OFFSET=0x90000
CONFIG_MCUBOOT_SCRATCH_SIZE=0x10000

# ====== 签名配置 ======
CONFIG_BOOT_SIGNATURE_TYPE_RSA=y
CONFIG_BOOT_SIGNATURE_KEY_FILE="keys/root-rsa-2048.pem"

# ====== 回滚保护 ======
CONFIG_BOOT_DOWNGRADE_PREVENTION=y
CONFIG_BOOT_MINIMUM_REQUIRED_VERSION="1.0.0"

# ====== 交换模式 ======
CONFIG_BOOT_SWAP_USING_SCRATCH=y

# ====== 调试 ======
CONFIG_BOOT_SERIAL=y
CONFIG_MCUBOOT_HW_DEBUG=y
```

### 9.2 构建和签名脚本

```bash
#!/bin/bash
# build_and_sign.sh

set -e

BOARD=$1
VERSION=$2
KEY_FILE="keys/root-rsa-2048.pem"

if [ -z "$BOARD" ] || [ -z "$VERSION" ]; then
    echo "Usage: $0 <board> <version>"
    exit 1
fi

# 1. 构建 bootloader
echo "=== Building MCUboot ==="
west build -b $BOARD zephyr/bootloader/mcuboot/boot/zephyr \
    --west-config

# 2. 构建应用
echo "=== Building Application ==="
west build -b $BOARD zephyr/samples/hello_world \
    -- -DCONFIG_MCUBOOT_HAVE_LOGGING=y

# 3. 签名固件
echo "=== Signing Firmware ==="
BUILD_DIR="build/zephyr/zephyr.hex"

imgtool sign \
    --key $KEY_FILE \
    --header-size 0x200 \
    --align 8 \
    --version $VERSION \
    --pad-header \
    --slot-size 0x40000 \
    --max-sectors 256 \
    --confirm \
    --output build/zephyr.signed.bin \
    $BUILD_DIR

echo "=== Done ==="
echo "Signed firmware: build/zephyr.signed.bin"
echo "Version: $VERSION"
```

### 9.3 OTA 升级集成

```c
/* OTA 升级客户端 - 使用 MCUmgr */
#include <zephyr/mgmt/mcumgr/mgmt.h>
#include <zephyr/mgmt/mcumgr/smp/smp.h>
#include <zephyr/mgmt/mcumgr/transport/smp_uart.h>

/* MCUmgr 传输配置 */
static struct smp_uart_config smp_uart_config = {
    .uart_dev = DEVICE_DT_GET(DT_NODELABEL(uart1)),
    .baudrate = 115200,
};

void ota_start(void)
{
    /* 初始化 MCUmgr */
    smp_uart_init(&smp_uart_config);

    /* 设置图像管理回调 */
    img_mgmt_register_callbacks(&img_callbacks);
}

/* 图像上传回调 */
static void *img_upload_cb(uint32_t off, uint32_t size, void *arg)
{
    static uint8_t buf[4096];

    if (size > sizeof(buf)) {
        return NULL;
    }

    return buf;
}

/* 升级状态回调 */
static void img_dfu_pending_cb(void)
{
    printk("Image download complete, pending reboot\n");
    /* 准备升级 */
}

static void img_dfu_confirmed_cb(void)
{
    printk("Image confirmed, upgrade complete\n");
    /* 升级完成 */
}

static struct img_mgmt_callbacks img_callbacks = {
    .dfu_pending = img_dfu_pending_cb,
    .dfu_confirmed = img_dfu_confirmed_cb,
};
```

---

## 10. 调试与故障排除

### 10.1 调试日志

```c
// 启用详细日志
static int boot_log_enabled(void)
{
#if defined(CONFIG_MCUBOOT_HW_DEBUG)
    /* 串口输出调试信息 */
    const char * boot_states[] = {
        [BOOT_SWAP_TYPE_NONE]     = "swap none",
        [BOOT_SWAP_TYPE_TEST]     = "swap test",
        [BOOT_SWAP_TYPE_PERM]     = "swap perm",
        [BOOT_SWAP_TYPE_REVERT]   = "swap revert",
    };

    printk("[MCUboot] State: %s\n", boot_states[boot_current_slot]);
    printk("[MCUboot] Image version: %d.%d.%d+%u\n",
           hdr->ih_ver.iv_major,
           hdr->ih_ver.iv_minor,
           hdr->ih_ver.iv_revision,
           hdr->ih_ver.iv_build_num);
#endif
}
```

### 10.2 常见错误与解决

| 错误码 | 含义 | 可能原因 | 解决方案 |
| --- | --- | --- | --- |
| 0x01 | 无有效镜像 | Slot 为空或 magic 错误 | 检查 flash 写入 |
| 0x02 | 签名验证失败 | 公钥不匹配 | 确认公钥正确 |
| 0x03 | 版本太低 | 低于最低版本或当前版本 | 禁用回滚或升级版本 |
| 0x04 | Flash 错误 | 读写失败 | 检查硬件连接 |
| 0x05 | 交换失败 | Scratch 不够或 flash 错误 | 增加 scratch 大小 |
| 0x06 | 镜像损坏 | CRC/SHA 不匹配 | 重新签名固件 |

### 10.3 调试命令

```bash
# 使用 mcumgr 进行 OTA
mcumgr conn add serial type=serial,baudrate=115200,dev=/dev/ttyUSB0

# 列出镜像
mcumgr -c serial image list

# 上传镜像
mcumgr -c serial image upload build/zephyr.signed.bin

# 测试镜像 (重启后运行新镜像)
mcumgr -c serial image test <hash>

# 确认镜像 (永久使用)
mcumgr -c serial image confirm

# 回滚到旧镜像
mcumgr -c serial image erase

# 重启设备
mcumgr -c serial reset
```

### 10.4 串口调试

```
# 串口输出示例 (调试模式)

[MCUboot] Starting...
[MCUboot] Primary slot: valid
[MCUboot] Image version: 1.0.0
[MCUboot] Checking Secondary slot...
[MCUboot] Secondary slot: test pending
[MCUboot] Swap needed: test
[MCUboot] Scratch size: 0xC000
[MCUboot] Swap using scratch
[MCUboot] Swap complete, jumping to app
[MCUboot] Boot source: primary
[MCUboot] Image header OK
[MCUboot] Signature verified OK
[MCUboot] Booting image at 0x08010000
```

---

## 总结

MCUboot 是企业级嵌入式安全的基石：

| 能力 | 说明 |
| --- | --- |
| **安全启动** | 签名验证、加密、防篡改 |
| **可靠升级** | 双槽位交换、回滚保护 |
| **灵活配置** | 多种交换模式、可调参数 |
| **生态完善** | Zephyr、Mynewt、RIOT 原生支持 |
| **工具链** | imgtool、mcumgr 完整支持 |

> **生产建议**：使用 RSA-3072/Ed25519 签名 + Swap using Scratch 模式 + 回滚保护，确保安全性和可靠性。

---

## 参考资源

| 资源 | 地址 |
| --- | --- |
| MCUboot 官网 | https://mcuboot.com/ |
| MCUboot 文档 | https://docs.mcuboot.com/ |
| Zephyr MCUboot | https://docs.zephyrproject.org/latest/services/bootloader/mcuboot.html |
| imgtool | https://pypi.org/project/imgtool/ |
| MCUmgr | https://github.com/apache/mynewt-mcumgr |
