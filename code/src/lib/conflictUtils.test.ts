import { describe, expect, it } from "vitest";
import type { ListItem, SetItem } from "@/types/domain.types";
import {
	computeSetConflicts,
	findDuplicateOnList,
	suggestedQuantityForConflict,
} from "./conflictUtils";

function makeListItem(overrides: Partial<ListItem> = {}): ListItem {
	return {
		id: "li-1",
		list_id: "list-1",
		name: "Mleko",
		quantity: null,
		note: null,
		is_bought: false,
		sort_order: 0,
		created_at: null,
		updated_at: null,
		...overrides,
	};
}

function makeSetItem(overrides: Partial<SetItem> = {}): SetItem {
	return {
		id: "si-1",
		set_id: "set-1",
		name: "Mleko",
		quantity: null,
		note: null,
		sort_order: 0,
		created_at: null,
		updated_at: null,
		...overrides,
	};
}

describe("suggestedQuantityForConflict", () => {
	it("returns '—' when both are null", () => {
		expect(suggestedQuantityForConflict(null, null)).toBe("—");
	});

	it("returns '—' when both are empty string", () => {
		expect(suggestedQuantityForConflict("", "")).toBe("—");
	});

	it("returns '—' when both are '—' (placeholder treated as empty)", () => {
		expect(suggestedQuantityForConflict("—", "—")).toBe("—");
	});

	it("returns new when existing is '—'", () => {
		expect(suggestedQuantityForConflict("—", "2")).toBe("2");
	});

	it("returns existing when new is '—'", () => {
		expect(suggestedQuantityForConflict("1", "—")).toBe("1");
	});

	it("returns existing when new is null", () => {
		expect(suggestedQuantityForConflict("1", null)).toBe("1");
	});

	it("returns new when existing is null", () => {
		expect(suggestedQuantityForConflict(null, "2")).toBe("2");
	});

	it("returns existing when new is empty string", () => {
		expect(suggestedQuantityForConflict("1", "")).toBe("1");
	});

	it("returns new when existing is empty string", () => {
		expect(suggestedQuantityForConflict("", "2")).toBe("2");
	});

	it("returns sum when both are integers", () => {
		expect(suggestedQuantityForConflict("1", "2")).toBe("3");
	});

	it("returns sum for two positive integers", () => {
		expect(suggestedQuantityForConflict("2", "3")).toBe("5");
	});

	it("returns sum when one is zero", () => {
		expect(suggestedQuantityForConflict("0", "1")).toBe("1");
	});

	it("returns '0' when both are '0'", () => {
		expect(suggestedQuantityForConflict("0", "0")).toBe("0");
	});

	it("returns number when other is zero", () => {
		expect(suggestedQuantityForConflict("5", "0")).toBe("5");
	});

	it("trims whitespace before parsing integers", () => {
		expect(suggestedQuantityForConflict(" 2 ", " 3 ")).toBe("5");
	});

	it("joins with '+' when one value is not an integer", () => {
		expect(suggestedQuantityForConflict("2", "szt")).toBe("2+szt");
	});

	it("joins with '+' when one value has unit", () => {
		expect(suggestedQuantityForConflict("2", "500 g")).toBe("2+500 g");
	});

	it("joins with '+' when decimal", () => {
		expect(suggestedQuantityForConflict("1", "2.5")).toBe("1+2.5");
	});

	it("parses leading zeros as integers", () => {
		expect(suggestedQuantityForConflict("02", "03")).toBe("5");
	});

	it("returns sum for negative and positive", () => {
		expect(suggestedQuantityForConflict("-1", "3")).toBe("2");
	});

	it("returns sum when both are safe integers at upper bound", () => {
		expect(
			suggestedQuantityForConflict("9007199254740991", "1"),
		).toBe("9007199254740992");
	});

	it("joins with '+' when result would exceed safe integer", () => {
		expect(
			suggestedQuantityForConflict("9007199254740992", "1"),
		).toBe("9007199254740992+1");
	});

	it("handles single value (only existing)", () => {
		expect(suggestedQuantityForConflict("500 g", null)).toBe("500 g");
	});

	it("handles single value (only new)", () => {
		expect(suggestedQuantityForConflict(null, "1 l")).toBe("1 l");
	});

	it("joins with '+' for two non-integer strings", () => {
		expect(suggestedQuantityForConflict("500 g", "1 l")).toBe("500 g+1 l");
	});

	it("treats '—' as empty: '—' + null returns '—'", () => {
		expect(suggestedQuantityForConflict("—", null)).toBe("—");
	});

	it("treats '—' as empty: null + '—' returns '—'", () => {
		expect(suggestedQuantityForConflict(null, "—")).toBe("—");
	});
});

describe("findDuplicateOnList", () => {
	it("returns null when list is empty", () => {
		expect(findDuplicateOnList([], "Mleko")).toBeNull();
	});

	it("returns null when no matching name", () => {
		const items = [makeListItem({ name: "Chleb" })];
		expect(findDuplicateOnList(items, "Mleko")).toBeNull();
	});

	it("returns item when name matches (same case)", () => {
		const item = makeListItem({ name: "Mleko", id: "li-mleko" });
		expect(findDuplicateOnList([item], "Mleko")).toBe(item);
	});

	it("returns item when name matches (case-insensitive)", () => {
		const item = makeListItem({ name: "Mleko", id: "li-mleko" });
		expect(findDuplicateOnList([item], "mleko")).toBe(item);
		expect(findDuplicateOnList([item], "MLEKO")).toBe(item);
	});

	it("ignores bought items", () => {
		const item = makeListItem({ name: "Mleko", is_bought: true });
		expect(findDuplicateOnList([item], "Mleko")).toBeNull();
	});

	it("returns first active duplicate when multiple with same name", () => {
		const a = makeListItem({ id: "li-a", name: "Mleko" });
		const b = makeListItem({ id: "li-b", name: "Mleko" });
		const found = findDuplicateOnList([a, b], "mleko");
		expect(found).toBe(a);
	});
});

describe("computeSetConflicts", () => {
	const listId = "list-1";

	it("returns only nonConflicting when no name overlap", () => {
		const activeListItems = [makeListItem({ name: "Chleb" })];
		const setItems = [
			makeSetItem({ name: "Mleko", quantity: "1 l" }),
			makeSetItem({ name: "Jajka", quantity: "6" }),
		];
		const result = computeSetConflicts({
			activeListItems,
			setItems,
			listId,
		});
		expect(result.conflicts).toHaveLength(0);
		expect(result.nonConflicting).toHaveLength(2);
		expect(result.nonConflicting[0].name).toBe("Mleko");
		expect(result.nonConflicting[0].list_id).toBe(listId);
		expect(result.nonConflicting[1].name).toBe("Jajka");
	});

	it("returns conflicts with suggestedQuantity '—' when both quantities empty", () => {
		const activeListItems = [makeListItem({ name: "Mleko", quantity: null })];
		const setItems = [makeSetItem({ name: "Mleko", quantity: null })];
		const result = computeSetConflicts({
			activeListItems,
			setItems,
			listId,
		});
		expect(result.conflicts).toHaveLength(1);
		expect(result.conflicts[0].suggestedQuantity).toBe("—");
		expect(result.nonConflicting).toHaveLength(0);
	});

	it("returns conflicts with suggestedQuantity sum when both are integers", () => {
		const activeListItems = [
			makeListItem({ name: "Mleko", quantity: "1", id: "li-mleko" }),
		];
		const setItems = [makeSetItem({ name: "Mleko", quantity: "2" })];
		const result = computeSetConflicts({
			activeListItems,
			setItems,
			listId,
		});
		expect(result.conflicts).toHaveLength(1);
		expect(result.conflicts[0].suggestedQuantity).toBe("3");
		expect(result.conflicts[0].existingItem.id).toBe("li-mleko");
		expect(result.conflicts[0].newItemCandidate.list_id).toBe(listId);
	});

	it("matches by case-insensitive name", () => {
		const activeListItems = [
			makeListItem({ name: "Mleko", quantity: "1", id: "li-mleko" }),
		];
		const setItems = [makeSetItem({ name: "mleko", quantity: "2" })];
		const result = computeSetConflicts({
			activeListItems,
			setItems,
			listId,
		});
		expect(result.conflicts).toHaveLength(1);
		expect(result.conflicts[0].suggestedQuantity).toBe("3");
	});

	it("mix of conflicts and nonConflicting", () => {
		const activeListItems = [
			makeListItem({ name: "Mleko", quantity: null, id: "li-mleko" }),
			makeListItem({ name: "Chleb", quantity: "1", id: "li-chleb" }),
		];
		const setItems = [
			makeSetItem({ name: "Mleko", quantity: "1 l" }),
			makeSetItem({ name: "Chleb", quantity: "2" }),
			makeSetItem({ name: "Jajka", quantity: "6" }),
		];
		const result = computeSetConflicts({
			activeListItems,
			setItems,
			listId,
		});
		expect(result.conflicts).toHaveLength(2);
		expect(result.conflicts[0].suggestedQuantity).toBe("1 l");
		expect(result.conflicts[1].suggestedQuantity).toBe("3");
		expect(result.nonConflicting).toHaveLength(1);
		expect(result.nonConflicting[0].name).toBe("Jajka");
	});

	it("returns all nonConflicting when activeListItems is empty", () => {
		const setItems = [
			makeSetItem({ name: "Mleko" }),
			makeSetItem({ name: "Chleb" }),
		];
		const result = computeSetConflicts({
			activeListItems: [],
			setItems,
			listId,
		});
		expect(result.conflicts).toHaveLength(0);
		expect(result.nonConflicting).toHaveLength(2);
	});
});
