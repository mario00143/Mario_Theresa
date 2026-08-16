import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { DecorArea, DecorApprovalStatus, DecorDeliverableStatus } from '@/types';
import { DECOR_AREAS, DECOR_APPROVAL_STATUSES, DECOR_DELIVERABLE_STATUSES } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select, Textarea } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDecorPlans } from '@/hooks/useDecorPlans';
import { useDecorDeliverables } from '@/hooks/useDecorDeliverables';
import { useVendors } from '@/hooks/useVendors';
import { useChurchProfiles } from '@/hooks/useChurchProfiles';
import { computeDecorPlanWarnings, decorDeliverableNeedsVendorLink } from '@/utils/decorLogic';

function DeliverableRow({ deliverableId }: { deliverableId: string }) {
  const { decorDeliverables, updateDecorDeliverable, deleteDecorDeliverable } = useDecorDeliverables();
  const { decorPlans } = useDecorPlans();
  const deliverable = decorDeliverables.find((d) => d.id === deliverableId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!deliverable) return null;
  const plan = decorPlans.find((p) => p.id === deliverable.decorPlanId);
  const needsVendorLink = decorDeliverableNeedsVendorLink(deliverable, plan);

  return (
    <div className="rounded-lg border border-line-soft p-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{deliverable.name}</span>
          <Badge tone="neutral">{deliverable.status}</Badge>
          {needsVendorLink && <Badge tone="warning">Power needs vendor link</Badge>}
        </div>
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label={`Delete deliverable "${deliverable.name}"`} className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`dd-name-${deliverable.id}`}>Name</Label>
          <Input id={`dd-name-${deliverable.id}`} defaultValue={deliverable.name} key={`dd-name-${deliverable.id}`} onBlur={(e) => updateDecorDeliverable(deliverable.id, { name: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`dd-qty-${deliverable.id}`}>Quantity</Label>
          <Input
            id={`dd-qty-${deliverable.id}`}
            type="number"
            min={0}
            defaultValue={deliverable.quantity ?? ''}
            key={`dd-qty-${deliverable.id}-${deliverable.quantity}`}
            onBlur={(e) => updateDecorDeliverable(deliverable.id, { quantity: e.target.value === '' ? undefined : Number(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`dd-status-${deliverable.id}`}>Status</Label>
          <Select id={`dd-status-${deliverable.id}`} value={deliverable.status} onChange={(e) => updateDecorDeliverable(deliverable.id, { status: e.target.value as DecorDeliverableStatus })}>
            {DECOR_DELIVERABLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`dd-owner-${deliverable.id}`}>Installation owner</Label>
          <Input
            id={`dd-owner-${deliverable.id}`}
            defaultValue={deliverable.installationOwner ?? ''}
            key={`dd-owner-${deliverable.id}`}
            onBlur={(e) => updateDecorDeliverable(deliverable.id, { installationOwner: e.target.value || undefined })}
          />
        </Field>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={deliverable.freshFlowers} onChange={(e) => updateDecorDeliverable(deliverable.id, { freshFlowers: e.target.checked })} className="size-4 accent-brand-700" />
          Fresh flowers
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={deliverable.powerRequired} onChange={(e) => updateDecorDeliverable(deliverable.id, { powerRequired: e.target.checked })} className="size-4 accent-brand-700" />
          Power required
        </label>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete deliverable"
        message={`Delete "${deliverable.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteDecorDeliverable(deliverable.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function PlanCard({ planId }: { planId: string }) {
  const { decorPlans, updateDecorPlan, deleteDecorPlan } = useDecorPlans();
  const { decorDeliverables, addDecorDeliverable } = useDecorDeliverables();
  const { vendors } = useVendors();
  const { churchProfiles } = useChurchProfiles();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newDeliverableName, setNewDeliverableName] = useState('');

  const plan = decorPlans.find((p) => p.id === planId);
  if (!plan) return null;
  const planDeliverables = decorDeliverables.filter((d) => d.decorPlanId === plan.id);
  const warnings = computeDecorPlanWarnings(plan, churchProfiles[0]);

  const handleAddDeliverable = () => {
    if (!newDeliverableName.trim()) return;
    addDecorDeliverable({ decorPlanId: plan.id, name: newDeliverableName.trim(), freshFlowers: false, powerRequired: false, status: 'Concept' });
    setNewDeliverableName('');
  };

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{plan.area}</span>
          <Badge tone={plan.approvalStatus === 'Approved' ? 'success' : plan.approvalStatus === 'Rejected' ? 'critical' : 'warning'}>{plan.approvalStatus}</Badge>
          {plan.finalWalkthroughComplete && <Badge tone="success">Walkthrough done</Badge>}
        </div>
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label={`Delete plan for "${plan.area}"`} className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
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
          <Label htmlFor={`dp-area-${plan.id}`}>Area</Label>
          <Select id={`dp-area-${plan.id}`} value={plan.area} onChange={(e) => updateDecorPlan(plan.id, { area: e.target.value as DecorArea })}>
            {DECOR_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`dp-vendor-${plan.id}`}>Vendor</Label>
          <Select id={`dp-vendor-${plan.id}`} value={plan.vendorId ?? ''} onChange={(e) => updateDecorPlan(plan.id, { vendorId: e.target.value || undefined })}>
            <option value="">None</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`dp-approval-${plan.id}`}>Approval status</Label>
          <Select id={`dp-approval-${plan.id}`} value={plan.approvalStatus} onChange={(e) => updateDecorPlan(plan.id, { approvalStatus: e.target.value as DecorApprovalStatus })}>
            {DECOR_APPROVAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`dp-theme-${plan.id}`}>Theme</Label>
          <Input id={`dp-theme-${plan.id}`} defaultValue={plan.theme ?? ''} key={`dp-theme-${plan.id}`} onBlur={(e) => updateDecorPlan(plan.id, { theme: e.target.value || undefined })} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`dp-installdate-${plan.id}`}>Install date</Label>
          <Input id={`dp-installdate-${plan.id}`} type="date" defaultValue={plan.installDate ?? ''} key={`dp-installdate-${plan.id}`} onBlur={(e) => updateDecorPlan(plan.id, { installDate: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`dp-installtime-${plan.id}`}>Install start time</Label>
          <Input
            id={`dp-installtime-${plan.id}`}
            type="time"
            defaultValue={plan.installStartTime ?? ''}
            key={`dp-installtime-${plan.id}`}
            onBlur={(e) => updateDecorPlan(plan.id, { installStartTime: e.target.value || undefined })}
          />
        </Field>
        <Field>
          <Label htmlFor={`dp-teardown-${plan.id}`}>Teardown deadline</Label>
          <Input
            id={`dp-teardown-${plan.id}`}
            type="date"
            defaultValue={plan.teardownDeadline ?? ''}
            key={`dp-teardown-${plan.id}`}
            onBlur={(e) => updateDecorPlan(plan.id, { teardownDeadline: e.target.value || undefined })}
          />
        </Field>
        <Field>
          <Label htmlFor={`dp-approvedby-${plan.id}`}>Approved by</Label>
          <Input id={`dp-approvedby-${plan.id}`} defaultValue={plan.approvedBy ?? ''} key={`dp-approvedby-${plan.id}`} onBlur={(e) => updateDecorPlan(plan.id, { approvedBy: e.target.value || undefined })} />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={plan.finalWalkthroughComplete} onChange={(e) => updateDecorPlan(plan.id, { finalWalkthroughComplete: e.target.checked })} className="size-4 accent-brand-700" />
        Final walkthrough complete
      </label>

      <Field>
        <Label htmlFor={`dp-notes-${plan.id}`}>Notes</Label>
        <Textarea id={`dp-notes-${plan.id}`} defaultValue={plan.notes ?? ''} key={`dp-notes-${plan.id}`} onBlur={(e) => updateDecorPlan(plan.id, { notes: e.target.value || undefined })} />
      </Field>

      <div className="border-t border-line-soft pt-3 space-y-2.5">
        <p className="text-xs font-semibold text-ink">Deliverables ({planDeliverables.length})</p>
        {planDeliverables.map((d) => (
          <DeliverableRow key={d.id} deliverableId={d.id} />
        ))}
        <div className="flex gap-2">
          <Input value={newDeliverableName} onChange={(e) => setNewDeliverableName(e.target.value)} placeholder="New deliverable name…" aria-label="New deliverable name" />
          <Button variant="secondary" size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddDeliverable} disabled={!newDeliverableName.trim()}>
            Add
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete décor plan"
        message={`Delete this décor plan for "${plan.area}"? Its deliverables will also be deleted. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteDecorPlan(plan.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function DecorView() {
  const { decorPlans, addDecorPlan } = useDecorPlans();
  const [areaFilter, setAreaFilter] = useState<'All' | DecorArea>('All');

  const filtered = decorPlans.filter((p) => areaFilter === 'All' || p.area === areaFilter);

  const handleAdd = () => {
    addDecorPlan({ event: 'Wedding', area: 'Other', approvalStatus: 'Pending', finalWalkthroughComplete: false });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Décor plans ({filtered.length})</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        <Select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value as typeof areaFilter)} className="max-w-[14rem]" aria-label="Filter by area">
          <option value="All">All areas</option>
          {DECOR_AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>

        {filtered.length === 0 ? (
          <EmptyState title="No décor plans yet" description="Add a plan for an area like Church Aisle, Stage, or Dining Tables." />
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <PlanCard key={p.id} planId={p.id} />
            ))}
          </div>
        )}

        <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd}>
          Add Décor Plan
        </Button>
      </CardBody>
    </Card>
  );
}
