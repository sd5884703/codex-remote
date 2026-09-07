#!/bin/bash
# Uninstall CodexRemote user-level launchd agent (always-on).
set -euo pipefail

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

echo "常开已卸载。需要时可用 npm start 临时启动。"
