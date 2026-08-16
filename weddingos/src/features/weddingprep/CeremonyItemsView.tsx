import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CeremonyItemCategory, CeremonyItemStatus } from '@/types';
import { CEREMONY_ITEM_APPLICABILITY, CEREMONY_ITEM_CATEGORIES, CEREMONY_ITEM_STATUSES, CEREMONY_ITEM_VERIFICATION_STATUSES } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select, Textarea } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCeremonyItems } from '@/hooks/useCeremonyItems';
import { useCeremonyParticipants } from '@/hooks/useCeremonyParticipants';
import { useVendors } from '@/hooks/useVendors';
import { useBudgetItems } from '@/hooks/useBudget';
import { computeCeremonyItemWarnings, isCriticalCeremonyItem } from '@/utils/ceremonyLogic';
import { useSettings } from '@/hooks/useSettings';
import { weddingDateTimeISO } from '@/utils/date';

function ItemCard({ itemId }: { itemId: string }) {
  const { ceremonyItems, updateCeremonyItem, deleteCeremonyItem, verifyCeremonyItem } = useCeremonyItems();
  const { ceremonyParticipants } = useCeremonyParticipants();
  const { vendors } = useVendors();
  const { budgetItems } = useBudgetItems();
  const { settings } = useSettings();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const item = ceremonyItems.find((i) => i.id === itemId);
  if (!item) return null;

  const weddingDateTime = weddingDateTimeISO(settings);
  const warnings = computeCeremonyItemWarnings(item, weddingDateTime.slice(0, 10), ceremonyParticipants);
  const isCritical = isCriticalCeremonyItem(item);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{item.name}</span>
          {isCritical && <Badge tone="critical">Critical</Badge>}
          <Badge tone="neutral">{item.category}</Badge>
          <Badge tone={item.status === 'Ready' || item.status === 'At Venue' || item.status === 'Used' ? 'success' : 'warning'}>{item.status}</Badge>
          <Badge tone={item.verificationStatus === 'Verified' ? 'success' : item.verificationStatus === 'Recheck Required' ? 'critical' : 'neutral'}>{item.verificationStatus}</Badge>
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label={`Delete item "${item.name}"`}
          className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
        >
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
          <Label htmlFor={`ci-name-${item.id}`}>Name</Label>
          <Input id={`ci-name-${item.id}`} defaultValue={item.name} key={`ci-name-${item.id}`} onBlur={(e) => updateCeremonyItem(item.id, { name: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`ci-category-${item.id}`}>Category</Label>
          <Select id={`ci-category-${item.id}`} value={item.category} onChange={(e) => updateCeremonyItem(item.id, { category: e.target.value as CeremonyItemCategory })}>
            {CEREMONY_ITEM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`ci-applicability-${item.id}`}>Applicability</Label>
          <Select
            id={`ci-applicability-${item.id}`}
            value={item.applicability}
            onChange={(e) => updateCeremonyItem(item.id, { applicability: e.target.value as (typeof CEREMONY_ITEM_APPLICABILITY)[number] })}
          >
            {CEREMONY_ITEM_APPLICABILITY.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`ci-status-${item.id}`}>Status</Label>
          <Select id={`ci-status-${item.id}`} value={item.status} onChange={(e) => updateCeremonyItem(item.id, { status: e.target.value as CeremonyItemStatus })}>
            {CEREMONY_ITEM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`ci-owner-${item.id}`}>Owner</Label>
          <Input id={`ci-owner-${item.id}`} defaultValue={item.owner ?? ''} key={`ci-owner-${item.id}`} onBlur={(e) => updateCeremonyItem(item.id, { owner: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`ci-custodian-${item.id}`}>Custodian</Label>
          <Input id={`ci-custodian-${item.id}`} defaultValue={item.custodian ?? ''} key={`ci-custodian-${item.id}`} onBlur={(e) => updateCeremonyItem(item.id, { custodian: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`ci-backup-${item.id}`}>Backup custodian</Label>
          <Input id={`ci-backup-${item.id}`} defaultValue={item.backupCustodian ?? ''} key={`ci-backup-${item.id}`} onBlur={(e) => updateCeremonyItem(item.id, { backupCustodian: e.target.value || undefined })} />
        </Field>
        <Field>
          <Label htmlFor={`ci-storage-${item.id}`}>Storage location</Label>
          <Input id={`ci-storage-${item.id}`} defaultValue={item.storageLocation ?? ''} key={`ci-storage-${item.id}`} onBlur={(e) => updateCeremonyItem(item.id, { storageLocation: e.target.value || undefined })} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`ci-vendor-${item.id}`}>Related vendor (optional)</Label>
          <Select id={`ci-vendor-${item.id}`} value={item.relatedVendorId ?? ''} onChange={(e) => updateCeremonyItem(item.id, { relatedVendorId: e.target.value || undefined })}>
            <option value="">None</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label htmlFor={`ci-budgetitem-${item.id}`}>Related budget item (optional)</Label>
          <Select id={`ci-budgetitem-${item.id}`} value={item.relatedBudgetItemId ?? ''} onChange={(e) => updateCeremonyItem(item.id, { relatedBudgetItemId: e.target.value || undefined })}>
            <option value="">None</option>
            {budgetItems.map((b) => (
              <option key={b.id} value={b.id}>
                {b.itemName}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {item.verificationStatus !== 'Verified' && (
          <Button variant="secondary" size="sm" onClick={() => verifyCeremonyItem(item.id)}>
            Mark verified
          </Button>
        )}
        {item.verificationStatus === 'Verified' && (
          <Button variant="ghost" size="sm" onClick={() => updateCeremonyItem(item.id, { verificationStatus: 'Recheck Required' })}>
            Flag for recheck
          </Button>
        )}
        {item.lastVerifiedAt && <span className="text-xs text-ink-faint">Last verified {new Date(item.lastVerifiedAt).toLocaleDateString('en-IN')}</span>}
      </div>

      <Field>
        <Label htmlFor={`ci-notes-${item.id}`}>Notes</Label>
        <Textarea id={`ci-notes-${item.id}`} defaultValue={item.notes ?? ''} key={`ci-notes-${item.id}`} onBlur={(e) => updateCeremonyItem(item.id, { notes: e.target.value || undefined })} />
      </Field>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete ceremony item"
        message={`Delete "${item.name}"? It will also be removed from any ceremony sequence step that requires it. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteCeremonyItem(item.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function CeremonyItemsView() {
  const { ceremonyItems, addCeremonyItem } = useCeremonyItems();
  const [newName, setNewName] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | CeremonyItemCategory>('All');
  const [verificationFilter, setVerificationFilter] = useState<'All' | (typeof CEREMONY_ITEM_VERIFICATION_STATUSES)[number]>('All');

  const filtered = ceremonyItems.filter(
    (i) => (categoryFilter === 'All' || i.category === categoryFilter) && (verificationFilter === 'All' || i.verificationStatus === verificationFilter),
  );

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCeremonyItem({ name: newName.trim(), category: 'Other', applicability: 'Applicable', status: 'Not Procured', verificationStatus: 'Not Verified' });
    setNewName('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ceremony items ({filtered.length})</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)} className="max-w-[12rem]" aria-label="Filter by category">
            <option value="All">All categories</option>
            {CEREMONY_ITEM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select value={verificationFilter} onChange={(e) => setVerificationFilter(e.target.value as typeof verificationFilter)} className="max-w-[12rem]" aria-label="Filter by verification status">
            <option value="All">All verification statuses</option>
            {CEREMONY_ITEM_VERIFICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No items match" description="Try a different filter, or add a new item below." />
        ) : (
          <div className="space-y-3">
            {filtered.map((i) => (
              <ItemCard key={i.id} itemId={i.id} />
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New ceremony item name…" aria-label="New ceremony item name" />
          <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd} disabled={!newName.trim()}>
            Add Item
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
