// ============================================================================
// 浏览器端解密工具
// ============================================================================
// 与 scripts/encrypt-post.mjs 的加密方案配套：
//   PBKDF2-SHA256 (210000 轮) 派生密钥 -> AES-256-GCM 解密
// 密码只在浏览器内使用，不会发送到任何服务器。
// ============================================================================
export type EncryptedPayload = {
	v: number;
	alg: string;
	kdf: string;
	iterations: number;
	salt: string;
	iv: string;
	ct: string;
};

const ITERATIONS_FALLBACK = 210_000;
const GCM_TAG_BYTES = 16;
const SESSION_PREFIX = "encrypted-payload:";

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
	const binary = atob(b64);
	// Backed by a plain ArrayBuffer so the result satisfies WebCrypto's BufferSource.
	const bytes = new Uint8Array(new ArrayBuffer(binary.length));
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

async function deriveKey(
	password: string,
	salt: Uint8Array<ArrayBuffer>,
	iterations: number,
): Promise<CryptoKey> {
	const baseKey = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		"PBKDF2",
		false,
		["deriveKey"],
	);
	return crypto.subtle.deriveKey(
		{ name: "PBKDF2", salt, iterations, hash: "SHA-256" },
		baseKey,
		{ name: "AES-GCM", length: 256 },
		false,
		["decrypt"],
	);
}

/**
 * 解密载荷。密码错误时 AES-GCM 的认证标签校验会抛错，
 * 因此无需单独存储密码哈希。
 */
export async function decryptPayload(
	payload: EncryptedPayload,
	password: string,
): Promise<string> {
	const salt = fromBase64(payload.salt);
	const iv = fromBase64(payload.iv);
	// `ct` already holds ciphertext followed by the 16-byte GCM auth tag.
	const data = fromBase64(payload.ct);
	const iterations = payload.iterations ?? ITERATIONS_FALLBACK;

	const key = await deriveKey(password, salt, iterations);

	const plaintext = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv, tagLength: GCM_TAG_BYTES * 8 },
		key,
		data,
	);
	return new TextDecoder().decode(plaintext);
}

const payloadCache = new Map<string, EncryptedPayload>();

/** 从 /encrypted/ 取回密文载荷（带内存缓存） */
export async function loadEncryptedPayload(
	name: string,
): Promise<EncryptedPayload> {
	const cached = payloadCache.get(name);
	if (cached) return cached;

	const res = await fetch(`/encrypted/${name}.enc`, { cache: "force-cache" });
	if (!res.ok) throw new Error(`encrypted payload not found: ${name}`);
	const json = (await res.json()) as EncryptedPayload;
	payloadCache.set(name, json);
	return json;
}

/** 记住同一会话内已解锁的密码，便于刷新后自动解锁 */
export function rememberPassword(name: string, password: string): void {
	try {
		sessionStorage.setItem(SESSION_PREFIX + name, password);
	} catch {
		/* 隐私模式下 sessionStorage 可能不可用 */
	}
}

export function recallPassword(name: string): string | null {
	try {
		return sessionStorage.getItem(SESSION_PREFIX + name);
	} catch {
		return null;
	}
}
