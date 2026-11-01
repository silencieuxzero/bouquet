import { saveUpload } from "../core/upload.mjs";

const MAX_BYTES = 64 * 1024 * 1024;

function decodeHeader(value) {
	if (typeof value !== "string" || value === "") return "";
	const raw = Array.isArray(value) ? value[0] : value;
	try {
		return decodeURIComponent(raw);
	} catch {
		return raw;
	}
}

export function register(app) {
	app.post("/api/upload", async (ctx) => {
		const filename = decodeHeader(ctx.headers["x-filename"]);
		const dir = decodeHeader(ctx.headers["x-dir"]);
		const overwrite = String(ctx.headers["x-overwrite"] ?? "") === "1";
		const bytes = await ctx.readRaw({ limit: MAX_BYTES });
		const result = await saveUpload({ filename, dir, overwrite, bytes });
		ctx.json(result);
	});
}
