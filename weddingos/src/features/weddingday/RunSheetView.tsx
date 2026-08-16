import { useState } from 'react';
import { Download, Plus, Printer, Trash2 } from 'lucide-react';
import type { RunSheetCategory, RunSheetItem, RunSheetStatus } from '@/types';
import { RUN_SHEET_CATEGORIES, RUN_SHEET_STATUSES } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PermissionGate } from '@/components/ui/PermissionGate';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { RunSheetItemEditModal } from './RunSheetItemEditModal';
import { DelayPropagationDialog } from './DelayPropagationDialog';
import { useSettings } from '@/hooks/useSettings';
import { useRunSheet } from '@/hooks/useRunSheet';
import { useCeremonyParticipants } from '@/hooks/useCeremonyParticipants';
import { useVendors } from '@/hooks/useVendors';
import { useCeremonyItems } from '@/hooks/useCeremonyItems';
import { useTasks } from '@/hooks/useTasks';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useChurchProfiles } from '@/hooks/useChurchProfiles';
import { usePhotographyPlans } from '@/hooks/usePhotographyPlans';
import { computeRunSheetTimingStatus, formatRunSheetClockTime, formatRunSheetRelativeLabel, resolveRunSheetPlannedDateTimeISO, sortRunSheetItems } from '@/utils/runSheetLogic';
import { runSheetCsvFilename, runSheetToCSV } from '@/data/repositories/weddingDayCsv';
import { downloadTextFile } from '@/utils/download';
import type { DelayConflictContext } from '@/utils/delayPropagation';

const STATUS_TONE: Record<RunSheetStatus, BadgeTone> = {
  Planned: 'neutral',
  Ready: 'info',
  'In Progress': 'success',
  Delayed: 'critical',
  Complete: 'low',
  Skipped: 'neutral',
  Cancelled: 'neutral',
};

function timingTone(label: string): BadgeTone {
  if (label === 'Ahead') return 'info';
  if (label === 'On Time') return 'success';
  return 'critical';
}

export function RunSheetView() {
  const { settings } = useSettings();
  const { runSheetItems, addRunSheetItem, updateRunSheetItem, deleteRunSheetItem, startRunSheetItem, completeRunSheetItem, delayRunSheetItem, applyDelayShift } = useRunSheet();
  const { ceremonyParticipants } = useCeremonyParticipants();
  const { vendors } = useVendors();
  const { ceremonyItems } = useCeremonyItems();
  const { tasks } = useTasks();
  const { routes } = useTransportRoutes();
  const { churchProfiles } = useChurchProfiles();
  const { photographyPlans } = usePhotographyPlans();

  const [categoryFilter, setCategoryFilter] = useState<'All' | RunSheetCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | RunSheetStatus>('All');
  const [editItem, setEditItem] = useState<RunSheetItem | null>(null);
  const [delayItem, setDelayItem] = useState<RunSheetItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<RunSheetItem | null>(null);

  const referenceISO = settings.weddingDay.simulationDateTimeISO ?? new Date().toISOString();
  const sorted = sortRunSheetItems(runSheetItems, settings);
  const filtered = sorted.filter((i) => (categoryFilter === 'All' || i.category === categoryFilter) && (statusFilter === 'All' || i.status === statusFilter));

  const church = churchProfiles[0];
  const delayContext: DelayConflictContext = {
    churchAccessStartDateTimeISO: church?.accessStartTime ? `${settings.wedding.date}T${church.accessStartTime}:00` : undefined,
    photographyPlans,
    transportRoutes: routes,
  };

  function handleAdd() {
    addRunSheetItem({
      event: 'Wedding',
      date: settings.wedding.date,
      relativeReference: 'None',
      startTime: '12:00',
      activity: 'New run-sheet item',
      category: 'Other',
      status: 'Planned',
    });
  }

  function handleDelayConfirm(item: RunSheetItem, delayMinutes: number, reason: string, applyItemIds: string[]) {
    delayRunSheetItem(item.id, delayMinutes, reason || undefined);
    if (applyItemIds.length > 0) {
      applyDelayShift(applyItemIds, delayMinutes, `Carried forward a ${delayMinutes}m delay from "${item.activity}"${reason ? ` (${reason})` : ''}.`);
    }
    setDelayItem(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run sheet ({filtered.length})</CardTitle>
        <div className="no-print flex gap-2">
          <Button variant="secondary" size="sm" icon={<Printer className="size-3.5" aria-hidden="true" />} onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="secondary" size="sm" icon={<Download className="size-3.5" aria-hidden="true" />} onClick={() => downloadTextFile(runSheetCsvFilename(), runSheetToCSV(sorted, settings), 'text/csv')}>
            Export CSV
          </Button>
          <PermissionGate module="weddingDay">
            <Button variant="primary" size="sm" icon={<Plus className="size-3.5" aria-hidden="true" />} onClick={handleAdd}>
              Add item
            </Button>
          </PermissionGate>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)} className="max-w-[14rem]" aria-label="Filter by category">
            <option value="All">All categories</option>
            {RUN_SHEET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="max-w-[12rem]" aria-label="Filter by status">
            <option value="All">All statuses</option>
            {RUN_SHEET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No items match" description="Try a different filter, or add a new run-sheet item above." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-line-soft">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-subtle">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-ink-faint">Time</th>
                  <th className="px-3 py-2 text-left font-medium text-ink-faint">Activity</th>
                  <th className="px-3 py-2 text-left font-medium text-ink-faint">Owner</th>
                  <th className="px-3 py-2 text-left font-medium text-ink-faint">Status</th>
                  <th className="px-3 py-2 text-left font-medium text-ink-faint">Timing</th>
                  <th className="px-3 py-2 text-left font-medium text-ink-faint">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {filtered.map((item) => {
                  const planned = resolveRunSheetPlannedDateTimeISO(item, settings);
                  const timing = computeRunSheetTimingStatus(item, settings, referenceISO);
                  return (
                    <tr key={item.id}>
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        <p className="text-ink font-medium">{formatRunSheetClockTime(planned)}</p>
                        <p className="text-xs text-ink-faint">{formatRunSheetRelativeLabel(item)}</p>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <p className="text-ink font-medium">{item.activity}</p>
                        <p className="text-xs text-ink-faint">
                          {item.category}
                          {item.location ? ` · ${item.location}` : ''}
                        </p>
                        {(item.delayMinutes ?? 0) > 0 && <p className="text-xs text-critical font-medium">Delayed {item.delayMinutes} min</p>}
                      </td>
                      <td className="px-3 py-2 align-top text-ink-faint">{item.owner ?? '—'}</td>
                      <td className="px-3 py-2 align-top">
                        <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <Badge tone={timingTone(timing)}>{timing}</Badge>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-wrap gap-1.5">
                          {(item.status === 'Planned' || item.status === 'Ready') && (
                            <Button variant="ghost" size="sm" onClick={() => startRunSheetItem(item.id, referenceISO)}>
                              Start
                            </Button>
                          )}
                          {(item.status === 'In Progress' || item.status === 'Delayed') && (
                            <Button variant="ghost" size="sm" onClick={() => completeRunSheetItem(item.id, referenceISO)}>
                              Complete
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => setDelayItem(item)}>
                            Delay
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditItem(item)}>
                            Edit
                          </Button>
                          <button
                            type="button"
                            onClick={() => setDeleteItem(item)}
                            aria-label={`Delete "${item.activity}"`}
                            className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>

      {editItem && (
        <RunSheetItemEditModal
          open
          onClose={() => setEditItem(null)}
          item={editItem}
          allItems={runSheetItems}
          ceremonyParticipants={ceremonyParticipants}
          vendors={vendors}
          ceremonyItems={ceremonyItems}
          tasks={tasks}
          transportRoutes={routes}
          onSave={(patch) => updateRunSheetItem(editItem.id, patch)}
        />
      )}

      {delayItem && (
        <DelayPropagationDialog
          open
          onClose={() => setDelayItem(null)}
          item={delayItem}
          allItems={runSheetItems}
          settings={settings}
          vendors={vendors}
          context={delayContext}
          onConfirm={(delayMinutes, reason, applyItemIds) => handleDelayConfirm(delayItem, delayMinutes, reason, applyItemIds)}
        />
      )}

      <ConfirmDialog
        open={deleteItem !== null}
        title="Delete run-sheet item"
        message={deleteItem ? `Delete "${deleteItem.activity}"? Any other item depending on it will have the dependency cleared. This cannot be undone.` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteItem) deleteRunSheetItem(deleteItem.id);
          setDeleteItem(null);
        }}
        onCancel={() => setDeleteItem(null)}
      />
    </Card>
  );
}
