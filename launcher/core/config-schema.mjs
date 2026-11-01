/** Field metadata for the config UI. Paths use the same grammar as /api/config/patch. */

export const FIELDS = [
	{ path: "siteConfig.title", label: "站点标题", type: "string", group: "站点信息" },
	{ path: "siteConfig.subtitle", label: "副标题", type: "text", group: "站点信息" },
	{
		path: "siteConfig.lang",
		label: "语言",
		type: "enum",
		group: "站点信息",
		options: ["en", "zh_CN", "zh_TW", "ja", "ko"],
	},
	{ path: "siteConfig.backgroundImage", label: "背景图", type: "string", group: "站点信息" },

	{ path: "siteConfig.themeColor.hue", label: "主题色相", type: "number", group: "外观主题", min: 0, max: 360, unit: "deg" },
	{ path: "siteConfig.themeColor.fixed", label: "固定主题色（隐藏取色器）", type: "boolean", group: "外观主题" },

	{ path: "siteConfig.banner.enable", label: "启用横幅", type: "boolean", group: "横幅" },
	{ path: "siteConfig.banner.src", label: "横幅图片", type: "string", group: "横幅" },
	{
		path: "siteConfig.banner.position",
		label: "横幅位置",
		type: "enum",
		group: "横幅",
		options: ["top", "center", "bottom"],
	},
	{ path: "siteConfig.banner.height", label: "内页横幅高度", type: "number", group: "横幅", unit: "vh", min: 0, max: 100 },
	{ path: "siteConfig.banner.homeHeight", label: "首页横幅高度", type: "number", group: "横幅", unit: "vh", min: 0, max: 100 },
	{ path: "siteConfig.banner.credit.enable", label: "显示版权信息", type: "boolean", group: "横幅" },
	{ path: "siteConfig.banner.credit.text", label: "版权文本", type: "string", group: "横幅" },
	{ path: "siteConfig.banner.credit.url", label: "版权链接", type: "string", group: "横幅" },

	{ path: "siteConfig.toc.enable", label: "启用目录", type: "boolean", group: "目录" },
	{ path: "siteConfig.toc.depth", label: "目录最大层级", type: "number", group: "目录", min: 1, max: 3 },

	{ path: "siteConfig.favicon", label: "图标列表", type: "json", group: "站点信息" },

	{ path: "navBarConfig.links", label: "导航链接", type: "json", group: "导航与资料" },
	{ path: "profileConfig", label: "个人资料", type: "json", group: "导航与资料" },

	{ path: "licenseConfig", label: "许可协议", type: "json", group: "许可" },

	{ path: "expressiveCodeConfig.theme", label: "代码主题", type: "string", group: "代码主题" },

	{ path: "musicConfig", label: "音乐播放器", type: "json", group: "音乐与画廊" },
];

export function fieldList() {
	return { fields: FIELDS.map((field) => ({ ...field })) };
}
