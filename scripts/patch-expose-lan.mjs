import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { fileURLToPath } from "url";

const configDir = path.join(os.homedir(), ".codex-remote");
const configFile = path.join(configDir, "config.json");
fs.mkdirSync(configDir, { recursive: true, mode: 0o700 });
let cfg = {};
if (fs.existsSync(configFile)) {
  try { cfg = JSON.parse(fs.readFileSync(configFile, "utf8")); } catch { cfg = {}; }
} else {
  cfg = {
    port: 8787,
    pairToken: crypto.randomBytes(24).toString("hex"),
    createdAt: new Date().toISOString(),
    pairingEnabled: true,
  };
}
cfg.exposeLan = true;
cfg.listenHost = "0.0.0.0";
if (!cfg.port) cfg.port = 8787;
if (!cfg.pairToken) cfg.pairToken = crypto.randomBytes(24).toString("hex");
fs.writeFileSync(configFile, JSON.stringify(cfg, null, 2), { mode: 0o600 });
console.log("已更新配置：exposeLan=true, listenHost=0.0.0.0");
