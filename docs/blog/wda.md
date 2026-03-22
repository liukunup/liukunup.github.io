---
title: 跨平台 iOS 真机自动化测试指南
createTime: 2026/03/19 02:46:06
permalink: /blog/aqwnprye/
---

使用 WebDriverAgent 与 go-ios 实现多设备管理

## 引言

在移动自动化测试领域，iOS 设备的真机测试一直是一个挑战。传统的方案重度依赖 Mac 和 Xcode，这让许多使用 Windows/Linux 的测试团队望而却步。本文将带你突破这一限制，实现：

- ✅ 使用**[免费的个人开发者账号](https://developer.apple.com/account)**完成配置
- ✅ 在 **Windows/Linux 上运行 iOS 真机自动化**
- ✅ **单机管理多台设备**，并行执行测试
- ✅ 纯**命令行操作**，适合 CI/CD 集成

无论你是测试开发、移动 QA，还是对 iOS 自动化感兴趣的开发者，这篇文章都能帮你搭建起一套完整的跨平台 iOS 测试环境。

---

## 第一部分：理解核心组件

在开始动手之前，我们需要先理解整个方案中涉及的关键组件及其关系。

### 1.1 什么是 WebDriverAgent（WDA）？

WebDriverAgent 是 Facebook 开源的一个 iOS 测试代理服务，它：
- 运行在 iOS 设备上，通过 XCTest.framework 调用系统 API
- 对外提供 HTTP 接口，接收指令并操作设备
- 是 Appium、facebook-wda 等工具的底层驱动

虽然 Facebook 已停止维护，但 Appium 团队接手了它的维护工作，形成了目前最活跃的版本。

### 1.2 为什么需要 go-ios？

`go-ios` 是一个用 Go 编写的跨平台工具，它能：
- 在 Windows/Linux 上直接与 iOS 设备通信
- 无需 Xcode，通过命令行完成应用安装、WDA 启动等操作
- 支持端口转发、应用管理、网络抓包等丰富功能

### 1.3 整体架构

```
[Mac 环境]                [Windows/Linux 测试机]
    |                            |
    +-- 编译 WDA 生成 IPA         +-- go-ios 安装 WDA
    |                            |
    +-- 修改 Bundle ID            +-- go-ios 启动 WDA
                                  |
                                  +-- 端口转发 (8100 -> 本地)
                                  |
                                  +-- 测试脚本 (facebook-wda)
```

---

## 第二部分：准备工作

### 2.1 硬件要求
- 一台 Mac（用于编译 WDA，只需一次）
- 一台或多台 iPhone/iPad（iOS 9.3+）
- 一台 Windows/Linux 测试机（用于运行测试）

### 2.2 软件要求
- **Mac 环境**：Xcode 12+，Apple ID（免费即可）
- **Windows/Linux 环境**：Node.js（可选）、Python 3.6+、iTunes（Windows 需要）

### 2.3 关键概念说明
- **Bundle ID**：应用的唯一标识，免费个人账号需要在不同设备上有不同的 Bundle ID
- **UDID**：iOS 设备的唯一标识符，用于指定操作目标
- **端口转发**：将设备上的服务端口映射到电脑本地，方便访问

---

## 第三部分：在 Mac 上编译 WDA（一次配置，永久使用）

这一阶段只需要执行一次，生成通用的安装包后，后续所有测试机都可以使用。

直接使用以下脚本

```bash
#!/bin/bash
set -e

# ==================== 配置区域 ====================
TEAM_ID="XXXXXXXXXX"                             # Team ID
BUNDLE_ID="com.yourcompany.WebDriverAgentRunner" # Bundle ID
VERSION=$(date +"%Y%m%d_%H%M%S")
BUILD_DIR="wda_build_${VERSION}"
OUTPUT_DIR="output"

# ==================== 1. 环境检查 ====================
echo "🔍 步骤1: 检查环境..."
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ xcodebuild 未找到，请确保 Xcode 已安装"
    exit 1
fi

# ==================== 2. 创建工作目录 ====================
echo "📁 步骤2: 创建工作目录..."
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR
cd $BUILD_DIR

# ==================== 3. Clone WebDriverAgent ====================
echo "📥 步骤3: 克隆 Appium 维护的 WebDriverAgent..."
git clone https://github.com/appium/WebDriverAgent.git
cd WebDriverAgent

# ==================== 4. 修改 Bundle ID 和签名 ====================
echo "🔐 步骤4: 配置签名..."

# 备份原始文件
cp WebDriverAgent.xcodeproj/project.pbxproj WebDriverAgent.xcodeproj/project.pbxproj.bak

# 修改 Team ID
sed -i '' "s/DEVELOPMENT_TEAM = .*/DEVELOPMENT_TEAM = $TEAM_ID;/g" WebDriverAgent.xcodeproj/project.pbxproj

# 修改 Bundle ID
sed -i '' "s/com.facebook.WebDriverAgentRunner/$BUNDLE_ID/g" WebDriverAgent.xcodeproj/project.pbxproj

# 启用自动签名
sed -i '' "s/CODE_SIGN_STYLE = .*/CODE_SIGN_STYLE = Automatic;/g" WebDriverAgent.xcodeproj/project.pbxproj

# ==================== 5. 构建 .app ====================
echo "🏗️ 步骤5: 构建 WebDriverAgent..."
xcodebuild \
    -project WebDriverAgent.xcodeproj \
    -scheme WebDriverAgentRunner \
    -configuration Release \
    -sdk iphoneos \
    -derivedDataPath ./build \
    CODE_SIGN_STYLE=Automatic \
    DEVELOPMENT_TEAM=$TEAM_ID \
    PRODUCT_BUNDLE_IDENTIFIER=$BUNDLE_ID \
    clean build

# ==================== 6. 查找并打包 .app ====================
echo "📦 步骤6: 打包 .app..."
APP_PATH=$(find ./build -name "WebDriverAgentRunner-Runner.app" -type d | head -n 1)

if [ -z "$APP_PATH" ]; then
    echo "❌ 未找到 WebDriverAgentRunner-Runner.app"
    exit 1
fi

echo "找到 App: $APP_PATH"

# 打包成 ipa
cd $(dirname $APP_PATH)
mkdir -p Payload
mv $(basename $APP_PATH) Payload/
zip -r WebDriverAgentRunner_${VERSION}.ipa Payload/
cd ../../../../../

# 创建输出目录
rm -rf $OUTPUT_DIR
mkdir -p $OUTPUT_DIR
cp "WebDriverAgent/$(dirname $APP_PATH)/WebDriverAgentRunner_${VERSION}.ipa" $OUTPUT_DIR/

# ==================== 8. 创建安装配置信息 ====================
echo "📝 步骤8: 生成元数据..."
cat > $OUTPUT_DIR/metadata.json << EOF
{
    "version": "${VERSION}",
    "bundle_id": "${BUNDLE_ID}",
    "team_id": "${TEAM_ID}",
    "build_time": "$(date -Iseconds)",
    "app_file": "WebDriverAgentRunner_${VERSION}.ipa"
}
EOF

# ==================== 10. 清理 ====================
echo "🧹 步骤10: 清理临时文件..."
rm -rf ./WebDriverAgent/build

echo "✨ 构建完成！"
echo "📦 版本: ${VERSION}"
echo "📁 文件: WebDriverAgentRunner_${VERSION}.ipa"
```

### 3.1 获取源码并修改 Bundle ID

```bash
# 克隆 Appium 维护的 WDA 版本
git clone https://github.com/appium/WebDriverAgent.git
cd WebDriverAgent

# 修改 Bundle ID 避免冲突（关键步骤）
# 将 YOUR_NAME 替换成你的标识，如 yourname2024
sed -i '' 's/com\.facebook\.WebDriverAgent/com\.yourname\.WebDriverAgent\.YOUR_NAME/g' WebDriverAgent.xcodeproj/project.pbxproj
```

### 3.2 使用命令行编译打包

```bash
# 构建测试包
xcodebuild build-for-testing \
  -project WebDriverAgent.xcodeproj \
  -scheme WebDriverAgentRunner \
  -sdk iphoneos \
  -configuration Release \
  -derivedDataPath ./build

# 打包成 IPA
cd ./build/Build/Products/Release-iphoneos
mkdir Payload
mv WebDriverAgentRunner.app Payload/
zip -r WDA.ipa Payload/

# 查看生成的 IPA 文件
ls -la WDA.ipa
```

生成的 `WDA.ipa` 文件就是我们要的成果物，保存好它，后续所有设备都将安装这个包。

---

## 第四部分：在 Windows/Linux 上配置环境

### 4.1 安装 go-ios

#### Windows 安装（推荐使用 npm）
```bash
# 安装 Node.js 后执行
npm install -g go-ios

# 验证安装
ios version
```

如果提示命令不存在，请将 `C:\Users\你的用户名\AppData\Roaming\npm` 添加到系统 PATH。

#### Linux 安装（通过 Go 编译）
```bash
# 安装 Go 1.18+
go install github.com/danielpaulus/go-ios@latest

# 添加到系统路径
sudo cp ~/go/bin/go-ios /usr/local/bin/ios

# 验证
ios version
```

### 4.2 安装 Python 依赖
```bash
# 安装 facebook-wda 客户端
pip install facebook-wda

# 可选：如果需要更丰富的功能，可以安装完整版
pip install wda
```

### 4.3 Windows 特殊配置
- **安装 iTunes**：从苹果官网下载安装，这会安装必要的 USB 驱动
- **iOS 17+ 设备需要安装 wintun**：
  1. 从 [wintun.net](https://www.wintun.net/) 下载
  2. 将 64 位版本的 `wintun.dll` 复制到 `C:\Windows\System32\`

---

## 第五部分：连接并配置单台设备

让我们先从单台设备开始，确保流程畅通。

### 5.1 连接设备并查看 UDID

将 iPhone 通过 USB 连接到电脑，在手机上点击"信任此电脑"。

```bash
# 列出所有已连接的设备
ios list
```

输出示例：
```
List of all devices found:
==========
UDID: 00008030-001C2D3A12345678
==========
```

记下这个 UDID，后续所有操作都需要指定它。

### 5.2 安装 WDA

```bash
# 安装我们之前编译的 WDA.ipa
ios install --udid 00008030-001C2D3A12345678 --path=/path/to/WDA.ipa

# 验证安装
ios apps --udid 00008030-001C2D3A12345678 | grep WebDriverAgent
```

### 5.3 iOS 17+ 设备：启动隧道（必须）

如果设备系统是 iOS 17 或更高版本，需要单独启动隧道服务：

```bash
# 打开新终端窗口，保持运行
sudo ios tunnel start
```
> Windows 上如果提示权限不足，请以管理员身份运行命令提示符。

### 5.4 启动 WDA 服务

```bash
# 启动 WDA（需要知道 Bundle ID）
# 可以通过 `ios apps` 命令找到 Bundle ID
ios runwda \
  --bundleid com.yourcompany.WebDriverAgentRunner.xctrunner \
  --testrunnerbundleid com.yourcompany.WebDriverAgentRunner.xctrunner \
  --xctestconfig WebDriverAgentRunner.xctest \
  --udid 00008030-001C2D3A12345678
```

看到 `WebDriverAgent start successfully` 的提示，说明启动成功。

### 5.5 端口转发

```bash
# 将设备 8100 端口映射到本地 8100
ios forward --udid 00008030-001C2D3A12345678 8100 8100
```

### 5.6 验证 WDA 是否正常运行

```bash
# 使用 curl 测试
curl http://localhost:8100/status

# 或者用 Python 验证
python -c "import wda; c=wda.Client('http://localhost:8100'); print(c.status())"
```

如果看到包含 "running" 的状态信息，说明一切就绪！

---

## 第六部分：多设备管理实战

接下来是本文的核心：如何在一台电脑上同时管理多台 iOS 设备。

### 6.1 连接多台设备

将多台 iPhone 同时连接到电脑，查看设备列表：

```bash
ios list
```

输出示例：
```
List of all devices found:
==========
UDID: 00008030-001C2D3A12345678
UDID: 00008030-002A4E5B67890123
UDID: 00008030-003F5G6H78901234
```

### 6.2 批量安装 WDA

创建一个简单的脚本 `install_wda.sh`（Windows 用户可以使用 `.bat` 文件）：

```bash
#!/bin/bash
# 安装 WDA 到所有设备

DEVICES=(
  "00008030-001C2D3A12345678"
  "00008030-002A4E5B67890123"
  "00008030-003F5G6H78901234"
)

for udid in "${DEVICES[@]}"; do
  echo "Installing WDA to $udid..."
  ios install --udid $udid --path=/path/to/WDA.ipa
done
```

### 6.3 为多设备启动 WDA 服务

我们需要为每台设备启动独立的 WDA 实例。创建一个管理脚本 `start_wda.sh`：

```bash
#!/bin/bash

# 设备配置：UDID 和对应的本地端口
declare -A DEVICE_PORTS=(
  ["00008030-001C2D3A12345678"]=8101
  ["00008030-002A4E5B67890123"]=8102
  ["00008030-003F5G6H78901234"]=8103
)

# 启动隧道（iOS 17+）
sudo ios tunnel start &
TUNNEL_PID=$!

# 为每台设备启动 WDA 和端口转发
for udid in "${!DEVICE_PORTS[@]}"; do
  port=${DEVICE_PORTS[$udid]}
  
  echo "Starting WDA for $udid on port $port..."
  
  # 启动 WDA（后台运行）
  ios runwda \
    --udid $udid \
    --bundleid com.yourname.WebDriverAgent.YOUR_NAME.xctrunner \
    --testrunnerbundleid com.yourname.WebDriverAgent.YOUR_NAME.xctrunner \
    --xctestconfig WebDriverAgentRunner.xctest \
    > "wda_$port.log" 2>&1 &
  
  # 等待 WDA 启动
  sleep 5
  
  # 端口转发
  ios forward --udid $udid $port 8100
  
  echo "Device $udid ready on localhost:$port"
done

echo "All devices are ready!"
```

### 6.4 验证多设备连接

创建一个 Python 脚本 `check_devices.py`：

```python
import wda
from concurrent.futures import ThreadPoolExecutor

# 设备端口配置
DEVICE_PORTS = [8101, 8102, 8103]

def check_device(port):
    """检查单个设备状态"""
    try:
        c = wda.Client(f'http://localhost:{port}')
        status = c.status()
        return {
            'port': port,
            'status': 'OK',
            'device': status.get('device', {}).get('name', 'Unknown')
        }
    except Exception as e:
        return {
            'port': port,
            'status': 'FAILED',
            'error': str(e)
        }

# 并行检查所有设备
with ThreadPoolExecutor(max_workers=5) as executor:
    results = list(executor.map(check_device, DEVICE_PORTS))

# 打印结果
for result in results:
    if result['status'] == 'OK':
        print(f"✅ Port {result['port']}: {result['device']} ready")
    else:
        print(f"❌ Port {result['port']}: {result['error']}")
```

运行结果示例：
```
✅ Port 8101: iPhone 12 ready
✅ Port 8102: iPhone 13 Pro ready
✅ Port 8103: iPhone SE ready
```

### 6.5 多设备并行测试示例

下面是一个简单的并行测试脚本 `parallel_test.py`：

```python
import wda
import time
from concurrent.futures import ThreadPoolExecutor
import threading

# 设备配置
DEVICES = [
    {'name': 'Device A', 'port': 8101, 'bundle_id': 'com.apple.calculator'},
    {'name': 'Device B', 'port': 8102, 'bundle_id': 'com.apple.calculator'},
    {'name': 'Device C', 'port': 8103, 'bundle_id': 'com.apple.calculator'},
]

# 线程局部存储，保存每个线程的客户端
thread_local = threading.local()

def get_client(port):
    """获取或创建线程本地的 WDA 客户端"""
    if not hasattr(thread_local, 'clients'):
        thread_local.clients = {}
    if port not in thread_local.clients:
        thread_local.clients[port] = wda.Client(f'http://localhost:{port}')
    return thread_local.clients[port]

def run_test_on_device(device):
    """在单台设备上执行测试"""
    port = device['port']
    device_name = device['name']
    
    try:
        print(f"[{device_name}] Starting test...")
        c = get_client(port)
        
        # 测试步骤
        # 1. 回到主屏幕
        c.home()
        time.sleep(1)
        
        # 2. 启动计算器
        c.app_start(device['bundle_id'])
        time.sleep(2)
        
        # 3. 执行点击操作
        # 注意：这里需要根据实际 UI 调整
        s = c.session(device['bundle_id'])
        
        # 示例：点击数字 7, +, 3, = 
        # 实际使用时需要替换为你的应用元素定位
        # s(text="7").tap()
        # s(text="+").tap()
        # s(text="3").tap()
        # s(text="=").tap()
        
        print(f"✅ [{device_name}] Test completed")
        return True
        
    except Exception as e:
        print(f"❌ [{device_name}] Test failed: {str(e)}")
        return False

# 并行执行测试
print("Starting parallel tests...")
start_time = time.time()

with ThreadPoolExecutor(max_workers=len(DEVICES)) as executor:
    results = list(executor.map(run_test_on_device, DEVICES))

end_time = time.time()

# 输出统计
total = len(results)
success = sum(1 for r in results if r)
failed = total - success

print("\n" + "="*50)
print(f"Test Summary:")
print(f"Total devices: {total}")
print(f"Success: {success}")
print(f"Failed: {failed}")
print(f"Total time: {end_time - start_time:.2f} seconds")
print("="*50)
```

---

## 第七部分：常见问题与解决方案

### 7.1 Bundle ID 冲突

**问题**：安装 WDA 时提示 `Failed to register bundle identifier`  
**原因**：免费个人账号在不同设备上安装了相同 Bundle ID 的应用  
**解决**：在编译阶段修改 WDA 的 Bundle ID，为每台设备安装不同版本，或者使用我们方案中统一修改的方法

### 7.2 设备不被识别

**问题**：`ios list` 看不到设备  
**解决**：
- Windows：确认安装了 iTunes 并重启电脑
- Linux：检查 USB 权限，可能需要配置 udev 规则
- 所有平台：尝试重新插拔 USB 线，在手机上重新"信任"

### 7.3 WDA 启动失败

**问题**：`ios runwda` 报错或卡住  
**解决**：
1. 检查 Bundle ID 是否正确：`ios apps --udid [UDID]`
2. iOS 17+ 设备：确认已启动 `ios tunnel start`
3. 查看详细日志：添加 `--verbose` 参数
4. 重启设备和服务重试

### 7.4 端口转发冲突

**问题**：`forward` 命令提示端口已被占用  
**解决**：
```bash
# 查看当前转发
ios forward --list

# 清除所有转发
ios forward --reset

# 或者使用不同端口
ios forward --udid [UDID] 8101 8100
```

### 7.5 性能优化建议

对于同时管理多台设备（>5台）：
- 使用 USB 3.0 集线器保证带宽
- 避免使用 USB 延长线
- 考虑使用多台测试机分担负载
- 合理设置线程池大小，避免资源竞争

---

## 总结

通过本文的方案，我们成功实现了：

1. **一次配置，到处运行**：在 Mac 上编译 WDA，生成通用 IPA 包
2. **跨平台支持**：在 Windows/Linux 上使用 go-ios 管理设备
3. **多设备并行**：通过端口映射和线程池实现多设备并发测试
4. **成本优化**：完全使用免费的个人开发者账号

这套方案已经在我们团队的生产环境中稳定运行，支持每日数千次测试用例的执行。希望它能帮助你在 iOS 自动化测试的道路上少走一些弯路。

### 后续拓展建议

- 集成到 Jenkins/GitLab CI 实现持续测试
- 结合 Allure 生成漂亮的测试报告
- 使用 Docker 容器化测试环境
- 探索更多 go-ios 的高级功能（如网络模拟、性能监控）

如果你在实践过程中遇到任何问题，欢迎在评论区留言讨论！

---

**参考资料**
- [Appium WebDriverAgent](https://github.com/appium/WebDriverAgent)
- [go-ios GitHub](https://github.com/danielpaulus/go-ios)
- [facebook-wda 文档](https://github.com/openatx/facebook-wda)