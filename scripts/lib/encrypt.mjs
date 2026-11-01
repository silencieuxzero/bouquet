// ============================================================================
// 加密工具（Node 端）
// ============================================================================
// 供 scripts/encrypt-post.mjs 与 scripts/encrypt-file.mjs 共用的加密实现。
//
// 方案：PBKDF2-SHA256 (210000 轮) 派生密钥 -> AES-256-GCM
// 解密在浏览器端完成（见 src/utils/webcrypto.ts）。
// ============================================================================
import { createCipheriv, pbkdf2, randomBytes } from "node:crypto";

export const PBKDF2_ITERATIONS = 210_000;
export const KEY_LENGTH = 32;
export const SALT_LENGTH = 16;

/** 用 PBKDF2 从密码派生 AES 密钥 */
export function deriveKey(password, salt) {
	return new Promise((resolve, reject) => {
		pbkdf2(
			password,
			salt,
			PBKDF2_ITERATIONS,
			KEY_LENGTH,
			"sha256",
			(err, key) => (err ? reject(err) : resolve(key)),
		);
	});
}

/** 加密一段文本，返回可序列化的载荷 */
export async function encryptText(plaintext, password) {
	const salt = randomBytes(SALT_LENGTH);
	const iv = randomBytes(12);
	const key = await deriveKey(password, salt);

	const cipher = createCipheriv("aes-256-gcm", key, iv);
	const ciphertext = Buffer.concat([
		cipher.update(plaintext, "utf8"),
		cipher.final(),
	]);

	return {
		v: 1,
		alg: "AES-256-GCM",
		kdf: "PBKDF2-SHA256",
		iterations: PBKDF2_ITERATIONS,
		salt: salt.toString("base64"),
		iv: iv.toString("base64"),
		ct: Buffer.concat([ciphertext, cipher.getAuthTag()]).toString("base64"),
	};
}
