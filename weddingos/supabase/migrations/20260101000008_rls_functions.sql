-- RLS helper functions (section 13). All are SECURITY DEFINER + a pinned
-- search_path so they can read workspace_members/user_profiles without
-- re-triggering RLS on those tables from inside themselves (the
-- "recursive RLS trap" the spec warns about) and without being hijackable
-- via a malicious search_path.

create or replace function public.current_user_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.user_profiles where auth_user_id = auth.uid();
$$;

create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    join public.user_profiles up on up.id = wm.user_id
    where wm.workspace_id = p_workspace_id
      and up.auth_user_id = auth.uid()
      and wm.status = 'Active'
  );
$$;

create or replace function public.has_workspace_role(p_workspace_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    join public.user_profiles up on up.id = wm.user_id
    where wm.workspace_id = p_workspace_id
      and up.auth_user_id = auth.uid()
      and wm.status = 'Active'
      and wm.role = any(p_roles)
  );
$$;

-- Alias kept for naming parity with the spec's suggested function list;
-- "can edit" is always "has one of these roles" in this app's model.
create or replace function public.can_edit_workspace(p_workspace_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_workspace_role(p_workspace_id, p_roles);
$$;

create or replace function public.shares_workspace_with(p_other_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members mine
    join public.user_profiles my_profile on my_profile.id = mine.user_id
    join public.workspace_members theirs
      on theirs.workspace_id = mine.workspace_id and theirs.user_id = p_other_user_id
    where my_profile.auth_user_id = auth.uid()
      and mine.status = 'Active'
      and theirs.status = 'Active'
  );
$$;

-- ---------------------------------------------------------------------
-- Generic "workspace read, role-gated write" policy applier (internal
-- migration-time tool only — dropped at the end of this file so it can
-- never be called at runtime by an application role).
-- ---------------------------------------------------------------------
create or replace function public._apply_workspace_rls(p_table text, p_write_roles text[])
returns void
language plpgsql
as $$
begin
  execute format('alter table public.%I enable row level security', p_table);
  execute format('alter table public.%I force row level security', p_table);
  execute format(
    'create policy %I on public.%I for select using (public.is_workspace_member(workspace_id))',
    p_table || '_select', p_table
  );
  execute format(
    'create policy %I on public.%I for insert with check (public.has_workspace_role(workspace_id, %L))',
    p_table || '_insert', p_table, p_write_roles
  );
  execute format(
    'create policy %I on public.%I for update using (public.has_workspace_role(workspace_id, %L)) with check (public.has_workspace_role(workspace_id, %L))',
    p_table || '_update', p_table, p_write_roles, p_write_roles
  );
  execute format(
    'create policy %I on public.%I for delete using (public.has_workspace_role(workspace_id, %L))',
    p_table || '_delete', p_table, p_write_roles
  );
end;
$$;

-- Planning
select public._apply_workspace_rls('owners', array['Admin','Couple']);
select public._apply_workspace_rls('tasks', array['Admin','Couple','Workstream Lead','Family Editor']);
select public._apply_workspace_rls('decisions', array['Admin','Couple']);

-- Guests / logistics (Family Editor module, section 15)
select public._apply_workspace_rls('households', array['Admin','Couple','Family Editor']);
select public._apply_workspace_rls('guests', array['Admin','Couple','Family Editor']);
select public._apply_workspace_rls('travel_segments', array['Admin','Couple','Family Editor']);
select public._apply_workspace_rls('hotels', array['Admin','Couple','Family Editor']);
select public._apply_workspace_rls('room_types', array['Admin','Couple','Family Editor']);
select public._apply_workspace_rls('rooms', array['Admin','Couple','Family Editor']);
select public._apply_workspace_rls('room_assignments', array['Admin','Couple','Family Editor']);
select public._apply_workspace_rls('vehicles', array['Admin','Couple','Family Editor']);
select public._apply_workspace_rls('drivers', array['Admin','Couple','Family Editor']);
select public._apply_workspace_rls('transport_routes', array['Admin','Couple','Family Editor']);
select public._apply_workspace_rls('transport_assignments', array['Admin','Couple','Family Editor']);

-- Vendor / finance (Finance Lead module, section 15)
select public._apply_workspace_rls('vendors', array['Admin','Couple','Finance Lead']);
select public._apply_workspace_rls('vendor_contacts', array['Admin','Couple','Finance Lead']);
select public._apply_workspace_rls('vendor_quotes', array['Admin','Couple','Finance Lead']);
select public._apply_workspace_rls('contracts', array['Admin','Couple','Finance Lead']);
select public._apply_workspace_rls('budget_categories', array['Admin','Couple','Finance Lead']);
select public._apply_workspace_rls('budget_items', array['Admin','Couple','Finance Lead']);
select public._apply_workspace_rls('payment_schedules', array['Admin','Couple','Finance Lead']);
select public._apply_workspace_rls('payments', array['Admin','Couple','Finance Lead']);
select public._apply_workspace_rls('refunds', array['Admin','Couple','Finance Lead']);

-- Wedding prep (Workstream Lead module, section 15)
select public._apply_workspace_rls('church_profiles', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('church_requirements', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('ceremony_participants', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('ceremony_sequence_items', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('ceremony_items', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('catering_plans', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('menu_items', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('decor_plans', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('decor_deliverables', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('attire_profiles', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('attire_items', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('grooming_appointments', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('photography_plans', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('photo_groups', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('music_cues', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('music_av_plans', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('gift_plans', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('welcome_kits', array['Admin','Couple','Workstream Lead']);
select public._apply_workspace_rls('welcome_kit_items', array['Admin','Couple','Workstream Lead']);

-- Wedding day (Day-of Operator module, section 15)
select public._apply_workspace_rls('run_sheet_items', array['Admin','Couple','Day-of Operator']);
select public._apply_workspace_rls('live_issues', array['Admin','Couple','Day-of Operator']);
select public._apply_workspace_rls('duty_assignments', array['Admin','Couple','Day-of Operator']);
select public._apply_workspace_rls('vendor_day_statuses', array['Admin','Couple','Day-of Operator']);
select public._apply_workspace_rls('ceremony_item_movements', array['Admin','Couple','Day-of Operator']);
select public._apply_workspace_rls('emergency_contacts', array['Admin','Couple','Day-of Operator']);
select public._apply_workspace_rls('emergency_response_cards', array['Admin','Couple','Day-of Operator']);
select public._apply_workspace_rls('closeout_items', array['Admin','Couple','Day-of Operator']);
select public._apply_workspace_rls('final_readiness_reviews', array['Admin','Couple','Day-of Operator']);
select public._apply_workspace_rls('guest_operational_statuses', array['Admin','Couple','Day-of Operator']);
select public._apply_workspace_rls('manifest_freeze_states', array['Admin','Couple','Day-of Operator']);

drop function public._apply_workspace_rls(text, text[]);

-- ---------------------------------------------------------------------
-- Tables that don't fit the generic pattern get hand-written policies.
-- ---------------------------------------------------------------------

-- workspaces: any authenticated user may create one (they become Admin via
-- create_workspace_with_admin()); only members can read; only Admin/Couple
-- can rename/update; only Admin can delete (app does not expose workspace
-- deletion in this phase — see docs/SECURITY_CHECKLIST.md).
alter table public.workspaces enable row level security;
alter table public.workspaces force row level security;
create policy workspaces_select on public.workspaces
  for select using (public.is_workspace_member(id));
create policy workspaces_insert on public.workspaces
  for insert with check (auth.uid() is not null);
create policy workspaces_update on public.workspaces
  for update using (public.has_workspace_role(id, array['Admin','Couple']))
  with check (public.has_workspace_role(id, array['Admin','Couple']));
create policy workspaces_delete on public.workspaces
  for delete using (public.has_workspace_role(id, array['Admin']));

-- workspace_settings
alter table public.workspace_settings enable row level security;
alter table public.workspace_settings force row level security;
create policy workspace_settings_select on public.workspace_settings
  for select using (public.is_workspace_member(workspace_id));
create policy workspace_settings_insert on public.workspace_settings
  for insert with check (public.has_workspace_role(workspace_id, array['Admin','Couple']));
create policy workspace_settings_update on public.workspace_settings
  for update using (public.has_workspace_role(workspace_id, array['Admin','Couple']))
  with check (public.has_workspace_role(workspace_id, array['Admin','Couple']));

-- user_profiles: a user always sees/edits their own row, plus can see the
-- profiles of people they share an active workspace with (for member lists).
alter table public.user_profiles enable row level security;
alter table public.user_profiles force row level security;
create policy user_profiles_select on public.user_profiles
  for select using (auth_user_id = auth.uid() or public.shares_workspace_with(id));
create policy user_profiles_insert on public.user_profiles
  for insert with check (auth_user_id = auth.uid());
create policy user_profiles_update on public.user_profiles
  for update using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());

-- workspace_members: everyone can see their own membership row (so the UI
-- can tell an Invited/Removed user why they have no access); members can
-- see fellow members of a workspace they're active in. Only Admin/Couple
-- can insert/update/delete directly — the invite-accept flow uses the
-- accept_workspace_invite() SECURITY DEFINER RPC instead of a raw insert,
-- so an unrelated user can never self-grant membership.
alter table public.workspace_members enable row level security;
alter table public.workspace_members force row level security;
create policy workspace_members_select on public.workspace_members
  for select using (
    user_id = public.current_user_profile_id() or public.is_workspace_member(workspace_id)
  );
create policy workspace_members_insert on public.workspace_members
  for insert with check (public.has_workspace_role(workspace_id, array['Admin','Couple']));
create policy workspace_members_update on public.workspace_members
  for update using (public.has_workspace_role(workspace_id, array['Admin','Couple']))
  with check (public.has_workspace_role(workspace_id, array['Admin','Couple']));
create policy workspace_members_delete on public.workspace_members
  for delete using (public.has_workspace_role(workspace_id, array['Admin','Couple']));

-- Only Admin may grant the Admin role itself (section 9: "no
-- membership-role escalation unless Admin"), enforced server-side, not
-- just in the UI.
--
-- Two trusted SECURITY DEFINER RPCs (create_workspace_with_admin,
-- accept_workspace_invite in the next migration) legitimately need to
-- insert an Admin-role row without an existing Admin having acted: the
-- very first member of a brand-new workspace, and a user accepting an
-- Admin-role invite that an existing Admin already approved at invite-
-- creation time (see enforce_invite_role_rule below). Both set the
-- transaction-local app.bypass_role_guard flag immediately before that
-- one insert rather than being exempted by identity, so the bypass is
-- explicit and scoped to a single statement, not a standing hole.
create or replace function public.enforce_role_assignment_rule()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'Admin' and (tg_op = 'INSERT' or old.role is distinct from new.role) then
    if current_setting('app.bypass_role_guard', true) = 'true' then
      return new;
    end if;
    if not public.has_workspace_role(new.workspace_id, array['Admin']) then
      raise exception 'Only an Admin can grant the Admin role.';
    end if;
  end if;
  return new;
end;
$$;
create trigger trg_workspace_members_role_guard
  before insert or update of role on public.workspace_members
  for each row execute function public.enforce_role_assignment_rule();

-- Couple cannot create an Admin-role invite either (same "no escalation
-- unless Admin" rule, applied at invite-creation time so
-- accept_workspace_invite can safely trust an invite's stored role later).
create or replace function public.enforce_invite_role_rule()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'Admin' and not public.has_workspace_role(new.workspace_id, array['Admin']) then
    raise exception 'Only an Admin can create an invite for the Admin role.';
  end if;
  return new;
end;
$$;
create trigger trg_workspace_invites_role_guard
  before insert on public.workspace_invites
  for each row execute function public.enforce_invite_role_rule();

-- workspace_invites: only Admin/Couple manage invites directly. The
-- join flow (marking an invite Used) happens inside
-- accept_workspace_invite(), not via a client update, because the joining
-- user isn't a member yet and can't satisfy has_workspace_role().
alter table public.workspace_invites enable row level security;
alter table public.workspace_invites force row level security;
create policy workspace_invites_select on public.workspace_invites
  for select using (public.has_workspace_role(workspace_id, array['Admin','Couple']));
create policy workspace_invites_insert on public.workspace_invites
  for insert with check (public.has_workspace_role(workspace_id, array['Admin','Couple']));
create policy workspace_invites_update on public.workspace_invites
  for update using (public.has_workspace_role(workspace_id, array['Admin','Couple']))
  with check (public.has_workspace_role(workspace_id, array['Admin','Couple']));
create policy workspace_invites_delete on public.workspace_invites
  for delete using (public.has_workspace_role(workspace_id, array['Admin','Couple']));

-- documents: everyone in the workspace can read; Admin/Couple/Finance Lead
-- can upload; delete/soft-delete allowed for Admin/Couple or the original
-- uploader (section 40).
alter table public.documents enable row level security;
alter table public.documents force row level security;
create policy documents_select on public.documents
  for select using (public.is_workspace_member(workspace_id));
create policy documents_insert on public.documents
  for insert with check (public.has_workspace_role(workspace_id, array['Admin','Couple','Finance Lead']));
create policy documents_update on public.documents
  for update using (
    public.has_workspace_role(workspace_id, array['Admin','Couple']) or uploaded_by = public.current_user_profile_id()
  )
  with check (
    public.has_workspace_role(workspace_id, array['Admin','Couple']) or uploaded_by = public.current_user_profile_id()
  );

-- audit_logs: append-only. Any active member can write a row attributed to
-- themselves (so their own actions get logged); only Admin/Couple can read
-- the log (section 44). No update/delete policy at all — nothing can
-- modify or remove an audit entry through the API.
alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;
create policy audit_logs_select on public.audit_logs
  for select using (public.has_workspace_role(workspace_id, array['Admin','Couple']));
create policy audit_logs_insert on public.audit_logs
  for insert with check (public.is_workspace_member(workspace_id) and user_id = public.current_user_profile_id());

-- data_migrations: Admin/Couple only, full stop.
alter table public.data_migrations enable row level security;
alter table public.data_migrations force row level security;
create policy data_migrations_select on public.data_migrations
  for select using (public.has_workspace_role(workspace_id, array['Admin','Couple']));
create policy data_migrations_insert on public.data_migrations
  for insert with check (public.has_workspace_role(workspace_id, array['Admin','Couple']));
create policy data_migrations_update on public.data_migrations
  for update using (public.has_workspace_role(workspace_id, array['Admin','Couple']))
  with check (public.has_workspace_role(workspace_id, array['Admin','Couple']));
