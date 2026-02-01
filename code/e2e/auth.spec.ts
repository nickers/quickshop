import { expect, test } from "@playwright/test";
import { AuthPage } from "./page-objects/AuthPage";

test.describe("Auth screen", () => {
	test("AUTH: opens app on login screen without logging in", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByTestId("auth-page")).toBeVisible();
		await expect(page.getByText("QuickShop")).toBeVisible();
	});

	test("AUTH-02: login with correct credentials redirects to /lists", async ({
		page,
	}) => {
		const email = process.env.E2E_USER1_EMAIL;
		const password = process.env.E2E_USER1_PASSWORD;
		if (!email || !password) {
			test.skip();
			return;
		}
		const authPage = new AuthPage(page);
		await authPage.goto();
		await authPage.login(email, password);
		await authPage.expectRedirectToLists();
	});

	test("AUTH-03: login form validation shows errors for empty or invalid data", async ({
		page,
	}) => {
		const authPage = new AuthPage(page);
		await authPage.goto();
		await authPage.submitEmptyLogin();
		await authPage.expectAuthError(/Nieprawidłowy format email|Hasło musi mieć/);
	});
});
