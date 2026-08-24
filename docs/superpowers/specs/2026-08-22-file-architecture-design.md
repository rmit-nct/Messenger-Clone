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

**Layering rule:** feature folders import from `shared/*` freely. Cross-feature imports are allowed ONLY through the feature's public barrel (`index.ts`) — never deep imports into another feature's internals. Page-level composition happens through these barrels (example: inbox composes `stories`'s `StoryTray`, which lives in the stories feature). Universal values (limits, shared types) belong in `shared/` and are promoted there.

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
    ├── api/           # cross-feature data access: user search, storage uploads
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
| `app/` | 1.3 App Shell + responsive drawer + breakpoint standard | guards, providers, pane-empty-state |
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
- `MemberPicker` — used by inbox (new group dialog) and conversations (add members) → `shared/ui/member-picker.tsx`. It is **presentational** (receives users/selection via props); the user-search calls happen in the calling feature.
- `ConversationItem`, `StoryProgressBar`, `StoryTray` — single-feature → stay inside their feature folder.

### 5.6 Full target file tree

Colocated component tests (`*.test.tsx`) are not listed file-by-file below — one test file lives next to each unit that needs one.

```
Messenger-Clone/
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── superpowers/specs/
│   │   └── 2026-08-22-file-architecture-design.md
│   └── (weekly reports)
├── screenshots/                 # deliverable; .gitkeep now
├── supabase/
│   ├── migrations/
│   │   ├── 01_profiles.sql          # profiles table + RLS (auth-owned, public read)
│   │   ├── 02_conversations.sql     # conversations + conversation_members + RLS
│   │   ├── 03_messages.sql          # messages + attachments + RLS + realtime publication
│   │   ├── 04_stories.sql           # stories + story_views + RLS + realtime publication
│   │   ├── 05_reactions.sql         # message_reactions + RLS + realtime
│   │   └── 06_presence_typing.sql   # online presence / typing (extras)
│   ├── seed.sql                     # dev seed data
│   ├── config.toml                  # local dev, storage buckets (messages, avatars, stories)
│   ├── functions/
│   │   └── .gitkeep                 # RESERVED, empty — server-side compute later
│   └── README.md                    # how to run local Supabase + apply migrations
├── .gitignore
└── README.md                        # main submission README

neo-messenger/
├── e2e/
│   ├── playwright.config.ts
│   ├── fixtures/
│   │   ├── helpers.ts                # login helper, page setup
│   │   └── test-user.ts              # created users per flow
│   └── specs/
│       ├── auth.spec.ts
│       ├── messaging.spec.ts
│       └── stories.spec.ts
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── main.tsx                      # entry → <App/>
│   ├── index.css                     # Tailwind + global styles
│   ├── assets/
│   │   └── hero.png
│   ├── app/
│   │   ├── App.tsx                   # provider composition + <AppRouter/>
│   │   ├── router/
│   │   │   └── app-router.tsx        # route table + guard wrapping
│   │   ├── layouts/
│   │   │   └── app-shell.tsx         # slot contract: <AppShell sidebar main>; responsive (sidebar<->drawer)
│   │   ├── components/
│   │   │   ├── user-menu.tsx         # avatar dropdown: Profile / Settings / Sign out
│   │   │   ├── sidebar-nav.tsx       # compact nav (Chats/Stories/Settings) + profile footer
│   │   │   ├── top-nav-bar.tsx       # mobile header: logo, +, avatar menu
│   │   │   ├── bottom-nav-bar.tsx    # mobile: Chats / Stories / Profile / Settings
│   │   │   └── pane-empty-state.tsx  # "Select a conversation" glass card (main slot placeholder)
│   │   ├── pages/
│   │   │   └── not-found-page.tsx
│   │   ├── contexts/
│   │   │   └── theme-context.tsx     # System/Light/Dark
│   │   └── providers/
│   │       └── app-providers.tsx     # QueryClient + Auth + Theme + Toast
│   ├── auth/
│   │   ├── index.ts                  # public barrel
│   │   ├── service/
│   │   │   └── auth-service.ts       # signUp/signIn/signOut/recover/updatePassword/session
│   │   ├── context/
│   │   │   └── auth-context.tsx      # session provider
│   │   ├── guards/
│   │   │   ├── require-auth.tsx      # redirect guests → /login
│   │   │   └── guest-only.tsx        # redirect authed users → /inbox
│   │   ├── pages/
│   │   │   ├── landing-page.tsx
│   │   │   ├── login-page.tsx
│   │   │   ├── signup-page.tsx
│   │   │   ├── recover-page.tsx
│   │   │   └── reset-password-page.tsx
│   │   └── components/
│   │       └── auth-layout.tsx       # centered card layout for guest screens
│   ├── profile/
│   │   ├── index.ts
│   │   ├── api/
│   │   │   └── profile.ts            # upsert profile, display_name/avatar update
│   │   ├── hooks/
│   │   │   └── use-profile.ts
│   │   ├── pages/
│   │   │   ├── setup-profile-page.tsx
│   │   │   ├── profile-page.tsx
│   │   │   └── settings-page.tsx
│   │   └── components/
│   │       └── profile-form.tsx
│   ├── inbox/
│   │   ├── index.ts
│   │   ├── api/
│   │   │   ├── conversations.ts      # list ordered by latest activity + unread + preview
│   │   │   └── new-conversation.ts   # create direct/group (≤10)
│   │   ├── hooks/
│   │   │   ├── use-conversation-list.ts
│   │   │   └── use-debounced-search.ts
│   │   ├── pages/
│   │   │   └── inbox-page.tsx        # story tray (via stories barrel) + list + search
│   │   └── components/
│   │       ├── conversation-list.tsx
│   │       ├── conversation-item.tsx
│   │       ├── search-bar.tsx
│   │       ├── search-results.tsx    # People + Conversations groups
│   │       └── new-conversation-dialog.tsx  # Direct/Group tabs
│   ├── conversations/
│   │   ├── index.ts
│   │   ├── api/
│   │   │   ├── messages.ts           # fetch older pages, send text/image, delete own
│   │   │   ├── members.ts            # add members, last_read_at updates
│   │   │   └── group-info.ts         # title/image edits
│   │   ├── hooks/
│   │   │   └── use-conversation.ts   # TanStack: pages + optimistic send + read state
│   │   ├── pages/
│   │   │   └── conversation-page.tsx
│   │   └── components/
│   │       ├── message-list.tsx      # thread + date separators + unread divider
│   │       ├── group-info-panel.tsx
│   │       ├── add-members-dialog.tsx
│   │       └── jump-to-unread.tsx    # "↓ n unread" chip
│   ├── messaging/
│   │   ├── index.ts
│   │   ├── api/
│   │   │   └── reactions.ts          # toggle reaction, aggregated counts
│   │   ├── hooks/
│   │   │   ├── use-message-realtime.ts  # insert/delete/reaction channel subscription
│   │   │   ├── use-typing.ts         # broadcast + listen (debounced)
│   │   │   └── use-presence.ts       # online presence (extra feature 1)
│   │   └── components/
│   │       ├── message-bubble.tsx
│   │       ├── message-composer.tsx  # PRESENTATIONAL; send wiring lives in conversations
│   │       ├── date-separator.tsx
│   │       ├── unread-divider.tsx
│   │       ├── typing-indicator.tsx
│   │       ├── reaction-row.tsx
│   │       └── reaction-picker.tsx
│   ├── stories/
│   │   ├── index.ts
│   │   ├── api/
│   │   │   ├── stories.ts            # active list (<24h), create, delete
│   │   │   └── story-views.ts        # record view, viewers list
│   │   ├── hooks/
│   │   │   ├── use-active-stories.ts
│   │   │   └── use-story-playback.ts  # 5s timer, keyboard/swipe nav, seen-after-1s
│   │   ├── pages/
│   │   │   ├── story-compose-page.tsx
│   │   │   └── story-viewer-page.tsx
│   │   └── components/
│   │       ├── story-tray.tsx
│   │       ├── story-avatar.tsx
│   │       ├── story-viewer.tsx
│   │       ├── story-progress-bar.tsx
│   │       ├── story-caption.tsx
│   │       └── viewer-list-dialog.tsx
│   └── shared/
│       ├── ui/
│       │   ├── button.tsx  input.tsx  label.tsx  dialog.tsx  sheet.tsx
│       │   ├── dropdown-menu.tsx  tabs.tsx  avatar.tsx  badge.tsx
│       │   ├── card.tsx  skeleton.tsx  tooltip.tsx  toast.tsx
│       │   ├── empty-state.tsx  error-state.tsx  confirm-dialog.tsx
│       │   ├── avatar-stack.tsx  image-lightbox.tsx
│       │   ├── image-uploader.tsx    # promoted: avatar + messages + stories uploads
│       │   ├── member-picker.tsx     # presentational; data via props
│       │   └── forms/
│       │       ├── form-field.tsx
│       │       └── password-input.tsx
│       ├── lib/
│       │   ├── supabase/
│       │   │   ├── client.ts         # createClient singleton
│       │   │   └── realtime.ts       # typed channel helpers
│       │   ├── api/
│       │   │   ├── users.ts          # search users by name (cross-feature)
│       │   │   └── uploads.ts        # storage upload with progress + cancel
│       │   ├── utils.ts              # cn()
│       │   ├── date.ts               # relative time, day separators, tabular format
│       │   └── env.ts                # typed env access
│       ├── hooks/
│       │   ├── use-media-query.ts
│       │   ├── use-debounce.ts
│       │   └── use-toast.ts
│       ├── types/
│       │   └── database.ts           # DB row types (= today's src/types/types.ts)
│       └── constants/
│           ├── limits.ts             # group 10, image 5MB, text 2000, caption 120
│           ├── realtime.ts           # channel names, event names
│           └── breakpoints.ts        # team breakpoints: mobile <768, tablet 768-1023, desktop ≥1024
├── src/test/
│   ├── setup.ts                      # vitest setup: jest-dom, cleanup
│   └── supabase-mock.ts              # mock supabase client
├── .env.example                      # committed: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── components.json                   # shadcn path alias → shared/ui, @ -> src
├── vite.config.ts
├── tsconfig.json  tsconfig.app.json  tsconfig.node.json
├── eslint.config.js  .prettierrc  .prettierignore
├── package.json  index.html
```

### 5.7 Starter-file cleanup (first task)

Restructure from the Vite starter state:

- Move `src/types/types.ts` → `src/shared/types/database.ts` (content unchanged).
- Move `src/components/ui/*` → `src/shared/ui/*`; `src/lib/utils.ts` → `src/shared/lib/utils.ts`.
- Delete starter junk: `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`.
- Rewrite `src/App.tsx` → `src/app/App.tsx` (replaces counter demo); `main.tsx` re-points imports.
- Update `components.json` alias and `vite.config.ts` path alias: `@/components/ui` → `@/shared/ui`.
- Keep `public/favicon.svg`, `public/icons.svg`, `src/assets/hero.png`, `src/index.css`.

### 5.8 Team standards (breakpoints, shell contract, tokens)

Adopted during sprint 1; supersedes earlier 640px breakpoint mentions in UX plan §5 and Stitch A6/B1 (those docs are updated).

**Breakpoints (single source of truth: `shared/constants/breakpoints.ts`):**

| Device | Range | Behavior |
|---|---|---|
| Mobile | <768 px | Single pane + drawer nav (top/bottom bars), dialogs → bottom sheets |
| Tablet | 768–1023 px | Sidebar visible, collapsible via hamburger (280 px) |
| Desktop | ≥1024 px | Full two-pane: sidebar 320–380 px + conversation pane |

**AppShell slot contract (task 1.3):** `<AppShell sidebar={ReactNode} main={ReactNode}>`. All authed pages render inside the shell; sidebar content is composed from feature barrels (inbox list region + stories tray), never imported into `shared/`. Shell chrome (sidebar-nav, top/bottom nav bars, user menu, pane-empty-state) lives in `app/`.

**Design tokens (`src/index.css` @theme, Stitch brief A2–A4 supersedes UX plan §9):**

| Token | Dark | Light | Role |
|---|---|---|---|
| `bg` | `#171624` | `#f2f7fc` | Base background |
| `panel` | `#02273a` | `#ffffff` | Sidebars, cards, dialogs, inputs, other bubbles |
| `foreground` | `#fafafa` | `#171624` | Text |
| `cyan` | `#8ce7ff` | `#8ce7ff` | Active, own bubbles, badges, focus ring |
| `cyan-strong` | `#0369a1` | `#0369a1` | Cyan text/links on light surfaces |
| `gold` | `#fbb916` | `#fbb916` | Attention, unread chips, story played |
| `gold-strong` | `#b45309` | `#b45309` | Gold text on light surfaces |

Borders = foreground 12–18% (dark) / neutral-200 (light); muted = foreground 60–70%; hover = cyan/gold tint 6–10%. Font: Inter (fontsource variable); radius sm 8 / md 12 / lg 16 / xl 20; utilities `scrollbar-hide`, `pb-safe` in `index.css`. shadcn semantic vars map onto these (primary = cyan, ring = cyan, destructive = red light / `#ffb4ab` dark).

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
- E2E (Playwright) lives in `neo-messenger/e2e/` at app root, not in `src/`, since it runs against the built app. One spec per major flow (`auth`, `messaging`, `stories`), shared fixtures in `e2e/fixtures/`.
- Test setup/mocks under `neo-messenger/src/test/` (setup file, supabase mock client) — owned by whoever touches testing tasks (5.4).

## 8. Config / Env Files

- `.env` lives in `neo-messenger/` (already gitignored at root); `.env.example` committed alongside it with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (typed access via `shared/lib/env.ts`).
- Vercel root directory stays `neo-messenger`.
- All `npm` commands run from `neo-messenger/` (committed GIT_WORKFLOW rule).
- Never commit secret keys (SRS requirement); values only exist in local `.env` / Vercel dashboard.

## 9. Accepted Trade-offs

- Frontend/backend separation is by folder *within* a mono-repo, not a split into `frontend/`/`backend/` (no backend app exists to split).
- `shared/` promotion rule requires discipline; without it `shared/` degrades to a dump.
- `messaging/` vs `conversations/` boundary: `messaging/` holds presentational message-domain pieces + realtime hooks (`MessageComposer` receives an `onSend` callback and does no DB calls; `conversations/` wires it to `api/messages.ts`), `conversations/` holds the page + page-specific composition + mutations. Boundary is enforced by review, not tooling.
- Cross-feature composition via public barrels (e.g. inbox importing `StoryTray`) is a deliberate relaxation of strict modular isolation; enforced by review — deep imports into another feature are the prohibited form.
- Supabase functions folder reserved but empty — YAGNI until a real server-side need (image processing, scheduled story cleanup) appears.
- Monorepo packages/ split is deliberately YAGNI'd; revisit only if `shared/` grows out of control.

## 10. Out of Scope

- Per-message read receipts (SRS is conversation-level only).
- Group member removal, leaving/deleting groups.
- Email verification step.
- Any custom server code (Express/Nest/etc.).