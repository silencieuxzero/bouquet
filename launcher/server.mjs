import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createApp } from "./core/router.mjs";
import { failure, sendJson, sendText } from "./core/http.mjs";
import { MODULES_DIR, ROOT, UI_DIR } from "./core/paths.mjs";
import * as preview from "./core/preview.mjs";
import * as deploy from "./core/deploy.mjs";

const HOST = "127.0.0.1";
const PORT = Number(process.env.LAUNCHER_PORT ?? 5199) || 5199;

const MIME = {
	".html": "text/html; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".svg": "image/svg+xml",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".avif": "image/avif",
	".gif": "image/gif",
	".ico": "image/x-icon",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".txt": "text/plain; charset=utf-8",
	".map": "application/json; charset=utf-8",
};

async function loadModules(app) {
	let entries = [];
	try {
		entries = await fs.readdir(MODULES_DIR);
	} catch (err) {
		if (err.code !== "ENOENT") throw err;
	}
	const files = entries.filter((name) => name.endsWith(".mjs")).sort();
	for (const file of files) {
		const mod = await import(pathToFileURL(path.join(MODULES_DIR, file)).href);
		if (typeof mod.register !== "function") {
			console.warn("[launcher] " + file + " exports no register(app); skipped");
			continue;
		}
		await mod.register(app);
		console.log("[launcher] loaded " + file);
	}
	if (!files.includes("content.routes.mjs")) {
		console.log("[launcher] " + "launcher/modules/content.routes.mjs not present yet; skipped");
	}
}

async function serveStatic(req, res, pathname) {
	if (req.method !== "GET" && req.method !== "HEAD") {
		sendText(res, 405, "method not allowed");
		return;
	}
	let requested = pathname;
	if (requested.endsWith("/")) requested += "index.html";
	let decoded;
	try {
		decoded = decodeURIComponent(requested);
	} catch {
		sendText(res, 400, "bad path");
		return;
	}
	const target = path.resolve(UI_DIR, "." + decoded);
	const base = path.resolve(UI_DIR);
	if (target !== base && !target.startsWith(base + path.sep)) {
		sendText(res, 403, "forbidden");
		return;
	}
	let body;
	try {
		body = await fs.readFile(target);
	} catch (err) {
		if (err.code === "ENOENT" || err.code === "EISDIR" || err.code === "ENOTDIR") {
			if (base === path.resolve(UI_DIR) && decoded === "/index.html") {
				sendText(res, 404, "launcher UI is not built yet: launcher/ui/index.html is missing\n");
				return;
			}
			sendText(res, 404, "not found\n");
			return;
		}
		throw err;
	}
	const type = MIME[path.extname(target).toLowerCase()] ?? "application/octet-stream";
	res.writeHead(200, {
		"content-type": type,
		"content-length": String(body.length),
		"cache-control": "no-store",
	});
	if (req.method === "HEAD") res.end();
	else res.end(body);
}

export async function createServer() {
	const app = createApp();
	await loadModules(app);
	const server = http.createServer(async (req, res) => {
		const url = new URL(req.url ?? "/", "http://" + HOST + ":" + PORT);
		if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
			let handled = false;
			try {
				handled = await app.handle(req, res);
			} catch (err) {
				if (!res.headersSent) {
					sendJson(res, 500, failure("internal", String(err?.message ?? err)));
				}
				return;
			}
			if (!handled && !res.headersSent) {
				sendJson(res, 404, failure("not-found", "no route for " + req.method + " " + url.pathname));
			}
			return;
		}
		try {
			await serveStatic(req, res, url.pathname);
		} catch (err) {
			if (!res.headersSent) sendText(res, 500, String(err?.message ?? err));
		}
	});
	return { app, server };
}

let shuttingDown = false;

async function shutdown(signal, server) {
	if (shuttingDown) return;
	shuttingDown = true;
	console.log("[launcher] shutting down (" + signal + ")");
	deploy.killAll();
	try {
		await preview.shutdown();
	} catch {
		// best effort
	}
	const timer = setTimeout(() => process.exit(0), 3000);
	timer.unref();
	server.close(() => process.exit(0));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

if (isMain) {
	const rootIsDir = await fs.stat(ROOT).then((stat) => stat.isDirectory()).catch(() => false);
	if (!rootIsDir) {
		console.error("[launcher] target repository does not exist: " + ROOT);
		process.exit(1);
	}
	console.log("[launcher] target repository: " + ROOT);
	const { server } = await createServer();
	server.on("error", (err) => {
		if (err.code === "EADDRINUSE") {
			console.error("[launcher] port " + PORT + " is already in use; set LAUNCHER_PORT to another port");
			process.exit(1);
		}
		throw err;
	});
	server.listen(PORT, HOST, () => {
		console.log("[launcher] listening on http://" + HOST + ":" + PORT);
	});
	process.on("SIGINT", () => shutdown("SIGINT", server));
	process.on("SIGTERM", () => shutdown("SIGTERM", server));
}
