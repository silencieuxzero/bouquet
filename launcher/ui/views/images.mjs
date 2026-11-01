// 图片：站点级图片（背景图 / 横幅图 / 头像）+ 图标列表 favicon + public 图片资源库。
// 保存只把变更过的配置路径 POST 到 /api/config/patch，并渲染 diff 与回滚按钮。
import { api, mediaUrl } from "../api.mjs";
import {
	h, clear, clone, configValue, diffEdits, field, textInput, uploadInput,
	writeResult, wire, announce, bytesText
} from "../components/dom.mjs";

export const views = [{ key: "images", label: "图片", mount: mount }];

const SITE_IMAGES = [
	{ path: "siteConfig.backgroundImage", root: "siteConfig", label: "背景图", hint: "全站背景；填 public 内的路径（例如 /scp.jpg），也可以填站外 https 地址。" },
	{ path: "siteConfig.banner.src", root: "siteConfig", label: "横幅图片", hint: "首页大图与内页横幅使用的图片。" },
	{ path: "profileConfig.avatar", root: "profileConfig", label: "头像", hint: "侧边个人资料卡片的头像。" }
];

const FAVICON_PATH = "siteConfig.favicon";
const THEME_OPTIONS = [
	{ value: "", label: "不指定（所有主题都用这张）" },
	{ value: "light", label: "仅浅色主题 light" },
	{ value: "dark", label: "仅深色主题 dark" }
];

// ------------------------------------------------------------ 站点级图片 ----

function previewNode(value) {
	const image = h("img", { class: "image-preview", alt: "预览" });
	image.addEventListener("error", function () { image.style.display = "none"; });
	image.addEventListener("load", function () { image.style.display = ""; });
	setPreview(image, value);
	return image;
}

function setPreview(image, value) {
	const path = String(value || "").trim();
	if (path === "") {
		image.style.display = "none";
		image.removeAttribute("src");
		return;
	}
	image.style.display = "";
	image.setAttribute("src", /^https?:\/\//i.test(path) ? path : mediaUrl(path.replace(/^\//, "")));
}

function imageField(item, initial) {
	const base = typeof initial === "string" ? initial : "";
	const input = textInput(base, { class: "mono", placeholder: "/scp.jpg 或 https://…" });
	const image = previewNode(base);
	input.addEventListener("input", function () { setPreview(image, input.value); });
	const upload = uploadInput({
		dir: "public",
		label: "上传图片到 public",
		onDone: function (result) {
			const path = "/" + String(result.path || "").replace(/^public\//, "");
			input.value = path;
			setPreview(image, path);
			announce("上传完成，已填好路径：" + path + "（记得点保存）");
		}
	});
	return {
		node: h("div", { class: "stack" }, h("div", { class: "row" }, input, upload), image),
		read: function () { return input.value.trim(); },
		set: function (value) { input.value = value; setPreview(image, value); },
		dirty: function () { return input.value.trim() !== base; }
	};
}

function setPath(target, path, value) {
	const parts = String(path).split(".");
	let node = target;
	for (let index = 0; index < parts.length - 1; index += 1) node = node[parts[index]];
	node[parts[parts.length - 1]] = value;
}

function buildSiteImageCard(config, errorHost, resultHost, targets) {
	const controls = SITE_IMAGES.map(function (item) {
		const control = imageField(item, configValue(config, item.path));
		targets.push({ item: item, control: control });
		return { item: item, control: control };
	});
	const saveButton = h("button", { type: "button", class: "primary" }, "保存图片设置");
	wire(saveButton, errorHost, async function () {
		clear(resultHost);
		const byRoot = new Map();
		for (const entry of controls) {
			if (!entry.control.dirty()) continue;
			const root = entry.item.root;
			if (!byRoot.has(root)) {
				byRoot.set(root, {
					before: clone(configValue(config, root)),
					after: clone(configValue(config, root))
				});
			}
			setPath(byRoot.get(root).after, entry.item.path.slice(root.length + 1), entry.control.read());
		}
		const edits = [];
		const unsupported = [];
		for (const [root, pair] of byRoot) {
			const result = diffEdits(root, pair.before, pair.after);
			edits.push(...result.edits);
			unsupported.push(...result.unsupported);
		}
		if (unsupported.length) {
			announce("有不支持的改动");
			resultHost.append(h("p", { class: "error-box" }, "不支持：" + unsupported.join("、" )));
			return;
		}
		if (!edits.length) {
			announce("没有变更");
			resultHost.append(h("p", { class: "notice" }, "没有检测到任何变更。"));
			return;
		}
		const data = await api.patchConfig(edits);
		announce("已保存 " + (Array.isArray(data.changed) ? data.changed.length : edits.length) + " 项");
		resultHost.append(writeResult(data, function () { return remount(targets.host); }));
	});

	return h("section", { class: "card" },
		h("h3", null, "站点图片"),
		h("p", { class: "muted small" }, "背景图、横幅图、头像集中在这里；可以直接上传图片或从下面的资源库挑选。"),
		h("div", { class: "stack" }, controls.map(function (entry) {
			return field(entry.item.label, entry.control.node, entry.item.path + " · " + entry.item.hint);
		})),
		h("div", { class: "row" }, saveButton),
		errorHost,
		resultHost);
}

// ------------------------------------------------------------ 图标列表 -----

function normalizeFavicon(list) {
	return (Array.isArray(list) ? list : []).map(function (item) {
		const source = item && typeof item === "object" ? item : {};
		return {
			src: typeof source.src === "string" ? source.src : "",
			theme: source.theme === "light" || source.theme === "dark" ? source.theme : "",
			sizes: typeof source.sizes === "string" ? source.sizes : ""
		};
	});
}

function buildFavicon(items) {
	return items.map(function (item) {
		const entry = { src: item.src };
		if (item.theme) entry.theme = item.theme;
		if (item.sizes) entry.sizes = item.sizes;
		return entry;
	});
}

function moveItem(list, index, delta) {
	const target = index + delta;
	if (target < 0 || target >= list.length) return false;
	const [item] = list.splice(index, 1);
	list.splice(target, 0, item);
	return true;
}

function buildFaviconCard(config, errorHost, resultHost, mountHost) {
	const items = normalizeFavicon(configValue(config, FAVICON_PATH));
	const baseline = JSON.stringify(buildFavicon(items));
	const listHost = h("div");

	function render() {
		clear(listHost);
		if (!items.length) listHost.append(h("p", { class: "muted small" }, "图标列表为空：站点会回退到主题自带的占位图标。"));
		items.forEach(function (item, index) {
			const src = textInput(item.src, { class: "mono", placeholder: "/favicon.ico 或 /favicon/xxx.png" });
			src.addEventListener("input", function () { item.src = src.value; });
			const theme = h("select", null);
			for (const option of THEME_OPTIONS) {
				const element = h("option", { value: option.value }, option.label);
				if (item.theme === option.value) element.selected = true;
				theme.append(element);
			}
			theme.addEventListener("change", function () { item.theme = theme.value; });
			const sizes = textInput(item.sizes, { placeholder: "留空表示不声明，可填 any 或 32x32" });
			sizes.addEventListener("input", function () { item.sizes = sizes.value; });
			const upload = uploadInput({
				dir: "public",
				label: "上传图标文件",
				onDone: function (result) {
					const path = "/" + String(result.path || "").replace(/^public\//, "");
					item.src = path;
					src.value = path;
					announce("上传完成，图标路径已填入：" + path);
				}
			});
			const up = h("button", { type: "button", class: "tiny", "aria-label": "上移第 " + (index + 1) + " 个图标" }, "↑");
			const down = h("button", { type: "button", class: "tiny", "aria-label": "下移第 " + (index + 1) + " 个图标" }, "↓");
			const remove = h("button", { type: "button", class: "tiny danger" }, "删除");
			up.addEventListener("click", function () { if (moveItem(items, index, -1)) render(); });
			down.addEventListener("click", function () { if (moveItem(items, index, 1)) render(); });
			remove.addEventListener("click", function () { items.splice(index, 1); render(); });
			listHost.append(h("div", { class: "song-row" },
				h("div", { class: "row" }, h("strong", null, "第 " + (index + 1) + " 个图标"), up, down, remove, upload),
				field("图标文件", src),
				field("适用主题", theme),
				field("尺寸 sizes（可留空）", sizes)));
		});
		const addButton = h("button", { type: "button" }, "新增图标");
		addButton.addEventListener("click", function () {
			items.push({ src: "", theme: "", sizes: "" });
			render();
		});
		listHost.append(h("div", { class: "row" }, addButton));
	}
	render();

	const saveButton = h("button", { type: "button", class: "primary" }, "保存图标列表");
	wire(saveButton, errorHost, async function () {
		clear(resultHost);
		const next = buildFavicon(items);
		if (JSON.stringify(next) === baseline) {
			announce("没有变更");
			resultHost.append(h("p", { class: "notice" }, "没有检测到任何变更。"));
			return;
		}
		const data = await api.patchConfig([{ path: FAVICON_PATH, value: next }]);
		announce("已保存图标列表");
		resultHost.append(writeResult(data, function () { return remount(mountHost); }));
	});

	return h("section", { class: "card" },
		h("h3", null, "图标列表 favicon"),
		h("p", { class: "muted small" }, "每个条目只填文件路径；「适用主题」和「尺寸」留空就表示不声明，不需要自己写引号或花括号。"),
		listHost,
		h("div", { class: "row" }, saveButton),
		errorHost,
		resultHost);
}

// ------------------------------------------------------------ 资源库 -------

function buildLibraryCard(targets) {
	const host = h("div");
	const errorHost = h("div");
	const refreshButton = h("button", { type: "button" }, "重新扫描");

	async function load() {
		clear(host);
		host.append(h("p", { class: "muted small" }, "扫描 public 下的图片…"));
		const files = await api.listImages("public");
		clear(host);
		if (!Array.isArray(files) || !files.length) {
			host.append(h("p", { class: "muted small" }, "public 下没有找到图片。" ));
			return;
		}
		host.append(h("p", { class: "muted small" }, "共 " + files.length + " 张图片。点击「设为…」会把路径填进上面的输入框，还需要点保存才会写入配置。"));
		const grid = h("div", { class: "thumb-grid" });
		for (const file of files) {
			const image = h("img", { class: "thumb-image", alt: file.name, loading: "lazy" });
			image.setAttribute("src", mediaUrl(file.path));
			const buttons = h("div", { class: "row" });
			for (const target of targets) {
				const button = h("button", { type: "button", class: "tiny" }, "设为" + target.item.label);
				button.addEventListener("click", function () {
					target.control.set("/" + file.path.replace(/^public\//, ""));
					announce("已填入" + target.item.label + "：" + file.path + "（记得点保存）");
				});
				buttons.append(button);
			}
			grid.append(h("div", { class: "thumb" },
				image,
				h("p", { class: "thumb-path" }, h("code", null, file.path)),
				h("p", { class: "small muted" }, bytesText(file.bytes)),
				buttons));
		}
		host.append(grid);
	}

	refreshButton.addEventListener("click", async function () {
		clear(errorHost);
		try {
			await load();
		} catch (error) {
			errorHost.append(h("p", { class: "error-box" }, error.message));
		}
	});
	return {
		node: h("section", { class: "card" },
			h("h3", null, "图片资源库 public"),
			h("p", { class: "muted small" }, "只列出 public 下的图片文件；需要新图请用上面的上传按钮。" ),
			host,
			h("div", { class: "row" }, refreshButton),
			errorHost),
		load: load
	};
}

// ------------------------------------------------------------ mount --------

async function mount(host) {
	host.append(h("p", { class: "muted small" }, "加载配置…"));
	const config = (await api.getConfig()) || {};
	const targets = [];
	targets.host = host;

	const siteCard = buildSiteImageCard(config, h("div"), h("div"), targets);
	const faviconCard = buildFaviconCard(config, h("div"), h("div"), host);
	const library = buildLibraryCard(targets);

	clear(host);
	host.append(siteCard, faviconCard, library.node);
	await library.load();
}

async function remount(host) {
	clear(host);
	await mount(host);
}
