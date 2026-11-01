import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIRS, LIST_DIRS, fromRoot, rel } from "./paths.mjs";
import { FailError } from "./http.mjs";

const UNSAFE_RE = /[\/\\:*?"<>|\u0000-\u001f]/g;
const MAX_BYTES = 64 * 1024 * 1024;

/** Strip path separators and reserved characters; keep unicode. */
export function sanitizeFilename(raw) {
	if (typeof raw !== "string") return "";
	const name = raw.replace(UNSAFE_RE, "").trim();
	if (name === "" || name === "." || name === ".." || name.includes("..")) return "";
	return name;
}

export function resolveDir(rawDir, allowed = UPLOAD_DIRS, fallback = "public") {
	const dir = typeof rawDir === "string" && rawDir.trim() !== "" ? rawDir.trim().replace(/\/+$/, "") : fallback;
	if (!allowed.includes(dir)) {
		throw new FailError(400, "dir-invalid", "dir must be one of " + allowed.join(", "), { dirs: allowed });
	}
	return dir;
}

export async function saveUpload(input) {
	const bytes = input.bytes;
	if (!Buffer.isBuffer(bytes)) {
		throw new FailError(400, "body-empty", "upload body must be raw file bytes");
	}
	if (bytes.length === 0) {
		throw new FailError(400, "body-empty", "upload body is empty");
	}
	if (bytes.length > MAX_BYTES) {
		throw new FailError(413, "body-too-large", "upload exceeds " + MAX_BYTES + " bytes", { limit: MAX_BYTES, received: bytes.length });
	}
	const name = sanitizeFilename(input.filename);
	if (name === "") {
		throw new FailError(400, "filename-invalid", "x-filename is missing or contains no usable characters");
	}
	const dir = resolveDir(input.dir);
	const target = fromRoot(path.posix.join(dir, name));
	const repoRel = rel(target);
	let existing = null;
	try {
		existing = await fs.readFile(target);
	} catch (err) {
		if (err.code !== "ENOENT") throw err;
	}
	if (existing && !input.overwrite) {
		throw new FailError(409, "exists", repoRel + " already exists; send x-overwrite: 1 to replace it", { path: repoRel });
	}
	await fs.mkdir(path.dirname(target), { recursive: true });
	await fs.writeFile(target, bytes);
	return { path: repoRel, bytes: bytes.length, replaced: existing !== null };
}

export const IMAGE_MIME = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".avif": "image/avif",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".bmp": "image/bmp"
};

const IMAGE_SKIP_DIRS = new Set(["node_modules", ".git", ".launcher", "dist", ".astro", ".vercel", ".netlify"]);

/** True when a repo-relative path names a file this launcher will serve as an image. */
export function isImagePath(relPath) {
	const lowered = String(relPath).toLowerCase();
	return Object.prototype.hasOwnProperty.call(IMAGE_MIME, path.posix.extname(lowered));
}

export function imageMime(relPath) {
	return IMAGE_MIME[path.posix.extname(String(relPath).toLowerCase())] || "application/octet-stream";
}

/** Recursively list image files under a whitelisted directory (read-only; used by the image page). */
export async function listImages(rawDir, options) {
	const opts = options || {};
	const maxDepth = Number.isInteger(opts.maxDepth) ? opts.maxDepth : 6;
	const limit = Number.isInteger(opts.limit) ? opts.limit : 1000;
	const dir = resolveDir(rawDir, LIST_DIRS, "public");
	const out = [];
	async function walk(absDir, depth) {
		if (out.length >= limit || depth > maxDepth) return;
		let entries;
		try {
			entries = await fs.readdir(absDir, { withFileTypes: true });
		} catch (err) {
			if (err.code === "ENOENT") return;
			throw err;
		}
		entries.sort((a, b) => a.name.localeCompare(b.name));
		for (const entry of entries) {
			if (out.length >= limit) return;
			const abs = path.join(absDir, entry.name);
			if (entry.isDirectory()) {
				if (IMAGE_SKIP_DIRS.has(entry.name)) continue;
				await walk(abs, depth + 1);
				continue;
			}
			if (!entry.isFile()) continue;
			const repoRel = rel(abs);
			if (!isImagePath(repoRel)) continue;
			const stat = await fs.stat(abs);
			out.push({ name: entry.name, path: repoRel, bytes: stat.size });
		}
	}
	await walk(fromRoot(dir), 0);
	return out;
}

export async function listDir(rawDir) {
	const dir = resolveDir(rawDir, LIST_DIRS, "public");
	const abs = fromRoot(dir);
	let entries;
	try {
		entries = await fs.readdir(abs, { withFileTypes: true });
	} catch (err) {
		if (err.code === "ENOENT") return [];
		throw err;
	}
	const out = [];
	for (const entry of entries) {
		if (!entry.isFile()) continue;
		const target = path.join(abs, entry.name);
		const stat = await fs.stat(target);
		out.push({ name: entry.name, path: rel(target), bytes: stat.size });
	}
	out.sort((a, b) => a.name.localeCompare(b.name));
	return out;
}
