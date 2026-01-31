import type { Database } from "../db/database.types";

// Primitive Types aliases for clarity
type UUID = string;

// Domain Entities
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ShoppingList = Database["public"]["Tables"]["lists"]["Row"];
export type ListItem = Database["public"]["Tables"]["list_items"]["Row"];
export type ShoppingSet = Database["public"]["Tables"]["sets"]["Row"];
export type SetItem = Database["public"]["Tables"]["set_items"]["Row"];
export type HistoryEntry =
	Database["public"]["Tables"]["shopping_history"]["Row"];

/**
 * Element zrzutu items_snapshot w shopping_history (archive_list_items).
 */
export interface HistoryItemSnapshot {
	name: string;
	quantity: string | null;
	note: string | null;
}

// DTOs (Data Transfer Objects) for creating/updating
export interface CreateListDTO {
	name: string;
}

export interface CreateListItemDTO {
	list_id: UUID;
	name: string;
	quantity?: string | null;
	note?: string | null;
	is_bought?: boolean;
	sort_order?: number;
}

export interface UpdateListItemDTO {
	id: UUID;
	name?: string;
	quantity?: string | null;
	note?: string | null;
	is_bought?: boolean;
	sort_order?: number;
}

export interface CreateSetDTO {
	name: string;
	description?: string | null;
}

export interface CreateSetItemDTO {
	set_id: UUID;
	name: string;
	quantity?: string | null;
	note?: string | null;
	sort_order?: number;
}

// ViewModels for UI components
/**
 * ViewModel for a single list in the Lists View.
 * Extends ShoppingList with additional fields needed for display.
 */
export interface ListViewModel extends ShoppingList {
	/**
	 * Total number of products on the list (bought + unbought)
	 */
	totalItems: number;

	/**
	 * Number of products marked as bought
	 */
	boughtItems: number;

	/**
	 * Whether the list is shared with other users
	 * (true if created_by !== current_user_id)
	 */
	isShared: boolean;

	/**
	 * Optional: owner's name (to display if isShared === true)
	 * Requires join with profiles table
	 */
	ownerName?: string;
}

// Reprezentacja stanu konfliktu przy dodawaniu zestawu
export interface SetConflictItem {
	existingItem: ListItem;
	newItemCandidate: CreateListItemDTO;
	// Sugerowana nowa ilość (np. konkatenacja stringów)
	suggestedQuantity: string;
}

// Wynik rozwiązania konfliktu zestawu
export interface SetResolutionResult {
	itemsToCreate: CreateListItemDTO[]; // Produkty bez konfliktów + zaakceptowane nowe
	itemsToUpdate: { itemId: UUID; newQuantity: string }[]; // Produkty zaktualizowane
}

// Stan modala konfliktu pojedynczego
export interface SingleItemConflictState {
	isOpen: boolean;
	conflictingItem?: ListItem;
	pendingName?: string; // Nazwa którą użytkownik próbował dodać
}
