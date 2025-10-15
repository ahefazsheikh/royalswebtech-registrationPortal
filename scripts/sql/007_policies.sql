do $$
begin
  -- Anyone (anon) may insert a registration
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'registrations' and policyname = 'registrations_anon_insert'
  ) then
    create policy "registrations_anon_insert"
    on public.registrations
    for insert
    to anon
    with check (true);
  end if;

  -- Admins can select all registrations
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'registrations' and policyname = 'registrations_admin_select'
  ) then
    create policy "registrations_admin_select"
    on public.registrations
    for select
    to authenticated
    using (public.is_admin());
  end if;

  -- Admins can update (e.g., check-in, notes)
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'registrations' and policyname = 'registrations_admin_update'
  ) then
    create policy "registrations_admin_update"
    on public.registrations
    for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());
  end if;

  -- Admins can delete if needed (optional)
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'registrations' and policyname = 'registrations_admin_delete'
  ) then
    create policy "registrations_admin_delete"
    on public.registrations
    for delete
    to authenticated
    using (public.is_admin());
  end if;
end$$;
