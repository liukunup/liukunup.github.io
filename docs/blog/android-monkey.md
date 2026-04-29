---
title: Android Monkey 从入门到实战
tags:
  - Android
  - 安卓
  - monkey
createTime: 2026/04/29 02:09:46
permalink: /blog/oin7qacu/
---

## 一、什么是 Monkey？

Monkey 是 Android SDK 自带的一个命令行工具，可以向设备发送**伪随机用户事件流**（点击、滑动、按键等），对应用进行压力测试，帮助发现隐藏的崩溃和 ANR 问题。

## 二、快速上手

### 基本命令格式
```bash
adb shell monkey [参数] 事件数量
```

### 最小示例
```bash
# 对包名 com.example.app 发送 500 个随机事件
adb shell monkey -p com.example.app 500
```

## 三、常用参数速查

| 分类 | 参数 | 说明 |
|------|------|------|
| **应用限制** | `-p 包名` | 指定测试的应用（可多个） |
| **调试选项** | `--ignore-crashes` | 忽略崩溃，继续执行 |
| | `--ignore-timeouts` | 忽略 ANR，继续执行 |
| **事件比例** | `--pct-touch 30` | 触摸事件占 30% |
| | `--pct-motion 20` | 滑动事件占 20% |
| **节奏控制** | `--throttle 200` | 事件间隔 200 毫秒 |
| **复现问题** | `-s 12345` | 指定随机种子，复现相同序列 |
| **日志级别** | `-v -v -v` | 越多越详细（最多 3 个） |

## 四、实战命令示例

```bash
# 示例1：标准压力测试
adb shell monkey -p com.example.app \
  --throttle 300 \
  --ignore-crashes \
  --ignore-timeouts \
  --pct-touch 60 \
  --pct-motion 30 \
  -v -v \
  10000

# 示例2：复现特定问题
adb shell monkey -p com.example.app -s 12345 1000
```

## 五、结果分析

### 保存日志
```bash
adb shell monkey -p com.example.app -v 5000 > monkey_log.txt
```

### 日志关键搜索词
| 关键词 | 含义 |
|--------|------|
| `CRASH` | 应用崩溃 |
| `ANR` | 应用无响应 |
| `Exception` | 代码异常 |
| `Monkey finished` | ✅ 测试通过标志 |

## 六、如何按时长执行？

Monkey **没有直接的时间参数**，需要用公式换算：

**事件数 = 目标秒数 ÷ (throttle 毫秒 / 1000)**

```bash
# 运行 1 小时，每 200ms 一个事件
# 3600 ÷ (200/1000) = 18000
adb shell monkey -p com.example.app --throttle 200 18000
```

## 七、最佳实践总结

1. **先用小事件数测试**（如 500），确认参数正确
2. **保存完整日志**，便于问题追溯
3. **记录随机种子**（-s 参数），方便复现 Bug
4. **测试前备份数据**，Monkey 会真实操作设备
5. **合理设置事件比例**，模拟真实用户使用场景

## 附录

```shell
usage: monkey [-p ALLOWED_PACKAGE [-p ALLOWED_PACKAGE] ...]
              [-c MAIN_CATEGORY [-c MAIN_CATEGORY] ...]
              [--ignore-crashes] [--ignore-timeouts]
              [--ignore-security-exceptions]
              [--monitor-native-crashes] [--ignore-native-crashes]
              [--kill-process-after-error] [--hprof]
              [--match-description TEXT]
              [--pct-touch PERCENT] [--pct-motion PERCENT]
              [--pct-trackball PERCENT] [--pct-syskeys PERCENT]
              [--pct-nav PERCENT] [--pct-majornav PERCENT]
              [--pct-appswitch PERCENT] [--pct-flip PERCENT]
              [--pct-anyevent PERCENT] [--pct-pinchzoom PERCENT]
              [--pct-permission PERCENT]
              [--pkg-blacklist-file PACKAGE_BLACKLIST_FILE]
              [--pkg-whitelist-file PACKAGE_WHITELIST_FILE]
              [--wait-dbg] [--dbg-no-events]
              [--setup scriptfile] [-f scriptfile [-f scriptfile] ...]
              [--port port]
              [-s SEED] [-v [-v] ...]
              [--throttle MILLISEC] [--randomize-throttle]
              [--profile-wait MILLISEC]
              [--device-sleep-time MILLISEC]
              [--randomize-script]
              [--script-log]
              [--bugreport]
              [--periodic-bugreport]
              [--permission-target-system]
              [--stderr]
              [--redirect-stderr]
              COUNT
```

```python :collapsed-lines
import subprocess
import tkinter as tk
from tkinter import ttk, scrolledtext, filedialog, messagebox
import threading
import time
import re
import json
import os
import matplotlib.pyplot as plt
from datetime import datetime
from collections import deque

plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'Arial Unicode MS', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False


class MonkeyTestTool:
    def __init__(self, root):
        self.root = root
        self.root.title("安卓 Monkey 测试工具")
        self.root.geometry("960x720")

        self.device_id = None
        self.running = False
        self.monkey_process = None
        self.monitor_thread = None
        self.log_file = None

        self.event_count = 0
        self.crash_count = 0
        self.anr_count = 0
        self.start_time = None
        self.all_packages = []

        self.log_data = deque(maxlen=1000)
        self.event_history = deque(maxlen=120)

        self.setup_ui()
        self.check_device()

    def setup_ui(self):
        top_frame = ttk.Frame(self.root)
        top_frame.pack(fill=tk.X, padx=10, pady=5)

        ttk.Label(top_frame, text="设备ID").pack(side=tk.LEFT)
        self.device_var = tk.StringVar()
        self.device_combo = ttk.Combobox(top_frame, textvariable=self.device_var, width=30)
        self.device_combo.pack(side=tk.LEFT, padx=5)
        self.device_combo.bind('<<ComboboxSelected>>', self.on_device_selected)

        ttk.Button(top_frame, text="刷新设备", command=self.check_device).pack(side=tk.LEFT, padx=5)

        self.status_label = ttk.Label(top_frame, text="状态: 就绪", foreground="gray")
        self.status_label.pack(side=tk.LEFT, padx=10)

        config_frame = ttk.Frame(self.root)
        config_frame.pack(fill=tk.X, padx=10, pady=5)

        ttk.Label(config_frame, text="搜索包名/进程").pack(side=tk.LEFT)
        self.search_var = tk.StringVar()
        self.search_entry = ttk.Entry(config_frame, textvariable=self.search_var, width=30)
        self.search_entry.pack(side=tk.LEFT, padx=5)
        self.search_var.trace_add('write', self.on_search_changed)

        ttk.Label(config_frame, text="包名").pack(side=tk.LEFT, padx=(10, 0))
        self.package_var = tk.StringVar()
        self.package_combo = ttk.Combobox(config_frame, textvariable=self.package_var, width=35)
        self.package_combo.pack(side=tk.LEFT, padx=5)

        ttk.Button(config_frame, text="刷新包名", command=self.load_packages).pack(side=tk.LEFT, padx=5)

        config_frame2 = ttk.Frame(self.root)
        config_frame2.pack(fill=tk.X, padx=10, pady=5)

        ttk.Label(config_frame2, text="时长(分钟)").pack(side=tk.LEFT)
        self.duration_var = tk.StringVar(value="")
        self.duration_entry = ttk.Entry(config_frame2, textvariable=self.duration_var, width=8)
        self.duration_entry.pack(side=tk.LEFT, padx=5)

        ttk.Label(config_frame2, text="事件数量").pack(side=tk.LEFT, padx=(10, 0))
        self.events_var = tk.StringVar(value="1000")
        self.events_entry = ttk.Entry(config_frame2, textvariable=self.events_var, width=8)
        self.events_entry.pack(side=tk.LEFT, padx=5)

        ttk.Label(config_frame2, text="速度(毫秒)").pack(side=tk.LEFT, padx=(10, 0))
        self.throttle_var = tk.StringVar(value="300")
        ttk.Entry(config_frame2, textvariable=self.throttle_var, width=6).pack(side=tk.LEFT, padx=5)

        ttk.Label(config_frame2, text="种子").pack(side=tk.LEFT, padx=(10, 0))
        self.seed_var = tk.StringVar(value="")
        self.seed_entry = ttk.Entry(config_frame2, textvariable=self.seed_var, width=8)
        self.seed_entry.pack(side=tk.LEFT, padx=5)

        control_frame = ttk.Frame(self.root)
        control_frame.pack(fill=tk.X, padx=10, pady=5)

        self.start_btn = ttk.Button(control_frame, text="开始测试", command=self.start_test)
        self.start_btn.pack(side=tk.LEFT, padx=5)

        self.stop_btn = ttk.Button(control_frame, text="停止测试", command=self.stop_test, state=tk.DISABLED)
        self.stop_btn.pack(side=tk.LEFT, padx=5)

        stats_frame = ttk.Frame(self.root)
        stats_frame.pack(fill=tk.X, padx=10, pady=5)

        self.stats_labels = {}
        stats_items = [
            ("event_count", "已执行事件"),
            ("crash_count", "崩溃次数"),
            ("anr_count", "ANR次数"),
            ("elapsed_time", "已用时间"),
            ("current_speed", "当前速度"),
        ]

        for key, label_text in stats_items:
            frame = ttk.Frame(stats_frame)
            frame.pack(side=tk.LEFT, padx=10)
            ttk.Label(frame, text=f"{label_text}:", font=("Microsoft YaHei", 10)).pack(side=tk.LEFT)
            self.stats_labels[key] = ttk.Label(frame, text="0", font=("Microsoft YaHei", 10, "bold"), foreground="blue")
            self.stats_labels[key].pack(side=tk.LEFT, padx=(5, 0))

        notebook = ttk.Notebook(self.root)
        notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        log_frame = ttk.Frame(notebook)
        notebook.add(log_frame, text="实时日志")

        self.log_text = scrolledtext.ScrolledText(log_frame, wrap=tk.WORD, font=("Consolas", 9))
        self.log_text.pack(fill=tk.BOTH, expand=True)

        events_frame = ttk.Frame(notebook)
        notebook.add(events_frame, text="事件统计")

        events_columns = ("时间", "事件类型", "包名", "参数", "结果")
        self.events_tree = ttk.Treeview(events_frame, columns=events_columns, show="headings")

        events_column_widths = {
            "时间": 100,
            "事件类型": 120,
            "包名": 200,
            "参数": 150,
            "结果": 100
        }

        for col in events_columns:
            self.events_tree.heading(col, text=col)
            self.events_tree.column(col, width=events_column_widths.get(col, 120))

        events_scrollbar = ttk.Scrollbar(events_frame, orient=tk.VERTICAL, command=self.events_tree.yview)
        self.events_tree.configure(yscroll=events_scrollbar.set)

        self.events_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        events_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        report_frame = ttk.Frame(notebook)
        notebook.add(report_frame, text="测试报告")

        report_columns = ("项目", "值")
        self.report_tree = ttk.Treeview(report_frame, columns=report_columns, show="headings")

        report_column_widths = {
            "项目": 200,
            "值": 500
        }

        for col in report_columns:
            self.report_tree.heading(col, text=col)
            self.report_tree.column(col, width=report_column_widths.get(col, 120))

        report_scrollbar = ttk.Scrollbar(report_frame, orient=tk.VERTICAL, command=self.report_tree.yview)
        self.report_tree.configure(yscroll=report_scrollbar.set)

        self.report_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        report_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        options_frame = ttk.Frame(notebook)
        notebook.add(options_frame, text="事件百分比")

        options_inner = ttk.Frame(options_frame)
        options_inner.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        ttk.Label(options_inner, text="触摸事件 (--pct-touch):", font=("Microsoft YaHei", 9, "bold")).grid(row=0, column=0, sticky=tk.W, pady=3)
        self.pct_touch = tk.StringVar(value="30")
        ttk.Entry(options_inner, textvariable=self.pct_touch, width=6).grid(row=0, column=1, sticky=tk.W, padx=5)
        ttk.Label(options_inner, text="%").grid(row=0, column=2, sticky=tk.W)

        ttk.Label(options_inner, text="运动事件 (--pct-motion):", font=("Microsoft YaHei", 9, "bold")).grid(row=1, column=0, sticky=tk.W, pady=3)
        self.pct_motion = tk.StringVar(value="20")
        ttk.Entry(options_inner, textvariable=self.pct_motion, width=6).grid(row=1, column=1, sticky=tk.W, padx=5)
        ttk.Label(options_inner, text="%").grid(row=1, column=2, sticky=tk.W)

        ttk.Label(options_inner, text="轨迹球事件 (--pct-trackball):", font=("Microsoft YaHei", 9, "bold")).grid(row=2, column=0, sticky=tk.W, pady=3)
        self.pct_trackball = tk.StringVar(value="0")
        ttk.Entry(options_inner, textvariable=self.pct_trackball, width=6).grid(row=2, column=1, sticky=tk.W, padx=5)
        ttk.Label(options_inner, text="%").grid(row=2, column=2, sticky=tk.W)

        ttk.Label(options_inner, text="系统按键 (--pct-syskeys):", font=("Microsoft YaHei", 9, "bold")).grid(row=3, column=0, sticky=tk.W, pady=3)
        self.pct_syskeys = tk.StringVar(value="0")
        ttk.Entry(options_inner, textvariable=self.pct_syskeys, width=6).grid(row=3, column=1, sticky=tk.W, padx=5)
        ttk.Label(options_inner, text="%").grid(row=3, column=2, sticky=tk.W)

        ttk.Label(options_inner, text="主导航 (--pct-majornav):", font=("Microsoft YaHei", 9, "bold")).grid(row=4, column=0, sticky=tk.W, pady=3)
        self.pct_majornav = tk.StringVar(value="15")
        ttk.Entry(options_inner, textvariable=self.pct_majornav, width=6).grid(row=4, column=1, sticky=tk.W, padx=5)
        ttk.Label(options_inner, text="%").grid(row=4, column=2, sticky=tk.W)

        ttk.Label(options_inner, text="应用切换 (--pct-appswitch):", font=("Microsoft YaHei", 9, "bold")).grid(row=5, column=0, sticky=tk.W, pady=3)
        self.pct_appswitch = tk.StringVar(value="5")
        ttk.Entry(options_inner, textvariable=self.pct_appswitch, width=6).grid(row=5, column=1, sticky=tk.W, padx=5)
        ttk.Label(options_inner, text="%").grid(row=5, column=2, sticky=tk.W)

        ttk.Label(options_inner, text="任意事件 (--pct-anyevent):", font=("Microsoft YaHei", 9, "bold")).grid(row=6, column=0, sticky=tk.W, pady=3)
        self.pct_anyevent = tk.StringVar(value="5")
        ttk.Entry(options_inner, textvariable=self.pct_anyevent, width=6).grid(row=6, column=1, sticky=tk.W, padx=5)
        ttk.Label(options_inner, text="%").grid(row=6, column=2, sticky=tk.W)

        ttk.Label(options_inner, text="翻转 (--pct-flip):", font=("Microsoft YaHei", 9, "bold")).grid(row=7, column=0, sticky=tk.W, pady=3)
        self.pct_flip = tk.StringVar(value="20")
        ttk.Entry(options_inner, textvariable=self.pct_flip, width=6).grid(row=7, column=1, sticky=tk.W, padx=5)
        ttk.Label(options_inner, text="%").grid(row=7, column=2, sticky=tk.W)

        ttk.Label(options_inner, text="暂停 (--pct-pinchzoom):", font=("Microsoft YaHei", 9, "bold")).grid(row=8, column=0, sticky=tk.W, pady=3)
        self.pct_pinchzoom = tk.StringVar(value="0")
        ttk.Entry(options_inner, textvariable=self.pct_pinchzoom, width=6).grid(row=8, column=1, sticky=tk.W, padx=5)
        ttk.Label(options_inner, text="%").grid(row=8, column=2, sticky=tk.W)

        ttk.Label(options_inner, text="基本导航 (--pct-nav):", font=("Microsoft YaHei", 9, "bold")).grid(row=9, column=0, sticky=tk.W, pady=3)
        self.pct_nav = tk.StringVar(value="0")
        ttk.Entry(options_inner, textvariable=self.pct_nav, width=6).grid(row=9, column=1, sticky=tk.W, padx=5)
        ttk.Label(options_inner, text="%").grid(row=9, column=2, sticky=tk.W)

        ttk.Label(options_inner, text="权限 (--pct-permission):", font=("Microsoft YaHei", 9, "bold")).grid(row=10, column=0, sticky=tk.W, pady=3)
        self.pct_permission = tk.StringVar(value="0")
        ttk.Entry(options_inner, textvariable=self.pct_permission, width=6).grid(row=10, column=1, sticky=tk.W, padx=5)
        ttk.Label(options_inner, text="%").grid(row=10, column=2, sticky=tk.W)

        btn_frame = ttk.Frame(options_inner)
        btn_frame.grid(row=11, column=0, columnspan=3, pady=10)
        ttk.Button(btn_frame, text="预设: 正常场景", command=self.preset_normal).pack(side=tk.LEFT, padx=2)
        ttk.Button(btn_frame, text="预设: 游戏场景", command=self.preset_game).pack(side=tk.LEFT, padx=2)
        ttk.Button(btn_frame, text="预设: 界面测试", command=self.preset_ui).pack(side=tk.LEFT, padx=2)
        ttk.Button(btn_frame, text="重置为0", command=self.reset_pct).pack(side=tk.LEFT, padx=2)

        advanced_frame = ttk.Frame(notebook)
        notebook.add(advanced_frame, text="高级选项")

        adv_inner = ttk.Frame(advanced_frame)
        adv_inner.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        ignore_frame = ttk.LabelFrame(adv_inner, text="忽略选项", padding=5)
        ignore_frame.pack(fill=tk.X, pady=5)

        self.ignore_crashes = tk.BooleanVar(value=True)
        ttk.Checkbutton(ignore_frame, text="崩溃 (--ignore-crashes)", variable=self.ignore_crashes).pack(side=tk.LEFT, padx=5)

        self.ignore_timeouts = tk.BooleanVar(value=True)
        ttk.Checkbutton(ignore_frame, text="超时 (--ignore-timeouts)", variable=self.ignore_timeouts).pack(side=tk.LEFT, padx=5)

        self.ignore_native = tk.BooleanVar(value=True)
        ttk.Checkbutton(ignore_frame, text="Native崩溃 (--ignore-native-crashes)", variable=self.ignore_native).pack(side=tk.LEFT, padx=5)

        self.ignore_security = tk.BooleanVar(value=True)
        ttk.Checkbutton(ignore_frame, text="安全异常 (--ignore-security-exceptions)", variable=self.ignore_security).pack(side=tk.LEFT, padx=5)

        debug_frame = ttk.LabelFrame(adv_inner, text="调试选项", padding=5)
        debug_frame.pack(fill=tk.X, pady=5)

        ttk.Label(debug_frame, text="调试级别:").pack(side=tk.LEFT, padx=5)
        self.debug_level = tk.StringVar(value="-v")
        debug_combo = ttk.Combobox(debug_frame, textvariable=self.debug_level,
                                   values=["-v", "-v -v", "-v -v -v"], width=15, state="readonly")
        debug_combo.pack(side=tk.LEFT, padx=5)

        ttk.Label(debug_frame, text="日志文件:").pack(side=tk.LEFT, padx=(20, 5))
        self.log_path_var = tk.StringVar()
        ttk.Entry(debug_frame, textvariable=self.log_path_var, width=40).pack(side=tk.LEFT, padx=5)
        ttk.Button(debug_frame, text="浏览", command=self.browse_log_path).pack(side=tk.LEFT, padx=2)

        self.init_report_tree()

    def preset_normal(self):
        self.pct_touch.set("30")
        self.pct_motion.set("20")
        self.pct_trackball.set("0")
        self.pct_syskeys.set("0")
        self.pct_nav.set("0")
        self.pct_majornav.set("15")
        self.pct_appswitch.set("5")
        self.pct_anyevent.set("5")
        self.pct_flip.set("20")
        self.pct_pinchzoom.set("0")
        self.pct_permission.set("0")
        self.log("已加载预设: 正常场景")

    def preset_game(self):
        self.pct_touch.set("40")
        self.pct_motion.set("30")
        self.pct_trackball.set("10")
        self.pct_syskeys.set("0")
        self.pct_nav.set("0")
        self.pct_majornav.set("5")
        self.pct_appswitch.set("5")
        self.pct_anyevent.set("5")
        self.pct_flip.set("0")
        self.pct_pinchzoom.set("0")
        self.pct_permission.set("0")
        self.log("已加载预设: 游戏场景")

    def preset_ui(self):
        self.pct_touch.set("25")
        self.pct_motion.set("15")
        self.pct_trackball.set("0")
        self.pct_syskeys.set("10")
        self.pct_nav.set("0")
        self.pct_majornav.set("20")
        self.pct_appswitch.set("10")
        self.pct_anyevent.set("10")
        self.pct_flip.set("5")
        self.pct_pinchzoom.set("0")
        self.pct_permission.set("0")
        self.log("已加载预设: 界面测试")

    def reset_pct(self):
        self.pct_touch.set("0")
        self.pct_motion.set("0")
        self.pct_trackball.set("0")
        self.pct_syskeys.set("0")
        self.pct_nav.set("0")
        self.pct_majornav.set("0")
        self.pct_appswitch.set("0")
        self.pct_anyevent.set("0")
        self.pct_flip.set("0")
        self.pct_pinchzoom.set("0")
        self.pct_permission.set("0")
        self.log("已重置所有百分比为0")

    def init_report_tree(self):
        report_items = [
            ("设备ID", ""),
            ("测试包名", ""),
            ("Monkey 种子", ""),
            ("事件总数", ""),
            ("实际执行事件", ""),
            ("崩溃次数", ""),
            ("ANR次数", ""),
            ("测试时长", ""),
            ("平均速度 (事件/秒)", ""),
            ("开始时间", ""),
            ("结束时间", ""),
            ("测试结果", ""),
            ("日志文件", ""),
        ]

        for item in report_items:
            self.report_tree.insert("", tk.END, values=item)

    def run_adb_command(self, command, timeout=30):
        try:
            if self.device_id:
                cmd = ["adb", "-s", self.device_id] + command[1:]
            else:
                cmd = command

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                encoding='utf-8',
                errors='ignore'
            )
            return result.stdout.strip(), result.stderr.strip(), result.returncode
        except FileNotFoundError:
            self.log("错误: 未找到ADB命令")
            return "", "", -1
        except subprocess.TimeoutExpired:
            self.log("ADB命令超时")
            return "", "", -1
        except Exception as e:
            self.log(f"ADB命令执行错误: {str(e)}")
            return "", "", -1

    def log(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.log_text.insert(tk.END, f"[{timestamp}] {message}\n")
        self.log_text.see(tk.END)
        self.log_data.append(f"[{timestamp}] {message}")

    def check_device(self):
        output, _, _ = self.run_adb_command(["adb", "devices"])

        if not output or "List of devices" not in output:
            self.device_id = None
            self.device_var.set("")
            self.status_label.config(text="ADB未安装", foreground="red")
            self.log("错误: ADB命令未找到")
            return

        devices = []
        lines = output.split('\n')
        for line in lines[1:]:
            if "device" in line and "unauthorized" not in line:
                devices.append(line.split()[0])
            elif "unauthorized" in line:
                self.status_label.config(text="设备未授权", foreground="orange")
                self.log("设备未授权，请在手机上允许USB调试")

        if devices:
            self.device_combo['values'] = devices
            if len(devices) == 1:
                self.device_id = devices[0]
                self.device_var.set(devices[0])
            else:
                self.device_id = devices[0] if devices else None
                self.device_var.set(devices[0])
            self.status_label.config(text="设备已连接", foreground="green")
            self.log(f"设备已连接: {self.device_id}")
            self.update_report_item("设备ID", self.device_id)
            self.load_packages()
        else:
            self.device_id = None
            self.device_var.set("")
            self.status_label.config(text="未连接", foreground="red")
            self.log("未检测到安卓设备")

    def on_device_selected(self, event=None):
        selected = self.device_var.get()
        if selected:
            self.device_id = selected
            self.log(f"已选择设备: {self.device_id}")
            self.update_report_item("设备ID", self.device_id)

    def on_search_changed(self, *args):
        search_term = self.search_var.get().lower()
        if search_term and self.all_packages:
            filtered = [p for p in self.all_packages if search_term in p.lower()]
            self.package_combo['values'] = filtered
        elif self.all_packages:
            self.package_combo['values'] = self.all_packages

    def load_packages(self):
        output, _, _ = self.run_adb_command([
            "adb", "shell", "pm", "list", "packages"
        ])
        if output:
            packages = [line.replace("package:", "").strip() for line in output.split('\n') if line.startswith("package:")]
            self.all_packages = sorted(packages)
            search_term = self.search_var.get().lower()
            if search_term:
                filtered = [p for p in self.all_packages if search_term in p.lower()]
                self.package_combo['values'] = filtered
            else:
                self.package_combo['values'] = self.all_packages
            self.log(f"已加载 {len(self.all_packages)} 个包名")



    def get_foreground_package(self):
        output, _, _ = self.run_adb_command([
            "adb", "shell", "dumpsys", "activity", "activities"
        ])

        if output:
            match = re.search(r'mResumedActivity:.*?([\w\.]+)/', output)
            if match:
                package = match.group(1)
                self.package_var.set(package)
                self.log(f"当前前台应用: {package}")
                return package

        self.log("未获取到前台应用包名")
        return None

    def browse_log_path(self):
        filename = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")],
            initialdir=os.getcwd()
        )
        if filename:
            self.log_path_var.set(filename)

    def build_monkey_command(self, events=None):
        package = self.package_var.get().strip()

        if events is None:
            duration = self.duration_var.get().strip()
            if duration:
                try:
                    events = 999999999
                except ValueError:
                    self.log("时长必须是正整数")
                    return None
            else:
                try:
                    events = int(self.events_var.get())
                    if events <= 0:
                        raise ValueError()
                except ValueError:
                    self.log("事件数量必须是正整数")
                    return None

        try:
            throttle = int(self.throttle_var.get())
            if throttle < 0:
                raise ValueError()
        except ValueError:
            self.log("速度必须是正整数")
            return None

        seed = self.seed_var.get().strip()
        seed_arg = [] if not seed else ["-s", seed]

        pct_args = []
        pct_entries = [
            ("--pct-touch", self.pct_touch),
            ("--pct-motion", self.pct_motion),
            ("--pct-trackball", self.pct_trackball),
            ("--pct-syskeys", self.pct_syskeys),
            ("--pct-nav", self.pct_nav),
            ("--pct-majornav", self.pct_majornav),
            ("--pct-appswitch", self.pct_appswitch),
            ("--pct-anyevent", self.pct_anyevent),
            ("--pct-flip", self.pct_flip),
            ("--pct-pinchzoom", self.pct_pinchzoom),
            ("--pct-permission", self.pct_permission),
        ]

        for flag, var in pct_entries:
            try:
                val = int(var.get())
                if val > 0:
                    pct_args.extend([flag, str(val)])
            except ValueError:
                pass

        ignore_args = []
        if self.ignore_crashes.get():
            ignore_args.append("--ignore-crashes")
        if self.ignore_timeouts.get():
            ignore_args.append("--ignore-timeouts")
        if self.ignore_native.get():
            ignore_args.append("--ignore-native-crashes")
        if self.ignore_security.get():
            ignore_args.append("--ignore-security-exceptions")

        debug_level = self.debug_level.get().strip()

        cmd = [
            "adb", "-s", self.device_id, "shell", "monkey",
            "-p", package,
        ] + seed_arg + pct_args + ignore_args

        if debug_level:
            cmd.append(debug_level)

        cmd.extend(["--throttle", str(throttle), str(events)])

        return cmd

    def start_test(self):
        if self.running:
            self.log("测试已在运行中")
            return

        package = self.package_var.get().strip()
        if not package:
            self.log("请输入要测试的包名")
            return

        monkey_cmd = self.build_monkey_command()
        if not monkey_cmd:
            return

        log_path = self.log_path_var.get().strip()
        if log_path:
            self.log_file = open(log_path, 'w', encoding='utf-8')
            self.log(f"日志将保存到: {log_path}")
            self.update_report_item("日志文件", log_path)
        else:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            auto_log_path = os.path.join(os.getcwd(), f"monkey_log_{timestamp}.txt")
            self.log_file = open(auto_log_path, 'w', encoding='utf-8')
            self.log(f"日志将自动保存到: {auto_log_path}")
            self.update_report_item("日志文件", auto_log_path)

        self.log(f"执行命令: {' '.join(monkey_cmd)}")

        self.running = True
        self.start_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        self.status_label.config(text="状态: 测试中", foreground="green")

        self.event_count = 0
        self.crash_count = 0
        self.anr_count = 0
        self.start_time = time.time()
        self.duration_minutes = None

        duration = self.duration_var.get().strip()
        if duration:
            try:
                self.duration_minutes = int(duration)
                self.update_report_item("测试时长", f"{duration} 分钟")
                self.update_report_item("事件总数", "无限 (按时长运行)")
            except ValueError:
                self.log("时长必须是正整数")
                self.running = False
                self.start_btn.config(state=tk.NORMAL)
                self.stop_btn.config(state=tk.DISABLED)
                return
        else:
            self.update_report_item("事件总数", self.events_var.get())

        self.update_report_item("测试包名", package)
        self.update_report_item("Monkey 种子", self.seed_var.get() if self.seed_var.get() else "随机")
        self.update_report_item("开始时间", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

        self.monitor_thread = threading.Thread(target=self.run_monkey, args=(monkey_cmd,), daemon=True)
        self.monitor_thread.start()

    def run_monkey(self, cmd):
        try:
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )

            self.monkey_process = process
            last_duration_check = time.time()

            for line in process.stdout:
                if not self.running:
                    break

                if self.duration_minutes and self.start_time:
                    current_elapsed = time.time() - self.start_time
                    if current_elapsed >= self.duration_minutes * 60:
                        self.log(f"达到设定时长 {self.duration_minutes} 分钟，停止测试")
                        process.terminate()
                        try:
                            process.wait(timeout=5)
                        except subprocess.TimeoutExpired:
                            process.kill()
                        break

                line = line.strip()
                if line:
                    self.log(line)

                    if self.log_file:
                        self.log_file.write(line + '\n')
                        self.log_file.flush()

                    self.parse_monkey_output(line)

                    self.root.after(0, self.update_stats)

            process.wait()
            return_code = process.returncode

        except Exception as e:
            self.log(f"Monkey执行错误: {str(e)}")
        finally:
            self.running = False
            if self.log_file:
                self.log_file.close()
                self.log_file = None

            self.root.after(0, self.test_completed, return_code)

    def parse_monkey_output(self, line):
        match = re.search(r'#(\d+)\s+\w+', line)
        if match:
            try:
                self.event_count = max(self.event_count, int(match.group(1)))
            except ValueError:
                pass

        match = re.search(r':Seed=.*?(\d+)', line)
        if match:
            self.update_report_item("Monkey 种子", match.group(1))
            self.seed_var.set(match.group(1))

        match = re.search(r'seed=(\d+)', line)
        if match:
            self.update_report_item("Monkey 种子", match.group(1))
            self.seed_var.set(match.group(1))

        if 'ANR' in line or 'not responding' in line.lower():
            self.anr_count += 1
            self.add_event_row("ANR", self.package_var.get(), line, "检测到")

        if 'CRASH' in line or 'FATAL' in line:
            self.crash_count += 1
            self.add_event_row("崩溃", self.package_var.get(), line, "检测到")

        if 'AllowScreenshot' in line:
            self.add_event_row("截图", "", line, "")

        if 'Injecting' in line:
            if 'motion' in line.lower():
                self.add_event_row("触摸", "", line, "")
            elif 'key' in line.lower():
                self.add_event_row("按键", "", line, "")

    def add_event_row(self, event_type, package, params, result):
        time_str = datetime.now().strftime("%H:%M:%S")
        self.events_tree.insert("", 0, values=(time_str, event_type, package, params[:50], result))

        if len(self.events_tree.get_children()) > 500:
            last_item = self.events_tree.get_children()[-1]
            self.events_tree.delete(last_item)

    def update_stats(self):
        self.stats_labels["event_count"].config(text=str(self.event_count))
        self.stats_labels["crash_count"].config(text=str(self.crash_count))
        self.stats_labels["anr_count"].config(text=str(self.anr_count))

        if self.start_time:
            elapsed = int(time.time() - self.start_time)
            hours = elapsed // 3600
            minutes = (elapsed % 3600) // 60
            seconds = elapsed % 60
            if hours > 0:
                time_str = f"{hours}h {minutes}m {seconds}s"
            elif minutes > 0:
                time_str = f"{minutes}m {seconds}s"
            else:
                time_str = f"{seconds}s"
            self.stats_labels["elapsed_time"].config(text=time_str)

            if elapsed > 0:
                speed = self.event_count / elapsed
                self.stats_labels["current_speed"].config(text=f"{speed:.1f}/s")

    def test_completed(self, return_code):
        self.start_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.DISABLED)
        self.status_label.config(text=f"状态: 已结束 (退出码: {return_code})", foreground="blue")

        end_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.update_report_item("结束时间", end_time)

        elapsed = time.time() - self.start_time if self.start_time else 0
        hours = int(elapsed // 3600)
        minutes = int((elapsed % 3600) // 60)
        seconds = int(elapsed % 60)
        duration_str = f"{hours}h {minutes}m {seconds}s" if hours > 0 else f"{minutes}m {seconds}s"
        self.update_report_item("测试时长", duration_str)

        self.update_report_item("实际执行事件", str(self.event_count))

        if elapsed > 0:
            avg_speed = self.event_count / elapsed
            self.update_report_item("平均速度 (事件/秒)", f"{avg_speed:.2f}")

        result = "通过"
        if self.crash_count > 0:
            result = f"失败 (崩溃: {self.crash_count})"
        elif self.anr_count > 0:
            result = f"失败 (ANR: {self.anr_count})"

        self.update_report_item("测试结果", result)

        if self.crash_count > 0:
            self.stats_labels["crash_count"].config(foreground="red")
        if self.anr_count > 0:
            self.stats_labels["anr_count"].config(foreground="red")

        self.log(f"测试完成! 退出码: {return_code}")
        self.log(f"执行事件: {self.event_count}, 崩溃: {self.crash_count}, ANR: {self.anr_count}")

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = os.path.join(os.getcwd(), f"monkey_report_{timestamp}.txt")
        try:
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write("=" * 60 + "\n")
                f.write("安卓 Monkey 测试报告\n")
                f.write("=" * 60 + "\n\n")
                for item in self.report_tree.get_children():
                    values = self.report_tree.item(item)["values"]
                    value = values[1] if values[1] else "0"
                    f.write(f"{values[0]}: {value}\n")
                f.write("\n" + "=" * 60 + "\n")
                f.write(f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("=" * 60 + "\n")
            self.log(f"报告已自动保存到: {report_path}")
        except Exception as e:
            self.log(f"保存报告失败: {str(e)}")

    def stop_test(self):
        if not self.running:
            self.log("测试未在运行")
            return

        self.log("正在停止测试...")
        self.running = False

        if self.monkey_process:
            try:
                self.monkey_process.terminate()
                try:
                    self.monkey_process.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    self.monkey_process.kill()
            except Exception as e:
                self.log(f"停止进程失败: {str(e)}")

        if self.device_id:
            self.run_adb_command(["adb", "-s", self.device_id, "shell", "pkill", "monkey"])

    def save_log(self):
        if not self.log_data:
            self.log("没有日志可保存")
            return

        filename = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")],
            initialdir=os.getcwd(),
            initialfile=f"monkey_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        )

        if filename:
            try:
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(self.log_data))
                self.log(f"日志已保存到: {filename}")
            except Exception as e:
                self.log(f"保存日志失败: {str(e)}")

    def clear_log(self):
        self.log_text.delete(1.0, tk.END)
        self.events_tree.delete(*self.events_tree.get_children())
        self.log_data.clear()
        self.log("日志已清空")

    def export_report(self):
        filename = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")],
            initialdir=os.getcwd(),
            initialfile=f"monkey_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        )

        if not filename:
            return

        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("=" * 60 + "\n")
                f.write("安卓 Monkey 测试报告\n")
                f.write("=" * 60 + "\n\n")

                for item in self.report_tree.get_children():
                    values = self.report_tree.item(item)["values"]
                    value = values[1] if values[1] else "0"
                    f.write(f"{values[0]}: {value}\n")

                f.write("\n" + "=" * 60 + "\n")
                f.write(f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("=" * 60 + "\n")

            self.log(f"报告已导出到: {filename}")
            messagebox.showinfo("导出成功", f"报告已保存到:\n{filename}")
        except Exception as e:
            self.log(f"导出报告失败: {str(e)}")
            messagebox.showerror("导出失败", str(e))

    def update_report_item(self, item_name, value):
        for item in self.report_tree.get_children():
            values = self.report_tree.item(item)["values"]
            if values[0] == item_name:
                self.report_tree.item(item, values=(item_name, value))
                break


if __name__ == "__main__":
    root = tk.Tk()
    app = MonkeyTestTool(root)
    root.mainloop()
```
