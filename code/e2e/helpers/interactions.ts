import type { Locator } from "@playwright/test";

/**
 * Click helper that waits for element visibility and optionally hovers before clicking.
 * Use this for stable interactions with UI components, especially Radix UI dropdowns.
 *
 * @param locator - Playwright locator for the element to click
 * @param options - Click options
 * @param options.hover - Whether to hover before clicking (recommended for dropdown menus)
 */
export async function clickWhenReady(
	locator: Locator,
	options?: { hover?: boolean },
) {
	await locator.waitFor({ state: "visible" });
	if (options?.hover) {
		await locator.hover();
	}
	await locator.click();
}

/**
 * Specialized helper for clicking Radix UI dropdown menu triggers.
 * Always hovers before clicking to ensure proper pointer events.
 *
 * @param locator - Playwright locator for the dropdown trigger button
 */
export async function clickDropdownTrigger(locator: Locator) {
	await clickWhenReady(locator, { hover: true });
}

/**
 * Debug helper to log element state (visibility, enabled, count, text, attributes).
 * Useful for troubleshooting test failures.
 *
 * @param locator - Playwright locator to debug
 * @param label - Optional label for the console output
 */
export async function debugElement(locator: Locator, label = "Element") {
	const count = await locator.count();
	const isVisible = count > 0 ? await locator.first().isVisible().catch(() => false) : false;
	const isEnabled = count > 0 ? await locator.first().isEnabled().catch(() => false) : false;

	console.log(`🔍 Debug [${label}]:`, {
		exists: count > 0,
		count,
		visible: isVisible,
		enabled: isEnabled,
	});

	if (count > 0) {
		const text = await locator.first().textContent().catch(() => null);
		const attrs = await locator
			.first()
			.evaluate((el) => ({
				class: el.className,
				disabled: (el as HTMLButtonElement).disabled,
				"aria-disabled": el.getAttribute("aria-disabled"),
			}))
			.catch(() => null);
		console.log(`  Text:`, text);
		console.log(`  Attributes:`, attrs);
	}
}
