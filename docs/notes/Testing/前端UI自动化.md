---
title: 前端UI自动化
createTime: 2026/06/16 02:00:00
permalink: /notes/testing/frontend-ui-automation/
---

## 主流框架对比

| 框架 | 语言 | 浏览器支持 | 速度 | 定位器策略 | 适用场景 |
|------|------|-----------|------|-----------|---------|
| Playwright | JS/TS/Python/Java/C# | Chromium + Firefox + WebKit | ⚡ 快 | CSS / XPath / Text / Role | 跨浏览器 E2E |
| Cypress | JS/TS | Chromium 系 | 🚀 快 | CSS / Text / Data-* | 组件测试 + E2E |
| Selenium WebDriver | 多语言 | 所有主流 | 🐢 中 | CSS / XPath | 传统企业项目 |

> **推荐选型**：新项目首选 Playwright，Cypress 适合 React/Vue 组件测试，Selenium 仅保留存量项目。

---

## Playwright

微软出品，API 简洁、自动等待、支持多浏览器、支持移动端 WebView 模拟。

### 安装

```bash
npm init playwright@latest
# 或 pip install pytest-playwright  &&  playwright install
```

### 核心用法

```python
import re
from playwright.sync_api import Page, expect

def test_homepage(page: Page):
    page.goto("https://example.com")
    expect(page).to_have_title(re.compile(r"Example"))

    # 点击链接
    page.get_by_role("link", name="More info").click()

    # 填写表单
    page.get_by_label("Username").fill("admin")
    page.get_by_label("Password").fill("pass123")
    page.get_by_role("button", name="Login").click()

    # 断言
    expect(page.get_by_text("Welcome")).to_be_visible()
```

### 核心定位器

| 定位器 | 示例 | 说明 |
|--------|------|------|
| `get_by_role` | `get_by_role("button", name="Submit")` | 按 ARIA 角色（推荐） |
| `get_by_label` | `get_by_label("Email")` | 关联的 label 元素 |
| `get_by_placeholder` | `get_by_placeholder("请输入密码")` | placeholder 属性 |
| `get_by_text` | `get_by_text("Hello")` | 文本内容 |
| `get_by_test_id` | `get_by_test_id("submit-btn")` | data-testid 属性 |
| `get_by_title` | `get_by_title("关闭")` | title 属性 |
| `locator` | `page.locator(".class >> text=OK")` | CSS + 链式组合 |

### 自动等待

Playwright 大部分操作自带自动等待，无需显式 sleep：

```python
# 自动等待到按钮可见 → 可点击 → 稳定 → 点击
page.get_by_role("button", name="Submit").click()

# 显式等待
page.wait_for_selector(".result")
page.wait_for_load_state("networkidle")
```

### Codegen — 录制脚本

```bash
npx playwright codegen https://example.com
```

会打开浏览器并实时生成 Playwright 代码。

### Trace Viewer — 调试

```bash
npx playwright show-trace trace.zip
```

回放测试每一步的 DOM 快照、网络请求、控制台日志。

### 移动端 WebView 测试

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    iphone = p.devices["iPhone 14 Pro Max"]
    browser = p.chromium.launch()
    context = browser.new_context(**iphone)
    page = context.new_page()
    page.goto("https://example.com")
```

### 测试夹具 (Fixtures)

```python
import pytest

@pytest.fixture(scope="function")
def logged_in_page(page: Page):
    page.goto("/login")
    page.get_by_label("Username").fill("admin")
    page.get_by_label("Password").fill("pass123")
    page.get_by_role("button", name="Login").click()
    yield page  # 每个测试获得已登录的 page

def test_dashboard(logged_in_page):
    expect(logged_in_page.get_by_text("Dashboard")).to_be_visible()
```

### 高级特性

```python
# API 请求（在测试中造数据）
response = page.request.get("/api/users")
data = response.json()

# 拦截和修改网络请求
page.route("**/api/**", lambda route: route.continue_())
page.route("**/analytics", lambda route: route.abort())

# 多页面/多标签
page1 = context.new_page()
page2 = context.new_page()

# 截图和视频
page.screenshot(path="screenshot.png")
context.tracing.start(screenshots=True, snapshots=True)
# ... 测试执行 ...
context.tracing.stop(path="trace.zip")
```

### 浏览器上下文隔离

```python
# 每个 context 相当于一个独立的浏览器实例（隔离 Cookie/Storage）
context1 = browser.new_context(storage_state="auth.json")
context2 = browser.new_context()
```

### Playwright vs Cypress vs Selenium

| 对比项 | Playwright | Cypress | Selenium |
|--------|-----------|---------|----------|
| 浏览器支持 | Chromium + Firefox + WebKit | 仅 Chromium | Chromium + Firefox + Safari + IE |
| 语言 | JS/TS / Python / Java / C# | 仅 JS/TS | JS / Python / Java / C# / Ruby / PHP |
| 自动等待 | ✅ 内置 | ✅ 内置 | ❌ 需手动 |
| 网络拦截 | ✅ 丰富 | ✅ 较丰富 | ❌ 需代理 |
| 多标签/多页面 | ✅ | ❌ | ✅ |
| iframe 支持 | ✅ | ✅ | ✅ |
| Shadow DOM | ✅ | ❌ | ⚠️ 有限 |
| 手机模拟 | ✅ | ❌ | ✅ |
| 并行执行 | ✅ 内置 worker | ⚠️ 需商业版 | ✅ |
| 录制脚本 | ✅ Codegen | ✅ 开箱 | ✅ IDE |
| 社区生态 | 增长中 | 较成熟 | 最成熟 |

---

## 参考资料

- [Playwright 官方文档](https://playwright.dev/)
- [Playwright Python](https://playwright.dev/python/)
- [Cypress 文档](https://docs.cypress.io/)
- [Selenium 文档](https://www.selenium.dev/documentation/)
