-- Web flow: parents pick an age range (not a birth date), the child's sex, and give an
-- email address for the free report. The screening is saved at the email step.
alter table public.children alter column birth_year drop not null;
alter table public.children alter column birth_month drop not null;
alter table public.children add column sex text check (sex in ('boy', 'girl', 'unspecified'));

alter table public.screenings add column age_range text;
alter table public.screenings add column email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
alter table public.screenings add column marketing_consent boolean not null default false;
alter table public.screenings add column language text;
alter table public.screenings add column email_sent_at timestamptz;
