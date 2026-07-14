-- Taxonomy: competencies, traits (facet layer), personas.
-- Admin-managed content (Decision 2) — never hardcoded (PROJECT_RULES).

create table public.competencies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  display_order int not null default 0,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger competencies_updated_at before update on public.competencies
  for each row execute function public.set_updated_at();

create table public.traits (
  id uuid primary key default gen_random_uuid(),
  competency_id uuid not null references public.competencies (id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text not null default '',
  display_order int not null default 0,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index traits_competency_id_idx on public.traits (competency_id);
create trigger traits_updated_at before update on public.traits
  for each row execute function public.set_updated_at();

create table public.personas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  artwork_url text,
  display_order int not null default 0,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger personas_updated_at before update on public.personas
  for each row execute function public.set_updated_at();

-- RLS: published taxonomy is readable by any authenticated user (names and
-- descriptions appear in results); only super_admin writes.
alter table public.competencies enable row level security;
create policy "read published competencies" on public.competencies
  for select to authenticated using (status = 'published' and deleted_at is null);
create policy "super_admin manages competencies" on public.competencies
  for all using (public.is_super_admin()) with check (public.is_super_admin());

alter table public.traits enable row level security;
create policy "read published traits" on public.traits
  for select to authenticated using (status = 'published');
create policy "super_admin manages traits" on public.traits
  for all using (public.is_super_admin()) with check (public.is_super_admin());

alter table public.personas enable row level security;
create policy "read published personas" on public.personas
  for select to authenticated using (status = 'published' and deleted_at is null);
create policy "super_admin manages personas" on public.personas
  for all using (public.is_super_admin()) with check (public.is_super_admin());
