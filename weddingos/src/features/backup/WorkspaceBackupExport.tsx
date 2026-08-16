import { useState } from 'react';
import { BACKUP_VERSION } from '@/types';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermission } from '@/hooks/usePermission';
import { exportWorkspaceBackup } from '@/data/supabase/backupV7';
import { downloadTextFile } from '@/utils/download';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/** Role-aware Supabase workspace export (section 60) — a Viewer's export never contains finance data even if the local cache has it hydrated. */
export function WorkspaceBackupExport() {
  const { currentWorkspace } = useWorkspace();
  const { role } = usePermission();
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentWorkspace) return null;

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      const backup = await exportWorkspaceBackup(currentWorkspace!.id, role);
      const filename = `weddingos-backup-v${BACKUP_VERSION}-${currentWorkspace!.slug}-${new Date().toISOString().slice(0, 10)}.json`;
      downloadTextFile(filename, JSON.stringify(backup, null, 2), 'application/json');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <Card className="max-w-lg space-y-3 p-4">
      <h2 className="text-ink text-sm font-semibold">Export workspace backup</h2>
      <p className="text-ink-soft text-sm">
        Downloads a v{BACKUP_VERSION} JSON backup of everything in this workspace your role ({role ?? 'Viewer'}) can read, plus document
        metadata (not the files themselves) and workspace details. Never includes login credentials or signed download links.
      </p>
      <Button variant="primary" onClick={() => void handleExport()} disabled={exporting}>
        {exporting ? 'Exporting…' : 'Download backup'}
      </Button>
      {error && <p className="text-critical text-sm">{error}</p>}
    </Card>
  );
}
