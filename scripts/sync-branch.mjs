#!/usr/bin/env node
// 把 main 的内容同步到 site / launcher 这两条独立历史分支。
// 用法：node scripts/sync-branch.mjs <site|launcher> [--dry-run] [--push]
// site     = main 去掉 launcher/ 与 start-launcher.cmd 的快照
// launcher = 分支原有文件 + main 的 launcher/ 目录
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const argv = process.argv.slice(2);
const target = argv.find((arg) => arg === "site" || arg === "launcher");
const dryRun = argv.includes("--dry-run");
const push = argv.includes("--push");

if (!target) {
  console.error("用法: node scripts/sync-branch.mjs <site|launcher> [--dry-run] [--push]");
  process.exit(1);
}

const branchRef = "refs/heads/" + target;

function git(args, env) {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    env: env ? { ...process.env, ...env } : process.env,
    maxBuffer: 128 * 1024 * 1024,
  });
}

function gitIn(args, env, input) {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    input,
    env: env ? { ...process.env, ...env } : process.env,
    maxBuffer: 128 * 1024 * 1024,
  });
}

function launcherPaths(ref) {
  return git(["ls-tree", "-r", "--name-only", ref, "--", "launcher"])
    .split("\n")
    .filter(Boolean);
}

function checkedOutAt(ref) {
  const out = git(["worktree", "list", "--porcelain"]);
  let dir = null;
  for (const line of out.split("\n")) {
    if (line.startsWith("worktree ")) dir = line.slice("worktree ".length);
    else if (line === "branch " + ref) return dir;
  }
  return null;
}

const parent = git(["rev-parse", "--verify", branchRef + "^{commit}"]).trim();
const indexPath = path.join(os.tmpdir(), "fuwari-sync-" + process.pid + "-" + Date.now() + ".idx");
const env = { GIT_INDEX_FILE: indexPath };
let tree;
try {
  if (target === "site") {
    git(["read-tree", "main"], env);
    const drop = launcherPaths("main").concat(["start-launcher.cmd"]);
    if (drop.length) gitIn(["update-index", "--force-remove", "--stdin"], env, drop.join("\n") + "\n");
  } else {
    git(["read-tree", branchRef], env);
    const drop = launcherPaths(branchRef);
    if (drop.length) gitIn(["update-index", "--force-remove", "--stdin"], env, drop.join("\n") + "\n");
    const add = git(["ls-tree", "-r", "main", "--", "launcher"])
      .split("\n")
      .filter(Boolean)
      .map((line) => line.replace(/^(\d+) blob ([0-9a-f]+)\t/, "$1 $2\t"))
      .join("\n");
    if (add) gitIn(["update-index", "--add", "--index-info"], env, add + "\n");
  }
  tree = git(["write-tree"], env).trim();
} finally {
  fs.rmSync(indexPath, { force: true });
}

const oldTree = git(["rev-parse", branchRef + "^{tree}"]).trim();
if (tree === oldTree) {
  console.log("[" + target + "] 已与 main 一致，无需提交。");
  process.exit(0);
}

const mainSha = git(["rev-parse", "--short", "main"]).trim();
const mainSubject = git(["log", "-1", "--format=%s", "main"]).trim();
const message =
  "chore(" + target + "): sync snapshot from main (" + mainSha + ")\n\n" + mainSubject + "\n";
const messageFile = path.join(os.tmpdir(), "fuwari-sync-" + process.pid + ".msg");
fs.writeFileSync(messageFile, message);
let commit;
try {
  commit = git(["commit-tree", tree, "-p", parent, "-F", messageFile]).trim();
} finally {
  fs.rmSync(messageFile, { force: true });
}

const stat = git(["diff", "--stat", parent, commit]).trim();
console.log("[" + target + "] " + parent.slice(0, 7) + " -> " + commit.slice(0, 7));
console.log(stat);

if (dryRun) {
  console.log("[" + target + "] --dry-run：未移动分支。");
  process.exit(0);
}

git(["update-ref", branchRef, commit, parent]);
console.log("[" + target + "] 分支已更新到 " + commit.slice(0, 7));

const dir = checkedOutAt(branchRef);
if (dir) console.log("[" + target + "] 该分支签出在 " + dir + "，请在那里执行: git reset --hard " + commit.slice(0, 7));

if (push) {
  console.log(git(["push", "origin", "refs/heads/" + target]));
  console.log("[" + target + "] 已推送到 origin");
}
