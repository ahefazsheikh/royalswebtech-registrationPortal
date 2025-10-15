create table if not exists public.admin_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_emails enable row level security;

-- authenticated can read (used to verify admin role)
drop policy if exists "authenticated_can_read_admins" on public.admin_emails;
create policy "authenticated_can_read_admins"
on public.admin_emails for select
to authenticated
using (true);

-- No insert/update/delete policies here (service role bypasses RLS for setup)
