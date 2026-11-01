// 本地开发入口：默认连同启动器一起起（launcher/ 存在时），找不到启动器就只起 astro dev。
// 关掉启动器：LAUNCHER=0 pnpm dev。启动器代码不在这份 checkout 时，用 LAUNCHER_HOME 指过去。
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SERVER_REL = path.join("launcher", "server.mjs");
const SKIP_FLAG = "--no-launcher";

const astroArgs = process.argv.slice(2).filter((arg) => arg !== SKIP_FLAG);

function findLauncher() {
	if (process.env.LAUNCHER === "0" || process.argv.includes(SKIP_FLAG)) return null;
	const candidates = [ROOT, process.env.LAUNCHER_HOME, path.join(ROOT, "..", "fuwari-launcher")];
	for (const dir of candidates) {
		if (!dir) continue;
		const file = path.join(path.resolve(dir), SERVER_REL);
		if (fs.existsSync(file)) return file;
	}
	return null;
}

const serverFile = findLauncher();
const port = process.env.LAUNCHER_PORT || "5199";
let launcher = null;

if (serverFile) {
	launcher = spawn(process.execPath, [serverFile], {
		cwd: ROOT,
		env: Object.assign({}, process.env, { LAUNCHER_ROOT: ROOT, LAUNCHER_PORT: port }),
		stdio: "inherit",
	});
	console.log("[dev] 启动器：" + serverFile + " → http://127.0.0.1:" + port + "/");
	launcher.on("error", (error) => {
		console.warn("[dev] 启动器没起来：" + error.message);
		launcher = null;
	});
	launcher.on("exit", (code) => {
		launcher = null;
		if (code !== 0 && code !== null) {
			console.warn("[dev] 启动器退出了（code " + code + "），astro dev 继续运行");
		}
	});
} else {
	console.log("[dev] 没找到启动器（launcher/server.mjs），只启动 astro dev");
}

function stopLauncher() {
	const child = launcher;
	if (!child || !child.pid) return;
	launcher = null;
	if (process.platform === "win32") {
		spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
	} else {
		child.kill("SIGTERM");
	}
}

// 直接跑 astro 的 CLI 入口：不需要 shell，Windows 上也不会碰到 spawn EINVAL。
const ASTRO_BIN = path.join(ROOT, "node_modules", "astro", "bin", "astro.mjs");
const astroCommand = fs.existsSync(ASTRO_BIN)
	? { command: process.execPath, args: [ASTRO_BIN, "dev"].concat(astroArgs) }
	: { command: process.platform === "win32" ? "pnpm.cmd" : "pnpm", args: ["astro", "dev"].concat(astroArgs), shell: process.platform === "win32" };
const astro = spawn(astroCommand.command, astroCommand.args, {
	cwd: ROOT,
	stdio: "inherit",
	shell: astroCommand.shell || false,
});

astro.on("exit", (code) => {
	stopLauncher();
	process.exit(code ?? 0);
});
astro.on("error", (error) => {
	console.error("[dev] 无法启动 astro dev：" + error.message);
	stopLauncher();
	process.exit(1);
});
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
	process.on(signal, () => {
		stopLauncher();
		process.exit(0);
	});
}
