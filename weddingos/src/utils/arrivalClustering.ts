import type { TravelSegment } from '@/types';

export const DEFAULT_CLUSTER_WINDOW_MINUTES = 60;

export interface ArrivalCluster {
  location: string;
  date: string;
  segments: TravelSegment[];
  earliestTime: string;
  latestTime: string;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Groups Arrival segments by identical arrival location + calendar date,
 * then clusters within each group using a sliding time window: a segment
 * joins the current cluster if it's within `windowMinutes` of the cluster's
 * first (earliest) arrival time, otherwise it starts a new cluster.
 *
 * Returns every cluster (including singletons) — callers decide what counts
 * as a "suggested shared pickup" (typically size >= 2). This never assigns
 * anyone to anything; it only suggests groupings.
 */
export function clusterArrivals(segments: TravelSegment[], windowMinutes = DEFAULT_CLUSTER_WINDOW_MINUTES): ArrivalCluster[] {
  const arrivals = segments.filter(
    (s) => s.direction === 'Arrival' && s.arrivalDate && s.arrivalTime && s.destination.trim().length > 0,
  );

  const byKey = new Map<string, TravelSegment[]>();
  for (const segment of arrivals) {
    const key = `${segment.destination.trim().toLowerCase()}|${segment.arrivalDate}`;
    const list = byKey.get(key) ?? [];
    list.push(segment);
    byKey.set(key, list);
  }

  const clusters: ArrivalCluster[] = [];
  for (const list of byKey.values()) {
    const sorted = [...list].sort((a, b) => a.arrivalTime!.localeCompare(b.arrivalTime!));
    let current: TravelSegment[] = [];
    let clusterStartMinutes = 0;

    const flush = () => {
      if (current.length === 0) return;
      clusters.push({
        location: current[0].destination,
        date: current[0].arrivalDate!,
        segments: current,
        earliestTime: current[0].arrivalTime!,
        latestTime: current[current.length - 1].arrivalTime!,
      });
    };

    for (const segment of sorted) {
      const minutes = timeToMinutes(segment.arrivalTime!);
      if (current.length === 0) {
        current = [segment];
        clusterStartMinutes = minutes;
      } else if (minutes - clusterStartMinutes <= windowMinutes) {
        current.push(segment);
      } else {
        flush();
        current = [segment];
        clusterStartMinutes = minutes;
      }
    }
    flush();
  }

  return clusters.sort((a, b) => (a.date === b.date ? a.earliestTime.localeCompare(b.earliestTime) : a.date.localeCompare(b.date)));
}

export function describeCluster(cluster: ArrivalCluster): string {
  const count = cluster.segments.length;
  return `${count} guest${count === 1 ? '' : 's'} arriving ${cluster.location} between ${cluster.earliestTime} and ${cluster.latestTime}.`;
}

/**
 * Same sliding-window clustering as clusterArrivals, but for Departure
 * segments — grouped by origin (the pickup point, typically a hotel) and
 * departure date, so drop-off trips leaving around the same time can share
 * a vehicle too.
 */
export function clusterDepartures(segments: TravelSegment[], windowMinutes = DEFAULT_CLUSTER_WINDOW_MINUTES): ArrivalCluster[] {
  const departures = segments.filter(
    (s) => s.direction === 'Departure' && s.departureDate && s.departureTime && s.origin.trim().length > 0,
  );

  const byKey = new Map<string, TravelSegment[]>();
  for (const segment of departures) {
    const key = `${segment.origin.trim().toLowerCase()}|${segment.departureDate}`;
    const list = byKey.get(key) ?? [];
    list.push(segment);
    byKey.set(key, list);
  }

  const clusters: ArrivalCluster[] = [];
  for (const list of byKey.values()) {
    const sorted = [...list].sort((a, b) => a.departureTime!.localeCompare(b.departureTime!));
    let current: TravelSegment[] = [];
    let clusterStartMinutes = 0;

    const flush = () => {
      if (current.length === 0) return;
      clusters.push({
        location: current[0].origin,
        date: current[0].departureDate!,
        segments: current,
        earliestTime: current[0].departureTime!,
        latestTime: current[current.length - 1].departureTime!,
      });
    };

    for (const segment of sorted) {
      const minutes = timeToMinutes(segment.departureTime!);
      if (current.length === 0) {
        current = [segment];
        clusterStartMinutes = minutes;
      } else if (minutes - clusterStartMinutes <= windowMinutes) {
        current.push(segment);
      } else {
        flush();
        current = [segment];
        clusterStartMinutes = minutes;
      }
    }
    flush();
  }

  return clusters.sort((a, b) => (a.date === b.date ? a.earliestTime.localeCompare(b.earliestTime) : a.date.localeCompare(b.date)));
}

export function describeDepartureCluster(cluster: ArrivalCluster): string {
  const count = cluster.segments.length;
  return `${count} guest${count === 1 ? '' : 's'} departing from ${cluster.location} between ${cluster.earliestTime} and ${cluster.latestTime}.`;
}
