-- Dopamine cloud backup: one private row per user.
-- Run once in the Supabase SQL Editor.
create table if not exists public.user_backups (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.user_backups enable row level security;

create policy "select own" on public.user_backups for select using (auth.uid() = user_id);
create policy "insert own" on public.user_backups for insert with check (auth.uid() = user_id);
create policy "update own" on public.user_backups for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on public.user_backups for delete using (auth.uid() = user_id);
