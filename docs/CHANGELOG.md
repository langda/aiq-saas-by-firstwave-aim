# AIQ — Documentation Changelog

Decisions recorded here are product source of truth, alongside `docs/00_PROJECT/*`.

---

## 2026-07-15 — Founder Decisions (Session 6): artwork, email, GitHub

17. **Persona artwork v1** — five original abstract SVG marks (`public/personas/*.svg`), one visual metaphor per work style (Explorer: uneven discovery burst · Assistant User: prompt-and-check handoff · AI Collaborator: interlocking iteration loops · AI Builder: blocks locking into structure · AI Architect: designed network). Consistent rounded-square + gradient system on the token palette. Wired into results hero, verify page, and seed/DB `artwork_url`.
18. **Transactional email = Resend** (closes OPEN_QUESTIONS F). `lib/email` adapter (same discipline as `lib/ai`: no provider SDK outside it); certificate-issued email fires best-effort at issuance — silently skipped without `RESEND_API_KEY` / for anonymous users. Env: `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL` (all optional).
19. **GitHub remote**: https://github.com/langda/aiq-saas-by-firstwave-aim.git — codebase pushed; CI (GitHub Actions) active from first push.

---

## 2026-07-15 — Milestone 4: certificate + share loop (Session 5)

Decision 6 implemented end to end:

- **Issuance**: every submit creates a certificate (idempotent per result; 21-char base58 code ≈ 123 bits — unguessable). Claim flow already re-parents certificates on account change. Existing results backfilled.
- **PDF** (`/api/certificates/[code]/pdf`): on-demand via @react-pdf/renderer — name, persona + description, overall score, date, verify URL + QR (qrcode). **Holder-only (401 otherwise)**: the PDF carries the score, which the public code deliberately never discloses; sharing the PDF is the holder's choice.
- **Public verify page** (`/verify/[code]`): name, persona, assessment, date, valid/revoked badge — never scores or competency breakdown, including page metadata (revoked/unknown certificates disclose nothing at all). Doubles as acquisition surface (CTA).
- **OG share image** (`next/og`): persona-forward 1200×630 card on the verify URL, same disclosure rules.
- **Results page**: certificate card with PDF download + copy-verification-link (with a plain-language disclosure hint).
- Verified live: PDF 200 with auth / 401 without; verify page shows name+persona and provably does not contain the score; bogus codes → not-found; revoked → banner with zero holder disclosure (metadata leak found and fixed during verification); OG endpoint serves image/png.
- Deferred: certificate email (open question F unanswered), rate limiting on public endpoints (needs an infra choice — flagged for pre-launch), `verify` OG image on the marketing/results pages.

---

## 2026-07-15 — Milestone 3: experience polish (Session 5)

- **Design tokens v1** (open question E, proposed & applied, veto-able in one file): Geist type, indigo accent `oklch(0.51 0.23 277)` light / `oklch(0.68 0.18 277)` dark, accent-tinted focus rings, 0.75rem radius. All in `src/app/globals.css`.
- **Runner**: one-question-per-screen with directional slide transitions (`motion`), animated progress bar, numbered option chips, keyboard 1–4 + arrow navigation, focus moved to each question heading (screen readers), `prefers-reduced-motion` honored, autosave/resume unchanged.
- **Results**: persona-reveal hero (gradient, staggered `Reveal` animations), competency radar (Recharts, themed via CSS vars, hidden under 3 measured competencies), bars, strengths/blind-spots with empty states.
- **Dashboard**: current-profile card, full result history with progress-over-time line chart (hidden under 2 results), retake CTA or locked date.
- **Retake cooldown now ENFORCED** (Decision 7): `startSession` rejects within the configurable cooldown (default 30 days, from `assessments.settings`); intro page and dashboard show the unlock date instead of a dead button.
- Loading skeletons for runner and results routes.
- Verified live with a second test user: full keyboard-driven run (8 questions), submit, animated results (28/100, AI Builder, empty-strengths state correct); first user's dashboard shows the locked retake date (Aug 14, 2026). Mobile (375px) verified.
- Known nit: radar edge labels clip ~2px on narrow screens; revisit with brand pass.

---

## 2026-07-15 — Milestone 2: thin admin (Session 5)

Full content lifecycle without SQL (Decision 2 scope): question CRUD with a behavioral-signal editor, competency CRUD, persona CRUD (identity fields; signatures stay in scoring config), assessment publish/unpublish with a readiness gate (needs N published questions).

- **Publish gate** (`features/questions/authoring.ts`, unit-tested): ASSESSMENT_MODEL §3.1/§9 as executable rules — exactly 4 options, 1–3 signals each, weights 0.5–3.0, ≥2 distinct competencies; balance issues surface as warnings.
- **Immutability guardrail (§4.5)**: questions with recorded responses are locked server-side and in the UI — archive and replace. Editing a published question without responses bumps its version.
- **Slug lock**: competency/persona slugs are immutable after creation (they key scoring-config signatures and signal aggregation).
- **Audit logging** on every mutation via service role (admins cannot suppress their own trail). Admin CRUD itself runs through the cookie client so super_admin RLS is exercised on every operation.
- New shadcn components: table, textarea. Shared `TaxonomyForm`/`TaxonomyList` serve both competencies and personas.
- Verified live: authored and published a 9th question ("The overloaded inbox") entirely through the UI; audit trail shows `question.create` + `question.publish`; locked banner confirmed on a seed question with responses; assessments page shows 8/8 readiness with publish toggle. Trait-level signal tagging deferred (signals are competency-level in the editor, matching seed v1).

---

## 2026-07-14 — Milestone 1: schema + walking skeleton (Session 4)

The complete assessment loop, end to end: anonymous-first start → seeded randomized runner with autosave → server-side scoring → claim gate → results page.

- **Scoring engine** (`src/core/scoring/`): pure, product-agnostic (Decision 16). Per-session normalization (§11.1), signature-affinity personas with primary + secondary (§11.2), volume × consistency × coverage confidence (Decision 5). Config Zod-validated from `scoring_configs.config`.
- **Selection engine** (`src/core/selection/`): fixed/random strategies, seeded deterministic shuffle — resume reproduces exact question and option order.
- **Migrations** (5 files): all MVP tables with RLS in the same file as each table. Highlights: `option_signals`/`scoring_configs`/`events` have zero client-role policies; the Decision-1 result gate is enforced _in RLS_ (`is_permanent_user()`); role claims sync to JWT app_metadata via trigger (no dashboard auth-hook config needed); `claim_session()` is an atomic SECURITY DEFINER function, service-role only.
- **Seed**: 8 competencies, 24 traits, 5 personas, scoring config v1 (Decision 15 signatures), the `aiq` assessment, and 8 authored scenario questions with 62 behavioral signals.
- **Assessment feature**: start (creates anonymous identity transparently), autosave upsert with served-option validation, idempotent submit that scores server-side and returns no scores to the client, claim-token minting for anonymous users.
- **Claim flow**: in-place anonymous conversion (`updateUser`) + cross-account re-parenting via claim cookie → `claim_session()` RPC. Hostile-path unit tests included.
- **Raw results page** (Milestone 3 owns the polish): persona, overall, competency bars, strengths/blind spots, confidence level.
- Tests: engine (19), selection (5), sanitization leak-guard (3), claim (5), plus foundation tests.

**Verified against the cloud Supabase project** (`xemxfawkmrlcoetjugup`, ap-south-1) on 2026-07-15: all 5 migrations applied; seed complete (8/24/5/8/32/62 rows); `supabase/tests/rls_verification.sql` → **RLS VERIFICATION PASSED** (signals/configs invisible to clients, session isolation, Decision-1 anonymous result gate, admin-only writes); profile + role-claim triggers fire on real signups; full E2E loop (signup → 8 answers autosaved → server scoring → results) produced a correct result: overall 34, primary AI Builder (affinity 0.779), secondary Explorer — with the Architect `overallGte` gate correctly excluding a higher-affinity persona. Confidence "moderate" (0.524), snapshot + events persisted.

Outstanding dashboard configuration (founder): enable **anonymous sign-ins** (blocks the Decision-1 anonymous-first flow; confirmed disabled by live test) and decide on **email confirmation** (currently ON — new signups can't sign in until confirmed; either disable for MVP or configure SMTP + confirmation UX). Type generation (`npm run db:types`) still needs Docker or a Supabase access token.

---

## 2026-07-14 — Founder Decisions (Session 4): Milestone 0 approved

13. **Supabase** — cloud project, production-like development from the start (no local Docker stack).
14. **GitHub** — founder creates the repository manually; Claude must not create it.
15. **Persona signatures** — ASSESSMENT_MODEL §5.4 draft accepted as **Version 1**; do not delay implementation perfecting the model; signatures remain configuration, evolve from real user data post-launch. (Closes OPEN_QUESTIONS item A.)
16. **Engineering principle** — build **reusable engines**, not AIQ-specific implementations, wherever practical; the assessment engine must support multiple assessment products without major refactoring.

---

## 2026-07-14 — Milestone 0: project foundation (Session 3)

Implementation began. Git repo initialized; Next.js 16 (App Router) + TypeScript strict + Tailwind v4 + shadcn/ui + Supabase clients + Zod env validation + Vitest + GitHub Actions CI. Full route-group skeleton with auth scaffold (login/signup/reset via server actions), layer-boundary ESLint enforcement, design tokens (light/dark), and `.claude/launch.json` for local preview.

Deviations from PROJECT_STRUCTURE.md (doc updated):

- `src/middleware.ts` → `src/proxy.ts` — Next 16 renamed the convention.
- `globals.css` lives at `src/app/globals.css` (shadcn CLI convention), not `src/styles/`.
- shadcn/ui now builds on Base UI primitives (style "base-nova") rather than Radix; composition uses `render` props instead of `asChild`.

Known gap: no Docker/Supabase CLI on the dev machine — local auth runs against placeholder env values and fails gracefully; end-to-end sign-in verification deferred until a Supabase stack (local Docker or cloud project) is available.

---

## 2026-07-14 — Founder Decisions (Session 2): 12 decisions, docs updated to v1.1

Founder reviewed all Session 1 deliverables and issued the following binding decisions. All documents updated accordingly; no code written.

### Decisions

1. **Anonymous assessment** — users start the assessment with no account; authentication happens after completion; results shown only after account creation; anonymous data securely attached to the account on registration. _Rationale: lowest friction, maximum completion._
2. **MVP scope** — landing page, assessment, results, certificate, authentication, thin admin (question CRUD, competency CRUD, persona CRUD, weight configuration, assessment publish/unpublish). Excluded from MVP: org dashboard, enterprise analytics, learning management, white-labeling.
3. **Persona philosophy** — personas are work styles, not score ranges. Model must support primary + secondary personas; MVP displays primary only; architecture stores both from day one.
4. **Scoring philosophy** — behaviors, not correct answers. Fixed hierarchy: behavioral signals → competencies → personas → recommendations. Architecture must preserve this hierarchy.
5. **Confidence score** — confidence in the _assessment_, never in AI. Depends on signal volume, response consistency, competency coverage. Low confidence = "We need more information to build an accurate profile."
6. **Certificate** — every completion earns one; no expiry; certificate shows overall score, primary persona, date; public verification shows name, persona, date only — no competency breakdown publicly.
7. **Retakes** — every 30 days; history preserved; dashboard shows progress over time; newest result is the default profile.
8. **Assessment length** — free = 8 questions (2–3 min); future professional = 20–30, enterprise = 40–60. Architecture supports multiple lengths.
9. **Organization privacy** — aggregate analytics by default; individual visibility only via org policy. Privacy is a competitive advantage.
10. **AI provider** — OpenAI default; provider-agnostic architecture; Anthropic support = adapter change only.
11. **Localization** — V1 ships in English; architecture localization-ready.
12. **Brand** — working name AIQ; positioning: "AI Work Style & Readiness Assessment" — behavioral assessment platform, not an AI certification exam.

### Document changes

- **NEW [ASSESSMENT_MODEL.md](./ASSESSMENT_MODEL.md)** (founder request) — the IP document: behavioral signals, traits (draft 24-trait taxonomy), competencies, personas (work-style definitions + draft signature profiles), recommendations, learning paths, scoring philosophy, question design principles (incl. worked example), and the 8→500 question expansion strategy in four stages.
- **[ARCHITECTURE.md](./ARCHITECTURE.md) → v1.1**
  - §5 rewritten for anonymous-first auth: Supabase anonymous sign-ins, in-place conversion for new accounts, `claimSessions` re-parenting service for existing accounts, result gate (scores never sent to anonymous clients), rate limiting on anonymous starts, 30-day purge of unclaimed data.
  - §11.2 persona assignment redesigned: threshold-rule list **superseded** by signature-profile affinity (weighted cosine vs. per-persona competency vectors) — expresses "work styles, not score ranges" and yields primary + secondary naturally. `results` gains `secondary_persona_id` + `persona_affinities`.
  - §11.3 confidence finalized per Decision 5 (volume × consistency × coverage; qualitative display).
  - Schema: `option_competency_weights` renamed **`option_signals`** (+ optional `trait_id`); new **`traits`** table; terminology aligned to the signal hierarchy throughout.
  - §6/§15: org analytics aggregate-only by default, policy flag enforced in RLS, minimum group size n ≥ 5 for aggregates.
  - §13 certificate policy fixed per Decision 6; §14 thin-admin scope fixed per Decision 2; §12 OpenAI as default provider; §18 rows for multi-length assessments, secondary-persona display, and localization-readiness; §19 self-review updated (claim-flow risk added).
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) → v1.1** — public `assessment/` route + `claim/` auth-gate route; admin routes for competencies/personas; new `taxonomy` feature; `lib/strings.ts` (all UI literals centralized for localization-readiness); claim-flow test row; persona/confidence module descriptions updated.
- **[OPEN_QUESTIONS.md](./OPEN_QUESTIONS.md)** — 12 questions closed (archived in a resolution table); remaining items renumbered A–J. Still open, most important first: **A** persona signature values + trait taxonomy sign-off (⛔ for Milestone 1 exit), **B** scoring/confidence numeric confirmation, **C** privacy/residency posture, **D** hosting region, **E** brand visual identity.

### Superseded

- Session-1 persona threshold-rules example (old ARCHITECTURE §11.2) — replaced by affinity model.
- Original OPEN_QUESTIONS numbering #1–#18 — see resolution table in that file.

---

## 2026-07-14 — Session 1: initial architecture package

Created ARCHITECTURE.md, PROJECT_STRUCTURE.md, OPEN_QUESTIONS.md, SESSION_1_REVIEW.md (document critique, milestone plan, pre-coding recommendations). No code.
