// B 站音频直链解析：Netlify Function 与 astro dev 的小服务共用同一份实现。
//
// 匿名调用 wbi 签名的 playurl 就能拿到 DASH 音频轨，但直链不能直接塞给浏览器：
// upos-sz-*.bilivideo.com 要求请求带 `Referer: https://www.bilibili.com/`，否则 403，
// 而浏览器里的 <audio> / fetch 无论如何都发不出这个头。所以音频字节必须经我们自己的
// 同源接口（/api/bili-stream）转发，转发时补上 Referer——见 bili-stream.mjs。
//
// 直链带 deadline 参数，约两小时失效，所以结果按过期时间缓存，过期后重新签名。

import { createHash } from "node:crypto";

export const BILI_UA =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
export const BILI_REFERER = "https://www.bilibili.com/";

// wbi 签名用的固定混淆表（B 站前端同一份）
const MIXIN_KEY_ENC_TAB = [
	46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38,
	41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36,
	20, 34, 44, 52,
];

const WBI_KEY_TTL = 30 * 60 * 1000;

let wbiKeys = { imgKey: "", subKey: "", expireAt: 0 };
/** @type {Map<string, { url: string, backups: string[], quality: { id: number, kbps: number }, expireAt: number }>} */
const urlCache = new Map();

async function getJson(url) {
	const res = await fetch(url, {
		headers: { "User-Agent": BILI_UA, Referer: BILI_REFERER, Accept: "application/json" },
	});
	if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
	return res.json();
}

async function loadWbiKeys() {
	if (wbiKeys.expireAt > Date.now()) return wbiKeys;
	const nav = await getJson("https://api.bilibili.com/x/web-interface/nav");
	const img = nav?.data?.wbi_img?.img_url;
	const sub = nav?.data?.wbi_img?.sub_url;
	if (!img || !sub) throw new Error("nav 接口没有返回 wbi_img");
	const keyOf = (u) => u.split("/").pop().split(".")[0];
	wbiKeys = {
		imgKey: keyOf(img),
		subKey: keyOf(sub),
		expireAt: Date.now() + WBI_KEY_TTL,
	};
	return wbiKeys;
}

function wbiSign(params, imgKey, subKey) {
	const raw = imgKey + subKey;
	const mixinKey = MIXIN_KEY_ENC_TAB.map((i) => raw[i]).join("").slice(0, 32);
	const all = { ...params, wts: Math.floor(Date.now() / 1000) };
	const query = Object.keys(all)
		.sort()
		.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(all[k]).replace(/[!'()*]/g, ""))}`)
		.join("&");
	return `${query}&w_rid=${md5(query + mixinKey)}`;
}

function md5(text) {
	return createHash("md5").update(text).digest("hex");
}

export async function resolveAudioUrl(bvid) {
	const { imgKey, subKey } = await loadWbiKeys();

	const pagelist = await getJson(`https://api.bilibili.com/x/player/pagelist?bvid=${encodeURIComponent(bvid)}`);
	const cid = pagelist?.data?.[0]?.cid;
	if (!cid) throw new Error(`bvid ${bvid} 没有分 P`);

	const query = wbiSign({ bvid, cid, fnval: 16, fnver: 0, fourk: 1 }, imgKey, subKey);
	const playurl = await getJson(`https://api.bilibili.com/x/player/wbi/playurl?${query}`);
	if (playurl?.code !== 0) throw new Error(`playurl ${playurl?.code}: ${playurl?.message ?? "unknown"}`);

	const tracks = [...(playurl?.data?.dash?.audio ?? [])].sort((a, b) => b.bandwidth - a.bandwidth);
	if (!tracks.length) throw new Error("playurl 没有返回音频轨");

	// 候选按码率降序，转发时优先用第一条能拿到字节的。探活带上转发用的同一套头
	// （UA + Referer），否则会误判成不可用。
	const candidates = tracks.flatMap((track) =>
		[track.baseUrl, ...(track.backupUrl ?? [])].filter(Boolean).map((url) => ({
			url,
			quality: { id: track.id, kbps: Math.round(track.bandwidth / 1000) },
		})),
	);
	const playable = await Promise.all(candidates.map((c) => isPlayable(c.url)));
	const index = playable.findIndex(Boolean);
	if (index < 0) throw new Error("所有音频 CDN 都拒绝带 Referer 的请求");

	const chosen = candidates[index];
	const deadline = Number(new URL(chosen.url).searchParams.get("deadline") ?? 0);
	return {
		url: chosen.url,
		backups: candidates.filter((_, i) => i !== index).map((c) => c.url),
		quality: chosen.quality,
		expireAt: deadline ? deadline * 1000 : Date.now() + 60 * 60 * 1000,
	};
}

/** 探活：拿 1 字节 Range，带上转发时同样的 Referer，能回 200/206 才算可用。 */
async function isPlayable(url) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 5000);
	try {
		const res = await fetch(url, {
			headers: { "User-Agent": BILI_UA, Referer: BILI_REFERER, Range: "bytes=0-1" },
			signal: controller.signal,
		});
		return res.status === 200 || res.status === 206;
	} catch {
		return false;
	} finally {
		clearTimeout(timer);
	}
}

/** 带缓存的解析：直链有效期内直接复用，避免每次点歌都签一次。 */
export async function resolveCached(bvid) {
	const hit = urlCache.get(bvid);
	if (hit && hit.expireAt - 5 * 60 * 1000 > Date.now()) return hit;
	const fresh = await resolveAudioUrl(bvid);
	urlCache.set(bvid, fresh);
	return fresh;
}

/** 上游只给了响应头就返回；超时只卡"等到响应头"这一段，之后的身体照常流式读。 */
const UPSTREAM_HEADER_TIMEOUT = 10_000;
const UPSTREAM_TOTAL_BUDGET = 18_000;

/** 依次尝试主直链和备用直链，返回第一个能取到字节的上游响应。 */
export async function fetchUpstream(track, range) {
	const headers = { "User-Agent": BILI_UA, Referer: BILI_REFERER };
	if (range) headers.Range = range;
	let lastError;
	// 备用链依次试，但总时间要有上限：每首最多等 18 秒，不能让浏览器干等到自己超时。
	const deadline = Date.now() + UPSTREAM_TOTAL_BUDGET;
	for (const url of [track.url, ...track.backups]) {
		if (Date.now() > deadline) break;
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), UPSTREAM_HEADER_TIMEOUT);
		try {
			// 定时器在拿到响应头后就清掉，否则它会在中途掐断还在传输的身体。
			const res = await fetch(url, { headers, signal: controller.signal });
			clearTimeout(timer);
			if (res.status === 200 || res.status === 206) return res;
			lastError = new Error(`HTTP ${res.status}`);
		} catch (error) {
			clearTimeout(timer);
			lastError = error;
		}
	}
	throw lastError ?? new Error("没有可用的音频 CDN");
}
