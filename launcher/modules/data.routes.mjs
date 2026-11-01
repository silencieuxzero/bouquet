import { readData, writeData } from "../core/data-json.mjs";

export function register(app) {
	app.get("/api/data/:name", async (ctx) => {
		ctx.json(await readData(ctx.params.name));
	});

	app.put("/api/data/:name", async (ctx) => {
		const document = await ctx.readJson();
		const result = await writeData(ctx.params.name, document);
		ctx.json({ backupId: result.backupId, unchanged: result.unchanged });
	});
}
