// 加密：slug 列表 + 密码 + statsOnly，调用 POST /api/content/encrypt 并展示 code/stdout/stderr；
// 同时列出 private/source 下的待加密明文与已加密文章，便于填 slug。
import { api } from "../api.mjs";
import { h, clear, field, textInput, textareaInput, checkboxRow, bytesText, wire, announce, errorBox } from "../components/dom.mjs";

export const views = [{ key: "encrypt", label: "加密", mount: mount }];

// 与其它加密文章保持一致的正文占位约定（scripts/encrypt-post.mjs 不会替你抹掉明文）。
function placeholderFor(slug) {
	return "\n<!-- Body is stored encrypted in /encrypted/" + slug + ".enc -->\n";
}

// 加密脚本成功后，按「明文仍未抹掉」的常见疏漏把正文换成占位注释；
// 密文缺失或未标记 encrypted 的 slug 一律跳过，绝不在没有密文时抹正文。
async function replaceBodies(slugs) {
	const collections = await api.getCollections();
	const done = [];
	const skipped = [];
	for (const slug of slugs) {
		let target = null;
		for (const collection of collections) {
			let items;
			try {
				items = await api.getCollection(collection.key);
			} catch (error) {
				continue;
			}
			const item = Array.isArray(items) ? items.find(function (entry) { return entry.slug === slug; }) : null;
			if (item) { target = { key: collection.key, item: item }; break; }
		}
		if (!target) { skipped.push(slug + "（找不到文章）"); continue; }
		if (!target.item.encrypted) { skipped.push(slug + "（frontmatter 未标记 encrypted）"); continue; }
		if (!target.item.cipherExists) { skipped.push(slug + "（密文仍缺失，未替换正文）"); continue; }
		try {
			await api.updateArticle(target.key, slug, { body: placeholderFor(slug) });
			done.push(target.key + "/" + slug);
		} catch (error) {
			skipped.push(slug + "（" + (error.code || error.message) + "）");
		}
	}
	return { done: done, skipped: skipped };
}

function renderReplaceSummary(summary) {
	const host = h("div", null, h("h4", null, "正文替换结果"));
	if (summary.done.length) host.append(h("p", { class: "notice" }, "已替换为占位注释：" + summary.done.join("、")));
	if (summary.skipped.length) host.append(h("p", { class: "error-box" }, "未替换：" + summary.skipped.join("、")));
	return host;
}

function renderOutput(data) {
	if (!data || typeof data !== "object") return h("p", { class: "muted small" }, "没有输出。");
	return h("div", null,
		h("h4", null, "退出码 code：" + String(data.code === undefined ? "?" : data.code)),
		h("pre", { class: "output", tabindex: 0, "aria-label": "stdout" }, data.stdout ? String(data.stdout) : "（stdout 为空）"),
		h("pre", { class: "output", tabindex: 0, "aria-label": "stderr" }, data.stderr ? String(data.stderr) : "（stderr 为空）"));
}

async function mount(host) {
	const slugArea = textareaInput("", { rows: 6, class: "mono", placeholder: "story-br\npersonoc" });
	const password = textInput("", { password: true });
	const statsOnly = checkboxRow("只统计不写入（statsOnly）", false);
	const replaceBody = checkboxRow("加密成功后把正文替换为占位注释", false);
	const runButton = h("button", { type: "button", class: "primary" }, "执行加密");
	const runErrors = h("div");
	const runResult = h("div");

	wire(runButton, runErrors, async function () {
		clear(runResult);
		const slugs = slugArea.value.split(/[\n,]/).map(function (item) { return item.trim(); }).filter(function (item) { return item.length > 0; });
		const payload = { slugs: slugs, statsOnly: statsOnly.input.checked };
		if (password.value) payload.password = password.value;
		if (!slugs.length) {
			runResult.append(h("p", { class: "notice" }, "请先填写至少一个 slug。"));
			return;
		}
		const data = await api.encrypt(payload);
		announce("加密命令结束，退出码 " + String(data.code));
		runResult.append(renderOutput(data));
		if (data.code === 0 && replaceBody.input.checked && !statsOnly.input.checked) {
			const summary = await replaceBodies(slugs);
			runResult.append(renderReplaceSummary(summary));
			await Promise.all([loadPlaintext(), loadEncrypted()]).catch(function () {});
		}
	});

	const publicListHost = h("div");
	const encryptedHost = h("div");
	const scanErrors = h("div");

	function addSlug(slug) {
		const existing = slugArea.value.split(/[\n,]/).map(function (item) { return item.trim(); }).filter(function (item) { return item.length > 0; });
		if (existing.indexOf(slug) !== -1) {
			announce(slug + " 已在列表中");
			return;
		}
		existing.push(slug);
		slugArea.value = existing.join("\n");
		announce("已加入 " + slug);
	}

	// 加密脚本只读 private/source/<slug>.md 这一处明文；这里列出来，slug 缺少时一眼就能看出。
	async function loadPlaintext() {
		clear(publicListHost);
		publicListHost.append(h("p", { class: "muted small" }, "扫描 private/source…"));
		let files;
		try {
			files = await api.listFiles("private/source");
		} catch (error) {
			clear(publicListHost);
			if (error.code === "dir-invalid") {
				publicListHost.append(h("p", { class: "muted small" }, "服务端还没放开 private/source 的读取，重启启动器后再试。" ));
				return;
			}
			throw error;
		}
		clear(publicListHost);
		if (!Array.isArray(files) || !files.length) {
			publicListHost.append(h("p", { class: "muted small" }, "private/source 目录为空或不存在：没有可加密的明文。" ));
			return;
		}
		const body = h("tbody");
		for (const file of files) {
			const slug = String(file.name).replace(/\.md$/i, "");
			const add = h("button", { type: "button", class: "tiny" }, "加入 slug");
			add.addEventListener("click", function () { addSlug(slug); });
			body.append(h("tr", null,
				h("td", null, h("code", null, slug)),
				h("td", { class: "small" }, file.name),
				h("td", null, bytesText(file.bytes)),
				h("td", null, add)));
		}
		publicListHost.append(h("table", null,
			h("thead", null, h("tr", null, h("th", { scope: "col" }, "slug"), h("th", { scope: "col" }, "文件名"), h("th", { scope: "col" }, "大小"), h("th", { scope: "col" }, "操作"))),
			body));
	}

	async function loadEncrypted() {
		clear(encryptedHost);
		encryptedHost.append(h("p", { class: "muted small" }, "扫描已加密文章…"));
		const collections = await api.getCollections();
		const rows = [];
		for (const collection of collections) {
			const items = await api.getCollection(collection.key);
			for (const item of Array.isArray(items) ? items : []) {
				if (!item.encrypted) continue;
				const add = h("button", { type: "button", class: "tiny" }, "加入 slug");
				add.addEventListener("click", function () { addSlug(item.slug); });
				rows.push(h("tr", null,
					h("td", null, collection.label),
					h("td", null, h("code", null, item.slug)),
					h("td", null, item.title || ""),
					h("td", null, item.cipherExists ? "存在" : h("span", { class: "warn-text" }, "缺失")),
					h("td", null, add)));
			}
		}
		clear(encryptedHost);
		if (!rows.length) {
			encryptedHost.append(h("p", { class: "muted small" }, "没有已加密的文章。" ));
			return;
		}
		encryptedHost.append(h("table", null,
			h("thead", null, h("tr", null, h("th", { scope: "col" }, "集合"), h("th", { scope: "col" }, "slug"), h("th", { scope: "col" }, "标题"), h("th", { scope: "col" }, "密文"), h("th", { scope: "col" }, "操作"))),
			h("tbody", null, rows)));
	}

	const refreshButton = h("button", { type: "button" }, "刷新列表");
	wire(refreshButton, scanErrors, async function () {
		await Promise.all([loadPlaintext(), loadEncrypted()]);
	});

	clear(host);
	host.append(
		h("section", { class: "card" },
			h("h3", null, "加密文章"),
			h("p", { class: "muted small" }, "调用 scripts/encrypt-post.mjs；密码通过 POST_PASSWORD 传入子进程，不会写入仓库。"),
			field("slug 列表（每行一个，也接受逗号分隔）", slugArea),
			field("密码 password（可选）", password),
			statsOnly.node,
			replaceBody.node,
			h("p", { class: "field-hint" }, "勾选后：仅当 public/encrypted/<slug>.enc 已生成、且文章标记了 encrypted 时，才把正文换成占位注释。"),
			h("div", { class: "row" }, runButton),
			runErrors,
			runResult),
		h("section", { class: "card" },
			h("h3", null, "待加密明文（private/source）"),
			h("p", { class: "muted small" }, "加密脚本只从 private/source/<slug>.md 读明文；不在这里的 slug 会报「找不到明文文件」。该目录被 .gitignore 忽略，不会进仓库。"),
			publicListHost,
			h("div", { class: "row" }, refreshButton),
			scanErrors),
		h("section", { class: "card" },
			h("h3", null, "已加密文章"),
			encryptedHost));

	await Promise.all([loadPlaintext(), loadEncrypted()]).catch(function (error) {
		scanErrors.append(errorBox(error));
	});
}
