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

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index if not exists conversation_members_user_idx
  on public.conversation_members (user_id);

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;

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

  insert into public.conversation_members (conversation_id, user_id)
  values (new_id, me);

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

create or replace function public.get_inbox()
returns table (
  conversation_id uuid,
  type text,
  title text,
  image_url text,
  last_message_at timestamptz,
  last_message_preview text,
  last_message_sender text,
  unread_count bigint,
  member_ids uuid[],
  other_user_id uuid,
  other_display_name text,
  other_avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  with me as (select auth.uid() as uid),
  my_convs as (
    select c.*, m.last_read_at
    from public.conversations c
    join public.conversation_members m on m.conversation_id = c.id
    where m.user_id = (select uid from me)
  )
  select
    c.id,
    c.type,
    c.title,
    c.image_url,
    c.last_message_at,
    lm.preview,
    lm.sender_name,
    coalesce(uc.cnt, 0)::bigint,
    coalesce(mem.ids, array[]::uuid[]),
    ou.id,
    ou.display_name,
    ou.avatar_url
  from my_convs c
  left join lateral (
    select
      case
        when msg.is_deleted then 'Message deleted'
        when att.id is not null then '[Image]'
        else msg.content
      end as preview,
      p.display_name as sender_name
    from public.messages msg
    left join public.attachments att on att.message_id = msg.id
    left join public.profiles p on p.id = msg.sender_id
    where msg.conversation_id = c.id
    order by msg.created_at desc
    limit 1
  ) lm on true
  left join lateral (
    select count(*) as cnt
    from public.messages msg
    where msg.conversation_id = c.id
      and msg.sender_id <> (select uid from me)
      and msg.created_at > c.last_read_at
  ) uc on true
  left join lateral (
    select array_agg(m2.user_id) as ids
    from public.conversation_members m2
    where m2.conversation_id = c.id
  ) mem on true
  left join lateral (
    select p2.id, p2.display_name, p2.avatar_url
    from public.conversation_members m3
    join public.profiles p2 on p2.id = m3.user_id
    where m3.conversation_id = c.id and m3.user_id <> (select uid from me)
    limit 1
  ) ou on c.type = 'direct'
  order by c.last_message_at desc;
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
