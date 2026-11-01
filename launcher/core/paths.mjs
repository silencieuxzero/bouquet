import path from "node:path";
import { fileURLToPath } from "node:url";
import { FailError } from "./http.mjs";

/** Absolute path of the repository root (E:/fuwari). */
export const ROOT = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));

/** Runtime state directory (backups, trash, logs). */
export const STATE_DIR_REL = ".launcher";

/** Static UI directory, served for every non-/api GET. */
export const UI_DIR = path.join(ROOT, "launcher", "ui");

/** Directories the upload endpoint may write into, repo-relative. */
export const UPLOAD_DIRS = ["public", "public/music", "public/favicon", "src/assets/images"];

/** Directories GET /api/files may list (read-only); uploads stay limited to UPLOAD_DIRS.
 * private/source is the plaintext source of encrypted posts (gitignored), so the encrypt panel can show which slugs are readable. */
export const LIST_DIRS = UPLOAD_DIRS.concat(["private/source"]);

const WINDOWS = process.platform === "win32";

function fold(value) {
	return WINDOWS ? value.toLowerCase() : value;
}

export function isInside(abs) {
	const target = fold(path.resolve(abs));
	const base = fold(ROOT);
	return target === base || target.startsWith(base + path.sep) || target.startsWith(base + "/");
}

/** Resolve a repo-relative path and refuse anything outside ROOT. */
export function fromRoot(relPath) {
	if (typeof relPath !== "string" || relPath.trim() === "") {
		throw new FailError(400, "path-invalid", "path must be a non-empty string");
	}
	if (relPath.includes("\0")) {
		throw new FailError(400, "path-invalid", "path contains a NUL byte");
	}
	const abs = path.resolve(ROOT, relPath);
	assertInside(abs);
	return abs;
}

/** Repo-relative form of an absolute path, forward slashes. */
export function rel(abs) {
	return path.relative(ROOT, path.resolve(abs)).split(path.sep).join("/");
}

/** Throw unless the absolute path stays inside ROOT. Returns the resolved path. */
export function assertInside(abs) {
	if (typeof abs !== "string" || abs.trim() === "") {
		throw new FailError(400, "path-invalid", "path must be a non-empty string");
	}
	const target = path.resolve(abs);
	if (!isInside(target)) {
		throw new FailError(400, "path-outside", "path escapes the repository root: " + target);
	}
	return target;
}

/** Absolute path under .launcher/. */
export function fromState(relPath) {
	return fromRoot(path.posix.join(STATE_DIR_REL, relPath));
}
