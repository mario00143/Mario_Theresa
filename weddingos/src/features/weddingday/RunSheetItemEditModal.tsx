import { useState } from 'react';
import type { CeremonyItem, CeremonyParticipant, RunSheetCategory, RunSheetItem, RunSheetStatus, Task, TransportRoute, Vendor } from '@/types';
import { RUN_SHEET_CATEGORIES, RUN_SHEET_RELATIVE_REFERENCES, RUN_SHEET_STATUSES } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Select, Textarea } from '@/components/ui/Field';

interface RunSheetItemEditModalProps {
  open: boolean;
  onClose: () => void;
  item: RunSheetItem;
  allItems: RunSheetItem[];
  ceremonyParticipants: CeremonyParticipant[];
  vendors: Vendor[];
  ceremonyItems: CeremonyItem[];
  tasks: Task[];
  transportRoutes: TransportRoute[];
  onSave: (patch: Partial<Omit<RunSheetItem, 'id' | 'createdAt'>>) => void;
}

function selectedValues(e: React.ChangeEvent<HTMLSelectElement>): string[] {
  return Array.from(e.target.selectedOptions).map((o) => o.value);
}

export function RunSheetItemEditModal({ open, onClose, item, allItems, ceremonyParticipants, vendors, ceremonyItems, tasks, transportRoutes, onSave }: RunSheetItemEditModalProps) {
  const [form, setForm] = useState(item);

  function set<K extends keyof RunSheetItem>(key: K, value: RunSheetItem[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    onSave(form);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={`Edit "${item.activity}"`} size="lg" footer={<Button variant="primary" onClick={handleSave}>Save</Button>}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field className="col-span-2">
            <Label htmlFor="rs-activity">Activity</Label>
            <Input id="rs-activity" value={form.activity} onChange={(e) => set('activity', e.target.value)} />
          </Field>
          <Field>
            <Label htmlFor="rs-category">Category</Label>
            <Select id="rs-category" value={form.category} onChange={(e) => set('category', e.target.value as RunSheetCategory)}>
              {RUN_SHEET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="rs-status">Status</Label>
            <Select id="rs-status" value={form.status} onChange={(e) => set('status', e.target.value as RunSheetStatus)}>
              {RUN_SHEET_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="rs-location">Location</Label>
            <Input id="rs-location" value={form.location ?? ''} onChange={(e) => set('location', e.target.value || undefined)} />
          </Field>
          <Field>
            <Label htmlFor="rs-cue">Cue</Label>
            <Input id="rs-cue" value={form.cue ?? ''} onChange={(e) => set('cue', e.target.value || undefined)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field>
            <Label htmlFor="rs-relative">Timing reference</Label>
            <Select id="rs-relative" value={form.relativeReference} onChange={(e) => set('relativeReference', e.target.value as RunSheetItem['relativeReference'])}>
              {RUN_SHEET_RELATIVE_REFERENCES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
          {form.relativeReference === 'None' ? (
            <>
              <Field>
                <Label htmlFor="rs-start">Start time</Label>
                <Input id="rs-start" type="time" value={form.startTime ?? ''} onChange={(e) => set('startTime', e.target.value || undefined)} />
              </Field>
              <Field>
                <Label htmlFor="rs-end">End time</Label>
                <Input id="rs-end" type="time" value={form.endTime ?? ''} onChange={(e) => set('endTime', e.target.value || undefined)} />
              </Field>
            </>
          ) : (
            <Field className="col-span-2">
              <Label htmlFor="rs-offset">Offset minutes (negative = before, positive = after)</Label>
              <Input id="rs-offset" type="number" value={form.relativeOffsetMinutes ?? 0} onChange={(e) => set('relativeOffsetMinutes', Number(e.target.value) || 0)} />
            </Field>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="rs-owner">Owner</Label>
            <Input id="rs-owner" value={form.owner ?? ''} onChange={(e) => set('owner', e.target.value || undefined)} />
          </Field>
          <Field>
            <Label htmlFor="rs-backup-owner">Backup owner</Label>
            <Input id="rs-backup-owner" value={form.backupOwner ?? ''} onChange={(e) => set('backupOwner', e.target.value || undefined)} />
          </Field>
        </div>

        <Field>
          <Label htmlFor="rs-contingency">Contingency action</Label>
          <Textarea id="rs-contingency" value={form.contingencyAction ?? ''} onChange={(e) => set('contingencyAction', e.target.value || undefined)} rows={2} />
        </Field>
        <Field>
          <Label htmlFor="rs-notes">Notes</Label>
          <Textarea id="rs-notes" value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value || undefined)} rows={2} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="rs-participants">Participants</Label>
            <Select id="rs-participants" multiple value={form.participantIds} onChange={(e) => set('participantIds', selectedValues(e))} className="h-28">
              {ceremonyParticipants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="rs-vendors">Vendors</Label>
            <Select id="rs-vendors" multiple value={form.vendorIds} onChange={(e) => set('vendorIds', selectedValues(e))} className="h-28">
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="rs-required-items">Required ceremony items</Label>
            <Select id="rs-required-items" multiple value={form.requiredItemIds} onChange={(e) => set('requiredItemIds', selectedValues(e))} className="h-28">
              {ceremonyItems.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="rs-tasks">Related tasks</Label>
            <Select id="rs-tasks" multiple value={form.relatedTaskIds} onChange={(e) => set('relatedTaskIds', selectedValues(e))} className="h-28">
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="rs-routes">Related transport routes</Label>
            <Select id="rs-routes" multiple value={form.relatedTransportRouteIds} onChange={(e) => set('relatedTransportRouteIds', selectedValues(e))} className="h-28">
              {transportRoutes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="rs-dependencies">Depends on (other run-sheet items)</Label>
            <Select id="rs-dependencies" multiple value={form.dependencyIds} onChange={(e) => set('dependencyIds', selectedValues(e))} className="h-28">
              {allItems
                .filter((i) => i.id !== item.id)
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.activity}
                  </option>
                ))}
            </Select>
          </Field>
        </div>
      </div>
    </Modal>
  );
}
