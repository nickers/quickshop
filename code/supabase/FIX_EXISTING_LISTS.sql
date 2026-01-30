-- ============================================================================
-- FIX EXISTING LISTS - Add creators to list_members
-- ============================================================================
-- This script adds list creators to list_members for any lists where they're missing
-- Run this in Supabase SQL Editor to fix existing lists
-- ============================================================================

-- Insert missing list_members entries for list creators
-- This will add the creator as a member for any list where they're not already a member
insert into public.list_members (list_id, user_id)
select l.id, l.created_by
from public.lists l
where not exists (
  select 1 
  from public.list_members lm 
  where lm.list_id = l.id 
  and lm.user_id = l.created_by
)
on conflict (list_id, user_id) do nothing;

-- Verify the fix
-- This should show how many rows were added
select 
  'Fixed ' || count(*) || ' lists' as result
from public.lists l
where exists (
  select 1 
  from public.list_members lm 
  where lm.list_id = l.id 
  and lm.user_id = l.created_by
);

-- ============================================================================
-- After running this:
-- 1. All existing lists will have their creators as members
-- 2. Lists will now show up in the UI
-- 3. Future lists will automatically get this through the updated createList code
-- ============================================================================
