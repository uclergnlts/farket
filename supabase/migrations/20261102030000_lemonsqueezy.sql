-- Web payments through Lemon Squeezy: purchases come from the website, and the paid
-- detailed report is emailed once.
alter table public.purchases drop constraint purchases_platform_check;
alter table public.purchases add constraint purchases_platform_check
  check (platform in ('ios', 'android', 'test', 'web'));
alter table public.screenings add column detailed_sent_at timestamptz;
