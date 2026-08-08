# Local Setup — InterviewOS

> **Just want to try it?** Use the live demo at [interviewos.tanisheesh.in](https://interviewos.tanisheesh.in) — no setup needed.
> This guide is for running InterviewOS locally or self-hosting it.

---

## Prerequisites

- Node.js 20+
- npm (bundled with Node.js)
- A [Clerk](https://clerk.com) account (free tier is sufficient)
- A [Supabase](https://supabase.com) project (free tier is sufficient)
- A [Groq](https://console.groq.com) account with an API key (free tier)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for running migrations)

---

## 1. Clone and install

```bash
git clone https://github.com/tanisheesh/interviewos
cd interviewos
npm install
```

---

## 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [Clerk Dashboard](https://dashboard.clerk.com) → your app → API Keys |
| `CLERK_SECRET_KEY` | Same page — secret key below the publishable key |
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase Dashboard](https://supabase.com/dashboard) → your project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page — `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page — `service_role` key (keep server-side only) |
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com/keys) → API Keys → Create |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev; your Vercel URL in production |

---

## 3. Clerk JWT template (required for Supabase Realtime)

InterviewOS uses Clerk JWTs to authenticate Supabase Realtime subscriptions. You need to:

1. In the [Clerk Dashboard](https://dashboard.clerk.com), go to **Configure → JWT Templates → New template**.
2. Name it exactly `supabase`.
3. Set the following claims:
   ```json
   {
     "aud": "authenticated",
     "role": "authenticated"
   }
   ```
   Do **not** add `sub` — Clerk sets it automatically to the user's ID.
4. In the [Supabase Dashboard](https://supabase.com/dashboard), go to **Authentication → Sign In / Third-party Auth → Add provider → Clerk**.
5. Paste your Clerk domain (e.g. `https://relieved-husky-31.clerk.accounts.dev`).

---

## 4. Database setup

Link your Supabase project and run migrations:

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

This applies all three migrations in `supabase/migrations/` in order:
1. `20260726133955_initial_schema.sql` — creates `questions`, `attempts`, `evaluations` tables with RLS and Realtime enabled
2. `20260728172602_clerk_auth_migration.sql` — migrates `user_id` from UUID to text for Clerk compatibility
3. `20260729000001_users_table_and_rls.sql` — adds `users` table and tightens evaluations RLS to use Clerk JWT claims

After migrations, seed the question bank:

```bash
supabase db seed
```

(The seed file is at `supabase/seed.sql`.)

---

## 5. Run locally

```bash
npm run dev
```

InterviewOS will be running at `http://localhost:3000`.

The dev server uses Turbopack for fast refresh. Sign in, pick a role, and submit an answer to verify the full flow works.

---

## 6. Deploy to production (Vercel)

1. Push the repo to GitHub.
2. Create a new Vercel project linked to the repo.
3. In Vercel → Settings → Environment Variables, add all variables from `.env.local` (use your production Supabase URL and keys).
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL.
5. Deploy — Vercel auto-deploys on push to `main`.

---

## Known local-only limitations

- **Supabase Realtime** requires your Supabase project to have Realtime enabled for the `evaluations` table (applied by migration 1 via `alter publication supabase_realtime add table public.evaluations`). If you're using a local Supabase instance (`supabase start`), Realtime should work; if it doesn't, the HTTP response from `/api/evaluate` serves as fallback automatically.
- **Web Speech API** requires a secure context (`https://`) or `localhost`. It will not work on an HTTP ngrok tunnel or a plain IP address.
- **Groq API** calls are made server-side; no local model is bundled. You need a valid `GROQ_API_KEY` for evaluations to work locally.
