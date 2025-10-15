-- Admin allowlist
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Security: only service role should insert into admins (no public policy by default)
alter table public.admins enable row level security;

-- Helper to check if current authenticated user is an admin by email from JWT
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.admins a
    where a.active = true
      and a.email = coalesce(nullif(current_setting('request.jwt.claims', true), '')::json->>'email', '')
  );
$$;

-- Allow admins to read the admin list (for admin UI if ever needed)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'admins' and policyname = 'admins_select_admins'
  ) then
    create policy "admins_select_admins"
    on public.admins
    for select
    to authenticated
    using (public.is_admin());
  end if;
end$$;
