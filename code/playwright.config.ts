import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load from config directory so .env.e2e is found even if cwd differs (e.g. in CI).
const configDir = path.dirname(fileURLToPath(import.meta.url));
// .env.e2e.local first (passwords, local overrides). Then .env.e2e with override: false
// so committed file supplies emails/Vite vars but does not overwrite secrets (CI) or .local (local).
dotenv.config({ path: path.join(configDir, ".env.e2e.local"), override: false });
dotenv.config({ path: path.join(configDir, ".env.e2e"), override: false });

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	timeout: 30_000,
	expect: { timeout: 10_000 },
	use: {
		// Treat empty BASE_URL as unset so CI uses localhost when Playwright starts webServer
		baseURL: process.env.BASE_URL || "http://localhost:3000",
		trace: "retain-on-failure", // Keep trace for all failures
		screenshot: "only-on-failure", // Screenshot on failures
		video: "retain-on-failure", // Video for failures
	},
	projects: [
		{ name: "setup", testMatch: /auth\.setup\.ts/ },
		{
			name: "chromium-no-auth",
			testMatch: /auth\.spec\.ts/,
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "chromium-authenticated",
			testMatch: /\.spec\.ts$/,
			testIgnore: [/auth\.spec\.ts$/],
			use: {
				...devices["Desktop Chrome"],
				storageState: path.join(process.cwd(), ".auth", "user.json"),
			},
			dependencies: ["setup"],
		},
	],
	webServer: {
		command: "npm run dev:e2e",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
	},
});
