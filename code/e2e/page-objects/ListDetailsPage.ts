import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { clickWhenReady, clickDropdownTrigger, debugElement } from "../helpers/interactions";
import { formatTimestamp } from "../helpers/dateFormat";

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
		await clickWhenReady(this.page.getByTestId("add-item-submit-btn"));
	}

	async expectItemVisible(itemName: string) {
		await this.page.getByRole("group", { name: itemName, exact: true }).waitFor({ state: "visible" });
	}

	/** Row container that contains the item name and the row menu (use for menu/edit/delete) */
	private itemRow(itemName: string) {
		return this.page.getByTestId("list-item-row").filter({ 
			has: this.page.getByRole("group", { name: itemName, exact: true })
		});
	}

	/** Check checkbox for item (by name) to mark as bought */
	async toggleItemBought(itemName: string) {
		const row = this.page.getByRole("group", { name: itemName, exact: true });
		await row.waitFor({ state: "visible" });
		await clickWhenReady(row.getByRole("checkbox"));
	}

	/** Open row menu and click "Usuń" */
	async deleteItem(itemName: string) {
		const menuButton = this.itemRow(itemName).getByTestId("list-item-row-menu");
		await clickDropdownTrigger(menuButton);
		await clickWhenReady(this.page.getByTestId("list-item-menu-delete"));
	}

	/** Open edit dialog for item: row menu -> Edycja */
	async openEditItem(itemName: string) {
		const row = this.itemRow(itemName);
		await row.waitFor({ state: "visible" });
		const menuButton = row.getByTestId("list-item-row-menu");

		// Debug menu button state
		const isVisible = await menuButton.isVisible().catch(() => false);
		const isEnabled = await menuButton.isEnabled().catch(() => false);
		console.log(`🔍 Menu button dla "${itemName}":`, { isVisible, isEnabled });

		await clickDropdownTrigger(menuButton);

		// Wait a bit for animation
		await this.page.waitForTimeout(300);

		const editMenuItem = this.page.getByTestId("list-item-menu-edit");

		// Debug menu item visibility
		const menuVisible = await editMenuItem.isVisible().catch(() => false);
		console.log(`🔍 Edit menu item visible: ${menuVisible}`);

		if (!menuVisible) {
			// Debug when menu not visible
			const menuCount = await this.page.getByTestId("list-item-menu-edit").count();
			console.log(`🔍 Edit menu items in DOM: ${menuCount}`);

			await debugElement(editMenuItem, "list-item-menu-edit");

			// Screenshot
			await this.page.screenshot({
				path: `debug-menu-not-open-${formatTimestamp().replace(/:/g, "-").replace(/ /g, "_")}.png`,
			});
		}

		await clickWhenReady(editMenuItem);
		await this.page.getByTestId("list-item-edit-dialog").waitFor({ state: "visible" });
	}

	/** In edit dialog: set name and submit (scope to visible dialog) */
	async editItemName(itemName: string, newName: string) {
		await this.openEditItem(itemName);
		const dialog = this.page.getByTestId("list-item-edit-dialog");
		await dialog.getByTestId("list-item-edit-name").fill(newName);
		await clickWhenReady(dialog.getByTestId("list-item-edit-submit"));
		await dialog.waitFor({ state: "hidden" });
	}

	/** Assert item is not present in the list (after delete) */
	async expectItemNotVisible(itemName: string) {
		await expect(this.page.getByRole("group", { name: itemName, exact: true })).toHaveCount(0);
	}

	async expectConflictDialogVisible() {
		await this.page.getByTestId("item-conflict-dialog").waitFor({ state: "visible" });
	}

	async expectItemInCompletedSection(itemName: string) {
		await this.page.getByTestId("completed-items-section").getByRole("group", { name: itemName, exact: true }).waitFor({ state: "visible" });
	}

	async cancelConflict() {
		await clickWhenReady(this.page.getByTestId("item-conflict-cancel"));
	}
}
