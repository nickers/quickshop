-- 20260128120000_initial_schema.sql
-- Migration: Initial Schema Setup for QuickShop
-- Description: Creates profiles, lists, sets, items, history tables with RLS and triggers.

-- Table: public.profiles
-- Purpose: Stores public user information. Linked to auth.users.
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  email text,
  updated_at timestamp with time zone default now(),
  constraint profiles_pkey primary key (id)
);

comment on table public.profiles is 'Public user profiles linked to auth.users.';

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Table: public.lists
-- Purpose: Stores shopping lists.
create table public.lists (
  id uuid not null default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint lists_pkey primary key (id)
);

comment on table public.lists is 'Main shopping lists.';

-- Enable RLS for lists
alter table public.lists enable row level security;

-- Table: public.list_members
-- Purpose: Manages many-to-many relationship between users and lists (sharing).
create table public.list_members (
  list_id uuid not null references public.lists(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  constraint list_members_pkey primary key (list_id, user_id)
);

comment on table public.list_members is 'Junction table for list sharing.';

-- Enable RLS for list_members
alter table public.list_members enable row level security;

-- Table: public.list_items
-- Purpose: Stores items within a shopping list.
create table public.list_items (
  id uuid not null default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  name text not null,
  quantity text,
  note text,
  is_bought boolean default false,
  sort_order double precision default 0.0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint list_items_pkey primary key (id)
);

comment on table public.list_items is 'Individual items in a shopping list.';

-- Enable RLS for list_items
alter table public.list_items enable row level security;

-- Table: public.sets
-- Purpose: Templates/Sets for shopping lists.
create table public.sets (
  id uuid not null default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid not null references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint sets_pkey primary key (id)
);

comment on table public.sets is 'Shopping list templates (sets).';

-- Enable RLS for sets
alter table public.sets enable row level security;

-- Table: public.set_members
-- Purpose: Manages sharing of sets.
create table public.set_members (
  set_id uuid not null references public.sets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  constraint set_members_pkey primary key (set_id, user_id)
);

comment on table public.set_members is 'Junction table for set sharing.';

-- Enable RLS for set_members
alter table public.set_members enable row level security;

-- Table: public.set_items
-- Purpose: Items within a set.
create table public.set_items (
  id uuid not null default gen_random_uuid(),
  set_id uuid not null references public.sets(id) on delete cascade,
  name text not null,
  quantity text,
  note text,
  sort_order double precision default 0.0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint set_items_pkey primary key (id)
);

comment on table public.set_items is 'Items within a template set.';

-- Enable RLS for set_items
alter table public.set_items enable row level security;

-- Table: public.shopping_history
-- Purpose: Archives completed shopping trips.
create table public.shopping_history (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  list_name text not null,
  items_snapshot jsonb not null,
  completed_at timestamp with time zone default now(),
  constraint shopping_history_pkey primary key (id)
);

comment on table public.shopping_history is 'Archive of completed shopping lists.';

-- Enable RLS for shopping_history
alter table public.shopping_history enable row level security;

-- Indexes for performance
-- List items filtering
create index idx_list_items_list_id on public.list_items(list_id);
-- List access checks
create index idx_list_members_user_id on public.list_members(user_id);
create index idx_list_members_list_id on public.list_members(list_id);
-- Set items filtering
create index idx_set_items_set_id on public.set_items(set_id);
-- Set access checks
create index idx_set_members_user_id on public.set_members(user_id);
create index idx_set_members_set_id on public.set_members(set_id);
-- History filtering and sorting
create index idx_shopping_history_user_id on public.shopping_history(user_id);
create index idx_shopping_history_completed_at on public.shopping_history(completed_at);

-- Function: update_updated_at
-- Purpose: Automatically updates the updated_at column on update.
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger: update_updated_at for profiles
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- Trigger: update_updated_at for lists
create trigger update_lists_updated_at
  before update on public.lists
  for each row execute function public.update_updated_at();

-- Trigger: update_updated_at for list_items
create trigger update_list_items_updated_at
  before update on public.list_items
  for each row execute function public.update_updated_at();

-- Trigger: update_updated_at for sets
create trigger update_sets_updated_at
  before update on public.sets
  for each row execute function public.update_updated_at();

-- Trigger: update_updated_at for set_items
create trigger update_set_items_updated_at
  before update on public.set_items
  for each row execute function public.update_updated_at();

-- Function: handle_new_user
-- Purpose: Creates a profile and a default list for new users.
create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
as $$
declare
  new_list_id uuid;
begin
  -- Create profile
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);

  -- Create default list
  insert into public.lists (name, created_by)
  values ('Moja pierwsza lista', new.id)
  returning id into new_list_id;

  -- Add user to list members
  insert into public.list_members (list_id, user_id)
  values (new_list_id, new.id);

  return new;
end;
$$ language plpgsql;

-- Trigger: on_auth_user_created
-- Purpose: Triggers handle_new_user when a new user is created in auth.users.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function: archive_list_items
-- Purpose: Moves bought items to history and removes them from the list.
create or replace function public.archive_list_items(p_list_id uuid)
returns void
security definer set search_path = public
as $$
declare
  v_list_name text;
  v_items jsonb;
  v_user_id uuid;
begin
  -- Get current user id
  v_user_id := auth.uid();

  -- Verify user is a member of the list
  if not exists (select 1 from public.list_members where list_id = p_list_id and user_id = v_user_id) then
    raise exception 'Access denied';
  end if;

  -- Get list name
  select name into v_list_name from public.lists where id = p_list_id;

  -- Get bought items as jsonb
  select jsonb_agg(jsonb_build_object(
    'name', name,
    'quantity', quantity,
    'note', note
  ))
  into v_items
  from public.list_items
  where list_id = p_list_id and is_bought = true;

  -- If no items to archive, exit
  if v_items is null then
    return;
  end if;

  -- Create history record
  insert into public.shopping_history (user_id, list_name, items_snapshot)
  values (v_user_id, v_list_name, v_items);

  -- Delete archived items
  delete from public.list_items
  where list_id = p_list_id and is_bought = true;

end;
$$ language plpgsql;


-- RLS Policies

-- --- profiles ---
-- Select: Any authenticated user can view profiles (to find users to share with).
create policy "Profiles are viewable by everyone authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- Update: Users can update their own profile.
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Insert: Handled by system trigger, no manual insert needed for now.
-- But typically we might allow it if auto-creation fails? Stick to trigger for consistency.

-- --- lists ---
-- Select: Users can view lists they are members of.
create policy "Users can view their lists"
  on public.lists for select
  to authenticated
  using (
    auth.uid() in (
      select user_id from public.list_members where list_id = id
    )
  );

-- Update: Users can update lists they are members of.
create policy "Users can update their lists"
  on public.lists for update
  to authenticated
  using (
    auth.uid() in (
      select user_id from public.list_members where list_id = id
    )
  );

-- Delete: Users can delete lists they are members of.
create policy "Users can delete their lists"
  on public.lists for delete
  to authenticated
  using (
    auth.uid() in (
      select user_id from public.list_members where list_id = id
    )
  );

-- Insert: Authenticated users can create lists.
create policy "Users can create lists"
  on public.lists for insert
  to authenticated
  with check (auth.uid() = created_by);


-- --- list_members ---
-- Select: Users can view members of lists they belong to.
create policy "Users can view members of their lists"
  on public.list_members for select
  to authenticated
  using (
    list_id in (
      select list_id from public.list_members where user_id = auth.uid()
    )
  );

-- Insert: Members can add other members (share list).
create policy "Members can add new members"
  on public.list_members for insert
  to authenticated
  with check (
    list_id in (
      select list_id from public.list_members where user_id = auth.uid()
    )
  );

-- Delete: Members can remove members (unshare or leave).
create policy "Members can remove members"
  on public.list_members for delete
  to authenticated
  using (
    list_id in (
      select list_id from public.list_members where user_id = auth.uid()
    )
  );


-- --- list_items ---
-- Select: Users can view items of lists they belong to.
create policy "Users can view list items"
  on public.list_items for select
  to authenticated
  using (
    list_id in (
      select list_id from public.list_members where user_id = auth.uid()
    )
  );

-- Insert: Users can add items to lists they belong to.
create policy "Users can add list items"
  on public.list_items for insert
  to authenticated
  with check (
    list_id in (
      select list_id from public.list_members where user_id = auth.uid()
    )
  );

-- Update: Users can update items in lists they belong to.
create policy "Users can update list items"
  on public.list_items for update
  to authenticated
  using (
    list_id in (
      select list_id from public.list_members where user_id = auth.uid()
    )
  );

-- Delete: Users can delete items from lists they belong to.
create policy "Users can delete list items"
  on public.list_items for delete
  to authenticated
  using (
    list_id in (
      select list_id from public.list_members where user_id = auth.uid()
    )
  );


-- --- sets ---
-- Select: Users can view sets they are members of.
create policy "Users can view their sets"
  on public.sets for select
  to authenticated
  using (
    auth.uid() in (
      select user_id from public.set_members where set_id = id
    )
  );

-- Update: Users can update sets they are members of.
create policy "Users can update their sets"
  on public.sets for update
  to authenticated
  using (
    auth.uid() in (
      select user_id from public.set_members where set_id = id
    )
  );

-- Delete: Users can delete sets they are members of.
create policy "Users can delete their sets"
  on public.sets for delete
  to authenticated
  using (
    auth.uid() in (
      select user_id from public.set_members where set_id = id
    )
  );

-- Insert: Authenticated users can create sets.
create policy "Users can create sets"
  on public.sets for insert
  to authenticated
  with check (auth.uid() = created_by);


-- --- set_members ---
-- Select: Users can view members of sets they belong to.
create policy "Users can view members of their sets"
  on public.set_members for select
  to authenticated
  using (
    set_id in (
      select set_id from public.set_members where user_id = auth.uid()
    )
  );

-- Insert: Members can add other members (share set).
create policy "Members can add new set members"
  on public.set_members for insert
  to authenticated
  with check (
    set_id in (
      select set_id from public.set_members where user_id = auth.uid()
    )
  );

-- Delete: Members can remove members from sets.
create policy "Members can remove set members"
  on public.set_members for delete
  to authenticated
  using (
    set_id in (
      select set_id from public.set_members where user_id = auth.uid()
    )
  );


-- --- set_items ---
-- Select: Users can view items of sets they belong to.
create policy "Users can view set items"
  on public.set_items for select
  to authenticated
  using (
    set_id in (
      select set_id from public.set_members where user_id = auth.uid()
    )
  );

-- Insert: Users can add items to sets they belong to.
create policy "Users can add set items"
  on public.set_items for insert
  to authenticated
  with check (
    set_id in (
      select set_id from public.set_members where user_id = auth.uid()
    )
  );

-- Update: Users can update items in sets they belong to.
create policy "Users can update set items"
  on public.set_items for update
  to authenticated
  using (
    set_id in (
      select set_id from public.set_members where user_id = auth.uid()
    )
  );

-- Delete: Users can delete items from sets they belong to.
create policy "Users can delete set items"
  on public.set_items for delete
  to authenticated
  using (
    set_id in (
      select set_id from public.set_members where user_id = auth.uid()
    )
  );


-- --- shopping_history ---
-- Select: Users can view their own history.
create policy "Users can view own history"
  on public.shopping_history for select
  to authenticated
  using (auth.uid() = user_id);

-- Insert: Users can insert into their own history (though mostly done via function).
create policy "Users can insert own history"
  on public.shopping_history for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Delete: Users can delete their own history.
create policy "Users can delete own history"
  on public.shopping_history for delete
  to authenticated
  using (auth.uid() = user_id);
