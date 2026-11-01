// 部署：git 状态列表 → 单文件 diff → 提交 → 推送，全部展示 stdout/stderr。
// 预览：POST start / GET status（可见时每 3s 轮询）/ POST stop，iframe 展示 dev server。
import { api } from "../api.mjs";
import {
	h, clear, textareaInput, errorBox, wire, announce, confirmDialog, invalidError
} from "../components/dom.mjs";

export const views = [
	{ key: "deploy", label: "部署", mount: mountDeploy },
	{ key: "preview", label: "预览", mount: mountPreview }
];

function outputPanel(data) {
	if (!data || typeof data !== "object") return h("p", { class: "muted small" }, "没有输出。");
	return h("div", null,
		h("h4", null, "退出码 code：" + String(data.code === undefined ? "?" : data.code)),
		h("pre", { class: "output", tabindex: 0, "aria-label": "stdout" }, data.stdout ? String(data.stdout) : "（stdout 为空）"),
		h("pre", { class: "output", tabindex: 0, "aria-label": "stderr" }, data.stderr ? String(data.stderr) : "（stderr 为空）"));
}

async function mountDeploy(host) {
	const statusHost = h("div");
	const diffHost = h("div");
	const outputHost = h("div");
	const errorHost = h("div");
	const message = textareaInput("", { rows: 3 });
	const commitButton = h("button", { type: "button", class: "primary" }, "提交 commit");
	const pushButton = h("button", { type: "button", class: "danger" }, "推送 push");
	const refreshButton = h("button", { type: "button" }, "刷新状态");
	let status = null;

	function showError(error) {
		clear(errorHost);
		errorHost.append(errorBox(error));
	}

	function renderStatus() {
		clear(statusHost);
		if (!status) return;
		const files = Array.isArray(status.files) ? status.files : [];
		statusHost.append(h("div", { class: "row" },
			h("span", null, "分支 ", h("code", null, status.branch || "?")),
			h("span", null, "远端 ", h("code", null, status.remote || "?")),
			h("span", null, "领先 " + String(status.ahead === undefined ? 0 : status.ahead)),
			h("span", null, "落后 " + String(status.behind === undefined ? 0 : status.behind)),
			h("span", { class: "muted small" }, status.clean ? "工作区干净" : "存在未提交改动")));
		if (!files.length) {
			statusHost.append(h("p", { class: "muted small" }, "没有变更文件。" ));
			return;
		}
		const body = h("tbody");
		for (const file of files) {
			const button = h("button", { type: "button", class: "tiny" }, "查看 diff");
			button.addEventListener("click", function () {
				showDiff(file.path).catch(showError);
			});
			body.append(h("tr", null,
				h("td", null, h("code", null, String(file.status || "?"))),
				h("td", null, h("code", null, file.path)),
				h("td", null, button)));
		}
		statusHost.append(h("table", null,
			h("thead", null, h("tr", null, h("th", { scope: "col" }, "状态"), h("th", { scope: "col" }, "文件"), h("th", { scope: "col" }, "操作"))),
			body));
	}

	async function showDiff(path) {
		clear(diffHost);
		diffHost.append(h("p", { class: "muted small" }, "读取 " + path + " 的 diff…"));
		const data = await api.getDeployDiff(path);
		clear(diffHost);
		diffHost.append(h("h3", null, "diff · " + path));
		diffHost.append(h("pre", { class: "diff", tabindex: 0 }, data.diff ? String(data.diff) : "（空 diff）"));
	}

	async function loadStatus() {
		clear(outputHost);
		clear(diffHost);
		clear(statusHost);
		statusHost.append(h("p", { class: "muted small" }, "读取 git 状态…"));
		status = await api.getDeployStatus();
		renderStatus();
	}

	wire(refreshButton, errorHost, loadStatus);
	wire(commitButton, errorHost, async function () {
		const text = message.value.trim();
		if (!text) throw invalidError("empty-message", "提交信息不能为空");
		clear(outputHost);
		const data = await api.commit({ message: text });
		announce("已提交 " + data.commit);
		outputHost.append(h("p", { class: "notice" }, "提交成功：" + String(data.commit)));
		if (Array.isArray(data.files)) {
			outputHost.append(h("ul", { class: "path-list" }, data.files.map(function (file) { return h("li", null, typeof file === "string" ? h("code", null, file) : JSON.stringify(file)); })));
		}
		message.value = "";
		status = await api.getDeployStatus();
		renderStatus();
	});

	wire(pushButton, errorHost, async function () {
		const ok = await confirmDialog("将把当前分支推送到远端 " + (status && status.remote ? status.remote : "（未知远端）") + "，这会写入远程仓库。确定推送？", "推送");
		if (!ok) return;
		clear(outputHost);
		const data = await api.push();
		announce("推送结束，退出码 " + String(data.code));
		outputHost.append(outputPanel(data));
		status = await api.getDeployStatus();
		renderStatus();
	});

	clear(host);
	host.append(
		h("section", { class: "card" }, h("h3", null, "仓库状态"), statusHost, h("div", { class: "row" }, refreshButton)),
		diffHost,
		h("section", { class: "card" },
			h("h3", null, "提交与推送"),
			h("label", { class: "field" }, h("span", { class: "field-label" }, "提交信息 message"), message),
			h("div", { class: "row" }, commitButton, pushButton),
			errorHost,
			outputHost));
	await loadStatus();
}

async function mountPreview(host) {
	const stateHost = h("div");
	const frameHost = h("div");
	const errorHost = h("div");
	const logHost = h("pre", { class: "log", tabindex: 0, "aria-label": "dev server 日志" });
	const startButton = h("button", { type: "button", class: "primary" }, "启动预览");
	const stopButton = h("button", { type: "button", class: "danger" }, "停止预览");
	const refreshButton = h("button", { type: "button" }, "刷新状态");
	let status = null;
	let timer = null;
	let frameKey = null;

	function renderState() {
		clear(stateHost);
		const running = Boolean(status && status.running);
		stateHost.append(h("div", { class: "row" },
			h("strong", null, running ? "dev server 运行中" : "dev server 未运行"),
			running && status.url ? h("span", null, "地址 ", h("code", null, status.url)) : null,
			running && status.pid ? h("span", { class: "muted small" }, "pid " + String(status.pid)) : null));
		const key = running && status.url ? String(status.url) : "";
		if (key !== frameKey) {
			frameKey = key;
			clear(frameHost);
			if (key) {
				frameHost.append(h("iframe", { class: "preview-frame", src: key, title: "Astro 预览 iframe" }));
			} else {
				frameHost.append(h("p", { class: "muted small" }, "启动成功后在这里嵌入 dev server 页面。" ));
			}
		}
		const lines = status && Array.isArray(status.lines) ? status.lines : [];
		logHost.textContent = lines.length ? lines.join("\n") : "（日志为空）";
	}

	async function refreshStatus() {
		status = await api.getPreviewStatus();
		renderState();
	}

	function startPolling() {
		if (timer) return;
		timer = window.setInterval(function () {
			if (document.hidden) return;
			refreshStatus().catch(function () {});
		}, 3000);
	}

	function stopPolling() {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	}

	function onVisibility() {
		if (!document.hidden) refreshStatus().catch(function () {});
	}
	document.addEventListener("visibilitychange", onVisibility);
	startPolling();

	// 状态区只留终态文案：启动/停止无论成功失败都要落到中性或失败文案，避免「正在启动…」长期挂着。
	function announceTerminal(text) {
		announce(text);
	}

	wire(startButton, errorHost, async function () {
		announce("正在启动 dev server，最多等待 90 秒…", { sticky: true });
		try {
			await api.startPreview();
			status = await api.getPreviewStatus();
			renderState();
			announce(status && status.running ? "dev server 已启动" : "dev server 未运行", { sticky: true });
		} catch (error) {
			await refreshStatus().catch(function () {});
			const code = error && error.code ? error.code : "error";
			announceTerminal("启动失败（" + code + "），dev server 未运行");
			throw error;
		}
	});

	wire(stopButton, errorHost, async function () {
		const ok = await confirmDialog("确定停止 dev server 进程？", "停止");
		if (!ok) {
			announce(status && status.running ? "dev server 运行中" : "dev server 未运行", { sticky: true });
			return;
		}
		try {
			await api.stopPreview();
			status = await api.getPreviewStatus();
			renderState();
			announce("dev server 未运行", { sticky: true });
		} catch (error) {
			await refreshStatus().catch(function () {});
			const code = error && error.code ? error.code : "error";
			announceTerminal("停止失败（" + code + "），请点击刷新状态确认");
			throw error;
		}
	});

	wire(refreshButton, errorHost, refreshStatus);

	clear(host);
	host.append(
		h("section", { class: "card" },
			h("h3", null, "Astro dev server"),
			stateHost,
			h("div", { class: "row" }, startButton, stopButton, refreshButton),
			errorHost),
		frameHost,
		h("section", { class: "card" }, h("h3", null, "日志尾部（最多 200 行）"), logHost));

	await refreshStatus().catch(function (error) {
		errorHost.append(errorBox(error));
	});

	return function cleanup() {
		stopPolling();
		document.removeEventListener("visibilitychange", onVisibility);
	};
}
