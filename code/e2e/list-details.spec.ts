/**
 * ITEM-01, ITEM-03, RWD-01: Add product, conflict dialog, StickyInputBar on mobile.
 * Runs with authenticated storage state (E2E_USER1).
 */
import { expect, test } from "@playwright/test";
import { ListDetailsPage } from "./page-objects/ListDetailsPage";
import { ListsPage } from "./page-objects/ListsPage";

test.describe("List details – items", () => {
	test.beforeEach(async ({ page }) => {
		const listsPage = new ListsPage(page);
		await listsPage.goto();
		await listsPage.clickNewList();
		await listsPage.createList("E2E Lista produktów");
		await listsPage.clickList("E2E Lista produktów");
		await expect(page).toHaveURL(/\/lists\/[a-f0-9-]+/);
	});

	test("ITEM-01: add product (Create)", async ({ page }) => {
		const listPage = new ListDetailsPage(page);
		await listPage.addItem("Mleko");
		await listPage.expectItemVisible("Mleko");
	});

	test("ITEM-03: conflict dialog when adding duplicate product name", async ({
		page,
	}) => {
		const listPage = new ListDetailsPage(page);
		await listPage.addItem("Duplikat");
		await listPage.expectItemVisible("Duplikat");
		await listPage.addItem("Duplikat");
		await listPage.expectConflictDialogVisible();
		await listPage.cancelConflict();
	});
});

test.describe("List details – RWD", () => {
	test.beforeEach(async ({ page }) => {
		const listsPage = new ListsPage(page);
		await listsPage.goto();
		await listsPage.clickNewList();
		await listsPage.createList("E2E RWD");
		await listsPage.clickList("E2E RWD");
	});

	test("RWD-01: StickyInputBar visible and usable on mobile viewport", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.getByTestId("sticky-input-bar").waitFor({ state: "visible" });
		await page.getByTestId("add-item-input").fill("Mobile item");
		await page.getByTestId("sticky-input-bar").getByRole("button", { name: "Dodaj produkt" }).click();
		await page.getByRole("group", { name: "Mobile item" }).waitFor({ state: "visible" });
	});
});
