// 站点外观：由 GET /api/config/schema 生成表单。
// 保存时只把变更过的路径 POST 到 /api/config/patch，并渲染 diff 与回滚按钮。
// 导航/个人资料/许可/主题/音乐/图片各自有专门页面，这里不再重复露出它们的原始 JSON。
import { api } from "../api.mjs";
import {
	h, clear, clone, configValue, readJsonField, field, textInput, textareaInput, numberInput,
	selectInput, writeResult, wire, announce, invalidError
} from "../components/dom.mjs";

export const views = [{ key: "appearance", label: "站点外观", mount: mount }];

const GROUP_ORDER = ["站点信息", "外观主题", "横幅", "目录"];
const HANDLED_ELSEWHERE = new Set([
	"navBarConfig.links",
	"profileConfig",
	"licenseConfig",
	"expressiveCodeConfig.theme",
	"musicConfig",
	"siteConfig.favicon"
]);
const IDENTIFIER_PATH = /^[A-Za-z_$][A-Za-z0-9_$]*(\.[A-Za-z_$][A-Za-z0-9_$]*)*$/;

function pretty(value, fallback) {
	if (value === undefined) return fallback;
	return JSON.stringify(value, null, "\t");
}

function readNumber(spec, input) {
	const raw = input.value.trim();
	if (raw === "") throw invalidError("invalid-value", spec.path + " 需要一个数字，当前为空");
	const value = Number(raw);
	if (!Number.isFinite(value)) throw invalidError("invalid-value", spec.path + " 不是合法数字：" + raw);
	if (spec.min !== undefined && value < spec.min) throw invalidError("invalid-value", spec.path + " 不能小于 " + spec.min);
	if (spec.max !== undefined && value > spec.max) throw invalidError("invalid-value", spec.path + " 不能大于 " + spec.max);
	return value;
}

function readRef(text) {
	const value = text.trim();
	if (value === "") return "";
	if (IDENTIFIER_PATH.test(value)) return { __ref: value };
	try {
		return JSON.parse(value);
	} catch (error) {
		return value;
	}
}

// ------------------------------------------------------------------ 表单 ----

function buildControl(spec, initial) {
	const type = spec.type || "string";
	if (type === "boolean") {
		const input = h("input", { type: "checkbox", checked: Boolean(initial) });
		return { node: h("div", null, input), read: function () { return input.checked; }, dirty: function () { return input.checked !== Boolean(initial); } };
	}
	if (type === "number") {
		const input = numberInput(initial, { min: spec.min, max: spec.max });
		return {
			node: input,
			read: function () { return readNumber(spec, input); },
			dirty: function () { return String(initial === undefined || initial === null ? "" : initial) !== input.value; }
		};
	}
	if (type === "enum") {
		const input = selectInput(initial, spec.options || []);
		return { node: input, read: function () { return input.value; }, dirty: function () { return String(initial) !== input.value; } };
	}
	if (type === "text" || type === "json") {
		const initialText = type === "json" ? pretty(initial, "null") : (initial === undefined || initial === null ? "" : String(initial));
		const area = textareaInput(initialText, { rows: type === "json" ? 6 : 3, class: type === "json" ? "mono" : null });
		return {
			node: area,
			read: function () { return type === "json" ? readJsonField(area, spec.path) : area.value; },
			dirty: function () { return area.value !== initialText; }
		};
	}
	if (type === "ref") {
		const initialText = initial && typeof initial === "object" && initial.__ref ? initial.__ref : (initial === undefined ? "" : (typeof initial === "string" ? initial : JSON.stringify(initial)));
		const input = textInput(initialText, { class: "mono" });
		return { node: input, read: function () { return readRef(input.value); }, dirty: function () { return input.value !== initialText; } };
	}
	const initialText = initial === undefined || initial === null ? "" : String(initial);
	const input = textInput(initialText);
	return { node: input, read: function () { return input.value; }, dirty: function () { return input.value !== initialText; } };
}

async function mount(host) {
	host.append(h("p", { class: "muted small" }, "加载配置与字段表…"));
	const loaded = await Promise.all([api.getConfigSchema(), api.getConfig()]);
	const schema = loaded[0] || {};
	const config = loaded[1] || {};
	const allFields = (Array.isArray(schema.fields) ? schema.fields : []).filter(function (spec) {
		return !HANDLED_ELSEWHERE.has(spec.path);
	});
	if (!allFields.length) {
		clear(host);
		host.append(h("p", { class: "muted" }, "schema 端点没有返回任何字段。"));
		return;
	}

	const errorHost = h("div");
	const resultHost = h("div");
	const controls = [];
	const grouped = new Map();
	for (const spec of allFields) {
		const group = spec.group || "其他";
		if (!grouped.has(group)) grouped.set(group, []);
		grouped.get(group).push(spec);
	}
	const groupOrder = GROUP_ORDER.filter((group) => grouped.has(group))
		.concat([...grouped.keys()].filter((group) => GROUP_ORDER.indexOf(group) === -1));

	const form = h("form", { class: "stack", novalidate: true });
	for (const group of groupOrder) {
		const fieldset = h("fieldset", { class: "card" }, h("legend", null, group));
		for (const spec of grouped.get(group)) {
			const initial = configValue(config, spec.path);
			const control = buildControl(spec, initial);
			controls.push({ spec: spec, control: control });
			const unit = spec.unit ? "（单位 " + spec.unit + "）" : "";
			fieldset.append(field(spec.label || spec.path, control.node, spec.path + unit));
		}
		form.append(fieldset);
	}

	const saveButton = h("button", { type: "submit", class: "primary" }, "保存变更");
	const dryButton = h("button", { type: "button" }, "只预览差异");
	form.append(h("div", { class: "row" }, saveButton, dryButton));
	form.addEventListener("submit", function (event) {
		event.preventDefault();
	});

	async function submit(dryRun) {
		const edits = [];
		for (const item of controls) {
			if (!item.control.dirty()) continue;
			edits.push({ path: item.spec.path, value: item.control.read() });
		}
		if (!edits.length) {
			announce("没有变更");
			clear(resultHost);
			resultHost.append(h("p", { class: "notice" }, "没有检测到任何变更。"));
			return;
		}
		const data = await api.patchConfig(edits, dryRun);
		announce(dryRun ? "已预览差异" : "已保存 " + (Array.isArray(data.changed) ? data.changed.length : edits.length) + " 项");
		clear(resultHost);
		if (dryRun) {
			resultHost.append(writeResult(data, null));
			return;
		}
		resultHost.append(writeResult(data, function () { return remount(host); }));
		resultHost.append(h("div", { class: "row" }, h("button", { type: "button", onclick: function () { return remount(host); } }, "重新载入配置")));
	}

	wire(saveButton, errorHost, function () { return submit(false); });
	wire(dryButton, errorHost, function () { return submit(true); });

	const wrap = h("div", null, form, errorHost, resultHost);
	clear(host);
	host.append(wrap);
}

async function remount(host) {
	clear(host);
	await mount(host);
}
