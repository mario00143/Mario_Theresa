import {
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
  startOfDay,
} from 'date-fns';
import {
  DATE_DISPLAY_FORMAT,
  PROTECTED_PERIOD_END,
  PROTECTED_PERIOD_START,
} from '@/lib/constants';
import type { AppSettings } from '@/types';

/** Parse an ISO ("yyyy-MM-dd" or full ISO) date string into a Date, or null if invalid/empty. */
export function parseDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

/** Format an ISO date string for display as "DD MMM YYYY". Returns a placeholder if empty/invalid. */
export function formatDisplayDate(value: string | undefined | null, placeholder = '—'): string {
  const date = parseDate(value);
  if (!date) return placeholder;
  return format(date, DATE_DISPLAY_FORMAT);
}

export function todayISO(reference: Date = new Date()): string {
  return format(reference, 'yyyy-MM-dd');
}

/** Whole-day difference between target date and "now" (positive = future). */
export function daysUntil(value: string | undefined | null, reference: Date = new Date()): number | null {
  const date = parseDate(value);
  if (!date) return null;
  return differenceInCalendarDays(startOfDay(date), startOfDay(reference));
}

export function isValidDateString(value: string | undefined | null): boolean {
  return parseDate(value) !== null;
}

/** Inclusive check: is the given ISO date within the protected engagement period (8–13 Jan 2027)? */
export function isInProtectedPeriod(value: string | undefined | null): boolean {
  const date = parseDate(value);
  if (!date) return false;
  const start = parseDate(PROTECTED_PERIOD_START)!;
  const end = parseDate(PROTECTED_PERIOD_END)!;
  const d = startOfDay(date).getTime();
  return d >= startOfDay(start).getTime() && d <= startOfDay(end).getTime();
}

export function isSameISODate(a: string | undefined | null, b: string | undefined | null): boolean {
  const da = parseDate(a);
  const db = parseDate(b);
  if (!da || !db) return false;
  return todayISO(da) === todayISO(db);
}

/** Combines the wedding date and ceremony time into a single ISO datetime, for reconfirmation-window math. */
export function weddingDateTimeISO(settings: Pick<AppSettings, 'wedding'>): string {
  const time = settings.wedding.ceremonyTime || '00:00';
  return `${settings.wedding.date}T${time}:00`;
}
