import { format, parseISO, subMinutes } from 'date-fns';
import type { TravelMode } from '@/types';

export type FlightScope = 'Domestic' | 'International';

/** Minutes to be at the terminal before scheduled departure, by mode. Flight requires a scope. */
export const DEFAULT_TERMINAL_BUFFER_MINUTES: Record<Exclude<TravelMode, 'Flight'>, number> & { Flight: Record<FlightScope, number> } = {
  Flight: { Domestic: 120, International: 180 },
  Train: 45,
  Bus: 30,
  Car: 0,
  Taxi: 0,
  Other: 30,
};

export const DEFAULT_ROAD_TRAVEL_MINUTES = 60;
export const DEFAULT_EXTRA_BUFFER_MINUTES = 30;

export interface RecommendedDepartureOptions {
  flightScope?: FlightScope;
  roadTravelMinutes?: number;
  extraBufferMinutes?: number;
}

export interface RecommendedDeparture {
  dateTime: Date;
  date: string;
  time: string;
  terminalBufferMinutes: number;
  roadTravelMinutes: number;
  extraBufferMinutes: number;
  totalMinutesBefore: number;
}

function terminalBufferFor(mode: TravelMode, flightScope?: FlightScope): number {
  if (mode === 'Flight') return DEFAULT_TERMINAL_BUFFER_MINUTES.Flight[flightScope ?? 'Domestic'];
  return DEFAULT_TERMINAL_BUFFER_MINUTES[mode];
}

/**
 * Suggests when a guest should leave the hotel to make a departure on time —
 * this is a static heuristic (terminal buffer + road travel + extra buffer),
 * not a live-traffic estimate. The user can always override the result.
 */
export function computeRecommendedDeparture(
  departureDate: string,
  departureTime: string,
  travelMode: TravelMode,
  options: RecommendedDepartureOptions = {},
): RecommendedDeparture | null {
  const parsed = parseISO(`${departureDate}T${departureTime}`);
  if (Number.isNaN(parsed.getTime())) return null;

  const terminalBufferMinutes = terminalBufferFor(travelMode, options.flightScope);
  const roadTravelMinutes = options.roadTravelMinutes ?? DEFAULT_ROAD_TRAVEL_MINUTES;
  const extraBufferMinutes = options.extraBufferMinutes ?? DEFAULT_EXTRA_BUFFER_MINUTES;
  const totalMinutesBefore = terminalBufferMinutes + roadTravelMinutes + extraBufferMinutes;

  const dateTime = subMinutes(parsed, totalMinutesBefore);

  return {
    dateTime,
    date: format(dateTime, 'yyyy-MM-dd'),
    time: format(dateTime, 'HH:mm'),
    terminalBufferMinutes,
    roadTravelMinutes,
    extraBufferMinutes,
    totalMinutesBefore,
  };
}
