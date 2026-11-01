// 启动器外观：把 /api/ui-settings 的设置映射成根节点上的 CSS 变量。
// 样式表只认变量，切换主题/强调色/字号/密度/圆角都不需要重新加载页面。
import { api } from "./api.mjs";

export const DEFAULTS = {
	theme: "light",
	accent: "blue",
	fontSize: 15,
	density: "normal",
	radius: "square",
	showIcons: true
};

export const THEMES = [
	{ value: "light", label: "浅色（白底）" },
	{ value: "dark", label: "深色" },
	{ value: "system", label: "跟随系统" }
];

export const ACCENTS = [
	{ value: "blue", label: "Metro 蓝", hex: "#0078d4" },
	{ value: "cyan", label: "青", hex: "#0f8f9e" },
	{ value: "indigo", label: "靛蓝", hex: "#4b4ec9" },
	{ value: "teal", label: "松绿", hex: "#12805c" },
	{ value: "slate", label: "石板灰", hex: "#54606e" }
];

export const FONT_SIZES = [
	{ value: 13, label: "紧凑 13px" },
	{ value: 15, label: "标准 15px" },
	{ value: 17, label: "宽大 17px" }
];

export const DENSITIES = [
	{ value: "compact", label: "紧凑" },
	{ value: "normal", label: "标准" },
	{ value: "relaxed", label: "宽松" }
];

export const RADII = [
	{ value: "square", label: "直角（Metro）" },
	{ value: "soft", label: "小圆角" }
];

const DENSITY_SCALE = { compact: 0.82, normal: 1, relaxed: 1.18 };
const RADIUS_PX = { square: "0px", soft: "4px" };

function prefersDark() {
	return Boolean(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

export function resolveTheme(mode) {
	if (mode === "system") return prefersDark() ? "dark" : "light";
	return mode === "dark" ? "dark" : "light";
}

/** Write one settings object onto <html>; returns the merged value actually applied. */
export function applyTheme(settings) {
	const value = { ...DEFAULTS, ...(settings || {}) };
	const root = document.documentElement;
	root.dataset.theme = resolveTheme(value.theme);
	root.dataset.accent = value.accent;
	root.dataset.density = value.density;
	const style = root.style;
	style.setProperty("--font-size", value.fontSize + "px");
	style.setProperty("--density", String(DENSITY_SCALE[value.density] ?? 1));
	style.setProperty("--radius", RADIUS_PX[value.radius] ?? "0px");
	style.setProperty("--nav-icon-display", value.showIcons ? "inline-flex" : "none");
	return value;
}

let stopWatching = null;

/** Apply the saved settings and follow the OS only while theme === "system". */
export async function loadTheme() {
	const settings = await api.getUiSettings();
	const applied = applyTheme(settings);
	if (stopWatching) { stopWatching(); stopWatching = null; }
	if (settings.theme === "system" && window.matchMedia) {
		const query = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = function () { applyTheme(applied); };
		query.addEventListener("change", onChange);
		stopWatching = function () { query.removeEventListener("change", onChange); };
	}
	return applied;
}
