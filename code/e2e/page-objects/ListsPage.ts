import type { Page } from "@playwright/test";
import { clickWhenReady, clickDropdownTrigger, debugElement } from "../helpers/interactions";
import { formatTimestamp } from "../helpers/dateFormat";

export class ListsPage {
	constructor(private readonly page: Page) {}

	async goto() {
		await this.page.goto("/lists");
		await this.page.getByTestId("lists-page").waitFor({ state: "visible" });
	}

	async clickNewList() {
		await clickWhenReady(this.page.getByTestId("lists-new-list-btn"));
	}

	async expectCreateListDialogVisible() {
		await this.page.getByTestId("create-list-dialog").waitFor({ state: "visible" });
	}

	async createList(name: string) {
		await this.expectCreateListDialogVisible();
		await this.page.getByTestId("create-list-name-input").fill(name);

		// Click submit
		await clickWhenReady(this.page.getByTestId("create-list-submit"));
		
		// Wait for dialog to close (user sees dialog disappear)
		await this.page.getByTestId("create-list-dialog").waitFor({ state: "hidden" });
		
		// Wait for new list to appear in the grid (user sees the new list)
		await this.page
			.getByTestId("lists-grid")
			.getByText(name)
			.first()
			.waitFor({ state: "visible", timeout: 15000 });
	}

	async expectListVisible(listName: string) {
		try {
			await this.page
				.getByTestId("lists-grid")
				.getByText(listName)
				.nth(0)
				.waitFor({ state: "visible" });
		} catch (error) {
			console.log(`❌ Lista "${listName}" nie jest widoczna`);

			// Debug: czy jest w DOM w ogóle?
			const count = await this.page.locator(`text="${listName}"`).count();
			console.log(`🔍 Elementy z nazwą listy w DOM: ${count}`);

			// Debug: ile kart w grid
			const gridItems = await this.page
				.getByTestId("lists-grid")
				.locator('[data-testid^="list-card-"]')
				.count();
			console.log(`📋 Kart w grid: ${gridItems}`);

			// Debug: zawartość grid
			const gridText = await this.page
				.getByTestId("lists-grid")
				.textContent();
			console.log(`📄 Grid content:`, gridText?.substring(0, 200));

			// Debug grid element
			await debugElement(this.page.getByTestId("lists-grid"), "lists-grid");

			// Screenshot
			await this.page.screenshot({
				path: `debug-list-not-visible-${formatTimestamp().replace(/:/g, "-").replace(/ /g, "_")}.png`,
			});

			throw error;
		}
	}

	/** Click list card by list name (CardTitle is a div; use nth(0) if multiple match) */
	async clickList(listName: string) {
		await clickWhenReady(
			this.page.getByTestId("lists-grid").getByText(listName).nth(0),
		);
	}

	/** Open list card menu and click "Usuń listę" */
	async deleteList(listName: string) {
		const card = this.page
			.getByTestId("lists-grid")
			.getByText(listName)
			.nth(0)
			.locator("xpath=ancestor::*[starts-with(@data-testid, 'list-card-')][1]");
		const menuButton = card.locator("[data-testid='list-card-menu']");
		await clickDropdownTrigger(menuButton);
		await clickWhenReady(this.page.getByTestId("list-card-delete"));
	}

	/** Accept browser confirm dialog */
	async acceptConfirm() {
		this.page.once("dialog", (d) => d.accept());
	}
}
