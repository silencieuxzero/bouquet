import { FailError, failure, readJson, readRaw, sendJson, success } from "./http.mjs";

const ESCAPE_RE = /[.*+?^${}()|[\]\\]/g;

function compilePattern(pattern) {
	if (typeof pattern !== "string" || !pattern.startsWith("/")) {
		throw new Error("route pattern must start with /: " + pattern);
	}
	const keys = [];
	const source = pattern
		.split("/")
		.map((segment) => {
			if (segment.startsWith(":")) {
				keys.push(segment.slice(1));
				return "([^/]+)";
			}
			return segment.replace(ESCAPE_RE, "\\$&");
		})
		.join("/");
	return { regex: new RegExp("^" + source + "$"), keys };
}

function decode(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

export class Router {
	constructor() {
		this.routes = [];
	}

	add(method, pattern, handler) {
		if (typeof handler !== "function") {
			throw new Error("handler for " + pattern + " must be a function");
		}
		const { regex, keys } = compilePattern(pattern);
		this.routes.push({ method: method.toUpperCase(), pattern, handler, regex, keys });
		return this;
	}

	get(pattern, handler) {
		return this.add("GET", pattern, handler);
	}

	post(pattern, handler) {
		return this.add("POST", pattern, handler);
	}

	put(pattern, handler) {
		return this.add("PUT", pattern, handler);
	}

	delete(pattern, handler) {
		return this.add("DELETE", pattern, handler);
	}

	/**
	 * Dispatch one request. Returns false when no pattern matched the path,
	 * so the caller can emit the /api 404 envelope.
	 */
	async handle(req, res) {
		const url = new URL(req.url ?? "/", "http://127.0.0.1");
		const matches = this.routes.filter((route) => route.regex.test(url.pathname));
		if (matches.length === 0) return false;

		const method = String(req.method ?? "GET").toUpperCase();
		const route = matches.find((r) => r.method === method || (method === "HEAD" && r.method === "GET"));
		if (!route) {
			const allow = [...new Set(matches.map((r) => r.method))];
			res.setHeader("allow", allow.join(", "));
			sendJson(res, 405, failure("method-not-allowed", method + " is not allowed on " + url.pathname, { allow }));
			return true;
		}

		const matched = route.regex.exec(url.pathname);
		const params = {};
		route.keys.forEach((key, index) => {
			params[key] = decode(matched[index + 1] ?? "");
		});

		const ctx = {
			params,
			query: url.searchParams,
			url,
			req,
			res,
			headers: req.headers,
			json(value, status = 200) {
				sendJson(res, status, success(value));
			},
			fail(status, code, message, details) {
				sendJson(res, status, failure(code, message, details));
			},
			readJson(options) {
				return readJson(req, options);
			},
			readRaw(options) {
				return readRaw(req, options);
			},
		};

		try {
			await route.handler(ctx);
		} catch (err) {
			if (res.headersSent) {
				res.destroy();
				return true;
			}
			if (err instanceof FailError) {
				sendJson(res, err.status, failure(err.code, err.message, err.details));
			} else {
				sendJson(res, 500, failure("internal", err?.message ? String(err.message) : "internal error", { stack: String(err?.stack ?? "") }));
			}
			return true;
		}
		if (!res.headersSent) {
			sendJson(res, 200, success(null));
		}
		return true;
	}
}

export function createApp() {
	return new Router();
}
