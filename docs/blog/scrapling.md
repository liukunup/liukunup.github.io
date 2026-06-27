---
title: Scrapling - 自适应 Web Scraping 框架
createTime: 2026/06/28 00:00:00
permalink: /blog/scrapling/
tags:
  - Python
  - Web Scraping
  - 反爬虫
  - Open Source
  - Spider
---

https://github.com/D4Vinci/Scrapling

## 概述

[Scrapling](https://github.com/D4Vinci/Scrapling) 是一个自适应 Web Scraping 框架，能处理从单个请求到大规模爬取的一切需求。

它的解析器能够从网站变化中学习，并在页面更新时自动重新定位您的元素。它的 Fetcher 能够开箱即用地绕过 Cloudflare Turnstile 等反机器人系统。它的 Spider 框架让您可以扩展到并发、多 Session 爬取，支持暂停/恢复和自动 Proxy 轮换——只需几行 Python 代码。一个库，零妥协。

**特点：66K+ Stars · Python · 高速解析 · MCP 集成**

```python
from scrapling.fetchers import Fetcher, AsyncFetcher, StealthyFetcher, DynamicFetcher
StealthyFetcher.adaptive = True
p = StealthyFetcher.fetch('https://example.com', headless=True, network_idle=True)  # 隐秘地获取网站！
products = p.css('.product', auto_save=True)                                        # 抓取在网站设计变更后仍能存活的数据！
products = p.css('.product', adaptive=True)                                         # 之后，如果网站结构改变，传递 `adaptive=True` 来找到它们！
```

或扩展为完整爬取：

```python
from scrapling.spiders import Spider, Response

class MySpider(Spider):
  name = "demo"
  start_urls = ["https://example.com/"]

  async def parse(self, response: Response):
      for item in response.css('.product'):
          yield {"title": item.css('h2::text').get()}

MySpider().start()
```

## 主要特性

### Spider - 完整的爬取框架

- 🕷️ **类 Scrapy 的 Spider API**：使用 `start_urls`、async `parse` callback 和 `Request`/`Response` 对象定义 Spider。
- ⚡ **并发爬取**：可配置的并发限制、按域名节流和下载延迟。
- 🔄 **多 Session 支持**：统一接口，支持 HTTP 请求和隐秘无头浏览器在同一个 Spider 中使用——通过 ID 将请求路由到不同的 Session。
- 💾 **暂停与恢复**：基于 Checkpoint 的爬取持久化。按 `Ctrl+C` 优雅关闭；重启后从上次停止的地方继续。
- 📡 **Streaming 模式**：通过 `async for item in spider.stream()` 以实时统计 Streaming 抓取的数据——非常适合 UI、管道和长时间运行的爬取。
- 🛡️ **被阻止请求检测**：自动检测并重试被阻止的请求，支持自定义逻辑。
- 🤖 **robots.txt 合规**：可选的 `robots_txt_obey` 标志，支持 `Disallow`、`Crawl-delay` 和 `Request-rate` 指令，并按域名缓存。
- 🧪 **开发模式**：首次运行时将响应缓存到磁盘，后续运行时直接回放——在不重新请求目标服务器的情况下迭代你的 `parse()` 逻辑。
- 📦 **内置导出**：通过钩子和您自己的管道导出结果，或使用内置的 JSON/JSONL，分别通过 `result.items.to_json()` / `result.items.to_jsonl()`。

### 支持 Session 的高级网站获取

- **HTTP 请求**：使用 `Fetcher` 类进行快速和隐秘的 HTTP 请求，可以模拟浏览器的 TLS fingerprint、标头并使用 HTTP/3。
- **动态加载**：通过 `DynamicFetcher` 类使用完整的浏览器自动化获取动态网站，支持 Playwright 的 Chromium 和 Google Chrome。
- **反机器人绕过**：使用 `StealthyFetcher` 的高级隐秘功能和 fingerprint 伪装，可以轻松自动绕过所有类型的 Cloudflare Turnstile / Interstitial。
- **Session 管理**：使用 `FetcherSession`、`StealthySession` 和 `DynamicSession` 类实现持久化 Session 支持，用于跨请求的 cookie 和状态管理。
- **Proxy 轮换**：内置 `ProxyRotator`，支持轮询或自定义策略，适用于所有 Session 类型，并支持按请求覆盖 Proxy。
- **域名和广告屏蔽**：在基于浏览器的 Fetcher 中屏蔽对特定域名（及其子域名）的请求，或启用内置广告屏蔽（约 3,500 个已知广告/追踪域名）。
- **DNS 泄漏防护**：可选的 DNS-over-HTTPS 支持，通过 Cloudflare 的 DoH 路由 DNS 查询，防止使用代理时的 DNS 泄漏。
- **Async 支持**：所有 Fetcher 和专用 async Session 类的完整 async 支持。

### 自适应抓取和 AI 集成

- 🔄 **智能元素跟踪**：使用智能相似性算法在网站更改后重新定位元素。
- 🎯 **智能灵活选择**：CSS 选择器、XPath 选择器、基于过滤器的搜索、文本搜索、正则表达式搜索等。
- 🔍 **查找相似元素**：自动定位与已找到元素相似的元素。
- 🤖 **与 AI 一起使用的 MCP 服务器**：内置 MCP 服务器用于 AI 辅助 Web Scraping 和数据提取。MCP 服务器具有强大的自定义功能，利用 Scrapling 在将内容传递给 AI（Claude / Cursor 等）之前提取目标内容，从而加快操作并通过最小化 token 使用来降低成本。

### 高性能和经过实战测试的架构

- 🚀 **闪电般快速**：优化性能超越大多数 Python 抓取库。
- 🔋 **内存高效**：优化的数据结构和延迟加载，最小内存占用。
- ⚡ **快速 JSON 序列化**：比标准库快 10 倍。
- 🏗️ **经过实战测试**：Scrapling 不仅拥有 92% 的测试覆盖率和完整的类型提示覆盖率，而且在过去一年中每天被数百名 Web Scraper 使用。

### 对开发者友好的体验

- 🎯 **交互式 Web Scraping Shell**：可选的内置 IPython Shell，具有 Scrapling 集成、快捷方式和新工具，可加快 Web Scraping 脚本开发。
- 🚀 **直接从终端使用**：可选地，您可以使用 Scrapling 抓取 URL 而无需编写任何代码。
- 🛠️ **丰富的导航 API**：使用父级、兄弟级和子级导航方法进行高级 DOM 遍历。
- 🧬 **增强的文本处理**：内置正则表达式、清理方法和优化的字符串操作。
- 📝 **自动选择器生成**：为任何元素生成强大的 CSS / XPath 选择器。
- 🔌 **熟悉的 API**：类似于 Scrapy / BeautifulSoup，使用与 Scrapy / Parsel 相同的伪元素。
- 📘 **完整的类型覆盖**：完整的类型提示，出色的 IDE 支持和代码补全。
- 🔋 **现成的 Docker 镜像**：每次发布时，包含所有浏览器的 Docker 镜像会自动构建和推送。

## 快速开始

### 基本用法

支持 Session 的 HTTP 请求：

```python
from scrapling.fetchers import Fetcher, FetcherSession

with FetcherSession(impersonate='chrome') as session:  # 使用 Chrome 的最新版本 TLS fingerprint
    page = session.get('https://quotes.toscrape.com/', stealthy_headers=True)
    quotes = page.css('.quote .text::text').getall()

# 或使用一次性请求
page = Fetcher.get('https://quotes.toscrape.com/')
quotes = page.css('.quote .text::text').getall()
```

高级隐秘模式：

```python
from scrapling.fetchers import StealthyFetcher, StealthySession

with StealthySession(headless=True, solve_cloudflare=True) as session:  # 保持浏览器打开直到完成
    page = session.fetch('https://nopecha.com/demo/cloudflare', google_search=False)
    data = page.css('#padded_content a').getall()

# 或使用一次性请求样式，为此请求打开浏览器，完成后关闭
page = StealthyFetcher.fetch('https://nopecha.com/demo/cloudflare')
data = page.css('#padded_content a').getall()
```

完整的浏览器自动化：

```python
from scrapling.fetchers import DynamicFetcher, DynamicSession

with DynamicSession(headless=True, disable_resources=False, network_idle=True) as session:  # 保持浏览器打开直到完成
    page = session.fetch('https://quotes.toscrape.com/', load_dom=False)
    data = page.xpath('//span[@class="text"]/text()').getall()  # 如果您偏好 XPath 选择器

# 或使用一次性请求样式
page = DynamicFetcher.fetch('https://quotes.toscrape.com/')
data = page.css('.quote .text::text').getall()
```

### Spider

构建具有并发请求、多种 Session 类型和暂停/恢复功能的完整爬虫：

```python
from scrapling.spiders import Spider, Request, Response

class QuotesSpider(Spider):
    name = "quotes"
    start_urls = ["https://quotes.toscrape.com/"]
    concurrent_requests = 10

    async def parse(self, response: Response):
        for quote in response.css('.quote'):
            yield {
                "text": quote.css('.text::text').get(),
                "author": quote.css('.author::text').get(),
            }

        next_page = response.css('.next a')
        if next_page:
            yield response.follow(next_page[0].attrib['href'])

result = QuotesSpider().start()
print(f"抓取了 {len(result.items)} 条引用")
result.items.to_json("quotes.json")
```

在单个 Spider 中使用多种 Session 类型：

```python
from scrapling.spiders import Spider, Request, Response
from scrapling.fetchers import FetcherSession, AsyncStealthySession

class MultiSessionSpider(Spider):
    name = "multi"
    start_urls = ["https://example.com/"]

    def configure_sessions(self, manager):
        manager.add("fast", FetcherSession(impersonate="chrome"))
        manager.add("stealth", AsyncStealthySession(headless=True), lazy=True)

    async def parse(self, response: Response):
        for link in response.css('a::attr(href)').getall():
            # 将受保护的页面路由到隐秘 Session
            if "protected" in link:
                yield Request(link, sid="stealth")
            else:
                yield Request(link, sid="fast", callback=self.parse)  # 显式 callback
```

通过 Checkpoint 实现暂停和恢复：

```python
QuotesSpider(crawldir="./crawl_data").start()
```

按 `Ctrl+C` 优雅暂停——进度会自动保存。之后，当您再次启动 Spider 时，传递相同的 `crawldir`，它将从上次停止的地方继续。

### 高级解析与导航

```python
from scrapling.fetchers import Fetcher

# 丰富的元素选择和导航
page = Fetcher.get('https://quotes.toscrape.com/')

# 使用多种选择方法获取引用
quotes = page.css('.quote')  # CSS 选择器
quotes = page.xpath('//div[@class="quote"]')  # XPath
quotes = page.find_all('div', {'class': 'quote'})  # BeautifulSoup 风格
quotes = page.find_all(class_='quote')
quotes = page.find_by_text('quote', tag='div')

# 高级导航
quote_text = page.css('.quote')[0].css('.text::text').get()
quote_text = page.css('.quote').css('.text::text').getall()  # 链式选择器
first_quote = page.css('.quote')[0]
author = first_quote.next_sibling.css('.author::text')
parent_container = first_quote.parent

# 元素关系和相似性
similar_elements = first_quote.find_similar()
below_elements = first_quote.below_elements()
```

如果您不想获取网站，可以直接使用解析器：

```python
from scrapling.parser import Selector

page = Selector("<html>...</html>")
```

用法完全相同。

## CLI 和交互式 Shell

Scrapling 包含强大的命令行界面。

启动交互式 Web Scraping Shell：

```bash
scrapling shell
```

直接将页面提取到文件而无需编程（默认提取 `body` 标签内的内容）。如果输出文件以 `.txt` 结尾，则将提取目标的文本内容；如果以 `.md` 结尾，它将是 HTML 内容的 Markdown 表示；如果以 `.html` 结尾，它将是 HTML 内容本身。

```bash
scrapling extract get 'https://example.com' content.md
scrapling extract get 'https://example.com' content.txt --css-selector '#fromSkipToProducts' --impersonate 'chrome'  # 所有匹配 CSS 选择器 '#fromSkipToProducts' 的元素
scrapling extract fetch 'https://example.com' content.md --css-selector '#fromSkipToProducts' --no-headless
scrapling extract stealthy-fetch 'https://nopecha.com/demo/cloudflare' captchas.html --css-selector '#padded_content a' --solve-cloudflare
```

## 性能基准

Scrapling 不仅功能强大——它还速度极快。以下基准测试将 Scrapling 的解析器与其他流行库的最新版本进行了比较。

### 文本提取速度测试（5000 个嵌套元素）

| # | 库 | 时间 (ms) | vs Scrapling |
|---|------|-----------|--------------|
| 1 | Scrapling | 2.02 | 1.0x |
| 2 | Parsel/Scrapy | 2.04 | 1.01 |
| 3 | Raw Lxml | 2.54 | 1.257 |
| 4 | PyQuery | 24.17 | ~12x |
| 5 | Selectolax | 82.63 | ~41x |
| 6 | MechanicalSoup | 1549.71 | ~767.1x |
| 7 | BS4 with Lxml | 1584.31 | ~784.3x |
| 8 | BS4 with html5lib | 3391.91 | ~1679.1x |

### 元素相似性和文本搜索性能

Scrapling 的自适应元素查找功能明显优于替代方案：

| 库 | 时间 (ms) | vs Scrapling |
|------|-----------|--------------|
| Scrapling | 2.39 | 1.0x |
| AutoScraper | 12.45 | 5.209x |

> 所有基准测试代表 100+ 次运行的平均值。

## 安装

Scrapling 需要 Python 3.10 或更高版本：

```bash
pip install scrapling
```

> 此安装仅包括解析器引擎及其依赖项，没有任何 Fetcher 或命令行依赖项。如果要使用任何 Fetcher 或 Spider，请先按照下面的说明安装 Fetcher 的依赖项。

### 可选依赖项

如果需要使用 Fetcher 或 Spider：

```bash
pip install "scrapling[fetchers]"

scrapling install           # normal install
scrapling install  --force  # force reinstall
```

这会下载所有浏览器，以及它们的系统依赖项和 fingerprint 操作依赖项。

其他额外功能：

```bash
# MCP 服务器功能
pip install "scrapling[ai]"

# Shell 功能（Web Scraping Shell 和 extract 命令）
pip install "scrapling[shell]"

# 安装所有内容
pip install "scrapling[all]"
```

### Docker

从 DockerHub 安装包含所有额外功能和浏览器的 Docker 镜像：

```bash
docker pull pyd4vinci/scrapling
```

或从 GitHub 注册表下载：

```bash
docker pull ghcr.io/d4vinci/scrapling:latest
```

## 引用

如果将 Scrapling 用于研究目的，可使用以下参考文献：

```bibtex
@misc{scrapling,
  author = {Karim Shoair},
  title = {Scrapling},
  year = {2024},
  url = {https://github.com/D4Vinci/Scrapling},
  note = {An adaptive Web Scraping framework that handles everything from a single request to a full-scale crawl!}
}
```

## 许可证

本作品根据 BSD-3-Clause 许可证授权。
