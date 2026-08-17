import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Smartphone, Battery, Clock } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { getSyncStatus } from '@/lib/syncStatus';
import { loadOfflineSnapshot, isOfflineSnapshotStale } from '@/data/offline/offlineSnapshot';
import type { OfflineSnapshot } from '@/types/offlineSnapshot';

function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

interface ReadinessRow {
  label: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
}

function StatusIcon({ status }: { status: ReadinessRow['status'] }) {
  if (status === 'pass') return <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />;
  if (status === 'warning') return <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden="true" />;
  return <XCircle className="size-4 shrink-0 text-critical" aria-hidden="true" />;
}

/**
 * Section 10's Device Readiness page — a single screen a Wedding Day
 * operator can check on THIS device before relying on it: installed,
 * online, Offline Pack present and fresh, what's cached, device time vs
 * configured wedding timezone, pending offline changes, last sync. No
 * Battery Status API is used (unsupported in Safari/most browsers now) —
 * the battery line is text-only advice, matching section 10's explicit
 * "no battery API access if unsupported" instruction.
 */
export function DeviceReadinessView() {
  const isOnline = useOnlineStatus();
  const { supabaseEnabled } = useAuth();
  const { settings } = useSettings();
  const { mutations } = useOfflineQueue();
  const [snapshot, setSnapshot] = useState<OfflineSnapshot | undefined>(undefined);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    void loadOfflineSnapshot().then(setSnapshot);
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const installed = isStandalone();
  const stale = snapshot ? isOfflineSnapshotStale(snapshot, now) : true;
  const pendingCount = mutations.filter((m) => m.status === 'Pending' || m.status === 'Syncing' || m.status === 'Failed').length;
  const conflictCount = mutations.filter((m) => m.status === 'Conflict').length;
  const syncStatus = getSyncStatus();

  const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const configuredTimeZone = settings.weddingDetails.timezone;
  const timeZoneMismatch = Boolean(configuredTimeZone) && deviceTimeZone !== configuredTimeZone;

  const rows: ReadinessRow[] = [
    { label: 'App installed to home screen', status: installed ? 'pass' : 'warning', detail: installed ? 'Running as an installed app.' : 'Running in a browser tab — install for one-tap access and a more reliable offline experience.' },
    { label: 'Currently online', status: isOnline ? 'pass' : 'warning', detail: isOnline ? 'Connected.' : 'Offline — using last saved Wedding Day data on this device.' },
    {
      label: 'Offline Pack available',
      status: !snapshot ? 'fail' : stale ? 'warning' : 'pass',
      detail: !snapshot ? 'No Offline Pack saved on this device yet — go to Wedding Day > Offline Pack and Refresh.' : `Saved ${new Date(snapshot.generatedAt).toLocaleString()}${stale ? ' — stale, refresh it.' : '.'}`,
    },
    { label: 'Run sheet cached', status: snapshot && snapshot.runSheet.length > 0 ? 'pass' : 'warning', detail: snapshot ? `${snapshot.runSheet.length} item(s).` : 'Not cached yet.' },
    { label: 'Emergency contacts cached', status: snapshot && snapshot.emergencyContacts.length > 0 ? 'pass' : 'warning', detail: snapshot ? `${snapshot.emergencyContacts.length} contact(s).` : 'Not cached yet.' },
    { label: 'Vendor contacts cached', status: snapshot && snapshot.vendorContacts.length > 0 ? 'pass' : 'warning', detail: snapshot ? `${snapshot.vendorContacts.length} contact(s).` : 'Not cached yet.' },
    {
      label: 'Manifests cached',
      status: snapshot && (snapshot.manifests.guestArrival.length > 0 || snapshot.manifests.churchShuttle.length > 0 || snapshot.roomingList.length > 0) ? 'pass' : 'warning',
      detail: snapshot ? 'Arrival, shuttle, departure and rooming manifests included.' : 'Not cached yet.',
    },
    {
      label: 'Device time zone matches wedding time zone',
      status: !configuredTimeZone ? 'warning' : timeZoneMismatch ? 'warning' : 'pass',
      detail: !configuredTimeZone ? 'No wedding time zone configured in Settings.' : timeZoneMismatch ? `Device is set to ${deviceTimeZone}, wedding is configured for ${configuredTimeZone}. WeddingOS will not change your device's clock — check it manually.` : `Both set to ${configuredTimeZone}.`,
    },
    {
      label: 'Pending offline changes',
      status: pendingCount === 0 && conflictCount === 0 ? 'pass' : conflictCount > 0 ? 'fail' : 'warning',
      detail: conflictCount > 0 ? `${conflictCount} conflict(s) need resolving.` : pendingCount === 0 ? 'Nothing waiting to sync.' : `${pendingCount} change(s) waiting to sync.`,
    },
    {
      label: 'Last successful backend sync',
      status: !supabaseEnabled ? 'pass' : syncStatus.lastSyncedAt ? 'pass' : 'warning',
      detail: !supabaseEnabled ? 'Demo/Local Mode — no backend sync applies.' : syncStatus.lastSyncedAt ? new Date(syncStatus.lastSyncedAt).toLocaleString() : 'No successful sync recorded yet this session.',
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <Smartphone className="mr-1.5 inline size-4" aria-hidden="true" />
            Device Readiness
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-2.5">
          <p className="text-sm text-ink-faint">A quick check of THIS device, right now — run it on every phone/tablet/laptop that will be used on Wedding Day.</p>
          <ul className="space-y-2">
            {rows.map((row) => (
              <li key={row.label} className="flex items-start gap-2">
                <StatusIcon status={row.status} />
                <div>
                  <p className="text-sm font-medium text-ink">{row.label}</p>
                  <p className="text-xs text-ink-faint">{row.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Clock className="mr-1.5 inline size-4" aria-hidden="true" />
            Device time
          </CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-ink">{now.toLocaleString()}</p>
          <p className="text-xs text-ink-faint">Time zone: {deviceTimeZone}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Battery className="mr-1.5 inline size-4" aria-hidden="true" />
            Battery
          </CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-ink-faint">
            WeddingOS does not read this device's battery level. As a general recommendation: charge every Wedding Day device fully the night before, bring a
            portable charger or spare cable, and keep the command-desk laptop/tablet plugged in throughout the event.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
