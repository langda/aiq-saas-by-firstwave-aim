-- Foundation: enums, helpers, organizations, profiles, auth triggers.
-- Every table ships with RLS enabled and its policies in the same migration.

create extension if not exists "pgcrypto";

-- ---------- enums ----------
create type public.user_role as enum ('super_admin', 'org_admin', 'trainer', 'user');
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.session_status as enum ('in_progress', 'completed', 'abandoned', 'expired');
create type public.config_status as enum ('draft', 'active', 'retired');
create type public.recommendation_status as enum ('pending', 'generated', 'failed', 'reviewed');

-- ---------- helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Role claim readers. Role/org are stamped into app_metadata by the profile
-- sync trigger below, so RLS never needs a join to profiles.
create or replace function public.jwt_role()
returns text language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'user');
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable as $$
  select public.jwt_role() = 'super_admin';
$$;

-- Anonymous users are authenticated but must never read results (Decision 1).
create or replace function public.is_permanent_user()
returns boolean language sql stable as $$
  select auth.uid() is not null
     and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false;
$$;

-- ---------- organizations ----------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger organizations_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
create policy "super_admin manages organizations" on public.organizations
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "members read own organization" on public.organizations
  for select using (
    deleted_at is null
    and id::text = (auth.jwt() -> 'app_metadata' ->> 'org_id')
  );

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'user',
  org_id uuid references public.organizations (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index profiles_org_id_idx on public.profiles (org_id);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
create policy "users read own profile" on public.profiles
  for select using (id = auth.uid());
create policy "users update own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid() and role = 'user');
create policy "super_admin manages profiles" on public.profiles
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- Create a profile for every new auth user (anonymous included).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep email in sync when an anonymous user converts to permanent.
create or replace function public.handle_user_updated()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
  set email = coalesce(new.email, email),
      full_name = coalesce(new.raw_user_meta_data ->> 'full_name', full_name)
  where id = new.id;
  return new;
end;
$$;
create trigger on_auth_user_updated after update on auth.users
  for each row execute function public.handle_user_updated();

-- Stamp role/org into auth app_metadata so the JWT carries them (no auth-hook
-- dashboard configuration required). Takes effect on next token refresh.
create or replace function public.sync_role_claim()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', new.role::text)
    || case when new.org_id is null then '{}'::jsonb
            else jsonb_build_object('org_id', new.org_id::text) end
  where id = new.id;
  return new;
end;
$$;
create trigger on_profile_role_changed
  after insert or update of role, org_id on public.profiles
  for each row execute function public.sync_role_claim();
