// 所有 HTTP 访问的唯一出口：页面内的 fetch 只出现在这里。
// 端点集合严格来自 launcher/CONTRACT.md 的 "Endpoint surface"。

const BASE = "/api";

/** URL of a repo-relative image, served read-only by GET /api/media. */
export function mediaUrl(repoPath) {
	return BASE + "/media?path=" + encodeURIComponent(String(repoPath ?? ""));
}

export class ApiError extends Error {
	constructor(code, message, details, status) {
		super(message);
		this.name = "ApiError";
		this.code = code;
		this.details = details === undefined ? null : details;
		this.status = status;
	}
}

const PATHS = {
	config: "/config",
	configSchema: "/config/schema",
	configPatch: "/config/patch",
	data: function (name) {
		return "/data/" + encodeURIComponent(name);
	},
	collections: "/content/collections",
	collection: function (key) {
		return "/content/" + encodeURIComponent(key);
	},
	article: function (key, slug) {
		return "/content/" + encodeURIComponent(key) + "/" + encodeURIComponent(slug);
	},
	archive: function (key, slug) {
		return "/content/" + encodeURIComponent(key) + "/" + encodeURIComponent(slug) + "/archive";
	},
	contentPreview: "/content/preview",
	contentEncrypt: "/content/encrypt",
	upload: "/upload",
	files: function (dir) {
		return "/files?dir=" + encodeURIComponent(dir);
	},
	filesImages: function (dir) {
		return "/files/images?dir=" + encodeURIComponent(dir);
	},
	backups: "/backups",
	backupRestore: function (id) {
		return "/backups/" + encodeURIComponent(id) + "/restore";
	},
	deployStatus: "/deploy/status",
	deployDiff: function (path) {
		return "/deploy/diff?path=" + encodeURIComponent(path);
	},
	deployCommit: "/deploy/commit",
	deployPush: "/deploy/push",
	uiSettings: "/ui-settings",
	previewStatus: "/preview/status",
	previewStart: "/preview/start",
	previewStop: "/preview/stop"
};

async function request(method, path, options) {
	const opts = options || {};
	const headers = Object.assign({}, opts.headers || {});
	const init = { method: method, headers: headers };
	if (opts.json !== undefined) {
		headers["content-type"] = "application/json; charset=utf-8";
		init.body = JSON.stringify(opts.json);
	} else if (opts.body !== undefined) {
		init.body = opts.body;
	}
	let response;
	try {
		response = await fetch(BASE + path, init);
	} catch (error) {
		throw new ApiError("network-error", "无法连接本地服务（" + error.message + "）", null, 0);
	}
	const type = response.headers.get("content-type") || "";
	let payload = null;
	if (type.indexOf("application/json") !== -1) {
		try {
			payload = await response.json();
		} catch (error) {
			throw new ApiError("invalid-json", "服务端返回了无法解析的 JSON", null, response.status);
		}
	}
	if (!response.ok || payload === null || payload.ok !== true) {
		const detail = (payload && payload.error) || {};
		const code = detail.code || (response.ok ? "invalid-envelope" : "http-" + response.status);
		const message = detail.message || ("请求失败：" + method + " " + BASE + path + " 返回 " + response.status);
		throw new ApiError(code, message, detail.details, response.status);
	}
	return payload.data;
}

export const api = {
	getConfig: function () {
		return request("GET", PATHS.config);
	},
	getConfigSchema: function () {
		return request("GET", PATHS.configSchema);
	},
	patchConfig: function (edits, dryRun) {
		const body = { edits: edits };
		if (dryRun) body.dryRun = true;
		return request("POST", PATHS.configPatch, { json: body });
	},
	getData: function (name) {
		return request("GET", PATHS.data(name));
	},
	putData: function (name, document) {
		return request("PUT", PATHS.data(name), { json: document });
	},
	getCollections: function () {
		return request("GET", PATHS.collections);
	},
	getCollection: function (key) {
		return request("GET", PATHS.collection(key));
	},
	getArticle: function (key, slug) {
		return request("GET", PATHS.article(key, slug));
	},
	createArticle: function (key, payload) {
		return request("POST", PATHS.collection(key), { json: payload });
	},
	updateArticle: function (key, slug, payload) {
		return request("PUT", PATHS.article(key, slug), { json: payload });
	},
	archiveArticle: function (key, slug) {
		return request("POST", PATHS.archive(key, slug), { json: {} });
	},
	previewMarkdown: function (body) {
		return request("POST", PATHS.contentPreview, { json: { body: body } });
	},
	encrypt: function (payload) {
		return request("POST", PATHS.contentEncrypt, { json: payload });
	},
	upload: function (file, dir) {
		return request("POST", PATHS.upload, {
			body: file,
			headers: {
				"content-type": "application/octet-stream",
				"x-filename": encodeURIComponent(file.name),
				"x-dir": dir
			}
		});
	},
	listFiles: function (dir) {
		return request("GET", PATHS.files(dir));
	},
	listImages: function (dir) {
		return request("GET", PATHS.filesImages(dir));
	},
	getBackups: function () {
		return request("GET", PATHS.backups);
	},
	restoreBackup: function (id) {
		return request("POST", PATHS.backupRestore(id), { json: {} });
	},
	getDeployStatus: function () {
		return request("GET", PATHS.deployStatus);
	},
	getDeployDiff: function (path) {
		return request("GET", PATHS.deployDiff(path));
	},
	commit: function (payload) {
		return request("POST", PATHS.deployCommit, { json: payload });
	},
	push: function () {
		return request("POST", PATHS.deployPush, { json: {} });
	},
	getUiSettings: function () {
		return request("GET", PATHS.uiSettings);
	},
	saveUiSettings: function (payload) {
		return request("PUT", PATHS.uiSettings, { json: payload });
	},
	getPreviewStatus: function () {
		return request("GET", PATHS.previewStatus);
	},
	startPreview: function () {
		return request("POST", PATHS.previewStart, { json: {} });
	},
	stopPreview: function () {
		return request("POST", PATHS.previewStop, { json: {} });
	}
};
