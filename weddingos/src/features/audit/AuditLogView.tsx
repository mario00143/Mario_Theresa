import { useEffect, useState } from 'react';
import type { AuditLog } from '@/types';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermission } from '@/hooks/usePermission';
import { listAuditLogs } from '@/data/supabase/auditLogRepository';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, Input, Label } from '@/components/ui/Field';

/** Admin/Couple-only viewer for the append-only audit trail (section 44). */
export function AuditLogView() {
  const { currentWorkspace } = useWorkspace();
  const { isAdminOrCouple } = usePermission();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  useEffect(() => {
    if (!currentWorkspace || !isAdminOrCouple()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    listAuditLogs(currentWorkspace.id)
      .then(setLogs)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace]);

  if (!currentWorkspace) return null;

  if (!isAdminOrCouple()) {
    return <EmptyState title="Not available for your role" description="Only Admin and Couple members can view the audit log." />;
  }

  const filtered = logs.filter((log) => {
    if (actionFilter && !log.action.toLowerCase().includes(actionFilter.toLowerCase())) return false;
    if (userFilter && log.userId !== userFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Field className="w-56">
          <Label htmlFor="actionFilter">Filter by action</Label>
          <Input id="actionFilter" placeholder="e.g. payment.create" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} />
        </Field>
        <Field className="w-56">
          <Label htmlFor="userFilter">Filter by user id</Label>
          <Input id="userFilter" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} />
        </Field>
      </div>

      {loading ? (
        <p className="text-ink-faint text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No audit entries" description="Actions like payment changes, member role changes, and deletions will appear here." />
      ) : (
        <Card className="divide-line-soft divide-y p-0">
          {filtered.map((log) => (
            <div key={log.id} className="p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink text-sm font-medium">{log.summary}</span>
                <span className="text-ink-faint shrink-0 text-xs">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-ink-faint mt-0.5 text-xs">
                {log.action} · {log.entityType} · {log.entityId}
              </p>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
