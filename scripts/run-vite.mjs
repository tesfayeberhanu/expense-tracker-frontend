import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredVersion = readFileSync(join(rootDir, ".nvmrc"), "utf8")
  .trim()
  .replace(/^v/, "");
const requiredMajor = requiredVersion.split(".")[0];
const currentMajor = process.versions.node.split(".")[0];
const viteBin = join(rootDir, "node_modules", "vite", "bin", "vite.js");
const args = process.argv.slice(2);

const runVite = (nodePath) => {
  const nodeDir = dirname(nodePath);
  const result = spawnSync(nodePath, [viteBin, ...args], {
    cwd: rootDir,
    env: {
      ...process.env,
      PATH: `${nodeDir}:${process.env.PATH || ""}`,
    },
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 1);
};

if (currentMajor === requiredMajor) {
  runVite(process.execPath);
}

const nvmDir = process.env.NVM_DIR || join(homedir(), ".nvm");
const nvmNode = join(
  nvmDir,
  "versions",
  "node",
  `v${requiredVersion}`,
  "bin",
  process.platform === "win32" ? "node.exe" : "node",
);

if (existsSync(nvmNode)) {
  console.warn(
    `Using Node ${requiredVersion} from .nvmrc instead of current Node ${process.versions.node}.`,
  );
  runVite(nvmNode);
}

console.error(
  `This project requires Node ${requiredVersion}, but current Node is ${process.versions.node}.`,
);
console.error("Run `nvm install` and `nvm use`, then try again.");
process.exit(1);
