-- Wedding Day command-center tables (Phase 6 domain, migrated as-is).
-- vendor_day_statuses / ceremony_item_movements / guest_operational_statuses
-- are owned-child extensions of vendors/ceremony_items/guests respectively
-- (cascade-delete with their parent) — matching the Phase 6 app convention.

create table public.run_sheet_items (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event text not null check (event in ('Engagement','Wedding','Both')),
  date date not null,
  start_time time,
  end_time time,
  relative_reference text not null check (relative_reference in ('None','Ceremony Start','Reception Start')),
  relative_offset_minutes integer,
  location text,
  activity text not null,
  category text not null,
  owner text,
  backup_owner text,
  participant_ids jsonb not null default '[]',
  vendor_ids jsonb not null default '[]',
  required_item_ids jsonb not null default '[]',
  related_task_ids jsonb not null default '[]',
  related_transport_route_ids jsonb not null default '[]',
  cue text,
  dependency_ids jsonb not null default '[]',
  contingency_action text,
  status text not null check (status in ('Planned','Ready','In Progress','Delayed','Complete','Skipped','Cancelled')),
  actual_start_time timestamptz,
  actual_end_time timestamptz,
  delay_minutes integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_run_sheet_items_workspace_id on public.run_sheet_items(workspace_id);
create index idx_run_sheet_items_status on public.run_sheet_items(status);
create index idx_run_sheet_items_date on public.run_sheet_items(date);
create trigger trg_run_sheet_items_updated_at before update on public.run_sheet_items
  for each row execute function public.set_updated_at();

create table public.live_issues (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  severity text not null check (severity in ('Low','Medium','High','Critical')),
  status text not null check (status in ('Open','Investigating','Mitigating','Resolved','Closed')),
  reported_at timestamptz not null,
  reported_by text,
  owner text,
  backup_owner text,
  location text,
  related_run_sheet_item_id text references public.run_sheet_items(id) on delete set null,
  related_vendor_id text,
  related_guest_id text,
  related_transport_route_id text,
  mitigation text,
  resolution text,
  resolved_at timestamptz,
  follow_up_required boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_live_issues_workspace_id on public.live_issues(workspace_id);
create index idx_live_issues_status on public.live_issues(status);
create index idx_live_issues_severity on public.live_issues(severity);
create trigger trg_live_issues_updated_at before update on public.live_issues
  for each row execute function public.set_updated_at();

create table public.duty_assignments (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  role text not null,
  person_name text not null,
  linked_guest_id text references public.guests(id) on delete set null,
  phone text,
  backup_person_name text,
  backup_phone text,
  start_time timestamptz,
  end_time timestamptz,
  location text,
  responsibilities text,
  status text not null check (status in ('Planned','Confirmed','Active','Completed','Unavailable')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_duty_assignments_workspace_id on public.duty_assignments(workspace_id);
create trigger trg_duty_assignments_updated_at before update on public.duty_assignments
  for each row execute function public.set_updated_at();

create table public.vendor_day_statuses (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vendor_id text not null references public.vendors(id) on delete cascade,
  expected_arrival_time timestamptz,
  actual_arrival_time timestamptz,
  expected_departure_time timestamptz,
  actual_departure_time timestamptz,
  primary_contact_confirmed boolean not null default false,
  team_size_expected integer,
  team_size_actual integer,
  setup_complete boolean not null default false,
  service_ready boolean not null default false,
  final_settlement_checked boolean not null default false,
  status text not null check (status in ('Expected','En Route','Arrived','Setting Up','Ready','In Service','Completed','Delayed','No Show')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  unique (workspace_id, vendor_id)
);
create index idx_vendor_day_statuses_workspace_id on public.vendor_day_statuses(workspace_id);
create trigger trg_vendor_day_statuses_updated_at before update on public.vendor_day_statuses
  for each row execute function public.set_updated_at();

create table public.ceremony_item_movements (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  ceremony_item_id text not null references public.ceremony_items(id) on delete cascade,
  action text not null check (action in ('Verified','Checked Out','In Transit','Received','Used','Returned','Secured')),
  timestamp timestamptz not null,
  from_location text,
  to_location text,
  handed_by text,
  received_by text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_ceremony_item_movements_workspace_id on public.ceremony_item_movements(workspace_id);
create index idx_ceremony_item_movements_ceremony_item_id on public.ceremony_item_movements(ceremony_item_id);
create trigger trg_ceremony_item_movements_updated_at before update on public.ceremony_item_movements
  for each row execute function public.set_updated_at();

create table public.emergency_contacts (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  category text not null,
  name text not null,
  phone text not null,
  alternate_phone text,
  location text,
  notes text,
  priority text not null check (priority in ('Primary','Secondary','Reference')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_emergency_contacts_workspace_id on public.emergency_contacts(workspace_id);
create trigger trg_emergency_contacts_updated_at before update on public.emergency_contacts
  for each row execute function public.set_updated_at();

create table public.emergency_response_cards (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  type text not null,
  title text not null,
  immediate_actions jsonb not null default '[]',
  owner text,
  backup_owner text,
  contact_phone text,
  related_vendor_id text,
  contingency text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_emergency_response_cards_workspace_id on public.emergency_response_cards(workspace_id);
create trigger trg_emergency_response_cards_updated_at before update on public.emergency_response_cards
  for each row execute function public.set_updated_at();

create table public.closeout_items (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  category text not null,
  title text not null,
  owner text,
  status text not null check (status in ('Pending','In Progress','Complete','Exception')),
  due_time timestamptz,
  completed_at timestamptz,
  verification_note text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_closeout_items_workspace_id on public.closeout_items(workspace_id);
create trigger trg_closeout_items_updated_at before update on public.closeout_items
  for each row execute function public.set_updated_at();

create table public.final_readiness_reviews (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  reviewed_at timestamptz not null,
  reviewed_by text not null,
  readiness_snapshot jsonb not null default '[]',
  unresolved_exceptions jsonb not null default '[]',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_final_readiness_reviews_workspace_id on public.final_readiness_reviews(workspace_id);
create trigger trg_final_readiness_reviews_updated_at before update on public.final_readiness_reviews
  for each row execute function public.set_updated_at();

create table public.guest_operational_statuses (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  guest_id text not null references public.guests(id) on delete cascade,
  state text not null check (state in ('Expected','Arrived','At Hotel','En Route to Church','At Church','At Reception','Departed','Assistance Required')),
  is_vip boolean not null default false,
  assistance_note text,
  last_updated_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  unique (workspace_id, guest_id)
);
create index idx_guest_operational_statuses_workspace_id on public.guest_operational_statuses(workspace_id);
create trigger trg_guest_operational_statuses_updated_at before update on public.guest_operational_statuses
  for each row execute function public.set_updated_at();

create table public.manifest_freeze_states (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  manifest_type text not null check (manifest_type in ('Rooming List','Pickup Manifest','Shuttle Manifest','Drop Manifest','Duty Roster')),
  frozen boolean not null default false,
  frozen_at timestamptz,
  frozen_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  unique (workspace_id, manifest_type)
);
create index idx_manifest_freeze_states_workspace_id on public.manifest_freeze_states(workspace_id);
create trigger trg_manifest_freeze_states_updated_at before update on public.manifest_freeze_states
  for each row execute function public.set_updated_at();
