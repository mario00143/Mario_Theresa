import { useMemo, useState } from 'react';
import type { AppSettings, RunSheetItem, Vendor } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { computeDelayPropagationPreview, type DelayConflictContext } from '@/utils/delayPropagation';
import { formatRunSheetClockTime } from '@/utils/runSheetLogic';

interface DelayPropagationDialogProps {
  open: boolean;
  onClose: () => void;
  item: RunSheetItem;
  allItems: RunSheetItem[];
  settings: AppSettings;
  vendors: Vendor[];
  context: DelayConflictContext;
  onConfirm: (delayMinutes: number, reason: string, applyItemIds: string[]) => void;
}

export function DelayPropagationDialog({ open, onClose, item, allItems, settings, vendors, context, onConfirm }: DelayPropagationDialogProps) {
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [reason, setReason] = useState('');
  const [previewed, setPreviewed] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const vendorById = useMemo(() => new Map(vendors.map((v) => [v.id, v])), [vendors]);

  const previewRows = useMemo(() => {
    if (!previewed) return [];
    return computeDelayPropagationPreview(item.id, delayMinutes, allItems, settings, context);
  }, [previewed, item.id, delayMinutes, allItems, settings, context]);

  function reset() {
    setDelayMinutes(15);
    setReason('');
    setPreviewed(false);
    setSelectedIds(new Set());
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handlePreview() {
    const rows = computeDelayPropagationPreview(item.id, delayMinutes, allItems, settings, context);
    setSelectedIds(new Set(rows.map((r) => r.itemId)));
    setPreviewed(true);
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applyAndClose(applyItemIds: string[]) {
    onConfirm(delayMinutes, reason, applyItemIds);
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={`Mark "${item.activity}" delayed`} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="delay-minutes">Delay (minutes)</Label>
            <Input
              id="delay-minutes"
              type="number"
              min={1}
              value={delayMinutes}
              onChange={(e) => {
                setDelayMinutes(Number(e.target.value) || 0);
                setPreviewed(false);
              }}
            />
          </Field>
          <Field>
            <Label htmlFor="delay-reason">Reason</Label>
            <Input id="delay-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Traffic near venue" />
          </Field>
        </div>

        {!previewed && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handlePreview}>
              Preview propagation
            </Button>
            <p className="text-xs text-ink-faint">See which dependent run-sheet items would shift if this delay is carried forward.</p>
          </div>
        )}

        {previewed && previewRows.length === 0 && (
          <p className="text-sm text-ink-faint">No dependent run-sheet items are linked to this item, so there's nothing to propagate.</p>
        )}

        {previewed && previewRows.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">
              Carrying this delay forward would shift {previewRows.length} dependent item{previewRows.length === 1 ? '' : 's'}:
            </p>
            <div className="overflow-x-auto rounded-lg border border-line-soft">
              <table className="min-w-full text-sm">
                <thead className="bg-surface-subtle">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-ink-faint w-8"></th>
                    <th className="px-2 py-2 text-left font-medium text-ink-faint">Item</th>
                    <th className="px-2 py-2 text-left font-medium text-ink-faint">Original</th>
                    <th className="px-2 py-2 text-left font-medium text-ink-faint">Proposed</th>
                    <th className="px-2 py-2 text-left font-medium text-ink-faint">Owner / Vendor</th>
                    <th className="px-2 py-2 text-left font-medium text-ink-faint">Conflicts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {previewRows.map((row) => (
                    <tr key={row.itemId}>
                      <td className="px-2 py-2 align-top">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.itemId)}
                          onChange={() => toggleSelected(row.itemId)}
                          aria-label={`Apply shift to ${row.activity}`}
                        />
                      </td>
                      <td className="px-2 py-2 align-top text-ink">{row.activity}</td>
                      <td className="px-2 py-2 align-top text-ink-faint">{formatRunSheetClockTime(row.originalDateTimeISO)}</td>
                      <td className="px-2 py-2 align-top text-ink font-medium">{formatRunSheetClockTime(row.proposedDateTimeISO)}</td>
                      <td className="px-2 py-2 align-top text-ink-faint">
                        {[row.owner, ...row.vendorIds.map((id) => vendorById.get(id)?.name)].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-2 py-2 align-top">
                        {row.conflicts.length === 0 ? (
                          <span className="text-ink-faint">None</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {row.conflicts.map((c, i) => (
                              <Badge key={i} tone="danger">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-ink-faint">
              Nothing is changed automatically. Choose which items to shift, or ignore propagation entirely — an audit note is kept either way.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-line-soft pt-4">
        <Button variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
        {previewed && previewRows.length > 0 && (
          <>
            <Button variant="secondary" onClick={() => applyAndClose([])}>
              Ignore propagation
            </Button>
            <Button variant="secondary" onClick={() => applyAndClose(Array.from(selectedIds))} disabled={selectedIds.size === 0}>
              Apply to selected ({selectedIds.size})
            </Button>
            <Button variant="primary" onClick={() => applyAndClose(previewRows.map((r) => r.itemId))}>
              Apply to all
            </Button>
          </>
        )}
        {(!previewed || previewRows.length === 0) && (
          <Button variant="primary" onClick={() => applyAndClose([])}>
            Mark delayed
          </Button>
        )}
      </div>
    </Modal>
  );
}
