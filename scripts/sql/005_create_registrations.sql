-- Core candidate registrations table
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  uid text unique not null,                         -- unique public identifier used in QR
  type text not null check (type in ('internship','job','inquiry','drive')),
  name text not null,
  phone text not null,
  email text not null,
  college text,
  experience_years integer,
  purpose text,
  referred_by text,
  resume_url text,
  created_at timestamptz not null default now(),
  checked_in_at timestamptz,
  admin_note text
);

-- Helpful indexes
create index if not exists registrations_email_idx on public.registrations (email);
create index if not exists registrations_phone_idx on public.registrations (phone);
create index if not exists registrations_uid_idx on public.registrations (uid);

-- RLS baseline (policies in a separate script)
alter table public.registrations enable row level security;
