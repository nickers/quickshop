/**
 * LIST-01: Create list (smoke).
 * Runs with authenticated storage state (E2E_USER1).
 */
import { test } from "@playwright/test";
import { ListsPage } from "./page-objects/ListsPage";

test.describe("Lists", () => {
	test("LIST-01: create new list (smoke)", async ({ page }) => {
		const listsPage = new ListsPage(page);
		await listsPage.goto();
		await listsPage.clickNewList();
		await listsPage.createList("E2E Lista testowa");
		await listsPage.expectListVisible("E2E Lista testowa");
	});
});
