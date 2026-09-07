#!/bin/bash
# Install CodexRemote as a user-level launchd agent (always-on after login).
# Sets exposeLan so private mesh (Tailscale) can reach the port. No sudo.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LABEL="com.codexremote.daemon"
PLIST_DEST="${HOME}/Library/LaunchAgents/${LABEL}.plist"
TEMPLATE="${SCRIPT_DIR}/macos/com.codexremote.daemon.plist.template"
CONFIG_DIR="${HOME}/.codex-remote"
CONFIG_FILE="${CONFIG_DIR}/config.json"
DAEMON_JS="${ROOT}/daemon/index.js"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "此脚本仅用于 Mac。"
  exit 1
fi

if [[ ! -f "$DAEMON_JS" ]]; then
  echo "找不到守护进程：$DAEMON_JS"
  exit 1
fi

NODE_BIN="$(command -v node || true)"
if [[ -z "$NODE_BIN" ]]; then
  echo "找不到 node。请先安装 Node.js 18+ 并确保在 PATH 中。"
  exit 1
fi

if [[ ! -f "$TEMPLATE" ]]; then
  echo "找不到 plist 模板：$TEMPLATE"
  exit 1
fi

mkdir -p "${HOME}/Library/LaunchAgents"
mkdir -p "$CONFIG_DIR"
chmod 700 "$CONFIG_DIR" 2>/dev/null || true

# Patch or create config: exposeLan for mesh reachability
export CONFIG_FILE
"$NODE_BIN" <<'NODE'
const fs = require('fs');
const crypto = require('crypto');
const p = process.env.CONFIG_FILE;
let cfg = {};
if (fs.existsSync(p)) {
  try { cfg = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { cfg = {}; }
} else {
  cfg = {
    port: 8787,
    pairToken: crypto.randomBytes(24).toString('hex'),
    createdAt: new Date().toISOString(),
    pairingEnabled: true,
  };
}
cfg.exposeLan = true;
cfg.listenHost = '0.0.0.0';
if (!cfg.port) cfg.port = 8787;
if (!cfg.pairToken) cfg.pairToken = crypto.randomBytes(24).toString('hex');
fs.writeFileSync(p, JSON.stringify(cfg, null, 2), { mode: 0o600 });
console.log('已更新配置：exposeLan=true, listenHost=0.0.0.0');
NODE

if launchctl print "gui/$(id -u)/${LABEL}" >/dev/null 2>&1; then
  launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
fi
launchctl unload "$PLIST_DEST" 2>/dev/null || true

sed -e "s|__NODE__|${NODE_BIN}|g" \
    -e "s|__DAEMON_JS__|${DAEMON_JS}|g" \
    -e "s|__ROOT__|${ROOT}|g" \
    -e "s|__HOME__|${HOME}|g" \
    "$TEMPLATE" > "$PLIST_DEST"

launchctl bootstrap "gui/$(id -u)" "$PLIST_DEST" 2>/dev/null \
  || launchctl load "$PLIST_DEST"

echo ""
echo "=== 常开已安装 ==="
echo "标签: ${LABEL}"
echo "plist: ${PLIST_DEST}"
echo "登录后会自动启动；已开启组网可访问监听（0.0.0.0）。"
echo "卸载: ${SCRIPT_DIR}/uninstall-launch-agent.sh"
echo "日志: ${CONFIG_DIR}/launchd.out.log / launchd.err.log"
echo ""
