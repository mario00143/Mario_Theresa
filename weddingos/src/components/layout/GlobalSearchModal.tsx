import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge, DecisionStatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { InvitationStatusBadge } from '@/features/guests/GuestBadges';
import { useUI } from '@/context/UIContext';
import { useTasks } from '@/hooks/useTasks';
import { useDecisions } from '@/hooks/useDecisions';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { searchAll } from '@/utils/search';
import { formatDisplayDate } from '@/utils/date';

export function GlobalSearchModal() {
  const { searchOpen, closeSearch, openTaskDetail, openDecisionDetail, openHouseholdDetail, openGuestDetail } = useUI();
  const { tasks } = useTasks();
  const { decisions } = useDecisions();
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  const results = searchAll(tasks, decisions, households, guests, query);
  const hasQuery = query.trim().length > 0;
  const hasResults = results.tasks.length > 0 || results.decisions.length > 0 || results.households.length > 0 || results.guests.length > 0;
  const householdById = new Map(households.map((h) => [h.id, h]));

  return (
    <Modal open={searchOpen} onClose={closeSearch} title="Search" size="lg">
      <div className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 mb-4">
        <Search className="size-4 text-ink-faint shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks, decisions, households, guests…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
          aria-label="Search query"
        />
      </div>

      {!hasQuery && (
        <EmptyState
          title="Start typing to search"
          description="Search across tasks, decisions, households, and guests by name, description, phone, email, city, or tags."
        />
      )}

      {hasQuery && !hasResults && <EmptyState title="No results" description={`Nothing matched "${query}".`} />}

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
        <div className="mb-4">
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

      {hasQuery && results.households.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Households ({results.households.length})</p>
          <ul className="space-y-1">
            {results.households.map((household) => (
              <li key={household.id}>
                <button
                  type="button"
                  onClick={() => {
                    openHouseholdDetail(household.id);
                    closeSearch();
                  }}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left hover:border-line hover:bg-surface-subtle"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink truncate">{household.householdName}</p>
                    <InvitationStatusBadge status={household.invitationStatus} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral">{household.side}</Badge>
                    <span className="text-xs text-ink-faint">{household.primaryContactName} · {household.city}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasQuery && results.guests.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Guests ({results.guests.length})</p>
          <ul className="space-y-1">
            {results.guests.map((guest) => (
              <li key={guest.id}>
                <button
                  type="button"
                  onClick={() => {
                    openGuestDetail(guest.id);
                    closeSearch();
                  }}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left hover:border-line hover:bg-surface-subtle"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink truncate">{guest.fullName}</p>
                    <Badge tone="neutral">{guest.ageCategory}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-ink-faint">
                      {householdById.get(guest.householdId)?.householdName ?? 'No household'}
                    </span>
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
