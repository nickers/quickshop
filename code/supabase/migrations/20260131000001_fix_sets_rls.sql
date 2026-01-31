-- 20260131000001_fix_sets_rls.sql
-- Migration: Fix infinite recursion in sets RLS policies
-- Description: Same as fix_lists_rls - break circular dependency between sets and set_members
-- Sets policies must not query set_members; app will query set_members first, then sets by ID.

-- Drop existing sets policies that query set_members (causing recursion)
drop policy if exists "Users can view their sets" on public.sets;
drop policy if exists "Users can update their sets" on public.sets;
drop policy if exists "Users can delete their sets" on public.sets;
drop policy if exists "Users can create sets" on public.sets;

-- New SELECT policy: Users can view sets they created (self-contained, no set_members)
create policy "Users can view their sets"
  on public.sets for select
  to authenticated
  using (created_by = auth.uid());

-- New UPDATE policy
create policy "Users can update their sets"
  on public.sets for update
  to authenticated
  using (created_by = auth.uid());

-- New DELETE policy
create policy "Users can delete their sets"
  on public.sets for delete
  to authenticated
  using (created_by = auth.uid());

-- INSERT policy: unchanged
create policy "Users can create sets"
  on public.sets for insert
  to authenticated
  with check (auth.uid() = created_by);

-- NOTE: With these policies, users can only SELECT sets they created directly.
-- Shared sets (where user is in set_members but not created_by) require the app
-- to query set_members first for set_ids, then fetch sets with .in("id", setIds)
-- (same pattern as lists.service getAllLists).
