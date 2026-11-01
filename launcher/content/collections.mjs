// 内容集合定义与 slug 校验。
// 只做纯逻辑，不碰文件系统以外的运行时状态。
import { fromRoot } from "../core/paths.mjs";

export class ContentError extends Error {
	constructor(status, code, message, details = null) {
		super(message);
		this.name = "ContentError";
		this.status = status;
		this.code = code;
		this.details = details;
	}
}

export const COLLECTIONS = [
	{ key: "posts", dir: "src/content/posts", label: "文章", schema: "post" },
	{ key: "essay", dir: "src/content/essays", label: "随笔", schema: "post" },
	{ key: "oc", dir: "src/content/oc", label: "设定", schema: "post" },
	{ key: "spec", dir: "src/content/spec", label: "页面", schema: "empty" },
];

// slug 会直接拼成文件名：只拒绝真正危险的字符，保留中文等 unicode。
const SLUG_RE = /^[^\u0000-\u001f\/\\:*?"<>|]+$/;

export function listCollections() {
	return COLLECTIONS.map(({ key, dir, label }) => ({ key, dir, label }));
}

export function findCollection(key) {
	const found = COLLECTIONS.find((c) => c.key === key);
	if (!found) {
		throw new ContentError(404, "not-found", `未知内容集合: ${String(key)}`, { key: String(key) });
	}
	return found;
}

export function collectionDir(collection) {
	return fromRoot(collection.dir);
}

export function validateSlug(slug) {
	if (typeof slug !== "string") {
		throw new ContentError(400, "invalid-slug", "slug 必须是字符串", { slug: String(slug) });
	}
	const value = slug;
	if (!value.trim()) throw new ContentError(400, "invalid-slug", "slug 不能为空", { slug });
	if (value !== value.trim()) {
		throw new ContentError(400, "invalid-slug", "slug 不能以空白开头或结尾", { slug });
	}
	if (value.length > 120) throw new ContentError(400, "invalid-slug", "slug 太长（超过 120 个字符）", { slug: value });
	if (value === "." || value === ".." || value.startsWith(".")) {
		throw new ContentError(400, "invalid-slug", "slug 不能以点号开头", { slug: value });
	}
	if (value.startsWith("-")) throw new ContentError(400, "invalid-slug", "slug 不能以减号开头", { slug: value });
	if (value.includes("..")) throw new ContentError(400, "invalid-slug", "slug 不能包含 ..", { slug: value });
	if (/[.\s]$/.test(value)) throw new ContentError(400, "invalid-slug", "slug 不能以点号或空格结尾", { slug: value });
	if (!SLUG_RE.test(value)) {
		throw new ContentError(400, "invalid-slug", "slug 含有不允许的字符", { slug: value });
	}
	return value;
}
