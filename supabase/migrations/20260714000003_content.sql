-- Content: questions, options, behavioral signals, assessments.
-- option_signals is the hidden-scoring table — the crown jewels (§1.3):
-- NO client-role policies exist on it, by design.

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  scenario text not null,
  difficulty int not null default 1 check (difficulty between 1 and 5),
  industry_tags text[] not null default '{}',
  status public.content_status not null default 'draft',
  version int not null default 1,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index questions_status_idx on public.questions (status);
create trigger questions_updated_at before update on public.questions
  for each row execute function public.set_updated_at();

create table public.answer_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  content text not null,
  author_position int not null default 0, -- authored order; display order is per-session seeded shuffle
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index answer_options_question_id_idx on public.answer_options (question_id);
create trigger answer_options_updated_at before update on public.answer_options
  for each row execute function public.set_updated_at();

-- One row = one behavioral signal (ASSESSMENT_MODEL §3.1).
create table public.option_signals (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.answer_options (id) on delete cascade,
  competency_id uuid not null references public.competencies (id) on delete restrict,
  trait_id uuid references public.traits (id) on delete set null,
  weight numeric(4, 2) not null check (weight > 0), -- positive evidence only in v1 (§3.1)
  created_at timestamptz not null default now(),
  unique (option_id, competency_id) -- one aggregated signal per option × competency (v1)
);
create index option_signals_option_id_idx on public.option_signals (option_id);
create index option_signals_competency_id_idx on public.option_signals (competency_id);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  question_count int not null,
  selection_strategy jsonb not null default '{"type":"fixed","shuffle":true}'::jsonb,
  status public.content_status not null default 'draft',
  org_id uuid references public.organizations (id),
  settings jsonb not null default '{}'::jsonb, -- retake cooldown etc. (Decision 7)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger assessments_updated_at before update on public.assessments
  for each row execute function public.set_updated_at();

create table public.assessment_questions (
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  position int not null default 0,
  primary key (assessment_id, question_id)
);

-- ---------- RLS ----------
-- Published question content (WITHOUT signals) is readable by authenticated
-- users; the server additionally sanitizes every payload (§16 defense in depth).
alter table public.questions enable row level security;
create policy "read published questions" on public.questions
  for select to authenticated using (status = 'published' and deleted_at is null);
create policy "super_admin manages questions" on public.questions
  for all using (public.is_super_admin()) with check (public.is_super_admin());

alter table public.answer_options enable row level security;
create policy "read options of published questions" on public.answer_options
  for select to authenticated using (
    exists (
      select 1 from public.questions q
      where q.id = question_id and q.status = 'published' and q.deleted_at is null
    )
  );
create policy "super_admin manages options" on public.answer_options
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- option_signals: deliberately NO authenticated policies. Server-only.
alter table public.option_signals enable row level security;
create policy "super_admin manages signals" on public.option_signals
  for all using (public.is_super_admin()) with check (public.is_super_admin());

alter table public.assessments enable row level security;
create policy "read published assessments" on public.assessments
  for select to authenticated using (status = 'published' and deleted_at is null);
create policy "super_admin manages assessments" on public.assessments
  for all using (public.is_super_admin()) with check (public.is_super_admin());

alter table public.assessment_questions enable row level security;
create policy "read published assessment questions" on public.assessment_questions
  for select to authenticated using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id and a.status = 'published' and a.deleted_at is null
    )
  );
create policy "super_admin manages assessment questions" on public.assessment_questions
  for all using (public.is_super_admin()) with check (public.is_super_admin());
