# Uninstall CodexRemote user-level always-on (Windows).
$ErrorActionPreference = 'Continue'
$TaskName = 'CodexRemoteDaemon'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = (Resolve-Path (Join-Path $ScriptDir '..\..')).Path
$DaemonJs = Join-Path $Root 'daemon\index.js'
$PatchJs = Join-Path (Split-Path -Parent $ScriptDir) 'patch-expose-lan.mjs'
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
  try { Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue | Out-Null } catch {}
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
  Write-Host ('removed task: ' + $TaskName)
} else {
  Write-Host 'task not found'
}

# End running node daemon for this repo
Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
  Where-Object {
    $_.CommandLine -and (
      $_.CommandLine -like ('*' + $DaemonJs + '*') -or
      $_.CommandLine -like '*daemon\index.js*' -or
      $_.CommandLine -like '*daemon/index.js*'
    )
  } |
  ForEach-Object {
    try {
      Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop
      Write-Host ('stopped node pid ' + $_.ProcessId)
    } catch {}
  }

$NodeBin = $null
try { $NodeBin = (Get-Command node -ErrorAction Stop).Source } catch {}
if ($NodeBin -and (Test-Path $PatchJs)) {
  & $NodeBin $PatchJs off
} else {
  Write-Host '请手动把 ~/.codex-remote/config.json 的 exposeLan 改回 false、listenHost 改回 127.0.0.1'
}
Write-Host 'always-on removed'
Write-Host '已尝试结束遥控进程并恢复仅本机监听。若仍怀疑对外，请检查配置并确认没有其它终端在跑遥控服务。'
