-- Authoritative, race-condition-safe capacity enforcement (section 26).
--
-- The RPCs in the previous migration (assign_room_capacity_safe /
-- assign_transport_capacity_safe) are one way to write an assignment
-- safely, but the app's existing room/transport assignment repository
-- functions (src/data/repositories/roomAssignmentRepository.ts,
-- transportAssignmentRepository.ts) are synchronous and used throughout
-- Phase 3 UI — retrofitting them to call an async RPC would mean changing
-- their signatures and every call site, which risks regressing working
-- functionality. Instead, capacity is enforced with a BEFORE INSERT/UPDATE
-- trigger directly on the tables: it applies no matter which code path
-- writes the row (the RPC, the generic optimistic store-sync upsert, or a
-- future direct client call), so there's exactly one place capacity can be
-- bypassed from — nowhere.
--
-- Each trigger function locks the parent (room / route's vehicle) before
-- counting current occupants — without that lock, two concurrent
-- transactions could both read "one seat left" and both insert, over-
-- committing the room/vehicle. The lock serializes them: the second
-- transaction blocks until the first commits or rolls back, then re-reads
-- the now-current count.

create or replace function public.enforce_room_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity integer;
  v_occupied integer;
begin
  if new.assignment_status = 'Cancelled' then
    return new;
  end if;

  perform 1 from public.rooms where id = new.room_id for update;

  select coalesce(r.capacity_override, rt.capacity) into v_capacity
  from public.rooms r
  join public.room_types rt on rt.id = r.room_type_id
  where r.id = new.room_id;

  if v_capacity is null then
    return new; -- room_id FK constraint already guarantees the room exists
  end if;

  select count(*) into v_occupied
  from public.room_assignments
  where room_id = new.room_id
    and workspace_id = new.workspace_id
    and assignment_status <> 'Cancelled'
    and id <> new.id
    and check_in_date < new.check_out_date
    and check_out_date > new.check_in_date;

  if v_occupied >= v_capacity then
    raise exception 'Room % is already at capacity (%/%) for these dates.', new.room_id, v_occupied, v_capacity;
  end if;

  return new;
end;
$$;

create trigger trg_room_assignments_capacity
  before insert or update on public.room_assignments
  for each row execute function public.enforce_room_capacity();

create or replace function public.enforce_transport_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity integer;
  v_used integer;
begin
  if new.assignment_status in ('Cancelled', 'No Show') then
    return new;
  end if;

  perform 1 from public.transport_routes where id = new.route_id for update;

  select v.passenger_capacity into v_capacity
  from public.transport_routes r
  join public.vehicles v on v.id = r.vehicle_id
  where r.id = new.route_id;

  if v_capacity is null then
    return new; -- no vehicle assigned to this route yet — nothing to enforce against
  end if;

  select coalesce(sum(seat_count), 0) into v_used
  from public.transport_assignments
  where route_id = new.route_id
    and workspace_id = new.workspace_id
    and assignment_status not in ('Cancelled', 'No Show')
    and id <> new.id;

  if v_used + new.seat_count > v_capacity then
    raise exception 'Route % is already at seat capacity (%/%) — % more seat(s) requested.', new.route_id, v_used, v_capacity, new.seat_count;
  end if;

  return new;
end;
$$;

create trigger trg_transport_assignments_capacity
  before insert or update on public.transport_assignments
  for each row execute function public.enforce_transport_capacity();
