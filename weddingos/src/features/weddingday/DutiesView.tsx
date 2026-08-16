import { useMemo, useState } from 'react';
import { Download, Plus, Printer, Trash2 } from 'lucide-react';
import type { DutyRole, DutyStatus } from '@/types';
import { DUTY_ROLES, DUTY_STATUSES, DEFAULT_CRITICAL_DUTY_ROLES } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Field, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDutyAssignments } from '@/hooks/useDutyAssignments';
import { useGuests } from '@/hooks/useGuests';
import { criticalDutiesWithoutBackup, criticalDutiesWithoutPhone, detectDutyOverlaps, isCriticalDutyRole, missingCriticalDutyRoles } from '@/utils/dutyLogic';
import { dutyRosterCsvFilename, dutyRosterToCSV } from '@/data/repositories/weddingDayCsv';
import { downloadTextFile } from '@/utils/download';

function DutyCard({ dutyId }: { dutyId: string }) {
  const { dutyAssignments, updateDutyAssignment, deleteDutyAssignment } = useDutyAssignments();
  const { guests } = useGuests();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const duty = dutyAssignments.find((d) => d.id === dutyId);
  if (!duty) return null;
  const critical = isCriticalDutyRole(duty.role);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{duty.role}</span>
          {critical && <Badge tone="critical">Critical</Badge>}
          <Badge tone="neutral">{duty.personName || 'Unassigned'}</Badge>
          <Badge tone={duty.status === 'Active' || duty.status === 'Confirmed' ? 'success' : duty.status === 'Unavailable' ? 'critical' : 'neutral'}>{duty.status}</Badge>
          {critical && !duty.phone?.trim() && <Badge tone="warning">No phone</Badge>}
          {critical && !duty.backupPersonName?.trim() && <Badge tone="warning">No backup</Badge>}
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label={`Delete duty "${duty.role}"`}
          className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`duty-role-${duty.id}`}>Role</Label>
          <Select id={`duty-role-${duty.id}`} value={duty.role} onChange={(e) => updateDutyAssignment(duty.id, { role: e.target.value as DutyRole })}>
            {DUTY_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`duty-person-${duty.id}`}>Person name</Label>
          <Input id={`duty-person-${duty.id}`} defaultValue={duty.personName} key={`duty-person-${duty.id}`} onBlur={(e) => updateDutyAssignment(duty.id, { personName: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`duty-phone-${duty.id}`}>Phone</Label>
          <Input id={`duty-phone-${duty.id}`} defaultValue={duty.phone ?? ''} key={`duty-phone-${duty.id}`} onBlur={(e) => updateDutyAssignment(duty.id, { phone: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`duty-status-${duty.id}`}>Status</Label>
          <Select id={`duty-status-${duty.id}`} value={duty.status} onChange={(e) => updateDutyAssignment(duty.id, { status: e.target.value as DutyStatus })}>
            {DUTY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`duty-backup-${duty.id}`}>Backup person</Label>
          <Input id={`duty-backup-${duty.id}`} defaultValue={duty.backupPersonName ?? ''} key={`duty-backup-${duty.id}`} onBlur={(e) => updateDutyAssignment(duty.id, { backupPersonName: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`duty-backup-phone-${duty.id}`}>Backup phone</Label>
          <Input id={`duty-backup-phone-${duty.id}`} defaultValue={duty.backupPhone ?? ''} key={`duty-backup-phone-${duty.id}`} onBlur={(e) => updateDutyAssignment(duty.id, { backupPhone: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`duty-start-${duty.id}`}>Start time</Label>
          <Input id={`duty-start-${duty.id}`} type="time" defaultValue={duty.startTime ?? ''} key={`duty-start-${duty.id}`} onBlur={(e) => updateDutyAssignment(duty.id, { startTime: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`duty-end-${duty.id}`}>End time</Label>
          <Input id={`duty-end-${duty.id}`} type="time" defaultValue={duty.endTime ?? ''} key={`duty-end-${duty.id}`} onBlur={(e) => updateDutyAssignment(duty.id, { endTime: e.target.value || undefined })} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`duty-location-${duty.id}`}>Location</Label>
          <Input id={`duty-location-${duty.id}`} defaultValue={duty.location ?? ''} key={`duty-location-${duty.id}`} onBlur={(e) => updateDutyAssignment(duty.id, { location: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`duty-guest-${duty.id}`}>Linked guest (optional)</Label>
          <Select id={`duty-guest-${duty.id}`} value={duty.linkedGuestId ?? ''} onChange={(e) => updateDutyAssignment(duty.id, { linkedGuestId: e.target.value || undefined })}>
            <option value="">None</option>
            {guests.map((g) => (
              <option key={g.id} value={g.id}>
                {g.fullName}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field>
        <Label htmlFor={`duty-responsibilities-${duty.id}`}>Responsibilities</Label>
        <Textarea id={`duty-responsibilities-${duty.id}`} defaultValue={duty.responsibilities ?? ''} key={`duty-responsibilities-${duty.id}`} onBlur={(e) => updateDutyAssignment(duty.id, { responsibilities: e.target.value || undefined })} />
      </Field>
      <Field>
        <Label htmlFor={`duty-notes-${duty.id}`}>Notes</Label>
        <Textarea id={`duty-notes-${duty.id}`} defaultValue={duty.notes ?? ''} key={`duty-notes-${duty.id}`} onBlur={(e) => updateDutyAssignment(duty.id, { notes: e.target.value || undefined })} />
      </Field>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete duty assignment"
        message={`Delete "${duty.role}" (${duty.personName})? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteDutyAssignment(duty.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function DutiesView() {
  const { dutyAssignments, addDutyAssignment } = useDutyAssignments();
  const [newPersonName, setNewPersonName] = useState('');

  const missingRoles = useMemo(() => missingCriticalDutyRoles(dutyAssignments, DEFAULT_CRITICAL_DUTY_ROLES), [dutyAssignments]);
  const withoutPhone = useMemo(() => criticalDutiesWithoutPhone(dutyAssignments, DEFAULT_CRITICAL_DUTY_ROLES), [dutyAssignments]);
  const withoutBackup = useMemo(() => criticalDutiesWithoutBackup(dutyAssignments, DEFAULT_CRITICAL_DUTY_ROLES), [dutyAssignments]);
  const overlaps = useMemo(() => detectDutyOverlaps(dutyAssignments), [dutyAssignments]);

  const hasWarnings = missingRoles.length > 0 || withoutPhone.length > 0 || withoutBackup.length > 0 || overlaps.length > 0;

  function handleAdd() {
    if (!newPersonName.trim()) return;
    addDutyAssignment({ role: 'Other', personName: newPersonName.trim(), status: 'Planned' });
    setNewPersonName('');
  }

  return (
    <div className="space-y-4">
      {hasWarnings && (
        <Card className="border-warning/40 bg-warning-bg">
          <CardBody className="space-y-1.5">
            {missingRoles.length > 0 && (
              <p className="text-sm text-ink">
                <span className="font-medium">Unassigned critical roles: </span>
                {missingRoles.join(', ')}
              </p>
            )}
            {withoutPhone.length > 0 && (
              <p className="text-sm text-ink">
                <span className="font-medium">Critical duties with no phone: </span>
                {withoutPhone.map((d) => `${d.role} (${d.personName})`).join(', ')}
              </p>
            )}
            {withoutBackup.length > 0 && (
              <p className="text-sm text-ink">
                <span className="font-medium">Critical duties with no backup: </span>
                {withoutBackup.map((d) => `${d.role} (${d.personName})`).join(', ')}
              </p>
            )}
            {overlaps.length > 0 && (
              <p className="text-sm text-ink">
                <span className="font-medium">Overlapping duties: </span>
                {overlaps.map((o) => o.personName).join(', ')}
              </p>
            )}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Duty roster ({dutyAssignments.length})</CardTitle>
          <div className="no-print flex gap-2">
            <Button variant="secondary" size="sm" icon={<Printer className="size-3.5" aria-hidden="true" />} onClick={() => window.print()}>
              Print
            </Button>
            <Button variant="secondary" size="sm" icon={<Download className="size-3.5" aria-hidden="true" />} onClick={() => downloadTextFile(dutyRosterCsvFilename(), dutyRosterToCSV(dutyAssignments), 'text/csv')}>
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          {dutyAssignments.length === 0 ? (
            <EmptyState title="No duties assigned yet" description="Add a duty assignment below." />
          ) : (
            <div className="space-y-3">
              {dutyAssignments.map((d) => (
                <DutyCard key={d.id} dutyId={d.id} />
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Input value={newPersonName} onChange={(e) => setNewPersonName(e.target.value)} placeholder="New duty — person name…" aria-label="New duty person name" />
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd} disabled={!newPersonName.trim()}>
              Add duty
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
