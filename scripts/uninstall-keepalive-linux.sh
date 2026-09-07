#!/usr/bin/env bash
# Uninstall Linux box-QA keepalive always-on.
set -euo pipefail
CONFIG_DIR="${HOME}/.codex-remote"
PIDFILE="${CONFIG_DIR}/keepalive.pid"
WRAPPER="${CONFIG_DIR}/keepalive-wrapper.sh"

if [[ -f "$PIDFILE" ]]; then
  old="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [[ -n "${old}" ]] && kill -0 "$old" 2>/dev/null; then
    kill "$old" 2>/dev/null || true
    sleep 1
    kill -9 "$old" 2>/dev/null || true
  fi
  rm -f "$PIDFILE"
  echo "stopped pid $old"
else
  echo "no pidfile"
fi
rm -f "$WRAPPER"
echo "linux keepalive removed"
