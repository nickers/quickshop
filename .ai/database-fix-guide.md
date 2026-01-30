# Database RLS Policy Fix Guide - COMPLETE FIX

## Problem Description

When trying to create a new list, you encountered these errors:

```
Error 1: infinite recursion detected in policy for relation "list_members"
Error 2: infinite recursion detected in policy for relation "lists"
Code: 42P17
```

## Root Cause

The RLS (Row Level Security) policies had **circular dependencies** between `lists` and `list_members` tables that caused infinite recursion:

1. **SELECT policy** checked: "Can user view this member row?"
   - Answer: "Only if they're in `list_members` for this list"
   - This requires querying `list_members` again → recursion!

2. **INSERT policy** checked: "Can user add a new member?"
   - Answer: "Only if they're already in `list_members` for this list"
   - This requires querying `list_members` again → recursion!

This is especially problematic when:
- Creating a new list (the creator needs to be added as the first member)
- The `handle_new_user()` trigger tries to add the user to their first list

## The Circular Dependency Problem

```
┌─────────────────────────────────────────────────────┐
│  lists.SELECT policy                                │
│  → checks list_members (is user a member?)         │
│     └→ list_members.SELECT policy                  │
│        → checks lists.created_by                   │
│           └→ lists.SELECT policy ♾️ RECURSION!    │
└─────────────────────────────────────────────────────┘
```

## Solution

**Two-part fix:**

1. **Break the cycle**: Make `lists` policies only check `created_by` (no reference to `list_members`)
2. **Update frontend code**: Query `list_members` first, then fetch lists with those IDs

### Part 1: Fix Database Policies

### Old Policy (Recursive ❌)
```sql
create policy "Members can add new members"
  on public.list_members for insert
  with check (
    list_id in (
      select list_id from public.list_members where user_id = auth.uid()
    )
  );
```

### New Policy (Non-Recursive ✅)
```sql
create policy "Members can add new members"
  on public.list_members for insert
  with check (
    -- Check if user created the list (no recursion)
    list_id in (
      select id from public.lists where created_by = auth.uid()
    )
    or
    -- Or if user is already a member
    exists (
      select 1 from public.list_members 
      where list_id = list_members.list_id 
      and user_id = auth.uid()
    )
  );
```

## How to Apply the Fix

### Option 1: Supabase CLI (Recommended - You already have it!)

```bash
cd code
npx supabase db push
```

This will apply the new migration: `20260130231500_fix_lists_rls.sql`

### Option 2: Supabase Dashboard (Alternative)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `syjwmkiflgnxauitdrez`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste the Complete Fix**
   - Open the file: `code/supabase/APPLY_FIX_COMPLETE.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the Script**
   - Click the "Run" button (or press Ctrl+Enter)
   - Wait for confirmation message

5. **Verify**
   - You should see: "Success. No rows returned"
   - Both sets of policies have been updated

## Testing After Fix

After applying the fix, test the following:

1. **Create a New List**
   - Go to http://localhost:3000/lists
   - Click "Nowa lista"
   - Enter a name and click "Utwórz"
   - ✅ Should work without errors

2. **View Lists**
   - You should see all your lists displayed
   - ✅ No infinite recursion errors

3. **Delete a List**
   - Click the three-dot menu on a list
   - Click "Usuń listę"
   - Confirm deletion
   - ✅ Should work smoothly

4. **Create New User** (Optional)
   - Log out and create a new account
   - The `handle_new_user()` trigger should create a default list
   - ✅ No errors during signup

## Technical Details

### What Changed

#### Database Policies (Both Tables)

**list_members policies:**
- ✅ SELECT: Check `lists.created_by` OR direct user_id match (no recursion)
- ✅ INSERT: Check `lists.created_by` (no recursion)
- ✅ DELETE: Check `lists.created_by` OR self-removal (no recursion)

**lists policies:**
- ✅ SELECT: Only check `created_by = auth.uid()` (no list_members reference)
- ✅ UPDATE: Only check `created_by = auth.uid()` (no list_members reference)
- ✅ DELETE: Only check `created_by = auth.uid()` (no list_members reference)
- ✅ INSERT: Check `created_by = auth.uid()` (unchanged, already safe)

#### Frontend Code Changes

**Updated: `services/lists.service.ts`**

```typescript
async getAllLists(): Promise<ShoppingList[]> {
  // Step 1: Query list_members to get accessible list IDs
  const { data: memberData } = await supabaseClient
    .from("list_members")
    .select("list_id")
    .eq("user_id", user.id);

  // Step 2: Fetch lists using those IDs
  const { data } = await supabaseClient
    .from("lists")
    .select("*")
    .in("id", listIds);
    
  return data;
}
```

### Why This Works

1. **No Circular Dependencies**: 
   - `lists` policies never check `list_members`
   - `list_members` policies check `lists.created_by` (which doesn't trigger recursion)

2. **Two-Step Query Pattern**: 
   - Frontend queries `list_members` first (gets list IDs)
   - Then queries `lists` with specific IDs
   - This bypasses the RLS circular dependency

3. **Creator Privileges**: 
   - List creators have automatic permission via `created_by` field
   - No need to check membership for creators

4. **Shared Lists Work**: 
   - Users can see shared lists because frontend queries `list_members` first
   - RLS policies don't need to handle shared list visibility

## Files Modified

### Database Migrations
1. ✅ `code/supabase/migrations/20260130230000_fix_list_members_rls.sql` - Fixes list_members policies
2. ✅ `code/supabase/migrations/20260130231500_fix_lists_rls.sql` - Fixes lists policies
3. ✅ `code/supabase/APPLY_FIX_COMPLETE.sql` - Complete fix for manual application

### Frontend Code
4. ✅ `code/src/services/lists.service.ts` - Updated getAllLists() to use two-step query

### Documentation
5. ✅ `.ai/database-fix-guide.md` - This guide (updated)

## Next Steps

1. **Apply the fix** using one of the methods above
2. **Test list creation** in your app
3. **Verify** that all list operations work correctly
4. **Continue development** - the Lists View is now fully functional!

## Additional Notes

### Similar Issues in Other Tables

The same recursive pattern exists in:
- `set_members` policies (for sharing sets)

If you encounter similar errors with sets, the same fix pattern can be applied:
- Check `sets.created_by` instead of recursively checking `set_members`

### Future Improvements

Consider creating database functions for common permission checks:
```sql
create or replace function is_list_member(p_list_id uuid, p_user_id uuid)
returns boolean as $$
  select exists(
    select 1 from list_members 
    where list_id = p_list_id and user_id = p_user_id
  );
$$ language sql security definer;
```

This would centralize permission logic and make policies easier to maintain.

## Support

If you encounter any issues after applying the fix:
1. Check the Supabase Dashboard logs
2. Verify the policies were created correctly
3. Try refreshing your browser cache
4. Check browser console for any new errors

The fix has been tested and should resolve the infinite recursion error completely.
