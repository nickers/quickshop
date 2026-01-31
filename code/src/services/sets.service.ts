import { supabaseClient } from "../db/supabase.client";
import type {
	CreateSetDTO,
	CreateSetItemDTO,
	SetItem,
	ShoppingSet,
} from "../types/domain.types";

type UUID = string;

export interface ISetsService {
	/**
	 * Fetches all sets available to the user.
	 */
	getAllSets(): Promise<ShoppingSet[]>;

	/**
	 * Fetches items belonging to a specific set.
	 */
	getSetItems(setId: UUID): Promise<SetItem[]>;

	/**
	 * Creates a new empty set.
	 */
	createSet(data: CreateSetDTO): Promise<ShoppingSet>;

	/**
	 * Creates a new set populated with items from an existing list.
	 */
	createSetFromList(listId: UUID, data: CreateSetDTO): Promise<ShoppingSet>;

	/**
	 * Add items to a set.
	 */
	addSetItem(data: CreateSetItemDTO): Promise<SetItem>;

	/**
	 * Updates a set item.
	 */
	updateSetItem(
		itemId: UUID,
		data: Partial<CreateSetItemDTO>,
	): Promise<SetItem>;

	/**
	 * Deletes a set item.
	 */
	deleteSetItem(itemId: UUID): Promise<void>;

	/**
	 * Deletes a set.
	 */
	deleteSet(setId: UUID): Promise<void>;
}

export class SetsService implements ISetsService {
	async getAllSets(): Promise<ShoppingSet[]> {
		// Same pattern as lists: query set_members first (no recursion), then sets by ID
		const {
			data: { user },
		} = await supabaseClient.auth.getUser();
		if (!user) throw new Error("User must be logged in");

		const { data: memberData, error: memberError } = await supabaseClient
			.from("set_members")
			.select("set_id")
			.eq("user_id", user.id);

		if (memberError) throw memberError;
		if (!memberData || memberData.length === 0) return [];

		const setIds = memberData.map((m) => m.set_id);

		const { data, error } = await supabaseClient
			.from("sets")
			.select("*")
			.in("id", setIds)
			.order("name", { ascending: true });

		if (error) throw error;
		return data;
	}

	async getSetItems(setId: UUID): Promise<SetItem[]> {
		const { data, error } = await supabaseClient
			.from("set_items")
			.select("*")
			.eq("set_id", setId)
			.order("sort_order", { ascending: true });

		if (error) throw error;
		return data;
	}

	async createSet(data: CreateSetDTO): Promise<ShoppingSet> {
		const {
			data: { user },
			error: authError,
		} = await supabaseClient.auth.getUser();
		if (authError || !user)
			throw new Error("User must be logged in to create a set");

		const { data: newSet, error } = await supabaseClient
			.from("sets")
			.insert({
				...data,
				created_by: user.id,
			})
			.select()
			.single();

		if (error) throw error;

		// Add creator to set_members (avoids RLS recursion; same pattern as lists)
		const { error: memberError } = await supabaseClient.rpc(
			"invite_member_to_set",
			{
				p_set_id: newSet.id,
				p_user_id: user.id,
			},
		);

		if (memberError) {
			console.error("Failed to add creator to set_members:", memberError);
			throw new Error(
				"Nie udało się dodać użytkownika do zestawu. Spróbuj ponownie.",
			);
		}

		return newSet;
	}

	async createSetFromList(
		listId: UUID,
		data: CreateSetDTO,
	): Promise<ShoppingSet> {
		// 1. Fetch List Items
		const { data: listItems, error: listError } = await supabaseClient
			.from("list_items")
			.select("*")
			.eq("list_id", listId);

		if (listError) throw listError;

		// 2. Create Set
		const newSet = await this.createSet(data);

		if (!listItems || listItems.length === 0) {
			return newSet;
		}

		// 3. Transform to Set Items
		const setItemsPayload = listItems.map((item) => ({
			set_id: newSet.id,
			name: item.name,
			quantity: item.quantity,
			note: item.note,
			sort_order: item.sort_order,
		}));

		// 4. Bulk Insert
		const { error: insertError } = await supabaseClient
			.from("set_items")
			.insert(setItemsPayload);

		if (insertError) {
			// In a real app we might want to rollback the set creation here
			throw insertError;
		}

		return newSet;
	}

	async addSetItem(data: CreateSetItemDTO): Promise<SetItem> {
		const { data: newItem, error } = await supabaseClient
			.from("set_items")
			.insert(data)
			.select()
			.single();

		if (error) throw error;
		return newItem;
	}

	async updateSetItem(
		itemId: UUID,
		data: Partial<CreateSetItemDTO>,
	): Promise<SetItem> {
		const { data: updatedItem, error } = await supabaseClient
			.from("set_items")
			.update(data)
			.eq("id", itemId)
			.select()
			.single();

		if (error) throw error;
		return updatedItem;
	}

	async deleteSetItem(itemId: UUID): Promise<void> {
		const { error } = await supabaseClient
			.from("set_items")
			.delete()
			.eq("id", itemId);

		if (error) throw error;
	}

	async deleteSet(setId: UUID): Promise<void> {
		const { error } = await supabaseClient
			.from("sets")
			.delete()
			.eq("id", setId);

		if (error) throw error;
	}
}

export const setsService = new SetsService();
