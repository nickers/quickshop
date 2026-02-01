# Debug Logging Guide

## Overview
Comprehensive console logging has been added to trace the business logic around sending updates, applying modifications, and streaming changes from the database. This will help debug timing-related issues in E2E tests.

## Log Emojis Legend
- 🔵 **START** - Operation/query starting
- ✅ **SUCCESS** - Operation completed successfully
- ❌ **ERROR** - Operation failed
- ⏸️ **PAUSE** - Query cancellation (optimistic update beginning)
- ✨ **OPTIMISTIC** - Optimistic update applied to cache
- ⏳ **PENDING** - Item added to pending state
- 🗑️ **CLEANUP** - Item removed from pending state
- ⏪ **ROLLBACK** - Reverting to previous state after error
- 🔄 **INVALIDATE** - Query invalidation triggered
- 🚀 **MUTATION** - Mutation function executing
- 🏁 **SETTLED** - Mutation settled (success or failure)
- 📊 **STATE** - State change detected
- 📋 **DATA** - Data snapshot
- 🌐 **NETWORK** - Network state change
- 💾 **PERSISTENCE** - LocalStorage restore/save
- ▶️ **RESUME** - Resuming paused mutations

## Logging Layers

### 1. TanStack Query Provider (`root-provider.tsx`)
**Global mutation lifecycle tracking:**
- `[MutationCache] ⏰ Mutation starting` - When mutation enters onMutate
- `[MutationCache] ✅ Mutation succeeded` - When mutation completes successfully
- `[MutationCache] ❌ Mutation failed` - When mutation fails
- `[MutationCache] 🏁 Mutation settled` - When mutation settles (regardless of outcome)
- `[MutationCache] 🔄 Invalidating queries` - When queries are invalidated after success

**Network state management:**
- `[QueryClient] 🌐 Going online, resuming paused mutations` - Network reconnected
- `[QueryClient] ✅ All paused mutations resumed` - All queued mutations processed

**Persistence:**
- `[QueryClient] 💾 Restored from localStorage` - State restored on page load
- `[QueryClient] ▶️ Resuming paused mutations after restore` - Offline mutations being retried

### 2. Hooks Layer

#### `useListDetails.ts`
**Query lifecycle:**
- `[useListDetails] 🔵 list query START` - Fetching list metadata
- `[useListDetails] 🔵 list-items query START` - Fetching list items
- `[useListDetails] 📊 Items state changed` - Items array updated in cache

**CREATE mutation:**
- `[useListDetails] 📝 handleAddItem called` - User action initiated
- `[useListDetails] ⚠️ Duplicate found` - Conflict detected
- `[useListDetails] ➕ Creating new item mutation` - Starting create
- `[useListDetails] ⏸️ CREATE onMutate` - Pausing queries, applying optimistic update
- `[useListDetails] 📊 Previous items count` - Snapshot before optimistic update
- `[useListDetails] ✨ Optimistic update applied` - Cache updated with temp item
- `[useListDetails] ⏳ Added to pendingIds` - Tracking pending state
- `[useListDetails] 🚀 CREATE mutationFn called` - Actual API call starting
- `[useListDetails] ✅ CREATE onSettled` - Mutation complete
- `[useListDetails] 🗑️ Removed from pendingIds` - Cleanup
- `[useListDetails] ❌ CREATE onError` - If mutation fails
- `[useListDetails] ⏪ Rollback to previous items` - Reverting cache on error

**UPDATE mutation:**
- Similar pattern with UPDATE prefix

**DELETE mutation:**
- Similar pattern with DELETE prefix

**Sync retry:**
- `[useListDetails] 🔄 onSyncRetry called` - Manual retry triggered

#### `useListsView.ts`
**Query lifecycle:**
- `[useListsView] 🔵 listsQuery START` - Fetching all lists
- `[useListsView] 📋 Fetched lists` - Lists retrieved
- `[useListsView] ✅ listsQuery SUCCESS` - Query complete
- `[useListsView] 📊 Lists state changed` - Lists array updated

**CREATE mutation:**
- `[useListsView] 🚀 createList mutationFn called` - Creating list
- `[useListsView] ✅ createList onSuccess` - List created successfully
- `[useListsView] ❌ createList onError` - List creation failed

**DELETE mutation:**
- `[useListsView] 🚀 deleteList mutationFn called` - Deleting list
- `[useListsView] ⏸️ deleteList onMutate` - Optimistic removal
- `[useListsView] 📊 Previous lists count` - Snapshot
- `[useListsView] ✨ Optimistic delete applied` - Cache updated
- `[useListsView] ✅ deleteList onSettled` - Mutation complete
- `[useListsView] ❌ deleteList onError` - Deletion failed
- `[useListsView] ⏪ Rollback to previous lists` - Revert on error

### 3. Service Layer

#### `items.service.ts`
**All methods follow this pattern:**
- `[ListItemsService] 🔵 {method} START` - Database operation starting
- `[ListItemsService] ✅ {method} SUCCESS` - Database operation completed
- `[ListItemsService] ❌ {method} ERROR` - Database operation failed

**Methods:**
- `getItemsByListId` - Also logs item count and names
- `createItem` - Logs item name and generated ID
- `updateItem` - Logs item ID and updates
- `deleteItem` - Logs item ID

#### `lists.service.ts`
**Methods:**
- `getAllLists` - Logs user lists, member IDs, and retrieved lists
- `createList` - Logs list creation and member addition steps
- `getListById` - Logs list retrieval

## Timing Analysis

### Expected Flow for Adding an Item:

1. **User Action** → `[useListDetails] 📝 handleAddItem called`
2. **Duplicate Check** → Either proceed or show conflict
3. **Mutation Start** → `[useListDetails] ➕ Creating new item mutation`
4. **Optimistic Update** → 
   - `[MutationCache] ⏰ Mutation starting`
   - `[useListDetails] ⏸️ CREATE onMutate`
   - `[useListDetails] ✨ Optimistic update applied`
   - `[useListDetails] 📊 Items state changed` (React re-render)
5. **Database Call** → 
   - `[useListDetails] 🚀 CREATE mutationFn called`
   - `[ListItemsService] 🔵 createItem START`
   - `[ListItemsService] ✅ createItem SUCCESS`
6. **Mutation Success** → 
   - `[MutationCache] ✅ Mutation succeeded`
   - `[useListDetails] ✅ CREATE onSettled`
   - `[MutationCache] 🏁 Mutation settled`
7. **Query Invalidation** → 
   - `[MutationCache] 🔄 Invalidating queries`
   - `[useListDetails] 🔵 list-items query START` (refetch)
   - `[ListItemsService] 🔵 getItemsByListId START`
   - `[ListItemsService] ✅ getItemsByListId SUCCESS`
8. **Cache Update** → `[useListDetails] 📊 Items state changed` (with real ID from DB)

### Expected Flow for Creating a List:

1. **Mutation Start** → `[useListsView] 🚀 createList mutationFn called`
2. **Database Calls** → 
   - `[ListsService] 🔵 createList START`
   - `[ListsService] ✅ List created`
   - `[ListsService] 🔵 Adding creator as member`
   - `[ListsService] ✅ createList SUCCESS`
3. **Success Handler** → `[useListsView] ✅ createList onSuccess`
4. **Query Invalidation** → Triggers lists refetch
5. **Refetch** → 
   - `[useListsView] 🔵 listsQuery START`
   - `[ListsService] 🔵 getAllLists START`
   - `[ListsService] 📋 List IDs from members`
   - `[ListsService] ✅ getAllLists SUCCESS`
6. **Cache Update** → `[useListsView] 📊 Lists state changed`

## Debugging E2E Test Issues

### Common Timing Issues to Look For:

1. **Race Condition: Query Invalidation Before Mutation Complete**
   - Look for invalidation logs appearing before mutation settled
   - Check timestamps between mutation success and query start

2. **Optimistic Update Not Applied**
   - Missing `✨ Optimistic update applied` log
   - Check if `onMutate` was called

3. **Stale Cache After Mutation**
   - Mutation succeeds but items state doesn't update
   - Check if invalidation triggered
   - Look for refetch logs after invalidation

4. **Database Write Not Visible**
   - Mutation succeeds but refetch doesn't include new data
   - Check database operation timestamps vs. query timestamps
   - May indicate database replication lag

5. **Paused Mutations Not Resuming**
   - Look for `🌐 Going online` without corresponding resume logs
   - Check paused mutation count

## Filtering Logs in Console

Use these filter patterns in browser DevTools:

- **All debug logs:** `useListDetails|useListsView|ListItemsService|ListsService|MutationCache|QueryClient`
- **Only mutations:** `mutationFn|onMutate|onSettled|onSuccess|onError`
- **Only queries:** `query START|query SUCCESS`
- **Timing issues:** Filter by item name and trace timestamps
- **State changes:** `state changed`

## Next Steps

After running tests:
1. Filter console logs by the specific item/list name being tested
2. Follow the emoji trail to identify where the flow breaks
3. Compare timestamps to identify race conditions
4. Look for missing logs in the expected flow
5. Check if mutations are being paused/queued unexpectedly

## Cleanup

To remove debug logs after fixing:
1. Search for `console.log("[use` in hooks files
2. Search for `console.log("[List` in service files
3. Search for `console.log("[Mutation` and `console.log("[Query` in provider files
