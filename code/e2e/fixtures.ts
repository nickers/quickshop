/**
 * Global test fixtures for E2E tests.
 * Automatically set up console logging for all tests.
 */
import { test as base } from "@playwright/test";
import { setupConsoleLogger } from "./helpers/console-logger";

/**
 * Extended test with automatic console logging.
 * All tests will automatically capture browser console logs.
 */
export const test = base.extend({
	page: async ({ page }, use) => {
		// Setup console logger before each test
		setupConsoleLogger(page, {
			captureAll: false, // Only capture debug logs by default
			verbose: false, // Skip debug messages
		});

		// Use the page
		await use(page);
	},
});

export { expect } from "@playwright/test";
