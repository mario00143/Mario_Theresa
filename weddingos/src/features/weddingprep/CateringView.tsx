import { useState } from 'react';
import { Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import type { CateringServiceStyle, MenuCourse, MenuDietaryType } from '@/types';
import { CATERING_SERVICE_STYLES, MENU_COURSES, MENU_DIETARY_TYPES, MENU_TASTING_STATUSES } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select, Textarea } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { StatTile } from '@/components/ui/StatTile';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCateringPlans } from '@/hooks/useCateringPlans';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useVendors } from '@/hooks/useVendors';
import { useGuests } from '@/hooks/useGuests';
import { computeCateringWarnings, computeSuggestedCateringCounts } from '@/utils/cateringLogic';

function numberOrUndefined(value: string): number | undefined {
  if (value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function MenuItemRow({ itemId }: { itemId: string }) {
  const { menuItems, updateMenuItem, deleteMenuItem } = useMenuItems();
  const item = menuItems.find((m) => m.id === itemId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!item) return null;

  return (
    <div className="rounded-lg border border-line-soft p-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{item.name}</span>
          <Badge tone="neutral">{item.course}</Badge>
          <Badge tone={item.approved ? 'success' : 'warning'}>{item.approved ? 'Approved' : 'Not approved'}</Badge>
          {item.allergens && <Badge tone="critical">Allergens</Badge>}
        </div>
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label={`Delete menu item "${item.name}"`} className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`mi-name-${item.id}`}>Name</Label>
          <Input id={`mi-name-${item.id}`} defaultValue={item.name} key={`mi-name-${item.id}`} onBlur={(e) => updateMenuItem(item.id, { name: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`mi-course-${item.id}`}>Course</Label>
          <Select id={`mi-course-${item.id}`} value={item.course} onChange={(e) => updateMenuItem(item.id, { course: e.target.value as MenuCourse })}>
            {MENU_COURSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`mi-diet-${item.id}`}>Dietary type</Label>
          <Select id={`mi-diet-${item.id}`} value={item.dietaryType} onChange={(e) => updateMenuItem(item.id, { dietaryType: e.target.value as MenuDietaryType })}>
            {MENU_DIETARY_TYPES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`mi-tasting-${item.id}`}>Tasting status</Label>
          <Select id={`mi-tasting-${item.id}`} value={item.tastingStatus} onChange={(e) => updateMenuItem(item.id, { tastingStatus: e.target.value as (typeof MENU_TASTING_STATUSES)[number] })}>
            {MENU_TASTING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field>
          <Label htmlFor={`mi-allergens-${item.id}`}>Allergens</Label>
          <Input id={`mi-allergens-${item.id}`} defaultValue={item.allergens ?? ''} key={`mi-allergens-${item.id}`} onBlur={(e) => updateMenuItem(item.id, { allergens: e.target.value || undefined })} />
        </Field>
        <div className="flex items-end gap-4 pb-2.5">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={item.approved} onChange={(e) => updateMenuItem(item.id, { approved: e.target.checked })} className="size-4 accent-brand-700" />
            Approved
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={item.liveCounter} onChange={(e) => updateMenuItem(item.id, { liveCounter: e.target.checked })} className="size-4 accent-brand-700" />
            Live counter
          </label>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete menu item"
        message={`Delete "${item.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteMenuItem(item.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function PlanCard({ planId }: { planId: string }) {
  const { cateringPlans, updateCateringPlan, deleteCateringPlan } = useCateringPlans();
  const { menuItems, addMenuItem } = useMenuItems();
  const { vendors } = useVendors();
  const { guests } = useGuests();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newMenuItemName, setNewMenuItemName] = useState('');

  const plan = cateringPlans.find((p) => p.id === planId);
  const planMenuItems = menuItems.filter((m) => m.cateringPlanId === planId);
  if (!plan) return null;

  const guestEvent = plan.event === 'Engagement' ? 'Engagement' : 'Wedding';
  const suggested = computeSuggestedCateringCounts(guests, guestEvent);
  const warnings = computeCateringWarnings(plan, suggested, planMenuItems);

  const handleAddMenuItem = () => {
    if (!newMenuItemName.trim()) return;
    addMenuItem({ cateringPlanId: plan.id, course: 'Main Course', name: newMenuItemName.trim(), dietaryType: 'Vegetarian', liveCounter: false, approved: false, tastingStatus: 'Not Scheduled' });
    setNewMenuItemName('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {plan.event} catering — {plan.serviceStyle}
        </CardTitle>
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label="Delete catering plan" className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </CardHeader>
      <CardBody className="space-y-4">
        {warnings.length > 0 && (
          <ul className="list-disc list-inside space-y-0.5 rounded-lg border border-warning/30 bg-warning-bg px-3 py-2">
            {warnings.map((w) => (
              <li key={w} className="text-xs text-warning">
                {w}
              </li>
            ))}
          </ul>
        )}

        <div>
          <p className="text-xs font-semibold text-ink mb-2">Suggested from RSVP ({guestEvent})</p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <StatTile label="Confirmed attendees" value={suggested.confirmedAttendees} />
            <StatTile label="Adults" value={suggested.adults} />
            <StatTile label="Children" value={suggested.children} />
            <StatTile label="Infants" value={suggested.infants} />
            <StatTile label="Vegetarian" value={suggested.vegetarian} />
            <StatTile label="Non-vegetarian" value={suggested.nonVegetarian} />
            <StatTile label="Vegan / Jain" value={suggested.vegan + suggested.jain} />
            <StatTile label="Unspecified diet" value={suggested.unspecifiedDiet} tone={suggested.unspecifiedDiet > 0 ? 'warning' : 'default'} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Field>
            <Label htmlFor={`cp-style-${plan.id}`}>Service style</Label>
            <Select id={`cp-style-${plan.id}`} value={plan.serviceStyle} onChange={(e) => updateCateringPlan(plan.id, { serviceStyle: e.target.value as CateringServiceStyle })}>
              {CATERING_SERVICE_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor={`cp-vendor-${plan.id}`}>Vendor</Label>
            <Select id={`cp-vendor-${plan.id}`} value={plan.vendorId ?? ''} onChange={(e) => updateCateringPlan(plan.id, { vendorId: e.target.value || undefined })}>
              <option value="">None</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor={`cp-target-${plan.id}`}>Guest count target</Label>
            <Input
              id={`cp-target-${plan.id}`}
              type="number"
              min={0}
              defaultValue={plan.guestCountTarget ?? ''}
              key={`cp-target-${plan.id}-${plan.guestCountTarget}`}
              onBlur={(e) => updateCateringPlan(plan.id, { guestCountTarget: numberOrUndefined(e.target.value) })}
            />
          </Field>
          <Field>
            <Label htmlFor={`cp-guaranteed-${plan.id}`}>Guaranteed count</Label>
            <Input
              id={`cp-guaranteed-${plan.id}`}
              type="number"
              min={0}
              defaultValue={plan.guaranteedCount ?? ''}
              key={`cp-guaranteed-${plan.id}-${plan.guaranteedCount}`}
              onBlur={(e) => updateCateringPlan(plan.id, { guaranteedCount: numberOrUndefined(e.target.value) })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Field>
            <Label htmlFor={`cp-due-${plan.id}`}>Final count due date</Label>
            <Input
              id={`cp-due-${plan.id}`}
              type="date"
              defaultValue={plan.finalCountDueDate ?? ''}
              key={`cp-due-${plan.id}`}
              onBlur={(e) => updateCateringPlan(plan.id, { finalCountDueDate: e.target.value || undefined })}
            />
          </Field>
          <Field>
            <Label htmlFor={`cp-buffer-${plan.id}`}>Buffer count</Label>
            <Input
              id={`cp-buffer-${plan.id}`}
              type="number"
              min={0}
              defaultValue={plan.bufferCount ?? ''}
              key={`cp-buffer-${plan.id}-${plan.bufferCount}`}
              onBlur={(e) => updateCateringPlan(plan.id, { bufferCount: numberOrUndefined(e.target.value) })}
            />
          </Field>
          <Field>
            <Label htmlFor={`cp-vendormeals-${plan.id}`}>Vendor meal count</Label>
            <Input
              id={`cp-vendormeals-${plan.id}`}
              type="number"
              min={0}
              defaultValue={plan.vendorMealCount ?? ''}
              key={`cp-vendormeals-${plan.id}-${plan.vendorMealCount}`}
              onBlur={(e) => updateCateringPlan(plan.id, { vendorMealCount: numberOrUndefined(e.target.value) })}
            />
          </Field>
          <Field>
            <Label htmlFor={`cp-clergymeals-${plan.id}`}>Clergy meal count</Label>
            <Input
              id={`cp-clergymeals-${plan.id}`}
              type="number"
              min={0}
              defaultValue={plan.clergyMealCount ?? ''}
              key={`cp-clergymeals-${plan.id}-${plan.clergyMealCount}`}
              onBlur={(e) => updateCateringPlan(plan.id, { clergyMealCount: numberOrUndefined(e.target.value) })}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={plan.coupleMealReserved} onChange={(e) => updateCateringPlan(plan.id, { coupleMealReserved: e.target.checked })} className="size-4 accent-brand-700" />
          Couple meal reserved
        </label>

        <Field>
          <Label htmlFor={`cp-leftover-${plan.id}`}>Leftover plan</Label>
          <Textarea id={`cp-leftover-${plan.id}`} defaultValue={plan.leftoverPlan ?? ''} key={`cp-leftover-${plan.id}`} onBlur={(e) => updateCateringPlan(plan.id, { leftoverPlan: e.target.value || undefined })} />
        </Field>

        <div className="border-t border-line-soft pt-3 space-y-2.5">
          <p className="text-sm font-semibold text-ink">Menu ({planMenuItems.length})</p>
          {planMenuItems.length === 0 ? (
            <p className="text-xs text-ink-faint">No menu items yet.</p>
          ) : (
            <div className="space-y-2.5">
              {planMenuItems.map((m) => (
                <MenuItemRow key={m.id} itemId={m.id} />
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input value={newMenuItemName} onChange={(e) => setNewMenuItemName(e.target.value)} placeholder="New menu item name…" aria-label="New menu item name" />
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddMenuItem} disabled={!newMenuItemName.trim()}>
              Add Item
            </Button>
          </div>
        </div>
      </CardBody>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete catering plan"
        message="Delete this catering plan? Its menu items will also be deleted. This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteCateringPlan(plan.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </Card>
  );
}

export function CateringView() {
  const { cateringPlans, addCateringPlan } = useCateringPlans();

  const handleAddPlan = () => {
    addCateringPlan({ event: 'Wedding', serviceStyle: 'Buffet', coupleMealReserved: false });
  };

  if (cateringPlans.length === 0) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={<UtensilsCrossed className="size-8" aria-hidden="true" />}
            title="No catering plans yet"
            description="Add a catering plan to track service style, counts, and the menu."
            action={<Button onClick={handleAddPlan}>Add catering plan</Button>}
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {cateringPlans.map((p) => (
        <PlanCard key={p.id} planId={p.id} />
      ))}
      <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddPlan}>
        Add another catering plan
      </Button>
    </div>
  );
}
