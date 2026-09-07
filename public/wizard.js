export const WIZARD = {
  "en": {
    "cfCons": [
      "Needs CF account and domain",
      "China latency can be poor",
      "Prefer http2; dashboard mostly English",
      "Keep pair token; enable Access"
    ],
    "cfPros": [
      "No port mapping; cloudflared dials out",
      "Custom domain on phone",
      "Optional Access recommended"
    ],
    "cfSteps": [
      "Install cloudflared per official docs",
      "Run tunnel login",
      "Create tunnel named codex-remote",
      "Point ingress to local port 8787 with http2",
      "Route hostname and run tunnel",
      "Open https domain with pair token on phone"
    ],
    "cfTitle": "Optional: Cloudflare Tunnel",
    "tsCons": [
      "Needs an account",
      "China DERP or control-plane can be flaky",
      "Extra app on both devices"
    ],
    "tsPros": [
      "Feels like LAN after mesh",
      "No public IP needed",
      "Encrypted mesh"
    ],
    "tsSteps": [
      "Install Tailscale on Mac and phone; same account",
      "Note Mac Tailscale IP (100.x)",
      "Run npm start on Mac",
      "Open pair link on phone using mesh IP",
      "Save URL and token in the app then connect"
    ],
    "tsTitle": "Optional: Tailscale"
  },
  "zh": {
    "cfCons": [
      "需要 Cloudflare 账号与域名",
      "中国大陆延迟或稳定性可能较差",
      "须用 http2；控制台多为英文",
      "公网暴露须保留配对令牌，建议开启 Access"
    ],
    "cfPros": [
      "无需端口映射，出站建隧道",
      "可用自定义域名在手机打开",
      "可叠加 Access 门禁（建议）"
    ],
    "cfSteps": [
      "按官方文档安装 cloudflared",
      "登录 Cloudflare 并创建隧道（如命名 codex-remote）",
      "入口指向本机 8787，启用 http2",
      "将域名路由到该隧道并运行 cloudflared",
      "建议配置 Access；手机用 https 域名加配对令牌打开"
    ],
    "cfTitle": "可选：Cloudflare Tunnel",
    "tsCons": [
      "需要 Tailscale账号",
      "中国大陆控制面／DERP可能不稳定",
      "Mac与手机都需安装客户端"
    ],
    "tsPros": [
      "组网后体感接近局域网，无需公网 IP",
      "手机用 Tailscale IP访问 Mac守护进程",
      "加密组网（点对点或 DERP）"
    ],
    "tsSteps": [
      "Mac 安装并登录 Tailscale",
      "手机安装并登录同一账号 (Tailscale)",
      "确认两端在线，记下 Tailscale IP",
      "Mac 运行守护进程（端口 8787）",
      "手机打开配对链接，主机换成 Tailscale IP",
      "在应用中保存地址与令牌并连接"
    ],
    "tsTitle": "可选：Tailscale"
  }
};
