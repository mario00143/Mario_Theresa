import { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import type { OfflineSnapshot } from '@/types/offlineSnapshot';
import { isOfflineSnapshotStale, loadOfflineSnapshot, offlineSnapshotAgeMs, refreshOfflineSnapshot } from '@/data/offline/offlineSnapshot';

function formatAge(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}

/**
 * Section 9-10's "Offline Pack" status card: whether a device-local
 * (IndexedDB) copy of the Wedding-Day-critical data exists, how old it is,
 * and a manual "Refresh Offline Pack" action — separate from (and shown
 * above) the printed paper version below, since a device needs both a
 * digital and a physical fallback (section 55/68).
 */
export function DigitalOfflinePackStatus() {
  const { supabaseEnabled } = useAuth();
  const [snapshot, setSnapshot] = useState<OfflineSnapshot | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void loadOfflineSnapshot().then((s) => {
      setSnapshot(s);
      setLoading(false);
    });
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    const next = await refreshOfflineSnapshot();
    setSnapshot(next ?? undefined);
    setRefreshing(false);
  }

  if (loading) return null;

  const stale = snapshot ? isOfflineSnapshotStale(snapshot) : true;

  return (
    <Card className={!snapshot || stale ? 'border-warning/40' : undefined}>
      <CardBody className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {snapshot && !stale ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
          ) : (
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
          )}
          <div>
            <p className="text-sm font-semibold text-ink">{snapshot ? (stale ? 'Offline Pack is stale' : 'Offline Pack Ready') : 'No Offline Pack saved on this device yet'}</p>
            <p className="text-xs text-ink-faint">
              {snapshot
                ? `Last refreshed ${formatAge(offlineSnapshotAgeMs(snapshot))} (${new Date(snapshot.generatedAt).toLocaleString()}).${
                    stale ? ' Refresh before relying on this device for Wedding Day Mode.' : ''
                  }`
                : 'This device has no locally saved copy of the run sheet, emergency contacts, manifests, and other critical data. Generate one before going offline.'}
            </p>
            {!supabaseEnabled && (
              <p className="mt-1 text-xs text-ink-faint">Demo/Local Mode already keeps everything on this device — the Offline Pack matters most in Production Mode with multiple devices.</p>
            )}
          </div>
        </div>
        <Button variant={stale ? 'primary' : 'secondary'} size="sm" icon={<RefreshCw className="size-3.5" aria-hidden="true" />} onClick={() => void handleRefresh()} disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh Offline Pack'}
        </Button>
      </CardBody>
    </Card>
  );
}
