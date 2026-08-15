import { daysUntil } from './date';

export interface Countdown {
  days: number | null;
  label: string;
  isPast: boolean;
  isToday: boolean;
}

export function getCountdown(dateISO: string | undefined | null, reference: Date = new Date()): Countdown {
  const days = daysUntil(dateISO, reference);
  if (days === null) return { days: null, label: 'Date not set', isPast: false, isToday: false };
  if (days === 0) return { days, label: 'Today', isPast: false, isToday: true };
  if (days < 0) return { days, label: `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`, isPast: true, isToday: false };
  return { days, label: `${days} day${days === 1 ? '' : 's'} remaining`, isPast: false, isToday: false };
}
