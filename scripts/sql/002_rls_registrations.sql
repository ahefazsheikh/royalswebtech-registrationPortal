alter table public.registrations enable row level security;

-- Allow anonymous inserts (public registration)
drop policy if exists "public_can_insert_registrations" on public.registrations;
create policy "public_can_insert_registrations"
on public.registrations for insert
to anon
with check (true);

-- Only authenticated users (admin) can select all
drop policy if exists "authenticated_can_read_registrations" on public.registrations;
create policy "authenticated_can_read_registrations"
on public.registrations for select
to authenticated
using (true);

-- Only authenticated users can update check-in/status
drop policy if exists "authenticated_can_update_checkin" on public.registrations;
create policy "authenticated_can_update_checkin"
on public.registrations for update
to authenticated
using (true)
with check (true);
