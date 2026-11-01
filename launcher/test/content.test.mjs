// 内容模块单元测试 + 路由级自测（伪造 app/ctx，直接调用 register 注册的处理器）。
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test, { after } from "node:test";
import { ROOT } from "../core/paths.mjs";
import { listCollections, validateSlug } from "../content/collections.mjs";
import {
	buildDocument,
	parseFrontmatter,
	patchFrontmatter,
	serializeValue,
	withBody,
} from "../content/frontmatter.mjs";
import { register } from "../modules/content.routes.mjs";

const POSTS_DIR = path.join(ROOT, "src", "content", "posts");
const OC_FILE = path.join(ROOT, "src", "content", "oc", "luoshulv-bc.md");
const TEMP_SLUG = "launcher-selftest-" + Date.now();
const TRACKED = { files: [], backups: [] };

const ESCAPE_RE = /[.*+?^${()|[\]\\]/g;

function compile(pattern) {
	const keys = [];
	const source = pattern
		.split("/")
		.map((segment) => {
			if (segment.startsWith(":")) {
				keys.push(segment.slice(1));
				return "([^/]+)";
			}
			return segment.replace(ESCAPE_RE, "\\$&");
		})
		.join("/");
	return { regex: new RegExp("^" + source + "$"), keys };
}

function createHarness() {
	const routes = [];
	const app = {
		get: (pattern, handler) => routes.push({ method: "GET", pattern, handler }),
		post: (pattern, handler) => routes.push({ method: "POST", pattern, handler }),
		put: (pattern, handler) => routes.push({ method: "PUT", pattern, handler }),
		delete: (pattern, handler) => routes.push({ method: "DELETE", pattern, handler }),
	};
	register(app);
	async function call(method, target, body) {
		const url = new URL(target, "http://127.0.0.1");
		for (const route of routes) {
			if (route.method !== method) continue;
			const { regex, keys } = compile(route.pattern);
			const matched = regex.exec(url.pathname);
			if (!matched) continue;
			const params = {};
			keys.forEach((key, index) => {
				params[key] = decodeURIComponent(matched[index + 1] ?? "");
			});
			let status = 200;
			let payload = null;
			const ctx = {
				params,
				query: url.searchParams,
				json(value, code = 200) {
					status = code;
					payload = { ok: true, data: value };
				},
				fail(code, errorCode, message, details) {
					status = code;
					payload = { ok: false, error: { code: errorCode, message, details } };
				},
				async readJson() {
					return body === undefined ? {} : body;
				},
				async readRaw() {
					return Buffer.from("");
				},
			};
			try {
				await route.handler(ctx);
			} catch (error) {
				status = 500;
				payload = {
					ok: false,
					error: { code: error?.code ?? "internal", message: String(error?.message ?? error) },
				};
			}
			return { status, body: payload };
		}
		throw new Error("no route for " + method + " " + target);
	}
	return { call, routes };
}

const harness = createHarness();

after(async () => {
	for (const file of TRACKED.files) await fs.rm(file, { force: true });
	for (const id of TRACKED.backups) {
		if (typeof id === "string" && id) {
			await fs.rm(path.join(ROOT, ".launcher", "backups", id), { recursive: true, force: true });
		}
	}
	const dirs = [
		path.join(ROOT, ".launcher", "trash"),
		path.join(ROOT, ".launcher", "backups"),
		path.join(ROOT, ".launcher"),
	];
	for (const dir of dirs) await fs.rmdir(dir).catch(() => {});
});

// ---------------------------------------------------------------- frontmatter

const SAMPLE = [
	"---",
	'title: "标题"',
	"published: 2026-07-13T20:25:00",
	"description: '单引号'",
	"draft: false",
	"words: 863",
	'tags: ["IF线", "人物"]',
	"---",
	"",
	"正文",
	"",
].join("\n");

test("parse: quoted string, bare ISO date, single quote, boolean, number, flow array", () => {
	const info = parseFrontmatter(SAMPLE);
	assert.equal(info.fences, true);
	assert.deepEqual(info.data, {
		title: "标题",
		published: "2026-07-13T20:25:00",
		description: "单引号",
		draft: false,
		words: 863,
		tags: ["IF线", "人物"],
	});
	assert.equal(info.body, "\n正文\n");
	assert.deepEqual(info.order, ["title", "published", "description", "draft", "words", "tags"]);
});

test("parse: block sequence is readable and editable", () => {
	const info = parseFrontmatter(["---", "tags:", "  - a", "  - b", "draft: false", "---", ""].join("\n"));
	assert.deepEqual(info.data.tags, ["a", "b"]);
	assert.equal(info.entries.find((entry) => entry.key === "tags").editable, true);
});

test("parse: file without fences keeps whole text as body", () => {
	const plain = "# 关于\n\n正文\n";
	const info = parseFrontmatter(plain);
	assert.equal(info.fences, false);
	assert.deepEqual(info.data, {});
	assert.equal(info.body, plain);
});

test("patch: only the edited line changes, CRLF preserved", () => {
	const crlf = '---\r\ntitle: "A"\r\ndraft: false\r\n---\r\n\r\nbody\r\n';
	const result = patchFrontmatter(crlf, { title: "B" });
	assert.deepEqual(result.changedKeys, ["title"]);
	assert.equal(result.raw, '---\r\ntitle: "B"\r\ndraft: false\r\n---\r\n\r\nbody\r\n');
});

test("patch: bare scalar and single-quoted styles survive a round trip", () => {
	const raw = "---\ndescription: 裸标量描述\ncategory: '设定'\ndraft: false\n---\n\n正文\n";
	const changed = patchFrontmatter(raw, { description: "新的裸标量" });
	assert.equal(changed.raw, "---\ndescription: 新的裸标量\ncategory: '设定'\ndraft: false\n---\n\n正文\n");
	assert.equal(patchFrontmatter(changed.raw, { description: "裸标量描述" }).raw, raw);
	assert.ok(patchFrontmatter(raw, { category: "新的设定" }).raw.includes("\ncategory: '新的设定'\n"));
});

test("patch: unchanged value produces byte-identical output", () => {
	const crlf = '---\r\ntitle: "A"\r\ndraft: false\r\n---\r\n\r\nbody\r\n';
	const result = patchFrontmatter(crlf, { title: "A", draft: false });
	assert.deepEqual(result.changedKeys, []);
	assert.equal(result.raw, crlf);
});

test("patch: null removes the key line", () => {
	const crlf = '---\r\ntitle: "A"\r\ndraft: false\r\n---\r\n\r\nbody\r\n';
	const result = patchFrontmatter(crlf, { draft: null });
	assert.deepEqual(result.changedKeys, ["draft"]);
	assert.equal(result.raw, '---\r\ntitle: "A"\r\n---\r\n\r\nbody\r\n');
});

test("patch: new key is appended before the closing fence", () => {
	const result = patchFrontmatter(SAMPLE, { encrypted: true });
	assert.deepEqual(result.changedKeys, ["encrypted"]);
	const reparsed = parseFrontmatter(result.raw);
	assert.equal(reparsed.data.encrypted, true);
	assert.ok(result.raw.includes('\ntags: ["IF线", "人物"]\nencrypted: true\n---\n'));
});

test("patch: unsupported YAML shapes fail with code frontmatter-unsupported", () => {
	const blockMap = ["---", "meta:", "  title: x", "  lang: zh", "---", ""].join("\n");
	assert.throws(
		() => patchFrontmatter(blockMap, { meta: { title: "y" } }),
		(error) => error.code === "frontmatter-unsupported",
	);
	const blockScalar = ["---", "description: |", "  多行", "  文本", "---", ""].join("\n");
	assert.throws(
		() => patchFrontmatter(blockScalar, { description: "单行" }),
		(error) => error.code === "frontmatter-unsupported",
	);
	const duplicate = ["---", 'title: "A"', 'title: "B"', "---", ""].join("\n");
	assert.throws(
		() => patchFrontmatter(duplicate, { title: "C" }),
		(error) => error.code === "frontmatter-unsupported",
	);
	assert.throws(
		() => patchFrontmatter(SAMPLE, { tags: [["嵌套"]] }),
		(error) => error.code === "frontmatter-unsupported",
	);
});

test("patch: document without fences gets a frontmatter block, body unchanged", () => {
	const plain = "# 关于\n\n正文\n";
	const result = patchFrontmatter(plain, { title: "关于" });
	assert.equal(result.raw, '---\ntitle: "关于"\n---\n\n# 关于\n\n正文\n');
	assert.equal(parseFrontmatter(result.raw).body, "\n# 关于\n\n正文\n");
});

test("serialize: strings, ISO dates, arrays, numbers, booleans", () => {
	assert.equal(serializeValue("普通字符串"), '"普通字符串"');
	assert.equal(serializeValue("2026-07-13T20:25:00"), "2026-07-13T20:25:00");
	assert.equal(serializeValue(["a", "b c"]), '["a", "b c"]');
	assert.equal(serializeValue(4), "4");
	assert.equal(serializeValue(false), "false");
});

test("withBody replaces only the body, buildDocument emits fences", () => {
	const crlf = '---\r\ntitle: "A"\r\n---\r\n旧正文\r\n';
	assert.equal(withBody(crlf, "新正文\n"), '---\r\ntitle: "A"\r\n---\r\n新正文\n');
	const doc = buildDocument({ title: "标题", published: "2026-01-02T03:04:05" }, "正文\n");
	assert.ok(doc.startsWith("---\ntitle: "));
	assert.ok(doc.includes("\npublished: 2026-01-02T03:04:05\n---\n\n正文\n"));
});

// ---------------------------------------------------------------- slug

test("slug validation accepts real slugs and rejects traversal", () => {
	assert.equal(validateSlug("luoshulv-bc"), "luoshulv-bc");
	assert.equal(validateSlug("common.css解释文件"), "common.css解释文件");
	assert.equal(validateSlug("story-1"), "story-1");
	const bad = ["", "  ", "..", "../x", "a/b", "a\\b", ".hidden", "-flag", "x ", "a:b", "a*b", 42, null];
	for (const value of bad) {
		assert.throws(() => validateSlug(value), (error) => error.code === "invalid-slug", "slug: " + String(value));
	}
	assert.throws(() => validateSlug("x".repeat(200)), (error) => error.code === "invalid-slug");
});

// ---------------------------------------------------------------- routes

test("GET /api/content/collections lists posts, essay, oc, spec with dirs", async () => {
	const res = await harness.call("GET", "/api/content/collections");
	assert.equal(res.status, 200);
	assert.deepEqual(res.body.data, listCollections());
	assert.deepEqual(
		res.body.data.map((item) => [item.key, item.dir]),
		[
			["posts", "src/content/posts"],
			["essay", "src/content/essays"],
			["oc", "src/content/oc"],
			["spec", "src/content/spec"],
		],
	);
});

test("GET /api/content/posts lists real posts with their titles", async () => {
	const res = await harness.call("GET", "/api/content/posts");
	assert.equal(res.status, 200);
	assert.ok(res.body.data.length >= 6);
	const fandom = res.body.data.find((item) => item.slug === "Fandom");
	assert.ok(fandom);
	assert.equal(fandom.title, "Fandom后室中文写手身份验证");
	assert.equal(fandom.path, "src/content/posts/Fandom.md");
	for (const item of res.body.data) {
		assert.equal(typeof item.title, "string");
		assert.ok(item.title.length > 0);
		assert.equal(typeof item.size, "number");
		assert.equal(typeof item.encrypted, "boolean");
	}
});

test("GET /api/content/oc/luoshulv-bc returns encrypted frontmatter and raw text", async () => {
	const res = await harness.call("GET", "/api/content/oc/luoshulv-bc");
	assert.equal(res.status, 200);
	const { frontmatter, body, raw, path: repoPath } = res.body.data;
	assert.equal(repoPath, "src/content/oc/luoshulv-bc.md");
	assert.equal(frontmatter.encrypted, true);
	assert.deepEqual(frontmatter.tags, ["IF线", "人物"]);
	assert.equal(frontmatter.published, "2026-07-13T20:25:00");
	assert.equal(frontmatter.words, 863);
	assert.ok(raw.startsWith("---"));
	assert.equal(raw, await fs.readFile(OC_FILE, "utf8"));
	assert.equal(body, "\n<!-- Body is stored encrypted in /encrypted/luoshulv-bc.enc -->\n");
});

test("PUT with identical payload leaves the file byte-identical", async () => {
	const before = await fs.readFile(OC_FILE);
	const detail = await harness.call("GET", "/api/content/oc/luoshulv-bc");
	const res = await harness.call("PUT", "/api/content/oc/luoshulv-bc", {
		frontmatter: detail.body.data.frontmatter,
		body: detail.body.data.body,
	});
	assert.equal(res.status, 200);
	assert.deepEqual(res.body.data.changedKeys, []);
	assert.equal(res.body.data.backupId, null);
	assert.deepEqual(await fs.readFile(OC_FILE), before);
});

test("PUT changing only description rewrites exactly one line", async () => {
	const createdRes = await harness.call("POST", "/api/content/posts", {
		slug: TEMP_SLUG,
		body: "测试正文\n",
	});
	assert.equal(createdRes.status, 200);
	const file = path.join(POSTS_DIR, TEMP_SLUG + ".md");
	TRACKED.files.push(file);
	const before = await fs.readFile(file, "utf8");
	const res = await harness.call("PUT", "/api/content/posts/" + TEMP_SLUG, {
		frontmatter: { description: "修改后的描述" },
	});
	assert.equal(res.status, 200);
	assert.deepEqual(res.body.data.changedKeys, ["description"]);
	assert.equal(typeof res.body.data.backupId, "string");
	TRACKED.backups.push(res.body.data.backupId);
	const afterText = await fs.readFile(file, "utf8");
	const beforeLines = before.split("\n");
	const afterLines = afterText.split("\n");
	assert.equal(afterLines.length, beforeLines.length + 1);
	assert.deepEqual(
		afterLines.filter((line) => !beforeLines.includes(line)),
		['description: "修改后的描述"'],
	);
	assert.deepEqual(
		beforeLines.filter((line) => !afterLines.includes(line)),
		[],
	);
	const removeRes = await harness.call("PUT", "/api/content/posts/" + TEMP_SLUG, {
		frontmatter: { description: null },
	});
	assert.deepEqual(removeRes.body.data.changedKeys, ["description"]);
	TRACKED.backups.push(removeRes.body.data.backupId);
	assert.equal(await fs.readFile(file, "utf8"), before);
});

test("POST /api/content/posts rejects an existing slug with 409", async () => {
	const res = await harness.call("POST", "/api/content/posts", { slug: "Fandom", body: "x" });
	assert.equal(res.status, 409);
	assert.equal(res.body.error.code, "exists");
});

test("POST /api/content/posts creates a file with fences, title and published", async () => {
	const slug = TEMP_SLUG + "-create";
	const res = await harness.call("POST", "/api/content/posts", { slug, body: "正文\n" });
	assert.equal(res.status, 200);
	assert.equal(res.body.data.path, "src/content/posts/" + slug + ".md");
	const file = path.join(POSTS_DIR, slug + ".md");
	TRACKED.files.push(file);
	const raw = await fs.readFile(file, "utf8");
	assert.match(raw, /^---\ntitle: /);
	assert.match(raw, /\npublished: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\n---\n/);
	const detail = await harness.call("GET", "/api/content/posts/" + slug);
	assert.equal(detail.status, 200);
	assert.equal(detail.body.data.frontmatter.title, slug);
	assert.match(detail.body.data.frontmatter.published, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
	assert.equal(detail.body.data.body, "\n正文\n");
});

test("GET of an unknown article is a 404 envelope", async () => {
	const res = await harness.call("GET", "/api/content/posts/definitely-not-a-real-slug");
	assert.equal(res.status, 404);
	assert.equal(res.body.error.code, "not-found");
});

test("POST /api/content/preview renders markdown to html", async () => {
	const res = await harness.call("POST", "/api/content/preview", { body: "# 标题\n\n正文" });
	assert.equal(res.status, 200);
	assert.match(res.body.data.html, /<h1>标题<\/h1>/);
	assert.match(res.body.data.html, /<p>正文<\/p>/);
});

test("POST /api/content/:key/:slug/archive moves the file into .launcher/trash", async () => {
	const slug = TEMP_SLUG + "-archive";
	const file = path.join(POSTS_DIR, slug + ".md");
	TRACKED.files.push(file);
	await fs.writeFile(
		file,
		buildDocument({ title: "待归档", published: "2026-01-01T00:00:00" }, "归档正文\n"),
		"utf8",
	);
	const before = await fs.readFile(file);
	const res = await harness.call("POST", "/api/content/posts/" + slug + "/archive");
	assert.equal(res.status, 200);
	const archivedTo = res.body.data.archivedTo;
	assert.ok(archivedTo.startsWith(".launcher/trash/"));
	assert.equal(typeof res.body.data.backupId, "string");
	TRACKED.backups.push(res.body.data.backupId);
	const trashFile = path.join(ROOT, archivedTo);
	TRACKED.files.push(trashFile);
	assert.deepEqual(await fs.readFile(trashFile), before);
	await assert.rejects(fs.stat(file));
	await fs.writeFile(file, before);
	assert.deepEqual(await fs.readFile(file), before);
});

test("POST /api/content/encrypt reports a failing script with 409", async () => {
	const res = await harness.call("POST", "/api/content/encrypt", {
		slugs: ["definitely-not-a-real-slug"],
	});
	assert.equal(res.status, 409);
	assert.equal(res.body.error.code, "encrypt-failed");
	assert.equal(typeof res.body.error.details.code, "number");
	assert.ok(res.body.error.details.stderr.length > 0);
	await assert.rejects(fs.stat(path.join(ROOT, "public", "encrypted", "definitely-not-a-real-slug.enc")));
});

test("POST /api/content/encrypt rejects invalid slugs before spawning", async () => {
	const res = await harness.call("POST", "/api/content/encrypt", { slugs: ["../escape"] });
	assert.equal(res.status, 400);
	assert.equal(res.body.error.code, "invalid-slug");
});
test("list and detail report cipherExists so missing ciphertext is visible", async () => {
	const slug = "launcher-cipher-" + Date.now();
	const file = path.join(POSTS_DIR, slug + ".md");
	await fs.writeFile(
		file,
		buildDocument({ title: "缺密文", published: "2026-01-02T00:00:00", encrypted: true }, "正文还在文件里\n"),
		"utf8",
	);
	TRACKED.files.push(file);
	try {
		const list = await harness.call("GET", "/api/content/posts");
		assert.equal(list.status, 200);
		const item = list.body.data.find((entry) => entry.slug === slug);
		assert.ok(item);
		assert.equal(item.encrypted, true);
		assert.equal(item.cipherExists, false);

		const detail = await harness.call("GET", "/api/content/posts/" + slug);
		assert.equal(detail.status, 200);
		assert.equal(detail.body.data.frontmatter.encrypted, true);
		assert.equal(detail.body.data.cipherExists, false);

		const withCipher = await harness.call("GET", "/api/content/oc/luoshulv-bc");
		assert.equal(withCipher.body.data.cipherExists, true);

		const plain = await harness.call("GET", "/api/content/posts/character");
		assert.equal(plain.body.data.frontmatter.encrypted, undefined);
		assert.equal(plain.body.data.cipherExists, false);
	} finally {
		await fs.rm(file, { force: true });
	}
});
