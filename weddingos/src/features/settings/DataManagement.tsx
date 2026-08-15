import { useRef, useState } from 'react';
import { Download, RotateCcw, Upload } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  backupFilename,
  exportBackup,
  importBackup,
  tasksCsvFilename,
  tasksToCSV,
  validateBackup,
} from '@/data/repositories/backupRepository';
import { resetToDemoData } from '@/data/stores';
import { useTasks } from '@/hooks/useTasks';
import { downloadTextFile } from '@/utils/download';
import type { WeddingOSBackup } from '@/types';

export function DataManagement() {
  const { tasks } = useTasks();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<WeddingOSBackup | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleExportJSON = () => {
    const backup = exportBackup();
    downloadTextFile(backupFilename(), JSON.stringify(backup, null, 2), 'application/json');
    setStatus('Backup exported.');
  };

  const handleExportCSV = () => {
    downloadTextFile(tasksCsvFilename(), tasksToCSV(tasks), 'text/csv');
    setStatus('Tasks exported as CSV.');
  };

  const handleFileSelected = async (file: File) => {
    setImportErrors([]);
    setStatus(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const validation = validateBackup(data);
      if (!validation.valid) {
        setImportErrors(validation.errors);
        return;
      }
      setPendingImport(data as WeddingOSBackup);
    } catch {
      setImportErrors(['File is not valid JSON.']);
    }
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    importBackup(pendingImport);
    setPendingImport(null);
    setStatus('Backup imported successfully.');
  };

  const handleReset = () => {
    resetToDemoData();
    setConfirmReset(false);
    setStatus('Demo data restored.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data management</CardTitle>
      </CardHeader>
      <CardBody className="space-y-5">
        {status && <div className="rounded-lg border border-success/30 bg-success-bg px-3.5 py-2.5 text-sm text-success">{status}</div>}
        {importErrors.length > 0 && (
          <div className="rounded-lg border border-critical/30 bg-critical-bg px-3.5 py-3 text-sm text-critical space-y-1">
            <p className="font-medium">This file could not be imported:</p>
            <ul className="list-disc list-inside">
              {importErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-ink">Backup</p>
          <p className="text-xs text-ink-faint mt-0.5 mb-2.5">Export everything — settings, tasks, decisions, and owner roles — as a single JSON file.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportJSON}>
              Export backup (JSON)
            </Button>
            <Button
              variant="secondary"
              icon={<Upload className="size-4" aria-hidden="true" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Import backup (JSON)
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelected(file);
                e.target.value = '';
              }}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Export</p>
          <p className="text-xs text-ink-faint mt-0.5 mb-2.5">Export all tasks as a spreadsheet-friendly CSV file.</p>
          <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportCSV}>
            Export tasks (CSV)
          </Button>
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Reset</p>
          <p className="text-xs text-ink-faint mt-0.5 mb-2.5">Discard all current data and restore the original demo dataset. This cannot be undone.</p>
          <Button variant="danger" icon={<RotateCcw className="size-4" aria-hidden="true" />} onClick={() => setConfirmReset(true)}>
            Reset to demo data
          </Button>
        </div>
      </CardBody>

      <ConfirmDialog
        open={pendingImport !== null}
        title="Import backup"
        message="Importing will replace all current settings, tasks, decisions, and owner roles with the contents of this file. This cannot be undone."
        confirmLabel="Import and overwrite"
        danger
        onConfirm={confirmImport}
        onCancel={() => setPendingImport(null)}
      />

      <ConfirmDialog
        open={confirmReset}
        title="Reset to demo data"
        message="This will permanently delete all current settings, tasks, decisions, and owner roles, replacing them with the original demo dataset."
        confirmLabel="Reset"
        danger
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </Card>
  );
}
