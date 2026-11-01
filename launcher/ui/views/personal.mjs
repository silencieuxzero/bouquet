// 导航与资料：全部用表单录入，用户只需要填值，不需要自己写引号、花括号或 JSON。
// 纯数据转换在 views/config-models.mjs；这里只负责 DOM、事件与保存。
// 保存仍然走 diffEdits + /api/config/patch（最小编辑、备份、diff、回滚）。
import { api } from "../api.mjs";
import {
	h, clear, clone, configValue, diffEdits, field, textInput, textareaInput, checkboxRow,
	iconInput, readJsonField, writeResult, wire, announce, invalidError, uploadInput
} from "../components/dom.mjs";
import {
	LINK_PRESETS, ICON_SUGGESTIONS, labelText,
	normalizeNavLinks, buildNavLinks, normalizeProfileLinks, buildProfileLinks
} from "./config-models.mjs";

export const views = [{ key: "personal", label: "导航与资料", mount: mount }];

const KIND_OPTIONS = [
	{ value: "preset", label: "预设页面" },
	{ value: "link", label: "自定义链接" },
	{ value: "group", label: "分组菜单（点开是子项）" }
];

const EC_THEMES = ["github-dark", "github-dark-dimmed", "vitesse-dark", "one-dark-pro", "dracula", "nord", "night-owl", "tokyo-night"];

function optionsSelect(options, current) {
	const select = h("select", null);
	for (const option of options) {
		const element = h("option", { value: option.value }, option.label);
		if (String(current) === String(option.value)) element.selected = true;
		select.append(element);
	}
	return select;
}

function hasKey(object, key) {
	return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function missingHint(key) {
	return h("p", { class: "muted small" }, "配置文件里没有 " + key + " 这一项，需要在源码中先添加，启动器不新增键。");
}

function resultSection(title, subtitle, body, onSave, saveLabel, errorHost, resultHost) {
	const saveButton = h("button", { type: "button", class: "primary" }, saveLabel);
	wire(saveButton, errorHost, onSave);
	return h("section", { class: "card" },
		h("h3", null, title),
		subtitle ? h("p", { class: "muted small" }, subtitle) : null,
		body,
		h("div", { class: "row" }, saveButton),
		errorHost,
		resultHost);
}

// ---------------------------------------------------------------- 导航栏 ----

function navRowControls(list, index, rerender) {
	const up = h("button", { type: "button", class: "tiny", "aria-label": "上移第 " + (index + 1) + " 项" }, "↑");
	const down = h("button", { type: "button", class: "tiny", "aria-label": "下移第 " + (index + 1) + " 项" }, "↓");
	const remove = h("button", { type: "button", class: "tiny danger" }, "删除");
	up.addEventListener("click", function () {
		if (index === 0) return;
		const [item] = list.splice(index, 1);
		list.splice(index - 1, 0, item);
		rerender();
	});
	down.addEventListener("click", function () {
		if (index >= list.length - 1) return;
		const [item] = list.splice(index, 1);
		list.splice(index + 1, 0, item);
		rerender();
	});
	remove.addEventListener("click", function () {
		list.splice(index, 1);
		rerender();
	});
	return h("div", { class: "row" }, up, down, remove);
}

function labelControl(label) {
	if (label.mode === "i18n") return h("span", { class: "field-hint", tabindex: 0 }, labelText(label));
	const input = textInput(label.value, { placeholder: "显示的文字" });
	input.addEventListener("input", function () { label.value = input.value; });
	return input;
}

function buildLinkSection(baseline, rerenderHost, remount) {
	const models = normalizeNavLinks(baseline);
	const listHost = h("div");
	const errorHost = h("div");
	const resultHost = h("div");

	function render() {
		clear(listHost);
		if (!models.length) listHost.append(h("p", { class: "muted small" }, "导航栏为空，点下面的按钮添加一项。"));
		models.forEach(function (model, index) {
			const kind = optionsSelect(KIND_OPTIONS, model.kind);
			kind.addEventListener("change", function () {
				const value = kind.value;
				if (value === "preset") models[index] = { kind: "preset", preset: "Home" };
				else if (value === "group") models[index] = { kind: "group", label: { mode: "name", value: model.label && model.label.mode === "name" ? model.label.value : "菜单" }, icon: "", children: [] };
				else models[index] = { kind: "link", label: { mode: "name", value: model.label && model.label.mode === "name" ? model.label.value : "" }, url: "", icon: "", external: false };
				render();
			});

			const parts = [h("div", { class: "row" }, h("strong", null, "第 " + (index + 1) + " 项"), kind, navRowControls(models, index, render))];

			if (model.kind === "preset") {
				const preset = optionsSelect(LINK_PRESETS, model.preset);
				preset.addEventListener("change", function () { model.preset = preset.value; });
				parts.push(field("跳转到哪个页面", preset));
			} else if (model.kind === "group") {
				const label = labelControl(model.label);
				parts.push(field("菜单名称", label));
				const icon = iconInput(model.icon, ICON_SUGGESTIONS);
				icon.querySelector("input").addEventListener("input", function (event) { model.icon = event.target.value; });
				parts.push(field("图标（可留空）", icon));
				parts.push(renderChildren(model, render));
			} else {
				const label = labelControl(model.label);
				const url = textInput(model.url, { placeholder: "https://… 或 /页面路径/", class: "mono" });
				url.addEventListener("input", function () { model.url = url.value; });
				const icon = iconInput(model.icon, ICON_SUGGESTIONS);
				icon.querySelector("input").addEventListener("input", function (event) { model.icon = event.target.value; });
				const externalRow = checkboxRow("在新标签页打开（外部链接）", model.external);
				externalRow.input.addEventListener("change", function () { model.external = externalRow.input.checked; });
				parts.push(field("显示名称", label), field("链接地址", url), field("图标（可留空）", icon), h("div", null, externalRow.node));
			}

			listHost.append(h("div", { class: "song-row" }, parts));
		});
	}

	function renderChildren(model, rerender) {
		const host = h("div", { class: "child-list" });
		model.children.forEach(function (child, childIndex) {
			const label = labelControl(child.label);
			const url = textInput(child.url, { placeholder: "/页面路径/", class: "mono" });
			url.addEventListener("input", function () { child.url = url.value; });
			const icon = iconInput(child.icon, ICON_SUGGESTIONS);
			icon.querySelector("input").addEventListener("input", function (event) { child.icon = event.target.value; });
			const externalRow = checkboxRow("在新标签页打开", child.external);
			externalRow.input.addEventListener("change", function () { child.external = externalRow.input.checked; });
			host.append(h("div", { class: "song-row" },
				h("div", { class: "row" }, h("strong", null, "子项 " + (childIndex + 1)), navRowControls(model.children, childIndex, rerender)),
				field("显示名称", label),
				field("链接地址", url),
				field("图标（可留空）", icon),
				h("div", null, externalRow.node)));
		});
		const addChild = h("button", { type: "button", class: "tiny" }, "新增子项");
		addChild.addEventListener("click", function () {
			model.children.push({ kind: "link", label: { mode: "name", value: "" }, url: "", icon: "", external: false });
			rerender();
		});
		host.append(h("div", { class: "row" }, addChild));
		return host;
	}

	render();

	const addPreset = h("button", { type: "button" }, "新增预设页面");
	const addLink = h("button", { type: "button" }, "新增自定义链接");
	const addGroup = h("button", { type: "button" }, "新增分组菜单");
	addPreset.addEventListener("click", function () { models.push({ kind: "preset", preset: "Home" }); render(); });
	addLink.addEventListener("click", function () { models.push({ kind: "link", label: { mode: "name", value: "" }, url: "", icon: "", external: false }); render(); });
	addGroup.addEventListener("click", function () { models.push({ kind: "group", label: { mode: "name", value: "菜单" }, icon: "", children: [] }); render(); });

	return resultSection(
		"导航栏链接 navBarConfig.links",
		"预设页面直接从下拉框选；自定义链接只填名称、地址和图标，不需要写任何符号。带 i18n 键的菜单文案保持不变。保存时会重写整个 links 数组：数组里的行尾注释不会保留，数组外的配置一律不动。",
		h("div", null, listHost, h("div", { class: "row" }, addPreset, addLink, addGroup)),
		async function () {
			clear(resultHost);
			const next = buildNavLinks(models);
			const diff = diffEdits("navBarConfig.links", baseline, next);
			if (diff.unsupported.length) throw invalidError("unsupported-edit", "无法写入的改动：" + diff.unsupported.join("、"));
			if (!diff.edits.length) {
				announce("没有变更");
				resultHost.append(h("p", { class: "notice" }, "导航栏与当前配置一致。"));
				return;
			}
			const data = await api.patchConfig(diff.edits);
			announce("已保存导航栏");
			resultHost.append(writeResult(data, remount));
		},
		"保存导航栏", errorHost, resultHost);
}

// -------------------------------------------------------------- 个人资料 ----

function buildProfileSection(baseline, remount) {
	const next = clone(baseline) || {};
	const links = normalizeProfileLinks(next.links);
	const errorHost = h("div");
	const resultHost = h("div");
	const fields = [];

	function scalar(key, labelTextValue, options) {
		if (!hasKey(baseline, key)) {
			fields.push(missingHint(key));
			return;
		}
		const input = textInput(next[key], options || {});
		input.addEventListener("input", function () { next[key] = input.value; });
		fields.push(field(labelTextValue, input));
	}

	scalar("name", "名称");
	scalar("bio", "一句话简介");
	scalar("location", "所在地");
	scalar("age", "年龄");

	if (hasKey(baseline, "avatar")) {
		const avatar = textInput(next.avatar, { class: "mono", placeholder: "assets/images/avatar.png 或 /avatar.png" });
		avatar.addEventListener("input", function () { next.avatar = avatar.value; });
		const upload = uploadInput({
			dir: "public",
			label: "上传头像",
			onDone: function (result) {
				const path = result.path || "";
				next.avatar = path;
				avatar.value = path;
				announce("上传完成，头像路径已填入：" + path);
			}
		});
		fields.push(field("头像", h("div", { class: "row" }, avatar, upload)));
	} else {
		fields.push(missingHint("avatar"));
	}

	const linksHost = h("div");
	function renderLinks() {
		clear(linksHost);
		links.forEach(function (link, index) {
			const name = textInput(link.name, { placeholder: "GitHub" });
			const url = textInput(link.url, { placeholder: "https://…", class: "mono" });
			const icon = iconInput(link.icon, ICON_SUGGESTIONS);
			name.addEventListener("input", function () { link.name = name.value; });
			url.addEventListener("input", function () { link.url = url.value; });
			icon.querySelector("input").addEventListener("input", function (event) { link.icon = event.target.value; });
			linksHost.append(h("div", { class: "song-row" },
				h("div", { class: "row" }, h("strong", null, "第 " + (index + 1) + " 个"), navRowControls(links, index, renderLinks)),
				field("名称", name),
				field("链接地址", url),
				field("图标", icon)));
		});
		if (!links.length) linksHost.append(h("p", { class: "muted small" }, "还没有社交图标。"));
		const addLink = h("button", { type: "button" }, "新增图标链接");
		addLink.addEventListener("click", function () {
			links.push({ name: "", url: "", icon: "" });
			renderLinks();
		});
		linksHost.append(h("div", { class: "row" }, addLink));
	}
	renderLinks();

	return resultSection(
		"个人资料 profileConfig",
		"图标填 icones 上的名字（可从下拉建议里选），例如 fa6-brands:github，不写图标则留空。",
		h("div", null, fields, h("h4", null, "社交图标列表"), linksHost),
		async function () {
			clear(resultHost);
			next.links = buildProfileLinks(links);
			const diff = diffEdits("profileConfig", baseline, next);
			if (diff.unsupported.length) throw invalidError("unsupported-edit", "无法写入的改动：" + diff.unsupported.join("、"));
			if (!diff.edits.length) {
				announce("没有变更");
				resultHost.append(h("p", { class: "notice" }, "个人资料与当前配置一致。"));
				return;
			}
			const data = await api.patchConfig(diff.edits);
			announce("已保存个人资料");
			resultHost.append(writeResult(data, remount));
		},
		"保存个人资料", errorHost, resultHost);
}

// -------------------------------------------------------------- 许可协议 ----

function buildLicenseSection(baseline, remount) {
	const next = clone(baseline) || {};
	const errorHost = h("div");
	const resultHost = h("div");
	const fields = [];

	if (hasKey(baseline, "enable")) {
		const row = checkboxRow("启用许可协议", next.enable);
		row.input.addEventListener("change", function () { next.enable = row.input.checked; });
		fields.push(h("div", null, row.node));
	} else {
		fields.push(missingHint("enable"));
	}
	for (const [key, label] of [["name", "协议名称"], ["url", "协议地址"]]) {
		if (!hasKey(baseline, key)) {
			fields.push(missingHint(key));
			continue;
		}
		const input = textInput(next[key], { class: key === "url" ? "mono" : null, placeholder: key === "url" ? "https://…" : "CC BY-NC-SA 4.0" });
		input.addEventListener("input", function () { next[key] = input.value; });
		fields.push(field(label, input));
	}

	return resultSection(
		"许可协议 licenseConfig",
		"文章底部显示的版权协议。",
		h("div", null, fields),
		async function () {
			clear(resultHost);
			const diff = diffEdits("licenseConfig", baseline, next);
			if (diff.unsupported.length) throw invalidError("unsupported-edit", "无法写入的改动：" + diff.unsupported.join("、"));
			if (!diff.edits.length) {
				announce("没有变更");
				resultHost.append(h("p", { class: "notice" }, "许可协议与当前配置一致。"));
				return;
			}
			const data = await api.patchConfig(diff.edits);
			announce("已保存许可协议");
			resultHost.append(writeResult(data, remount));
		},
		"保存许可协议", errorHost, resultHost);
}

// ------------------------------------------------------------ 代码块主题 ----

function buildCodeThemeSection(baseline, remount) {
	const errorHost = h("div");
	const resultHost = h("div");
	const theme = textInput(baseline.theme, { class: "mono", placeholder: "github-dark" });
	const listId = "ec-theme-options";
	const list = h("datalist", { id: listId });
	for (const name of EC_THEMES) list.append(h("option", { value: name }));
	theme.setAttribute("list", listId);

	return resultSection(
		"代码块主题 expressiveCodeConfig",
		"主题名可以从下拉建议里选，也可以自己填 shiki 支持的任意主题名；本博客只支持深色主题。",
		h("div", null, field("主题 theme", h("span", null, theme, list))),
		async function () {
			clear(resultHost);
			const next = clone(baseline) || {};
			next.theme = theme.value;
			const diff = diffEdits("expressiveCodeConfig", baseline, next);
			if (diff.unsupported.length) throw invalidError("unsupported-edit", "无法写入的改动：" + diff.unsupported.join("、"));
			if (!diff.edits.length) {
				announce("没有变更");
				resultHost.append(h("p", { class: "notice" }, "主题与当前配置一致。"));
				return;
			}
			const data = await api.patchConfig(diff.edits);
			announce("已保存代码块主题");
			resultHost.append(writeResult(data, remount));
		},
		"保存主题", errorHost, resultHost);
}

// ---------------------------------------------------------- 高级 JSON 兜底 ---

const JSON_EDITORS = [
	{ path: "navBarConfig.links", valuePath: "navBarConfig", label: "导航栏链接 navBarConfig.links", rows: 16, hint: "数组元素可用 {\"__ref\":\"LinkPreset.Home\"} 表示源码引用；整体数组会被替换。" },
	{ path: "profileConfig", label: "个人资料 profileConfig", rows: 14, hint: "对象只能修改已有键的值；数组（如 links）整体替换。" },
	{ path: "licenseConfig", label: "许可协议 licenseConfig", rows: 8, hint: "只修改已有键的值。" },
	{ path: "expressiveCodeConfig", label: "代码块主题 expressiveCodeConfig", rows: 6, hint: "只修改已有键的值。" }
];

function buildAdvancedSection(config, remount) {
	const cards = [];
	for (const editor of JSON_EDITORS) {
		const current = configValue(config, editor.valuePath || editor.path);
		if (current === undefined) continue;
		const baseline = clone(current);
		const area = textareaInput(JSON.stringify(baseline, null, "\t"), { rows: editor.rows, class: "mono" });
		const syntax = h("span", { class: "field-hint" }, "");
		const localErrors = h("div");
		const resultHost = h("div");
		const saveButton = h("button", { type: "button" }, "按 JSON 保存");
		const resetButton = h("button", { type: "button" }, "还原编辑");

		function checkSyntax() {
			try {
				JSON.parse(area.value);
				syntax.textContent = "JSON 语法正确";
			} catch (error) {
				syntax.textContent = "JSON 语法错误：" + error.message;
			}
		}
		area.addEventListener("input", checkSyntax);
		checkSyntax();
		resetButton.addEventListener("click", function () {
			area.value = JSON.stringify(baseline, null, "\t");
			checkSyntax();
			clear(localErrors);
			clear(resultHost);
		});
		wire(saveButton, localErrors, async function () {
			clear(resultHost);
			const next = readJsonField(area, editor.label);
			const diff = diffEdits(editor.path, baseline, next);
			if (diff.unsupported.length) throw invalidError("unsupported-edit", "这些改动无法用 path grammar 表达：" + diff.unsupported.join("、"));
			if (!diff.edits.length) {
				announce("没有变更");
				resultHost.append(h("p", { class: "notice" }, "内容与当前配置一致，无需保存。"));
				return;
			}
			const data = await api.patchConfig(diff.edits);
			announce("已保存 " + (Array.isArray(data.changed) ? data.changed.length : 0) + " 项");
			resultHost.append(writeResult(data, function () { return remount(); }));
		});

		cards.push(h("div", { class: "card" },
			h("h4", null, editor.label),
			h("p", { class: "muted small" }, editor.path + " · " + editor.hint),
			field("JSON", area),
			syntax,
			h("div", { class: "row" }, saveButton, resetButton),
			localErrors,
			resultHost));
	}
	return h("details", { class: "card" },
		h("summary", null, "高级：直接编辑 JSON（一般不需要，改配置请用上面的表单）"),
		cards);
}

async function mount(host) {
	host.append(h("p", { class: "muted small" }, "加载配置…"));
	const config = await api.getConfig();
	// /api/config 的 nav 根就是 links 数组本身，所以取 "navBarConfig"（不是 "navBarConfig.links"）。
	const nav = configValue(config, "navBarConfig");
	const profile = configValue(config, "profileConfig");
	const license = configValue(config, "licenseConfig");
	const ec = configValue(config, "expressiveCodeConfig");
	function remount() {
		clear(host);
		return mount(host);
	}
	const sections = [];
	if (Array.isArray(nav)) sections.push(buildLinkSection(clone(nav), null, remount));
	else sections.push(h("section", { class: "card" }, h("h3", null, "导航栏链接"), h("p", { class: "muted small" }, "配置里没有读到 navBarConfig.links，暂不可编辑。")));
	if (profile && typeof profile === "object") sections.push(buildProfileSection(clone(profile), remount));
	if (license && typeof license === "object") sections.push(buildLicenseSection(clone(license), remount));
	if (ec && typeof ec === "object") sections.push(buildCodeThemeSection(clone(ec), remount));

	clear(host);
	host.append(
		h("section", { class: "card" }, h("h3", null, "关于保存"), h("p", { class: "muted small" }, "表单里填什么就写什么，不需要自己加引号或括号；保存只改动与当前配置不同的键，返回的 diff 与 backupId 会显示在下方，可一键回滚。")),
		...sections,
		buildAdvancedSection(config, remount));
}
