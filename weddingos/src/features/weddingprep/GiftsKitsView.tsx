import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { GiftRecipientType, GiftStatus, WelcomeKitStatus } from '@/types';
import { GIFT_RECIPIENT_TYPES, GIFT_STATUSES, WELCOME_KIT_STATUSES } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGiftPlans } from '@/hooks/useGiftPlans';
import { useWelcomeKits } from '@/hooks/useWelcomeKits';
import { useWelcomeKitItems } from '@/hooks/useWelcomeKitItems';
import { useVendors } from '@/hooks/useVendors';
import { useBudgetItems } from '@/hooks/useBudget';
import { useGuests } from '@/hooks/useGuests';
import { useSettings } from '@/hooks/useSettings';
import { computeGiftPlanWarnings, computeWelcomeKitWarnings, isGuestFavorCountInsufficient } from '@/utils/giftLogic';
import { computeSuggestedCateringCounts } from '@/utils/cateringLogic';

function GiftPlanRow({ planId }: { planId: string }) {
  const { giftPlans, updateGiftPlan, deleteGiftPlan } = useGiftPlans();
  const { vendors } = useVendors();
  const { budgetItems } = useBudgetItems();
  const { settings } = useSettings();
  const plan = giftPlans.find((p) => p.id === planId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!plan) return null;

  const warnings = computeGiftPlanWarnings(plan, settings.wedding.date);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{plan.recipientName || plan.recipientType}</span>
          <Badge tone="neutral">{plan.recipientType}</Badge>
          <Badge tone={plan.status === 'Distributed' || plan.status === 'Packed' ? 'success' : plan.status === 'Planned' ? 'warning' : 'neutral'}>{plan.status}</Badge>
        </div>
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label="Delete gift plan" className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
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
          <Label htmlFor={`gp-type-${plan.id}`}>Recipient type</Label>
          <Select id={`gp-type-${plan.id}`} value={plan.recipientType} onChange={(e) => updateGiftPlan(plan.id, { recipientType: e.target.value as GiftRecipientType })}>
            {GIFT_RECIPIENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`gp-name-${plan.id}`}>Recipient name</Label>
          <Input id={`gp-name-${plan.id}`} defaultValue={plan.recipientName ?? ''} key={`gp-name-${plan.id}`} onBlur={(e) => updateGiftPlan(plan.id, { recipientName: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`gp-gifttype-${plan.id}`}>Gift type</Label>
          <Input id={`gp-gifttype-${plan.id}`} defaultValue={plan.giftType} key={`gp-gifttype-${plan.id}`} onBlur={(e) => updateGiftPlan(plan.id, { giftType: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`gp-qty-${plan.id}`}>Quantity</Label>
          <Input
            id={`gp-qty-${plan.id}`}
            type="number"
            min={0}
            defaultValue={plan.quantity}
            key={`gp-qty-${plan.id}-${plan.quantity}`}
            onBlur={(e) => updateGiftPlan(plan.id, { quantity: Number(e.target.value) || 0 })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`gp-status-${plan.id}`}>Status</Label>
          <Select id={`gp-status-${plan.id}`} value={plan.status} onChange={(e) => updateGiftPlan(plan.id, { status: e.target.value as GiftStatus })}>
            {GIFT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`gp-custodian-${plan.id}`}>Custodian</Label>
          <Input id={`gp-custodian-${plan.id}`} defaultValue={plan.custodian ?? ''} key={`gp-custodian-${plan.id}`} onBlur={(e) => updateGiftPlan(plan.id, { custodian: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`gp-owner-${plan.id}`}>Distribution owner</Label>
          <Input id={`gp-owner-${plan.id}`} defaultValue={plan.distributionOwner ?? ''} key={`gp-owner-${plan.id}`} onBlur={(e) => updateGiftPlan(plan.id, { distributionOwner: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`gp-vendor-${plan.id}`}>Vendor</Label>
          <Select id={`gp-vendor-${plan.id}`} value={plan.vendorId ?? ''} onChange={(e) => updateGiftPlan(plan.id, { vendorId: e.target.value || undefined })}>
            <option value="">None</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field>
        <Label htmlFor={`gp-budgetitem-${plan.id}`}>Related budget item (optional)</Label>
        <Select id={`gp-budgetitem-${plan.id}`} value={plan.budgetItemId ?? ''} onChange={(e) => updateGiftPlan(plan.id, { budgetItemId: e.target.value || undefined })}>
          <option value="">None</option>
          {budgetItems.map((b) => (
            <option key={b.id} value={b.id}>
              {b.itemName}
            </option>
          ))}
        </Select>
      </Field>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete gift plan"
        message="Delete this gift plan? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteGiftPlan(plan.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function WelcomeKitItemRow({ itemId }: { itemId: string }) {
  const { welcomeKitItems, updateWelcomeKitItem, deleteWelcomeKitItem } = useWelcomeKitItems();
  const item = welcomeKitItems.find((i) => i.id === itemId);
  if (!item) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line-soft px-2.5 py-2">
      <Input defaultValue={item.itemName} key={`ki-name-${item.id}`} onBlur={(e) => updateWelcomeKitItem(item.id, { itemName: e.target.value })} className="flex-1 min-w-[8rem]" aria-label="Item name" />
      <Input
        type="number"
        min={0}
        defaultValue={item.quantityPerKit}
        key={`ki-qty-${item.id}-${item.quantityPerKit}`}
        onBlur={(e) => updateWelcomeKitItem(item.id, { quantityPerKit: Number(e.target.value) || 0 })}
        className="w-20"
        aria-label="Quantity per kit"
      />
      <button type="button" onClick={() => deleteWelcomeKitItem(item.id)} aria-label={`Delete item "${item.itemName}"`} className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function WelcomeKitCard({ kitId }: { kitId: string }) {
  const { welcomeKits, updateWelcomeKit, deleteWelcomeKit } = useWelcomeKits();
  const { welcomeKitItems, addWelcomeKitItem } = useWelcomeKitItems();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const kit = welcomeKits.find((k) => k.id === kitId);
  if (!kit) return null;
  const kitItems = welcomeKitItems.filter((i) => i.welcomeKitId === kit.id);
  const warnings = computeWelcomeKitWarnings(kit);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    addWelcomeKitItem({ welcomeKitId: kit.id, itemName: newItemName.trim(), quantityPerKit: 1 });
    setNewItemName('');
  };

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{kit.name}</span>
          <Badge tone={kit.status === 'Delivered' ? 'success' : 'neutral'}>{kit.status}</Badge>
          <Badge tone={kit.quantityPrepared < kit.quantityPlanned ? 'warning' : 'success'}>
            {kit.quantityPrepared}/{kit.quantityPlanned} prepared
          </Badge>
        </div>
        <button type="button" onClick={() => setConfirmDelete(true)} aria-label={`Delete kit "${kit.name}"`} className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical">
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
          <Label htmlFor={`wk-name-${kit.id}`}>Name</Label>
          <Input id={`wk-name-${kit.id}`} defaultValue={kit.name} key={`wk-name-${kit.id}`} onBlur={(e) => updateWelcomeKit(kit.id, { name: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`wk-target-${kit.id}`}>Target guest group</Label>
          <Input id={`wk-target-${kit.id}`} defaultValue={kit.targetGuestGroup ?? ''} key={`wk-target-${kit.id}`} onBlur={(e) => updateWelcomeKit(kit.id, { targetGuestGroup: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`wk-planned-${kit.id}`}>Quantity planned</Label>
          <Input
            id={`wk-planned-${kit.id}`}
            type="number"
            min={0}
            defaultValue={kit.quantityPlanned}
            key={`wk-planned-${kit.id}-${kit.quantityPlanned}`}
            onBlur={(e) => updateWelcomeKit(kit.id, { quantityPlanned: Number(e.target.value) || 0 })}
          />
        </Field>
        <Field>
          <Label htmlFor={`wk-prepared-${kit.id}`}>Quantity prepared</Label>
          <Input
            id={`wk-prepared-${kit.id}`}
            type="number"
            min={0}
            defaultValue={kit.quantityPrepared}
            key={`wk-prepared-${kit.id}-${kit.quantityPrepared}`}
            onBlur={(e) => updateWelcomeKit(kit.id, { quantityPrepared: Number(e.target.value) || 0 })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`wk-status-${kit.id}`}>Status</Label>
          <Select id={`wk-status-${kit.id}`} value={kit.status} onChange={(e) => updateWelcomeKit(kit.id, { status: e.target.value as WelcomeKitStatus })}>
            {WELCOME_KIT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`wk-owner-${kit.id}`}>Distribution owner</Label>
          <Input id={`wk-owner-${kit.id}`} defaultValue={kit.distributionOwner ?? ''} key={`wk-owner-${kit.id}`} onBlur={(e) => updateWelcomeKit(kit.id, { distributionOwner: e.target.value || undefined })} />
        </Field>
      </div>

      <div className="border-t border-line-soft pt-2.5 space-y-2">
        <p className="text-xs font-semibold text-ink">Items ({kitItems.length})</p>
        {kitItems.map((i) => (
          <WelcomeKitItemRow key={i.id} itemId={i.id} />
        ))}
        <div className="flex gap-2">
          <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="New item name…" aria-label="New kit item name" />
          <Button variant="secondary" size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddItem} disabled={!newItemName.trim()}>
            Add
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete welcome kit"
        message={`Delete "${kit.name}"? Its items will also be deleted. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteWelcomeKit(kit.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function GiftsKitsView() {
  const { giftPlans, addGiftPlan } = useGiftPlans();
  const { welcomeKits, addWelcomeKit } = useWelcomeKits();
  const { guests } = useGuests();
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newKitName, setNewKitName] = useState('');

  const suggested = computeSuggestedCateringCounts(guests, 'Wedding');
  const guestFavorPlans = giftPlans.filter((p) => p.recipientType === 'Guests');
  const favorsInsufficient = isGuestFavorCountInsufficient(giftPlans, suggested.confirmedAttendees, 10);

  const handleAddGift = () => {
    if (!newRecipientName.trim()) return;
    addGiftPlan({ recipientType: 'Other', recipientName: newRecipientName.trim(), event: 'Wedding', giftType: 'Gift', quantity: 1, status: 'Planned' });
    setNewRecipientName('');
  };

  const handleAddKit = () => {
    if (!newKitName.trim()) return;
    addWelcomeKit({ name: newKitName.trim(), quantityPlanned: 0, quantityPrepared: 0, status: 'Planned' });
    setNewKitName('');
  };

  return (
    <div className="space-y-5">
      {guestFavorPlans.length > 0 && (
        <Card className={favorsInsufficient ? 'border-warning/40' : undefined}>
          <CardBody className="flex items-center gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Guest favors vs. confirmed attendance</p>
              <p className="text-xs text-ink-faint mt-0.5">
                {suggested.confirmedAttendees} confirmed attendee{suggested.confirmedAttendees === 1 ? '' : 's'} + buffer, vs.{' '}
                {guestFavorPlans.reduce((sum, p) => sum + p.quantity, 0)} favors planned.
                {favorsInsufficient && ' Favor quantity is insufficient.'}
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Gift plans ({giftPlans.length})</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {giftPlans.length === 0 ? (
            <EmptyState title="No gift plans yet" description="Add gifts for family, witnesses, clergy, and guest favors." />
          ) : (
            <div className="space-y-3">
              {giftPlans.map((p) => (
                <GiftPlanRow key={p.id} planId={p.id} />
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Input value={newRecipientName} onChange={(e) => setNewRecipientName(e.target.value)} placeholder="New gift recipient name…" aria-label="New gift recipient name" />
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddGift} disabled={!newRecipientName.trim()}>
              Add Gift
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Welcome kits ({welcomeKits.length})</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {welcomeKits.length === 0 ? (
            <EmptyState title="No welcome kits yet" description="Add kits for out-of-town guests, family, and VIPs." />
          ) : (
            <div className="space-y-3">
              {welcomeKits.map((k) => (
                <WelcomeKitCard key={k.id} kitId={k.id} />
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Input value={newKitName} onChange={(e) => setNewKitName(e.target.value)} placeholder="New welcome kit name…" aria-label="New welcome kit name" />
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddKit} disabled={!newKitName.trim()}>
              Add Kit
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
