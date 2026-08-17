import { useState } from 'react';
import { CloudOff, AlertTriangle } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useAuth } from '@/context/AuthContext';
import { OFFLINE_MUTATION_LABELS } from '@/types/offlineMutationQueue';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

/**
 * Section 8's required top-level offline status: a single, calm banner
 * ("Offline — using last saved Wedding Day data") rather than scattered
 * generic network-error toasts, plus a "N changes pending sync" summary
 * and an entry point into conflict resolution when replay finds one.
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { supabaseEnabled } = useAuth();
  const { mutations, discard, keepServer, applyMine, retry } = useOfflineQueue();
  const [conflictsOpen, setConflictsOpen] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [discardTarget, setDiscardTarget] = useState<string | null>(null);

  if (!supabaseEnabled) return null;

  const pending = mutations.filter((m) => m.status === 'Pending' || m.status === 'Syncing' || m.status === 'Failed');
  const conflicts = mutations.filter((m) => m.status === 'Conflict');

  if (isOnline && pending.length === 0 && conflicts.length === 0) return null;

  return (
    <>
      <div
        role="status"
        className="no-print flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-warning/20 bg-warning-bg px-4 py-2 text-xs font-medium text-warning lg:px-6"
      >
        {!isOnline && (
          <span className="flex items-center gap-1.5">
            <CloudOff className="size-3.5" aria-hidden="true" />
            Offline — using last saved Wedding Day data
          </span>
        )}
        {pending.length > 0 && (
          <button type="button" onClick={() => setPendingOpen(true)} className="underline underline-offset-2">
            {pending.length} change{pending.length === 1 ? '' : 's'} pending sync — will sync when connection returns
          </button>
        )}
        {conflicts.length > 0 && (
          <button type="button" onClick={() => setConflictsOpen(true)} className="flex items-center gap-1 font-semibold underline underline-offset-2">
            <AlertTriangle className="size-3.5" aria-hidden="true" />
            {conflicts.length} item{conflicts.length === 1 ? '' : 's'} changed on another device — resolve now
          </button>
        )}
      </div>

      <Modal open={conflictsOpen} onClose={() => setConflictsOpen(false)} title="Resolve sync conflicts" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-ink-faint">
            These items changed on another device while this device was offline. Choose which version to keep — nothing is applied automatically.
          </p>
          {conflicts.map((mutation) => (
            <div key={mutation.id} className="rounded-lg border border-line-soft p-3">
              <p className="text-sm font-semibold text-ink">{OFFLINE_MUTATION_LABELS[mutation.entityType]}</p>
              <p className="mt-0.5 text-xs text-ink-faint">This item changed on another device while you were offline.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => void keepServer(mutation.id)}>
                  Keep Server Version
                </Button>
                <Button size="sm" variant="primary" onClick={() => void applyMine(mutation.id)}>
                  Apply My Offline Change
                </Button>
              </div>
            </div>
          ))}
          {conflicts.length === 0 && <p className="text-sm text-ink-faint">No conflicts remaining.</p>}
        </div>
      </Modal>

      <Modal open={pendingOpen} onClose={() => setPendingOpen(false)} title="Pending sync changes" size="lg">
        <div className="space-y-3">
          <p className="text-sm text-ink-faint">These offline-safe changes are queued and will sync automatically once this device is back online.</p>
          {pending.length === 0 && <p className="text-sm text-ink-faint">Nothing pending.</p>}
          {pending.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line-soft p-3">
              <div>
                <p className="text-sm font-semibold text-ink">{OFFLINE_MUTATION_LABELS[m.entityType]}</p>
                <p className="text-xs text-ink-faint">
                  Status: {m.status}
                  {m.status === 'Failed' && m.lastError ? ` — ${m.lastError}` : ''}
                </p>
              </div>
              {m.status === 'Failed' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => void retry(m.id)}>
                    Retry
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDiscardTarget(m.id)}>
                    Discard
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>

      <ConfirmDialog
        open={discardTarget !== null}
        title="Discard this offline change?"
        message="This change was made while offline and failed to sync. Discarding it removes it from the sync queue permanently — the local record itself is not undone."
        confirmLabel="Discard"
        danger
        onConfirm={() => {
          if (discardTarget) void discard(discardTarget);
          setDiscardTarget(null);
        }}
        onCancel={() => setDiscardTarget(null)}
      />
    </>
  );
}
