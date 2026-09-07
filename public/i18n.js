/** Bilingual i18n — default zh, persist in localStorage */
export const STRINGS = {
  zh: {
    appName: '编码遥控',
    tagline: '手机 ↔ Mac 本地 Codex',
    chat: '对话',
    setup: '联网设置',
    lang: '语言',
    connect: '连接',
    disconnect: '断开',
    connected: '已连接',
    disconnected: '未连接',
    serverUrl: '服务器地址',
    pairToken: '配对令牌',
    save: '保存',
    send: '发送',
    draft: '输入消息，或长按麦克风说话…',
    holdMic: '按住说话',
    releaseEdit: '松开后可编辑再发送',
    speechUnsupported: '当前浏览器不支持语音识别（建议 Chrome / Edge / Safari 新版）',
    listening: '正在听…',
    streaming: 'Codex 输出中…',
    clear: '清空会话',
    status: '状态',
    codexFound: '已找到 codex',
    codexMissing: '未找到 codex',
    pairHint: '在电脑终端查看配对二维码或链接',
    scanQr: '配对二维码',
    copyLink: '复制配对链接',
    copied: '已复制',
    error: '错误',
    busy: '正在处理上一条，请稍候',
    empty: '请输入内容',
    pairingRequired: '需要配对令牌',
    wizardTitle: '出门通道向导',
    lanTitle: '附录：家里局域网',
    lanBody: '手机与 Mac 同一 Wi‑Fi 时可用；不是出门主路径。',
    tsTitle: '私人组网（Tailscale）',
    cfTitle: '备选：Cloudflare 隧道',
    pros: '优点',
    cons: '缺点',
    steps: '步骤',
    back: '返回对话',
    installPwa: '可「添加到主屏幕」，变成能放在手机桌面的网页应用',
    fillMesh: '填入出门地址',
    meshFilled: '已保存出门（组网）地址',
    meshMissing: '尚未检测到组网地址，请先在 Mac 完成私人组网（Tailscale）',
    errServiceDown: '服务未开：电脑上的编码遥控还没运行。请在 Mac 执行 npm start，或确认已安装「登录后常开」。',
    errMeshOffline: '组网未在线：私人组网（Tailscale）可能未连接。请在手机与 Mac 上打开 Tailscale，确认两端在线后重试。',
    errBadAddrOrKey: '地址或钥匙不对：请检查服务器地址（应为组网 100.x / 魔术 DNS，不是家里 Wi-Fi）与配对令牌是否一致。',
  },
  en: {
    appName: 'CodexRemote',
    tagline: 'Phone ↔ Mac local Codex',
    chat: 'Chat',
    setup: 'Remote setup',
    lang: 'Lang',
    connect: 'Connect',
    disconnect: 'Disconnect',
    connected: 'Connected',
    disconnected: 'Disconnected',
    serverUrl: 'Server URL',
    pairToken: 'Pair token',
    save: 'Save',
    send: 'Send',
    draft: 'Type a message, or long-press mic…',
    holdMic: 'Hold to talk',
    releaseEdit: 'Release, edit, then send',
    speechUnsupported: 'Speech recognition unsupported in this browser (try Chrome / Edge / Safari)',
    listening: 'Listening…',
    streaming: 'Codex streaming…',
    clear: 'Clear session',
    status: 'Status',
    codexFound: 'codex found',
    codexMissing: 'codex missing',
    pairHint: 'See the pair QR or link in the computer terminal',
    scanQr: 'Pairing QR',
    copyLink: 'Copy pair link',
    copied: 'Copied',
    error: 'Error',
    busy: 'Busy with previous turn',
    empty: 'Enter a message',
    pairingRequired: 'Pair token required',
    wizardTitle: 'Going-out setup wizard',
    lanTitle: 'Appendix: home LAN',
    lanBody: 'Same Wi-Fi as Mac only; not the going-out primary path.',
    tsTitle: 'Private mesh (Tailscale)',
    cfTitle: 'Backup: Cloudflare Tunnel',
    pros: 'Pros',
    cons: 'Cons',
    steps: 'Steps',
    back: 'Back to chat',
    installPwa: 'Add to Home Screen - a web app for your phone home screen',
    fillMesh: 'Fill going-out address',
    meshFilled: 'Saved going-out (mesh) address',
    meshMissing: 'No mesh address detected yet. Finish private mesh (Tailscale) on the Mac first.',
    errServiceDown: 'Service not running: CodexRemote is not up on the Mac. Run npm start, or install always-on after login.',
    errMeshOffline: 'Mesh offline: private mesh (Tailscale) may be disconnected. Open Tailscale on phone and Mac, confirm both online, then retry.',
    errBadAddrOrKey: 'Wrong address or key: check server URL (mesh 100.x / MagicDNS, not home Wi-Fi) and pair token.',
  },
};

const KEY = 'codex-remote-lang';

export function getLang() {
  const v = localStorage.getItem(KEY);
  return v === 'en' ? 'en' : 'zh';
}

export function setLang(lang) {
  localStorage.setItem(KEY, lang === 'en' ? 'en' : 'zh');
}

export function t(key) {
  const lang = getLang();
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.zh[key] || key;
}

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.hasAttribute('data-i18n-placeholder')) el.placeholder = val;
      else el.value = val;
    } else {
      el.textContent = val;
    }
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  document.documentElement.lang = getLang() === 'zh' ? 'zh-CN' : 'en';
}
