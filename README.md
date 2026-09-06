# 编码遥控 / CodexRemote

手机语音/文字 ↔ Mac 守护进程 ↔ 本地 Codex（薄 Remote I/O）。
Phone voice/text ↔ Mac daemon ↔ local Codex (thin remote I/O).

Default port **8787**. UI default language: Chinese (switchable).

## Quick start / 快速开始
```bash
npm install
npm start
```

终端打印局域网地址、配对链接与二维码；同一 Wi-Fi 扫码。
Terminal prints LAN URL, pair link, and QR; scan on the same Wi-Fi.

## Features / 功能
- Mac daemon: pair secret, PWA static files, WebSocket chat, LAN IP, QR
- Local Codex bridge: discovers codex CLI; streams replies; daemon starts even if missing
- Mobile PWA: text; long-press mic to draft; multi-turn; zh/en i18n
- Setup wizard page: LAN + optional Tailscale / Cloudflare (pros/cons/steps, both languages)
- Security: pairing required; model credentials stay on Mac only

## Pairing and threat model / 配对与威胁模型

- First run creates ~/.codex-remote/config.json with pairToken (mode 0600).
- WebSocket and protected REST require the pair token.
- LAN peers may discover the port; without the token they cannot chat.
- Public tunnels widen exposure; keep the token; prefer an identity gate on the tunnel.
- Phone never stores OpenAI or Codex API credentials.

## Layout

- package.json — scripts start / dev
- daemon/index.js — HTTP + WS + Codex bridge
- public/ — mobile PWA
- docs/MANUAL_TEST.md — checklist

## Optional remote access

Open the in-app page 联网设置 / Remote setup for bilingual Tailscale and Cloudflare Tunnel guides (pros, cons, step-by-step).
应用内「联网设置」含 Tailscale 与 Cloudflare Tunnel 的中英优缺点与步骤。
