<p align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" width="64" height="64">
    <rect width="32" height="32" rx="8" fill="#4f6ef7"/>
    <text x="7" y="23" font-family="monospace" font-size="18" font-weight="bold" fill="white">IO</text>
  </svg>
</p>

<h1 align="center">InterviewOS</h1>

<p align="center">
  <strong>AI-powered mock interview practice — pick a role, answer a real question, get structured feedback in seconds.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white" alt="Clerk">
  <img src="https://img.shields.io/badge/Groq-F55036?style=flat-square" alt="Groq">
  <img src="https://img.shields.io/badge/Vercel-black?style=flat-square&logo=vercel&logoColor=white" alt="Vercel">
  <img src="https://img.shields.io/badge/license-GPL--3.0-BCFF5E?style=flat-square" alt="License">
</p>

---

## What is InterviewOS?

InterviewOS is a self-paced mock interview tool for engineers, product managers, and data scientists who want structured feedback rather than a generic "good answer" from a practice partner. You pick a track, receive a real question drawn from your unanswered pool, type or speak your answer, and get a 1–10 score across three dimensions — correctness, clarity, and edge-case depth — with written justification per dimension. A dashboard tracks score trends over every session so you can see yourself improve across attempts.

> **Live demo →** [interviewos.vercel.app](https://interviewos.vercel.app)

---

## What you get

- **Voice input** — speak your answer via the browser's Web Speech API; the live transcript is editable before you submit
- **AI evaluation** — Groq runs `llama-3.3-70b-versatile` to score answers 1–10 on correctness, clarity, and edge-case handling, with written notes per dimension
- **Progress dashboard** — Recharts line chart of score trends, per-role filtering, and full attempt history with summaries
- **Smart question cycling** — already-answered questions are skipped automatically; cycles back when the pool is exhausted
- **Live results** — evaluation scores appear in real time via Supabase Realtime without a page reload

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 · App Router · Turbopack · TypeScript 7 |
| Auth | Clerk (custom UI — no Clerk pre-built components) |
| Database | Supabase Postgres |
| Realtime | Supabase Realtime (postgres_changes on evaluations) |
| AI | Groq — `llama-3.3-70b-versatile` |
| Voice | Web Speech API (browser-native) |
| Charts | Recharts |
| Styling | Tailwind CSS v4 |
| Validation | Zod (API inputs + LLM response schema) |
| Hosting | Vercel |

---

## Engineering Decisions

**Why Groq over the Anthropic API or OpenAI?**
Groq's inference latency on Llama 3.3-70b is consistently under 5 seconds for a 1 KB answer, which makes the evaluation feel live rather than batched. The free tier is sufficient for a portfolio demo without burning API credits on every visitor.

**Why Supabase Realtime instead of polling?**
Polling would add unnecessary load and feel laggy. Supabase's `postgres_changes` channel fires immediately on `INSERT` to `evaluations`, so the score panel appears while the HTTP response is still in-flight — both paths race and the first one wins, preventing a double-render via a `scoredRef` guard.

**Why Clerk over Supabase Auth?**
Clerk gives better session UX with zero effort and a cleaner token model. The tradeoff is that Supabase's RLS can't use `auth.uid()` directly — Clerk JWTs are passed into Supabase Realtime via `setAuth()`, and a `supabase` JWT template ensures `auth.jwt() ->> 'sub'` returns the Clerk user ID in policies.

**What would you do differently in v2?**
Add server-sent evaluations (streaming) so the score card builds incrementally. Also replace the ad-hoc question pool with a curriculum system that surfaces weak-dimension questions first — the data is already in the dashboard but not yet used to drive question selection.

---

## Docs

| Document | Description |
|---|---|
| [PRD](docs/PRD.md) | Product requirements — goals, user stories, non-goals |
| [Architecture](docs/ARCHITECTURE.md) | System design, data flow, component breakdown |
| [Decisions](docs/DECISIONS.md) | Every major technical decision and why |
| [Setup](docs/SETUP.md) | Local dev setup, env vars, deployment |

---

## Author

**Tanish Poddar** — [tanisheesh.in](https://tanisheesh.in) · [LinkedIn](https://linkedin.com/in/tanisheesh) · [GitHub](https://github.com/tanisheesh)
