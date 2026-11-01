// 底部提示框：5 秒后淡出，sticky 状态常驻。
import assert from "node:assert/strict";
import test from "node:test";

class FakeClassList {
	constructor() { this.set = new Set(); }
	add() { for (const name of arguments) this.set.add(name); }
	remove() { for (const name of arguments) this.set.delete(name); }
	contains(name) { return this.set.has(name); }
}

const region = { textContent: "", classList: new FakeClassList() };
globalThis.document = {
	getElementById: function (id) { return id === "status-region" ? region : null; }
};

const dom = await import("../ui/components/dom.mjs");
const announce = dom.announce;
const FADE = dom.STATUS_FADE_MS;
const OUT = dom.STATUS_FADE_OUT_MS;

test("defaults are 5 seconds then a sub-second fade", () => {
	assert.equal(FADE, 5000);
	assert.ok(OUT > 0 && OUT <= 1000);
});

test("a plain message disappears after 5 seconds", (t) => {
	t.mock.timers.enable({ apis: ["setTimeout"] });
	announce("");
	announce("已保存");
	assert.equal(region.textContent, "已保存");
	t.mock.timers.tick(FADE - 1);
	assert.equal(region.classList.contains("is-fading"), false, "5 秒前不该开始淡出");
	t.mock.timers.tick(1);
	assert.equal(region.classList.contains("is-fading"), true, "到 5 秒开始淡出");
	assert.equal(region.textContent, "已保存", "淡出过程中文字仍在");
	t.mock.timers.tick(OUT);
	assert.equal(region.textContent, "", "淡出结束后清空");
	assert.equal(region.classList.contains("is-fading"), false);
});

test("sticky state stays until replaced", (t) => {
	t.mock.timers.enable({ apis: ["setTimeout"] });
	announce("dev server 运行中", { sticky: true });
	t.mock.timers.tick(FADE * 3);
	assert.equal(region.textContent, "dev server 运行中");
	assert.equal(region.classList.contains("is-fading"), false);
	announce("");
	assert.equal(region.textContent, "");
});

test("a newer message restarts the countdown and cancels the old one", (t) => {
	t.mock.timers.enable({ apis: ["setTimeout"] });
	announce("第一条");
	t.mock.timers.tick(FADE - 1000);
	announce("第二条");
	t.mock.timers.tick(FADE - 1);
	assert.equal(region.textContent, "第二条", "旧计时器不应把新消息清掉");
	assert.equal(region.classList.contains("is-fading"), false);
	t.mock.timers.tick(1);
	assert.equal(region.classList.contains("is-fading"), true);
	t.mock.timers.tick(OUT);
	assert.equal(region.textContent, "");
});

test("replacing a fading message clears the fade class", (t) => {
	t.mock.timers.enable({ apis: ["setTimeout"] });
	announce("第一条");
	t.mock.timers.tick(FADE);
	assert.equal(region.classList.contains("is-fading"), true);
	announce("第二条");
	assert.equal(region.textContent, "第二条");
	assert.equal(region.classList.contains("is-fading"), false);
});
