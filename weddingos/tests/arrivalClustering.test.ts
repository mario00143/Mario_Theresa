import { describe, expect, it } from 'vitest';
import { clusterArrivals, clusterDepartures, describeCluster } from '@/utils/arrivalClustering';
import type { TravelSegment } from '@/types';

function makeSegment(overrides: Partial<TravelSegment> = {}): TravelSegment {
  return {
    id: overrides.id ?? 'travel-1',
    guestId: overrides.guestId ?? 'guest-1',
    householdId: 'household-1',
    event: 'Wedding',
    direction: 'Arrival',
    travelMode: 'Flight',
    origin: 'Kochi',
    destination: 'RGIA (Hyderabad Airport)',
    bookingStatus: 'Confirmed',
    ticketConfirmed: true,
    pickupRequired: true,
    dropRequired: false,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('arrival clustering', () => {
  it('groups two arrivals at the same location within the time window into one cluster', () => {
    const segments = [
      makeSegment({ id: 't1', guestId: 'g1', arrivalDate: '2027-01-28', arrivalTime: '14:00' }),
      makeSegment({ id: 't2', guestId: 'g2', arrivalDate: '2027-01-28', arrivalTime: '14:30' }),
    ];
    const clusters = clusterArrivals(segments, 60);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].segments).toHaveLength(2);
  });

  it('splits arrivals into separate clusters when they exceed the time window', () => {
    const segments = [
      makeSegment({ id: 't1', guestId: 'g1', arrivalDate: '2027-01-28', arrivalTime: '08:00' }),
      makeSegment({ id: 't2', guestId: 'g2', arrivalDate: '2027-01-28', arrivalTime: '20:00' }),
    ];
    const clusters = clusterArrivals(segments, 60);
    expect(clusters).toHaveLength(2);
  });

  it('does not cluster arrivals at different locations even at the same time', () => {
    const segments = [
      makeSegment({ id: 't1', guestId: 'g1', arrivalDate: '2027-01-28', arrivalTime: '14:00', destination: 'RGIA (Hyderabad Airport)' }),
      makeSegment({ id: 't2', guestId: 'g2', arrivalDate: '2027-01-28', arrivalTime: '14:00', destination: 'Kacheguda Railway Station' }),
    ];
    const clusters = clusterArrivals(segments, 60);
    expect(clusters).toHaveLength(2);
  });

  it('does not cluster arrivals on different dates', () => {
    const segments = [
      makeSegment({ id: 't1', guestId: 'g1', arrivalDate: '2027-01-27', arrivalTime: '14:00' }),
      makeSegment({ id: 't2', guestId: 'g2', arrivalDate: '2027-01-28', arrivalTime: '14:00' }),
    ];
    const clusters = clusterArrivals(segments, 60);
    expect(clusters).toHaveLength(2);
  });

  it('is a boundary case: exactly at the window edge still joins the cluster', () => {
    const segments = [
      makeSegment({ id: 't1', guestId: 'g1', arrivalDate: '2027-01-28', arrivalTime: '14:00' }),
      makeSegment({ id: 't2', guestId: 'g2', arrivalDate: '2027-01-28', arrivalTime: '15:00' }),
    ];
    const clusters = clusterArrivals(segments, 60);
    expect(clusters).toHaveLength(1);
  });

  it('is a boundary case: one minute past the window starts a new cluster', () => {
    const segments = [
      makeSegment({ id: 't1', guestId: 'g1', arrivalDate: '2027-01-28', arrivalTime: '14:00' }),
      makeSegment({ id: 't2', guestId: 'g2', arrivalDate: '2027-01-28', arrivalTime: '15:01' }),
    ];
    const clusters = clusterArrivals(segments, 60);
    expect(clusters).toHaveLength(2);
  });

  it('ignores departures and segments missing a date/time/location', () => {
    const segments = [
      makeSegment({ id: 't1', direction: 'Departure', departureDate: '2027-01-31', departureTime: '10:00' }),
      makeSegment({ id: 't2', arrivalDate: undefined, arrivalTime: undefined }),
      makeSegment({ id: 't3', destination: '' }),
    ];
    expect(clusterArrivals(segments)).toHaveLength(0);
  });

  it('describes a cluster in a human-readable sentence', () => {
    const segments = [
      makeSegment({ id: 't1', guestId: 'g1', arrivalDate: '2027-01-28', arrivalTime: '14:10' }),
      makeSegment({ id: 't2', guestId: 'g2', arrivalDate: '2027-01-28', arrivalTime: '14:55' }),
    ];
    const [cluster] = clusterArrivals(segments, 60);
    expect(describeCluster(cluster)).toBe('2 guests arriving RGIA (Hyderabad Airport) between 14:10 and 14:55.');
  });
});

describe('departure clustering', () => {
  it('groups departures leaving from the same origin within the window', () => {
    const segments = [
      makeSegment({ id: 't1', guestId: 'g1', direction: 'Departure', origin: 'Marigold Grand Hyderabad', departureDate: '2027-01-31', departureTime: '06:00' }),
      makeSegment({ id: 't2', guestId: 'g2', direction: 'Departure', origin: 'Marigold Grand Hyderabad', departureDate: '2027-01-31', departureTime: '06:20' }),
    ];
    const clusters = clusterDepartures(segments, 60);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].segments).toHaveLength(2);
  });

  it('ignores arrivals when clustering departures', () => {
    const segments = [makeSegment({ direction: 'Arrival', arrivalDate: '2027-01-28', arrivalTime: '14:00' })];
    expect(clusterDepartures(segments)).toHaveLength(0);
  });
});
