# Debug Logging Implementation Summary

## What Was Added

Comprehensive console logging has been added throughout the application's data flow to help debug timing-related issues in E2E tests where list/items added to the database are not displayed.

## Files Modified

### 1. Query Provider Layer
**File:** `code/src/integrations/tanstack-query/root-provider.tsx`
- Added logs to mutation cache lifecycle (onMutate, onSuccess, onError, onSettled)
- Added logs for network state changes (online/offline)
- Added logs for mutation persistence/restoration from localStorage
- Added logs for paused mutation resume operations
- Enhanced with timestamps and mutation counts

### 2. Business Logic Hooks
**File:** `code/src/hooks/useListDetails.ts`
- Added logs to query execution (list and list-items queries)
- Added comprehensive logs to CREATE, UPDATE, DELETE mutation lifecycles:
  - onMutate (optimistic updates, query cancellation)
  - mutationFn (actual API call)
  - onError (rollback logic)
  - onSettled (cleanup)
- Added logs to handleAddItem (user action tracking)
- Added logs to onSyncRetry
- Added useEffect to track items state changes

**File:** `code/src/hooks/useListsView.ts`
- Added logs to lists query execution
- Added logs to CREATE and DELETE list mutations
- Added useEffect to track lists state changes

### 3. Service Layer (Database Operations)
**File:** `code/src/services/items.service.ts`
- Added logs to all CRUD operations:
  - getItemsByListId (with item count and names)
  - createItem (with item details and ID)
  - updateItem (with item ID and changes)
  - deleteItem (with item ID)
- Each operation logs START, SUCCESS, and ERROR states with timestamps

**File:** `code/src/services/lists.service.ts`
- Added logs to list operations:
  - getAllLists (with member IDs and list names)
  - createList (with list creation and member addition steps)
  - getListById
- Each operation logs START, SUCCESS, and ERROR states with timestamps

### 4. Documentation
**File:** `DEBUG_LOGS_GUIDE.md`
- Comprehensive guide explaining:
  - Log emoji legend for quick visual identification
  - Logging layers and their purposes
  - Expected flow diagrams for common operations
  - Common timing issues to look for
  - Console filtering patterns
  - Next steps for debugging

## Log Structure

All logs follow a consistent pattern:
```
[Component/Service] EMOJI Action | Key: Value | Key: Value | Timestamp: ISO8601
```

Example:
```
[useListDetails] ✅ CREATE onSettled | OptimisticId: abc-123 | Data: present | Error: null | Timestamp: 2026-02-01T...
```

## Key Debugging Points

The logs track the complete lifecycle:

1. **User Action** → Handler called
2. **Optimistic Update** → Query paused, cache updated, UI re-renders
3. **Database Operation** → Service layer START/SUCCESS/ERROR
4. **Mutation Complete** → onSuccess/onError/onSettled
5. **Query Invalidation** → Cache marked stale
6. **Refetch** → Fresh data from database
7. **Cache Update** → UI re-renders with real data

## How to Use

1. Run your E2E tests
2. Open browser DevTools console
3. Filter logs by operation (see DEBUG_LOGS_GUIDE.md for filter patterns)
4. Follow the emoji trail to identify where the flow breaks
5. Compare timestamps to identify race conditions
6. Look for missing expected log entries

## Example Issue Detection

**Symptom:** List created but not displayed

Look for this sequence:
```
[ListsService] ✅ createList SUCCESS | ListId: xyz | Timestamp: T1
[useListsView] ✅ createList onSuccess | Timestamp: T2
[useListsView] 🔵 listsQuery START | Timestamp: T3
[ListsService] 🔵 getAllLists START | Timestamp: T4
[ListsService] 📋 List IDs from members: [...] | Timestamp: T5
[ListsService] ✅ getAllLists SUCCESS | Count: X | Lists: [...] | Timestamp: T6
[useListsView] 📊 Lists state changed | Count: X | Timestamp: T7
```

If the new list is not in the final count/lists, the issue is in database visibility (RLS, replication lag, or transaction timing).

## Cleanup After Debugging

Once issues are identified and fixed, search for:
- `console.log("[use` in hooks
- `console.log("[List` in services
- `console.log("[Mutation` and `console.log("[Query` in provider

These can be removed or commented out for production.

## Performance Notes

- All logs use string concatenation with `|` separator for clarity
- Timestamps use `new Date().toISOString()` for consistency
- Logs include only essential data to minimize noise
- State change logs (useEffect) will fire on every render but help track React update cycles
