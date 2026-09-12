-- 05_reactions.sql
-- message_reactions + RLS + realtime. One reaction per user per message.

create table if not exists public.message_reactions (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

-- reconcile schema drift from an older definition: the upsert needs a unique
-- constraint on (message_id, user_id) for ON CONFLICT to infer the target.
delete from public.message_reactions a
using public.message_reactions b
where a.ctid < b.ctid and a.message_id = b.message_id and a.user_id = b.user_id;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'message_reactions'
      and c.contype in ('p', 'u')
      and c.conkey = (
        select array_agg(a.attnum order by a.attnum)
        from pg_attribute a
        where a.attrelid = t.oid and a.attname in ('message_id', 'user_id')
      )
  ) then
    alter table public.message_reactions
      add constraint message_reactions_message_user_key unique (message_id, user_id);
  end if;
end $$;

alter table public.message_reactions enable row level security;

drop policy if exists "reactions readable by members" on public.message_reactions;
create policy "reactions readable by members"
  on public.message_reactions for select to authenticated
  using (
    exists (
      select 1 from public.messages m
      where m.id = message_id and public.is_conversation_member(m.conversation_id, auth.uid())
    )
  );

drop policy if exists "reactions writable by self" on public.message_reactions;
create policy "reactions writable by self"
  on public.message_reactions for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.messages m
      where m.id = message_id and public.is_conversation_member(m.conversation_id, auth.uid())
    )
  );

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'message_reactions'
  ) then
    alter publication supabase_realtime add table public.message_reactions;
  end if;
end $$;
