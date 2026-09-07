#!/usr/bin/env bash
# Minimal Linux always-on for box QA (no systemd).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_DIR="${HOME}/.codex-remote"
PIDFILE="${CONFIG_DIR}/keepalive.pid"
LOG="${CONFIG_DIR}/keepalive.log"
WRAPPER="${CONFIG_DIR}/keepalive-wrapper.sh"
DAEMON_JS="${ROOT}/daemon/index.js"
PATCH_JS="${SCRIPT_DIR}/patch-expose-lan.mjs"

stop_keepalive() {
  local old=""
  if [[ -f "$PIDFILE" ]]; then
    old="$(cat "$PIDFILE" 2>/dev/null || true)"
  fi
  if [[ -n "${old}" ]]; then
    kill -TERM -"$old" 2>/dev/null || kill -TERM "$old" 2>/dev/null || true
    sleep 1
    kill -KILL -"$old" 2>/dev/null || kill -KILL "$old" 2>/dev/null || true
  fi
  if command -v pkill >/dev/null 2>&1; then
    pkill -f "${DAEMON_JS}" 2>/dev/null || true
  fi
  rm -f "$PIDFILE"
}

if [[ "$(uname -s)" == "Darwin" ]]; then
  echo "Mac: use launchd path instead."
  exit 1
fi
NODE_BIN="$(command -v node || true)"
if [[ -z "$NODE_BIN" ]]; then
  echo "node missing"
  exit 1
fi
if [[ ! -f "$DAEMON_JS" ]]; then
  echo "daemon missing: $DAEMON_JS"
  exit 1
fi
mkdir -p "$CONFIG_DIR"
chmod 700 "$CONFIG_DIR" 2>/dev/null || true
"$NODE_BIN" "$PATCH_JS"

stop_keepalive

cat > "$WRAPPER" <<EOF
#!/usr/bin/env bash
set -euo pipefail
cd "$ROOT"
child=""
cleanup() {
  if [[ -n "\$child" ]]; then
    kill -TERM "\$child" 2>/dev/null || true
    sleep 1
    kill -KILL "\$child" 2>/dev/null || true
  fi
}
trap cleanup EXIT TERM INT
while true; do
  "$NODE_BIN" "$DAEMON_JS" >>"$LOG" 2>&1 &
  child=\$!
  wait "\$child" || true
  child=""
  echo "\$(date -u +%Y-%m-%dT%H:%M:%SZ) daemon exited; restart in 3s" >>"$LOG"
  sleep 3
done
EOF
chmod +x "$WRAPPER"

if command -v setsid >/dev/null 2>&1; then
  setsid "$WRAPPER" >/dev/null 2>&1 &
else
  nohup "$WRAPPER" >/dev/null 2>&1 &
fi
echo $! > "$PIDFILE"
sleep 1
if kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  echo "=== linux keepalive installed ==="
  echo "pidfile: $PIDFILE"
  echo "log: $LOG"
else
  echo "start failed; see $LOG"
  exit 1
fi
