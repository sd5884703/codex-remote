import { spawn as runChild, spawnSync as runSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { WebSocketServer } from 'ws';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';
import os from 'os';
import crypto from 'crypto';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const DEFAULT_PORT = 8787;
const CONFIG_DIR = path.join(os.homedir(), '.codex-remote');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const HISTORY_FILE = path.join(CONFIG_DIR, 'history.jsonl');
const LAUNCH_LABEL = 'com.codexremote.daemon';
const LAUNCH_PLIST = path.join(os.homedir(), 'Library', 'LaunchAgents', `${LAUNCH_LABEL}.plist`);

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
}

function loadConfig() {
  ensureConfigDir();
  if (!fs.existsSync(CONFIG_FILE)) {
    const cfg = {
      port: DEFAULT_PORT,
      pairToken: crypto.randomBytes(24).toString('hex'),
      createdAt: new Date().toISOString(),
      pairingEnabled: true,
      exposeLan: false,
      listenHost: '127.0.0.1',
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), { mode: 0o600 });
    return cfg;
  }
  const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  if (!raw.pairToken) {
    raw.pairToken = crypto.randomBytes(24).toString('hex');
    saveConfig(raw);
  }
  if (!raw.port) raw.port = DEFAULT_PORT;
  if (raw.pairingEnabled === undefined) raw.pairingEnabled = true;
  if (raw.exposeLan === undefined) raw.exposeLan = false;
  if (!raw.listenHost) raw.listenHost = raw.exposeLan ? '0.0.0.0' : '127.0.0.1';
  return raw;
}

function saveConfig(cfg) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), { mode: 0o600 });
}

function getLanIPv4() {
  const ifaces = os.networkInterfaces();
  const lan = [];
  const mesh = [];
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name] || []) {
      if (iface.family !== 'IPv4' && iface.family !== 4) continue;
      if (iface.internal) continue;
      const addr = iface.address;
      if (addr.startsWith('100.')) mesh.push({ name, address: addr, kind: 'tailscale' });
      else lan.push({ name, address: addr, kind: 'lan' });
    }
  }
  // Prefer mesh when Tailscale is present (going-out primary path)
  const list = mesh.length ? [...mesh, ...lan] : [...lan, ...mesh];
  return {
    primary: list[0]?.address || '127.0.0.1',
    all: list,
    mesh: mesh[0]?.address || null,
    lan: lan[0]?.address || null,
  };
}

function findTailscaleBin() {
  const candidates = [
    'tailscale',
    '/usr/local/bin/tailscale',
    '/opt/homebrew/bin/tailscale',
    '/Applications/Tailscale.app/Contents/MacOS/Tailscale',
  ];
  for (const c of candidates) {
    try {
      if (c.includes('/') && !fs.existsSync(c)) continue;
      const r = runSync(c, ['version'], { encoding: 'utf8', timeout: 4000 });
      if (!r.error && r.status !== 127) return c;
    } catch { /* next */ }
  }
  try {
    const r = runSync('which', ['tailscale'], { encoding: 'utf8', timeout: 3000 });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  } catch { /* ignore */ }
  return null;
}

function detectTailscale() {
  const nets = getLanIPv4();
  const bin = findTailscaleBin();
  let ip = nets.mesh;
  let magicDns = null;
  let backendState = null;
  if (bin) {
    try {
      const ipR = runSync(bin, ['ip', '-4'], { encoding: 'utf8', timeout: 4000 });
      if (ipR.status === 0 && ipR.stdout.trim()) ip = ipR.stdout.trim().split('\n')[0].trim();
    } catch { /* ignore */ }
    try {
      const st = runSync(bin, ['status', '--json'], { encoding: 'utf8', timeout: 6000, maxBuffer: 2 * 1024 * 1024 });
      if (st.status === 0 && st.stdout) {
        const j = JSON.parse(st.stdout);
        backendState = j.BackendState || null;
        const self = j.Self || {};
        if (!ip && Array.isArray(self.TailscaleIPs)) {
          const v4 = self.TailscaleIPs.find((x) => String(x).includes('.'));
          if (v4) ip = v4;
        }
        if (self.DNSName) magicDns = String(self.DNSName).replace(/\.$/, '');
      }
    } catch { /* ignore */ }
  }
  return {
    binary: Boolean(bin),
    path: bin,
    ip: ip || null,
    magicDns,
    backendState,
    online: Boolean(ip) || backendState === 'Running',
  };
}

function alwaysOnStatus() {
  const installed = fs.existsSync(LAUNCH_PLIST);
  return { installed, plist: installed ? LAUNCH_PLIST : null, label: LAUNCH_LABEL };
}

function runAlwaysOnScript(action) {
  const script = path.join(
    ROOT,
    'scripts',
    action === 'uninstall' ? 'uninstall-launch-agent.sh' : 'install-launch-agent.sh',
  );
  if (!fs.existsSync(script)) {
    const err = new Error(`script missing: ${script}`);
    err.code = 'SCRIPT_MISSING';
    throw err;
  }
  const r = runSync('bash', [script], { encoding: 'utf8', timeout: 60000, env: process.env, cwd: ROOT });
  return {
    ok: r.status === 0,
    status: r.status,
    stdout: (r.stdout || '').slice(0, 4000),
    stderr: (r.stderr || '').slice(0, 2000),
    alwaysOn: alwaysOnStatus(),
  };
}


const CODEX_CANDIDATES = [
  'codex',
  '/usr/local/bin/codex',
  '/opt/homebrew/bin/codex',
  path.join(os.homedir(), '.local', 'bin', 'codex'),
  path.join(os.homedir(), '.cargo', 'bin', 'codex'),
];

let resolvedCodex = null;
let resolveTried = false;

function isNodeScript(bin) {
  return /\.(mjs|cjs|js)$/i.test(String(bin || ''));
}

function spawnCli(bin, args, opts) {
  if (isNodeScript(bin)) return runChild(process.execPath, [bin, ...args], opts);
  return runChild(bin, args, opts);
}

function spawnSyncCli(bin, args, opts) {
  if (isNodeScript(bin)) return runSync(process.execPath, [bin, ...args], opts);
  return runSync(bin, args, opts);
}


function findCodexBinary() {
  if (resolveTried) return resolvedCodex;
  resolveTried = true;
  const stubPath = path.join(ROOT, 'scripts', 'codex-stub.mjs');
  if (process.env.CODEX_REMOTE_STUB === '1' && fs.existsSync(stubPath)) {
    resolvedCodex = stubPath;
    return resolvedCodex;
  }
  const envBin = (process.env.CODEX_BIN || '').trim();
  if (envBin && fs.existsSync(envBin)) {
    resolvedCodex = envBin;
    return resolvedCodex;
  }
  for (const candidate of CODEX_CANDIDATES) {
    if (!candidate) continue;
    try {
      if (candidate.includes('/') && !fs.existsSync(candidate)) continue;
      const r = spawnSyncCli(candidate, ['--version'], { encoding: 'utf8', timeout: 8000, env: process.env });
      if (r.error || r.status === 127) continue;
      resolvedCodex = candidate;
      return resolvedCodex;
    } catch { /* next */ }
  }
  try {
    const r = runSync('which', ['codex'], { encoding: 'utf8', timeout: 3000 });
    if (r.status === 0 && r.stdout.trim()) {
      resolvedCodex = r.stdout.trim();
      return resolvedCodex;
    }
  } catch { /* ignore */ }
  resolvedCodex = null;
  return null;
}


function getCodexStatus() {
  const bin = findCodexBinary();
  const hintZh = '未找到本地 codex CLI。请安装并确保在 PATH 中。';
  const hintEn = 'Codex CLI not found. Install it and ensure it is on PATH.';
  const stub = Boolean(bin && String(bin).includes('codex-stub'));
  return { found: Boolean(bin), path: bin, stub, hint: bin ? null : hintZh + ' / ' + hintEn };
}

function loadHistory() {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  return fs.readFileSync(HISTORY_FILE, 'utf8').split('\n').filter(Boolean).map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}


function appendHistory(role, content) {
  ensureConfigDir();
  fs.appendFileSync(HISTORY_FILE, JSON.stringify({ role, content, ts: new Date().toISOString() }) + '\n');
}

function clearHistory() {
  ensureConfigDir();
  fs.writeFileSync(HISTORY_FILE, '');
}

function buildPrompt(userText) {
  const history = loadHistory().slice(-20);
  const parts = history.map((t) => `${t.role === 'user' ? 'User' : 'Assistant'}: ${t.content}`);
  parts.push(`User: ${userText}`);
  parts.push('Assistant:');
  return parts.join('\n\n');
}


function runCodexTurn(userText, { onChunk, signal } = {}) {
  return new Promise((resolve, reject) => {
    const bin = findCodexBinary();
    if (!bin) {
      const err = new Error(getCodexStatus().hint);
      err.code = 'CODEX_NOT_FOUND';
      reject(err);
      return;
    }
    appendHistory('user', userText);
    const prompt = buildPrompt(userText);
    const argsCandidates = [
      ['exec', '--', prompt],
      ['exec', prompt],
      ['exec', '-q', prompt],
      [prompt],
    ];
    let settled = false;
    let full = '';
    let stderr = '';
    let attempt = 0;

    const tryNext = () => {
      if (attempt >= argsCandidates.length) {
        const err = new Error(stderr.trim() || 'codex exited without output');
        err.code = 'CODEX_FAILED';
        reject(err);
        return;
      }
      const args = argsCandidates[attempt++];
      full = '';
      stderr = '';
      const child = spawnCli(bin, args, { env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
      const onAbort = () => { try { child.kill('SIGTERM'); } catch { /* ignore */ } };
      if (signal) {
        if (signal.aborted) onAbort();
        else signal.addEventListener('abort', onAbort, { once: true });
      }
      child.stdout.on('data', (buf) => {
        const s = buf.toString();
        full += s;
        if (onChunk) onChunk(s);
      });
      child.stderr.on('data', (buf) => { stderr += buf.toString(); });
      child.on('error', (e) => { if (!settled) { settled = true; reject(e); } });
      child.on('close', (code) => {
        if (settled) return;
        const looksUsage = /usage:|unrecognized|unknown option|required argument/i.test(stderr) && !full.trim();
        if (code !== 0 && looksUsage && attempt < argsCandidates.length) { tryNext(); return; }
        settled = true;
        if (code !== 0 && !full.trim()) {
          const err = new Error(stderr.trim() || `codex exited with code ${code}`);
          err.code = 'CODEX_FAILED';
          reject(err);
          return;
        }
        const text = full.trim() || stderr.trim();
        appendHistory('assistant', text);
        resolve(text);
      });
    };
    tryNext();
  });
}


const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function extractToken(req, urlObj) {
  const auth = req.headers['authorization'] || '';
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  const hdr = req.headers['x-pair-token'];
  if (hdr) return String(hdr).trim();
  if (urlObj.searchParams.get('token')) return urlObj.searchParams.get('token');
  return '';
}

function tokenOk(cfg, token) {
  if (!cfg.pairingEnabled) return true;
  return Boolean(token) && token === cfg.pairToken;
}

function isLocalRequest(req) {
  const ra = req.socket && req.socket.remoteAddress;
  return ra === '127.0.0.1' || ra === '::1' || ra === '::ffff:127.0.0.1';
}

function preferHost(nets, cfg) {
  if (nets.mesh) return nets.mesh;
  if (cfg.exposeLan && nets.lan) return nets.lan;
  return nets.primary || '127.0.0.1';
}

function serveStatic(req, res, urlObj) {
  let rel = urlObj.pathname === '/' ? '/index.html' : urlObj.pathname;
  rel = decodeURIComponent(rel);
  if (rel.includes('..')) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  const filePath = path.join(PUBLIC, rel);
  if (!filePath.startsWith(PUBLIC)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}


async function main() {
  const cfg = loadConfig();
  const port = Number(process.env.PORT) || cfg.port || DEFAULT_PORT;
  const lan = getLanIPv4();
  const hostForPair = preferHost(lan, cfg);
  const pairUrl = `http://${hostForPair}:${port}/?token=${cfg.pairToken}`;
  const wsUrl = `ws://${hostForPair}:${port}/ws?token=${cfg.pairToken}`;

  const server = http.createServer(async (req, res) => {
    try {
      const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const cfgNow = loadConfig();

      if (urlObj.pathname === '/api/health') {
        sendJson(res, 200, { ok: true, service: 'codex-remote', port });
        return;
      }

      if (urlObj.pathname === '/api/netinfo') {
        const nets = getLanIPv4();
        const ts = detectTailscale();
        const meshAddress = ts.ip || nets.mesh || null;
        sendJson(res, 200, {
          ok: true,
          port,
          exposeLan: Boolean(cfgNow.exposeLan),
          listenHost: cfgNow.listenHost || (cfgNow.exposeLan ? '0.0.0.0' : '127.0.0.1'),
          lan: nets,
          meshAddress,
          magicDns: ts.magicDns || null,
          tailscale: ts,
          alwaysOn: alwaysOnStatus(),
        });
        return;
      }

      if (urlObj.pathname === '/api/setup/always-on' && req.method === 'POST') {
        const token = extractToken(req, urlObj);
        if (!isLocalRequest(req) && !tokenOk(cfgNow, token)) {
          sendJson(res, 401, { ok: false, error: 'pairing_required', message: '需要配对令牌或在本机浏览器操作' });
          return;
        }
        let body = '';
        for await (const chunk of req) body += chunk;
        let action = 'install';
        try {
          const j = body ? JSON.parse(body) : {};
          if (j.action === 'uninstall') action = 'uninstall';
        } catch { /* default install */ }
        try {
          const result = runAlwaysOnScript(action);
          sendJson(res, result.ok ? 200 : 500, {
            ok: result.ok,
            action,
            message: result.ok
              ? (action === 'uninstall' ? '常开已卸载' : '常开已安装（已开启组网可访问监听）')
              : (result.stderr || result.stdout || 'script failed'),
            alwaysOn: result.alwaysOn,
            log: result.stdout,
          });
        } catch (e) {
          sendJson(res, 500, { ok: false, error: e.code || 'ERROR', message: e.message });
        }
        return;
      }

      if (urlObj.pathname === '/api/status') {
        const token = extractToken(req, urlObj);
        if (!tokenOk(cfgNow, token)) {
          sendJson(res, 401, { ok: false, error: 'pairing_required' });
          return;
        }
        const nets = getLanIPv4();
        const ts = detectTailscale();
        sendJson(res, 200, {
          ok: true,
          lan: nets,
          meshAddress: ts.ip || nets.mesh || null,
          magicDns: ts.magicDns || null,
          tailscale: ts,
          alwaysOn: alwaysOnStatus(),
          port,
          exposeLan: Boolean(cfgNow.exposeLan),
          codex: getCodexStatus(),
          pairingEnabled: cfgNow.pairingEnabled,
        });
        return;
      }

      if (urlObj.pathname === '/api/pair') {
        const token = extractToken(req, urlObj);
        if (!tokenOk(cfgNow, token)) {
          sendJson(res, 401, { ok: false, error: 'pairing_required' });
          return;
        }
        const lanNow = getLanIPv4();
        const host = preferHost(lanNow, cfgNow);
        const pairNow = `http://${host}:${port}/?token=${cfgNow.pairToken}`;
        const wsNow = `ws://${host}:${port}/ws?token=${cfgNow.pairToken}`;
        sendJson(res, 200, {
          ok: true,
          port,
          lan: lanNow,
          meshAddress: lanNow.mesh,
          pairUrl: pairNow,
          wsUrl: wsNow,
          token: cfgNow.pairToken,
          qrText: pairNow,
        });
        return;
      }

      if (urlObj.pathname === '/api/qr.png') {
        const token = extractToken(req, urlObj);
        if (!tokenOk(cfgNow, token)) {
          sendJson(res, 401, { ok: false, error: 'pairing_required' });
          return;
        }
        const lanNow = getLanIPv4();
        const host = preferHost(lanNow, cfgNow);
        const pairNow = `http://${host}:${port}/?token=${cfgNow.pairToken}`;
        const png = await QRCode.toBuffer(pairNow, { type: 'png', width: 320, margin: 2 });
        res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' });
        res.end(png);
        return;
      }

      if (urlObj.pathname === '/api/history' && req.method === 'DELETE') {
        const token = extractToken(req, urlObj);
        if (!tokenOk(cfgNow, token)) {
          sendJson(res, 401, { ok: false, error: 'pairing_required' });
          return;
        }
        clearHistory();
        sendJson(res, 200, { ok: true });
        return;
      }

      serveStatic(req, res, urlObj);
    } catch (e) {
      sendJson(res, 500, { ok: false, error: String(e && e.message ? e.message : e) });
    }
  });


  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (socket, req) => {
    const cfgNow = loadConfig();
    const urlObj = new URL(req.url || '/ws', `http://${req.headers.host || 'localhost'}`);
    const token = urlObj.searchParams.get('token') || '';
    if (!tokenOk(cfgNow, token)) {
      socket.send(JSON.stringify({ type: 'error', error: 'pairing_required', message: 'Pair token required / 需要配对令牌' }));
      socket.close(1008, 'pairing_required');
      return;
    }

    const nets = getLanIPv4();
    socket.send(JSON.stringify({
      type: 'hello',
      codex: getCodexStatus(),
      lan: nets,
      meshAddress: nets.mesh,
      port,
    }));

    let busy = false;
    let abortCtrl = null;

    socket.on('message', async (raw) => {
      let msg;
      try { msg = JSON.parse(String(raw)); } catch {
        socket.send(JSON.stringify({ type: 'error', error: 'bad_json' }));
        return;
      }

      if (msg.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', t: Date.now() }));
        return;
      }

      if (msg.type === 'clear') {
        clearHistory();
        socket.send(JSON.stringify({ type: 'cleared' }));
        return;
      }

      if (msg.type === 'chat') {
        const text = (msg.text || '').trim();
        if (!text) {
          socket.send(JSON.stringify({ type: 'error', error: 'empty' }));
          return;
        }
        if (busy) {
          socket.send(JSON.stringify({ type: 'error', error: 'busy' }));
          return;
        }
        busy = true;
        abortCtrl = new AbortController();
        const id = msg.id || crypto.randomBytes(8).toString('hex');
        socket.send(JSON.stringify({ type: 'chat_start', id }));
        try {
          const full = await runCodexTurn(text, {
            signal: abortCtrl.signal,
            onChunk: (chunk) => {
              if (socket.readyState === 1) {
                socket.send(JSON.stringify({ type: 'chat_chunk', id, chunk }));
              }
            },
          });
          socket.send(JSON.stringify({ type: 'chat_end', id, text: full }));
        } catch (e) {
          socket.send(JSON.stringify({
            type: 'chat_error',
            id,
            code: e.code || 'ERROR',
            message: e.message || String(e),
          }));
        } finally {
          busy = false;
          abortCtrl = null;
        }
        return;
      }
    });
  });


  server.on('error', (err) => {
    console.error('Server error:', err.message);
    process.exit(1);
  });


  const listenHost = (process.env.LISTEN_HOST || cfg.listenHost || (cfg.exposeLan ? '0.0.0.0' : '127.0.0.1')).trim();
  const bindHost = cfg.exposeLan || listenHost === '0.0.0.0' ? '0.0.0.0' : '127.0.0.1';
  server.listen(port, bindHost, async () => {
    const status = getCodexStatus();
    const ts = detectTailscale();
    const mesh = ts.ip || lan.mesh;
    console.log('');
    console.log('=== CodexRemote daemon ===');
    console.log(`Bind:   ${bindHost}:${port}`);
    console.log(`Local:  http://127.0.0.1:${port}`);
    if (mesh) {
      console.log(`Mesh:   http://${mesh}:${port}  (私人组网 / Tailscale — 手机请保存此地址)`);
      if (ts.magicDns) console.log(`DNS:    http://${ts.magicDns}:${port}`);
    }
    if (bindHost === '0.0.0.0') {
      if (lan.lan) console.log(`LAN:    http://${lan.lan}:${port}  (附录：同一 Wi-Fi)`);
      console.log(`Pair:   http://${hostForPair}:${port}/?token=***`);
      console.log('(完整 Pair 链接仅在需要时用 /api/pair + 令牌获取；勿把令牌发到公开群)');
    } else {
      console.log('对外监听关闭（默认）。出门/组网请 npm run install:always-on 或将 exposeLan 设为 true。');
      console.log(`Pair (localhost): http://127.0.0.1:${port}/?token=***`);
    }
    console.log(`Config: ${CONFIG_FILE}`);
    console.log(`Codex:  ${status.found ? status.path : 'NOT FOUND'}`);
    console.log(`Always-on: ${alwaysOnStatus().installed ? 'yes' : 'no'}`);
    console.log('');
    try {
      // QR uses full token only in this local terminal
      const qrTarget = bindHost === '0.0.0.0'
        ? `http://${hostForPair}:${port}/?token=${cfg.pairToken}`
        : `http://127.0.0.1:${port}/?token=${cfg.pairToken}`;
      const qr = await QRCode.toString(qrTarget, { type: 'terminal', small: true });
      console.log('Scan QR (token only shown in this terminal):');
      console.log(qr);
    } catch (e) {
      console.log('QR unavailable');
    }
    console.log('/api/pair and /api/qr.png require pair token. health: /api/health  netinfo: /api/netinfo');
    console.log('');
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
