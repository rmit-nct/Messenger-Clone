# Auth Setup

How NEO Messenger authenticates with Supabase, and how to wire it into the app.

## Stack

- Supabase Auth (BaaS) — session storage, auto token refresh, and onAuthStateChange are handled **internally** by `@supabase/supabase-js`. The app only calls auth methods and reacts to state.
- React `AuthContext` + `useAuth()` exposes session/user/methods to components.
- React Router guards (`RequireAuth`, `GuestOnly`) protect routes.

## Environment (secret)

Copy `neo-messenger/.env.example` to `neo-messenger/.env` and fill values from Supabase
Dashboard → Project Settings → API:

```
VITE_SUPABASE_URL=        # https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=   # anon/public key (publishable), safe client-side
```

Never put `service_role` key in the app — it bypasses RLS. `.env` is gitignored at repo root.

## Files (already implemented)

| File | Purpose |
|---|---|
| `src/shared/lib/env.ts` | typed env access (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); throws clear msg if missing |
| `src/shared/lib/supabase/client.ts` | singleton `supabase` client; `persistSession`, `autoRefreshToken`, `detectSessionInUrl` |
| `src/auth/service/auth-service.ts` | `signUp`, `signIn`, `signOut`, `resetPassword`, `updatePassword`, `getSession` |
| `src/auth/context/auth-context-core.ts` | `AuthContext` + `useAuth()` hook + types |
| `src/auth/context/auth-context.tsx` | `AuthProvider` — loads session, subscribes `onAuthStateChange`, exposes methods |
| `src/auth/guards/require-auth.tsx` | redirects guests to `/login` |
| `src/auth/guards/guest-only.tsx` | redirects authed users to `/inbox` |
| `src/auth/index.ts` | public barrel |

## `useAuth()` — what it returns

```ts
const { user, session, loading, signUp, signIn, signOut, resetPassword, updatePassword } = useAuth()
```

- `user: User | null` — current user (null when signed out)
- `session: Session | null` — token/session object
- `loading: boolean` — true while initial session resolves (in-app gating)
- methods all `Promise<void>`; throw on error. On success the session updates via `onAuthStateChange` (single source of truth — don't rely on return values).

## Guards

- `RequireAuth` — renders children if authed, else redirects to `/login`. Use to wrap **private** routes.
- `GuestOnly` — renders children if guest, else redirects to `/inbox`. Use to wrap **auth** routes.

## HOW TO WIRE (for members building pages)

### 1. Mount AuthProvider once, high in the tree

In `src/app/App.tsx`, wrap everything inside `<QueryClientProvider>` (and above the router):

```tsx
import { AuthProvider } from '../auth'

<AuthProvider>
  <BrowserRouter>...
</AuthProvider>
```

`AuthProvider` must be an ancestor of any component calling `useAuth()` (all guards + all pages).

### 2. Protect a private route

Wrap private route element with `RequireAuth`:

```tsx
import { RequireAuth } from '../auth'
import { AppShell } from './layouts/app-shell'

<Route
  path="/inbox"
  element={
    <RequireAuth>
      <AppShell sidebar={...} main={...} />
    </RequireAuth>
  }
/>
```

### 3. Gate auth pages (login/signup) as guest-only

```tsx
import { GuestOnly } from '../auth'
import { LoginPage } from '../auth/pages/login-page'

<Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
```

### 4. Read auth state in a component

```tsx
import { useAuth } from '../auth'

function MyPage() {
  const { user, loading } = useAuth()
  if (loading) return <Skeleton />
  return user ? <AuthedUI /> : <GuestUI />
}
```

### 5. Session restores on reload

`client.ts` enables `persistSession` + `detectSessionInUrl`, so reloading or opening a
password-reset/confirm link keeps the session / picks up the token automatically. `onAuthStateChange`
in `AuthProvider` keeps React state in sync. No extra work needed.

## Auto-created profile on signup

A Postgres trigger (`01_profiles.sql`) fires on any new `auth.users` row and inserts into `profiles`:

```sql
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
```

- Runs for **all** signup paths (incl. email confirmation).
- Default `display_name` = `data.display_name` if provided, else email prefix.
- Migration is idempotent (safe to re-run / `supabase db push`).

The app does **not** create profiles in JS — rely on the trigger.

## Notes for wiring members

- `supabase` client is the singleton from `@/shared/lib/supabase/client` — do **not** `createClient` again.
- Guards show nothing while `loading` (session resolving) — a shared skeleton/loading screen can replace the empty return later.
- `resetPassword(email)` has no `redirectTo` yet — set it to the reset-password route once routing exists.
- Protected access (only members read messages/conversations) is enforced later by **RLS** policies in `supabase/migrations`, not by this wrapper. Auth only supplies the `user` identity RLS checks against.