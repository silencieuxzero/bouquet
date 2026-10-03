// ============================================================================
// 密码输入
// ============================================================================
// 优先读取环境变量 POST_PASSWORD，否则在交互式终端中询问。
// ============================================================================
import { createInterface } from "node:readline/promises";

export async function resolvePassword() {
	if (process.env.POST_PASSWORD) return process.env.POST_PASSWORD;

	if (!process.stdin.isTTY) {
		throw new Error(
			"未提供密码。请设置环境变量 POST_PASSWORD，或在终端中交互式运行。",
		);
	}
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	try {
		const answer = await rl.question("请输入加密密码: ");
		if (!answer) throw new Error("密码不能为空");
		return answer;
	} finally {
		rl.close();
	}
}
