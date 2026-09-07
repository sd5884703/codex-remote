#!/bin/bash
# Uninstall CodexRemote user-level launchd agent (always-on).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DAEMON_JS="${ROOT}/daemon/index.js"
PATCH_JS="${SCRIPT_DIR}/patch-expose-lan.mjs"
LABEL="com.codexremote.daemon"
PLIST_DEST="${HOME}/Library/LaunchAgents/${LABEL}.plist"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "此脚本仅用于 Mac。"
  exit 1
fi

if launchctl print "gui/$(id -u)/${LABEL}" >/dev/null 2>&1; then
  launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
fi
launchctl unload "$PLIST_DEST" 2>/dev/null || true

if [[ -f "$PLIST_DEST" ]]; then
  rm -f "$PLIST_DEST"
  echo "已删除 $PLIST_DEST"
else
  echo "未找到已安装的 plist（可能本来就没装）。"
fi

if command -v pkill >/dev/null 2>&1; then
  pkill -f "${DAEMON_JS}" 2>/dev/null || true
fi

if command -v node >/dev/null 2>&1 && [[ -f "$PATCH_JS" ]]; then
  node "$PATCH_JS" off
else
  echo "请手动把 ~/.codex-remote/config.json 的 exposeLan 改回 false、listenHost 改回 127.0.0.1"
fi

echo "常开已卸载；已尝试结束遥控进程并恢复仅本机监听。"
echo "需要时可用临时方式启动服务。"
