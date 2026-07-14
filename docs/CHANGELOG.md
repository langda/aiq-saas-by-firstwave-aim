# AIQ — Documentation Changelog

Decisions recorded here are product source of truth, alongside `docs/00_PROJECT/*`.

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
