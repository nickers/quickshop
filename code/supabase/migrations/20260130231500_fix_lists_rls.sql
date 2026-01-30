-- 20260130231500_fix_lists_rls.sql
-- Migration: Fix infinite recursion in lists RLS policies
-- Description: Breaks circular dependency between lists and list_members policies

-- The problem: lists policies check list_members, and list_members policies check lists
-- Solution: Make lists policies self-contained using created_by field

-- Drop existing lists policies
drop policy if exists "Users can view their lists" on public.lists;
drop policy if exists "Users can update their lists" on public.lists;
drop policy if exists "Users can delete their lists" on public.lists;
drop policy if exists "Users can create lists" on public.lists;

-- New SELECT policy: Users can view lists they created
-- Note: Viewing shared lists will be handled through a separate query or view
create policy "Users can view their lists"
  on public.lists for select
  to authenticated
  using (
    -- User is the creator of the list
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

-- INSERT policy: Authenticated users can create lists (unchanged, already safe)
create policy "Users can create lists"
  on public.lists for insert
  to authenticated
  with check (auth.uid() = created_by);

-- ============================================================================
-- IMPORTANT NOTE ABOUT SHARED LISTS
-- ============================================================================
-- With these policies, users can only see lists they created, not lists shared
-- with them. This is intentional to break the circular dependency.
--
-- To handle shared lists in your application, you have two options:
--
-- Option 1: Query list_members first, then fetch lists (RECOMMENDED)
-- -----------------------------------------------------------------------
-- In your frontend code:
--   1. Query list_members to get list_ids user has access to
--   2. Then query lists with those specific IDs
--
-- Option 2: Create a database view or function (FUTURE ENHANCEMENT)
-- -----------------------------------------------------------------------
-- Create a view that joins lists and list_members:
--   CREATE VIEW user_accessible_lists AS
--   SELECT l.* FROM lists l
--   INNER JOIN list_members lm ON l.id = lm.list_id
--   WHERE lm.user_id = auth.uid();
--
-- Then query the view instead of the table directly.
-- ============================================================================
