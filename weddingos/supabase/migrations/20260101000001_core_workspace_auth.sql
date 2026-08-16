-- WeddingOS Phase 7 — Core workspace / auth-profile tables.
--
-- ID strategy: pre-existing v1-v6 domain entities were created locally with
-- IDs like `task_<uuid-v4>` (see src/lib/id.ts) — not bare UUIDs — so their
-- tables use `id text primary key` to preserve those IDs exactly across a
-- local-to-Supabase migration (section 33). Phase-7-native tables that have
-- no local-migration history (workspaces, user_profiles, workspace_members,
-- workspace_invites, documents, audit_logs, data_migrations) use native
-- `uuid` primary keys with `gen_random_uuid()` defaults. This is a
-- deliberate, documented deviation from section 10's "use UUID primary
-- keys" for the migrated tables specifically, in favor of section 33's
-- "preserve existing UUIDs where possible" — remapping every legacy id
-- would break every cross-entity reference at migration time.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- updated_at trigger (section 12) — reused by every table below.
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- workspaces
-- ---------------------------------------------------------------------
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  groom_name text not null,
  bride_name text not null,
  timezone text not null default 'Asia/Kolkata',
  currency text not null default 'INR',
  engagement_date date,
  wedding_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);
create index idx_workspaces_created_by on public.workspaces(created_by);
create trigger trg_workspaces_updated_at before update on public.workspaces
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- user_profiles — one row per Supabase Auth user, created on first sign-in.
-- Never duplicates auth.users internals (password hash, provider tokens).
-- ---------------------------------------------------------------------
create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_user_profiles_updated_at before update on public.user_profiles
  for each row execute function public.set_updated_at();

alter table public.workspaces
  add constraint fk_workspaces_created_by foreign key (created_by) references public.user_profiles(id);

-- ---------------------------------------------------------------------
-- workspace_members
-- ---------------------------------------------------------------------
create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  role text not null check (role in ('Admin','Couple','Finance Lead','Workstream Lead','Family Editor','Viewer','Day-of Operator')),
  status text not null default 'Active' check (status in ('Invited','Active','Suspended','Removed')),
  invited_by uuid references public.user_profiles(id),
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);
create index idx_workspace_members_workspace_id on public.workspace_members(workspace_id);
create index idx_workspace_members_user_id on public.workspace_members(user_id);
create trigger trg_workspace_members_updated_at before update on public.workspace_members
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- workspace_invites (section 20) — token itself is never stored, only its hash.
-- ---------------------------------------------------------------------
create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role text not null check (role in ('Admin','Couple','Finance Lead','Workstream Lead','Family Editor','Viewer','Day-of Operator')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  invited_by uuid not null references public.user_profiles(id),
  status text not null default 'Active' check (status in ('Active','Used','Expired','Revoked')),
  created_at timestamptz not null default now()
);
create index idx_workspace_invites_workspace_id on public.workspace_invites(workspace_id);
create index idx_workspace_invites_email on public.workspace_invites(email);

-- ---------------------------------------------------------------------
-- workspace_settings — one row per workspace holding the AppSettings blob.
-- Modeled as JSONB sub-objects (matching the app's existing single-object
-- settings shape) rather than exploded into columns — this is
-- configuration, not relational domain data.
-- ---------------------------------------------------------------------
create table public.workspace_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  couple jsonb not null default '{}',
  engagement jsonb not null default '{}',
  wedding jsonb not null default '{}',
  wedding_details jsonb not null default '{}',
  finance jsonb not null default '{}',
  wedding_prep jsonb not null default '{}',
  wedding_day jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_workspace_settings_updated_at before update on public.workspace_settings
  for each row execute function public.set_updated_at();
