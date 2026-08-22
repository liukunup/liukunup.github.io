---
title: LVGL v9 入门指南：轻量级嵌入式 GUI 框架
tags:
  - 嵌入式
  - LVGL
  - GUI
  - 显示
createTime: 2026/08/23 02:00:57
permalink: /blog/lvgl-getting-started/
---

> LVGL (Light and Versatile Graphics Library) 是一款专为嵌入式设备设计的轻量级开源 GUI 框架，支持触摸屏、按钮、图表等丰富控件，广泛应用于智能手表、工业 HMI、智能家居等领域。

## 什么是 LVGL？

LVGL 是一个 **免费开源的嵌入式图形库**，具有以下特点：

| 特性 | 说明 |
| --- | --- |
| **轻量级** | 核心库仅需 ~64KB Flash、~16KB RAM |
| **功能丰富** | 内置 30+ 种控件（按钮、图表、键盘等） |
| **跨平台** | 支持 STM32、ESP32、NXP、i.MX、Raspberry Pi 等 |
| **响应式** | 自动处理输入设备（触摸、按键、编码器） |
| **主题丰富** | 支持 CSS 样式和动态主题切换 |
| **活跃社区** | GitHub 28k+ Stars，持续维护更新 |

## LVGL v9 新特性

LVGL v9 是重大版本更新，带来了多项改进：

```
┌─────────────────────────────────────────────────┐
│              LVGL v9 核心架构                   │
├─────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐              │
│  │   Widgets   │  │   Styles    │              │
│  │   (控件)    │  │   (样式)    │              │
│  └─────────────┘  └─────────────┘              │
│         │                │                      │
│         ▼                ▼                      │
│  ┌─────────────────────────────────────┐       │
│  │          Drawing Engine (绘制引擎)   │       │
│  │  - 基于 VG-Lite (可选)              │       │
│  │  - 软件渲染 / GPU 加速              │       │
│  └─────────────────────────────────────┘       │
│                      │                          │
│                      ▼                          │
│  ┌─────────────────────────────────────┐       │
│  │         Display Driver (显示驱动)     │       │
│  └─────────────────────────────────────┘       │
│                      │                          │
│                      ▼                          │
│  ┌─────────────────────────────────────┐       │
│  │         Input Driver (输入驱动)       │       │
│  │  - 触摸屏 / 按键 / 编码器            │       │
│  └─────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
```

### v9 相比 v8 的变化

| 变化项 | v8 | v9 |
| --- | --- | --- |
| **渲染引擎** | 旧版 | VG-Lite (可选) |
| **控件层级** | 部分支持 | 完全支持 |
| **样式系统** | Props | Props v2 |
| **动画系统** | 旧版 | AnimTimeline |
| **内存管理** | 静态 | 动态 (可选) |
| **API 兼容性** | - | 部分破坏性变更 |

## 快速入门

### 环境要求

| 资源 | 最低要求 | 推荐配置 |
| --- | --- | --- |
| **编译器** | C99 或 C++11 | GCC ARM / ESP-IDF |
| **Flash** | ~64KB | ~256KB+ |
| **RAM** | ~16KB | ~64KB+ |
| **分辨率** | 任何 | 320x240+ |

### 安装 LVGL

#### 方式一：CMake 子模块

```bash
# 添加为子模块
git submodule add https://github.com/lvgl/lvgl.git lib/lvgl

# CMakeLists.txt
add_subdirectory(lib/lvgl)
target_link_libraries(my_app PRIVATE lvgl::lvgl)
```

#### 方式二：ESP-IDF

```bash
idf.py add-dependency lvgl==9.*
```

#### 方式三：STM32CubeMX

在 STM32CubeMX 中勾选 X-CUBE-TOUCHGFX 或手动集成 LVGL。

### 最小配置

```c
// lv_conf.h
#define LV_COLOR_DEPTH 16          // 颜色深度
#define LV_MEM_SIZE (64 * 1024)   // 内存池大小
#define LV_USE_GPU 0              // GPU 加速 (可选)
#define LV_USE_LOG 1              // 日志功能
```

## 核心概念

### 1. 显示驱动 (Display Driver)

```c
// 1. 定义显示缓冲区
static lv_color_t buf[LVGL_BUF_SIZE];
static lv_display_t *disp;

// 2. 初始化显示驱动
void my_disp_init(void) {
    // 硬件初始化 (SPI, RGB, 等)
    my_spi_init();
    my_lcd_init();

    // 创建显示设备
    disp = lv_display_create(480, 272);  // 分辨率

    // 设置缓冲区
    lv_display_set_buffers(disp, buf, NULL, sizeof(buf),
                           LV_DISPLAY_RENDER_MODE_PARTIAL);

    // 设置 Flush 回调
    lv_display_set_flush_cb(disp, my_flush_cb);
}

// 3. Flush 回调 - 将数据发送到屏幕
void my_flush_cb(lv_display_t * disp, const lv_area_t * area,
                 uint8_t * px_map) {
    // 计算位置
    int32_t x1 = area->x1;
    int32_t y1 = area->y1;
    int32_t x2 = area->x2;
    int32_t y2 = area->y2;

    // 发送像素数据到 LCD
    my_lcd_draw_bitmap(x1, y1, x2 - x1 + 1, y2 - y1 + 1, px_map);

    // 标记完成
    lv_display_flush_ready(disp);
}
```

### 2. 输入驱动 (Input Driver)

```c
// 触摸屏驱动
static lv_indev_t *touch_indev;

void my_touch_init(void) {
    my_touch_controller_init();  // FT6336, GT911 等

    touch_indev = lv_indev_create();
    lv_indev_set_type(touch_indev, LV_INDEV_TYPE_POINTER);
    lv_indev_set_read_cb(touch_indev, my_touch_read_cb);
}

void my_touch_read_cb(lv_indev_t * indev,
                      lv_indev_data_t * data) {
    if (my_touch_get_xy(&data->point.x, &data->point.y)) {
        data->state = LV_INDEV_STATE_PRESSED;
    } else {
        data->state = LV_INDEV_STATE_RELEASED;
    }
}

// 按键驱动
static lv_indev_t *kb_indev;

void my_key_init(void) {
    kb_indev = lv_indev_create();
    lv_indev_set_type(kb_indev, LV_INDEV_TYPE_KEYPADS);
    lv_indev_set_read_cb(kb_indev, my_key_read_cb);
}
```

### 3. 控件 (Widgets)

```c
// 创建基础控件
void create_ui(void) {
    lv_obj_t *scr = lv_screen_active();

    // === 按钮 ===
    lv_obj_t *btn = lv_button_create(scr);
    lv_obj_set_size(btn, 120, 50);
    lv_obj_align(btn, LV_ALIGN_CENTER, 0, 0);
    lv_obj_add_flag(btn, LV_OBJ_FLAG_CHECKABLE);

    lv_obj_t *btn_label = lv_label_create(btn);
    lv_label_set_text(btn_label, "Click Me");
    lv_obj_center(btn_label);

    // === 标签 ===
    lv_obj_t *label = lv_label_create(scr);
    lv_label_set_text(label, "Hello LVGL!");
    lv_obj_set_pos(label, 20, 20);

    // === 滑块 ===
    lv_obj_t *slider = lv_slider_create(scr);
    lv_obj_set_size(slider, 200, 30);
    lv_obj_align(slider, LV_ALIGN_BOTTOM_MID, 0, -20);

    // === 开关 ===
    lv_obj_t *sw = lv_switch_create(scr);
    lv_obj_align(sw, LV_ALIGN_TOP_RIGHT, -20, 20);
}
```

### 4. 样式 (Styles)

```c
// 使用样式
void style_example(void) {
    lv_obj_t *btn = lv_button_create(lv_screen_active());

    // 创建样式
    static lv_style_t style_btn;
    lv_style_init(&style_btn);

    // 设置样式属性
    lv_style_set_radius(&style_btn, 10);
    lv_style_set_bg_color(&style_btn, lv_color_hex(0x007AFE));
    lv_style_set_text_color(&style_btn, lv_color_hex(0xFFFFFF));
    lv_style_set_pad_all(&style_btn, 10);

    // 应用样式
    lv_obj_add_style(btn, &style_btn, 0);
}

// 按钮状态样式
void btn_state_styles(void) {
    lv_obj_t *btn = lv_button_create(lv_screen_active());

    static lv_style_t style_default, style_pressed, style_disabled;
    lv_style_init(&style_default);
    lv_style_set_bg_color(&style_default, lv_color_hex(0x007AFE));

    lv_style_init(&style_pressed);
    lv_style_set_bg_color(&style_pressed, lv_color_hex(0x0055BB));

    lv_style_init(&style_disabled);
    lv_style_set_bg_color(&style_disabled, lv_color_hex(0xAAAAAA));

    lv_obj_add_style(btn, &style_default, 0);
    lv_obj_add_style(btn, &style_pressed, LV_STATE_PRESSED);
    lv_obj_add_style(btn, &style_disabled, LV_STATE_DISABLED);
}
```

### 5. 动画 (Animation)

```c
// 创建动画
void animate_example(void) {
    lv_obj_t *obj = lv_obj_create(lv_screen_active());
    lv_obj_set_size(obj, 100, 100);
    lv_obj_set_pos(obj, 50, 50);

    // 创建动画
    lv_anim_t anim;
    lv_anim_init(&anim);
    lv_anim_set_var(&anim, obj);
    lv_anim_set_duration(&anim, 1000);           // 1秒
    lv_anim_set_repeat_count(&anim, 10);         // 重复10次
    lv_anim_set_path_cb(&anim, lv_anim_path_ease_in_out);

    // 属性动画 (Y 坐标从 50 -> 200)
    lv_anim_set_exec_cb(&anim, (lv_anim_exec_xcb_t)lv_obj_set_y);
    lv_anim_set_values(&anim, 50, 200);
    lv_anim_start(&anim);
}

// 使用 AnimTimeline (v9 新特性)
void animtimeline_example(void) {
    lv_anim_timeline_t *at = lv_anim_timeline_create();

    lv_obj_t *obj1 = lv_obj_create(lv_screen_active());
    lv_obj_t *obj2 = lv_obj_create(lv_screen_active());

    lv_anim_t a1, a2;
    // ... 配置动画 ...

    lv_anim_timeline_add(at, 0, &a1);      // 0ms 开始
    lv_anim_timeline_add(at, 200, &a2);   // 200ms 开始

    lv_anim_timeline_start(at);
}
```

## 常用控件示例

### 图表 (Chart)

```c
void chart_example(void) {
    lv_obj_t *chart = lv_chart_create(lv_screen_active());
    lv_obj_set_size(chart, 400, 200);
    lv_obj_center(chart);
    lv_chart_set_type(chart, LV_CHART_TYPE_LINE);
    lv_chart_set_point_count(chart, 20);

    // 添加数据系列
    lv_chart_series_t *ser = lv_chart_add_series(chart,
        lv_color_hex(0x007AFE), LV_CHART_SERIES_DIRECTION_VER);
    lv_chart_set_next_value(chart, ser, 10);
    lv_chart_set_next_value(chart, ser, 20);
    lv_chart_set_next_value(chart, ser, 15);

    // 添加第二个系列
    lv_chart_series_t *ser2 = lv_chart_add_series(chart,
        lv_color_hex(0x00BB00), LV_CHART_SERIES_DIRECTION_VER);
    for (int i = 0; i < 20; i++) {
        lv_chart_set_next_value(chart, ser2, rand() % 100);
    }
}
```

### 列表 (List)

```c
void list_example(void) {
    lv_obj_t *list = lv_list_create(lv_screen_active());
    lv_obj_set_size(list, 200, 300);
    lv_obj_center(list);

    // 添加列表项
    const char *items[] = {"Settings", "WiFi", "Bluetooth",
                           "Display", "About"};

    for (int i = 0; i < 5; i++) {
        lv_obj_t *btn = lv_list_add_btn(list, LV_SYMBOL_SETTINGS,
                                        items[i]);
        lv_obj_add_event_cb(btn, event_handler, LV_EVENT_CLICKED,
                           (void *)(intptr_t)i);
    }
}
```

### 滚动容器 (Roller)

```c
void roller_example(void) {
    lv_obj_t *roller = lv_roller_create(lv_screen_active());
    lv_roller_set_options(roller,
        "Option 1\n"
        "Option 2\n"
        "Option 3\n"
        "Option 4\n"
        "Option 5",
        LV_ROLLER_MODE_NORMAL);

    lv_obj_center(roller);
    lv_roller_set_visible_row_count(roller, 3);

    // 获取选中项
    uint32_t sel = lv_roller_get_selected(roller);
}
```

### 键盘 (Keyboard)

```c
void keyboard_example(void) {
    // 文本区域
    lv_obj_t *ta = lv_textarea_create(lv_screen_active());
    lv_obj_set_size(ta, 300, 100);
    lv_obj_align(ta, LV_ALIGN_TOP_MID, 0, 10);
    lv_textarea_set_placeholder_text(ta, "Type here...");

    // 键盘
    lv_obj_t *kb = lv_keyboard_create(lv_screen_active());
    lv_obj_set_size(kb, 450, 200);
    lv_obj_align(kb, LV_ALIGN_BOTTOM_MID, 0, 0);
    lv_keyboard_set_textarea(kb, ta);  // 关联输入框
}
```

## 事件处理

```c
// 事件回调
void btn_event_cb(lv_event_t * e) {
    lv_event_code_t code = lv_event_get_code(e);
    lv_obj_t * btn = lv_event_get_target(e);

    if (code == LV_EVENT_CLICKED) {
        LV_LOG_USER("Button clicked!");

        // 获取用户数据
        int *user_data = (int *)lv_event_get_user_data(e);

        // 改变标签文本
        lv_obj_t *label = lv_obj_get_child(btn, 0);
        lv_label_set_text(label, "Clicked!");
    }
    else if (code == LV_EVENT_VALUE_CHANGED) {
        LV_LOG_USER("Value changed!");
    }
}

// 添加事件
void setup_events(void) {
    lv_obj_t *btn = lv_button_create(lv_screen_active());
    lv_obj_add_event_cb(btn, btn_event_cb, LV_EVENT_ALL, NULL);
}
```

## 主题 (Theme)

```c
// 使用内置主题
void use_theme(void) {
    // 旋转木马主题
    lv_theme_t *th = lv_theme_rotate_create(\
        primary_color,   \
        secondary_color,  \
        LV_FONT_DEFAULT, \
        dark_mode);

    lv_disp_set_theme(lv_display_get_default(), th);
}

// 自定义主题
void custom_theme(void) {
    lv_theme_t *th = lv_theme_default_init(
        display,                          // 显示设备
        lv_color_hex(0x007AFE),          // 主色
        lv_color_hex(0xFF5500),          // 强调色
        true,                            // 深色模式
        &lv_font_montserrat_14);         // 字体

    lv_disp_set_theme(display, th);
}
```

## 字体

```c
// lv_conf.h 配置字体
#define LV_FONT_MONTSERRAT_12 1
#define LV_FONT_MONTSERRAT_14 1
#define LV_FONT_MONTSERRAT_16 1
#define LV_FONT_MONTSERRAT_20 1
#define LV_FONT_MONTSERRAT_24 1
#define LV_FONT_MONTSERRAT_28 1
#define LV_FONT_MONTSERRAT_32 1

// 使用字体
lv_obj_t *label = lv_label_create(scr);
lv_obj_set_style_text_font(label, &lv_font_montserrat_24, 0);

// 转换 TTF/OTF 为 LVGL 字体
// python使用 lv_font_conv
lv_font_conv --font myfont.ttf -o myfont.c --size 24 --bpp 4
```

## 主循环

```c
// 典型主循环
void main_loop(void) {
    while (1) {
        // 报告待处理的渲染
        lv_timer_handler();

        // 可选：低功耗处理
        // delay_ms(5);
    }
}

// 带 FreeRTOS 的版本
void lvgl_task(void *params) {
    while (1) {
        lv_timer_handler_run_in_period(5);  // 5ms 周期
        vTaskDelay(pdMS_TO_TICKS(5));
    }
}
```

## 常见显示器驱动

### SPI LCD (ILI9341)

```c
// ILI9341 显示驱动示例
#include "driver/spi_master.h"
#include "lvgl.h"

static spi_device_handle_t spi;

void ili9341_init(void) {
    // 初始化 SPI
    spi_bus_config_t buscfg = {
        .mosi_io_num = 23,
        .miso_io_num = 19,
        .sclk_io_num = 18,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1,
    };
    spi_bus_initialize(HSPI_HOST, &buscfg, SPI_DMA_CH_AUTO);

    // 初始化 LCD 硬件
    reset_lcd();
    send_command(0x01);  // Software reset
    vTaskDelay(100 / portTICK_PERIOD_MS);

    // 设置像素格式、分辨率等
    send_command(0x36); send_data(0x00);  // MADCTL
    send_command(0x3A); send_data(0x55);  // COLMOD
    send_command(0x2C);                    // RAMWR
}
```

### RGB 接口

```c
// STM32 LTDC RGB 接口示例
void rgb_display_init(void) {
    LTDC_HandleTypeDef hltdc;

    // 配置时序
    hltdc.Init.HorizontalSync = 40;      // HSW
    hltdc.Init.VerticalSync = 10;        // VSW
    hltdc.Init.AccumulatedHBP = 42;      // HBP
    hltdc.Init.AccumulatedVBP = 12;      // VBP
    hltdc.Init.LayerAddress = (uint32_t)framebuffer;

    HAL_LTDC_Init(&hltdc);

    // 配置图层
    LTDC_LayerCfgTypeDef layer = {
        .PixelFormat = LTDC_PIXEL_FORMAT_RGB565,
        .ImageWidth = 480,
        .ImageHeight = 272,
    };
    HAL_LTDC_ConfigLayer(&hltdc, &layer, 0);
}
```

## 性能优化

### 双缓冲 vs 部分缓冲

```c
// 双缓冲 - 最佳性能，需要足够 RAM
static lv_color_t buf1[480 * 272];
static lv_color_t buf2[480 * 272];
lv_display_set_buffers(disp, buf1, buf2, sizeof(buf1),
                       LV_DISPLAY_RENDER_MODE_DIRECT);

// 部分缓冲 - RAM 节省
static lv_color_t buf[480 * 50];  // 只有部分行
lv_display_set_buffers(disp, buf, NULL, sizeof(buf),
                       LV_DISPLAY_RENDER_MODE_PARTIAL);
```

### 控件优化

```c
// 减少绘制
lv_obj_remove_flag(obj, LV_OBJ_FLAG_DRAW_MAIN);    // 跳过主绘制
lv_obj_remove_flag(obj, LV_OBJ_FLAG_DRAW_POST);    // 跳过后绘制

// 使用缓存
lv_obj_set_cache(obj, LV_CACHE_SIZE_ONE);

# 静态绘制区域
lv_obj_set_clip_corner(obj, true);
```

## 调试技巧

```c
// 启用日志
#define LV_USE_LOG 1
#define LV_LOG_LEVEL LV_LOG_LEVEL_WARN

void my_log_cb(const char * buf) {
    printf("[LVGL] %s", buf);
}
lv_log_register_print_cb(my_log_cb);

// 调试绘制
lv_display_set_color_format(disp, LV_COLOR_FORMAT_I1);
```

## 完整示例 (STM32 + LVGL)

```c
#include "lvgl.h"
#include "stm32_hal.h"

static lv_display_t *disp;
static lv_indev_t *indev;

void lvgl_init(void) {
    lv_init();

    // 1. 初始化显示
    disp = lv_display_create(480, 272);
    static lv_color_t buf[LVGL_BUF_SIZE];
    lv_display_set_buffers(disp, buf, NULL, sizeof(buf),
                           LV_DISPLAY_RENDER_MODE_PARTIAL);
    lv_display_set_flush_cb(disp, my_flush_cb);

    // 2. 初始化输入
    indev = lv_indev_create();
    lv_indev_set_type(indev, LV_INDEV_TYPE_POINTER);
    lv_indev_set_read_cb(indev, touch_read_cb);

    // 3. 创建 UI
    create_ui();
}

int main(void) {
    HAL_Init();
    SystemClock_Config();

    // 硬件初始化
    MX_GPIO_Init();
    MX_SPI1_Init();
    MX_LTDC_Init();
    my_lcd_init();
    my_touch_init();

    // LVGL 初始化
    lvgl_init();

    while (1) {
        lv_timer_handler();
        HAL_Delay(5);
    }
}
```

## 资源链接

| 资源 | 地址 |
| --- | --- |
| 官网 | https://lvgl.io |
| 文档 | https://docs.lvgl.io |
| GitHub | https://github.com/lvgl/lvgl |
| 论坛 | https://forum.lvgl.io |
| 在线模拟器 | https://lvgl.io/tools/simulator |

## 总结

LVGL 是嵌入式 GUI 开发的首选方案：

- ✅ **轻量高效**：适合资源受限的 MCU
- ✅ **功能完备**：30+ 控件满足大多数 UI 需求
- ✅ **生态完善**：丰富的文档和社区支持
- ✅ **持续更新**：v9 版本带来更好的性能和 API
- ✅ **跨平台**：一套代码，多平台运行

> **入门建议**：从官方模拟器开始，熟悉基本控件和事件机制，再迁移到实际硬件。

---

*注：LVGL v9 正在积极开发中，部分 API 可能有变化，建议参考最新官方文档。*
