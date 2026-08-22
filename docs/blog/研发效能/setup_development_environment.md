---
title: 搭建开发环境
createTime: 2026/01/19 12:09:31
permalink: /blog/iqlv7hop/
---

## Windows

Windows Subsystem for Linux (WSL) 是在 Windows 上运行 Linux 环境的最佳方式。

1. 安装 WSL 2

```powershell
# 以管理员身份运行 PowerShell
wsl --install
```

2. 运行指定的 Linux 发行版

**Ubuntu 24.04 LTS**: 最稳定、最合适的选择

```powershell
wsl -d Ubuntu-24.04
```

3. 配置优化

```bash
# 更新系统
sudo apt-get update && sudo apt-get upgrade -y

# 安装命令
sudo apt-get install -y curl wget git vim htop tree unzip

# 配置 Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 配置自动挂载选项👇
vim /etc/wsl.conf
```

- /etc/wsl.conf 样例

```plaintext
[boot]
systemd=true

[user]
default=kun105liu

[automount]  // [!code ++]
options = "metadata"  // [!code ++]
```

4. 使用说明

- WSL 文件访问

Windows 文件: `/mnt/c/`

Linux 文件: `\\wsl$\Ubuntu\home\username`

- 性能优化

将项目代码放在 Linux 文件系统中，而不是 Windows 文件系统中，以获得更好的性能。

## Mac / Linux

### Oh My Zsh

Oh My Zsh 是一个强大的 Zsh 配置框架，提供了丰富的插件和主题。

#### 安装 Zsh
```bash
# macOS
brew install zsh

# Ubuntu/Debian
sudo apt install zsh

# 设置为默认 Shell
chsh -s $(which zsh)
```

#### 安装 Oh My Zsh
```bash
# 官方安装方式
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 或者使用 wget
sh -c "$(wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
```

#### 推荐插件
编辑 `~/.zshrc` 文件，在 `plugins` 部分添加：
```bash
plugins=(
  git
  zsh-autosuggestions
  zsh-syntax-highlighting
  docker
  npm
  node
  vscode
)
```

#### 安装额外插件
```bash
# 自动建议插件
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

# 语法高亮插件
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

#### 推荐主题
```bash
# Powerlevel10k 主题
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# 在 ~/.zshrc 中设置主题
ZSH_THEME="powerlevel10k/powerlevel10k"
```

#### 有用的别名配置
```bash
# 添加到 ~/.zshrc
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'
```

## Program Languages

### Miniconda for Python

Miniconda 是轻量级的 Anaconda，只包含 conda 和 Python。

#### 安装 Miniconda
```bash
# 下载安装脚本
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh

# 或使用 macOS 安装包
brew install --cask miniconda
```

#### 基础配置
```bash
# 初始化 conda
conda init zsh

# 创建虚拟环境
conda create -n myenv python=3.11

# 激活环境
conda activate myenv

# 安装常用包
conda install numpy pandas matplotlib jupyter
```

#### conda 常用命令
```bash
# 列出所有环境
conda env list

# 删除环境
conda env remove -n myenv

# 导出环境
conda env export > environment.yml

# 从文件创建环境
conda env create -f environment.yml
```

### uv

uv 是 Python 的新一代包管理器，比 pip 和 conda 更快。

#### 安装 uv
```bash
# 使用 pip 安装
pip install uv

# 或使用官方安装脚本
curl -LsSf https://astral.sh/uv/install.sh | sh
```

#### 基础使用
```bash
# 创建项目
uv init myproject
cd myproject

# 安装依赖
uv add requests pandas

# 运行脚本
uv run script.py

# 安装开发依赖
uv add --dev pytest black
```

### Go

Go 是 Google 开发的编程语言，适合系统编程和后端开发。

#### 安装 Go
```bash
# macOS
brew install go

# Ubuntu/Debian
sudo apt install golang-go

# 或下载官方版本
wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
```

#### 环境配置
```bash
# 添加到 ~/.zshrc
export GOPATH=$HOME/go
export PATH=$PATH:/usr/local/go/bin:$GOPATH/bin

# 重新加载配置
source ~/.zshrc
```

#### 基础使用
```bash
# 初始化模块
go mod init myproject

# 运行项目
go run main.go

# 构建项目
go build

# 测试
go test ./...
```

### Java

Java 是企业级应用开发的主要语言。

#### 安装 OpenJDK
```bash
# macOS
brew install openjdk@17

# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# 使用 SDKMAN (推荐)
curl -s "https://get.sdkman.io" | bash
sdk install java 17.0.8-tem
```

#### 环境配置
```bash
# 添加到 ~/.zshrc
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin
```

#### 构建工具
```bash
# Maven
brew install maven  # macOS
sudo apt install maven  # Ubuntu

# Gradle
brew install gradle  # macOS
sudo apt install gradle  # Ubuntu
```

### Node.js & nvm & npm & pnpm

Node.js 是 JavaScript 运行时，nvm 管理版本，pnpm 是高效的包管理器。

#### 安装 nvm
```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载配置
source ~/.zshrc

# 安装最新 LTS 版本
nvm install --lts
nvm use --lts
```

#### 安装 pnpm
```bash
# 使用 npm 安装
npm install -g pnpm

# 或使用官方安装脚本
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

#### 基础配置
```bash
# 设置 npm 镜像
npm config set registry https://registry.npmmirror.com

# 设置 pnpm 镜像
pnpm config set registry https://registry.npmmirror.com

# 查看配置
npm config list
pnpm config list
```

#### 常用命令
```bash
# 初始化项目
npm init -y
# 或
pnpm init

# 安装依赖
npm install
pnpm install

# 安装包
npm install package-name
pnpm add package-name

# 安装开发依赖
npm install --save-dev package-name
pnpm add -D package-name

# 运行脚本
npm run script-name
pnpm script-name
```

## IDEs

### Visual Studio Code

VS Code 是微软开发的免费代码编辑器，拥有丰富的插件生态。

#### 安装 VS Code
```bash
# macOS
brew install --cask visual-studio-code

# Ubuntu/Debian
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install code
```

#### 必装插件
```bash
# 使用命令行安装插件
code --install-extension ms-python.python
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-json
code --install-extension redhat.vscode-yaml
code --install-extension ms-vscode-remote.remote-wsl
code --install-extension GitHub.copilot
code --install-extension ms-vscode.vscode-eslint
```

#### 推荐配置
```json
// settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "git.enableSmartCommit": true,
  "terminal.integrated.shell.linux": "/bin/zsh"
}
```

### Cursor

Cursor 是基于 AI 的代码编辑器，集成了 GPT 功能。

#### 安装 Cursor
```bash
# macOS
brew install --cask cursor

# 下载 AppImage (Linux)
wget https://download.cursor.sh/linux/appImage/x64
chmod +x cursor.AppImage
```

#### 主要特性
- **AI 代码生成**: 内置 GPT-4，可以生成、修改、解释代码
- **智能补全**: 基于上下文的代码补全
- **错误修复**: AI 帮助调试和修复错误
- **代码重构**: 智能代码重构建议

#### 使用技巧
- `Cmd/Ctrl + K`: AI 聊天
- `Cmd/Ctrl + L`: 内联 AI 编辑
- `Tab`: AI 智能补全

### Trae or Trae CN

Trae 是国产 AI 编程助手，支持中文交互。

#### 安装方式
- 访问官网下载安装包
- 支持插件形式集成到 VS Code

#### 主要功能
- **中文交互**: 原生中文 AI 助手
- **代码生成**: 支持多种编程语言
- **文档生成**: 自动生成代码文档
- **单元测试**: AI 生成测试用例

### Qoder

Qoder 是新兴的 AI 代码编辑器。

#### 特点
- **轻量级**: 启动速度快，资源占用少
- **AI 集成**: 深度集成 AI 编程助手
- **多语言支持**: 支持主流编程语言

### CodeBuddy

CodeBuddy 是面向初学者的友好 IDE。

#### 特点
- **简单易用**: 界面简洁，适合新手
- **学习模式**: 内置编程教程和示例
- **实时反馈**: 代码错误即时提示

#### IDE 选择建议
- **VS Code**: 通用选择，插件丰富
- **Cursor**: AI 编程，提高效率
- **Trae**: 中文环境，本土化支持
- **Qoder**: 轻量快速，简单项目
- **CodeBuddy**: 编程学习，新手友好

## CLI

### Claude Code

Claude Code 是 Anthropic 推出的 AI 命令行工具，可以直接在终端中与 Claude 对话。

#### 安装 Claude Code
```bash
# 使用 npm 安装
npm install -g @anthropic-ai/claude-code

# 或使用 pip 安装
pip install claude-code
```

#### 配置和使用
```bash
# 设置 API 密钥
claude-code configure

# 开始对话
claude-code

# 直接执行命令
claude-code "帮我创建一个 React 项目"
```

#### 主要功能
- **终端集成**: 直接在命令行中使用
- **代码生成**: 快速生成代码片段
- **文件操作**: AI 辅助文件管理
- **调试帮助**: 智能错误诊断

### OpenCode

OpenCode 是一个开源的 AI 编程助手，支持多种编程语言。

#### 安装 OpenCode
```bash
# 使用 npm 安装
npm install -g opencode

# 或下载二进制文件
wget https://github.com/opencode/opencode/releases/latest/download/opencode-linux-amd64
chmod +x opencode-linux-amd64
sudo mv opencode-linux-amd64 /usr/local/bin/opencode
```

#### 使用方法
```bash
# 初始化项目
opencode init

# 生成代码
opencode generate "创建一个 Express 服务器"

# 代码审查
opencode review ./src

# 重构代码
opencode refactor ./src/app.js
```

#### 特点
- **开源免费**: 完全开源，无使用限制
- **本地运行**: 支持本地模型，保护隐私
- **多语言**: 支持 Python、JavaScript、Go、Java 等
- **插件系统**: 可扩展的插件架构

## Others

### Chrome

Chrome 是前端开发必备的浏览器，拥有强大的开发者工具。

#### 安装 Chrome
```bash
# macOS
brew install --cask google-chrome

# Ubuntu/Debian
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
sudo apt update
sudo apt install google-chrome-stable
```

#### 开发者工具技巧
- `F12`: 打开开发者工具
- `Ctrl/Cmd + Shift + C`: 元素选择器
- `Ctrl/Cmd + Shift + J`: 控制台
- `Ctrl/Cmd + R`: 硬刷新
- `Ctrl/Cmd + Shift + R`: 清除缓存并刷新

#### 推荐扩展
- **React Developer Tools**: React 调试
- **Vue.js devtools**: Vue 调试
- **Redux DevTools**: Redux 状态管理
- **JSON Viewer**: JSON 格式化
- **Wappalyzer**: 技术栈识别

### Docker

Docker 是容器化平台，简化应用部署和环境管理。

#### 安装 Docker
```bash
# macOS
brew install --cask docker

# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# 将用户添加到 docker 组
sudo usermod -aG docker $USER
```

#### 基础使用
```bash
# 拉取镜像
docker pull nginx

# 运行容器
docker run -d -p 8080:80 nginx

# 查看容器
docker ps

# 进入容器
docker exec -it container_id bash

# 停止容器
docker stop container_id
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3'
services:
  web:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:13
    environment:
      POSTGRES_PASSWORD: password
```

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down
```

### Vibe Kanban

Vibe Kanban 是一个简洁的项目管理工具，适合个人和小团队使用。

#### 安装 Vibe Kanban
```bash
# 使用 npm 安装
npm install -g vibe-kanban

# 或使用 Docker
docker run -d -p 3000:3000 vibe-kanban
```

#### 主要功能
- **看板管理**: 可视化任务流程
- **任务跟踪**: 简单的任务状态管理
- **团队协作**: 支持多用户协作
- **时间追踪**: 任务时间记录

#### 使用方法
```bash
# 初始化项目
vibe-kanban init my-project

# 启动服务
vibe-kanban start

# 添加任务
vibe-kanban add "实现用户登录功能"

# 查看看板
vibe-kanban board
```

## 总结

搭建一个完整的开发环境需要：

1. **操作系统环境**: Windows (WSL) 或 Mac/Linux
2. **Shell 环境**: Oh My Zsh 提供高效的命令行体验
3. **编程语言**: 根据需求安装 Python、Node.js、Go、Java 等
4. **开发工具**: 选择合适的 IDE (VS Code、Cursor 等)
5. **AI 助手**: Claude Code、OpenCode 等提高开发效率
6. **辅助工具**: Chrome、Docker、项目管理工具

选择合适的工具组合，可以大大提高开发效率和代码质量。记住，工具是辅助，最重要的是编程思维和解决问题的能力。

---

**推荐组合**:
- **前端开发**: VS Code + Node.js + Chrome + Docker
- **后端开发**: Cursor + Python/Go + Docker + Vibe Kanban
- **全栈开发**: VS Code + Claude Code + Docker + 完整语言栈
