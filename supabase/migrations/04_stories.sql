-- 04_stories.sql
-- stories + story_views + RLS + realtime + private storage bucket.

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_path text not null,
  caption text null,
  created_at timestamptz not null default now(),
  expire_at timestamptz not null default (now() + interval '24 hours')
);
create index if not exists stories_expire_user_idx on public.stories (expire_at, user_id);

create table if not exists public.story_views (
  story_id uuid not null references public.stories(id) on delete cascade,
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (story_id, viewer_id)
);

alter table public.stories enable row level security;
alter table public.story_views enable row level security;

drop policy if exists "stories readable when active" on public.stories;
create policy "stories readable when active"
  on public.stories for select to authenticated
  using (expire_at > now());

drop policy if exists "stories insertable by owner" on public.stories;
create policy "stories insertable by owner"
  on public.stories for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "stories deletable by owner" on public.stories;
create policy "stories deletable by owner"
  on public.stories for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists "story views readable by self or owner" on public.story_views;
create policy "story views readable by self or owner"
  on public.story_views for select to authenticated
  using (
    viewer_id = auth.uid()
    or exists (
      select 1 from public.stories s
      where s.id = story_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "story views insertable by viewer" on public.story_views;
create policy "story views insertable by viewer"
  on public.story_views for insert to authenticated
  with check (viewer_id = auth.uid());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'stories'
  ) then
    alter publication supabase_realtime add table public.stories;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'story_views'
  ) then
    alter publication supabase_realtime add table public.story_views;
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('stories', 'stories', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

update storage.buckets
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg','image/png','image/webp']
  where id = 'stories';

drop policy if exists "stories bucket read for authenticated" on storage.objects;
create policy "stories bucket read for authenticated"
  on storage.objects for select to authenticated
  using (bucket_id = 'stories');

drop policy if exists "stories bucket write for owner" on storage.objects;
create policy "stories bucket write for owner"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'stories'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "stories bucket delete for owner" on storage.objects;
create policy "stories bucket delete for owner"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'stories'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
