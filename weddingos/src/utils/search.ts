import type {
  AttireProfile,
  BudgetItem,
  CeremonyItem,
  CeremonyParticipant,
  ChurchRequirement,
  Contract,
  Decision,
  DecorPlan,
  Driver,
  GiftPlan,
  Guest,
  Hotel,
  Household,
  MusicCue,
  Payment,
  PhotoGroup,
  Room,
  Task,
  TransportRoute,
  TravelSegment,
  Vehicle,
  Vendor,
  VendorContact,
  VendorQuote,
  WelcomeKit,
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
  churchRequirements: ChurchRequirement[];
  ceremonyParticipants: CeremonyParticipant[];
  ceremonyItems: CeremonyItem[];
  decorPlans: DecorPlan[];
  attireProfiles: AttireProfile[];
  photoGroups: PhotoGroup[];
  musicCues: MusicCue[];
  giftPlans: GiftPlan[];
  welcomeKits: WelcomeKit[];
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
  churchRequirements: ChurchRequirement[],
  ceremonyParticipants: CeremonyParticipant[],
  ceremonyItems: CeremonyItem[],
  decorPlans: DecorPlan[],
  attireProfiles: AttireProfile[],
  photoGroups: PhotoGroup[],
  musicCues: MusicCue[],
  giftPlans: GiftPlan[],
  welcomeKits: WelcomeKit[],
  query: string,
): SearchResults {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      tasks: [], decisions: [], households: [], guests: [], travelSegments: [], hotels: [], rooms: [], vehicles: [], drivers: [], routes: [],
      vendors: [], vendorQuotes: [], contracts: [], budgetItems: [], payments: [],
      churchRequirements: [], ceremonyParticipants: [], ceremonyItems: [], decorPlans: [], attireProfiles: [], photoGroups: [], musicCues: [], giftPlans: [], welcomeKits: [],
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

  const matchedChurchRequirements = churchRequirements.filter((r) => matches([r.title, r.category, r.owner], trimmed));
  const matchedCeremonyParticipants = ceremonyParticipants.filter((p) => matches([p.name, p.role, p.phone], trimmed));
  const matchedCeremonyItems = ceremonyItems.filter((i) => matches([i.name, i.category, i.custodian, i.storageLocation], trimmed));
  const matchedDecorPlans = decorPlans.filter((p) => matches([p.area, p.theme], trimmed));
  const matchedAttireProfiles = attireProfiles.filter((p) => matches([p.personRole, p.outfitType], trimmed));
  const matchedPhotoGroups = photoGroups.filter((g) => matches([g.groupName, g.coordinator], trimmed));
  const matchedMusicCues = musicCues.filter((c) => matches([c.title, c.performer], trimmed));
  const matchedGiftPlans = giftPlans.filter((p) => matches([p.recipientName, p.giftType], trimmed));
  const matchedWelcomeKits = welcomeKits.filter((k) => matches([k.name], trimmed));

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
    churchRequirements: matchedChurchRequirements.slice(0, 20),
    ceremonyParticipants: matchedCeremonyParticipants.slice(0, 20),
    ceremonyItems: matchedCeremonyItems.slice(0, 20),
    decorPlans: matchedDecorPlans.slice(0, 20),
    attireProfiles: matchedAttireProfiles.slice(0, 20),
    photoGroups: matchedPhotoGroups.slice(0, 20),
    musicCues: matchedMusicCues.slice(0, 20),
    giftPlans: matchedGiftPlans.slice(0, 20),
    welcomeKits: matchedWelcomeKits.slice(0, 20),
  };
}
