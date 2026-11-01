// Launcher UI preferences: GET returns the merged settings, PUT patches and persists them.
import { readUiSettings, writeUiSettings } from "../core/ui-settings.mjs";

export function register(app) {
	app.get("/api/ui-settings", async (ctx) => {
		ctx.json(await readUiSettings());
	});

	app.put("/api/ui-settings", async (ctx) => {
		const body = await ctx.readJson();
		ctx.json(await writeUiSettings(body));
	});
}
