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
// ============================================================================
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { encryptText } from "./lib/encrypt.mjs";
import { resolvePassword } from "./lib/password.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = path.join(ROOT, "private", "source");
const OUT_DIR = path.join(ROOT, "public", "encrypted");

async function main() {
	const slugs = process.argv.slice(2).filter((a) => !a.startsWith("-"));
	if (slugs.length === 0) {
		console.error(
			"用法: node scripts/encrypt-post.mjs <slug> [<slug> ...]\n" +
				"例如: POST_PASSWORD=... node scripts/encrypt-post.mjs personoc yanchui story-4 story-br luoshulv-bc",
		);
		process.exitCode = 1;
		return;
	}

	const password = await resolvePassword();
	await fs.mkdir(OUT_DIR, { recursive: true });

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
