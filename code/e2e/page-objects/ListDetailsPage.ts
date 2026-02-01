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
		const addButton = this.page.getByTestId("sticky-input-bar").getByRole("button", { name: "Dodaj produkt" });
		await addButton.waitFor({ state: "visible" });
		await addButton.click();
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
		await row.waitFor({ state: "visible" });
		const checkbox = row.getByRole("checkbox");
		await checkbox.waitFor({ state: "visible" });
		await checkbox.click();
	}

	/** Open row menu and click "Usuń" */
	async deleteItem(itemName: string) {
		const menuButton = this.itemRow(itemName).getByTestId("list-item-row-menu");
		await menuButton.waitFor({ state: "visible" });
		await menuButton.click();
		const deleteMenuItem = this.page.getByRole("menuitem", { name: "Usuń" });
		await deleteMenuItem.waitFor({ state: "visible" });
		await deleteMenuItem.click();
	}

	/** Open edit dialog for item: row menu -> Edycja */
	async openEditItem(itemName: string) {
		const menuButton = this.itemRow(itemName).getByTestId("list-item-row-menu");
		await menuButton.waitFor({ state: "visible" });
		await menuButton.click();
		const editMenuItem = this.page.getByRole("menuitem", { name: "Edycja" });
		await editMenuItem.waitFor({ state: "visible" });
		await editMenuItem.click();
		await this.page.getByRole("dialog", { name: "Edytuj produkt" }).waitFor({ state: "visible" });
	}

	/** In edit dialog: set name and submit (scope to visible dialog) */
	async editItemName(itemName: string, newName: string) {
		await this.openEditItem(itemName);
		const dialog = this.page.getByRole("dialog", { name: "Edytuj produkt" });
		await dialog.getByTestId("list-item-edit-name").fill(newName);
		const submitButton = dialog.getByTestId("list-item-edit-submit");
		await submitButton.waitFor({ state: "visible" });
		await submitButton.click();
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
		const cancelButton = this.page.getByTestId("item-conflict-dialog").getByRole("button", { name: "Anuluj" });
		await cancelButton.waitFor({ state: "visible" });
		await cancelButton.click();
	}
}
