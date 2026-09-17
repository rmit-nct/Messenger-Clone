# NEO Messenger Clone

A responsive, real-time communication platform for a closed community: direct and small-group
conversations, text and image messaging, message reactions, typing indicators, online presence,
profile/settings, and 24-hour photo stories. Built with React + TypeScript on Supabase.

## Features

- **Auth** — sign up, sign in, sign out, password recovery and reset. Email confirmation is
  supported (a confirmation popup is shown when it is enabled); it is currently disabled in the
  Supabase project due to the default email rate limit.
- **Profile & Settings** — display name and avatar (public `avatars` bucket), theme
  (System/Light/Dark) and global text size, inline change password, sign out.
- **Inbox** — conversation list ordered by latest activity with unread badges, search across
  conversations and people, and create direct or group (≤ 10) conversations.
- **Conversations** — realtime text and image messages, load-older pagination, date separators,
  unread divider, delete own message (soft delete), emoji reactions, typing indicators, online
  presence.
- **Info panel** — conversation media grid, member list with **Creator**/**Admin** badges,
  add/kick members, promote/demote admins, group photo and title (admins only).
- **Stories** — compose a photo + caption, tray with unseen ring, full-screen viewer with
  progress, tap/keyboard/swipe navigation, view tracking, owner viewer list, 24-hour expiry.

## Tech stack

React 19, TypeScript, Vite 8, Tailwind CSS 4, Base UI / shadcn-style primitives, TanStack Query 5,
React Hook Form + Zod, lucide-react. Backend: Supabase (Postgres + RLS, Auth, Realtime, Storage).

## Repository layout

```
Messenger-Clone/
├── neo-messenger/     # React app (all npm commands run here)
├── supabase/
│   └── migrations/    # 01..06 SQL migrations (tables, RLS, RPCs, buckets, realtime)
├── docs/              # SRS, UX plan, setup docs, specs and plans
├── screenshots/       # deliverable screenshots
└── README.md
```

Inside `neo-messenger/src`: `app/` (router, providers, shell, theme), `auth/`, `inbox/`,
`conversations/`, `messaging/`, `profile/`, `stories/`, `shared/` (ui, lib, hooks, types).

## Prerequisites

- Node.js 18+ (20 LTS recommended) and npm.
- A Supabase project (the backend is fully hosted; there is no app server to run).

## 1. Install

```bash
cd neo-messenger
npm install
```

## 2. Environment variables

```bash
cd neo-messenger
cp .env.example .env
```

Fill `.env` from Supabase Dashboard -> Project Settings -> API:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon/publishable key>
```

`.env` is gitignored. The anon key is public/safe client-side; Contact dev if needed

## 3. Set up the database

Apply the migrations in `supabase/migrations/` in numeric order to your Supabase project
(SQL editor, one file at a time):

- `01_profiles.sql` — profiles table + RLS + signup trigger + public `avatars` bucket.
- `02_conversations.sql` — conversations, members, RLS, creation/inbox RPCs, group admin role.
- `03_messages.sql` — messages, attachments, RLS, trigger, realtime, private `messages` bucket.
- `04_stories.sql` — stories, story_views, RLS, realtime, private `stories` bucket.
- `05_reactions.sql` — message reactions + RLS + realtime.
- `06_presence_typing.sql` — documents the ephemeral broadcast/presence channels.

Then reload the PostgREST schema cache:

```sql
notify pgrst, 'reload schema';
```

Alternatively, with the Supabase CLI linked: `supabase db push`.

Migrations are idempotent and include reconciliation for pre-existing tables where possible. If
a drifted older table blocks one, drop it and re-run the file (dev data only).

## 4. Auth URL configuration

Dashboard -> Authentication -> URL Configuration:

- **Site URL**: `http://localhost:5173`
- **Redirect URLs**: add `http://localhost:5173/reset-password`

Password reset emails use `window.location.origin`, so the origin must be allowlisted.

## 5. Run

```bash
cd neo-messenger
npm run dev
```

Open http://localhost:5173. The app starts on the landing page; sign up or sign in to reach the
inbox. Open two browser profiles (or two accounts) to exercise realtime messaging, typing,
presence, reactions, and stories.

## Scripts (run from `neo-messenger/`)

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc -b`) + production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run format` / `npm run format:check` | Prettier write / check |

There is no test runner configured yet; `npm run build` (tsc) and `npm run lint` are the
correctness gates.

## Routes

`/` landing · `/login` · `/signup` · `/recover` · `/reset-password` · `/setup-profile` ·
`/inbox` · `/conversation/:id` · `/profile` · `/settings` · `/story/create` · `/stories/:userId`.

## Deployment

Frontend-only deploy (Supabase hosts the backend). Vercel with **Root Directory = `neo-messenger`**,
build `npm run build`, output `dist`; set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in the
host env; add an SPA rewrite of all paths to `/index.html`; and add the production origin to the
Supabase Auth URL configuration.

## Troubleshooting

- **Auth requests 504 / timeouts** — free-tier Supabase projects pause after inactivity; restore
  the project in the dashboard.
- **`PGRST202` / function or table not found** — the migration was not applied to that project;
  re-run the relevant file and `notify pgrst, 'reload schema';`.
- **`42501` RLS violation** — schema drift or a missing membership row; verify with
  `pg_policies` and re-run the table's migration.
- **"cannot add postgres_changes callbacks after subscribe()"** — two channels share a topic;
  realtime channel topics should be unique per subscription.
- **Avatar/story upload fails** — the `avatars` / `stories` bucket and storage policies must
  exist on the project.

## Documentation

- `docs/NEO_Messenger_Clone_SRS.md` — requirements.
- `docs/NEO_Messenger_Clone_UX_Plan.md` — screens, flows, responsive behavior.
- `docs/AUTH_SETUP.md` — auth wiring notes.

## Contributions

Built by the NEO Culture Tech team. See the git history / GitHub contributors for per-member
work, and the weekly reports for the sprint breakdown.
