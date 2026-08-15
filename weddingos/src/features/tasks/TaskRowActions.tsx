import { Copy, Trash2 } from 'lucide-react';

interface TaskRowActionsProps {
  onDuplicate: () => void;
  onDelete: () => void;
}

export function TaskRowActions({ onDuplicate, onDelete }: TaskRowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        aria-label="Duplicate task"
        className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-ink"
      >
        <Copy className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete task"
        className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
