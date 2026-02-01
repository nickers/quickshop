import type { Page } from "@playwright/test";

export class ListDetailsPage {
	constructor(private readonly page: Page) {}

	async goto(listId: string) {
		await this.page.goto(`/lists/${listId}`);
		await this.page.getByTestId("list-details-page").waitFor({ state: "visible" });
	}

	async expectStickyInputBarVisible() {
		await this.page.getByTestId("sticky-input-bar").waitFor({ state: "visible" });
	}

	async addItem(name: string) {
		await this.page.getByTestId("add-item-input").fill(name);
		await this.page.getByTestId("sticky-input-bar").getByRole("button", { name: "Dodaj produkt" }).click();
	}

	async expectItemVisible(itemName: string) {
		await this.page.getByRole("group", { name: itemName }).waitFor({ state: "visible" });
	}

	/** Check checkbox for item (by name) to mark as bought */
	async toggleItemBought(itemName: string) {
		const row = this.page.getByRole("group", { name: itemName });
		await row.getByRole("checkbox").click();
	}

	/** Open row menu and click "Usuń" */
	async deleteItem(itemName: string) {
		const row = this.page.getByRole("group", { name: itemName });
		await row.getByRole("button", { name: "Otwórz menu pozycji" }).click();
		await this.page.getByRole("menuitem", { name: "Usuń" }).click();
	}

	async expectConflictDialogVisible() {
		await this.page.getByTestId("item-conflict-dialog").waitFor({ state: "visible" });
	}

	async expectItemInCompletedSection(itemName: string) {
		await this.page.getByTestId("completed-items-section").getByRole("group", { name: itemName }).waitFor({ state: "visible" });
	}

	async cancelConflict() {
		await this.page.getByTestId("item-conflict-dialog").getByRole("button", { name: "Anuluj" }).click();
	}
}
