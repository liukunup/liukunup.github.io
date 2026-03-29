---
title: GoCV
createTime: 2026/03/30 00:57:42
permalink: /blog/xispwsr9/
---

GoCV 是 Go 语言的计算机视觉库，基于 OpenCV 4.13.0 开发。

官网：[https://gocv.io/](https://gocv.io/)

> 国内记得开加速哟
>
> 1. 打开[GitHub 文件加速代理](https://gh-proxy.com/)
> 2. 输入你需要加速的`github`连接
> 3. 点击转换链接按钮后，使用新的连接克隆或下载

::: tabs

@tab:active Windows

下载 MinGW-w64

https://github.com/niXman/mingw-builds-binaries/releases

x86_64-15.2.0-release-posix-seh-ucrt-rt_v13-rev1.7z

## 安装 OpenCV

从 GitHub 克隆 GoCV 仓库：

```bash
git clone https://github.com/hybridgroup/gocv.git
```

进入项目目录：

```bash
cd gocv
```

下载并构建 OpenCV：

```bash
.\win_download_opencv.cmd
.\win_build_opencv.cmd
```

## 验证安装

运行版本检查程序：

```bash
go run ./cmd/version/main.go
```

输出示例：

```
gocv version: 0.43.0
opencv lib version: 4.13.0
```

## 自定义环境

默认使用 pkg-config 确定编译和链接标志。也可通过 `-tags customenv` 禁用此行为，需要手动设置 CGO 环境变量：

```bash
set CGO_CXXFLAGS=--std=c++11
set CGO_CPPFLAGS=-IC:\opencv\build\install\include
set CGO_LDFLAGS=-LC:\opencv\build\install\x64\mingw\lib -lopencv_core4130 -lopencv_face4130 -lopencv_videoio4130 -lopencv_imgproc4130 -lopencv_highgui4130 -lopencv_imgcodecs4130 -lopencv_objdetect4130 -lopencv_features2d4130 -lopencv_video4130 -lopencv_dnn4130 -lopencv_xfeatures2d4130 -lopencv_plot4130 -lopencv_tracking4130 -lopencv_img_hash4130 -lopencv_calib3d4130
```

然后运行：

```bash
go run -tags customenv ./cmd/version/main.go
```


@tab macOS

## 安装 OpenCV

通过 Homebrew 安装 OpenCV 4.13.0：

```bash
# 首次安装
brew install opencv

# 或升级已有版本
brew upgrade opencv
```

安装 pkg-config（用于确定编译和链接标志）：

```bash
brew install pkgconfig
```

## 验证安装

克隆 GoCV 仓库：

```bash
git clone https://github.com/hybridgroup/gocv.git
cd gocv
```

运行版本检查程序：

```bash
go run ./cmd/version/main.go
```

输出示例：

```
gocv version: 0.43.0
opencv lib version: 4.13.0
```

## 自定义环境

默认使用 pkg-config 确定编译和链接标志。也可通过 `-tags customenv` 禁用此行为，需要手动设置 CGO 环境变量：

```bash
export CGO_CXXFLAGS="--std=c++11"
export CGO_CPPFLAGS="-I/usr/local/Cellar/opencv/4.13.0/include"
export CGO_LDFLAGS="-L/usr/local/Cellar/opencv/4.13.0/lib \
  -lopencv_stitching -lopencv_superres -lopencv_videostab -lopencv_aruco \
  -lopencv_bgsegm -lopencv_bioinspired -lopencv_ccalib -lopencv_dnn_objdetect \
  -lopencv_dpm -lopencv_face -lopencv_photo -lopencv_fuzzy -lopencv_hfs \
  -lopencv_img_hash -lopencv_line_descriptor -lopencv_optflow -lopencv_reg \
  -lopencv_rgbd -lopencv_saliency -lopencv_stereo -lopencv_structured_light \
  -lopencv_phase_unwrapping -lopencv_surface_matching -lopencv_tracking \
  -lopencv_datasets -lopencv_dnn -lopencv_plot -lopencv_xfeatures2d \
  -lopencv_shape -lopencv_video -lopencv_ml -lopencv_ximgproc \
  -lopencv_calib3d -lopencv_features2d -lopencv_highgui -lopencv_videoio \
  -lopencv_flann -lopencv_xobjdetect -lopencv_imgcodecs -lopencv_objdetect \
  -lopencv_xphoto -lopencv_imgproc -lopencv_core"
```

然后运行：

```bash
go run -tags customenv ./cmd/version/main.go
```


@tab Linux

## 安装 OpenCV

Clone GoCV 仓库：

```bash
git clone https://github.com/hybridgroup/gocv.git
cd gocv
```

### 快速安装

一行命令完成所有步骤：

```bash
make install
```

安装成功后会显示：

```
gocv version: 0.43.0
opencv lib version: 4.13.0
```

### 完整安装（分步）

如需分步执行：

```bash
# 1. 安装系统依赖
make deps

# 2. 下载 OpenCV 源码
make download

# 3. 编译（耗时较长）
make build

# 4. 安装
make sudo_install
```

### 验证安装

```bash
go run ./cmd/version/main.go
```

输出示例：

```
gocv version: 0.43.0
opencv lib version: 4.13.0
```

### 清理

安装完成后可清理多余文件：

```bash
make clean
```

## 自定义环境

默认使用 pkg-config 确定编译和链接标志。也可通过 `-tags customenv` 禁用此行为，需要手动设置 CGO 环境变量：

```bash
export CGO_CPPFLAGS="-I/usr/local/include"
export CGO_LDFLAGS="-L/usr/local/lib \
  -lopencv_core -lopencv_face -lopencv_videoio -lopencv_imgproc \
  -lopencv_highgui -lopencv_imgcodecs -lopencv_objdetect \
  -lopencv_features2d -lopencv_video -lopencv_dnn -lopencv_xfeatures2d"
```

然后运行：

```bash
go run -tags customenv ./cmd/version/main.go
```

## Raspbian（树莓派）

Raspbian 有专门优化版本：

```bash
cd $HOME/folder/with/your/src/
git clone https://github.com/hybridgroup/gocv.git
cd gocv
make install_raspi
```

验证安装：

```bash
go run ./cmd/version/main.go
```


@tab Docker

## 预构建镜像

可直接使用预构建的 Docker 镜像：[https://hub.docker.com/r/gocv/opencv](https://hub.docker.com/r/gocv/opencv)

```bash
docker pull gocv/opencv
```

## 从源码构建

项目提供了 Dockerfile，可通过 Makefile 一键构建：

```bash
make docker
```

默认构建包含 Go 1.24.4。如需指定其他版本：

```bash
make docker GOVERSION='1.24.5'
```

## 在 macOS Docker 中运行 GUI 程序

如果 GoCV 程序需要图形界面（如 `gocv.Window`），在 macOS 上需要额外配置：

### 前置条件

1. 安装 XQuartz：

```bash
brew install --cask xquartz
```

2. 安装 socat：

```bash
brew install socat
```

> 注意：安装 XQuartz 后需要注销并重新登录，以重载 X window 系统。

### 配置 XQuartz

打开 XQuartz，进入 **Security** 设置，勾选 **Allow connections from network clients**。

### 启动 TCP 代理

确保端口 6000 未被占用，然后启动 socat 代理：

```bash
socat TCP-LISTEN:6000,reuseaddr,fork UNIX-CLIENT:\"$DISPLAY\"
```

### 运行 GUI 程序

```bash
docker run -it --rm -e DISPLAY=docker.for.mac.host.internal:0 your-gocv-app
```

> 注意：Docker for MacOS 不支持视频设备，因此无法运行需要摄像头的 GoCV 应用。

:::
