---
title: 数据采集
createTime: 2026/07/05 00:00:00
permalink: /blog/data-collection-favorites/
tags:
  - GitHub
  - Web Scraping
  - 数据采集
  - 开源工具
  - AI
---

## 速览

| # | 项目 | Stars | 协议 | 一句话定位 |
|---|------|------|------|-----------|
| 1 | [Firecrawl](#1-firecrawl) | 130K+ | AGPL-3.0 | 给个 URL，返回 LLM 友好的结构化数据 |
| 2 | [Crawl4AI](#2-crawl4ai) | 51K+ | Apache-2.0 | GitHub 最快开源爬虫，免 API Key |
| 3 | [Browser-Use](#3-browser-use) | 95K+ | MIT | 像真人一样"点鼠标"的 AI 代理 |
| 4 | [Crawlee](#4-crawlee) | 18K+ | Apache-2.0 | 防封禁的完整爬虫框架 |
| 5 | [Scrapy](#5-scrapy) | 53K+ | BSD-3 | 十多年沉淀的工业级爬虫 |
| 6 | [MarkItDown](#6-markitdown) | 75K+ | MIT | 微软出品的万能转 Markdown 工具 |
| 7 | [Scrapling](#7-scrapling) | 66K+ | BSD-3 | 自适应网站结构变化的隐形爬虫 |
| 8 | [Scrcpy](#8-scrcpy) | 130K+ | Apache-2.0 | 电脑远程控制安卓手机的桥梁 |
| 9 | [AutoScraper](#9-autoscraper) | 6K+ | MIT | 喂一个例子，自动学会爬整站 |
| 10 | [Curl-Impersonate](#10-curl-impersonate) | 14K+ | MIT | 伪装成 Chrome 的 curl 增强版 |

## 选型速查

| 你的场景 | 推荐工具 |
|---------|---------|
| 快速把网站转成 LLM 数据 | Firecrawl / Crawl4AI |
| 需要登录、点按钮才能拿到数据 | Browser-Use |
| 大规模采集，需要防封禁 | Crawlee / Scrapy |
| 网站改版后选择器失效 | Scrapling |
| 把 PDF/Office 转成 Markdown | MarkItDown |
| 移动 App 数据采集 | Scrcpy |
| 想偷懒，不想写选择器 | AutoScraper |
| 只要一个能伪装浏览器的 curl | Curl-Impersonate |

## 1. Firecrawl

**仓库**：[firecrawl/firecrawl](https://github.com/firecrawl/firecrawl)

把任意 URL 丢给它，Firecrawl 会自动爬取每一个页面、渲染 JavaScript、把网页内容清洗成结构化的 Markdown 或 JSON，直接喂给 LLM。

**为什么值得关注：**

- **13 万+ Star**，跻身 GitHub 全站前 100 大仓库
- 半数 AI 创业公司背后的爬虫骨架，**完全开源**
- 内置 JS 渲染、自动翻页、链接发现
- 提供自托管版本，数据不出本地

```bash
# 一行命令把网站转成 Markdown
curl -X POST https://api.firecrawl.dev/v1/scrape \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"url": "https://example.com", "formats": ["markdown"]}'
```

## 2. Crawl4AI

**仓库**：[unclecode/crawl4ai](https://github.com/unclecode/crawl4ai)

GitHub 上排名第一的开源爬虫。把任意网站转成 LLM 就绪的 Markdown，速度比大多数付费服务还快，**无需 API Key、无需账号、无需按页付费**。

**为什么值得关注：**

- 51K+ Star，Apache-2.0 协议
- 作者曾被某付费爬虫 $16 的账单激怒，几天后写出了这个项目
- 完全异步架构，性能拉满
- 支持并发爬取、缓存复用、浏览器模拟

```python
import asyncio
from crawl4ai import AsyncWebCrawler

async def main():
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url="https://example.com")
        print(result.markdown)

asyncio.run(main())
```

## 3. Browser-Use

**仓库**：[browser-use/browser-use](https://github.com/browser-use/browser-use)

让 AI 代理像真人一样操控浏览器——点击、滚动、登录、填表，从未见过的网站中提取数据。它能搞定普通爬虫完全够不着的页面（登录墙、动态表单、复杂交互）。

**为什么值得关注：**

- 95K+ Star，**一年**内从 0 做到这个量级
- 由两位苏黎世 ETH 的研究员开发，MIT 协议
- 与主流 Agent 框架无缝集成（LangChain、AutoGen、CrewAI）
- 支持多浏览器（Chromium、Firefox），自带视觉理解

```python
from langchain_openai import ChatOpenAI
from browser_use import Agent

agent = Agent(
    task="打开 example.com，找到联系页面，把邮箱地址记下来",
    llm=ChatOpenAI(model="gpt-4o"),
)
await agent.run()
```

## 4. Crawlee

**仓库**：[apify/crawlee](https://github.com/apify/crawlee)

一套完整的专业爬虫框架，包含**代理轮换、自动重试、浏览器指纹伪装、队列管理**——专门为大规模、生产级抓取而生。

**为什么值得关注：**

- Apify 是欧洲最大的爬虫平台，Crawlee 是它的"亲儿子"
- 爬虫公司收费数千美元的防封禁技术栈，这里**免费**给到
- 同时支持 Node.js 和 Python
- 内置 HTTP 与无头浏览器两种模式，按需切换

```python
from crawlee.playwright_crawler import PlaywrightCrawler

crawler = PlaywrightCrawler(
    max_requests_per_minute=60,  # 自动限速
)

@crawler.router.default_handler
async def request_handler(context):
    page = context.page
    title = await page.title()
    await context.push_data({"title": title})

await crawler.run(["https://example.com"])
```

## 5. Scrapy

**仓库**：[scrapy/scrapy](https://github.com/scrapy/scrapy)

十多年来默默为数据团队赋能的**工业级爬虫**。能爬百万级页面、提取任何内容、干净导出 CSV/JSON/XML。在大多数付费工具无法触及的规模上经过实战检验。

**为什么值得关注：**

- 53K+ Star，BSD-3 协议
- 成熟度与稳定性无出其右，**始终免费**
- 异步 I/O 架构，单机并发轻松上千
- 插件生态丰富：`scrapy-redis`（分布式）、`scrapy-splash`（JS 渲染）、`scrapy-playwright`（浏览器自动化）

```python
import scrapy

class QuotesSpider(scrapy.Spider):
    name = "quotes"
    start_urls = ["https://quotes.toscrape.com/"]

    def parse(self, response):
        for quote in response.css("div.quote"):
            yield {
                "text": quote.css("span.text::text").get(),
                "author": quote.css("small.author::text").get(),
            }
```

## 6. MarkItDown

**仓库**：[microsoft/markitdown](https://github.com/microsoft/markitdown)

微软出品的**万能格式转换器**：PDF、Word、Excel、PPT、HTML、图片、音频（带元数据）→ 干净的 Markdown。整个 RAG 数据管道公司都在围绕它构建。

**为什么值得关注：**

- 75K+ Star，MIT 协议
- 微软官方维护，质量与持续性有保障
- 对**Office 文档**的支持尤其出色（表格、公式、样式保留）
- 支持 MCP 协议，可直接接入 AI Agent

```python
from markitdown import MarkItDown

md = MarkItDown()
result = md.convert("annual_report.pdf")
print(result.text_content)
```

## 7. Scrapling

**仓库**：[D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling)

一个**隐形爬虫**：当网站改版后，你的选择器失效了？它能自动适配新的 DOM 结构；当 Cloudflare、DataDome 把你拦下？它内置的 StealthyFetcher 能绕过大部分反爬检测。

**为什么值得关注：**

- 66K+ Star，BSD-3 协议
- 防爬供应商当作**付费高级功能**卖的猫鼠游戏，这里免费开源
- 自带 Spider 框架，支持暂停/恢复、并发、代理池
- 提供 MCP Server，可被 AI Agent 直接调用

```python
from scrapling.fetchers import StealthyFetcher

StealthyFetcher.adaptive = True
page = StealthyFetcher.fetch("https://nopecha.com/demo/cloudflare",
                              headless=True, solve_cloudflare=True)
items = page.css(".product", adaptive=True)  # 网站改版后依然能找到
```

## 8. Scrcpy

**仓库**：[Genymobile/scrcpy](https://github.com/Genymobile/scrcpy)

从电脑**远程控制任何安卓手机**——投屏、键鼠操作、文件传输。它不是爬虫，但它是通往**只有 App 没有网站**的纯移动世界的桥梁。

**为什么值得关注：**

- 130K+ Star，Apache-2.0 协议
- 通过 ADB 实现，**无需 Root**
- 延迟极低（30~70ms），1080P 投屏
- 可脚本化，配合 `adb shell input` 能完成移动 App 自动化

```bash
# 投屏到电脑
scrcpy

# 录制手机屏幕
scrcpy --record recording.mp4

# 控制手机执行滑动、点击
adb shell input swipe 500 1000 500 200
```

## 9. AutoScraper

**仓库**：[alirezamika/autoscraper](https://github.com/alirezamika/autoscraper)

**给一个例子，它就自动找出规律爬取网站其余内容**。无需写选择器，无需维护代码——真正的"给我数据"按钮。

**为什么值得关注：**

- 6K+ Star，MIT 协议
- 几行 Python 就能搞定，零学习曲线
- 自动适应页面结构的小幅变化
- 适合快速原型、抓取结构相似的页面（如商品列表、新闻列表）

```python
from autoscraper import AutoScraper

url = "https://example.com/products"
wanted_list = ["iPhone 15", "Samsung Galaxy S24", "Google Pixel 9"]

scraper = AutoScraper()
result = scraper.build(url, wanted_list)

# 之后所有类似页面都能用
for product_url in all_product_urls:
    data = scraper.get_result_similar(product_url)
    print(data)
```

## 10. Curl-Impersonate

**仓库**：[lwthiker/curl-impersonate](https://github.com/lwthiker/curl-impersonate)

curl 的增强版，**完美模拟真实浏览器指纹**。它让 HTTP 请求看起来就像一个装了 Chrome 的真人发起的，反爬系统几乎无法区分。

**为什么值得关注：**

- 14K+ Star，MIT 协议
- 那些**昂贵的爬虫 API**底层暗用的最低级技巧，现在免费给你
- 模拟 TLS 指纹、HTTP/2 指纹、Header 顺序
- 与 curl 命令行兼容，零迁移成本

```bash
# 像 Chrome 120 一样发起请求
curl-impersonate-chrome \
  -H "User-Agent: Mozilla/5.0..." \
  https://protected-site.com
```
