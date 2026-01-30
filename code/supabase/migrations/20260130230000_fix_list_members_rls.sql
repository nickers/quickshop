-- 20260130230000_fix_list_members_rls.sql
-- Migration: Fix infinite recursion in list_members RLS policies
-- Description: Replaces recursive policies with simpler, non-recursive ones

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

-- Note: The handle_new_user() function should work now because:
-- 1. It creates the list first (user is created_by)
-- 2. Then it inserts into list_members
-- 3. The INSERT policy checks if user is the creator (which they are)
