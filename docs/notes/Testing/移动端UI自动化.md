---
title: 移动端UI自动化
createTime: 2026/06/16 02:00:00
permalink: /notes/testing/mobile-ui-automation/
---

## 各平台方案总览

| 平台 | 框架 | 语言 | 架构 | 适用场景 |
|------|------|------|------|---------|
| Android | uiautomator2 | Python | ATX Agent → uiautomator | 安卓 UI 自动化 |
| Android | espresso | Java/Kotlin | 集成到 APK | 白盒 UI 测试 |
| Android | UI Automator | Java | Google 官方 | 跨应用测试 |
| iOS | WebDriverAgent (WDA) | Python (facebook-wda) | XCTest → HTTP | iOS UI 自动化 |
| iOS | XCUITest | Swift/ObjC | Apple 官方 | 白盒 UI 测试 |
| HarmonyOS | hmdriver2 | Python | HDC 通信 | 鸿蒙 UI 自动化 |
| 跨平台 | Appium | 多语言 | WebDriver 协议 | 统一脚本覆盖多平台 |
| 跨平台 | Maestro | YAML | 声明式 | 轻量移动端 E2E |

> **推荐选型**：原生测试用 uiautomator2 + WDA，跨平台选 Appium，快速验证选 Maestro。

---

## Android: uiautomator2

### 架构

```
Host (Python)
  └── uiautomator2 Client ──7912/tcp──→ Device
                                          └── ATX Agent
                                                └── uiautomator2 server
                                                      └── Android UI
```

### 安装

```bash
pip install uiautomator2
python -m uiautomator2 init   # 在设备上安装 atx-agent
```

### 核心用法

```python
import uiautomator2 as u2

# 连接设备
d = u2.connect()              # USB 连接 (自动识别)
d = u2.connect("192.168.1.2") # WiFi 连接

# 基础操作
d.app_start("com.example.app")
d.app_stop("com.example.app")
d.screen_on()
d.screen_off()

# 点击
d(text="Login").click()
d(resourceId="com.example:id/btn_login").click()
d.xpath("//android.widget.Button[@text='Login']").click()

# 输入
d(text="Username").set_text("admin")
d(text="Password").set_text("pass123")

# 滑动
d.swipe(500, 1000, 500, 100)          # 坐标滑动
d(scrollable=True).scroll.to(text="Submit")  # 滚动到目标元素

# 断言
assert d(text="Welcome back").exists
assert d(text="Error").wait_gone(timeout=5)
```

### 元素定位

| 定位方式 | 示例 | 优先级 |
|---------|------|--------|
| `text` | `d(text="Login")` | ⭐ 首选 |
| `resourceId` | `d(resourceId="com.example:id/btn")` | ⭐ 首选 |
| `className` | `d(className="android.widget.Button")` | ⚠️ 不唯一 |
| `xpath` | `d.xpath("//*[@text='Login']")` | 🔧 兜底 |
| `description` | `d(description="login button")` | 次选 |
| `selector` | `d(text="Login", className="Button")` | 组合过滤 |

### 等待策略

```python
# 等待元素出现
d(text="Login").wait(timeout=10)
d(text="Loading").wait_gone(timeout=5)

# 全局隐式等待
d.implicitly_wait = 10
```

### 常用工具

```bash
# weditor — 可视化元素查看器
pip install weditor
python -m weditor    # 浏览器打开 http://localhost:17310

# 抓取当前界面 XML
d.dump_hierarchy("ui.xml")
```

### 进阶

```python
# 截图对比
img = d.screenshot()
img.save("screen.png")

# 获取 Toast
toast = d.toast.get_message(5.0)

# 执行 shell 命令
d.shell("pm list packages")

# 监视器（自动处理弹窗）
d.watcher.when("允许").click()
d.watcher.start()
```

---

## iOS: WebDriverAgent (WDA)

facebook-wda 是 Python 语言写的 WDA 客户端。

### 架构

```
Host (Python)
  └── facebook-wda Client ──8100/tcp──→ Device
                                          └── WebDriverAgent (XCTest)
                                                └── iOS UI
```

### 安装

```bash
pip install facebook-wda
```

详细的 WDA 编译打包和 go-ios 多设备管理见博客 [跨平台 iOS 真机自动化测试指南](/blog/aqwnprye/)。

### 核心用法

```python
import wda

# 连接设备
c = wda.Client("http://localhost:8100")

# 基础操作
c.home()
c.activate_app("com.example.app")
c.terminate_app("com.example.app")

# 屏幕状态
print(c.status())
print(c.window_size())

# 点击
c(text="Login").tap()
c(xpath="//XCUIElementTypeButton[@name='Login']").tap()

# 输入
c(text="Username").set_text("admin")
c(text="Password").set_text("pass123")

# 滑动
c.swipe(200, 500, 200, 100)
c(text="List").scroll(direction="down")

# 断言
assert c(text="Welcome").exists
```

### 元素定位

| 定位方式 | 示例 |
|---------|------|
| `className` | `c(className="XCUIElementTypeButton")` |
| `name` (accessibility id) | `c(name="login_button")` |
| `label` | `c(label="Login")` |
| `value` | `c(value="Hello")` |
| `xpath` | `c(xpath="//XCUIElementTypeButton[@name='Login']")` |
| `predicate` | `c(predicate="label BEGINSWITH 'Log'")` |

### 等待策略

```python
# 等待元素出现 (默认 timeout 30s)
c(text="Login").wait(timeout=10)
c(text="Loading").wait_gone(timeout=5)
```

---

## HarmonyOS: hmdriver2

### 安装

```bash
pip install hmdriver2
```

### 核心用法

```python
from hmdriver2.driver import Driver

d = Driver("1234567890abcdef")  # 设备序列号

d.app_start("com.example.app")
d.app_stop("com.example.app")

d(text="登录").click()
d(text="用户名").set_text("admin")
d(text="密码").set_text("pass123")

assert d(text="首页").exists
```

---

## 跨平台: Appium

Appium 基于 WebDriver 协议，统一了 Android / iOS / HarmonyOS 的自动化接口。

### 优势

- 同一套 WebDriver API 操作多平台
- 语言无关（Python / Java / JS / C# 等）
- 不需要修改应用代码

```python
from appium import webdriver
from appium.options.android import UiAutomator2Options

options = UiAutomator2Options()
options.platform_name = "Android"
options.device_name = "emulator-5554"
options.app_package = "com.example.app"
options.app_activity = ".MainActivity"

driver = webdriver.Remote("http://localhost:4723", options=options)

driver.find_element(by=AppiumBy.ID, value="com.example:id/btn_login").click()
driver.quit()
```

### Appium vs 原生方案

| 对比项 | uiautomator2 / WDA | Appium |
|--------|-------------------|--------|
| 上手成本 | 低 | 中（需安装 Appium Server） |
| 执行速度 | 快 | 中（多一层协议转换） |
| 跨平台统一 | ❌ | ✅ |
| 多语言支持 | Python 为主 | 多语言 |
| Touch ID / Face ID | ❌ | ✅ |
| 生态成熟度 | 中 | 高 |

---

## 跨平台: Maestro

### 声明式 YAML 测试

```yaml
appId: com.example.app
---
- launchApp
- tapOn: "Login"
- inputText: "admin"
  into: "Username"
- inputText: "pass123"
  into: "Password"
- tapOn: "Submit"
- assertVisible: "Welcome"
```

Maestro 使用**纯 YAML** 编写，无需编程语言，适合快速验证和移动端 E2E。

---

## 选型建议

| 场景 | 推荐方案 |
|------|---------|
| Android 原生测试 | uiautomator2 |
| iOS 原生测试 | facebook-wda |
| HarmonyOS 测试 | hmdriver2 |
| 跨平台测试 | Appium |
| 快速验证 / 非技术人员 | Maestro |
| 白盒 UI 测试 | espresso (Android) / XCUITest (iOS) |

---

## 参考资料

- [uiautomator2](https://github.com/openatx/uiautomator2)
- [facebook-wda](https://github.com/openatx/facebook-wda)
- [hmdriver2](https://github.com/heroaku/hmdriver2)
- [Appium](https://appium.io/)
- [Maestro](https://maestro.mobile.dev/)
- [WebDriverAgent](https://github.com/appium/WebDriverAgent)
