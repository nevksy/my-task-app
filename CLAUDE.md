# CLAUDE.md

## Stack

React + Vite + TypeScript + Tailwind CSS. Auth and data via **Supabase**
(`@supabase/supabase-js`), server state via **React Query** (`@tanstack/react-query`).

## Build verification

Always run `npm run build` and `npm run lint` after completing changes, and fix
any errors before considering the work done.

## Authentication

Sign-in is **required** to use the app. The only provider is **Google OAuth**,
handled by Supabase Auth. The session lives in `localStorage` (managed by
`supabase-js`) and is exposed through `src/auth/` (`AuthProvider`, `useAuth`).
`src/App.tsx` gates the whole UI: no session → `<SignInScreen>`.

## Data storage

All tasks and notes live in **Supabase Postgres**, one row per item, scoped to
the signed-in user by a `user_id` column.

- **Row Level Security is the authorization boundary.** Every table has RLS
  policies (`auth.uid() = user_id`); the anon/publishable key in the client
  grants nothing beyond what those policies allow. Never disable RLS, and never
  rely on client-side checks for isolation.
- The browser talks to Supabase's REST endpoint directly (`supabase.from(...)`).
  There is **no custom API server** and no serverless functions — keep it that
  way unless the plan explicitly changes it.
- Schema lives in `supabase/schema.sql` (source of truth; re-runnable). Apply
  changes there and in the Supabase dashboard together.
- `localStorage` is now used only for: the Supabase session, and a one-time
  legacy-data import (`src/lib/migrateLocalData.ts`, guarded by the
  `taskapp.migrated` flag).

## Environment

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required (see
`.env.example`). Both are safe to ship in the client bundle. Locally they live
in `.env.local`; on Vercel they're set per-environment. Missing values throw at
startup (`src/lib/supabase.ts`).
