/**
 * Enregistre core.hooksPath=githooks pour ce dépôt (après npm install).
 * Sans effet si pas dans un clone git (CI, archive).
 */

import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  execSync("git rev-parse --git-dir", { cwd: root, stdio: "pipe" });
} catch {
  process.exit(0);
}

try {
  execSync("git config core.hooksPath githooks", { cwd: root, stdio: "pipe" });
} catch {
  process.exit(0);
}
