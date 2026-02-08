-- 20260208120000_create_list_rpc.sql
-- Migration: Add SECURITY DEFINER function for creating lists
-- Description: Bypasses RLS to atomically create a list and add the creator as a member.
-- This replaces the two-step process (INSERT into lists + invite_member_to_list RPC)
-- which was failing due to RLS policy rejecting the INSERT.

-- Function: create_list_with_member
-- Purpose: Creates a new shopping list and adds the creator as a member in one atomic operation.
-- Returns the newly created list row.
create or replace function public.create_list_with_member(p_name text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_new_list_id uuid;
  v_result json;
begin
  -- Get the calling user
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Validate name
  if p_name is null or trim(p_name) = '' then
    raise exception 'List name cannot be empty';
  end if;

  -- Create the list (bypasses RLS because SECURITY DEFINER)
  insert into public.lists (name, created_by)
  values (trim(p_name), v_user_id)
  returning id into v_new_list_id;

  -- Add creator as member (bypasses RLS because SECURITY DEFINER)
  insert into public.list_members (list_id, user_id)
  values (v_new_list_id, v_user_id);

  -- Return the full list row as JSON
  select row_to_json(l) into v_result
  from public.lists l
  where l.id = v_new_list_id;

  return v_result;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.create_list_with_member(text) to authenticated;

-- Add comment for documentation
comment on function public.create_list_with_member is
  'Creates a new shopping list and adds the creator as a member. Bypasses RLS to avoid policy issues. Returns the created list as JSON.';
