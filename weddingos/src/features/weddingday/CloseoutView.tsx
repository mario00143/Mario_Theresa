import { useState } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import type { CloseoutCategory, CloseoutStatus } from '@/types';
import { CLOSEOUT_CATEGORIES, CLOSEOUT_STATUSES } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Field, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useSettings } from '@/hooks/useSettings';
import { useCloseoutItems } from '@/hooks/useCloseoutItems';
import { closeoutExceptions, computeCloseoutProgress, isCloseoutItemOverdue } from '@/utils/closeoutLogic';
import { formatRunSheetClockTime } from '@/utils/runSheetLogic';
import { closeoutChecklistCsvFilename, closeoutChecklistToCSV } from '@/data/repositories/weddingDayCsv';
import { downloadTextFile } from '@/utils/download';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useAuth } from '@/context/AuthContext';
import { enqueueOfflineMutation } from '@/data/offline/offlineMutationQueue';

const STATUS_TONE: Record<CloseoutStatus, BadgeTone> = {
  Pending: 'neutral',
  'In Progress': 'info',
  Complete: 'success',
  Exception: 'critical',
};

function CloseoutCard({ itemId, referenceTime }: { itemId: string; referenceTime: string }) {
  const { closeoutItems, updateCloseoutItem, deleteCloseoutItem, setCloseoutItemStatus } = useCloseoutItems();
  const isOnline = useOnlineStatus();
  const { supabaseEnabled } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const item = closeoutItems.find((i) => i.id === itemId);
  if (!item) return null;

  const overdue = isCloseoutItemOverdue(item, referenceTime);

  function handleStatusChange(status: CloseoutStatus) {
    if (supabaseEnabled && !isOnline) {
      void enqueueOfflineMutation({ entityType: 'closeoutItem', action: 'updateStatus', payload: { status, completedAt: status === 'Complete' ? new Date().toISOString() : undefined } }, itemId);
    } else {
      setCloseoutItemStatus(itemId, status, item!.verificationNote);
    }
  }

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{item.title}</span>
          <Badge tone="neutral">{item.category}</Badge>
          <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
          {overdue && <Badge tone="critical">Overdue</Badge>}
        </div>
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label={`Delete closeout item "${item.title}"`} className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`co-category-${item.id}`}>Category</Label>
          <Select id={`co-category-${item.id}`} value={item.category} onChange={(e) => updateCloseoutItem(item.id, { category: e.target.value as CloseoutCategory })}>
            {CLOSEOUT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`co-owner-${item.id}`}>Owner</Label>
          <Input id={`co-owner-${item.id}`} defaultValue={item.owner ?? ''} key={`co-owner-${item.id}`} onBlur={(e) => updateCloseoutItem(item.id, { owner: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`co-due-${item.id}`}>Due time</Label>
          <Input id={`co-due-${item.id}`} type="time" defaultValue={item.dueTime ?? ''} key={`co-due-${item.id}`} onBlur={(e) => updateCloseoutItem(item.id, { dueTime: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`co-status-${item.id}`}>Status</Label>
          <Select id={`co-status-${item.id}`} value={item.status} onChange={(e) => handleStatusChange(e.target.value as CloseoutStatus)}>
            {CLOSEOUT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field>
        <Label htmlFor={`co-verification-${item.id}`}>Verification note</Label>
        <Textarea id={`co-verification-${item.id}`} defaultValue={item.verificationNote ?? ''} key={`co-verification-${item.id}`} onBlur={(e) => updateCloseoutItem(item.id, { verificationNote: e.target.value || undefined })} />
      </Field>
      <Field>
        <Label htmlFor={`co-notes-${item.id}`}>Notes</Label>
        <Textarea id={`co-notes-${item.id}`} defaultValue={item.notes ?? ''} key={`co-notes-${item.id}`} onBlur={(e) => updateCloseoutItem(item.id, { notes: e.target.value || undefined })} />
      </Field>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete closeout item"
        message={`Delete "${item.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteCloseoutItem(item.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function CloseoutView() {
  const { settings } = useSettings();
  const { closeoutItems, addCloseoutItem } = useCloseoutItems();
  const [newTitle, setNewTitle] = useState('');

  const referenceISO = settings.weddingDay.simulationDateTimeISO ?? new Date().toISOString();
  const referenceTime = formatRunSheetClockTime(referenceISO);
  const progress = computeCloseoutProgress(closeoutItems);
  const exceptions = closeoutExceptions(closeoutItems);

  function handleAdd() {
    if (!newTitle.trim()) return;
    addCloseoutItem({ category: 'Other', title: newTitle.trim(), status: 'Pending' });
    setNewTitle('');
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">
              {progress.complete} / {progress.total} complete ({progress.percent}%)
            </p>
            {progress.exceptions > 0 && <Badge tone="critical">{progress.exceptions} exception{progress.exceptions === 1 ? '' : 's'}</Badge>}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-brand-700" style={{ width: `${progress.percent}%` }} />
          </div>
        </CardBody>
      </Card>

      {exceptions.length > 0 && (
        <Card className="border-critical/40 bg-critical-bg">
          <CardBody className="space-y-1.5">
            <p className="text-sm font-semibold text-critical">Exceptions needing attention</p>
            {exceptions.map((e) => (
              <p key={e.id} className="text-sm text-ink">
                <span className="font-medium">{e.title}</span>
                {e.verificationNote ? ` — ${e.verificationNote}` : ''}
              </p>
            ))}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Closeout checklist ({closeoutItems.length})</CardTitle>
          <Button variant="secondary" size="sm" icon={<Download className="size-3.5" aria-hidden="true" />} onClick={() => downloadTextFile(closeoutChecklistCsvFilename(), closeoutChecklistToCSV(closeoutItems), 'text/csv')}>
            Export CSV
          </Button>
        </CardHeader>
        <CardBody className="space-y-3">
          {closeoutItems.length === 0 ? (
            <EmptyState title="No closeout items yet" description="Add one below." />
          ) : (
            <div className="space-y-3">
              {closeoutItems.map((i) => (
                <CloseoutCard key={i.id} itemId={i.id} referenceTime={referenceTime} />
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New closeout item…" aria-label="New closeout item title" />
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd} disabled={!newTitle.trim()}>
              Add item
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
