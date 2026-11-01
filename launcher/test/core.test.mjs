import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { ROOT, fromRoot, rel } from "../core/paths.mjs";
import { CONFIG_REL, planPatch, readValues, verifyPatch, unifiedDiff, parsePath } from "../core/config-ast.mjs";
import { snapshot, restore } from "../core/backup.mjs";
import { listDir, listImages, isImagePath, imageMime } from "../core/upload.mjs";

const original = await fs.readFile(fromRoot(CONFIG_REL), "utf8");
const before = readValues(original);

test("nested property patch rewrites a single literal", () => {
	const edits = [{ path: "siteConfig.banner.height", value: 37 }];
	const { next, changed } = planPatch(original, edits);
	assert.deepEqual(changed, ["siteConfig.banner.height"]);
	assert.equal(readValues(next).site.banner.height, 37);
	assert.equal(readValues(next).site.title, before.site.title);
	const diff = unifiedDiff(original, next, CONFIG_REL).split("\n");
	const minus = diff.filter((line) => line.startsWith("-") && !line.startsWith("---"));
	const plus = diff.filter((line) => line.startsWith("+") && !line.startsWith("+++"));
	assert.deepEqual(minus, ["-\t\theight: 35,"]);
	assert.deepEqual(plus, ["+\t\theight: 37,"]);
	assert.equal(verifyPatch(original, next, edits).siteConfig.banner.height, 37);
});

test("array index patch keeps the rest of the array", () => {
	const edits = [{ path: "musicConfig.songs[0].title", value: "TEST TITLE" }];
	const { next } = planPatch(original, edits);
	const songs = readValues(next).music.songs;
	assert.equal(songs.length, before.music.songs.length);
	assert.equal(songs[0].title, "TEST TITLE");
	assert.equal(songs[0].url, before.music.songs[0].url);
	assert.deepEqual(songs[1], before.music.songs[1]);
});

test("whole array replacement swaps the values but not the neighbours", () => {
	const edits = [{ path: "musicConfig.songs", value: [{ url: "/a.mp3", title: "A" }, { url: "/b.mp3", title: "B" }] }];
	const { next } = planPatch(original, edits);
	const parsed = readValues(next);
	assert.deepEqual(parsed.music.songs, [{ url: "/a.mp3", title: "A" }, { url: "/b.mp3", title: "B" }]);
	assert.equal(parsed.music.loopMode, before.music.loopMode);
	assert.deepEqual(parsed.site, before.site);
	assert.deepEqual(verifyPatch(original, next, edits).musicConfig.songs, parsed.music.songs);
});

test("__ref is emitted for non-literal expressions", () => {
	const nav = readValues(original).nav;
	assert.ok(Array.isArray(nav));
	assert.equal(nav[0].__ref, "LinkPreset.Home");
	assert.equal(nav[0].name, undefined);
});

test("unknown and malformed paths are rejected without touching the source", () => {
	assert.throws(() => parsePath("bad..x"), (err) => err.code === "config-path-invalid");
	assert.throws(() => parsePath("musicConfig.songs.0.title"), (err) => err.code === "config-path-invalid");
	assert.deepEqual(parsePath("navBarConfig.links[1].name"), { root: "navBarConfig", segs: ["links", 1, "name"] });
	assert.throws(() => planPatch(original, [{ path: "siteConfig.nope", value: 1 }]), (err) => err.code === "config-path-unknown");
	assert.equal(readValues(original).site.banner.height, 35);
});

test("listDir exposes private/source read-only but still refuses arbitrary dirs", async () => {
	const uploads = await listDir("public");
	assert.ok(Array.isArray(uploads), "public stays listable for uploads");
	await assert.rejects(() => listDir("src"), (err) => err.code === "dir-invalid");
	await assert.rejects(() => listDir("../etc"), (err) => err.code === "dir-invalid");
	const plaintext = await listDir("private/source");
	assert.ok(Array.isArray(plaintext), "private/source is listable so the encrypt panel can show readable slugs");
	for (const entry of plaintext) assert.match(entry.name, /\.md$/i);
});

test("listImages walks public recursively and only returns image files", async () => {
	const images = await listImages("public");
	assert.ok(Array.isArray(images) && images.length > 0, "public should contain images");
	for (const entry of images) {
		assert.ok(isImagePath(entry.path), entry.path + " should be an image");
		assert.ok(entry.path.startsWith("public/"), entry.path + " should stay under public");
		assert.ok(Number.isInteger(entry.bytes) && entry.bytes > 0, entry.path + " should carry a size");
	}
	assert.equal(imageMime("/x/y.PNG"), "image/png");
	assert.equal(isImagePath("src/config.ts"), false);
	await assert.rejects(() => listImages("src"), (err) => err.code === "dir-invalid");
});

test("snapshot then restore returns byte-identical content", async () => {
	const dirRel = ".launcher/tmp/backup-test";
	const fileRel = dirRel + "/keep.txt";
	await fs.mkdir(fromRoot(dirRel), { recursive: true });
	const payload = "line one\r\nline two\n\u4e2d\u6587\n";
	await fs.writeFile(fromRoot(fileRel), payload, "utf8");
	const bytes = (await fs.readFile(fromRoot(fileRel))).length;
	const snapshotInfo = await snapshot([fileRel], "core.test.mjs");
	const entry = snapshotInfo.files.find((item) => item.path === fileRel);
	assert.ok(entry, "snapshot records the file");
	assert.equal(entry.bytes, bytes);
	await fs.writeFile(fromRoot(fileRel), "clobbered", "utf8");
	const result = await restore(snapshotInfo.id);
	assert.ok(result.restored.includes(fileRel));
	assert.equal(await fs.readFile(fromRoot(fileRel), "utf8"), payload);
	assert.equal(rel(fromRoot(fileRel)).replace(/\\/g, "/"), fileRel);
	assert.equal(path.isAbsolute(fromRoot(fileRel)), true);
	assert.ok(fromRoot(fileRel).startsWith(ROOT));
	await fs.rm(fromRoot(dirRel), { recursive: true, force: true });
});
