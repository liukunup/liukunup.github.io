---
title: Windows.Gaming.Input (WGI)
createTime: 2026/06/15 05:00:00
permalink: /blog/windows-gaming-input/
---

## 引言

在 Windows 平台上，游戏输入 API 经历了从 **DirectInput** → **XInput** → **Windows.Gaming.Input (WGI)** → **GameInput** 的演进。每个阶段都反映了当时的技术背景和设计目标。

本文将梳理这四代输入 API 的关系、差异，以及它们各自的适用场景。

---

## 1. 全景概览

| API | 推出时间 | 设计目标 | 设备类型 | 平台限制 |
|-----|---------|---------|---------|---------|
| DirectInput | 1995 (DirectX 1.0) | 统一 PC 输入设备访问 | 键盘、鼠标、摇杆、方向盘等 | Win32 桌面 |
| XInput | 2005 (Xbox 360) | Xbox 控制器跨平台 | Xbox 控制器（XUSB） | Win32 桌面 |
| Windows.Gaming.Input | 2015 (Windows 10) | UWP 游戏控制器输入 | Gamepad / ArcadeStick / FlightStick / RacingWheel / RawGameController | UWP / WinRT |
| GameInput | 2020+ (GDK) | 统一全平台全设备输入 | 键盘、鼠标、手柄、触控、HID 等所有设备 | Xbox + PC (GDK) |

---

## 2. DirectInput — 最初的统一输入方案

DirectInput 随 DirectX 1.0 在 1995 年诞生，是 Windows 上第一个专门为游戏设计的输入 API。它解决的核心问题是：统一分散的输入设备驱动接口。

### 特点

- **通用性强**：支持键盘、鼠标、摇杆、方向盘、飞行摇杆等几乎所有 HID 设备
- **低级访问**：应用可以直接读取原始设备数据
- **力反馈**：支持 Force Feedback 效果

### 缺陷

- 用起来繁琐：需要枚举设备、创建设备对象、设置数据格式、获取缓冲/立即数据
- 左右扳机合并：Xbox 手柄的 LT/RT 在 DirectInput 下**合并为一个轴**，无法独立识别
- 不支持振动：Xbox 手柄的振动功能只有 XInput 才能访问
- 微软已弃用：官方文档标注了 **deprecated**，不推荐新项目使用

```cpp
// DirectInput 示例：枚举并读取摇杆
LPDIRECTINPUT8          g_pDI = nullptr;
LPDIRECTINPUTDEVICE8    g_pJoystick = nullptr;

void InitDirectInput(HWND hWnd) {
    DirectInput8Create(GetModuleHandle(nullptr), DIRECTINPUT_VERSION,
                       IID_IDirectInput8, (VOID**)&g_pDI, nullptr);
    g_pDI->EnumDevices(DI8DEVCLASS_GAMECTRL, EnumCallback, nullptr, DIEDFL_ATTACHEDONLY);
}

BOOL CALLBACK EnumCallback(LPCDIDEVICEINSTANCE lpddi, VOID* pvRef) {
    g_pDI->CreateDevice(lpddi->guidInstance, &g_pJoystick, nullptr);
    g_pJoystick->SetDataFormat(&c_dfDIJoystick);
    g_pJoystick->SetCooperativeLevel(hWnd, DISCL_BACKGROUND | DISCL_NONEXCLUSIVE);
    return DIENUM_STOP;
}
```

---

## 3. XInput — Xbox 时代的简化方案

2005 年，Xbox 360 发布，微软同时推出了 XInput，目标是让 Xbox 控制器在 Windows 上有**一致的编程体验**。

### 设计理念

- 放弃通用性，锁定 Xbox 控制器（XUSB 协议）
- 简化 API：初始化不需要枚举设备，直接按 0-3 索引访问
- 左右扳机独立
- 支持振动反馈（`XInputSetState`）

### XInput vs DirectInput

```cpp
// XInput 示例：读取手柄状态
#include <XInput.h>

XINPUT_STATE state;
DWORD result = XInputGetState(0, &state);  // 直接索引0号手柄

if (result == ERROR_SUCCESS) {
    bool a_pressed = (state.Gamepad.wButtons & XINPUT_GAMEPAD_A) != 0;
    float left_trigger = state.Gamepad.bLeftTrigger / 255.0f;  // 独立扳机
    float right_trigger = state.Gamepad.bRightTrigger / 255.0f;
    float thumbLX = state.Gamepad.sThumbLX / 32767.0f;
    float thumbLY = state.Gamepad.sThumbLY / 32767.0f;
}

// 设置振动
XINPUT_VIBRATION vibration;
vibration.wLeftMotorSpeed = 65535;   // 左电机（低频）
vibration.wRightMotorSpeed = 65535;  // 右电机（高频）
XInputSetState(0, &vibration);
```

关键差异：

| 对比项 | DirectInput | XInput |
|--------|-----------|--------|
| 设备发现 | 枚举 GUID | 固定 4 槽位 (0-3) |
| 扳机 | 合并为单轴 | 独立读取 |
| 振动 | ❌ 不支持 | ✅ XInputSetState |
| 耳机设备 | ❌ 不支持 | ✅ XInputGetAudioDeviceIds |
| 兼容设备 | 所有 HID 控制器 | 仅 XUSB 兼容设备 |
| 易用性 | 复杂 | 简单 |

### 经典问题：XInput 与 DirectInput 共存

Xbox 手柄在 DirectInput 下也会被枚举到，但功能不完整。微软官方提供了通过 WMI 检测设备 ID 中是否包含 `IG_` 字符串来识别 XInput 设备的方案。

```cpp
BOOL IsXInputDevice(const GUID* pGuidProductFromDirectInput) {
    // 通过 WMI 查询 Win32_PNPEntity
    // 检查 DeviceID 中是否包含 "IG_"
    // 是则说明是 XInput 兼容设备，应跳过 DirectInput 处理
    ...
}
```

---

## 4. Windows.Gaming.Input — WinRT 时代的现代化方案

Windows 10 在 2015 年引入了 Windows.Gaming.Input（WGI）命名空间，作为 UWP（Universal Windows Platform）的输入方案。它是 **WinRT API**，设计上更现代、更类型安全。

### 类层次结构

```
IGameController (interface)
├── Gamepad              — 标准手柄（最常用）
├── ArcadeStick          — 街机摇杆
├── FlightStick          — 飞行摇杆
├── RacingWheel          — 方向盘
├── UINavigationController — UI 导航控制器
└── RawGameController    — 万能类型（任意控制器）
```

### 核心能力

- **即插即用事件**：`Gamepad.GamepadAdded` / `Gamepad.GamepadRemoved`
- **用户关联**：`IGameController.User` 关联 Windows 用户账户
- **固定类型**：每种控制器有对应的 Reading struct，字段明确（如 `GamepadReading` 包含 `Buttons`, `LeftThumbstickX/Y`, `LeftTrigger` 等）
- **UINavigationController**：专门为 UI 菜单导航设计，推荐游戏内菜单使用

```cpp
// WGI 示例：读取手柄状态（C++/WinRT）
#include <winrt/Windows.Gaming.Input.h>
using namespace winrt::Windows::Gaming::Input;

void PollController() {
    if (Gamepad::Gamepads().Size() == 0) return;

    auto gamepad = Gamepad::Gamepads().GetAt(0);
    GamepadReading reading = gamepad.GetCurrentReading();

    bool a_pressed = (reading.Buttons() & GamepadButtons::A) == GamepadButtons::A;
    float left_trigger = reading.LeftTrigger();
    float thumbLX = reading.LeftThumbstickX();
}

// 监听插拔
void RegisterEvents() {
    Gamepad::GamepadAdded([](auto&&, auto&& args) {
        // 新手柄接入
    });
    Gamepad::GamepadRemoved([](auto&&, auto&& args) {
        // 手柄断开
    });
}
```

### RawGameController — WGI 的万能方案

对于 WGI 没有预定义类型的控制器，可以用 `RawGameController` 读取原始输入：

```cpp
auto raw = RawGameController::RawGameControllers().GetAt(0);
int buttonCount = raw.ButtonCount();
int axisCount = raw.AxisCount();
int switchCount = raw.SwitchCount();

// 读取原始状态
array<bool> buttons(buttonCount);
array<double> axes(axisCount);
array<GameControllerSwitchPosition> switches(switchCount);
raw.GetCurrentReading(buttons, axes, switches);
```

### 局限

- **仅 UWP / WinRT 应用**：传统 Win32 控制台应用不能直接使用
- **不支持键盘鼠标**：只针对游戏控制器
- **需要应用焦点**：文档明确说明"must have focus to receive input"
- **功能有限**：无高级力反馈 / haptics 控制

---

## 5. GameInput — 下一代统一输入 API

GameInput 是微软在 Game Development Kit (GDK) 中推出的下一代输入 API。它的口号是 **"one API to rule them all"**。

### 设计目标

GameInput 是**所有传统输入 API 的功能超集**：

```
GameInput = DirectInput + XInput + WGI + RawInput + HID + 新增功能
```

### 核心特性

| 特性 | 说明 |
|------|------|
| **跨平台** | Xbox + Windows PC，同一套代码 |
| **全设备覆盖** | 键盘、鼠标、手柄、触控、HID 等 |
| **DMA 架构** | 直接内存访问，极低延迟 |
| **无锁线程安全** | 可在渲染线程安全调用 |
| **支持轮询和事件回调** | 灵活获取输入 |
| **力反馈 / Haptics** | 全套支持 |
| **第三方设备 SDK** | 可在 GameInput 之上封装自定义设备驱动 |
| **向后兼容** | 支持 Win10 19H1 及以上 |

```cpp
// GameInput 示例
#include <GameInput.h>

IGameInput* g_gameInput = nullptr;

void Init() {
    GameInputCreate(&g_gameInput);
}

void Poll() {
    IGameInputReading* reading = nullptr;
    g_gameInput->GetCurrentReading(GameInputKindGamepad, nullptr, &reading);
    if (reading) {
        GameInputGamepadState state;
        reading->GetGamepadState(&state);

        bool a_pressed = (state.buttons & GameInputGamepadA) != 0;
        float left_trigger = state.leftTrigger;
        float thumbLX = state.leftThumbstickX;

        reading->Release();
    }
}

// 事件回调方式
void RegisterCallback() {
    g_gameInput->RegisterDeviceCallback(
        nullptr, GameInputKindAny,
        GameInputDeviceConnected,
        nullptr,
        [](GameInputCallbackData) {
            // 设备连接/断开事件
        },
        nullptr);
}
```

---

## 6. 各 API 关系总结

### 演进时间线

```
1995 ─ DirectInput  诞生
     │
2005 ─ XInput       诞生（与 Xbox 360 同步，锁定 Xbox 手柄）
     │
2015 ─ WGI          诞生（Windows 10 / UWP，WinRT 化）
     │
2020+ ─ GameInput   诞生（GDK，大一统方案）
     │
     └──► DirectInput / XInput / WGI 均已不再演进
          GameInput 是微软当前推荐的输入 API
```

### 兼容矩阵

| 设备类型 | DirectInput | XInput | WGI | GameInput |
|---------|:----------:|:-----:|:---:|:--------:|
| Xbox 360/One/Series 手柄 | ⚠️（功能不全） | ✅ | ✅ | ✅ |
| 第三方手柄（XInput 模式） | ⚠️ | ✅ | ✅ | ✅ |
| 老式摇杆/方向盘 | ✅ | ❌ | ⚠️ RawGameController | ✅ |
| 飞行摇杆 | ✅ | ❌ | ✅ FlightStick | ✅ |
| 街机摇杆 | ✅ | ❌ | ✅ ArcadeStick | ✅ |
| 键盘 | ✅ | ❌ | ❌ | ✅ |
| 鼠标 | ✅ | ❌ | ❌ | ✅ |
| 触控 | ❌ | ❌ | ❌ | ✅ |
| HID 设备 | ✅ | ❌ | ⚠️ RawGameController | ✅ |

---

## 7. 如何选择

### 如果你的项目是...

| 项目类型 | 推荐 API | 理由 |
|---------|---------|------|
| Win32 桌面游戏（老项目维护） | XInput | 简单稳定，兼容性好 |
| Win32 桌面游戏（新项目） | GameInput | 未来方向，功能最全 |
| UWP / WinUI 应用 | WGI | 平台原生，无法绕过 |
| Xbox 游戏 | GameInput | GDK 默认 |
| 需要键盘鼠标输入的游戏 | GameInput | 唯一一体化方案 |
| Win32 控制台工具 | XInput | WGI 不可用，GameInput 过于重型 |
| 旧设备兼容（力反馈摇杆等） | DirectInput + XInput | 双 API 共存 |
| 跨平台引擎 (Unity/UE) | 引擎封装层 | Unity Input System / UE Enhanced Input |

### 核心判断逻辑

```
需要 PC + Xbox 跨平台？
    ├── 是 → GameInput（GDK 项目）
    └── 否 → 只需要 PC？
              ├── Win32 新项目 → GameInput
              ├── Win32 快速集成 → XInput
              ├── UWP 应用 → WGI
              └── 需要兼容古董设备 → DirectInput + XInput 并存
```

---

## 8. 代码对照

### 读取相同的手柄信息（A 按钮 + 左摇杆）

```cpp
// ─── XInput ───
XINPUT_STATE state;
XInputGetState(0, &state);
bool a = (state.Gamepad.wButtons & XINPUT_GAMEPAD_A) != 0;
float lx = state.Gamepad.sThumbLX / 32767.0f;

// ─── WGI ───
GamepadReading r = Gamepad::Gamepads().GetAt(0).GetCurrentReading();
bool a = (r.Buttons() & GamepadButtons::A) == GamepadButtons::A;
float lx = r.LeftThumbstickX();

// ─── GameInput ───
GameInputGamepadState s;
reading->GetGamepadState(&s);
bool a = (s.buttons & GameInputGamepadA) != 0;
float lx = s.leftThumbstickX;
```

---

## 9. Microsoft 官方建议

微软在 XInput 文档中明确写道：

> **See GameInput API for details on the next-generation input API supported on PC and Xbox through the Microsoft Game Development Kit (GDK).**

在 WGI 文档中：

> **Legacy Win32 console applications should use the XInput Game Controller APIs instead.**

这说明微软的策略是：
- **新项目 → GameInput**
- **Win32 传统项目 → XInput**
- **UWP 项目 → WGI**
- **DirectInput → 仅用于兼容旧设备**

---

## 参考资料

- [Microsoft Docs: Windows.Gaming.Input Namespace](https://learn.microsoft.com/en-us/uwp/api/windows.gaming.input)
- [Microsoft Docs: XInput and DirectInput Comparison](https://learn.microsoft.com/en-us/windows/win32/xinput/xinput-and-directinput)
- [Microsoft Docs: XInput Versions](https://learn.microsoft.com/en-us/windows/win32/xinput/xinput-versions)
- [Microsoft GDK: GameInput Fundamentals](https://learn.microsoft.com/en-us/gaming/gdk/docs/features/common/input/overviews/input-fundamentals)
- [GitHub: GameInput API](https://github.com/microsoftconnect/GameInput)
- [NuGet: Microsoft.GameInput](https://www.nuget.org/packages/Microsoft.GameInput)
