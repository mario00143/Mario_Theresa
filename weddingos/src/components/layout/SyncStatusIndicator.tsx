import { useEffect, useState } from 'react';
import { CheckCircle2, CloudOff, Loader2, AlertCircle } from 'lucide-react';
import { getSyncStatus, onSyncStatusChange, setSyncStatus, type SyncStatusValue } from '@/lib/syncStatus';
import { cn } from '@/lib/cn';

const CONFIG: Record<SyncStatusValue, { label: string; icon: typeof CheckCircle2; className: string }> = {
  synced: { label: 'Synced', icon: CheckCircle2, className: 'text-success' },
  saving: { label: 'Saving…', icon: Loader2, className: 'text-ink-faint' },
  offline: { label: 'Offline', icon: CloudOff, className: 'text-warning' },
  error: { label: 'Sync error', icon: AlertCircle, className: 'text-critical' },
};

/** Section 29's Synced/Saving/Offline/Sync Error indicator — only meaningful in Supabase mode, so callers only render this once a workspace is active. */
export function SyncStatusIndicator() {
  const [state, setState] = useState(getSyncStatus());

  useEffect(() => {
    const unsubscribeStatus = onSyncStatusChange(() => setState(getSyncStatus()));
    const handleOffline = () => setSyncStatus('offline');
    const handleOnline = () => setSyncStatus('synced');
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    if (!navigator.onLine) setSyncStatus('offline');
    return () => {
      unsubscribeStatus();
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const { label, icon: Icon, className } = CONFIG[state.status];

  return (
    <div
      className={cn('hidden items-center gap-1.5 text-xs font-medium sm:flex', className)}
      title={state.message ?? (state.lastSyncedAt ? `Last synced ${new Date(state.lastSyncedAt).toLocaleTimeString()}` : undefined)}
    >
      <Icon className={cn('size-3.5', state.status === 'saving' && 'animate-spin')} aria-hidden="true" />
      {label}
    </div>
  );
}
