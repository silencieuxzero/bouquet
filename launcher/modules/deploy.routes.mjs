import { commit, diff, push, status } from "../core/deploy.mjs";

export function register(app) {
	app.get("/api/deploy/status", async (ctx) => {
		ctx.json(await status());
	});

	app.get("/api/deploy/diff", async (ctx) => {
		ctx.json(await diff(ctx.query.get("path")));
	});

	app.post("/api/deploy/commit", async (ctx) => {
		const body = await ctx.readJson({ limit: 1024 * 1024 });
		const input = body && typeof body === "object" ? body : {};
		ctx.json(await commit(input.message, input.paths));
	});

	app.post("/api/deploy/push", async (ctx) => {
		ctx.json(await push());
	});
}
