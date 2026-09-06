export const WIZARD = {
   "en" : {
      "cfCons" : [
         "Needs CF account and domain",
         "China latency can be poor",
         "Prefer http2; dashboard mostly English",
         "Keep pair token; enable Access"
      ],
      "cfPros" : [
         "No port mapping; cloudflared dials out",
         "Custom domain on phone",
         "Optional Access recommended"
      ],
      "cfSteps" : [
         "Install cloudflared per official docs",
         "Run tunnel login",
         "Create tunnel named codex-remote",
         "Point ingress to local port 8787 with http2",
         "Route hostname and run tunnel",
         "Open https domain with pair token on phone"
      ],
      "cfTitle" : "Optional: Cloudflare Tunnel",
      "tsCons" : [
         "Needs an account",
         "China DERP or control-plane can be flaky",
         "Extra app on both devices"
      ],
      "tsPros" : [
         "Feels like LAN after mesh",
         "No public IP needed",
         "Encrypted mesh"
      ],
      "tsSteps" : [
         "Install Tailscale on Mac and phone; same account",
         "Note Mac Tailscale IP (100.x)",
         "Run npm start on Mac",
         "Open pair link on phone using mesh IP",
         "Save URL and token in PWA then connect"
      ],
      "tsTitle" : "Optional: Tailscale"
   },
   "zh" : {
      "cfCons" : [
         "éè¦è´¦å·ä¸åå",
         "ä¸­å½å¤§éå»¶è¿æç¨³å®æ§å¯è½è¾å·®",
         "é¡»ç¨ http2ï¼æ§å¶å°å¤ä¸ºè±æ",
         "å¬ç½æ´é²éä¿çéå¯¹ä»¤ç"
      ],
      "cfPros" : [
         "æ éç«¯å£æ å°ï¼åºç«å»ºé§",
         "å¯ç¨èªå®ä¹ååå¨ææºæå¼",
         "å¯å å  Access é¨ç¦ï¼å»ºè®®ï¼"
      ],
      "cfSteps" : [
         "æå®æ¹ææ¡£å®è£ cloudflared",
         "ç»å½å¹¶åå»ºé§é codex-remote",
         "å¥å£æåæ¬æº 8787ï¼å¯ç¨ http2",
         "ååè·¯ç±å°é§éå¹¶è¿è¡",
         "å»ºè®®éç½® Accessï¼ææºç¨ https ååå ä»¤çæå¼"
      ],
      "cfTitle" : "å¯éï¼Cloudflare Tunnel",
      "tsCons" : [
         "需要 Tailscale账号",
         "中国大陆控制面／DERP可能不稳定",
         "Mac与手机都需安装客户端"
      ],
      "tsPros" : [
         "组网后体感接近局域网，无需公网 IP",
         "手机用 Tailscale IP访问 Mac守护进程",
         "加密组网（点对点或 DERP）"
      ],
      "tsSteps" : [
         "Mac 安装并登录 Tailscale",
         "手机安装并登录同一账号 (Tailscale)",
         "确认两端在线，记下 Tailscale IP",
         "Mac 运行守护进程（端口 8787）",
         "手机打开配对链接，主机换成 Tailscale IP",
         "在应用中保存地址与令牌并连接"
      ],
      "tsTitle" : "可选：Tailscale"
   }
}
;
