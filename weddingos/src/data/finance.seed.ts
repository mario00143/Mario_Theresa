/**
 * Fictional demo data only, built from the Phase 2/3 seeded
 * households/guests/hotels/vehicles. No real vendors, prices, or
 * financial details are used.
 *
 * Deliberately includes the edge cases called out in the Phase 4 spec: a
 * quote expiring soon, a selected vendor with no signed contract, an
 * overdue payment, a partially paid milestone (and a separate milestone
 * settled across two partial payments), an over-budget category, an
 * unapproved commitment, an expected refundable deposit, a partially
 * received refund, one fully "Ready" vendor, one "At Risk" vendor, one
 * Completed vendor with a full settlement, a three-way quote comparison,
 * and a large cash payment.
 */
import type {
  BudgetCategory,
  BudgetItem,
  Contract,
  Guest,
  Hotel,
  Household,
  Payment,
  PaymentSchedule,
  Refund,
  Vehicle,
  Vendor,
  VendorContact,
  VendorQuote,
} from '@/types';
import { generateId } from '@/lib/id';
import { computeQuoteTotal } from '@/utils/financeCalc';

export interface SeedFinanceResult {
  vendors: Vendor[];
  vendorContacts: VendorContact[];
  vendorQuotes: VendorQuote[];
  contracts: Contract[];
  budgetCategories: BudgetCategory[];
  budgetItems: BudgetItem[];
  paymentSchedules: PaymentSchedule[];
  payments: Payment[];
  refunds: Refund[];
}

const SEED_CREATED_AT = '2026-07-20T09:00:00.000Z';
const WEDDING_DATE = '2027-01-30';

// ---------------------------------------------------------------------
// Budget categories (exact seed list from spec section 11).
// ---------------------------------------------------------------------
const CATEGORY_DEFS: Array<{ name: string; plannedAmount: number; contingencyAmount: number }> = [
  { name: 'Church', plannedAmount: 80000, contingencyAmount: 10000 },
  { name: 'Venue', plannedAmount: 600000, contingencyAmount: 50000 },
  { name: 'Catering', plannedAmount: 900000, contingencyAmount: 60000 },
  { name: 'Cake', plannedAmount: 45000, contingencyAmount: 5000 },
  { name: 'Décor', plannedAmount: 350000, contingencyAmount: 30000 },
  { name: 'Lighting & Production', plannedAmount: 400000, contingencyAmount: 25000 },
  { name: 'Photography', plannedAmount: 220000, contingencyAmount: 20000 },
  { name: 'Video', plannedAmount: 220000, contingencyAmount: 20000 },
  { name: 'Music & Entertainment', plannedAmount: 210000, contingencyAmount: 15000 },
  { name: 'Attire', plannedAmount: 300000, contingencyAmount: 20000 },
  { name: 'Jewellery & Ceremony Items', plannedAmount: 150000, contingencyAmount: 10000 },
  { name: 'Invitations & Printing', plannedAmount: 60000, contingencyAmount: 5000 },
  { name: 'Travel', plannedAmount: 250000, contingencyAmount: 20000 },
  { name: 'Accommodation', plannedAmount: 550000, contingencyAmount: 30000 },
  { name: 'Local Transport', plannedAmount: 150000, contingencyAmount: 15000 },
  { name: 'Gifts & Favors', plannedAmount: 80000, contingencyAmount: 8000 },
  { name: 'Grooming', plannedAmount: 60000, contingencyAmount: 5000 },
  { name: 'Security & Parking', plannedAmount: 70000, contingencyAmount: 8000 },
  { name: 'Legal & Documentation', plannedAmount: 25000, contingencyAmount: 3000 },
  { name: 'Vendor Meals', plannedAmount: 50000, contingencyAmount: 5000 },
  { name: 'Tips & Gratuities', plannedAmount: 40000, contingencyAmount: 5000 },
  { name: 'Contingency', plannedAmount: 200000, contingencyAmount: 0 },
  { name: 'Post Wedding', plannedAmount: 40000, contingencyAmount: 5000 },
  { name: 'Other', plannedAmount: 30000, contingencyAmount: 5000 },
];

function findHotel(hotels: Hotel[], name: string): Hotel | undefined {
  return hotels.find((h) => h.name === name);
}

function findVehiclesByVendorName(vehicles: Vehicle[], vendorName: string): Vehicle[] {
  return vehicles.filter((v) => v.vendorName === vendorName);
}

export function buildSeedFinance(
  _households: Household[],
  _guests: Guest[],
  hotels: Hotel[],
  vehicles: Vehicle[],
): SeedFinanceResult {
  // ---------------------------------------------------------------------
  // Budget categories.
  // ---------------------------------------------------------------------
  const budgetCategories: BudgetCategory[] = CATEGORY_DEFS.map((def, index) => ({
    id: generateId('budgetcat'),
    name: def.name,
    plannedAmount: def.plannedAmount,
    contingencyAmount: def.contingencyAmount,
    sortOrder: index,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_CREATED_AT,
  }));
  const categoryByName = new Map(budgetCategories.map((c) => [c.name, c]));
  function categoryId(name: string): string {
    const category = categoryByName.get(name);
    if (!category) throw new Error(`Seed finance: budget category "${name}" not found`);
    return category.id;
  }

  // ---------------------------------------------------------------------
  // Vendors.
  // ---------------------------------------------------------------------
  function vendor(input: Omit<Vendor, 'id' | 'finalPrimaryContactConfirmed' | 'finalBackupContactConfirmed' | 'createdAt' | 'updatedAt'> & Partial<Pick<Vendor, 'finalPrimaryContactConfirmed' | 'finalBackupContactConfirmed' | 'lastConfirmedAt' | 'confirmedBy' | 'confirmationNotes' | 'finalTeamSize' | 'finalArrivalTime'>>): Vendor {
    return {
      finalPrimaryContactConfirmed: false,
      finalBackupContactConfirmed: false,
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
      ...input,
      id: generateId('vendor'),
    };
  }

  const vChurch = vendor({ name: "St. Sebastian's Forane Church", category: 'Church / Parish', status: 'Confirmed', email: 'office@stsebastianschurch.example.com', phone: '+91 40 2345 6001', city: 'Hyderabad', gstApplicable: false, bookingOwner: 'Groom Father', event: 'Wedding', notes: 'Family parish — ceremony booking confirmed.' });
  const vVenue = vendor({ name: 'Grand Celebration Hall', category: 'Reception Venue', status: 'Confirmed', email: 'events@grandcelebrationhall.example.com', phone: '+91 40 2345 6002', city: 'Hyderabad', gstApplicable: true, gstNumber: '36AACCG1234B1Z5', bookingOwner: 'Groom Father', event: 'Wedding' });
  const vCatering = vendor({ name: 'Spice Route Caterers', category: 'Catering', status: 'Confirmed', email: 'bookings@spiceroutecaterers.example.com', phone: '+91 90000 60003', city: 'Hyderabad', gstApplicable: true, gstNumber: '36AACCS5678C1Z2', bookingOwner: 'Groom Mother', event: 'Wedding', lastConfirmedAt: '2026-08-10T10:00:00.000Z', confirmedBy: 'Groom Mother', confirmationNotes: 'Menu tasting completed, headcount confirmed at 420.', finalTeamSize: 25, finalArrivalTime: '13:00' });
  const vCake = vendor({ name: 'Sweet Symphony Cakes', category: 'Cake', status: 'Contracted', email: 'orders@sweetsymphonycakes.example.com', phone: '+91 90000 60004', city: 'Hyderabad', gstApplicable: true, gstNumber: '36AACCS9012D1Z8', bookingOwner: 'Bride', event: 'Wedding' });
  const vDecor = vendor({ name: 'Petal & Stem Décor', category: 'Décor', status: 'Selected', email: 'hello@petalstemdecor.example.com', phone: '+91 90000 60005', city: 'Hyderabad', gstApplicable: true, gstNumber: '36AACCP3456E1Z1', bookingOwner: 'Bride', event: 'Wedding', notes: 'Selected after comparing three moodboards — contract still pending from vendor side.' });
  const vLighting = vendor({ name: 'Luminous Events Lighting', category: 'Lighting', status: 'Contracted', email: 'projects@luminousevents.example.com', phone: '+91 90000 60006', city: 'Hyderabad', gstApplicable: true, gstNumber: '36AACCL7890F1Z4', bookingOwner: 'Groom', event: 'Wedding' });
  const vSound = vendor({ name: 'ClearSound AV Solutions', category: 'Sound / AV', status: 'Confirmed', email: 'events@clearsoundav.example.com', phone: '+91 90000 60007', city: 'Hyderabad', gstApplicable: true, gstNumber: '36AACCC2345G1Z7', bookingOwner: 'Groom', event: 'Wedding' });
  const vPhotoShutter = vendor({ name: 'Shutter Stories Photography', category: 'Photography', status: 'Confirmed', email: 'studio@shutterstories.example.com', phone: '+91 90000 60008', city: 'Hyderabad', gstApplicable: true, gstNumber: '36AACCS6789H1Z0', bookingOwner: 'Bride', event: 'Both', lastConfirmedAt: '2026-08-09T09:00:00.000Z', confirmedBy: 'Bride', finalTeamSize: 3, finalArrivalTime: '08:00' });
  const vPhotoFrame = vendor({ name: 'Frame & Focus Studios', category: 'Photography', status: 'Cancelled', email: 'contact@frameandfocus.example.com', phone: '+91 90000 60009', city: 'Bengaluru', gstApplicable: true, gstNumber: '29AACCF0123I1Z3', bookingOwner: 'Bride', event: 'Wedding', notes: 'Quote reviewed and rejected — went with Shutter Stories instead.' });
  const vPhotoMomentify = vendor({ name: 'Momentify Photography', category: 'Photography', status: 'Shortlisted', email: 'hello@momentify.example.com', phone: '+91 90000 60010', city: 'Hyderabad', gstApplicable: false, bookingOwner: 'Bride', event: 'Wedding' });
  const vVideo = vendor({ name: 'Reel Tales Films', category: 'Videography', status: 'Contracted', email: 'produce@reeltalesfilms.example.com', phone: '+91 90000 60011', city: 'Hyderabad', gstApplicable: true, gstNumber: '36AACCR4567J1Z6', bookingOwner: 'Bride', event: 'Wedding' });
  const vStream = vendor({ name: 'StreamLive Productions', category: 'Live Streaming', status: 'Contracted', email: 'support@streamlivepro.example.com', phone: '+91 90000 60012', city: 'Hyderabad', gstApplicable: true, gstNumber: '36AACCS8901K1Z9', bookingOwner: 'Groom', event: 'Wedding', notes: 'For relatives abroad who cannot travel.' });
  const vChoir = vendor({ name: 'Voices of Grace Choir', category: 'Music / Choir', status: 'Confirmed', email: 'bookings@voicesofgrace.example.com', phone: '+91 90000 60013', city: 'Hyderabad', gstApplicable: false, bookingOwner: 'Groom Mother', event: 'Wedding' });
  const vDJ = vendor({ name: 'DJ Rhythm Nation', category: 'DJ / Band', status: 'Negotiating', email: 'book@djrhythmnation.example.com', phone: '+91 90000 60014', city: 'Hyderabad', gstApplicable: true, gstNumber: '36AACCD2345L1Z2', bookingOwner: 'Groom', event: 'Wedding', notes: 'Negotiating a package discount for combining reception + after-party sets.' });
  const vEmcee = vendor({ name: 'Emcee Ansh Varma', category: 'Emcee', status: 'Contracted', email: 'ansh.varma@example.com', phone: '+91 90000 60015', city: 'Hyderabad', gstApplicable: false, bookingOwner: 'Groom', event: 'Wedding' });
  const vAccommodation = vendor({ name: 'Marigold Grand Hyderabad', category: 'Accommodation', status: 'Confirmed', email: 'reservations@marigoldgrand.example.com', phone: '+91 40 4011 2201', city: 'Hyderabad', gstApplicable: true, gstNumber: '36AACCM6789M1Z5', bookingOwner: 'Groom Father', event: 'Wedding', notes: 'Same property already tracked operationally under Logistics > Hotels — linked here for the commercial side.' });
  const vTransport = vendor({ name: 'Deccan Travels', category: 'Transportation', status: 'Confirmed', email: 'fleet@deccantravels.example.com', phone: '+91 90000 60017', city: 'Hyderabad', gstApplicable: true, gstNumber: '36AACCD0123N1Z8', bookingOwner: 'Groom', event: 'Wedding', notes: 'Supplies the wedding-week vehicle fleet already tracked under Logistics > Transport.' });
  const vPrinting = vendor({ name: 'PrintCraft Invitations', category: 'Invitations / Printing', status: 'Completed', email: 'orders@printcraft.example.com', phone: '+91 90000 60018', city: 'Hyderabad', gstApplicable: true, gstNumber: '36AACCP4567O1Z1', bookingOwner: 'Bride', event: 'Both', lastConfirmedAt: '2026-08-01T09:00:00.000Z', confirmedBy: 'Bride', confirmationNotes: 'All invitations printed, delivered, and paid in full.', finalTeamSize: 2 });
  const vAttire = vendor({ name: 'Zoya Bridal Couture', category: 'Attire', status: 'Contracted', email: 'atelier@zoyabridal.example.com', phone: '+91 90000 60019', city: 'Hyderabad', gstApplicable: true, gstNumber: '36AACCZ8901P1Z4', bookingOwner: 'Bride', event: 'Wedding' });
  const vGrooming = vendor({ name: 'Glow Studio Grooming', category: 'Grooming', status: 'Quoted', email: 'appointments@glowstudio.example.com', phone: '+91 90000 60020', city: 'Hyderabad', gstApplicable: false, bookingOwner: 'Bride', event: 'Wedding' });
  const vSecurity = vendor({ name: 'SecureGuard Services', category: 'Security', status: 'Researching', phone: '+91 90000 60021', city: 'Hyderabad', gstApplicable: true, bookingOwner: 'Groom', event: 'Wedding' });
  const vValet = vendor({ name: 'Golden Hands Valet & Parking', category: 'Valet / Parking', status: 'Shortlisted', phone: '+91 90000 60022', city: 'Hyderabad', gstApplicable: false, bookingOwner: 'Groom', event: 'Wedding' });

  const vendors: Vendor[] = [
    vChurch, vVenue, vCatering, vCake, vDecor, vLighting, vSound,
    vPhotoShutter, vPhotoFrame, vPhotoMomentify, vVideo, vStream, vChoir, vDJ, vEmcee,
    vAccommodation, vTransport, vPrinting, vAttire, vGrooming, vSecurity, vValet,
  ];

  // Deliberate, explicit linkage — never automatic — between the commercial
  // vendor record and the operational hotel/vehicle records from Phase 3.
  const marigoldHotel = findHotel(hotels, 'Marigold Grand Hyderabad');
  if (marigoldHotel) marigoldHotel.vendorId = vAccommodation.id;
  for (const v of findVehiclesByVendorName(vehicles, 'Deccan Travels')) v.vendorId = vTransport.id;

  // ---------------------------------------------------------------------
  // Vendor contacts.
  // ---------------------------------------------------------------------
  function contact(v: Vendor, input: Omit<VendorContact, 'id' | 'vendorId' | 'createdAt' | 'updatedAt'>): VendorContact {
    return { ...input, id: generateId('vendorcontact'), vendorId: v.id, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  }

  const churchPrimary = contact(vChurch, { name: 'Fr. Thomas Kutty', role: 'Parish Priest', phone: '+91 40 2345 6001', preferredContactMethod: 'Phone' });
  const churchBackup = contact(vChurch, { name: 'Sister Rosamma', role: 'Parish Office Assistant', phone: '+91 40 2345 6099', preferredContactMethod: 'Phone' });
  const venuePrimary = contact(vVenue, { name: 'Ritika Shah', role: 'Events Manager', phone: '+91 90000 61002', email: 'ritika@grandcelebrationhall.example.com', preferredContactMethod: 'WhatsApp' });
  const venueBackup = contact(vVenue, { name: 'Karan Malhotra', role: 'Assistant Events Manager', phone: '+91 90000 61003', preferredContactMethod: 'Phone' });
  const cateringPrimary = contact(vCatering, { name: 'Suresh Nair', role: 'Catering Manager', phone: '+91 90000 61004', email: 'suresh@spiceroutecaterers.example.com', preferredContactMethod: 'Phone' });
  const cateringBackup = contact(vCatering, { name: 'Divya Menon', role: 'Coordinator', phone: '+91 90000 61005', preferredContactMethod: 'WhatsApp' });
  const cakePrimary = contact(vCake, { name: 'Anita Rao', role: 'Owner', phone: '+91 90000 61006', preferredContactMethod: 'WhatsApp' });
  const cakeBackup = contact(vCake, { name: 'Deepak Rao', role: 'Delivery Coordinator', phone: '+91 90000 61098', preferredContactMethod: 'Phone' });
  const decorPrimary = contact(vDecor, { name: 'Meera Iyer', role: 'Creative Director', phone: '+91 90000 61007', email: 'meera@petalstemdecor.example.com', preferredContactMethod: 'Email' });
  const lightingPrimary = contact(vLighting, { name: 'Faisal Rahman', role: 'Production Lead', phone: '+91 90000 61008', preferredContactMethod: 'Phone' });
  const lightingBackup = contact(vLighting, { name: 'Ganesh Pillai', role: 'Site Supervisor', phone: '+91 90000 61009', preferredContactMethod: 'Phone' });
  const soundPrimary = contact(vSound, { name: 'Arvind Kumar', role: 'Technical Director', phone: '+91 90000 61010', preferredContactMethod: 'Phone' });
  const photoShutterPrimary = contact(vPhotoShutter, { name: 'Rhea Kapoor', role: 'Lead Photographer', phone: '+91 90000 61011', email: 'rhea@shutterstories.example.com', preferredContactMethod: 'WhatsApp' });
  const photoShutterBackup = contact(vPhotoShutter, { name: 'Aditya Bose', role: 'Second Shooter', phone: '+91 90000 61012', preferredContactMethod: 'Phone' });
  const photoFramePrimary = contact(vPhotoFrame, { name: 'Nikhil Sequeira', role: 'Studio Head', phone: '+91 90000 61013', preferredContactMethod: 'Email' });
  const photoMomentifyPrimary = contact(vPhotoMomentify, { name: 'Sana Fatima', role: 'Founder', phone: '+91 90000 61014', preferredContactMethod: 'WhatsApp' });
  const videoPrimary = contact(vVideo, { name: 'Rohit Verma', role: 'Director', phone: '+91 90000 61015', preferredContactMethod: 'Phone' });
  const streamPrimary = contact(vStream, { name: 'Priya Deshmukh', role: 'Operations Lead', phone: '+91 90000 61016', preferredContactMethod: 'Email' });
  const choirPrimary = contact(vChoir, { name: 'Sister Alphonsa', role: 'Choir Coordinator', phone: '+91 90000 61017', preferredContactMethod: 'Phone' });
  const choirBackup = contact(vChoir, { name: 'Brother Jose', role: 'Assistant Coordinator', phone: '+91 90000 61097', preferredContactMethod: 'Phone' });
  const djPrimary = contact(vDJ, { name: 'Vikram Singh', role: 'Lead DJ', phone: '+91 90000 61018', preferredContactMethod: 'WhatsApp' });
  const emceePrimary = contact(vEmcee, { name: 'Ansh Varma', role: 'Emcee', phone: '+91 90000 60015', preferredContactMethod: 'Phone' });
  const accommodationPrimary = contact(vAccommodation, { name: 'Front Office Manager', role: 'Reservations', phone: '+91 40 4011 2201', preferredContactMethod: 'Email' });
  const transportPrimary = contact(vTransport, { name: 'Manoj Verma', role: 'Fleet Coordinator', phone: '+91 90000 61021', preferredContactMethod: 'Phone' });
  const transportBackup = contact(vTransport, { name: 'Ravi Teja', role: 'Dispatch', phone: '+91 90000 61022', preferredContactMethod: 'Phone' });
  const printingPrimary = contact(vPrinting, { name: 'Kavya Reddy', role: 'Account Manager', phone: '+91 90000 61023', preferredContactMethod: 'WhatsApp' });
  const attirePrimary = contact(vAttire, { name: 'Zoya Khan', role: 'Designer', phone: '+91 90000 61024', email: 'zoya@zoyabridal.example.com', preferredContactMethod: 'WhatsApp' });
  const attireBackup = contact(vAttire, { name: 'Farah Ali', role: 'Atelier Manager', phone: '+91 90000 61025', preferredContactMethod: 'Phone' });
  const groomingPrimary = contact(vGrooming, { name: 'Nisha Kapoor', role: 'Studio Manager', phone: '+91 90000 61026', preferredContactMethod: 'WhatsApp' });
  const securityPrimary = contact(vSecurity, { name: 'Ramesh Bhatt', role: 'Operations', phone: '+91 90000 61027', preferredContactMethod: 'Phone' });
  const valetPrimary = contact(vValet, { name: 'Suresh Pillai', role: 'Coordinator', phone: '+91 90000 61028', preferredContactMethod: 'Phone' });

  const vendorContacts: VendorContact[] = [
    churchPrimary, churchBackup, venuePrimary, venueBackup, cateringPrimary, cateringBackup, cakePrimary, cakeBackup, decorPrimary,
    lightingPrimary, lightingBackup, soundPrimary, photoShutterPrimary, photoShutterBackup, photoFramePrimary,
    photoMomentifyPrimary, videoPrimary, streamPrimary, choirPrimary, choirBackup, djPrimary, emceePrimary, accommodationPrimary,
    transportPrimary, transportBackup, printingPrimary, attirePrimary, attireBackup, groomingPrimary, securityPrimary, valetPrimary,
  ];

  // Wire up primary/backup contact links on the vendor records.
  vChurch.primaryContactId = churchPrimary.id;
  vVenue.primaryContactId = venuePrimary.id;
  vVenue.backupContactId = venueBackup.id;
  vCatering.primaryContactId = cateringPrimary.id;
  vCatering.backupContactId = cateringBackup.id;
  vCake.primaryContactId = cakePrimary.id;
  vDecor.primaryContactId = decorPrimary.id;
  vLighting.primaryContactId = lightingPrimary.id;
  vLighting.backupContactId = lightingBackup.id;
  vSound.primaryContactId = soundPrimary.id;
  vPhotoShutter.primaryContactId = photoShutterPrimary.id;
  vPhotoShutter.backupContactId = photoShutterBackup.id;
  vPhotoFrame.primaryContactId = photoFramePrimary.id;
  vPhotoMomentify.primaryContactId = photoMomentifyPrimary.id;
  vVideo.primaryContactId = videoPrimary.id;
  vStream.primaryContactId = streamPrimary.id;
  vChoir.primaryContactId = choirPrimary.id;
  vDJ.primaryContactId = djPrimary.id;
  vEmcee.primaryContactId = emceePrimary.id;
  vAccommodation.primaryContactId = accommodationPrimary.id;
  vTransport.primaryContactId = transportPrimary.id;
  vTransport.backupContactId = transportBackup.id;
  vPrinting.primaryContactId = printingPrimary.id;
  vAttire.primaryContactId = attirePrimary.id;
  vAttire.backupContactId = attireBackup.id;
  vGrooming.primaryContactId = groomingPrimary.id;
  vSecurity.primaryContactId = securityPrimary.id;
  vValet.primaryContactId = valetPrimary.id;
  vCatering.finalPrimaryContactConfirmed = true;
  vCatering.finalBackupContactConfirmed = true;
  vPhotoShutter.finalPrimaryContactConfirmed = true;

  // ---------------------------------------------------------------------
  // Vendor quotes.
  // ---------------------------------------------------------------------
  function quote(v: Vendor, input: Omit<VendorQuote, 'id' | 'vendorId' | 'totalAmount' | 'createdAt' | 'updatedAt' | 'currency'>): VendorQuote {
    return {
      ...input,
      currency: 'INR',
      totalAmount: computeQuoteTotal(input),
      id: generateId('quote'),
      vendorId: v.id,
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const qChurch = quote(vChurch, { quoteReference: 'SSFC-Q-001', quoteDate: '2026-06-01', event: 'Wedding', scopeSummary: 'Ceremony booking, organist, altar decoration coordination.', baseAmount: 75000, discountAmount: 0, taxAmount: 0, otherCharges: 5000, negotiatedAmount: undefined, status: 'Accepted', isSelected: true });
  const qVenue = quote(vVenue, { quoteReference: 'GCH-Q-014', quoteDate: '2026-05-20', validUntil: '2026-12-01', event: 'Wedding', scopeSummary: 'Reception hall for 450 guests, tables/chairs, basic lighting rig, parking.', baseAmount: 550000, discountAmount: 25000, taxAmount: 99000, otherCharges: 15000, negotiatedAmount: 620000, status: 'Accepted', isSelected: true });
  const qCatering = quote(vCatering, { quoteReference: 'SRC-Q-102', quoteDate: '2026-05-25', event: 'Wedding', scopeSummary: 'Full-course Kerala Christian wedding menu for 420 guests, live counters, service staff.', baseAmount: 850000, discountAmount: 40000, taxAmount: 40500, otherCharges: 20000, negotiatedAmount: 860000, status: 'Accepted', isSelected: true });
  const qCake = quote(vCake, { quoteReference: 'SSC-Q-030', quoteDate: '2026-06-10', event: 'Wedding', scopeSummary: '5-tier wedding cake, dessert table, 200 favors.', baseAmount: 42000, discountAmount: 2000, taxAmount: 2000, otherCharges: 0, status: 'Accepted', isSelected: true });
  const qDecorA = quote(vDecor, { quoteReference: 'PSD-Q-007', quoteDate: '2026-06-15', validUntil: '2027-01-05', event: 'Wedding', scopeSummary: 'Full floral décor — mandap, stage, entrance arch, table centerpieces.', baseAmount: 360000, discountAmount: 10000, taxAmount: 21000, otherCharges: 8000, negotiatedAmount: 370000, status: 'Accepted', isSelected: true });
  const qLighting = quote(vLighting, { quoteReference: 'LEL-Q-045', quoteDate: '2026-06-18', event: 'Wedding', scopeSummary: 'Ambient + stage lighting rig, uplighting for décor.', baseAmount: 230000, discountAmount: 5000, taxAmount: 13500, otherCharges: 5000, status: 'Accepted', isSelected: true });
  const qSound = quote(vSound, { quoteReference: 'CSA-Q-021', quoteDate: '2026-06-20', event: 'Wedding', scopeSummary: 'PA system, wireless mics, technician for ceremony + reception.', baseAmount: 140000, discountAmount: 0, taxAmount: 8400, otherCharges: 0, status: 'Accepted', isSelected: true });

  // Photography — three-way comparison in the same category.
  const qPhotoShutter = quote(vPhotoShutter, { quoteReference: 'SSP-Q-501', quoteDate: '2026-06-05', validUntil: '2026-12-31', event: 'Both', scopeSummary: 'Full-day coverage both events, 2 photographers, premium album, drone shots.', baseAmount: 210000, discountAmount: 15000, taxAmount: 11700, otherCharges: 5000, negotiatedAmount: 195000, status: 'Accepted', isSelected: true });
  const qPhotoFrame = quote(vPhotoFrame, { quoteReference: 'FFS-Q-118', quoteDate: '2026-06-06', validUntil: '2026-11-30', event: 'Wedding', scopeSummary: 'Single-day wedding coverage, 1 photographer, digital gallery only.', baseAmount: 175000, discountAmount: 0, taxAmount: 10500, otherCharges: 0, status: 'Rejected', isSelected: false, notes: 'Portfolio style did not match — went with Shutter Stories.' });
  const qPhotoMomentify = quote(vPhotoMomentify, { quoteReference: 'MMF-Q-009', quoteDate: '2026-08-08', validUntil: '2026-08-20', event: 'Wedding', scopeSummary: 'Wedding day coverage, candid style, 1 photographer + assistant.', baseAmount: 150000, discountAmount: 0, taxAmount: 9000, otherCharges: 0, status: 'Under Review', isSelected: false, notes: 'Backup option — quote expires soon, needs a decision.' });

  const qVideo = quote(vVideo, { quoteReference: 'RTF-Q-077', quoteDate: '2026-06-08', event: 'Wedding', scopeSummary: 'Cinematic same-day edit + full film, drone coverage.', baseAmount: 165000, discountAmount: 5000, taxAmount: 9600, otherCharges: 0, negotiatedAmount: 160000, status: 'Accepted', isSelected: true });
  const qStream = quote(vStream, { quoteReference: 'SLP-Q-012', quoteDate: '2026-06-22', event: 'Wedding', scopeSummary: 'Live stream setup for ceremony and reception, dedicated link for family abroad.', baseAmount: 45000, discountAmount: 0, taxAmount: 2700, otherCharges: 0, status: 'Accepted', isSelected: true });
  const qChoir = quote(vChoir, { quoteReference: 'VOG-Q-004', quoteDate: '2026-06-12', event: 'Wedding', scopeSummary: 'Choir of 12 for ceremony hymns.', baseAmount: 80000, discountAmount: 0, taxAmount: 0, otherCharges: 0, status: 'Accepted', isSelected: true });
  const qDJ = quote(vDJ, { quoteReference: 'DRN-Q-033', quoteDate: '2026-07-01', event: 'Wedding', scopeSummary: 'Reception DJ set + after-party, MC coordination with sound vendor.', baseAmount: 95000, discountAmount: 5000, taxAmount: 5400, otherCharges: 0, negotiatedAmount: 90000, status: 'Negotiating', isSelected: false });
  const qEmcee = quote(vEmcee, { quoteReference: 'EAV-Q-002', quoteDate: '2026-06-25', event: 'Wedding', scopeSummary: 'Bilingual emcee for reception program.', baseAmount: 25000, discountAmount: 0, taxAmount: 0, otherCharges: 0, status: 'Accepted', isSelected: true });
  const qAccommodation = quote(vAccommodation, { quoteReference: 'MGH-Q-090', quoteDate: '2026-06-01', event: 'Wedding', scopeSummary: 'Group room block, 5 nights, breakfast included — see Logistics > Hotels for room-level detail.', baseAmount: 480000, discountAmount: 20000, taxAmount: 41400, otherCharges: 0, negotiatedAmount: 495000, status: 'Accepted', isSelected: true });
  const qTransport = quote(vTransport, { quoteReference: 'DT-Q-210', quoteDate: '2026-06-02', event: 'Wedding', scopeSummary: 'Vehicle fleet for the wedding week — see Logistics > Transport for vehicle-level detail.', baseAmount: 165000, discountAmount: 10000, taxAmount: 9300, otherCharges: 0, status: 'Accepted', isSelected: true });
  const qPrinting = quote(vPrinting, { quoteReference: 'PCI-Q-060', quoteDate: '2026-05-15', event: 'Both', scopeSummary: 'Save-the-dates, invitations, RSVP cards, thank-you cards — 450 sets.', baseAmount: 58000, discountAmount: 3000, taxAmount: 3300, otherCharges: 0, status: 'Accepted', isSelected: true });
  const qAttire = quote(vAttire, { quoteReference: 'ZBC-Q-041', quoteDate: '2026-06-14', event: 'Wedding', scopeSummary: 'Bridal gown, groom sherwani, alterations, 2 fittings.', baseAmount: 280000, discountAmount: 10000, taxAmount: 16200, otherCharges: 0, negotiatedAmount: 275000, status: 'Accepted', isSelected: true });
  const qGrooming = quote(vGrooming, { quoteReference: 'GSG-Q-018', quoteDate: '2026-07-10', validUntil: '2027-01-20', event: 'Wedding', scopeSummary: 'Bridal hair & makeup trial + wedding day, groom grooming package.', baseAmount: 55000, discountAmount: 0, taxAmount: 3300, otherCharges: 0, status: 'Received', isSelected: false });
  const qSecurity = quote(vSecurity, { quoteReference: 'SGS-Q-005', quoteDate: '2026-08-01', event: 'Wedding', scopeSummary: '6 security personnel, gate management, guest list checks.', baseAmount: 42000, discountAmount: 0, taxAmount: 2520, otherCharges: 0, status: 'Received', isSelected: false });
  const qValet = quote(vValet, { quoteReference: 'GHV-Q-003', quoteDate: '2026-07-28', event: 'Wedding', scopeSummary: 'Valet team of 8, parking marshals, signage.', baseAmount: 30000, discountAmount: 0, taxAmount: 0, otherCharges: 0, status: 'Received', isSelected: false });
  // Superseded draft quotes, kept on file to show the negotiation history behind the accepted ones above.
  const qVenueDraft = quote(vVenue, { quoteReference: 'GCH-Q-009', quoteDate: '2026-05-02', event: 'Wedding', scopeSummary: 'Initial reception hall package, before negotiation.', baseAmount: 590000, discountAmount: 0, taxAmount: 106200, otherCharges: 20000, status: 'Rejected', isSelected: false, notes: 'Superseded by the negotiated quote GCH-Q-014.' });
  const qCateringDraft = quote(vCatering, { quoteReference: 'SRC-Q-088', quoteDate: '2026-05-10', event: 'Wedding', scopeSummary: 'Initial catering package for 420 guests, before menu revisions.', baseAmount: 900000, discountAmount: 0, taxAmount: 45000, otherCharges: 20000, status: 'Rejected', isSelected: false, notes: 'Superseded after the tasting revised the menu and pricing.' });
  const qDecorDraft = quote(vDecor, { quoteReference: 'PSD-Q-003', quoteDate: '2026-05-28', event: 'Wedding', scopeSummary: 'First moodboard concept — premium imported florals.', baseAmount: 420000, discountAmount: 0, taxAmount: 25200, otherCharges: 8000, status: 'Rejected', isSelected: false, notes: 'Too expensive — revised down to local/seasonal florals in PSD-Q-007.' });
  const qDJDraft = quote(vDJ, { quoteReference: 'DRN-Q-021', quoteDate: '2026-06-20', event: 'Wedding', scopeSummary: 'Reception-only DJ set, before the after-party add-on was discussed.', baseAmount: 70000, discountAmount: 0, taxAmount: 4200, otherCharges: 0, status: 'Under Review', isSelected: false });

  const vendorQuotes: VendorQuote[] = [
    qChurch, qVenue, qVenueDraft, qCatering, qCateringDraft, qCake, qDecorA, qDecorDraft, qLighting, qSound,
    qPhotoShutter, qPhotoFrame, qPhotoMomentify, qVideo, qStream, qChoir, qDJ, qDJDraft, qEmcee,
    qAccommodation, qTransport, qPrinting, qAttire, qGrooming, qSecurity, qValet,
  ];

  // ---------------------------------------------------------------------
  // Contracts (15 vendors have one).
  // ---------------------------------------------------------------------
  function contract(v: Vendor, q: VendorQuote | undefined, input: Omit<Contract, 'id' | 'vendorId' | 'quoteId' | 'createdAt' | 'updatedAt'>): Contract {
    return { ...input, id: generateId('contract'), vendorId: v.id, quoteId: q?.id, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  }

  const contracts: Contract[] = [
    contract(vChurch, qChurch, {
      contractReference: 'SSFC-C-001', contractDate: '2026-06-10', status: 'Signed',
      scopeIncluded: 'Ceremony booking, organist, altar decoration coordination.', scopeExcluded: 'Reception, flowers beyond altar.',
      deliverables: 'Confirmed ceremony slot, printed order of service template.', quantityAssumptions: '1 ceremony, ~450 attendees seated.',
      serviceStartDate: WEDDING_DATE, serviceStartTime: '10:00', serviceEndDate: WEDDING_DATE, serviceEndTime: '12:00',
      teamSize: 3, venueAccessRequirements: 'Church opens at 07:00 for décor team setup.',
      cancellationTerms: 'Full refund if cancelled 60+ days before; no refund within 14 days.',
      finalSettlementDueDate: '2027-01-25', refundableDeposit: 0, notes: 'Family parish, longstanding relationship.',
    }),
    contract(vVenue, qVenue, {
      contractReference: 'GCH-C-014', contractDate: '2026-06-05', status: 'Signed',
      scopeIncluded: 'Hall rental, tables/chairs, basic lighting rig, parking for 150 cars.', scopeExcluded: 'Catering, décor, AV equipment.',
      deliverables: 'Exclusive hall access 06:00–23:00 on the wedding day.', quantityAssumptions: '450-guest seated capacity.',
      setupDate: '2027-01-29', setupTime: '18:00', serviceStartDate: WEDDING_DATE, serviceStartTime: '11:00', serviceEndDate: WEDDING_DATE, serviceEndTime: '23:00', teardownDeadline: '2027-01-31T06:00',
      teamSize: 10, powerRequirements: '3-phase supply for catering + lighting vendors.', venueAccessRequirements: 'Vendor access from 06:00 on setup day.',
      cancellationTerms: 'Refundable deposit forfeited if cancelled within 30 days of the event.', rescheduleTerms: 'One free reschedule with 45+ days notice.',
      refundableDeposit: 100000, finalSettlementDueDate: '2027-01-20',
    }),
    contract(vCatering, qCatering, {
      contractReference: 'SRC-C-102', contractDate: '2026-06-08', status: 'Signed',
      scopeIncluded: 'Full-course menu, live counters, service staff, crockery.', scopeExcluded: 'Alcohol service, cake.',
      deliverables: 'Final menu card, staff of 25 on the day.', quantityAssumptions: '420 confirmed guests, +5% buffer.',
      setupDate: WEDDING_DATE, setupTime: '10:00', serviceStartDate: WEDDING_DATE, serviceStartTime: '13:00', serviceEndDate: WEDDING_DATE, serviceEndTime: '22:00', teardownDeadline: '2027-01-30T23:30',
      teamSize: 25, vendorMealCount: 25, powerRequirements: 'Dedicated circuit for warmers.', transportRequirements: 'Loading access for 2 catering vans.',
      venueAccessRequirements: 'Kitchen tent access from 08:00.', cancellationTerms: 'Sliding scale refund — see attached schedule.',
      finalSettlementDueDate: '2027-01-22',
    }),
    contract(vCake, qCake, {
      contractReference: 'SSC-C-030', contractDate: '2026-06-14', status: 'Signed',
      scopeIncluded: '5-tier cake, dessert table, delivery & setup.', deliverables: 'Cake delivered by 12:00 on the wedding day.',
      serviceStartDate: WEDDING_DATE, serviceStartTime: '12:00', teamSize: 2,
      cancellationTerms: 'Deposit non-refundable within 14 days of delivery.', finalSettlementDueDate: '2027-01-25',
    }),
    contract(vLighting, qLighting, {
      contractReference: 'LEL-C-045', contractDate: '2026-06-25', status: 'Signed',
      scopeIncluded: 'Ambient + stage lighting rig, uplighting.', scopeExcluded: 'Décor florals, sound equipment.',
      deliverables: 'Full rig installed and tested before guest arrival.', setupDate: '2027-01-29', setupTime: '14:00',
      serviceStartDate: WEDDING_DATE, serviceStartTime: '11:00', serviceEndDate: WEDDING_DATE, serviceEndTime: '23:00', teardownDeadline: '2027-01-31T08:00',
      teamSize: 6, powerRequirements: 'Dedicated 32A circuit.', venueAccessRequirements: 'Rigging access from 14:00 the day before.',
      cancellationTerms: 'No refund within 21 days of the event.', finalSettlementDueDate: '2027-01-20',
    }),
    contract(vSound, qSound, {
      contractReference: 'CSA-C-021', contractDate: '2026-06-27', status: 'Signed',
      scopeIncluded: 'PA system, wireless mics, technician on-site.', deliverables: 'Sound check completed by 10:00.',
      serviceStartDate: WEDDING_DATE, serviceStartTime: '10:00', serviceEndDate: WEDDING_DATE, serviceEndTime: '23:00',
      teamSize: 3, powerRequirements: 'Shared circuit with lighting vendor, coordinated in advance.', venueAccessRequirements: 'Access alongside lighting vendor.',
      cancellationTerms: 'Standard 30-day cancellation policy.', finalSettlementDueDate: '2027-01-20',
    }),
    contract(vPhotoShutter, qPhotoShutter, {
      contractReference: 'SSP-C-501', contractDate: '2026-06-12', status: 'Signed',
      scopeIncluded: 'Both events, 2 photographers, premium album, drone shots.', scopeExcluded: 'Same-day edit video (see videographer).',
      deliverables: 'Online gallery within 4 weeks, printed album within 8 weeks.', setupDate: WEDDING_DATE, setupTime: '07:30',
      serviceStartDate: WEDDING_DATE, serviceStartTime: '08:00', serviceEndDate: WEDDING_DATE, serviceEndTime: '23:00',
      teamSize: 3, vendorMealCount: 3, venueAccessRequirements: 'Backstage access for bridal prep shots from 07:30.',
      cancellationTerms: 'Non-refundable booking fee; balance refundable up to 30 days prior.', finalSettlementDueDate: '2027-02-10',
    }),
    contract(vVideo, qVideo, {
      contractReference: 'RTF-C-077', contractDate: '2026-06-15', status: 'Signed',
      scopeIncluded: 'Cinematic film, same-day edit, drone coverage.', deliverables: 'Same-day edit shown at reception; full film in 6 weeks.',
      serviceStartDate: WEDDING_DATE, serviceStartTime: '08:00', serviceEndDate: WEDDING_DATE, serviceEndTime: '23:00',
      teamSize: 2, vendorMealCount: 2, venueAccessRequirements: 'Same access as photography team.',
      cancellationTerms: 'Non-refundable deposit; balance refundable up to 21 days prior.', finalSettlementDueDate: '2027-02-10',
    }),
    contract(vStream, qStream, {
      contractReference: 'SLP-C-012', contractDate: '2026-06-28', status: 'Signed',
      scopeIncluded: 'Live stream ceremony + reception, dedicated private link.', deliverables: 'Tested stream link shared 1 week prior.',
      serviceStartDate: WEDDING_DATE, serviceStartTime: '09:30', serviceEndDate: WEDDING_DATE, serviceEndTime: '22:00',
      teamSize: 2, powerRequirements: 'Stable power + internet uplink required — coordinating with venue.', venueAccessRequirements: 'Camera position near altar and stage, confirmed with venue and church.',
      cancellationTerms: 'Full refund if cancelled 14+ days prior.', finalSettlementDueDate: '2027-01-25',
    }),
    contract(vChoir, qChoir, {
      contractReference: 'VOG-C-004', contractDate: '2026-06-18', status: 'Signed',
      scopeIncluded: 'Choir of 12 for ceremony hymns.', deliverables: 'Rehearsal 1 week prior, performance on the day.',
      serviceStartDate: WEDDING_DATE, serviceStartTime: '09:45', serviceEndDate: WEDDING_DATE, serviceEndTime: '12:00',
      teamSize: 12, venueAccessRequirements: 'Choir loft access from 09:00.',
      cancellationTerms: 'Community group — goodwill donation policy, no formal penalty.', finalSettlementDueDate: '2027-01-28',
    }),
    contract(vEmcee, qEmcee, {
      contractReference: 'EAV-C-002', contractDate: '2026-06-30', status: 'Signed',
      scopeIncluded: 'Bilingual emcee for the full reception program.', deliverables: 'Run-of-show finalized 1 week prior.',
      serviceStartDate: WEDDING_DATE, serviceStartTime: '18:30', serviceEndDate: WEDDING_DATE, serviceEndTime: '23:00',
      teamSize: 1, venueAccessRequirements: 'Stage access from 17:30 for sound check.',
      cancellationTerms: 'Standard freelance cancellation — 50% fee within 7 days.', finalSettlementDueDate: '2027-01-28',
    }),
    contract(vAccommodation, qAccommodation, {
      contractReference: 'MGH-C-090', contractDate: '2026-06-05', status: 'Signed',
      scopeIncluded: 'Group room block for 5 nights, breakfast included — room-level detail lives in Logistics > Hotels.',
      deliverables: 'Rooming list finalized 2 weeks prior.', serviceStartDate: '2027-01-27', serviceEndDate: '2027-02-01',
      venueAccessRequirements: 'Wedding-block check-in desk from 12:00 on arrival days.',
      cancellationTerms: 'Attrition clause — 80% block minimum or per-room penalty applies.', refundableDeposit: 50000, finalSettlementDueDate: '2027-01-20',
    }),
    contract(vTransport, qTransport, {
      contractReference: 'DT-C-210', contractDate: '2026-06-06', status: 'Signed',
      scopeIncluded: 'Vehicle fleet for the wedding week — vehicle-level detail lives in Logistics > Transport.',
      deliverables: 'Confirmed vehicle list 2 weeks prior.', serviceStartDate: '2027-01-27', serviceEndDate: '2027-02-01',
      transportRequirements: 'Fuel and driver allowances included.', cancellationTerms: 'Per-vehicle cancellation within 7 days incurs 25% fee.',
      finalSettlementDueDate: '2027-01-25',
    }),
    contract(vPrinting, qPrinting, {
      contractReference: 'PCI-C-060', contractDate: '2026-05-20', status: 'Completed',
      scopeIncluded: 'Save-the-dates, invitations, RSVP cards, thank-you cards — 450 sets.', deliverables: 'All sets delivered by courier.',
      serviceStartDate: '2026-06-01', serviceEndDate: '2026-08-01', cancellationTerms: 'Non-refundable once printing begins.',
      finalSettlementDueDate: '2026-08-01', notes: 'Fully delivered and settled — closed out.',
    }),
    contract(vAttire, qAttire, {
      contractReference: 'ZBC-C-041', contractDate: '2026-06-20', status: 'Signed',
      scopeIncluded: 'Bridal gown, groom sherwani, alterations, 2 fittings.', deliverables: 'Final fitting 2 weeks prior to the wedding.',
      serviceStartDate: '2026-06-20', serviceEndDate: '2027-01-20', cancellationTerms: 'Deposit non-refundable once cutting begins.',
      finalSettlementDueDate: '2027-01-15',
    }),
  ];

  // ---------------------------------------------------------------------
  // Budget items (25 total — one per vendor with a commitment, plus a few
  // vendor-less lines such as the contingency example from section 12).
  // ---------------------------------------------------------------------
  function budgetItem(input: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>): BudgetItem {
    return { ...input, id: generateId('budgetitem'), createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  }

  const biChurch = budgetItem({ categoryId: categoryId('Church'), vendorId: vChurch.id, event: 'Wedding', itemName: 'Ceremony booking', originalBudget: 70000, latestEstimate: 80000, negotiatedAmount: undefined, taxAmount: 0, otherCharges: 5000, committedAmount: 80000, actualAmount: undefined, approvalStatus: 'Approved', approvedBy: 'Groom Father' });
  const biVenue = budgetItem({ categoryId: categoryId('Venue'), vendorId: vVenue.id, event: 'Wedding', itemName: 'Reception hall rental', originalBudget: 550000, latestEstimate: 600000, negotiatedAmount: 620000, taxAmount: 99000, otherCharges: 15000, committedAmount: 620000, actualAmount: undefined, approvalStatus: 'Approved', approvedBy: 'Groom Father' });
  const biCatering = budgetItem({ categoryId: categoryId('Catering'), vendorId: vCatering.id, event: 'Wedding', itemName: 'Wedding day catering', originalBudget: 850000, latestEstimate: 860000, negotiatedAmount: 860000, taxAmount: 40500, otherCharges: 20000, committedAmount: 860000, actualAmount: undefined, approvalStatus: 'Approved', approvedBy: 'Groom Mother' });
  const biCake = budgetItem({ categoryId: categoryId('Cake'), vendorId: vCake.id, event: 'Wedding', itemName: 'Wedding cake & desserts', originalBudget: 40000, latestEstimate: 42000, taxAmount: 2000, otherCharges: 0, committedAmount: 42000, actualAmount: undefined, approvalStatus: 'Approved', approvedBy: 'Bride' });
  // Deliberate over-budget category: Décor forecast well above its plan.
  const biDecor = budgetItem({ categoryId: categoryId('Décor'), vendorId: vDecor.id, event: 'Wedding', itemName: 'Full wedding décor', originalBudget: 350000, latestEstimate: 399000, taxAmount: 21000, otherCharges: 8000, committedAmount: undefined, actualAmount: undefined, approvalStatus: 'Pending Approval', notes: 'Quote negotiated to ₹3,70,000 but not yet committed — awaiting a signed contract. Latest estimate reflects the pre-negotiation quote.' });
  const biLighting = budgetItem({ categoryId: categoryId('Lighting & Production'), vendorId: vLighting.id, event: 'Wedding', itemName: 'Lighting & production rig', originalBudget: 230000, latestEstimate: 248500, taxAmount: 13500, otherCharges: 5000, committedAmount: 248500, actualAmount: undefined, approvalStatus: 'Approved', approvedBy: 'Groom' });
  const biSound = budgetItem({ categoryId: categoryId('Lighting & Production'), vendorId: vSound.id, event: 'Wedding', itemName: 'Sound & AV', originalBudget: 140000, latestEstimate: 148400, taxAmount: 8400, otherCharges: 0, committedAmount: 148400, actualAmount: undefined, approvalStatus: 'Approved', approvedBy: 'Groom' });
  const biPhoto = budgetItem({ categoryId: categoryId('Photography'), vendorId: vPhotoShutter.id, event: 'Both', itemName: 'Photography — both events', originalBudget: 220000, latestEstimate: 195000, negotiatedAmount: 195000, taxAmount: 11700, otherCharges: 5000, committedAmount: 211700, actualAmount: undefined, approvalStatus: 'Approved', approvedBy: 'Bride' });
  const biVideo = budgetItem({ categoryId: categoryId('Video'), vendorId: vVideo.id, event: 'Wedding', itemName: 'Wedding film', originalBudget: 165000, latestEstimate: 160000, negotiatedAmount: 160000, taxAmount: 9600, otherCharges: 0, committedAmount: 169600, actualAmount: undefined, approvalStatus: 'Approved', approvedBy: 'Bride' });
  const biStream = budgetItem({ categoryId: categoryId('Video'), vendorId: vStream.id, event: 'Wedding', itemName: 'Live streaming', originalBudget: 45000, latestEstimate: 47700, taxAmount: 2700, otherCharges: 0, committedAmount: 47700, actualAmount: undefined, approvalStatus: 'Approved', approvedBy: 'Groom' });
  const biChoir = budgetItem({ categoryId: categoryId('Music & Entertainment'), vendorId: vChoir.id, event: 'Wedding', itemName: 'Ceremony choir', originalBudget: 80000, latestEstimate: 80000, taxAmount: 0, otherCharges: 0, committedAmount: 80000, actualAmount: undefined, approvalStatus: 'Approved', approvedBy: 'Groom Mother' });
  // Deliberate unapproved commitment: DJ has a committed figure but is still Pending Approval.
  const biDJ = budgetItem({ categoryId: categoryId('Music & Entertainment'), vendorId: vDJ.id, event: 'Wedding', itemName: 'Reception DJ', originalBudget: 90000, latestEstimate: 95400, negotiatedAmount: 90000, taxAmount: 5400, otherCharges: 0, committedAmount: 95400, actualAmount: undefined, approvalStatus: 'Pending Approval', notes: 'Committed ahead of final sign-off while negotiation wraps up.' });
  const biEmcee = budgetItem({ categoryId: categoryId('Music & Entertainment'), vendorId: vEmcee.id, event: 'Wedding', itemName: 'Emcee', originalBudget: 25000, latestEstimate: 25000, taxAmount: 0, otherCharges: 0, committedAmount: 25000, actualAmount: undefined, approvalStatus: 'Approved', approvedBy: 'Groom' });
  const biAccommodation = budgetItem({ categoryId: categoryId('Accommodation'), vendorId: vAccommodation.id, event: 'Wedding', itemName: 'Guest accommodation block', originalBudget: 400000, latestEstimate: 495000, negotiatedAmount: 495000, taxAmount: 41400, otherCharges: 0, committedAmount: 536400, actualAmount: undefined, approvalStatus: 'Approved', approvedBy: 'Groom Father' });
  const biTransport = budgetItem({ categoryId: categoryId('Local Transport'), vendorId: vTransport.id, event: 'Wedding', itemName: 'Wedding-week vehicle fleet', originalBudget: 150000, latestEstimate: 155000, taxAmount: 9300, otherCharges: 0, committedAmount: 164300, actualAmount: undefined, approvalStatus: 'Approved', approvedBy: 'Groom' });
  const biPrinting = budgetItem({ categoryId: categoryId('Invitations & Printing'), vendorId: vPrinting.id, event: 'Both', itemName: 'Invitations & stationery', originalBudget: 58000, latestEstimate: 58300, taxAmount: 3300, otherCharges: 0, committedAmount: 58300, actualAmount: 58300, approvalStatus: 'Approved', approvedBy: 'Bride' });
  const biAttire = budgetItem({ categoryId: categoryId('Attire'), vendorId: vAttire.id, event: 'Wedding', itemName: 'Bridal & groom attire', originalBudget: 280000, latestEstimate: 275000, negotiatedAmount: 275000, taxAmount: 16200, otherCharges: 0, committedAmount: 291200, actualAmount: undefined, approvalStatus: 'Approved', approvedBy: 'Bride' });
  const biGrooming = budgetItem({ categoryId: categoryId('Grooming'), vendorId: vGrooming.id, event: 'Wedding', itemName: 'Bridal & groom grooming', originalBudget: 55000, latestEstimate: 58300, taxAmount: 3300, otherCharges: 0, approvalStatus: 'Draft' });
  const biSecurity = budgetItem({ categoryId: categoryId('Security & Parking'), vendorId: vSecurity.id, event: 'Wedding', itemName: 'Event security', originalBudget: 40000, approvalStatus: 'Draft' });
  const biValet = budgetItem({ categoryId: categoryId('Security & Parking'), vendorId: vValet.id, event: 'Wedding', itemName: 'Valet & parking management', originalBudget: 30000, approvalStatus: 'Draft' });

  // Vendor-less budget lines.
  const biContingency = budgetItem({ categoryId: categoryId('Contingency'), event: 'Both', itemName: 'Emergency contingency', description: 'General buffer for last-minute overruns across any category.', originalBudget: 200000, approvalStatus: 'Approved', approvedBy: 'Groom Father' });
  const biTips = budgetItem({ categoryId: categoryId('Tips & Gratuities'), event: 'Wedding', itemName: 'Vendor staff tips — wedding day', originalBudget: 40000, latestEstimate: 40000, committedAmount: 40000, approvalStatus: 'Approved', approvedBy: 'Groom' });
  const biPostWedding = budgetItem({ categoryId: categoryId('Post Wedding'), event: 'Wedding', itemName: 'Thank-you cards & prints', originalBudget: 30000, approvalStatus: 'Draft' });
  const biJewellery = budgetItem({ categoryId: categoryId('Jewellery & Ceremony Items'), event: 'Wedding', itemName: 'Ceremony rings & ceremony items', originalBudget: 120000, latestEstimate: 120000, approvalStatus: 'Pending Approval' });
  const biLegal = budgetItem({ categoryId: categoryId('Legal & Documentation'), event: 'Both', itemName: 'Marriage registration & documentation', originalBudget: 15000, approvalStatus: 'Draft' });

  const budgetItems: BudgetItem[] = [
    biChurch, biVenue, biCatering, biCake, biDecor, biLighting, biSound, biPhoto, biVideo, biStream, biChoir, biDJ, biEmcee,
    biAccommodation, biTransport, biPrinting, biAttire, biGrooming, biSecurity, biValet,
    biContingency, biTips, biPostWedding, biJewellery, biLegal,
  ];

  // ---------------------------------------------------------------------
  // Payment schedules (30 total).
  // ---------------------------------------------------------------------
  function schedule(v: Vendor, budgetItemRef: BudgetItem | undefined, c: Contract | undefined, input: Omit<PaymentSchedule, 'id' | 'vendorId' | 'budgetItemId' | 'contractId' | 'createdAt' | 'updatedAt'>): PaymentSchedule {
    return { ...input, id: generateId('paysched'), vendorId: v.id, budgetItemId: budgetItemRef?.id, contractId: c?.id, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  }

  const scChurchAdvance = schedule(vChurch, biChurch, contracts[0], { milestone: 'Booking Advance', dueDate: '2026-06-15', amount: 40000, status: 'Paid' });
  const scChurchFinal = schedule(vChurch, biChurch, contracts[0], { milestone: 'Final Settlement', dueDate: '2027-01-25', amount: 40000, status: 'Upcoming' });

  const scVenueAdvance = schedule(vVenue, biVenue, contracts[1], { milestone: 'Booking Advance', dueDate: '2026-06-10', amount: 150000, status: 'Paid' });
  const scVenue30Days = schedule(vVenue, biVenue, contracts[1], { milestone: '30 Days Before Event', dueDate: '2026-12-31', amount: 250000, status: 'Upcoming' });
  const scVenueDeposit = schedule(vVenue, biVenue, contracts[1], { milestone: 'Refundable Deposit', dueDate: '2026-06-10', amount: 100000, status: 'Paid' });
  const scVenueFinal = schedule(vVenue, biVenue, contracts[1], { milestone: 'Final Settlement', dueDate: '2027-01-20', amount: 220000, status: 'Upcoming' });

  // Deliberate: partially paid milestone (spec's exact ₹1,00,000 / ₹60,000 example, one payment only).
  const scCateringAdvance = schedule(vCatering, biCatering, contracts[2], { milestone: 'Booking Advance', dueDate: '2026-07-01', amount: 100000, status: 'Partially Paid' });
  const scCatering7Days = schedule(vCatering, biCatering, contracts[2], { milestone: '7 Days Before Event', dueDate: '2027-01-23', amount: 400000, status: 'Upcoming' });
  const scCateringFinal = schedule(vCatering, biCatering, contracts[2], { milestone: 'Final Settlement', dueDate: '2027-01-22', amount: 360000, status: 'Upcoming' });

  const scCakeAdvance = schedule(vCake, biCake, contracts[3], { milestone: 'Booking Advance', dueDate: '2026-07-05', amount: 15000, status: 'Paid' });
  const scCakeFinal = schedule(vCake, biCake, contracts[3], { milestone: 'Final Settlement', dueDate: '2027-01-25', amount: 27000, status: 'Upcoming' });

  // Deliberate: overdue payment — advance was due before "today" and nothing has been paid.
  const scLightingAdvance = schedule(vLighting, biLighting, contracts[4], { milestone: 'Booking Advance', dueDate: '2026-08-01', amount: 100000, status: 'Overdue' });
  const scLightingFinal = schedule(vLighting, biLighting, contracts[4], { milestone: 'Final Settlement', dueDate: '2027-01-20', amount: 148500, status: 'Upcoming' });

  const scSoundAdvance = schedule(vSound, biSound, contracts[5], { milestone: 'Booking Advance', dueDate: '2026-07-10', amount: 60000, status: 'Paid' });
  const scSoundFinal = schedule(vSound, biSound, contracts[5], { milestone: 'Final Settlement', dueDate: '2027-01-20', amount: 88400, status: 'Upcoming' });

  const scPhotoAdvance = schedule(vPhotoShutter, biPhoto, contracts[6], { milestone: 'Booking Advance', dueDate: '2026-06-20', amount: 80000, status: 'Paid' });
  const scPhotoFinal = schedule(vPhotoShutter, biPhoto, contracts[6], { milestone: 'Final Settlement', dueDate: '2027-02-10', amount: 131700, status: 'Upcoming' });

  const scVideoAdvance = schedule(vVideo, biVideo, contracts[7], { milestone: 'Booking Advance', dueDate: '2026-06-22', amount: 60000, status: 'Paid' });
  const scVideoFinal = schedule(vVideo, biVideo, contracts[7], { milestone: 'Final Settlement', dueDate: '2027-02-10', amount: 109600, status: 'Upcoming' });

  const scStreamAdvance = schedule(vStream, biStream, contracts[8], { milestone: 'Booking Advance', dueDate: '2026-07-15', amount: 47700, status: 'Paid' });

  const scChoirAdvance = schedule(vChoir, biChoir, contracts[9], { milestone: 'Booking Advance', dueDate: '2026-07-20', amount: 80000, status: 'Paid' });

  const scEmceeAdvance = schedule(vEmcee, biEmcee, contracts[10], { milestone: 'Booking Advance', dueDate: '2026-07-25', amount: 25000, status: 'Paid' });

  const scAccommodationAdvance = schedule(vAccommodation, biAccommodation, contracts[11], { milestone: 'Booking Advance', dueDate: '2026-06-20', amount: 200000, status: 'Paid' });
  const scAccommodationFinal = schedule(vAccommodation, biAccommodation, contracts[11], { milestone: 'Final Settlement', dueDate: '2027-01-20', amount: 336400, status: 'Upcoming' });

  // Deliberate: large cash payment example on the advance below.
  const scTransportAdvance = schedule(vTransport, biTransport, contracts[12], { milestone: 'Booking Advance', dueDate: '2026-07-18', amount: 60000, status: 'Paid' });
  const scTransportEventDay = schedule(vTransport, biTransport, contracts[12], { milestone: 'Event Day', dueDate: '2027-01-30', amount: 104300, status: 'Upcoming' });

  const scPrintingAdvance = schedule(vPrinting, biPrinting, contracts[13], { milestone: 'Booking Advance', dueDate: '2026-05-25', amount: 29150, status: 'Paid' });
  const scPrintingFinal = schedule(vPrinting, biPrinting, contracts[13], { milestone: 'Final Settlement', dueDate: '2026-08-01', amount: 29150, status: 'Paid' });

  const scAttireAdvance = schedule(vAttire, biAttire, contracts[14], { milestone: 'Booking Advance', dueDate: '2026-06-25', amount: 150000, status: 'Paid' });
  const scAttireFinal = schedule(vAttire, biAttire, contracts[14], { milestone: 'Final Settlement', dueDate: '2027-01-15', amount: 141200, status: 'Upcoming' });

  // Décor has a tentative payment schedule even though no contract is signed yet — part of why it reads as "At Risk" rather than fully unstarted.
  const scDecorAdvance = schedule(vDecor, biDecor, undefined, { milestone: 'Booking Advance', dueDate: '2026-12-15', amount: 100000, status: 'Upcoming', notes: 'Tentative — pending contract signature.' });

  const paymentSchedules: PaymentSchedule[] = [
    scChurchAdvance, scChurchFinal,
    scVenueAdvance, scVenue30Days, scVenueDeposit, scVenueFinal,
    scCateringAdvance, scCatering7Days, scCateringFinal,
    scCakeAdvance, scCakeFinal,
    scDecorAdvance,
    scLightingAdvance, scLightingFinal,
    scSoundAdvance, scSoundFinal,
    scPhotoAdvance, scPhotoFinal,
    scVideoAdvance, scVideoFinal,
    scStreamAdvance,
    scChoirAdvance,
    scEmceeAdvance,
    scAccommodationAdvance, scAccommodationFinal,
    scTransportAdvance, scTransportEventDay,
    scPrintingAdvance, scPrintingFinal,
    scAttireAdvance, scAttireFinal,
  ];

  // ---------------------------------------------------------------------
  // Payments (matching the Paid/Partially Paid schedules above).
  // ---------------------------------------------------------------------
  function payment(v: Vendor, budgetItemRef: BudgetItem | undefined, sched: PaymentSchedule | undefined, input: Omit<Payment, 'id' | 'vendorId' | 'budgetItemId' | 'paymentScheduleId' | 'createdAt' | 'updatedAt'>): Payment {
    return { ...input, id: generateId('payment'), vendorId: v.id, budgetItemId: budgetItemRef?.id, paymentScheduleId: sched?.id, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  }

  const payments: Payment[] = [
    payment(vChurch, biChurch, scChurchAdvance, { paymentDate: '2026-06-14', amount: 40000, paymentMethod: 'Bank Transfer', referenceNumber: 'TXN-CH-0001', invoiceReceived: true, invoiceReference: 'INV-SSFC-001', receiptReceived: true, receiptReference: 'RCPT-SSFC-001', paidBy: 'Groom Father', approvedBy: 'Groom Father' }),
    payment(vVenue, biVenue, scVenueAdvance, { paymentDate: '2026-06-09', amount: 150000, paymentMethod: 'Bank Transfer', referenceNumber: 'TXN-GCH-0002', invoiceReceived: true, invoiceReference: 'INV-GCH-014', receiptReceived: true, receiptReference: 'RCPT-GCH-014', paidBy: 'Groom Father', approvedBy: 'Groom Father' }),
    payment(vVenue, biVenue, scVenueDeposit, { paymentDate: '2026-06-09', amount: 100000, paymentMethod: 'Bank Transfer', referenceNumber: 'TXN-GCH-0003', invoiceReceived: true, invoiceReference: 'INV-GCH-014-DEP', receiptReceived: true, receiptReference: 'RCPT-GCH-014-DEP', paidBy: 'Groom Father', approvedBy: 'Groom Father', notes: 'Refundable deposit — see Refunds.' }),
    // Deliberate: partial payment 1 of 2 (only one recorded, leaving the milestone Partially Paid).
    payment(vCatering, biCatering, scCateringAdvance, { paymentDate: '2026-07-05', amount: 60000, paymentMethod: 'UPI', referenceNumber: 'TXN-SRC-0004', invoiceReceived: true, invoiceReference: 'INV-SRC-102-1', receiptReceived: false, paidBy: 'Groom Mother', approvedBy: 'Groom Mother', notes: 'First of two advance installments — balance ₹40,000 still due.' }),
    payment(vCake, biCake, scCakeAdvance, { paymentDate: '2026-07-04', amount: 15000, paymentMethod: 'UPI', referenceNumber: 'TXN-SSC-0005', invoiceReceived: true, invoiceReference: 'INV-SSC-030', receiptReceived: true, receiptReference: 'RCPT-SSC-030', paidBy: 'Bride', approvedBy: 'Bride' }),
    payment(vSound, biSound, scSoundAdvance, { paymentDate: '2026-07-09', amount: 60000, paymentMethod: 'Bank Transfer', referenceNumber: 'TXN-CSA-0006', invoiceReceived: true, invoiceReference: 'INV-CSA-021', receiptReceived: true, receiptReference: 'RCPT-CSA-021', paidBy: 'Groom', approvedBy: 'Groom' }),
    payment(vPhotoShutter, biPhoto, scPhotoAdvance, { paymentDate: '2026-06-19', amount: 80000, paymentMethod: 'UPI', referenceNumber: 'TXN-SSP-0007', invoiceReceived: true, invoiceReference: 'INV-SSP-501', receiptReceived: true, receiptReference: 'RCPT-SSP-501', paidBy: 'Bride', approvedBy: 'Bride' }),
    payment(vVideo, biVideo, scVideoAdvance, { paymentDate: '2026-06-21', amount: 60000, paymentMethod: 'UPI', referenceNumber: 'TXN-RTF-0008', invoiceReceived: true, invoiceReference: 'INV-RTF-077', receiptReceived: true, receiptReference: 'RCPT-RTF-077', paidBy: 'Bride', approvedBy: 'Bride' }),
    payment(vStream, biStream, scStreamAdvance, { paymentDate: '2026-07-14', amount: 47700, paymentMethod: 'Bank Transfer', referenceNumber: 'TXN-SLP-0009', invoiceReceived: true, invoiceReference: 'INV-SLP-012', receiptReceived: true, receiptReference: 'RCPT-SLP-012', paidBy: 'Groom', approvedBy: 'Groom' }),
    payment(vChoir, biChoir, scChoirAdvance, { paymentDate: '2026-07-19', amount: 80000, paymentMethod: 'Cheque', referenceNumber: 'CHQ-VOG-0010', invoiceReceived: false, receiptReceived: true, receiptReference: 'RCPT-VOG-004', paidBy: 'Groom Mother', approvedBy: 'Groom Mother', notes: 'Community choir — donation-style receipt only, no formal invoice.' }),
    payment(vEmcee, biEmcee, scEmceeAdvance, { paymentDate: '2026-07-24', amount: 25000, paymentMethod: 'UPI', referenceNumber: 'TXN-EAV-0011', invoiceReceived: true, invoiceReference: 'INV-EAV-002', receiptReceived: true, receiptReference: 'RCPT-EAV-002', paidBy: 'Groom', approvedBy: 'Groom' }),
    payment(vAccommodation, biAccommodation, scAccommodationAdvance, { paymentDate: '2026-06-19', amount: 200000, paymentMethod: 'Bank Transfer', referenceNumber: 'TXN-MGH-0012', invoiceReceived: true, invoiceReference: 'INV-MGH-090', receiptReceived: true, receiptReference: 'RCPT-MGH-090', paidBy: 'Groom Father', approvedBy: 'Groom Father' }),
    // Deliberate: large cash payment (>= the default ₹50,000 threshold).
    payment(vTransport, biTransport, scTransportAdvance, { paymentDate: '2026-07-17', amount: 60000, paymentMethod: 'Cash', referenceNumber: 'CASH-DT-0013', invoiceReceived: true, invoiceReference: 'INV-DT-210', receiptReceived: true, receiptReference: 'RCPT-DT-210', paidBy: 'Groom', approvedBy: 'Groom', notes: 'Paid in cash at vendor office — large-cash threshold applies.' }),
    payment(vPrinting, biPrinting, scPrintingAdvance, { paymentDate: '2026-05-24', amount: 29150, paymentMethod: 'UPI', referenceNumber: 'TXN-PCI-0014', invoiceReceived: true, invoiceReference: 'INV-PCI-060-1', receiptReceived: true, receiptReference: 'RCPT-PCI-060-1', paidBy: 'Bride', approvedBy: 'Bride' }),
    payment(vPrinting, biPrinting, scPrintingFinal, { paymentDate: '2026-07-30', amount: 29150, paymentMethod: 'UPI', referenceNumber: 'TXN-PCI-0015', invoiceReceived: true, invoiceReference: 'INV-PCI-060-2', receiptReceived: true, receiptReference: 'RCPT-PCI-060-2', paidBy: 'Bride', approvedBy: 'Bride', notes: 'Final settlement — fully paid, vendor engagement complete.' }),
    payment(vAttire, biAttire, scAttireAdvance, { paymentDate: '2026-06-24', amount: 150000, paymentMethod: 'Bank Transfer', referenceNumber: 'TXN-ZBC-0016', invoiceReceived: true, invoiceReference: 'INV-ZBC-041', receiptReceived: true, receiptReference: 'RCPT-ZBC-041', paidBy: 'Bride', approvedBy: 'Bride' }),
    // Vendor-less budget line settled directly (no schedule/vendor link needed for a lump-sum tip pool).
    payment(vCatering, biTips, undefined, { paymentDate: '2026-08-05', amount: 40000, paymentMethod: 'Cash', referenceNumber: 'CASH-TIPS-0017', invoiceReceived: false, receiptReceived: false, paidBy: 'Groom', approvedBy: 'Groom', notes: 'Tip pool set aside for wedding-day vendor staff — distributed on the day.' }),
  ];

  // ---------------------------------------------------------------------
  // Refunds.
  // ---------------------------------------------------------------------
  function refund(v: Vendor, c: Contract | undefined, p: Payment | undefined, input: Omit<Refund, 'id' | 'vendorId' | 'contractId' | 'paymentId' | 'createdAt' | 'updatedAt'>): Refund {
    return { ...input, id: generateId('refund'), vendorId: v.id, contractId: c?.id, paymentId: p?.id, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  }

  const refunds: Refund[] = [
    // Deliberate: expected refundable deposit, nothing received yet.
    refund(vVenue, contracts[1], payments[2], { refundType: 'Refundable Deposit', expectedAmount: 100000, expectedDate: '2027-02-10', status: 'Expected', notes: 'Refundable within 14 days after the event, subject to no damages.' }),
    // Deliberate: partially received refund.
    refund(vAccommodation, contracts[11], undefined, { refundType: 'Overpayment Refund', expectedAmount: 20000, expectedDate: '2026-08-05', receivedAmount: 12000, receivedDate: '2026-08-12', status: 'Partially Received', referenceNumber: 'RFD-MGH-0001', notes: 'Room block adjusted down after final headcount — partial refund received, balance pending.' }),
    refund(vLighting, contracts[4], undefined, { refundType: 'Cancellation Refund', expectedAmount: 15000, expectedDate: '2026-07-15', receivedAmount: 15000, receivedDate: '2026-07-18', status: 'Received', referenceNumber: 'RFD-LEL-0002', notes: 'Scaled-down rig after design change — full refund of the difference received.' }),
    refund(vChurch, contracts[0], undefined, { refundType: 'Other', expectedAmount: 5000, status: 'Waived', notes: 'Small courtesy credit waived in goodwill by the parish.' }),
  ];

  return {
    vendors,
    vendorContacts,
    vendorQuotes,
    contracts,
    budgetCategories,
    budgetItems,
    paymentSchedules,
    payments,
    refunds,
  };
}
