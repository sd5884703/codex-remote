# 编码遥控 / CodexRemote

手机语音/文字 ↔ 电脑守护进程（Mac / Windows）↔ 本地 Codex（薄 Remote I/O）。

**Primary path: going-out via private mesh (Tailscale).** LAN is appendix; Cloudflare is optional backup.
主路径：出门 + 私人组网（Tailscale）。局域网为附录；Cloudflare 为备选。

Default port **8787**. UI default language: Chinese (switchable).

## Quick start / 快速开始

```bash
npm install
npm start
```

Open `http://127.0.0.1:8787/setup.html` for the going-out wizard.
打开联网设置向导完成私人组网与「登录后常开」。

Always-on (login; OS-dispatch):

```bash
npm run install:always-on
npm run uninstall:always-on
```

See **docs/使用说明.md** for the full Chinese guide.

## Features / 功能
- Going-out wizard: private mesh (Tailscale) checklist, always-on install, mesh address summary
- Computer daemon: pair secret, PWA, WebSocket chat, prefer Tailscale IP in pair/QR when present
- Local Codex bridge; stub path via `npm run start:stub` unchanged
- Mobile PWA: text; long-press mic; zh/en; connect failure hints (服务未开 / 组网未在线 / 地址或钥匙不对)
- Security: pairing required; model credentials stay on the computer only

## Pairing and threat model

- First run creates ~/.codex-remote/config.json with pairToken (mode 0600).
- WebSocket and protected REST require the pair token.
- Always-on install sets exposeLan so mesh can reach the port; token still required.
- Phone never stores OpenAI or Codex API credentials.

## Layout

- `daemon/index.js` — HTTP + WS + Codex bridge + `/api/netinfo`
- `public/` — mobile PWA + setup wizard
- `scripts/always-on.js` — OS dispatch (Mac / Windows / linux QA)
- `scripts/install-launch-agent.sh` — Mac launchd
- `scripts/windows/` — Windows Scheduled Task scripts
- `scripts/install-keepalive-linux.sh` — linux box QA keepalive
- `docs/使用说明.md` — Chinese user guide (going-out first)
- `docs/specs/PHASE1_TAILSCALE_FOOLPROOF.md` — phase-1 acceptance spec

## License / 许可

MIT © 2026 孟大大（GitHub: sd5884703）. Free to use, modify, and share.
MIT 协议开源：可自由使用、修改与分享；详见根目录 `LICENSE`。

Public purpose / 公开用途：thin phone ↔ computer Remote I/O for local Codex (not an orchestrator).
公开用途：手机 ↔ 电脑的薄 Remote I/O，对接本机 Codex（不是编排器）。
