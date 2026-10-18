import {
	BANNER_HEIGHT_DEFAULT,
	BANNER_HEIGHT_HOME_DEFAULT,
} from "./constants/constants";
import galleryData from "./data/gallery.json";
import I18nKey from "./i18n/i18nKey";
import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	MusicConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
	SubGalleryConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "bouquet",
	subtitle: "这里是互联网无尽海洋中的一片星空，欢迎来到这里~",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	backgroundImage: "/scp.jpg", // Full-page background image, relative to /public
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: true,
		// liquid_silk_v01_5120_2880.png, re-encoded to WebP (quality 88) at full
		// 5120x2880: 8.7 MB -> 280 KB with no visible loss, since the artwork is a
		// smooth gradient. Keep the full resolution so 4K/retina screens stay sharp;
		// Astro's <Image> re-optimises this at build time. Original PNG lives in the
		// user's wallpaper folder and is intentionally not committed here.
		src: "assets/images/liquid-silk-banner.webp", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		// 可见的 banner 高度（单位 vh）：内页是一条横带，首页是一整幅大图。
		// 两者相等 = 首页不再特殊处理；extend 会自动按差值推导，不用单独配。
		height: 35,
		homeHeight: 65,
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// This blog's own icons (the blue-haired character artwork), replacing the
		// upstream Fuwari placeholders that src/constants/icon.ts still holds. Leaving
		// this array empty falls back to those placeholders — do not empty it again.
		// There is no separate dark-theme artwork, so no entry sets `theme`: every
		// emitted <link> is unconditional, never media-gated on prefers-color-scheme.
		// No `sizes` on the ICO: the file carries 16/32/48/64/128/256, so any single
		// value would be a false claim. Omitting it emits exactly the classic
		// `<link rel="icon" href="/favicon.ico">`, which is what the legacy site did.
		{ src: "/favicon.ico" },
		{
			src: "/favicon.svg", // Scalable primary icon.
			sizes: "any",
		},
		{ src: "/favicon/favicon-32.png", sizes: "32x32" },
		{ src: "/favicon/favicon-128.png", sizes: "128x128" },
		{ src: "/favicon/favicon-180.png", sizes: "180x180" }, // apple-touch-icon size
		{ src: "/favicon/favicon-192.png", sizes: "192x192" },
		// /favicon/logo-256.png is 256x256 but is the full logo, not an icon size
		// browsers request as a favicon; left unwired deliberately.
	],
};

/**
 * 解析后的 banner 高度（单位 vh），供布局与客户端脚本共用。
 *
 * height / homeHeight 来自上方 siteConfig.banner，留空时回退到 constants.ts 的默认值。
 * extend = homeHeight - height：banner 外壳上移 extend、图再按 position 下移，
 * 净效果是内页只露出 height 高的横带，而首页露出完整的 homeHeight。
 * 把两者配成相同值即可让首页与内页完全一致。
 */
export const bannerHeights = {
	height: siteConfig.banner.height ?? BANNER_HEIGHT_DEFAULT,
	homeHeight: siteConfig.banner.homeHeight ?? BANNER_HEIGHT_HOME_DEFAULT,
};
export const bannerHeightExtend =
	bannerHeights.homeHeight - bannerHeights.height;

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Gallery,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "GitHub",
			url: "https://github.com/silencieuxzero", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
			icon: "fa6-brands:github",
		},
		{
			// Group heading: opens a panel instead of navigating. The label is an i18n key
			// resolved at render time (see src/utils/nav-utils.ts) — never call i18n() at
			// module scope here, translation.ts imports this file.
			key: I18nKey.more,
			icon: "material-symbols:more-horiz",
			children: [
				{
					key: I18nKey.notes,
					url: "/notes/",
					icon: "material-symbols:sticky-note-2-outline-rounded",
				},
				{
					key: I18nKey.oc,
					url: "/settings/",
					icon: "material-symbols:id-card-outline-rounded",
				},
				{
					key: I18nKey.links,
					url: "/links/",
					icon: "material-symbols:link-rounded",
				},
				{
					key: I18nKey.tutorials,
					url: "/tutorials/",
					icon: "material-symbols:school-outline-rounded",
				},
				{
					key: I18nKey.repos,
					url: "/repos/",
					icon: "material-symbols:folder-open-outline-rounded",
				},
				{
					key: I18nKey.categories,
					url: "/categories/",
					icon: "material-symbols:category-outline-rounded",
				},
				{
					key: I18nKey.tags,
					url: "/tags/",
					icon: "material-symbols:label-outline-rounded",
				},
			],
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "花束（洛疏律）",
	bio: "血液的作用之一，是为信仰付出代价。",
	location: "中华人民共和国",
	age: "17",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github", // Visit https://icones.js.org/ for icon codes
			url: "https://github.com/silencieuxzero",
		},
		{
			name: "Fandom",
			icon: "fa6-solid:book-open",
			url: "https://backrooms.fandom.com/zh/wiki/User:Appennino",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};

// ============================================================================
// Music player
// ============================================================================
// Audio files live in public/music/. Add or reorder entries here to change the
// playlist; the player itself is rendered by src/components/widget/MusicPlayer.astro.
export const musicConfig: MusicConfig = {
	loopMode: "all", // 'none' | 'one' | 'all'
	autoplay: false,
	volume: 0.3,
	songs: [
		{
			url: "/music/《说谎的马卡龙》中文填词，但是伴奏重制🧊🧊🧊【重音テト】-风巡妄想 [VBR 高质量].mp3",
			title: "说谎的马卡龙 - 风巡妄想",
		},
		{
			url: "/music/【不可淹没的三峡游记】“请按下快门，在她被消失以前”-山城Mors.mp3",
			title: "不可淹没的三峡游记 - 山城Mors",
		},
		{
			url: "/music/Ciyo-拼接乌托邦 (反乌托邦拼接版).m4a",
			title: "反乌托邦·拼接版 - Ciyo / 见过夏天P / 乌托邦P",
		},
		{
			url: "/music/【本家投稿】サイエンス(科学) _ MIMI feat. 重音テトSV【Official Video】-MIMI_music.mp3",
			title: "サイエンス(科学) - MIMI feat. 重音テトSV",
		},
		{
			url: "/music/【本家投稿】ハナタバ _ MIMI feat. 可不 【official video】-MIMI_music.mp3",
			title: "ハナタバ - MIMI feat. 可不",
		},
		{
			url: "/music/【本家投稿】ミュージック (音乐) _ MIMI feat. 可不-MIMI_music.mp3",
			title: "ミュージック(音乐) - MIMI feat. 可不",
		},
		{
			url: "/music/【星尘原创】少年幻想总是诗  “一直被困在夏天自从你离开之后，直到发现我所拥有的自由”【新世代音乐人】-Utopia_乌托邦P.mp3",
			title: "少年幻想总是诗 - Utopia_乌托邦P",
		},
	],
};

// ============================================================================
// Gallery
// ============================================================================
// Image lists live in src/data/gallery.json (extracted from the original site).
// The sub-gallery images are served only as an encrypted payload; see
// src/pages/gallery/sub-gallery.astro and scripts/encrypt-file.mjs.
export const galleryConfig = galleryData.gallery;

export const subGalleryConfig: SubGalleryConfig = {
	title: galleryData.subGallery.title,
	subtitle: galleryData.subGallery.subtitle,
};
