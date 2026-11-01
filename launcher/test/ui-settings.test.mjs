// 启动器外观设置：默认值、校验、合并写入与读回。
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test, { after } from "node:test";
import { ROOT } from "../core/paths.mjs";
import { UI_DEFAULTS, normalizeUiSettings, readUiSettings, writeUiSettings } from "../core/ui-settings.mjs";

const FILE = path.join(ROOT, ".launcher", "ui-settings.json");

let saved = null;
try {
	saved = await fs.readFile(FILE, "utf8");
} catch (error) {
	if (error.code !== "ENOENT") throw error;
}

after(async () => {
	if (saved === null) await fs.rm(FILE, { force: true });
	else await fs.writeFile(FILE, saved, "utf8");
});

test("normalize fills defaults and ignores unknown keys", () => {
	assert.deepEqual(normalizeUiSettings({}), UI_DEFAULTS);
	const merged = normalizeUiSettings({ theme: "dark", extra: "ignored" });
	assert.equal(merged.theme, "dark");
	assert.equal(merged.accent, "blue");
	assert.equal("extra" in merged, false);
});

test("normalize rejects values the UI cannot render", () => {
	assert.throws(() => normalizeUiSettings({ accent: "magenta" }), (error) => error.code === "settings-invalid");
	assert.throws(() => normalizeUiSettings({ theme: "sepia" }), (error) => error.code === "settings-invalid");
	assert.throws(() => normalizeUiSettings({ fontSize: 99 }), (error) => error.code === "settings-invalid");
	assert.throws(() => normalizeUiSettings({ fontSize: "big" }), (error) => error.code === "settings-invalid");
	assert.throws(() => normalizeUiSettings({ density: "tight" }), (error) => error.code === "settings-invalid");
});

test("write merges onto the stored value and read returns it", async () => {
	const first = await writeUiSettings({ theme: "dark", fontSize: 17 });
	assert.equal(first.theme, "dark");
	assert.equal(first.fontSize, 17);
	assert.equal("accent" in first, true);
	const second = await writeUiSettings({ accent: "teal" });
	assert.equal(second.accent, "teal");
	assert.equal(second.theme, "dark");
	assert.equal(second.fontSize, 17);
	assert.deepEqual(await readUiSettings(), second);
	const raw = await fs.readFile(FILE, "utf8");
	assert.equal(JSON.parse(raw).accent, "teal");
});

test("a corrupted settings file falls back to defaults", async () => {
	await fs.mkdir(path.dirname(FILE), { recursive: true });
	await fs.writeFile(FILE, "{ not json", "utf8");
	assert.deepEqual(await readUiSettings(), UI_DEFAULTS);
});

test("booleans survive the round trip", async () => {
	await writeUiSettings({ showIcons: false });
	const value = await readUiSettings();
	assert.equal(value.showIcons, false);
	await writeUiSettings({ showIcons: true });
	assert.equal((await readUiSettings()).showIcons, true);
});
