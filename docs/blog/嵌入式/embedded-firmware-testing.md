---
title: 嵌入式固件测试方案：Bootloader、App 与 OTA 全覆盖
tags:
  - 嵌入式
  - 固件测试
  - bootloader
  - OTA
createTime: 2026/08/23 02:00:00
permalink: /blog/embedded-firmware-testing/
---

> 嵌入式固件测试与传统软件测试有本质区别，需要覆盖 Bootloader、App、OTA 升级等全链路，涉及硬件、Flash、签名、安全等多维度验证。本文提供完整的嵌入式固件测试方案。

## 嵌入式固件测试的独特挑战

| 挑战 | 说明 | 应对策略 |
| --- | --- | --- |
| **硬件依赖** | Flash、RAM、外设依赖硬件 | 硬件在环测试 (HIL) |
| **资源受限** | 有限的存储和计算能力 | 针对性的测试设计 |
| **安全要求** | 签名验证、加密、防回滚 | 安全专项测试 |
| **OTA 链路** | 升级过程中的状态机复杂 | 全流程覆盖测试 |
| **实时性** | 中断、RTOS 调度 | 实时性能测试 |

## 测试分层架构

```
┌─────────────────────────────────────────────────┐
│            系统测试 (System Testing)             │
│   OTA 升级、端到端功能、多模块集成              │
├─────────────────────────────────────────────────┤
│           集成测试 (Integration Testing)          │
│   Bootloader + App、Flash 读写、外设通信        │
├─────────────────────────────────────────────────┤
│            组件测试 (Component Testing)          │
│   签名验证、版本检查、Flash 管理                │
├─────────────────────────────────────────────────┤
│             单元测试 (Unit Testing)              │
│   算法、数据结构、业务逻辑                      │
└─────────────────────────────────────────────────┘
```

## 一、Bootloader 测试

### 1.1 镜像验证测试

```python
# test_bootloader_image_verification.py
import struct
import pytest

class TestImageVerification:
    """镜像验证测试"""

    def test_valid_signature_accepted(self, device):
        """有效签名应被接受"""
        # 1. 准备正确签名的镜像
        firmware = generate_signed_firmware(
            version="1.0.0",
            signature=SIGN_VALID
        )

        # 2. 刷入 Secondary Slot
        device.flash_write(SECONDARY_SLOT, firmware)

        # 3. 重启
        device.reset()

        # 4. 验证启动成功
        assert device.is_running()
        assert device.get_boot_source() == BOOTED_FROM_PRIMARY

    def test_invalid_signature_rejected(self, device):
        """无效签名应被拒绝"""
        # 1. 准备错误签名的镜像
        firmware = generate_signed_firmware(
            version="1.0.0",
            signature=SIGN_INVALID
        )

        device.flash_write(SECONDARY_SLOT, firmware)
        device.reset()

        # 2. 验证拒绝启动
        assert device.is_halted() or device.boot_failed()

    def test_corrupted_image_detected(self, device):
        """损坏镜像应被检测"""
        firmware = generate_firmware()
        corrupted = corrupt_data(firmware, bytes_flip=0.01)

        device.flash_write(SECONDARY_SLOT, corrupted)
        device.reset()

        assert device.boot_failed()
        assert "image validation failed" in device.get_log()
```

### 1.2 版本与回滚测试

```python
class TestVersionAndRollback:
    """版本与回滚测试"""

    @pytest.mark.parametrize("from_ver,to_ver,expected", [
        ("1.0.0", "1.1.0", True),      # 正常升级
        ("1.0.0", "2.0.0", True),      # 大版本升级
        ("2.0.0", "1.0.0", False),     # 回滚被阻止
        ("1.0.0", "0.9.0", False),     # 降级被阻止
        ("1.0.0", "1.0.0", True),      # 同版本允许
    ])
    def test_version_upgrade_policy(self, device, from_ver, to_ver, expected):
        """版本升级策略测试"""
        # 1. 刷入低版本
        device.flash_write(PRIMARY_SLOT, make_image(from_ver))
        device.reset()

        # 2. 尝试刷入目标版本
        device.flash_write(SECONDARY_SLOT, make_image(to_ver))
        device.reset()

        # 3. 验证结果
        if expected:
            assert device.is_running()
            assert device.get_image_version() == to_ver
        else:
            assert device.boot_failed()

    def test_minimum_version_enforcement(self, device):
        """最低版本强制检查"""
        # 设置最低版本为 1.5.0
        device.set_minimum_version("1.5.0")

        # 尝试刷入 1.0.0
        device.flash_write(SECONDARY_SLOT, make_image("1.0.0"))
        device.reset()

        # 应被拒绝
        assert device.boot_failed()
        assert "version too low" in device.get_log()
```

### 1.3 Flash 操作测试

```python
class TestFlashOperations:
    """Flash 操作测试"""

    def test_flash_read_write_integrity(self, device):
        """Flash 读写完整性测试"""
        test_data = b"Hello, Flash!" * 100

        # 写入
        addr = SECONDARY_SLOT + 0x200
        device.flash_write(addr, test_data)

        # 读取
        read_data = device.flash_read(addr, len(test_data))

        # 验证
        assert read_data == test_data

    def test_flash_erase(self, device):
        """Flash 擦除测试"""
        addr = SECONDARY_SLOT

        # 写入数据
        device.flash_write(addr, b"\xFF" * 0x1000)

        # 擦除扇区
        device.flash_erase(addr, 0x1000)

        # 验证为 0xFF
        data = device.flash_read(addr, 0x1000)
        assert all(b == 0xFF for b in data)

    def test_slot_boundary(self, device):
        """插槽边界测试"""
        # 测试 Primary Slot 边界
        assert device.flash_read(PRIMARY_SLOT, 4) == b"\xFF" * 4  # magic
        assert device.flash_write(PRIMARY_SLOT + 0x40000 - 4, b"test")  # 边界

        # 测试 Secondary Slot 边界
        device.flash_write(SECONDARY_SLOT, b"X" * 0x40000)
        assert device.flash_read(SECONDARY_SLOT + 0x3FFFC, 4) == b"XXXX"
```

### 1.4 Bootloader 状态机测试

```python
class TestBootloaderStateMachine:
    """Bootloader 状态机测试"""

    @pytest.fixture
    def state_machine(self, device):
        """获取状态机接口"""
        return BootloaderStateMachine(device)

    def test_initial_boot_flow(self, state_machine):
        """首次启动流程"""
        state = state_machine.get_current_state()
        assert state == "idle"

        state_machine.trigger_boot()
        state = state_machine.wait_for_state_change()

        # 验证镜像加载
        assert state == "image_loaded"
        assert state_machine.is_primary_valid()

    def test_upgrade_flow(self, state_machine):
        """升级流程"""
        # 1. 准备升级镜像
        state_machine.upload_image(VERSION_1_1)
        assert state_machine.get_pending_version() == "1.1.0"

        # 2. 请求重启
        state_machine.request_reboot()

        # 3. 验证升级完成
        state = state_machine.wait_for_state_change(timeout=30)
        assert state == "booted"
        assert state_machine.get_active_version() == "1.1.0"

    def test_swap_failure_recovery(self, state_machine):
        """交换失败恢复"""
        # 模拟交换过程中断电
        state_machine.start_swap()
        state_machine.simulate_power_loss()

        # 重启后应回滚
        state_machine.reset()
        state = state_machine.wait_for_state_change()

        assert state == "booted"
        assert state_machine.is_primary_valid()
```

## 二、应用程序测试

### 2.1 启动测试

```python
class TestAppStartup:
    """应用程序启动测试"""

    def test_app_starts_after_bootloader(self, device):
        """Bootloader 之后 App 应正常启动"""
        device.reset()
        device.wait_for_bootloader()

        assert device.bootloader_active()

        device.continue_boot()
        device.wait_for_app()

        assert device.app_running()
        assert device.get_main_thread_id() is not None

    def test_app_initialization_time(self, device):
        """应用初始化时间测试"""
        device.reset()
        start = device.get_timestamp()

        device.wait_for_app()
        end = device.get_timestamp()

        init_time = end - start
        assert init_time < 500  # 应在 500ms 内完成
        print(f"App initialization time: {init_time}ms")

    def test_app_crash_detection(self, device):
        """应用崩溃检测"""
        # 注入故障触发崩溃
        device.inject_fault("heap_overflow")
        device.reset()

        device.wait_for_bootloader()
        device.continue_boot()

        # 验证崩溃被检测
        assert device.wdt_triggered() or device.is_halted()
        assert device.get_crash_info() is not None
```

### 2.2 固件完整性测试

```python
class TestFirmwareIntegrity:
    """固件完整性测试"""

    def test_crc32_check(self, device):
        """CRC32 校验测试"""
        # 读取固件 CRC
        stored_crc = device.get_firmware_crc()

        # 计算当前固件 CRC
        current_crc = device.calculate_firmware_crc()

        assert stored_crc == current_crc

    def test_memory_integrity(self, device):
        """内存完整性测试"""
        # 写入测试模式
        test_patterns = [
            0x55555555,
            0xAAAAAAAA,
            0xFFFFFFFF,
            0x00000000,
        ]

        for pattern in test_patterns:
            addr = 0x20000000  # SRAM 起始地址
            device.write_memory(addr, struct.pack("<I", pattern))

            # 读取验证
            data = device.read_memory(addr, 4)
            assert struct.unpack("<I", data)[0] == pattern

    def test_rollback_prevention_persists(self, device):
        """回滚阻止持久化测试"""
        # 1. 升级到 v2.0.0
        device.upgrade_to_version("2.0.0")
        assert device.get_version() == "2.0.0"

        # 2. 重置设备
        device.hard_reset()

        # 3. 尝试刷入 v1.0.0
        device.flash_firmware(version="1.0.0")
        device.reset()

        # 4. 验证仍然运行 v2.0.0
        assert device.get_version() == "2.0.0"
```

### 2.3 安全测试

```python
class TestFirmwareSecurity:
    """固件安全测试"""

    def test_jtag_debug_disabled(self, device):
        """JTAG 调试应被禁用"""
        assert not device.jtag_enabled()
        assert device.read_debug_port() is None

    def test_secure_boot_enforced(self, device):
        """安全启动强制执行"""
        # 尝试跳过签名验证
        device.disable_signature_check()
        device.reset()

        # 应仍然验证签名
        assert device.boot_failed()

    def test_memory_protection(self, device):
        """内存保护测试"""
        # 尝试读取受保护区域
        protected_addr = 0x08000000  # Flash 起始
        assert device.read_memory(protected_addr) is None or \
               device.is_read_blocked()

        # 尝试写入 Flash
        assert not device.flash_write(protected_addr, b"test"))

    def test_side_channel_protection(self, device):
        """侧信道攻击防护"""
        # 时序攻击测试
        timing_results = []
        for _ in range(100):
            start = device.get_timestamp()
            device.verify_signature(INVALID_SIG)
            end = device.get_timestamp()
            timing_results.append(end - start)

        # 验证时序是常数时间
        std_dev = statistics.stdev(timing_results)
        assert std_dev < 10  # 标准差应很小
```

## 三、OTA 升级测试

### 3.1 升级流程测试

```python
class TestOTAFlow:
    """OTA 升级流程测试"""

    def test_successful_upgrade(self, device):
        """成功升级流程"""
        initial_ver = device.get_version()

        # 1. 检查更新
        update_info = device.check_for_update()
        assert update_info["available"]

        # 2. 下载镜像
        device.download_update(
            update_info["url"],
            progress_callback=lambda p: print(f"Download: {p}%")
        )

        # 3. 验证下载完整性
        assert device.verify_downloaded_image()

        # 4. 执行升级
        device.apply_update()

        # 5. 重启
        device.reset()

        # 6. 验证升级成功
        new_ver = device.get_version()
        assert new_ver != initial_ver
        assert device.is_running()

    def test_download_interruption_recovery(self, device):
        """下载中断恢复测试"""
        def fail_at_progress_50(progress):
            if progress >= 50:
                raise ConnectionError("Simulated network failure")
            return True

        # 模拟下载中断
        device.download_update(
            UPDATE_URL,
            progress_callback=fail_at_progress_50
        )

        # 重新连接后继续
        device.resume_download()

        # 验证最终成功
        assert device.verify_downloaded_image()

    def test_upgrade_with_insufficient_space(self, device):
        """空间不足处理测试"""
        device.set_flash_available(1024)  # 模拟空间不足

        # 应提示清理或拒绝
        with pytest.raises(InsufficientSpaceError):
            device.download_update(UPDATE_URL)
```

### 3.2 升级失败测试

```python
class TestOTAFailureScenarios:
    """OTA 失败场景测试"""

    def test_corrupted_download_rejected(self, device):
        """损坏下载被拒绝"""
        # 准备损坏的镜像
        corrupted = generate_firmware()
        corrupted = corrupt_data(corrupted, corruption_rate=0.05)

        # 直接刷入
        device.flash_write(SECONDARY_SLOT, corrupted)
        device.reset()

        # Bootloader 应拒绝
        assert device.boot_failed()
        assert device.get_boot_status() == "IMAGE_INVALID"

    def test_power_loss_during_swap(self, device):
        """交换中断电解测试"""
        # 1. 准备镜像
        device.flash_write(SECONDARY_SLOT, make_image("2.0.0"))

        # 2. 开始交换
        device.reset()
        device.wait_for_bootloader()
        device.start_swap()

        # 3. 在交换过程中断电
        device.simulate_power_loss()

        # 4. 重新上电
        device.power_on()

        # 5. 验证恢复
        status = device.get_boot_status()
        assert "swap" in status.lower() or status == "booted"
        # 应能恢复到一致状态

    def test_network_timeout_handling(self, device):
        """网络超时处理测试"""
        with patch_network_latency(60):  # 60秒超时
            with pytest.raises(NetworkTimeoutError):
                device.download_update(UPDATE_URL, timeout=30)

        # 设备应保持正常运行
        assert device.is_running()
```

### 3.3 升级后验证

```python
class TestPostUpgradeVerification:
    """升级后验证测试"""

    def test_all_functions_work_after_upgrade(self, device):
        """升级后所有功能正常"""
        device.upgrade_to_version("2.0.0")

        # 运行功能测试套件
        test_cases = [
            device.test_uart_communication,
            device.test_i2c_devices,
            device.test_gpio_outputs,
            device.test_adc_readings,
            device.test_watchdog,
        ]

        results = [tc() for tc in test_cases]
        assert all(results), f"Failed tests: {results}"

    def test_configuration_preserved(self, device):
        """配置保持测试"""
        # 设置配置
        device.set_config("wifi.ssid", "TestNetwork")
        device.set_config("device.name", "TestDevice")
        device.set_config("log.level", "debug")

        # 升级
        device.upgrade_to_version("2.0.0")

        # 验证配置保留
        assert device.get_config("wifi.ssid") == "TestNetwork"
        assert device.get_config("device.name") == "TestDevice"
        assert device.get_config("log.level") == "debug"

    def test_old_version_recovery(self, device):
        """旧版本恢复测试"""
        # 升级到 v2.0.0
        device.upgrade_to_version("2.0.0")

        # 回滚到 v1.0.0
        device.flash_write(SECONDARY_SLOT, make_image("1.0.0"))
        device.reset()

        # 验证运行 v1.0.0
        assert device.get_version() == "1.0.0"
        assert device.is_running()
```

## 四、测试框架与工具

### 4.1 测试框架选择

| 框架 | 适用场景 | 优点 |
| --- | --- | --- |
| **pytest + pytest-embedded** | Python 自动化测试 | 易用、插件丰富 |
| **Unity + Ceedling** | C 单元测试 | 专为嵌入式优化 |
| **Google Test** | C++ 测试 | 功能强大 |
| **Robot Framework** | 系统级测试 | 关键字驱动 |

### 4.2 测试基础设施

```python
# conftest.py - pytest 配置
import pytest
from device_emulator import DeviceEmulator

@pytest.fixture(scope="session")
def device():
    """设备连接 fixture"""
    dev = DeviceEmulator("/dev/ttyUSB0", baudrate=115200)
    dev.connect()
    yield dev
    dev.disconnect()

@pytest.fixture(scope="function")
def fresh_device(device):
    """每个测试的干净设备状态"""
    device.erase_all()
    device.flash_firmware(FACTORY_FIRMWARE)
    device.reset()
    device.wait_for_boot()
    yield device
    device.reset()

# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
```

### 4.3 CI/CD 集成

```yaml
# .github/workflows/firmware-test.yml
name: Firmware Testing

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  bootloader-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: |
          pip install pytest pyserial pyyaml

      - name: Build firmware
        run: |
          west build -b nrf52840dk_nrf52840 zephyr/samples/hello_world

      - name: Run bootloader tests
        run: |
          pytest tests/bootloader/ -v --device=/dev/ttyACM0

      - name: Run app tests
        run: |
          pytest tests/app/ -v --device=/dev/ttyACM0

      - name: Run OTA tests
        run: |
          pytest tests/ota/ -v --device=/dev/ttyACM0 --server=localhost:8080
```

## 五、测试覆盖率指标

### 5.1 代码覆盖率

| 类型 | 目标 | 说明 |
| --- | --- | --- |
| **行覆盖率** | ≥ 90% | 关键路径必须覆盖 |
| **分支覆盖率** | ≥ 80% | if/else 分支全覆盖 |
| **函数覆盖率** | ≥ 95% | 所有函数都要调用 |

```python
# 使用 gcov 收集覆盖率
# CMakeLists.txt
set(GCOV TRUE)
set(Coverage TRUE)

# 构建时启用
west build -b nrf52840dk -- -DCMAKE_BUILD_TYPE=Debug -DCoverage=ON
```

### 5.2 场景覆盖率

| 场景类别 | 必须覆盖的测试用例 |
| --- | --- |
| Bootloader 启动 | 正常启动、签名错误、CRC 错误、版本检查 |
| 升级流程 | 下载成功、中断恢复、空间不足、网络错误 |
| 安全验证 | 签名验证、回滚阻止、内存保护 |
| 硬件交互 | Flash 读写、GPIO、中断、Watchdog |
| 异常处理 | 看门狗复位、掉电恢复、RAM 错误 |

## 总结

嵌入式固件测试需要 **多层次、多维度** 的覆盖：

1. **Bootloader 层**：签名、版本、Flash 操作、状态机
2. **应用层**：启动、运行时、安全、持久化
3. **OTA 层**：下载、交换、回滚、恢复
4. **安全层**：签名验证、回滚保护、内存隔离

> **关键原则**：测试要 **贴近真实场景**，特别是异常和边界情况，因为嵌入式设备的故障代价往往很高。

---

## 参考资源

- [MCUboot 测试指南](https://docs.mcuboot.com/testplan.html)
- [Zephyr 测试文档](https://docs.zephyrproject.org/latest/test/index.html)
- [Embedded Testing Best Practices](https://www.embedded.com/testing-embedded-software-best-practices/)
