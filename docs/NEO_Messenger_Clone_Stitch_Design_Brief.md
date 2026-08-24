# NEO Messenger Clone — Stitch Design Brief

> Target file: `planning_docs/NEO_Messenger_Clone_Stitch_Design_Brief.md`
> This brief is a prompt/design specification for Stitch. Part A defines the global foundation; Part B contains one self-contained prompt block per screen; Part C maps every SRS requirement to its visual representation and labels proposed design decisions. Do not design functionality beyond this brief.

## Part A — Global Foundation

### A1. Visual Direction

Design a modern, dual-theme messaging web app for a closed student/club community ("NEO Culture Tech"). The aesthetic is a clean, slightly techy "club" look: a light mode built on a soft off-white blue (`#f2f7fc`) and a dark mode built on deep near-black indigo (`#171624`) with deep navy-teal panels (`#02273a`). Two luminous accents — cyan (`#8ce7ff`) and gold (`#fbb916`) — are used sparingly across both themes for active, unread, highlighted, and interactive elements. The app should feel calm and legible (it is used daily for chat); density is compact-moderate and free of decorative clutter. Dark mode is the default presentation in this brief; light mode is the token-swap equivalent (same layout, light surfaces and dark text).

### A2. Color System (mandated core palette)

The colors below are the **core palette**. They may be repurposed beyond their listed role where it improves clarity (e.g., cyan as button fill, gold as badge fill, `#02273a` as input background, `#171624` as modal scrim). These are the **main** colors only: **other colors may still be used with moderation** — white for light-mode panels, dark neutrals for light-mode text, and semantic hues (emerald for success, red for danger, amber for warnings, grays for borders/muted text). Brand emphasis stays with cyan + gold.

| Token | Dark mode | Light mode | Primary role |
|---|---|---|---|
| Base background | `#171624` | `#f2f7fc` | Page/app shell, chat background, viewer backdrop, scrims |
| Panel/surface | `#02273a` | `#ffffff` (white, moderate use) | Sidebar, cards, dialogs, inputs, other-user bubbles, sheets, toasts |
| Normal text | `#fafafa` | `#171624` | Body, headings, messages, labels |
| Highlight cyan | `#8ce7ff` | `#8ce7ff` (fills/accents); darken to `#0369a1` for text/links on light surfaces | Primary accent: active states, own bubbles, unread badges, focus rings, primary buttons, progress, story "current" |
| Highlight gold | `#fbb916` | `#fbb916` (fills/accents); darken to `#b45309` for text on light surfaces | Secondary accent: attention/warnings, failed uploads, "new messages" chips, viewer count, story "played" |

Derived tones (allowed; same hues blended with black/white/opacity, plus moderated neutrals): hover surfaces = surface tinted with cyan/gold at 6–10%; borders = `#fafafa` at 12–18% (dark) / neutral gray 200 (light); muted text = text at 60–70% opacity; disabled = 40% opacity; focus ring = cyan 2 px + 4 px offset at 30%; shadows = black at 35–45%.

Contrast (all pass WCAG AA): dark — `#fafafa` on `#171624` ≈ 17:1, on `#02273a` ≈ 15:1, `#8ce7ff` on `#02273a` ≈ 10:1, `#fbb916` on `#02273a` ≈ 8.4:1, `#171624` on `#8ce7ff` ≈ 9:1. Light — `#171624` on `#f2f7fc` ≈ 14:1, `#0369a1` on `#f2f7fc` ≈ 5.4:1, `#b45309` on `#f2f7fc` ≈ 4.6:1.

### A3. Typography

Inter with system fallback (Arial/Segoe UI/Roboto). Tabular numerals for timestamps and counts.

| Style | Size / weight | Usage |
|---|---|---|
| Display | 2.75 rem / 800 | Landing hero only |
| H1 | 2 rem / 700 | Screen titles (auth, profile) |
| H2 | 1.5 rem / 700 | Section titles (dialogs, settings) |
| H3 | 1.125 rem / 600 | Card/list titles, group names |
| Body | 1 rem / 400 | Messages, descriptions |
| Small | 0.875 rem / 400 | List previews, metadata |
| Caption | 0.75 rem / 400 | Timestamps, badges, helper text |

Line height 1.5; `text-wrap: balance` for headings only.

### A4. Spacing, Radius, Shadow

- Spacing scale: 4 px multiples (4, 8, 12, 16, 24, 32, 48).
- Page padding: 16 px mobile, 24–32 px desktop.
- Radius: sm 8, md 12, lg 16, xl 20, full (avatars, badges, pills).
- Shadows: dark — `0 1px 2px rgb(0 0 0/.35), 0 8px 24px rgb(0 0 0/.45)`; light — same but 12–18% opacity; none on flat panels.
- Focus: cyan ring on every interactive element, both themes.

### A5. Component Library and Visual Variants

Every component has **light and dark variants** (token swap; identical layout). No hover-dependent functionality on touch; icons carry labels or accessible names; destructive actions are gold-outlined (dark) / red-outlined (light, moderate use).

| Component | Visual variants |
|---|---|
| `AppShell` | Desktop/tablet: left sidebar + main pane; mobile: single pane; skip-to-content link. |
| `AuthLayout` | Centered card (max-w-md), logo top; card = `#02273a` (dark) / white (light), 16 px radius. |
| `Avatar` | 32 / 40 / 56 px; initials fallback; optional ring; alt text. |
| `AvatarStack` | Overlapping avatars, up to 3 + "+N"; ring matches parent surface. |
| `UnreadBadge` | ≥20 px pill, cyan fill, dark text, "99+" cap. |
| `Button` | Primary = cyan fill / dark text; Secondary = outline; Ghost = icon-only; Destructive = gold outline (dark) / red outline (light). Sizes sm 32 / md 40 / lg 48 px; loading = spinner + disabled. |
| `Input` / `Textarea` | Panel bg, subtle border, 8 px radius, cyan focus ring; error = gold border (dark) / red border (light) + inline message. |
| `Modal` | Centered (max-w-lg), panel bg, 16 px radius, dim scrim, focus-trapped. |
| `Sheet` | Mobile bottom sheet, panel bg, top radius 16 px, drag handle. |
| `DropdownMenu`, `Tooltip`, `Toast` | Panel bg + border; toast = cyan left border (success), gold/red for warnings/errors; bottom-center. |
| `Skeleton` | Surface blocks at text 8% opacity, soft pulse. |
| `EmptyState` | Centered icon (panel circle), title, helper text, CTA. |
| `ErrorState` | Panel card, gold border (dark) / red border (light), icon, message, Retry. |
| `SearchBar` | Rounded full, panel bg, cyan focus ring, clear "×". |
| `ConversationList` / `Item` | 72 px row: 56 px avatar, name (body), preview (small, muted), relative time (caption), unread badge; active = cyan 8% tint + cyan left bar; hover = 4% tint. |
| `MessageBubble` | Own = cyan fill / dark text, right; Other = panel fill / normal text, left; 4 px tail on outer side; radius 16 (corner 4 near tail). |
| `MessageComposer` | Auto-resizing textarea, attach icon, cyan send button (disabled when empty), image preview strip, upload progress. |
| `ImageUploader` / `FileDropzone` | Dashed cyan border dropzone; drag/hover highlight; validation error gold/red. |
| `ImageLightbox` | Full-screen backdrop, image object-contain, close top-right, caption bottom. |
| `TypingIndicator` | Three small cyan dots (staggered pulse) in an "other" bubble; static on reduced motion. |
| `DateSeparator` | Centered caption chip, panel bg, muted text ("Today", "Yesterday", "Mar 4"). |
| `UnreadDivider` | Centered cyan chip with gold dot + "N new messages". |
| `StoryTray` / `StoryAvatar` | 64 px avatar; unseen ring = cyan→gold gradient; seen ring = muted; first item = own "+" (gold plus on cyan ring); label caption under. |
| `StoryViewer` | Backdrop; desktop centered card (max-w-sm, 80vh) radius 16; mobile full-screen. |
| `StoryProgressBar` | Segmented: unplayed muted, current cyan (fills 5 s), played gold. |
| `StoryComposer` | Dropzone → square preview → caption (≤120 chars, counter) → Publish (cyan). |
| `FormField` | Label (small) + control + error (gold/red, with icon); `aria-describedby`. |
| `PasswordInput` | Input + labeled eye toggle. |
| `MemberPicker` | Search + selectable rows (avatar + name + check); selected rows cyan-tinted; counter "n/10". |
| `ConfirmDialog` | Modal with title, message, Cancel (secondary), Confirm (destructive). |
| `InlineAlert` | Panel card, gold border (dark) / red border (light), icon, message, optional action. |

### A6. Responsive Layout Rules

- **Desktop ≥1024 px:** two-pane inbox — fixed sidebar 320–380 px (story tray, search, list, profile footer) + conversation pane; dialogs centered; story viewer centered card; lightbox full-screen.
- **Tablet 768–1023 px:** same two-pane; sidebar 280 px, collapsible via hamburger.
- **Mobile <768 px:** single pane — list **or** conversation (never both), route-driven with back button; dialogs become bottom sheets; viewer full-screen; composer pinned bottom with safe-area inset; touch targets ≥44 px (40 px desktop).
- Story tray stays above the list at all sizes; long-press mirrors hover actions on touch.

### A7. State Specifications (applies to every screen)

- **Loading:** skeletons matching the final layout; never blank.
- **Empty:** icon + short title + single CTA when an action exists.
- **Error:** ErrorState/InlineAlert + Retry; never a raw message.
- **Success:** Toast (cyan border) for saves/uploads; inline confirmation on auth; redirects where applicable.
- **Unread:** cyan badge; cyan 8% tint on unread rows; "N new messages" divider + floating jump chip in-thread.
- **Upload progress:** inline cyan progress + percentage + Cancel; optimistic placeholder at 40% opacity.
- **Failed upload:** gold-tinted bubble/card (dark) / red-tinted (light) + "Failed to send/upload" + Retry/Remove.
- **Accessibility of states:** text/icons always accompany color; loading/error/toast use live regions.

### A8. Accessibility (global)

Keyboard-operable everything (Tab order, Esc closes overlays, Enter/Space activates); visible cyan focus rings; alt text on all images/avatars/stories; labelled forms with inline errors; dialogs `aria-modal` + focus trap + focus restore; screen-reader text for unread counts, progress, typing, timers; contrast per A2; `prefers-reduced-motion` disables pulse/auto-advance animations (story progress still shown as text).

---

## Part B — Screen Prompt Blocks

Each block is self-contained for Stitch; reference Part A for tokens/components. **Every screen is produced in both light and dark variants** (theme = token swap, layout unchanged) unless a block says otherwise.

### B1. Landing (`/`)

**Context:** Guest-only product intro and entry point. **Layout:** full-screen centered hero on base background; footer below. **Hierarchy:** product name (Display) → tagline (body) → CTA pair → three feature cards (2-col ≥768 px) → club footer. **Elements:** logo top-left, "Sign in" link top-right, primary "Sign up" (cyan), secondary "Sign in" (outline), feature cards (icon + title + line): "Real-time chat", "Small groups", "24-hour stories". **States:** loading = hero skeleton; error = InlineAlert + retry. **Responsive:** single column <768 px; two-column features ≥768 px. **A11y:** header/main/footer landmarks, focus rings. **SRS:** General Pages; F12.

### B2. Sign in (`/login`)

**Context:** Guest authentication. **Layout:** AuthLayout card. **Hierarchy:** logo → "Welcome back" (H1) → form → links. **Elements:** email input, PasswordInput, "Forgot password?" (accent link), primary submit (loading spinner). **States:** loading = button spinner; error = InlineAlert "Incorrect email or password" (no account enumeration); success = redirect. **Responsive:** full-width card mobile, max-w-md desktop. **A11y:** labelled fields, autocomplete, `aria-live` errors, focus first field. **SRS:** F2.

### B3. Sign up (`/signup`)

**Context:** Guest account creation. **Layout:** AuthLayout card. **Hierarchy:** logo → "Create account" (H1) → form → login link. **Elements:** email, password (min 8, strength hint), confirm password, primary submit; "Already have an account? Sign in" (accent link). **States:** loading = spinner; error = InlineAlert (duplicate email / weak password); success = redirect to Setup profile. **A11y:** labelled fields, `aria-live="assertive"`. **SRS:** F2.

### B4. Recover (`/recover`)

**Context:** Request password reset email. **Layout:** AuthLayout card. **Hierarchy:** logo → "Reset password" (H1) → email form. **Elements:** email input, "Send reset link" (primary), "Back to sign in" (secondary). **States:** success = confirmation card "If an account exists, a reset link was sent" + button to `/login`; error = InlineAlert. **A11y:** live region for success message. **SRS:** F2.

### B5. Reset password (`/reset-password`)

**Context:** New password from email token. **Layout:** AuthLayout card. **Elements:** new password + confirm (PasswordInputs), primary submit. **States:** success = "Password updated" + button to `/login`; error = "Link expired or invalid" + "Request a new link" (→ `/recover`). **A11y:** labelled fields, assertive live region. **SRS:** F2.

### B6. Setup profile (`/setup-profile`)

**Context:** New user completes identity after signup. **Layout:** AuthLayout card. **Hierarchy:** logo → "Set up your profile" (H1) → avatar → name → finish. **Elements:** 56 px avatar preview + "Upload avatar" (FileDropzone, optional, JPEG/PNG/WebP ≤5 MB — proposed decision), display name input (required, 2–40 chars), "Finish" (primary). **States:** loading = card skeleton; error = InlineAlert (invalid file/name); success = toast + redirect to `/inbox`. **A11y:** "Your avatar preview" alt, labelled input. **SRS:** F2.

### B7. Inbox (`/inbox`) — desktop + mobile

**Context:** Authenticated home; primary shell. **Layout (desktop/tablet):** sidebar (StoryTray → SearchBar → ConversationList → profile footer avatar) + empty detail pane placeholder ("Select a conversation"). **Layout (mobile):** full-screen list only; header with logo, search icon, "+", avatar menu. **Hierarchy:** tray → search → newest conversation first. **Elements:** ConversationItem (avatar, name, preview with sender prefix "You:"/"Name:" in groups, "[Image]" for photos, "…is typing" for typing state, relative time, UnreadBadge); unread rows cyan-tinted; active row cyan bar. **Actions:** "+" opens New conversation dialog; avatar menu → Profile/Settings/Sign out. **States:** empty = "No conversations yet" + "Start a conversation"; loading = list skeletons; error = ErrorState + Retry; success = toast after conversation created; unread = badges. **A11y:** list semantics, "3 unread" read as text, focus management on dialog open/close. **SRS:** F3, F8, F11, F12.

### B8. Conversation (`/conversation/:id`) — desktop + mobile

**Context:** Message thread for members only. **Layout:** desktop/tablet = main pane (header with avatar + title + member count + overflow menu, scrollable history, composer); mobile = full-screen with back button. **Hierarchy:** header → history (date separators, "New messages" divider) → composer. **Elements:** MessageBubble (own/other/text/image/deleted), TypingIndicator above composer, floating "↓ n unread" chip, ImageLightbox, group info via header menu. **Actions:** composer send (Enter mobile / Enter or button desktop, Shift+Enter newline), attach image, message hover/long-press menu (React/Delete; reactions per C1 note), group info. **States:** empty = "Say hello 👋" + prompt; loading = bubble skeletons; error = ErrorState + Retry; success = toasts for upload/delete/group edits; unread = divider + jump chip; upload progress/failed upload per A7; realtime incoming = auto-scroll near bottom or "New messages" chip. **A11y:** bubbles expose sender + time, live region for incoming/typing, `role="progressbar"` uploads, 44 px targets. **SRS:** F4, F5, F6, F7, F11, F13, F14.

### B9. New conversation dialog (overlay)

**Context:** Create direct or group chat. **Layout:** desktop centered modal (max-w-lg); mobile bottom sheet. **Tabs:** Direct / Group. **Direct:** user search + selectable rows → "Start chat" (primary). **Group:** title input (default "Group of N"), optional group image (FileDropzone), MemberPicker with "n/10" counter (10 incl. creator — proposed decision), "Create group" (primary). **States:** empty = "No users found"; loading = search skeletons; error = InlineAlert; success = dialog closes + navigates. **A11y:** labelled fields, `aria-modal`, Esc/backdrop close, focus returns to "+". **SRS:** F4.

### B10. Group info panel (overlay)

**Context:** View/edit group details. **Layout:** desktop right panel / mobile full-screen sheet; header "Group info" + close. **Content:** group image (editable, FileDropzone), title (inline editable — any member; proposed decision), member grid (AvatarStack + names, view-only), "Add members" (≤10 cap). **States:** loading = skeleton; error = InlineAlert + retry; success = toast "Group updated". **A11y:** dialog semantics, member names as text. **SRS:** F4, F13.

### B11. Story composer (`/story/create`)

**Context:** Publish a 24-hour photo story. **Layout:** centered card (mobile full-screen): dropzone → preview → caption → publish. **Hierarchy:** preview dominates; caption below. **Elements:** FileDropzone (drag/drop + browse), square-cropped preview, caption input (≤120 chars + counter — proposed decision), Publish (primary). **States:** empty = dropzone prompt; loading = cyan progress + percentage; error = invalid file/failed upload with Retry/Choose another; success = toast + return to inbox, tray updates. **A11y:** keyboard-operable dropzone, preview alt, progressbar role. **SRS:** F8.

### B12. Story viewer (`/stories/:userId`) + viewer list dialog

**Context:** Watch an author's active stories; records views. **Layout:** backdrop; desktop centered card (max-w-sm, 80vh, radius 16); mobile full-screen. **Hierarchy:** progress bars → image → top bar → caption. **Elements:** top bar (avatar + name + relative time + overflow menu with "Delete story" for own — proposed decision, "Seen by N" for owner), segmented StoryProgressBars (5 s per story — proposed decision), image object-contain, caption overlay with gradient scrim, tap zones (left/right 30%), prev/next controls, close. **Behavior:** auto-advance, pause on press/hover and reduced motion; view recorded after ~1 s visible (proposed decision); arrows/swipe/Esc navigation. **Viewer list dialog:** "Seen by N" (gold text) + scrollable avatar+name rows, newest first; empty = "No views yet". **States:** loading = skeleton + spinner; error = "Couldn't load story" + Retry/Close. **A11y:** `aria-modal`, arrows + Esc documented, caption read aloud, timer conveyed as text for screen readers. **SRS:** F8, F9, F10.

### B13. Profile (`/profile`)

**Context:** Edit own profile. **Layout:** centered card (max-w-md) inside AppShell. **Hierarchy:** avatar → display name → save. **Elements:** 56 px avatar + "Change avatar" (FileDropzone, optional), display name input (2–40 chars), Save (primary). **States:** loading = skeleton; error = InlineAlert; success = toast "Profile saved". **A11y:** labelled fields, alt text, keyboard-operable uploader. **SRS:** F2, F13.

### B14. Settings (`/settings`)

**Context:** App preferences + sign out. **Layout:** centered card (max-w-md). **Elements:** "Appearance" section with functional segmented control System/Light/Dark (all three designed; default System — proposed decision), "Sign out" (destructive), "Change password" link (→ `/recover`). **States:** loading = skeleton; error = InlineAlert; success = toast "Preference saved". **A11y:** segmented control with radio semantics, visible focus. **SRS:** F2, F12.

### B15. 404 (catch-all)

**Context:** Unknown route. **Layout:** centered panel. **Elements:** "Page not found" (H1), caption, button to `/inbox` (or `/` for guests). Clear error state per F12. **SRS:** F12.

---

## Part C — SRS Coverage and Proposed Decisions

### C1. Requirement coverage

| SRS requirement | Visual representation | Screen(s) |
|---|---|---|
| 1. React/TS reusable components | Part A5 component library with variants; consistent usage across screens | All |
| 2. Auth + profile setup | B2–B6, B13–B14; avatar uploader, name editor, sign out | All auth/profile screens |
| 3. Conversation inbox | B7; tray + list ordered by latest activity, preview, timestamp, unread, participants | `/inbox` |
| 4. Direct & small groups ≤10 | B9, B10; direct/group creation, title/image/members, add members | Dialog + panel |
| 5. Real-time text messaging | B8; bubbles, composer, live append, timestamps, upward pagination | `/conversation/:id` |
| 6. Image messages | B8 + A7; attach → validate → progress → success/failure | `/conversation/:id` |
| 7. Message state & ownership | B7–B8; unread badge + divider, delete own only, "Message deleted" placeholder | `/inbox`, `/conversation/:id` |
| 8. Stories 24 h expiry | B11, B12; composer + tray + viewer; expiry enforced by data (no expired UI) | `/story/create`, `/inbox` |
| 9. Story tray & viewer | B7, B12; tray, progress, prev/next, keyboard + touch | `/inbox`, `/stories/:userId` |
| 10. Story view tracking | B12; seen ring, viewer count, viewer list (owner only) | `/stories/:userId` |
| 11. Search & unread navigation | B7–B8; grouped search results, unread badges, jump-to-unread chip | `/inbox`, `/conversation/:id` |
| 12. Responsive & accessible | A6–A8; skeletons, retry, empty/error states, keyboard/focus/contrast | All |
| 13. Security & privacy rules | No dedicated screen (backend policy); visual effects: member-only access, non-members see 404/error state, delete/modify controls only on own content | Error states, B8, B10, B13 |
| 14. Extra features (typing + reactions) | TypingIndicator in B8; reaction picker/row below | `/conversation/:id` |

**Reactions (extra feature, from UX Plan §12):** hover/long-press on a bubble opens a compact emoji picker (👍 ❤️ 😂 😮 😢 🙏 — proposed decision); reacting toggles; reaction row under the bubble shows counts, own reaction highlighted with a cyan ring; tapping the row opens a "Who reacted" dialog (avatar + name list). Realtime updates reflected visually. Reuses MessageBubble, DropdownMenu, Modal, AvatarStack, Badge, Tooltip.

### C2. Proposed design decisions (not SRS requirements)

The following come from the UX Plan/this brief and are **proposed, not required**: dual-theme (light + dark) design with the mandated core palette — the palette hexes supersede the UX Plan §9 values, and non-core colors (white, dark neutrals, semantic red/emerald/amber, grays) are permitted with moderation for states and light mode; image types JPEG/PNG/WebP ≤5 MB; message text ≤2000 chars; story captions ≤120 chars; group cap = 10 members including creator; unread clears on opening a conversation (divider + jump chip cover navigation); deleted messages render as "Message deleted" placeholders; stories auto-advance every 5 s and are "seen" after ~1 s; no email-verification step; fixed six-emoji reaction set; typing indicator hides after 3 s idle; story deletion limited to own stories; any member may edit group title/image and add members (no member removal); theme defaults to System with manual Light/Dark override.

### C3. Stitch usage notes

1. Paste Part A once as the global style foundation (both themes).
2. Generate/iterate screens one at a time using each Part B block; each is self-contained but assumes Part A tokens/components.
3. Produce **light and dark frames for every screen** (theme = token swap; layout identical). B7 and B8 additionally need desktop + mobile frames; all other screens use a single responsive frame set.
4. Deliver every state named in A7 for each screen where it applies (loading, empty, error, success, unread, upload progress, failed upload).
5. Keep all non-core colors to moderation; never exceed the core palette's brand presence of cyan + gold.
