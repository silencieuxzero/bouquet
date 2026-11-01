// 只负责 spawn 现有脚本 scripts/encrypt-post.mjs，不重实现任何加密逻辑。
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { ROOT } from "../core/paths.mjs";
import { ContentError } from "./collections.mjs";

export const SCRIPT_REL = "scripts/encrypt-post.mjs";
export const TIMEOUT_MS = 120_000;
export const CIPHER_DIR_REL = "public/encrypted";
const OUTPUT_LIMIT = 64 * 1024;

// frontmatter 的 encrypted 只是声明，真正的密文在这里；两者必须同时存在。
export function cipherFile(slug) {
	return path.join(ROOT, "public", "encrypted", slug + ".enc");
}

export async function cipherExists(slug) {
	try {
		await fs.stat(cipherFile(slug));
		return true;
	} catch (error) {
		if (error.code === "ENOENT") return false;
		throw error;
	}
}

function clip(text) {
	if (text.length <= OUTPUT_LIMIT) return text;
	return `${text.slice(0, OUTPUT_LIMIT)}\n…（输出已截断，共 ${text.length} 字符）`;
}

export function buildArgs(slugs, statsOnly = false) {
	const args = [SCRIPT_REL, ...slugs];
	if (statsOnly) args.push("--stats-only");
	return args;
}

export function runEncryption({ slugs = [], password, statsOnly = false } = {}) {
	if (!Array.isArray(slugs) || slugs.length === 0) {
		return Promise.reject(new ContentError(400, "invalid-slugs", "slugs 必须是非空数组"));
	}
	const args = buildArgs(slugs, statsOnly);
	const env = { ...process.env };
	if (typeof password === "string" && password !== "") env.POST_PASSWORD = password;
	return new Promise((resolve, reject) => {
		let stdout = "";
		let stderr = "";
		let settled = false;
		let timer = null;
		const finish = (error, result) => {
			if (settled) return;
			settled = true;
			if (timer) clearTimeout(timer);
			if (error) reject(error);
			else resolve(result);
		};
		let child;
		try {
			child = spawn(process.execPath, args, {
				cwd: ROOT,
				env,
				stdio: ["ignore", "pipe", "pipe"],
				windowsHide: true,
			});
		} catch (error) {
			finish(
				new ContentError(500, "encrypt-spawn-failed", "无法启动加密脚本", {
					message: error.message,
				}),
			);
			return;
		}
		timer = setTimeout(() => {
			try {
				child.kill("SIGKILL");
			} catch {
				/* 进程可能已退出 */
			}
			finish(
				new ContentError(409, "encrypt-failed", "加密脚本超时（120 秒）", {
					code: null,
					signal: "timeout",
					stdout: clip(stdout),
					stderr: clip(stderr),
					timedOut: true,
				}),
			);
		}, TIMEOUT_MS);
		child.stdout?.on("data", (chunk) => {
			if (stdout.length < OUTPUT_LIMIT * 2) stdout += chunk.toString("utf8");
		});
		child.stderr?.on("data", (chunk) => {
			if (stderr.length < OUTPUT_LIMIT * 2) stderr += chunk.toString("utf8");
		});
		child.on("error", (error) => {
			finish(
				new ContentError(500, "encrypt-spawn-failed", "无法启动加密脚本", {
					message: error.message,
				}),
			);
		});
		child.on("close", (code, signal) => {
			finish(null, {
				code: code ?? (signal ? 1 : 0),
				signal: signal ?? null,
				stdout: clip(stdout),
				stderr: clip(stderr),
			});
		});
	});
}
