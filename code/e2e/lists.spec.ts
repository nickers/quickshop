/**
 * LIST-01: Create list (smoke).
 * Runs with authenticated storage state (E2E_USER1).
 */
import { test } from "@playwright/test";
import { formatTimestamp } from "./helpers/dateFormat";
import { ListsPage } from "./page-objects/ListsPage";

test.describe("Lists", () => {
	test("LIST-01: create new list (smoke)", async ({ page }) => {
		const listsPage = new ListsPage(page);
		await listsPage.goto();
		await listsPage.clickNewList();
		// Use unique list name for each test run to avoid conflicts
		const uniqueListName = `E2E Test ${formatTimestamp()}`;
		await listsPage.createList(uniqueListName);
		await listsPage.expectListVisible(uniqueListName);
	});
});
