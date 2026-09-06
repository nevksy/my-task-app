-- Task & Note Manager — Supabase schema
-- Run this in the Supabase dashboard → SQL Editor (or via `supabase db push`).
-- Safe to re-run: guarded with "if not exists" / "drop policy if exists".

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title      text not null check (char_length(trim(title)) > 0),
  priority   text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  completed  boolean not null default false,
  tag        text check (tag in ('work', 'personal', 'urgent')),
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_id_created_at_idx
  on public.tasks (user_id, created_at);

alter table public.tasks enable row level security;

drop policy if exists "tasks: owner can select" on public.tasks;
create policy "tasks: owner can select" on public.tasks
  for select using (auth.uid() = user_id);

drop policy if exists "tasks: owner can insert" on public.tasks;
create policy "tasks: owner can insert" on public.tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists "tasks: owner can update" on public.tasks;
create policy "tasks: owner can update" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tasks: owner can delete" on public.tasks;
create policy "tasks: owner can delete" on public.tasks
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- notes
-- ---------------------------------------------------------------------------
create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  content    text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists notes_user_id_created_at_idx
  on public.notes (user_id, created_at desc);

alter table public.notes enable row level security;

drop policy if exists "notes: owner can select" on public.notes;
create policy "notes: owner can select" on public.notes
  for select using (auth.uid() = user_id);

drop policy if exists "notes: owner can insert" on public.notes;
create policy "notes: owner can insert" on public.notes
  for insert with check (auth.uid() = user_id);

drop policy if exists "notes: owner can delete" on public.notes;
create policy "notes: owner can delete" on public.notes
  for delete using (auth.uid() = user_id);
