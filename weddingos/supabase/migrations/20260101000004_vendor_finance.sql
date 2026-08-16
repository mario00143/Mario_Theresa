-- Vendor and finance tables.
-- Financial-record tables (payments/refunds/payment_schedules/contracts)
-- use ON DELETE RESTRICT toward vendors so a vendor with financial history
-- cannot be silently deleted out from under its records (section 71).

create table public.vendors (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  category text not null,
  status text not null check (status in ('Researching','Shortlisted','Quoted','Negotiating','Selected','Contracted','Confirmed','Completed','Cancelled')),
  primary_contact_id text,
  backup_contact_id text,
  email text,
  phone text,
  website text,
  address text,
  city text,
  gst_applicable boolean not null default false,
  gst_number text,
  booking_owner text,
  event text not null check (event in ('Engagement','Wedding','Both')),
  notes text,
  last_confirmed_at timestamptz,
  confirmed_by text,
  confirmation_notes text,
  final_team_size integer,
  final_arrival_time time,
  final_primary_contact_confirmed boolean not null default false,
  final_backup_contact_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_vendors_workspace_id on public.vendors(workspace_id);
create index idx_vendors_category on public.vendors(category);
create trigger trg_vendors_updated_at before update on public.vendors
  for each row execute function public.set_updated_at();

create table public.vendor_contacts (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vendor_id text not null references public.vendors(id) on delete cascade,
  name text not null,
  role text,
  phone text,
  alternate_phone text,
  email text,
  preferred_contact_method text not null check (preferred_contact_method in ('Phone','WhatsApp','Email','Other')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_vendor_contacts_workspace_id on public.vendor_contacts(workspace_id);
create index idx_vendor_contacts_vendor_id on public.vendor_contacts(vendor_id);
create trigger trg_vendor_contacts_updated_at before update on public.vendor_contacts
  for each row execute function public.set_updated_at();

create table public.vendor_quotes (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vendor_id text not null references public.vendors(id) on delete cascade,
  quote_reference text,
  quote_date date,
  valid_until date,
  event text not null check (event in ('Engagement','Wedding','Both')),
  scope_summary text,
  base_amount numeric(12,2) not null check (base_amount >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  other_charges numeric(12,2) not null default 0 check (other_charges >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  negotiated_amount numeric(12,2),
  currency text not null default 'INR',
  status text not null check (status in ('Received','Under Review','Negotiating','Accepted','Rejected','Expired')),
  is_selected boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_vendor_quotes_workspace_id on public.vendor_quotes(workspace_id);
create index idx_vendor_quotes_vendor_id on public.vendor_quotes(vendor_id);
create trigger trg_vendor_quotes_updated_at before update on public.vendor_quotes
  for each row execute function public.set_updated_at();

create table public.contracts (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vendor_id text not null references public.vendors(id) on delete restrict,
  quote_id text references public.vendor_quotes(id) on delete set null,
  contract_reference text,
  contract_date date,
  status text not null check (status in ('Draft','Under Review','Signed','Active','Completed','Cancelled')),
  scope_included text,
  scope_excluded text,
  deliverables text,
  quantity_assumptions text,
  setup_date date,
  setup_time time,
  service_start_date date,
  service_start_time time,
  service_end_date date,
  service_end_time time,
  teardown_deadline timestamptz,
  team_size integer,
  vendor_meal_count integer,
  power_requirements text,
  transport_requirements text,
  venue_access_requirements text,
  cancellation_terms text,
  reschedule_terms text,
  replacement_policy text,
  liability_notes text,
  refundable_deposit numeric(12,2),
  final_settlement_due_date date,
  notes text,
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_contracts_workspace_id on public.contracts(workspace_id);
create index idx_contracts_vendor_id on public.contracts(vendor_id);
create trigger trg_contracts_updated_at before update on public.contracts
  for each row execute function public.set_updated_at();

create table public.budget_categories (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  planned_amount numeric(12,2) not null check (planned_amount >= 0),
  contingency_amount numeric(12,2) not null default 0 check (contingency_amount >= 0),
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_budget_categories_workspace_id on public.budget_categories(workspace_id);
create trigger trg_budget_categories_updated_at before update on public.budget_categories
  for each row execute function public.set_updated_at();

create table public.budget_items (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  category_id text not null references public.budget_categories(id) on delete cascade,
  vendor_id text references public.vendors(id) on delete set null,
  event text not null check (event in ('Engagement','Wedding','Both')),
  item_name text not null,
  description text,
  original_budget numeric(12,2) not null check (original_budget >= 0),
  latest_estimate numeric(12,2),
  negotiated_amount numeric(12,2),
  tax_amount numeric(12,2),
  other_charges numeric(12,2),
  committed_amount numeric(12,2),
  actual_amount numeric(12,2),
  approval_status text not null check (approval_status in ('Draft','Pending Approval','Approved','Rejected')),
  approved_by text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_budget_items_workspace_id on public.budget_items(workspace_id);
create index idx_budget_items_category_id on public.budget_items(category_id);
create index idx_budget_items_vendor_id on public.budget_items(vendor_id);
create trigger trg_budget_items_updated_at before update on public.budget_items
  for each row execute function public.set_updated_at();

create table public.payment_schedules (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vendor_id text not null references public.vendors(id) on delete restrict,
  budget_item_id text references public.budget_items(id) on delete set null,
  contract_id text references public.contracts(id) on delete set null,
  milestone text not null,
  due_date date,
  amount numeric(12,2) not null check (amount > 0),
  status text not null check (status in ('Upcoming','Due','Overdue','Partially Paid','Paid','Cancelled')),
  notes text,
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_payment_schedules_workspace_id on public.payment_schedules(workspace_id);
create index idx_payment_schedules_vendor_id on public.payment_schedules(vendor_id);
create index idx_payment_schedules_due_date on public.payment_schedules(due_date);
create trigger trg_payment_schedules_updated_at before update on public.payment_schedules
  for each row execute function public.set_updated_at();

create table public.payments (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vendor_id text not null references public.vendors(id) on delete restrict,
  budget_item_id text references public.budget_items(id) on delete set null,
  payment_schedule_id text references public.payment_schedules(id) on delete set null,
  payment_date date not null,
  amount numeric(12,2) not null check (amount > 0),
  payment_method text not null check (payment_method in ('UPI','Bank Transfer','Credit Card','Debit Card','Cash','Cheque','Other')),
  reference_number text,
  invoice_received boolean not null default false,
  invoice_reference text,
  receipt_received boolean not null default false,
  receipt_reference text,
  paid_by text,
  approved_by text,
  notes text,
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_payments_workspace_id on public.payments(workspace_id);
create index idx_payments_vendor_id on public.payments(vendor_id);
create index idx_payments_payment_date on public.payments(payment_date);
create trigger trg_payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

create table public.refunds (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vendor_id text not null references public.vendors(id) on delete restrict,
  contract_id text references public.contracts(id) on delete set null,
  payment_id text references public.payments(id) on delete set null,
  refund_type text not null check (refund_type in ('Refundable Deposit','Cancellation Refund','Overpayment Refund','Other')),
  expected_amount numeric(12,2),
  expected_date date,
  received_amount numeric(12,2),
  received_date date,
  status text not null check (status in ('Expected','Partially Received','Received','Waived','Disputed')),
  reference_number text,
  notes text,
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_refunds_workspace_id on public.refunds(workspace_id);
create index idx_refunds_vendor_id on public.refunds(vendor_id);
create trigger trg_refunds_updated_at before update on public.refunds
  for each row execute function public.set_updated_at();
