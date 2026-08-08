-- Migrate from Supabase Auth to Clerk
-- user_id changes from uuid (auth.users FK) to text (Clerk user IDs like 'user_2abc...')

-- 1. Drop old Supabase-auth-based RLS policies FIRST (they reference user_id)
DROP POLICY IF EXISTS "Users can insert their own attempts"           ON public.attempts;
DROP POLICY IF EXISTS "Users can read their own attempts"             ON public.attempts;
DROP POLICY IF EXISTS "Users can read evaluations for their attempts" ON public.evaluations;
DROP POLICY IF EXISTS "Authenticated users can read questions"        ON public.questions;

-- 2. Drop FK constraint to auth.users
ALTER TABLE public.attempts DROP CONSTRAINT IF EXISTS attempts_user_id_fkey;

-- 3. Change user_id column type to text (Clerk IDs are like 'user_2abc...')
ALTER TABLE public.attempts ALTER COLUMN user_id TYPE text;

-- 4. New policies:
--    - Server-side uses admin/service-role client (bypasses RLS) — security enforced via Clerk
--    - Client-side Realtime needs anon SELECT on evaluations for live score updates
CREATE POLICY "Anyone can read questions"   ON public.questions   FOR SELECT USING (true);
CREATE POLICY "Anyone can read evaluations" ON public.evaluations FOR SELECT USING (true);
