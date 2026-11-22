// `astro dev` 里没有 Netlify Functions。Astro 7 的 dev 请求链不经过集成注册的中间件
// （也不会应用 vite.server.proxy），所以这里单独起一个只绑定本机的小 HTTP 服务，
// 播放器直连 `http://127.0.0.1:4399/api/bili-stream`。
// 解析与转发复用 Netlify Function 用的同一份实现。

import { createServer, get as httpGet } from "node:http";
import { get as httpsGet } from "node:https";
import {
	BILI_REFERER,
	BILI_UA,
	resolveCached,
} from "../../netlify/functions/lib/bili-playurl.mjs";

export const BILI_DEV_PORT = 4399;

const ENDPOINT = "/api/bili-stream";
const BVID = /^BV[0-9A-Za-z]{10}$/;
const FORWARDED = [
	"content-type",
	"content-length",
	"content-range",
	"accept-ranges",
	"last-modified",
	"etag",
];

/** 带 Referer 转发上游字节，保留 Range/206 语义。 */
function pipeAudio(target, range, res) {
	const url = new URL(target);
	const get = url.protocol === "https:" ? httpsGet : httpGet;
	const headers = { "user-agent": BILI_UA, referer: BILI_REFERER };
	if (range) headers.range = range;

	const upstream = get(url, { headers }, (up) => {
		if (up.statusCode !== 200 && up.statusCode !== 206) {
			up.resume();
			res.statusCode = 502;
			res.end("upstream refused");
			return;
		}
		res.statusCode = up.statusCode;
		for (const name of FORWARDED) {
			const value = up.headers[name];
			if (value) res.setHeader(name, value);
		}
		res.setHeader("cache-control", "private, max-age=600");
		up.pipe(res);
	});
	upstream.on("error", () => {
		res.statusCode = 502;
		res.end("upstream error");
	});
}

export function biliStreamDev() {
	/** @type {import("node:http").Server | undefined} */
	let aux;

	return {
		name: "bili-stream-dev",
		hooks: {
			"astro:server:setup": () => {
				aux = createServer(async (req, res) => {
					const url = new URL(req.url ?? "/", "http://127.0.0.1");
					if (url.pathname !== ENDPOINT) {
						res.statusCode = 404;
						res.setHeader("content-type", "application/json; charset=utf-8");
						res.end(JSON.stringify({ error: "not found" }));
						return;
					}

					const bvid = (url.searchParams.get("bvid") ?? "").trim();
					if (!BVID.test(bvid)) {
						res.statusCode = 400;
						res.end("invalid bvid");
						return;
					}

					try {
						const track = await resolveCached(bvid);
						pipeAudio(track.url, req.headers.range, res);
					} catch (error) {
						console.error("[bili-stream-dev]", error);
						res.statusCode = 502;
						res.end("upstream unavailable");
					}
				});
				// 改配置时 Astro 会就地重启，旧实例的端口未必已经释放；占用了就只警告，
				// 不要让整个 dev 服务器跟着崩。
				aux.on("error", (error) => {
					console.warn(
						`[bili-stream-dev] 127.0.0.1:${BILI_DEV_PORT} 不可用：${error?.code ?? error}`,
					);
				});
				aux.listen(BILI_DEV_PORT, "127.0.0.1");
			},
			"astro:server:done": () => {
				aux?.closeAllConnections?.();
				aux?.close();
			},
		},
	};
}
