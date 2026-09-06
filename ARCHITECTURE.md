# Architecture Plan — Task & Note Manager

Implementation plan for the features in `PRD.md`. No code changes yet — this is
the design to build against.

---

## 1. Guiding constraints (from PRD.md / CLAUDE.md)

- No backend, no auth, no network calls — `localStorage` is the only store.
- Small, single-user app → **no external state library** (Redux/Zustand/Jotai
  would be over-engineering here). Plain `useState` + a couple of custom hooks
  is enough and keeps the bundle honest.
- No markdown parser dependency. PRD 2.2 only requires that markdown text is
  "preserved verbatim" — it does not require rendering markdown to HTML. MVP
  displays notes as plain, whitespace-preserving text. (Flagged as a explicit
  decision below in §7.)
- Search matches **task titles and note content only** (PRD 2.3, literal
  wording) — priority is not a search field.
- `npm run build` (`tsc -b && vite build`) must pass with zero errors after
  every change, per `CLAUDE.md`.

---

## 2. File/folder structure

```
src/
  types.ts                   Task, Note, Priority types + type guards
  lib/
    storage.ts                Generic safe localStorage get/set + storage keys
  hooks/
    useLocalStorageState.ts   Generic hook: React state synced to localStorage
    useTasks.ts                Task state + add/toggle/delete actions
    useNotes.ts                Note state + add/delete actions
  utils/
    id.ts                      generateId()
    text.ts                    sanitizeText() / isBlank() helpers
    search.ts                  matchesQuery() substring helper
  components/
    SearchBar.tsx
    EmptyState.tsx
    tasks/
      TaskForm.tsx
      TaskList.tsx
      TaskItem.tsx
      PriorityBadge.tsx
    notes/
      NoteForm.tsx
      NoteList.tsx
      NoteItem.tsx
  App.tsx                      Owns tasks/notes/search state, computes filtered views
  main.tsx
  index.css
```

Rationale: one concern per file, all under ~50–80 lines, no barrel files
(unneeded at this size), no context provider — `App.tsx` is small enough to
own state and pass props down directly.

---

## 3. Data structures (`src/types.ts`)

```ts
export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  createdAt: number; // epoch ms, Date.now()
}

export interface Note {
  id: string;
  content: string;
  createdAt: number; // epoch ms
}

// Runtime type guards — used when rehydrating from localStorage, where the
// stored value is untyped `unknown` and may be corrupt or hand-edited.
export function isTask(value: unknown): value is Task { /* ... */ }
export function isNote(value: unknown): value is Note { /* ... */ }
```

Why type guards matter here: `JSON.parse` returns `any`. Casting straight to
`Task[]` would let a corrupted or manually-edited storage blob crash the app
the first time we call `.title.toLowerCase()` on `undefined`. The guards let
the storage layer filter out anything malformed instead of trusting it.

**ID generation** (`utils/id.ts`): `crypto.randomUUID()` where available
(all target browsers in a Vite dev/HTTPS context), with a fallback for older
or non-secure contexts:

```ts
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
```

---

## 4. Persistence layer

### 4.1 `lib/storage.ts` — safe read/write primitives

```ts
export const STORAGE_KEYS = {
  tasks: 'taskapp.tasks',
  notes: 'taskapp.notes',
} as const;

export function readJSON<T>(key: string, fallback: T): T { /* try/catch JSON.parse, else fallback */ }
export function writeJSON<T>(key: string, value: T): void { /* try/catch JSON.stringify + setItem */ }
```

Both are wrapped in `try/catch`. Read failures (missing key, invalid JSON,
`localStorage` unavailable in a locked-down browser context) fall back to the
caller-supplied default rather than throwing. Write failures (Safari private
mode quota of 0, quota exceeded, storage disabled) are swallowed and logged
with `console.warn` — the app keeps working in-memory for the rest of the
session rather than crashing; per PRD non-goals there's no requirement to
surface a "storage unavailable" banner, so this stays silent-but-safe.

### 4.2 `hooks/useLocalStorageState.ts` — generic hook

```ts
function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  isValid?: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const stored = readJSON<unknown>(key, initialValue);
    return isValid && !isValid(stored) ? initialValue : (stored as T);
  });

  useEffect(() => {
    writeJSON(key, state);
  }, [key, state]);

  return [state, setState];
}
```

- Lazy initializer (`useState(() => ...)`) so `localStorage` is read exactly
  once, not on every render.
- Optional `isValid` guard is a coarse, whole-value shape check (e.g. "is this
  even an array?") run once at load time — it rejects the whole blob if it's
  the wrong shape entirely, not just when individual items are malformed.
  Finer-grained per-item filtering happens in the domain hooks below.
- Writes on every state change via `useEffect`, satisfying PRD 2.4 ("state is
  written on every mutation") without each call site needing to remember to
  persist manually.

### 4.3 Domain hooks — `useTasks.ts` / `useNotes.ts`

These wrap the generic hook and are the **only** place that constructs task
mutations, so every call site (forms, list items) uses the same
validation/id/timestamp logic.

```ts
function useTasks() {
  const [tasks, setTasks] = useLocalStorageState<Task[]>(
    STORAGE_KEYS.tasks,
    [],
    (v): v is Task[] => Array.isArray(v),
  );

  // Defensive per-item filter: drops any malformed entries a hand-edited
  // or partially-corrupted blob might contain, instead of crashing on render.
  const safeTasks = useMemo(() => tasks.filter(isTask), [tasks]);

  const addTask = (title: string, priority: Priority = 'medium') => {
    const clean = sanitizeText(title);
    if (isBlank(clean)) return; // PRD 2.1: reject empty/whitespace titles
    setTasks(prev => [
      ...prev,
      { id: generateId(), title: clean, priority, completed: false, createdAt: Date.now() },
    ]);
  };

  const toggleTask = (id: string) =>
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const deleteTask = (id: string) =>
    setTasks(prev => prev.filter(t => t.id !== id));

  return { tasks: safeTasks, addTask, toggleTask, deleteTask };
}
```

`useNotes.ts` mirrors this with `addNote(content)` / `deleteNote(id)`, sorting
newest-first at read time (`[...notes].sort((a, b) => b.createdAt - a.createdAt)`)
so insertion order in storage doesn't matter and the sort is enforced in one
place. Tasks are **not** re-sorted on toggle — PRD 2.1 says completed tasks
"stay visible... rather than hidden," which I read as also meaning they don't
jump around the list when checked. Default task order: insertion order
(oldest first), matching "Add a task" reading top-to-bottom as a running log.

Rejecting empty/blank input happens **twice** by design: the form disables
its submit button on blank input (UX affordance), and `addTask`/`addNote`
re-validate before writing (defense against a bypassed disabled state — e.g.
pasting whitespace and hitting Enter on some browsers, or the button state
lagging one keystroke behind, or a future call site that skips the form
entirely).

---

## 5. Search architecture

State lives in `App.tsx`, not in a hook — it's transient UI state, not data to
persist:

```ts
const [query, setQuery] = useState('');
const trimmedQuery = query.trim().toLowerCase();

const filteredTasks = useMemo(
  () => (trimmedQuery ? tasks.filter(t => t.title.toLowerCase().includes(trimmedQuery)) : tasks),
  [tasks, trimmedQuery],
);
const filteredNotes = useMemo(
  () => (trimmedQuery ? notes.filter(n => n.content.toLowerCase().includes(trimmedQuery)) : notes),
  [notes, trimmedQuery],
);
```

`utils/search.ts` exports the one-line `matchesQuery(haystack, query)` used by
both filters so the matching rule (trim, lowercase, substring) is defined
exactly once. `useMemo` avoids re-filtering on every unrelated re-render (e.g.
toggling a task shouldn't re-run the notes filter).

Edge cases:
- Empty/whitespace-only query → both lists return unfiltered (falsy check on
  `trimmedQuery`, so a query of `"   "` behaves identically to `""`).
- No matches in one section only → that section renders its own `EmptyState`
  ("No tasks match \"x\"") while the other section still shows its results,
  per PRD 2.3 ("that section shows an empty state rather than disappearing").
- No matches anywhere → both sections show their empty state; the search
  input itself is never cleared automatically.

---

## 6. Task Board components

**`TaskForm.tsx`**
- Controlled `<input>` for title + `<select>` for priority (`high` / `medium`
  / `low`, defaulting to `medium`).
- `onSubmit` calls `e.preventDefault()`, calls `addTask(title, priority)`,
  then clears the title field and returns focus to it (fast repeated entry).
- Submit button `disabled={isBlank(title)}` as an affordance; the real
  guard is still inside `addTask` (see §4.3).
- Enter key submits via native form submission — no extra key handler needed.

**`PriorityBadge.tsx`**
- Small presentational component: `{ priority: Priority }` → colored pill.
  Color mapping (Tailwind, with dark-mode variants):
  - `high` → red (`bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300`)
  - `medium` → amber
  - `low` → slate/gray
- Color alone never carries the meaning — the label text (`High`/`Medium`/
  `Low`) is always rendered too, for colorblind users and PRD's "colour
  and/or icon" wording.

**`TaskItem.tsx`**
- `<input type="checkbox">` bound to `completed`, calling `toggleTask(id)`.
- Title rendered with `line-through text-gray-400` classes when completed
  (PRD 2.1: muted + strikethrough, stays visible).
- Delete button using Lucide's `Trash2` icon, `aria-label="Delete task"`
  (icon-only buttons need an accessible name).
- `<PriorityBadge>` next to the title.

**`TaskList.tsx`**
- Maps `filteredTasks` to `TaskItem`s, keyed by `id`.
- Renders `<EmptyState>` when the array is empty — with **different copy**
  depending on whether the underlying list is empty ("No tasks yet — add one
  above") vs. filtered-to-empty by search ("No tasks match your search").
  This distinction is threaded through as a prop rather than guessed inside
  the component, since `TaskList` alone can't tell those two cases apart from
  an empty array.

---

## 7. Quick Notes components

**`NoteForm.tsx`**
- Controlled `<textarea>` (multi-line, since notes are markdown-friendly and
  markdown commonly spans lines) with a "Add note" submit button, same
  disabled-when-blank + preventDefault pattern as `TaskForm`.
- Submits on a button click, **not** on plain Enter (Enter/Shift+Enter must
  insert newlines in a textarea) — a `Cmd/Ctrl+Enter` keyboard shortcut is a
  nice-to-have addition, not required by PRD.

**`NoteItem.tsx`**
- Renders `content` inside an element with `whitespace-pre-wrap` so line
  breaks and spacing the user typed are preserved visually — this is the
  "markdown-friendly... preserved verbatim" requirement satisfied *without*
  adding a markdown-rendering dependency, which the PRD's tech stack table
  doesn't list. If real rendered markdown is wanted later, this is the single
  spot to swap in a renderer.
- Delete button (`Trash2`), same accessible-label pattern as `TaskItem`.

**`NoteList.tsx`** — same empty-state-copy split as `TaskList` (§6).

---

## 8. Top-level composition (`App.tsx`)

```
App
├─ SearchBar (value=query, onChange=setQuery)
└─ main (responsive grid: 1 col on mobile, 2 cols ≥ md, per PRD 2.5)
   ├─ section: TaskForm + TaskList
   └─ section: NoteForm + NoteList
```

`App` owns `useTasks()`, `useNotes()`, and `query`, computes
`filteredTasks`/`filteredNotes`, and passes data + callbacks down as props.
No Context API — with two sibling sections and one shared query string, prop
drilling is one level deep and stays simple to trace.

**`SearchBar.tsx`**: single `<input type="search">` with a Lucide `Search`
icon and a clear ("×") button shown only when `query` is non-empty (calls
`setQuery('')`, restoring the full view per PRD 2.3).

---

## 9. Edge cases checklist

| Case | Handling |
|---|---|
| Empty/whitespace title or note | Rejected in `addTask`/`addNote` (trim + blank check); submit button also disabled as UX affordance |
| Pasting only whitespace, or IME/composition quirks bypassing `disabled` | Still caught by the trim+blank check inside the hook, not just the form |
| Corrupted / hand-edited `localStorage` JSON | `readJSON` catches parse errors → falls back to `[]`; per-item `isTask`/`isNote` guards drop malformed entries individually |
| `localStorage` key absent (first visit) | `readJSON` returns the fallback (`[]`) |
| `localStorage` disabled or full (Safari private mode, quota exceeded) | `writeJSON` catches and warns to console; state still updates in memory for the session |
| Deleting the last task/note | List renders `EmptyState`, not a blank gap |
| Search matches nothing in one section only | That section alone shows its empty state; the other keeps rendering (PRD 2.3) |
| Search query is only whitespace | Treated as an empty query (trimmed before comparison) |
| Very long title/note text | No hard cap imposed (PRD doesn't specify one); layout wraps via Tailwind (`break-words`), textarea grows/scrolls naturally |
| Rapid successive adds | Each add is a pure state update + one storage write; no batching needed at this data scale |
| Two tabs open at once | **Known limitation, not solved in MVP**: each tab holds its own in-memory copy and last-write-wins on refresh. A `window.addEventListener('storage', ...)` cross-tab sync is a cheap future addition but isn't required by any PRD acceptance criterion, so it's deliberately deferred rather than adding untested complexity now |
| Toggling a completed task back to incomplete | Same `toggleTask`, fully symmetric — no separate "uncomplete" path |
| Dark mode | Tailwind v4's default `dark:` variant follows `prefers-color-scheme` automatically (no `tailwind.config.js` needed, no manual theme toggle in scope) — satisfies PRD 2.5 without extra state |

---

## 10. Build/verification plan

Per `CLAUDE.md`, run `npm run build` (`tsc -b && vite build`) after each
milestone below, not just at the end — catches type errors from the
`Task`/`Note` guards and prop types early.

**Suggested build order:**
1. `types.ts` + `lib/storage.ts` + `utils/` (id, text, search) — pure
   functions, no UI, cheapest to get right first.
2. `hooks/useLocalStorageState.ts`, then `useTasks`/`useNotes` on top of it.
3. Task Board: `PriorityBadge` → `TaskItem` → `TaskList` → `TaskForm`, wired
   into a temporary `App.tsx` to verify add/toggle/delete + persistence
   end-to-end before building Notes.
4. Quick Notes: `NoteItem` → `NoteList` → `NoteForm`, same pattern.
5. `SearchBar` + filtering wired into `App.tsx`.
6. `EmptyState` copy pass (four variants: tasks-empty, tasks-no-match,
   notes-empty, notes-no-match).
7. Responsive layout pass (375px / 1280px) + dark-mode visual check.
8. Final `npm run build` and manual walk through PRD §6's 8 acceptance
   criteria.

No test framework is in the current stack (none listed in PRD §4), so
verification here is manual-walkthrough + `tsc`'s type checking rather than
automated unit tests — consistent with keeping dependencies minimal for an
MVP. If that trade-off should change, that's worth a decision before coding
starts, not something to introduce unilaterally mid-build.
