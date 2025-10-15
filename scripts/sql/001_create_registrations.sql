create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  uid text not null unique,
  type text not null check (type in ('internship','job','inquiry','drive')),
  name text not null,
  email text not null,
  phone text not null,
  college text,
  degree text,
  graduation_year int,
  experience_years numeric,
  referred_by text,
  portfolio_url text,
  github_url text,
  skills text[],
  notes text,
  resume_url text,
  status text not null default 'registered',
  checked_in boolean not null default false,
  scanned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_registrations_uid on public.registrations (uid);
create index if not exists idx_registrations_created_at on public.registrations (created_at desc);

create function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_registrations_updated on public.registrations;
create trigger trg_registrations_updated
before update on public.registrations
for each row execute procedure public.set_updated_at();
