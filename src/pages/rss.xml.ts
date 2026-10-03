import rss from "@astrojs/rss";
import { getSortedNotes, getSortedPosts } from "@utils/content-utils";
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
 * Notes are a separate collection, but they belong in the same feed — the
 * published content of this site is posts + notes, and `/notes/<slug>/` is a
 * real page. Items are built with the collection's own URL helper so a note can
 * never be emitted under `/posts/`.
 */
function rssContent(body: unknown): string {
	const content = typeof body === "string" ? body : String(body || "");
	return sanitizeHtml(parser.render(stripInvalidXmlChars(content)), {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
	});
}

export async function GET(context: APIContext): Promise<Response> {
	const [blog, notes] = await Promise.all([
		getSortedPosts(),
		getSortedNotes(),
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

	// @astrojs/rss emits items in the order given; merge newest-first so the feed
	// reads chronologically across both collections.
	const items = [...postItems, ...noteItems].sort(
		(a, b) =>
			new Date(b.pubDate as Date).getTime() - new Date(a.pubDate as Date).getTime(),
	);

	return rss({
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		site: context.site ?? "https://luoshulv.netlify.app/",
		items,
		customData: `<language>${siteConfig.lang}</language>`,
	});
}
