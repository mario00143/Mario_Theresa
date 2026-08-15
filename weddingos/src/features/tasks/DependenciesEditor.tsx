import { useState } from 'react';
import { X } from 'lucide-react';
import type { Task } from '@/types';
import { Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { wouldCreateCircularDependency } from '@/utils/taskLogic';

interface DependenciesEditorProps {
  task: Task;
  allTasks: Task[];
  onAdd: (dependencyId: string) => void;
  onRemove: (dependencyId: string) => void;
  onOpenTask: (taskId: string) => void;
}

export function DependenciesEditor({ task, allTasks, onAdd, onRemove, onOpenTask }: DependenciesEditorProps) {
  const [selected, setSelected] = useState('');

  const dependencyTasks = task.dependencies
    .map((id) => allTasks.find((t) => t.id === id))
    .filter((t): t is Task => Boolean(t));

  const candidates = allTasks.filter(
    (t) => t.id !== task.id && !task.dependencies.includes(t.id) && !wouldCreateCircularDependency(task.id, t.id, allTasks),
  );

  const handleAdd = () => {
    if (!selected) return;
    onAdd(selected);
    setSelected('');
  };

  return (
    <div>
      <p className="text-sm font-medium text-ink mb-2">Dependencies</p>

      {dependencyTasks.length > 0 && (
        <ul className="space-y-1.5 mb-3">
          {dependencyTasks.map((dep) => (
            <li key={dep.id} className="flex items-center gap-2 rounded-lg border border-line-soft px-3 py-2">
              <button
                type="button"
                onClick={() => onOpenTask(dep.id)}
                className="flex-1 text-left text-sm text-ink hover:underline truncate"
              >
                {dep.title}
              </button>
              <StatusBadge status={dep.status} />
              <button
                type="button"
                onClick={() => onRemove(dep.id)}
                aria-label={`Remove dependency on "${dep.title}"`}
                className="shrink-0 rounded p-1 text-ink-faint hover:bg-surface-muted hover:text-critical"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Select value={selected} onChange={(e) => setSelected(e.target.value)} aria-label="Add dependency">
          <option value="">Select a task this depends on…</option>
          {candidates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </Select>
        <Button variant="secondary" onClick={handleAdd} disabled={!selected}>
          Add
        </Button>
      </div>
    </div>
  );
}
