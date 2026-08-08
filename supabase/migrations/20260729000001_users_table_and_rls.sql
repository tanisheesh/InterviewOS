-- ─── users table ──────────────────────────────────────────────────────────────
-- Stores one row per Clerk user so Supabase has a first-class users relation.
-- Populated via upsert in /api/attempt on every submission — no webhook needed.

create table if not exists public.users (
  id         text primary key,             -- Clerk user ID, e.g. 'user_2abc...'
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- Users can read their own row (used for future profile features)
create policy "Users can read their own record"
  on public.users for select
  using ((auth.jwt() ->> 'sub') = id);

-- Service role (admin client) upserts rows on each attempt submission
create policy "Service role can manage users"
  on public.users for all to service_role
  using (true) with check (true);

-- ─── Tighten evaluations RLS ──────────────────────────────────────────────────
-- BEFORE applying this migration you must configure Supabase to accept Clerk JWTs:
--   Supabase Dashboard → Authentication → Sign In / Third-party Auth
--   → Add provider → Clerk → paste your Clerk domain
--   (e.g. https://relieved-husky-31.clerk.accounts.dev)
-- Then create a Clerk JWT Template named "supabase" with claims:
--   { "aud": "authenticated", "role": "authenticated" }
--   NOTE: do NOT add "sub" — Clerk sets it automatically to user.id (it is a reserved claim).
-- Once configured, auth.jwt() ->> 'sub' returns the Clerk user ID in RLS policies.

drop policy if exists "Anyone can read evaluations" on public.evaluations;

create policy "Users can read evaluations for their own attempts"
  on public.evaluations for select
  using (
    exists (
      select 1 from public.attempts a
      where a.id = evaluations.attempt_id
        and a.user_id = (auth.jwt() ->> 'sub')
    )
  );
