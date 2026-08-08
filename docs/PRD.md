# InterviewOS — Product Requirements Document

**Status:** Final
**Owner:** Tanish Poddar
**One-liner:** AI-powered mock interview practice — pick a role, answer a real question, get structured feedback in seconds.

---

## 1. Problem

Developers, PMs, and data scientists preparing for interviews have no reliable way to get structured, consistent feedback on open-ended answers. Practice partners are scarce and subjective; LeetCode-style platforms ignore communication quality; mock interviews on platforms like Pramp require scheduling another human. There is no tool that gives you a real question, accepts a spoken or typed answer, and immediately tells you — with written justification — where your answer succeeded and where it fell short across correctness, clarity, and depth.

---

## 2. Goals (v1 / MVP)

1. Clerk authentication — no separate email signup; sign in with existing account.
2. Three interview tracks with real questions: Software Engineer, Product Manager, Data/ML.
3. Voice input via browser Web Speech API — answer without typing; transcript is editable before submission.
4. AI evaluation on every submission — scores 1–10 on correctness, clarity, and edge-case handling with written justification per dimension.
5. Smart question cycling — questions already answered are skipped; pool resets when exhausted.
6. Progress dashboard — score trends over time, per-role filtering, full attempt history.
7. Live score delivery via Supabase Realtime — evaluation appears without polling or page reload.
8. Deployed on Vercel with a working live demo URL and a seeded question bank.

---

## 3. Non-Goals (explicit scope cuts)

- **Streaming LLM output** — scores appear all at once; streaming adds complexity to the Realtime + HTTP race without clear user benefit at this scale.
- **Curriculum-driven question selection** — questions are randomly drawn from the unanswered pool; adaptive selection based on weak dimensions is a v2 feature.
- **Video recording** — voice transcript is captured; video is out of scope.
- **Team / organisation accounts** — single-user only; no sharing, no leaderboards, no admin roles.
- **Mobile app** — responsive web only; native apps are not planned for v1.
- **Rate limiting** — no per-user cap on AI evaluations; acceptable at demo scale.
- **Question authoring UI** — questions are seeded via SQL migration; a content management UI is deferred.

---

## 4. Users

**Primary:** Engineering candidates, PM candidates, and data science candidates who want structured self-assessment practice before interviews at tech companies.

**Secondary:** Recruiters and hiring managers evaluating this project as a portfolio piece — the live demo needs to work end-to-end on their own login without setup.

---

## 5. User Stories

1. *As a candidate,* I sign in once with Clerk so that I can access my personal question history and scores without managing a separate password.
2. *As a candidate,* I pick a role (SDE, PM, or Data) and receive a question I haven't answered before so that I'm always challenged with fresh material.
3. *As a candidate,* I speak my answer into the browser so that I can practice verbal articulation without typing, editing the transcript before I submit.
4. *As a candidate,* I submit my answer and see a score card within 10 seconds so that the feedback loop is tight enough to be useful in a practice session.
5. *As a candidate,* I read the written justification per score dimension so that I know specifically what to improve, not just a number.
6. *As a candidate,* I view my dashboard to see score trends over time so that I can measure progress across sessions.
7. *As a candidate,* I filter my dashboard by role so that I can focus on the track I'm preparing for.

---

## 6. Functional Requirements

### 6.1 Authentication

- Users sign in via Clerk; no separate signup form or email-verified account required.
- All protected routes check `auth()` server-side and redirect to `/sign-in` if unauthenticated.
- Clerk JWT is forwarded to Supabase Realtime so RLS policies are satisfied for live subscriptions.

### 6.2 Question Selection

- Questions are stored in Supabase with a `role`, `category`, `difficulty`, and `expected_concepts` array.
- The interview page server-fetches all questions for the chosen role, excludes IDs the user has already attempted, and picks one at random.
- If the user has answered all questions for a role, the pool resets and any question may be selected.
- Skipping a question (without answering) does not mark it as attempted.

### 6.3 Answer Submission

- Users may type or speak their answer (Web Speech API); the transcript appends in real time and is editable.
- Submission requires a minimum of 80 characters; maximum is 2000 characters.
- On submit, the answer and input mode (`text`|`voice`) are saved via `POST /api/attempt`.
- The user's `users` row is upserted on every submission — no separate registration step.

### 6.4 AI Evaluation

- Every attempt is evaluated by Groq (`llama-3.3-70b-versatile`) via `POST /api/evaluate`.
- The model returns scores 1–10 on correctness, clarity, and edge-case handling with 1–2 sentence notes per dimension and a 2–3 sentence overall summary.
- LLM output is validated against a Zod schema before being stored; malformed output triggers one retry.
- Concurrent `POST /api/evaluate` calls for the same attempt are idempotent — the first write wins, the second returns the existing row.
- If the attempt already has an evaluation, the route returns it immediately without calling the LLM.

### 6.5 Live Score Delivery

- After saving the attempt, the client opens a Supabase Realtime channel filtered to `evaluations` INSERT for that `attempt_id`.
- The HTTP response from `/api/evaluate` serves as fallback — whichever delivers the evaluation data first renders the ScoreCard.
- A `scoredRef` guard prevents double-render if both arrive.

### 6.6 Dashboard

- The dashboard fetches all of the user's completed attempts (with joined questions and evaluations) ordered newest-first.
- Summary stats (total attempts, average correctness, clarity, edge-case scores) are computed client-side.
- A Recharts line chart renders score trends over time when 2 or more attempts exist.
- Role filter tabs (All, SDE, PM, Data) update the stats and chart without a page reload.
- Full attempt history shows question text, scores, and overall summary per row.

---

## 7. Non-Functional Requirements

- **Latency:** Answer submission acknowledged within 1s; AI evaluation returned within 10s for a typical 200-word answer.
- **Security:** `GROQ_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-side env vars only. Prompt injection sandboxed via XML tags + system prompt instruction. Concurrent submissions idempotent.
- **Cost:** Single Groq call per evaluation at `max_tokens: 1024`. No per-page-load AI calls.
- **Reliability:** Answer is always saved before evaluation is attempted; a failed evaluation does not lose the attempt. Users can re-submit without re-answering.
- **Accessibility:** Keyboard navigable; voice input is an enhancement, not required. Character count and word count give real-time feedback on answer length.

---

## 8. Success Metrics

| Metric | Target |
|---|---|
| Live demo reliability | Sign in → evaluated score visible in under 15s on first attempt |
| AI evaluation accuracy | Scores feel differentiated and justified (qualitative review of 20 attempts) |
| Voice input usability | Transcript usable without correction on clear speech in a quiet environment |
| Dashboard correctness | Score averages and trend chart match raw attempt data exactly |

---

## 9. Risks & Open Questions

- **Groq rate limits** — free tier has request-per-minute caps. Mitigated by on-demand evaluation only (one call per submission, not per page load). Retry logic handles transient throttling.
- **Web Speech API browser support** — not supported in Firefox or Safari on some platforms. Voice button is only shown when `SpeechRecognition` or `webkitSpeechRecognition` is detected; text input is always available.
- **Supabase Realtime + Clerk JWT** — Realtime requires a valid JWT scoped to `authenticated` role. If the Clerk JWT template is misconfigured, Realtime falls back gracefully to the HTTP response.
- **Open question:** Should the question pool be role-and-difficulty stratified to ensure coverage across easy/medium/hard before repeating? Deferred to v2.

---

## 10. v2 Candidates

- **Streaming evaluation** — stream the LLM response token-by-token so the score card builds incrementally, reducing perceived wait time.
- **Adaptive question selection** — use historical scores per dimension to surface questions targeting weak areas first.
- **Attempt replay** — show the submitted answer alongside the score card in the dashboard history (currently omitted to keep the history view compact).
- **Question difficulty ladder** — start users at easy, unlock medium after 3 strong easy scores, hard after 3 strong medium.
- **Rate limiting** — add per-user per-hour cap on `/api/evaluate` before any public launch.
