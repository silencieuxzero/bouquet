import fs from "node:fs/promises";
import ts from "typescript";
import { FailError } from "./http.mjs";
import { fromRoot } from "./paths.mjs";
import { snapshot } from "./backup.mjs";

export const CONFIG_REL = "src/config.ts";

/** Roots the patch grammar accepts. bannerHeights is read-only derived state. */
export const PATCH_ROOTS = [
	"siteConfig",
	"navBarConfig",
	"profileConfig",
	"licenseConfig",
	"expressiveCodeConfig",
	"musicConfig",
];
const READ_ROOT = "bannerHeights";
const REF_TEXT_LIMIT = 400;
const PATH_RE = /^([A-Za-z_$][A-Za-z0-9_$]*)((?:\.[A-Za-z_$][A-Za-z0-9_$]*|\[\d+\])+)$/;
const SEGMENT_RE = /\.([A-Za-z_$][A-Za-z0-9_$]*)|\[(\d+)\]/g;

function parse(text) {
	return ts.createSourceFile(CONFIG_REL, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function collectRoots(sourceFile) {
	const roots = new Map();
	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		for (const declaration of statement.declarationList.declarations) {
			if (!ts.isIdentifier(declaration.name)) continue;
			if (!declaration.initializer) continue;
			roots.set(declaration.name.text, declaration.initializer);
		}
	}
	return roots;
}

function propName(name) {
	if (ts.isIdentifier(name)) return name.text;
	if (ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name) || ts.isNumericLiteral(name)) return name.text;
	return null;
}

function sourceText(node) {
	let text = node.getText(node.getSourceFile());
	if (text.length > REF_TEXT_LIMIT) text = text.slice(0, REF_TEXT_LIMIT) + "\u2026";
	return text;
}

function unresolved(node) {
	return { __ref: sourceText(node), __unresolved: true };
}

/** Split a.b.c / a.b[0].c into a root identifier plus segments, or null. */
function chainSegments(node) {
	const segs = [];
	let cursor = node;
	while (true) {
		if (ts.isPropertyAccessExpression(cursor)) {
			segs.unshift(cursor.name.text);
			cursor = cursor.expression;
			continue;
		}
		if (ts.isElementAccessExpression(cursor) && cursor.argumentExpression && ts.isNumericLiteral(cursor.argumentExpression)) {
			segs.unshift(Number(cursor.argumentExpression.text));
			cursor = cursor.expression;
			continue;
		}
		if (ts.isIdentifier(cursor)) return { root: cursor.text, segs };
		return null;
	}
}

/** Walk a root's initializer structurally and return the terminal value node. */
function walkRoot(roots, root, segs) {
	let node = roots.get(root);
	for (const seg of segs) {
		if (typeof seg === "number") {
			if (!ts.isArrayLiteralExpression(node)) return null;
			node = node.elements[seg];
		} else {
			if (!ts.isObjectLiteralExpression(node)) return null;
			const prop = node.properties.find((p) => ts.isPropertyAssignment(p) && propName(p.name) === seg);
			node = prop ? prop.initializer : null;
		}
		if (!node) return null;
	}
	return node;
}

function evalNode(node, ctx) {
	if (!node || ctx.depth > 12) return null;
	if (ts.isParenthesizedExpression(node)) return evalNode(node.expression, { ...ctx, depth: ctx.depth + 1 });
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
	if (ts.isNumericLiteral(node)) return Number(node.text);
	if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
	if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
	if (node.kind === ts.SyntaxKind.NullKeyword) return null;
	if (ts.isPrefixUnaryExpression(node)) {
		const inner = evalNode(node.operand, { ...ctx, depth: ctx.depth + 1 });
		if (typeof inner !== "number") return unresolved(node);
		return node.operator === ts.SyntaxKind.MinusToken ? -inner : inner;
	}
	if (ts.isArrayLiteralExpression(node)) {
		const out = [];
		for (const element of node.elements) {
			if (ts.isOmittedExpression(element)) continue;
			if (ts.isSpreadElement(element)) {
				out.push(unresolved(element));
				continue;
			}
			out.push(evalNode(element, { ...ctx, depth: ctx.depth + 1 }));
		}
		return out;
	}
	if (ts.isObjectLiteralExpression(node)) {
		const out = {};
		for (const property of node.properties) {
			if (ts.isPropertyAssignment(property)) {
				const key = propName(property.name);
				if (key === null) {
					out.__unresolved = true;
					continue;
				}
				out[key] = evalNode(property.initializer, { ...ctx, depth: ctx.depth + 1 });
				continue;
			}
			if (ts.isShorthandPropertyAssignment(property)) {
				out[property.name.text] = { __ref: property.name.text, __unresolved: true };
				continue;
			}
			if (ts.isSpreadAssignment(property)) {
				out.__unresolved = true;
			}
		}
		return out;
	}
	if (ts.isBinaryExpression(node)) {
		const op = node.operatorToken.kind;
		if (op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.BarBarToken) {
			const left = evalNode(node.left, { ...ctx, depth: ctx.depth + 1 });
			if (left !== null && left !== undefined && !(left && left.__unresolved)) return left;
			const right = evalNode(node.right, { ...ctx, depth: ctx.depth + 1 });
			if (right !== null && right !== undefined && !(right && right.__unresolved)) return right;
			return unresolved(node);
		}
		return unresolved(node);
	}
	if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
		const chain = chainSegments(node);
		if (!chain) return unresolved(node);
		if (chain.root !== ctx.selfRoot && ctx.roots.has(chain.root)) {
			const target = walkRoot(ctx.roots, chain.root, chain.segs);
			if (target) return evalNode(target, { roots: ctx.roots, selfRoot: chain.root, depth: ctx.depth + 1 });
			return unresolved(node);
		}
		if (chain.root === ctx.selfRoot) return unresolved(node);
		return { __ref: sourceText(node) };
	}
	return unresolved(node);
}

function evaluateRoots(text) {
	const sourceFile = parse(text);
	const roots = collectRoots(sourceFile);
	const out = {};
	for (const name of [...PATCH_ROOTS, READ_ROOT]) {
		const node = roots.get(name);
		out[name] = node ? evalNode(node, { roots, selfRoot: name, depth: 0 }) : null;
	}
	return out;
}

/** The GET /api/config payload. */
export function readValues(text) {
	const roots = evaluateRoots(text);
	const nav = roots.navBarConfig;
	return {
		site: roots.siteConfig,
		nav: nav && typeof nav === "object" ? (nav.links ?? null) : null,
		profile: roots.profileConfig,
		license: roots.licenseConfig,
		expressiveCode: roots.expressiveCodeConfig,
		music: roots.musicConfig,
		bannerHeights: roots.bannerHeights,
	};
}

export async function readConfig() {
	const text = await fs.readFile(fromRoot(CONFIG_REL), "utf8");
	return readValues(text);
}

export function parsePath(path) {
	if (typeof path !== "string") {
		throw new FailError(400, "config-path-invalid", "config path must be a string");
	}
	const matched = PATH_RE.exec(path);
	if (!matched) {
		throw new FailError(
			400,
			"config-path-invalid",
			"config path must look like siteConfig.banner.height or navBarConfig.links[0].name: " + path,
		);
	}
	const root = matched[1];
	if (!PATCH_ROOTS.includes(root)) {
		throw new FailError(400, "config-path-unknown", "config root must be one of " + PATCH_ROOTS.join(", ") + ": " + path);
	}
	const segs = [];
	SEGMENT_RE.lastIndex = 0;
	let hit;
	while ((hit = SEGMENT_RE.exec(matched[2])) !== null) {
		segs.push(hit[1] !== undefined ? hit[1] : Number(hit[2]));
	}
	if (segs.length === 0) {
		throw new FailError(400, "config-path-invalid", "config path needs at least one segment: " + path);
	}
	return { root, segs };
}

function locatePath(roots, root, segs, path) {
	let node = roots.get(root);
	if (!node) {
		throw new FailError(400, "config-path-unknown", "config root not declared in " + CONFIG_REL + ": " + root);
	}
	for (const seg of segs) {
		if (typeof seg === "number") {
			if (!ts.isArrayLiteralExpression(node)) {
				throw new FailError(400, "config-path-unknown", "cannot resolve " + path + ": " + seg + " index applied to a non-array");
			}
			const element = node.elements[seg];
			if (!element) {
				throw new FailError(400, "config-path-unknown", "cannot resolve " + path + ": index " + seg + " is out of range");
			}
			node = element;
			continue;
		}
		if (!ts.isObjectLiteralExpression(node)) {
			throw new FailError(400, "config-path-unknown", "cannot resolve " + path + ": ." + seg + " applied to a non-object");
		}
		const prop = node.properties.find((p) => ts.isPropertyAssignment(p) && propName(p.name) === seg);
		if (!prop) {
			throw new FailError(400, "config-path-unknown", "cannot resolve " + path + ": property " + seg + " not found");
		}
		node = prop.initializer;
	}
	return node;
}

function isRef(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value) && typeof value.__ref === "string";
}

function serialize(value, baseIndent) {
	const pad = "\t".repeat(baseIndent);
	if (isRef(value)) return value.__ref;
	if (Array.isArray(value)) {
		if (value.length === 0) return "[]";
		const inner = "\t".repeat(baseIndent + 1);
		const items = value.map((item) => inner + serialize(item, baseIndent + 1));
		return "[\n" + items.join(",\n") + ",\n" + pad + "]";
	}
	if (value !== null && typeof value === "object") {
		const keys = Object.keys(value);
		if (keys.length === 0) return "{}";
		const inner = "\t".repeat(baseIndent + 1);
		const items = keys.map((key) => inner + formatKey(key) + ": " + serialize(value[key], baseIndent + 1));
		return "{\n" + items.join(",\n") + ",\n" + pad + "}";
	}
	if (typeof value === "string") return JSON.stringify(value);
	if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
	if (typeof value === "boolean") return String(value);
	return "null";
}

function formatKey(key) {
	return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

function lineIndent(text, position) {
	const lineStart = text.lastIndexOf("\n", position - 1) + 1;
	let count = 0;
	while (text[lineStart + count] === "\t") count++;
	return count;
}

function applyEditOnce(text, edit) {
	const sourceFile = parse(text);
	const roots = collectRoots(sourceFile);
	const node = locatePath(roots, edit.root, edit.segs, edit.path);
	const start = node.getStart(sourceFile);
	const end = node.getEnd();
	const body = serialize(edit.value, lineIndent(text, start));
	return text.slice(0, start) + body + text.slice(end);
}

/** Apply edits to the text in memory; each edit re-parses so ranges never overlap. */
export function planPatch(text, edits) {
	if (!Array.isArray(edits) || edits.length === 0) {
		throw new FailError(400, "config-edits-empty", "edits must be a non-empty array");
	}
	const normalized = edits.map((raw, index) => {
		if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
			throw new FailError(400, "config-edit-invalid", "edits[" + index + "] must be an object");
		}
		if (!("value" in raw)) {
			throw new FailError(400, "config-edit-invalid", "edits[" + index + "] is missing value");
		}
		const parsed = parsePath(raw.path);
		return { path: raw.path, root: parsed.root, segs: parsed.segs, value: raw.value };
	});
	let next = text;
	for (const edit of normalized) {
		next = applyEditOnce(next, edit);
	}
	return { next, changed: normalized.map((e) => e.path), edits: normalized };
}

function deepEqual(a, b) {
	if (a === b) return true;
	if (a === null || b === null || a === undefined || b === undefined) return false;
	if (typeof a !== typeof b) return false;
	if (typeof a !== "object") return Number.isNaN(a) && Number.isNaN(b);
	if (Array.isArray(a) !== Array.isArray(b)) return false;
	if (Array.isArray(a)) {
		if (a.length !== b.length) return false;
		return a.every((value, index) => deepEqual(value, b[index]));
	}
	const keysA = Object.keys(a);
	const keysB = Object.keys(b);
	if (keysA.length !== keysB.length) return false;
	return keysA.every((key) => deepEqual(a[key], b[key]));
}

function setInPath(target, segs, value) {
	if (!target || typeof target !== "object") return target;
	let cursor = target;
	for (let index = 0; index < segs.length - 1; index++) {
		cursor = cursor[segs[index]];
		if (!cursor || typeof cursor !== "object") return target;
	}
	cursor[segs[segs.length - 1]] = value;
	return target;
}

/** Re-parse and prove exactly the requested paths changed. */
export function verifyPatch(originalText, nextText, edits) {
	const before = evaluateRoots(originalText);
	const expected = {};
	for (const name of Object.keys(before)) expected[name] = structuredClone(before[name] ?? null);
	for (const edit of edits) {
		if (!edit || typeof edit !== "object") throw new FailError(400, "config-edit-invalid", "edit must be an object");
		const root = edit.root ?? parsePath(edit.path).root;
		const segs = edit.segs ?? parsePath(edit.path).segs;
		setInPath(expected[root], segs, structuredClone(edit.value ?? null));
	}
	const after = evaluateRoots(nextText);
	for (const name of PATCH_ROOTS) {
		if (!deepEqual(after[name], expected[name])) {
			throw new FailError(409, "verify-failed", "patch verification failed for " + name + ": the file would change outside the requested paths", {
				root: name,
				expected: expected[name],
				actual: after[name],
			});
		}
	}
	return after;
}

function diffOps(a, b) {
	const n = a.length;
	const m = b.length;
	if (n * m > 4000000) return null;
	const table = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
	for (let i = n - 1; i >= 0; i--) {
		for (let j = m - 1; j >= 0; j--) {
			table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
		}
	}
	const ops = [];
	let i = 0;
	let j = 0;
	while (i < n && j < m) {
		if (a[i] === b[j]) {
			ops.push({ type: "eq", old: i, next: j });
			i++;
			j++;
			continue;
		}
		if (table[i + 1][j] >= table[i][j + 1]) {
			ops.push({ type: "del", old: i });
			i++;
		} else {
			ops.push({ type: "ins", next: j });
			j++;
		}
	}
	while (i < n) ops.push({ type: "del", old: i++ });
	while (j < m) ops.push({ type: "ins", next: j++ });
	return ops;
}

/** Minimal unified diff (git-style headers, 3 lines of context). */
export function unifiedDiff(oldText, newText, file = CONFIG_REL, context = 3) {
	const oldLines = oldText.split("\n");
	const newLines = newText.split("\n");
	const ops = diffOps(oldLines, newLines);
	if (!ops) {
		return "--- a/" + file + "\n+++ b/" + file + "\n@@ -1 +1 @@\n-<file too large to diff>\n+<file too large to diff>\n";
	}
	const oldNo = new Array(ops.length + 1);
	const newNo = new Array(ops.length + 1);
	oldNo[0] = 1;
	newNo[0] = 1;
	for (let index = 0; index < ops.length; index++) {
		oldNo[index + 1] = oldNo[index] + (ops[index].type === "ins" ? 0 : 1);
		newNo[index + 1] = newNo[index] + (ops[index].type === "del" ? 0 : 1);
	}
	const changes = [];
	for (let index = 0; index < ops.length; index++) {
		if (ops[index].type !== "eq") changes.push(index);
	}
	if (changes.length === 0) return "";
	const hunks = [];
	let clusterStart = changes[0];
	let clusterEnd = changes[0];
	for (const index of changes.slice(1)) {
		if (index - clusterEnd > context * 2) {
			hunks.push([clusterStart, clusterEnd]);
			clusterStart = index;
		}
		clusterEnd = index;
	}
	hunks.push([clusterStart, clusterEnd]);
	const out = ["--- a/" + file, "+++ b/" + file];
	for (const [first, last] of hunks) {
		const start = Math.max(0, first - context);
		const end = Math.min(ops.length, last + 1 + context);
		const oldCount = oldNo[end] - oldNo[start];
		const newCount = newNo[end] - newNo[start];
		out.push("@@ -" + oldNo[start] + "," + oldCount + " +" + newNo[start] + "," + newCount + " @@");
		for (let index = start; index < end; index++) {
			const op = ops[index];
			if (op.type === "eq") out.push(" " + oldLines[op.old]);
			else if (op.type === "del") out.push("-" + oldLines[op.old]);
			else out.push("+" + newLines[op.next]);
		}
	}
	return out.join("\n") + "\n";
}

/** Read, patch, verify, snapshot and write src/config.ts. */
export async function applyConfigPatch(edits, options = {}) {
	const dryRun = options.dryRun === true;
	const file = fromRoot(CONFIG_REL);
	const original = await fs.readFile(file, "utf8");
	const planned = planPatch(original, edits);
	if (planned.next === original) {
		return { changed: [], backupId: null, diff: "" };
	}
	verifyPatch(original, planned.next, planned.edits);
	const diff = unifiedDiff(original, planned.next, CONFIG_REL);
	if (dryRun) return { changed: planned.changed, backupId: null, diff };
	const snap = await snapshot([CONFIG_REL], "config patch: " + planned.changed.join(", "));
	await fs.writeFile(file, planned.next, "utf8");
	const written = await fs.readFile(file, "utf8");
	if (written !== planned.next) {
		await fs.writeFile(file, original, "utf8");
		throw new FailError(409, "verify-failed", "written bytes differ from the planned text; original restored", { backupId: snap.id });
	}
	return { changed: planned.changed, backupId: snap.id, diff };
}
