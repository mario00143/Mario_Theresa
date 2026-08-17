import type { WorkspaceRole } from '@/types';

/**
 * Coarse-grained modules the permission matrix is expressed over (section
 * 9/15). These map loosely to top-level nav sections, not to individual
 * tables — a handful of sensitive sub-flows (destructive deletes, role
 * assignment, payment/room/vehicle confirmation) have their own stricter
 * checks below rather than being modeled as separate modules.
 */
export const PERMISSION_MODULES = [
  'workspaceSettings',
  'members',
  'tasks',
  'decisions',
  'guests',
  'logistics',
  'vendors',
  'finance',
  'weddingPrep',
  'weddingDay',
  'documents',
  'auditLog',
] as const;
export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_LEVELS = ['none', 'read', 'write'] as const;
export type PermissionLevel = (typeof PERMISSION_LEVELS)[number];

/**
 * The role capability matrix (section 9/15). This is the UI-level mirror
 * of the database RLS policies in supabase/migrations/ — the two must be
 * kept in sync by hand since Postgres policies can't be generated from
 * this file. RLS remains authoritative; this matrix only controls what
 * the UI offers, never the final word on what a write can actually do.
 */
export const PERMISSION_MATRIX: Record<WorkspaceRole, Record<PermissionModule, PermissionLevel>> = {
  Admin: {
    workspaceSettings: 'write',
    members: 'write',
    tasks: 'write',
    decisions: 'write',
    guests: 'write',
    logistics: 'write',
    vendors: 'write',
    finance: 'write',
    weddingPrep: 'write',
    weddingDay: 'write',
    documents: 'write',
    auditLog: 'read',
  },
  Couple: {
    workspaceSettings: 'write',
    members: 'write',
    tasks: 'write',
    decisions: 'write',
    guests: 'write',
    logistics: 'write',
    vendors: 'write',
    finance: 'write',
    weddingPrep: 'write',
    weddingDay: 'write',
    documents: 'write',
    auditLog: 'read',
  },
  'Finance Lead': {
    workspaceSettings: 'read',
    members: 'none',
    tasks: 'read',
    decisions: 'read',
    guests: 'read',
    logistics: 'read',
    vendors: 'write',
    finance: 'write',
    weddingPrep: 'read',
    weddingDay: 'read',
    documents: 'write',
    auditLog: 'none',
  },
  'Workstream Lead': {
    workspaceSettings: 'read',
    members: 'none',
    tasks: 'write',
    decisions: 'read',
    guests: 'read',
    logistics: 'read',
    vendors: 'read',
    finance: 'none',
    weddingPrep: 'write',
    weddingDay: 'read',
    documents: 'read',
    auditLog: 'none',
  },
  'Family Editor': {
    workspaceSettings: 'read',
    members: 'none',
    tasks: 'write',
    decisions: 'read',
    guests: 'write',
    logistics: 'write',
    vendors: 'read',
    finance: 'none',
    weddingPrep: 'read',
    weddingDay: 'read',
    documents: 'read',
    auditLog: 'none',
  },
  Viewer: {
    workspaceSettings: 'read',
    members: 'none',
    tasks: 'read',
    decisions: 'read',
    guests: 'read',
    logistics: 'read',
    vendors: 'read',
    finance: 'none',
    weddingPrep: 'read',
    weddingDay: 'read',
    documents: 'read',
    auditLog: 'none',
  },
  'Day-of Operator': {
    workspaceSettings: 'none',
    members: 'none',
    tasks: 'read',
    decisions: 'none',
    guests: 'read',
    logistics: 'read',
    vendors: 'read',
    finance: 'none',
    weddingPrep: 'read',
    weddingDay: 'write',
    documents: 'read',
    auditLog: 'none',
  },
};

export function getModulePermission(role: WorkspaceRole | undefined, module: PermissionModule): PermissionLevel {
  if (!role) return 'none';
  return PERMISSION_MATRIX[role][module];
}

export function canRead(role: WorkspaceRole | undefined, module: PermissionModule): boolean {
  return getModulePermission(role, module) !== 'none';
}

export function canWrite(role: WorkspaceRole | undefined, module: PermissionModule): boolean {
  return getModulePermission(role, module) === 'write';
}

/**
 * Only Admin can grant the Admin role. Couple can assign any other role.
 * All other roles cannot assign roles at all (members module is 'none' or
 * 'read'-and-below for them already, but this is the explicit rule from
 * section 9: "no membership-role escalation unless Admin").
 */
export function canAssignRole(actorRole: WorkspaceRole | undefined, targetRole: WorkspaceRole): boolean {
  if (actorRole === 'Admin') return true;
  if (actorRole === 'Couple') return targetRole !== 'Admin';
  return false;
}

/** Workspace-level destructive actions (section 70) — deleting the workspace itself, or a household with guests, etc. */
export function isAdminOrCouple(role: WorkspaceRole | undefined): boolean {
  return role === 'Admin' || role === 'Couple';
}

/** Phase 8's strictly Admin-only surfaces (System Diagnostics, Demo Data Cleanup, Production Readiness, Launch Gate, Post-Wedding Data Cleanup) — narrower than isAdminOrCouple. */
export function isAdmin(role: WorkspaceRole | undefined): boolean {
  return role === 'Admin';
}

/**
 * Flows section 30 explicitly calls out as never optimistic — writes must
 * be confirmed by the backend before the UI reflects them as applied.
 */
export const NON_OPTIMISTIC_FLOWS = ['payment', 'roomAssignment', 'vehicleAssignment', 'memberRoleChange', 'destructiveDelete'] as const;
export type NonOptimisticFlow = (typeof NON_OPTIMISTIC_FLOWS)[number];

/** Friendly label shown next to a disabled control, per section 53's "show useful, not silent" requirement. */
export function readOnlyReason(role: WorkspaceRole | undefined, module: PermissionModule): string | null {
  const level = getModulePermission(role, module);
  if (level === 'write') return null;
  if (level === 'read') return 'Read-only for your role';
  return 'Not available for your role';
}
