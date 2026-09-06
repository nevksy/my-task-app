# PRD — Task & Note Manager (MVP)

## 1. Core Purpose

A clean, responsive personal productivity web app that lets a single user manage
tasks and quick notes in one unified view. Everything lives in the browser: no
accounts, no backend, no setup. Open the page, start capturing work, refresh
freely.

**Primary user:** one person managing their own day.
**Success looks like:** capturing a task or note takes seconds, finding one takes
a keystroke, and nothing is ever lost on reload.

---

## 2. In-Scope Features

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

- All tasks and notes are persisted to the browser's `localStorage`.
- State is written on every mutation (add, toggle, delete).
- State is rehydrated on app load; a page refresh never loses data.
- Malformed or absent stored data falls back to an empty state without crashing.

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

- ❌ User authentication, login, signup, or account screens.
- ❌ Any external server, API, or hosted database — no Supabase, no Firebase, no
  backend of any kind.
- ❌ Calendar views, scheduling, due-date reminders, or notifications.

---

## 4. Technology Stack

| Layer      | Choice                      |
| ---------- | --------------------------- |
| Framework  | React                       |
| Build tool | Vite                        |
| Language   | TypeScript                  |
| Styling    | Tailwind CSS                |
| Icons      | `lucide-react`              |
| Storage    | Browser `localStorage`      |

---

## 5. Data Model

```ts
type Priority = 'high' | 'medium' | 'low';

type Tag = 'work' | 'personal' | 'urgent';

interface Task {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  createdAt: number; // epoch ms
  tag?: Tag; // optional; undefined means untagged
}

interface Note {
  id: string;
  content: string;
  createdAt: number; // epoch ms
}
```

Suggested `localStorage` keys: `taskapp.tasks`, `taskapp.notes`.

---

## 6. Acceptance Criteria

1. A task can be added with a title and priority, and appears immediately in the
   task list.
2. Clicking a task's checkbox toggles its completed state and the change survives
   a refresh.
3. Deleting a task or note removes it permanently from view and from
   `localStorage`.
4. A note can be added and its markdown text is preserved exactly as entered.
5. Typing in the search bar filters both the task list and the note list in the
   same keystroke.
6. After a full page refresh, all tasks (including completion state) and all
   notes are restored.
7. The app renders correctly and readably at both mobile (~375px) and desktop
   (~1280px) widths.
8. No network requests are made to any external service at runtime.
9. A task can be given or re-assigned a tag; selecting a tag in the filter
   narrows the task list to that tag, combines with the search text (AND), and
   the assigned tags survive a page refresh.
