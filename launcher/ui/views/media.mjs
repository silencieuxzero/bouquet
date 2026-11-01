// 音乐与画廊：musicConfig 用可增删排序的歌曲列表编辑（另有原始 JSON 兜底），
// gallery.json 走 GET/PUT /api/data/gallery，图片可上传到 public 并自动填入 src。
import { api } from "../api.mjs";
import {
	h, clear, clone, diffEdits, field, textInput, selectInput, numberInput, checkboxRow,
	uploadInput, writeResult, wire, announce, invalidError, readJsonField, textareaInput
} from "../components/dom.mjs";

export const views = [{ key: "media", label: "音乐与画廊", mount: mount }];

function moveItem(list, index, delta) {
	const target = index + delta;
	if (target < 0 || target >= list.length) return false;
	const item = list[index];
	list.splice(index, 1);
	list.splice(target, 0, item);
	return true;
}

function buildMusicSection(config, remount) {
	const original = clone(config.music || {});
	const baseline = {
		loopMode: original.loopMode === undefined ? "all" : original.loopMode,
		autoplay: Boolean(original.autoplay),
		volume: original.volume === undefined ? 0.3 : original.volume,
		songs: Array.isArray(original.songs) ? original.songs : []
	};
	const songs = clone(baseline.songs);
	const listHost = h("div");
	const errorHost = h("div");
	const resultHost = h("div");
	const loopMode = selectInput(baseline.loopMode, ["none", "one", "all"]);
	const autoplayRow = checkboxRow("自动播放 autoplay", baseline.autoplay);
	const autoplay = autoplayRow.input;
	const volume = numberInput(baseline.volume, { min: 0, max: 1, step: 0.05 });
	const rawArea = textareaInput(JSON.stringify(baseline, null, "\t"), { rows: 12, class: "mono" });

	function renderRows() {
		clear(listHost);
		if (!songs.length) listHost.append(h("p", { class: "muted small" }, "还没有歌曲，点「新增歌曲」开始。"));
		songs.forEach(function (song, index) {
			const title = textInput(song.title, { placeholder: "标题" });
			const url = textInput(song.url, { placeholder: "/music/xxx.mp3", class: "mono" });
			title.addEventListener("input", function () { song.title = title.value; });
			url.addEventListener("input", function () { song.url = url.value; });
			const up = h("button", { type: "button", class: "tiny", "aria-label": "上移第 " + (index + 1) + " 首" }, "↑");
			const down = h("button", { type: "button", class: "tiny", "aria-label": "下移第 " + (index + 1) + " 首" }, "↓");
			const remove = h("button", { type: "button", class: "tiny danger" }, "删除");
			up.addEventListener("click", function () { if (moveItem(songs, index, -1)) renderRows(); });
			down.addEventListener("click", function () { if (moveItem(songs, index, 1)) renderRows(); });
			remove.addEventListener("click", function () { songs.splice(index, 1); renderRows(); });
			listHost.append(h("div", { class: "song-row" },
				field("第 " + (index + 1) + " 首 · 标题", title),
				field("地址 url", url),
				h("div", { class: "row" }, up, down, remove)));
		});
	}
	renderRows();

	const addButton = h("button", { type: "button" }, "新增歌曲");
	addButton.addEventListener("click", function () {
		songs.push({ title: "", url: "" });
		renderRows();
	});
	const applyRawButton = h("button", { type: "button" }, "从 JSON 应用");
	const rawErrors = h("div");
	wire(applyRawButton, rawErrors, async function () {
		const parsed = readJsonField(rawArea, "musicConfig");
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			throw invalidError("invalid-value", "musicConfig 必须是对象");
		}
		songs.length = 0;
		for (const song of Array.isArray(parsed.songs) ? parsed.songs : []) songs.push({ title: song.title || "", url: song.url || "" });
		if (parsed.loopMode !== undefined) loopMode.value = String(parsed.loopMode);
		if (parsed.autoplay !== undefined) autoplay.checked = Boolean(parsed.autoplay);
		if (parsed.volume !== undefined) volume.value = String(parsed.volume);
		renderRows();
		announce("已按 JSON 更新表单，点保存写入 src/config.ts");
	});

	const saveButton = h("button", { type: "button", class: "primary" }, "保存 musicConfig");
	wire(saveButton, errorHost, async function () {
		clear(resultHost);
		const after = { loopMode: loopMode.value, autoplay: autoplay.checked, volume: Number(volume.value), songs: clone(songs) };
		if (!Number.isFinite(after.volume)) throw invalidError("invalid-value", "音量必须是数字");
		const diff = diffEdits("musicConfig", baseline, after);
		if (diff.unsupported.length) throw invalidError("unsupported-edit", "无法写入的改动：" + diff.unsupported.join("、"));
		if (!diff.edits.length) {
			announce("没有变更");
			resultHost.append(h("p", { class: "notice" }, "歌曲列表与当前配置一致。"));
			return;
		}
		const data = await api.patchConfig(diff.edits);
		announce("已保存音乐配置");
		resultHost.append(writeResult(data, remount));
	});

	return h("section", { class: "card" },
		h("h3", null, "音乐播放器 musicConfig"),
		h("p", { class: "muted small" }, "歌曲按列表顺序播放；音频文件放在 public/music/ 下，url 以 /music/ 开头。"),
		h("div", { class: "row" }, field("循环模式 loopMode", loopMode), field("音量 volume", volume), h("div", null, autoplayRow.node)),
		listHost,
		h("div", { class: "row" }, addButton, saveButton),
		h("details", { class: "card" }, h("summary", null, "高级：直接编辑 musicConfig JSON（一般不需要，改歌曲请用上面的表单）"), field("JSON", rawArea), h("div", { class: "row" }, applyRawButton), rawErrors),
		errorHost,
		resultHost);
}

function buildGallerySection(rawDocument, remount) {
	const doc = clone(rawDocument) || {};
	if (!doc.gallery || typeof doc.gallery !== "object") doc.gallery = { title: "", subtitle: "", images: [] };
	if (!Array.isArray(doc.gallery.images)) doc.gallery.images = [];
	const imagesHost = h("div");
	const errorHost = h("div");
	const resultHost = h("div");
	const title = textInput(doc.gallery.title);
	const subtitle = textInput(doc.gallery.subtitle);
	title.addEventListener("input", function () { doc.gallery.title = title.value; });
	subtitle.addEventListener("input", function () { doc.gallery.subtitle = subtitle.value; });

	function renderImages() {
		clear(imagesHost);
		if (!doc.gallery.images.length) imagesHost.append(h("p", { class: "muted small" }, "画廊为空。" ));
		doc.gallery.images.forEach(function (image, index) {
			const thumb = h("img", { class: "thumb", alt: image.alt || "", src: image.src || "" });
			const src = textInput(image.src, { placeholder: "/图片.jpg 或 https://…", class: "mono" });
			const alt = textInput(image.alt);
			const copyright = textInput(image.copyright);
			const source = textInput(image.source, { class: "mono" });
			src.addEventListener("input", function () { image.src = src.value; thumb.src = src.value; });
			alt.addEventListener("input", function () { image.alt = alt.value; thumb.alt = alt.value; });
			copyright.addEventListener("input", function () { image.copyright = copyright.value; });
			source.addEventListener("input", function () { image.source = source.value; });
			const up = h("button", { type: "button", class: "tiny" }, "↑");
			const down = h("button", { type: "button", class: "tiny" }, "↓");
			const remove = h("button", { type: "button", class: "tiny danger" }, "删除");
			up.addEventListener("click", function () { if (moveItem(doc.gallery.images, index, -1)) renderImages(); });
			down.addEventListener("click", function () { if (moveItem(doc.gallery.images, index, 1)) renderImages(); });
			remove.addEventListener("click", function () { doc.gallery.images.splice(index, 1); renderImages(); });
			const upload = uploadInput({
				dir: "public",
				label: "上传图片",
				onDone: function (result) {
					const path = result.path || "";
					image.src = path;
					src.value = path;
					thumb.src = path;
					announce("上传完成，src 已填入：" + path);
				}
			});
			imagesHost.append(h("div", { class: "gallery-row" },
				h("div", { class: "row" }, thumb, h("strong", null, "第 " + (index + 1) + " 张"), h("div", { class: "row" }, up, down, remove, upload)),
				field("src 图片地址", src),
				field("alt 替代文本", alt),
				field("copyright 版权", copyright),
				field("source 来源", source)));
		});
	}
	renderImages();

	const addButton = h("button", { type: "button" }, "新增图片");
	addButton.addEventListener("click", function () {
		doc.gallery.images.push({ src: "", alt: "", copyright: "", source: "" });
		renderImages();
	});
	const saveButton = h("button", { type: "button", class: "primary" }, "保存 gallery.json");
	wire(saveButton, errorHost, async function () {
		clear(resultHost);
		const data = await api.putData("gallery", doc);
		announce("已写入 src/data/gallery.json");
		resultHost.append(writeResult({ backupId: data.backupId }, remount));
	});

	return h("section", { class: "card" },
		h("h3", null, "画廊 gallery.json"),
		h("p", { class: "muted small" }, "上传目标目录是 public；服务端返回的路径会直接填入 src，如需要以 / 开头的公开路径请手动调整。"),
		field("标题", title),
		field("副标题", subtitle),
		imagesHost,
		h("div", { class: "row" }, addButton, saveButton),
		errorHost,
		resultHost);
}

async function mount(host) {
	host.append(h("p", { class: "muted small" }, "加载音乐配置与画廊…"));
	const loaded = await Promise.all([api.getConfig(), api.getData("gallery")]);
	clear(host);
	host.append(
		buildMusicSection(loaded[0] || {}, function () { return remount(host); }),
		buildGallerySection(loaded[1] || {}, function () { return remount(host); }));
}

async function remount(host) {
	clear(host);
	await mount(host);
}
