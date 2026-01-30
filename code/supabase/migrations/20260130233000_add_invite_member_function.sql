-- 20260130233000_add_invite_member_function.sql
-- Migration: Add function for members to invite other members
-- Description: Creates a SECURITY DEFINER function that allows existing members to add new members

-- Function: invite_member_to_list
-- Purpose: Allows list creators and existing members to add new members
-- This function bypasses RLS to avoid infinite recursion
create or replace function public.invite_member_to_list(
  p_list_id uuid,
  p_user_id uuid
)
returns void
security definer  -- This makes the function run with elevated privileges
set search_path = public  -- Security: prevent search_path attacks
as $$
declare
  v_caller_id uuid;
  v_is_creator boolean;
  v_is_member boolean;
begin
  -- Get the ID of the user calling this function
  v_caller_id := auth.uid();
  
  -- Security check: must be authenticated
  if v_caller_id is null then
    raise exception 'Not authenticated';
  end if;
  
  -- Check if caller is the creator of the list
  select exists(
    select 1 from public.lists 
    where id = p_list_id and created_by = v_caller_id
  ) into v_is_creator;
  
  -- Check if caller is already a member of the list
  -- This is safe here because we're in a SECURITY DEFINER function
  -- and not in an RLS policy (no recursion)
  select exists(
    select 1 from public.list_members 
    where list_id = p_list_id and user_id = v_caller_id
  ) into v_is_member;
  
  -- Authorization: caller must be creator OR existing member
  if not (v_is_creator or v_is_member) then
    raise exception 'Access denied: you must be a member of this list to invite others';
  end if;
  
  -- Validation: check if the user being invited exists
  if not exists(select 1 from public.profiles where id = p_user_id) then
    raise exception 'User does not exist';
  end if;
  
  -- Validation: check if user is already a member
  if exists(select 1 from public.list_members where list_id = p_list_id and user_id = p_user_id) then
    raise exception 'User is already a member of this list';
  end if;
  
  -- All checks passed: add the new member
  -- This INSERT bypasses RLS because of SECURITY DEFINER
  insert into public.list_members (list_id, user_id)
  values (p_list_id, p_user_id);
  
end;
$$ language plpgsql;

-- Grant execute permission to authenticated users
grant execute on function public.invite_member_to_list(uuid, uuid) to authenticated;

-- Add comment for documentation
comment on function public.invite_member_to_list is 
  'Allows list creators and existing members to invite new members to a list. Bypasses RLS to avoid infinite recursion.';
