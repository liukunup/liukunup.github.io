---
title: uiautomator2
tags:
  - Android
  - 安卓
  - UI automation
createTime: 2026/04/25 20:32:46
permalink: /blog/uiautomator2/
---

## 引言

**uiautomator2** 是 Python 语言编写的 Android UI 自动化框架,基于 Google uiautomator 设计。

### 核心架构

```
┌─────────────────────────────────────────────┐
│          Host (Python)                     │
│  ┌─────────────────────────────────────┐  │
│  │      uiautomator2 Python Client      │  │
│  └─────────────────────────────────────┘  │
│                    │                       │
│           7912/tcp                        │
│                    ▼                       │
┌─────────────────────────────────────────────┐
│         Device (Android)                    │
│  ┌─────────────────────────────────────┐   │
│  │          ATX Agent                   │   │
│  │             │                       │   │
│  │    uiautomator/uiautomator2          │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 为什么选择 uiautomator2

- 无需 Root 权限
- 完整的 XPath 支持
- openatx 生态 (atx-agent, weditor)
- 纯 Python 实现,易于扩展

## 环境准备

### 1. 安装 Python 库

```bash
pip install uiautomator2
```

### 2. 确保 ADB 连接正常

```bash
# 检查设备连接
adb devices

# 输出示例
# List of devices attached
# Q5S5T19611004599    device
```

### 3. 安装 ATX Agent

首次连接时,ATX Agent 会自动安装到设备:

```python
import uiautomator2 as u2

d = u2.connect('Q5S5T19611004599')
# 首次运行会自动安装 atx-agent
```

### 4. 验证安装

```python
import uiautomator2 as u2

# 连接设备
d = u2.connect()

# 查看版本
print(d.info)
# {'currentPackageName': '...', 'screenOn': True, ...}
```

## 快速开始

10 行代码完成连接、截图、定位、点击:

```python
import uiautomator2 as u2

# 1. 连接设备
d = u2.connect('Q5S5T19611004599')  # 替换为你的设备序列号

# 2. 截图
d.screenshot('screen.jpg')

# 3. 等待元素出现
d.xpath("立即开户").wait(timeout=10)

# 4. 点击元素
d.xpath("立即开户").click()

# 5. 获取设备信息
print(d.info['currentPackageName'])
```

## 元素定位

### 基础定位方式

| 定位方式 | 代码示例 |
|---------|---------|
| text 文本 | `d(text="Settings").click()` |
| resource-id | `d(resourceId="com.example:id/btn").click()` |
| className | `d(className="android.widget.Button").click()` |
| 组合定位 | `d(className="android.widget.Button", text="OK").click()` |

### XPath 定位

XPath 是最强大的定位方式:

```python
# 根据文本定位
d.xpath('//*[@text="我的"]').click()

# 根据 resource-id 定位
d.xpath('//*[@resource-id="tv.danmaku.bili:id/fans_count"]').click()

# 根据 className 定位
d.xpath('//android.widget.Button').click()

# 根据多个属性
d.xpath('//android.widget.Button[@text="��定"]').click()

# 获取元素文本
text = d.xpath('//*[@resource-id="tv.danmaku.bili:id/fans_count"]').text
```

### 元素存在性检查

```python
# 检查元素是否存在
exists = d(text="Settings").exists
print(exists)  # True 或 False

# 检查 XPath 元素是否存在
exists = d.xpath('//*[@text="我的"]').exists
print(exists)

# 等待元素出现并返回布尔值
d(text="Settings").wait(timeout=5)  # 返回元素或 None
```

### Selector 对象操作

```python
# 创建 Selector 对象
s = d(text="Settings")

# 判断存在
print(s.exists)

# 等待元素
s.wait()

# 点击
s.click()

# 获取文本
text = s.get_text()

# 设置文本
s.set_text("hello")
```

## 常用操作

### 点击与滑动

```python
import uiautomator2 as u2

d = u2.connect()

# 点击坐标
d.click(100, 200)  # 点击 (100, 200)

# 滑动
d.swipe(100, 500, 100, 200)  # 从 (100,500) 滑到 (100,200)

# 滑动辅助方法
d.swipe_up()      # 向上滑
d.swipe_down()   # 向下滑
d.swipe_left()   # 向左滑
d.swipe_right()  # 向右滑

# 双击
d.double_click(100, 200)

# 长按
d.long_click(100, 200, duration=1.0)
```

### 按键操作

```python
import uiautomator2 as u2

d = u2.connect()

# 模拟按键
d.press("home")       # Home 键
d.press("back")      # 返回键
d.press("power")     # 电源键
d.press("volume_up")  # 音量上
d.press("volume_down")  # 音量下
d.press("enter")     # 回车键
d.press("delete")    # 删除键
```

### 文本输入

```python
import uiautomator2 as u2

d = u2.connect()

# 获取文本
text = d(className="android.widget.EditText").get_text()
print(text)

# 输入文本
d(className="android.widget.EditText").set_text("hello world")

# 清空并输入
d(className="android.widget.EditText").clear_text()
d(className="android.widget.EditText").set_text("new text")
```

### 截图

```python
import uiautomator2 as u2

d = u2.connect()

# 保存截图到文件
d.screenshot('screen.jpg')

# 获取截图对象
img = d.screenshot()
img.save('screen.png')
img.save('screen.jpg', quality=80)
```

### 应用管理

```python
import uiautomator2 as u2

d = u2.connect()

# 启动应用
d.app_start('tv.danmaku.bili')

# 启动应用(先停止原有进程)
d.app_start('tv.danmaku.bili', stop=True)

# 停止应用
d.app_stop('tv.danmaku.bili')

# 等待 Activity
d.wait_activity('.MainActivityV2')
d.wait_activity('.MainActivityV2', timeout=10)

# 睡眠
d.sleep(5)
```

### 等待操作

```python
import uiautomator2 as u2

d = u2.connect()

# 等待元素出现 (默认 10 秒)
d(text="Settings").wait()

# 自定义超时
d(text="Settings").wait(timeout=30)

# 等待 Activity
d.wait_activity('.MainActivityV2')
d.wait_activity('.MainActivityV2', timeout=10)

# 等待空闲
d.wait_idle()
```

## 实战场景

完整可运行脚本:启动 Bilibili → 等待加载 → 查看粉丝数:

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
uiautomator2 实战示例
目标: 启动Bilibili → 等待首页 → 点击"我的" → 读取粉丝数
"""

import uiautomator2 as u2
import time

# 设备序列号 (替换为你的设备)
SERIAL = 'Q5S5T19611004599'

def main():
    # 连接设备
    d = u2.connect(SERIAL)
    print(f"已连接设备: {d.info['serialNo']}")

    # 确保应用已停止
    d.app_stop('tv.danmaku.bili')
    time.sleep(1)

    # 启动 Bilibili
    print("启动 Bilibili...")
    d.app_start('tv.danmaku.bili', stop=True)

    # 等待应用启动
    d.wait_activity('tv.danmaku.bili.MainActivityV2')
    print("应��已启动")

    # 等待页面加载 (等待"首页"tab出现)
    d.xpath('//*[@text="首页"]').wait(timeout=15)
    print("首页已加载")

    # 滑动找到"我的"tab (如果需要)
    d.swipe_up()
    time.sleep(1)

    # 点击"我的"tab
    print("点击'我的'tab...")
    d.xpath('//*[@text="我的"]').click()
    time.sleep(2)

    # 等待页面加载
    d.xpath('//*[@text="粉丝"]').wait(timeout=10)

    # 读取粉丝数
    fans_text = d.xpath('//*[@resource-id="tv.danmaku.bili:id/fans_count"]').text
    print(f"粉丝数: {fans_text}")

    # 截图保存
    d.screenshot('bilibili_profile.jpg')
    print("截图已保存: bilibili_profile.jpg")

    # 返回
    d.press("back")
    time.sleep(1)

    # 停止应用
    d.app_stop('tv.danmaku.bili')
    print("完成")

if __name__ == '__main__':
    main()
```

运行:

```bash
python bilibili_demo.py
```

## 排错指南

### ADB 设备找不到

```bash
# 检查 ADB 服务状态
adb devices

# 重启 ADB 服务
adb kill-server
adb start-server

# 重新插拔设备,开启USB调试
```

### ATX Agent 连接失败

```python
# 手动重新安装 ATX Agent
import uiautomator2 as u2
d = u2.connect()
d.healthcheck()
```

### 元素找不到/超时

```python
# 1. 增加等待时间
d.xpath('//*[@text="Settings"]').wait(timeout=30)

# 2. 先截图为证
d.screenshot('debug.jpg')

# 3. 查看当前所有文本
d.xpath('//*').all()
```

### 无障碍服务未开启

```python
# 打开手机设置 → 无障碍 → 找到 uiautomator2 / ATX 开启
# 或者使用代码跳转
d.app_start('com.android.settings')
# 然后手动开启无障碍服务
```

### 常见错误信息

```
# atx-agent not installed
# 需要调用 connect() 自动安装

# element not found
# 元素定位超时,检查 XPath 是否正确

# cannot find device
# 检查 adb devices 是否能看到设备
```

## Cheat Sheet

### 连接与初始化

| 操作 | 代码 |
|------|------|
| 连接默认设备 | `d = u2.connect()` |
| 按序列号连接 | `d = u2.connect('SERIAL')` |
| 设备信息 | `d.info` |

### 元素定位

| 操作 | 代码 |
|------|------|
| 按文本 | `d(text="Settings")` |
| 按ID | `d(resourceId="com.example:id/btn")` |
| 按类名 | `d(className="android.widget.Button")` |
| XPath | `d.xpath('//*[@text="Settings"]')` |
| 组合定位 | `d(text="OK", className="android.widget.Button")` |

### 元素操作

| 操作 | 代码 |
|------|------|
| 点击 | `.click()` |
| 获取文本 | `.get_text()` |
| 设置文本 | `.set_text("text")` |
| 存在检查 | `.exists` |
| 等待出现 | `.wait()` |

### 滑动与按键

| 操作 | 代码 |
|------|------|
| 点击坐标 | `d.click(x, y)` |
| 滑动 | `d.swipe(x1, y1, x2, y2)` |
| 向上滑 | `d.swipe_up()` |
| 向下滑 | `d.swipe_down()` |
| Home键 | `d.press("home")` |
| 返回键 | `d.press("back")` |

### 应用管理

| 操作 | 代码 |
|------|------|
| 启动 | `d.app_start('pkg.name')` |
| 停止 | `d.app_stop('pkg.name')` |
| 等待Activity | `d.wait_activity('.ActivityName')` |
| 睡眠 | `d.sleep(5)` |

### 截图与调试

| 操作 | 代码 |
|------|------|
| 截图 | `d.screenshot('screen.jpg')` |
| 截图对象 | `d.screenshot()` |

## 参考链接

- GitHub: [openatx/uiautomator2](https://github.com/openatx/uiautomator2)
- ATX Agent: [atx-agent](https://github.com/openatx/atx-agent)
- WEditor: [weditor](https://github.com/openatx/weditor)
- 官方文档: [Quick Reference](https://github.com/openatx/uiautomator2/blob/master/QUICK_REFERENCE.md)