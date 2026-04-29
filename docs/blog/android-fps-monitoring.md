---
title: Android FPS 监控方法详解
tags:
  - Android
  - FPS
  - 性能监控
  - 卡顿检测
createTime: 2026/04/29 09:15:00
permalink: /blog/android-fps-monitoring/
---

## 为什么需要监控 FPS

FPS（Frames Per Second，每秒帧数）是衡量 Android 应用流畅度的核心指标。Android 系统理想渲染帧率为 60fps（每 16.6ms 一帧），当 FPS 低于 30 时用户会明显感知卡顿，低于 24 时视频类应用会出现画面不连贯。

常见需要监控的场景：
- 游戏应用（需要稳定 60fps）
- 视频播放/直播应用
- 复杂 UI 交互页面（列表滑动、动画效果）
- IoT/车机系统的界面流畅度保障

## FPS 监控原理

Android 系统通过 **VSync（垂直同步）** 信号控制帧渲染，`Choreographer` 是系统中协调动画、输入、绘制的核心类，它会接收 VSync 信号并触发对应回调。

我们可以通过监听 `Choreographer` 的回调，统计单位时间内触发的次数，从而得到 FPS 值。

## 方法一：系统工具快速检测

### 1. Android Studio Profiler
打开 Android Studio → 运行应用 → 点击 `View > Tool Windows > Profiler` → 选择 CPU/UI 模块，直接查看实时 FPS。

### 2. adb 命令（无需代码）
使用 `dumpsys gfxinfo` 命令获取应用的渲染信息：
```bash
# 格式：adb shell dumpsys gfxinfo <包名>
adb shell dumpsys gfxinfo com.example.myapp

# 输出关键指标：
# Janky frames: X（卡顿帧数）
# 90th percentile: Xms（90% 帧的渲染时间）
```

### 3. 手动计算 FPS
从输出中提取 `Total frames rendered`，结合时间差计算：
```bash
# 两次采样间隔 1 秒，计算 FPS
adb shell dumpsys gfxinfo com.example.myapp | grep "Total frames rendered"
```

## 方法二：代码层面监控（Choreographer）

这是最常用的应用内监控方式，通过 `Choreographer.FrameCallback` 监听每一帧渲染。

### 实现示例（Kotlin）
```kotlin
import android.os.Handler
import android.os.Looper
import android.view.Choreographer

class FPSMonitor(private val callback: (fps: Int) -> Unit) : Choreographer.FrameCallback {
    private var frameCount = 0
    private var lastTime = System.currentTimeMillis()
    private val handler = Handler(Looper.getMainLooper())
    private val interval = 1000L // 每秒计算一次

    override fun doFrame(frameTimeNanos: Long) {
        frameCount++
        Choreographer.getInstance().postFrameCallback(this)
    }

    fun start() {
        Choreographer.getInstance().postFrameCallback(this)
        handler.postDelayed(object : Runnable {
            override fun run() {
                val currentTime = System.currentTimeMillis()
                val diff = currentTime - lastTime
                if (diff > 0) {
                    val fps = (frameCount * 1000 / diff).toInt()
                    callback.invoke(fps)
                    frameCount = 0
                    lastTime = currentTime
                }
                handler.postDelayed(this, interval)
            }
        }, interval)
    }

    fun stop() {
        Choreographer.getInstance().removeFrameCallback(this)
        handler.removeCallbacksAndMessages(null)
    }
}
```

### 使用方式
```kotlin
// Activity 中启动监控
val monitor = FPSMonitor { fps ->
    runOnUiThread {
        Log.d("FPS", "Current FPS: $fps")
        // 可展示在 UI 或上报到后端
    }
}
monitor.start()

// 页面销毁时停止
override fun onDestroy() {
    super.onDestroy()
    monitor.stop()
}
```

## 方法三：第三方成熟库

如果需要更全面的性能监控（FPS、内存、CPU、卡顿堆栈），可直接使用开源 APM 库：

| 库名 | 所属 | 特点 |
|------|------|------|
| **Matrix** | 腾讯 | 微信同款 APM，支持 FPS、卡顿、内存泄漏检测 |
| **ByteDance-APM** | 字节 | 轻量级，支持自动监控和上报 |
| **LeakCanary** | Square | 专注内存泄漏，附带基础性能监控 |

### Matrix 集成示例
```gradle
// build.gradle
implementation "com.tencent.matrix:matrix-android-lib:2.0.9"
implementation "com.tencent.matrix:matrix-trace-canary:2.0.9"
```

```kotlin
// 初始化
val matrix = Matrix.Builder(application)
    .plugin(TracePlugin(
        application,
        TraceConfig.Builder()
            .enableFPS(true) // 开启 FPS 监控
            .build()
    ))
    .build()
Matrix.init(matrix)
```

## 方法四：结合 Pushgateway 上传指标

（呼应前文 [Python 上传 Pushgateway 教程](/blog/python-pushgateway/)，接入 Prometheus 监控体系）

### 架构流程
```
Android 设备 → 采集 FPS → 上报 Pushgateway → Prometheus → Grafana
```

### 安卓端上报示例（OkHttp）
```kotlin
import okhttp3.*

fun reportFPS(fps: Int) {
    val deviceId = Build.MODEL.replace(" ", "_")
    val url = "http://your-pushgateway:9091/metrics/job/android_fps/instance/$deviceId"
    val metrics = "android_fps{device=\"${Build.MODEL}\"} $fps"

    val client = OkHttpClient()
    val request = Request.Builder()
        .url(url)
        .post(RequestBody.create("text/plain".toMediaType(), metrics))
        .build()

    client.newCall(request).enqueue(object : Callback {
        override fun onFailure(call: Call, e: IOException) {
            Log.e("FPS", "上报失败", e)
        }
        override fun onResponse(call: Call, response: Response) {
            response.close()
        }
    })
}
```

## 验证监控结果

### 1. 本地日志验证
```bash
adb logcat | grep FPS
# 输出：D/FPS: Current FPS: 60
```

### 2. Pushgateway 验证
访问 `http://your-pushgateway:9091`，查看 `android_fps` 指标。

### 3. Grafana 可视化
在 Grafana 中添加 Prometheus 数据源，创建仪表盘查询 `android_fps`，实时展示设备 FPS 变化。

## 常见问题

### 1. 监控会影响性能吗？
`Choreographer` 回调本身是系统级实现，开销极小。但高频网络上报会有额外开销，建议降低上报频率（每 5 秒一次）。

### 2. 版本兼容性
- Android 8.0 以下：`Choreographer` 可用，部分设备可能有兼容性问题
- Android 8.0+：推荐使用 `FrameMetrics` API，可精准统计每一帧的渲染阶段耗时

### 3. 跨应用监控权限
监控自身应用无需额外权限；监控其他应用需要系统级权限或 root。

## 总结

| 方法 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 系统工具 | 零代码，快速检测 | 无法集成到应用内 | 临时调试 |
| Choreographer | 轻量精准，可自定义 | 需自行实现上报 | 应用内定制监控 |
| 第三方库 | 功能全面，生产级稳定 | 增加包体积 | 正式环境 APM |
| Pushgateway | 接入现有监控体系 | 需要额外服务端 | 设备集群监控 |

推荐生产环境使用 **Matrix + Pushgateway** 组合，兼顾监控能力和数据可视化。
