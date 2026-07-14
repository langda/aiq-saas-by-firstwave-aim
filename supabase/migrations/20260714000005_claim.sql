-- Atomic cross-account session claiming (ARCHITECTURE §5.2, self-review §19.7).
-- An anonymous user completed a session; the human behind it signed in to an
-- EXISTING account (new user_id). Proof-of-possession is the claim_token the
-- anonymous browser received at submit. Single transaction, token invalidated
-- on success. Service-role only — clients cannot execute it.

create or replace function public.claim_session(
  p_session_id uuid,
  p_claim_token uuid,
  p_new_user uuid
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_user uuid;
begin
  select user_id into v_old_user
  from public.assessment_sessions
  where id = p_session_id
    and claim_token is not null
    and claim_token = p_claim_token
  for update;

  if v_old_user is null then
    return false; -- wrong token or already claimed
  end if;

  if v_old_user = p_new_user then
    -- Same identity (in-place anonymous conversion) — just invalidate the token.
    update public.assessment_sessions set claim_token = null where id = p_session_id;
    return true;
  end if;

  -- responses re-parent implicitly: they key off the session, not the user.
  update public.assessment_sessions
    set user_id = p_new_user, claim_token = null
    where id = p_session_id;
  update public.results set user_id = p_new_user where session_id = p_session_id;
  update public.certificates set user_id = p_new_user
    where result_id in (select id from public.results where session_id = p_session_id);

  return true;
end;
$$;

revoke execute on function public.claim_session(uuid, uuid, uuid) from public;
revoke execute on function public.claim_session(uuid, uuid, uuid) from anon;
revoke execute on function public.claim_session(uuid, uuid, uuid) from authenticated;
grant execute on function public.claim_session(uuid, uuid, uuid) to service_role;
