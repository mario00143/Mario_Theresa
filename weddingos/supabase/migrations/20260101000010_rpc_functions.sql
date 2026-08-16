-- RPC functions for workflows that need atomicity a plain client-side
-- insert/update can't provide (section 24, 26, 17, 19-20).

-- Auto-provision a user_profiles row the moment someone signs up, so
-- current_user_profile_id() is never null for a logged-in user.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (auth_user_id, display_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)), new.email)
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------
-- First-run workspace creation (section 17). Bootstraps workspace +
-- creator-as-Admin membership + default settings row atomically —
-- must be SECURITY DEFINER because the caller has no membership yet
-- and so cannot satisfy workspace_members' normal insert policy.
-- ---------------------------------------------------------------------
create or replace function public.create_workspace_with_admin(
  p_name text,
  p_slug text,
  p_groom_name text,
  p_bride_name text,
  p_timezone text,
  p_currency text,
  p_engagement_date date default null,
  p_wedding_date date default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_workspace_id uuid;
begin
  v_user_id := public.current_user_profile_id();
  if v_user_id is null then
    raise exception 'No user profile for the current session.';
  end if;

  insert into public.workspaces (name, slug, groom_name, bride_name, timezone, currency, engagement_date, wedding_date, created_by)
  values (p_name, p_slug, p_groom_name, p_bride_name, p_timezone, p_currency, p_engagement_date, p_wedding_date, v_user_id)
  returning id into v_workspace_id;

  perform set_config('app.bypass_role_guard', 'true', true);
  insert into public.workspace_members (workspace_id, user_id, role, status, joined_at)
  values (v_workspace_id, v_user_id, 'Admin', 'Active', now());

  insert into public.workspace_settings (workspace_id) values (v_workspace_id);

  return v_workspace_id;
end;
$$;

-- ---------------------------------------------------------------------
-- Invite accept (section 19-20). Validates the raw token against the
-- stored hash, checks expiry/single-use, then activates membership and
-- consumes the invite — all inside one transaction so a token can never
-- be used twice even under concurrent requests (the `for update` row lock
-- serializes racing accept attempts on the same invite).
-- ---------------------------------------------------------------------
create or replace function public.accept_workspace_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_invite public.workspace_invites%rowtype;
  v_token_hash text;
begin
  v_user_id := public.current_user_profile_id();
  if v_user_id is null then
    raise exception 'You must be signed in to accept an invite.';
  end if;

  v_token_hash := encode(digest(p_token, 'sha256'), 'hex');

  select * into v_invite from public.workspace_invites
    where token_hash = v_token_hash and status = 'Active'
    for update;

  if not found then
    raise exception 'This invite link is invalid or has already been used.';
  end if;

  if v_invite.expires_at < now() then
    update public.workspace_invites set status = 'Expired' where id = v_invite.id;
    raise exception 'This invite link has expired.';
  end if;

  perform set_config('app.bypass_role_guard', 'true', true);
  insert into public.workspace_members (workspace_id, user_id, role, status, invited_by, invited_at, joined_at)
  values (v_invite.workspace_id, v_user_id, v_invite.role, 'Active', v_invite.invited_by, v_invite.created_at, now())
  on conflict (workspace_id, user_id) do update
    set role = excluded.role, status = 'Active', joined_at = now(), updated_at = now();

  update public.workspace_invites set status = 'Used', used_at = now() where id = v_invite.id;

  return v_invite.workspace_id;
end;
$$;

-- ---------------------------------------------------------------------
-- Capacity-safe room assignment (section 26). Locks the target room so
-- two concurrent devices assigning the last bed can't both succeed, then
-- checks occupancy for the overlapping date range before writing.
-- ---------------------------------------------------------------------
create or replace function public.assign_room_capacity_safe(
  p_id text,
  p_workspace_id uuid,
  p_room_id text,
  p_guest_id text,
  p_household_id text,
  p_check_in_date date,
  p_check_out_date date,
  p_assignment_status text,
  p_primary_occupant boolean,
  p_extra_bed_required boolean,
  p_child_cot_required boolean,
  p_accessibility_required boolean,
  p_confirmation_number text default null,
  p_notes text default null
)
returns public.room_assignments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity integer;
  v_occupied integer;
  v_row public.room_assignments;
begin
  if not public.has_workspace_role(p_workspace_id, array['Admin','Couple','Family Editor']) then
    raise exception 'You do not have permission to assign rooms in this workspace.';
  end if;

  perform 1 from public.rooms where id = p_room_id and workspace_id = p_workspace_id for update;
  if not found then
    raise exception 'Room % not found in this workspace.', p_room_id;
  end if;

  select coalesce(r.capacity_override, rt.capacity) into v_capacity
  from public.rooms r
  join public.room_types rt on rt.id = r.room_type_id
  where r.id = p_room_id;

  select count(*) into v_occupied
  from public.room_assignments
  where room_id = p_room_id
    and workspace_id = p_workspace_id
    and assignment_status <> 'Cancelled'
    and id <> coalesce(p_id, '')
    and check_in_date < p_check_out_date
    and check_out_date > p_check_in_date;

  if v_occupied >= v_capacity then
    raise exception 'Room % is already at capacity (%/%) for the requested dates.', p_room_id, v_occupied, v_capacity;
  end if;

  insert into public.room_assignments (
    id, workspace_id, room_id, guest_id, household_id, check_in_date, check_out_date,
    assignment_status, primary_occupant, extra_bed_required, child_cot_required,
    accessibility_required, confirmation_number, notes, created_by, updated_by
  ) values (
    p_id, p_workspace_id, p_room_id, p_guest_id, p_household_id, p_check_in_date, p_check_out_date,
    p_assignment_status, p_primary_occupant, p_extra_bed_required, p_child_cot_required,
    p_accessibility_required, p_confirmation_number, p_notes,
    public.current_user_profile_id(), public.current_user_profile_id()
  )
  on conflict (id) do update set
    room_id = excluded.room_id, guest_id = excluded.guest_id, household_id = excluded.household_id,
    check_in_date = excluded.check_in_date, check_out_date = excluded.check_out_date,
    assignment_status = excluded.assignment_status, primary_occupant = excluded.primary_occupant,
    extra_bed_required = excluded.extra_bed_required, child_cot_required = excluded.child_cot_required,
    accessibility_required = excluded.accessibility_required, confirmation_number = excluded.confirmation_number,
    notes = excluded.notes, updated_by = public.current_user_profile_id(), updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------
-- Capacity-safe transport assignment (section 26). Same locking pattern,
-- checking summed seat_count for the route's assigned vehicle.
-- ---------------------------------------------------------------------
create or replace function public.assign_transport_capacity_safe(
  p_id text,
  p_workspace_id uuid,
  p_route_id text,
  p_guest_id text,
  p_travel_segment_id text,
  p_pickup_location text,
  p_pickup_date date,
  p_pickup_time time,
  p_drop_location text,
  p_seat_count integer,
  p_luggage_count integer,
  p_assistance_required boolean,
  p_assignment_status text,
  p_notes text default null
)
returns public.transport_assignments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity integer;
  v_used integer;
  v_row public.transport_assignments;
begin
  if not public.has_workspace_role(p_workspace_id, array['Admin','Couple','Family Editor']) then
    raise exception 'You do not have permission to assign transport in this workspace.';
  end if;

  perform 1 from public.transport_routes where id = p_route_id and workspace_id = p_workspace_id for update;
  if not found then
    raise exception 'Route % not found in this workspace.', p_route_id;
  end if;

  select v.passenger_capacity into v_capacity
  from public.transport_routes r
  join public.vehicles v on v.id = r.vehicle_id
  where r.id = p_route_id;

  if v_capacity is null then
    v_capacity := 2147483647; -- no vehicle assigned yet — nothing to enforce against
  end if;

  select coalesce(sum(seat_count), 0) into v_used
  from public.transport_assignments
  where route_id = p_route_id
    and workspace_id = p_workspace_id
    and assignment_status not in ('Cancelled','No Show')
    and id <> coalesce(p_id, '');

  if v_used + p_seat_count > v_capacity then
    raise exception 'Route % is already at seat capacity (%/%) — cannot add % more seat(s).', p_route_id, v_used, v_capacity, p_seat_count;
  end if;

  insert into public.transport_assignments (
    id, workspace_id, route_id, guest_id, travel_segment_id, pickup_location, pickup_date, pickup_time,
    drop_location, seat_count, luggage_count, assistance_required, assignment_status, notes,
    created_by, updated_by
  ) values (
    p_id, p_workspace_id, p_route_id, p_guest_id, p_travel_segment_id, p_pickup_location, p_pickup_date, p_pickup_time,
    p_drop_location, p_seat_count, p_luggage_count, p_assistance_required, p_assignment_status, p_notes,
    public.current_user_profile_id(), public.current_user_profile_id()
  )
  on conflict (id) do update set
    route_id = excluded.route_id, guest_id = excluded.guest_id, travel_segment_id = excluded.travel_segment_id,
    pickup_location = excluded.pickup_location, pickup_date = excluded.pickup_date, pickup_time = excluded.pickup_time,
    drop_location = excluded.drop_location, seat_count = excluded.seat_count, luggage_count = excluded.luggage_count,
    assistance_required = excluded.assistance_required, assignment_status = excluded.assignment_status, notes = excluded.notes,
    updated_by = public.current_user_profile_id(), updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;
