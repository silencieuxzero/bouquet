import { start, status, stop } from "../core/preview.mjs";

export function register(app) {
	app.get("/api/preview/status", (ctx) => {
		ctx.json(status());
	});

	app.post("/api/preview/start", async (ctx) => {
		ctx.json(await start());
	});

	app.post("/api/preview/stop", async (ctx) => {
		ctx.json(await stop());
	});
}
