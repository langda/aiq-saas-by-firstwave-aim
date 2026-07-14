# AIQ — AI Work Style & Readiness Assessment

A behavioral assessment platform that measures how people **apply AI in real work** — not how much AI terminology they know.

## Documentation (source of truth)

Read before contributing, in this order:

1. [docs/00_PROJECT/](docs/00_PROJECT/) — blueprint, question framework, project rules, implementation plan
2. [docs/ASSESSMENT_MODEL.md](docs/ASSESSMENT_MODEL.md) — the conceptual model (IP)
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system architecture
4. [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) — folder conventions (enforced by ESLint)
5. [docs/CHANGELOG.md](docs/CHANGELOG.md) — founder decisions record

## Stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres, Auth) · Vercel

## Development

```bash
npm install
cp .env.example .env.local   # fill in Supabase values
npx supabase start           # requires Docker — local Postgres + Auth
npm run dev
```

Quality gates (all run in CI):

```bash
npm run typecheck && npm run lint && npm run format:check && npm run test && npm run build
```

## Layer rules

`app → features → core`, with `lib`/`components` shared. Dependencies point downward only — violations fail `npm run lint`. See PROJECT_STRUCTURE.md §1.
