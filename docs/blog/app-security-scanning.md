---
title: App 安全扫描与漏洞审计工具详解
createTime: 2026/06/14 00:00:00
permalink: /blog/app-security-scanning/
---

## 概述

App 安全扫描与漏洞审计是移动应用安全测试的重要组成部分，主要解决：

- **安全风险**：SQL 注入、缓冲区溢出、权限绕过等
- **隐私风险**：过度收集用户数据、隐私政策违规等
- **漏洞扫描**：已知 CVE、业务逻辑漏洞等
- **合规审计**：GDPR、CCPA、APP 违法违规收集使用个人信息等

本文详细介绍各平台（Android、iOS、Web）的安全扫描工具。

## Android 安全扫描

### MobSF

开源移动安全框架，支持 Android、iOS、Windows 的静态和动态分析。

**特点：**
- 静态分析（源码、APK 反编译）
- 动态分析（运行时行为监控）
- Web API 测试
- 恶意软件检测
- 支持 CI/CD 集成

**安装：**
```bash
# Docker
docker pull opensecurity/mobsf
docker run -it -p 8000:8000 opensecurity/mobsf

# 或 pip
pip install mobsf
mobsfscan -h
```

**使用：**
```bash
# 扫描 APK
mobsfscan app.apk

# 扫描源码目录
mobsfscan ./android_source/

# 输出 JSON 报告
mobsfscan -o report.json app.apk
```

**GitHub：** https://github.com/MobSF/Mobile-Security-Framework-MobSF

### APKTool

Android APK 反编译工具，用于资源解码和 Smali 修改。

**安装：**
```bash
# macOS
brew install apktool

# Linux
sudo apt install apktool

# Windows (需要 Java)
# 下载 apktool.jar 并配置
```

**使用：**
```bash
# 反编译 APK
apktool d app.apk -o output/

# 重新打包
apktool b output/ -o new_app.apk
```

### Jadx

Dex 转 Java 源码的反编译器，GUI 和命令行版本。

**安装：**
```bash
# 下载 release 包
# 或使用 jadx-gui
brew install jadx
```

**使用：**
```bash
# 命令行反编译
jadx -d output_dir app.apk

# GUI 界面
jadx-gui app.apk
```

### Frida

动态 instrumentation 工具，用于运行时分析和 hooking。

**安装：**
```bash
pip install frida-tools
frida --version
```

**使用：**
```bash
# 列出运行中的进程
frida-ps -U

# Hook 函数
frida -U -f com.example.app -l script.js

# 跟踪方法调用
frida-trace -U -f com.example.app "*crypto*"
```

### Androguard

Python 编写的 Android 逆向分析工具。

**安装：**
```bash
pip install androguard
```

**使用：**
```python
from androguard.core.bytecodes.apk import APK
from androguard.core.analysis.analysis import Analysis

# 分析 APK
apk = APK("app.apk")
print(f"Package: {apk.get_package()}")
print(f"Activities: {apk.get_activities()}")

# 分析权限
for perm in apk.get_permissions():
    print(f"Permission: {perm}")
```

### Drozer

Android 安全评估框架，测试组件安全。

**安装：**
```bash
pip install drozer
```

**使用：**
```bash
# 启动 server
drozer server start

# 连接 agent
drozer console connect

# 检查组件导出
run app.package.attacksurface com.example.app

# 测试 activity 劫持
run app.activity.start --component com.example.app com.example.app.LoginActivity
```

### QARK (Quick Android Review Kit)

LinkedIn 开源的 Android 安全分析工具。

**安装：**
```bash
pip install qark
```

**使用：**
```bash
# 分析 APK 或源码
qark --apk app.apk
qark --source /path/to/android/source
```

## iOS 安全扫描

### MobSF-iOS

MobSF 的 iOS 分析模块，支持 IPA 分析。

**使用：**
```bash
# 上传 IPA 到 MobSF Web 界面
# 或命令行
mobsfscan app.ipa
```

### class-dump

Objective-C 类信息提取工具。

**安装：**
```bash
# macOS
brew install class-dump
```

**使用：**
```bash
# 导出类信息
class-dump -H app_binary -o output/

# 查看头文件
class-dump app_binary | head -100
```

### otool

macOS/iOS 二进制分析工具。

**使用：**
```bash
# 查看依赖库
otool -L app_binary

# 反汇编
otool -tV app_binary

# 查看加密信息
otool -hv app_binary
```

### Cycript

Objective-C/JavaScript 运行时注入工具。

**使用：**
```bash
# 附加到进程
cycript -p process_name

# 验证内存地址
cycript #0x12345678
```

### Frida-iOS

iOS 平台的 Frida 工具集。

**使用：**
```bash
# Hook Objective-C 方法
frida -U -f com.example.app -l script.js

# 跟踪 SSL pinning
frida -U -f com.example.app --codesign :fully-loaded -l ssl-unpinning.js
```

### Passionfruit

基于 Frida 的 iOS 应用分析 GUI。

**安装：**
```bash
npm install -g passionfruit
```

**使用：**
```bash
passionfruit
# 浏览器访问 http://localhost:31337
```

### SwiftShield

iOS 混淆工具，抵制逆向工程。

**官网：** https://github.com/rodher/SwiftShield

## Web 漏洞扫描

### OWASP ZAP

OWASP 官方 Web 应用安全扫描器。

**特点：**
- 主动扫描和被动扫描
- 自动爬虫
- SQL 注入、XSS 检测
- API 测试
- CI/CD 集成

**安装：**
```bash
# Docker
docker pull owasp/zap2docker-stable
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://example.com

# Desktop
# 下载安装包：https://www.zaproxy.org/download/
```

**使用：**
```bash
# 快速扫描
zap-baseline.py -t https://example.com

# 完整扫描
zap-full-scan.py -t https://example.com -r report.html

# API 扫描
zap-api-scan.py -t openapi.json -f json -r report.json
```

### Burp Suite

商业 Web 安全测试平台，社区版免费。

**特点：**
- 代理拦截
- 主动/被动扫描
- Intruder (暴力测试)
- Repeater (请求重放)
- 扩展插件

**官网：** https://portswigger.net/burp

### Nuclei

基于模板的漏洞扫描工具，支持自定义 PoC。

**安装：**
```bash
# binary
nuclei -version

# 或 go install
go install github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest
```

**使用：**
```bash
# 扫描目标
nuclei -u https://example.com

# 使用漏洞模板
nuclei -t cves/ -l targets.txt

# 输出报告
nuclei -u https://example.com -json -o results.json
```

### sqlmap

自动化 SQL 注入检测和利用工具。

**安装：**
```bash
pip install sqlmap
```

**使用：**
```bash
# 检测注入点
sqlmap -u "https://example.com?id=1"

# 获取数据库
sqlmap -u "https://example.com?id=1" --dbs

# 提取数据
sqlmap -u "https://example.com?id=1" -D dbname -T users --dump
```

### XSStrike

XSS 扫描工具，检测并利用跨站脚本漏洞。

**安装：**
```bash
pip install xsstrike
```

**使用：**
```bash
# 扫描 URL
xsstrike scan -u "https://example.com?q=test"

# 批量扫描
xsstrike crawl -u "https://example.com"
```

### Nikto

Web 服务器扫描器，发现潜在安全问题。

**安装：**
```bash
brew install nikto
```

**使用：**
```bash
nikto -h https://example.com
nikto -h https://example.com -o report.html
```

## API 安全测试

### Postman + Security Collection

API 安全测试工具集。

**Security Collection 包含：**
- OAuth 2.0 安全测试
- JWT 令牌验证
- SQL 注入测试
- XSS 测试

### MeterSphere

开源持续测试平台，支持 API 安全测试。

**官网：** https://www.metersphere.io/

### Apifox

API 文档、调试、Mock、安全测试一体化工具。

**官网：** https://www.apifox.cn/

## 隐私合规检测

### 移动应用隐私检测（腾讯）

腾讯棱线隐私检测平台。

**功能：**
- App 违规收集个人信息检测
- 权限使用情况分析
- 第三方 SDK 检测
- 隐私政策文本分析

**官网：** https://privacy.qq.com/

### App Privacy Checker

iOS App 隐私权限检测工具。

**GitHub：** https://github.com/real名义/AppPrivacyChecker

### Piiano

数据隐私保护平台，GDPR 合规工具。

**官网：** https://www.piiano.com/

### MobSF Privacy Analysis

MobSF 的隐私分析模块。

```bash
# MobSF 隐私分析
mobsfscan --hash app.apk --privacy
```

## 代码安全扫描

### SonarQube Security

企业级代码安全扫描，支持多语言。

**规则：**
- SAST (静态应用安全测试)
- 敏感信息检测
- SQL 注入、XSS、CSRF 检测
- 加密 API 误用检测

**官网：** https://www.sonarqube.org/

### Semgrep

轻量级静态分析工具，支持自定义规则。

**安装：**
```bash
pip install semgrep
```

**使用：**
```bash
# 扫描代码
semgrep --config=auto .

# 使用安全规则
semgrep --config=security-rules .
```

### CodeQL

GitHub 的代码分析引擎，支持安全查询。

**安装：**
```bash
# GitHub CLI
gh extension install github/codeql-action

# 或手动安装
# https://github.com/github/codeql-cli-binaries
```

**使用：**
```bash
# 创建数据库
codeql database create --language=java ./db

# 查询
codeql database analyze ./db --format=sarif-latest --output=results.sarif queries/
```

### Checkmarx

商业 SAST 解决方案，支持多种语言。

**官网：** https://www.checkmarx.com/

### Veracode

云端 SAST 平台，集成到 SDLC。

**官网：** https://www.veracode.com/

## 敏感信息检测

### GitGuardian

Git 敏感信息检测，防止密码泄露。

**官网：** https://www.gitguardian.com/

**CLI：**
```bash
pip install ggshield
ggshield scan repo .
```

### TruffleHog

Git 敏感信息扫描工具。

**安装：**
```bash
pip install trufflehog
```

**使用：**
```bash
# 扫描 Git 仓库
trufflehog git https://github.com/example/repo

# 扫描本地目录
trufflehog filesystem ./secrets_directory
```

### detect-secrets

Git pre-commit hook 检测敏感信息。

**安装：**
```bash
pip install detect-secrets
```

**使用：**
```bash
# 初始化
detect-secrets init

# 扫描
detect-secrets scan > .secrets.baseline
```

## 云安全扫描

### ScoutSuite

多云安全态势评估工具。

**安装：**
```bash
pip install scoutsuite
```

**使用：**
```bash
scout --provider=aws --report-dir=report
```

### Prowler

AWS 安全评估工具。

**安装：**
```bash
pip install prowler
```

**使用：**
```bash
prowler
prowler -r us-east-1 -c all
```

### SkyFleet

GCP 安全扫描工具。

**GitHub：** https://github.com/Talroo/SkyFleet

## 容器安全扫描

### Trivy

容器镜像漏洞扫描工具。

**安装：**
```bash
brew install trivy
```

**使用：**
```bash
# 扫描镜像
trivy image nginx:latest

# 扫描文件系统
trivy fs ./project

# 输出报告
trivy image --format json --output report.json alpine:latest
```

### Clair

容器镜像漏洞分析平台。

**官网：** https://github.com/quay/clair

### Anchore

容器内容分析和安全检查。

**官网：** https://www.anchore.com/

## CI/CD 安全集成

### GitHub Actions 安全扫描

```yaml
name: Security Scan
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Scan secrets
        run: |
          pip install ggshield
          ggshield scan repo --exit-zero

      - name: SAST Scan
        run: |
          pip install semgrep
          semgrep --config=auto --error .

      - name: Dependency Scan
        run: |
          npm audit --audit-level=high
          pip audit
```

### GitLab CI 安全扫描

```yaml
security_scan:
  stage: security
  image: registry.gitlab.com/security-scan-tools
  script:
    - semgrep --config=auto --json > semgrep.json
    - trivy fs --format json --output trivy.json .
  artifacts:
    reports:
      sast: semgrep.json
      container_scanning: trivy.json
```

## 工具选择建议

| 场景 | 推荐工具 |
|------|----------|
| Android 全面分析 | MobSF |
| Android 逆向工程 | Jadx + APKTool + Frida |
| iOS 安全测试 | Frida + Passionfruit |
| Web 漏洞扫描 | OWASP ZAP + Burp Suite |
| SQL 注入检测 | sqlmap |
| XSS 检测 | XSStrike |
| API 安全测试 | Postman + Security Collection |
| 代码安全扫描 | SonarQube + Semgrep |
| 敏感信息检测 | GitGuardian + TruffleHog |
| 容器安全扫描 | Trivy + Clair |
| 云安全评估 | ScoutSuite + Prowler |
| 隐私合规检测 | 腾讯棱线 + MobSF Privacy |

## 最佳实践

1. **分层防护**：静态扫描 + 动态扫描 + 运行时保护
2. **自动化集成**：将安全扫描集成到 CI/CD pipeline
3. **定期扫描**：上线前全面扫描，版本更新时增量扫描
4. **威胁情报**：关注最新 CVE 和漏洞披露
5. **修复优先级**：根据 CVSS 评分确定修复顺序
6. **合规自查**：针对 GDPR、CCPA 等进行专项检查
7. **第三方 SDK**：重点审计引入的第三方库和 SDK

## 资源链接

- [OWASP ZAP](https://www.zaproxy.org/)
- [MobSF](https://github.com/MobSF/Mobile-Security-Framework-MobSF)
- [Burp Suite](https://portswigger.net/burp)
- [sqlmap](https://github.com/sqlmapproject/sqlmap)
- [Frida](https://frida.re/)
- [SonarQube](https://www.sonarqube.org/)
- [Semgrep](https://semgrep.dev/)
- [Trivy](https://github.com/aquasecurity/trivy)
- [GitGuardian](https://www.gitguardian.com/)
- [腾讯棱线隐私检测](https://privacy.qq.com/)