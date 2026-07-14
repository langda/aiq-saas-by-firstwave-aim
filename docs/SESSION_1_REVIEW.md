# AIQ — Session 1 Review: Document Critique, Prioritized Plan, Recommendations

> Output of the Session 1 architecture workshop. Critique of the source documents (Step 2), the prioritized implementation plan, and pre-coding recommendations.
> **Historical note (2026-07-14):** the Founder Decisions recorded in [CHANGELOG.md](./CHANGELOG.md) resolved most items referenced here by their original OPEN_QUESTIONS numbers (#1–#18). The milestone plan in Part B stands, with milestone blockers now mapped to OPEN_QUESTIONS items A–J.

---

## Part A — Critical Review of the Source Documents

### A1. Inconsistencies (need reconciliation in the source docs)

| # | Issue | Where | Proposed resolution |
|---|---|---|---|
| 1 | **MVP scope conflict**: MVP lists Admin portal + Analytics; Roadmap says V1 = Assessment + Results, V2 = Admin CMS | BLUEPRINT "MVP Scope" vs "Roadmap" | V1 = assessment + results + auth + certificate + *thin* admin (question CRUD only). OPEN_QUESTIONS #2 |
| 2 | **Competency naming**: "Learning Agility" vs "Learning" | BLUEPRINT vs QUESTION_FRAMEWORK | Pick one (I suggest "Learning Agility" — more distinctive); it's seed data either way, but docs should agree |
| 3 | **"Best answer position changes every question"** contradicts "randomize answer order" — if options shuffle at runtime, authored position is irrelevant | QUESTION_FRAMEWORK Rules vs BLUEPRINT Assessment Rules | Keep runtime shuffle; reinterpret the authoring rule as "don't let the strongest option be recognizable by style/length" — which is the real intent |
| 4 | **"No answer should look obviously correct" + hidden multi-competency weights** means there is no single "best answer" at all — yet QUESTION_FRAMEWORK says "best answer position". Terminology implies pass/fail; the scoring model is strengths-profiling | QUESTION_FRAMEWORK | Align authoring guidance: options differ in *signal profile*, not correctness. Matters because question authors will otherwise write quiz-style items |
| 5 | **Build order differs** between CLAUDE.md (Auth → DB → …) and IMPLEMENTATION_PLAN (Foundation → DB → Auth → …) | CLAUDE.md vs IMPLEMENTATION_PLAN | IMPLEMENTATION_PLAN order is correct (schema before auth roles); treat CLAUDE.md's list as informal |

### A2. Missing requirements (named but undefined, or absent entirely)

1. **Persona assignment rules** — "Persona assigned from competency profile" with zero mapping. Blocks Phase 4. (OPEN_QUESTIONS #3)
2. **Confidence score** — appears once in Phase 4, defined nowhere. (#5)
3. **Normalization method** for "overall score normalized to 100" — unspecified; my proposal in ARCHITECTURE §11.1. (#4)
4. **Auth placement in the user journey** — anonymous-start vs auth-first is undecided and is the top conversion lever. (#1)
5. **Retake policy** — absent, yet it shapes dashboard, certificate, and data model. (#7)
6. **Certificate earn criteria / expiry / what verification reveals** — absent. (#6)
7. **Monetization** — no pricing model anywhere. Not an MVP code blocker, but "enterprise-ready from day one" without a commercial hypothesis risks building the wrong enterprise features first.
8. **Privacy/compliance posture** — behavioral assessment data of employees is sensitive; org-admin visibility and deletion rights undefined. (#9, #10)
9. **Localization** — no mention. (#11)
10. **Non-functional targets** — no stated goals for assessment completion time, page performance, or uptime. I've assumed: assessment ≤ 5 min, LCP < 2s on marketing/results, and standard Vercel/Supabase SLAs.

### A3. Architectural risks (called early so they're cheap)

1. **The question bank is the moat, and it leaks.** With 8 static questions, one screenshotting user "publishes" the assessment. Mitigations: growing pool + randomized selection (designed in), per-session option shuffle (designed in), and accepting that MVP is exposed. The *real* moat must be the scoring model + content velocity, not secrecy.
2. **Psychometric thinness** — 8 questions / 8 competencies. Directional profile, not measurement. If enterprises buy "assessment", credibility depends on honest framing or a longer instrument. (#8)
3. **Weight leakage is a one-way door.** If hidden weights ever ship to a client bundle or API response—even once—the assessment's integrity is permanently compromised for those questions. This is why sanitizer + RLS-deny + serialization test are all three mandatory (ARCHITECTURE §16), not belt-and-braces paranoia.
4. **Editing live questions corrupts history.** Admin edits weights → old results no longer explainable. Solved by `scoring_snapshot` on results + edit warnings (ARCHITECTURE §4.5, §11.4) — but the *process* rule (don't edit published questions with responses; archive and replace) needs to be an admin-UI guardrail, not tribal knowledge.
5. **"Everything configurable" is a trap when over-applied.** A generic rules engine for everything would sink the MVP. My line: content, weights, thresholds, persona rules, selection strategy = data (configurable). Code structure, flow logic, normalization *formula shape* = code (changeable via deploy). PROJECT_RULES' spirit is preserved; its letter is bounded.
6. **Serverless background-work limits** — AI generation via `waitUntil` dies with the function on timeout. Mitigated by mandatory static fallback; escalation path (jobs table) pre-designed (ARCHITECTURE §18).
7. **Role enum won't survive multi-org** — flagged now so Phase 8 budgets the `org_memberships` migration (ARCHITECTURE §19.3).

### A4. Opportunities the docs undersell

1. **The results/certificate share loop is the growth engine.** "Beautiful enough to share" appears once, but persona-branded OG cards + public result pages (opt-in) are the cheapest acquisition channel this product has. I've promoted the OG share image to MVP scope.
2. **`time_spent_ms` per question** is free to capture and later powers question quality analytics and confidence scoring.
3. **The events table from day one** means when you ask "where do people drop off?" in month 2, the answer already exists.
4. **Question authoring is a content pipeline problem.** Target is 100+ questions; an AI-assisted authoring flow (draft scenario + options + suggested weights, human reviews) inside admin is the highest-leverage AI feature after recommendations — more valuable than "admin insights" in Phase 9's list.

---

## Part B — Prioritized Implementation Plan

Based on the existing IMPLEMENTATION_PLAN, with two structural changes and explicit priorities.

**Change 1 — vertical slice early.** After foundation + schema, build a walking skeleton of the *entire* core loop (assess → score → results, ugly but real) before polishing any single phase. Layer-by-layer building (the current plan) discovers integration problems last; this product's risk is concentrated in exactly one loop.

**Change 2 — thin admin enters at Milestone 2**, not Phase 7, for the reasons in OPEN_QUESTIONS #2.

### Milestone 0 — Foundation (≈ Phase 0) — *first*
Next.js + TS strict + Tailwind + shadcn, ESLint (with boundary rules) + Prettier, env validation, Supabase local + CI (typecheck/lint/test/build/migration check), auth scaffold (login/signup/reset), root layouts, error/loading conventions, design tokens (light+dark), deployed skeleton on Vercel.
**Exit: deployed, CI-green, sign-in works.**

### Milestone 1 — Schema + Walking Skeleton (Phases 1+3+4+5 compressed, unpolished)
All MVP tables + RLS + seed (competencies, personas, scoring config, 8 seeded questions). Then the thinnest possible loop: start session → answer 8 questions (unstyled) → server-side scoring (full engine, fully tested — the engine is *not* thinned) → raw results page.
**Exit: a real user can get a real, correctly-scored result. Scoring engine at ~100% unit coverage.**
*Blocked by: OPEN_QUESTIONS #1 (auth placement), #3 (persona rules), #4 (normalization sign-off).*

### Milestone 2 — Thin Admin (Phase 7 subset, pulled forward)
Question/option CRUD with weight editing, draft→publish workflow, audit logging, admin role gate. Author the real launch question set *through the product*.
**Exit: full question lifecycle without touching SQL.**

### Milestone 3 — Experience Polish (Phase 3+5 to production quality)
Typeform-grade runner (motion, focus management, progress, autosave/resume, mobile), premium results page (radar chart, persona reveal, strengths/blind spots), dashboard, empty/loading/error states everywhere, accessibility pass.
**Exit: you'd share your own result unprompted.**
*Blocked by: #17 (brand direction), #7 (retake policy for dashboard).*

### Milestone 4 — Certificate + Share Loop (Phase 6)
PDF certificate, QR + public verify page, OG share image, certificate email (if #13 says yes).
**Exit: certificate downloadable and verifiable; share card renders beautifully in social previews.**
*Blocked by: #6 (certificate policy), #16 (name/domain).*

### Milestone 5 — AI Recommendations (Phase 9 subset, pulled forward)
Static fallback library first (admin-editable), then `lib/ai` adapter + prompt v1 + structured output + `ai_recommendations` persistence.
**Exit: every result shows three tailored actions; AI outage invisible to users.**
*Blocked by: #12 (provider).*

### 🚀 **Launch line** — everything above = V1.

### Milestone 6 — Analytics (Phase 10 subset)
Funnel views from events, score distribution, per-question answer distribution + drop-off for question quality.

### Milestone 7 — Full Admin CMS (Phase 7 remainder)
Competency/persona management, scoring config editor (versioned, activate/rollback), branding, assessment builder.

### Milestone 8 — Organizations (Phase 8)
`org_memberships` migration, invitations, org dashboard (aggregate-first per #9), benchmarking.

### Milestone 9 — AI expansion (Phase 9 remainder)
AI-assisted question authoring (see A4.4), admin insights; groundwork for V4 adaptive + V5 coaching.

---

## Part C — Recommendations Before Coding Begins

1. **Answer the three ⛔ questions first** (OPEN_QUESTIONS #1, #2, #3). Everything in Milestone 0 can start without them; Milestone 1 cannot finish. The persona-rules question (#3) deserves a working session, not a chat message.
2. **Reconcile the source docs** per A1 (30 minutes of editing) so "source of truth" stays true. I can draft the edits for your approval.
3. **Initialize git before Milestone 0** (the project directory isn't a repo yet) with CI from the first commit — PROJECT_RULES' "deployable at all times" starts at commit 1.
4. **Write the question-authoring guide as a product artifact** (extend QUESTION_FRAMEWORK): options as signal-profiles not right answers (A1.4), style-parity across options (A1.3's real intent), worked example with weights. The platform is only as good as its items.
5. **Accept the psychometric framing decision consciously** (#8) — it affects marketing copy, certificate wording, and enterprise conversations. "Work-style profile" and "validated assessment" are different products.
6. **Keep the scoring engine sacred**: pure, exhaustively tested, config-driven. It's the one component where I recommend test-first development, and the serialization test (no weights to client, PROJECT_STRUCTURE §10) should be written before the first question is served.
7. **Budget design time for the two shareable surfaces** (results, certificate/OG). They are the growth loop; treating them as "UI polish" undersells them (A4.1).
8. **Defer with confidence**: no ORM, no job queue, no external analytics, no i18n wiring (pending #11), no public API, no microservices. Every deferral has a marked seam in ARCHITECTURE §18 — deferring is a decision, not an omission.
