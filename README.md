# Task & Note Manager

A personal task and quick-note app. React + Vite + TypeScript + Tailwind, with
Google sign-in and per-user data stored in Supabase (Postgres + Row Level
Security).

## Prerequisites

- Node 20+
- A [Supabase](https://supabase.com) project
- A Google Cloud OAuth 2.0 **Web** client

## Setup

### 1. Supabase project

Create a project (or add the Supabase integration from the Vercel Marketplace).
From **Project Settings → API** note the **Project URL** and the **`anon` /
publishable** key.

### 2. Database schema

In the Supabase **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql).
It creates the `tasks` and `notes` tables and their RLS policies. It's
re-runnable.

### 3. Google OAuth

1. In [Google Cloud Console](https://console.cloud.google.com) → **APIs &
   Services → Credentials** → create an **OAuth client ID** (Web application).
2. **Authorized redirect URIs**: `https://<project-ref>.supabase.co/auth/v1/callback`
3. **Authorized JavaScript origins**: `http://localhost:5173` and your deployed
   origin(s).
4. In the Supabase dashboard → **Authentication → Providers → Google**: enable
   it and paste the client ID + secret.
5. Supabase → **Authentication → URL Configuration**: set the Site URL and add
   `http://localhost:5173` (plus deployed/preview URLs) to **Redirect URLs**.

### 4. Environment variables

```bash
cp .env.example .env.local
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Both are safe to
expose in client code; RLS protects the data.

### 5. Run

```bash
npm install
npm run dev
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | oxlint |
| `npm run preview` | Serve the production build locally |

## Notes

- Any tasks/notes left in `localStorage` by an earlier (offline) version are
  imported into your account once, on first sign-in.
- The app requires connectivity — there is no offline mode.
