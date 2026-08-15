import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Subtask } from '@/types';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

interface SubtasksEditorProps {
  subtasks: Subtask[];
  onAdd: (title: string) => void;
  onToggle: (subtaskId: string, completed: boolean) => void;
  onDelete: (subtaskId: string) => void;
}

export function SubtasksEditor({ subtasks, onAdd, onToggle, onDelete }: SubtasksEditorProps) {
  const [newTitle, setNewTitle] = useState('');
  const completedCount = subtasks.filter((s) => s.completed).length;
  const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const submit = () => {
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim());
    setNewTitle('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-ink">
          Subtasks {subtasks.length > 0 && <span className="text-ink-faint font-normal">({completedCount}/{subtasks.length} · {progress}%)</span>}
        </p>
      </div>

      {subtasks.length > 0 && (
        <ul className="space-y-1.5 mb-3">
          {subtasks.map((subtask) => (
            <li key={subtask.id} className="flex items-center gap-2 rounded-lg border border-line-soft px-3 py-2">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={(e) => onToggle(subtask.id, e.target.checked)}
                className="size-4 shrink-0 rounded border-line accent-brand-700"
                aria-label={`Mark "${subtask.title}" ${subtask.completed ? 'incomplete' : 'complete'}`}
              />
              <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-ink-faint' : 'text-ink'}`}>
                {subtask.title}
              </span>
              <button
                type="button"
                onClick={() => onDelete(subtask.id)}
                aria-label={`Delete subtask "${subtask.title}"`}
                className="shrink-0 rounded p-1 text-ink-faint hover:bg-surface-muted hover:text-critical"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Add a subtask…"
          aria-label="New subtask title"
        />
        <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={submit} disabled={!newTitle.trim()}>
          Add
        </Button>
      </div>
    </div>
  );
}
