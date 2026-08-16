-- Planning tables: owners, tasks, decisions.

create table public.owners (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  is_custom boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_owners_workspace_id on public.owners(workspace_id);
create trigger trg_owners_updated_at before update on public.owners
  for each row execute function public.set_updated_at();

create table public.tasks (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  description text not null default '',
  event text not null check (event in ('Engagement','Wedding','Both')),
  workstream text not null,
  owner text not null,
  approver text,
  status text not null check (status in ('Not Started','In Progress','Waiting','Blocked','Done','Cancelled')),
  priority text not null check (priority in ('Critical','High','Medium','Low')),
  start_date date,
  due_date date,
  dependencies jsonb not null default '[]',
  blocked_reason text,
  next_action text,
  completion_criteria text not null default '',
  completion_note text,
  completion_evidence text,
  tags jsonb not null default '[]',
  notes text,
  subtasks jsonb not null default '[]',
  related_vendor_id text,
  related_budget_item_id text,
  related_payment_schedule_id text,
  related_contract_id text,
  related_church_requirement_id text,
  related_ceremony_participant_id text,
  related_ceremony_item_id text,
  related_catering_plan_id text,
  related_decor_plan_id text,
  related_attire_profile_id text,
  related_photography_plan_id text,
  related_music_av_plan_id text,
  related_gift_plan_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_tasks_workspace_id on public.tasks(workspace_id);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_due_date on public.tasks(due_date);
create trigger trg_tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

create table public.decisions (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null,
  owner text not null,
  approver text,
  options jsonb not null default '[]',
  recommended_option text,
  deadline date,
  status text not null check (status in ('Open','Under Discussion','Decided','Deferred')),
  final_decision text,
  decision_date date,
  notes text,
  related_task_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id)
);
create index idx_decisions_workspace_id on public.decisions(workspace_id);
create index idx_decisions_status on public.decisions(status);
create trigger trg_decisions_updated_at before update on public.decisions
  for each row execute function public.set_updated_at();
