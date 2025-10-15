-- 1) Extensions (safe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    CREATE EXTENSION pgcrypto;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    CREATE EXTENSION "uuid-ossp";
  END IF;
END$$;

-- 2) Enums (safe create)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'registration_type' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.registration_type AS ENUM ('internship','job','inquiry','drive');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'registration_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.registration_status AS ENUM ('new','reviewing','shortlisted','rejected','hired','checked_in');
  END IF;
END$$;

-- 3) registrations table (safe create)
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid text UNIQUE NOT NULL,
  type public.registration_type NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  college text,
  degree text,
  graduation_year int,
  experience numeric,
  purpose text,
  resume_url text,
  referred_by text,
  portfolio_url text,
  github_url text,
  skills text[],
  notes text,
  status public.registration_status NOT NULL DEFAULT 'new',
  source text,
  drive_location text,
  drive_date date,
  checked_in boolean NOT NULL DEFAULT false,
  checkin_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4) Add any columns that might be missing (safe alters)
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS uid text,
  ADD COLUMN IF NOT EXISTS type public.registration_type,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS college text,
  ADD COLUMN IF NOT EXISTS degree text,
  ADD COLUMN IF NOT EXISTS graduation_year int,
  ADD COLUMN IF NOT EXISTS experience numeric,
  ADD COLUMN IF NOT EXISTS purpose text,
  ADD COLUMN IF NOT EXISTS resume_url text,
  ADD COLUMN IF NOT EXISTS referred_by text,
  ADD COLUMN IF NOT EXISTS portfolio_url text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS skills text[],
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS status public.registration_status NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS drive_location text,
  ADD COLUMN IF NOT EXISTS drive_date date,
  ADD COLUMN IF NOT EXISTS checked_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checkin_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- 5) Constraints and indexes (safe)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'public.registrations'::regclass AND conname = 'registrations_uid_unique'
  ) THEN
    ALTER TABLE public.registrations ADD CONSTRAINT registrations_uid_unique UNIQUE (uid);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS registrations_type_idx ON public.registrations(type);
CREATE INDEX IF NOT EXISTS registrations_status_idx ON public.registrations(status);
CREATE INDEX IF NOT EXISTS registrations_created_at_idx ON public.registrations(created_at);

-- 6) Admin allowlist + helper
CREATE TABLE IF NOT EXISTS public.admin_allowlist (
  user_id uuid UNIQUE,
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- function: is_admin(uid) SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_allowlist a WHERE a.user_id = uid
  ) OR EXISTS (
    SELECT 1
    FROM public.admin_allowlist a
    JOIN auth.users u ON a.email = u.email
    WHERE u.id = uid
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated;

-- 7) RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a registration
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'registrations_insert_any'
  ) THEN
    CREATE POLICY registrations_insert_any
      ON public.registrations
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Only admins can select/update/delete
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'registrations_select_admin'
  ) THEN
    CREATE POLICY registrations_select_admin
      ON public.registrations
      FOR SELECT
      TO authenticated
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'registrations_update_admin'
  ) THEN
    CREATE POLICY registrations_update_admin
      ON public.registrations
      FOR UPDATE
      TO authenticated
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'registrations_delete_admin'
  ) THEN
    CREATE POLICY registrations_delete_admin
      ON public.registrations
      FOR DELETE
      TO authenticated
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;
