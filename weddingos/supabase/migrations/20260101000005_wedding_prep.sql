-- Wedding-preparation tables: church, ceremony, catering, décor, attire,
-- photography, music/AV, gifts.

create table public.church_profiles (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event text not null check (event in ('Engagement','Wedding','Both')),
  church_name text not null,
  denomination text not null,
  parish_name text,
  address text,
  city text,
  primary_clergy_name text,
  primary_clergy_phone text,
  church_office_phone text,
  church_office_email text,
  ceremony_date date,
  ceremony_start_time time,
  access_start_time time,
  rehearsal_date date,
  rehearsal_time time,
  seating_capacity integer,
  parking_notes text,
  accessibility_notes text,
  photography_restrictions text,
  video_restrictions text,
  music_restrictions text,
  decor_restrictions text,
  confetti_petal_restrictions text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_church_profiles_workspace_id on public.church_profiles(workspace_id);
create trigger trg_church_profiles_updated_at before update on public.church_profiles
  for each row execute function public.set_updated_at();

create table public.church_requirements (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  church_profile_id text not null references public.church_profiles(id) on delete cascade,
  title text not null,
  category text not null,
  applicability text not null check (applicability in ('Applicable','Not Applicable','Confirm with Parish')),
  owner text,
  due_date date,
  status text not null check (status in ('Not Started','In Progress','Waiting','Submitted','Verified','Complete','Blocked','Not Applicable')),
  requirement_source text,
  document_required boolean not null default false,
  document_name text,
  submitted_date date,
  verified_date date,
  verified_by text,
  notes text,
  related_task_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_church_requirements_workspace_id on public.church_requirements(workspace_id);
create index idx_church_requirements_church_profile_id on public.church_requirements(church_profile_id);
create index idx_church_requirements_status on public.church_requirements(status);
create trigger trg_church_requirements_updated_at before update on public.church_requirements
  for each row execute function public.set_updated_at();

create table public.ceremony_participants (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  role text not null,
  name text not null,
  linked_guest_id text references public.guests(id) on delete set null,
  linked_contact text,
  phone text,
  email text,
  side text check (side in ('Groom','Bride','Both')),
  confirmed boolean not null default false,
  backup_name text,
  backup_phone text,
  arrival_time time,
  rehearsal_required boolean not null default false,
  rehearsal_confirmed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_ceremony_participants_workspace_id on public.ceremony_participants(workspace_id);
create trigger trg_ceremony_participants_updated_at before update on public.ceremony_participants
  for each row execute function public.set_updated_at();

create table public.ceremony_sequence_items (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  sequence_order integer not null,
  title text not null,
  description text,
  planned_time time,
  relative_time text,
  location text,
  owner text,
  participants jsonb not null default '[]',
  required_items jsonb not null default '[]',
  music_cue_id text,
  notes text,
  status text not null check (status in ('Planned','Confirmed','Rehearsed','Complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_ceremony_sequence_items_workspace_id on public.ceremony_sequence_items(workspace_id);
create trigger trg_ceremony_sequence_items_updated_at before update on public.ceremony_sequence_items
  for each row execute function public.set_updated_at();

create table public.ceremony_items (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  category text not null,
  applicability text not null check (applicability in ('Applicable','Not Applicable','Confirm with Parish / Family')),
  owner text,
  custodian text,
  backup_custodian text,
  storage_location text,
  required_at_location text,
  required_by_date date,
  required_by_time time,
  status text not null check (status in ('Not Procured','Ordered','Received','Ready','In Transit','At Venue','Used','Returned','Not Applicable')),
  verification_status text not null check (verification_status in ('Not Verified','Verified','Recheck Required')),
  last_verified_at timestamptz,
  related_vendor_id text,
  related_budget_item_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_ceremony_items_workspace_id on public.ceremony_items(workspace_id);
create trigger trg_ceremony_items_updated_at before update on public.ceremony_items
  for each row execute function public.set_updated_at();

create table public.catering_plans (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event text not null check (event in ('Engagement','Wedding','Both')),
  vendor_id text references public.vendors(id) on delete set null,
  venue_id text,
  service_style text not null check (service_style in ('Buffet','Plated','Family Style','Kerala Sadya Style','Mixed','Other')),
  guest_count_target integer,
  guaranteed_count integer,
  final_count_due_date date,
  buffer_count integer,
  vegetarian_count integer,
  non_vegetarian_count integer,
  vegan_count integer,
  jain_count integer,
  child_count integer,
  infant_count integer,
  vendor_meal_count integer,
  clergy_meal_count integer,
  driver_meal_count integer,
  staff_meal_count integer,
  couple_meal_reserved boolean not null default false,
  leftover_plan text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_catering_plans_workspace_id on public.catering_plans(workspace_id);
create trigger trg_catering_plans_updated_at before update on public.catering_plans
  for each row execute function public.set_updated_at();

create table public.menu_items (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  catering_plan_id text not null references public.catering_plans(id) on delete cascade,
  course text not null,
  name text not null,
  dietary_type text not null check (dietary_type in ('Vegetarian','Non-Vegetarian','Vegan','Jain','Mixed','Other')),
  allergens text,
  live_counter boolean not null default false,
  approved boolean not null default false,
  tasting_status text not null check (tasting_status in ('Not Scheduled','Scheduled','Completed','Skipped')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_menu_items_workspace_id on public.menu_items(workspace_id);
create index idx_menu_items_catering_plan_id on public.menu_items(catering_plan_id);
create trigger trg_menu_items_updated_at before update on public.menu_items
  for each row execute function public.set_updated_at();

create table public.decor_plans (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event text not null check (event in ('Engagement','Wedding','Both')),
  area text not null,
  location text,
  theme text,
  color_palette text,
  vendor_id text references public.vendors(id) on delete set null,
  install_date date,
  install_start_time time,
  install_deadline timestamptz,
  teardown_deadline timestamptz,
  approval_status text not null check (approval_status in ('Pending','Approved','Changes Requested','Rejected')),
  approved_by text,
  final_walkthrough_complete boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_decor_plans_workspace_id on public.decor_plans(workspace_id);
create trigger trg_decor_plans_updated_at before update on public.decor_plans
  for each row execute function public.set_updated_at();

create table public.decor_deliverables (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  decor_plan_id text not null references public.decor_plans(id) on delete cascade,
  name text not null,
  quantity integer,
  material text,
  floral_type text,
  fresh_flowers boolean not null default false,
  power_required boolean not null default false,
  installation_owner text,
  status text not null check (status in ('Concept','Quoted','Approved','In Production','Delivered','Installed','Verified','Removed')),
  approval_notes text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_decor_deliverables_workspace_id on public.decor_deliverables(workspace_id);
create index idx_decor_deliverables_decor_plan_id on public.decor_deliverables(decor_plan_id);
create trigger trg_decor_deliverables_updated_at before update on public.decor_deliverables
  for each row execute function public.set_updated_at();

create table public.attire_profiles (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  person_role text not null,
  linked_guest_id text references public.guests(id) on delete set null,
  event text not null check (event in ('Engagement','Wedding','Both')),
  outfit_type text not null,
  vendor_id text references public.vendors(id) on delete set null,
  ordered_date date,
  first_fitting_date date,
  final_fitting_date date,
  ready_date date,
  status text not null check (status in ('Researching','Selected','Ordered','First Fitting','Alteration','Ready','Packed','Worn')),
  storage_location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_attire_profiles_workspace_id on public.attire_profiles(workspace_id);
create trigger trg_attire_profiles_updated_at before update on public.attire_profiles
  for each row execute function public.set_updated_at();

create table public.attire_items (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  attire_profile_id text not null references public.attire_profiles(id) on delete cascade,
  item_name text not null,
  category text not null,
  required boolean not null default false,
  status text not null check (status in ('Not Started','Ordered','Ready','Packed')),
  backup_available boolean not null default false,
  storage_location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_attire_items_workspace_id on public.attire_items(workspace_id);
create index idx_attire_items_attire_profile_id on public.attire_items(attire_profile_id);
create trigger trg_attire_items_updated_at before update on public.attire_items
  for each row execute function public.set_updated_at();

create table public.grooming_appointments (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  person_role text not null,
  type text not null,
  vendor_id text references public.vendors(id) on delete set null,
  date date,
  time time,
  location text,
  status text not null check (status in ('Planned','Booked','Confirmed','Completed','Cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_grooming_appointments_workspace_id on public.grooming_appointments(workspace_id);
create trigger trg_grooming_appointments_updated_at before update on public.grooming_appointments
  for each row execute function public.set_updated_at();

create table public.photography_plans (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event text not null check (event in ('Engagement','Wedding','Both')),
  vendor_id text references public.vendors(id) on delete set null,
  coverage_start timestamptz,
  coverage_end timestamptz,
  photographer_count integer,
  videographer_count integer,
  drone_required boolean not null default false,
  live_streaming_required boolean not null default false,
  same_day_edit_required boolean not null default false,
  raw_files_included boolean not null default false,
  album_included boolean not null default false,
  highlights_video_included boolean not null default false,
  full_film_included boolean not null default false,
  church_restrictions_confirmed boolean not null default false,
  delivery_due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_photography_plans_workspace_id on public.photography_plans(workspace_id);
create trigger trg_photography_plans_updated_at before update on public.photography_plans
  for each row execute function public.set_updated_at();

create table public.photo_groups (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event text not null check (event in ('Engagement','Wedding','Both')),
  group_name text not null,
  sequence_order integer not null,
  participants jsonb not null default '[]',
  coordinator text,
  location text,
  priority text not null check (priority in ('Must Have','Important','Nice to Have')),
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_photo_groups_workspace_id on public.photo_groups(workspace_id);
create trigger trg_photo_groups_updated_at before update on public.photo_groups
  for each row execute function public.set_updated_at();

create table public.music_cues (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event text not null check (event in ('Engagement','Wedding','Both')),
  cue_type text not null,
  title text not null,
  performer text,
  linked_vendor_id text references public.vendors(id) on delete set null,
  planned_time time,
  sequence_order integer not null,
  approved boolean not null default false,
  backup_available boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_music_cues_workspace_id on public.music_cues(workspace_id);
create trigger trg_music_cues_updated_at before update on public.music_cues
  for each row execute function public.set_updated_at();

create table public.music_av_plans (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event text not null check (event in ('Engagement','Wedding','Both')),
  choir_vendor_id text references public.vendors(id) on delete set null,
  dj_vendor_id text references public.vendors(id) on delete set null,
  av_vendor_id text references public.vendors(id) on delete set null,
  emcee_name text,
  emcee_phone text,
  microphone_count integer,
  backup_microphones integer,
  soundcheck_date date,
  soundcheck_time time,
  podium_required boolean not null default false,
  offline_playlist_ready boolean not null default false,
  backup_batteries_ready boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_music_av_plans_workspace_id on public.music_av_plans(workspace_id);
create trigger trg_music_av_plans_updated_at before update on public.music_av_plans
  for each row execute function public.set_updated_at();

create table public.gift_plans (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  recipient_type text not null,
  recipient_name text,
  linked_guest_id text references public.guests(id) on delete set null,
  event text not null check (event in ('Engagement','Wedding','Both')),
  gift_type text not null,
  quantity integer not null check (quantity >= 0),
  vendor_id text references public.vendors(id) on delete set null,
  budget_item_id text references public.budget_items(id) on delete set null,
  status text not null check (status in ('Planned','Ordered','Received','Packed','Distributed')),
  custodian text,
  distribution_owner text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_gift_plans_workspace_id on public.gift_plans(workspace_id);
create trigger trg_gift_plans_updated_at before update on public.gift_plans
  for each row execute function public.set_updated_at();

create table public.welcome_kits (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  target_guest_group text,
  hotel_id text references public.hotels(id) on delete set null,
  quantity_planned integer not null check (quantity_planned >= 0),
  quantity_prepared integer not null check (quantity_prepared >= 0),
  distribution_location text,
  distribution_owner text,
  status text not null check (status in ('Planned','Procured','Packed','Delivered')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_welcome_kits_workspace_id on public.welcome_kits(workspace_id);
create trigger trg_welcome_kits_updated_at before update on public.welcome_kits
  for each row execute function public.set_updated_at();

create table public.welcome_kit_items (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  welcome_kit_id text not null references public.welcome_kits(id) on delete cascade,
  item_name text not null,
  quantity_per_kit integer not null check (quantity_per_kit >= 0),
  vendor_id text references public.vendors(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_welcome_kit_items_workspace_id on public.welcome_kit_items(workspace_id);
create index idx_welcome_kit_items_welcome_kit_id on public.welcome_kit_items(welcome_kit_id);
create trigger trg_welcome_kit_items_updated_at before update on public.welcome_kit_items
  for each row execute function public.set_updated_at();
