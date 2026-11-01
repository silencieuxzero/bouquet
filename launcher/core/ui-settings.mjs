import fs from "node:fs/promises";
import path from "node:path";
import { ROOT } from "./paths.mjs";
import { FailError } from "./http.mjs";

/** Launcher UI preferences, stored inside the gitignored .launcher state directory. */
export const SETTINGS_REL = ".launcher/ui-settings.json";

export const UI_DEFAULTS = {
	theme: "light",
	accent: "blue",
	fontSize: 15,
	density: "normal",
	radius: "square",
	showIcons: true
};

export const UI_OPTIONS = {
	theme: ["light", "dark", "system"],
	accent: ["blue", "cyan", "indigo", "teal", "slate"],
	density: ["compact", "normal", "relaxed"],
	radius: ["square", "soft"]
};

const FONT_MIN = 12;
const FONT_MAX = 20;

function settingsPath() {
	return path.join(ROOT, SETTINGS_REL);
}

function pick(value, allowed, fallback, key) {
	if (value === undefined || value === null) return fallback;
	if (!allowed.includes(value)) {
		throw new FailError(400, "settings-invalid", key + " must be one of " + allowed.join(", "), { key, allowed });
	}
	return value;
}

/** Fill in defaults and reject anything the UI cannot render. */
export function normalizeUiSettings(input) {
	const source = input && typeof input === "object" ? input : {};
	const out = {};
	for (const key of Object.keys(UI_OPTIONS)) {
		out[key] = pick(source[key], UI_OPTIONS[key], UI_DEFAULTS[key], key);
	}
	if (source.fontSize === undefined || source.fontSize === null) {
		out.fontSize = UI_DEFAULTS.fontSize;
	} else {
		const size = Number(source.fontSize);
		if (!Number.isInteger(size) || size < FONT_MIN || size > FONT_MAX) {
			throw new FailError(400, "settings-invalid", "fontSize must be an integer between " + FONT_MIN + " and " + FONT_MAX, { key: "fontSize", min: FONT_MIN, max: FONT_MAX });
		}
		out.fontSize = size;
	}
	out.showIcons = source.showIcons === undefined || source.showIcons === null ? UI_DEFAULTS.showIcons : Boolean(source.showIcons);
	return out;
}

export async function readUiSettings() {
	let raw;
	try {
		raw = await fs.readFile(settingsPath(), "utf8");
	} catch (error) {
		if (error.code === "ENOENT") return { ...UI_DEFAULTS };
		throw error;
	}
	try {
		return normalizeUiSettings(JSON.parse(raw));
	} catch {
		return { ...UI_DEFAULTS };
	}
}

export async function writeUiSettings(patch) {
	const current = await readUiSettings();
	const next = normalizeUiSettings({ ...current, ...(patch && typeof patch === "object" ? patch : {}) });
	const target = settingsPath();
	await fs.mkdir(path.dirname(target), { recursive: true });
	const tmp = target + ".tmp";
	await fs.writeFile(tmp, JSON.stringify(next, null, "\t") + "\n", "utf8");
	await fs.rename(tmp, target);
	return next;
}
