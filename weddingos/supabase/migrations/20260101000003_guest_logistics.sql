-- Guest and logistics tables: households, guests, travel, hotels/rooms, transport.

create table public.households (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  household_name text not null,
  primary_contact_name text not null,
  primary_phone text not null,
  secondary_phone text,
  email text,
  side text not null check (side in ('Groom','Bride','Both')),
  relationship_category text not null,
  relationship_detail text,
  city text not null,
  state text,
  country text not null,
  invitation_priority text not null check (invitation_priority in ('Must Invite','Priority','Standard','Optional')),
  invited_events jsonb not null default '[]',
  invitation_method jsonb not null default '[]',
  invitation_status text not null check (invitation_status in ('Not Prepared','Ready','Sent','Delivered','Follow-up Required','Complete')),
  invitation_owner text,
  rsvp_follow_up_owner text,
  address_line1 text,
  address_line2 text,
  postal_code text,
  notes text,
  prepared_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  courier_tracking_number text,
  delivery_notes text,
  last_follow_up_at timestamptz,
  next_follow_up_at timestamptz,
  follow_up_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_households_workspace_id on public.households(workspace_id);
create trigger trg_households_updated_at before update on public.households
  for each row execute function public.set_updated_at();

create table public.guests (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  household_id text not null references public.households(id) on delete cascade,
  full_name text not null,
  preferred_name text,
  title text,
  age_category text not null check (age_category in ('Adult','Child','Infant')),
  relationship text,
  phone text,
  email text,
  invited_events jsonb not null default '[]',
  rsvp_responses jsonb not null default '[]',
  dietary_preference text not null check (dietary_preference in ('Vegetarian','Non-Vegetarian','Vegan','Jain','Other','Not Specified')),
  dietary_notes text,
  allergies text,
  accessibility_requirements text,
  elderly_assistance_required boolean not null default false,
  infant_requirements text,
  accommodation_required boolean not null default false,
  travel_details_required boolean not null default false,
  pickup_required boolean not null default false,
  plus_one_status text not null check (plus_one_status in ('Not Applicable','Allowed','Confirmed','Declined','Pending')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_guests_workspace_id on public.guests(workspace_id);
create index idx_guests_household_id on public.guests(household_id);
create trigger trg_guests_updated_at before update on public.guests
  for each row execute function public.set_updated_at();

create table public.travel_segments (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  guest_id text not null references public.guests(id) on delete cascade,
  household_id text not null references public.households(id) on delete cascade,
  event text not null check (event in ('Engagement','Wedding','Both')),
  direction text not null check (direction in ('Arrival','Departure','Internal Transfer')),
  travel_mode text not null check (travel_mode in ('Flight','Train','Bus','Car','Taxi','Other')),
  origin text not null,
  destination text not null,
  carrier text,
  service_number text,
  booking_reference text,
  departure_date date,
  departure_time time,
  arrival_date date,
  arrival_time time,
  departure_terminal text,
  arrival_terminal text,
  booking_owner text,
  booking_status text not null check (booking_status in ('Not Required','Not Booked','Planned','Booked','Confirmed','Changed','Cancelled')),
  ticket_confirmed boolean not null default false,
  luggage_notes text,
  special_assistance text,
  pickup_required boolean not null default false,
  drop_required boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_travel_segments_workspace_id on public.travel_segments(workspace_id);
create index idx_travel_segments_guest_id on public.travel_segments(guest_id);
create trigger trg_travel_segments_updated_at before update on public.travel_segments
  for each row execute function public.set_updated_at();

create table public.hotels (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  address text,
  area text not null,
  city text not null,
  primary_contact text,
  phone text,
  email text,
  check_in_time time,
  check_out_time time,
  breakfast_included boolean not null default false,
  breakfast_start_time time,
  breakfast_end_time time,
  early_check_in_policy text,
  late_checkout_policy text,
  parking_available boolean not null default false,
  bus_access boolean not null default false,
  accessible_rooms_available boolean not null default false,
  notes text,
  negotiated_rate_notes text,
  cancellation_notes text,
  group_booking_reference text,
  booking_owner text,
  vendor_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_hotels_workspace_id on public.hotels(workspace_id);
create trigger trg_hotels_updated_at before update on public.hotels
  for each row execute function public.set_updated_at();

create table public.room_types (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  hotel_id text not null references public.hotels(id) on delete cascade,
  name text not null,
  capacity integer not null check (capacity > 0),
  standard_occupancy integer not null,
  extra_bed_allowed boolean not null default false,
  child_cot_allowed boolean not null default false,
  accessible boolean not null default false,
  notes text
);
create index idx_room_types_workspace_id on public.room_types(workspace_id);
create index idx_room_types_hotel_id on public.room_types(hotel_id);

create table public.rooms (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  hotel_id text not null references public.hotels(id) on delete cascade,
  room_type_id text not null references public.room_types(id) on delete cascade,
  room_number text not null,
  floor text,
  capacity_override integer,
  status text not null check (status in ('Available','Reserved','Assigned','Checked In','Checked Out','Out of Service')),
  notes text
);
create index idx_rooms_workspace_id on public.rooms(workspace_id);
create index idx_rooms_hotel_id on public.rooms(hotel_id);
create index idx_rooms_room_type_id on public.rooms(room_type_id);

create table public.room_assignments (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  room_id text not null references public.rooms(id) on delete cascade,
  guest_id text not null references public.guests(id) on delete cascade,
  household_id text not null references public.households(id) on delete cascade,
  check_in_date date not null,
  check_out_date date not null,
  assignment_status text not null check (assignment_status in ('Planned','Confirmed','Checked In','Checked Out','Cancelled')),
  primary_occupant boolean not null default false,
  extra_bed_required boolean not null default false,
  child_cot_required boolean not null default false,
  accessibility_required boolean not null default false,
  confirmation_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_room_assignments_workspace_id on public.room_assignments(workspace_id);
create index idx_room_assignments_room_id on public.room_assignments(room_id);
create index idx_room_assignments_guest_id on public.room_assignments(guest_id);
create trigger trg_room_assignments_updated_at before update on public.room_assignments
  for each row execute function public.set_updated_at();

create table public.vehicles (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  vehicle_type text not null,
  registration_number text,
  passenger_capacity integer not null check (passenger_capacity > 0),
  luggage_capacity integer,
  air_conditioned boolean not null default false,
  vendor_name text,
  status text not null check (status in ('Available','Assigned','In Service','Out of Service')),
  backup_vehicle boolean not null default false,
  vendor_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_vehicles_workspace_id on public.vehicles(workspace_id);
create trigger trg_vehicles_updated_at before update on public.vehicles
  for each row execute function public.set_updated_at();

create table public.drivers (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  phone text not null,
  alternate_phone text,
  vehicle_id text references public.vehicles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_drivers_workspace_id on public.drivers(workspace_id);
create trigger trg_drivers_updated_at before update on public.drivers
  for each row execute function public.set_updated_at();

create table public.transport_routes (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  event text not null check (event in ('Engagement','Wedding','Both')),
  route_type text not null,
  origin text not null,
  destination text not null,
  planned_departure_date date,
  planned_departure_time time,
  planned_arrival_time time,
  vehicle_id text references public.vehicles(id) on delete set null,
  driver_id text references public.drivers(id) on delete set null,
  status text not null check (status in ('Planned','Confirmed','Dispatched','In Progress','Completed','Cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_transport_routes_workspace_id on public.transport_routes(workspace_id);
create index idx_transport_routes_planned_departure_date on public.transport_routes(planned_departure_date);
create trigger trg_transport_routes_updated_at before update on public.transport_routes
  for each row execute function public.set_updated_at();

create table public.transport_assignments (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  route_id text not null references public.transport_routes(id) on delete cascade,
  guest_id text not null references public.guests(id) on delete cascade,
  travel_segment_id text references public.travel_segments(id) on delete set null,
  pickup_location text,
  pickup_date date,
  pickup_time time,
  drop_location text,
  seat_count integer not null check (seat_count > 0),
  luggage_count integer,
  assistance_required boolean not null default false,
  assignment_status text not null check (assignment_status in ('Planned','Confirmed','Boarded','Completed','No Show','Cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_transport_assignments_workspace_id on public.transport_assignments(workspace_id);
create index idx_transport_assignments_route_id on public.transport_assignments(route_id);
create index idx_transport_assignments_guest_id on public.transport_assignments(guest_id);
create trigger trg_transport_assignments_updated_at before update on public.transport_assignments
  for each row execute function public.set_updated_at();
