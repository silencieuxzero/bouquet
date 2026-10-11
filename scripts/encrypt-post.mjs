// ============================================================================
// 加密文章正文
// ============================================================================
// 用法:
//   node scripts/encrypt-post.mjs <slug> [<slug> ...]   # 交互式输入密码
//   POST_PASSWORD=xxx node scripts/encrypt-post.mjs <slug>
//
// 明文读取自 private/source/<slug>.md（已被 .gitignore 忽略），
// 密文写入 public/encrypted/<slug>.enc（可安全提交，也可安全公开分发）。
//
// 构建时无需密码：站点只分发密文，由浏览器在读者输入密码后解密。
//
// 每次处理都会顺带把明文的真实字数/阅读时间写进
// src/content/posts/<slug>.md 的 frontmatter（加密文章正文只剩占位注释，
// 构建时无法自行算出真实篇幅，详见 scripts/lib/post-stats.mjs）。
// 密文已是最新的、只想刷新统计时，用免密模式：
//   node scripts/encrypt-post.mjs <slug> [...] --stats-only
// ============================================================================
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { encryptText } from "./lib/encrypt.mjs";
import { resolvePassword } from "./lib/password.mjs";
import { computeStats, writePostStats } from "./lib/post-stats.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = path.join(ROOT, "private", "source");
const OUT_DIR = path.join(ROOT, "public", "encrypted");
const POSTS_DIR = path.join(ROOT, "src", "content", "posts");

async function main() {
	const args = process.argv.slice(2);
	const statsOnly = args.includes("--stats-only");
	const slugs = args.filter((a) => !a.startsWith("-"));
	if (slugs.length === 0) {
		console.error(
			"用法: node scripts/encrypt-post.mjs <slug> [<slug> ...] [--stats-only]\n" +
				"例如: POST_PASSWORD=... node scripts/encrypt-post.mjs personoc yanchui story-4 story-br luoshulv-bc",
		);
		process.exitCode = 1;
		return;
	}

	// --stats-only 只读明文刷新统计，不需要密码
	const password = statsOnly ? null : await resolvePassword();
	if (!statsOnly) {
		await fs.mkdir(OUT_DIR, { recursive: true });
	}

	for (const slug of slugs) {
		const sourcePath = path.join(SOURCE_DIR, `${slug}.md`);
		let plaintext;
		try {
			plaintext = await fs.readFile(sourcePath, "utf8");
		} catch {
			console.error(`[跳过] 找不到明文文件: ${sourcePath}`);
			process.exitCode = 1;
			continue;
		}

		// 先写统计：即使后面的加密步骤失败，frontmatter 也已与明文保持一致
		const stats = computeStats(plaintext);
		try {
			await writePostStats(path.join(POSTS_DIR, `${slug}.md`), stats);
			console.log(`[统计] ${slug}: ${stats.words} 字 / ${stats.minutes} 分钟`);
		} catch (err) {
			console.error(`[跳过统计] ${slug}: ${err.message}`);
			process.exitCode = 1;
		}

		if (statsOnly) {
			continue;
		}

		const payload = await encryptText(plaintext, password);
		const outPath = path.join(OUT_DIR, `${slug}.enc`);
		await fs.writeFile(outPath, JSON.stringify(payload), "utf8");
		console.log(
			`[完成] ${slug}: ${plaintext.length} 字符 -> ${path.relative(ROOT, outPath)}`,
		);
	}
}

main().catch((err) => {
	console.error(err.message ?? err);
	process.exitCode = 1;
});
