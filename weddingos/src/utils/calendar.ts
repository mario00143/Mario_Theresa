import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { Task } from '@/types';
import type { WeddingPrepKeyDate } from './weddingPrepCalendar';
import { isInProtectedPeriod, todayISO } from './date';

export interface CalendarDay {
  date: Date;
  iso: string;
  inCurrentMonth: boolean;
  isToday: boolean;
  isProtectedPeriod: boolean;
  tasks: Task[];
  weddingPrepEvents: WeddingPrepKeyDate[];
}

export function buildMonthGrid(monthAnchor: Date, tasks: Task[], weddingPrepEvents: WeddingPrepKeyDate[] = [], today: Date = new Date()): CalendarDay[][] {
  const monthStart = startOfMonth(monthAnchor);
  const monthEnd = endOfMonth(monthAnchor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const tasksByDate = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const list = tasksByDate.get(task.dueDate) ?? [];
    list.push(task);
    tasksByDate.set(task.dueDate, list);
  }

  const eventsByDate = new Map<string, WeddingPrepKeyDate[]>();
  for (const event of weddingPrepEvents) {
    const list = eventsByDate.get(event.date) ?? [];
    list.push(event);
    eventsByDate.set(event.date, list);
  }

  const weeks: CalendarDay[][] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    const week: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const iso = format(cursor, 'yyyy-MM-dd');
      week.push({
        date: cursor,
        iso,
        inCurrentMonth: isSameMonth(cursor, monthAnchor),
        isToday: isSameDay(cursor, today),
        isProtectedPeriod: isInProtectedPeriod(iso),
        tasks: tasksByDate.get(iso) ?? [],
        weddingPrepEvents: eventsByDate.get(iso) ?? [],
      });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function isTodayISO(iso: string): boolean {
  return iso === todayISO();
}
