import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge, DecisionStatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useUI } from '@/context/UIContext';
import { useTasks } from '@/hooks/useTasks';
import { useDecisions } from '@/hooks/useDecisions';
import { searchAll } from '@/utils/search';
import { formatDisplayDate } from '@/utils/date';

export function GlobalSearchModal() {
  const { searchOpen, closeSearch, openTaskDetail, openDecisionDetail } = useUI();
  const { tasks } = useTasks();
  const { decisions } = useDecisions();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  const results = searchAll(tasks, decisions, query);
  const hasQuery = query.trim().length > 0;
  const hasResults = results.tasks.length > 0 || results.decisions.length > 0;

  return (
    <Modal open={searchOpen} onClose={closeSearch} title="Search" size="lg">
      <div className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 mb-4">
        <Search className="size-4 text-ink-faint shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search task title, description, workstream, owner, tags, or decision title…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
          aria-label="Search query"
        />
      </div>

      {!hasQuery && (
        <EmptyState title="Start typing to search" description="Search across tasks and decisions by title, description, workstream, owner, or tags." />
      )}

      {hasQuery && !hasResults && (
        <EmptyState title="No results" description={`Nothing matched "${query}".`} />
      )}

      {hasQuery && results.tasks.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Tasks ({results.tasks.length})</p>
          <ul className="space-y-1">
            {results.tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => {
                    openTaskDetail(task.id);
                    closeSearch();
                  }}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left hover:border-line hover:bg-surface-subtle"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink truncate">{task.title}</p>
                    <span className="text-xs text-ink-faint shrink-0">{formatDisplayDate(task.dueDate)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    <span className="text-xs text-ink-faint">{task.workstream} · {task.owner}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasQuery && results.decisions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Decisions ({results.decisions.length})</p>
          <ul className="space-y-1">
            {results.decisions.map((decision) => (
              <li key={decision.id}>
                <button
                  type="button"
                  onClick={() => {
                    openDecisionDetail(decision.id);
                    closeSearch();
                  }}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left hover:border-line hover:bg-surface-subtle"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink truncate">{decision.title}</p>
                    <span className="text-xs text-ink-faint shrink-0">{formatDisplayDate(decision.deadline)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <DecisionStatusBadge status={decision.status} />
                    <span className="text-xs text-ink-faint">{decision.category} · {decision.owner}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
