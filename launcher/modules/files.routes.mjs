import fs from "node:fs/promises";
import { listDir, listImages, isImagePath, imageMime } from "../core/upload.mjs";
import { fromRoot, rel } from "../core/paths.mjs";
import { sendBuffer } from "../core/http.mjs";

export function register(app) {
	app.get("/api/files", async (ctx) => {
		const dir = ctx.query.get("dir") ?? "public";
		ctx.json(await listDir(dir));
	});

	app.get("/api/files/images", async (ctx) => {
		const dir = ctx.query.get("dir") ?? "public";
		ctx.json(await listImages(dir));
	});

	// Read-only passthrough for repo images (thumbnails). Only image extensions, always inside the repo.
	app.get("/api/media", async (ctx) => {
		const requested = String(ctx.query.get("path") ?? "").replace(/\\/g, "/");
		if (!requested || !isImagePath(requested)) {
			ctx.fail(400, "path-invalid", "path must be a repo-relative image file", { path: requested });
			return;
		}
		let abs;
		try {
			abs = fromRoot(requested);
		} catch (error) {
			ctx.fail(400, "path-invalid", error.message ?? "path is outside the repository", { path: requested });
			return;
		}
		let body;
		try {
			body = await fs.readFile(abs);
		} catch (err) {
			if (err.code === "ENOENT") {
				ctx.fail(404, "not-found", rel(abs) + " does not exist", { path: rel(abs) });
				return;
			}
			throw err;
		}
		sendBuffer(ctx.res, 200, body, imageMime(requested));
	});
}
