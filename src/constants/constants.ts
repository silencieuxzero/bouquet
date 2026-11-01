export const PAGE_SIZE = 8;

export const LIGHT_MODE = "light",
	DARK_MODE = "dark",
	AUTO_MODE = "auto";
export const DEFAULT_THEME: typeof LIGHT_MODE = LIGHT_MODE;

// Banner heights, unit: vh. These are only the FALLBACKS used when siteConfig.banner
// (src/config.ts) leaves height / homeHeight unset - that config is where a site
// customises them. bannerHeights in src/config.ts resolves the two and derives
// extend (homeHeight - height). height is the inner-page strip, homeHeight the
// taller home hero; setting them equal renders the home page like an inner page.
export const BANNER_HEIGHT_DEFAULT = 35;
export const BANNER_HEIGHT_HOME_DEFAULT = 65;

// The height the main panel overlaps the banner, unit: rem
export const MAIN_PANEL_OVERLAPS_BANNER_HEIGHT = 3.5;

// Page width: rem
export const PAGE_WIDTH = 75;
