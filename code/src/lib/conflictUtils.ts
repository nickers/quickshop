import type {
	CreateListItemDTO,
	ListItem,
	SetConflictItem,
	SetItem,
} from "@/types/domain.types";

/**
 * Parametry wywołania computeSetConflicts.
 * Umożliwia jasną sygnaturę i łatwe rozszerzenie (np. opcje normalizacji nazw).
 */
export interface ComputeSetConflictsInput {
	/** Aktywne pozycje na liście (np. listItems.filter(i => !i.is_bought)). */
	activeListItems: ListItem[];
	/** Pozycje zestawu do dodania. */
	setItems: SetItem[];
	/** ID listy docelowej (do pól list_id w CreateListItemDTO). */
	listId: string;
}

/**
 * Wynik podziału pozycji zestawu na konflikty i pozycje do utworzenia.
 */
export interface ComputeSetConflictsResult {
	conflicts: SetConflictItem[];
	nonConflicting: CreateListItemDTO[];
}

const PLACEHOLDER_NO_QUANTITY = "—";

function isEmptyQuantity(value: string | null): boolean {
	return value == null || value === "" || value === PLACEHOLDER_NO_QUANTITY;
}

/**
 * Parsuje string jako liczbę całkowitą (trim, opcjonalny minus, cyfry).
 * Zwraca number lub null.
 */
function parseIntegerOrNull(value: string | null): number | null {
	if (value == null) return null;
	const trimmed = value.trim();
	if (trimmed === "") return null;
	if (!/^-?\d+$/.test(trimmed)) return null;
	const n = parseInt(trimmed, 10);
	return Number.isSafeInteger(n) ? n : null;
}

/**
 * Łączy ilości przy konflikcie. Gdy **obie** wartości są liczbami całkowitymi
 * (trim, opcjonalny minus, safe integer), zwraca ich **sumę**; w przeciwnym razie
 * łączy przez '+'. Wartość '—' traktowana jak brak. Gdy obie puste/null/'—' → '—'.
 */
export function suggestedQuantityForConflict(
	existingQuantity: string | null,
	newQuantity: string | null,
): string {
	const parts = [existingQuantity, newQuantity].filter(
		(v): v is string => !isEmptyQuantity(v),
	);
	if (parts.length === 0) return PLACEHOLDER_NO_QUANTITY;
	if (parts.length === 2) {
		const a = parseIntegerOrNull(parts[0]);
		const b = parseIntegerOrNull(parts[1]);
		if (a !== null && b !== null) return String(a + b);
	}
	return parts.join("+");
}

/**
 * Szuka na liście pozycji o danej nazwie (case-insensitive), tylko niekupione.
 * Zwraca znaleziony ListItem lub null.
 */
export function findDuplicateOnList(
	items: ListItem[],
	name: string,
): ListItem | null {
	const normalizedName = name.toLowerCase();
	return (
		items.find(
			(item) =>
				item.name.toLowerCase() === normalizedName && !item.is_bought,
		) ?? null
	);
}

/**
 * Dla każdej pozycji zestawu: szuka duplikatu na liście (po nazwie);
 * przy duplikacie buduje SetConflictItem z suggestedQuantityForConflict;
 * bez duplikatu dodaje do nonConflicting jako CreateListItemDTO.
 */
export function computeSetConflicts(
	input: ComputeSetConflictsInput,
): ComputeSetConflictsResult {
	const { activeListItems, setItems, listId } = input;
	const nameToExisting = new Map(
		activeListItems.map((i) => [i.name.toLowerCase(), i]),
	);

	const conflicts: SetConflictItem[] = [];
	const nonConflicting: CreateListItemDTO[] = [];

	for (let i = 0; i < setItems.length; i++) {
		const setItem = setItems[i];
		const dto: CreateListItemDTO = {
			list_id: listId,
			name: setItem.name,
			quantity: setItem.quantity ?? null,
			note: setItem.note ?? null,
			is_bought: false,
			sort_order: setItem.sort_order ?? i,
		};
		const existing = nameToExisting.get(setItem.name.toLowerCase());
		if (existing) {
			conflicts.push({
				existingItem: existing,
				newItemCandidate: dto,
				suggestedQuantity: suggestedQuantityForConflict(
					existing.quantity,
					setItem.quantity,
				),
			});
		} else {
			nonConflicting.push(dto);
		}
	}

	return { conflicts, nonConflicting };
}
