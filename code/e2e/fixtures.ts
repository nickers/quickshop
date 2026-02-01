/**
 * Global test fixtures for E2E tests.
 * Automatically set up console logging for all tests.
 * Logs are only printed when a test fails.
 */
import { test as base } from "@playwright/test";
import { collectConsoleLogs, formatStoredLogs } from "./helpers/console-logger";

/**
 * Extended test with automatic console logging.
 * Console logs are collected during test execution and only printed on failure.
 */
export const test = base.extend({
	page: async ({ page }, use, testInfo) => {
		// Collect console logs during test (don't print immediately)
		const logs = collectConsoleLogs(page, {
			captureAll: false,
			verbose: false,
		});

		// Run the test
		await use(page);

		// After test: print logs only if test failed
		if (testInfo.status !== "passed" && testInfo.status !== "skipped") {
			console.log("\n" + "=".repeat(80));
			console.log(`📋 Console logs for failed test: ${testInfo.title}`);
			console.log("=".repeat(80));
			if (logs.length > 0) {
				console.log(formatStoredLogs(logs));
			} else {
				console.log("(no console logs captured)");
			}
			console.log("=".repeat(80) + "\n");
		}
	},
});

export { expect } from "@playwright/test";
