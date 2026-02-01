import { expect } from "@playwright/test";
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

	/** Row container that contains the item name and the row menu (use for menu/edit/delete) */
	private itemRow(itemName: string) {
		return this.page.getByTestId("list-item-row").filter({ hasText: itemName });
	}

	/** Check checkbox for item (by name) to mark as bought */
	async toggleItemBought(itemName: string) {
		const row = this.page.getByRole("group", { name: itemName });
		await row.getByRole("checkbox").click();
	}

	/** Open row menu and click "Usuń" */
	async deleteItem(itemName: string) {
		await this.itemRow(itemName).getByTestId("list-item-row-menu").click();
		await this.page.getByRole("menuitem", { name: "Usuń" }).waitFor({ state: "visible" });
		await this.page.keyboard.press("ArrowDown");
		await this.page.keyboard.press("ArrowDown");
		await this.page.keyboard.press("Enter");
	}

	/** Open edit dialog for item: row menu -> Edycja (keyboard: first item then Enter) */
	async openEditItem(itemName: string) {
		await this.itemRow(itemName).getByTestId("list-item-row-menu").click();
		await this.page.getByRole("menuitem", { name: "Edycja" }).waitFor({ state: "visible" });
		await this.page.keyboard.press("ArrowDown");
		await this.page.keyboard.press("Enter");
		await this.page.getByRole("dialog", { name: "Edytuj produkt" }).waitFor({ state: "visible" });
	}

	/** In edit dialog: set name and submit (scope to visible dialog) */
	async editItemName(itemName: string, newName: string) {
		await this.openEditItem(itemName);
		const dialog = this.page.getByRole("dialog", { name: "Edytuj produkt" });
		await dialog.getByTestId("list-item-edit-name").fill(newName);
		await dialog.getByTestId("list-item-edit-submit").click();
		await dialog.waitFor({ state: "hidden" });
	}

	/** Assert item is not present in the list (after delete) */
	async expectItemNotVisible(itemName: string) {
		await expect(this.page.getByRole("group", { name: itemName })).toHaveCount(0);
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
