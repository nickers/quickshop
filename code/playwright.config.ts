import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.e2e.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.e2e") });

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
		baseURL: process.env.BASE_URL ?? "http://localhost:3000",
		trace: "on-first-retry",
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
