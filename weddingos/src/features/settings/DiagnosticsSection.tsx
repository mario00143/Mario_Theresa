import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, PlayCircle, Trash2, Download } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import { APP_VERSION, BUILD_TIMESTAMP, GIT_SHA, OFFLINE_SNAPSHOT_SCHEMA_VERSION } from '@/lib/appVersion';
import { BACKUP_VERSION } from '@/types/backup';
import { getSyncStatus } from '@/lib/syncStatus';
import { runSystemCheck, type SystemCheckResult } from '@/lib/systemCheck';
import { getErrorLog, clearErrorLog, exportErrorLogText, onErrorLogChange, type ErrorLogEntry } from '@/lib/errorLog';
import { loadOfflineSnapshot } from '@/data/offline/offlineSnapshot';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { downloadTextFile } from '@/utils/download';
import type { OfflineSnapshot } from '@/types/offlineSnapshot';

function StatusIcon({ status }: { status: SystemCheckResult['status'] }) {
  if (status === 'pass') return <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />;
  if (status === 'warning') return <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden="true" />;
  return <XCircle className="size-4 shrink-0 text-critical" aria-hidden="true" />;
}

/**
 * Section 25-26/45/49's Admin-only System Diagnostics view. Deliberately
 * never renders an auth token, anon key, secret, or invite token — every
 * field here is either a static build constant, a connectivity Pass/Fail,
 * a count, or a timestamp.
 */
export function DiagnosticsSection() {
  const { supabaseEnabled } = useAuth();
  const { isAdmin } = usePermission();
  const { mutations } = useOfflineQueue();
  const [checkResults, setCheckResults] = useState<SystemCheckResult[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [snapshot, setSnapshot] = useState<OfflineSnapshot | undefined>(undefined);
  const [errorEntries, setErrorEntries] = useState<ErrorLogEntry[]>(getErrorLog());

  useEffect(() => {
    void loadOfflineSnapshot().then(setSnapshot);
    return onErrorLogChange(() => setErrorEntries(getErrorLog()));
  }, []);

  if (!isAdmin()) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-ink-faint">System Diagnostics is only available to workspace Admins.</p>
        </CardBody>
      </Card>
    );
  }

  async function handleRunCheck() {
    setChecking(true);
    setCheckResults(await runSystemCheck());
    setChecking(false);
  }

  const syncStatus = getSyncStatus();
  const pendingMutationCount = mutations.filter((m) => m.status === 'Pending' || m.status === 'Syncing' || m.status === 'Failed').length;
  const swRegistered = 'serviceWorker' in navigator;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>App version</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <p className="text-ink-faint">Version</p>
            <p className="font-medium text-ink">{APP_VERSION}</p>
          </div>
          <div>
            <p className="text-ink-faint">Build</p>
            <p className="font-medium text-ink">{new Date(BUILD_TIMESTAMP).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-ink-faint">Commit</p>
            <p className="font-medium text-ink">{GIT_SHA}</p>
          </div>
          <div>
            <p className="text-ink-faint">Mode</p>
            <p className="font-medium text-ink">{supabaseEnabled ? 'Production (Supabase)' : 'Demo / Local'}</p>
          </div>
          <div>
            <p className="text-ink-faint">Backup schema</p>
            <p className="font-medium text-ink">v{BACKUP_VERSION}</p>
          </div>
          <div>
            <p className="text-ink-faint">Offline pack schema</p>
            <p className="font-medium text-ink">v{OFFLINE_SNAPSHOT_SCHEMA_VERSION}</p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live status</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <p className="text-ink-faint">Last sync</p>
            <p className="font-medium text-ink">{syncStatus.lastSyncedAt ? new Date(syncStatus.lastSyncedAt).toLocaleString() : 'None recorded this session'}</p>
          </div>
          <div>
            <p className="text-ink-faint">Offline Pack last refreshed</p>
            <p className="font-medium text-ink">{snapshot ? new Date(snapshot.generatedAt).toLocaleString() : 'Not generated on this device'}</p>
          </div>
          <div>
            <p className="text-ink-faint">Pending offline changes</p>
            <p className="font-medium text-ink">{pendingMutationCount}</p>
          </div>
          <div>
            <p className="text-ink-faint">Service worker support</p>
            <p className="font-medium text-ink">{swRegistered ? 'Supported' : 'Not supported by this browser'}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-ink-faint">Browser / platform</p>
            <p className="font-medium text-ink break-all">{navigator.userAgent}</p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Run System Check</CardTitle>
          <Button variant="secondary" size="sm" icon={<PlayCircle className="size-3.5" aria-hidden="true" />} onClick={() => void handleRunCheck()} disabled={checking}>
            {checking ? 'Checking…' : 'Run check'}
          </Button>
        </CardHeader>
        <CardBody className="space-y-2">
          {checkResults === null && <p className="text-sm text-ink-faint">Not run yet this session.</p>}
          {checkResults?.map((r) => (
            <div key={r.label} className="flex items-start gap-2">
              <StatusIcon status={r.status} />
              <div>
                <p className="text-sm font-medium text-ink">{r.label}</p>
                <p className="text-xs text-ink-faint">{r.detail}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error log ({errorEntries.length})</CardTitle>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={<Download className="size-3.5" aria-hidden="true" />} onClick={() => downloadTextFile('weddingos-error-log.json', exportErrorLogText(), 'application/json')}>
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="size-3.5" aria-hidden="true" />}
              onClick={() => {
                clearErrorLog();
                setErrorEntries([]);
              }}
            >
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <p className="mb-2 text-xs text-ink-faint">Kept only on this device, never sent anywhere automatically. Newest first, capped at 100 entries.</p>
          {errorEntries.length === 0 ? (
            <p className="text-sm text-ink-faint">No errors recorded.</p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto text-xs">
              {[...errorEntries].reverse().map((e, i) => (
                <li key={i} className="rounded-md border border-line-soft p-2">
                  <p className="font-medium text-ink">
                    [{e.category}] {e.message}
                  </p>
                  <p className="text-ink-faint">
                    {new Date(e.timestamp).toLocaleString()} · {e.route} · v{e.appVersion} · {e.mode} · {e.onlineStatus ? 'online' : 'offline'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
