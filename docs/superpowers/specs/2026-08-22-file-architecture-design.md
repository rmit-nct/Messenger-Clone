# NEO Messenger Clone — File Architecture Design

**Date:** 2026-08-22
**Status:** Approved
**Author:** Team (brainstormed with pi)

## 1. Purpose

Define the repository and source-file architecture for the NEO Messenger Clone so that:

- 4 developers working in parallel (feature-owner model) collide rarely,
- all sprint 1–5 tasks (auth, messaging, realtime, stories, search, unread, extras, hardening) fit without reshuffling,
- the backend security story (RLS, realtime channels, storage) stays explicit and reviewable,
- the structure scales into future features beyond this project.

## 2. Stack Summary

| Layer | Choice |
|---|---|
| Frontend | React 19 + TypeScript, Vite, Tailwind 4, shadcn/ui (base-ui), lucide-react |
| Data layer | TanStack Query (installed later, sprint 2.2) |
| Forms | React Hook Form + Zod (installed later) |
| Backend | Supabase (Postgres + Auth + Realtime + Storage), SDK runs in browser |
| Testing | Vitest + React Testing Library, Playwright E2E (sprint 5) |
| Deploy | Vercel, root directory = `neo-messenger` |

## 3. Repository Layout (Root)

Mono-repo, one root, two top-level projects. Backend is not an application (no Node server) — it is SQL migrations + config, so it does NOT get a `backend/` folder. This keeps the committed `docs/GIT_WORKFLOW.md`, PR template, and git history intact.

```
Messenger-Clone/
├── .github/                 # PR template (must stay at root)
├── docs/                    # docs, weekly reports, specs
│   └── superpowers/specs/   # design specs + implementation plans
├── neo-messenger/           # React app (Vercel root directory)
├── supabase/                # backend-brains: SQL + config (no app code)
├── screenshots/             # required deliverable
├── .gitignore               # root, contains .env rules
└── README.md                # main README for submission
```

## 4. Backend Structure — `supabase/`

The real backend is declarative: tables, RLS policies, triggers, realtime publications, storage buckets. One migration per feature = one owner. RLS policies are colocated with their table's migration.

```
supabase/
├── migrations/
│   ├── 01_profiles.sql          # profiles table + RLS (auth-owned, public read)
│   ├── 02_conversations.sql     # conversations + conversation_members + RLS
│   ├── 03_messages.sql          # messages + attachments + RLS + realtime publication
│   ├── 04_stories.sql           # stories + story_views + RLS + realtime publication
│   ├── 05_reactions.sql         # message_reactions + RLS + realtime
│   └── 06_presence_typing.sql   # online presence / typing (extras; ephemeral or table)
├── seed.sql                     # dev seed data
├── config.toml                  # local dev, storage buckets (messages, avatars, stories)
└── functions/                   # RESERVED, empty — only if server-side compute needed later
```

Sprint-5 task `5.1 Security Audit: RLS + Realtime + Storage` reviews these files, not app code.

## 5. Frontend Structure — `neo-messenger/src/`

**Layering rule:** feature folders may import from `shared/*` and from each other only via `shared/` promotion. A feature folder must not import another feature's folder.

### 5.1 Top-level folders

```
src/
├── app/               # router, route definitions, auth guard, providers, AppShell layout, theme context
├── auth/              # landing, login, signup, recover, reset, auth service, session context
├── profile/           # setup-profile, profile, settings, avatar uploader
├── inbox/             # inbox page, conversation list, search UI, new-conversation dialogs
├── conversations/     # conversation detail, message thread, composer, group info, pagination
├── messaging/         # reusable message-domain: bubbles, reactions, typing indicator, realtime hooks
├── stories/           # tray, composer, viewer, view tracking, viewer list
└── shared/
    ├── ui/            # shadcn primitives + global presentational components
    ├── lib/           # supabase client, env config, date utils, cn()
    ├── hooks/         # cross-feature hooks: useMediaQuery, useDebounce, useToast
    ├── types/         # DB row types (from types/types.ts), shared domain types
    └── constants/     # limits: group cap 10, image 5MB, text 2000 chars, caption 120
```

### 5.2 Feature folder anatomy

Each feature folder follows the same internal shape:

```
feature/
├── components/    # feature-private components (ConversationItem, StoryProgressBar, ...)
├── api/           # Supabase SDK queries + mutations + realtime subscriptions for this feature
├── hooks/         # feature-internal hooks
├── pages/         # route-level pages (auth/pages/login.tsx, stories/pages/viewer.tsx)
└── index.ts       # public barrel: what other code may import from this feature
```

### 5.3 Ownership map (sprints 1–5)

| Folder | Sprint-1 task(s) | Later tasks |
|---|---|---|
| `app/` | 1.3 App Shell & responsive drawer | guards, providers |
| `auth/` | 1.1 Auth Service & protected routes (2 devs) + 1.2 Homepage/Auth UI | — |
| `profile/` | 1.4 Profile setup + 1.5 Profile & Settings | avatar uploader |
| `inbox/` | 1.6 Inbox UI frame | 2.5 Inbox list, 4.2 search, 4.3 unread badges |
| `conversations/` | — | 2.1, 2.3, 2.4, 3.1, 4.1 |
| `messaging/` | — | 2.1 realtime engine, 2.2 pagination, 4.4 typing/presence, 4.5 reactions | (shared bubble bits) |
| `stories/` | — | 3.2–3.5 |
| `shared/` | shared ui + lib | grows by promotion |

**Auth (2 devs) internal split:** dev A owns `auth/service` + session context + guard logic (task 1.1); dev B owns `auth/pages` + landing (task 1.2). Both land in `auth/`, different subfolders, no file overlap.

### 5.4 Shared components / promotion rule

Hierarchy:

- `shared/ui/` — cross-feature dumb presentational components. shadcn primitives (button, dialog, dropdown, sheet, skeleton, toast) + genuinely global (Avatar, AvatarStack, EmptyState, ErrorState, Skeleton, ConfirmDialog, ImageLightbox).
- `shared/lib/` — supabase client singleton, env config, relative-date util, `cn()`.
- `shared/hooks/` — truly cross-feature: `useMediaQuery`, `useDebounce`, `useToast`.
- `shared/types/` — DB row types, shared domain contracts (pagination page shape).
- `shared/constants/` — limits table above.

**Promotion rule:** a component starts in its feature folder; it moves to `shared/ui/` only when 2+ features need it. Prevents `shared/` from becoming a dump.

Known promotion cases:

- `ImageUploader` — used by profile (avatar), conversations (image message), stories (story image) → promote to `shared/ui/`.
- `MessageBubble`, reactions row, typing indicator — used by conversation detail AND inbox list preview → live in `messaging/` (single owner, both import from it).
- `ConversationItem`, `StoryProgressBar`, `StoryTray` — single-feature → stay inside their feature folder.

## 6. Data-Flow Model (how "backend code" works)

Supabase runs in the browser. A message send is:

```
conversations/api/messages.ts  supabase.from('messages').insert({...})
        ↓
Postgres RLS policy (03_messages.sql)  →  check sender is member
        ↓
allowed → row inserted → Realtime broadcast
        ↓
subscriber clients update UI live
```

App-side DB calls live in each feature's `api/` folder. Server-side authority (who may read/subscribe/modify) lives in SQL RLS policies inside `supabase/migrations/`. Client code cannot bypass them.

## 7. Testing Layout

- Unit/component tests colocated: `<file>.test.ts(x)` next to source (Vitest + RTL).
- E2E (Playwright) lives in `neo-messenger/e2e/` at app root, not in `src/`, since it runs against the built app.
- Test setup/mocks under `neo-messenger/src/test/` (setup file, supabase mock client) — owned by whoever touches testing tasks (5.4).

## 8. Config / Env Files

- `.env` lives in `neo-messenger/` (already gitignored at root); `.env.example` committed alongside it.
- Vercel root directory stays `neo-messenger`.
- All `npm` commands run from `neo-messenger/` (committed GIT_WORKFLOW rule).

## 9. Accepted Trade-offs

- Frontend/backend separation is by folder *within* a mono-repo, not a split into `frontend/`/`backend/` (no backend app exists to split).
- `shared/` promotion rule requires discipline; without it `shared/` degrades to a dump.
- `messaging/` vs `conversations/` boundary: `messaging/` holds message-domain reusable pieces, `conversations/` holds the page + page-specific composition. Boundary is enforced by review, not tooling.
- Supabase functions folder reserved but empty — YAGNI until a real server-side need (image processing, scheduled story cleanup) appears.
- Monorepo packages/ split is deliberately YAGNI'd; revisit only if `shared/` grows out of control.

## 10. Out of Scope

- Per-message read receipts (SRS is conversation-level only).
- Group member removal, leaving/deleting groups.
- Email verification step.
- Any custom server code (Express/Nest/etc.).