-- Documents, audit log, and data-migration tracking (sections 38, 43, 32).

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  category text not null check (category in ('Contract','Quote','Invoice','Receipt','Church','Venue','Vendor','Travel','Other')),
  title text not null,
  storage_path text not null unique,
  mime_type text not null check (mime_type in (
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  )),
  file_size integer not null check (file_size > 0 and file_size <= 10485760),
  related_entity_type text,
  related_entity_id text,
  uploaded_by uuid not null references public.user_profiles(id),
  uploaded_at timestamptz not null default now(),
  notes text,
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_documents_workspace_id on public.documents(workspace_id);
create index idx_documents_related_entity on public.documents(related_entity_type, related_entity_id);
create trigger trg_documents_updated_at before update on public.documents
  for each row execute function public.set_updated_at();

-- Audit logs are append-only from the application's point of view: no
-- update trigger, no application-level UPDATE/DELETE policy (section 45).
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  summary text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index idx_audit_logs_workspace_id on public.audit_logs(workspace_id);
create index idx_audit_logs_user_id on public.audit_logs(user_id);
create index idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at);

create table public.data_migrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source_type text not null default 'localStorage',
  source_version integer not null,
  source_fingerprint text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'Analyzing' check (status in ('Analyzing','In Progress','Verified','Completed','Failed','Blocked')),
  record_counts jsonb not null default '{}',
  error_summary text
);
create index idx_data_migrations_workspace_id on public.data_migrations(workspace_id);
-- One successfully-completed migration per exact source fingerprint,
-- workspace-wide — this is the idempotency guard from section 32. Failed/
-- blocked attempts are excluded so a retry after a fix is still allowed.
create unique index uq_data_migrations_fingerprint_completed
  on public.data_migrations(workspace_id, source_fingerprint)
  where status in ('Completed','Verified');
