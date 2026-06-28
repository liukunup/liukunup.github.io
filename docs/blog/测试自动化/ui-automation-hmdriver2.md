---
title: hmdriver2
tags:
  - HarmonyOS NEXT
  - 纯血鸿蒙
  - 华为
  - UI automation
createTime: 2026/04/25 20:32:46
permalink: /blog/hmdriver2/
---

## 引言

hmdriver2 是 Python 版 HarmonyOS NEXT UI 自动化框架。非侵入式设计，无需在设备上安装额外测试服务，通过 HDC (HarmonyOS Debug Center) 与设备通信。

**核心优势**：
- 无需设备端 testRunner，与原生 App 行为一致
- API 对齐 uiautomator2，Android 自动化平滑迁移
- 支持截图、录屏、元素定位、UI 操作

**适用场景**：
- HarmonyOS NEXT 纯血鸿蒙 UI 自动化测试
- 批量自动化操作（抢票、签到、数据采集）
- 回归测试、冒烟测试

## 环境准备

### HDC 环境搭建

```bash
# 1. 下载 HarmonyOS Command Line Tools
# https://developer.huawei.com/consumer/cn/download/

# 2. 解压后设置环境变量
export HM_SDK_HOME=/path/to/harmonyos-sdk
export PATH=$HM_SDK_HOME/toolchains/hdc/linux-x86_64:$PATH

# 3. 验证 hdc 可用
hdc -v
# 输出: HarmonyOS Debug Connector(HDC) version x.x.x.x
```

### pip 安装

```bash
# 基础版
pip3 install -U hmdriver2

# 含 opencv 截图/录屏功能
pip3 install -U "hmdriver2[opencv-python]"
```

### 连接设备

**有线连接**：
```bash
# 设备开启开发者模式 → USB 调试
hdc list targets
```

**远程连接**：
```bash
# 设备端 (需要先有线连接一次)
hdc kill -r            # 重启 hdc server 为监听模式
hdc shell "hdc -s list targets"  # 查看设备 IP

# 主机端
export HDC_SERVER_HOST=192.168.1.100
export HDC_SERVER_PORT=8710
```

### 验证安装

```python
from hmdriver2.driver import Driver

d = Driver()
print(d.device_info)
# {'sdk_version': '5.0.0', 'product_name': 'xxx', ...}
```

## 快速开始

10 行代码完成：获取设备信息 → 启动 App → 点击 → 滑动。

```python
from hmdriver2.driver import Driver

# 1. 初始化驱动
d = Driver()

# 2. 获取设备信息
print(f"设备: {d.device_info['product_name']}")
print(f"分辨率: {d.display_size}")

# 3. 启动 App
d.start_app("com.kuaishou.hmapp")

# 4. 点击元素
d(text="精选").click()

# 5. 滑动页面 (起点x, 起点y, 终点x, 终点y, 归一化坐标 0-1)
d.swipe(0.5, 0.8, 0.5, 0.4)

# 6. 截图保存
d.screenshot("screenshot.png")
```

## 元素定位

### 基本定位器

```python
# text 定位
d(text="精选").click()

# id 定位
d(id="drag").click()

# type + index 定位
d(type="Button", index=0).click()

# 组合定位
d(type="Button", text="tab_recrod").click()
```

### XPath 定位

HarmonyOS 布局树结构：`/root[1]/Row[1]/Column[1]/Row[1]/Button[3]`

```python
# 文本定位
d.xpath('//*[@text="showDialog"]').click()

# contains 模糊匹配
d.xpath('//*[contains(@text, "登录")]').click()

# 属性定位
d.xpath('//Button[@enabled="true"]').exists()
```

### 元素状态检查

```python
# 存在检查
if d(text="确认").exists():
    d(text="确认").click()

# 等待元素出现 (超时 10 秒)
d(text="确认", timeout=10).click()
```

### 示例：多定位器组合

```python
# 优先 text, 次选 id, 最后 xpath
try:
    d(text="我的").click()
except:
    try:
        d(id="mine_tab").click()
    except:
        d.xpath('//*[@text="我的"]').click()
```

## 常用操作

### 点击与滑动

```python
# 点击 (默认点击中心点)
d(text="按钮").click()

# 点击坐标 (归一化 0-1)
d.click(0.5, 0.5)

# 长按 (毫秒)
d(text="按钮").long_click(1000)

# 滑动 (归一化坐标)
d.swipe(0.5, 0.8, 0.5, 0.4)  # 上滑
d.swipe(0.5, 0.2, 0.5, 0.8)  # 下滑
d.swipe(0.2, 0.5, 0.8, 0.5)  # 左滑 → 右滑
```

### 文本输入

```python
# 输入文本 (先聚焦再输入)
d(text="输入框").click()
d.input_text("hello world")

# 清空输入框
d(text="输入框").clear_text()

# 特殊按键
d.press_enter()    # 回车
d.press_delete()   # 删除
```

### 截图与保存

```python
# 截图到文件
d.screenshot("screen.png")

# 截图到 PIL Image
from PIL import Image
img = d.screenshot()
img.save("screen.png")

# 录屏 (需要 opencv-python)
d.video_record("/tmp/record.mp4", duration=10)  # 10 秒
```

### App 管理

```python
# 启动 App
d.start_app("com.kuaishou.hmapp")

# 停止 App
d.stop_app("com.kuaishou.hmapp")

# 安装 App
d.install_app("/path/to/app.hap")

# 卸载 App
d.uninstall_app("com.kuaishou.hmapp")

# 获取当前前台 App
print(d.current_app())
```

### 设备控制

```python
# 返回主页
d.go_home()

# 返回键
d.press_back()

# 多任务键
d.recents()

# 电源键
d.lock()     # 锁屏
d.unlock()  # 解锁

# 音量键
d.volume_up()
d.volume_down()
```

### Toast 消息

```python
# Toast 获取 (出现后 3 秒内)
toast = d.toast_message()
print(toast)

# 清空 Toast
d.toast_reset()
```

### 屏幕信息

```python
# 分辨率 (归一化值)
width, height = d.display_size
print(f"{width}x{height}")

# 旋转角度
rotation = d.display_rotation  # 0/90/180/270
```

## 实战场景

完整示例：启动 App → 等待首页 → 点击按钮 → 读取文本 → 截图。

```python
#!/usr/bin/env python3
"""
 HarmonyOS 自动化测试示例
 场景: 启动快手 → 等待首页 → 点击"精选"Tab → 读取标题 → 截图
"""

import time
from hmdriver2.driver import Driver

def main():
    # 1. 初始化
    d = Driver()
    print(f"设备: {d.device_info['product_name']}")
    print(f"分辨率: {d.display_size}")

    # 2. 启动 App
    print("启动快手 App...")
    d.start_app("com.kuaishou.hmapp")

    # 3. 等待首页加载 (最多 10 秒)
    print("等待首页加载...")
    d(text="首页", timeout=10).exists()

    # 4. 点击"精选"Tab
    print("点击精选 Tab...")
    if d(text="精选").exists():
        d(text="精选").click()
    else:
        print("精选 Tab 不存在，跳过")

    # 5. 等待精选页加载
    time.sleep(2)

    # 6. 执行滑动操作
    print("上滑刷新...")
    d.swipe(0.5, 0.8, 0.5, 0.4)

    # 7. 截图保存
    print("保存截图...")
    d.screenshot("kuaishou_home.png")

    # 8. 停止 App
    print("停止 App...")
    d.stop_app("com.kuaishou.hmapp")

    print("完成!")

if __name__ == "__main__":
    main()
```

**运行**：
```bash
python3 demo.py
```

## 与 uiautomator2 对比

| 功能 | uiautomator2 | hmdriver2 |
|------|-------------|----------|
| 设备通信 | ADB | HDC |
| 安装服务 | atx-agent | 无需 |
| 坐标系统 | 像素/归一化 | 归一化 0-1 |
| 元素定位 | resource-id | id |
| XPath 兼容 | 是 | 是 |

### API 对照

```python
# uiautomator2
d(text="Settings").click()
d.swipe(0.5, 0.8, 0.5, 0.4)
d.screenshot().save("a.png")

# hmdriver2 (完全一致)
d(text="Settings").click()
d.swipe(0.5, 0.8, 0.5, 0.4)
d.screenshot("a.png")
```

### 迁移要点

1. **包名**: `uiautomator2` → `hmdriver2.driver`
2. **初始化**: `d = u2.connect()` → `d = Driver()`
3. **截图**: `d.screenshot().save()` → `d.screenshot(path)`
4. **权限**: Android USB 调试 → HarmonyOS 开发者模式

## 排错指南

### HDC 连接失败

```bash
# 检查 HDC 是否可用
hdc -v

# 检查环境变量
echo $HM_SDK_HOME

# 重启 hdc 服务
hdc kill -r
hdc start
```

### 找不到设备

```bash
# 列出可用设备
hdc list targets

# 确认设备已开启开发者模式
# 设置 → 关于设备 → 版本号 (连续点击 5 次) → 开启开发者模式
# 设置 → 开发者选项 → USB 调试
```

### 元素定位不到

```原因>：
1. 元素未渲染完成
2. 定位表达式错误
3. 元素是 WebView

```python
# 解法 1: 等待元素出现
d(text="按钮", timeout=10).exists()

# 解法 2: 滑动到可见区域
d.swipe(0.5, 0.8, 0.5, 0.4)

# 解法 3: 使用 XPath 结构定位
# 查看 UI 树: https://github.com/codematrixer/ui-viewer

# 解法 4: 截图 debug
d.screenshot("debug.png")
```

### 权限问题

```python
# 点击权限弹窗
d(text="允许").click()
d(text="始终允许").click()

# 系统授权设置 (首次)
d.start_app("com.huawei.systemmanager")
```

### 其他问题

```python
# 开启详细日志
import logging
logging.basicConfig(level=logging.DEBUG)

# 检查设备信息
print(d.device_info)

# 检查当前前台 App
print(d.current_app())
```

## Cheat Sheet

```python
# ========== 初始化 ==========
from hmdriver2.driver import Driver
d = Driver()

# ========== 设备信息 ==========
d.device_info       # 设备信息字典
d.display_size     # (width, height)
d.display_rotation # 0/90/180/270

# ========== 元素定位 ==========
d(text="text")           # 文本定位
d(id="resource_id")      # ID 定位
d(type="Button", index=0) # 类型+索引
d.xpath('//*[@text="x"]') # XPath

# ========== 元素操作 ==========
.click()              # 点击
.long_click(1000)    # 长按(毫秒)
.input_text("text")  # 输入
.clear_text()        # 清空
.exists()           # 存在检查

# ========== 手势操作 ==========
d.swipe(0.5, 0.8, 0.5, 0.4)  # 滑动(归一化)
d.click(0.5, 0.5)             # 点击坐标

# ========== App 管理 ==========
d.start_app("com.package.name")   # 启动
d.stop_app("com.package.name")  # 停止
d.install_app("/path/app.hap") # 安装
d.uninstall_app("com.package")   # 卸载
d.current_app()                # 当前 App

# ========== 设备控制 ==========
d.go_home()          # Home
d.press_back()     # 返回
d.recents()        # 多任务
d.lock()           # 锁屏
d.unlock()         # 解锁
d.volume_up()      # 音量+
d.volume_down()   # 音量-

# ========== 其他 ==========
d.screenshot("path.png")  # 截图
d.toast_message()        # Toast
```

## 参考链接

- GitHub: https://github.com/codematrixer/hmdriver2
- UI Viewer: https://github.com/codematrixer/ui-viewer
- HDC 工具: https://developer.huawei.com/consumer/cn/download/