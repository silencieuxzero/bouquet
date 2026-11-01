// 设置：启动器自身的外观（主题 / 强调色 / 字号 / 密度 / 圆角 / 分区图标）。
// 改动立刻作用在当前页面上，点「保存设置」才写入 .launcher/ui-settings.json。
import { api } from "../api.mjs";
import { h, clear, field, checkboxRow, wire, announce } from "../components/dom.mjs";
import { applyTheme, loadTheme, DEFAULTS, THEMES, ACCENTS, FONT_SIZES, DENSITIES, RADII } from "../theme.mjs";

export const views = [{ key: "settings", label: "设置", mount: mount }];

function optionValue(items, value) {
	return items.some(function (item) { return item.value === value; }) ? value : items[0].value;
}

/** selectInput() 只渲染裸值，设置页要中文标签，所以自带一个选项构造器。 */
function selectFrom(items, value) {
	const select = h("select", null);
	for (const item of items) {
		const option = h("option", { value: item.value }, item.label);
		if (String(item.value) === String(value)) option.selected = true;
		select.append(option);
	}
	return select;
}

async function mount(host) {
	let settings;
	try {
		settings = await loadTheme();
	} catch (error) {
		settings = { ...DEFAULTS };
	}
	if (!settings || typeof settings !== "object") settings = { ...DEFAULTS };

	const themeSelect = selectFrom(THEMES, optionValue(THEMES, settings.theme));
	const fontSelect = selectFrom(FONT_SIZES, optionValue(FONT_SIZES, settings.fontSize));
	const densitySelect = selectFrom(DENSITIES, optionValue(DENSITIES, settings.density));
	const radiusSelect = selectFrom(RADII, optionValue(RADII, settings.radius));
	const iconsRow = checkboxRow("在左侧导航显示分区图标", Boolean(settings.showIcons));

	const previewLabel = h("p", { class: "muted small" });
	const swatches = h("div", { class: "swatch-row" });
	let accent = settings.accent;

	function current() {
		return {
			theme: themeSelect.value || DEFAULTS.theme,
			accent: accent,
			fontSize: Number(fontSelect.value) || DEFAULTS.fontSize,
			density: densitySelect.value || DEFAULTS.density,
			radius: radiusSelect.value || DEFAULTS.radius,
			showIcons: iconsRow.input.checked
		};
	}

	function paint() {
		const value = current();
		applyTheme(value);
		for (const button of swatches.children) {
			if (button.dataset && button.dataset.accent === value.accent) button.setAttribute("aria-pressed", "true");
			else button.setAttribute("aria-pressed", "false");
		}
		const accentItem = ACCENTS.find(function (item) { return item.value === value.accent; }) || ACCENTS[0];
		previewLabel.textContent = "当前预览：" + themeName(value.theme) + " · " + accentItem.label + " · " + value.fontSize + "px · " + densityName(value.density) + " · " + radiusName(value.radius);
	}

	function themeName(value) {
		const found = THEMES.find(function (item) { return item.value === value; });
		return found ? found.label : value;
	}
	function densityName(value) {
		const found = DENSITIES.find(function (item) { return item.value === value; });
		return found ? found.label : value;
	}
	function radiusName(value) {
		const found = RADII.find(function (item) { return item.value === value; });
		return found ? found.label : value;
	}

	for (const item of ACCENTS) {
		const button = h("button", { type: "button", class: "swatch", "aria-pressed": "false", title: item.label + " " + item.hex, dataset: { accent: item.value } }, h("span", { class: "swatch-chip", style: "background:" + item.hex }));
		button.append(h("span", null, item.label));
		button.addEventListener("click", function () {
			accent = item.value;
			paint();
		});
		swatches.append(button);
	}

	for (const control of [themeSelect, fontSelect, densitySelect, radiusSelect]) {
		control.addEventListener("change", paint);
	}
	iconsRow.input.addEventListener("change", paint);

	const saveButton = h("button", { type: "button", class: "primary" }, "保存设置");
	const resetButton = h("button", { type: "button" }, "恢复默认值");
	const errors = h("div");
	const result = h("div");

	wire(saveButton, errors, async function () {
		clear(result);
		const saved = await api.saveUiSettings(current());
		applyTheme(saved);
		announce("设置已保存到 .launcher/ui-settings.json");
		result.append(h("p", { class: "notice" }, "已保存：" + themeName(saved.theme) + " · " + saved.fontSize + "px · " + densityName(saved.density) + " · " + radiusName(saved.radius)));
	});

	resetButton.addEventListener("click", function () {
		themeSelect.value = DEFAULTS.theme;
		fontSelect.value = String(DEFAULTS.fontSize);
		densitySelect.value = DEFAULTS.density;
		radiusSelect.value = DEFAULTS.radius;
		iconsRow.input.checked = DEFAULTS.showIcons;
		accent = DEFAULTS.accent;
		paint();
		announce("已恢复默认值，点「保存设置」才会写入文件");
	});

	paint();

	clear(host);
	host.append(
		h("section", { class: "card" },
			h("h3", null, "主题"),
			h("p", { class: "muted small" }, "白底 Metro 风格是默认外观；深色与跟随系统只影响这个本地 WebUI，不动站点本身。"),
			field("配色模式", themeSelect),
			field("强调色", swatches),
			previewLabel),
		h("section", { class: "card" },
			h("h3", null, "排版与密度"),
			field("正文字号", fontSelect),
			field("界面密度", densitySelect),
			field("卡片圆角", radiusSelect),
			iconsRow.node),
		h("section", { class: "card" },
			h("h3", null, "保存"),
			h("p", { class: "muted small" }, "改动会立刻预览；保存后写入 .launcher/ui-settings.json（该目录被 .gitignore 忽略，不进仓库）。"),
			h("div", { class: "row" }, saveButton, resetButton),
			errors,
			result));
}
