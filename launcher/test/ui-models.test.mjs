// 表单模型（launcher/ui/views/config-models.mjs）单测：
// 真实 src/config.ts 读出来的导航/资料结构，转成表单模型再转回去必须逐字节等价，
// 否则用户点一次保存就会把 LinkPreset / I18nKey 引用或键顺序写坏。
import assert from "node:assert/strict";
import test from "node:test";
import {
	LINK_PRESETS, ICON_SUGGESTIONS, isRef, parseLabel, labelText,
	normalizeNavLinks, buildNavLinks, normalizeProfileLinks, buildProfileLinks
} from "../ui/views/config-models.mjs";
import { readConfig } from "../core/config-ast.mjs";

test("nav round-trip keeps presets, i18n keys, external flags and key order", () => {
	const source = [
		{ __ref: "LinkPreset.Home" },
		{ __ref: "LinkPreset.Gallery" },
		{ name: "GitHub", url: "https://github.com/silencieuxzero", external: true, icon: "fa6-brands:github" },
		{
			key: { __ref: "I18nKey.more" },
			icon: "material-symbols:more-horiz",
			children: [
				{ key: { __ref: "I18nKey.essay" }, url: "/essays/", icon: "material-symbols:sticky-note-2-outline-rounded" },
				{ name: "外部页", url: "https://example.com/", external: true }
			]
		}
	];
	assert.deepEqual(buildNavLinks(normalizeNavLinks(source)), source);
});

test("nav round-trip against the real src/config.ts", async () => {
	const values = await readConfig();
	const real = values.nav;
	assert.ok(Array.isArray(real) && real.length >= 5);
	const models = normalizeNavLinks(real);
	assert.equal(models[0].kind, "preset");
	assert.ok(models.some((item) => item.kind === "group" && item.label.mode === "i18n"));
	assert.deepEqual(buildNavLinks(models), real);
});

test("labels: i18n keys are preserved as refs, literal names stay editable text", () => {
	assert.deepEqual(parseLabel({ key: { __ref: "I18nKey.more" } }), { mode: "i18n", ref: "I18nKey.more", key: "more" });
	assert.deepEqual(parseLabel({ name: "GitHub" }), { mode: "name", value: "GitHub" });
	assert.equal(labelText({ mode: "i18n", ref: "I18nKey.more", key: "more" }), "页面文案：i18n 键 more（保持不变）");
	const label = { mode: "name", value: "新页面" };
	const built = buildNavLinks([{ kind: "link", label: label, url: "/x/", icon: "", external: false }]);
	assert.deepEqual(built, [{ name: "新页面", url: "/x/" }]);
	assert.equal(isRef(built[0]), false);
});

test("editing a literal branch does not disturb untouched presets and refs", () => {
	const models = normalizeNavLinks([
		{ __ref: "LinkPreset.Home" },
		{ name: "GitHub", url: "https://github.com/a", external: true, icon: "fa6-brands:github" }
	]);
	models[1].label.value = "我的 GitHub";
	models.push({ kind: "preset", preset: "Archive" });
	assert.deepEqual(buildNavLinks(models), [
		{ __ref: "LinkPreset.Home" },
		{ name: "我的 GitHub", url: "https://github.com/a", external: true, icon: "fa6-brands:github" },
		{ __ref: "LinkPreset.Archive" }
	]);
});

test("profile links round-trip and keep the source key order (name, icon, url)", () => {
	const source = [
		{ name: "GitHub", icon: "fa6-brands:github", url: "https://github.com/silencieuxzero" },
		{ name: "Fandom", icon: "fa6-solid:book-open", url: "https://backrooms.fandom.com/zh/wiki/User:Appennino" }
	];
	assert.deepEqual(buildProfileLinks(normalizeProfileLinks(source)), source);
});

test("profile links round-trip against the real src/config.ts", async () => {
	const values = await readConfig();
	assert.deepEqual(buildProfileLinks(normalizeProfileLinks(values.profile.links)), values.profile.links);
});

test("icon suggestions and presets are plain user-facing values", () => {
	for (const preset of LINK_PRESETS) assert.match(preset.value, /^[A-Z][a-zA-Z]+$/);
	for (const icon of ICON_SUGGESTIONS) assert.match(icon, /^[a-z0-9-]+:[a-z0-9-]+$/);
});
