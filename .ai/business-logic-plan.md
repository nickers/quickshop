<api_analysis>

1.  **Database Entity Analysis**

    *   **Profiles (`profiles`)**: User identity.
        *   *Columns*: `id`, `full_name`, `email`.
        *   *Relevance*: Used for `list_members` and `set_members`.
    *   **Lists (`lists`)**: The central grouping entity.
        *   *Columns*: `id`, `name`, `created_by`.
        *   *Relevance*: Parent of items, subject of sharing.
    *   **List Members (`list_members`)**: Permissions/Sharing.
        *   *Columns*: `list_id`, `user_id`.
        *   *Relevance*: Determines access control (RLS).
    *   **List Items (`list_items`)**: The actual content.
        *   *Columns*: `id`, `list_id`, `name`, `quantity`, `note`, `is_bought`, `sort_order`.
        *   *Relevance*: High frequency CRUD, sorting, toggling status.
    *   **Sets (`sets`)**: Templates.
        *   *Columns*: `id`, `name`, `description`.
    *   **Set Items (`set_items`)**: Template content.
        *   *Columns*: `set_id`, `name`, `quantity`, `sort_order`.
    *   **Shopping History (`shopping_history`)**: Archive.
        *   *Columns*: `user_id`, `list_name`, `items_snapshot`, `completed_at`.
        *   *Relevance*: Created via RPC `archive_list_items`.

2.  **PRD Business Logic Mapping**

    *   **Auth (US-001 - US-003)**: Handled primarily by Supabase Auth SDK. We need a helper to get the current user profile.
    *   **Lists (US-004 - US-006)**:
        *   Create: Simple insert.
        *   Share: Insert into `list_members`. Requires looking up user ID by email.
        *   Archive: Triggers `archive_list_items` RPC and potentially updates list status or deletes it (PRD implies "list disappears from active", DB plan mentions `archive_list_items` function).
    *   **Items (US-007 - US-011)**:
        *   Add/Update/Delete: Standard CRUD.
        *   Reorder: Batch update of `sort_order`.
        *   Duplicates: PRD requires UI logic ("highlight existing"). Service needs `updateListItem` (to merge quantities) and `createListItem` (if new).
    *   **Sets (US-012 - US-014)**:
        *   Create from List: Needs to read list items and insert into set/set_items.
        *   Add to List: Needs to read set items and insert/merge into list_items.
    *   **History (US-015)**: Read-only access to `shopping_history`.

3.  **Interface Design Decisions**

    *   *Granularity*: Should we have a giant `QuickShopService` or split it?
        *   *Decision*: Split into logical domains: `ListService`, `SetService`, `HistoryService`, `ProfileService`. This keeps code maintainable.
    *   *Method: `shareList`*:
        *   Option A: `shareList(listId, userId)` - assumes we already know the UUID.
        *   Option B: `shareList(listId, email)` - handles the lookup internally.
        *   *Decision*: Option B is more aligned with the UI flow (User enters email), but purely DB-centric interfaces usually expect IDs. I will propose `inviteUserByEmail(listId, email)` which encapsulates the lookup logic.
    *   *Method: `completeShopping` (US-006)*:
        *   The DB Plan specifies a specific RPC function `archive_list_items`. The interface *must* expose this.
    *   *Method: `addSetToList` (US-014)*:
        *   PRD mentions "Ask user to increase quantity" if duplicate. This implies the merging logic happens *client-side* (or in the business layer before DB commit).
        *   The interface needs to support `bulkUpsertListItems` or the client will loop `create/update`. A `bulkCreate` is more efficient for adding a whole set.

4.  **Validation & Types**:
    *   We will rely on generated Supabase types for entities but create stricter DTOs for creation/updates (removing system fields like `created_at`).

</api_analysis>

# Business Logic Interface Proposal

This document outlines the TypeScript interfaces for the application's business logic layer. These interfaces are designed to be implemented using Supabase client + TanStack Query.

## 1. Type Definitions

These types mirror the database schema but are adapted for frontend usage. We assume the existence of a base `Database` type generated from Supabase.

```typescript
import { Database } from '../db/database.types';

// Primitive Types aliases for clarity
type UUID = string;

// Domain Entities
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ShoppingList = Database['public']['Tables']['lists']['Row'];
export type ListItem = Database['public']['Tables']['list_items']['Row'];
export type ShoppingSet = Database['public']['Tables']['sets']['Row'];
export type SetItem = Database['public']['Tables']['set_items']['Row'];
export type HistoryEntry = Database['public']['Tables']['shopping_history']['Row'];

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
```

## 2. Service Interfaces

### I. List Service (`ListsService`)
Handles lifecycle of shopping lists and their items.

```typescript
export interface IListService {
  /**
   * Fetches all lists the current user has access to (own + shared).
   * Maps to: select * from lists (RLS handles filtering)
   */
  getAllLists(): Promise<ShoppingList[]>;

  /**
   * Fetches a single list details.
   */
  getListById(listId: UUID): Promise<ShoppingList>;

  /**
   * Creates a new shopping list.
   * US-004
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
   * Implementation: Look up profile by email -> Insert into list_members.
   * US-005
   */
  shareListWithEmail(listId: UUID, email: string): Promise<void>;

  /**
   * Completes the shopping trip.
   * Implementation: Calls RPC `archive_list_items(list_id)`.
   * US-006
   */
  completeShoppingTrip(listId: UUID): Promise<void>;
}
```

### II. List Item Service (`ListItemsService`)
Handles manipulation of specific items within a list.

```typescript
export interface IListItemsService {
  /**
   * Fetches all items for a specific list.
   * Should support sorting by `sort_order` or `is_bought`.
   */
  getItemsByListId(listId: UUID): Promise<ListItem[]>;

  /**
   * Adds a single item to a list.
   * US-007
   */
  createItem(data: CreateListItemDTO): Promise<ListItem>;

  /**
   * Updates an item (toggle bought, change quantity, edit note).
   * US-009, US-010 (merging duplicates)
   */
  updateItem(data: UpdateListItemDTO): Promise<ListItem>;

  /**
   * Deletes an item.
   */
  deleteItem(itemId: UUID): Promise<void>;

  /**
   * Updates the order of multiple items.
   * Implementation: Bulk update of `sort_order` field.
   * US-011
   */
  reorderItems(items: { id: UUID; sort_order: number }[]): Promise<void>;
  
  /**
   * Bulk creates items (used when importing from Sets).
   * US-014
   */
  bulkCreateItems(items: CreateListItemDTO[]): Promise<ListItem[]>;
}
```

### III. Set Service (`SetsService`)
Handles Templates/Sets.

```typescript
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
   * US-013
   */
  createSet(data: CreateSetDTO): Promise<ShoppingSet>;

  /**
   * Creates a new set populated with items from an existing list.
   * Implementation: Fetch list items -> Create Set -> Bulk Create Set Items.
   * US-012
   */
  createSetFromList(listId: UUID, data: CreateSetDTO): Promise<ShoppingSet>;

  /**
   * Add items to a set.
   */
  addSetItem(data: CreateSetItemDTO): Promise<SetItem>;
  
  /**
   * Updates a set item.
   */
  updateSetItem(itemId: UUID, data: Partial<CreateSetItemDTO>): Promise<SetItem>;

  /**
   * Deletes a set item.
   */
  deleteSetItem(itemId: UUID): Promise<void>;
  
   /**
   * Deletes a set.
   */
  deleteSet(setId: UUID): Promise<void>;
}
```

### IV. History Service (`HistoryService`)

```typescript
export interface IHistoryService {
  /**
   * Fetches completed shopping trips.
   * US-015
   */
  getHistory(): Promise<HistoryEntry[]>;
}
```

## 3. User Story Mapping

| User Story | Method / Action | Logic Details |
| :--- | :--- | :--- |
| **US-001 - US-003** (Auth) | *Supabase Auth SDK* | Handled directly by `supabase.auth.signIn*` |
| **US-004** (Create List) | `ListsService.createList` | Inserts row into `lists`. |
| **US-005** (Share List) | `ListsService.shareListWithEmail` | Needs to handle "User not found" errors gracefully. |
| **US-006** (Archive) | `ListsService.completeShoppingTrip` | Triggers DB function `archive_list_items`. |
| **US-007** (Add Item) | `ListItemsService.createItem` | Standard INSERT. |
| **US-008** (Offline Add) | *TanStack Query Mutation* | `createItem` will be used with `onMutate` for optimistic update. |
| **US-009** (Toggle Bought) | `ListItemsService.updateItem` | Update `is_bought = true`. |
| **US-010** (Duplicates) | `ListItemsService.updateItem` | UI detects duplicate name -> prompts user -> calls `updateItem` to sum quantity instead of `createItem`. |
| **US-011** (Sort) | `ListItemsService.reorderItems` | Updates `sort_order` float values. |
| **US-012** (Set from List) | `SetsService.createSetFromList` | Reads List Items -> Writes Set Items. |
| **US-013** (Manage Sets) | `SetsService` (various) | CRUD on Sets and SetItems tables. |
| **US-014** (Set to List) | `ListItemsService.bulkCreateItems` | UI fetches Set Items -> transforms to `CreateListItemDTO` -> calls bulk create. |
| **US-015** (History) | `HistoryService.getHistory` | Simple SELECT with ordering. |

## 4. Implementation Notes

1.  **Optimistic UI (US-008, US-016)**:
    *   All "Create/Update/Delete" methods in the implementation should be wrapped in TanStack Query `useMutation` hooks.
    *   The `onMutate` callback must strictly update the cache to ensure the app feels instant (offline-first).
    *   Since `id`s are UUIDs generated by the DB (`default: gen_random_uuid()`), for optimistic creation, we must generate a temporary UUID on the client side to track the item in the cache until the server confirms the real ID.

2.  **Conflict Resolution (US-017, US-018)**:
    *   Supabase Realtime subscriptions should be set up in a `useEffect` at the List View level.
    *   When an `INSERT/UPDATE/DELETE` event arrives via WebSocket, the TanStack Query cache should be invalidated or updated directly.
    *   "Last Write Wins" is the default behavior of PostgreSQL `UPDATE`, so no special logic is needed in the interface unless we want to merge JSON blobs (which we aren't doing for items).

3.  **Authentication**:
    *   The Supabase client used in these services must be the authenticated instance.
    *   `shareListWithEmail` requires a strategy to find `user_id` from `email`. Since `profiles` table is readable by authenticated users (per DB Plan), we can perform a `SELECT id FROM profiles WHERE email = $1`.

4.  **Bulk Operations**:
    *   `reorderItems` and `bulkCreateItems` should use `supabase.from(...).upsert(...)` or `.insert(...)` with an array of objects to minimize network requests.

5.  **Validation**:
    *   Inputs should be validated using Zod schemas before calling these services to ensure `quantity` formats or `names` meet requirements (e.g., non-empty).
