// 数据：tutorials.json 条目编辑（GET/PUT /api/data/tutorials）。
// 备份：GET /api/backups 列表 + 每个快照的恢复按钮（先确认再 POST /api/backups/:id/restore）。
import { api } from "../api.mjs";
import { h, clear, clone, field, textInput, bytesText, writeResult, wire, announce, confirmDialog, errorBox } from "../components/dom.mjs";

export const views = [
	{ key: "data", label: "数据", mount: mountTutorials },
	{ key: "backups", label: "备份", mount: mountBackups }
];

function moveItem(list, index, delta) {
	const target = index + delta;
	if (target < 0 || target >= list.length) return false;
	const item = list[index];
	list.splice(index, 1);
	list.splice(target, 0, item);
	return true;
}

function formatTime(value) {
	if (value === undefined || value === null) return "未知时间";
	const date = typeof value === "number" ? new Date(value) : new Date(String(value));
	if (Number.isNaN(date.getTime())) return String(value);
	return date.toLocaleString("zh-CN", { hour12: false });
}

async function mountTutorials(host) {
	host.append(h("p", { class: "muted small" }, "加载 tutorials.json…"));
	const loaded = await api.getData("tutorials");
	const doc = clone(loaded) || {};
	if (!doc.tutorials || typeof doc.tutorials !== "object") doc.tutorials = { title: "", subtitle: "", entries: [] };
	if (!Array.isArray(doc.tutorials.entries)) doc.tutorials.entries = [];

	const title = textInput(doc.tutorials.title);
	const subtitle = textInput(doc.tutorials.subtitle);
	title.addEventListener("input", function () { doc.tutorials.title = title.value; });
	subtitle.addEventListener("input", function () { doc.tutorials.subtitle = subtitle.value; });
	const entriesHost = h("div");
	const errorHost = h("div");
	const resultHost = h("div");

	function renderEntries() {
		clear(entriesHost);
		if (!doc.tutorials.entries.length) entriesHost.append(h("p", { class: "muted small" }, "还没有教程条目。" ));
		doc.tutorials.entries.forEach(function (entry, index) {
			const slug = textInput(entry.slug, { class: "mono" });
			const entryTitle = textInput(entry.title);
			const description = textInput(entry.description);
			const category = textInput(entry.category);
			const published = textInput(entry.published, { placeholder: "2026-07-14" });
			slug.addEventListener("input", function () { entry.slug = slug.value; });
			entryTitle.addEventListener("input", function () { entry.title = entryTitle.value; });
			description.addEventListener("input", function () { entry.description = description.value; });
			category.addEventListener("input", function () { entry.category = category.value; });
			published.addEventListener("input", function () { entry.published = published.value; });
			const up = h("button", { type: "button", class: "tiny" }, "↑");
			const down = h("button", { type: "button", class: "tiny" }, "↓");
			const remove = h("button", { type: "button", class: "tiny danger" }, "删除");
			up.addEventListener("click", function () { if (moveItem(doc.tutorials.entries, index, -1)) renderEntries(); });
			down.addEventListener("click", function () { if (moveItem(doc.tutorials.entries, index, 1)) renderEntries(); });
			remove.addEventListener("click", function () { doc.tutorials.entries.splice(index, 1); renderEntries(); });
			entriesHost.append(h("div", { class: "gallery-row" },
				h("div", { class: "row" }, h("strong", null, "第 " + (index + 1) + " 条"), up, down, remove),
				h("div", { class: "row" },
					field("slug", slug),
					field("标题 title", entryTitle),
					field("分类 category", category),
					field("发布时间 published", published)),
				field("描述 description", description)));
		});
	}
	renderEntries();

	const addButton = h("button", { type: "button" }, "新增条目");
	addButton.addEventListener("click", function () {
		doc.tutorials.entries.push({ slug: "", title: "", description: "", category: "", published: "" });
		renderEntries();
	});

	const saveButton = h("button", { type: "button", class: "primary" }, "保存 tutorials.json");
	wire(saveButton, errorHost, async function () {
		clear(resultHost);
		const data = await api.putData("tutorials", doc);
		announce("已写入 src/data/tutorials.json");
		resultHost.append(writeResult({ backupId: data.backupId }, function () { return remount(host, mountTutorials); }));
	});

	clear(host);
	host.append(h("section", { class: "card" },
		h("h3", null, "教程 tutorials.json"),
		field("标题", title),
		field("副标题", subtitle),
		entriesHost,
		h("div", { class: "row" }, addButton, saveButton),
		errorHost,
		resultHost));
}

async function mountBackups(host) {
	host.append(h("p", { class: "muted small" }, "加载备份列表…"));
	const backups = await api.getBackups();
	const errorHost = h("div");
	const resultHost = h("div");
	const listHost = h("div");

	function renderList() {
		clear(listHost);
		if (!Array.isArray(backups) || !backups.length) {
			listHost.append(h("p", { class: "muted small" }, "还没有备份。" ));
			return;
		}
		for (const snapshot of backups) {
			const files = Array.isArray(snapshot.files) ? snapshot.files : [];
			const restoreButton = h("button", { type: "button", class: "danger" }, "恢复此快照");
			wire(restoreButton, errorHost, async function () {
				const ok = await confirmDialog(
					"将把 " + files.length + " 个文件恢复到备份 " + snapshot.id + " 时的内容（当前内容会先被再次快照）。这会覆盖现有文件，确定继续？",
					"确认恢复");
				if (!ok) return;
				clear(resultHost);
				const data = await api.restoreBackup(snapshot.id);
				announce("已恢复 " + (Array.isArray(data.restored) ? data.restored.length : 0) + " 个文件");
				resultHost.append(writeResult({ restored: data.restored }, null));
			});
			const fileList = h("ul", { class: "path-list" }, files.map(function (file) {
				return h("li", null, h("code", null, file.path), " · " + bytesText(file.bytes));
			}));
			listHost.append(h("section", { class: "card" },
				h("div", { class: "row" },
					h("strong", null, snapshot.id),
					h("span", { class: "muted small" }, formatTime(snapshot.createdAt)),
					h("span", { class: "muted small" }, files.length + " 个文件")),
				snapshot.reason ? h("p", { class: "muted small" }, "原因：" + snapshot.reason) : null,
				h("details", null, h("summary", null, "文件清单"), fileList),
				h("div", { class: "row" }, restoreButton)));
		}
	}
	renderList();

	clear(host);
	host.append(
		h("p", { class: "muted small" }, "共 " + (Array.isArray(backups) ? backups.length : 0) + " 个快照，最新的在最前面。"),
		errorHost,
		resultHost,
		listHost);
}

async function remount(host, mountFn) {
	clear(host);
	await mountFn(host);
}
