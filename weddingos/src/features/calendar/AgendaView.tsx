import { useNavigate } from 'react-router-dom';
import type { Task } from '@/types';
import type { WeddingPrepKeyDate } from '@/utils/weddingPrepCalendar';
import { EmptyState } from '@/components/ui/EmptyState';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useUI } from '@/context/UIContext';
import { useSettings } from '@/hooks/useSettings';
import { formatDisplayDate, isInProtectedPeriod } from '@/utils/date';
import { PROTECTED_PERIOD_MESSAGE } from '@/lib/constants';

interface AgendaEntry {
  iso: string;
  kind: 'engagement' | 'wedding' | 'task' | 'weddingPrep';
  task?: Task;
  weddingPrepEvent?: WeddingPrepKeyDate;
}

export function AgendaView({ tasks, weddingPrepEvents = [] }: { tasks: Task[]; weddingPrepEvents?: WeddingPrepKeyDate[] }) {
  const { openTaskDetail } = useUI();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const entries: AgendaEntry[] = [
    { iso: settings.engagement.date, kind: 'engagement' as const },
    { iso: settings.wedding.date, kind: 'wedding' as const },
    ...tasks.filter((t) => t.dueDate).map((t) => ({ iso: t.dueDate!, kind: 'task' as const, task: t })),
    ...weddingPrepEvents.map((e) => ({ iso: e.date, kind: 'weddingPrep' as const, weddingPrepEvent: e })),
  ].sort((a, b) => a.iso.localeCompare(b.iso));

  const grouped = new Map<string, AgendaEntry[]>();
  for (const entry of entries) {
    const list = grouped.get(entry.iso) ?? [];
    list.push(entry);
    grouped.set(entry.iso, list);
  }
  const dates = Array.from(grouped.keys()).sort();

  if (dates.length === 0) {
    return <EmptyState title="Nothing scheduled" description="No tasks have due dates yet." />;
  }

  return (
    <div className="space-y-4">
      {dates.map((iso) => {
        const dayEntries = grouped.get(iso)!;
        const protectedDay = isInProtectedPeriod(iso);
        return (
          <div key={iso} className="rounded-xl border border-line bg-surface overflow-hidden">
            <div className={`px-4 py-2 text-xs font-semibold ${protectedDay ? 'bg-critical-bg text-critical' : 'bg-surface-subtle text-ink-faint'}`}>
              {formatDisplayDate(iso)}
              {protectedDay && <span className="ml-2 font-normal">— {PROTECTED_PERIOD_MESSAGE}</span>}
            </div>
            <ul className="divide-y divide-line-soft">
              {dayEntries.map((entry, idx) => {
                if (entry.kind === 'engagement' || entry.kind === 'wedding') {
                  return (
                    <li key={`${entry.kind}-${idx}`} className="px-4 py-3">
                      <p className="text-sm font-semibold text-brand-800">
                        {entry.kind === 'engagement' ? 'Engagement — Goa' : 'Wedding — Hyderabad'}
                      </p>
                    </li>
                  );
                }
                if (entry.kind === 'weddingPrep') {
                  const event = entry.weddingPrepEvent!;
                  return (
                    <li key={event.id}>
                      <button
                        type="button"
                        onClick={() => navigate(event.route)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-surface-subtle"
                      >
                        <span className="size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                        <p className="text-sm text-ink">{event.label}</p>
                      </button>
                    </li>
                  );
                }
                const task = entry.task!;
                return (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => openTaskDetail(task.id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-subtle"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{task.title}</p>
                        <p className="mt-0.5 text-xs text-ink-faint truncate">{task.workstream} · {task.owner}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
