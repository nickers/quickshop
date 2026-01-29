import { supabaseClient } from '../db/supabase.client';
import type { CreateListDTO, ShoppingList } from '../types/domain.types';

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
    const { data, error } = await supabaseClient
      .from('lists')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getListById(listId: UUID): Promise<ShoppingList> {
    const { data, error } = await supabaseClient
      .from('lists')
      .select('*')
      .eq('id', listId)
      .single();

    if (error) throw error;
    return data;
  }

  async createList(data: CreateListDTO): Promise<ShoppingList> {
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('User must be logged in to create a list');

    const { data: newList, error } = await supabaseClient
      .from('lists')
      .insert({
        ...data,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return newList;
  }

  async updateList(listId: UUID, data: Partial<CreateListDTO>): Promise<ShoppingList> {
    const { data: updatedList, error } = await supabaseClient
      .from('lists')
      .update(data)
      .eq('id', listId)
      .select()
      .single();

    if (error) throw error;
    return updatedList;
  }

  async deleteList(listId: UUID): Promise<void> {
    const { error } = await supabaseClient
      .from('lists')
      .delete()
      .eq('id', listId);

    if (error) throw error;
  }

  async shareListWithEmail(listId: UUID, email: string): Promise<void> {
    // 1. Find user by email
    const { data: users, error: userError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (userError) throw userError;
    if (!users || users.length === 0) {
      throw new Error(`User with email ${email} not found.`);
    }

    const userId = users[0].id;

    // 2. Add to list_members
    const { error: memberError } = await supabaseClient
      .from('list_members')
      .insert({
        list_id: listId,
        user_id: userId,
      });

    if (memberError) {
      // Check for duplicate key violation to avoid throwing if already shared
      if (memberError.code === '23505') return; // unique_violation
      throw memberError;
    }
  }

  async completeShoppingTrip(listId: UUID): Promise<void> {
    const { error } = await supabaseClient.rpc('archive_list_items', {
      p_list_id: listId, // Parameter name matches the function definition in DB plan
    });

    if (error) throw error;
  }
}

export const listsService = new ListsService();
