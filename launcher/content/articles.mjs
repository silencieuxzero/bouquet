// 文章读、列、建、改、归档。正文只在显式传入 body 时才会变。
import fs from "node:fs/promises";
import path from "node:path";
import { assertInside, fromRoot, rel } from "../core/paths.mjs";
import { snapshot } from "../core/backup.mjs";
import { cipherExists } from "./encryption.mjs";
import {
	ContentError,
	collectionDir,
	findCollection,
	validateSlug,
} from "./collections.mjs";
import {
	buildDocument,
	parseFrontmatter,
	patchFrontmatter,
	withBody,
} from "./frontmatter.mjs";

const TRASH_DIR = ".launcher/trash";

function pad(value) {
	return String(value).padStart(2, "0");
}

export function nowStamp(date = new Date()) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
		date.getHours(),
	)}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function stampFor(date = new Date()) {
	return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(
		date.getHours(),
	)}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

async function exists(target) {
	try {
		await fs.stat(target);
		return true;
	} catch (error) {
		if (error.code === "ENOENT") return false;
		throw error;
	}
}

function articleFile(collection, slug) {
	return assertInside(path.join(collectionDir(collection), `${slug}.md`));
}

function titleOf(frontmatter, slug) {
	const title = frontmatter.title;
	return typeof title === "string" && title.trim() ? title : slug;
}

function dateOf(value) {
	if (typeof value === "string") return value;
	if (typeof value === "number" && Number.isFinite(value)) return String(value);
	return null;
}

function normalizeFields(input) {
	if (input === undefined || input === null) return {};
	if (typeof input !== "object" || Array.isArray(input)) {
		throw new ContentError(400, "frontmatter-invalid", "frontmatter 必须是对象");
	}
	return { ...input };
}

export async function listArticles(key) {
	const collection = findCollection(key);
	const dir = collectionDir(collection);
	let dirents;
	try {
		dirents = await fs.readdir(dir, { withFileTypes: true });
	} catch (error) {
		if (error.code === "ENOENT") return [];
		throw error;
	}
	const items = [];
	for (const dirent of dirents) {
		if (!dirent.isFile() || dirent.name.startsWith(".") || !dirent.name.endsWith(".md")) continue;
		const abs = path.join(dir, dirent.name);
		const slug = dirent.name.slice(0, -3);
		let raw;
		let stat;
		try {
			[raw, stat] = await Promise.all([fs.readFile(abs, "utf8"), fs.stat(abs)]);
		} catch {
			continue;
		}
		let data = {};
		try {
			data = parseFrontmatter(raw).data;
		} catch {
			data = {};
		}
		items.push({
			slug,
			path: rel(abs),
			title: titleOf(data, slug),
			published: dateOf(data.published),
			draft: data.draft === true,
			encrypted: data.encrypted === true,
			cipherExists: await cipherExists(slug),
			size: stat.size,
			mtime: stat.mtime.toISOString(),
		});
	}
	items.sort((a, b) => {
		const pa = a.published ?? "";
		const pb = b.published ?? "";
		if (pa !== pb) return pb.localeCompare(pa);
		return a.slug.localeCompare(b.slug);
	});
	return items;
}

export async function readArticle(key, slugInput) {
	const collection = findCollection(key);
	const slug = validateSlug(slugInput);
	const abs = articleFile(collection, slug);
	let raw;
	try {
		raw = await fs.readFile(abs, "utf8");
	} catch (error) {
		if (error.code === "ENOENT") {
			throw new ContentError(404, "not-found", `找不到文章: ${rel(abs)}`, { key, slug });
		}
		throw error;
	}
	const info = parseFrontmatter(raw);
	return {
		slug,
		path: rel(abs),
		frontmatter: info.data,
		body: info.body,
		cipherExists: await cipherExists(slug),
		raw,
	};
}

export async function createArticle(key, input = {}) {
	const collection = findCollection(key);
	const slug = validateSlug(input.slug);
	const abs = articleFile(collection, slug);
	if (await exists(abs)) {
		throw new ContentError(409, "exists", `文章已存在: ${rel(abs)}`, {
			key,
			slug,
			path: rel(abs),
		});
	}
	const fields = normalizeFields(input.frontmatter);
	if (collection.schema !== "empty") {
		if (fields.title === null || fields.title === undefined) fields.title = slug;
		if (fields.published === null || fields.published === undefined) fields.published = nowStamp();
	}
	const ordered = {};
	for (const fixed of ["title", "published"]) {
		if (fields[fixed] !== null && fields[fixed] !== undefined) ordered[fixed] = fields[fixed];
	}
	for (const field of Object.keys(fields)) {
		if (Object.hasOwn(ordered, field)) continue;
		if (fields[field] === null || fields[field] === undefined) continue;
		ordered[field] = fields[field];
	}
	const body = typeof input.body === "string" ? input.body : "";
	const raw = buildDocument(ordered, body);
	await fs.mkdir(path.dirname(abs), { recursive: true });
	await fs.writeFile(abs, raw, "utf8");
	return { path: rel(abs), slug };
}

export async function updateArticle(key, slugInput, input = {}) {
	const collection = findCollection(key);
	const slug = validateSlug(slugInput);
	const abs = articleFile(collection, slug);
	let raw;
	try {
		raw = await fs.readFile(abs, "utf8");
	} catch (error) {
		if (error.code === "ENOENT") {
			throw new ContentError(404, "not-found", `找不到文章: ${rel(abs)}`, { key, slug });
		}
		throw error;
	}
	let next = raw;
	let changedKeys = [];
	if (input.frontmatter !== undefined) {
		const patched = patchFrontmatter(next, input.frontmatter);
		next = patched.raw;
		changedKeys = patched.changedKeys;
	}
	if (input.body !== undefined) {
		if (typeof input.body !== "string") {
			throw new ContentError(400, "invalid-body", "body 必须是字符串");
		}
		next = withBody(next, input.body);
	}
	if (next === raw) {
		return { backupId: null, changedKeys: [] };
	}
	const backup = await snapshot([rel(abs)], "content:update");
	await fs.writeFile(abs, next, "utf8");
	return { backupId: backup?.id ?? null, changedKeys };
}

export async function archiveArticle(key, slugInput) {
	const collection = findCollection(key);
	const slug = validateSlug(slugInput);
	const abs = articleFile(collection, slug);
	let raw;
	try {
		raw = await fs.readFile(abs, "utf8");
	} catch (error) {
		if (error.code === "ENOENT") {
			throw new ContentError(404, "not-found", `找不到文章: ${rel(abs)}`, { key, slug });
		}
		throw error;
	}
	const backup = await snapshot([rel(abs)], "content:archive");
	const trashDir = assertInside(fromRoot(TRASH_DIR));
	await fs.mkdir(trashDir, { recursive: true });
	const stamp = stampFor();
	let dest = path.join(trashDir, `${collection.key}-${slug}-${stamp}.md`);
	let index = 1;
	while (await exists(dest)) {
		dest = path.join(trashDir, `${collection.key}-${slug}-${stamp}-${index}.md`);
		index += 1;
	}
	try {
		await fs.rename(abs, dest);
	} catch (error) {
		if (error.code !== "EXDEV") throw error;
		await fs.copyFile(abs, dest);
		await fs.writeFile(abs, raw, "utf8");
		await fs.unlink(abs);
	}
	return { archivedTo: rel(dest), backupId: backup?.id ?? null };
}
