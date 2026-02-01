/**
 * ITEM-01, ITEM-03, RWD-01: Add product, conflict dialog, StickyInputBar on mobile.
 * Runs with authenticated storage state (E2E_USER1).
 */
import { expect, test } from "./fixtures";
import { formatTimestamp } from "./helpers/dateFormat";
import { clickWhenReady } from "./helpers/interactions";
import { ListDetailsPage } from "./page-objects/ListDetailsPage";
import { ListsPage } from "./page-objects/ListsPage";

test.describe("List details – items", () => {
	test.beforeEach(async ({ page }) => {
		const listsPage = new ListsPage(page);
		await listsPage.goto();
		await listsPage.clickNewList();
		// Use unique list name for each test run to avoid conflicts
		const uniqueListName = `E2E Test ${formatTimestamp()}`;
		await listsPage.createList(uniqueListName);
		await listsPage.expectListVisible(uniqueListName);
		await listsPage.clickList(uniqueListName);
		await expect(page).toHaveURL(/\/lists\/[a-f0-9-]+/);
	});

	// ITEM-01 missing steps (test plan: CRUD + "Stan UI zgodny z oczekiwaniami"):
	// - Assert new product appears in active items section (not in "Kupione")
	// - Assert add-item input is cleared after submit
	// - Explicit Read: verify product details (name, optional quantity/note) are displayed
	// - Explicit Read: verify product is in active list (data-testid active-items-list)
	// - Update: verify quantity/note unchanged after name-only edit (or test edit quantity/note)
	// - Update: assert edited item remains in active section
	// - Delete: assert list item count decreased (optional)
	// - Delete: assert no sync error / error toast after delete
	// - Single full CRUD flow: Create -> Read -> Update -> Read -> Delete -> Read in one test
	// - UI state: assert no console errors during CRUD
	// - UI state: assert sync indicator / StickyInputBar still visible and usable after each action

	test("ITEM-01: add product (Create)", async ({ page }) => {
		const listPage = new ListDetailsPage(page);
		await listPage.addItem("Mleko");
		await listPage.expectItemVisible("Mleko");
	});

	test.skip("ITEM-01: edit product name (Update)", async ({ page }) => {
		const listPage = new ListDetailsPage(page);
		await listPage.addItem("Chleb");
		await listPage.expectItemVisible("Chleb");
		await listPage.editItemName("Chleb", "Chleb pełnoziarnisty");
		await listPage.expectItemVisible("Chleb pełnoziarnisty");
		await listPage.expectItemNotVisible("Chleb");
	});

	test.skip("ITEM-01: delete product (Delete)", async ({ page }) => {
		const listPage = new ListDetailsPage(page);
		await listPage.addItem("Do usunięcia");
		await listPage.expectItemVisible("Do usunięcia");
		await listPage.deleteItem("Do usunięcia");
		await listPage.expectItemNotVisible("Do usunięcia");
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
		// Use unique list name for each test run to avoid conflicts
		const uniqueListName = `E2E RWD ${formatTimestamp()}`;
		await listsPage.createList(uniqueListName);
		await listsPage.expectListVisible(uniqueListName);
		await listsPage.clickList(uniqueListName);
	});

	test("RWD-01: StickyInputBar visible and usable on mobile viewport", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.getByTestId("sticky-input-bar").waitFor({ state: "visible" });
		await page.getByTestId("add-item-input").fill("Mobile item");
		await clickWhenReady(page.getByTestId("add-item-submit-btn"));
		await page.getByRole("group", { name: "Mobile item", exact: true }).waitFor({ state: "visible" });
	});
});
