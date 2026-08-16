import type { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';
import type { PermissionModule } from '@/utils/permissions';

interface PermissionGateProps {
  module: PermissionModule;
  /** 'hide' (default) removes the control entirely; 'disable' keeps it visible but disabled with a "Read-only for your role" hint (section 53). */
  mode?: 'hide' | 'disable';
  children: ReactNode;
}

/**
 * Wraps a create/edit/delete control so it respects the workspace role
 * matrix (section 53). In Demo/Local Mode (or before a workspace is
 * selected) this is always a pass-through — Local Mode has no roles.
 *
 * This is a UI convenience only; the database RLS policies in
 * supabase/migrations/ are what actually enforce these rules; a hidden
 * button here does not mean the equivalent write is unreachable, it means
 * the UI matches what the backend will actually allow.
 */
export function PermissionGate({ module, mode = 'hide', children }: PermissionGateProps) {
  const { can, reason, isLocalMode } = usePermission();
  if (isLocalMode || can(module).write) return <>{children}</>;
  if (mode === 'hide') return null;
  return (
    <span className="inline-flex items-center gap-1.5" title={reason(module) ?? undefined}>
      <span className="pointer-events-none opacity-50">{children}</span>
      <span className="text-ink-faint text-xs">{reason(module)}</span>
    </span>
  );
}
