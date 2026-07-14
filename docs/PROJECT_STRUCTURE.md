# AIQ — Project Structure

> Status: **v1.1 — updated with Founder Decisions of 2026-07-14** (see [CHANGELOG.md](./CHANGELOG.md))
> Companion to [ARCHITECTURE.md](./ARCHITECTURE.md). This document is prescriptive: new code that doesn't fit these conventions should trigger a conversation, not a workaround.

---

## 1. Top-Level Layout

```
aiq/
├── docs/                       # all project documentation (this folder)
├── public/                     # static assets (fonts, favicons, brand)
├── src/
│   ├── app/                    # Next.js App Router — routes ONLY, kept thin
│   ├── components/             # shared, feature-agnostic UI
│   ├── core/                   # pure domain logic — zero I/O
│   ├── features/               # vertical feature slices
│   ├── lib/                    # shared infrastructure & utilities
│   └── styles/                 # globals.css, design tokens
├── supabase/
│   ├── migrations/             # SQL migrations — source of truth for schema
│   ├── seed.sql                # competencies, personas, scoring config, starter questions
│   └── config.toml
├── tests/
│   └── e2e/                    # Playwright end-to-end specs
├── .github/workflows/          # CI
└── [config: package.json, tsconfig.json, tailwind, eslint, prettier, .env.example]
```

### Dependency rule (enforced, not aspirational)

```
app/  →  features/  →  core/
  ↘        ↓            ↑ (imports nothing from the app)
   components/, lib/  ──┘
```

- `core/` imports **nothing** from `app/`, `features/`, or `lib/` (pure TS + Zod only).
- `app/` never imports `features/*/server/db.ts` directly — always through actions/services.
- Enforced with `eslint-plugin-boundaries` (or `import/no-restricted-paths`) from Phase 0, so violations fail CI instead of accumulating.

---

## 2. `app/` — Routes

```
src/app/
├── (marketing)/
│   ├── layout.tsx              # marketing shell (nav, footer)
│   ├── page.tsx                # landing
│   └── learn/page.tsx
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── reset-password/page.tsx
├── (app)/
│   ├── layout.tsx              # permanent-account shell; anonymous/no session → redirect
│   ├── dashboard/page.tsx      # includes progress-over-time across retakes
│   └── results/[sessionId]/page.tsx
├── assessment/[slug]/page.tsx  # PUBLIC runner — anonymous auth created on start (Decision 1)
├── claim/page.tsx              # post-assessment auth gate: signup (converts anon user)
│                               #   or login (triggers claimSessions)
├── (admin)/admin/
│   ├── layout.tsx              # role gate: super_admin → else notFound()
│   ├── page.tsx                # admin dashboard
│   ├── questions/…             # list, [id]/edit, new — incl. signal (weight) editor
│   ├── competencies/…          # CRUD (Decision 2); traits managed within a competency
│   └── personas/…              # CRUD (Decision 2) — identity fields; signatures are config
├── verify/[code]/page.tsx      # public certificate verification
├── api/
│   ├── certificates/[code]/route.ts    # JSON verify
│   ├── certificates/[code]/pdf/route.ts
│   └── og/result/[shareId]/route.tsx   # share image
├── layout.tsx                  # root: fonts, theme provider, toaster
├── error.tsx / not-found.tsx / global-error.tsx
└── middleware.ts               # session refresh + coarse auth gating (src/)
```

**Route files are thin.** A `page.tsx` composes: fetch via service → render feature components. If a page file exceeds ~80 lines, logic is leaking in — move it to the feature.

Every route segment that loads data ships `loading.tsx` (skeleton) and participates in the nearest `error.tsx` — the "loading, empty, success, error states required" rule is structural, not optional.

---

## 3. `components/` — Shared UI

```
src/components/
├── ui/                 # shadcn/ui primitives (owned, restyled — generated code lives here)
├── shared/             # composed, feature-agnostic: PageHeader, EmptyState,
│                       #   ErrorState, LoadingSkeleton, StatCard, ConfirmDialog
└── charts/             # themed Recharts wrappers: RadarChart, BarBreakdown
```

### Reusable component strategy

- **Three tiers**: `ui/` (primitives) → `shared/` (compositions used by 2+ features) → `features/*/components/` (feature-specific).
- **Promotion rule**: a component starts in its feature. When a *second* feature needs it, it moves to `shared/` — never copy-paste between features (PROJECT_RULES: no duplication), and never build in `shared/` speculatively.
- Components take data via props; **no component fetches data or imports services**. Server components in `app/` do the fetching and pass down.
- Variants via `cva` (class-variance-authority), consistent with shadcn idiom. No ad-hoc `className` string concatenation for variants.
- Every stateful shared component ships its empty/loading/error affordances (e.g., `EmptyState` with icon + message + action is the single empty-state implementation platform-wide).

---

## 4. `core/` — Pure Domain

```
src/core/
├── scoring/
│   ├── engine.ts           # score(input) → ScoringOutcome  (pure)
│   ├── normalize.ts        # competency normalization math
│   ├── persona.ts          # signature-affinity interpreter → primary + secondary persona
│   ├── confidence.ts       # signal volume × consistency × coverage (Decision 5)
│   └── engine.test.ts      # exhaustive unit tests — this is the heart of the product
├── selection/
│   └── strategy.ts         # question selection interpreter (fixed | random | …)
├── authz.ts                # capability functions: canManageQuestions(ctx), …
├── types.ts                # domain types shared across features
└── constants.ts            # true constants only (NOT business config — that's in DB)
```

Rules: no imports from anywhere else in the app; no `async` unless the algorithm demands it (it doesn't); 100% unit-test coverage target for `scoring/` — this is the one place that number is justified.

---

## 5. `features/` — Vertical Slices

One directory per feature. MVP set: `auth` (includes anonymous→permanent conversion and the `claimSessions` service — Decision 1), `assessment`, `results`, `certificates`, `questions` (admin authoring), `taxonomy` (admin CRUD for competencies/traits/personas — Decision 2), `recommendations` (AI), plus later `organizations`, `analytics`, `branding`.

Canonical internal shape (illustrated with `assessment`):

```
src/features/assessment/
├── components/
│   ├── AssessmentRunner.tsx    # "use client" — the state machine host
│   ├── QuestionCard.tsx
│   ├── OptionList.tsx
│   └── ProgressBar.tsx
├── hooks/
│   └── use-assessment-runner.ts  # reducer + autosave orchestration
├── server/
│   ├── actions.ts              # "use server" — thin: parse, auth, delegate
│   ├── service.ts              # business orchestration
│   ├── db.ts                   # ALL Supabase queries for this feature
│   └── sanitize.ts             # toPublicQuestion() — the only exit door for question data
├── schemas.ts                  # Zod: action inputs, JSONB shapes
└── types.ts
```

Conventions:

- **`server/` is server-only**: every file in it starts with `import "server-only"` — a compile-time guarantee that weights/config code can't be bundled client-side.
- **`actions.ts` is thin** — parse input (Zod), resolve auth context, call service, map to `Result<T, E>`. No business logic, ever.
- **`service.ts`** owns orchestration and authorization. Receives `AuthContext`, never touches cookies/headers.
- **`db.ts`** is the only file in the feature that imports a Supabase client. Named query functions (`getPublishedQuestions()`, `upsertResponse()`), no inline queries in services.
- Cross-feature calls go **service → service** (e.g., results service asks certificates service to issue) — never reach into another feature's `db.ts`.

---

## 6. `lib/` — Shared Infrastructure

```
src/lib/
├── supabase/
│   ├── server.ts           # cookie-bound server client (RLS as the user)
│   ├── client.ts           # browser client (auth UI only)
│   ├── admin.ts            # service-role client — imports "server-only"; used
│   │                       #   ONLY where RLS must be bypassed (weights, scoring)
│   └── middleware.ts       # session refresh helper
├── ai/
│   ├── index.ts            # generateRecommendations() — provider-agnostic API
│   ├── providers/          # openai.ts (anthropic.ts when needed)
│   ├── prompts/            # versioned prompt modules: recommendations.v1.ts
│   └── schemas.ts          # Zod schemas for structured model output
├── email/                  # transactional email adapter (beyond Supabase auth mails)
├── auth/
│   └── context.ts          # getAuthContext(): { userId, role, orgId } from session
├── result.ts               # Result<T, E> helper for action returns
├── ids.ts                  # nanoid wrappers (certificate codes, share ids)
├── rate-limit.ts
├── seeded-random.ts        # deterministic shuffle for session seeds
├── strings.ts              # ALL UI string literals (localization-ready per Decision 11 —
│                           #   no inline user-facing text in components)
└── utils.ts                # cn(), formatters — keep small; split when it grows
```

---

## 7. Hooks

- **Feature hooks** live in the feature (`features/assessment/hooks/`).
- **Shared hooks** in `src/hooks/` only when used by 2+ features: `use-media-query`, `use-reduced-motion`, `use-debounce`. Same promotion rule as components.
- Hooks never call server actions directly for reads — reads come from RSC. Hooks may invoke actions for mutations (e.g., debounced autosave).

---

## 8. Services & Server Actions — Conventions

- **Naming**: actions are imperative user-intents (`startAssessment`, `saveAnswer`, `submitAssessment`); service methods are domain operations (`AssessmentService.complete`).
- **Return type**: every action returns `Result<T, ActionError>` — `{ ok: true, data } | { ok: false, error: { code, message } }`. UI switches on `code`; raw errors are logged server-side, never serialized to the client.
- **Auth context**: resolved once per action via `getAuthContext()`; services assert capabilities via `core/authz`. An unauthenticated context short-circuits before any service runs.
- **Idempotency** where retries are plausible: `submitAssessment` returns the existing result if the session is already completed; `saveAnswer` is an upsert.
- **Audit**: admin services call `audit.log(ctx, action, entity, diff)` as part of the same operation.

---

## 9. Database Layer

- **Schema source of truth**: `supabase/migrations/*.sql`, authored locally (`supabase migration new …`), applied by CI. Every table migration includes its RLS policies and indexes in the same file — a table is not "done" without them.
- **Types**: `supabase gen types typescript` → `src/lib/supabase/database.types.ts`, regenerated by a package script after every migration; CI fails if the checked-in file is stale.
- **Query placement**: only in `features/*/server/db.ts`. A query used by two features lives in the feature that *owns* the table (results queries live in `results`, even if `certificates` needs one — it goes through the results service).
- **JSONB discipline**: every JSONB column has exactly one Zod schema (in the owning feature's `schemas.ts`); reads parse, writes serialize from typed objects. No `as` casts on JSONB.
- **Client choice per path**: user-scoped queries use the cookie-bound server client (RLS enforced as the user); weight/config reads and scoring writes use the admin client inside services that have already done explicit authz. The admin client never appears in `actions.ts` or components.

---

## 10. Testing Layout

| Layer | Tool | Location | What |
|---|---|---|---|
| Domain | Vitest | `core/**/*.test.ts` | scoring math, persona rules, selection, authz — exhaustive |
| Services | Vitest | `features/*/server/*.test.ts` | orchestration with mocked db.ts |
| Sanitization | Vitest | `features/assessment/server/sanitize.test.ts` | **asserts no signal/trait/competency fields ever serialize to the client** |
| Claim flow | Vitest | `features/auth/server/claim.test.ts` | anonymous→permanent re-parenting, incl. hostile claim attempts |
| RLS | scripted SQL (pgTAP or role-switch script) | `supabase/tests/` | each policy: allowed and denied cases |
| E2E | Playwright | `tests/e2e/` | signup → assess → results → certificate happy path + admin question CRUD |

---

## 11. Naming & Misc Conventions

- Files: `kebab-case.ts`; React components: `PascalCase.tsx`; hooks: `use-*.ts`.
- DB: `snake_case` tables/columns; app: `camelCase` — mapping happens in `db.ts`, nowhere else.
- No barrel `index.ts` re-export files inside `features/` (they blur boundaries and hurt tree-shaking); import from explicit paths.
- Path aliases: `@/core/*`, `@/features/*`, `@/components/*`, `@/lib/*`.
- Environment variables validated at boot with a Zod schema in `lib/env.ts`; the app fails fast on misconfiguration.
