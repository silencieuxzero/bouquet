// 极简 YAML frontmatter：行级解析 + 键级文本改写。
// 目标：未改动的键所在行保持字节不变（含 CRLF/缩进/引号风格）。
import { ContentError } from "./collections.mjs";

const FENCE_RE = /^(?:---|\.\.\.)[ \t]*$/;
const KEY_RE = /^([A-Za-z_][A-Za-z0-9_-]*)[ \t]*:(?:[ \t]+(.*))?$/;
const SEQ_RE = /^[ \t]*-[ \t]+(.*)$/;
const SEQ_EMPTY_RE = /^[ \t]*-[ \t]*$/;
const ISO_DATE_RE =
	/^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

function splitLines(raw) {
	const lines = [];
	const re = /\r\n|\n|\r/g;
	let last = 0;
	let m = re.exec(raw);
	while (m) {
		lines.push({ text: raw.slice(last, m.index), eol: m[0] });
		last = m.index + m[0].length;
		m = re.exec(raw);
	}
	if (last < raw.length) lines.push({ text: raw.slice(last), eol: "" });
	return lines;
}

function unsupported(reason) {
	return { value: null, shape: "unsupported", style: "unsupported", editable: false, reason };
}

function splitFlow(inner) {
	const items = [];
	let cur = "";
	let quote = null;
	let depth = 0;
	for (let i = 0; i < inner.length; i++) {
		const ch = inner[i];
		if (quote) {
			cur += ch;
			if (ch === "\\" && quote === '"') {
				i++;
				cur += inner[i] ?? "";
				continue;
			}
			if (ch === quote) quote = null;
			continue;
		}
		if (ch === '"' || ch === "'") {
			quote = ch;
			cur += ch;
			continue;
		}
		if (ch === "[" || ch === "{") {
			depth++;
			cur += ch;
			continue;
		}
		if (ch === "]" || ch === "}") {
			depth--;
			cur += ch;
			continue;
		}
		if (ch === "," && depth === 0) {
			items.push(cur.trim());
			cur = "";
			continue;
		}
		cur += ch;
	}
	if (quote || depth !== 0) return null;
	const tail = cur.trim();
	if (tail !== "" || items.length === 0) items.push(tail);
	return items.filter((item) => item !== "");
}

// 解析单个标量 / flow 集合文本。editable=false 表示结构不支持按键改写。
function parseScalarText(text) {
	const t = text.trim();
	if (t === "") return unsupported("empty");

	if (t.startsWith('"')) {
		if (t.length < 2 || !t.endsWith('"')) return unsupported("multiline-string");
		try {
			return { value: JSON.parse(t), shape: "string", style: "double", editable: true };
		} catch {
			const inner = t.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
			return { value: inner, shape: "string", style: "double", editable: true };
		}
	}
	if (t.startsWith("'")) {
		if (t.length < 2 || !t.endsWith("'")) return unsupported("multiline-string");
		return { value: t.slice(1, -1).replace(/''/g, "'"), shape: "string", style: "single", editable: true };
	}
	if (t.startsWith("|") || t.startsWith(">")) return unsupported("block-scalar");
	if (t.startsWith("&") || t.startsWith("*") || t.startsWith("!")) return unsupported("anchor-or-tag");

	if (t.startsWith("[")) {
		if (!t.endsWith("]")) return unsupported("unterminated-array");
		const parts = splitFlow(t.slice(1, -1));
		if (!parts) return unsupported("unbalanced-array");
		const value = [];
		for (const part of parts) {
			const item = parseScalarText(part);
			if (!item.editable) return unsupported("nested-collection");
			if (item.shape !== "empty") value.push(item.value);
		}
		return { value, shape: "array", style: "flow-array", editable: true };
	}
	if (t.startsWith("{")) {
		if (!t.endsWith("}")) return unsupported("unterminated-map");
		const parts = splitFlow(t.slice(1, -1));
		if (!parts) return unsupported("unbalanced-map");
		const value = {};
		for (const part of parts) {
			const idx = part.indexOf(":");
			if (idx < 0) return unsupported("flow-map");
			const key = part.slice(0, idx).trim().replace(/^["']|["']$/g, "");
			const item = parseScalarText(part.slice(idx + 1));
			if (!item.editable || item.shape === "array" || item.shape === "map") {
				return unsupported("nested-collection");
			}
			value[key] = item.value;
		}
		return { value, shape: "map", style: "flow-map", editable: true };
	}

	if (/^(?:true|True|TRUE)$/.test(t)) return { value: true, shape: "boolean", style: "boolean", editable: true };
	if (/^(?:false|False|FALSE)$/.test(t)) return { value: false, shape: "boolean", style: "boolean", editable: true };
	if (/^(?:null|Null|NULL|~)$/.test(t)) return { value: null, shape: "null", style: "null", editable: true };
	if (!ISO_DATE_RE.test(t) && /^[-+]?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?$/.test(t)) {
		return { value: Number(t), shape: "number", style: "number", editable: true };
	}
	return { value: t, shape: "scalar", style: "plain", editable: true };
}

export function parseFrontmatter(raw) {
	if (typeof raw !== "string") {
		throw new ContentError(400, "frontmatter-invalid", "内容必须是字符串");
	}
	const lines = splitLines(raw);
	const eol = lines.find((line) => line.eol)?.eol ?? "\n";
	let closeIndex = -1;
	if (lines.length > 0 && FENCE_RE.test(lines[0].text)) {
		for (let i = 1; i < lines.length; i++) {
			if (FENCE_RE.test(lines[i].text)) {
				closeIndex = i;
				break;
			}
		}
	}
	const fences = closeIndex > 0;
	const entries = [];
	const unsupportedLines = [];

	if (fences) {
		let i = 1;
		while (i < closeIndex) {
			const line = lines[i].text;
			if (!line.trim() || /^[ \t]*#/.test(line)) {
				i++;
				continue;
			}
			const m = KEY_RE.exec(line);
			if (!m) {
				unsupportedLines.push({ index: i, text: line, reason: "unparsed" });
				i++;
				continue;
			}
			const key = m[1];
			const valueText = (m[2] ?? "").trim();
			if (valueText !== "") {
				const parsed = parseScalarText(valueText);
				entries.push({
					key,
					start: i,
					end: i,
					shape: parsed.shape,
					style: parsed.style,
					value: parsed.value,
					editable: parsed.editable,
					reason: parsed.reason ?? null,
				});
				i++;
				continue;
			}
			// 块形态：收集缩进续行，块序列可读，块映射/块标量不支持改写。
			let j = i + 1;
			let last = i;
			const cont = [];
			while (j < closeIndex) {
				const t = lines[j].text;
				if (!t.trim()) {
					j++;
					continue;
				}
				if (/^[ \t]+\S/.test(t) || SEQ_RE.test(t) || SEQ_EMPTY_RE.test(t)) {
					cont.push({ index: j, text: t });
					last = j;
					j++;
					continue;
				}
				break;
			}
			let shape = "empty";
			let value = null;
			let editable = true;
			let reason = null;
			if (cont.length > 0) {
				const items = [];
				let allSeq = true;
				for (const c of cont) {
					const sm = SEQ_RE.exec(c.text) ?? SEQ_EMPTY_RE.exec(c.text);
					if (!sm) {
						allSeq = false;
						break;
					}
					const itemText = (sm[1] ?? "").trim();
					if (itemText === "") {
						items.push(null);
						continue;
					}
					if (/^[^"'{[]*:(?:\s|$)/.test(itemText)) {
						allSeq = false;
						break;
					}
					const item = parseScalarText(itemText);
					if (!item.editable || item.shape === "array" || item.shape === "map") {
						allSeq = false;
						break;
					}
					items.push(item.value);
				}
				if (allSeq) {
					shape = "sequence";
					value = items;
				} else {
					shape = "block";
					editable = false;
					reason = "block-mapping-or-scalar";
				}
			}
			entries.push({
				key,
				start: i,
				end: last,
				shape,
				style: shape === "sequence" ? "sequence" : "empty",
				value,
				editable,
				reason,
			});
			i = last + 1;
		}
	}

	const data = {};
	const order = [];
	const duplicates = [];
	const seen = new Set();
	for (const entry of entries) {
		if (seen.has(entry.key)) duplicates.push(entry.key);
		seen.add(entry.key);
		if (!order.includes(entry.key)) order.push(entry.key);
		data[entry.key] = entry.value;
	}

	const body = fences
		? lines
				.slice(closeIndex + 1)
				.map((line) => line.text + line.eol)
				.join("")
		: raw;

	return {
		raw,
		lines,
		eol,
		fences,
		closeIndex,
		entries,
		unsupportedLines,
		data,
		order,
		duplicates,
		body,
	};
}

export function sameValue(a, b) {
	if (a === b) return true;
	if (typeof a !== typeof b) return false;
	if (a === null || b === null) return false;
	if (Array.isArray(a) || Array.isArray(b)) {
		if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
		return a.every((item, i) => sameValue(item, b[i]));
	}
	if (typeof a === "object") {
		const ka = Object.keys(a);
		const kb = Object.keys(b);
		if (ka.length !== kb.length) return false;
		return ka.every((key) => Object.hasOwn(b, key) && sameValue(a[key], b[key]));
	}
	return false;
}

function isPlainObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function quoteKey(key) {
	return /^[A-Za-z_][A-Za-z0-9_-]*$/.test(key) ? key : JSON.stringify(key);
}

function unsupportedValue(message, details) {
	return new ContentError(400, "frontmatter-unsupported", message, details);
}

function serializeScalar(value) {
	if (value === null || value === undefined) {
		throw unsupportedValue("null 只能用于删除键，不能作为嵌套值写入");
	}
	if (Array.isArray(value) || isPlainObject(value)) {
		throw unsupportedValue("不支持嵌套数组/对象写入 frontmatter");
	}
	return serializeValue(value);
}

export function serializeValue(value) {
	if (typeof value === "string") {
		return ISO_DATE_RE.test(value) ? value : JSON.stringify(value);
	}
	if (typeof value === "number") {
		if (!Number.isFinite(value)) throw unsupportedValue("数值必须是有限数");
		return String(value);
	}
	if (typeof value === "boolean") return value ? "true" : "false";
	if (Array.isArray(value)) return `[${value.map(serializeScalar).join(", ")}]`;
	if (isPlainObject(value)) {
		const parts = Object.keys(value).map((key) => `${quoteKey(key)}: ${serializeScalar(value[key])}`);
		return `{${parts.join(", ")}}`;
	}
	throw unsupportedValue(`不支持的值类型: ${typeof value}`);
}

export function serializeEntry(key, value) {
	return `${key}: ${serializeValue(value)}`;
}

// 重写已有键时尽量沿用原始写法（裸标量/单引号），这样把值改回原值后整行字节不变。
function isPlainSafe(value) {
	if (!value || value !== value.trim()) return false;
	if (/^[-?:,\[\]{}#&*!|>'"%@`\s]/.test(value)) return false;
	if (value.includes(": ") || value.includes(" #") || value.endsWith(":")) return false;
	if (/^(?:true|True|TRUE|false|False|FALSE|null|Null|NULL|~)$/.test(value)) return false;
	return !/^[-+]?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?$/.test(value);
}

function serializeLike(entry, value) {
	if (typeof value === "string" && !/[\n\r]/.test(value)) {
		if (entry.style === "single") return "'" + value.replace(/'/g, "''") + "'";
		if (entry.style === "plain" && isPlainSafe(value)) return value;
	}
	return serializeValue(value);
}

// 键级改写：只重写值真正变化的键所在行；null 表示删除该键。
export function patchFrontmatter(raw, patch) {
	if (patch === null || patch === undefined) return { raw, changedKeys: [] };
	if (!isPlainObject(patch)) {
		throw new ContentError(400, "frontmatter-invalid", "frontmatter 必须是对象");
	}
	const keys = Object.keys(patch);
	const info = parseFrontmatter(raw);

	if (!info.fences) {
		const wanted = keys.filter((key) => patch[key] !== null && patch[key] !== undefined);
		if (wanted.length === 0) return { raw, changedKeys: [] };
		const eol = info.eol;
		const head = ["---", ...wanted.map((key) => serializeEntry(key, patch[key])), "---"]
			.map((line) => line + eol)
			.join("");
		return { raw: `${head}${eol}${info.raw}`, changedKeys: wanted };
	}

	const lines = info.lines.map((line) => ({ ...line }));
	const changed = [];
	const appended = [];

	for (const key of keys) {
		const value = patch[key];
		if (value === undefined) continue;
		const matches = info.entries.filter((entry) => entry.key === key);
		if (matches.length > 1) {
			throw unsupportedValue(`键 ${key} 在 frontmatter 中重复出现，无法安全改写`, { key });
		}
		const entry = matches[0];
		if (value === null) {
			if (!entry) continue;
			for (let i = entry.start; i <= entry.end; i++) lines[i] = null;
			changed.push(key);
			continue;
		}
		if (!entry) {
			appended.push({ key, value });
			changed.push(key);
			continue;
		}
		if (!entry.editable) {
			throw unsupportedValue(
				`键 ${key} 的 YAML 结构（${entry.reason ?? "unsupported"}）不支持改写，请手工编辑该文件`,
				{ key, reason: entry.reason ?? "unsupported" },
			);
		}
		if (sameValue(entry.value, value)) continue;
		const eol = lines[entry.end].eol || info.eol;
		lines[entry.start] = { text: `${key}: ${serializeLike(entry, value)}`, eol };
		for (let i = entry.start + 1; i <= entry.end; i++) lines[i] = null;
		changed.push(key);
	}

	if (appended.length > 0) {
		const block = appended.map((item) => ({
			text: serializeEntry(item.key, item.value),
			eol: info.eol,
		}));
		lines.splice(info.closeIndex, 0, ...block);
	}

	const next = lines.filter((line) => line !== null).map((line) => line.text + line.eol).join("");
	return { raw: next, changedKeys: changed };
}

export function withBody(raw, body) {
	const info = parseFrontmatter(raw);
	if (!info.fences) return typeof body === "string" ? body : "";
	const head = info.lines
		.slice(0, info.closeIndex + 1)
		.map((line) => line.text + line.eol)
		.join("");
	return head + (typeof body === "string" ? body : "");
}

export function buildDocument(fields, body = "", eol = "\n") {
	const keys = Object.keys(fields ?? {}).filter(
		(key) => fields[key] !== null && fields[key] !== undefined,
	);
	const head = ["---", ...keys.map((key) => serializeEntry(key, fields[key])), "---"]
		.map((line) => line + eol)
		.join("");
	return `${head}${eol}${body ?? ""}`;
}
