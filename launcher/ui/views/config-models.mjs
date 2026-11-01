// 纯数据层：把 src/config.ts 里的「源码形状」翻译成 UI 表单模型，再翻译回去。
// 不碰 DOM，浏览器与 node:test 都能直接导入，输入框里只出现人话，不需要用户自己打引号/花括号。
// 非字面量（LinkPreset.Home、I18nKey.more）以 {"__ref":"LinkPreset.Home"} 表示，映射回源码时原样写回。

// LinkPreset 枚举（src/types/config.ts:54），label 是给用户看的中文名。
export const LINK_PRESETS = [
	{ value: "Home", label: "首页 Home" },
	{ value: "Archive", label: "归档 Archive" },
	{ value: "About", label: "关于 About" },
	{ value: "Essays", label: "随笔 Essays" },
	{ value: "Gallery", label: "画廊 Gallery" }
];

export const ICON_SUGGESTIONS = [
	"fa6-brands:github",
	"fa6-brands:bilibili",
	"fa6-brands:qq",
	"fa6-brands:weixin",
	"fa6-solid:book-open",
	"fa6-solid:link",
	"fa6-solid:envelope",
	"material-symbols:home-outline-rounded",
	"material-symbols:archive-outline-rounded",
	"material-symbols:person-outline-rounded",
	"material-symbols:photo-library-outline-rounded",
	"material-symbols:more-horiz",
	"material-symbols:link-rounded",
	"material-symbols:school-outline-rounded",
	"material-symbols:category-outline-rounded",
	"material-symbols:label-outline-rounded"
];

const PRESET_PREFIX = "LinkPreset.";
const I18N_PREFIX = "I18nKey.";

export function isRef(value) {
	return value !== null && typeof value === "object" && typeof value.__ref === "string";
}

function refOf(value, prefix) {
	return isRef(value) && value.__ref.indexOf(prefix) === 0 ? value.__ref.slice(prefix.length) : null;
}

// 导航项的名称有两种来源：字面量 name，或 i18n 键（渲染时取译文）。
export function parseLabel(entry) {
	const source = entry && typeof entry === "object" ? entry : {};
	const i18nKey = refOf(source.key, I18N_PREFIX);
	if (i18nKey !== null) return { mode: "i18n", ref: source.key.__ref, key: i18nKey };
	return { mode: "name", value: typeof source.name === "string" ? source.name : "" };
}

export function labelText(label) {
	return label.mode === "i18n" ? "页面文案：i18n 键 " + label.key + "（保持不变）" : label.value;
}

function applyLabel(target, label) {
	if (label.mode === "i18n") target.key = { __ref: label.ref };
	else target.name = label.value;
}

function normalizeLink(entry) {
	const source = entry && typeof entry === "object" ? entry : {};
	return {
		kind: "link",
		label: parseLabel(source),
		url: typeof source.url === "string" ? source.url : "",
		icon: typeof source.icon === "string" ? source.icon : "",
		external: source.external === true
	};
}

export function normalizeNavLinks(links) {
	return (Array.isArray(links) ? links : []).map((entry) => {
		const preset = refOf(entry, PRESET_PREFIX);
		if (preset !== null) return { kind: "preset", preset: preset };
		if (entry && typeof entry === "object" && Array.isArray(entry.children)) {
			return {
				kind: "group",
				label: parseLabel(entry),
				icon: typeof entry.icon === "string" ? entry.icon : "",
				children: entry.children.map(normalizeLink)
			};
		}
		return normalizeLink(entry);
	});
}

function buildLink(model) {
	const entry = {};
	applyLabel(entry, model.label);
	entry.url = model.url;
	if (model.external) entry.external = true;
	if (model.icon) entry.icon = model.icon;
	return entry;
}

export function buildNavLinks(models) {
	return (Array.isArray(models) ? models : []).map((model) => {
		if (model.kind === "preset") return { __ref: PRESET_PREFIX + model.preset };
		if (model.kind === "group") {
			const entry = {};
			applyLabel(entry, model.label);
			if (model.icon) entry.icon = model.icon;
			entry.children = model.children.map(buildLink);
			return entry;
		}
		return buildLink(model);
	});
}

export function normalizeProfileLinks(links) {
	return (Array.isArray(links) ? links : []).map((entry) => {
		const source = entry && typeof entry === "object" ? entry : {};
		return {
			name: typeof source.name === "string" ? source.name : "",
			url: typeof source.url === "string" ? source.url : "",
			icon: typeof source.icon === "string" ? source.icon : ""
		};
	});
}

export function buildProfileLinks(models) {
	return (Array.isArray(models) ? models : []).map((model) => ({
		name: model.name,
		icon: model.icon,
		url: model.url
	}));
}
