import { useNavigate } from 'react-router-dom';
import { format, isSameMonth } from 'date-fns';
import type { Task } from '@/types';
import { buildMonthGrid } from '@/utils/calendar';
import type { WeddingPrepKeyDate } from '@/utils/weddingPrepCalendar';
import { useUI } from '@/context/UIContext';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/cn';
import { PriorityBadge } from '@/components/ui/PriorityBadge';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MonthViewProps {
  monthAnchor: Date;
  tasks: Task[];
  weddingPrepEvents?: WeddingPrepKeyDate[];
}

export function MonthView({ monthAnchor, tasks, weddingPrepEvents = [] }: MonthViewProps) {
  const { openTaskDetail } = useUI();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const weeks = buildMonthGrid(monthAnchor, tasks, weddingPrepEvents);

  const engagementDate = settings.engagement.date;
  const weddingDate = settings.wedding.date;

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="grid grid-cols-7 border-b border-line-soft bg-surface-subtle">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="px-2 py-2 text-center text-xs font-semibold text-ink-faint">
            {d}
          </div>
        ))}
      </div>
      <div className="divide-y divide-line-soft">
        {weeks.map((week, i) => (
          <div key={i} className="grid grid-cols-7 divide-x divide-line-soft">
            {week.map((day) => {
              const isEngagement = day.iso === engagementDate;
              const isWedding = day.iso === weddingDate;
              return (
                <div
                  key={day.iso}
                  className={cn(
                    'min-h-24 sm:min-h-28 p-1.5 sm:p-2 align-top',
                    !day.inCurrentMonth && 'bg-surface-subtle/60',
                    day.isProtectedPeriod && 'bg-critical-bg/40',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-flex size-6 items-center justify-center rounded-full text-xs font-medium',
                        day.isToday && 'bg-brand-700 text-white',
                        !day.isToday && !day.inCurrentMonth && 'text-ink-faint',
                        !day.isToday && day.inCurrentMonth && 'text-ink',
                      )}
                    >
                      {format(day.date, 'd')}
                    </span>
                    {(isEngagement || isWedding) && (
                      <span className="text-[10px] font-semibold text-brand-700">{isWedding ? 'Wedding' : 'Engagement'}</span>
                    )}
                  </div>

                  <div className="mt-1 space-y-1">
                    {day.tasks.slice(0, 3).map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => openTaskDetail(task.id)}
                        className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] hover:bg-surface-subtle"
                        title={task.title}
                      >
                        <span
                          className={cn(
                            'size-1.5 shrink-0 rounded-full',
                            task.priority === 'Critical' && 'bg-critical',
                            task.priority === 'High' && 'bg-high',
                            task.priority === 'Medium' && 'bg-medium',
                            task.priority === 'Low' && 'bg-low',
                          )}
                          aria-hidden="true"
                        />
                        <span className="truncate text-ink-soft">{task.title}</span>
                      </button>
                    ))}
                    {day.tasks.length > 3 && (
                      <p className="px-1 text-[10px] text-ink-faint">+{day.tasks.length - 3} more</p>
                    )}
                    {day.weddingPrepEvents.slice(0, 2).map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => navigate(event.route)}
                        className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] hover:bg-surface-subtle"
                        title={event.label}
                      >
                        <span className="size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                        <span className="truncate text-brand-800">{event.label}</span>
                      </button>
                    ))}
                    {day.weddingPrepEvents.length > 2 && (
                      <p className="px-1 text-[10px] text-ink-faint">+{day.weddingPrepEvents.length - 2} wedding prep</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {isSameMonth(monthAnchor, new Date('2027-01-15')) && (
        <div className="border-t border-line-soft bg-brand-50 px-4 py-2.5 text-xs text-brand-800 flex items-center gap-2">
          <PriorityBadge priority="Critical" />
          January 2027 contains both the Goa engagement and the Hyderabad wedding, plus the protected engagement period (8–13 Jan).
        </div>
      )}
    </div>
  );
}
