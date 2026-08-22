---
title: wrk
createTime: 2026/01/13 17:04:55
permalink: /blog/jns8e7i0/
---

wrk 是一个现代 HTTP 基准测试工具，当在单个多核 CPU 上运行时，能够产生显著的负载。它结合了多线程设计和可扩展的事件通知系统，如 epoll 和 kqueue。

虽然 wrk 本身是一个简单的 C 程序，但它包含了一个强大的嵌入式 LuaJIT 脚本接口。这不仅可以用来生成复杂的 HTTP 请求工作负载，还可以对响应处理和自定义报告进行编程。

Github: <https://github.com/wg/wrk/>

## 安装

### macOS

```bash
brew install wrk
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get install wrk
```

### 源码编译

```bash
git clone https://github.com/wg/wrk.git wrk
cd wrk
make
```

## 基本用法

```bash
wrk -t12 -c400 -d30s http://127.0.0.1:8080/index.html
```

这个命令运行一个基准测试，持续 30 秒，使用 12 个线程，并保持 400 个 HTTP 连接打开。

### 参数说明

*   `-c, --connections`：保持打开的 HTTP 连接总数，每个线程处理 `N = connections/threads` 个连接。
*   `-d, --duration`：测试持续时间，例如 2s, 2m, 2h。
*   `-t, --threads`：使用的总线程数。
*   `-s, --script`：LuaJIT 脚本，用于自定义请求生成和响应处理。
*   `-H, --header`：添加到请求的 HTTP 头，例如 `"User-Agent: wrk"`。
*   `--latency`：打印详细的延迟统计信息。
*   `--timeout`：如果在此时间内未收到响应，则记录为超时。

### 输出示例

```text
Running 30s test @ http://127.0.0.1:8080/index.html
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   635.91us    0.89ms  12.92ms   93.69%
    Req/Sec    56.20k     8.07k   62.00k    86.54%
  22464657 requests in 30.00s, 17.76GB read
Requests/sec: 748868.53
Transfer/sec:    606.33MB
```

## Lua 脚本

wrk 支持使用 Lua 脚本进行更复杂的测试场景，例如 POST 请求、自定义 Header、认证等。

详情参考：[Scripting](https://github.com/wg/wrk/blob/master/SCRIPTING)