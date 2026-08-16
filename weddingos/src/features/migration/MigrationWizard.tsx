import { useEffect, useMemo, useState } from 'react';
import { exportBackup } from '@/data/repositories/backupRepository';
import { downloadTextFile } from '@/utils/download';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermission } from '@/hooks/usePermission';
import {
  computeLocalDataFingerprint,
  getLocalRecordCounts,
  migrateAllCollections,
  validateReferences,
  verifyMigration,
  type MigrationProgress,
} from '@/data/migration/migrationEngine';
import { createMigrationRecord, findCompletedMigration, updateMigrationRecord } from '@/data/supabase/dataMigrationRepository';
import { BACKUP_VERSION } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

type WizardState = 'analyzing' | 'ready' | 'blocked' | 'migrating' | 'verified' | 'failed';

export function MigrationWizard() {
  const { currentWorkspace } = useWorkspace();
  const { isAdminOrCouple } = usePermission();
  const backup = useMemo(() => exportBackup(), []);
  const counts = useMemo(() => getLocalRecordCounts(backup), [backup]);
  const referenceProblems = useMemo(() => validateReferences(backup), [backup]);

  const [state, setState] = useState<WizardState>('analyzing');
  const [fingerprint, setFingerprint] = useState('');
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [verification, setVerification] = useState<{ key: string; source: number; destination: number }[] | null>(null);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);

  useEffect(() => {
    if (!currentWorkspace) return;
    let cancelled = false;
    computeLocalDataFingerprint(backup).then(async (fp) => {
      if (cancelled) return;
      setFingerprint(fp);
      const existing = await findCompletedMigration(currentWorkspace.id, fp);
      if (cancelled) return;
      if (existing) {
        setBlockedReason(`This exact local dataset was already migrated into this workspace on ${new Date(existing.completedAt ?? existing.startedAt).toLocaleString()}.`);
        setState('blocked');
      } else {
        setState('ready');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentWorkspace, backup]);

  if (!currentWorkspace) return null;

  if (!isAdminOrCouple()) {
    return <EmptyState title="Not available for your role" description="Only Admin and Couple members can run a data migration." />;
  }

  const totalRecords = Object.values(counts).reduce((sum, n) => sum + n, 0);

  function downloadBackup() {
    downloadTextFile(`weddingos-backup-v${BACKUP_VERSION}-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(backup, null, 2), 'application/json');
  }

  async function startMigration() {
    if (!currentWorkspace) return;
    setState('migrating');
    setErrorSummary(null);
    const migrationRecord = await createMigrationRecord({
      workspaceId: currentWorkspace.id,
      sourceType: 'localStorage',
      sourceVersion: BACKUP_VERSION,
      sourceFingerprint: fingerprint,
      startedAt: new Date().toISOString(),
      status: 'In Progress',
      recordCounts: {},
    });
    try {
      const pushedCounts = await migrateAllCollections(currentWorkspace.id, backup, setProgress);
      const results = await verifyMigration(currentWorkspace.id, pushedCounts);
      const mismatches = results.filter((r) => r.source !== r.destination);
      const recordCounts = Object.fromEntries(results.map((r) => [r.key, { source: r.source, destination: r.destination }]));

      await updateMigrationRecord(migrationRecord.id, {
        status: mismatches.length === 0 ? 'Verified' : 'Failed',
        completedAt: new Date().toISOString(),
        recordCounts,
        errorSummary: mismatches.length > 0 ? `${mismatches.length} collection(s) had a count mismatch after migration.` : undefined,
      });

      setVerification(results);
      setState(mismatches.length === 0 ? 'verified' : 'failed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Migration failed.';
      setErrorSummary(message);
      await updateMigrationRecord(migrationRecord.id, { status: 'Failed', completedAt: new Date().toISOString(), errorSummary: message });
      setState('failed');
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card className="space-y-3 p-4">
        <h2 className="text-ink text-sm font-semibold">Migrate Local WeddingOS Data</h2>
        <p className="text-ink-soft text-sm">
          Copies everything currently stored in this browser ({totalRecords.toLocaleString()} records across {Object.keys(counts).length}{' '}
          collections, backup v{BACKUP_VERSION}) into <strong>{currentWorkspace.name}</strong>. Your local data is never deleted by this step.
        </p>
        <Button variant="secondary" onClick={downloadBackup}>
          Download local backup first (recommended)
        </Button>

        {referenceProblems.length > 0 && (
          <div className="border-warning/30 bg-warning-bg rounded-lg border p-2.5">
            <p className="text-warning text-xs font-medium">{referenceProblems.length} reference warning(s) found:</p>
            <ul className="text-warning mt-1 list-disc pl-4 text-xs">
              {referenceProblems.slice(0, 5).map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
          {Object.entries(counts)
            .filter(([, n]) => n > 0)
            .map(([key, n]) => (
              <div key={key} className="text-ink-faint flex justify-between">
                <span>{key}</span>
                <span className="text-ink font-medium">{n}</span>
              </div>
            ))}
        </div>

        {state === 'blocked' && (
          <div className="border-line-soft bg-surface-subtle rounded-lg border p-2.5">
            <p className="text-ink-soft text-sm">{blockedReason}</p>
            <p className="text-ink-faint mt-1 text-xs">
              To migrate this data again as a separate copy, create a new workspace first and run this wizard there.
            </p>
          </div>
        )}

        {state === 'ready' && (
          <Button variant="primary" onClick={() => void startMigration()}>
            Migrate local data into {currentWorkspace.name}
          </Button>
        )}

        {state === 'migrating' && progress && (
          <p className="text-ink-soft text-sm">
            Migrating {progress.key}… ({progress.index + 1}/{progress.total})
          </p>
        )}

        {errorSummary && <p className="text-critical text-sm">{errorSummary}</p>}
      </Card>

      {verification && (
        <Card className="space-y-2 p-4">
          <h3 className="text-ink text-sm font-semibold">{state === 'verified' ? 'Migration verified' : 'Migration completed with mismatches'}</h3>
          <div className="max-h-80 space-y-1 overflow-y-auto text-xs">
            {verification
              .filter((r) => r.source > 0 || r.destination > 0)
              .map((r) => (
                <div key={r.key} className={`flex justify-between ${r.source !== r.destination ? 'text-critical font-medium' : 'text-ink-faint'}`}>
                  <span>{r.key}</span>
                  <span>
                    {r.destination} / {r.source}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}
