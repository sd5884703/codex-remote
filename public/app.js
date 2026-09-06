import { getLang, setLang, t, applyI18n } from './i18n.js';

const LS_URL = 'codex-remote-server-url';
const LS_TOKEN = 'codex-remote-token';

const $ = (id) => document.getElementById(id);

let ws = null;
let busy = false;
let recognition = null;
let pressTimer = null;

function defaultServerUrl() {
  return `${location.protocol}//${location.host}`;
}

function loadConn() {
  const params = new URLSearchParams(location.search);
  const qToken = params.get('token');
  if (qToken) {
    localStorage.setItem(LS_TOKEN, qToken);
    const clean = new URL(location.href);
    clean.searchParams.delete('token');
    history.replaceState({}, '', clean.pathname + clean.search + clean.hash);
  }
  $('serverUrl').value = localStorage.getItem(LS_URL) || defaultServerUrl();
  $('pairToken').value = localStorage.getItem(LS_TOKEN) || '';
}

function saveConn() {
  localStorage.setItem(LS_URL, $('serverUrl').value.trim().replace(/\/$/, ''));
  localStorage.setItem(LS_TOKEN, $('pairToken').value.trim());
}

function setConnected(on) {
  $('statusDot').classList.toggle('on', on);
  $('connLabel').textContent = on ? t('connected') : t('disconnected');
  $('btnConnect').textContent = on ? t('disconnect') : t('connect');
}

function redactUrl(u) {
  try {
    const x = new URL(u, location.origin);
    if (x.searchParams.has('token')) x.searchParams.set('token', '***');
    return x.toString();
  } catch {
    return String(u).replace(/([?&]token=)[^&]*/gi, '$1***');
  }
}

function addMsg(role, text) {
  const el = document.createElement('div');
  el.className = `msg ${role}`;
  el.textContent = text;
  $('messages').appendChild(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return el;
}

function wsUrlFromHttp(httpUrl, token) {
  const u = new URL(httpUrl);
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  u.pathname = '/ws';
  u.search = token ? `?token=${encodeURIComponent(token)}` : '';
  u.hash = '';
  return u.toString();
}

function connect() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    ws.close();
    ws = null;
    setConnected(false);
    return;
  }
  saveConn();
  const httpUrl = localStorage.getItem(LS_URL) || defaultServerUrl();
  const token = localStorage.getItem(LS_TOKEN) || '';
  const url = wsUrlFromHttp(httpUrl, token);
  addMsg('system', redactUrl(url));
  ws = new WebSocket(url);
  ws.onopen = () => setConnected(true);
  ws.onclose = () => setConnected(false);
  ws.onerror = () => addMsg('system', t('error') + ': WebSocket');
  let streamEl = null;
  ws.onmessage = (ev) => {
    let msg;
    try { msg = JSON.parse(ev.data); } catch { return; }
    if (msg.type === 'hello') {
      const c = msg.codex || {};
      $('codexStatus').textContent = c.found ? `${t('codexFound')}: ${c.path}` : t('codexMissing');
      return;
    }
    if (msg.type === 'chat_start') {
      streamEl = addMsg('assistant', '');
      $('streamHint').hidden = false;
      return;
    }
    if (msg.type === 'chat_chunk') {
      if (!streamEl) streamEl = addMsg('assistant', '');
      streamEl.textContent += msg.chunk;
      streamEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
      return;
    }
    if (msg.type === 'chat_end') {
      if (streamEl) streamEl.textContent = msg.text || streamEl.textContent;
      streamEl = null;
      busy = false;
      $('streamHint').hidden = true;
      $('btnSend').disabled = false;
      return;
    }
    if (msg.type === 'chat_error') {
      addMsg('system', `${t('error')}: ${msg.message || msg.code}`);
      streamEl = null;
      busy = false;
      $('streamHint').hidden = true;
      $('btnSend').disabled = false;
      return;
    }
    if (msg.type === 'error') {
      addMsg('system', `${t('error')}: ${msg.message || msg.error}`);
      if (msg.error === 'pairing_required') addMsg('system', t('pairingRequired'));
    }
    if (msg.type === 'cleared') addMsg('system', t('clear'));
  };
}

function sendChat() {
  const text = $('draft').value.trim();
  if (!text) { addMsg('system', t('empty')); return; }
  if (!ws || ws.readyState !== WebSocket.OPEN) { addMsg('system', t('disconnected')); return; }
  if (busy) { addMsg('system', t('busy')); return; }
  busy = true;
  $('btnSend').disabled = true;
  addMsg('user', text);
  $('draft').value = '';
  ws.send(JSON.stringify({ type: 'chat', text }));
}

function setupSpeech() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const mic = $('micBtn');
  if (!SR) {
    mic.disabled = true;
    mic.title = t('speechUnsupported');
    return;
  }
  recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = getLang() === 'zh' ? 'zh-CN' : 'en-US';

  let finalText = '';
  recognition.onresult = (ev) => {
    let interim = '';
    finalText = '';
    for (let i = 0; i < ev.results.length; i++) {
      const r = ev.results[i];
      if (r.isFinal) finalText += r[0].transcript;
      else interim += r[0].transcript;
    }
    $('draft').value = (finalText || interim).trim();
  };
  recognition.onerror = () => {
    mic.classList.remove('recording');
    $('listenHint').hidden = true;
  };
  recognition.onend = () => {
    mic.classList.remove('recording');
    $('listenHint').hidden = true;
  };

  const start = (e) => {
    e.preventDefault();
    try {
      recognition.lang = getLang() === 'zh' ? 'zh-CN' : 'en-US';
      finalText = '';
      recognition.start();
      mic.classList.add('recording');
      $('listenHint').hidden = false;
    } catch { /* already started */ }
  };
  const stop = (e) => {
    e.preventDefault();
    try { recognition.stop(); } catch { /* ignore */ }
  };
  mic.addEventListener('touchstart', start, { passive: false });
  mic.addEventListener('touchend', stop);
  mic.addEventListener('mousedown', start);
  mic.addEventListener('mouseup', stop);
  mic.addEventListener('mouseleave', stop);
}

function refreshQr() {
  const base = ($('serverUrl').value || defaultServerUrl()).replace(/\/$/, '');
  const token = ($('pairToken').value || localStorage.getItem(LS_TOKEN) || '').trim();
  const img = $('qrImg');
  if (!token) {
    img.removeAttribute('src');
    img.alt = t('pairingRequired');
    img.hidden = true;
    return;
  }
  img.hidden = false;
  img.alt = t('scanQr');
  img.src = `${base}/api/qr.png?token=${encodeURIComponent(token)}&t=${Date.now()}`;
}

function init() {
  applyI18n();
  loadConn();
  setConnected(false);
  $('btnLang').textContent = getLang() === 'zh' ? 'EN' : '中文';
  $('btnLang').onclick = () => {
    setLang(getLang() === 'zh' ? 'en' : 'zh');
    location.reload();
  };
  $('btnConnect').onclick = connect;
  $('btnSave').onclick = () => { saveConn(); refreshQr(); addMsg('system', t('save')); };
  $('btnSend').onclick = sendChat;
  $('btnClear').onclick = () => {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'clear' }));
    $('messages').innerHTML = '';
  };
  $('btnCopy').onclick = async () => {
    saveConn();
    const base = localStorage.getItem(LS_URL) || defaultServerUrl();
    const token = localStorage.getItem(LS_TOKEN) || '';
    const link = `${base}/?token=${encodeURIComponent(token)}`;
    try {
      await navigator.clipboard.writeText(link);
      addMsg('system', t('copied'));
    } catch {
      addMsg('system', redactUrl(link));
    }
  };
  $('draft').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  });
  setupSpeech();
  refreshQr();
  // Auto-connect when opened via pair link / same host
  if (localStorage.getItem(LS_TOKEN) || location.search.includes('token')) {
    connect();
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

init();
