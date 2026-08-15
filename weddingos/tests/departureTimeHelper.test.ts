import { describe, expect, it } from 'vitest';
import { computeRecommendedDeparture, DEFAULT_TERMINAL_BUFFER_MINUTES } from '@/utils/departureTimeHelper';

describe('recommended departure time helper', () => {
  it('matches the worked example: 18:00 domestic flight suggests a 14:30 hotel departure', () => {
    const result = computeRecommendedDeparture('2027-01-31', '18:00', 'Flight', { flightScope: 'Domestic' });
    expect(result).not.toBeNull();
    expect(result!.time).toBe('14:30');
    expect(result!.date).toBe('2027-01-31');
  });

  it('applies a larger buffer for an international flight than a domestic one', () => {
    const domestic = computeRecommendedDeparture('2027-02-01', '21:30', 'Flight', { flightScope: 'Domestic' });
    const international = computeRecommendedDeparture('2027-02-01', '21:30', 'Flight', { flightScope: 'International' });
    expect(domestic).not.toBeNull();
    expect(international).not.toBeNull();
    expect(international!.totalMinutesBefore).toBeGreaterThan(domestic!.totalMinutesBefore);
  });

  it('uses the train terminal buffer for train departures', () => {
    const result = computeRecommendedDeparture('2027-01-31', '22:00', 'Train');
    expect(result).not.toBeNull();
    expect(result!.terminalBufferMinutes).toBe(DEFAULT_TERMINAL_BUFFER_MINUTES.Train);
  });

  it('uses the bus terminal buffer for bus departures', () => {
    const result = computeRecommendedDeparture('2027-01-31', '21:00', 'Bus');
    expect(result).not.toBeNull();
    expect(result!.terminalBufferMinutes).toBe(DEFAULT_TERMINAL_BUFFER_MINUTES.Bus);
  });

  it('applies the road-travel buffer even for a zero-terminal-buffer mode like Car', () => {
    const result = computeRecommendedDeparture('2027-02-01', '08:00', 'Car', { roadTravelMinutes: 45, extraBufferMinutes: 15 });
    expect(result).not.toBeNull();
    expect(result!.terminalBufferMinutes).toBe(0);
    expect(result!.roadTravelMinutes).toBe(45);
    expect(result!.extraBufferMinutes).toBe(15);
    expect(result!.totalMinutesBefore).toBe(60);
  });

  it('allows overriding the default road-travel and extra buffer minutes', () => {
    const result = computeRecommendedDeparture('2027-01-28', '20:45', 'Flight', { flightScope: 'Domestic', roadTravelMinutes: 90, extraBufferMinutes: 0 });
    expect(result).not.toBeNull();
    expect(result!.totalMinutesBefore).toBe(120 + 90 + 0);
  });

  it('returns null for an invalid date/time combination', () => {
    expect(computeRecommendedDeparture('not-a-date', '25:99', 'Flight')).toBeNull();
  });

  it('rolls over to the previous calendar day when the buffer crosses midnight', () => {
    const result = computeRecommendedDeparture('2027-02-01', '02:00', 'Flight', { flightScope: 'Domestic' });
    expect(result).not.toBeNull();
    expect(result!.date).toBe('2027-01-31');
    expect(result!.time).toBe('22:30');
  });
});
