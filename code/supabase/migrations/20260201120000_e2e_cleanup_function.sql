-- E2E cleanup: remove test lists created by Playwright (names "E2E Test %" / "E2E RWD %").
-- Called from globalTeardown after e2e runs; runs as authenticated user (auth.uid()).
-- Cascades: list_members, list_items are removed automatically.

create or replace function public.e2e_cleanup_test_lists()
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  deleted_count int;
begin
  with deleted as (
    delete from public.lists
    where created_by = auth.uid()
      and (name like 'E2E Test %' or name like 'E2E RWD %')
    returning 1
  )
  select count(*)::int into deleted_count from deleted;
  return deleted_count;
end;
$$;

comment on function public.e2e_cleanup_test_lists() is 'E2E teardown: deletes lists named "E2E Test %" or "E2E RWD %" for current user.';

grant execute on function public.e2e_cleanup_test_lists() to authenticated;
