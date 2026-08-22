---
title: LVGL 进阶实战：动画系统、事件处理与自定义控件
tags:
  - 嵌入式
  - LVGL
  - GUI
  - 动画
  - 进阶
createTime: 2026/08/23 02:22:58
permalink: /blog/lvgl-advanced/
---

> 本文深入讲解 LVGL 的动画系统、事件处理机制、自定义控件开发，以及实战中常见的问题与解决方案。

## 目录

1. [动画系统详解](#1-动画系统详解)
2. [事件处理机制](#2-事件处理机制)
3. [布局系统](#3-布局系统)
4. [自定义控件开发](#4-自定义控件开发)
5. [主题与样式进阶](#5-主题与样式进阶)
6. [国际化与字体](#6-国际化与字体)
7. [实战技巧](#7-实战技巧)

---

## 1. 动画系统详解

### 1.1 LVGL 动画框架

```
┌─────────────────────────────────────────────────────────────┐
│                     LVGL 动画架构                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐                                       │
│  │   Animation     │ ← 基础动画对象                        │
│  └────────┬────────┘                                       │
│           │                                                │
│           ▼                                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │                 AnimTimeline                       │    │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐           │    │
│  │  │ A1  │  │ A2  │  │ A3  │  │ A4  │           │    │
│  │  └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘           │    │
│  │     │        │        │        │                 │    │
│  │     └────────┴────────┴────────┘                 │    │
│  │                    │                              │    │
│  └────────────────────┼──────────────────────────────┘    │
│                       ▼                                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Animation Driver                     │    │
│  │  - 定时器管理                                    │    │
│  │  - 帧率控制                                     │    │
│  │  - 缓动函数                                     │    │
│  └─────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 基础动画

```c
// 基础动画示例
void basic_animation_example(void) {
    lv_obj_t *obj = lv_obj_create(lv_screen_active());
    lv_obj_set_size(obj, 100, 100);
    lv_obj_set_pos(obj, 50, 50);

    // 创建动画
    lv_anim_t anim;
    lv_anim_init(&anim);

    // 设置动画目标
    lv_anim_set_var(&anim, obj);

    // 设置持续时间
    lv_anim_set_duration(&anim, 1000);  // 1000ms = 1秒

    // 设置重复
    lv_anim_set_repeat_count(&anim, 3);  // 重复3次，0=无限
    lv_anim_set_repeat_delay(&anim, 500);  // 重复间隔500ms

    // 设置执行回调 (Y 坐标动画)
    lv_anim_set_exec_cb(&anim, (lv_anim_exec_xcb_t)lv_obj_set_y);

    // 设置值范围
    lv_anim_set_values(&anim, 50, 200);  // 从50移动到200

    // 设置缓动函数
    lv_anim_set_path_cb(&anim, lv_anim_path_ease_in_out);

    // 启动动画
    lv_anim_start(&anim);
}
```

### 1.3 缓动函数

```c
// LVGL 内置缓动函数
typedef enum {
    LV_ANIM_IMPULSE,       // 脉冲效果
    LV_ANIM_BOUNCE,         // 弹跳效果
    LV_ANIM_EASE_IN,        // 缓入
    LV_ANIM_EASE_OUT,       // 缓出
    LV_ANIM_EASE_IN_OUT,    // 缓入缓出
    LV_ANIM_LINEAR,         // 线性
    LV_ANIM_OVERSHOOT,      // 过冲
} lv_anim_path_ease_t;

/* 自定义缓动函数 */
static lv_anim_path_cb_t my_easing_callback;

static int32_t my_easing(int32_t start, int32_t end, uint32_t ratio)
{
    // 自定义缓动算法
    // ratio: 0-1024 表示 0%-100%
    float t = (float)ratio / 1024.0f;

    // 示例：使用 easeOutElastic
    float p = 0.3f;
    float s = p / 4.0f;

    if (t == 0.0f || t == 1.0f) {
        return end;
    }

    t -= 1.0f;
    return (int32_t)((end - start) * (
        pow(2.0f, -10.0f * t) *
        sin((t - s) * (2.0f * M_PI) / p) + 1.0f
    )) + start;
}

// 使用自定义缓动
lv_anim_set_path_cb(&anim, my_easing_callback);
```

### 1.4 AnimTimeline (v9 新特性)

```c
// AnimTimeline: 管理一组同步动画
void animtimeline_example(void) {
    // 创建时间线
    lv_anim_timeline_t *timeline = lv_anim_timeline_create();

    // 创建多个控件
    lv_obj_t *box1 = lv_obj_create(lv_screen_active());
    lv_obj_t *box2 = lv_obj_create(lv_screen_active());
    lv_obj_t *box3 = lv_obj_create(lv_screen_active());

    lv_obj_set_size(box1, 50, 50);
    lv_obj_set_size(box2, 50, 50);
    lv_obj_set_size(box3, 50, 50);

    lv_obj_set_pos(box1, 20, 100);
    lv_obj_set_pos(box2, 100, 100);
    lv_obj_set_pos(box3, 180, 100);

    // 配置动画1: box1 向上移动
    lv_anim_t anim1;
    lv_anim_init(&anim1);
    lv_anim_set_var(&anim1, box1);
    lv_anim_set_exec_cb(&anim1, (lv_anim_exec_xcb_t)lv_obj_set_y);
    lv_anim_set_values(&anim1, 100, 50);
    lv_anim_set_duration(&anim1, 500);

    // 配置动画2: box2 向上移动并缩放
    lv_anim_t anim2;
    lv_anim_init(&anim2);
    lv_anim_set_var(&anim2, box2);
    lv_anim_set_exec_cb(&anim2, (lv_anim_exec_xcb_t)lv_obj_set_y);
    lv_anim_set_values(&anim2, 100, 50);
    lv_anim_set_duration(&anim2, 500);

    // 配置动画3: box3 淡入
    lv_anim_t anim3;
    lv_anim_init(&anim3);
    lv_anim_set_var(&anim3, box3);
    lv_anim_set_exec_cb(&anim3, (lv_anim_exec_xcb_t)lv_obj_set_opacity);
    lv_anim_set_values(&anim3, 0, 255);
    lv_anim_set_duration(&anim3, 300);

    // 添加到时间线 (指定开始时间)
    lv_anim_timeline_add(timeline, 0, &anim1);        // 0ms 开始
    lv_anim_timeline_add(timeline, 200, &anim2);       // 200ms 开始
    lv_anim_timeline_add(timeline, 400, &anim3);       // 400ms 开始

    // 控制时间线
    lv_anim_timeline_start(timeline);
    // lv_anim_timeline_pause(timeline);
    // lv_anim_timeline_stop(timeline);
    // lv_anim_timeline_reverse(timeline);

    // 设置播放速度
    // lv_anim_timeline_set_speed(timeline, 2.0f);  // 2倍速
}
```

### 1.5 复杂动画示例

```c
// 页面切换动画
void page_transition_animation(lv_obj_t *old_page, lv_obj_t *new_page)
{
    lv_anim_timeline_t *timeline = lv_anim_timeline_create();

    // 旧页面滑出
    lv_anim_t old_out;
    lv_anim_init(&old_out);
    lv_anim_set_var(&old_out, old_page);
    lv_anim_set_exec_cb(&old_out, (lv_anim_exec_xcb_t)lv_obj_set_x);
    lv_anim_set_values(&old_out, 0, -LV_HOR_RES);
    lv_anim_set_duration(&old_out, 300);
    lv_anim_set_path_cb(&old_out, lv_anim_path_ease_in);

    // 新页面滑入
    lv_anim_t new_in;
    lv_anim_init(&new_in);
    lv_anim_set_var(&new_in, new_page);
    lv_anim_set_exec_cb(&new_in, (lv_anim_exec_xcb_t)lv_obj_set_x);
    lv_anim_set_values(&new_in, LV_HOR_RES, 0);
    lv_anim_set_duration(&new_in, 300);
    lv_anim_set_path_cb(&new_in, lv_anim_path_ease_out);

    // 新页面淡入
    lv_anim_t new_fade;
    lv_anim_init(&new_fade);
    lv_anim_set_var(&new_fade, new_page);
    lv_anim_set_exec_cb(&new_fade, (lv_anim_exec_xcb_t)lv_obj_set_opacity);
    lv_anim_set_values(&new_fade, 0, 255);
    lv_anim_set_duration(&new_fade, 200);

    lv_anim_timeline_add(timeline, 0, &old_out);
    lv_anim_timeline_add(timeline, 0, &new_in);
    lv_anim_timeline_add(timeline, 100, &new_fade);

    lv_anim_timeline_start(timeline);
}
```

---

## 2. 事件处理机制

### 2.1 事件架构

```
┌─────────────────────────────────────────────────────────────┐
│                     LVGL 事件系统                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────┐                                             │
│  │   User   │  用户代码                                     │
│  └─────┬─────┘                                             │
│        │                                                    │
│        ▼                                                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Event Callback                        │    │
│  │  void event_handler(lv_event_t *e) {            │    │
│  │      lv_event_code_t code = lv_event_get_code(e);│    │
│  │      lv_obj_t *target = lv_event_get_target(e);  │    │
│  │      // 处理事件                                   │    │
│  │  }                                                │    │
│  └─────────────────────────────────────────────────┘    │
│        ▲                                                    │
│        │ lv_event_send()                               │
│        │                                                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Event Queue                          │    │
│  │  - 按优先级排序                                   │    │
│  │  - 冒泡机制 (可选)                              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 事件类型

```c
// LVGL 事件类型
typedef enum {
    /* 通用事件 */
    LV_EVENT_ALL,
    LV_EVENT_PRESSED,
    LV_EVENT_PRESSING,
    LV_EVENT_PRESS_LOST,
    LV_EVENT_SHORT_CLICKED,
    LV_EVENT_LONG_PRESSED,
    LV_EVENT_LONG_PRESSED_REPEAT,
    LV_EVENT_CLICKED,
    LV_EVENT_RELEASED,
    LV_EVENT_SCROLL,
    LV_EVENT_SCROLL_END,
    LV_EVENT_GESTURE,

    /* 焦点事件 */
    LV_EVENT_FOCUSED,
    LV_EVENT_DEFOCUSED,
    LV_EVENT_FOCUS,

    /* 尺寸/位置事件 */
    LV_EVENT_SIZE_CHANGED,
    LV_EVENT_POS_CHANGED,

    /* 绘制事件 */
    LV_EVENT_DRAW_MAIN,
    LV_EVENT_DRAW_MAIN_BEGIN,
    LV_EVENT_DRAW_MAIN_END,
    LV_EVENT_DRAW_POST,
    LV_EVENT_DRAW_POST_BEGIN,
    LV_EVENT_DRAW_POST_END,

    /* 值变化事件 */
    LV_EVENT_VALUE_CHANGED,

    /* 状态变化事件 */
    LV_EVENT_STATE_CHANGED,

    /* 输入设备事件 */
    LV_EVENT_CHILD_CHANGED,
    LV_EVENT_CHILD_CREATED,
    LV_EVENT_CHILD_DELETED,

    /* 对话框/消息框事件 */
    LV_EVENT_DELETE,
    LV_EVENT_CANCEL,
    LV_EVENT_OK,

    /* 屏幕事件 */
    LV_EVENT_SCREEN_LOAD_START,
    LV_EVENT_SCREEN_LOADED,
    LV_EVENT_SCREEN_UNLOAD_START,
    LV_EVENT_SCREEN_UNLOADED,

    /* 定时器事件 */
    LV_EVENT_TIMER,
} lv_event_code_t;
```

### 2.3 事件处理示例

```c
// 按钮点击事件
void btn_click_handler(lv_event_t *e)
{
    lv_event_code_t code = lv_event_get_code(e);
    lv_obj_t *btn = lv_event_get_target(e);

    if (code == LV_EVENT_CLICKED) {
        LV_LOG_USER("Button clicked!");

        // 获取用户数据
        int *btn_id = (int *)lv_event_get_user_data(e);
        LV_LOG_USER("Button ID: %d", *btn_id);

        // 获取当前文字
        lv_obj_t *label = lv_obj_get_child(btn, 0);
        const char *text = lv_label_get_text(label);
        LV_LOG_USER("Button text: %s", text);
    }
    else if (code == LV_EVENT_PRESSED) {
        // 按下时的视觉反馈
        lv_obj_set_style_bg_color(btn, lv_color_hex(0x0055BB), 0);
    }
    else if (code == LV_EVENT_RELEASED) {
        // 释放时恢复
        lv_obj_set_style_bg_color(btn, lv_color_hex(0x007AFE), 0);
    }
}

// 添加事件
void setup_button_events(void)
{
    lv_obj_t *btn = lv_button_create(lv_screen_active());

    static int btn_id = 1;
    lv_obj_add_event_cb(btn, btn_click_handler, LV_EVENT_ALL, &btn_id);
}
```

### 2.4 事件冒泡

```c
// 启用事件冒泡
void bubble_example(void)
{
    lv_obj_t *container = lv_obj_create(lv_screen_active());
    lv_obj_set_size(container, 300, 200);
    lv_obj_align(container, LV_ALIGN_CENTER, 0, 0);

    // 启用冒泡
    lv_obj_add_flag(container, LV_OBJ_FLAG_EVENT_BUBBLE);

    // 添加按钮到容器
    lv_obj_t *btn = lv_button_create(container);
    lv_obj_set_size(btn, 100, 40);
    lv_obj_center(btn);

    lv_obj_t *label = lv_label_create(btn);
    lv_label_set_text(label, "Click me");
    lv_obj_center(label);

    // 在容器上监听事件 (会收到按钮的事件)
    lv_obj_add_event_cb(container, container_event_handler,
                        LV_EVENT_CLICKED, NULL);
}

void container_event_handler(lv_event_t *e)
{
    lv_obj_t *target = lv_event_get_target(e);  // 实际触发事件的控件
    lv_obj_t *current = lv_event_get_current_target(e);  // 监听事件的控件

    LV_LOG_USER("Event on %s (container %s)",
                lv_obj_get_class_name(target),
                lv_obj_get_class_name(current));
}
```

### 2.5 事件过滤器

```c
// 事件过滤器
lv_res_t event_filter(lv_event_t *e)
{
    lv_event_code_t code = lv_event_get_code(e);

    // 过滤掉短按事件
    if (code == LV_EVENT_SHORT_CLICKED) {
        LV_LOG_USER("Short click filtered out!");
        return LV_RES_OK;  // 阻止事件传递
    }

    // 其他事件继续传递
    return LV_RES_INV;
}

// 添加过滤器
lv_obj_add_event_cb(obj, event_filter, LV_EVENT_FILTER, NULL);
```

### 2.6 异步事件

```c
// 异步事件处理
void async_event_example(void)
{
    // 模拟耗时操作完成后更新 UI
    lv_async_call(update_ui_callback, some_data);

    // 或者使用定时器模拟
    lv_timer_t *timer = lv_timer_create(async_task, 1000, NULL);
}

void async_task(lv_timer_t *timer)
{
    // 执行异步操作
    do_background_work();

    // 更新 UI (在主线程中安全执行)
    lv_obj_t *label = lv_label_create(lv_screen_active());
    lv_label_set_text(label, "Work done!");
}
```

---

## 3. 布局系统

### 3.1 布局类型

```
┌─────────────────────────────────────────────────────────────┐
│                    LVGL 布局系统                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐        │
│  │     Flex 布局        │  │     Grid 布局       │        │
│  │                      │  │                      │        │
│  │  ┌───┐ ┌───┐ ┌───┐ │  │  ┌───┬───┬───┐     │        │
│  │  │ A │ │ B │ │ C │ │  │  │ A │ B │ C │     │        │
│  │  └───┘ └───┘ └───┘ │  │  ├───┼───┼───┤     │        │
│  │  ┌───┐ ┌───┐       │  │  │ D │ E │ F │     │        │
│  │  │ D │ │ E │       │  │  └───┴───┴───┘     │        │
│  │  └───┘ └───┘       │  │                      │        │
│  └─────────────────────┘  └─────────────────────┘        │
│                                                             │
│  ┌─────────────────────┐                                  │
│  │    垫子 (Padding)    │                                  │
│  │  ┌───────────────┐   │                                  │
│  │  │    margin    │   │                                  │
│  │  │  ┌─────────┐ │   │                                  │
│  │  │  │  padding │ │   │                                  │
│  │  │  │ ┌─────┐ │ │   │                                  │
│  │  │  │ │content│ │ │   │                                  │
│  │  │  │ └─────┘ │ │   │                                  │
│  │  │  │         │ │   │                                  │
│  │  │  └─────────┘ │   │                                  │
│  │  │              │   │                                  │
│  │  └───────────────┘   │                                  │
│  └─────────────────────┘                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Flex 布局

```c
// Flex 布局示例
void flex_layout_example(void)
{
    lv_obj_t *container = lv_obj_create(lv_screen_active());
    lv_obj_set_size(container, 320, 200);
    lv_obj_align(container, LV_ALIGN_CENTER, 0, 0);

    // 设置为 Flex 布局
    lv_obj_set_layout(container, LV_LAYOUT_FLEX);

    // 配置布局属性
    lv_obj_set_flex_flow(container, LV_FLEX_FLOW_ROW_WRAP);  // 换行
    lv_obj_set_flex_align(container,
                          LV_FLEX_ALIGN_SPACE_BETWEEN,  // 主轴对齐
                          LV_FLEX_ALIGN_CENTER,         // 交叉轴对齐
                          LV_FLEX_ALIGN_CENTER);        // 项目对齐

    // 添加子控件
    for (int i = 0; i < 6; i++) {
        lv_obj_t *item = lv_button_create(container);
        lv_obj_set_size(item, 80, 40);

        lv_obj_t *label = lv_label_create(item);
        lv_label_set_text_fmt(label, "Item %d", i + 1);
        lv_obj_center(label);

        // 设置 Flex 属性
        lv_obj_set_flex_grow(item, 1);  // 等宽扩展
    }
}

// Flex 对齐方式
void flex_align_example(void)
{
    lv_obj_t *container = lv_obj_create(lv_screen_active());
    lv_obj_set_layout(container, LV_LAYOUT_FLEX);
    lv_obj_set_flex_flow(container, LV_FLEX_FLOW_COLUMN);

    // 主轴: start/center/end/space_evenly/space_between/space_around
    // 交叉轴: start/center/end/stretch
    // 项目: start/center/end/stretch/basis

    lv_obj_set_flex_align(container,
                          LV_FLEX_ALIGN_SPACE_BETWEEN,
                          LV_FLEX_ALIGN_CENTER,
                          LV_FLEX_ALIGN_CENTER);
}

// 居中对齐
void center_align(void)
{
    lv_obj_t *parent = lv_obj_create(lv_screen_active());

    lv_obj_t *child = lv_label_create(parent);
    lv_obj_center(child);  // 相对于父控件居中

    // 或者
    lv_obj_align(child, LV_ALIGN_CENTER, 0, 0);

    // 带偏移
    lv_obj_align(child, LV_ALIGN_CENTER, 10, -20);
}
```

### 3.3 Grid 布局

```c
// Grid 布局示例
void grid_layout_example(void)
{
    lv_obj_t *container = lv_obj_create(lv_screen_active());
    lv_obj_set_size(container, 320, 200);
    lv_obj_align(container, LV_ALIGN_CENTER, 0, 0);

    // 设置为 Grid 布局
    lv_obj_set_layout(container, LV_LAYOUT_GRID);

    // 设置列和行模板
    // 3列: 每列等宽
    static int32_t col_dsc[] = {80, 80, 80, LV_GRID_TEMPLATE_LAST};
    // 3行: 第一行60, 第二行60, 第三行剩余空间
    static int32_t row_dsc[] = {60, 60, LV_GRID_FR(1), LV_GRID_TEMPLATE_LAST};

    lv_obj_set_grid_dsc_array(container, col_dsc, row_dsc);

    // 添加子控件并设置位置
    const char *btns[] = {"AC", "+/-", "%", "/",
                          "7", "8", "9", "*",
                          "4", "5", "6", "-",
                          "1", "2", "3", "+",
                          "0", ".", "=", ""};

    for (int i = 0; i < 16; i++) {
        lv_obj_t *btn = lv_button_create(container);

        // 设置 Grid 位置
        int col = i % 4;
        int row = i / 4;

        // 0号按钮占2列
        if (i == 12) {
            lv_obj_set_grid_cell(btn, LV_GRID_ALIGN_STRETCH, col, 1,
                                LV_GRID_ALIGN_STRETCH, row, 1);
        } else if (i == 15) {
            lv_obj_set_grid_cell(btn, LV_GRID_ALIGN_STRETCH, 2, 2,
                                LV_GRID_ALIGN_STRETCH, row, 1);
        } else {
            lv_obj_set_grid_cell(btn, LV_GRID_ALIGN_STRETCH, col, 1,
                                LV_GRID_ALIGN_STRETCH, row, 1);
        }

        lv_obj_t *label = lv_label_create(btn);
        lv_label_set_text(label, btns[i]);
        lv_obj_center(label);
    }
}
```

### 3.4 垫子与间距

```c
// 垫子设置
void padding_example(void)
{
    lv_obj_t *obj = lv_obj_create(lv_screen_active());

    // 内边距 (子控件与父控件边缘的距离)
    lv_obj_set_style_pad_top(obj, 10, 0);
    lv_obj_set_style_pad_bottom(obj, 10, 0);
    lv_obj_set_style_pad_left(obj, 20, 0);
    lv_obj_set_style_pad_right(obj, 20, 0);

    // 简写方式
    lv_obj_set_style_pad_gap(obj, 5, 0);  // 子控件间距

    // 外边距 (父控件与自身的距离) - 使用位置属性
}

// 全局垫子设置
void global_padding_setup(void)
{
    // 在主题中设置
    static lv_theme_t *th;
    lv_theme_set_parent(th, base_theme);
    lv_theme_set_apply_cb(th, my_theme_apply_cb);
}

static void my_theme_apply_cb(lv_theme_t *th, lv_obj_t *obj)
{
    lv_obj_set_style_pad_4px(obj, th->style.pad_small);
    lv_obj_set_style_pad_gap(obj, th->style.pad_gap);
}
```

---

## 4. 自定义控件开发

### 4.1 控件结构

```
┌─────────────────────────────────────────────────────────────┐
│                    LVGL 控件结构                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              lv_obj_t (基类)                        │  │
│  │  - 位置/尺寸                                        │  │
│  │  - 样式                                             │  │
│  │  - 事件                                             │  │
│  │  - 子控件链表                                       │  │
│  └─────────────────────────────────────────────────────┘  │
│                         ▲                                  │
│                         │ 继承                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Custom Widget (自定义控件)              │  │
│  │  - 扩展结构体 (自定义数据)                         │  │
│  │  - 绘制回调                                         │  │
│  │  - 事件回调                                         │  │
│  │  - 信号回调                                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 自定义控件示例：进度圆环

```c
/* my_circle_progress.h */
#ifndef MY_CIRCLE_PROGRESS_H
#define MY_CIRCLE_PROGRESS_H

#include "lvgl/lvgl.h"

/* 控件扩展结构体 */
typedef struct {
    lv_obj_t obj;          // 基类
    int32_t value;        // 当前值 (0-100)
    int32_t max_value;    // 最大值
    int32_t line_width;   // 线条宽度
    lv_color_t bg_color;  // 背景颜色
    lv_color_t fg_color;  // 前景颜色
} my_circle_progress_t;

/* 控件类 */
extern const lv_obj_class_t my_circle_progress_class;

/* API 函数 */
lv_obj_t * my_circle_progress_create(lv_obj_t *parent);
void my_circle_progress_set_value(lv_obj_t *obj, int32_t value);
int32_t my_circle_progress_get_value(lv_obj_t *obj);
void my_circle_progress_set_range(lv_obj_t *obj, int32_t min, int32_t max);
void my_circle_progress_set_colors(lv_obj_t *obj,
                                   lv_color_t bg,
                                   lv_color_t fg);

#endif
```

```c
/* my_circle_progress.c */
#include "my_circle_progress.h"
#include <math.h>

/* 控件类定义 */
const lv_obj_class_t my_circle_progress_class = {
    .constructor_cb = my_circle_progress_constructor,
    .destructor_cb = my_circle_progress_destructor,
    .event_cb = my_circle_progress_event,
    .width_def = 100,
    .height_def = 100,
    .group_def = LV_OBJ_CLASS_GROUP_DEF_INHERIT,
    .instance_size = sizeof(my_circle_progress_t),
};

/* 创建控件 */
lv_obj_t * my_circle_progress_create(lv_obj_t *parent)
{
    return lv_obj_create_from_class(&my_circle_progress_class, parent);
}

/* 构造函数 */
static void my_circle_progress_constructor(const lv_obj_class_t *class_p,
                                          lv_obj_t *obj)
{
    LV_UNUSED(class_p);
    my_circle_progress_t *ctrl = (my_circle_progress_t *)obj;

    ctrl->value = 0;
    ctrl->max_value = 100;
    ctrl->line_width = 10;
    ctrl->bg_color = lv_color_hex(0x333333);
    ctrl->fg_color = lv_color_hex(0x007AFE);

    /* 添加绘制回调 */
    lv_obj_add_flag(obj, LV_OBJ_FLAG_DRAW_AS_CUSTOM);
    lv_obj_set_ext_click_area(obj, 10);
}

/* 析构函数 */
static void my_circle_progress_destructor(const lv_obj_class_t *class_p,
                                        lv_obj_t *obj)
{
    LV_UNUSED(class_p);
    LV_UNUSED(obj);
    /* 释放资源 */
}

/* 事件处理 */
static void my_circle_progress_event(const lv_obj_class_t *class_p,
                                    lv_obj_t *obj,
                                    lv_event_t *e)
{
    LV_UNUSED(class_p);

    lv_event_code_t code = lv_event_get_code(e);
    if (code == LV_EVENT_REFR_EXT_DRAW_SIZE) {
        /* 设置额外绘制区域 */
        my_circle_progress_t *ctrl = (my_circle_progress_t *)obj;
        lv_coord_t *s = lv_event_get_param(e);
        *s = LV_MAX(*s, ctrl->line_width);
    }
    else if (code == LV_EVENT_DRAW_CUSTOM) {
        /* 自定义绘制 */
        my_circle_progress_draw(obj, e);
    }
}

/* 自定义绘制函数 */
static void my_circle_progress_draw(lv_obj_t *obj, lv_event_t *e)
{
    my_circle_progress_t *ctrl = (my_circle_progress_t *)obj;
    lv_draw_task_t *draw_task = lv_event_get_draw_task(e);
    lv_draw_dsc_base_t *draw_dsc_base = lv_event_get_param(e);

    /* 获取绘制区域 */
    lv_area_t coords;
    lv_obj_get_coords(obj, &coords);

    int32_t w = lv_area_get_width(&coords);
    int32_t h = lv_area_get_height(&coords);
    int32_t cx = coords.x1 + w / 2;
    int32_t cy = coords.y1 + h / 2;
    int32_t r = (LV_MIN(w, h) - ctrl->line_width) / 2;

    /* 计算角度 */
    int32_t angle = (ctrl->value * 360) / ctrl->max_value;

    /* 绘制背景圆弧 */
    lv_draw_arc_dsc_t arc_dsc;
    lv_draw_arc_dsc_init(&arc_dsc);
    arc_dsc.color = ctrl->bg_color;
    arc_dsc.width = ctrl->line_width;
    arc_dsc.start_angle = 0;
    arc_dsc.end_angle = 360;

    lv_draw_arc(cx, cy, r, &arc_dsc, draw_task->draw_dsc);

    /* 绘制前景圆弧 */
    if (angle > 0) {
        arc_dsc.color = ctrl->fg_color;
        arc_dsc.end_angle = angle;
        lv_draw_arc(cx, cy, r, &arc_dsc, draw_task->draw_dsc);
    }
}

/* API 实现 */
void my_circle_progress_set_value(lv_obj_t *obj, int32_t value)
{
    my_circle_progress_t *ctrl = (my_circle_progress_t *)obj;
    ctrl->value = value;
    if (ctrl->value > ctrl->max_value) {
        ctrl->value = ctrl->max_value;
    }
    lv_obj_invalidate(obj);
}

int32_t my_circle_progress_get_value(lv_obj_t *obj)
{
    return ((my_circle_progress_t *)obj)->value;
}

void my_circle_progress_set_range(lv_obj_t *obj, int32_t min, int32_t max)
{
    my_circle_progress_t *ctrl = (my_circle_progress_t *)obj;
    ctrl->max_value = max;
    if (ctrl->value > max) {
        ctrl->value = max;
    }
    lv_obj_invalidate(obj);
}

void my_circle_progress_set_colors(lv_obj_t *obj,
                                   lv_color_t bg,
                                   lv_color_t fg)
{
    my_circle_progress_t *ctrl = (my_circle_progress_t *)obj;
    ctrl->bg_color = bg;
    ctrl->fg_color = fg;
    lv_obj_invalidate(obj);
}
```

### 4.3 使用自定义控件

```c
void custom_widget_usage(void)
{
    /* 创建进度圆环 */
    lv_obj_t *progress = my_circle_progress_create(lv_screen_active());
    lv_obj_set_size(progress, 150, 150);
    lv_obj_center(progress);

    /* 设置属性 */
    my_circle_progress_set_range(progress, 0, 100);
    my_circle_progress_set_value(progress, 75);
    my_circle_progress_set_colors(progress,
                                  lv_color_hex(0x333333),
                                  lv_color_hex(0x00FF00));

    /* 动画更新值 */
    lv_anim_t anim;
    lv_anim_init(&anim);
    lv_anim_set_var(&anim, progress);
    lv_anim_set_exec_cb(&anim, (lv_anim_exec_xcb_t)my_circle_progress_set_value);
    lv_anim_set_values(&anim, 0, 100);
    lv_anim_set_duration(&anim, 2000);
    lv_anim_set_path_cb(&anim, lv_anim_path_ease_in_out);
    lv_anim_set_repeat_count(&anim, LV_ANIM_REPEAT_INFINITE);
    lv_anim_start(&anim);
}
```

---

## 5. 主题与样式进阶

### 5.1 样式结构

```c
// 样式结构
typedef struct {
    /* 基础属性 */
    lv_opa_t bg_opa;           // 背景透明度
    lv_color_t bg_color;       // 背景颜色
    lv_grad_dsc_t bg_grad;     // 渐变

    /* 边框 */
    lv_color_t border_color;
    lv_opa_t border_opa;
    int32_t border_width;
    lv_border_side_t border_side;

    /* 轮廓 */
    lv_color_t outline_color;
    int32_t outline_width;
    int32_t outline_pad;

    /* 阴影 */
    lv_color_t shadow_color;
    int32_t shadow_width;
    int32_t shadow_spread;
    int32_t shadow_ofs_x;
    int32_t shadow_ofs_y;

    /* 圆角 */
    int32_t radius;

    /* 文本 */
    lv_color_t text_color;
    const lv_font_t *text_font;
    int32_t text_letter_space;
    int32_t text_line_space;
    lv_text_align_t text_align;

    /* 图像 */
    lv_color_t img_recolor;
    lv_opa_t img_recolor_opa;

    /* 尺寸 */
    int32_t width;
    int32_t height;
    int32_t min_width;
    int32_t min_height;
    int32_t max_width;
    int32_t max_height;

    /* 布局 */
    int32_t pad_top;
    int32_t pad_bottom;
    int32_t pad_left;
    int32_t pad_right;
    int32_t pad_gap;

    /* 变换 */
    float scale_x;
    float scale_y;
    int32_t translate_x;
    int32_t translate_y;
    float rotation;
    int32_t transform_zoom;
    int32_t transform_angle;
} lv_style_t;
```

### 5.2 动态样式切换

```c
// 动态主题切换
void theme_switch_example(void)
{
    static lv_theme_t *themes[2];
    static int current_theme = 0;

    // 创建两个主题
    themes[0] = create_light_theme();
    themes[1] = create_dark_theme();

    // 应用当前主题
    lv_disp_set_theme(lv_display_get_default(), themes[current_theme]);

    // 切换按钮
    lv_obj_t *btn = lv_button_create(lv_screen_active());
    lv_obj_add_event_cb(btn, switch_theme, LV_EVENT_CLICKED, NULL);
}

void switch_theme(lv_event_t *e)
{
    static int current = 0;
    current = 1 - current;  // 切换主题

    lv_theme_t *th = (current == 0) ? light_theme : dark_theme;
    lv_disp_set_theme(lv_display_get_default(), th);
}
```

### 5.3 渐变样式

```c
// 渐变背景
void gradient_style_example(void)
{
    lv_obj_t *obj = lv_obj_create(lv_screen_active());
    lv_obj_set_size(obj, 300, 100);
    lv_obj_center(obj);

    // 定义渐变
    lv_grad_dsc_t grad;
    grad.dir = LV_GRAD_DIR_VER;  // 垂直渐变
    grad.stops_count = 2;
    grad.stops[0].color = lv_color_hex(0x007AFE);
    grad.stops[0].stop = 0;
    grad.stops[1].color = lv_color_hex(0x00D4FF);
    grad.stops[1].stop = 100;

    lv_obj_set_style_bg_grad(obj, &grad, 0);
    lv_obj_set_style_bg_grad_dir(obj, LV_GRAD_DIR_VER, 0);
    lv_obj_set_style_radius(obj, 50, 0);  // 圆角
}
```

---

## 6. 国际化与字体

### 6.1 字体格式

```
┌─────────────────────────────────────────────────────────────┐
│                    LVGL 字体格式                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 内置字体 (编译时嵌入)                                   │
│     ┌─────────────────────────────────────────────┐        │
│     │  lv_font_montserrat_12 ~ lv_font_montserrat_48  │    │
│     │  支持: ASCII, 部分扩展 Latin, 数字          │        │
│     └─────────────────────────────────────────────┘        │
│                                                             │
│  2. 转换字体 (TTF/OTF → LVGL)                             │
│     ┌─────────────────────────────────────────────┐        │
│     │  lv_font_conv --font font.ttf -o output.c   │        │
│     │                     --size 24 --bpp 4       │        │
│     └─────────────────────────────────────────────┘        │
│                                                             │
│  3. 字体压缩 (BPP = Bits Per Pixel)                        │
│     ┌─────────────────────────────────────────────┐        │
│     │  BPP 1: 2 色    (0/1)                     │        │
│     │  BPP 2: 4 色    (0-3)                     │        │
│     │  BPP 4: 16 色   (0-15) ← 推荐            │        │
│     │  BPP 8: 256 色  (0-255) ← 最高质量       │        │
│     └─────────────────────────────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 字体转换

```bash
# 安装字体转换工具
pip install lv_font_conv

# 转换中文字体 (推荐使用)
lv_font_conv \
    --font SourceHanSansCN-Regular.otf \
    --size 24 \
    --bpp 4 \
    --range 0x20-0x7F \      # ASCII
    --range 0x4E00-0x9FA5 \  # CJK 统一汉字
    --no-compress \
    --output my_font_24.c

# 转换带中文的字体
lv_font_conv \
    --font NotoSansSC-Regular.otf \
    --size 16 \
    --bpp 4 \
    --range 0x20-0x7F \
    --range 0x4E00-0x9FA5 \
    --no-prefilter \
    --output chinese_font_16.c

# 转换 Emoji 字体
lv_font_conv \
    --font NotoEmoji-Regular.ttf \
    --size 24 \
    --bpp 4 \
    --output emoji_font.c
```

### 6.3 多语言支持

```c
// 多语言字符串表
typedef struct {
    const char *zh;
    const char *en;
    const char *ja;
} ui_string_t;

// UI 字符串
static const ui_string_t strings[] = {
    [STR_HELLO]     = {"你好", "Hello", "こんにちは"},
    [STR_SETTINGS]   = {"设置", "Settings", "設定"},
    [STR_WIFI]      = {"WiFi", "WiFi", "WiFi"},
    [STR_CONNECTED] = {"已连接", "Connected", "接続済み"},
    [STR_ERROR]     = {"错误", "Error", "エラー"},
};

// 当前语言
static int current_lang = 0;  // 0=中文, 1=英文, 2=日文

const char * get_string(int str_id)
{
    switch (current_lang) {
        case 0: return strings[str_id].zh;
        case 1: return strings[str_id].en;
        case 2: return strings[str_id].ja;
        default: return strings[str_id].en;
    }
}

// 使用
lv_label_set_text(label, get_string(STR_HELLO));
```

---

## 7. 实战技巧

### 7.1 减少内存占用

```c
// 技巧1: 使用部分缓冲
void reduce_memory(void)
{
    lv_display_t *disp = lv_display_get_default();

    // 使用部分缓冲而非全屏缓冲
    static lv_color_t buf[LV_HOR_RES * 40];  // 只缓冲部分行
    lv_display_set_buffers(disp, buf, NULL, sizeof(buf),
                           LV_DISPLAY_RENDER_MODE_PARTIAL);
}

// 技巧2: 禁用不必要的功能
// lv_conf.h
#define LV_USE_ANIMATION        1   // 动画 (如不需要可关闭)
#define LV_USE_SHADOW           1   // 阴影
#define LV_USE_ARC             1   // 圆弧
#define LV_USE_BAR             1   // 进度条
#define LV_USE_CHECKBOX        1   // 复选框
#define LV_USE_DROPDOWN        1   // 下拉框

// 技巧3: 使用较小的 BPP 字体
// BPP 4 足够大多数场景
```

### 7.2 提升性能

```c
// 性能优化技巧

// 1. 减少不必要的重绘
void optimize_redraw(void)
{
    lv_obj_t *obj = lv_obj_create(lv_screen_active());

    // 标记为不透明，减少合成计算
    lv_obj_set_style_bg_opa(obj, LV_OPA_COVER, 0);

    // 减少不必要的 invalidate
    // 不要在定时器中频繁更新 UI
}

// 2. 使用对象池
static lv_obj_t *button_pool[10];
static int pool_index = 0;

lv_obj_t * get_button(void)
{
    if (pool_index < 10) {
        return button_pool[pool_index++];
    }
    return lv_button_create(lv_screen_active());
}

// 3. 批量更新
void batch_update(void)
{
    lv_obj_add_flag(container, LV_OBJ_FLAG_HIDDEN);

    // 批量添加子控件
    for (int i = 0; i < 10; i++) {
        lv_obj_t *item = lv_label_create(container);
        // ...
    }

    lv_obj_remove_flag(container, LV_OBJ_FLAG_HIDDEN);  // 一次性显示
}
```

### 7.3 触摸屏校准

```c
// 触摸屏校准
typedef struct {
    int16_t x[3];
    int16_t y[3];
    int32_t x_inv;
    int32_t y_inv;
    int32_t x_offs;
    int32_t y_offs;
} touch_calibration_t;

static touch_calibration_t cal;

void touch_calibrate(void)
{
    lv_point_t points[3] = {
        {20, 20},      // 左上
        {LCD_WIDTH-20, 20},   // 右上
        {LCD_WIDTH/2, LCD_HEIGHT-20}  // 底部中间
    };

    // 显示校准点，等待触摸
    for (int i = 0; i < 3; i++) {
        // 显示十字
        draw_crosshair(points[i].x, points[i].y);

        // 等待触摸，获取原始坐标
        lv_point_t raw;
        wait_touch(&raw);

        cal.x[i] = raw.x;
        cal.y[i] = raw.y;
    }

    // 计算校准参数
    // ...
}

void apply_touch_calibration(lv_point_t *raw, lv_point_t *calibrated)
{
    calibrated->x = (raw->x - cal.x_offs) * cal.x_inv / 1000;
    calibrated->y = (raw->y - cal.y_offs) * cal.y_inv / 1000;
}
```

### 7.4 屏幕截图

```c
// 导出屏幕为 PNG (需要 SDL 或其他图像库)
void screenshot_example(void)
{
    lv_obj_t *scr = lv_screen_active();

    // 获取屏幕区域
    lv_area_t coords;
    lv_obj_get_coords(scr, &coords);

    // 创建图像缓冲区
    uint32_t w = lv_area_get_width(&coords);
    uint32_t h = lv_area_get_height(&coords);
    uint8_t *buf = malloc(w * h * 4);

    // 绘制到缓冲区
    lv_draw_image_dsc_t dsc;
    lv_draw_image_dsc_init(&dsc);

    // 注意: LVGL 本身不直接支持导出 PNG
    // 需要结合底层的图像编码库实现
}
```

---

## 总结

本文深入讲解了 LVGL 的进阶特性：

| 主题 | 关键点 |
| --- | --- |
| **动画系统** | AnimTimeline、同步动画、自定义缓动 |
| **事件处理** | 事件冒泡、过滤器、异步事件 |
| **布局系统** | Flex、Grid、垫子控制 |
| **自定义控件** | 扩展结构体、绘制回调、信号机制 |
| **主题样式** | 动态主题、渐变、状态样式 |
| **国际化** | 字体转换、多语言支持 |
| **实战技巧** | 内存优化、性能优化、校准 |

> **进阶建议**：从自定义控件开始深入理解 LVGL 的架构，这是成为 LVGL 高手的关键。

---

## 参考资源

| 资源 | 地址 |
| --- | --- |
| LVGL 官网 | https://lvgl.io |
| LVGL 文档 | https://docs.lvgl.io |
| GitHub | https://github.com/lvgl/lvgl |
| 论坛 | https://forum.lvgl.io |
| 字体转换工具 | https://github.com/lvgl/lv_font_conv |
