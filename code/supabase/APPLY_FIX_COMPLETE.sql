-- ============================================================================
-- COMPLETE FIX FOR INFINITE RECURSION IN RLS POLICIES
-- ============================================================================
-- This script fixes BOTH list_members AND lists table policies
-- Apply this in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: Fix list_members policies
-- ============================================================================

-- Drop existing problematic list_members policies
drop policy if exists "Users can view members of their lists" on public.list_members;
drop policy if exists "Members can add new members" on public.list_members;
drop policy if exists "Members can remove members" on public.list_members;

-- New SELECT policy: Users can view members of lists they created or are members of
create policy "Users can view members of their lists"
  on public.list_members for select
  to authenticated
  using (
    -- User is the creator of the list
    list_id in (
      select id from public.lists where created_by = auth.uid()
    )
    or
    -- User is a member of the list (direct check)
    user_id = auth.uid()
  );

-- New INSERT policy: Only list creators or existing members can add new members
create policy "Members can add new members"
  on public.list_members for insert
  to authenticated
  with check (
    -- User is the creator of the list
    list_id in (
      select id from public.lists where created_by = auth.uid()
    )
    or
    -- User is already a member
    exists (
      select 1 from public.list_members 
      where list_id = list_members.list_id 
      and user_id = auth.uid()
    )
  );

-- New DELETE policy: Users can remove themselves or list creators can remove anyone
create policy "Members can remove members"
  on public.list_members for delete
  to authenticated
  using (
    -- User is removing themselves
    user_id = auth.uid()
    or
    -- User is the creator of the list
    list_id in (
      select id from public.lists where created_by = auth.uid()
    )
  );

-- ============================================================================
-- PART 2: Fix lists policies
-- ============================================================================

-- Drop existing lists policies
drop policy if exists "Users can view their lists" on public.lists;
drop policy if exists "Users can update their lists" on public.lists;
drop policy if exists "Users can delete their lists" on public.lists;
drop policy if exists "Users can create lists" on public.lists;

-- New SELECT policy: Users can view lists they created
create policy "Users can view their lists"
  on public.lists for select
  to authenticated
  using (
    created_by = auth.uid()
  );

-- New UPDATE policy: Only creators can update list metadata
create policy "Users can update their lists"
  on public.lists for update
  to authenticated
  using (
    created_by = auth.uid()
  );

-- New DELETE policy: Only creators can delete lists
create policy "Users can delete their lists"
  on public.lists for delete
  to authenticated
  using (
    created_by = auth.uid()
  );

-- INSERT policy: Authenticated users can create lists
create policy "Users can create lists"
  on public.lists for insert
  to authenticated
  with check (auth.uid() = created_by);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this script:
-- ✅ You can create new lists
-- ✅ You can view your own lists
-- ✅ You can delete your lists
-- ✅ No infinite recursion errors
--
-- Note: The frontend code has been updated to handle shared lists by
-- querying list_members first, then fetching the lists.
-- ============================================================================
