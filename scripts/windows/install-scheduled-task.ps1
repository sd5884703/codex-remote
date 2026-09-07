# Install CodexRemote user-level always-on (Windows).
# Prefer Scheduled Task at logon. No admin for user task.
$ErrorActionPreference = 'Stop'

$TaskName = 'CodexRemoteDaemon'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = (Resolve-Path (Join-Path $ScriptDir '..\..')).Path
$DaemonJs = Join-Path $Root 'daemon\index.js'
$PatchJs = Join-Path (Split-Path -Parent $ScriptDir) 'patch-expose-lan.mjs'
$ConfigDir = Join-Path $env:USERPROFILE '.codex-remote'

if (-not (Test-Path $DaemonJs)) { Write-Host ('missing daemon'); exit 1 }
$NodeBin = $null
try { $NodeBin = (Get-Command node -ErrorAction Stop).Source } catch {}
if (-not $NodeBin) { Write-Host ('Node.js 18+ required'); exit 1 }
New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null
& $NodeBin $PatchJs
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
$arg = ([char]34) + $DaemonJs + ([char]34)
$action = New-ScheduledTaskAction -Execute $NodeBin -Argument $arg -WorkingDirectory $Root
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
Start-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue | Out-Null
Write-Host '=== 常开已安装 ==='
Write-Host ('任务名: ' + $TaskName)
Write-Host '登录后自动启动；已开启组网可访问监听。'
