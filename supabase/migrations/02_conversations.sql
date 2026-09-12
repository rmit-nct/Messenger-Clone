-- 02_conversations.sql
-- conversations + conversation_members + RLS + creation/inbox RPCs.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('direct','group')),
  title text null,
  image_url text null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

-- reconcile schema drift from an older definition (create table if not exists
-- does not alter existing columns): direct chats store a NULL title.
alter table public.conversations add column if not exists title text null;
alter table public.conversations add column if not exists image_url text null;
alter table public.conversations alter column title drop not null;
alter table public.conversations alter column image_url drop not null;

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

-- assignable admin role; creator is derived from conversations.created_by
alter table public.conversation_members
  add column if not exists is_admin boolean not null default false;

update public.conversation_members m
  set is_admin = true
  where exists (
    select 1 from public.conversations c
    where c.id = m.conversation_id and c.created_by = m.user_id
  );

create index if not exists conversation_members_user_idx
  on public.conversation_members (user_id);

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;

-- idempotent across an older definition that used different parameter names
-- (Postgres refuses to rename params via create or replace: 42P13)
drop function if exists public.is_conversation_member(uuid, uuid) cascade;

create or replace function public.is_conversation_member(p_conversation uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = p_conversation and user_id = p_user
  );
$$;

drop policy if exists "conversations readable by members" on public.conversations;
create policy "conversations readable by members"
  on public.conversations for select to authenticated
  using (public.is_conversation_member(id, auth.uid()));

drop policy if exists "conversations insertable by creator" on public.conversations;
create policy "conversations insertable by creator"
  on public.conversations for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "conversations updatable by members" on public.conversations;
create policy "conversations updatable by members"
  on public.conversations for update to authenticated
  using (public.is_conversation_member(id, auth.uid()))
  with check (public.is_conversation_member(id, auth.uid()));

drop policy if exists "members readable by members" on public.conversation_members;
create policy "members readable by members"
  on public.conversation_members for select to authenticated
  using (public.is_conversation_member(conversation_id, auth.uid()));

drop policy if exists "members insertable by creator" on public.conversation_members;
create policy "members insertable by creator"
  on public.conversation_members for insert to authenticated
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.created_by = auth.uid()
    )
  );

drop policy if exists "members update own read state" on public.conversation_members;
create policy "members update own read state"
  on public.conversation_members for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.create_direct_conversation(other_user uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  existing uuid;
  new_id uuid;
begin
  if me is null then raise exception 'not authenticated'; end if;
  if other_user = me then raise exception 'cannot message yourself'; end if;

  select c.id into existing
  from public.conversations c
  join public.conversation_members m1 on m1.conversation_id = c.id and m1.user_id = me
  join public.conversation_members m2 on m2.conversation_id = c.id and m2.user_id = other_user
  where c.type = 'direct'
  limit 1;

  if existing is not null then return existing; end if;

  insert into public.conversations (type, created_by)
  values ('direct', me)
  returning id into new_id;

  insert into public.conversation_members (conversation_id, user_id)
  values (new_id, me), (new_id, other_user);

  return new_id;
end;
$$;

create or replace function public.create_group_conversation(p_title text, p_member_ids uuid[])
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  new_id uuid;
  member uuid;
  member_count int;
begin
  if me is null then raise exception 'not authenticated'; end if;
  member_count := coalesce(array_length(p_member_ids, 1), 0) + 1;
  if member_count > 10 then raise exception 'group cannot exceed 10 members'; end if;

  insert into public.conversations (type, title, created_by)
  values ('group', nullif(trim(p_title), ''), me)
  returning id into new_id;

  insert into public.conversation_members (conversation_id, user_id, is_admin)
  values (new_id, me, true);

  foreach member in array coalesce(p_member_ids, array[]::uuid[]) loop
    if member <> me then
      insert into public.conversation_members (conversation_id, user_id)
      values (new_id, member)
      on conflict do nothing;
    end if;
  end loop;

  return new_id;
end;
$$;

create or replace function public.protect_conversation_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id <> old.id or new.type <> old.type or new.created_by <> old.created_by then
    raise exception 'cannot modify conversation identity columns';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_conversation_columns on public.conversations;
create trigger protect_conversation_columns
  before update on public.conversations
  for each row execute function public.protect_conversation_columns();

-- realtime: notify members when they are added, so a new conversation appears
-- in their inbox immediately even before any message is sent.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversation_members'
  ) then
    alter publication supabase_realtime add table public.conversation_members;
  end if;
end $$;

create or replace function public.add_conversation_members(p_conversation uuid, p_user_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  current_count int;
  to_add int;
begin
  if me is null then raise exception 'not authenticated'; end if;
  if not public.is_conversation_member(p_conversation, me) then
    raise exception 'not a member of this conversation';
  end if;

  if not exists (
    select 1 from public.conversations where id = p_conversation and type = 'group'
  ) then
    raise exception 'not a group conversation';
  end if;

  perform 1 from public.conversations where id = p_conversation for update;

  select count(*) into current_count
  from public.conversation_members where conversation_id = p_conversation;

  select count(distinct uid) into to_add
  from unnest(coalesce(p_user_ids, array[]::uuid[])) as uid
  where not exists (
    select 1 from public.conversation_members
    where conversation_id = p_conversation and user_id = uid
  );

  if current_count + to_add > 10 then
    raise exception 'group cannot exceed 10 members';
  end if;

  insert into public.conversation_members (conversation_id, user_id)
  select p_conversation, uid
  from unnest(coalesce(p_user_ids, array[]::uuid[])) as uid
  on conflict (conversation_id, user_id) do nothing;
end;
$$;

create or replace function public.remove_conversation_member(p_conversation uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  v_creator uuid;
  v_type text;
  target_admin boolean;
  caller_creator boolean;
  caller_admin boolean;
begin
  if me is null then raise exception 'not authenticated'; end if;

  select created_by, type into v_creator, v_type
  from public.conversations where id = p_conversation;
  if v_creator is null then raise exception 'conversation not found'; end if;
  if v_type <> 'group' then raise exception 'not a group conversation'; end if;

  caller_creator := v_creator = me;
  caller_admin := caller_creator or exists (
    select 1 from public.conversation_members
    where conversation_id = p_conversation and user_id = me and is_admin
  );
  if not caller_admin then raise exception 'admin only'; end if;

  if p_user_id = me then raise exception 'you cannot remove yourself'; end if;
  if p_user_id = v_creator then raise exception 'the creator cannot be removed'; end if;

  select is_admin into target_admin from public.conversation_members
    where conversation_id = p_conversation and user_id = p_user_id;
  if target_admin is null then raise exception 'not a member'; end if;
  if target_admin and not caller_creator then
    raise exception 'only the creator can remove an admin';
  end if;

  delete from public.conversation_members
    where conversation_id = p_conversation and user_id = p_user_id;
end;
$$;

create or replace function public.set_conversation_admin(
  p_conversation uuid,
  p_user_id uuid,
  p_is_admin boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  v_creator uuid;
  v_type text;
  caller_creator boolean;
  caller_admin boolean;
  target_exists boolean;
begin
  if me is null then raise exception 'not authenticated'; end if;

  select created_by, type into v_creator, v_type
  from public.conversations where id = p_conversation;
  if v_creator is null then raise exception 'conversation not found'; end if;
  if v_type <> 'group' then raise exception 'not a group conversation'; end if;

  caller_creator := v_creator = me;
  caller_admin := caller_creator or exists (
    select 1 from public.conversation_members
    where conversation_id = p_conversation and user_id = me and is_admin
  );
  if not caller_admin then raise exception 'admin only'; end if;

  if p_user_id = v_creator then raise exception 'the creator role cannot be changed'; end if;

  select exists (
    select 1 from public.conversation_members
    where conversation_id = p_conversation and user_id = p_user_id
  ) into target_exists;
  if not target_exists then raise exception 'not a member'; end if;

  if not p_is_admin and not caller_creator then
    raise exception 'only the creator can remove admin';
  end if;

  update public.conversation_members
    set is_admin = p_is_admin
    where conversation_id = p_conversation and user_id = p_user_id;
end;
$$;

create or replace function public.update_conversation(
  p_conversation uuid,
  p_title text,
  p_image_path text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  caller_admin boolean;
begin
  if me is null then raise exception 'not authenticated'; end if;

  caller_admin := exists (
    select 1 from public.conversations c
    where c.id = p_conversation
      and c.type = 'group'
      and (
        c.created_by = me
        or exists (
          select 1 from public.conversation_members m
          where m.conversation_id = c.id and m.user_id = me and m.is_admin
        )
      )
  );
  if not caller_admin then raise exception 'admin only'; end if;

  update public.conversations
    set title = coalesce(nullif(trim(p_title), ''), title),
        image_url = coalesce(p_image_path, image_url)
    where id = p_conversation;
end;
$$;
