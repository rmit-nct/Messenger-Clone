-- 03_messages.sql
-- messages + attachments + RLS + last_message_at trigger + realtime + storage bucket.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  content text null,
  is_deleted boolean not null default false,
  edited_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at desc);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null unique references public.messages(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  size integer not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;
alter table public.attachments enable row level security;

drop policy if exists "messages readable by members" on public.messages;
create policy "messages readable by members"
  on public.messages for select to authenticated
  using (public.is_conversation_member(conversation_id, auth.uid()));

drop policy if exists "messages insertable by members" on public.messages;
create policy "messages insertable by members"
  on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and public.is_conversation_member(conversation_id, auth.uid()));

drop policy if exists "messages updatable by sender" on public.messages;
create policy "messages updatable by sender"
  on public.messages for update to authenticated
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

drop policy if exists "attachments readable by members" on public.attachments;
create policy "attachments readable by members"
  on public.attachments for select to authenticated
  using (
    exists (
      select 1 from public.messages m
      where m.id = message_id and public.is_conversation_member(m.conversation_id, auth.uid())
    )
  );

drop policy if exists "attachments insertable by sender" on public.attachments;
create policy "attachments insertable by sender"
  on public.attachments for insert to authenticated
  with check (
    exists (
      select 1 from public.messages m
      where m.id = message_id and m.sender_id = auth.uid()
    )
  );

create or replace function public.touch_conversation_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
    set last_message_at = new.created_at
    where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row execute function public.touch_conversation_last_message();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'attachments'
  ) then
    alter publication supabase_realtime add table public.attachments;
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('messages', 'messages', false)
on conflict (id) do nothing;

create or replace function public.storage_conversation_id(object_name text)
returns uuid
language plpgsql
immutable
set search_path = public
as $$
declare
  cid uuid;
begin
  cid := (storage.foldername(object_name))[1]::uuid;
  return cid;
exception when others then
  return null;
end;
$$;

drop policy if exists "messages bucket read for members" on storage.objects;
create policy "messages bucket read for members"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'messages'
    and public.is_conversation_member(public.storage_conversation_id(name), auth.uid())
  );

drop policy if exists "messages bucket write for members" on storage.objects;
create policy "messages bucket write for members"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'messages'
    and public.is_conversation_member(public.storage_conversation_id(name), auth.uid())
  );

drop policy if exists "messages bucket delete own" on storage.objects;
create policy "messages bucket delete own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'messages' and owner = auth.uid());

create or replace function public.protect_message_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id <> old.id
     or new.conversation_id <> old.conversation_id
     or new.sender_id <> old.sender_id
     or new.content is distinct from old.content
     or new.created_at <> old.created_at then
    raise exception 'cannot modify message identity/content columns';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_message_columns on public.messages;
create trigger protect_message_columns
  before update on public.messages
  for each row execute function public.protect_message_columns();
