---
title: facebook-wda
tags:
  - iOS
  - 苹果
  - WDA
  - UI automation
createTime: 2026/04/25 20:32:46
permalink: /blog/facebook-wda/
---

## 引言

**facebook-wda** 是 WebDriverAgent (WDA) 的 Python 客户端，由社区维护 (openatx/facebook-wda)，非 Facebook 官方产品。

### 架构

```
┌─────────────┐     HTTP      ┌─────────────┐
│  Python     │ ───────────► │   WDA      │
│  facebook-wda│ ◄─────────── │ (iOS设备)  │
│  Client     │   WebDriver  │            │
└─────────────┘               └─────────────┘
```

- **WDA**: 运行在 iOS 设备上的 WebDriver Server (Xcode 构建)
- **Python Client**: 通过 HTTP 与 WDA 通信，控制 iOS 设备

### vs Appium

| 特性 | facebook-wda | Appium |
|------|--------------|-------|
| 依赖 | 仅需 WDA | 需要 Appium Server |
| 性能 | 直接通信，更快 | 中间层，有开销 |
| 复杂度 | 轻量 | 完整方案 |
| 适用场景 | 纯 iOS 自动化 | 跨平台 (iOS/Android) |

---

## 环境准备

### 安装 facebook-wda

```bash
pip3 install -U facebook-wda
```

验证安装：

```bash
python3 -c "import wda; print(wda.__version__)"
```

### 启动 WDA (两种方式)

#### Option A: Mac + Xcodebuild (传统方式)

```bash
# 1. 克隆 WDA
git clone https://github.com/appium/WebDriverAgent.git
cd WebDriverAgent

# 2. 修改配置 (Bundle ID)
# 编辑 WebDriverAgent.xcodeproj/project.pbxproj
# PRODUCT_BUNDLE_IDENTIFIER = com.facebook.WebDriverAgent -> com.yourteam.WebDriverAgent

# 3. 构建到设备
xcodebuild -project WebDriverAgent.xcodeproj \
  -scheme WebDriverAgentRunner \
  -destinationid=<设备UDID> \
  -destinationTypeplatform=com.apple.platform.ios \
  build test

# 4. 启动 WDA (通过 Xcode)
# Product -> Test -> 运行设备
```

#### Option B: Tidevice (跨平台，无需 Mac)

```bash
# 1. 安装 Tidevice
pip3 install -U tidevice

# 2. 启动 WDA
tidevice wda --port 8100
```

> Tidevice 支持 Linux/Windows，可在非 Mac 环境下启动 WDA。

### 端口转发

```bash
# macOS (通过 usbmuxd)
iproxy 8100 8100

# 或 Tidevice 内置
tidevice pair
tidevice forward 8100 8100
```

### 验证连接

```python
import wda

client = wda.Client()
print(client.status())
```

预期输出：

```
{'state': 'success', 'os': {'name': 'iOS', 'version': '18.0'}, ...}
```

---

## 快速开始 (10 行代码)

```python
import wda

# 1. 连接 WDA
c = wda.Client('http://localhost:8100')

# 2. 获取状态
print(c.status())

# 3. 返回主屏幕
c.home()

# 4. 截图
c.screenshot().save('home.png')

# 5. 启动 App
with c.session('com.apple.Health') as s:
    s.tap(200, 400)  # 点击坐标
    s.screenshot().save('health.png')
```

完整脚本 (`quickstart.py`)：

```python
#!/usr/bin/env python3
import wda

def main():
    c = wda.Client('http://localhost:8100')
    print(c.status())
    c.home()
    c.screenshot().save('home.png')
    
    with c.session('com.apple.Health') as s:
        s.tap(200, 400)
        s.screenshot().save('health.png')
        print(f"orientation: {s.orientation}")

if __name__ == '__main__':
    main()
```

运行：

```bash
python3 quickstart.py
```

---

## 元素定位

### 定位器 API

```python
s = c.session('com.apple.Health')

# by name
s(xpath='//Button[@name="URL"]')

# by id
s(id="URL")

# by className
s(className="Button")

# 组合
s(className="Button", name="URL")
s(name="URL", label="URL")

# 索引
s(index=0)
```

### 常见定位器示例

```python
# 定位按钮
s(xpath='//Button[@name="Done"]')
s(id="Done")

# 定位文本框
s(xpath='//TextField[@name="Search"]')
s(className="TextField")

# 定位列表项
s(xpath='//Cell[@name="Settings"]')

# 定位图片
s(xpath='//Image')
```

### Predicate 定位 (WDA 特性)

```python
# 文本包含
s(name CONTAINS "test")

# 正则匹配
s(name MATCHES "^Start.*")

# 多条件
s(label == "OK" AND enabled == true)
```

### Class Chain 定位 (WDA 特性)

```python
# 子元素
s(xpath='//**/XCUIElementTypeCell/XCUIElementTypeButton[0]')

# 滚动查找
s(xpath='//XCUIElementTypeScrollView//Button[@name="More"]')
```

### 元素操作

```python
s = c.session('com.apple.Health')

# 获取元素
btn = s(id="Done")

# 检查存在
print(btn.exists)

# 点击
btn.tap()

# 输入文本
btn.set_text("hello")

# 获取属性
print(btn.value)
print(btn.label)
print(btn.enabled)

# 滚动到可见
btn.scroll.to_visible()
```

---

## 常用操作

### 点击 (tap)

```python
# 坐标点击
s.tap(200, 400)

# 元素点击
btn = s(id="Done")
btn.tap()

# 按住 + 滑动 (长按)
s.tap_hold(200, 400, 1.0)  # 1秒
```

### 滑动 (swipe)

```python
# 方向滑动
s.swipe_up()
s.swipe_down()
s.swipe_left()
s.swipe_right()

# 自定义滑动
s.swipe(200, 600, 200, 300)  # (x1, y1, x2, y2)
s.swipe(200, 600, 200, 300, 0.5)  # 0.5秒
```

### 文本输入

```python
# 获取输入框并输入
tf = s(className="TextField")
tf.set_text("hello")
tf.get_text()

# 清空
tf.set_text("")  # 手动清空

# 发送按键
s.send_keys("hello\n")  # 带回车
```

### 截图

```python
# 保存文件
c.screenshot('screen.png')
s.screenshot().save('screen.png')

# PIL Image 对象
img = c.screenshot()
print(img.size)
```

### Session 管理

```python
c = wda.Client()

# 启动 App
with c.session('com.apple.Health') as s:
    print(s.window_size)
    print(s.orientation)

# 切换 App
s.close()  # 关闭当前
with c.session('com.apple.AppStore') as s:
    ...

# 后台运行
c.background()
c.activate()  # 回到前台
```

### Alert 处理

```python
s = c.session('com.test.app')

# 弹窗检测
print(s.alert.exists)

# 接受
s.alert.accept()

# 拒绝
s.alert.dismiss()

# 获取文本
print(s.alert.text)
```

### 设备信息

```python
c = wda.Client()

# 状态
print(c.status())

# 设备信息
info = c.device_info
print(info['udid'])
print(info['model'])
print(info['name'])
print(info['iosVersion'])
```

---

## 实战场景

### 场景: 启动健康App → 等待 → 点击搜索 → 截图

```python
#!/usr/bin/env python3
import wda
import time

def main():
    # 连接 WDA
    c = wda.Client('http://localhost:8100')
    print(f"Status: {c.status()['os']['name']} {c.status()['os']['version']}")
    
    # 启动健康 App
    with c.session('com.apple.Health') as s:
        # 等待加载
        time.sleep(2)
        
        # 截图初始状态
        s.screenshot().save('health_home.png')
        
        # 查找并点击搜索按钮 (如果有)
        try:
            search_btn = s(id="Search", timeout=5.0)
            search_btn.tap()
            print("Clicked Search")
            time.sleep(1)
            s.screenshot().save('health_search.png')
        except Exception as e:
            print(f"Search button not found: {e}")
        
        # 滑动查找
        s.swipe_up()
        s.screenshot().save('health_scrolled.png')
        
    print("Done!")

if __name__ == '__main__':
    main()
```

### 场景: 批量操作多个 App

```python
#!/usr/bin/env python3
import wda
import time

APPS = [
    ('com.apple.Health', '健康'),
    ('com.apple.AppStore', 'App Store'),
    ('com.apple.Music', '音乐'),
]

def main():
    c = wda.Client()
    
    for bundle_id, name in APPS:
        try:
            with c.session(bundle_id) as s:
                time.sleep(1)
                s.screenshot().save(f'{name}.png')
                print(f"Screenshot: {name}.png")
        except Exception as e:
            print(f"Failed: {bundle_id} - {e}")

if __name__ == '__main__':
    main()
```

### 场景: Page Object 模式

```python
import wda
import time

class HealthPage:
    def __init__(self, session):
        self.s = session
    
    @property
    def search_box(self):
        return self.s(xpath='//TextField[@name="Search"]')
    
    def search(self, keyword):
        self.search_box.set_text(keyword)
        time.sleep(0.5)
    
    def take_screenshot(self, name):
        self.s.screenshot().save(f'{name}.png')

class HealthApp:
    def __init__(self, client):
        self.client = client
        self.session = None
    
    def launch(self):
        self.session = self.client.session('com.apple.Health')
        return HealthPage(self.session)
    
    def close(self):
        if self.session:
            self.client.close()
            self.session = None

def main():
    c = wda.Client()
    
    app = HealthApp(c)
    page = app.launch()
    page.search('步数')
    page.take_screenshot('health_search.png')
    app.close()

if __name__ == '__main__':
    main()
```

---

## 排错指南

### WDA 启动失败

```bash
# 检查设备连接
tidevice list

# 检查端口
lsof -i :8100

# 重启 WDA
tidevice wda -k
tidevice wda --port 8100
```

### 设备不被识别

```bash
# macOS
tidevice list

# 查看设备 UDID
tidevice list -v
```

### 端口转发问题

```bash
# 检查 iproxy
ps aux | grep iproxy

# 重启转发
iproxy -k 8100
iproxy 8100 8100
```

### Bundle ID 冲突

```python
# 查询已安装 App
tidevice applist

# 强制停止
tidevice kill <bundle_id>
```

### iOS 17+ 需要 tunnel

```bash
# 安装新版本 WDA
# 或使用 Tidevice
tidevice wda -B <new_bundle_id>
```

### 常见错误

| 错误 | 解决方案 |
|------|----------|
| `ConnectionRefusedError` | 检查 WDA 是否启动，端口是否正确 |
| `ElementNotFoundError` | 增加 timeout 或检查定位器 |
| `SessionNotCreatedError` | Bundle ID 错误或 App 未安装 |
| `StaleElementReferenceError` | 页面已刷新，重新获取元素 |

---

## Cheat Sheet

```python
# ===== 连接 =====
import wda
c = wda.Client('http://localhost:8100')
c = wda.Client()  # 默认 localhost:8100

# ===== 状态 =====
print(c.status())        # {'state': 'success', ...}
c.home()               # 返回主屏幕

# ===== Session =====
with c.session('com.apple.Health') as s:
    # 窗口
    print(s.window_size)  # (width, height)
    print(s.orientation)  # 'PORTRAIT' | 'LANDSCAPE'
    
    # 截图
    s.screenshot().save('screen.png')
    
    # 点击
    s.tap(200, 400)           # 坐标
    s.tap_hold(200, 400, 1.0) # 长按
    
    # 滑动
    s.swipe_up()
    s.swipe_down()
    s.swipe_left()
    s.swipe_right()
    s.swipe(200, 600, 200, 300, 0.5)  # 自定义

# ===== 元素定位 =====
s(id="Done")                     # by id
s(name="Done")                   # by name
s(className="Button")             # by className
s(xpath='//Button[@name="URL"]') # by xpath

# ===== 元素操作 =====
btn = s(id="Done")
btn.tap()
btn.set_text("hello")
print(btn.label)
print(btn.exists)

# ===== Alert =====
s.alert.accept()
s.alert.dismiss()
print(s.alert.text)

# ===== 设备信息 =====
print(c.device_info['udid'])
print(c.device_info['model'])

# ===== App 控制 =====
with c.session('com.apple.Health') as s:
    ...

c.background()  # 后台
c.activate()   # 前台
```

---

## 参考链接

- [facebook-wda GitHub](https://github.com/openatx/facebook-wda)
- [WebDriverAgent GitHub](https://github.com/appium/WebDriverAgent)
- [Tidevice GitHub](https://github.com/alibaba/tidevice)
- [WDA 官方文档](https://appium.github.io/appium-docs/docs/en/drivers/ios-xcuitest/)