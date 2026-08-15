import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Select } from '@/components/ui/Field';
import { useUI } from '@/context/UIContext';
import { useTasks } from '@/hooks/useTasks';
import { useDecisions } from '@/hooks/useDecisions';
import { useOwners } from '@/hooks/useOwners';
import { PRIORITIES } from '@/types';

export function QuickAddModal() {
  const { quickAddOpen, quickAddMode, closeQuickAdd, openTaskDetail, openDecisionDetail } = useUI();
  const { addTask } = useTasks();
  const { addDecision } = useDecisions();
  const { owners } = useOwners();

  const [mode, setMode] = useState<'task' | 'decision'>(quickAddMode);
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>('Medium');

  const resetAndClose = () => {
    setTitle('');
    setOwner('');
    setDueDate('');
    setPriority('Medium');
    closeQuickAdd();
  };

  useEffect(() => {
    if (quickAddOpen) setMode(quickAddMode);
  }, [quickAddOpen, quickAddMode]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (mode === 'task') {
      const task = addTask({
        title: title.trim(),
        description: '',
        event: 'Wedding',
        workstream: 'Governance',
        owner: owner || 'Groom',
        status: 'Not Started',
        priority,
        dueDate: dueDate || undefined,
        completionCriteria: '',
      });
      resetAndClose();
      openTaskDetail(task.id);
    } else {
      const decision = addDecision({
        title: title.trim(),
        description: '',
        category: 'Governance',
        owner: owner || 'Groom',
        options: [],
        deadline: dueDate || undefined,
        status: 'Open',
      });
      resetAndClose();
      openDecisionDetail(decision.id);
    }
  };

  return (
    <Modal
      open={quickAddOpen}
      onClose={resetAndClose}
      title="Quick Add"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!title.trim()}>
            Create {mode === 'task' ? 'Task' : 'Decision'}
          </Button>
        </>
      }
    >
      <div className="mb-4 flex rounded-lg border border-line p-1">
        <button
          type="button"
          onClick={() => setMode('task')}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium ${mode === 'task' ? 'bg-brand-700 text-white' : 'text-ink-soft'}`}
        >
          New Task
        </button>
        <button
          type="button"
          onClick={() => setMode('decision')}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium ${mode === 'decision' ? 'bg-brand-700 text-white' : 'text-ink-soft'}`}
        >
          New Decision
        </button>
      </div>

      <div className="space-y-3">
        <Field>
          <Label htmlFor="quick-add-title" required>
            Title
          </Label>
          <Input
            id="quick-add-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={mode === 'task' ? 'e.g. Confirm floral vendor pricing' : 'e.g. Select photography package'}
            autoFocus
          />
        </Field>

        <Field>
          <Label htmlFor="quick-add-owner">Owner</Label>
          <Select id="quick-add-owner" value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="">Unassigned</option>
            {owners.map((o) => (
              <option key={o.id} value={o.name}>
                {o.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field>
          <Label htmlFor="quick-add-date">{mode === 'task' ? 'Due date' : 'Deadline'}</Label>
          <Input id="quick-add-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>

        {mode === 'task' && (
          <Field>
            <Label htmlFor="quick-add-priority">Priority</Label>
            <Select id="quick-add-priority" value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <p className="text-xs text-ink-faint">
          You can edit all remaining details — description, workstream, dependencies, completion criteria and more — right after
          creating this {mode}.
        </p>
      </div>
    </Modal>
  );
}
