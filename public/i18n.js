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
    wizardTitle: '远程访问向导',
    lanTitle: '默认：局域网',
    lanBody: '手机与 Mac 同一 Wi‑Fi，扫描终端二维码即可。无需公网 IP。',
    tsTitle: '可选：Tailscale',
    cfTitle: '可选：Cloudflare Tunnel',
    pros: '优点',
    cons: '缺点',
    steps: '步骤',
    back: '返回对话',
    installPwa: '可「添加到主屏幕」，变成能放在手机桌面的网页应用',
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
    wizardTitle: 'Remote access wizard',
    lanTitle: 'Default: LAN',
    lanBody: 'Same Wi‑Fi as Mac; scan the terminal QR. No public IP needed.',
    tsTitle: 'Optional: Tailscale',
    cfTitle: 'Optional: Cloudflare Tunnel',
    pros: 'Pros',
    cons: 'Cons',
    steps: 'Steps',
    back: 'Back to chat',
    installPwa: 'Add to Home Screen - a web app for your phone home screen',
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
