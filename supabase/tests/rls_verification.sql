-- RLS verification (run with: psql $DB_URL -f supabase/tests/rls_verification.sql
-- or `supabase db execute` once the project is linked).
-- Simulates JWT claims per role and asserts the critical policies. Read-only
-- checks raise an exception on failure, so a clean run = all policies hold.

begin;

-- Helper: impersonate a role with claims.
create or replace function pg_temp.impersonate(p_role text, p_claims jsonb)
returns void language plpgsql as $$
begin
  perform set_config('role', p_role, true);
  perform set_config('request.jwt.claims', p_claims::text, true);
end;
$$;

do $$
declare
  v_count int;
  v_anon_user uuid := gen_random_uuid();
  v_perm_user uuid := gen_random_uuid();
begin
  -- Seed two auth users (superuser context).
  insert into auth.users (id, email, is_anonymous) values (v_anon_user, null, true);
  insert into auth.users (id, email, is_anonymous) values (v_perm_user, 'perm@test.dev', false);

  ---------------------------------------------------------------------------
  -- 1. THE CROWN JEWELS: authenticated users must see ZERO signal rows.
  ---------------------------------------------------------------------------
  perform pg_temp.impersonate('authenticated', jsonb_build_object(
    'sub', v_perm_user::text, 'role', 'authenticated',
    'app_metadata', jsonb_build_object('role', 'user')));

  select count(*) into v_count from public.option_signals;
  if v_count <> 0 then
    raise exception 'FAIL: authenticated user can read % option_signals rows', v_count;
  end if;

  select count(*) into v_count from public.scoring_configs;
  if v_count <> 0 then
    raise exception 'FAIL: authenticated user can read % scoring_configs rows', v_count;
  end if;

  select count(*) into v_count from public.events;
  if v_count <> 0 then
    raise exception 'FAIL: authenticated user can read events';
  end if;

  ---------------------------------------------------------------------------
  -- 2. Published content IS readable (questions without signals).
  ---------------------------------------------------------------------------
  select count(*) into v_count from public.questions where status = 'published';
  if v_count = 0 then
    raise exception 'FAIL: authenticated user cannot read published questions';
  end if;

  select count(*) into v_count from public.competencies;
  if v_count = 0 then
    raise exception 'FAIL: authenticated user cannot read competencies';
  end if;

  ---------------------------------------------------------------------------
  -- 3. Session ownership: users see only their own sessions.
  ---------------------------------------------------------------------------
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', '', true);

  insert into public.assessment_sessions (id, user_id, assessment_id, served_questions, seed, scoring_config_id)
  values ('99999999-9999-4999-8999-999999999999', v_anon_user,
          'f1000000-0000-4000-8000-000000000001', '[]'::jsonb, 'seed',
          'f2000000-0000-4000-8000-000000000001');

  perform pg_temp.impersonate('authenticated', jsonb_build_object(
    'sub', v_perm_user::text, 'role', 'authenticated', 'is_anonymous', false,
    'app_metadata', jsonb_build_object('role', 'user')));
  select count(*) into v_count from public.assessment_sessions
    where id = '99999999-9999-4999-8999-999999999999';
  if v_count <> 0 then
    raise exception 'FAIL: user can read another user''s session';
  end if;

  perform pg_temp.impersonate('authenticated', jsonb_build_object(
    'sub', v_anon_user::text, 'role', 'authenticated', 'is_anonymous', true,
    'app_metadata', jsonb_build_object('role', 'user')));
  select count(*) into v_count from public.assessment_sessions
    where id = '99999999-9999-4999-8999-999999999999';
  if v_count <> 1 then
    raise exception 'FAIL: owner (anonymous) cannot read own session';
  end if;

  ---------------------------------------------------------------------------
  -- 4. THE DECISION-1 GATE: anonymous owner cannot read own RESULT;
  --    the same user as permanent can.
  ---------------------------------------------------------------------------
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', '', true);
  insert into public.results (session_id, user_id, overall_score, competency_scores,
    persona_id, confidence, scoring_config_id, scoring_snapshot)
  values ('99999999-9999-4999-8999-999999999999', v_anon_user, 50, '{}'::jsonb,
    'b1000000-0000-4000-8000-000000000001', '{}'::jsonb,
    'f2000000-0000-4000-8000-000000000001', '{}'::jsonb);

  perform pg_temp.impersonate('authenticated', jsonb_build_object(
    'sub', v_anon_user::text, 'role', 'authenticated', 'is_anonymous', true,
    'app_metadata', jsonb_build_object('role', 'user')));
  select count(*) into v_count from public.results where user_id = v_anon_user;
  if v_count <> 0 then
    raise exception 'FAIL: ANONYMOUS user can read own result (Decision 1 gate broken)';
  end if;

  perform pg_temp.impersonate('authenticated', jsonb_build_object(
    'sub', v_anon_user::text, 'role', 'authenticated', 'is_anonymous', false,
    'app_metadata', jsonb_build_object('role', 'user')));
  select count(*) into v_count from public.results where user_id = v_anon_user;
  if v_count <> 1 then
    raise exception 'FAIL: permanent user cannot read own result';
  end if;

  ---------------------------------------------------------------------------
  -- 5. Content writes require super_admin.
  ---------------------------------------------------------------------------
  begin
    insert into public.questions (title, scenario, status) values ('x', 'x', 'published');
    raise exception 'FAIL: regular user can insert questions';
  exception
    when insufficient_privilege then null; -- expected
  end;

  raise notice 'RLS VERIFICATION PASSED';
end;
$$;

rollback;
