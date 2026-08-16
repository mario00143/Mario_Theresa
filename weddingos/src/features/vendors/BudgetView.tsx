import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { BudgetItem } from '@/types';
import { APPROVAL_STATUSES, EVENTS, type ApprovalStatus, type EventScope } from '@/types';
import { Card, CardBody } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Select } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { useBudgetCategories, useBudgetItems, useBudgetItemsForCategory } from '@/hooks/useBudget';
import { useVendors } from '@/hooks/useVendors';
import { useSettings } from '@/hooks/useSettings';
import { computeBudgetOverview, computeCategorySummary, computeItemForecast } from '@/utils/budgetLogic';
import { formatCurrency } from '@/utils/currency';

function numberOrZero(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function BudgetItemRow({ item, currency }: { item: BudgetItem; currency: string }) {
  const { updateBudgetItem, deleteBudgetItem } = useBudgetItems();
  const { vendors } = useVendors();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const forecast = computeItemForecast(item);

  return (
    <div className="rounded-lg border border-line-soft p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{item.itemName}</span>
          <Badge tone={item.approvalStatus === 'Approved' ? 'success' : item.approvalStatus === 'Rejected' ? 'danger' : 'neutral'}>{item.approvalStatus}</Badge>
          <span className="text-xs text-ink-faint">forecast {formatCurrency(forecast, currency)}</span>
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label={`Delete budget item "${item.itemName}"`}
          className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Field>
          <Label htmlFor={`bi-name-${item.id}`}>Item name</Label>
          <Input id={`bi-name-${item.id}`} defaultValue={item.itemName} key={`bi-name-${item.id}`} onBlur={(e) => updateBudgetItem(item.id, { itemName: e.target.value })} />
        </Field>
        <Field>
          <Label htmlFor={`bi-vendor-${item.id}`}>Vendor</Label>
          <Select id={`bi-vendor-${item.id}`} value={item.vendorId ?? ''} onChange={(e) => updateBudgetItem(item.id, { vendorId: e.target.value || undefined })}>
            <option value="">None</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`bi-original-${item.id}`}>Original budget</Label>
          <Input
            id={`bi-original-${item.id}`}
            type="number"
            min={0}
            defaultValue={item.originalBudget}
            key={`bi-original-${item.id}-${item.originalBudget}`}
            onBlur={(e) => updateBudgetItem(item.id, { originalBudget: numberOrZero(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`bi-estimate-${item.id}`}>Latest estimate</Label>
          <Input
            id={`bi-estimate-${item.id}`}
            type="number"
            min={0}
            defaultValue={item.latestEstimate ?? ''}
            key={`bi-estimate-${item.id}-${item.latestEstimate}`}
            onBlur={(e) => updateBudgetItem(item.id, { latestEstimate: e.target.value === '' ? undefined : numberOrZero(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`bi-committed-${item.id}`}>Committed</Label>
          <Input
            id={`bi-committed-${item.id}`}
            type="number"
            min={0}
            defaultValue={item.committedAmount ?? ''}
            key={`bi-committed-${item.id}-${item.committedAmount}`}
            onBlur={(e) => updateBudgetItem(item.id, { committedAmount: e.target.value === '' ? undefined : numberOrZero(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`bi-actual-${item.id}`}>Actual</Label>
          <Input
            id={`bi-actual-${item.id}`}
            type="number"
            min={0}
            defaultValue={item.actualAmount ?? ''}
            key={`bi-actual-${item.id}-${item.actualAmount}`}
            onBlur={(e) => updateBudgetItem(item.id, { actualAmount: e.target.value === '' ? undefined : numberOrZero(e.target.value) })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Field>
          <Label htmlFor={`bi-negotiated-${item.id}`}>Negotiated</Label>
          <Input
            id={`bi-negotiated-${item.id}`}
            type="number"
            min={0}
            defaultValue={item.negotiatedAmount ?? ''}
            key={`bi-negotiated-${item.id}-${item.negotiatedAmount}`}
            onBlur={(e) => updateBudgetItem(item.id, { negotiatedAmount: e.target.value === '' ? undefined : numberOrZero(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`bi-tax-${item.id}`}>Tax</Label>
          <Input
            id={`bi-tax-${item.id}`}
            type="number"
            min={0}
            defaultValue={item.taxAmount ?? ''}
            key={`bi-tax-${item.id}-${item.taxAmount}`}
            onBlur={(e) => updateBudgetItem(item.id, { taxAmount: e.target.value === '' ? undefined : numberOrZero(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`bi-other-${item.id}`}>Other charges</Label>
          <Input
            id={`bi-other-${item.id}`}
            type="number"
            min={0}
            defaultValue={item.otherCharges ?? ''}
            key={`bi-other-${item.id}-${item.otherCharges}`}
            onBlur={(e) => updateBudgetItem(item.id, { otherCharges: e.target.value === '' ? undefined : numberOrZero(e.target.value) })}
          />
        </Field>
        <Field>
          <Label htmlFor={`bi-approval-${item.id}`}>Approval status</Label>
          <Select id={`bi-approval-${item.id}`} value={item.approvalStatus} onChange={(e) => updateBudgetItem(item.id, { approvalStatus: e.target.value as ApprovalStatus })}>
            {APPROVAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field>
        <Label htmlFor={`bi-event-${item.id}`}>Event</Label>
        <Select id={`bi-event-${item.id}`} value={item.event} onChange={(e) => updateBudgetItem(item.id, { event: e.target.value as EventScope })}>
          {EVENTS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>
      </Field>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete budget item"
        message={`Delete "${item.itemName}"? Any payment schedules/payments linked to it will be un-linked, not deleted. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteBudgetItem(item.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function CategoryCard({ categoryId, currency, varianceWarningPercent }: { categoryId: string; currency: string; varianceWarningPercent: number }) {
  const { budgetCategories, updateBudgetCategory, deleteBudgetCategory } = useBudgetCategories();
  const category = budgetCategories.find((c) => c.id === categoryId)!;
  const items = useBudgetItemsForCategory(categoryId);
  const { addBudgetItem } = useBudgetItems();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const summary = computeCategorySummary(category, items, varianceWarningPercent);
  const barPercent = category.plannedAmount > 0 ? Math.min(100, (summary.latestForecast / category.plannedAmount) * 100) : summary.latestForecast > 0 ? 100 : 0;

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    addBudgetItem({ categoryId, event: 'Wedding', itemName: newItemName.trim(), originalBudget: 0, approvalStatus: 'Draft' });
    setNewItemName('');
  };

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <Input
            defaultValue={category.name}
            key={`cat-name-${category.id}`}
            onBlur={(e) => updateBudgetCategory(category.id, { name: e.target.value })}
            className="font-semibold max-w-xs"
            aria-label="Category name"
          />
          <div className="flex items-center gap-2">
            {summary.isOverThreshold && <Badge tone="warning">Over plan by {summary.variancePercent.toFixed(1)}%</Badge>}
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              aria-label={`Delete category "${category.name}"`}
              className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Field>
            <Label htmlFor={`cat-planned-${category.id}`}>Planned amount</Label>
            <Input
              id={`cat-planned-${category.id}`}
              type="number"
              min={0}
              defaultValue={category.plannedAmount}
              key={`cat-planned-${category.id}-${category.plannedAmount}`}
              onBlur={(e) => updateBudgetCategory(category.id, { plannedAmount: numberOrZero(e.target.value) })}
            />
          </Field>
          <Field>
            <Label htmlFor={`cat-contingency-${category.id}`}>Contingency amount</Label>
            <Input
              id={`cat-contingency-${category.id}`}
              type="number"
              min={0}
              defaultValue={category.contingencyAmount}
              key={`cat-contingency-${category.id}-${category.contingencyAmount}`}
              onBlur={(e) => updateBudgetCategory(category.id, { contingencyAmount: numberOrZero(e.target.value) })}
            />
          </Field>
        </div>

        <div>
          <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${summary.isOverThreshold ? 'bg-warning' : 'bg-brand-600'}`}
              style={{ width: `${barPercent}%` }}
            />
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs text-ink-faint">
            <span>Plan {formatCurrency(category.plannedAmount, currency)}</span>
            <span>Forecast {formatCurrency(summary.latestForecast, currency)}</span>
            <span>Committed {formatCurrency(summary.committed, currency)}</span>
            <span>Contingency left {formatCurrency(summary.contingencyRemaining, currency)}</span>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          {items.length === 0 && <p className="text-xs text-ink-faint">No budget items yet.</p>}
          {items.map((item) => (
            <BudgetItemRow key={item.id} item={item} currency={currency} />
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="New budget item name…" aria-label="New budget item name" />
          <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddItem} disabled={!newItemName.trim()}>
            Add Item
          </Button>
        </div>
      </CardBody>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete category"
        message={`Delete "${category.name}"? Its budget items will also be deleted; any payment schedules/payments linked to those items will be un-linked, not deleted. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteBudgetCategory(category.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </Card>
  );
}

export function BudgetView() {
  const { budgetCategories, addBudgetCategory } = useBudgetCategories();
  const { budgetItems } = useBudgetItems();
  const { settings } = useSettings();
  const [newCategoryName, setNewCategoryName] = useState('');
  const currency = settings.finance.currency;
  const varianceWarningPercent = settings.finance.budgetVarianceWarningPercent;

  const overview = computeBudgetOverview(budgetCategories, budgetItems, varianceWarningPercent);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addBudgetCategory({ name: newCategoryName.trim(), plannedAmount: 0, contingencyAmount: 0, sortOrder: budgetCategories.length });
    setNewCategoryName('');
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatTile label="Original budget" value={formatCurrency(overview.originalBudget, currency)} />
          <StatTile label="Latest forecast" value={formatCurrency(overview.latestForecast, currency)} />
          <StatTile label="Committed" value={formatCurrency(overview.committed, currency)} />
          <StatTile label="Actual" value={formatCurrency(overview.actual, currency)} />
          <StatTile label="Variance" value={formatCurrency(overview.variance, currency)} tone={overview.variance > 0 ? 'warning' : 'success'} />
          <StatTile label="Contingency remaining" value={formatCurrency(overview.contingencyRemaining, currency)} />
          <StatTile label="Unapproved committed" value={formatCurrency(overview.unapprovedCommitted, currency)} tone={overview.unapprovedCommitted > 0 ? 'critical' : 'default'} />
        </CardBody>
      </Card>

      <div className="space-y-4">
        {[...budgetCategories]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((category) => (
            <CategoryCard key={category.id} categoryId={category.id} currency={currency} varianceWarningPercent={varianceWarningPercent} />
          ))}
      </div>

      <Card>
        <CardBody className="flex flex-wrap gap-2">
          <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category name…" className="flex-1 min-w-[10rem]" aria-label="New category name" />
          <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
            Add Category
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
