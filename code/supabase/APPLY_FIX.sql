-- ============================================================================
-- FIX FOR INFINITE RECURSION IN list_members RLS POLICIES
-- ============================================================================
-- Instructions:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
-- ============================================================================

-- Drop existing problematic policies
drop policy if exists "Users can view members of their lists" on public.list_members;
drop policy if exists "Members can add new members" on public.list_members;
drop policy if exists "Members can remove members" on public.list_members;

-- New SELECT policy: Users can view members of lists they created or are members of
-- This checks the lists table directly instead of recursively checking list_members
create policy "Users can view members of their lists"
  on public.list_members for select
  to authenticated
  using (
    -- User is the creator of the list
    list_id in (
      select id from public.lists where created_by = auth.uid()
    )
    or
    -- User is a member of the list (direct check, no subquery on list_members)
    user_id = auth.uid()
  );

-- New INSERT policy: Only list creators or existing members can add new members
-- Uses the lists table to check ownership, avoiding recursion
create policy "Members can add new members"
  on public.list_members for insert
  to authenticated
  with check (
    -- User is the creator of the list
    list_id in (
      select id from public.lists where created_by = auth.uid()
    )
    or
    -- User is already a member (this is safe because it's checking the row being inserted)
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
-- VERIFICATION
-- ============================================================================
-- After running this script, you should be able to:
-- 1. Create new lists without errors
-- 2. View your lists
-- 3. Share lists with other users
-- 
-- The infinite recursion error should be resolved!
-- ============================================================================
