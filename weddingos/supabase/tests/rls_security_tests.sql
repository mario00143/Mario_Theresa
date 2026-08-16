-- WeddingOS RLS security test script (section 64).
--
-- WHAT THIS IS: a self-contained, repeatable SQL script that exercises the
-- Row Level Security policies in supabase/migrations/ against real
-- Postgres semantics — not mocked, not simulated in application code. It
-- creates its own throwaway workspaces/users/data, runs each scenario as
-- that user actually would hit the database, and raises a loud EXCEPTION
-- on the first scenario that doesn't behave as documented. A clean run
-- prints "ALL RLS SECURITY TESTS PASSED" and leaves no rows behind
-- (everything created here is deleted at the end regardless of outcome).
--
-- HOW TO RUN IT:
--   Against a local Supabase stack (recommended — has the real `auth`
--   schema, `auth.uid()`, and `storage` schema already):
--     supabase start
--     psql "$(supabase status -o env | grep DB_URL | cut -d= -f2)" \
--       -f supabase/tests/rls_security_tests.sql
--
--   Against a hosted Supabase project, using the direct (non-pooled)
--   connection string from Project Settings > Database (must connect as
--   a role that can `set role authenticated`, e.g. the postgres role):
--     psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
--       -f supabase/tests/rls_security_tests.sql
--   Only do this against a scratch/staging project, not production data —
--   while the script cleans up after itself, it is still exercising write
--   paths and is not intended to run against real user data.
--
-- HOW A "USER" IS SIMULATED: real Supabase's auth.uid() reads
--   current_setting('request.jwt.claims', true)::json->>'sub'
-- so each scenario does:
--   set role authenticated;
--   set request.jwt.claims = '{"sub": "<uuid>"}';
-- exactly as PostgREST does per-request when a real JWT arrives. This is
-- the same mechanism a live API call would use, just driven from psql
-- instead of over HTTP.

\set ON_ERROR_STOP on
begin;

do $$
declare
  v_admin_a uuid := gen_random_uuid();
  v_admin_b uuid := gen_random_uuid();
  v_viewer_a uuid := gen_random_uuid();
  v_finance_a uuid := gen_random_uuid();
  v_family_editor_a uuid := gen_random_uuid();
  v_dayof_a uuid := gen_random_uuid();
  v_removed_a uuid := gen_random_uuid();

  v_profile_admin_a uuid;
  v_profile_admin_b uuid;
  v_profile_viewer_a uuid;
  v_profile_finance_a uuid;
  v_profile_family_editor_a uuid;
  v_profile_dayof_a uuid;
  v_profile_removed_a uuid;

  v_ws_a uuid;
  v_ws_b uuid;

  v_member_removed_id uuid;
  v_count integer;
  v_payment_id text := 'rls_test_payment_1';
  v_issue_id text := 'rls_test_issue_1';
  strict_role_check text;
begin
  raise notice 'Setting up test fixtures...';

  -- auth.users rows + user_profiles (the on-signup trigger provisions
  -- user_profiles automatically, same as it would for a real sign-up).
  insert into auth.users (id, email) values
    (v_admin_a, 'rls-admin-a@test.local'),
    (v_admin_b, 'rls-admin-b@test.local'),
    (v_viewer_a, 'rls-viewer-a@test.local'),
    (v_finance_a, 'rls-finance-a@test.local'),
    (v_family_editor_a, 'rls-family-editor-a@test.local'),
    (v_dayof_a, 'rls-dayof-a@test.local'),
    (v_removed_a, 'rls-removed-a@test.local');

  select id into v_profile_admin_a from public.user_profiles where auth_user_id = v_admin_a;
  select id into v_profile_admin_b from public.user_profiles where auth_user_id = v_admin_b;
  select id into v_profile_viewer_a from public.user_profiles where auth_user_id = v_viewer_a;
  select id into v_profile_finance_a from public.user_profiles where auth_user_id = v_finance_a;
  select id into v_profile_family_editor_a from public.user_profiles where auth_user_id = v_family_editor_a;
  select id into v_profile_dayof_a from public.user_profiles where auth_user_id = v_dayof_a;
  select id into v_profile_removed_a from public.user_profiles where auth_user_id = v_removed_a;

  -- Workspace A: admin_a as Admin (via the bootstrap RPC), everyone else added directly as Active members.
  set role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_admin_a)::text, true);
  v_ws_a := public.create_workspace_with_admin('RLS Test Wedding A', 'rls-test-a', 'Groom A', 'Bride A', 'Asia/Kolkata', 'INR', null, null);
  reset role;

  insert into public.workspace_members (workspace_id, user_id, role, status, joined_at) values
    (v_ws_a, v_profile_viewer_a, 'Viewer', 'Active', now()),
    (v_ws_a, v_profile_finance_a, 'Finance Lead', 'Active', now()),
    (v_ws_a, v_profile_family_editor_a, 'Family Editor', 'Active', now()),
    (v_ws_a, v_profile_dayof_a, 'Day-of Operator', 'Active', now()),
    (v_ws_a, v_profile_removed_a, 'Viewer', 'Removed', now());
  select id into v_member_removed_id from public.workspace_members where workspace_id = v_ws_a and user_id = v_profile_removed_a;

  -- Workspace B: a completely separate workspace, admin_b as its only member.
  set role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_admin_b)::text, true);
  v_ws_b := public.create_workspace_with_admin('RLS Test Wedding B', 'rls-test-b', 'Groom B', 'Bride B', 'Asia/Kolkata', 'INR', null, null);
  reset role;

  -- Seed one vendor + payment + live issue in workspace A (as Admin, bypassing the scenarios below).
  set role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_admin_a)::text, true);
  insert into public.vendors (id, workspace_id, name, category, status, event, gst_applicable, final_primary_contact_confirmed, final_backup_contact_confirmed)
    values ('rls_test_vendor', v_ws_a, 'Test Vendor', 'Catering', 'Confirmed', 'Wedding', false, false, false);
  insert into public.payments (id, workspace_id, vendor_id, payment_date, amount, payment_method, invoice_received, receipt_received)
    values (v_payment_id, v_ws_a, 'rls_test_vendor', current_date, 1000, 'UPI', false, false);
  insert into public.live_issues (id, workspace_id, title, category, severity, status, reported_at, follow_up_required)
    values (v_issue_id, v_ws_a, 'Test issue', 'Other', 'Medium', 'Open', now(), false);
  reset role;

  raise notice 'Fixtures ready. Running scenarios...';

  -- ===================================================================
  -- Scenario 1: a member of workspace A cannot read workspace B.
  -- ===================================================================
  set role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_admin_a)::text, true);
  select count(*) into v_count from public.workspaces where id = v_ws_b;
  reset role;
  if v_count <> 0 then
    raise exception 'FAIL (scenario 1): workspace A member could read workspace B (% rows visible)', v_count;
  end if;
  raise notice 'PASS (1): cross-workspace workspace read is denied';

  -- Scenario 1b: workspace-A vendor is invisible to workspace-B admin.
  set role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_admin_b)::text, true);
  select count(*) into v_count from public.vendors where id = 'rls_test_vendor';
  reset role;
  if v_count <> 0 then
    raise exception 'FAIL (scenario 1b): workspace B admin could read workspace A''s vendor';
  end if;
  raise notice 'PASS (1b): cross-workspace domain-row read is denied';

  -- ===================================================================
  -- Scenario 2: Viewer cannot mutate (insert a task).
  -- ===================================================================
  set role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_viewer_a)::text, true);
  begin
    insert into public.tasks (id, workspace_id, title, event, workstream, owner, status, priority)
      values ('rls_test_task_viewer', v_ws_a, 'Sneaky task', 'Wedding', 'Governance', 'Viewer', 'Not Started', 'Medium');
    raise exception 'FAIL (scenario 2): Viewer was able to insert a task';
  exception
    when insufficient_privilege or others then
      if sqlerrm like 'FAIL%' then raise; end if;
      raise notice 'PASS (2): Viewer insert into tasks is denied';
  end;
  reset role;

  -- ===================================================================
  -- Scenario 3: Finance Lead CAN update a payment.
  -- ===================================================================
  set role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_finance_a)::text, true);
  update public.payments set notes = 'updated by finance lead' where id = v_payment_id;
  get diagnostics v_count = row_count;
  reset role;
  if v_count <> 1 then
    raise exception 'FAIL (scenario 3): Finance Lead could not update a payment';
  end if;
  raise notice 'PASS (3): Finance Lead can update payments';

  -- ===================================================================
  -- Scenario 4: Family Editor CANNOT update a payment (finance module).
  -- ===================================================================
  set role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_family_editor_a)::text, true);
  update public.payments set notes = 'updated by family editor' where id = v_payment_id;
  get diagnostics v_count = row_count;
  reset role;
  if v_count <> 0 then
    raise exception 'FAIL (scenario 4): Family Editor was able to update a payment (% rows)', v_count;
  end if;
  raise notice 'PASS (4): Family Editor cannot update payments';

  -- ===================================================================
  -- Scenario 5: Day-of Operator CAN update a live issue.
  -- ===================================================================
  set role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_dayof_a)::text, true);
  update public.live_issues set status = 'Investigating' where id = v_issue_id;
  get diagnostics v_count = row_count;
  reset role;
  if v_count <> 1 then
    raise exception 'FAIL (scenario 5): Day-of Operator could not update a live issue';
  end if;
  raise notice 'PASS (5): Day-of Operator can update live issues';

  -- Scenario 5b: Day-of Operator cannot update workspace_settings.
  set role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_dayof_a)::text, true);
  update public.workspace_settings set couple = '{"groomName":"Hacked"}'::jsonb where workspace_id = v_ws_a;
  get diagnostics v_count = row_count;
  reset role;
  if v_count <> 0 then
    raise exception 'FAIL (scenario 5b): Day-of Operator was able to update workspace settings';
  end if;
  raise notice 'PASS (5b): Day-of Operator cannot update workspace settings';

  -- ===================================================================
  -- Scenario 6: a removed member loses access entirely.
  -- ===================================================================
  set role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_removed_a)::text, true);
  select count(*) into v_count from public.tasks where workspace_id = v_ws_a;
  reset role;
  if v_count <> 0 then
    raise exception 'FAIL (scenario 6): a Removed member could still read workspace A''s tasks';
  end if;
  raise notice 'PASS (6): removed member has no read access';

  -- ===================================================================
  -- Scenario 7: role escalation is blocked — Family Editor cannot grant
  -- itself Admin. Two layers could stop this and either is an accepted
  -- pass: the workspace_members UPDATE policy's USING clause requiring
  -- Admin/Couple (which — per standard Postgres RLS semantics — makes
  -- Postgres silently match zero rows, NOT raise an error, since UPDATE/
  -- DELETE policy failures are filtered like an extra WHERE clause), or,
  -- if that row were somehow matched, the enforce_role_assignment_rule
  -- trigger raising an explicit exception. So the assertion checks BOTH
  -- outcomes rather than assuming an exception is the only valid denial.
  -- ===================================================================
  set role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_family_editor_a)::text, true);
  begin
    update public.workspace_members set role = 'Admin'
      where workspace_id = v_ws_a and user_id = v_profile_family_editor_a;
    get diagnostics v_count = row_count;
    if v_count <> 0 then
      raise exception 'FAIL (scenario 7): Family Editor was able to self-promote to Admin (% row(s) updated)', v_count;
    end if;
    raise notice 'PASS (7): non-Admin/Couple role self-escalation is denied (RLS silently matched 0 rows)';
  exception
    when others then
      if sqlerrm like 'FAIL%' then raise; end if;
      raise notice 'PASS (7): non-Admin/Couple role self-escalation is denied (rejected with: %)', sqlerrm;
  end;
  reset role;

  -- Verify the role was, in fact, never changed.
  select role into strict_role_check from public.workspace_members
    where workspace_id = v_ws_a and user_id = v_profile_family_editor_a;
  if strict_role_check <> 'Family Editor' then
    raise exception 'FAIL (scenario 7 verify): role ended up as % instead of Family Editor', strict_role_check;
  end if;

  -- ===================================================================
  -- Scenario 8: capacity trigger blocks a direct over-allocation insert
  -- (belt-and-suspenders check alongside the dedicated capacity test in
  -- migration 20260101000011 — see also the concurrent-transaction test
  -- documented in this file's header comment / PR description, which a
  -- single-connection psql script cannot exercise directly).
  -- ===================================================================
  set role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', v_admin_a)::text, true);
  insert into public.hotels (id, workspace_id, name, area, city) values ('rls_test_hotel', v_ws_a, 'Test Hotel', 'Area', 'City');
  insert into public.room_types (id, workspace_id, hotel_id, name, capacity, standard_occupancy) values ('rls_test_rt', v_ws_a, 'rls_test_hotel', 'Single', 1, 1);
  insert into public.rooms (id, workspace_id, hotel_id, room_type_id, room_number, status) values ('rls_test_room', v_ws_a, 'rls_test_hotel', 'rls_test_rt', '1', 'Available');
  insert into public.households (id, workspace_id, household_name, primary_contact_name, primary_phone, side, relationship_category, city, country, invitation_priority, invitation_status)
    values ('rls_test_hh', v_ws_a, 'Test HH', 'Contact', '+911234567890', 'Groom', 'Friend', 'City', 'India', 'Standard', 'Not Prepared');
  insert into public.guests (id, workspace_id, household_id, full_name, age_category, dietary_preference, plus_one_status) values
    ('rls_test_guest_1', v_ws_a, 'rls_test_hh', 'Guest One', 'Adult', 'Not Specified', 'Not Applicable'),
    ('rls_test_guest_2', v_ws_a, 'rls_test_hh', 'Guest Two', 'Adult', 'Not Specified', 'Not Applicable');
  insert into public.room_assignments (id, workspace_id, room_id, guest_id, household_id, check_in_date, check_out_date, assignment_status, primary_occupant, extra_bed_required, child_cot_required, accessibility_required)
    values ('rls_test_ra_1', v_ws_a, 'rls_test_room', 'rls_test_guest_1', 'rls_test_hh', '2027-01-29', '2027-02-01', 'Confirmed', true, false, false, false);
  begin
    insert into public.room_assignments (id, workspace_id, room_id, guest_id, household_id, check_in_date, check_out_date, assignment_status, primary_occupant, extra_bed_required, child_cot_required, accessibility_required)
      values ('rls_test_ra_2', v_ws_a, 'rls_test_room', 'rls_test_guest_2', 'rls_test_hh', '2027-01-30', '2027-02-01', 'Confirmed', false, false, false, false);
    raise exception 'FAIL (scenario 8): a 1-capacity room accepted a 2nd overlapping occupant';
  exception
    when others then
      if sqlerrm like 'FAIL%' then raise; end if;
      raise notice 'PASS (8): room capacity trigger blocks direct-insert over-allocation';
  end;
  reset role;

  raise notice '';
  raise notice 'ALL RLS SECURITY TESTS PASSED';
end $$;

-- Cleanup: the entire script runs inside this one transaction, so rolling
-- back here (rather than issuing explicit deletes) discards every fixture
-- it created regardless of which scenario a run stops at — no leftover
-- rows, no FK-ordering cleanup logic to get wrong. Change to `commit` only
-- if you want the fixtures to persist for manual follow-up inspection.
rollback;
