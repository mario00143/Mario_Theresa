import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { PhotoGroupPriority } from '@/types';
import { PHOTO_GROUP_PRIORITIES } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select, Textarea } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePhotographyPlans } from '@/hooks/usePhotographyPlans';
import { usePhotoGroups } from '@/hooks/usePhotoGroups';
import { useCateringPlans } from '@/hooks/useCateringPlans';
import { useVendors } from '@/hooks/useVendors';
import { useSettings } from '@/hooks/useSettings';
import { computePhotographyPlanWarnings } from '@/utils/photographyLogic';
import { weddingDateTimeISO } from '@/utils/date';

function numberOrUndefined(value: string): number | undefined {
  if (value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function PlanCard({ planId }: { planId: string }) {
  const { photographyPlans, updatePhotographyPlan, deletePhotographyPlan } = usePhotographyPlans();
  const { photoGroups } = usePhotoGroups();
  const { cateringPlans } = useCateringPlans();
  const { vendors } = useVendors();
  const { settings } = useSettings();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const plan = photographyPlans.find((p) => p.id === planId);
  if (!plan) return null;

  const ceremonyStartDateTimeISO = plan.event === 'Wedding' ? weddingDateTimeISO(settings) : undefined;
  const warnings = computePhotographyPlanWarnings(plan, cateringPlans, photoGroups, ceremonyStartDateTimeISO);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{plan.event} coverage</span>
          {plan.vendorId && <Badge tone="neutral">{vendors.find((v) => v.id === plan.vendorId)?.name}</Badge>}
        </div>
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label="Delete photography plan" className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      {warnings.length > 0 && (
        <ul className="list-disc list-inside space-y-0.5">
          {warnings.map((w) => (
            <li key={w} className="text-xs text-warning">
              {w}
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`pp-vendor-${plan.id}`}>Vendor</Label>
          <Select id={`pp-vendor-${plan.id}`} value={plan.vendorId ?? ''} onChange={(e) => updatePhotographyPlan(plan.id, { vendorId: e.target.value || undefined })}>
            <option value="">None</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`pp-photogs-${plan.id}`}>Photographer count</Label>
          <Input
            id={`pp-photogs-${plan.id}`}
            type="number"
            min={0}
            defaultValue={plan.photographerCount ?? ''}
            key={`pp-photogs-${plan.id}-${plan.photographerCount}`}
            onBlur={(e) => updatePhotographyPlan(plan.id, { photographerCount: numberOrUndefined(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`pp-videogs-${plan.id}`}>Videographer count</Label>
          <Input
            id={`pp-videogs-${plan.id}`}
            type="number"
            min={0}
            defaultValue={plan.videographerCount ?? ''}
            key={`pp-videogs-${plan.id}-${plan.videographerCount}`}
            onBlur={(e) => updatePhotographyPlan(plan.id, { videographerCount: numberOrUndefined(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`pp-delivery-${plan.id}`}>Delivery due date</Label>
          <Input
            id={`pp-delivery-${plan.id}`}
            type="date"
            defaultValue={plan.deliveryDueDate ?? ''}
            key={`pp-delivery-${plan.id}`}
            onBlur={(e) => updatePhotographyPlan(plan.id, { deliveryDueDate: e.target.value || undefined })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`pp-covstart-${plan.id}`}>Coverage start</Label>
          <Input
            id={`pp-covstart-${plan.id}`}
            type="datetime-local"
            defaultValue={plan.coverageStart ?? ''}
            key={`pp-covstart-${plan.id}`}
            onBlur={(e) => updatePhotographyPlan(plan.id, { coverageStart: e.target.value || undefined })}
          />
        </Field>
        <Field>
          <Label htmlFor={`pp-covend-${plan.id}`}>Coverage end</Label>
          <Input
            id={`pp-covend-${plan.id}`}
            type="datetime-local"
            defaultValue={plan.coverageEnd ?? ''}
            key={`pp-covend-${plan.id}`}
            onBlur={(e) => updatePhotographyPlan(plan.id, { coverageEnd: e.target.value || undefined })}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {(
          [
            ['droneRequired', 'Drone required'],
            ['liveStreamingRequired', 'Live streaming'],
            ['sameDayEditRequired', 'Same-day edit'],
            ['rawFilesIncluded', 'Raw files included'],
            ['albumIncluded', 'Album included'],
            ['highlightsVideoIncluded', 'Highlights video'],
            ['fullFilmIncluded', 'Full film'],
            ['churchRestrictionsConfirmed', 'Church restrictions confirmed'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={plan[key]} onChange={(e) => updatePhotographyPlan(plan.id, { [key]: e.target.checked })} className="size-4 accent-brand-700" />
            {label}
          </label>
        ))}
      </div>

      <Field>
        <Label htmlFor={`pp-notes-${plan.id}`}>Notes</Label>
        <Textarea id={`pp-notes-${plan.id}`} defaultValue={plan.notes ?? ''} key={`pp-notes-${plan.id}`} onBlur={(e) => updatePhotographyPlan(plan.id, { notes: e.target.value || undefined })} />
      </Field>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete photography plan"
        message="Delete this photography plan? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deletePhotographyPlan(plan.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function GroupRow({ groupId }: { groupId: string }) {
  const { photoGroups, updatePhotoGroup, deletePhotoGroup } = usePhotoGroups();
  const group = photoGroups.find((g) => g.id === groupId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!group) return null;

  return (
    <div className="rounded-lg border border-line-soft p-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{group.groupName}</span>
          <Badge tone={group.priority === 'Must Have' ? 'critical' : group.priority === 'Important' ? 'warning' : 'neutral'}>{group.priority}</Badge>
          {!group.coordinator && <Badge tone="warning">No coordinator</Badge>}
          {group.completed && <Badge tone="success">Completed</Badge>}
        </div>
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label={`Delete photo group "${group.groupName}"`} className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`pg-name-${group.id}`}>Group name</Label>
          <Input id={`pg-name-${group.id}`} defaultValue={group.groupName} key={`pg-name-${group.id}`} onBlur={(e) => updatePhotoGroup(group.id, { groupName: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`pg-priority-${group.id}`}>Priority</Label>
          <Select id={`pg-priority-${group.id}`} value={group.priority} onChange={(e) => updatePhotoGroup(group.id, { priority: e.target.value as PhotoGroupPriority })}>
            {PHOTO_GROUP_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`pg-coordinator-${group.id}`}>Coordinator</Label>
          <Input id={`pg-coordinator-${group.id}`} defaultValue={group.coordinator ?? ''} key={`pg-coordinator-${group.id}`} onBlur={(e) => updatePhotoGroup(group.id, { coordinator: e.target.value || undefined })} />
        </Field>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={group.completed} onChange={(e) => updatePhotoGroup(group.id, { completed: e.target.checked })} className="size-4 accent-brand-700" />
            Completed
          </label>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete photo group"
        message={`Delete "${group.groupName}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deletePhotoGroup(group.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function PhotoVideoView() {
  const { photographyPlans, addPhotographyPlan } = usePhotographyPlans();
  const { photoGroups, addPhotoGroup } = usePhotoGroups();
  const [newGroupName, setNewGroupName] = useState('');

  const handleAddPlan = () => {
    addPhotographyPlan({
      event: 'Wedding',
      droneRequired: false,
      liveStreamingRequired: false,
      sameDayEditRequired: false,
      rawFilesIncluded: false,
      albumIncluded: false,
      highlightsVideoIncluded: false,
      fullFilmIncluded: false,
      churchRestrictionsConfirmed: false,
    });
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    addPhotoGroup({ event: 'Wedding', groupName: newGroupName.trim(), sequenceOrder: photoGroups.length + 1, priority: 'Important', completed: false });
    setNewGroupName('');
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Photography plans ({photographyPlans.length})</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {photographyPlans.length === 0 ? (
            <EmptyState title="No photography plans yet" description="Add coverage plans for the Engagement and Wedding." />
          ) : (
            <div className="space-y-3">
              {photographyPlans.map((p) => (
                <PlanCard key={p.id} planId={p.id} />
              ))}
            </div>
          )}
          <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddPlan}>
            Add Photography Plan
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photo groups ({photoGroups.length})</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {photoGroups.length === 0 ? (
            <EmptyState title="No photo groups yet" description="Add family and friend groupings for the photographer's shot list." />
          ) : (
            <div className="space-y-2.5">
              {photoGroups.map((g) => (
                <GroupRow key={g.id} groupId={g.id} />
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="New photo group name…" aria-label="New photo group name" />
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddGroup} disabled={!newGroupName.trim()}>
              Add Group
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
