-- Runtime: scoring configs, sessions, responses, results, certificates,
-- AI recommendations, events, audit logs.

create table public.scoring_configs (
  id uuid primary key default gen_random_uuid(),
  version int not null unique,
  config jsonb not null, -- validated against core/scoring/config.ts schema
  status public.config_status not null default 'draft',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);
-- Exactly one active config at a time (ARCHITECTURE §4.3).
create unique index scoring_configs_one_active_idx on public.scoring_configs (status)
  where status = 'active';

create table public.assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  assessment_id uuid not null references public.assessments (id),
  org_id uuid references public.organizations (id),
  status public.session_status not null default 'in_progress',
  served_questions jsonb not null, -- [{questionId, version, optionIds:[...ordered]}]
  seed text not null,
  scoring_config_id uuid not null references public.scoring_configs (id),
  claim_token uuid, -- proof-of-possession for cross-account claiming (§5.2)
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create index assessment_sessions_user_idx on public.assessment_sessions (user_id, status);
-- One in-progress session per user per assessment; starting again resumes.
create unique index assessment_sessions_one_active_idx
  on public.assessment_sessions (user_id, assessment_id)
  where status = 'in_progress';

create table public.responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.assessment_sessions (id) on delete cascade,
  question_id uuid not null references public.questions (id),
  option_id uuid not null references public.answer_options (id),
  answered_at timestamptz not null default now(),
  time_spent_ms int,
  unique (session_id, question_id) -- autosave is an upsert
);
create index responses_session_id_idx on public.responses (session_id);

create table public.results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.assessment_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  overall_score int not null check (overall_score between 0 and 100),
  competency_scores jsonb not null,
  persona_id uuid not null references public.personas (id),
  secondary_persona_id uuid references public.personas (id),
  persona_affinities jsonb not null default '[]'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  blind_spots jsonb not null default '[]'::jsonb,
  confidence jsonb not null,
  scoring_config_id uuid not null references public.scoring_configs (id),
  scoring_snapshot jsonb not null, -- frozen signals+config for reproducibility (§11.4)
  created_at timestamptz not null default now()
);
create index results_user_id_idx on public.results (user_id, created_at desc);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique,
  result_id uuid not null unique references public.results (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  issued_at timestamptz not null default now(),
  expires_at timestamptz, -- permanently null under Decision 6; column kept for policy changes
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);
create index certificates_user_id_idx on public.certificates (user_id);

create table public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null unique references public.results (id) on delete cascade,
  status public.recommendation_status not null default 'pending',
  content jsonb,
  model text,
  prompt_version text,
  reviewed_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger ai_recommendations_updated_at before update on public.ai_recommendations
  for each row execute function public.set_updated_at();

create table public.events (
  id bigint generated always as identity primary key,
  user_id uuid,
  session_id uuid,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index events_type_idx on public.events (type, created_at);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  diff jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

-- ---------- RLS ----------
-- scoring_configs: server-only (crown jewels). No authenticated policies.
alter table public.scoring_configs enable row level security;
create policy "super_admin manages scoring configs" on public.scoring_configs
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- Sessions: owned rows, anonymous users included (they take assessments).
alter table public.assessment_sessions enable row level security;
create policy "users read own sessions" on public.assessment_sessions
  for select using (user_id = auth.uid());
create policy "users start own sessions" on public.assessment_sessions
  for insert with check (user_id = auth.uid());
create policy "users update own sessions" on public.assessment_sessions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "super_admin reads sessions" on public.assessment_sessions
  for select using (public.is_super_admin());

alter table public.responses enable row level security;
create policy "users manage own responses" on public.responses
  for all using (
    exists (
      select 1 from public.assessment_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.assessment_sessions s
      where s.id = session_id and s.user_id = auth.uid() and s.status = 'in_progress'
    )
  );

-- Results: the Decision-1 gate is IN the database — anonymous users cannot
-- read even their own result. Writes are service-role only (no insert policy).
alter table public.results enable row level security;
create policy "permanent users read own results" on public.results
  for select using (user_id = auth.uid() and public.is_permanent_user());
create policy "super_admin reads results" on public.results
  for select using (public.is_super_admin());

alter table public.certificates enable row level security;
create policy "permanent users read own certificates" on public.certificates
  for select using (user_id = auth.uid() and public.is_permanent_user());
create policy "super_admin reads certificates" on public.certificates
  for select using (public.is_super_admin());

alter table public.ai_recommendations enable row level security;
create policy "permanent users read own recommendations" on public.ai_recommendations
  for select using (
    public.is_permanent_user()
    and exists (
      select 1 from public.results r
      where r.id = result_id and r.user_id = auth.uid()
    )
  );
create policy "super_admin manages recommendations" on public.ai_recommendations
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- events / audit_logs: service-role only. RLS on, zero client policies.
alter table public.events enable row level security;
alter table public.audit_logs enable row level security;
create policy "super_admin reads audit logs" on public.audit_logs
  for select using (public.is_super_admin());
