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
		
		// Setup response waiters BEFORE clicking submit
		const responsePromises = [
			this.page.waitForResponse(
				(response) =>
					response.url().includes("/rest/v1/lists") &&
					response.request().method() === "POST" &&
					response.status() < 400,
				{ timeout: 10000 }
			).then(() => console.log("✅ Lista utworzona - INSERT do lists"))
			 .catch(() => console.log("⚠️ Nie wykryto POST /rest/v1/lists")),
			
			this.page.waitForResponse(
				(response) =>
					response.url().includes("/rest/v1/rpc/invite_member_to_list") &&
					response.status() < 400,
				{ timeout: 10000 }
			).then(() => console.log("✅ Członek dodany - RPC invite_member_to_list"))
			 .catch(() => console.log("⚠️ Nie wykryto RPC invite_member_to_list")),
			
			// Wait for React Query refetch (GET request to lists)
			this.page.waitForResponse(
				(response) =>
					response.url().includes("/rest/v1/lists") &&
					response.request().method() === "GET" &&
					response.status() < 400,
				{ timeout: 10000 }
			).then(() => console.log("✅ Lista odświeżona - GET refetch"))
			 .catch(() => console.log("⚠️ Nie wykryto GET refetch")),
		];
		
		// Click submit - this triggers the requests
		await clickWhenReady(this.page.getByTestId("create-list-submit"));
		
		// Wait for dialog to close
		await this.page.getByTestId("create-list-dialog").waitFor({ state: "hidden" });
		
		// Wait for all API responses (including refetch)
		await Promise.all(responsePromises);
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
