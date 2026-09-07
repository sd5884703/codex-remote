# 规格：编码遥控 · 第一期 B

### 4. 安装「登录后常开」（强烈建议）

出门时你不会一直开着终端。请安装用户级登录后常开（先组网再开服务）。

方式 A：向导里点安装常开。方式 B：用项目自带的安装与卸载脚本。

说明：
- Mac：launchd LaunchAgent，登录后自动启动
- Windows：用户级计划任务（Scheduled Task），登录后自动启动
- Linux：箱测 QA keepalive（非发行版包装）
- 会打开对外监听，私人组网才能访问端口；仍需配对令牌

#### Node 准备
- 需要 Node.js 18+（node -v）
- Windows 安装时勾选加入 PATH

#### 防火墙 / 睡眠风险
- Windows 防火墙若拦截，请允许 Node 访问网络
- 关机或睡眠则出门不可用：电脑须保持开机未睡眠；不会唤醒已睡眠/关机的电脑。


## 验收
- 三平台脚本；netinfo platform/method；向导分支；无 push。

## 目标摘要
双系统常开（Mac launchd / Windows 计划任务）；向导中文分支；先组网再开服务；daemon 平台感知；Linux 仅箱测。

## 非目标
安装包、Wake、多 CLI、APK、真机安装、发行版 packaging。
