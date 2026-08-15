/**
 * Fictional demo data only, built from the Phase 2 seeded guests/households.
 * No real bookings, ticket numbers, or identity documents are used.
 *
 * Deliberately includes edge cases called out in the Phase 3 spec: a guest
 * requiring accommodation with no room, an arrival needing pickup with no
 * vehicle, a route missing a driver, a route missing both vehicle and
 * driver, a near-capacity vehicle, a room capacity breach caused by the
 * room's capacity being reduced after assignment, an accessible guest
 * correctly and incorrectly roomed, a family travelling together, a family
 * split across hotels, a child cot request, an extra bed request, an
 * international arrival, an early-morning arrival, a late-night departure,
 * and an unconfirmed booking with no return leg.
 */
import type {
  Driver,
  Guest,
  Hotel,
  Household,
  Room,
  RoomAssignment,
  RoomType,
  TransportAssignment,
  TransportRoute,
  TravelSegment,
  Vehicle,
} from '@/types';
import { generateId } from '@/lib/id';

export interface SeedLogisticsResult {
  travelSegments: TravelSegment[];
  hotels: Hotel[];
  roomTypes: RoomType[];
  rooms: Room[];
  roomAssignments: RoomAssignment[];
  vehicles: Vehicle[];
  drivers: Driver[];
  transportRoutes: TransportRoute[];
  transportAssignments: TransportAssignment[];
}

const SEED_CREATED_AT = '2026-07-15T09:00:00.000Z';

function mustFind(guests: Guest[], fullName: string): Guest {
  const guest = guests.find((g) => g.fullName === fullName);
  if (!guest) throw new Error(`Seed logistics: guest "${fullName}" not found`);
  return guest;
}

type SegmentDraft = Pick<
  TravelSegment,
  'event' | 'direction' | 'travelMode' | 'origin' | 'destination' | 'bookingStatus'
> &
  Partial<TravelSegment>;

function seg(guest: Guest, draft: SegmentDraft): TravelSegment {
  return {
    id: generateId('travel'),
    guestId: guest.id,
    householdId: guest.householdId,
    ticketConfirmed: false,
    pickupRequired: false,
    dropRequired: false,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_CREATED_AT,
    ...draft,
  };
}

export function buildSeedLogistics(_households: Household[], guests: Guest[]): SeedLogisticsResult {
  // ---------------------------------------------------------------------
  // Guests referenced by name across travel, accommodation, and transport.
  // ---------------------------------------------------------------------
  const sajiKurian = mustFind(guests, 'Saji Kurian');
  const elsySaji = mustFind(guests, 'Elsy Saji');
  const thomasKurian = mustFind(guests, 'Thomas Kurian');
  const renjithPanicker = mustFind(guests, 'Renjith Panicker');
  const tomyZachariah = mustFind(guests, 'Tomy Zachariah');
  const rosammaTomy = mustFind(guests, 'Rosamma Tomy');
  const jerryTomy = mustFind(guests, 'Jerry Tomy');
  const beenaJerry = mustFind(guests, 'Beena Jerry');
  const shibuIdiculla = mustFind(guests, 'Shibu Idiculla');
  const neenuShibu = mustFind(guests, 'Neenu Shibu');
  const royJacob = mustFind(guests, 'Roy Jacob');
  const sujaRoy = mustFind(guests, 'Suja Roy');
  const alanRoy = mustFind(guests, 'Alan Roy');
  const georgeAbraham = mustFind(guests, 'George Abraham');
  const susanGeorge = mustFind(guests, 'Susan George');
  const tiaGeorge = mustFind(guests, 'Tia George');
  const leoGeorge = mustFind(guests, 'Leo George');
  const bobbyChandy = mustFind(guests, 'Bobby Chandy');
  const rejinEapen = mustFind(guests, 'Rejin Eapen');
  const ajitMani = mustFind(guests, 'Ajit Mani');
  const melvinRodrigues = mustFind(guests, 'Melvin Rodrigues');
  const carolMelvin = mustFind(guests, 'Carol Melvin');

  // ---------------------------------------------------------------------
  // Travel segments (43 total: arrivals + departures across Engagement in
  // Goa and Wedding in Hyderabad, using free-text custom locations
  // throughout — never hard-coded to a single airport).
  // ---------------------------------------------------------------------

  const sajiArrival = seg(sajiKurian, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'Kochi', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'IndiGo', serviceNumber: '6E-2201', bookingReference: 'KUR-88410', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-28', arrivalTime: '14:10', arrivalTerminal: 'T1', pickupRequired: true, dropRequired: true,
  });
  const sajiDeparture = seg(sajiKurian, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'Kochi',
    carrier: 'IndiGo', serviceNumber: '6E-2208', bookingReference: 'KUR-88411', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-01-31', departureTime: '09:30', departureTerminal: 'T1', pickupRequired: true, dropRequired: true,
  });
  const elsyArrival = seg(elsySaji, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'Kochi', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'IndiGo', serviceNumber: '6E-2201', bookingReference: 'KUR-88410', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-28', arrivalTime: '14:10', arrivalTerminal: 'T1', pickupRequired: true, dropRequired: true,
  });
  const elsyDeparture = seg(elsySaji, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'Kochi',
    carrier: 'IndiGo', serviceNumber: '6E-2208', bookingReference: 'KUR-88411', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-01-31', departureTime: '09:30', departureTerminal: 'T1', pickupRequired: true, dropRequired: true,
  });

  const thomasKurianArrival = seg(thomasKurian, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Train', origin: 'Kochi', destination: 'Kacheguda Railway Station',
    carrier: 'Sabari Express', serviceNumber: '16649', bookingStatus: 'Confirmed', ticketConfirmed: true,
    // Deliberate data-quality demo: Confirmed with no booking reference on file.
    arrivalDate: '2027-01-27', arrivalTime: '06:20', pickupRequired: true, dropRequired: true,
  });
  const thomasKurianDeparture = seg(thomasKurian, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Train', origin: 'Kacheguda Railway Station', destination: 'Kochi',
    carrier: 'Sabari Express', serviceNumber: '16650', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-01-31', departureTime: '22:00', pickupRequired: true, dropRequired: true,
  });

  const renjithArrival = seg(renjithPanicker, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Car', origin: 'Bengaluru', destination: 'Own residence - self drive',
    bookingStatus: 'Not Required', arrivalDate: '2027-01-29', arrivalTime: '18:00', pickupRequired: false, dropRequired: false,
    notes: 'Driving own car from Bengaluru, no pickup needed.',
  });
  const renjithDeparture = seg(renjithPanicker, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Car', origin: 'Hyderabad', destination: 'Bengaluru',
    bookingStatus: 'Not Required', departureDate: '2027-02-01', departureTime: '08:00', pickupRequired: false, dropRequired: false,
  });

  const tomyEngagementArrival = seg(tomyZachariah, {
    event: 'Engagement', direction: 'Arrival', travelMode: 'Flight', origin: 'Kottayam', destination: 'Goa (Dabolim) Airport',
    carrier: 'Air India', serviceNumber: 'AI-2483', bookingReference: 'ZAC-77021', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-10', arrivalTime: '16:00', pickupRequired: true, dropRequired: true,
    specialAssistance: 'Wheelchair assistance requested at airport.',
  });
  const tomyEngagementDeparture = seg(tomyZachariah, {
    event: 'Engagement', direction: 'Departure', travelMode: 'Flight', origin: 'Goa (Dabolim) Airport', destination: 'Kottayam',
    carrier: 'Air India', serviceNumber: 'AI-2484', bookingReference: 'ZAC-77022', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-01-12', departureTime: '11:00', pickupRequired: true, dropRequired: true,
  });
  const tomyWeddingArrival = seg(tomyZachariah, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'Kottayam', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'Air India', serviceNumber: 'AI-566', bookingReference: 'ZAC-77030', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-28', arrivalTime: '11:00', pickupRequired: true, dropRequired: true,
    specialAssistance: 'Wheelchair assistance requested at airport.',
  });
  const tomyWeddingDeparture = seg(tomyZachariah, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'Kottayam',
    carrier: 'Air India', serviceNumber: 'AI-567', bookingReference: 'ZAC-77031', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-01-31', departureTime: '15:20', pickupRequired: true, dropRequired: true,
  });

  const rosammaEngagementArrival = seg(rosammaTomy, {
    event: 'Engagement', direction: 'Arrival', travelMode: 'Flight', origin: 'Kottayam', destination: 'Goa (Dabolim) Airport',
    carrier: 'Air India', serviceNumber: 'AI-2483', bookingReference: 'ZAC-77021', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-10', arrivalTime: '16:00', pickupRequired: true, dropRequired: true,
  });
  const rosammaEngagementDeparture = seg(rosammaTomy, {
    event: 'Engagement', direction: 'Departure', travelMode: 'Flight', origin: 'Goa (Dabolim) Airport', destination: 'Kottayam',
    carrier: 'Air India', serviceNumber: 'AI-2484', bookingReference: 'ZAC-77022', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-01-12', departureTime: '11:00', pickupRequired: true, dropRequired: true,
  });
  const rosammaWeddingArrival = seg(rosammaTomy, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'Kottayam', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'Air India', serviceNumber: 'AI-566', bookingReference: 'ZAC-77030', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-28', arrivalTime: '11:00', pickupRequired: true, dropRequired: true,
  });
  const rosammaWeddingDeparture = seg(rosammaTomy, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'Kottayam',
    carrier: 'Air India', serviceNumber: 'AI-567', bookingReference: 'ZAC-77031', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-01-31', departureTime: '15:20', pickupRequired: true, dropRequired: true,
  });

  const jerryArrival = seg(jerryTomy, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'Kottayam', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'Air India', serviceNumber: 'AI-566', bookingReference: 'ZAC-77032', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-28', arrivalTime: '11:00', pickupRequired: true, dropRequired: true,
  });
  const jerryDeparture = seg(jerryTomy, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'Kottayam',
    carrier: 'Air India', serviceNumber: 'AI-567', bookingReference: 'ZAC-77033', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-01-31', departureTime: '15:20', pickupRequired: true, dropRequired: true,
  });

  const shibuArrival = seg(shibuIdiculla, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'Chennai', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'IndiGo', serviceNumber: '6E-5541', bookingReference: 'IDI-33012', bookingStatus: 'Confirmed', ticketConfirmed: true,
    // Deliberate data-quality demo: pickup required, but no transport assignment is ever created for this segment.
    arrivalDate: '2027-01-28', arrivalTime: '20:45', pickupRequired: true, dropRequired: true,
  });
  const shibuDeparture = seg(shibuIdiculla, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'Chennai',
    carrier: 'IndiGo', serviceNumber: '6E-5548', bookingReference: 'IDI-33013', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-02-01', departureTime: '05:10', pickupRequired: true, dropRequired: true,
    notes: 'Early-morning departure — hotel checkout and drop must be scheduled well before 05:10.',
  });
  const neenuArrival = seg(neenuShibu, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'Chennai', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'IndiGo', serviceNumber: '6E-5541', bookingReference: 'IDI-33012', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-28', arrivalTime: '20:45', pickupRequired: true, dropRequired: true,
  });
  const neenuDeparture = seg(neenuShibu, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'Chennai',
    carrier: 'IndiGo', serviceNumber: '6E-5548', bookingReference: 'IDI-33013', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-02-01', departureTime: '05:10', pickupRequired: true, dropRequired: true,
  });

  const royArrival = seg(royJacob, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'Thiruvananthapuram', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'Vistara', serviceNumber: 'UK-865', bookingReference: 'JAC-20981', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-29', arrivalTime: '09:15', pickupRequired: true, dropRequired: true,
  });
  const royDeparture = seg(royJacob, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'Thiruvananthapuram',
    carrier: 'Vistara', serviceNumber: 'UK-866', bookingReference: 'JAC-20982', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-01-31', departureTime: '19:40', pickupRequired: true, dropRequired: true,
  });
  const sujaArrival = seg(sujaRoy, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'Thiruvananthapuram', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'Vistara', serviceNumber: 'UK-865', bookingReference: 'JAC-20981', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-29', arrivalTime: '09:15', pickupRequired: true, dropRequired: true,
  });
  const sujaDeparture = seg(sujaRoy, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'Thiruvananthapuram',
    carrier: 'Vistara', serviceNumber: 'UK-866', bookingReference: 'JAC-20982', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-01-31', departureTime: '19:40', pickupRequired: true, dropRequired: true,
  });

  const alanArrival = seg(alanRoy, {
    // Deliberate data-quality demo: unconfirmed booking, no return leg on file, and a family split from Roy/Suja.
    event: 'Wedding', direction: 'Arrival', travelMode: 'Train', origin: 'Thiruvananthapuram', destination: 'Hyderabad Deccan (Nampally)',
    carrier: 'Kerala Express', serviceNumber: '12626', bookingStatus: 'Planned', ticketConfirmed: false,
    arrivalDate: '2027-01-29', arrivalTime: '07:00', pickupRequired: true, dropRequired: true,
    notes: 'Travelling separately from the rest of the family; return travel not yet booked.',
  });

  const georgeArrival = seg(georgeAbraham, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'Dubai', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'Emirates', serviceNumber: 'EK-524', bookingReference: 'ABR-55210', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-27', arrivalTime: '23:55', arrivalTerminal: 'T1 International', pickupRequired: true, dropRequired: true,
    luggageNotes: '4 large suitcases plus a stroller.',
  });
  const georgeDeparture = seg(georgeAbraham, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'Dubai',
    carrier: 'Emirates', serviceNumber: 'EK-525', bookingReference: 'ABR-55211', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-02-01', departureTime: '21:30', departureTerminal: 'T1 International', pickupRequired: true, dropRequired: true,
    notes: 'Late-night departure — plan the hotel drop-off well ahead of check-in closing time.',
  });
  const susanArrival = seg(susanGeorge, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'Dubai', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'Emirates', serviceNumber: 'EK-524', bookingReference: 'ABR-55210', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-27', arrivalTime: '23:55', pickupRequired: true, dropRequired: true,
  });
  const susanDeparture = seg(susanGeorge, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'Dubai',
    carrier: 'Emirates', serviceNumber: 'EK-525', bookingReference: 'ABR-55211', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-02-01', departureTime: '21:30', pickupRequired: true, dropRequired: true,
  });
  const tiaArrival = seg(tiaGeorge, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'Dubai', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'Emirates', serviceNumber: 'EK-524', bookingReference: 'ABR-55210', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-27', arrivalTime: '23:55', pickupRequired: true, dropRequired: true,
  });
  const tiaDeparture = seg(tiaGeorge, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'Dubai',
    carrier: 'Emirates', serviceNumber: 'EK-525', bookingReference: 'ABR-55211', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-02-01', departureTime: '21:30', pickupRequired: true, dropRequired: true,
  });
  const leoArrival = seg(leoGeorge, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'Dubai', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'Emirates', serviceNumber: 'EK-524', bookingReference: 'ABR-55210', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-27', arrivalTime: '23:55', pickupRequired: true, dropRequired: true,
    specialAssistance: 'Infant travelling — bassinet requested on board.',
  });
  const leoDeparture = seg(leoGeorge, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'Dubai',
    carrier: 'Emirates', serviceNumber: 'EK-525', bookingReference: 'ABR-55211', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-02-01', departureTime: '21:30', pickupRequired: true, dropRequired: true,
  });

  const bobbyArrival = seg(bobbyChandy, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Bus', origin: 'Kochi', destination: 'Hyderabad MGBS Bus Terminal',
    carrier: 'Kaveri Travels', serviceNumber: 'KA-BUS-118', bookingReference: 'CHA-11029', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-29', arrivalTime: '05:30', pickupRequired: true, dropRequired: true,
    notes: 'Early-morning bus arrival.',
  });
  const bobbyDeparture = seg(bobbyChandy, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Bus', origin: 'Hyderabad MGBS Bus Terminal', destination: 'Kochi',
    carrier: 'Kaveri Travels', serviceNumber: 'KA-BUS-119', bookingReference: 'CHA-11030', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-01-31', departureTime: '21:00', pickupRequired: true, dropRequired: true,
  });

  const rejinArrival = seg(rejinEapen, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'Chennai', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'SpiceJet', serviceNumber: 'SG-8112', bookingReference: 'EAP-67210', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-29', arrivalTime: '10:20', pickupRequired: true, dropRequired: true,
  });
  const rejinDeparture = seg(rejinEapen, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'Chennai',
    carrier: 'SpiceJet', serviceNumber: 'SG-8117', bookingReference: 'EAP-67211', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-01-31', departureTime: '18:00', pickupRequired: true, dropRequired: true,
  });

  const ajitArrival = seg(ajitMani, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'London', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'British Airways', serviceNumber: 'BA-138', bookingReference: 'MAN-90112', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-26', arrivalTime: '04:20', arrivalTerminal: 'T1 International', pickupRequired: true, dropRequired: true,
    notes: 'Deliberate demo: accommodation is required but has not yet been assigned to a room.',
  });
  const ajitDeparture = seg(ajitMani, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'London',
    carrier: 'British Airways', serviceNumber: 'BA-139', bookingReference: 'MAN-90113', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-02-01', departureTime: '23:10', departureTerminal: 'T1 International', pickupRequired: true, dropRequired: true,
  });

  const melvinArrival = seg(melvinRodrigues, {
    event: 'Wedding', direction: 'Arrival', travelMode: 'Flight', origin: 'Toronto', destination: 'RGIA (Hyderabad Airport)',
    carrier: 'Lufthansa', serviceNumber: 'LH-761', bookingReference: 'ROD-40218', bookingStatus: 'Confirmed', ticketConfirmed: true,
    arrivalDate: '2027-01-27', arrivalTime: '13:40', arrivalTerminal: 'T1 International', pickupRequired: true, dropRequired: true,
  });
  const melvinDeparture = seg(melvinRodrigues, {
    event: 'Wedding', direction: 'Departure', travelMode: 'Flight', origin: 'RGIA (Hyderabad Airport)', destination: 'Toronto',
    carrier: 'Lufthansa', serviceNumber: 'LH-762', bookingReference: 'ROD-40219', bookingStatus: 'Confirmed', ticketConfirmed: true,
    departureDate: '2027-01-31', departureTime: '20:15', pickupRequired: true, dropRequired: true,
  });

  const travelSegments: TravelSegment[] = [
    sajiArrival, sajiDeparture, elsyArrival, elsyDeparture,
    thomasKurianArrival, thomasKurianDeparture,
    renjithArrival, renjithDeparture,
    tomyEngagementArrival, tomyEngagementDeparture, tomyWeddingArrival, tomyWeddingDeparture,
    rosammaEngagementArrival, rosammaEngagementDeparture, rosammaWeddingArrival, rosammaWeddingDeparture,
    jerryArrival, jerryDeparture,
    shibuArrival, shibuDeparture, neenuArrival, neenuDeparture,
    royArrival, royDeparture, sujaArrival, sujaDeparture,
    alanArrival,
    georgeArrival, georgeDeparture, susanArrival, susanDeparture, tiaArrival, tiaDeparture, leoArrival, leoDeparture,
    bobbyArrival, bobbyDeparture,
    rejinArrival, rejinDeparture,
    ajitArrival, ajitDeparture,
    melvinArrival, melvinDeparture,
  ];

  // ---------------------------------------------------------------------
  // Hotels — two in Hyderabad (Wedding) and one in Goa (Engagement), to
  // demonstrate the app is never hard-coded to a single city or venue.
  // ---------------------------------------------------------------------
  const hotelMarigold: Hotel = {
    id: generateId('hotel'), name: 'Marigold Grand Hyderabad', address: 'Road No. 12, Banjara Hills', area: 'Banjara Hills', city: 'Hyderabad',
    primaryContact: 'Front Office Manager', phone: '+91 40 4011 2201', email: 'reservations@marigoldgrand.example.com',
    checkInTime: '14:00', checkOutTime: '11:00', breakfastIncluded: true, breakfastStartTime: '07:00', breakfastEndTime: '10:30',
    earlyCheckInPolicy: 'Subject to availability, request in advance.', lateCheckoutPolicy: 'Until 13:00 on request, no charge for wedding block.',
    parkingAvailable: true, busAccess: true, accessibleRoomsAvailable: true,
    negotiatedRateNotes: 'Wedding block rate held until 15 Dec 2026.', groupBookingReference: 'MGH-WED-0130', bookingOwner: 'Groom Father',
    createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT,
  };
  const hotelGreenMeadows: Hotel = {
    id: generateId('hotel'), name: 'Green Meadows Residency', address: 'Financial District Road, Gachibowli', area: 'Gachibowli', city: 'Hyderabad',
    primaryContact: 'Reservations Desk', phone: '+91 40 4522 3390', checkInTime: '13:00', checkOutTime: '11:00',
    breakfastIncluded: true, breakfastStartTime: '07:30', breakfastEndTime: '10:00',
    parkingAvailable: true, busAccess: false, accessibleRoomsAvailable: false,
    notes: 'Smaller boutique property; no coach access, only cars and small vans can approach the entrance.',
    bookingOwner: 'Guest List Lead',
    createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT,
  };
  const hotelSunsetBay: Hotel = {
    id: generateId('hotel'), name: 'Sunset Bay Resort', address: 'Fort Aguada Road, Candolim', area: 'Candolim', city: 'Goa',
    primaryContact: 'Duty Manager', phone: '+91 832 400 5510', checkInTime: '14:00', checkOutTime: '12:00',
    breakfastIncluded: true, parkingAvailable: true, busAccess: false, accessibleRoomsAvailable: false,
    notes: 'Used for the Engagement (Goa) — groom-side accommodation only; the bride\'s side manages their own Engagement stay separately.',
    bookingOwner: 'Groom Father',
    createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT,
  };
  const hotels: Hotel[] = [hotelMarigold, hotelGreenMeadows, hotelSunsetBay];

  // ---------------------------------------------------------------------
  // Room types (7 total).
  // ---------------------------------------------------------------------
  const rtDeluxeKing: RoomType = { id: generateId('roomtype'), hotelId: hotelMarigold.id, name: 'Deluxe King', capacity: 2, standardOccupancy: 2, extraBedAllowed: true, childCotAllowed: true, accessible: false };
  const rtFamilySuite: RoomType = { id: generateId('roomtype'), hotelId: hotelMarigold.id, name: 'Family Suite', capacity: 4, standardOccupancy: 3, extraBedAllowed: true, childCotAllowed: true, accessible: false };
  const rtAccessibleTwin: RoomType = { id: generateId('roomtype'), hotelId: hotelMarigold.id, name: 'Accessible Twin', capacity: 2, standardOccupancy: 2, extraBedAllowed: false, childCotAllowed: false, accessible: true, notes: 'Roll-in shower, grab bars, ground-floor access.' };
  const rtStandardTwin: RoomType = { id: generateId('roomtype'), hotelId: hotelGreenMeadows.id, name: 'Standard Twin', capacity: 2, standardOccupancy: 2, extraBedAllowed: true, childCotAllowed: true, accessible: false };
  const rtExecutive: RoomType = { id: generateId('roomtype'), hotelId: hotelGreenMeadows.id, name: 'Executive Room', capacity: 2, standardOccupancy: 1, extraBedAllowed: true, childCotAllowed: false, accessible: false };
  const rtSeaViewDouble: RoomType = { id: generateId('roomtype'), hotelId: hotelSunsetBay.id, name: 'Sea View Double', capacity: 2, standardOccupancy: 2, extraBedAllowed: true, childCotAllowed: true, accessible: false };
  const rtGardenSuite: RoomType = { id: generateId('roomtype'), hotelId: hotelSunsetBay.id, name: 'Garden Suite', capacity: 3, standardOccupancy: 2, extraBedAllowed: true, childCotAllowed: true, accessible: false };
  const roomTypes: RoomType[] = [rtDeluxeKing, rtFamilySuite, rtAccessibleTwin, rtStandardTwin, rtExecutive, rtSeaViewDouble, rtGardenSuite];

  // ---------------------------------------------------------------------
  // Rooms (30 total).
  // ---------------------------------------------------------------------
  function buildRooms(hotelId: string, roomTypeId: string, numbers: string[], floor: string): Room[] {
    return numbers.map((roomNumber) => ({
      id: generateId('room'), hotelId, roomTypeId, roomNumber, floor, status: 'Available' as const,
    }));
  }

  const marigoldDeluxeRooms = buildRooms(hotelMarigold.id, rtDeluxeKing.id, ['101', '102', '103', '104', '105', '106', '107', '108'], '1');
  marigoldDeluxeRooms[7].status = 'Out of Service';
  marigoldDeluxeRooms[7].notes = 'Plumbing repair scheduled — out of service until further notice.';
  const marigoldSuiteRooms = buildRooms(hotelMarigold.id, rtFamilySuite.id, ['201', '202', '203', '204'], '2');
  const marigoldAccessibleRooms = buildRooms(hotelMarigold.id, rtAccessibleTwin.id, ['301', '302'], '3 (ground-floor accessible wing)');

  const greenMeadowsTwinRooms = buildRooms(hotelGreenMeadows.id, rtStandardTwin.id, ['101', '102', '103', '104', '105', '106'], '1');
  const greenMeadowsExecRooms = buildRooms(hotelGreenMeadows.id, rtExecutive.id, ['201', '202', '203', '204'], '2');

  const sunsetSeaViewRooms = buildRooms(hotelSunsetBay.id, rtSeaViewDouble.id, ['101', '102', '103', '104'], '1');
  const sunsetGardenRooms = buildRooms(hotelSunsetBay.id, rtGardenSuite.id, ['201', '202'], '2');

  const rooms: Room[] = [
    ...marigoldDeluxeRooms, ...marigoldSuiteRooms, ...marigoldAccessibleRooms,
    ...greenMeadowsTwinRooms, ...greenMeadowsExecRooms,
    ...sunsetSeaViewRooms, ...sunsetGardenRooms,
  ];

  // Deliberate data-quality demo: this room's capacity was reduced (by the
  // planner, after two guests were already assigned) below its current
  // occupant count — this is the one case where a breach can legitimately
  // appear, and it should surface in the Logistics Data Issues list.
  const roomJerryBeena = marigoldDeluxeRooms[3]; // 104
  roomJerryBeena.capacityOverride = 1;
  roomJerryBeena.notes = 'Capacity reduced to 1 after a maintenance issue with the second bed — currently over-assigned.';

  // ---------------------------------------------------------------------
  // Room assignments (22 total).
  // ---------------------------------------------------------------------
  function assignment(guest: Guest, room: Room, draft: Partial<RoomAssignment> & Pick<RoomAssignment, 'checkInDate' | 'checkOutDate' | 'assignmentStatus'>): RoomAssignment {
    return {
      id: generateId('roomassign'), roomId: room.id, guestId: guest.id, householdId: guest.householdId,
      primaryOccupant: false, extraBedRequired: false, childCotRequired: false, accessibilityRequired: false,
      createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT,
      ...draft,
    };
  }

  const roomAssignments: RoomAssignment[] = [
    assignment(sajiKurian, marigoldDeluxeRooms[0], { checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed', primaryOccupant: true, confirmationNumber: 'MGH-CNF-1001' }),
    assignment(elsySaji, marigoldDeluxeRooms[0], { checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed', confirmationNumber: 'MGH-CNF-1001' }),
    assignment(thomasKurian, marigoldDeluxeRooms[1], { checkInDate: '2027-01-27', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed', primaryOccupant: true, confirmationNumber: 'MGH-CNF-1002' }),
    assignment(royJacob, marigoldDeluxeRooms[2], { checkInDate: '2027-01-29', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed', primaryOccupant: true, confirmationNumber: 'MGH-CNF-1003' }),
    assignment(sujaRoy, marigoldDeluxeRooms[2], { checkInDate: '2027-01-29', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed', confirmationNumber: 'MGH-CNF-1003' }),
    // Family split: Alan books a different hotel entirely from Roy & Suja.
    assignment(alanRoy, greenMeadowsTwinRooms[0], { checkInDate: '2027-01-29', checkOutDate: '2027-01-31', assignmentStatus: 'Planned', primaryOccupant: true, notes: 'Booked separately from the rest of the Jacob family.' }),
    // Deliberate over-capacity demo (see roomJerryBeena.capacityOverride above).
    assignment(jerryTomy, roomJerryBeena, { checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed', primaryOccupant: true, confirmationNumber: 'MGH-CNF-1004' }),
    assignment(beenaJerry, roomJerryBeena, { checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed', confirmationNumber: 'MGH-CNF-1004' }),
    // Accessible guests correctly roomed in the accessible-twin room type.
    assignment(tomyZachariah, marigoldAccessibleRooms[0], { checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed', primaryOccupant: true, accessibilityRequired: true, confirmationNumber: 'MGH-CNF-1005' }),
    assignment(rosammaTomy, marigoldAccessibleRooms[0], { checkInDate: '2027-01-28', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed', accessibilityRequired: true, confirmationNumber: 'MGH-CNF-1005' }),
    // Same couple's separate Engagement stay in Goa (different date range, no overlap).
    assignment(tomyZachariah, sunsetSeaViewRooms[0], { checkInDate: '2027-01-10', checkOutDate: '2027-01-12', assignmentStatus: 'Confirmed', primaryOccupant: true, confirmationNumber: 'SBR-CNF-2001' }),
    assignment(rosammaTomy, sunsetSeaViewRooms[0], { checkInDate: '2027-01-10', checkOutDate: '2027-01-12', assignmentStatus: 'Confirmed', confirmationNumber: 'SBR-CNF-2001' }),
    // Accessible guest incorrectly roomed — Deluxe King is not an accessible room type.
    assignment(melvinRodrigues, marigoldDeluxeRooms[4], { checkInDate: '2027-01-27', checkOutDate: '2027-02-01', assignmentStatus: 'Confirmed', primaryOccupant: true, accessibilityRequired: true, confirmationNumber: 'MGH-CNF-1006', notes: 'Accessibility requirement on file, but no accessible room was available at the time of booking — needs review.' }),
    assignment(carolMelvin, marigoldDeluxeRooms[4], { checkInDate: '2027-01-27', checkOutDate: '2027-02-01', assignmentStatus: 'Confirmed', confirmationNumber: 'MGH-CNF-1006' }),
    // Family travelling and staying together, exactly at the family suite's capacity.
    assignment(georgeAbraham, marigoldSuiteRooms[0], { checkInDate: '2027-01-27', checkOutDate: '2027-02-01', assignmentStatus: 'Confirmed', primaryOccupant: true, confirmationNumber: 'MGH-CNF-1007' }),
    assignment(susanGeorge, marigoldSuiteRooms[0], { checkInDate: '2027-01-27', checkOutDate: '2027-02-01', assignmentStatus: 'Confirmed', confirmationNumber: 'MGH-CNF-1007' }),
    assignment(tiaGeorge, marigoldSuiteRooms[0], { checkInDate: '2027-01-27', checkOutDate: '2027-02-01', assignmentStatus: 'Confirmed', extraBedRequired: true, confirmationNumber: 'MGH-CNF-1007' }),
    assignment(leoGeorge, marigoldSuiteRooms[0], { checkInDate: '2027-01-27', checkOutDate: '2027-02-01', assignmentStatus: 'Confirmed', childCotRequired: true, confirmationNumber: 'MGH-CNF-1007' }),
    assignment(bobbyChandy, greenMeadowsExecRooms[0], { checkInDate: '2027-01-29', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed', primaryOccupant: true, confirmationNumber: 'GMR-CNF-3001' }),
    assignment(rejinEapen, greenMeadowsExecRooms[1], { checkInDate: '2027-01-29', checkOutDate: '2027-01-31', assignmentStatus: 'Confirmed', primaryOccupant: true, confirmationNumber: 'GMR-CNF-3002' }),
    assignment(shibuIdiculla, greenMeadowsTwinRooms[1], { checkInDate: '2027-01-28', checkOutDate: '2027-02-01', assignmentStatus: 'Confirmed', primaryOccupant: true, confirmationNumber: 'GMR-CNF-3003' }),
    assignment(neenuShibu, greenMeadowsTwinRooms[1], { checkInDate: '2027-01-28', checkOutDate: '2027-02-01', assignmentStatus: 'Confirmed', confirmationNumber: 'GMR-CNF-3003' }),
    // Ajit Mani deliberately has NO room assignment despite accommodationRequired — see Logistics Data Issues / Accommodation Requirement Queue.
  ];

  // ---------------------------------------------------------------------
  // Vehicles (10 total).
  // ---------------------------------------------------------------------
  const vSedan1: Vehicle = { id: generateId('vehicle'), name: 'Swift Dzire - HYD Sedan 1', vehicleType: 'Sedan', registrationNumber: 'TS 09 EA 4471', passengerCapacity: 3, luggageCapacity: 2, airConditioned: true, vendorName: 'City Cabs Hyderabad', status: 'Assigned', backupVehicle: false, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const vInnova1: Vehicle = { id: generateId('vehicle'), name: 'Innova Crysta - HYD 1', vehicleType: 'Innova / MUV', registrationNumber: 'TS 09 FB 5512', passengerCapacity: 6, luggageCapacity: 5, airConditioned: true, vendorName: 'Deccan Travels', status: 'Assigned', backupVehicle: false, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const vInnova2: Vehicle = { id: generateId('vehicle'), name: 'Innova Crysta - HYD 2', vehicleType: 'Innova / MUV', registrationNumber: 'TS 09 FB 5513', passengerCapacity: 6, luggageCapacity: 5, airConditioned: true, vendorName: 'Deccan Travels', status: 'Available', backupVehicle: false, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const vTempo: Vehicle = { id: generateId('vehicle'), name: '12-Seater Tempo Traveller', vehicleType: 'Tempo Traveller', registrationNumber: 'TS 09 GC 7710', passengerCapacity: 12, luggageCapacity: 12, airConditioned: true, vendorName: 'Deccan Travels', status: 'Assigned', backupVehicle: false, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const vMiniBus: Vehicle = { id: generateId('vehicle'), name: '20-Seater Mini Bus', vehicleType: 'Mini Bus', registrationNumber: 'TS 09 HD 8821', passengerCapacity: 20, airConditioned: true, vendorName: 'Deccan Travels', status: 'Assigned', backupVehicle: false, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const vBus: Vehicle = { id: generateId('vehicle'), name: '35-Seater Coach', vehicleType: 'Bus', registrationNumber: 'TS 09 JE 9932', passengerCapacity: 35, airConditioned: true, vendorName: 'Deccan Travels', status: 'Assigned', backupVehicle: false, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const vSedanBackup: Vehicle = { id: generateId('vehicle'), name: 'Swift Dzire - Backup', vehicleType: 'Sedan', registrationNumber: 'TS 09 EA 4472', passengerCapacity: 3, airConditioned: true, vendorName: 'City Cabs Hyderabad', status: 'Available', backupVehicle: true, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const vSuvVip: Vehicle = { id: generateId('vehicle'), name: 'Fortuner - Family VIP', vehicleType: 'SUV', registrationNumber: 'TS 09 KL 1123', passengerCapacity: 6, luggageCapacity: 4, airConditioned: true, vendorName: 'Deccan Travels', status: 'Available', backupVehicle: false, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const vLuxury: Vehicle = { id: generateId('vehicle'), name: 'Mercedes E-Class', vehicleType: 'Luxury Car', registrationNumber: 'GA 01 AB 3345', passengerCapacity: 3, airConditioned: true, vendorName: 'Goa Premier Cars', status: 'Assigned', backupVehicle: false, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const vOutOfService: Vehicle = { id: generateId('vehicle'), name: 'Shared Shuttle Van', vehicleType: 'Other', registrationNumber: 'TS 09 MN 4456', passengerCapacity: 4, airConditioned: false, vendorName: 'Deccan Travels', status: 'Out of Service', backupVehicle: false, notes: 'Engine trouble — sent for repair, not available for the wedding week.', createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const vehicles: Vehicle[] = [vSedan1, vInnova1, vInnova2, vTempo, vMiniBus, vBus, vSedanBackup, vSuvVip, vLuxury, vOutOfService];

  // ---------------------------------------------------------------------
  // Drivers (10 total).
  // ---------------------------------------------------------------------
  const dRamesh: Driver = { id: generateId('driver'), name: 'Ramesh Kumar', phone: '+91 90000 20001', vehicleId: vSedan1.id, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const dSuresh: Driver = { id: generateId('driver'), name: 'Suresh Yadav', phone: '+91 90000 20002', vehicleId: vInnova1.id, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const dMahesh: Driver = { id: generateId('driver'), name: 'Mahesh Reddy', phone: '+91 90000 20003', vehicleId: vInnova2.id, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const dPraveen: Driver = { id: generateId('driver'), name: 'Praveen Naik', phone: '+91 90000 20004', vehicleId: vTempo.id, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const dAshok: Driver = { id: generateId('driver'), name: 'Ashok Rao', phone: '+91 90000 20005', vehicleId: vMiniBus.id, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const dVijay: Driver = { id: generateId('driver'), name: 'Vijay Kumar', phone: '+91 90000 20006', vehicleId: vBus.id, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const dRaviTeja: Driver = { id: generateId('driver'), name: 'Ravi Teja', phone: '+91 90000 20007', notes: 'Available for overflow / relief driving, not yet assigned a vehicle.', createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const dKiran: Driver = { id: generateId('driver'), name: 'Kiran Babu', phone: '+91 90000 20008', vehicleId: vLuxury.id, alternatePhone: '+91 90000 20108', createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const dSrinivas: Driver = { id: generateId('driver'), name: 'Srinivas Goud', phone: '+91 90000 20009', notes: 'Available for overflow / relief driving, not yet assigned a vehicle.', createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const dManoj: Driver = { id: generateId('driver'), name: 'Manoj Verma', phone: '+91 90000 20010', vehicleId: vSedanBackup.id, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  const drivers: Driver[] = [dRamesh, dSuresh, dMahesh, dPraveen, dAshok, dVijay, dRaviTeja, dKiran, dSrinivas, dManoj];

  // ---------------------------------------------------------------------
  // Transport routes (16 total).
  // ---------------------------------------------------------------------
  function route(draft: Partial<TransportRoute> & Pick<TransportRoute, 'name' | 'event' | 'routeType' | 'origin' | 'destination' | 'status'>): TransportRoute {
    return { id: generateId('route'), createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT, ...draft };
  }

  const rKurianJacobPickup = route({ name: 'RGIA Morning Pickup - Kurian & Jacob Group', event: 'Wedding', routeType: 'Airport Pickup', origin: 'RGIA (Hyderabad Airport)', destination: 'Marigold Grand Hyderabad', vehicleId: vInnova1.id, driverId: dSuresh.id, status: 'Confirmed', plannedDepartureDate: '2027-01-29', plannedDepartureTime: '08:30' });
  const rAbrahamPickup = route({ name: 'RGIA Late-Night Pickup - Abraham Family', event: 'Wedding', routeType: 'Airport Pickup', origin: 'RGIA (Hyderabad Airport)', destination: 'Marigold Grand Hyderabad', vehicleId: vTempo.id, driverId: dPraveen.id, status: 'Confirmed', plannedDepartureDate: '2027-01-28', plannedDepartureTime: '00:30' });
  const rThomasKurianPickup = route({ name: 'Kacheguda Pickup - Thomas Kurian', event: 'Wedding', routeType: 'Railway Pickup', origin: 'Kacheguda Railway Station', destination: 'Marigold Grand Hyderabad', vehicleId: vSedan1.id, driverId: dRamesh.id, status: 'Confirmed', plannedDepartureDate: '2027-01-27', plannedDepartureTime: '06:45' });
  const rBobbyPickup = route({ name: 'MGBS Pickup - Bobby Chandy', event: 'Wedding', routeType: 'Bus Terminal Pickup', origin: 'Hyderabad MGBS Bus Terminal', destination: 'Green Meadows Residency', vehicleId: vSedanBackup.id, driverId: dManoj.id, status: 'Confirmed', plannedDepartureDate: '2027-01-29', plannedDepartureTime: '05:50' });
  const rAlanPickup = route({
    // Deliberate data-quality demo: no vehicle and no driver assigned yet.
    name: 'Nampally Pickup - Alan Roy', event: 'Wedding', routeType: 'Railway Pickup', origin: 'Hyderabad Deccan (Nampally)', destination: 'Green Meadows Residency', status: 'Planned', plannedDepartureDate: '2027-01-29', plannedDepartureTime: '07:15',
  });
  const rIdicullaPickup = route({
    // Deliberate data-quality demo: vehicle assigned, but no driver yet.
    name: 'RGIA Pickup - Idiculla Family', event: 'Wedding', routeType: 'Airport Pickup', origin: 'RGIA (Hyderabad Airport)', destination: 'Green Meadows Residency', vehicleId: vInnova2.id, status: 'Planned', plannedDepartureDate: '2027-01-28', plannedDepartureTime: '21:15',
  });
  const rEapenManiPickup = route({ name: 'RGIA Pickup - Eapen & Mani Cluster', event: 'Wedding', routeType: 'Airport Pickup', origin: 'RGIA (Hyderabad Airport)', destination: 'Green Meadows Residency', vehicleId: vSuvVip.id, driverId: dKiran.id, status: 'Confirmed', plannedDepartureDate: '2027-01-29', plannedDepartureTime: '10:45' });
  const rChurchShuttle = route({ name: 'Church Shuttle - Wedding Day', event: 'Wedding', routeType: 'Church Shuttle', origin: 'Marigold Grand Hyderabad', destination: "St. Mary's Church, Hyderabad", vehicleId: vBus.id, driverId: dVijay.id, status: 'Confirmed', plannedDepartureDate: '2027-01-30', plannedDepartureTime: '07:30', plannedArrivalTime: '08:15' });
  const rReceptionShuttle = route({ name: 'Reception Shuttle - Wedding Day', event: 'Wedding', routeType: 'Reception Shuttle', origin: "St. Mary's Church, Hyderabad", destination: 'Grand Celebration Hall, Hyderabad', vehicleId: vMiniBus.id, driverId: dAshok.id, status: 'Confirmed', plannedDepartureDate: '2027-01-30', plannedDepartureTime: '12:30', plannedArrivalTime: '13:00' });
  const rKurianJacobDrop = route({ name: 'RGIA Drop - Kurian & Jacob Departure', event: 'Wedding', routeType: 'Airport Drop', origin: 'Marigold Grand Hyderabad', destination: 'RGIA (Hyderabad Airport)', vehicleId: vInnova1.id, driverId: dSuresh.id, status: 'Confirmed', plannedDepartureDate: '2027-01-31', plannedDepartureTime: '06:30' });
  const rAbrahamDrop = route({ name: 'RGIA Drop - Abraham Family Late Night', event: 'Wedding', routeType: 'Airport Drop', origin: 'Marigold Grand Hyderabad', destination: 'RGIA (Hyderabad Airport)', vehicleId: vTempo.id, driverId: dPraveen.id, status: 'Confirmed', plannedDepartureDate: '2027-02-01', plannedDepartureTime: '18:30' });
  const rThomasKurianDrop = route({ name: 'Railway Drop - Thomas Kurian', event: 'Wedding', routeType: 'Railway Drop', origin: 'Marigold Grand Hyderabad', destination: 'Kacheguda Railway Station', vehicleId: vSedan1.id, driverId: dRamesh.id, status: 'Confirmed', plannedDepartureDate: '2027-01-31', plannedDepartureTime: '21:00' });
  const rGoaPickup = route({ name: 'Goa Airport Pickup - Zachariah Engagement', event: 'Engagement', routeType: 'Airport Pickup', origin: 'Goa (Dabolim) Airport', destination: 'Sunset Bay Resort, Candolim', vehicleId: vLuxury.id, driverId: dKiran.id, status: 'Confirmed', plannedDepartureDate: '2027-01-10', plannedDepartureTime: '16:30' });
  const rGoaDrop = route({ name: 'Goa Departure Drop - Zachariah Engagement', event: 'Engagement', routeType: 'Airport Drop', origin: 'Sunset Bay Resort, Candolim', destination: 'Goa (Dabolim) Airport', vehicleId: vLuxury.id, driverId: dKiran.id, status: 'Confirmed', plannedDepartureDate: '2027-01-12', plannedDepartureTime: '08:30' });
  const rFamilyTransport = route({ name: 'Family Transport - Local Errands', event: 'Wedding', routeType: 'Family Transport', origin: 'Marigold Grand Hyderabad', destination: 'Various local errands', vehicleId: vSedanBackup.id, driverId: dManoj.id, status: 'Confirmed', plannedDepartureDate: '2027-01-29', plannedDepartureTime: '11:00' });
  const rVendorTransport = route({ name: 'Vendor Transport - Décor Team', event: 'Wedding', routeType: 'Vendor Transport', origin: 'Vendor Warehouse, Hyderabad', destination: 'Grand Celebration Hall, Hyderabad', vehicleId: vOutOfService.id, status: 'Cancelled', notes: 'Cancelled after the assigned van went out of service; needs a replacement vehicle before rescheduling.' });

  const transportRoutes: TransportRoute[] = [
    rKurianJacobPickup, rAbrahamPickup, rThomasKurianPickup, rBobbyPickup, rAlanPickup, rIdicullaPickup, rEapenManiPickup,
    rChurchShuttle, rReceptionShuttle,
    rKurianJacobDrop, rAbrahamDrop, rThomasKurianDrop,
    rGoaPickup, rGoaDrop,
    rFamilyTransport, rVendorTransport,
  ];

  // ---------------------------------------------------------------------
  // Transport assignments (38 total).
  // ---------------------------------------------------------------------
  function ta(route: TransportRoute, guest: Guest, travelSegment: TravelSegment | undefined, draft: Partial<TransportAssignment> & Pick<TransportAssignment, 'assignmentStatus'>): TransportAssignment {
    return {
      id: generateId('transportassign'), routeId: route.id, guestId: guest.id, travelSegmentId: travelSegment?.id,
      pickupLocation: route.origin, dropLocation: route.destination, pickupDate: route.plannedDepartureDate, pickupTime: route.plannedDepartureTime,
      seatCount: 1, assistanceRequired: false,
      createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT,
      ...draft,
    };
  }

  const transportAssignments: TransportAssignment[] = [
    // RGIA morning pickup — Kurian & Jacob cluster (4 seats / 6 capacity).
    ta(rKurianJacobPickup, sajiKurian, sajiArrival, { assignmentStatus: 'Confirmed' }),
    ta(rKurianJacobPickup, elsySaji, elsyArrival, { assignmentStatus: 'Confirmed' }),
    ta(rKurianJacobPickup, royJacob, royArrival, { assignmentStatus: 'Confirmed' }),
    ta(rKurianJacobPickup, sujaRoy, sujaArrival, { assignmentStatus: 'Confirmed' }),
    // RGIA late-night pickup — Abraham family (4 seats / 12 capacity).
    ta(rAbrahamPickup, georgeAbraham, georgeArrival, { assignmentStatus: 'Confirmed', luggageCount: 4 }),
    ta(rAbrahamPickup, susanGeorge, susanArrival, { assignmentStatus: 'Confirmed' }),
    ta(rAbrahamPickup, tiaGeorge, tiaArrival, { assignmentStatus: 'Confirmed' }),
    ta(rAbrahamPickup, leoGeorge, leoArrival, { assignmentStatus: 'Confirmed', assistanceRequired: true }),
    // Kacheguda pickup — Thomas Kurian.
    ta(rThomasKurianPickup, thomasKurian, thomasKurianArrival, { assignmentStatus: 'Confirmed' }),
    // MGBS pickup — Bobby Chandy.
    ta(rBobbyPickup, bobbyChandy, bobbyArrival, { assignmentStatus: 'Confirmed' }),
    // Nampally pickup — Alan Roy, planned pending vehicle/driver assignment.
    ta(rAlanPickup, alanRoy, alanArrival, { assignmentStatus: 'Planned' }),
    // Eapen & Mani cluster (2 seats / 6 capacity).
    ta(rEapenManiPickup, rejinEapen, rejinArrival, { assignmentStatus: 'Confirmed' }),
    ta(rEapenManiPickup, ajitMani, ajitArrival, { assignmentStatus: 'Confirmed' }),
    // Wedding-day church shuttle (6 seats).
    ta(rChurchShuttle, sajiKurian, undefined, { assignmentStatus: 'Confirmed' }),
    ta(rChurchShuttle, elsySaji, undefined, { assignmentStatus: 'Confirmed' }),
    ta(rChurchShuttle, royJacob, undefined, { assignmentStatus: 'Confirmed' }),
    ta(rChurchShuttle, sujaRoy, undefined, { assignmentStatus: 'Confirmed' }),
    ta(rChurchShuttle, georgeAbraham, undefined, { assignmentStatus: 'Confirmed' }),
    ta(rChurchShuttle, susanGeorge, undefined, { assignmentStatus: 'Confirmed' }),
    // Wedding-day reception shuttle (5 seats).
    ta(rReceptionShuttle, thomasKurian, undefined, { assignmentStatus: 'Confirmed' }),
    ta(rReceptionShuttle, bobbyChandy, undefined, { assignmentStatus: 'Confirmed' }),
    ta(rReceptionShuttle, rejinEapen, undefined, { assignmentStatus: 'Confirmed' }),
    ta(rReceptionShuttle, ajitMani, undefined, { assignmentStatus: 'Confirmed' }),
    ta(rReceptionShuttle, tiaGeorge, undefined, { assignmentStatus: 'Confirmed' }),
    // RGIA drop — Kurian & Jacob departure (4 seats / 6 capacity).
    ta(rKurianJacobDrop, sajiKurian, sajiDeparture, { assignmentStatus: 'Confirmed' }),
    ta(rKurianJacobDrop, elsySaji, elsyDeparture, { assignmentStatus: 'Confirmed' }),
    ta(rKurianJacobDrop, royJacob, royDeparture, { assignmentStatus: 'Confirmed' }),
    ta(rKurianJacobDrop, sujaRoy, sujaDeparture, { assignmentStatus: 'Confirmed' }),
    // RGIA drop — Abraham family late-night departure (4 seats / 12 capacity).
    ta(rAbrahamDrop, georgeAbraham, georgeDeparture, { assignmentStatus: 'Confirmed', luggageCount: 4 }),
    ta(rAbrahamDrop, susanGeorge, susanDeparture, { assignmentStatus: 'Confirmed' }),
    ta(rAbrahamDrop, tiaGeorge, tiaDeparture, { assignmentStatus: 'Confirmed' }),
    ta(rAbrahamDrop, leoGeorge, leoDeparture, { assignmentStatus: 'Confirmed', assistanceRequired: true }),
    // Railway drop — Thomas Kurian.
    ta(rThomasKurianDrop, thomasKurian, thomasKurianDeparture, { assignmentStatus: 'Confirmed' }),
    // Goa pickup/drop — Zachariah Engagement (near-capacity: 2 seats / 3-seat luxury car).
    ta(rGoaPickup, tomyZachariah, tomyEngagementArrival, { assignmentStatus: 'Confirmed', assistanceRequired: true }),
    ta(rGoaPickup, rosammaTomy, rosammaEngagementArrival, { assignmentStatus: 'Confirmed', assistanceRequired: true }),
    ta(rGoaDrop, tomyZachariah, tomyEngagementDeparture, { assignmentStatus: 'Confirmed', assistanceRequired: true }),
    ta(rGoaDrop, rosammaTomy, rosammaEngagementDeparture, { assignmentStatus: 'Confirmed', assistanceRequired: true }),
    // General family transport, not tied to any specific arrival/departure leg.
    ta(rFamilyTransport, melvinRodrigues, undefined, { assignmentStatus: 'Confirmed', notes: 'Local transport to a family visit, unrelated to arrival/departure.' }),
  ];

  return {
    travelSegments,
    hotels,
    roomTypes,
    rooms,
    roomAssignments,
    vehicles,
    drivers,
    transportRoutes,
    transportAssignments,
  };
}
