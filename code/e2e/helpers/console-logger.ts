import type { ConsoleMessage, Page } from "@playwright/test";

/**
 * Console log categories to capture
 */
export const DEBUG_LOG_CATEGORIES = [
	"[useListDetails]",
	"[useListsView]",
	"[ListItemsService]",
	"[ListsService]",
	"[MutationCache]",
	"[QueryClient]",
] as const;

/**
 * Color codes for different console message types
 */
const COLOR_MAP = {
	error: "\x1b[31m", // Red
	warning: "\x1b[33m", // Yellow
	info: "\x1b[36m", // Cyan
	log: "\x1b[37m", // White
	debug: "\x1b[90m", // Gray
} as const;

const RESET_COLOR = "\x1b[0m";

/**
 * Format console message with color and emoji based on type
 */
function formatConsoleMessage(msg: ConsoleMessage): string {
	const type = msg.type();
	const text = msg.text();
	const location = msg.location();

	// Emoji prefix based on type
	const emoji =
		type === "error"
			? "❌"
			: type === "warning"
				? "⚠️"
				: type === "info"
					? "ℹ️"
					: "📝";

	// Color based on type
	const color = COLOR_MAP[type as keyof typeof COLOR_MAP] || COLOR_MAP.log;

	// Format: [EMOJI] [TYPE] message [location]
	const locationStr = location.url
		? ` (${location.url}:${location.lineNumber})`
		: "";

	return `${color}${emoji} [${type.toUpperCase()}] ${text}${locationStr}${RESET_COLOR}`;
}

/**
 * Check if console message should be captured based on filter
 */
function shouldCaptureMessage(
	text: string,
	categories: readonly string[],
): boolean {
	// If no categories specified, capture all
	if (categories.length === 0) return true;

	// Check if text includes any of the filter categories
	return categories.some((category) => text.includes(category));
}

/**
 * Setup console logger for E2E tests.
 * Captures browser console messages and logs them to Node.js console.
 *
 * @param page - Playwright page instance
 * @param options - Configuration options
 * @param options.categories - Array of log categories to capture (default: DEBUG_LOG_CATEGORIES)
 * @param options.captureAll - If true, captures all console messages (default: false)
 * @param options.verbose - If true, includes all console types including debug (default: false)
 *
 * @example
 * ```typescript
 * test.beforeEach(async ({ page }) => {
 *   setupConsoleLogger(page);
 * });
 * ```
 */
export function setupConsoleLogger(
	page: Page,
	options: {
		categories?: readonly string[];
		captureAll?: boolean;
		verbose?: boolean;
	} = {},
): void {
	const {
		categories = DEBUG_LOG_CATEGORIES,
		captureAll = false,
		verbose = false,
	} = options;

	page.on("console", (msg: ConsoleMessage) => {
		const text = msg.text();
		const type = msg.type();

		// Skip debug messages unless verbose mode
		if (!verbose && type === "debug") return;

		// Filter based on categories unless captureAll is true
		if (!captureAll && !shouldCaptureMessage(text, categories)) return;

		// Format and log the message
		const formatted = formatConsoleMessage(msg);
		console.log(formatted);
	});

	// Also capture page errors
	page.on("pageerror", (error) => {
		console.error(
			`${COLOR_MAP.error}❌ [PAGE ERROR] ${error.message}${RESET_COLOR}`,
		);
		console.error(`${COLOR_MAP.error}Stack: ${error.stack}${RESET_COLOR}`);
	});
}

/**
 * Collect console messages into an array for later inspection.
 * Useful when you want to assert on console messages in tests.
 *
 * @param page - Playwright page instance
 * @param categories - Array of log categories to capture
 * @returns Array that will be populated with console messages
 *
 * @example
 * ```typescript
 * test('should log item creation', async ({ page }) => {
 *   const logs = collectConsoleLogs(page, ['[useListDetails]']);
 *   await listPage.addItem('Milk');
 *   expect(logs.some(log => log.includes('CREATE onMutate'))).toBeTruthy();
 * });
 * ```
 */
export function collectConsoleLogs(
	page: Page,
	categories: readonly string[] = DEBUG_LOG_CATEGORIES,
): string[] {
	const logs: string[] = [];

	page.on("console", (msg: ConsoleMessage) => {
		const text = msg.text();
		if (shouldCaptureMessage(text, categories)) {
			logs.push(text);
		}
	});

	return logs;
}
