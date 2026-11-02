-- Purchases become report credits: RevenueCat's webhook records a purchase without a
-- screening; the report function attaches it to a screening when the report is made.
alter table public.purchases alter column screening_id drop not null;
alter table public.purchases drop constraint purchases_platform_check;
alter table public.purchases add constraint purchases_platform_check
  check (platform in ('ios', 'android', 'test'));
alter table public.purchases add column environment text not null default 'PRODUCTION';
alter table public.purchases add column refunded boolean not null default false;
alter table public.purchases add column price_usd numeric(10, 2);

create index purchases_unused_idx on public.purchases (user_id, product)
  where screening_id is null and verified and not refunded;
