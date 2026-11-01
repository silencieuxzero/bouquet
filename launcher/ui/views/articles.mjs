// 文章：集合标签页 → 列表 → frontmatter 表单 + markdown 正文，右栏 400ms 防抖预览。
// 保存走 PUT /api/content/:key/:slug，新建 POST，归档走 archive 端点，封面走 /api/upload。
import { api } from "../api.mjs";
import {
	h, clear, clone, field, textInput, textareaInput, checkboxRow, errorBox, uploadInput,
	writeResult, wire, announce, confirmDialog, invalidError
} from "../components/dom.mjs";

export const views = [{ key: "articles", label: "文章", mount: mount }];

const SLUG_PATTERN = /^[A-Za-z0-9_\-.\u4e00-\u9fa5]+$/;

function tagsToText(value) {
	if (Array.isArray(value)) return value.join(", ");
	return value === undefined || value === null ? "" : String(value);
}

function textToTags(text) {
	return text.split(",").map(function (item) { return item.trim(); }).filter(function (item) { return item.length > 0; });
}

// 文本/数组型 frontmatter 字段；其余（draft/showCover/encrypted）按布尔处理。
const TEXT_KEYS = ["title", "published", "description", "category", "lang", "image", "tags"];

function hasKey(object, key) {
	return Object.prototype.hasOwnProperty.call(object, key);
}

function sameValue(a, b) {
	return JSON.stringify(a === undefined ? null : a) === JSON.stringify(b === undefined ? null : b);
}

function isEmptyValue(value) {
	if (value === undefined || value === null) return true;
	if (Array.isArray(value)) return value.length === 0;
	return String(value).trim() === "";
}

// 只提交真正变化的键：原文件没有的键保持默认值就不发送，原有键被清空则发送 null（服务端 null = 删键）。
function buildFrontmatterPatch(next, base, initial) {
	const patch = {};
	for (const key of Object.keys(next)) {
		const value = next[key];
		if (TEXT_KEYS.indexOf(key) < 0) {
			const baseBool = hasKey(base, key) && base[key] === true;
			if (value === baseBool) continue;
			// 布尔键：原本没有这个键时，取消勾选等于删键（null），不写 false 污染文件。
			patch[key] = !value && !hasKey(initial, key) ? null : value;
			continue;
		}
		const basePresent = hasKey(base, key);
		if (isEmptyValue(value)) {
			if (basePresent && !isEmptyValue(base[key])) patch[key] = null;
			continue;
		}
		if (basePresent && sameValue(value, base[key])) continue;
		patch[key] = value;
	}
	return patch;
}

function applyPatch(base, patch) {
	for (const key of Object.keys(patch)) {
		if (patch[key] === null) delete base[key];
		else base[key] = patch[key];
	}
}

async function mount(host) {
	host.append(h("p", { class: "muted small" }, "加载集合…"));
	const collections = await api.getCollections();
	let activeKey = collections.length ? collections[0].key : null;
	let list = [];
	let previewTimer = null;
	let previewSeq = 0;

	const tabHost = h("div", { class: "tabs", role: "tablist", "aria-label": "内容集合" });
	const listHost = h("div");
	const editorHost = h("div");
	const errorHost = h("div");

	function collectionLabel(key) {
		const found = collections.find(function (item) { return item.key === key; });
		return found ? found.label : key;
	}

	function renderTabs() {
		clear(tabHost);
		for (const collection of collections) {
			const selected = collection.key === activeKey;
			const button = h("button", { type: "button", role: "tab", "aria-selected": selected ? "true" : "false", tabindex: selected ? "0" : "-1" }, collection.label + " · " + collection.key);
			button.addEventListener("click", async function () {
				activeKey = collection.key;
				clear(editorHost);
				renderTabs();
				await loadList().catch(function (error) { showError(error); });
			});
			tabHost.append(button);
		}
	}

	function showError(error) {
		clear(errorHost);
		errorHost.append(errorBox(error));
	}

	function renderList() {
		clear(listHost);
		const body = h("tbody");
		for (const item of list) {
			const open = h("button", { type: "button", class: "tiny" }, "打开");
			open.addEventListener("click", function () {
				openArticle(item.slug).catch(showError);
			});
			body.append(h("tr", null,
				h("td", null, h("code", null, item.slug)),
				h("td", null, item.title || "（无标题）"),
				h("td", { class: "small" }, item.published ? String(item.published) : ""),
				h("td", null, item.draft ? "草稿" : "已发布"),
				h("td", null, item.encrypted
					? (item.cipherExists ? "已加密" : h("span", { class: "warn-text" }, "缺密文"))
					: ""),
				h("td", null, String(item.size === undefined ? "" : item.size)),
				h("td", null, open)));
		}
		const table = h("table", null,
			h("thead", null, h("tr", null,
				h("th", { scope: "col" }, "slug"), h("th", { scope: "col" }, "标题"), h("th", { scope: "col" }, "发布时间"),
				h("th", { scope: "col" }, "状态"), h("th", { scope: "col" }, "加密"), h("th", { scope: "col" }, "字节"), h("th", { scope: "col" }, "操作"))),
			body);
		listHost.append(list.length ? table : h("p", { class: "muted small" }, "这个集合里还没有文章。"));
	}

	async function loadList() {
		clear(errorHost);
		listHost.append(h("p", { class: "muted small" }, "加载列表…"));
		list = await api.getCollection(activeKey);
		if (!Array.isArray(list)) list = [];
		renderList();
	}

	async function openArticle(slug) {
		clear(errorHost);
		clear(editorHost);
		editorHost.append(h("p", { class: "muted small" }, "加载文章…"));
		const detail = await api.getArticle(activeKey, slug);
		buildEditor(detail);
		editorHost.scrollIntoView({ block: "start", behavior: "smooth" });
	}

	function buildEditor(detail) {
		const baseline = clone(detail.frontmatter || {});
		// initial 记录「原文件里到底有哪些键」，保存只改它，baseline 随每次保存滚动更新。
		const initial = clone(detail.frontmatter || {});
		const title = textInput(baseline.title === undefined ? "" : baseline.title);
		const published = textInput(baseline.published === undefined ? "" : baseline.published);
		const description = textareaInput(baseline.description === undefined ? "" : baseline.description, { rows: 2 });
		const tags = textInput(tagsToText(baseline.tags));
		const category = textInput(baseline.category === undefined ? "" : baseline.category);
		const lang = textInput(baseline.lang === undefined ? "" : baseline.lang);
		const image = textInput(baseline.image === undefined ? "" : baseline.image, { class: "mono" });
		const draft = checkboxRow("草稿 draft", baseline.draft);
		const showCover = checkboxRow("显示封面 showCover", baseline.showCover);
		const encrypted = checkboxRow("加密 encrypted", baseline.encrypted);
		// encrypted 只是声明，密文在 public/encrypted/<slug>.enc；两者不同步时读者端会 404。
		const encryptHint = h("p", { class: "field-hint" }, "");
		function refreshEncryptHint() {
			if (!encrypted.input.checked) {
				encryptHint.hidden = true;
				encryptHint.textContent = "";
				return;
			}
			encryptHint.hidden = false;
			encryptHint.className = detail.cipherExists ? "field-hint" : "field-hint warn-text";
			encryptHint.textContent = detail.cipherExists
				? "已勾选 encrypted，密文 public/encrypted/" + detail.slug + ".enc 存在；正文请保持占位注释。"
				: "已勾选 encrypted，但 public/encrypted/" + detail.slug + ".enc 不存在：请到「加密」栏生成密文，否则读者端取不到内容。";
		}
		encrypted.input.addEventListener("change", refreshEncryptHint);
		refreshEncryptHint();
		const body = textareaInput(detail.body || "", { rows: 24, class: "mono" });
		const localErrors = h("div");
		const resultHost = h("div");
		const previewBody = h("div", { class: "preview-pane" });
		const previewStatus = h("p", { class: "muted small" }, "停止输入 400ms 后刷新预览");

		const upload = uploadInput({
			dir: "public",
			label: "上传封面",
			onDone: function (result) {
				const path = result.path || "";
				image.value = path;
				announce("封面已上传，image 填入：" + path);
			}
		});

		function currentFrontmatter() {
			return {
				title: title.value,
				published: published.value,
				description: description.value,
				tags: textToTags(tags.value),
				category: category.value,
				draft: draft.input.checked,
				showCover: showCover.input.checked,
				encrypted: encrypted.input.checked,
				image: image.value,
				lang: lang.value
			};
		}

		function refreshPreview() {
			const id = ++previewSeq;
			api.previewMarkdown(body.value).then(function (data) {
				if (id !== previewSeq) return;
				previewBody.innerHTML = data && data.html ? data.html : "";
				previewStatus.textContent = "预览已更新";
			}).catch(function (error) {
				if (id !== previewSeq) return;
				clear(previewBody);
				previewBody.append(errorBox(error));
				previewStatus.textContent = "预览失败";
			});
		}

		function schedulePreview() {
			if (previewTimer) clearTimeout(previewTimer);
			previewTimer = setTimeout(refreshPreview, 400);
		}
		body.addEventListener("input", schedulePreview);
		refreshPreview();

		const saveButton = h("button", { type: "button", class: "primary" }, "保存文章");
		wire(saveButton, localErrors, async function () {
			clear(resultHost);
			const next = currentFrontmatter();
			const changed = buildFrontmatterPatch(next, baseline, initial);
			const payload = {};
			if (Object.keys(changed).length) payload.frontmatter = changed;
			if (body.value !== (detail.body || "")) payload.body = body.value;
			if (!Object.keys(payload).length) {
				announce("没有改动");
				resultHost.append(h("p", { class: "notice" }, "没有需要保存的改动。"));
				return;
			}
			const data = await api.updateArticle(activeKey, detail.slug, payload);
			applyPatch(baseline, changed);
			detail.body = body.value;
			announce("已保存 " + detail.slug);
			resultHost.append(writeResult(data, function () { return reloadEditor(detail.slug); }));
			if (next.encrypted && !detail.cipherExists) {
				resultHost.append(h("p", { class: "notice" }, "注意：已勾选 encrypted，但 public/encrypted/" + detail.slug + ".enc 仍不存在，请到「加密」栏生成密文。"));
			}
			if (!next.encrypted && detail.cipherExists) {
				resultHost.append(h("p", { class: "notice" }, "注意：已取消 encrypted，但 public/encrypted/" + detail.slug + ".enc 仍在，正文会直接公开而密文成了残留文件。"));
			}
			await loadList().catch(function () {});
		});

		const archiveButton = h("button", { type: "button", class: "danger" }, "归档文章");
		wire(archiveButton, localErrors, async function () {
			const ok = await confirmDialog("将把「" + detail.slug + "」移入 .launcher/trash/，这不是硬删除但会从文章列表消失。确定归档？", "归档");
			if (!ok) return;
			const data = await api.archiveArticle(activeKey, detail.slug);
			clear(editorHost);
			editorHost.append(writeResult({ path: detail.path, archivedTo: data.archivedTo }, null));
			await loadList().catch(function () {});
		});

		const reloadButton = h("button", { type: "button" }, "放弃修改并重新载入");
		wire(reloadButton, localErrors, async function () {
			await reloadEditor(detail.slug);
		});

		function reloadEditor(slug) {
			return openArticle(slug);
		}

		const form = h("section", { class: "card" },
			h("h3", null, "编辑 " + activeKey + " / " + detail.slug),
			h("p", { class: "muted small" }, detail.path || ""),
			h("div", { class: "split" },
				h("div", null,
					field("标题 title", title),
					h("div", { class: "row" },
						field("发布时间 published", published),
						field("分类 category", category),
						field("语言 lang", lang)),
					field("描述 description", description),
					field("标签 tags（逗号分隔）", tags),
					field("封面 image", h("div", { class: "row" }, image, upload)),
					h("div", { class: "row" }, draft.node, showCover.node, encrypted.node),
					encryptHint,
					field("正文 markdown", body)),
				h("div", null, previewStatus, previewBody)),
			h("div", { class: "row" }, saveButton, reloadButton, archiveButton),
			localErrors,
			resultHost);
		clear(editorHost);
		editorHost.append(form);
	}

	function buildCreateCard() {
		const slug = textInput("", { placeholder: "new-post" });
		const createButton = h("button", { type: "button", class: "primary" }, "创建并打开");
		const localErrors = h("div");
		wire(createButton, localErrors, async function () {
			const value = slug.value.trim();
			if (!value) throw invalidError("invalid-slug", "slug 不能为空");
			if (!SLUG_PATTERN.test(value)) throw invalidError("invalid-slug", "slug 只能包含字母、数字、汉字、下划线、短横线、点");
			const created = await api.createArticle(activeKey, {
				slug: value,
				frontmatter: {
					title: value,
					published: new Date().toISOString().slice(0, 19),
					description: "",
					category: collectionLabel(activeKey),
					tags: [],
					draft: true
				},
				body: ""
			});
			announce("已创建 " + created.path);
			slug.value = "";
			await loadList();
			await openArticle(value);
		});
		return h("details", { class: "card" },
			h("summary", null, "新建文章"),
			field("slug（文件名，不含 .md）", slug),
			h("div", { class: "row" }, createButton),
			localErrors);
	}

	clear(host);
	host.append(tabHost, errorHost, h("section", { class: "card" }, h("h3", null, "文章列表"), listHost), buildCreateCard(), editorHost);
	renderTabs();
	await loadList();

	return function cleanup() {
		if (previewTimer) clearTimeout(previewTimer);
	};
}
