# 编码遥控

Phone remote for local Codex on your home computer.

用手机遥控家里电脑上的本地编码助手（Codex）。电脑运行一个本地服务，手机用浏览器打开页面发文字（可选语音）。模型相关密钥只留在电脑，不进手机。

支持 Mac 与 Windows。推荐外出使用时：先安装 Tailscale（在自己的设备之间建立加密私有网络），再启用「登录后自动启动」，手机用 Tailscale 地址连接。家里同一 Wi‑Fi 也能用，但是备用。没有安卓安装包（`.apk`），可把网页加到手机桌面。

默认端口 `8787`。界面默认中文，可切英文。

## 怎么开始

1. 安装依赖并启动：

```bash
npm install
npm start
```

2. 在同一台电脑浏览器打开设置向导：

`http://127.0.0.1:8787/setup.html`

也可先打开对话页，再点「联网设置」。

3. 按向导完成 Tailscale 与「登录后自动启动」。完整步骤见 **[docs/使用说明.md](docs/使用说明.md)**。

登录后自动启动（安装 / 卸载）：

```bash
npm run install:always-on
npm run uninstall:always-on
```

## 这个仓库里有什么

- `daemon/`：电脑上的本地服务（网页、配对、对话转发）
- `public/`：手机网页与设置向导
- `scripts/`：登录后自动启动的安装/卸载脚本（Mac / Windows；Linux 仅测试用）
- `docs/使用说明.md`：面向普通人的完整中文说明

## 安全（简短）

- 需要配对令牌才能聊天（配对令牌：一段用于验证身份的密钥字符串）。
- 启用「登录后自动启动」（登录电脑后自动启动服务）会允许经 Tailscale 访问本机端口；没有配对令牌仍不能聊天。
- 手机不保存模型服务商的密钥。

## 许可与仓库

MIT © 2026 孟大大（GitHub: [sd5884703](https://github.com/sd5884703)）。可自由使用、修改与分享；见根目录 `LICENSE`。

公开仓库：https://github.com/sd5884703/codex-remote
