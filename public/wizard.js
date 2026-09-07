/** Wizard copy: going-out (private mesh) is primary; LAN appendix; CF demoted. */
export const WIZARD = {
  en: {
    leadTitle: 'Going-out channel (primary)',
    leadBody: 'Use private mesh (Tailscale) so your phone can reach the computer away from home Wi-Fi. LAN is only for same-Wi-Fi appendix. Order: mesh first, then always-on service.',
    enableTs: 'Enable going-out via private mesh (Tailscale)',
    skipWarn: 'You skipped Tailscale — going-out is unavailable. Phone only works on the same home Wi-Fi (see appendix).',
    tsTitle: 'Private mesh (Tailscale)',
    tsIntro: 'We cannot log into Tailscale for you. Follow these steps on computer and phone with the same account. Do mesh before starting always-on.',
    tsStepsMac: [
      'On Mac: install Tailscale from the official download site or App Store, open it, sign in.',
      'On phone: install Tailscale, sign in with the SAME account.',
      'Confirm both devices show as Connected / Online in the Tailscale app.',
      'Note this computer's mesh address (100.x IP or MagicDNS name) — that is what the phone saves, not home Wi-Fi IP.',
      'Next: install always-on after mesh (mesh first, then service) so Tailscale can reach the port.',
    ],
    tsStepsWin: [
      'On Windows: install Tailscale from the official download site, open it, sign in.',
      'On phone: install Tailscale, sign in with the SAME account.',
      'Confirm both devices show as Connected / Online in the Tailscale app.',
      'Note the PC mesh address (100.x IP or MagicDNS name) — that is what the phone saves, not home Wi-Fi IP.',
      'Next: install always-on after mesh (mesh first, then service) so Tailscale can reach the port.',
    ],
    detectOk: 'Tailscale looks installed / mesh IP detected on this computer.',
    detectNo: 'Tailscale not detected yet. Install and sign in, then tap Next.',
    nextBtn: 'I have set it up — next',
    alwaysOnTitle: 'Always-on after login',
    alwaysOnBodyMac: 'Install a user launchd agent so CodexRemote starts when you log into the Mac. For the Tailscale path it also opens the port to the private mesh so the phone can reach it.',
    alwaysOnBodyWin: 'Install a user Scheduled Task so CodexRemote starts when you log into Windows. For the Tailscale path it also opens the port to the private mesh so the phone can reach it.',
    alwaysOnBodyLinux: 'Box QA only: lightweight keepalive (records pid and backgrounds the process). Not distro packaging for end users.',
    meshFirstNote: 'Mesh first, then service (install always-on only after Tailscale is online).',
    sleepWarn: 'If the computer is shut down or asleep, going-out will not work.',
    installAlwaysOn: 'Install always-on',
    uninstallAlwaysOn: 'Uninstall always-on',
    alwaysOnCmd: 'Or in Terminal under the project folder: npm run install:always-on / npm run uninstall:always-on',
    summaryTitle: 'Done — what happened',
    summaryBody: 'Review below, then save the mesh address on your phone.',
    summaryNoMesh: 'No mesh address yet. On the computer, open Tailscale and copy the 100.x IP or MagicDNS name, then manually enter a stable URL on the phone (e.g. http://100.x.x.x:8787). Refresh this page after Tailscale is online.',
    fillMesh: 'Fill and save going-out address on this device',
    cfTitle: 'Optional backup: Cloudflare Tunnel',
    cfNote: 'Advanced / optional only — not the foolproof primary path. Prefer private mesh (Tailscale).',
    cfSteps: [
      'Install cloudflared per official docs',
      'Create a tunnel pointing at local port 8787 (http2)',
      'Keep the pair token; prefer Access on the tunnel',
    ],
    lanTitle: 'Appendix: home LAN (same Wi-Fi)',
    lanBody: 'Only when phone and computer share the same Wi-Fi. Not for going out. Use the LAN IP from the computer terminal if you skip Tailscale.',
  },
  zh: {
    leadTitle: '出门通道（主路径）',
    leadBody: '通过私人组网（Tailscale），让手机在外面也能连上家里的电脑。家里同一 Wi-Fi 只是附录备用，不是主成功路径。请记住：先组网再开服务。',
    enableTs: '启用出门通道：私人组网（Tailscale）',
    skipWarn: '你跳过了私人组网（Tailscale）。出门不可用。手机只能在家里同一 Wi-Fi 下使用（见附录）。',
    tsTitle: '私人组网（Tailscale）',
    tsIntro: '我们无法替你完成第三方登录。请按下面步骤，在电脑和手机上用同一个账号自行安装并登录。请先完成组网，再安装常开服务。',
    tsStepsMac: [
      '在 Mac 上：打开官方下载页或 App Store 安装 Tailscale，打开应用并登录。',
      '在手机上：安装 Tailscale，用【同一个账号】登录。',
      '确认两端在 Tailscale 应用里都显示已连接 / 在线。',
      '记下本机的组网地址（以 100. 开头的 IP，或魔术域名）。手机要保存的是这个，不是家里 Wi-Fi 的 192.168 地址。',
      '下一步再安装「登录后常开」（先组网再开服务），并允许组网访问本机端口。',
    ],
    tsStepsWin: [
      '在 Windows 上：打开官方下载页安装 Tailscale，打开应用并登录。',
      '在手机上：安装 Tailscale，用【同一个账号】登录。',
      '确认两端在 Tailscale 应用里都显示已连接 / 在线。',
      '记下电脑的组网地址（以 100. 开头的 IP，或魔术域名）。手机要保存的是这个，不是家里 Wi-Fi 的 192.168 地址。',
      '下一步再安装「登录后常开」（先组网再开服务）。会创建用户级计划任务（Scheduled Task），并允许组网访问本机端口。',
    ],
    detectOk: '已检测到本机可能已安装私人组网（Tailscale）或已有组网 IP。',
    detectNo: '尚未检测到私人组网（Tailscale）。请先安装并登录，再点「我已装好，下一步」。',
    nextBtn: '我已装好，下一步',
    alwaysOnTitle: '登录后常开',
    alwaysOnBodyMac: '安装用户级登录启动项（launchd），登录 Mac 后自动启动编码遥控。出门路径会同时允许组网访问本机端口，以便私人组网（Tailscale）能连上。',
    alwaysOnBodyWin: '安装用户级计划任务（Scheduled Task），登录 Windows 后自动启动编码遥控。出门路径会同时允许组网访问本机端口，以便私人组网（Tailscale）能连上。',
    alwaysOnBodyLinux: '箱测环境：安装轻量保活（记录进程号并后台挂起）。不是给普通用户装的发行包装。',
    meshFirstNote: '先组网再开服务：请确认私人组网（Tailscale）已在线后，再安装登录后常开。',
    sleepWarn: '关机或睡眠则出门不可用：电脑必须保持开机且未睡眠，私人组网与常开服务才有效。',
    installAlwaysOn: '安装常开',
    uninstallAlwaysOn: '卸载常开',
    alwaysOnCmd: '也可在项目目录终端执行：npm run install:always-on  或  npm run uninstall:always-on',
    summaryTitle: '完成：做了什么',
    summaryBody: '请确认下面信息，并把组网稳定地址保存到手机。',
    summaryNoMesh: '尚未读到组网地址：请在电脑的 Tailscale 里查看 100.x IP 或魔术 DNS，在手机里手动填写稳定地址（例如 http://100.x.x.x:8787），确认组网在线后也可刷新本页。',
    fillMesh: '在本机一键填入并保存出门地址',
    cfTitle: '备选进阶：Cloudflare 隧道',
    cfNote: '仅作备份/进阶，不是主路径。请优先用私人组网（Tailscale）。',
    cfSteps: [
      '按官方文档安装 cloudflared',
      '创建隧道，入口指向本机 8787（建议 http2）',
      '务必保留配对令牌；建议在隧道上加 Access 门禁',
    ],
    lanTitle: '附录：家里局域网（同一 Wi-Fi）',
    lanBody: '仅当手机与电脑连同一个 Wi-Fi 时可用。不能代替出门。若跳过私人组网，可用终端里打印的局域网地址。',
  },
};


/** Pick Mac/Windows (or linux QA) copy for the current host platform. */
export function wizardFor(lang, platform) {
  const base = { ...(WIZARD[lang] || WIZARD.zh) };
  const plat = platform || 'darwin';
  if (plat === 'win32') {
    base.tsSteps = base.tsStepsWin || base.tsStepsMac;
    base.alwaysOnBody = base.alwaysOnBodyWin || base.alwaysOnBodyMac;
  } else if (plat === 'linux') {
    base.tsSteps = base.tsStepsWin || base.tsStepsMac;
    base.alwaysOnBody = base.alwaysOnBodyLinux || base.alwaysOnBodyMac;
  } else {
    base.tsSteps = base.tsStepsMac;
    base.alwaysOnBody = base.alwaysOnBodyMac;
  }
  return base;
}
