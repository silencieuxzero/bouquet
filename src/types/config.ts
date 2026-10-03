import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";
import type I18nKey from "@i18n/i18nKey";

export type SiteConfig = {
	title: string;
	subtitle: string;
	/** Optional full-page background image, relative to /public. */
	backgroundImage?: string;

	lang:
		| "en"
		| "zh_CN"
		| "zh_TW"
		| "ja"
		| "ko"
		| "es"
		| "th"
		| "vi"
		| "tr"
		| "id";

	themeColor: {
		hue: number;
		fixed: boolean;
	};
	banner: {
		enable: boolean;
		src: string;
		position?: "top" | "center" | "bottom";
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
	};
	toc: {
		enable: boolean;
		depth: 1 | 2 | 3;
	};

	favicon: Favicon[];
};

export type Favicon = {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
};

export enum LinkPreset {
	Home = 0,
	Archive = 1,
	About = 2,
	Notes = 3,
	Gallery = 4,
}

/**
 * A nav label is either a literal string (proper nouns such as "GitHub") or an i18n key.
 * Keys are resolved at RENDER time by `navLabel()` in src/utils/nav-utils.ts, never at
 * module scope in src/config.ts: src/i18n/translation.ts imports `siteConfig` from
 * src/config.ts, so a module-scope `i18n()` call there can observe an uninitialised
 * binding (`ReferenceError: Cannot access 'map' before initialization`).
 */
export type NavBarLabel = { name: string } | { key: I18nKey };

export type NavBarLink = NavBarLabel & {
	url: string;
	external?: boolean;
};

/** A nav entry that is a heading only: it opens a panel of child links instead of navigating. */
export type NavBarGroup = NavBarLabel & {
	children: NavBarLink[];
};

export type NavBarItem = NavBarLink | NavBarGroup;

export type NavBarConfig = {
	links: (NavBarItem | LinkPreset)[];
};

export type ProfileConfig = {
	avatar?: string;
	name: string;
	bio?: string;
	location?: string;
	age?: string;
	links: {
		name: string;
		url: string;
		icon: string;
	}[];
};

export type LicenseConfig = {
	enable: boolean;
	name: string;
	url: string;
};

export type LIGHT_DARK_MODE =
	| typeof LIGHT_MODE
	| typeof DARK_MODE
	| typeof AUTO_MODE;

export type BlogPostData = {
	body: string;
	title: string;
	published: Date;
	description: string;
	tags: string[];
	draft?: boolean;
	image?: string;
	category?: string;
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
};

export type ExpressiveCodeConfig = {
	theme: string;
};

export type MusicConfig = {
	/** 'none' | 'one' | 'all' */
	loopMode: "none" | "one" | "all";
	autoplay: boolean;
	/** 0.0 ~ 1.0 */
	volume: number;
	songs: {
		/** Path under /public, e.g. '/music/song.mp3' */
		url: string;
		title: string;
	}[];
};

export type GalleryImage = {
	src: string;
	alt: string;
	copyright?: string;
	source?: string;
};

export type GalleryConfig = {
	title: string;
	subtitle?: string;
	images: GalleryImage[];
};

export type SubGalleryConfig = {
	title: string;
	subtitle?: string;
	/** Password-encrypted like the blog posts: only a salted hash is stored. */
	images: GalleryImage[];
};
