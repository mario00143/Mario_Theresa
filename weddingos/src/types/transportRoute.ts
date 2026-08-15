import type { EventScope } from './task';

export const ROUTE_TYPES = [
  'Airport Pickup',
  'Railway Pickup',
  'Bus Terminal Pickup',
  'Hotel Transfer',
  'Church Shuttle',
  'Reception Shuttle',
  'Airport Drop',
  'Railway Drop',
  'Family Transport',
  'Vendor Transport',
  'Emergency',
  'Other',
] as const;
export type RouteType = (typeof ROUTE_TYPES)[number];

export const ROUTE_STATUSES = ['Planned', 'Confirmed', 'Dispatched', 'In Progress', 'Completed', 'Cancelled'] as const;
export type RouteStatus = (typeof ROUTE_STATUSES)[number];

export interface TransportRoute {
  id: string;
  name: string;
  event: EventScope;
  routeType: RouteType;
  origin: string;
  destination: string;
  plannedDepartureDate?: string;
  plannedDepartureTime?: string;
  plannedArrivalTime?: string;
  vehicleId?: string;
  driverId?: string;
  status: RouteStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
