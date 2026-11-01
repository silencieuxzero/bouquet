// 内容模块路由：/api/content/**（契约 §Content）。
import MarkdownIt from "markdown-it";
import {
	archiveArticle,
	createArticle,
	listArticles,
	readArticle,
	updateArticle,
} from "../content/articles.mjs";
import { ContentError, listCollections, validateSlug } from "../content/collections.mjs";
import { runEncryption } from "../content/encryption.mjs";

let renderer = null;

function markdown() {
	renderer ??= new MarkdownIt({ html: false, linkify: true });
	return renderer;
}

function isContentError(error) {
	return error instanceof ContentError || error?.name === "ContentError";
}

function wrap(handler) {
	return async (ctx) => {
		try {
			return await handler(ctx);
		} catch (error) {
			if (isContentError(error)) {
				return ctx.fail(error.status, error.code, error.message, error.details);
			}
			throw error;
		}
	};
}

export function register(app) {
	// 固定路径先注册，避免被 /api/content/:key 抢先匹配
	app.get(
		"/api/content/collections",
		wrap(async (ctx) => ctx.json(listCollections())),
	);

	app.post(
		"/api/content/preview",
		wrap(async (ctx) => {
			const input = await ctx.readJson();
			const body = typeof input?.body === "string" ? input.body : "";
			return ctx.json({ html: markdown().render(body) });
		}),
	);

	app.post(
		"/api/content/encrypt",
		wrap(async (ctx) => {
			const input = await ctx.readJson();
			if (!Array.isArray(input?.slugs) || input.slugs.length === 0) {
				return ctx.fail(400, "invalid-slugs", "slugs 必须是非空数组");
			}
			const slugs = input.slugs.map((slug) => validateSlug(slug));
			const password = typeof input.password === "string" && input.password ? input.password : undefined;
			const result = await runEncryption({ slugs, password, statsOnly: input.statsOnly === true });
			if (result.code !== 0) {
				return ctx.fail(409, "encrypt-failed", "加密脚本执行失败", {
					code: result.code,
					signal: result.signal,
					stdout: result.stdout,
					stderr: result.stderr,
				});
			}
			return ctx.json(result);
		}),
	);

	app.get(
		"/api/content/:key",
		wrap(async (ctx) => ctx.json(await listArticles(ctx.params.key))),
	);

	app.post(
		"/api/content/:key",
		wrap(async (ctx) => {
			const input = await ctx.readJson();
			const created = await createArticle(ctx.params.key, input ?? {});
			return ctx.json(created);
		}),
	);

	app.get(
		"/api/content/:key/:slug",
		wrap(async (ctx) => ctx.json(await readArticle(ctx.params.key, ctx.params.slug))),
	);

	app.put(
		"/api/content/:key/:slug",
		wrap(async (ctx) => {
			const input = await ctx.readJson();
			const result = await updateArticle(ctx.params.key, ctx.params.slug, input ?? {});
			return ctx.json(result);
		}),
	);

	app.post(
		"/api/content/:key/:slug/archive",
		wrap(async (ctx) => ctx.json(await archiveArticle(ctx.params.key, ctx.params.slug))),
	);
}
