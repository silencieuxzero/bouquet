import rss from "@astrojs/rss";
import {
	getSortedNotes,
	getSortedOcs,
	getSortedPosts,
} from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

const parser = new MarkdownIt();

function stripInvalidXmlChars(str: string): string {
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

/**
 * Notes and OC settings are separate collections, but they belong in the same
 * feed — the published content of this site is posts + notes + oc, and
 * `/notes/<slug>/` and `/settings/<slug>/` are real pages. Items are built with
 * each collection's own URL shape so a note or a setting can never be emitted
 * under `/posts/`.
 */
function rssContent(body: unknown): string {
	const content = typeof body === "string" ? body : String(body || "");
	return sanitizeHtml(parser.render(stripInvalidXmlChars(content)), {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
	});
}

export async function GET(context: APIContext): Promise<Response> {
	const [blog, notes, ocs] = await Promise.all([
		getSortedPosts(),
		getSortedNotes(),
		getSortedOcs(),
	]);

	const postItems = blog.map((post) => ({
		title: post.data.title,
		pubDate: post.data.published,
		description: post.data.description || "",
		link: url(`/posts/${post.id}/`),
		content: rssContent(post.body),
	}));

	const noteItems = notes.map((note) => ({
		title: note.data.title,
		pubDate: note.data.published,
		description: note.data.description || "",
		link: url(`/notes/${note.id}/`),
		content: rssContent(note.body),
	}));

	// oc 集合的公开路由是 /settings/（集合键与路由刻意不同名），链接在这里拼。
	const ocItems = ocs.map((oc) => ({
		title: oc.data.title,
		pubDate: oc.data.published,
		description: oc.data.description || "",
		link: url(`/settings/${oc.id}/`),
		content: rssContent(oc.body),
	}));

	// @astrojs/rss emits items in the order given; merge newest-first so the feed
	// reads chronologically across all three collections.
	const items = [...postItems, ...noteItems, ...ocItems].sort(
		(a, b) =>
			new Date(b.pubDate as Date).getTime() -
			new Date(a.pubDate as Date).getTime(),
	);

	return rss({
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		site: context.site ?? "https://luoshulv.netlify.app/",
		items,
		customData: `<language>${siteConfig.lang}</language>`,
	});
}
