# PRD — Task & Note Manager

## 1. Core Purpose

A clean, responsive personal productivity web app for managing tasks and quick
notes in one unified view. Each user signs in with Google and sees only their
own data, which is stored server-side (Supabase) and available from any device.

**Primary user:** an individual managing their own day.
**Success looks like:** capturing a task or note takes seconds, finding one takes
a keystroke, nothing is lost on reload, and no one but the owner can see it.

> **History:** the app began as a browser-only, `localStorage`-only tool with no
> accounts (see git history / `ARCHITECTURE.md`). Google SSO + a Supabase
> backend replaced that; §3 records what the reversal cost.

---

## 2. In-Scope Features

### 2.0 Authentication

- **Google SSO is the only sign-in method**, handled by Supabase Auth. No
  passwords, no email/password, no other providers.
- Sign-in is **required**: with no session the app shows only a sign-in screen;
  the task/note UI is not reachable.
- The session persists across reloads; signing out returns to the sign-in
  screen and clears the session.
- Every task and note belongs to exactly one user. A user can never read or
  write another user's rows — enforced by Postgres Row Level Security, not by
  client code.
- On a user's first sign-in, any tasks/notes left in `localStorage` by the
  pre-auth version are imported into their account once.

### 2.1 Task Board

- **Add a task** with a title and a priority of `High`, `Medium`, or `Low`.
- **Toggle completion** via a checkbox on each task.
- **Delete a task.**

Behaviour:

- Title is required; empty or whitespace-only submissions are rejected.
- Priority defaults to `Medium` if the user does not pick one.
- Completed tasks stay visible, visually de-emphasised (e.g. muted text,
  strikethrough) rather than hidden.
- Each task carries a stable unique id and a creation timestamp.

### 2.2 Quick Notes

- **Add a short note.** Content is markdown-friendly — the user may type
  markdown, and it is preserved verbatim on save.
- **Delete a note.**

Behaviour:

- Empty notes are rejected.
- Each note carries a stable unique id and a creation timestamp.
- Notes are ordered newest-first.

### 2.3 Task Tags

- Each task may carry **one optional tag** from a fixed set: `Work`,
  `Personal`, `Urgent`. A task can also be untagged.
- The tag is set when adding a task and can be changed on an existing task.
- A single-select **tag filter** above the task list narrows the list to one
  tag. Selecting "All" (or re-selecting the active tag) clears the filter.
- The tag filter and the search bar combine with **AND** — a task must satisfy
  both. The tag filter affects only the task list, not notes.
- Tags are visually distinguishable at a glance (colour + always-visible
  label), and their colours do not collide with the priority colours.

### 2.4 Search Bar

- A single live filter input that searches **tasks and notes simultaneously**.
- Filtering is case-insensitive substring matching against task titles and note
  content.
- Results update as the user types — no submit button, no debounce requirement.
- Clearing the input restores the full unified view.
- When a query matches nothing in a section, that section shows an empty state
  rather than disappearing.

### 2.5 Persistence

- All tasks and notes are stored in **Supabase Postgres**, one row per item,
  scoped to the owner by a `user_id` column.
- Every mutation (add, toggle, tag, delete) is written to the database. The UI
  updates optimistically and reconciles with the server response.
- On load, the signed-in user's tasks and notes are fetched fresh; a refresh
  never loses data.
- A failed load shows an inline error rather than crashing; a failed mutation
  rolls the optimistic change back.
- The app requires connectivity — there is no offline mode.

### 2.6 Design

- Modern, minimalist interface built with **Tailwind CSS**.
- Clear light/dark contrast; the layout must remain legible in both.
- **Lucide** icons for actions (add, delete, search, priority indicators).
- Responsive: usable single-column on mobile, comfortable multi-column or
  side-by-side task/note layout on desktop.
- Priority is visually distinguishable at a glance (colour and/or icon).

---

## 3. Explicit Non-Goals

The following are **out of scope** and must not be built:

- ❌ Sign-in methods other than Google SSO (email/password, magic links, other
  OAuth providers).
- ❌ A custom API server or serverless functions — the client talks to Supabase
  directly; RLS is the security boundary.
- ❌ Sharing, collaboration, or multi-user access to the same task/note.
- ❌ Offline mode / local-first sync.
- ❌ Calendar views, scheduling, due-date reminders, or notifications.

**Reversed from the original PRD:** "no authentication" and "no backend of any
kind" were founding constraints. Google SSO + Supabase deliberately overturned
both. The cost: the app now requires network connectivity and two external
accounts (Supabase, Google Cloud), and it is no longer a zero-setup static page.

---

## 4. Technology Stack

| Layer       | Choice                              |
| ----------- | ----------------------------------- |
| Framework   | React                               |
| Build tool  | Vite                                |
| Language    | TypeScript                          |
| Styling     | Tailwind CSS                        |
| Icons       | `lucide-react`                      |
| Auth        | Supabase Auth (Google OAuth)        |
| Data store  | Supabase Postgres + Row Level Security |
| Server state| `@tanstack/react-query`             |
| Hosting     | Vercel (static SPA)                 |

---

## 5. Data Model

Client-side shapes (`src/types.ts`) — the hooks map Supabase rows to these:

```ts
type Priority = 'high' | 'medium' | 'low';
type Tag = 'work' | 'personal' | 'urgent';

interface Task {
  id: string;          // uuid (Postgres-generated)
  title: string;
  priority: Priority;
  completed: boolean;
  createdAt: number;   // epoch ms, derived from DB created_at
  tag?: Tag;           // undefined means untagged
}

interface Note {
  id: string;          // uuid
  content: string;
  createdAt: number;   // epoch ms, derived from DB created_at
}
```

Database (`supabase/schema.sql`) — `public.tasks` and `public.notes`, each with
`id uuid`, `user_id uuid not null default auth.uid() references auth.users`,
`created_at timestamptz`, plus the domain columns (`tag` / `priority` values
enforced by `check` constraints). RLS enabled on both; policies allow a row only
when `auth.uid() = user_id`.

`localStorage` keys still referenced: `taskapp.tasks` / `taskapp.notes` (legacy,
read once by the migration) and `taskapp.migrated` (migration-done flag).

---

## 6. Acceptance Criteria

1. Visiting the app with no session shows only the sign-in screen; the
   task/note UI cannot be reached.
2. Signing in with Google lands the user on the app with their own tasks/notes
   and their name/avatar in the header; signing out returns to the sign-in
   screen and a refresh stays signed out.
3. A task can be added with a title and priority and appears immediately; the
   change is written to the database.
4. Toggling a task's checkbox and re-assigning its tag both persist across a
   refresh.
5. Deleting a task or note removes it permanently from view and from the
   database.
6. A note can be added and its markdown text is preserved exactly as entered.
7. Typing in the search bar filters both lists in the same keystroke; selecting
   a tag chip narrows the task list and combines with the search text (AND).
8. After a full page refresh, the signed-in user's tasks (including completion
   state and tags) and notes are all restored from the server.
9. A second user signing in sees none of the first user's data; a direct
   database read for another user's rows returns nothing.
10. Any tasks/notes present in `localStorage` from the pre-auth version are
    imported into the account once on first sign-in, with no duplicates on
    subsequent loads.
11. The app renders correctly and readably at both mobile (~375px) and desktop
    (~1280px) widths.
