// biome-ignore lint/suspicious/noShadowRestrictedNames: <toString from mdast-util-to-string>
import { toString } from "mdast-util-to-string";
import getReadingTime from "reading-time";

export function remarkReadingTime() {
	return (tree, { data }) => {
		const frontmatter = data.astro.frontmatter;
		// 加密文章的正文在仓库里只是一行占位注释，对它算字数只会得到那行注释
		// 的词数（恒为 8）。真实统计由 scripts/encrypt-post.mjs 从明文写进
		// frontmatter，这里必须跳过，否则会把真实数字覆盖掉。
		if (
			frontmatter.encrypted === true &&
			typeof frontmatter.words === "number"
		) {
			return;
		}
		const textOnPage = toString(tree);
		const readingTime = getReadingTime(textOnPage);
		frontmatter.minutes = Math.max(1, Math.round(readingTime.minutes));
		frontmatter.words = readingTime.words;
	};
}
