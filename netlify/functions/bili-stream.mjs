// GET /api/bili-stream?bvid=BVxxxxxxxxxx
// 音频字节的同源转发口：解析出 B 站直链后，带上 `Referer: https://www.bilibili.com/`
// 把上游响应（含 Range 的 206）原样流回浏览器。浏览器自己发不出这个 Referer，
// 所以直连 CDN 会被 403——这也是这个函数存在的唯一理由。
//
// 用 Netlify Functions v2（Web API 签名）而不是 v1：v1 只能返回打包好的字符串，
// 2–8MB 的音频会撞上响应体积上限，而 v2 可以直接返回 ReadableStream。

import { fetchUpstream, resolveCached } from "./lib/bili-playurl.mjs";

const BVID = /^BV[0-9A-Za-z]{10}$/;
const FORWARDED = ["content-type", "content-length", "content-range", "accept-ranges", "last-modified", "etag"];

export default async function handler(req) {
	const bvid = (new URL(req.url).searchParams.get("bvid") ?? "").trim();
	if (!BVID.test(bvid)) return new Response("invalid bvid", { status: 400 });

	// 部分 B 站 CDN 对不带 Range 的请求回 567（防盗链），所以没 Range 时自己补一条全网段的。
	const range = req.headers.get("range") ?? "bytes=0-";
	let upstream;
	try {
		const track = await resolveCached(bvid);
		upstream = await fetchUpstream(track, range);
	} catch (error) {
		console.error("[bili-stream]", error);
		const reason = error instanceof Error ? error.message : String(error);
		return new Response(`upstream unavailable: ${reason}`, { status: 502 });
	}

	// 客户端没要 Range 时上游那 206 是补出来的，对客户端要还原成 200。
	const answeredRange = Boolean(req.headers.get("range"));
	const headers = new Headers();
	for (const name of FORWARDED) {
		if (!answeredRange && (name === "content-range" || name === "content-length")) continue;
		const value = upstream.headers.get(name);
		if (value) headers.set(name, value);
	}
	// 直链两小时就换，浏览器缓存太久会拿着过期链接反复失败。
	headers.set("cache-control", "private, max-age=600");

	return new Response(upstream.body, { status: answeredRange ? upstream.status : 200, headers });
}
