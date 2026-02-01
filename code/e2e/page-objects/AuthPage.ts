import type { Page } from "@playwright/test";

export class AuthPage {
	constructor(private readonly page: Page) {}

	async goto() {
		await this.page.goto("/auth");
	}

	async expectLoginScreenVisible() {
		await this.page.getByTestId("auth-page").waitFor({ state: "visible" });
		await this.page.getByText("QuickShop").waitFor({ state: "visible" });
	}

	async login(email: string, password: string) {
		await this.page.getByRole("tab", { name: "Logowanie" }).click();
		await this.page.getByTestId("auth-email-form").getByPlaceholder("twoj@email.com").fill(email);
		await this.page.getByTestId("auth-email-form").getByPlaceholder("••••••••").fill(password);
		await this.page.getByRole("button", { name: "Zaloguj się" }).click();
	}

	async expectRedirectToLists() {
		await this.page.waitForURL(/\/lists/, { timeout: 10_000 });
		await this.page.getByTestId("lists-page").waitFor({ state: "visible" });
	}

	async expectAuthError(message: string | RegExp) {
		await this.page.getByTestId("auth-email-form").getByText(message).nth(0).waitFor({ state: "visible" });
	}

	async submitEmptyLogin() {
		await this.page.getByRole("tab", { name: "Logowanie" }).click();
		await this.page.getByRole("button", { name: "Zaloguj się" }).click();
	}
}
