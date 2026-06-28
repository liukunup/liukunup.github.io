---
title: CLI-Anything：让所有软件成为 Agent 的原生工具
createTime: 2026/06/28 00:00:00
permalink: /ai/agent/cli-anything/
tags:
  - CLI-Anything
  - HKUDS
  - AI Agent
  - Agent 原生软件
  - 自动化 CLI 生成
---

# CLI-Anything：让所有软件成为 Agent 的原生工具

> **今天的软件为人而生，明天的用户是 Agent。** CLI-Anything 旨在连接 AI Agent 与全世界软件——一行命令，让任意有代码库的软件自动生成结构化 CLI，从而被 Agent 原生调用。

<!-- more -->

## 是什么

**CLI-Anything** 是港大数据智能实验室（[HKUDS](https://github.com/HKUDS)）开源的项目，目标是把"为人设计的 GUI 软件"自动转成"为 Agent 设计的结构化 CLI"。它包含两个核心组件：

- **生成器（Generator）**：以插件 / Skill 形式运行在 Claude Code、OpenCode、OpenClaw、Codex 等 AI 编程工具中，通过 7 阶段流水线把目标软件源码转成可安装的 Python CLI 包。
- **CLI-Hub**：社区贡献的 CLI 注册中心，`pip install cli-anything-hub` 即可浏览、安装、更新、卸载已生成的 CLI 工具。

| 维度 | 内容 |
| :--- | :--- |
| 仓库 | [github.com/HKUDS/CLI-Anything](https://github.com/HKUDS/CLI-Anything) |
| 技术报告 | [arXiv:2606.03854](https://arxiv.org/abs/2606.03854) — *CLI-Anything: Towards Agent-Native Computer Use* |
| 作者 | Yuhao Yang、Tianyu Fan、Chao Huang（HKUDS，2026） |
| 协议 | Apache 2.0 |
| 规模 | ⭐ 44k+ / Fork 4.1k+ / 845+ commits |
| CLI-Hub | [hkuds.github.io/CLI-Anything](https://hkuds.github.io/CLI-Anything/) |
| 技术栈 | Python ≥ 3.10 · Click · Pytest · JSON 输出 |

## 为什么是 CLI

Agent 操作真实软件时面临"操控鸿沟"：推理能力很强，但调用专业软件能力很弱。现有方案各有缺陷：

| 现有方案 | 痛点 |
| :--- | :--- |
| GUI 自动化（截图 + 点击） | 脆弱，几天就崩 |
| 裸 Web API | 零散、缺乏状态、文档不易发现 |
| 自研阉割版 | 丢失 90% 专业能力 |
| 等厂商出官方 Agent API | 慢、不通用 |

**CLI 恰好是人与 Agent 共通的万能接口**：

- **结构化、可组合** — 文本命令天然匹配 LLM 的输入格式，可自由串联
- **轻量且通用** — 几乎零开销、跨平台、不依赖额外环境
- **自描述** — 一个 `--help` 就能让 Agent 自动发现所有功能
- **确定且可靠** — 输出稳定，Agent 行为可预测
- **结构化输出** — 内置 `--json` 参数，Agent 无需额外解析
- **久经验证** — Claude Code 每天通过 CLI 执行数以千计的真实任务

## 它能做什么

CLI-Anything 不止于"把一个 GUI 软件包成 CLI"，而是要构建一个 **Agent 原生软件生态**：

- **让 Agent 接管工作流** — 把代码库扔给 `/cli-anything`，立刻得到一套 Agent 可调用的完整 CLI（GIMP、Blender、Shotcut、LibreOffice、OBS Studio……）
- **把散装 API 统一成一个 CLI** — 把 Web 服务文档或 SDK 手册喂给生成器，得到一个**有状态、功能完整**的 CLI，整合零散接口
- **取代 GUI Agent，或让它更强** — 纯命令行操作，无需截图与像素点击；并可基于生成的 CLI 全自动构建 Agent 任务、评测器和 Benchmark

## 7 阶段全自动流水线

CLI-Anything 之所以能"一行命令生成完整 CLI"，核心是把生成过程拆成 7 个可验证的阶段：

1. 🔍 **分析** — 扫描源码，将 GUI 操作映射到内部 API
2. 📐 **设计** — 规划命令分组、状态模型、输出格式
3. 🔨 **实现** — 构建基于 Click 的 CLI，包含 REPL、JSON 输出、撤销/重做
4. 📋 **规划测试** — 生成 TEST.md，涵盖单元测试与端到端测试计划
5. 🧪 **编写测试** — 实现完整测试套件
6. 📝 **文档** — 更新 TEST.md，写入测试结果
7. 📦 **发布** — 生成 `setup.py`，安装到 PATH

每一阶段都有明确产出，且全程通过 `cli-anything-plugin/HARNESS.md` 这本方法论 SOP 约束——它是项目中沉淀的"权威操作手册"，所有平台都引用同一份。

## 快速上手（Claude Code 路径）

> 推荐入口：Claude Code 拥有最完整的插件支持和文档。其他平台见下节"支持矩阵"。

### 环境要求

- **Python 3.10+**
- 目标软件已安装（如 GIMP、Blender、LibreOffice）或可访问其源码仓库
- 订阅一个前沿级大模型（README 提示：Claude Opus 4.6、Claude Sonnet 4.6、GPT-5.4 等）

### 第一步：添加插件市场

```bash
/plugin marketplace add HKUDS/CLI-Anything
```

### 第二步：安装插件

```bash
/plugin install cli-anything
```

> Windows 注意事项：Claude Code 通过 `bash` 执行命令。Windows 下请安装 Git for Windows（包含 `bash` 和 `cygpath`），或使用 WSL，否则可能出现 `cygpath: command not found`。

### 第三步：一行命令生成 CLI

```bash
# 为 GIMP 生成完整的 CLI（7 个阶段全自动）
/cli-anything ./gimp

# 从 GitHub 仓库构建
/cli-anything https://github.com/blender/blender

# 兼容写法（仅旧版本 Claude Code）
/cli-anything:cli-anything ./gimp
```

如果遇到 `Unknown skill: cli-anything`，按下面顺序排查：

1. `/reload-plugins` 重新加载插件
2. `/help cli-anything` 验证插件是否已加载
3. 重新从市场安装：`/plugin marketplace add HKUDS/CLI-Anything` → `/plugin install cli-anything`
4. 确认可用后再用 `/cli-anything ./gimp`（或旧版本 `/cli-anything:cli-anything ./gimp`）

### 第四步（可选）：迭代优化

初始构建完成后，可以通过 `/cli-anything:refine` 持续扩展覆盖面：

```bash
# 全面优化：Agent 自动分析功能覆盖差距
/cli-anything:refine ./gimp

# 定向优化：指定功能领域
/cli-anything:refine ./gimp "我需要更多图像批处理和滤镜相关的 CLI"
```

`refine` 是**增量、非破坏性**的，可多次运行逐步将功能覆盖推到生产级。

### 开始使用生成的 CLI

无论用哪个平台构建，生成的 CLI 使用方式都一样：

```bash
# 安装到 PATH
cd gimp/agent-harness && pip install -e .

# 验证安装位置
which cli-anything-gimp

# 命令行子命令模式（适合脚本与流水线）
cli-anything-gimp --help
cli-anything-gimp project new --width 1920 --height 1080 -o poster.json
cli-anything-gimp --json layer add -n "Background" --type solid --color "#1a1a2e"

# 直接运行进入交互式 REPL（适合 Agent 会话）
cli-anything-gimp
```

REPL 示例（来自 README）：

```
$ cli-anything-blender
╔══════════════════════════════════════════╗
║       cli-anything-blender v1.0.0       ║
║     Blender CLI for AI Agents           ║
╚══════════════════════════════════════════╝

blender> scene new --name ProductShot
✓ Created scene: ProductShot

blender[ProductShot]> object add-mesh --type cube --location 0 0 1
✓ Added mesh: Cube at (0, 0, 1)

blender[ProductShot]*> render execute --output render.png --engine CYCLES
✓ Rendered: render.png (1920×1080, 2.3 MB) via blender --background

blender[ProductShot]> exit
Goodbye! 👋
```

## 支持矩阵速查

CLI-Anything 是平台无关的，每个 Agent 编程工具都能接入：

| 平台 | 接入方式 | 状态 |
| :--- | :--- | :--- |
| **Claude Code** | 插件市场 `/plugin marketplace add` + `/plugin install` | ✅ 主推，文档最完整 |
| **OpenCode** | 复制 `opencode-commands/*.md` + `HARNESS.md` 到 `~/.config/opencode/commands/` | 🧪 实验性 |
| **OpenClaw** | 安装 `openclaw-skill/SKILL.md` 到 `~/.openclaw/skills/cli-anything/` | ✅ 社区贡献 |
| **Codex** | `bash codex-skill/scripts/install.sh` 安装独立 Skill | 🧪 实验性 / 社区贡献 |
| **Qodercli** | `bash qoder-plugin/setup-qodercli.sh` 注册插件 | ✅ 社区贡献 |
| **GitHub Copilot CLI** | `copilot plugin install ./cli-anything-plugin` | ✅ 社区贡献 |
| Cursor / Windsurf | — | 🔮 即将支持 |

> **关键约束**：`HARNESS.md` 是所有命令引用的方法论规范，必须和命令文件放在同一目录。所有平台都引用同一份 `HARNESS.md`，不会改变生成的 Python harness 结构。

## CLI-Hub 生态

`cli-anything-hub` 是统一管理 CLI 的包管理器，一行命令浏览、安装、运行社区贡献的 CLI：

```bash
pip install cli-anything-hub
```

| 命令 | 作用 |
| :--- | :--- |
| `cli-hub list` | 浏览注册中心所有 CLI |
| `cli-hub search <query>` | 按关键词搜索 |
| `cli-hub info <name>` | 查看某个 CLI 的详情 |
| `cli-hub install <name>` | 安装一个 CLI |
| `cli-hub update <name>` | 更新已安装的 CLI |
| `cli-hub uninstall <name>` | 卸载 |
| `cli-hub launch <name> [args...]` | 启动一个已安装的 CLI |

```bash
# 浏览可用 CLI
cli-hub list
cli-hub search image

# 一键安装并试用
cli-hub install gimp
cli-hub info gimp
cli-hub launch gimp
```

> 部分 CLI 包装的是真实桌面或后端软件（如 GIMP、Blender、LibreOffice）。如果某个 CLI 需要上游应用，请先安装对应软件。

Web 端 Hub：[hkuds.github.io/CLI-Anything](https://hkuds.github.io/CLI-Anything/)

## 已支持的应用（节选）

> 完整列表与最新数据见 [GitHub 仓库](https://github.com/HKUDS/CLI-Anything)。下表数据为 README 公开报告值。

| 软件 | 领域 | 后端 | 测试数 |
| :--- | :--- | :--- | :---: |
| **GIMP** | 图像编辑 | Pillow + GEGL/Script-Fu | 107 |
| **Blender** | 3D 建模与渲染 | bpy (Python scripting) | 208 |
| **Inkscape** | 矢量图形 | Direct SVG/XML manipulation | 202 |
| **Audacity** | 音频制作 | Python wave + sox | 161 |
| **LibreOffice** | 办公套件 | ODF generation + headless LO | 158 |
| **OBS Studio** | 直播与录制 | JSON scene + obs-websocket | 153 |
| **Kdenlive** | 视频剪辑 | MLT XML + melt renderer | 155 |
| **Shotcut** | 视频剪辑 | Direct MLT XML + melt | 154 |
| **Draw.io** | 图表绘制 | mxGraph XML + draw.io CLI | 138 |
| **Joplin** | 笔记与待办 | Joplin 终端 CLI 子进程 | 134 |
| **Zoom** | 视频会议 | Zoom REST API (OAuth2) | 22 |
| **AnyGen** | AI 内容生成 | AnyGen REST API | 50 |
| **LLDB** | 原生调试 | LLDB Python API | 27 |
| **s&box** | 游戏开发 | Source 2 引擎 JSON 直读 | 244 |
| **Nsight Graphics** | GPU 调试分析 | 官方 ngfx / ngfx-capture 编排 | 51 |
| **Unreal Insights** | 性能分析 | 引擎 trace + UnrealInsights 导出 | 50 |
| **Sketch** | UI 设计 | sketch-constructor (Node.js) | 19 |
| **3MF** | 3D 打印网格编辑 | numpy、scipy、trimesh | 50+ |
| **合计** | — | — | **1,955+ 全部通过** |

测试体系包含：单元测试（合成数据）、端到端原生测试（项目文件生成）、端到端真实后端测试（调用真实软件验证输出，如 LibreOffice → 含 `%PDF-` 魔术字节的 PDF）、CLI 子进程测试（`subprocess.run` 验证已安装命令）。

## 核心设计原则

摘自 README 与 `HARNESS.md`，是判断生成结果是否合格的标准：

1. **必须用真实软件** — CLI 调用真实应用渲染。不能用 Pillow 替代 GIMP，不能自写渲染器替代 Blender。正确做法：生成合法项目文件 → 调用真实后端。
2. **REPL + 子命令双模** — 每个 CLI 同时支持有状态 REPL（适合 Agent 交互会话）和一次性子命令（适合脚本和流水线）。
3. **`--json` 是 Agent 的"一等公民"** — 每个命令内置 `--json` 参数输出结构化数据，可读表格模式服务于调试。
4. **统一使用体验** — 所有生成的 CLI 共享 `repl_skin.py`，包含品牌横幅、风格化提示符、命令历史、进度指示器。
5. **零妥协的依赖策略** — 真实软件是硬性要求；后端缺失时测试直接失败（而非跳过），确保功能真实性。

## 已知局限

README 明确列出的局限，使用前请了解：

- **依赖前沿基础模型** — Claude Opus 4.6 / Claude Sonnet 4.6 / GPT-5.4 等模型才能可靠生成 harness。较弱或较小的模型可能产出不完整或有误的 CLI，需要大量人工修正。
- **依赖可用的源代码** — `/cli-anything` 基于源码进行分析与生成。若目标软件只提供编译后的二进制文件，需要反编译才能获取代码，harness 的质量与覆盖率会显著下降。
- **可能需要迭代优化** — 单次 `/cli-anything` 运行不一定能完整覆盖所有功能，通常需要执行一次或多次 `/refine` 命令，才能把覆盖率和质量推到生产级。

## 参考资料

- [GitHub 仓库](https://github.com/HKUDS/CLI-Anything)
- [技术报告 · arXiv:2606.03854](https://arxiv.org/abs/2606.03854)
- [CLI-Hub Web](https://hkuds.github.io/CLI-Anything/)
- [CLI-Anything Plugin README](https://github.com/HKUDS/CLI-Anything/blob/main/cli-anything-plugin/README.md)
- [HARNESS.md · 方法论 SOP](https://github.com/HKUDS/CLI-Anything/blob/main/cli-anything-plugin/HARNESS.md)
- [QUICKSTART.md · 5 分钟快速上手](https://github.com/HKUDS/CLI-Anything/blob/main/cli-anything-plugin/QUICKSTART.md)
- [PUBLISHING.md · 分发与发布指南](https://github.com/HKUDS/CLI-Anything/blob/main/cli-anything-plugin/PUBLISHING.md)
- [CONTRIBUTING.md · 贡献指南](https://github.com/HKUDS/CLI-Anything/blob/main/CONTRIBUTING.md)

## 引用

如果 CLI-Anything 对你的工作有帮助，请引用其技术报告：

```bibtex
@misc{yang2026clianythingagentnativecomputeruse,
      title={CLI-Anything: Towards Agent-Native Computer Use},
      author={Yuhao Yang and Tianyu Fan and Chao Huang},
      year={2026},
      eprint={2606.03854},
      archivePrefix={arXiv},
      primaryClass={cs.HC},
      url={https://arxiv.org/abs/2606.03854},
}
```

---

> **CLI-Anything** — *一行命令，让任何软件成为 Agent 的原生工具。*
> 为 AI Agent 时代而生 · 20+ 款专业软件实测 · 1,955+ 项测试全部通过
