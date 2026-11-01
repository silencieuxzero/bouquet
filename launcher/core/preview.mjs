import { spawn } from "node:child_process";
import { ROOT } from "./paths.mjs";
import { FailError } from "./http.mjs";

export const PREVIEW_HOST = "127.0.0.1";
// 4321 by contract; LAUNCHER_PREVIEW_PORT exists so the endpoints can be exercised
// while another dev server already owns the default port.
export const PREVIEW_PORT = Number(process.env.LAUNCHER_PREVIEW_PORT ?? 4321) || 4321;
export const PREVIEW_URL = "http://" + PREVIEW_HOST + ":" + PREVIEW_PORT + "/";
const MAX_LINES = 200;
const READY_TIMEOUT_MS = 90000;
const POLL_MS = 500;

let child = null;
let lines = [];
let pendingLine = "";
let startPromise = null;

function capture(chunk) {
	pendingLine += chunk.toString("utf8");
	const parts = pendingLine.split(/\r?\n/);
	pendingLine = parts.pop() ?? "";
	for (const part of parts) {
		if (part === "") continue;
		lines.push(part);
	}
	while (lines.length > MAX_LINES) lines.shift();
}

function isRunning() {
	return child !== null && child.exitCode === null && child.signalCode === null;
}

/** Kill a process and its children. Windows needs taskkill /T. */
export function killTree(pid) {
	return new Promise((resolve) => {
		if (!pid) {
			resolve(false);
			return;
		}
		const command = process.platform === "win32" ? "taskkill" : "kill";
		const args = process.platform === "win32" ? ["/pid", String(pid), "/T", "/F"] : ["-TERM", "-" + pid];
		let settled = false;
		const finish = (value) => {
			if (settled) return;
			settled = true;
			resolve(value);
		};
		const killer = spawn(command, args, { windowsHide: true, stdio: "ignore" });
		killer.on("error", () => finish(false));
		killer.on("exit", (code) => finish(code === 0));
		setTimeout(() => finish(false), 10000);
	});
}

export function status() {
	return { running: isRunning(), url: PREVIEW_URL, pid: isRunning() ? child.pid : null, lines: lines.slice(-MAX_LINES) };
}

async function probe() {
	try {
		const response = await fetch(PREVIEW_URL, { signal: AbortSignal.timeout(2500) });
		await response.arrayBuffer();
		return response.status > 0;
	} catch {
		return false;
	}
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitReady() {
	const deadline = Date.now() + READY_TIMEOUT_MS;
	while (Date.now() < deadline) {
		if (!isRunning()) return false;
		if (await probe()) return true;
		await sleep(POLL_MS);
	}
	return false;
}

async function launch() {
	const command = "pnpm";
	const extra = (process.env.LAUNCHER_PREVIEW_ARGS ?? "").split(" ").filter(Boolean);
	const args = ["astro", "dev", "--port", String(PREVIEW_PORT), "--host", PREVIEW_HOST, ...extra];
	lines = [];
	pendingLine = "";
	const spawned = spawn(command, args, {
		cwd: ROOT,
		env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
		shell: true,
		windowsHide: true,
		stdio: ["ignore", "pipe", "pipe"],
	});
	child = spawned;
	spawned.stdout.on("data", capture);
	spawned.stderr.on("data", capture);
	spawned.on("error", (err) => {
		lines.push("[launcher] spawn error: " + err.message);
	});
	spawned.on("exit", (code, signal) => {
		lines.push("[launcher] astro dev exited with code " + code + " signal " + signal);
		if (child === spawned) child = null;
	});
	const ready = await waitReady();
	if (!ready) {
		const tail = lines.slice(-40);
		const pid = spawned.pid;
		const exited = !isRunning();
		if (pid) await killTree(pid);
		if (child === spawned) child = null;
		const message = exited
			? "astro dev exited before it answered on " + PREVIEW_URL
			: "astro dev did not answer on " + PREVIEW_URL + " within " + Math.round(READY_TIMEOUT_MS / 1000) + "s";
		throw new FailError(409, "preview-failed", message, { url: PREVIEW_URL, lines: tail });
	}
	return { running: true, url: PREVIEW_URL, pid: spawned.pid };
}

export async function start() {
	if (isRunning()) return { running: true, url: PREVIEW_URL, pid: child.pid };
	if (startPromise) return startPromise;
	// A foreign dev server on our port would make the readiness probe lie.
	if (await probe()) {
		throw new FailError(409, "preview-failed", "something already answers on " + PREVIEW_URL + "; stop that dev server before starting the launcher preview", {
			reason: "port-busy",
			url: PREVIEW_URL,
			lines: [],
		});
	}
	startPromise = launch().finally(() => {
		startPromise = null;
	});
	return startPromise;
}

export async function stop() {
	if (!child) {
		lines = [];
		return { running: false };
	}
	const pid = child.pid;
	await killTree(pid);
	const deadline = Date.now() + 8000;
	while (isRunning() && Date.now() < deadline) await sleep(200);
	if (isRunning()) {
		try {
			child.kill("SIGKILL");
		} catch {
			// already gone
		}
	}
	child = null;
	return { running: false };
}

export async function shutdown() {
	if (child) await stop();
}
