-- 20260131000000_fix_set_members_rls_and_invite.sql
-- Migration: Fix infinite recursion in set_members RLS and add creator to set after create
-- Description: Same pattern as list_members - non-recursive policies + SECURITY DEFINER function

-- Drop existing recursive policies on set_members
drop policy if exists "Users can view members of their sets" on public.set_members;
drop policy if exists "Members can add new set members" on public.set_members;
drop policy if exists "Members can remove set members" on public.set_members;

-- New SELECT policy: No recursion - check sets.created_by or row's user_id
create policy "Users can view members of their sets"
  on public.set_members for select
  to authenticated
  using (
    -- User is the creator of the set
    set_id in (
      select id from public.sets where created_by = auth.uid()
    )
    or
    -- User is the member in this row
    user_id = auth.uid()
  );

-- New INSERT policy: Only set creator can add members (avoids recursion - no subquery on set_members)
create policy "Members can add new set members"
  on public.set_members for insert
  to authenticated
  with check (
    set_id in (
      select id from public.sets where created_by = auth.uid()
    )
  );

-- New DELETE policy: Creator or removing self
create policy "Members can remove set members"
  on public.set_members for delete
  to authenticated
  using (
    user_id = auth.uid()
    or
    set_id in (
      select id from public.sets where created_by = auth.uid()
    )
  );

-- Function: invite_member_to_set
-- Purpose: Allows set creators and existing members to add new members (e.g. creator after createSet)
-- Bypasses RLS to avoid recursion when adding the first member
create or replace function public.invite_member_to_set(
  p_set_id uuid,
  p_user_id uuid
)
returns void
security definer
set search_path = public
as $$
declare
  v_caller_id uuid;
  v_is_creator boolean;
  v_is_member boolean;
begin
  v_caller_id := auth.uid();

  if v_caller_id is null then
    raise exception 'Not authenticated';
  end if;

  select exists(
    select 1 from public.sets
    where id = p_set_id and created_by = v_caller_id
  ) into v_is_creator;

  select exists(
    select 1 from public.set_members
    where set_id = p_set_id and user_id = v_caller_id
  ) into v_is_member;

  if not (v_is_creator or v_is_member) then
    raise exception 'Access denied: you must be a member of this set to invite others';
  end if;

  if not exists(select 1 from public.profiles where id = p_user_id) then
    raise exception 'User does not exist';
  end if;

  if exists(select 1 from public.set_members where set_id = p_set_id and user_id = p_user_id) then
    raise exception 'User is already a member of this set';
  end if;

  insert into public.set_members (set_id, user_id)
  values (p_set_id, p_user_id);
end;
$$ language plpgsql;

grant execute on function public.invite_member_to_set(uuid, uuid) to authenticated;

comment on function public.invite_member_to_set is
  'Allows set creators and existing members to add new members. Bypasses RLS to avoid infinite recursion.';
