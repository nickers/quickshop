/**
 * Setup project: log in as E2E_USER1 and save storage state for authenticated tests.
 * Credentials from .env.e2e.local (or .env.e2e).
 */
import { expect, test as setup } from "./fixtures";
import fs from "node:fs";
import path from "node:path";
import { clickWhenReady } from "./helpers/interactions";

const authDir = path.join(process.cwd(), ".auth");
const authFile = path.join(authDir, "user.json");

setup("authenticate as E2E_USER1", async ({ page }) => {
	const email = process.env.E2E_USER1_EMAIL;
	const password = process.env.E2E_USER1_PASSWORD;

	if (!email || !password) {
		throw new Error(
			"E2E_USER1_EMAIL and E2E_USER1_PASSWORD must be set (e.g. in .env.e2e.local)",
		);
	}

	await page.goto("/auth");
	await expect(page.getByTestId("auth-page")).toBeVisible();

	await clickWhenReady(page.getByTestId("auth-tab-signin"));
	await page.getByTestId("auth-email-form").getByPlaceholder("twoj@email.com").fill(email);
	await page.getByTestId("auth-email-form").getByPlaceholder("••••••••").fill(password);
	await clickWhenReady(page.getByTestId("auth-submit-btn"));

	await expect(page).toHaveURL(/\/lists/);
	await expect(page.getByTestId("lists-page")).toBeVisible({ timeout: 10_000 });

	fs.mkdirSync(authDir, { recursive: true });
	await page.context().storageState({ path: authFile });
});
