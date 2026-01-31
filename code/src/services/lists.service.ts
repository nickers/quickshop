import { supabaseClient } from "../db/supabase.client";
import type { CreateListDTO, ShoppingList } from "../types/domain.types";

type UUID = string;

export interface IListService {
	/**
	 * Fetches all lists the current user has access to (own + shared).
	 */
	getAllLists(): Promise<ShoppingList[]>;

	/**
	 * Fetches a single list details.
	 */
	getListById(listId: UUID): Promise<ShoppingList>;

	/**
	 * Creates a new shopping list.
	 */
	createList(data: CreateListDTO): Promise<ShoppingList>;

	/**
	 * Updates list metadata (e.g. name).
	 */
	updateList(listId: UUID, data: Partial<CreateListDTO>): Promise<ShoppingList>;

	/**
	 * Deletes a list permanently.
	 */
	deleteList(listId: UUID): Promise<void>;

	/**
	 * Shares a list with another user by email.
	 */
	shareListWithEmail(listId: UUID, email: string): Promise<void>;

	/**
	 * Completes the shopping trip.
	 */
	completeShoppingTrip(listId: UUID): Promise<void>;
}

export class ListsService implements IListService {
	async getAllLists(): Promise<ShoppingList[]> {
		// Get current user
		const {
			data: { user },
		} = await supabaseClient.auth.getUser();
		if (!user) throw new Error("User must be logged in");

		// Step 1: Get all list IDs the user has access to via list_members
		const { data: memberData, error: memberError } = await supabaseClient
			.from("list_members")
			.select("list_id")
			.eq("user_id", user.id);

		if (memberError) throw memberError;

		// If user has no lists, return empty array
		if (!memberData || memberData.length === 0) {
			return [];
		}

		// Extract list IDs
		const listIds = memberData.map((m) => m.list_id);

		// Step 2: Fetch the actual lists using the IDs
		const { data, error } = await supabaseClient
			.from("lists")
			.select("*")
			.in("id", listIds)
			.order("updated_at", { ascending: false });

		if (error) throw error;
		return data;
	}

	async getListById(listId: UUID): Promise<ShoppingList> {
		const { data, error } = await supabaseClient
			.from("lists")
			.select("*")
			.eq("id", listId)
			.single();

		if (error) throw error;
		return data;
	}

	async createList(data: CreateListDTO): Promise<ShoppingList> {
		const {
			data: { user },
			error: authError,
		} = await supabaseClient.auth.getUser();
		if (authError || !user)
			throw new Error("User must be logged in to create a list");

		// Step 1: Create the list
		const { data: newList, error } = await supabaseClient
			.from("lists")
			.insert({
				...data,
				created_by: user.id,
			})
			.select()
			.single();

		if (error) throw error;

		// Step 2: Add the creator as a member of the list using the function
		// We use invite_member_to_list instead of direct INSERT to avoid RLS recursion
		const { error: memberError } = await supabaseClient.rpc(
			"invite_member_to_list",
			{
				p_list_id: newList.id,
				p_user_id: user.id,
			},
		);

		if (memberError) {
			// If adding member fails, we should probably delete the list
			// to maintain consistency, but for now just throw the error
			console.error("Failed to add creator to list_members:", memberError);
			throw new Error("Failed to add user as list member. Please try again.");
		}

		return newList;
	}

	async updateList(
		listId: UUID,
		data: Partial<CreateListDTO>,
	): Promise<ShoppingList> {
		const { data: updatedList, error } = await supabaseClient
			.from("lists")
			.update(data)
			.eq("id", listId)
			.select()
			.single();

		if (error) throw error;
		return updatedList;
	}

	async deleteList(listId: UUID): Promise<void> {
		const { error } = await supabaseClient
			.from("lists")
			.delete()
			.eq("id", listId);

		if (error) throw error;
	}

	async shareListWithEmail(listId: UUID, email: string): Promise<void> {
		// 1. Find user by email
		const { data: users, error: userError } = await supabaseClient
			.from("profiles")
			.select("id")
			.eq("email", email)
			.limit(1);

		if (userError) throw userError;
		if (!users || users.length === 0) {
			throw new Error(`User with email ${email} not found.`);
		}

		const userId = users[0].id;

		// 2. Add to list_members using the function
		// We use invite_member_to_list instead of direct INSERT to:
		// - Avoid RLS recursion issues
		// - Allow existing members to invite others
		const { error: memberError } = await supabaseClient.rpc(
			"invite_member_to_list",
			{
				p_list_id: listId,
				p_user_id: userId,
			},
		);

		if (memberError) {
			// Check for duplicate key violation to avoid throwing if already shared
			if (memberError.message?.includes("already a member")) return;
			throw memberError;
		}
	}

	async completeShoppingTrip(listId: UUID): Promise<void> {
		const { error } = await supabaseClient.rpc("archive_list_items", {
			p_list_id: listId, // Parameter name matches the function definition in DB plan
		});

		if (error) throw error;
	}
}

export const listsService = new ListsService();
