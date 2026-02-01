import type { Page } from "@playwright/test";
import { clickWhenReady } from "../helpers/interactions";

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
		await clickWhenReady(this.page.getByTestId("auth-tab-signin"));
		await this.page.getByTestId("auth-email-form").getByPlaceholder("twoj@email.com").fill(email);
		await this.page.getByTestId("auth-email-form").getByPlaceholder("••••••••").fill(password);
		await clickWhenReady(this.page.getByTestId("auth-submit-btn"));
	}

	async expectRedirectToLists() {
		await this.page.waitForURL(/\/lists/, { timeout: 10_000 });
		await this.page.getByTestId("lists-page").waitFor({ state: "visible" });
	}

	async expectAuthError(message: string | RegExp) {
		await this.page.getByTestId("auth-email-form").getByText(message).nth(0).waitFor({ state: "visible" });
	}

	async submitEmptyLogin() {
		await clickWhenReady(this.page.getByTestId("auth-tab-signin"));
		await clickWhenReady(this.page.getByTestId("auth-submit-btn"));
	}
}
