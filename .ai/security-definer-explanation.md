# SECURITY DEFINER Explanation

## The Problem: Infinite Recursion in RLS Policies

When you have circular dependencies between tables' RLS policies, you can get infinite recursion:

```
User tries to INSERT into list_members
  ↓
INSERT policy checks: "Is user already a member?"
  ↓
SELECT from list_members (to check membership)
  ↓
SELECT policy checks: "Is user a member?"
  ↓
SELECT from list_members (to check membership)
  ↓
INFINITE LOOP! 💥
```

## The Solution: SECURITY DEFINER Functions

A `SECURITY DEFINER` function is a database function that runs with **elevated privileges**, bypassing RLS policies.

### How It Works

```sql
create or replace function public.invite_member_to_list(
  p_list_id uuid,
  p_user_id uuid
)
returns void
security definer  -- ⭐ This is the key!
set search_path = public
as $$
begin
  -- This code runs with superuser privileges
  -- It can read/write any table, bypassing RLS
  
  -- But we add our own security checks first!
  if not (user_is_creator OR user_is_member) then
    raise exception 'Access denied';
  end if;
  
  -- If checks pass, do the INSERT
  insert into public.list_members (list_id, user_id)
  values (p_list_id, p_user_id);
end;
$$ language plpgsql;
```

### Key Concepts

1. **`security definer`**: Function runs with privileges of the function creator (usually superuser)
2. **Bypasses RLS**: The function can access tables without RLS restrictions
3. **Custom Security**: You implement your own authorization logic inside the function
4. **`set search_path = public`**: Security best practice to prevent search path attacks

## Comparison: Direct INSERT vs Function

### Direct INSERT (with RLS)

```typescript
// Frontend code
const { error } = await supabaseClient
  .from("list_members")
  .insert({ list_id, user_id });
// ❌ This triggers RLS policies, which can cause recursion
```

**Flow:**
```
User → RLS Policy Check → Database
         ↓
    May cause recursion if policy checks list_members
```

### Using SECURITY DEFINER Function

```typescript
// Frontend code
const { error } = await supabaseClient.rpc("invite_member_to_list", {
  p_list_id: listId,
  p_user_id: userId,
});
// ✅ Function handles security and bypasses RLS
```

**Flow:**
```
User → Function (with custom checks) → Database (bypasses RLS)
```

## Security Considerations

### ✅ Safe Practices

1. **Always validate input** inside the function
2. **Check authorization** before performing actions
3. **Use `set search_path = public`** to prevent attacks
4. **Grant execute only to specific roles** (e.g., `authenticated`)
5. **Keep functions simple** and focused on one task

### ❌ Dangerous Practices

1. **Don't trust input parameters** without validation
2. **Don't skip authorization checks** just because you can
3. **Don't use dynamic SQL** without proper sanitization
4. **Don't grant execute to `public`** (anonymous users)

## Our Implementation

### The Function

```sql
-- Located in: 20260130233000_add_invite_member_function.sql

create or replace function public.invite_member_to_list(
  p_list_id uuid,
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
  -- Get authenticated user
  v_caller_id := auth.uid();
  
  -- Security: must be authenticated
  if v_caller_id is null then
    raise exception 'Not authenticated';
  end if;
  
  -- Check if caller is creator
  select exists(
    select 1 from public.lists 
    where id = p_list_id and created_by = v_caller_id
  ) into v_is_creator;
  
  -- Check if caller is member
  -- ✅ This is safe here (no recursion) because we're in SECURITY DEFINER
  select exists(
    select 1 from public.list_members 
    where list_id = p_list_id and user_id = v_caller_id
  ) into v_is_member;
  
  -- Authorization: must be creator OR member
  if not (v_is_creator or v_is_member) then
    raise exception 'Access denied';
  end if;
  
  -- Validation: user exists
  if not exists(select 1 from public.profiles where id = p_user_id) then
    raise exception 'User does not exist';
  end if;
  
  -- Validation: not already a member
  if exists(select 1 from public.list_members where list_id = p_list_id and user_id = p_user_id) then
    raise exception 'User is already a member of this list';
  end if;
  
  -- All checks passed: add member (bypasses RLS)
  insert into public.list_members (list_id, user_id)
  values (p_list_id, p_user_id);
end;
$$ language plpgsql;
```

### Frontend Usage

```typescript
// In lists.service.ts

async createList(data: CreateListDTO): Promise<ShoppingList> {
  // 1. Create the list
  const { data: newList, error } = await supabaseClient
    .from("lists")
    .insert({ ...data, created_by: user.id })
    .select()
    .single();

  // 2. Add creator as member using function
  const { error: memberError } = await supabaseClient.rpc(
    "invite_member_to_list",
    {
      p_list_id: newList.id,
      p_user_id: user.id,
    }
  );
  
  return newList;
}

async shareListWithEmail(listId: UUID, email: string): Promise<void> {
  // 1. Find user by email
  const { data: users } = await supabaseClient
    .from("profiles")
    .select("id")
    .eq("email", email);

  // 2. Invite using function (allows members to invite)
  const { error } = await supabaseClient.rpc("invite_member_to_list", {
    p_list_id: listId,
    p_user_id: users[0].id,
  });
}
```

## Benefits

1. **No Recursion**: Function doesn't trigger RLS policies
2. **Flexible Authorization**: Existing members can now invite others
3. **Better Error Messages**: Custom validation with clear error messages
4. **Centralized Logic**: All invitation logic in one place
5. **Atomic Operations**: Function ensures consistency

## When to Use SECURITY DEFINER

Use it when:
- ✅ You have circular RLS dependencies
- ✅ You need complex authorization logic
- ✅ You want to perform multiple operations atomically
- ✅ You need to bypass RLS for specific operations

Don't use it when:
- ❌ Simple RLS policies work fine
- ❌ You're not comfortable with security implications
- ❌ The operation doesn't need elevated privileges

## Testing

Try these operations in your app:

1. **Create a list** → Should work (creator invites themselves)
2. **Share with another user** → Should work (creator invites member)
3. **Have that member share with a third user** → Should work! (member invites member)
4. **Try to invite to a list you're not in** → Should fail with "Access denied"

## Further Reading

- [PostgreSQL SECURITY DEFINER Documentation](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Injection Prevention in Functions](https://www.postgresql.org/docs/current/plpgsql-statements.html#PLPGSQL-STATEMENTS-SQL-INJECTION)
