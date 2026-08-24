# NEO Messenger Clone — Complete UI/UX Plan

## 1. Sitemap

```
/                       Landing / product intro          (guest only)
/login                  Sign in                          (guest only)
/signup                 Sign up                          (guest only)
/recover                Password recovery request        (guest only)
/reset-password         Set new password (token link)    (guest only)
/setup-profile          Profile setup after signup       (auth, incomplete profile only)
/inbox                  Inbox: story tray + search + list (auth)
/conversation/:id       Conversation view                (auth, members only)
/story/create           Story composer                   (auth)
/stories/:userId        Story viewer                     (auth)
/profile                Own profile edit                 (auth)
/settings               App preferences + sign out       (auth)
*                       404 / not found                  (any)
```

Group settings and new-conversation creation are **dialogs/sheets, not routes** (they are quick actions inside the app shell). The story viewer uses the author's user id (`/stories/:userId`) so it can play that author's full queue of active stories.

| Screen | Purpose | Access | Navigation to it | SRS requirements |
|---|---|---|---|---|
| Landing `/` | Product intro + auth entry | Guests | Logo/link after sign-out; catch-all redirect for guests | General Pages; F12 |
| Sign up `/signup` | Create account (email + password) | Guests | Landing CTA, link from `/login` | F2 |
| Sign in `/login` | Authenticate | Guests | Landing CTA, link from `/signup`, redirect target for protected routes | F2 |
| Recover `/recover` | Request password reset email | Guests | "Forgot password?" from `/login` | F2 |
| Reset password `/reset-password` | Enter new password from email link | Guests with valid token | Reset email link | F2 |
| Setup profile `/setup-profile` | Display name + optional avatar | New users | Auto-redirect after signup; blocked for completed profiles | F2 |
| Inbox `/inbox` | Conversation list, story tray, search, unread | Auth users | Post-login default route; app shell home | F3, F8, F11, F12 |
| Conversation `/conversation/:id` | Messages, composer, group info | Members only | Inbox list, search result, new-conversation flow | F4–F7, F11, F13, F14 |
| Story composer `/story/create` | Image + caption publish | Auth users | "Your story" (+) in tray | F8 |
| Story viewer `/stories/:userId` | Watch active stories, progress, viewers | Auth users | Tray avatar tap | F8, F9, F10 |
| Profile `/profile` | Edit display name/avatar | Auth (own only) | Avatar menu | F2, F13 |
| Settings `/settings` | Theme preference, sign out | Auth | Avatar menu | F2, F12 |
| 404 | Clear "page not found" | Any | Catch-all route | F12 |

## 2. User Flows

Compact step sequences (auth → inbox → conversation → story → profile):

**Sign up** — Landing → Sign up → enter email/password/confirm → client+server validation → submit → success → auto-redirect to Setup profile → enter display name (+ optional avatar) → Finish → Inbox.

**Sign in** — Login → email + password (show/hide toggle) → submit → redirect to `/inbox` (or `/setup-profile` if profile incomplete).

**Password recovery** — Login → "Forgot password?" → `/recover` → enter email → submit → success state "If an account exists, a reset link was sent" → email link → `/reset-password` → new password + confirm → submit → success → redirect to `/login`.

**Profile setup** — Display name (required, trimmed, 2–40 chars, validated), avatar upload (optional: JPEG/PNG/WebP ≤5 MB, preview, crop-to-square preview only, no editing) → Save → toast "Profile saved" → `/inbox`.

**Viewing the inbox** — Sign in → story tray (top) + conversation list (latest activity first, preview + timestamp + unread badge) → tap item → conversation opens, unread badge clears, divider marks new messages.

**Creating a direct conversation** — Inbox "+" → New conversation dialog → Direct tab → search users by name (debounced 300 ms) → select user → conversation created → focus composer.

**Creating a group conversation** — Inbox "+" → Group tab → optional title (default "Group of N") → optional group image → search + multi-select up to 10 members (counter "n/10") → Create → conversation opens with member list visible in info panel.

**Sending a text message** — Composer focused → type (≤2000 chars) → Enter (mobile) / Enter or Send button (desktop) → optimistic bubble → failure state with retry if rejected → realtime echo confirms.

**Sending an image message** — Attach icon → file picker → validate type/size → inline preview in composer → Send → upload progress bar → success thumbnail in thread; failure → red-tinted bubble with Retry/Remove.

**Loading older messages** — Scroll to top of thread → skeleton rows → older page prepended → scroll position preserved → date separators inserted.

**Deleting your own message** — Hover (desktop) / long-press or overflow menu (mobile) → Delete → confirm dialog → bubble replaced by "Message deleted" placeholder (same for all members).

**Searching users/conversations** — Inbox search bar → results grouped "People" (avatar + name + Message action) and "Conversations" (open) → People selection starts a DM; Conversation selection navigates.

**Navigating to unread messages** — Unread badge on list → open conversation → "New messages" divider placed at first unread → floating "↓ n unread" button while scrolled above → tap scrolls to divider and highlights it briefly.

**Creating a story** — Tray "Your story" (+) → composer → choose image → validate → preview + optional caption (≤120 chars) → Publish → upload progress → success → tray entry appears; expires after 24 h (server-enforced).

**Viewing stories** — Tap tray avatar → viewer opens with 5 s auto-advance → progress bars animate → view recorded when story is seen.

**Moving between stories** — Auto-advance to next story; tap right 30% / ArrowRight / swipe left = next; tap left 30% / ArrowLeft / swipe right = previous; pause on press/hover; Esc or close = exit; end of queue closes.

**Viewing story viewers** — Own story only → "Seen by N" button in header → viewer-list dialog (avatar + display name, scrollable) → close.

**Editing profile/settings** — Avatar menu → Profile → edit name/avatar → Save → toast; Settings → theme (System/Light/Dark) → saved; Sign out → confirm-free → landing.

**Signing out** — Avatar menu → Sign out → session cleared → redirect to `/`.

## 3. Screen Specifications

Common states convention used below: **empty** = first-use no-data; **loading** = skeleton/spinner; **error** = message + retry; **success** = toast or inline confirmation. All screens share the AppShell (auth screens use AuthLayout instead).

**Landing** (`/`)
- Header/nav: logo (→ `/`), "Sign in" link; no menu.
- Main: hero (product name, tagline, primary CTA), three feature highlights (real-time chat, small groups, 24-hour stories), club footer.
- Actions: Sign up (primary), Sign in (secondary).
- States: loading = skeleton hero; error = inline retry banner; empty n/a; success n/a.
- Responsive: single column centered <768 px; two-column features ≥768 px.
- A11y: header/main/footer landmarks, focus rings, ≥4.5:1 contrast, alt text for any imagery.

**Sign up** (`/signup`) — AuthLayout (centered card, logo, back-to-login link).
- Form: email, password (min 8), confirm password; Zod validation; `aria-invalid` + `aria-describedby` errors; password visibility toggle; submit disabled while pending.
- States: loading = button spinner + "Creating account…"; error = inline alert (duplicate email, weak password); success = redirect.
- Responsive: full-width card (100% <768 px, max-w-md centered ≥768 px).
- A11y: labelled fields, error announcements via `aria-live="assertive"`, autocomplete attributes.

**Sign in** (`/login`) — Same layout.
- Form: email, password, "Forgot password?" link; show/hide password.
- States: loading = spinner; error = "Incorrect email or password" (no account enumeration); success = redirect.
- A11y: same as signup; focus first field on load.

**Recover** (`/recover`)
- Form: email only → submit → replaces form with success state ("If an account exists, a reset link was sent") and "Back to sign in".
- Error: invalid email format inline; server failure → alert + retry.
- A11y: labelled field, live region for success message.

**Reset password** (`/reset-password`)
- Form: new password (min 8) + confirm; validation; submit → success state "Password updated" → button to `/login`.
- Error: token expired/invalid → clear message + "Request a new link" (→ `/recover`).
- A11y: labelled fields, assertive live region for errors/success.

**Setup profile** (`/setup-profile`) — AuthLayout.
- Form: display name (required), avatar uploader (ImageUploader: drag/drop + browse, preview, remove).
- States: loading = skeleton card; error = inline alert + retry; success = toast + redirect to `/inbox`.
- A11y: labelled inputs, alt text "Your avatar preview", touch-friendly upload target.

**Inbox** (`/inbox`) — AppShell main screen.
- Header/nav: app logo, search bar (expands on mobile), new-conversation "+" (primary), avatar menu (Profile, Settings, Sign out). Skip-to-content link.
- Main: story tray (horizontal, above list) + conversation list (latest activity first).
- Lists/cards: ConversationItem = avatar, name, preview (sender prefix "You:"/"Name:" in groups, "[Image]" for photos, "…is typing" for typing state), relative timestamp, unread badge; active conversation highlighted; unread items tinted.
- States: empty = "No conversations yet" + "Start a conversation" CTA; loading = skeleton list; error = "Couldn't load conversations" + Retry; success = toast on conversation created.
- Responsive: sidebar+detail on ≥768 px; mobile shows only the list here (detail lives at `/conversation/:id`).
- A11y: list semantics (`role="list"`/nav), unread badge read as text ("3 unread"), search announced, focus management on dialog open/close.

**Conversation** (`/conversation/:id`)
- Header/nav: back (mobile only), avatar + title + member count, overflow menu (Group info, View members); group info opens right panel (desktop) / full-screen sheet (mobile).
- Main: message history with date separators and "New messages" divider; floating "↓ n unread" chip; typing indicator above composer.
- Forms: MessageComposer = auto-resizing textarea (≤2000 chars) + attach (image) + send; image preview strip before send; Enter sends (mobile), Shift+Enter newline.
- States: empty = "Say hello 👋" illustration + prompt; loading = skeleton bubbles; error = "Couldn't load messages" + Retry; success = toast for image upload/delete/group edits.
- Responsive: mobile = full-screen with list behind back button; desktop = right pane of shell; image lightbox full-screen both.
- A11y: bubbles with sender + time in accessible name, live region for incoming messages/typing, progress bars with `role="progressbar"`, dialog focus traps, touch targets ≥44 px.

**New conversation dialog** (overlay on `/inbox`)
- Tabs Direct/Group; Direct = user search + select; Group = title, image, member multi-select (≤10, counter), Create.
- States: empty = "No users found"; loading = skeleton search; error = inline; success = dialog closes + navigates to conversation.
- Mobile: bottom sheet; desktop: centered dialog (max-w-lg). A11y: labelled fields, `aria-modal`, Esc/backdrop close, focus returns to "+" button.

**Group info panel** (overlay on `/conversation/:id`)
- Content: group title (inline editable by any member), group image (editable), member grid (avatar + name), "Add members" (≤10 cap), member list is view-only.
- States: loading = skeleton; error = inline + retry; success = toast "Group updated".
- A11y: dialog semantics; member names as text, not only avatars.

**Story composer** (`/story/create`)
- Main: image picker (drag/drop + browse) → validation → preview (square-cropped, object-fit) → caption input (≤120 chars + counter) → Publish.
- States: empty = upload drop zone; loading = upload progress bar + percentage; error = invalid file or failed upload with Retry/Choose another; success = toast + return to inbox, tray entry appears.
- A11y: drop zone labelled and keyboard operable, alt text preview, progressbar role, error announcements.

**Story viewer** (`/stories/:userId`)
- Layout: dark backdrop; desktop = centered rounded card (max-w-sm, 80vh); mobile = full screen.
- Content: top bar = author avatar + name + posted time + menu (delete own story, viewer list for owner); segmented progress bars (one per story); image (object-contain); caption bottom overlay; tap zones left/right; prev/next controls.
- Behavior: 5 s auto-advance, pauses on press/hover and reduced-motion preference; view recorded once visible ≥1 s.
- States: loading = skeleton + spinner; error = "Couldn't load story" + Retry/Close; success n/a (exit).
- A11y: `role="dialog"`/`aria-modal`, arrows + Esc documented, close button labelled, caption read by screen reader, progress conveyed by aria-valuenow + "Next in 3s" text for SR users.

**Viewer list dialog** (overlay on viewer)
- Content: "Seen by N" + scrollable list (avatar + name, newest first).
- States: empty = "No views yet"; loading = skeleton; error = inline + retry.
- A11y: dialog semantics, focus trap, list semantics.

**Profile** (`/profile`)
- Form: avatar uploader + display name (2–40 chars); Save.
- States: loading = skeleton; error = inline; success = toast "Profile saved".
- A11y: labelled fields, alt text, keyboard-operable uploader.

**Settings** (`/settings`)
- Content: Theme selector (System/Light/Dark, saved to account), Sign out button, "Change password" link (→ `/recover`).
- States: loading = skeleton; error = inline; success = toast "Preference saved".
- A11y: segmented control with radio semantics + visible focus; sign-out reachable by keyboard.

**404** — Message "Page not found", links back to `/inbox` (or `/` if guest). Clear error state per F12.

## 4. Reusable Components

| Group | Component | Purpose / variants |
|---|---|---|
| Global | `AppShell` | Responsive layout: sidebar + main pane, skip link, avatar menu |
| Global | `AuthLayout` | Centered card layout for guest screens |
| Global | `Avatar` | Sizes 32/40/56 px; initials fallback; optional ring; alt text |
| Global | `AvatarStack` | Overlapping avatars for groups (up to 3 + "+N") |
| Global | `Badge` / `UnreadBadge` | Count pill; "99+" cap |
| Global | `Button`, `IconButton` | primary/secondary/ghost/danger; sm/md/lg; loading state |
| Global | `Modal`, `Sheet`, `DropdownMenu`, `Tooltip`, `Toast` | shadcn/Radix primitives; dialogs focus-trapped; mobile bottom sheets |
| Global | `Skeleton`, `EmptyState`, `ErrorState`, `SearchBar` | State + search scaffolding |
| Messaging | `ConversationList`, `ConversationItem` | Sorted list; preview, timestamp, unread, active, typing preview |
| Messaging | `MessageBubble` | Own/other, text/image, reactions row, meta (time, deleted state) |
| Messaging | `MessageComposer` | Textarea, attach, send, image preview strip, upload progress |
| Messaging | `ImageUploader`, `ImageLightbox` | Validation + progress; full-screen image view |
| Messaging | `TypingIndicator`, `DateSeparator`, `UnreadDivider` | Thread chrome |
| Messaging | `ConversationInfoPanel`, `NewConversationDialog`, `AddMembersDialog` | Group flows |
| Story | `StoryTray`, `StoryAvatar` | Horizontal scroll; gradient ring unseen / gray seen; "+" for own |
| Story | `StoryViewer`, `StoryProgressBar`, `StoryCaption` | Playback UI |
| Story | `ViewerListDialog`, `StoryComposer` | View tracking + creation |
| Form | `FormField`, `PasswordInput`, `MemberPicker`, `FileDropzone` | Labels/errors, visibility toggle, multi-select, validated uploads |
| Feedback | `LoadingSkeleton`, `ErrorState` (retry), `Toast`, `InlineAlert`, `ConfirmDialog` | Consistent states everywhere |

All components live under `src/components/` grouped by subsystem; message/story components are data-driven via shared TS types.

## 5. Responsive Layout

| Breakpoint | Inbox behavior | Other screens |
|---|---|---|
| Desktop ≥1024 px | Two panes: fixed sidebar (320–380 px: story tray + search + list + profile footer) + conversation pane. Group info = right panel overlay. | Story viewer = centered card; dialogs = centered; lightbox full screen |
| Tablet 768–1023 px | Same two-pane; sidebar collapses to 280 px with toggle (hamburger) | Same as desktop |
| Mobile <768 px | **Single pane**: `/inbox` shows only the list; tapping opens `/conversation/:id` as a separate full-screen view with a back button. Never both at once. | Dialogs become bottom sheets; viewer full screen; composer stays at bottom (safe-area inset) |

Key decisions: mobile uses **one-at-a-time navigation** (list ⇄ conversation via routes, so back/forward buttons work); the story tray stays above the list on all sizes; auth screens are single centered cards everywhere; touch targets ≥44 px on mobile vs ≥40 px desktop; hover-only actions (message menu, reactions) get long-press/overflow equivalents on touch.

## 6. Message UI

- **Own vs other:** own = right-aligned primary bubbles; other = left-aligned surface bubbles; 4 px "tail" corner on the outer side; sender name shown above other-user bubbles in groups.
- **Timestamps:** HH:MM under bubble meta; conversation list uses relative time ("now", "5m", "3h", "Yesterday", "Mar 4").
- **Read/unread:** unread count badge per conversation (cleared on open); "New messages" divider marks where unread content starts; per-message receipts out of scope (SRS is conversation-level).
- **Image messages:** rounded thumbnail (max 320 px wide, aspect-preserved); tap → full-screen lightbox with close and sender/time caption; alt text "Image from {name}".
- **Upload progress:** inline progress bar with percentage + Cancel while sending; optimistic gray placeholder until success.
- **Failed uploads:** red-tinted bubble + "Failed to send" + Retry/Remove actions; text failures show the same pattern.
- **Deletion:** only own messages offer Delete; confirm dialog; result = centered italic "Message deleted" placeholder (keeps thread context, satisfies "remove from public view").
- **Pagination:** reverse infinite scroll (scroll up → skeleton rows → older page prepended), scroll position preserved, date separators on day boundaries.
- **Empty conversations:** friendly prompt + "Say hello" CTA; composer still visible.
- **Real-time incoming:** live append at bottom; auto-scroll only if near bottom; otherwise "New messages" floating chip → jump to bottom.
- **Typing indicator (extra):** animated three-dot bubble at thread bottom; "Alice is typing…" / "Alice and Bob are typing…" (max 2 names); hides 3 s after last event; also shows in list preview.
- **Reactions (extra):** hover/long-press → emoji picker (👍 ❤️ 😂 😮 😢 🙏); toggle on/off; reaction row under bubble with counts; own reaction highlighted; tap row → "Who reacted" list dialog; updates in real time.

## 7. Story UI

- **Tray:** horizontal scroll; 56–64 px avatars with gradient ring (unseen) or gray ring (seen); name label beneath; first item = "Your story" with "+" badge; empty tray hides or shows a subtle hint.
- **Thumbnails/ring states:** unseen = vibrant gradient ring; seen = neutral gray ring (plus text distinction so color is not the only cue).
- **Viewer:** dark immersive layer; segmented progress bars (one per story, current fills over 5 s, pauses on press/hover); author avatar + name + posted time; caption overlay at bottom (≤120 chars, truncated with expand).
- **Navigation:** auto-advance; tap zones (left 30% = previous, right 30% = next); ArrowLeft/ArrowRight; swipe gestures on touch; Esc/close exits; end of queue closes.
- **Posted time:** relative ("2m", "3h", "23h").
- **Seen state / view tracking:** story marked seen for the viewer after ~1 s of display; owner sees "Seen by N".
- **Viewer count/list:** owner-only button → dialog with avatars + names, newest first; non-owners see no viewer data.
- **Expiration:** stories leave the tray after 24 h (server query filters; UI never shows expired content); own story can show "Expires in 2h" subtly.
- **Upload states:** drop zone → validating → preview → publishing (progress) → success (tray updates) → error (invalid file / network) with Retry/Choose another.

## 8. Navigation Architecture

- Routes as listed in §1; all auth-required routes redirect guests to `/login`; authenticated users visiting auth routes redirect to `/inbox`; users with incomplete profiles are forced to `/setup-profile`.
- App shell = `/inbox` (sidebar always present ≥768 px) and `/conversation/:id` (detail pane). Mobile conversation view renders inside the shell with a back button (route-driven).
- Dialogs (new conversation, group info, viewer list) are not routes; they open over the current screen and restore focus on close.
- Story flows use routes (`/story/create`, `/stories/:userId`) so refresh/back work.
- 404 catches unknown paths; guests land on `/`, auth users on `/inbox` (via guard).

## 9. Design System

**Colors (light / dark), Tailwind tokens:**

| Role | Light | Dark |
|---|---|---|
| Background / surface | `#FAFAFA` / `#FFFFFF` | `#0F1115` / `#171A21` |
| Primary | Indigo `#4F46E5` (hover `#4338CA`) | Indigo `#6366F1` buttons, `#4F46E5` text accents |
| Border | `neutral-200` | `neutral-800` |
| Text primary / secondary | `neutral-900` / `neutral-500` | `neutral-100` / `neutral-400` |
| Success / Danger / Warning | emerald-600 / red-600 / amber-600 | emerald-500 / red-500 / amber-500 |
| Own bubble | Primary, white text | Primary, white text |
| Other bubble | Surface, dark text | Surface, light text |
| Story gradient | `#F59E0B → #EF4444 → #8B5CF6 → #38BDF8` | same |

**Typography:** Inter with system fallback; display 2.5–3 rem/800 (landing only), h1 2 rem/700, h2 1.5 rem/700, h3 1.125 rem/600, body 1 rem/400, caption 0.75 rem; line-height 1.5; tabular numbers for timestamps.

**Spacing / radius / shadow:** 4 px scale; page padding 16 px mobile / 24–32 px desktop; radius sm 8 / md 12 / lg 16 / xl 20 / full (avatars, pills); shadows subtle (light: `0 1px 2px rgb(0 0 0/.06), 0 4px 12px rgb(0 0 0/.08)`; dark: black-based); focus ring = 2 px primary + 4 px primary/30 offset, on all interactive elements.

**Components:** Buttons — filled (primary), outline (secondary), ghost (icon), destructive; heights 32/40/48 px (44+ on mobile). Inputs — 40–44 px, 1 px border, 8 px radius, focus ring, inline error text. Cards — surface, 1 px border, 16 px radius. Avatars — 32/40/56 px, initials fallback, 1.5 px ring. Badges — ≥20 px pill, primary bg, white text, "99+" cap. Status indicators — unread dot on list items, story ring states, typing dots; never color-only. Modals — centered (max-w-lg) on desktop, bottom sheets on mobile, dimmed backdrop, focus-trapped.

## 10. Accessibility

- **Keyboard navigation:** full tab order; Esc closes dialogs/viewer/composer preview; arrows navigate stories; Enter/Space activate; skip-to-content link in AppShell.
- **Visible focus:** 2 px primary ring + offset on every interactive element, including dark mode.
- **Alt text:** "Image from {name}" for photo messages; story preview alt = caption or "{name}'s story"; avatar alt = "Avatar of {name}"; decorative icons `aria-hidden`.
- **Forms:** visible labels bound via `for`/`id`; errors with `aria-describedby` + `aria-invalid`; required markers; password visibility toggle labelled; autocomplete hints.
- **Screen-reader labels:** conversations announce sender + time; unread badge reads as "3 unread"; progress bars use `role="progressbar"` + values; incoming messages/typing/toasts use `aria-live` regions; story viewer provides timer/progress info and dialog roles.
- **Contrast:** body text ≥4.5:1, large text ≥3:1, UI/graphics ≥3:1, white-on-primary ≥4.5:1 (validated in both themes).
- **Touch:** ≥44 px targets on mobile; no hover-dependent actions; long-press menu with standard overflow alternative.
- **Dialogs:** `aria-modal`, focus trap, focus restore on close, labelled headings.
- **Reduced motion:** `prefers-reduced-motion` disables typing dots, auto-advance becomes manual (Next button still present), progress uses live text updates.

## 11. Requirement Coverage

| SRS Requirement | UI/UX Representation | Screen(s) | Status |
|---|---|---|---|
| 1. React/TS reusable components | Component system in §4; typed props/state contracts | All | Covered (architecture) |
| 2. Auth + profile setup | Signup/login/recover/reset/setup-profile screens; avatar uploader; name editor; sign out | `/signup /login /recover /reset-password /setup-profile /profile /settings` | Covered |
| 3. Conversation inbox | Story tray + list ordered by latest activity; preview, timestamp, unread, participants | `/inbox` | Covered |
| 4. Direct & small groups (≤10) | New-conversation dialog (direct/group), group title/image/members, add members | `/inbox` dialog, `/conversation/:id` info panel | Covered |
| 5. Real-time text messaging | Bubbles, composer, live append, timestamps, upward pagination | `/conversation/:id` | Covered |
| 6. Image messages | Attach → validate (JPEG/PNG/WebP ≤5 MB) → progress → success/failure feedback | `/conversation/:id` | Covered |
| 7. Message state & ownership | Unread badge + new-messages divider; delete own only; deleted placeholder | `/inbox`, `/conversation/:id` | Covered |
| 8. Stories with 24 h expiry | Story composer, caption, tray; expiry enforced by data query (UI never shows expired) | `/story/create`, `/inbox` | Covered (expiry = backend) |
| 9. Story tray & viewer | Tray, viewer with progress, prev/next, keyboard + touch nav | `/inbox`, `/stories/:userId` | Covered |
| 10. Story view tracking | Seen state, viewer count, viewer list for owner | `/stories/:userId`, viewer-list dialog | Covered |
| 11. Search & unread navigation | Search users/conversations (grouped results), unread badges, jump-to-unread chip | `/inbox`, `/conversation/:id` | Covered |
| 12. Responsive & accessible design | Breakpoint behavior (§5), a11y spec (§10), skeletons, retry, empty/error states | All | Covered |
| 13. Security & privacy rules | No dedicated screen: RLS/realtime-channel/storage policies + member-gated access; UI shows permission errors (403 state, non-members see "conversation not found") | Backend + error states | Backend (no dedicated screen) |
| 14. Extra features | Typing indicators + emoji reactions | `/conversation/:id` | Covered |

## 12. Extra Features

**1. Typing indicators** — *Why:* the single biggest cue that a conversation is alive; makes real-time feel real and demos well. *UI:* animated three-dot bubble above the composer for other users; "Alice is typing…" label (max 2 names); list preview swaps to "…is typing"; auto-hides after 3 s idle. *Complexity:* Low — one realtime channel per conversation, debounced events, no storage. *Reuse:* MessageBubble, MessageComposer, ConversationItem preview, Skeleton-style dot animation.

**2. Emoji reactions** — *Why:* low-cost, high-engagement feedback; satisfies "creative extra feature" without message-editing complexity. *UI:* hover (desktop) / long-press (mobile) on a bubble → picker (👍 ❤️ 😂 😮 😢 🙏); toggleable; reaction row under bubble with counts, own reaction highlighted; tap row → "Who reacted" dialog; realtime updates. *Complexity:* Medium — picker, toggle logic, aggregated counts, viewer list, realtime sync. *Reuse:* MessageBubble, DropdownMenu, Modal/Dialog, AvatarStack, Badge, Tooltip.

## Assumptions & Defaults

- File limits: images JPEG/PNG/WebP, ≤5 MB (messages and stories); text ≤2000 chars; story captions ≤120 chars.
- Group cap = 10 participants including the creator; any member may edit title/image and add members; member removal and leaving/deleting groups are out of scope (not in SRS).
- Opening a conversation clears its unread badge; the "New messages" divider + jump chip cover "navigate to latest unread".
- Deleted messages render as "Message deleted" placeholders.
- Stories auto-advance every 5 s, pause on press/hover, and are considered "seen" after ~1 s; expiry is server-enforced at 24 h.
- No email-verification step is added (not required by SRS); Supabase auth handles sessions.
- Theme preference (System/Light/Dark) is persisted per user; keyboard and reduced-motion preferences follow OS.
- This document is the canonical UX plan; it can feed the Stitch design brief directly.
