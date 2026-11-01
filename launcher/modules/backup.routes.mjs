import { listBackups, restore } from "../core/backup.mjs";

export function register(app) {
	app.get("/api/backups", async (ctx) => {
		ctx.json(await listBackups(50));
	});

	app.post("/api/backups/:id/restore", async (ctx) => {
		ctx.json(await restore(ctx.params.id));
	});
}
