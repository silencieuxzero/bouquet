import fs from "node:fs/promises";
import { fromRoot } from "./paths.mjs";
import { FailError } from "./http.mjs";
import { snapshot } from "./backup.mjs";

export const DATA_NAMES = ["gallery", "tutorials"];

export function dataRel(name) {
	if (!DATA_NAMES.includes(name)) {
		throw new FailError(400, "data-unknown", "unknown data document: " + String(name) + " (expected " + DATA_NAMES.join(" | ") + ")");
	}
	return "src/data/" + name + ".json";
}

export async function readData(name) {
	const repoPath = dataRel(name);
	const text = await fs.readFile(fromRoot(repoPath), "utf8");
	try {
		return JSON.parse(text);
	} catch (err) {
		throw new FailError(500, "data-corrupt", repoPath + " is not valid JSON: " + err.message);
	}
}

/** Replace the whole document; tab-indented with a trailing newline, original bytes snapshotted. */
export async function writeData(name, document) {
	const repoPath = dataRel(name);
	if (document === null || typeof document !== "object" || Array.isArray(document)) {
		throw new FailError(400, "data-invalid", "document must be a JSON object");
	}
	const body = JSON.stringify(document, null, "\t") + "\n";
	const file = fromRoot(repoPath);
	const current = await fs.readFile(file, "utf8").catch(() => null);
	const snap = await snapshot([repoPath], "data write: " + name);
	await fs.writeFile(file, body, "utf8");
	return { backupId: snap.id, unchanged: current === body };
}
