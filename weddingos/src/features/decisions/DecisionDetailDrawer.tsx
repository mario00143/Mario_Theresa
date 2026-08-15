import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DecisionStatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { DECISION_STATUSES } from '@/types';
import { useUI } from '@/context/UIContext';
import { useDecision, useDecisions } from '@/hooks/useDecisions';
import { useOwners } from '@/hooks/useOwners';
import { useTasks } from '@/hooks/useTasks';
import { formatDisplayDate } from '@/utils/date';
import { isDecisionOverdue } from '@/utils/decisionLogic';

export function DecisionDetailDrawer() {
  const { selectedDecisionId, closeDecisionDetail, openTaskDetail } = useUI();
  const decision = useDecision(selectedDecisionId ?? undefined);
  const { updateDecision, deleteDecision } = useDecisions();
  const { owners } = useOwners();
  const { tasks } = useTasks();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    setNewOption('');
  }, [decision?.id]);

  if (!selectedDecisionId) return null;

  if (!decision) {
    return (
      <Drawer open onClose={closeDecisionDetail} title="Decision not found">
        <p className="text-sm text-ink-faint">This decision may have been deleted.</p>
      </Drawer>
    );
  }

  const relatedTask = decision.relatedTaskId ? tasks.find((t) => t.id === decision.relatedTaskId) : undefined;
  const overdue = isDecisionOverdue(decision);

  const addOption = () => {
    if (!newOption.trim()) return;
    updateDecision(decision.id, { options: [...decision.options, newOption.trim()] });
    setNewOption('');
  };

  const removeOption = (option: string) => {
    updateDecision(decision.id, { options: decision.options.filter((o) => o !== option) });
  };

  const handleDelete = () => {
    deleteDecision(decision.id);
    setConfirmDelete(false);
    closeDecisionDetail();
  };

  return (
    <>
      <Drawer
        open
        onClose={closeDecisionDetail}
        title={decision.title || 'Untitled decision'}
        subtitle={
          <div className="flex flex-wrap items-center gap-1.5">
            <DecisionStatusBadge status={decision.status} />
            <Badge tone="neutral">{decision.category}</Badge>
            {overdue && <Badge tone="danger">Overdue</Badge>}
          </div>
        }
        footer={
          <Button variant="ghost" icon={<Trash2 className="size-4" aria-hidden="true" />} onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        }
      >
        <div className="space-y-5">
          <Field>
            <Label htmlFor="dd-title" required>
              Title
            </Label>
            <Input id="dd-title" defaultValue={decision.title} key={`title-${decision.id}`} onBlur={(e) => updateDecision(decision.id, { title: e.target.value })} />
          </Field>

          <Field>
            <Label htmlFor="dd-description">Description</Label>
            <Textarea
              id="dd-description"
              defaultValue={decision.description}
              key={`description-${decision.id}`}
              onBlur={(e) => updateDecision(decision.id, { description: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label htmlFor="dd-category">Category</Label>
              <Input
                id="dd-category"
                defaultValue={decision.category}
                key={`category-${decision.id}`}
                onBlur={(e) => updateDecision(decision.id, { category: e.target.value })}
              />
            </Field>
            <Field>
              <Label htmlFor="dd-status">Status</Label>
              <Select id="dd-status" value={decision.status} onChange={(e) => updateDecision(decision.id, { status: e.target.value as typeof decision.status })}>
                {DECISION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label htmlFor="dd-owner">Owner</Label>
              <Select id="dd-owner" value={decision.owner} onChange={(e) => updateDecision(decision.id, { owner: e.target.value })}>
                <option value="">Unassigned</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.name}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label htmlFor="dd-approver">Approver</Label>
              <Select
                id="dd-approver"
                value={decision.approver ?? ''}
                onChange={(e) => updateDecision(decision.id, { approver: e.target.value || undefined })}
              >
                <option value="">None</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.name}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field>
            <Label htmlFor="dd-deadline">Deadline</Label>
            <Input
              id="dd-deadline"
              type="date"
              value={decision.deadline ?? ''}
              onChange={(e) => updateDecision(decision.id, { deadline: e.target.value || undefined })}
            />
          </Field>

          <div>
            <p className="text-sm font-medium text-ink mb-2">Options</p>
            {decision.options.length > 0 && (
              <ul className="space-y-1.5 mb-3">
                {decision.options.map((option) => (
                  <li key={option} className="flex items-center gap-2 rounded-lg border border-line-soft px-3 py-2">
                    <span className="flex-1 text-sm text-ink">{option}</span>
                    {decision.recommendedOption === option && <Badge tone="info">Recommended</Badge>}
                    <button
                      type="button"
                      onClick={() => removeOption(option)}
                      aria-label={`Remove option "${option}"`}
                      className="shrink-0 rounded p-1 text-ink-faint hover:bg-surface-muted hover:text-critical"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addOption();
                  }
                }}
                placeholder="Add an option…"
              />
              <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={addOption} disabled={!newOption.trim()}>
                Add
              </Button>
            </div>
          </div>

          {decision.options.length > 0 && (
            <Field>
              <Label htmlFor="dd-recommended">Recommended option</Label>
              <Select
                id="dd-recommended"
                value={decision.recommendedOption ?? ''}
                onChange={(e) => updateDecision(decision.id, { recommendedOption: e.target.value || undefined })}
              >
                <option value="">None</option>
                {decision.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          {decision.status === 'Decided' && (
            <>
              <Field>
                <Label htmlFor="dd-final">Final decision</Label>
                <Textarea
                  id="dd-final"
                  defaultValue={decision.finalDecision ?? ''}
                  key={`final-${decision.id}`}
                  onBlur={(e) => updateDecision(decision.id, { finalDecision: e.target.value })}
                />
              </Field>
              <Field>
                <Label htmlFor="dd-decision-date">Decision date</Label>
                <Input
                  id="dd-decision-date"
                  type="date"
                  value={decision.decisionDate ?? ''}
                  onChange={(e) => updateDecision(decision.id, { decisionDate: e.target.value || undefined })}
                />
              </Field>
            </>
          )}

          <Field>
            <Label htmlFor="dd-notes">Notes</Label>
            <Textarea
              id="dd-notes"
              defaultValue={decision.notes ?? ''}
              key={`notes-${decision.id}`}
              onBlur={(e) => updateDecision(decision.id, { notes: e.target.value })}
            />
          </Field>

          {relatedTask && (
            <div>
              <p className="text-sm font-medium text-ink mb-2">Related task</p>
              <button
                type="button"
                onClick={() => openTaskDetail(relatedTask.id)}
                className="w-full rounded-lg border border-line-soft px-3 py-2 text-left text-sm text-ink hover:bg-surface-subtle"
              >
                {relatedTask.title}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-line-soft text-xs text-ink-faint">
            <div>Created {formatDisplayDate(decision.createdAt)}</div>
            <div>Updated {formatDisplayDate(decision.updatedAt)}</div>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete decision"
        message={`Are you sure you want to delete "${decision.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
