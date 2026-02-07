-- 20260207120000_lists_select_allow_shared.sql
-- Migration: Allow users to SELECT lists shared with them (not only lists they created)
-- Root cause: Previous RLS allowed only created_by = auth.uid(), so shared lists
-- were in list_members but invisible when querying lists by id.
--
-- Using a SECURITY DEFINER function to avoid infinite recursion: lists policy
-- would otherwise read list_members, and list_members policy reads lists.

-- Function: returns list IDs the current user can access (created by them or member of)
-- Runs with definer rights so it bypasses RLS when reading list_members/lists = no recursion
create or replace function public.get_accessible_list_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.lists where created_by = auth.uid()
  union
  select list_id from public.list_members where user_id = auth.uid();
$$;

comment on function public.get_accessible_list_ids() is
  'Returns list IDs the current user can access (owner or member). Used by lists RLS to avoid recursion.';

grant execute on function public.get_accessible_list_ids() to authenticated;

-- Drop the restrictive SELECT policy
drop policy if exists "Users can view their lists" on public.lists;

-- New SELECT policy: use function so we never touch list_members from lists RLS
create policy "Users can view their lists"
  on public.lists for select
  to authenticated
  using (id in (select public.get_accessible_list_ids()));
