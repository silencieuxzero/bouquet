import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { ROOT, fromRoot, rel } from "./paths.mjs";
import { FailError } from "./http.mjs";

export const BACKUP_DIR = path.join(ROOT, ".launcher", "backups");
const ID_RE = /^[0-9A-Za-z._-]+$/;

function newId() {
	const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
	return stamp + "-" + crypto.randomBytes(3).toString("hex");
}

async function readManifest(id) {
	if (!ID_RE.test(id)) {
		throw new FailError(400, "backup-invalid", "invalid backup id: " + id);
	}
	const file = path.join(BACKUP_DIR, id, "manifest.json");
	let text;
	try {
		text = await fs.readFile(file, "utf8");
	} catch (err) {
		if (err.code === "ENOENT") {
			throw new FailError(404, "backup-not-found", "no backup with id " + id);
		}
		throw err;
	}
	try {
		return JSON.parse(text);
	} catch {
		throw new FailError(500, "backup-corrupt", "manifest is not valid JSON: " + id);
	}
}

/**
 * Snapshot repo-relative files into .launcher/backups/<id>/.
 * Missing files are skipped; nothing is created outside ROOT.
 */
export async function snapshot(relPaths, reason) {
	const wanted = Array.isArray(relPaths) ? relPaths : [relPaths];
	const unique = [...new Set(wanted.filter((p) => typeof p === "string" && p.trim() !== ""))];
	const id = newId();
	const dir = path.join(BACKUP_DIR, id);
	const files = [];
	for (const repoPath of unique) {
		const abs = fromRoot(repoPath);
		let buf;
		try {
			buf = await fs.readFile(abs);
		} catch (err) {
			if (err.code === "ENOENT") continue;
			throw err;
		}
		const repoRel = rel(abs);
		const mirror = path.join(dir, "files", repoRel);
		await fs.mkdir(path.dirname(mirror), { recursive: true });
		await fs.writeFile(mirror, buf);
		files.push({ path: repoRel, bytes: buf.length });
	}
	const manifest = {
		id,
		createdAt: new Date().toISOString(),
		reason: typeof reason === "string" ? reason : "",
		files,
	};
	await fs.mkdir(dir, { recursive: true });
	await fs.writeFile(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, "\t") + "\n", "utf8");
	return { id, files };
}

/** Newest first, at most `limit` entries. */
export async function listBackups(limit = 50) {
	let entries;
	try {
		entries = await fs.readdir(BACKUP_DIR, { withFileTypes: true });
	} catch (err) {
		if (err.code === "ENOENT") return [];
		throw err;
	}
	const out = [];
	for (const entry of entries) {
		if (!entry.isDirectory() || !ID_RE.test(entry.name)) continue;
		try {
			const manifest = await readManifest(entry.name);
			out.push({ id: manifest.id, createdAt: manifest.createdAt, files: manifest.files ?? [], reason: manifest.reason ?? "" });
		} catch {
			// A half-written or corrupt backup must not break the listing.
		}
	}
	out.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)) || String(b.id).localeCompare(String(a.id)));
	return out.slice(0, limit);
}

/** Restore every file of a snapshot, snapshotting the current content first. */
export async function restore(id) {
	const manifest = await readManifest(id);
	const paths = (manifest.files ?? []).map((f) => f.path);
	const guard = await snapshot(paths, "pre-restore " + id);
	const restored = [];
	for (const entry of manifest.files ?? []) {
		const source = path.join(BACKUP_DIR, id, "files", entry.path);
		const target = fromRoot(entry.path);
		const buf = await fs.readFile(source);
		await fs.mkdir(path.dirname(target), { recursive: true });
		await fs.writeFile(target, buf);
		restored.push(entry.path);
	}
	return { restored, backupId: guard.id };
}
