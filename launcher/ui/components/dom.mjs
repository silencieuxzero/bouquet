// 共享 DOM 小工具：元素构造、表单控件、差异/回滚面板、错误展示、确认对话框。
import { api } from "../api.mjs";

const MODAL_ROOT_ID = "modal-root";
const STATUS_REGION_ID = "status-region";

const CONFIG_ROOTS = {
	siteConfig: "site",
	navBarConfig: "nav",
	profileConfig: "profile",
	licenseConfig: "license",
	expressiveCodeConfig: "expressiveCode",
	musicConfig: "music"
};

export function h(tag, props) {
	const node = document.createElement(tag);
	const attributes = props || {};
	for (const key of Object.keys(attributes)) {
		const value = attributes[key];
		if (value === null || value === undefined || value === false) continue;
		if (key === "class") node.className = value;
		else if (key === "dataset") Object.assign(node.dataset, value);
		else if (key === "value") node.value = value;
		else if (key === "checked") node.checked = Boolean(value);
		else if (key.indexOf("on") === 0 && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
		else if (value === true) node.setAttribute(key, "");
		else node.setAttribute(key, String(value));
	}
	for (let index = 2; index < arguments.length; index += 1) appendChild(node, arguments[index]);
	return node;
}

function appendChild(node, child) {
	if (child === null || child === undefined || child === false) return;
	if (Array.isArray(child)) {
		for (const item of child) appendChild(node, item);
		return;
	}
	if (child instanceof Node) {
		node.append(child);
		return;
	}
	node.append(document.createTextNode(String(child)));
}

export function frag() {
	const container = document.createElement("div");
	for (let index = 0; index < arguments.length; index += 1) appendChild(container, arguments[index]);
	return container;
}

export function clear(node) {
	while (node.firstChild) node.removeChild(node.firstChild);
}

export const STATUS_FADE_MS = 5000;
export const STATUS_FADE_OUT_MS = 450;

let statusFadeTimer = null;
let statusClearTimer = null;

function stopStatusTimers(region) {
	if (statusFadeTimer !== null) {
		clearTimeout(statusFadeTimer);
		statusFadeTimer = null;
	}
	if (statusClearTimer !== null) {
		clearTimeout(statusClearTimer);
		statusClearTimer = null;
	}
	region.classList.remove("is-fading");
}

/** Bottom toast. Fades out after 5s unless {sticky:true} (a running state the user must keep seeing). */
export function announce(message, options) {
	const region = document.getElementById(STATUS_REGION_ID);
	if (!region) return;
	stopStatusTimers(region);
	const text = message === undefined || message === null ? "" : String(message);
	region.textContent = text;
	if (text === "" || (options && options.sticky)) return;
	statusFadeTimer = setTimeout(function () {
		statusFadeTimer = null;
		region.classList.add("is-fading");
		statusClearTimer = setTimeout(function () {
			statusClearTimer = null;
			region.textContent = "";
			region.classList.remove("is-fading");
		}, STATUS_FADE_OUT_MS);
	}, STATUS_FADE_MS);
}

export function clone(value) {
	return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

export function invalidError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}

export function bytesText(bytes) {
	const size = Number(bytes);
	if (!Number.isFinite(size)) return "未知大小";
	if (size < 1024) return size + " B";
	if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
	return (size / 1024 / 1024).toFixed(1) + " MB";
}

export function errorBox(error) {
	const code = error && error.code ? error.code : "error";
	const message = error && error.message ? error.message : String(error);
	const box = h("div", { class: "error-box", role: "alert" }, h("p", { class: "error-head" }, h("code", null, code), " " + message));
	const details = error ? error.details : null;
	if (details !== null && details !== undefined) {
		const text = typeof details === "string" ? details : JSON.stringify(details, null, 2);
		box.append(h("pre", { class: "output", tabindex: 0 }, text));
	}
	return box;
}

export function wire(button, errorHost, task) {
	button.addEventListener("click", async function () {
		const label = button.textContent;
		clear(errorHost);
		button.disabled = true;
		button.textContent = "处理中…";
		try {
			await task();
		} catch (error) {
			errorHost.append(errorBox(error));
		} finally {
			button.disabled = false;
			button.textContent = label;
		}
	});
	return button;
}

export function field(labelText, control, hint) {
	const parts = [h("span", { class: "field-label" }, labelText), control];
	if (hint) parts.push(h("span", { class: "field-hint" }, hint));
	return h("label", { class: "field" }, parts);
}

export function checkboxRow(labelText, checked) {
	const input = h("input", { type: "checkbox", checked: Boolean(checked) });
	return { node: h("label", { class: "check-row" }, input, h("span", null, labelText)), input: input };
}

export function textInput(value, options) {
	const opts = options || {};
	return h("input", { type: opts.password ? "password" : "text", value: value === undefined || value === null ? "" : value, class: opts.class || null, placeholder: opts.placeholder || null, spellcheck: "false" });
}

export function textareaInput(value, options) {
	const opts = options || {};
	const area = h("textarea", { rows: opts.rows || 6, class: opts.class || null, spellcheck: "false" });
	area.value = value === undefined || value === null ? "" : value;
	return area;
}

export function numberInput(value, options) {
	const opts = options || {};
	return h("input", { type: "number", value: value === undefined || value === null ? "" : value, min: opts.min === undefined ? null : opts.min, max: opts.max === undefined ? null : opts.max, step: opts.step === undefined ? null : opts.step });
}

export function selectInput(value, values) {
	const select = h("select", null);
	for (const option of values) {
		const element = h("option", { value: option }, option);
		if (String(value) === String(option)) element.selected = true;
		select.append(element);
	}
	return select;
}

export function iconInput(value, suggestions) {
	const id = "icon-options-" + Math.random().toString(36).slice(2, 9);
	const list = h("datalist", { id: id });
	for (const icon of suggestions || []) list.append(h("option", { value: icon }));
	const input = textInput(value, { class: "mono", placeholder: "fa6-brands:github" });
	input.setAttribute("list", id);
	return h("span", { class: "icon-field" }, input, list);
}

export function readJsonField(textarea, labelText) {
	try {
		return JSON.parse(textarea.value);
	} catch (error) {
		throw invalidError("json-invalid", "「" + labelText + "」不是合法的 JSON：" + error.message);
	}
}

export function configRootData(config, root) {
	const key = CONFIG_ROOTS[root];
	if (!key || !config) return undefined;
	return config[key];
}

export function configValue(config, path) {
	const parts = String(path).split(".");
	let node = configRootData(config, parts[0]);
	for (let index = 1; index < parts.length; index += 1) {
		if (node === null || node === undefined) return undefined;
		const indexed = /^(.+)\[(\d+)\]$/.exec(parts[index]);
		if (indexed) {
			const list = node[indexed[1]];
			node = Array.isArray(list) ? list[Number(indexed[2])] : undefined;
		} else {
			node = node[parts[index]];
		}
	}
	return node;
}

function isPlainObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

// 把一次整对象/整数组编辑拆成符合 path grammar 的最小编辑列表。
export function diffEdits(rootPath, before, after) {
	const edits = [];
	const unsupported = [];
	function walk(path, current, next) {
		if (JSON.stringify(current) === JSON.stringify(next)) return;
		if (Array.isArray(current) && Array.isArray(next)) {
			edits.push({ path: path, value: next });
			return;
		}
		if (isPlainObject(current) && isPlainObject(next)) {
			const keys = new Set(Object.keys(current).concat(Object.keys(next)));
			for (const key of keys) {
				const childPath = path + "." + key;
				if (!Object.prototype.hasOwnProperty.call(next, key)) {
					unsupported.push(childPath + "（不支持删除键）");
					continue;
				}
				if (!Object.prototype.hasOwnProperty.call(current, key)) {
					unsupported.push(childPath + "（不支持新增键）");
					continue;
				}
				walk(childPath, current[key], next[key]);
			}
			return;
		}
		edits.push({ path: path, value: next });
	}
	walk(rootPath, before, after);
	return { edits: edits, unsupported: unsupported };
}

export function confirmDialog(message, confirmLabel) {
	return new Promise(function (resolve) {
		const root = document.getElementById(MODAL_ROOT_ID) || document.body;
		const cancelButton = h("button", { type: "button" }, "取消");
		const confirmButton = h("button", { type: "button", class: "danger" }, confirmLabel || "确认");
		const dialog = h("dialog", { class: "confirm" },
			h("p", null, message),
			h("div", { class: "row", style: "justify-content: flex-end" }, cancelButton, confirmButton));
		let settled = false;
		function finish(value) {
			if (settled) return;
			settled = true;
			dialog.close();
			dialog.remove();
			resolve(value);
		}
		cancelButton.addEventListener("click", function () {
			finish(false);
		});
		confirmButton.addEventListener("click", function () {
			finish(true);
		});
		dialog.addEventListener("cancel", function (event) {
			event.preventDefault();
			finish(false);
		});
		root.append(dialog);
		dialog.showModal();
		cancelButton.focus();
	});
}

export function writeResult(data, onRollback) {
	const box = h("div", { class: "write-result" });
	const changed = Array.isArray(data.changed) ? data.changed : (Array.isArray(data.changedKeys) ? data.changedKeys : null);
	if (changed) {
		box.append(h("h4", null, "变更字段"));
		box.append(changed.length
			? h("ul", { class: "path-list" }, changed.map(function (path) { return h("li", null, h("code", null, path)); }))
			: h("p", { class: "muted small" }, "无变更"));
	}
	if (data.path) box.append(h("p", { class: "small" }, "文件：", h("code", null, data.path)));
	if (data.archivedTo) box.append(h("p", { class: "small" }, "已归档到：", h("code", null, data.archivedTo)));
	if (data.backupId) box.append(h("p", { class: "small" }, "备份 ID：", h("code", null, data.backupId)));
	if (data.diff) {
		const text = typeof data.diff === "string" ? data.diff : JSON.stringify(data.diff, null, 2);
		box.append(h("h4", null, "差异 diff"));
		box.append(h("pre", { class: "diff", tabindex: 0 }, text));
	}
	if (Array.isArray(data.restored)) {
		box.append(h("h4", null, "已恢复文件"));
		box.append(h("ul", { class: "path-list" }, data.restored.map(function (path) { return h("li", null, h("code", null, path)); })));
	}
	if (data.backupId && onRollback) box.append(h("div", { class: "row" }, rollbackButton(data.backupId, onRollback)));
	return box;
}

export function rollbackButton(backupId, onDone) {
	const resultHost = h("div");
	const errorHost = h("div");
	const button = h("button", { type: "button", class: "danger" }, "回滚到备份 " + backupId);
	wire(button, errorHost, async function () {
		clear(resultHost);
		const ok = await confirmDialog("将把相关文件恢复到备份 " + backupId + " 的内容（恢复前会先为现有内容再做一次快照）。确定回滚吗？", "回滚");
		if (!ok) return;
		const data = await api.restoreBackup(backupId);
		const restored = Array.isArray(data.restored) ? data.restored : [];
		announce("已回滚 " + restored.length + " 个文件");
		resultHost.append(writeResult({ restored: restored }, null));
		if (onDone) await onDone();
	});
	return h("div", null, button, errorHost, resultHost);
}

export function uploadInput(options) {
	const opts = options || {};
	const fileInput = h("input", { type: "file", accept: opts.accept || "image/*" });
	const labelText = h("span", null, opts.label || "上传文件");
	const errorHost = h("div");
	const wrapper = h("label", { class: "upload-label" }, fileInput, labelText);
	fileInput.addEventListener("change", async function () {
		const file = fileInput.files && fileInput.files[0];
		if (!file) return;
		clear(errorHost);
		labelText.textContent = "上传中…";
		fileInput.disabled = true;
		try {
			const result = await api.upload(file, opts.dir);
			announce("已上传 " + (result.path || file.name) + "（" + bytesText(result.bytes) + "）");
			if (opts.onDone) await opts.onDone(result);
		} catch (error) {
			errorHost.append(errorBox(error));
		} finally {
			fileInput.disabled = false;
			labelText.textContent = opts.label || "上传文件";
			fileInput.value = "";
		}
	});
	return h("div", { class: "stack" }, wrapper, errorHost);
}
