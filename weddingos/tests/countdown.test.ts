import { describe, expect, it } from 'vitest';
import { getCountdown } from '@/utils/countdown';
import { daysUntil } from '@/utils/date';

describe('countdown calculations', () => {
  const reference = new Date('2026-08-15T00:00:00.000Z');

  it('computes days remaining for a future date', () => {
    const countdown = getCountdown('2027-01-30', reference);
    expect(countdown.days).toBe(168);
    expect(countdown.label).toBe('168 days remaining');
    expect(countdown.isPast).toBe(false);
  });

  it('reports "Today" when the date matches the reference date', () => {
    const countdown = getCountdown('2026-08-15', reference);
    expect(countdown.days).toBe(0);
    expect(countdown.label).toBe('Today');
    expect(countdown.isToday).toBe(true);
  });

  it('reports days ago for a past date', () => {
    const countdown = getCountdown('2026-08-10', reference);
    expect(countdown.days).toBe(-5);
    expect(countdown.label).toBe('5 days ago');
    expect(countdown.isPast).toBe(true);
  });

  it('handles a missing date gracefully', () => {
    const countdown = getCountdown(undefined, reference);
    expect(countdown.days).toBeNull();
    expect(countdown.label).toBe('Date not set');
  });

  it('daysUntil returns a whole-day difference regardless of time-of-day', () => {
    const diff = daysUntil('2026-08-20', new Date('2026-08-15T23:59:00.000Z'));
    expect(diff).toBe(5);
  });
});
