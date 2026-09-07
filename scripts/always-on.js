#!/usr/bin/env node
/** OS-dispatch for install/uninstall always-on. Darwin=launchd, win32=Scheduled Task, linux=keepalive QA. */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const action = process.argv[2] === "uninstall" ? "uninstall" : "install";
const platform = process.platform;

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", cwd: path.join(__dirname, ".."), env: process.env, shell: false });
  process.exit(r.status == null ? 1 : r.status);
}

if (platform === "darwin") {
  const script = path.join(__dirname, action === "uninstall" ? "uninstall-launch-agent.sh" : "install-launch-agent.sh");
  run("bash", [script]);
} else if (platform === "win32") {
  const script = path.join(
    __dirname,
    "windows",
    action === "uninstall" ? "uninstall-scheduled-task.ps1" : "install-scheduled-task.ps1",
  );
  run("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script]);
} else if (platform === "linux") {
  const script = path.join(__dirname, action === "uninstall" ? "uninstall-keepalive-linux.sh" : "install-keepalive-linux.sh");
  run("bash", [script]);
} else {
  console.error("unsupported platform: " + platform);
  process.exit(1);
}
