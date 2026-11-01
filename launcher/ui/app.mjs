// 单页应用外壳：侧边栏 + hash 路由 + 视图挂载。
import * as appearance from "./views/appearance.mjs";
import * as images from "./views/images.mjs";
import * as personal from "./views/personal.mjs";
import * as media from "./views/media.mjs";
import * as articles from "./views/articles.mjs";
import * as encrypt from "./views/encrypt.mjs";
import * as misc from "./views/misc.mjs";
import * as deploy from "./views/deploy.mjs";
import * as settings from "./views/settings.mjs";
import { h, clear, errorBox } from "./components/dom.mjs";
import { loadTheme } from "./theme.mjs";
import { createNavIcon } from "./icons.mjs";

const MODULES = [appearance, images, personal, media, articles, encrypt, misc, deploy, settings];

const SECTIONS = MODULES.reduce(function (all, module) {
	return all.concat(module.views || []);
}, []);

const navList = document.getElementById("nav-list");
const main = document.getElementById("view");
let cleanup = null;

function readKey() {
	const raw = window.location.hash.replace(/^#\/?/, "");
	return raw || SECTIONS[0].key;
}

function renderNav(activeKey) {
	clear(navList);
	for (const section of SECTIONS) {
		const icon = createNavIcon(section.key) || h("span", { class: "nav-icon", "aria-hidden": "true" }, "•");
		const link = h("a", { href: "#/" + section.key }, icon, h("span", { class: "nav-text" }, section.label));
		if (section.key === activeKey) link.setAttribute("aria-current", "page");
		navList.append(h("li", null, link));
	}
}

async function render() {
	if (typeof cleanup === "function") {
		try {
			cleanup();
		} catch (error) {
			console.warn("视图清理失败", error);
		}
	}
	cleanup = null;
	const key = readKey();
	const section = SECTIONS.find(function (item) { return item.key === key; }) || SECTIONS[0];
	renderNav(section.key);
	clear(main);
	main.append(h("h2", { class: "view-title" }, section.label));
	const host = h("div", { class: "view-body" });
	main.append(host);
	document.title = section.label + " · 博客本地启动器";
	if (window.location.hash !== "#/" + section.key) {
		window.history.replaceState(null, "", "#/" + section.key);
	}
	try {
		const result = await section.mount(host);
		if (typeof result === "function") cleanup = result;
	} catch (error) {
		host.append(errorBox(error));
	}
	main.focus({ preventScroll: true });
}

window.addEventListener("hashchange", function () {
	render();
});

loadTheme()
	.catch(function (error) {
		console.warn("读取外观设置失败，使用默认外观", error);
	})
	.then(render);
