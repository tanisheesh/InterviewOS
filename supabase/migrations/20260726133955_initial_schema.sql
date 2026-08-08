-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── questions ────────────────────────────────────────────────
create table if not exists public.questions (
  id               uuid primary key default gen_random_uuid(),
  role             text not null check (role in ('sde', 'pm', 'data')),
  category         text not null,
  difficulty       text not null check (difficulty in ('easy', 'medium', 'hard')),
  prompt_text      text not null,
  expected_concepts text[] not null default '{}',
  created_at       timestamptz not null default now()
);

-- ─── attempts ─────────────────────────────────────────────────
create table if not exists public.attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  question_id  uuid not null references public.questions(id) on delete cascade,
  answer_text  text not null,
  input_mode   text not null check (input_mode in ('text', 'voice')),
  created_at   timestamptz not null default now()
);

-- ─── evaluations ──────────────────────────────────────────────
create table if not exists public.evaluations (
  id                  uuid primary key default gen_random_uuid(),
  attempt_id          uuid not null unique references public.attempts(id) on delete cascade,
  correctness_score   int not null check (correctness_score between 1 and 10),
  clarity_score       int not null check (clarity_score between 1 and 10),
  edge_case_score     int not null check (edge_case_score between 1 and 10),
  justification       jsonb not null default '{}',
  overall_summary     text not null,
  created_at          timestamptz not null default now()
);

-- ─── indexes ──────────────────────────────────────────────────
create index if not exists attempts_user_id_idx       on public.attempts(user_id);
create index if not exists attempts_question_id_idx   on public.attempts(question_id);
create index if not exists evaluations_attempt_id_idx on public.evaluations(attempt_id);
create index if not exists questions_role_idx         on public.questions(role);

-- ─── Row Level Security ────────────────────────────────────────
alter table public.questions   enable row level security;
alter table public.attempts    enable row level security;
alter table public.evaluations enable row level security;

create policy "Authenticated users can read questions"
  on public.questions for select
  to authenticated
  using (true);

create policy "Users can insert their own attempts"
  on public.attempts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can read their own attempts"
  on public.attempts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read evaluations for their attempts"
  on public.evaluations for select
  to authenticated
  using (
    exists (
      select 1 from public.attempts a
      where a.id = attempt_id
        and a.user_id = auth.uid()
    )
  );

-- service_role bypasses RLS automatically; insert goes through admin client server-side
create policy "Service role can insert evaluations"
  on public.evaluations for insert
  to service_role
  with check (true);

-- Enable realtime on evaluations for live score updates
alter publication supabase_realtime add table public.evaluations;
