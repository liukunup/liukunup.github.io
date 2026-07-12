---
title: SimHub 入门与生态
createTime: 2026/07/12 09:00:00
permalink: /blog/sim-hub/
---

## 引言

在模拟赛车（Sim Racing）圈里，**SimHub** 几乎是一个绕不开的名字。它不渲染画面，也不直接驱动方向盘基座，而是做一件看似边缘、实则关键的事：

> 把游戏里正在发生的遥测数据，**翻译成你能看见、听见、感觉到**的信号。

转速、油门、刹车、档位、胎温、轮胎滑移、ABS/TC 介入、圈速差……这些原本只存在于内存里的数字，被 SimHub 抽出来，投射到：

- 仪表盘 / 曲轴屏（Dashboards）
- RGB 灯条 / 换挡提示灯（Shift Lights）
- 按钮盒 / 旋钮 / 编码器（Button Boxes）
- 低音炮 / 体感震动（Bass Shakers）
- 运动平台 / 风扇 / 烟雾发生器（Motion / FX）

一句话概括：**SimHub 是模拟赛车的「外设中间件 + 仪表盘编辑器」**。

---

## 全景概览

| 能力 | 主要用途 | 典型硬件 |
|------|---------|---------|
| Dash Studio | 自定义仪表盘，叠加在屏幕上 | 副屏、平板、手机浏览器 |
| Arduino / 自定义硬件 | 控制 LED、灯条、按钮盒、小屏 | Arduino Leonardo / Pro Micro / ESP32 |
| ShakeIt Bass Shakers | 把遥测转为低频震动 | ButtKicker、Clark Synthesis、Aura |
| ShakeIt Motion | 把遥测转为运动平台位移 | SRS、SimTools 兼容平台 |
| Game Telemetry | 从游戏中实时读取数据 | 30+ 主流模拟赛车 |
| Plugins / SDK | 通过插件扩展能力 | 自研或第三方插件 |
| Multiple Devices | 同时管理多块 Arduino / 显示器 | 任意数量组合 |

SimHub 由 **Wotever** 维护，定位为「Windows 平台、面向模拟赛车 / 飞行玩家」的免费/付费组合软件。免费版包含核心功能；Dash Studio 高级包、Premium 插件、3D 仪表等需要购买 **SimHub Pro / Dash Studio Pro** 授权。

---

## 1. Dash Studio — 自定义仪表盘

Dash Studio 是 SimHub 的看家功能，本质上是一个**所见即所得的仪表盘设计器**：

- 拖拽控件：转速条、档位、油门刹车条、胎温、相对圈速、Delta Time……
- 数据绑定：每个控件绑定到一条遥测属性（如 `SpeedKmh`、`Rpms`、`Gear`、`Throttle`）
- 多页面：可在一个仪表盘里切页（类似赛车真实座舱的多屏）
- 多输出：主屏叠加 / 第二屏独占 / 手机浏览器访问同一局域网

最常用场景是把仪表放到 **副屏**（竖屏或横屏），让驾驶视野专注前方，而速度、转速、油温等信息在眼角余光里就能看到。

### 数据来源（Property）

Dash Studio 控件绑定的不是字面数字，而是 SimHub 抽取出的**属性**，例如：

| 属性 | 含义 | 典型用途 |
|------|------|---------|
| `SpeedKmh` | 当前车速（km/h） | 数字表 / 速度条 |
| `Rpms` | 发动机转速 | 转速灯 / 转速条 |
| `Gear` | 当前档位 | 档位显示 |
| `Throttle` / `Brake` / `Clutch` | 三踏板开度（0~1） | 输入条 |
| `TyreTemperatureCore` | 四轮胎温 | 胎温计 |
| `TyreSlipRatio` | 滑移率 | 轮胎锁死/打滑指示 |
| `LapTimeCurrent` / `LapTimeBest` | 当前圈 / 最快圈 | 圈速表 |
| `LapDeltaToBest` | 与最快圈的实时差 | Delta Bar |
| `AbsActive` / `TcActive` | ABS / 牵引力介入 | 闪烁灯 |

这些属性几乎覆盖了玩家**所有想看见的状态**。

---

## 2. Arduino / 自定义硬件

SimHub 与 Arduino 的集成是其生态最迷人之处：通过简单的 USB 连接，你可以让任何一块 Arduino / ESP32 变成 SimHub 的外设。

### 常见 DIY 项目

| 项目 | 硬件 | 用途 |
|------|------|------|
| 换挡提示灯 | Arduino + WS2812B RGB 灯条 | 接近红区逐级变色 |
| 按钮盒 | Arduino + 旋钮编码器 + 按键 | 把车手驾驶设置映射成按键 |
| 曲轴屏 | Arduino + 1.5" OLED / TFT | 数字转速 + 档位 + 差速 |
| 风扇控制器 | Arduino + 风扇 + MOSFET | 根据车速/油温调节风量 |
| 烟雾发生器 | Arduino + 继电器 + 烟雾器 | 出弯给油触发白烟 |
| 手机/平板副屏 | 任意带浏览器的设备 | 通过 Dash Studio Web 服务访问 |

### 入门硬件清单

```
- Arduino Leonardo / Pro Micro（最常用，硬件 HID 友好）
- 或 ESP32（带 Wi-Fi，可以无线）
- WS2812B 灯条 / 灯环（5050 RGB）
- 杜邦线 / 焊接工具
- SimHub 自带 Arduino 固件烧录工具（无需写代码）
```

SimHub 提供 **「Arduino sketch 一键烧录」**：选中你的 Arduino 型号 → 选择要启用的功能（按钮盒 + 灯条 + 显示屏）→ 点击 **Flash**。整个过程不需要懂 C++，硬件就能跑起来。

### 引脚规划（以 Pro Micro 为例）

| Arduino 引脚 | 功能 | 备注 |
|------------|------|------|
| D2 / D3 / D4 / D5 ... | 按键输入 | 内置上拉，模拟赛车按键 |
| D6 / D7 / D8 / D9 | 旋转编码器 | 每个编码器两脚 |
| D10 | WS2812B 数据线 | 一根线带 60/144 颗灯 |
| I2C (SDA/SCL) | OLED / TFT 显示屏 | 0.96" / 1.3" / 2.0" |
| TX / RX | 串口调试 | 输出运行日志 |

> 💡 一个 Arduino 板可以同时承担**按键 + 编码器 + 灯条 + 显示屏**四类任务，SimHub 会按你的配置自动管理。

---

## 3. 遥测与游戏适配

SimHub 通过**游戏插件**读取模拟赛车的实时遥测：

- **原生插件**：由 SimHub 团队维护，覆盖主流 30+ 款
- **共享内存（Shared Memory）**：AC、ACC、AMS2、iRacing、RF2 等多数模拟器开放共享内存，SimHub 直接订阅
- **UDP 遥测**：Forza 系列、F1 系列通过 UDP 广播
- **SDK 插件**：自研游戏可通过 SimHub SDK 暴露数据

### 常见适配一览

| 游戏 | 数据来源 | 典型可用字段 |
|------|---------|--------------|
| Assetto Corsa / ACC | 共享内存 | 完整物理 + 胎温 + 圈速 |
| iRacing | 共享内存 | 完整物理 + 油耗 + 胎面温度 |
| rFactor 2 / Automobilista 2 | 共享内存 | 完整物理 |
| F1 系列 | UDP | 圈速 + Delta + 轮胎 + ERS |
| Forza Motorsport / Horizon | UDP / Forza Data | 完整物理 |
| Project CARS 2 / 3 | 共享内存 | 完整物理 |
| EA WRC / DiRT Rally 2.0 | 插件 | 拉力赛专用（领航员阶段等） |
| BeamNG.drive | 插件 | 物理 + 损伤 |
| Euro Truck / American Truck | 插件 | 卡车驾驶数据 |

> 部分早期游戏或独立作品可能没有官方插件，但社区里通常有第三方插件可以补齐。

---

## 4. ShakeIt — 体感震动与运动平台

### 4.1 Bass Shakers（体感震子）

**ShakeIt Bass Shakers** 把遥测里**高频变化**的部分（路面纹理、ABS 弹跳、撞墙、变速箱冲击）转成音频信号，送入低音炮放大器，再驱动安装在座椅下的体感震子。

效果：**轮胎碾过路肩的「咯噔」感、撞墙的闷响、雨天抓地力下降**——这些原本只是视觉信息，现在能直接传到身体。

常用硬件：

- ButtKicker Concert / Advance / Mini
- Clark Synthesis TST239 / TST329
- Aura Sound Bass Shaker

### 4.2 运动平台（Motion）

**ShakeIt Motion** 把遥测中的**位置/姿态/加速度**信号发给运动平台驱动板：

- DOF Reality H3 / H2 / P6
- SimXperience AccuForce
- Prosim T1000 / PT Actuator
- SRS（SimRacingSystem）/ SimTools 兼容平台

输出量包括：**俯仰（Pitch）、侧倾（Roll）、偏航（Yaw）、Surge（前后）、Sway（左右）** 五个自由度信号，平台驱动板负责把这些信号转换为电机动作。

---

## 5. 插件生态与扩展

SimHub 的扩展点主要是 **插件（Plugins）** 和 **自定义控件（Custom Controls）**：

- **官方插件库**：内置十几种，覆盖 LED 灯控制、声音提醒、Stream Deck 联动、Chat Box（Twitch/YouTube 弹幕）、AI 教练等
- **第三方插件**：社区贡献，例如赛车学校类（RaceSchool）、遥测分析类、语音教练类
- **Stream Deck 联动**：把 SimHub 属性绑定到 Elgato Stream Deck 按键，做实时数据展示
- **HTTP / WebSocket API**：通过本地端点，把遥测暴露给外部应用（OBS 字幕、Home Assistant、第三方 HUD）

> 🔌 这让 SimHub 不只是一个独立程序，而是一个**模拟赛车的「数据总线」**。

---

## 6. 安装与快速上手

### 6.1 安装步骤

1. 从官网下载 SimHub 安装包（仅 Windows）
2. 安装后启动，会引导检测已安装的游戏
3. 进入 **Settings** 选择你的硬件（Arduino 型号、灯条数量、显示屏型号）
4. 进入 **Arduino** 标签页烧录固件
5. 进入 **Dash Studio** 选择/设计仪表盘
6. 启动任意适配的赛车游戏，仪表和外设应自动激活

### 6.2 常见起步配置

```
- 副屏（竖屏或横屏）+ Dash Studio 仪表
- Arduino Pro Micro + 30 颗 WS2812B 灯条 → 换挡提示灯
- Arduino Pro Micro + 1.3" OLED → 档位/转速小屏
- ButtKicker Mini + 普通桌面 → 入门体感震动
```

预算友好度：

| 预算 | 起步组合 | 大致花费 |
|------|---------|---------|
| ¥0 | 仅用 Dash Studio + 副屏 | 0 |
| ¥100 | 加 Pro Micro + 灯条 | 100 |
| ¥300 | 加 ButtKicker Mini | 300 |
| ¥1000+ | 加 OLED + 编码器按钮盒 + 高阶震子 | 1000+ |

---

## 7. 替代方案对比

| 工具 | 优势 | 劣势 |
|------|------|------|
| **SimHub** | 功能全面、Arduino 友好、免费版够用 | 仅 Windows、Dash Studio 高级包付费 |
| **SimDashboard** | 跨平台（Win/macOS/Linux）、仪表盘模板多 | 硬件联动弱、定制性不如 SimHub |
| **Z1 Dashboard** | 全平台、iPad/手机做副屏 | 不支持 Arduino / 硬件外设 |
| **Sim Racing Studio (SRS)** | 运动平台 + 震动一体化 | 主要面向运动平台，仪表盘弱 |
| **SimTools** | 专业运动平台驱动 | 不提供仪表盘 |
| **厂商自带软件**（MOZA Pit House / Fanatec / iRacing UI） | 与自家硬件深度集成 | 跨品牌兼容弱 |

> 实操中多数玩家最终会回到 **SimHub**——因为它支持的硬件最广、社区最活跃。

---

## 总结

- **SimHub = 模拟赛车的中间件 + 仪表盘 + 硬件控制中心**
- 三大支柱：**Dash Studio（仪表）** / **Arduino / 灯条（外设）** / **ShakeIt（体感与运动）**
- 入门成本极低：副屏 + 免费的 Dash Studio 已经能拉开体验差距
- 进阶路径清晰：灯条 → 按钮盒 → 显示屏 → 体感震子 → 运动平台

如果你刚开始搭建模拟赛车外设生态，先装 SimHub、点亮一个副屏仪表，再决定是否需要 DIY 灯条和按钮盒——通常这两步就能让你**显著感受到反馈密度的提升**。