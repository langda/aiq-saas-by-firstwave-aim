-- Static recommendation library (ARCHITECTURE §12, ASSESSMENT_MODEL §6):
-- the guaranteed floor under the AI recommendation engine. Admin-editable
-- content, keyed by competency (persona-flavored variants come with the
-- full CMS in Phase 7).

create table public.recommendation_templates (
  id uuid primary key default gen_random_uuid(),
  competency_id uuid not null unique references public.competencies (id) on delete cascade,
  title text not null,
  why text not null,
  how text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger recommendation_templates_updated_at
  before update on public.recommendation_templates
  for each row execute function public.set_updated_at();

alter table public.recommendation_templates enable row level security;
-- Content ends up on users' results pages — readable; writes are admin-only.
create policy "read recommendation templates" on public.recommendation_templates
  for select to authenticated using (true);
create policy "super_admin manages recommendation templates" on public.recommendation_templates
  for all using (public.is_super_admin()) with check (public.is_super_admin());
