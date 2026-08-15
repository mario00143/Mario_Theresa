import { useEffect, useState } from 'react';
import { Ban, CheckCircle2, Clock, Copy, PlayCircle, Trash2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Field, FieldHint, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Badge } from '@/components/ui/Badge';
import { EVENTS, PRIORITIES, TASK_STATUSES, WORKSTREAMS, type Task, type TaskStatus } from '@/types';
import { useUI } from '@/context/UIContext';
import { useTask, useTasks } from '@/hooks/useTasks';
import { useOwners } from '@/hooks/useOwners';
import { formatDisplayDate } from '@/utils/date';
import { getDependencyStatus, isProtectedPeriodViolation, validateTask } from '@/utils/taskLogic';
import { PROTECTED_PERIOD_MESSAGE } from '@/lib/constants';
import { ValidationWarnings } from './ValidationWarnings';
import { SubtasksEditor } from './SubtasksEditor';
import { DependenciesEditor } from './DependenciesEditor';

export function TaskDetailDrawer() {
  const { selectedTaskId, closeTaskDetail, openTaskDetail } = useUI();
  const task = useTask(selectedTaskId ?? undefined);
  const { tasks, updateTask, deleteTask, duplicateTask, addSubtask, updateSubtask, deleteSubtask } = useTasks();
  const { owners } = useOwners();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    setTagsInput(task?.tags.join(', ') ?? '');
  }, [task?.id, task?.tags]);

  if (!selectedTaskId) return null;

  if (!task) {
    return (
      <Drawer open onClose={closeTaskDetail} title="Task not found">
        <p className="text-sm text-ink-faint">This task may have been deleted.</p>
      </Drawer>
    );
  }

  const issues = validateTask(task, tasks);
  const dependencyStatus = getDependencyStatus(task, tasks);
  const protectedViolation = isProtectedPeriodViolation(task);

  const setStatus = (status: TaskStatus) => updateTask(task.id, { status });

  const handleDelete = () => {
    deleteTask(task.id);
    setConfirmDelete(false);
    closeTaskDetail();
  };

  const handleDuplicate = () => {
    const copy = duplicateTask(task.id);
    if (copy) openTaskDetail(copy.id);
  };

  return (
    <>
      <Drawer
        open
        onClose={closeTaskDetail}
        title={task.title || 'Untitled task'}
        subtitle={
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            <Badge tone="neutral">{task.event}</Badge>
            <Badge tone="neutral">{task.workstream}</Badge>
          </div>
        }
        footer={
          <>
            <Button variant="ghost" icon={<Trash2 className="size-4" aria-hidden="true" />} onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
            <Button variant="secondary" icon={<Copy className="size-4" aria-hidden="true" />} onClick={handleDuplicate}>
              Duplicate
            </Button>
            <div className="flex-1" />
            <Button variant="secondary" icon={<PlayCircle className="size-4" aria-hidden="true" />} onClick={() => setStatus('In Progress')}>
              In Progress
            </Button>
            <Button variant="secondary" icon={<Clock className="size-4" aria-hidden="true" />} onClick={() => setStatus('Waiting')}>
              Waiting
            </Button>
            <Button variant="secondary" icon={<Ban className="size-4" aria-hidden="true" />} onClick={() => setStatus('Blocked')}>
              Blocked
            </Button>
            <Button variant="primary" icon={<CheckCircle2 className="size-4" aria-hidden="true" />} onClick={() => setStatus('Done')}>
              Done
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {issues.length > 0 && <ValidationWarnings issues={issues} />}

          {protectedViolation && (
            <div className="rounded-lg border border-critical/30 bg-critical-bg px-3.5 py-3 text-sm text-critical font-medium">
              {PROTECTED_PERIOD_MESSAGE}
            </div>
          )}

          {dependencyStatus.isBlockedByDependency && (
            <div className="rounded-lg border border-warning/30 bg-warning-bg px-3.5 py-3 text-sm text-warning">
              Blocked by {dependencyStatus.incomplete.length} incomplete dependency
              {dependencyStatus.incomplete.length === 1 ? '' : 'ies'}.
            </div>
          )}

          <Field>
            <Label htmlFor="td-title" required>
              Title
            </Label>
            <Input
              id="td-title"
              defaultValue={task.title}
              key={`title-${task.id}`}
              onBlur={(e) => updateTask(task.id, { title: e.target.value })}
            />
          </Field>

          <Field>
            <Label htmlFor="td-description">Description</Label>
            <Textarea
              id="td-description"
              defaultValue={task.description}
              key={`description-${task.id}`}
              onBlur={(e) => updateTask(task.id, { description: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label htmlFor="td-event">Event</Label>
              <Select id="td-event" value={task.event} onChange={(e) => updateTask(task.id, { event: e.target.value as Task['event'] })}>
                {EVENTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label htmlFor="td-workstream">Workstream</Label>
              <Select
                id="td-workstream"
                value={task.workstream}
                onChange={(e) => updateTask(task.id, { workstream: e.target.value as Task['workstream'] })}
              >
                {WORKSTREAMS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label htmlFor="td-owner">Owner</Label>
              <Select id="td-owner" value={task.owner} onChange={(e) => updateTask(task.id, { owner: e.target.value })}>
                <option value="">Unassigned</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.name}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label htmlFor="td-approver">Approver</Label>
              <Select id="td-approver" value={task.approver ?? ''} onChange={(e) => updateTask(task.id, { approver: e.target.value || undefined })}>
                <option value="">None</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.name}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label htmlFor="td-status">Status</Label>
              <Select id="td-status" value={task.status} onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}>
                {TASK_STATUSES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label htmlFor="td-priority">Priority</Label>
              <Select
                id="td-priority"
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value as Task['priority'] })}
              >
                {PRIORITIES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label htmlFor="td-start">Start date</Label>
              <Input
                id="td-start"
                type="date"
                value={task.startDate ?? ''}
                onChange={(e) => updateTask(task.id, { startDate: e.target.value || undefined })}
              />
            </Field>
            <Field>
              <Label htmlFor="td-due">Due date</Label>
              <Input
                id="td-due"
                type="date"
                value={task.dueDate ?? ''}
                onChange={(e) => updateTask(task.id, { dueDate: e.target.value || undefined })}
              />
            </Field>
          </div>

          {task.status === 'Blocked' && (
            <Field>
              <Label htmlFor="td-blocked-reason" required>
                Blocked reason
              </Label>
              <Textarea
                id="td-blocked-reason"
                defaultValue={task.blockedReason ?? ''}
                key={`blocked-${task.id}`}
                onBlur={(e) => updateTask(task.id, { blockedReason: e.target.value })}
              />
            </Field>
          )}

          <Field>
            <Label htmlFor="td-next-action">Next action</Label>
            <Input
              id="td-next-action"
              defaultValue={task.nextAction ?? ''}
              key={`next-${task.id}`}
              onBlur={(e) => updateTask(task.id, { nextAction: e.target.value })}
            />
          </Field>

          <Field>
            <Label htmlFor="td-completion-criteria" required>
              Completion criteria
            </Label>
            <Textarea
              id="td-completion-criteria"
              defaultValue={task.completionCriteria}
              key={`criteria-${task.id}`}
              onBlur={(e) => updateTask(task.id, { completionCriteria: e.target.value })}
            />
          </Field>

          {task.status === 'Done' && (
            <>
              <Field>
                <Label htmlFor="td-completion-note">Completion note</Label>
                <Textarea
                  id="td-completion-note"
                  defaultValue={task.completionNote ?? ''}
                  key={`note-${task.id}`}
                  onBlur={(e) => updateTask(task.id, { completionNote: e.target.value })}
                />
                <FieldHint>Required completion note or evidence for Done tasks.</FieldHint>
              </Field>
              <Field>
                <Label htmlFor="td-completion-evidence">Completion evidence</Label>
                <Input
                  id="td-completion-evidence"
                  defaultValue={task.completionEvidence ?? ''}
                  key={`evidence-${task.id}`}
                  placeholder="Link, file name, or reference"
                  onBlur={(e) => updateTask(task.id, { completionEvidence: e.target.value })}
                />
              </Field>
            </>
          )}

          <Field>
            <Label htmlFor="td-tags">Tags</Label>
            <Input
              id="td-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onBlur={() =>
                updateTask(task.id, {
                  tags: tagsInput
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Comma-separated tags"
            />
          </Field>

          <Field>
            <Label htmlFor="td-notes">Notes</Label>
            <Textarea
              id="td-notes"
              defaultValue={task.notes ?? ''}
              key={`notes-${task.id}`}
              onBlur={(e) => updateTask(task.id, { notes: e.target.value })}
            />
          </Field>

          <SubtasksEditor
            subtasks={task.subtasks}
            onAdd={(title) => addSubtask(task.id, title)}
            onToggle={(subtaskId, completed) => updateSubtask(task.id, subtaskId, { completed })}
            onDelete={(subtaskId) => deleteSubtask(task.id, subtaskId)}
          />

          <DependenciesEditor
            task={task}
            allTasks={tasks}
            onAdd={(depId) => updateTask(task.id, { dependencies: [...task.dependencies, depId] })}
            onRemove={(depId) => updateTask(task.id, { dependencies: task.dependencies.filter((d) => d !== depId) })}
            onOpenTask={(id) => openTaskDetail(id)}
          />

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-line-soft text-xs text-ink-faint">
            <div>Created {formatDisplayDate(task.createdAt)}</div>
            <div>Updated {formatDisplayDate(task.updatedAt)}</div>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete task"
        message={`Are you sure you want to delete "${task.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
