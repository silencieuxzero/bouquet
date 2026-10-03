import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";

export function pathsEqual(path1: string, path2: string): boolean {
	const normalizedPath1 = path1.replace(/^\/|\/$/g, "").toLowerCase();
	const normalizedPath2 = path2.replace(/^\/|\/$/g, "").toLowerCase();
	return normalizedPath1 === normalizedPath2;
}

function joinUrl(...parts: string[]): string {
	const joined = parts.join("/");
	return joined.replace(/\/+/g, "/");
}

export function getPostUrlBySlug(slug: string): string {
	return url(`/posts/${slug}/`);
}

export function getNoteUrlBySlug(slug: string): string {
	return url(`/notes/${slug}/`);
}

export function getTagUrl(tag: string): string {
	if (!tag) return url("/archive/");
	// Per-name detail page (src/pages/tags/[tag].astro). The page also keeps
	// the 18 legacy taxonomy URLs alive.
	return url(`/tags/${encodeURIComponent(tag.trim())}/`);
}

export function getCategoryUrl(category: string | null): string {
	if (
		!category ||
		category.trim() === "" ||
		category.trim().toLowerCase() === i18n(I18nKey.uncategorized).toLowerCase()
	)
		return url("/archive/?uncategorized=true");
	// Per-name detail page (src/pages/categories/[category].astro).
	return url(`/categories/${encodeURIComponent(category.trim())}/`);
}

export function getDir(path: string): string {
	const lastSlashIndex = path.lastIndexOf("/");
	if (lastSlashIndex < 0) {
		return "/";
	}
	return path.substring(0, lastSlashIndex + 1);
}

/**
 * Resolve the `basePath` used to load a post's local assets (e.g. its cover).
 *
 * Content Layer ids drop the trailing `/index`, so an entry's id is no longer a
 * usable directory. `filePath` (root-relative, POSIX) still carries the real
 * location, e.g. `src/content/posts/guide/index.md` -> `content/posts/guide/`.
 */
export function getPostAssetBasePath(filePath: string | undefined): string {
	if (!filePath) return "content/posts/";
	const lastSlashIndex = filePath.lastIndexOf("/");
	const dir =
		lastSlashIndex < 0 ? "" : filePath.substring(0, lastSlashIndex + 1);
	return dir.replace(/^src\//, "");
}

export function url(path: string): string {
	return joinUrl("", import.meta.env.BASE_URL, path);
}
