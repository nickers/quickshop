import type { Page } from "@playwright/test";

export class ListsPage {
	constructor(private readonly page: Page) {}

	async goto() {
		await this.page.goto("/lists");
		await this.page.getByTestId("lists-page").waitFor({ state: "visible" });
	}

	async clickNewList() {
		await this.page.getByTestId("lists-new-list-btn").click();
	}

	async expectCreateListDialogVisible() {
		await this.page.getByTestId("create-list-dialog").waitFor({ state: "visible" });
	}

	async createList(name: string) {
		await this.expectCreateListDialogVisible();
		await this.page.getByTestId("create-list-name-input").fill(name);
		await this.page.getByTestId("create-list-submit").click();
		await this.page.getByTestId("create-list-dialog").waitFor({ state: "hidden" });
		await this.expectListVisible(name);
	}

	async expectListVisible(listName: string) {
		await this.page.getByTestId("lists-grid").getByText(listName).nth(0).waitFor({ state: "visible" });
	}

	/** Click list card by list name (CardTitle is a div; use nth(0) if multiple match) */
	async clickList(listName: string) {
		await this.page.getByTestId("lists-grid").getByText(listName).nth(0).click();
	}

	/** Open list card menu and click "Usuń listę" */
	async deleteList(listName: string) {
		const card = this.page
			.getByTestId("lists-grid")
			.getByText(listName)
			.nth(0)
			.locator("xpath=ancestor::*[starts-with(@data-testid, 'list-card-')][1]");
		await card.getByRole("button", { name: "Otwórz menu" }).click();
		await this.page.getByRole("menuitem", { name: "Usuń listę" }).click();
	}

	/** Accept browser confirm dialog */
	async acceptConfirm() {
		this.page.once("dialog", (d) => d.accept());
	}
}
