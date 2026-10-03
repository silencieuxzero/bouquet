import { LinkPresets } from "@constants/link-presets";
import { i18n } from "@i18n/translation";
import type {
	LinkPreset,
	NavBarGroup,
	NavBarItem,
	NavBarLabel,
	NavBarLink,
} from "@/types/config";

/** A group heading opens a panel; a link navigates. */
export function isNavBarGroup(item: NavBarItem): item is NavBarGroup {
	return "children" in item;
}

/**
 * Resolve a nav label to display text. i18n keys are resolved HERE, at render time, and
 * never at module scope in src/config.ts: src/i18n/translation.ts imports `siteConfig`
 * from src/config.ts, so evaluating `i18n()` while src/config.ts itself is being
 * evaluated can read `map` before initialisation and throw
 * "Cannot access 'map' before initialization".
 */
export function navLabel(item: NavBarLabel): string {
	if ("key" in item) {
		return i18n(item.key);
	}
	return item.name;
}

/** Replace `LinkPreset` entries with their concrete link objects, preserving order. */
export function resolveNavBarItems(
	items: (NavBarItem | LinkPreset)[],
): NavBarItem[] {
	return items.map((item) =>
		typeof item === "number" ? LinkPresets[item] : item,
	);
}

/** Flat list of every destination reachable from the nav, groups expanded in place. */
export function flattenNavBarItems(items: NavBarItem[]): NavBarLink[] {
	return items.flatMap((item) =>
		isNavBarGroup(item) ? item.children : [item],
	);
}
