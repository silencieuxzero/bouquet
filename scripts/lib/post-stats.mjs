// ============================================================================
// 加密文章的字数 / 阅读时间统计
// ============================================================================
// 加密文章的 src/content/posts/<slug>.md 正文只剩一行占位注释，构建时
// remarkReadingTime 只能数出那行注释的词数（恒为 8），与真实篇幅无关。
// 真实字数只能从明文 private/source/<slug>.md 取得，由本模块写进该文章
// frontmatter 的 words / minutes 字段，再由 remark-reading-time 跳过重算。
//
// 明文只存在于本地且被 .gitignore 忽略，因此这一步不需要密码。
//
// 用法：
//   node scripts/encrypt-post.mjs <slug> [...] --stats-only   # 只刷新统计
// ============================================================================
import fs from "node:fs/promises";
import getReadingTime from "reading-time";

const STATS_KEYS = ["words", "minutes"];

/** 从明文正文算出与 remark-reading-time.mjs 一致的 words / minutes。 */
export function computeStats(plaintext) {
	const readingTime = getReadingTime(plaintext);
	return {
		words: readingTime.words,
		// 与 remark-reading-time 保持一致：不足 1 分钟按 1 分钟计
		minutes: Math.max(1, Math.round(readingTime.minutes)),
	};
}

/**
 * 把统计写进 <slug>.md 的 frontmatter，已存在的同名字段会被替换。
 * 只做定点文本替换：不引入 YAML 依赖，也不重排原有字段的顺序与格式。
 */
export async function writePostStats(postPath, stats) {
	const raw = await fs.readFile(postPath, "utf8");
	// 跟随文件自身换行；.gitattributes 规定仓库内统一 LF
	const eol = raw.includes("\r\n") ? "\r\n" : "\n";
	const match = raw.match(
		/^(---\r?\n)([\s\S]*?)(\r?\n---(?=\r?\n|$))([\s\S]*)$/,
	);
	if (!match) {
		throw new Error(`未找到 frontmatter: ${postPath}`);
	}

	// 第 4 组是闭合 --- 之后的全部内容（空行 + 正文），重建时必须原样接回，
	// 只重建 frontmatter 会把正文整段截掉。
	const [, open, body, close, rest] = match;
	const kept = body
		.split(/\r?\n/)
		.filter(
			(line) =>
				!STATS_KEYS.some((key) => new RegExp(`^\\s*${key}\\s*:`).test(line)),
		);

	kept.push(`words: ${stats.words}`, `minutes: ${stats.minutes}`);
	await fs.writeFile(
		postPath,
		`${open}${kept.join(eol)}${close}${rest}`,
		"utf8",
	);
}
