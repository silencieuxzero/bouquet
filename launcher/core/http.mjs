/** Envelope + body helpers shared by every route module. */

export class FailError extends Error {
	constructor(status, code, message, details) {
		super(message);
		this.name = "FailError";
		this.status = Number.isInteger(status) ? status : 500;
		this.code = typeof code === "string" && code ? code : "internal";
		this.details = details === undefined ? null : details;
	}
}

export function success(data) {
	return { ok: true, data: data === undefined ? null : data };
}

export function failure(code, message, details) {
	return { ok: false, error: { code, message, details: details === undefined ? null : details } };
}

const UTF8 = "utf-8";

export function sendJson(res, status, value) {
	const body = Buffer.from(JSON.stringify(value), UTF8);
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"content-length": String(body.length),
		"cache-control": "no-store",
	});
	res.end(body);
	return body.length;
}

export function sendText(res, status, text, type = "text/plain; charset=utf-8") {
	const body = Buffer.from(String(text), UTF8);
	res.writeHead(status, {
		"content-type": type,
		"content-length": String(body.length),
		"cache-control": "no-store",
	});
	res.end(body);
}

export function sendBuffer(res, status, body, type) {
	res.writeHead(status, {
		"content-type": type || "application/octet-stream",
		"content-length": String(body.length),
		"cache-control": "no-store",
	});
	res.end(body);
	return body.length;
}

/** Collect the whole request body, refusing anything over `limit` bytes. */
export async function readRaw(req, options = {}) {
	const limit = Number.isFinite(options.limit) ? options.limit : 64 * 1024 * 1024;
	const declared = Number(req.headers["content-length"]);
	if (Number.isFinite(declared) && declared > limit) {
		throw new FailError(413, "body-too-large", "request body exceeds " + limit + " bytes", { limit, declared });
	}
	const chunks = [];
	let total = 0;
	for await (const chunk of req) {
		total += chunk.length;
		if (total > limit) {
			throw new FailError(413, "body-too-large", "request body exceeds " + limit + " bytes", { limit });
		}
		chunks.push(chunk);
	}
	return Buffer.concat(chunks, total);
}

/** Read and parse a JSON request body. */
export async function readJson(req, options = {}) {
	const limit = Number.isFinite(options.limit) ? options.limit : 32 * 1024 * 1024;
	const raw = await readRaw(req, { limit });
	const text = raw.toString(UTF8).trim();
	if (text === "") {
		throw new FailError(400, "body-empty", "request body must be JSON");
	}
	try {
		return JSON.parse(text);
	} catch (err) {
		throw new FailError(400, "body-invalid", "request body is not valid JSON", { reason: err.message });
	}
}
