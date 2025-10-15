-- bring registrations table in sync with current API payload; all operations are idempotent
alter table public.registrations
  add column if not exists degree text,
  add column if not exists graduation_year int,
  add column if not exists portfolio_url text,
  add column if not exists github_url text,
  add column if not exists skills text[],
  add column if not exists notes text,
  add column if not exists status text default 'registered';

-- Helpful composite index if you filter by type + created_at in admin
create index if not exists registrations_type_created_idx on public.registrations (type, created_at desc);
