# Uninstall CodexRemote user-level always-on (Windows).
$ErrorActionPreference = 'Continue'
$TaskName = 'CodexRemoteDaemon'
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
  Write-Host ('removed task: ' + $TaskName)
} else {
  Write-Host 'task not found'
}
Write-Host 'always-on removed'
