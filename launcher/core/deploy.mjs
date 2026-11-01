import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import { ROOT, fromRoot, rel } from "./paths.mjs";
import { FailError } from "./http.mjs";
import { killTree } from "./preview.mjs";

const MAX_UNTRACKED_LINES = 200;
const RUNNING = new Set();

function gitEnv() {
	return { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_PAGER: "cat", GIT_OPTIONAL_LOCKS: "0", LC_ALL: "C" };
}

/** Run git in the repo root with prompts disabled and a hard timeout. */
export function runGit(args, options = {}) {
	const timeoutMs = Number.isFinite(options.timeout) ? options.timeout : 60000;
	return new Promise((resolve) => {
		const child = spawn("git", ["--no-pager", ...args], {
			cwd: ROOT,
			env: gitEnv(),
			windowsHide: true,
			stdio: ["ignore", "pipe", "pipe"],
		});
		RUNNING.add(child);
		let stdout = "";
		let stderr = "";
		let timedOut = false;
		const timer = setTimeout(() => {
			timedOut = true;
			if (child.pid) killTree(child.pid);
			else {
				try {
					child.kill("SIGKILL");
				} catch {
					// already gone
				}
			}
		}, timeoutMs);
		child.stdout.on("data", (chunk) => {
			stdout += chunk.toString("utf8");
		});
		child.stderr.on("data", (chunk) => {
			stderr += chunk.toString("utf8");
		});
		child.on("error", (err) => {
			clearTimeout(timer);
			RUNNING.delete(child);
			resolve({ code: -1, stdout, stderr: stderr + err.message, timedOut });
		});
		child.on("close", (code) => {
			clearTimeout(timer);
			RUNNING.delete(child);
			resolve({ code: code === null ? -1 : code, stdout, stderr, timedOut });
		});
	});
}

export function killAll() {
	for (const child of RUNNING) {
		if (child.pid) killTree(child.pid);
	}
	RUNNING.clear();
}

function parseStatusLine(line) {
	const code = line.slice(0, 2);
	const rest = line.slice(3);
	const target = rest.includes(" -> ") ? rest.split(" -> ").pop() : rest;
	return { path: target, status: code.replace(/\s+/g, "") };
}

export async function status() {
	const res = await runGit(["status", "--porcelain=v1", "--branch"]);
	if (res.code !== 0) {
		throw new FailError(409, "git-failed", "git status failed", { stderr: res.stderr });
	}
	const files = [];
	let branch = null;
	let upstream = null;
	let ahead = 0;
	let behind = 0;
	for (const line of res.stdout.split("\n")) {
		if (line === "") continue;
		if (line.startsWith("## ")) {
			const header = line.slice(3);
			const tracking = header.match(/^(.+?)\.\.\.(\S+)(?:\s+\[(.+)\])?$/);
			if (tracking) {
				branch = tracking[1];
				upstream = tracking[2];
				if (tracking[3]) {
					const aheadHit = tracking[3].match(/ahead (\d+)/);
					const behindHit = tracking[3].match(/behind (\d+)/);
					if (aheadHit) ahead = Number(aheadHit[1]);
					if (behindHit) behind = Number(behindHit[1]);
				}
			} else {
				branch = header.replace(/^No commits yet on /, "").replace(/^Initial commit on /, "").trim();
				upstream = null;
			}
			continue;
		}
		files.push(parseStatusLine(line));
	}
	let remote = null;
	const remoteRes = await runGit(["remote", "get-url", "origin"]);
	if (remoteRes.code === 0 && remoteRes.stdout.trim() !== "") remote = remoteRes.stdout.trim();
	return { branch, remote, files, ahead, behind, clean: files.length === 0 };
}

function newFileDiff(repoRel, text) {
	const lines = text.split("\n");
	if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
	const shown = lines.slice(0, MAX_UNTRACKED_LINES);
	const out = [
		"diff --git a/" + repoRel + " b/" + repoRel,
		"new file mode 100644",
		"--- /dev/null",
		"+++ b/" + repoRel,
		"@@ -0,0 +1," + shown.length + " @@",
		...shown.map((line) => "+" + line),
	];
	if (lines.length > shown.length) {
		out.push("# ... truncated: showing first " + shown.length + " of " + lines.length + " lines");
	}
	return out.join("\n") + "\n";
}

export async function diff(repoPath) {
	if (typeof repoPath !== "string" || repoPath.trim() === "") {
		throw new FailError(400, "path-invalid", "query parameter path is required");
	}
	const abs = fromRoot(repoPath);
	const repoRel = rel(abs);
	const tracked = await runGit(["ls-files", "--error-unmatch", "--", repoRel]);
	if (tracked.code === 0) {
		const worktree = await runGit(["diff", "--no-color", "--", repoRel]);
		if (worktree.stdout !== "") return { diff: worktree.stdout };
		const staged = await runGit(["diff", "--cached", "--no-color", "--", repoRel]);
		return { diff: staged.stdout };
	}
	let text;
	try {
		text = await fs.readFile(abs, "utf8");
	} catch (err) {
		if (err.code === "ENOENT") {
			throw new FailError(404, "path-not-found", "no such file: " + repoRel);
		}
		throw err;
	}
	return { diff: newFileDiff(repoRel, text) };
}

export async function commit(message, paths) {
	if (typeof message !== "string" || message.trim() === "") {
		throw new FailError(400, "message-required", "commit message is required");
	}
	const before = await status();
	if (before.files.length === 0) {
		throw new FailError(409, "nothing-to-commit", "the working tree is clean");
	}
	const targets = Array.isArray(paths) && paths.length > 0 ? paths.map((p) => rel(fromRoot(p))) : [];
	if (targets.length > 0) {
		const added = await runGit(["add", "--", ...targets]);
		if (added.code !== 0) {
			throw new FailError(409, "commit-failed", "git add failed", { stderr: added.stderr });
		}
	} else {
		const added = await runGit(["add", "-A"]);
		if (added.code !== 0) {
			throw new FailError(409, "commit-failed", "git add failed", { stderr: added.stderr });
		}
	}
	const args = ["commit", "-m", message];
	if (targets.length > 0) args.push("--", ...targets);
	const committed = await runGit(args, { timeout: 120000 });
	if (committed.code !== 0) {
		throw new FailError(409, "commit-failed", "git commit failed", { stdout: committed.stdout, stderr: committed.stderr });
	}
	const head = await runGit(["rev-parse", "HEAD"]);
	return { commit: head.stdout.trim(), files: before.files.map((file) => file.path) };
}

export async function push() {
	const res = await runGit(["push"], { timeout: 180000 });
	if (res.code !== 0) {
		throw new FailError(409, "push-failed", res.timedOut ? "git push timed out" : "git push failed", {
			code: res.code,
			stdout: res.stdout,
			stderr: res.stderr,
		});
	}
	return { code: res.code, stdout: res.stdout, stderr: res.stderr };
}
