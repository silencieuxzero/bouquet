import { url } from "./url-utils";

/**
 * Default social-share image, used whenever a page has no usable cover.
 *
 * It MUST be a real file under `public/`: crawlers fetch `og:image`, so an asset
 * that is bundled from `src/` (such as `siteConfig.banner.src`
 * = `assets/images/demo-banner.png`) has no public URL and can never be used
 * here. This is a wide 1920x1079 artwork, which matches the 1.91:1 ratio that
 * `summary_large_image` cards expect.
 */
export const DEFAULT_OG_IMAGE = "/scp.jpg";

/**
 * A value that is already addressable as a URL on the live site: an absolute
 * path served from `public/` ("/ds.png") or an absolute http(s) URL.
 *
 * Anything else (an empty string, or a src-relative cover such as
 * "./cover.jpeg") is not resolvable to a URL at build time and is rejected.
 */
function isAddressable(path: string): boolean {
	return path.startsWith("/") || /^https?:\/\//i.test(path);
}

/**
 * Resolve a cover path to a fully-qualified `og:image` URL.
 *
 * Returns the page cover when it is addressable, otherwise {@link DEFAULT_OG_IMAGE},
 * so the result is always an absolute URL on the configured site (`Astro.site`).
 */
export function resolveOgImageUrl(cover?: string | null): string {
	const raw = cover && isAddressable(cover) ? cover : DEFAULT_OG_IMAGE;
	return new URL(raw.startsWith("/") ? url(raw) : raw, import.meta.env.SITE)
		.href;
}
