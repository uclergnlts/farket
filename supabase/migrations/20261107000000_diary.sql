-- Farket Takip (diary app), phase 1: dated observation notes and per-user settings.
-- The app writes locally first and syncs here, so rows carry client-made ids and a
-- soft-delete column (a note deleted offline still has to reach the server).

create table public.diary_entries (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  entry_date date not null,
  body text not null check (char_length(body) between 1 and 1000),
  frequency text not null check (frequency in ('once', 'few', 'daily')),
  kind text not null check (kind in ('concern', 'positive')),
  category text check (category in (
    'social', 'name', 'joint', 'speech', 'play', 'repetitive', 'sensory', 'routine'
  )),
  regression boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index on public.diary_entries (child_id, entry_date desc);
create index on public.diary_entries (user_id);

-- One row per user: language, reminder and the consent they gave (GDPR/LGPD/KVKK record).
create table public.diary_profiles (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  language text not null check (language in ('en', 'es', 'ar', 'pt', 'fr', 'tr')),
  reminder_hour smallint check (reminder_hour between 0 and 23),
  reminder_minute smallint check (reminder_minute between 0 and 59),
  consent_at timestamptz,
  consent_version text,
  updated_at timestamptz not null default now()
);

alter table public.diary_entries enable row level security;
alter table public.diary_profiles enable row level security;

create policy "own diary entries" on public.diary_entries
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.children c where c.id = child_id and c.user_id = (select auth.uid()))
  );

create policy "own diary profile" on public.diary_profiles
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
