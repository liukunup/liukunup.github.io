---
title: 智能硬件与 App 功耗测试完整方案
tags:
  - 功耗测试
  - 智能硬件
  - Android
  - 性能优化
  - IoT
createTime: 2026/04/29 10:00:00
permalink: /blog/power-consumption-testing/
---

## 为什么功耗测试至关重要

在智能硬件和移动应用开发中，功耗直接影响用户体验：

- **智能硬件**：电池续航决定产品可用性（智能手表、智能家居、车载设备）
- **移动 App**：高功耗导致设备发热、电量消耗快，用户流失率提升 30%+
- **合规要求**：部分行业（医疗、工业）对设备功耗有明确标准

## 功耗测试核心指标

| 指标 | 说明 | 理想值 |
|------|------|--------|
| 电流（mA） | 设备实时工作电流 | 待机 < 10mA |
| 功耗（mW） | 电压 × 电流 | 待机 < 50mW |
| 待机功耗 | 休眠状态下的功耗 | < 1mW |
| 峰值功耗 | 高负载时的瞬时功耗 | < 设备额定值 |
| 平均功耗 | 一段时间内的平均功耗 | 根据场景定义 |

## 方案一：智能硬件功耗测试

### 1. 硬件测试工具

#### 入门级：USB 功率计
```
设备 ──USB功率计── 电脑/充电器
```
- **工具**：USB Power Monitor、UM25C、Tester 等
- **优点**：即插即用，成本低（￥50-200）
- **缺点**：精度有限，无法记录长时间数据

#### 专业级：直流电源分析仪
```
直流电源 ── 功率分析仪 ── 待测设备
         ↑
      PC 记录数据
```
- **工具**：Keysight N6705C、Chroma 66200 系列
- **优点**：高精度（±0.1%），支持长时间数据记录
- **缺点**：设备昂贵（￥10万+）

#### 开源方案：Witty Fox Current Monitor
```bash
# 基于 INA219 芯片，成本约 ￥50
# 可配合树莓派或 ESP32 实现自动化采集
```
- **接口**：I2C 通信，Python 读取
- **精度**：±1mA
- **采样率**：最高 400Hz

### 2. 智能硬件测试流程

#### Step 1：确定测试场景
```yaml
测试场景:
  - 待机模式: 设备休眠，关闭无线模块
  - 轻度使用: 间歇性传感器采集（每 30 秒一次）
  - 重度使用: 持续 WiFi 传输 + 屏幕常亮
  - 极限场景: 所有模块全开（GPS + WiFi + 蓝牙 + 屏幕）
```

#### Step 2：Python 自动化采集（基于 INA219）
```python
#!/usr/bin/env python3
"""
智能硬件功耗自动化测试脚本
硬件：INA219 + 树莓派/ESP32
"""
from ina219 import INA219
from ina219 import DeviceRangeError
import time
import csv
from datetime import datetime

class PowerMonitor:
    SHUNT_OHMS = 0.1
    MAX_EXPECTED_AMPS = 3.0

    def __init__(self, address=0x40):
        self.ina = INA219(self.SHUNT_OHMS, self.MAX_EXPECTED_AMPS, address=address)
        self.ina.configure()

    def read_power(self):
        """读取功耗数据"""
        try:
            voltage = self.ina.voltage()
            current = self.ina.current()
            power = self.ina.power()
            return {
                'timestamp': datetime.now().isoformat(),
                'voltage_v': voltage,
                'current_ma': current,
                'power_mw': power
            }
        except DeviceRangeError as e:
            print(f"Current out of range: {e}")
            return None

    def monitor(self, duration_sec=60, interval_sec=1, output_file='power_log.csv'):
        """持续监控并保存数据"""
        print(f"开始监控，持续 {duration_sec} 秒，间隔 {interval_sec} 秒")
        data = []

        for i in range(duration_sec // interval_sec):
            reading = self.read_power()
            if reading:
                data.append(reading)
                print(f"[{i+1}] V:{reading['voltage_v']:.2f}V "
                      f"I:{reading['current_ma']:.2f}mA "
                      f"P:{reading['power_mw']:.2f}mW")

            if i < duration_sec // interval_sec - 1:
                time.sleep(interval_sec)

        # 保存 CSV
        with open(output_file, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['timestamp', 'voltage_v', 'current_ma', 'power_mw'])
            writer.writeheader()
            writer.writerows(data)

        print(f"数据已保存到 {output_file}")
        return data

    def analyze(self, data):
        """分析功耗数据"""
        if not data:
            return

        currents = [d['current_ma'] for d in data]
        powers = [d['power_mw'] for d in data]

        print("\n===== 功耗分析报告 =====")
        print(f"测试时长: {len(data)} 秒")
        print(f"平均电流: {sum(currents)/len(currents):.2f} mA")
        print(f"平均功耗: {sum(powers)/len(powers):.2f} mW")
        print(f"峰值电流: {max(currents):.2f} mA")
        print(f"峰值功耗: {max(powers):.2f} mW")
        print(f"最小电流: {min(currents):.2f} mA")

if __name__ == '__main__':
    monitor = PowerMonitor()

    # 测试 5 分钟
    data = monitor.monitor(duration_sec=300, interval_sec=1, output_file='test_standby.csv')
    monitor.analyze(data)
```

#### Step 3：生成可视化报告
```python
import matplotlib.pyplot as plt
import pandas as pd

def plot_power_consumption(csv_file):
    df = pd.read_csv(csv_file)
    df['timestamp'] = pd.to_datetime(df['timestamp'])

    fig, axes = plt.subplots(3, 1, figsize=(12, 10))

    # 电压曲线
    axes[0].plot(df['timestamp'], df['voltage_v'], color='blue')
    axes[0].set_ylabel('Voltage (V)')
    axes[0].set_title('Voltage Over Time')
    axes[0].grid(True)

    # 电流曲线
    axes[1].plot(df['timestamp'], df['current_ma'], color='red')
    axes[1].set_ylabel('Current (mA)')
    axes[1].set_title('Current Over Time')
    axes[1].grid(True)

    # 功耗曲线
    axes[2].plot(df['timestamp'], df['power_mw'], color='green')
    axes[2].set_ylabel('Power (mW)')
    axes[2].set_xlabel('Time')
    axes[2].set_title('Power Consumption Over Time')
    axes[2].grid(True)

    plt.tight_layout()
    plt.savefig('power_report.png', dpi=150)
    print("报告已生成: power_report.png")

plot_power_consumption('test_standby.csv')
```

## 方案二：Android App 功耗测试

### 1. 系统工具（无需代码）

#### adb 命令快速检测
```bash
# 查看电池状态
adb shell dumpsys battery

# 查看耗电统计（需要 Android 6.0+）
adb shell dumpsys batterystats

# 重置电池统计
adb shell dumpsys batterystats --reset

# 查看特定应用的耗电
adb shell dumpsys batterystats --charged <package_name>
```

#### Battery Historian（Google 官方工具）
```bash
# 1. 收集 bugreport
adb bugreport bugreport.zip

# 2. 上传到 https://battery-historian.appspot.com/
# 或本地部署
docker run -p 9999:9999 bhaavan/battery-historian
```

**可视化内容**：
- 各应用耗电排行
- WakeLock 持有时间
- 屏幕、WiFi、GPS 等模块耗电
- 电量变化曲线

### 2. 代码级监控

#### 使用 `BatteryManager` API
```kotlin
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager

fun getBatteryInfo(): Map<String, Any> {
    val batteryIntent = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))

    return mapOf(
        "level" to batteryIntent?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1),
        "scale" to batteryIntent?.getIntExtra(BatteryManager.EXTRA_SCALE, -1),
        "temperature" to batteryIntent?.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, -1)?.div(10.0),
        "voltage" to batteryIntent?.getIntExtra(BatteryManager.EXTRA_VOLTAGE, -1)?.div(1000.0),
        "health" to batteryIntent?.getIntExtra(BatteryManager.EXTRA_HEALTH, -1)
    )
}

// 计算电池百分比
val batteryPct = batteryInfo["level"] as Int * 100 / (batteryInfo["scale"] as Int)
println("当前电量: $batteryPct%")
```

#### 监控 WakeLock（耗电大户）
```kotlin
// 在 Application 中注册监听
class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()

        // 监控 WakeLock 使用情况
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        // 需要手动记录 WakeLock.acquire()/release() 调用
    }
}
```

### 3. 第三方 APM 工具

| 工具 | 特点 | 功耗相关功能 |
|------|------|---------------|
| **Matrix (腾讯)** | 微信同款 APM | 检测 WakeLock 泄漏、后台耗电 |
| **Battery Canary (字节)** | 字节内部工具 | 电池温度、电流监测 |
| **Android Vitals** | Google Play 内置 | 自动检测过度耗电应用 |

### 4. 自动化测试脚本

```python
#!/usr/bin/env python3
"""
Android App 功耗自动化测试
结合 adb + Pushgateway（参考前文）
"""
import subprocess
import time
from prometheus_client import CollectorRegistry, Gauge, push_to_gateway

def get_battery_level():
    """获取当前电量"""
    result = subprocess.run(
        ['adb', 'shell', 'dumpsys', 'battery'],
        capture_output=True, text=True
    )
    for line in result.stdout.split('\n'):
        if 'level:' in line:
            return int(line.split(':')[1].strip())
    return -1

def get_battery_temp():
    """获取电池温度（摄氏度）"""
    result = subprocess.run(
        ['adb', 'shell', 'dumpsys', 'battery'],
        capture_output=True, text=True
    )
    for line in result.stdout.split('\n'):
        if 'temperature:' in line:
            return int(line.split(':')[1].strip()) / 10.0
    return -1

def monitor_app_power(package_name, duration_min=30):
    """监控应用耗电"""
    print(f"开始监控 {package_name} 的功耗，持续 {duration_min} 分钟")

    # 重置统计
    subprocess.run(['adb', 'shell', 'dumpsys', 'batterystats', '--reset'])

    start_level = get_battery_level()
    start_time = time.time()

    # 等待测试完成
    time.sleep(duration_min * 60)

    end_level = get_battery_level()
    end_time = time.time()

    # 获取耗电详情
    result = subprocess.run(
        ['adb', 'shell', 'dumpsys', 'batterystats', '--charged', package_name],
        capture_output=True, text=True
    )

    # 解析耗电数据
    power_consumed = start_level - end_level
    duration_hour = (end_time - start_time) / 3600

    print(f"\n===== 功耗测试报告 =====")
    print(f"测试时长: {duration_min} 分钟")
    print(f"电量消耗: {power_consumed}%")
    print(f"平均功耗: {power_consumed / duration_hour:.2f}%/小时")

    # 上报到 Pushgateway（可选）
    registry = CollectorRegistry()
    battery_gauge = Gauge('app_battery_consumption_pct', 'Battery consumption in percent',
                          ['package'], registry=registry)
    battery_gauge.labels(package=package_name).set(power_consumed)

    try:
        push_to_gateway('localhost:9091', job='app_power_test', registry=registry)
        print("已上报到 Pushgateway")
    except Exception as e:
        print(f"上报失败: {e}")

if __name__ == '__main__':
    monitor_app_power('com.example.myapp', duration_min=10)
```

## 方案三：iOS App 功耗测试

### Xcode Instruments
1. 打开 Xcode → `Open Developer Tool` → `Instruments`
2. 选择 **Energy Log** 模板
3. 连接 iOS 设备，选择 target app
4. 开始录制，执行测试场景
5. 查看 **Energy Impact** 图表

### 关键指标
- **Energy Impact**: 综合能耗评分（Low/High/Very High）
- **CPU Energy**: CPU 耗电
- **Network Energy**: 网络传输耗电
- **Location Energy**: GPS 定位耗电
- **GPU Energy**: 图形渲染耗电

## 最佳实践与常见问题

### 1. 测试环境标准化
```yaml
环境要求:
  - 温度: 23°C ± 2°C（温度影响电池性能）
  - 电量: 50%-80%（避免极端电量影响测试）
  - 网络: 固定 WiFi 或蜂窝网络（避免信号波动）
  - 后台: 关闭无关应用（减少干扰）
```

### 2. 典型耗电问题排查

| 症状 | 可能原因 | 排查方法 |
|------|----------|----------|
| 待机耗电高 | WakeLock 未释放 | `dumpsys power` 查看 WakeLock |
| 运行时发热 | 高频 CPU 使用 | Android Profiler CPU 模块 |
| 网络耗电大 | 频繁心跳/轮询 | Network Profiler 查看请求频率 |
| GPS 耗电高 | 定位未停止 | 检查 `onPause()` 是否停止定位 |

### 3. 优化建议
```
1. 减少 WakeLock 使用，优先使用 WorkManager
2. 网络请求合并，避免频繁小包传输
3. GPS 使用完毕后立即关闭
4. 后台任务使用 JobScheduler/WorkManager
5. 图片加载使用合适的尺寸和格式
```

## 总结

| 测试对象 | 推荐方案 | 工具成本 | 数据精度 |
|----------|----------|----------|----------|
| 智能硬件（开发阶段） | INA219 + Python | 低（￥50） | 中 |
| 智能硬件（验收阶段） | 专业电源分析仪 | 高（￥10万+） | 高 |
| Android App（快速检测） | Battery Historian | 免费 | 中 |
| Android App（深度分析） | Matrix + 自动化脚本 | 免费 | 高 |
| iOS App | Xcode Instruments | 免费（需 Mac） | 高 |

**推荐流程**：
1. 开发阶段：使用低成本工具（INA219/adb）快速验证
2. 测试阶段：结合 Battery Historian 和自动化脚本
3. 上线后：接入 APM 平台（Matrix/Pushgateway）持续监控
