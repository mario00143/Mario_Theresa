import type { Decision, Driver, Guest, Hotel, Household, Room, Task, TransportRoute, TravelSegment, Vehicle } from '@/types';

export interface SearchResults {
  tasks: Task[];
  decisions: Decision[];
  households: Household[];
  guests: Guest[];
  travelSegments: TravelSegment[];
  hotels: Hotel[];
  rooms: Room[];
  vehicles: Vehicle[];
  drivers: Driver[];
  routes: TransportRoute[];
}

function matches(haystack: (string | undefined)[], query: string): boolean {
  const q = query.toLowerCase();
  return haystack.some((value) => value?.toLowerCase().includes(q));
}

export function searchAll(
  tasks: Task[],
  decisions: Decision[],
  households: Household[],
  guests: Guest[],
  travelSegments: TravelSegment[],
  hotels: Hotel[],
  rooms: Room[],
  vehicles: Vehicle[],
  drivers: Driver[],
  routes: TransportRoute[],
  query: string,
): SearchResults {
  const trimmed = query.trim();
  if (!trimmed) {
    return { tasks: [], decisions: [], households: [], guests: [], travelSegments: [], hotels: [], rooms: [], vehicles: [], drivers: [], routes: [] };
  }

  const matchedTasks = tasks.filter((task) =>
    matches([task.title, task.description, task.workstream, task.owner, ...task.tags], trimmed),
  );
  const matchedDecisions = decisions.filter((decision) => matches([decision.title, decision.description], trimmed));
  const matchedHouseholds = households.filter((household) =>
    matches([household.householdName, household.primaryContactName, household.primaryPhone, household.email, household.city], trimmed),
  );
  const matchedGuests = guests.filter((guest) => matches([guest.fullName, guest.phone, guest.email], trimmed));

  const matchedTravel = travelSegments.filter((segment) =>
    matches([segment.serviceNumber, segment.bookingReference, segment.carrier, segment.origin, segment.destination], trimmed),
  );
  const matchedHotels = hotels.filter((hotel) => matches([hotel.name, hotel.area, hotel.city, hotel.groupBookingReference], trimmed));
  const matchedRooms = rooms.filter((room) => matches([room.roomNumber], trimmed));
  const matchedVehicles = vehicles.filter((vehicle) => matches([vehicle.name, vehicle.registrationNumber, vehicle.vendorName], trimmed));
  const matchedDrivers = drivers.filter((driver) => matches([driver.name, driver.phone], trimmed));
  const matchedRoutes = routes.filter((route) => matches([route.name, route.origin, route.destination], trimmed));

  return {
    tasks: matchedTasks.slice(0, 20),
    decisions: matchedDecisions.slice(0, 20),
    households: matchedHouseholds.slice(0, 20),
    guests: matchedGuests.slice(0, 20),
    travelSegments: matchedTravel.slice(0, 20),
    hotels: matchedHotels.slice(0, 20),
    rooms: matchedRooms.slice(0, 20),
    vehicles: matchedVehicles.slice(0, 20),
    drivers: matchedDrivers.slice(0, 20),
    routes: matchedRoutes.slice(0, 20),
  };
}
