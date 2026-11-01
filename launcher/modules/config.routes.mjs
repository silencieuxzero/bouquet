import { FailError } from "../core/http.mjs";
import { applyConfigPatch, readConfig } from "../core/config-ast.mjs";
import { fieldList } from "../core/config-schema.mjs";

export function register(app) {
	app.get("/api/config", async (ctx) => {
		ctx.json(await readConfig());
	});

	app.get("/api/config/schema", (ctx) => {
		ctx.json(fieldList());
	});

	app.post("/api/config/patch", async (ctx) => {
		const body = await ctx.readJson({ limit: 4 * 1024 * 1024 });
		if (!body || typeof body !== "object" || Array.isArray(body)) {
			throw new FailError(400, "body-invalid", "body must be an object with an edits array");
		}
		const result = await applyConfigPatch(body.edits, { dryRun: body.dryRun === true });
		ctx.json(result);
	});
}
