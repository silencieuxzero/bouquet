// ============================================================================
// 加密任意数据文件
// ============================================================================
// 用法:
//   node scripts/encrypt-file.mjs <相对路径> [<相对路径> ...]
//   POST_PASSWORD=xxx node scripts/encrypt-file.mjs src/data/sub-gallery.json
//
// 明文来自仓库内的任意文件，密文写入 public/encrypted/<basename>.enc。
// 用于子画廊图片列表等不适合直接公开的数据。
// ============================================================================
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { encryptText } from "./lib/encrypt.mjs";
import { resolvePassword } from "./lib/password.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "encrypted");

/** 输出名去掉扩展名，例如 src/data/sub-gallery.json -> sub-gallery.enc */
function outName(relPath) {
	return path.basename(relPath).replace(/\.[^.]+$/, "");
}

async function main() {
	const inputs = process.argv.slice(2).filter((a) => !a.startsWith("-"));
	if (inputs.length === 0) {
		console.error(
			"用法: node scripts/encrypt-file.mjs <相对路径> [<相对路径> ...]\n" +
				"例如: POST_PASSWORD=... node scripts/encrypt-file.mjs src/data/sub-gallery.json",
		);
		process.exitCode = 1;
		return;
	}

	const password = await resolvePassword();
	await fs.mkdir(OUT_DIR, { recursive: true });

	for (const rel of inputs) {
		const sourcePath = path.resolve(ROOT, rel);
		let plaintext;
		try {
			plaintext = await fs.readFile(sourcePath, "utf8");
		} catch {
			console.error(`[跳过] 找不到文件: ${sourcePath}`);
			process.exitCode = 1;
			continue;
		}

		const payload = await encryptText(plaintext, password);
		const outPath = path.join(OUT_DIR, `${outName(rel)}.enc`);
		await fs.writeFile(outPath, JSON.stringify(payload), "utf8");
		console.log(
			`[完成] ${rel}: ${plaintext.length} 字符 -> ${path.relative(ROOT, outPath)}`,
		);
	}
}

main().catch((err) => {
	console.error(err.message ?? err);
	process.exitCode = 1;
});
