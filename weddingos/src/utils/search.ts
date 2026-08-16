import type {
  BudgetItem,
  Contract,
  Decision,
  Driver,
  Guest,
  Hotel,
  Household,
  Payment,
  Room,
  Task,
  TransportRoute,
  TravelSegment,
  Vehicle,
  Vendor,
  VendorContact,
  VendorQuote,
} from '@/types';

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
  vendors: Vendor[];
  vendorQuotes: VendorQuote[];
  contracts: Contract[];
  budgetItems: BudgetItem[];
  payments: Payment[];
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
  vendors: Vendor[],
  vendorContacts: VendorContact[],
  vendorQuotes: VendorQuote[],
  contracts: Contract[],
  budgetItems: BudgetItem[],
  payments: Payment[],
  query: string,
): SearchResults {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      tasks: [], decisions: [], households: [], guests: [], travelSegments: [], hotels: [], rooms: [], vehicles: [], drivers: [], routes: [],
      vendors: [], vendorQuotes: [], contracts: [], budgetItems: [], payments: [],
    };
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

  const vendorContactsByVendorId = new Map<string, VendorContact[]>();
  for (const contact of vendorContacts) {
    const list = vendorContactsByVendorId.get(contact.vendorId) ?? [];
    list.push(contact);
    vendorContactsByVendorId.set(contact.vendorId, list);
  }
  const matchedVendors = vendors.filter((vendor) => {
    const contactFields = (vendorContactsByVendorId.get(vendor.id) ?? []).flatMap((c) => [c.name, c.phone, c.email]);
    return matches([vendor.name, vendor.city, vendor.email, vendor.phone, vendor.bookingOwner, ...contactFields], trimmed);
  });
  const matchedVendorQuotes = vendorQuotes.filter((quote) => matches([quote.quoteReference], trimmed));
  const matchedContracts = contracts.filter((contract) => matches([contract.contractReference], trimmed));
  const matchedBudgetItems = budgetItems.filter((item) => matches([item.itemName], trimmed));
  const matchedPayments = payments.filter((payment) =>
    matches([payment.referenceNumber, payment.invoiceReference, payment.receiptReference], trimmed),
  );

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
    vendors: matchedVendors.slice(0, 20),
    vendorQuotes: matchedVendorQuotes.slice(0, 20),
    contracts: matchedContracts.slice(0, 20),
    budgetItems: matchedBudgetItems.slice(0, 20),
    payments: matchedPayments.slice(0, 20),
  };
}
