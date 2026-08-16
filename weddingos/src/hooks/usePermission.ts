import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import {
  canAssignRole,
  canRead,
  canWrite,
  getModulePermission,
  isAdminOrCouple,
  readOnlyReason,
  type PermissionModule,
} from '@/utils/permissions';
import type { WorkspaceRole } from '@/types';

/**
 * The single entry point UI code uses for permission checks. In Demo/Local
 * Mode (no Supabase, or Supabase configured but no workspace yet selected)
 * every module reads as fully writable — Local Mode is unchanged from
 * Phases 1-6, single implicit user, no roles.
 */
export function usePermission() {
  const { supabaseEnabled } = useAuth();
  const { currentMembership } = useWorkspace();
  const role: WorkspaceRole | undefined = supabaseEnabled ? currentMembership?.role : undefined;
  const isLocalMode = !supabaseEnabled;

  return {
    role,
    isLocalMode,
    can(module: PermissionModule) {
      if (isLocalMode) return { read: true, write: true } as const;
      return { read: canRead(role, module), write: canWrite(role, module) };
    },
    level(module: PermissionModule) {
      if (isLocalMode) return 'write' as const;
      return getModulePermission(role, module);
    },
    reason(module: PermissionModule): string | null {
      if (isLocalMode) return null;
      return readOnlyReason(role, module);
    },
    canAssignRole(targetRole: WorkspaceRole): boolean {
      if (isLocalMode) return true;
      return canAssignRole(role, targetRole);
    },
    isAdminOrCouple(): boolean {
      if (isLocalMode) return true;
      return isAdminOrCouple(role);
    },
  };
}
