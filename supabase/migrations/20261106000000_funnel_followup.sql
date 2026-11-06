-- Funnel: one row per step a visitor reaches (home start, age, sex, each question, email,
-- result). No answers, no email, no IP: only a random per-tab id, the language and the step.
create table public.funnel_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visit text not null check (length(visit) between 8 and 64),
  lang text check (lang in ('en', 'es', 'ar')),
  step text not null check (step in ('age', 'sex', 'quiz', 'email', 'done', 'offer')),
  question int check (question between 1 and 100)
);
alter table public.funnel_events enable row level security;
create policy "anyone can add funnel steps" on public.funnel_events
  for insert to anon, authenticated with check (true);
-- No select policy: only the service role (dashboard, SQL) reads it.

-- Follow-up email: one reminder to parents who agreed to receive tips, sent once.
alter table public.screenings add column followup_sent_at timestamptz;
