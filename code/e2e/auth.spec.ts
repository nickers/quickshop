import { expect, test } from "@playwright/test";

test.describe("Auth screen", () => {
	test("opens app on login screen without logging in", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByTestId("auth-page")).toBeVisible();
		await expect(page.getByText("QuickShop")).toBeVisible();
	});
});
