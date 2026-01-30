-- 20260130232000_fix_list_members_insert_recursion.sql
-- Migration: Fix infinite recursion in list_members INSERT policy
-- Description: Remove recursive check from INSERT policy - only list creators can add members

-- Drop the problematic INSERT policy
drop policy if exists "Members can add new members" on public.list_members;

-- New INSERT policy: Only list creators can add new members
-- This completely avoids checking list_members table, preventing recursion
create policy "Members can add new members"
  on public.list_members for insert
  to authenticated
  with check (
    -- Only the creator of the list can add members
    list_id in (
      select id from public.lists where created_by = auth.uid()
    )
  );

-- Note: This is more restrictive than before (only creators can add members, not all members)
-- but it's necessary to break the infinite recursion.
-- If you need members to invite other members in the future, you'll need to:
-- 1. Create a database function that uses SECURITY DEFINER to bypass RLS
-- 2. Have that function check membership and then insert
-- 3. Call that function from your application instead of direct INSERT
