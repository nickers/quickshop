import { supabaseClient } from "../db/supabase.client";
import type {
	CreateListItemDTO,
	ListItem,
	UpdateListItemDTO,
} from "../types/domain.types";

type UUID = string;

export interface IListItemsService {
	/**
	 * Fetches all items for a specific list.
	 */
	getItemsByListId(listId: UUID): Promise<ListItem[]>;

	/**
	 * Adds a single item to a list.
	 */
	createItem(data: CreateListItemDTO): Promise<ListItem>;

	/**
	 * Updates an item (toggle bought, change quantity, edit note).
	 */
	updateItem(data: UpdateListItemDTO): Promise<ListItem>;

	/**
	 * Deletes an item.
	 */
	deleteItem(itemId: UUID): Promise<void>;

	/**
	 * Updates the order of multiple items.
	 */
	reorderItems(items: { id: UUID; sort_order: number }[]): Promise<void>;

	/**
	 * Bulk creates items (used when importing from Sets).
	 */
	bulkCreateItems(items: CreateListItemDTO[]): Promise<ListItem[]>;
}

export class ListItemsService implements IListItemsService {
	async getItemsByListId(listId: UUID): Promise<ListItem[]> {
		const { data, error } = await supabaseClient
			.from("list_items")
			.select("*")
			.eq("list_id", listId)
			.order("sort_order", { ascending: true });

		if (error) throw error;
		return data;
	}

	async createItem(data: CreateListItemDTO): Promise<ListItem> {
		const { data: newItem, error } = await supabaseClient
			.from("list_items")
			.insert(data)
			.select()
			.single();

		if (error) throw error;
		return newItem;
	}

	async updateItem(data: UpdateListItemDTO): Promise<ListItem> {
		const { id, ...updates } = data;
		const { data: updatedItem, error } = await supabaseClient
			.from("list_items")
			.update(updates)
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return updatedItem;
	}

	async deleteItem(itemId: UUID): Promise<void> {
		const { error } = await supabaseClient
			.from("list_items")
			.delete()
			.eq("id", itemId);

		if (error) throw error;
	}

	async reorderItems(items: { id: UUID; sort_order: number }[]): Promise<void> {
		// Ideally we would use a bulk update (RPC or UPSERT with full data).
		// For MVP, handling partial updates via Promise.all is acceptable given the low volume.
		// Upsert fails for partial updates if required fields (name) are missing.
		const updates = items.map((item) =>
			supabaseClient
				.from("list_items")
				.update({ sort_order: item.sort_order })
				.eq("id", item.id),
		);

		const results = await Promise.all(updates);
		const error = results.find((r) => r.error)?.error;
		if (error) throw error;
	}

	async bulkCreateItems(items: CreateListItemDTO[]): Promise<ListItem[]> {
		const { data, error } = await supabaseClient
			.from("list_items")
			.insert(items)
			.select();

		if (error) throw error;
		return data;
	}
}

export const listItemsService = new ListItemsService();
