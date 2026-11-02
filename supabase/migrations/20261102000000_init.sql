-- Farket initial schema: children, screenings, reports, purchases.
-- Every row belongs to the signed-in user; RLS keeps users to their own data.

create table public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 40),
  birth_year smallint not null,
  birth_month smallint not null check (birth_month between 1 and 12),
  gestation_weeks smallint not null default 40 check (gestation_weeks between 22 and 44),
  created_at timestamptz not null default now()
);

create table public.screenings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  age_months smallint not null check (age_months between 6 and 48),
  question_version text not null,
  answers jsonb not null,
  risk text not null check (risk in ('low', 'medium', 'high')),
  ratio real not null,
  regression boolean not null default false,
  top_domains jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  screening_id uuid not null references public.screenings(id) on delete cascade,
  kind text not null check (kind in ('short', 'detailed')),
  language text not null,
  content text not null,
  model text not null,
  created_at timestamptz not null default now(),
  unique (screening_id, kind, language)
);

-- Written only by the server after store receipt verification (step 3).
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  screening_id uuid not null references public.screenings(id) on delete cascade,
  product text not null check (product in ('short_report', 'detailed_report')),
  platform text not null check (platform in ('ios', 'android')),
  transaction_id text not null unique,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index on public.children (user_id);
create index on public.screenings (user_id, created_at desc);
create index on public.screenings (child_id);
create index on public.reports (screening_id);
create index on public.reports (user_id);
create index on public.purchases (user_id, screening_id);
create index on public.purchases (screening_id);

alter table public.children enable row level security;
alter table public.screenings enable row level security;
alter table public.reports enable row level security;
alter table public.purchases enable row level security;

create policy "own children" on public.children
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own screenings select" on public.screenings
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own screenings insert" on public.screenings
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.children c where c.id = child_id and c.user_id = (select auth.uid()))
  );
create policy "own screenings delete" on public.screenings
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Reports and purchases are read-only for users; the server writes them.
create policy "own reports read" on public.reports
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own purchases read" on public.purchases
  for select to authenticated using ((select auth.uid()) = user_id);
