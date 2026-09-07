#!/usr/bin/env bash
# Uninstall Linux box-QA keepalive always-on.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_DIR="${HOME}/.codex-remote"
PIDFILE="${CONFIG_DIR}/keepalive.pid"
WRAPPER="${CONFIG_DIR}/keepalive-wrapper.sh"
DAEMON_JS="${ROOT}/daemon/index.js"

old=""
if [[ -f "$PIDFILE" ]]; then
  old="$(cat "$PIDFILE" 2>/dev/null || true)"
fi
if [[ -n "${old}" ]]; then
  kill -TERM -"$old" 2>/dev/null || kill -TERM "$old" 2>/dev/null || true
  sleep 1
  kill -KILL -"$old" 2>/dev/null || kill -KILL "$old" 2>/dev/null || true
  echo "stopped pgid/pid $old"
else
  echo "no pidfile"
fi
if command -v pkill >/dev/null 2>&1; then
  pkill -f "${DAEMON_JS}" 2>/dev/null || true
fi
rm -f "$PIDFILE" "$WRAPPER"
echo "linux keepalive removed"

PATCH_JS="${SCRIPT_DIR}/patch-expose-lan.mjs"
if command -v node >/dev/null 2>&1 && [[ -f "$PATCH_JS" ]]; then
  node "$PATCH_JS" off
else
  echo "请手动把 ~/.codex-remote/config.json 的 exposeLan 改回 false、listenHost 改回 127.0.0.1"
fi
echo "已尝试结束子进程并恢复仅本机监听。"
