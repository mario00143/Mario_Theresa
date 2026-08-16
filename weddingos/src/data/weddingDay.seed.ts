/**
 * Fictional demo data only. All names, phone numbers, and locations are
 * placeholders — emergency-contact phone numbers deliberately reuse the
 * same obviously-synthetic "+91 90000 …" block already used for vendor
 * contacts elsewhere in the seed data, never real emergency-service
 * numbers (section 24).
 *
 * Deliberately includes the edge cases called out in the Phase 6 spec
 * (section 42): one delayed run-sheet item with a dependency chain that
 * would be impacted by carrying the delay forward, one high-severity issue
 * open (also modeling the route exception — the décor team's vendor
 * transport that was already cancelled in Phase 3's logistics seed), one
 * critical vendor (catering) running late, one ceremony item (the bridal
 * bouquet) currently in transit, one critical duty role (Ceremony Item
 * Custodian) with no backup assigned, and one closeout item in Exception
 * status. Nothing here is designed to make the demo look catastrophically
 * broken — most issues are already resolved and most vendors/items are on
 * track.
 */
import type {
  CeremonyItem,
  CeremonyItemMovement,
  CeremonyParticipant,
  ChurchProfile,
  CloseoutItem,
  DutyAssignment,
  EmergencyContact,
  EmergencyResponseCard,
  FinalReadinessReview,
  GuestOperationalStatus,
  Guest,
  Hotel,
  LiveIssue,
  ManifestFreezeState,
  RunSheetCategory,
  RunSheetItem,
  AppSettings,
  TransportRoute,
  Vendor,
  VendorContact,
  VendorDayStatus,
} from '@/types';
import { generateId } from '@/lib/id';

export interface WeddingDaySeedBundle {
  runSheetItems: RunSheetItem[];
  liveIssues: LiveIssue[];
  dutyAssignments: DutyAssignment[];
  vendorDayStatuses: VendorDayStatus[];
  ceremonyItemMovements: CeremonyItemMovement[];
  emergencyContacts: EmergencyContact[];
  emergencyResponseCards: EmergencyResponseCard[];
  closeoutItems: CloseoutItem[];
  finalReadinessReviews: FinalReadinessReview[];
  guestOperationalStatuses: GuestOperationalStatus[];
  manifestFreezeStates: ManifestFreezeState[];
}

const SEED_CREATED_AT = '2026-07-20T09:00:00.000Z';
const WEDDING_DATE = '2027-01-30';

function findVendor(vendors: Vendor[], name: string): string {
  const id = vendors.find((v) => v.name === name)?.id;
  if (!id) throw new Error(`Seed data error: vendor "${name}" not found`);
  return id;
}
function findVendorContact(contacts: VendorContact[], name: string): VendorContact | undefined {
  return contacts.find((c) => c.name === name);
}
function findHotel(hotels: Hotel[], name: string): string {
  const id = hotels.find((h) => h.name === name)?.id;
  if (!id) throw new Error(`Seed data error: hotel "${name}" not found`);
  return id;
}
function findRoute(routes: TransportRoute[], name: string): string {
  const id = routes.find((r) => r.name === name)?.id;
  if (!id) throw new Error(`Seed data error: transport route "${name}" not found`);
  return id;
}
function findParticipant(participants: CeremonyParticipant[], role: string, name?: string): string {
  const id = participants.find((p) => p.role === role && (!name || p.name === name))?.id;
  if (!id) throw new Error(`Seed data error: ceremony participant "${role}"/"${name}" not found`);
  return id;
}
function findItem(items: CeremonyItem[], name: string): string {
  const id = items.find((i) => i.name === name)?.id;
  if (!id) throw new Error(`Seed data error: ceremony item "${name}" not found`);
  return id;
}
function findGuest(guests: Guest[], name: string): string {
  const id = guests.find((g) => g.fullName === name)?.id;
  if (!id) throw new Error(`Seed data error: guest "${name}" not found`);
  return id;
}

export function buildSeedWeddingDay(
  _settings: AppSettings,
  guests: Guest[],
  vendors: Vendor[],
  vendorContacts: VendorContact[],
  hotels: Hotel[],
  transportRoutes: TransportRoute[],
  churchProfiles: ChurchProfile[],
  ceremonyParticipants: CeremonyParticipant[],
  ceremonyItems: CeremonyItem[],
): WeddingDaySeedBundle {
  const church = churchProfiles[0];

  // ---------------------------------------------------------------------
  // Run sheet.
  // ---------------------------------------------------------------------
  type Timing = { fixedTime: string } | { rel: 'C' | 'R'; offset: number };

  function runSheetItem(activity: string, category: RunSheetCategory, timing: Timing, opts: Partial<RunSheetItem> = {}): RunSheetItem {
    const base: RunSheetItem = {
      id: generateId('runsheet'),
      event: 'Wedding',
      date: WEDDING_DATE,
      relativeReference: 'None',
      activity,
      category,
      status: 'Planned',
      participantIds: [],
      vendorIds: [],
      requiredItemIds: [],
      relatedTaskIds: [],
      relatedTransportRouteIds: [],
      dependencyIds: [],
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
    if ('fixedTime' in timing) {
      return { ...base, startTime: timing.fixedTime, ...opts };
    }
    return { ...base, relativeReference: timing.rel === 'C' ? 'Ceremony Start' : 'Reception Start', relativeOffsetMinutes: timing.offset, ...opts };
  }

  const vDecor = findVendor(vendors, 'Petal & Stem Décor');
  const vLighting = findVendor(vendors, 'Luminous Events Lighting');
  const vGrooming = findVendor(vendors, 'Glow Studio Grooming');
  const vAttire = findVendor(vendors, 'Zoya Bridal Couture');
  const vPhotoShutter = findVendor(vendors, 'Shutter Stories Photography');
  const vVideo = findVendor(vendors, 'Reel Tales Films');
  const vChoir = findVendor(vendors, 'Voices of Grace Choir');
  const vSound = findVendor(vendors, 'ClearSound AV Solutions');
  const vVenue = findVendor(vendors, 'Grand Celebration Hall');
  const vCatering = findVendor(vendors, 'Spice Route Caterers');
  const vCake = findVendor(vendors, 'Sweet Symphony Cakes');
  const vEmcee = findVendor(vendors, 'Emcee Ansh Varma');
  const vDJ = findVendor(vendors, 'DJ Rhythm Nation');
  const vSecurity = findVendor(vendors, 'SecureGuard Services');
  const vValet = findVendor(vendors, 'Golden Hands Valet & Parking');

  const hMarigold = findHotel(hotels, 'Marigold Grand Hyderabad');
  const rChurchShuttle = findRoute(transportRoutes, 'Church Shuttle - Wedding Day');
  const rReceptionShuttle = findRoute(transportRoutes, 'Reception Shuttle - Wedding Day');
  const rVendorTransport = findRoute(transportRoutes, 'Vendor Transport - Décor Team');

  const pGroom = findParticipant(ceremonyParticipants, 'Groom');
  const pBride = findParticipant(ceremonyParticipants, 'Bride');
  const pClergy = findParticipant(ceremonyParticipants, 'Clergy');
  const pRingCustodian = findParticipant(ceremonyParticipants, 'Ring Custodian');
  const pUsher = findParticipant(ceremonyParticipants, 'Usher');
  const pChoirLead = findParticipant(ceremonyParticipants, 'Choir Lead');
  const pReader1 = findParticipant(ceremonyParticipants, 'Reader', 'Anoop Kurien');
  const pReader2 = findParticipant(ceremonyParticipants, 'Reader', 'Divya Joseph');
  const pWitness1 = findParticipant(ceremonyParticipants, 'Witness', 'Jerin Alex');
  const pWitness2 = findParticipant(ceremonyParticipants, 'Witness', 'Neha Varghese');
  const pFamilyPhotoCoordinator = findParticipant(ceremonyParticipants, 'Family Photo Coordinator');

  const iRings = findItem(ceremonyItems, 'Wedding rings (pair)');
  const iMinnu = findItem(ceremonyItems, 'Minnu (traditional pendant)');
  const iChain = findItem(ceremonyItems, 'Minnu chain / thread');
  const iManthrakodi = findItem(ceremonyItems, 'Manthrakodi');
  const iReading1 = findItem(ceremonyItems, 'First reading card');
  const iReading2 = findItem(ceremonyItems, 'Second reading card');
  const iMarriageDocs = findItem(ceremonyItems, 'Marriage documents folder');
  const iRegisterCopy = findItem(ceremonyItems, 'Marriage register copy for records');

  const rChurchAccess = runSheetItem('Church décor team access begins', 'Church', { fixedTime: church?.accessStartTime ?? '07:00' }, {
    vendorIds: [vDecor],
    owner: 'Décor Lead',
    location: church?.churchName ?? 'Church',
  });
  const rGroomAttireCheck = runSheetItem("Groom's attire check", 'Groom Preparation', { fixedTime: '07:45' }, {
    vendorIds: [vAttire],
    owner: 'Groom Personal Assistant',
    location: "Groom's residence",
  });
  const rShuttleDeparts = runSheetItem('Church Shuttle departs hotel for church', 'Transport', { fixedTime: '07:30' }, {
    relatedTransportRouteIds: [rChurchShuttle],
    owner: 'Transport Dispatch',
    location: hMarigold ? 'Marigold Grand Hyderabad' : 'Hotel',
    // Deliberate scenario: this item is running late.
    status: 'Delayed',
    delayMinutes: 15,
    notes: 'Delay: traffic near Banjara Hills junction.',
  });
  const rShuttleArrives = runSheetItem('Church Shuttle arrives at church', 'Transport', { fixedTime: '08:15' }, {
    relatedTransportRouteIds: [rChurchShuttle],
    owner: 'Transport Dispatch',
    location: church?.churchName ?? 'Church',
    dependencyIds: [rShuttleDeparts.id],
    contingencyAction: 'If arrival slips past 08:45, notify Church Lead to hold the bride-party arrival window.',
  });
  const rBridePartyWindow = runSheetItem('Bride-party arrival window begins', 'Guest Arrival', { fixedTime: '09:50' }, {
    owner: 'Church Lead',
    location: church?.churchName ?? 'Church',
    dependencyIds: [rShuttleArrives.id],
  });
  const rGroomLeaves = runSheetItem('Groom leaves hotel for church', 'Groom Preparation', { fixedTime: '09:20' }, {
    owner: 'Groom Personal Assistant',
    participantIds: [pGroom],
    dependencyIds: [rGroomAttireCheck.id],
  });
  const rGroomArrives = runSheetItem('Groom arrives at church', 'Church', { fixedTime: '09:45' }, {
    owner: 'Church Lead',
    participantIds: [pGroom],
    dependencyIds: [rGroomLeaves.id],
  });
  const rCeremonyBegins = runSheetItem('Ceremony begins', 'Ceremony', { rel: 'C', offset: 0 }, {
    owner: 'Ceremony Lead',
    participantIds: [pGroom, pBride, pClergy],
    cue: 'Organist begins processional hymn on Ceremony Coordinator\'s signal.',
  });
  const rRingExchange = runSheetItem('Ring exchange', 'Ceremony', { rel: 'C', offset: 35 }, {
    owner: 'Ceremony Lead',
    participantIds: [pGroom, pBride, pClergy, pRingCustodian],
    requiredItemIds: [iRings],
    dependencyIds: [rCeremonyBegins.id],
  });
  const rMinnuSequence = runSheetItem('Minnu/manthrakodi sequence if applicable', 'Ceremony', { rel: 'C', offset: 40 }, {
    owner: 'Ceremony Lead',
    participantIds: [pGroom, pBride, pClergy],
    requiredItemIds: [iMinnu, iChain, iManthrakodi],
    dependencyIds: [rRingExchange.id],
    contingencyAction: 'Proceed directly to register signing if the family confirms minnu/manthrakodi is not applicable for this ceremony.',
  });
  const rRegisterSigning = runSheetItem('Marriage register signing', 'Ceremony', { rel: 'C', offset: 50 }, {
    owner: 'Groom Father',
    location: 'Sacristy',
    participantIds: [pGroom, pBride, pWitness1, pWitness2],
    requiredItemIds: [iMarriageDocs, iRegisterCopy],
    dependencyIds: [rMinnuSequence.id],
  });

  const runSheetItems: RunSheetItem[] = [
    runSheetItem("Groom's wake-up", 'Groom Preparation', { fixedTime: '04:30' }, { owner: 'Groom Personal Assistant', location: "Groom's residence" }),
    runSheetItem('Reception venue decorator access begins', 'Décor / Production', { fixedTime: '05:00' }, { vendorIds: [vDecor, vLighting], owner: 'Décor Lead', location: 'Grand Celebration Hall' }),
    runSheetItem("Groom's breakfast", 'Groom Preparation', { fixedTime: '05:30' }, { owner: 'Family Volunteer', location: "Groom's residence" }),
    runSheetItem('Groom grooming appointment begins', 'Groom Preparation', { fixedTime: '06:00' }, { vendorIds: [vGrooming], owner: 'Groom Personal Assistant', location: "Groom's residence" }),
    runSheetItem('Bridal hair & makeup begins', 'Family Preparation', { fixedTime: '06:15' }, { vendorIds: [vGrooming], owner: 'Bride-Family Liaison', location: "Bride's residence" }),
    runSheetItem("Flower delivery to bride's residence", 'Décor / Production', { fixedTime: '06:30' }, { vendorIds: [vDecor], owner: 'Décor Lead', location: "Bride's residence" }),
    rChurchAccess,
    runSheetItem('Church setup verification (florals & aisle runner)', 'Church', { fixedTime: '07:15' }, { vendorIds: [vDecor], owner: 'Church Lead', location: church?.churchName ?? 'Church', dependencyIds: [rChurchAccess.id] }),
    runSheetItem("Photographer arrival at groom's location", 'Photography', { fixedTime: '07:20' }, { vendorIds: [vPhotoShutter], owner: 'Family Photo Coordinator', location: "Groom's residence" }),
    rShuttleDeparts,
    runSheetItem("Photographer arrival at bride's location", 'Photography', { fixedTime: '07:35' }, { vendorIds: [vPhotoShutter], owner: 'Family Photo Coordinator', location: "Bride's residence" }),
    rGroomAttireCheck,
    runSheetItem('Wedding rings verification and custody handover', 'Ceremony', { fixedTime: '08:00' }, { requiredItemIds: [iRings], participantIds: [pRingCustodian], owner: 'Ceremony Item Custodian' }),
    rShuttleArrives,
    runSheetItem('Minnu/manthrakodi verification if applicable', 'Ceremony', { fixedTime: '08:15' }, {
      requiredItemIds: [iMinnu, iManthrakodi],
      owner: 'Ceremony Item Custodian',
      contingencyAction: 'Skip presentation step if family confirms not applicable at this final check.',
    }),
    runSheetItem("Family readiness check — groom's side", 'Family Preparation', { fixedTime: '08:30' }, { owner: 'Groom Personal Assistant', location: "Groom's residence" }),
    runSheetItem('Videographer arrival and equipment setup at church', 'Photography', { fixedTime: '08:35' }, { vendorIds: [vVideo], owner: 'Family Photo Coordinator', location: church?.churchName ?? 'Church' }),
    runSheetItem('Ushers arrive at church', 'Church', { fixedTime: '08:45' }, { participantIds: [pUsher], owner: 'Church Lead', location: church?.churchName ?? 'Church' }),
    runSheetItem('Choir check-in and warm-up', 'Music / AV', { fixedTime: '08:50' }, { vendorIds: [vChoir], participantIds: [pChoirLead], owner: 'Church Lead', location: church?.churchName ?? 'Church' }),
    runSheetItem('Clergy confirmation call', 'Church', { fixedTime: '09:00' }, { participantIds: [pClergy], owner: 'Clergy Coordinator' }),
    runSheetItem('AV/sound check at church', 'Music / AV', { fixedTime: '09:10' }, { vendorIds: [vSound], owner: 'Church Lead', location: church?.churchName ?? 'Church' }),
    runSheetItem('Guest buses depart hotel for church', 'Transport', { fixedTime: '09:15' }, { owner: 'Transport Dispatch', location: 'Marigold Grand Hyderabad' }),
    rGroomLeaves,
    rGroomArrives,
    rBridePartyWindow,
    runSheetItem('Processional lineup', 'Ceremony', { rel: 'C', offset: -5 }, { owner: 'Ceremony Lead', location: church?.churchName ?? 'Church' }),
    rCeremonyBegins,
    runSheetItem('Scripture readings', 'Ceremony', { rel: 'C', offset: 5 }, { participantIds: [pReader1, pReader2], requiredItemIds: [iReading1, iReading2], owner: 'Ceremony Lead' }),
    runSheetItem('Homily', 'Ceremony', { rel: 'C', offset: 15 }, { participantIds: [pClergy], owner: 'Ceremony Lead' }),
    runSheetItem('Exchange of vows', 'Ceremony', { rel: 'C', offset: 30 }, { participantIds: [pGroom, pBride, pClergy], owner: 'Ceremony Lead', dependencyIds: [rCeremonyBegins.id] }),
    rRingExchange,
    rMinnuSequence,
    rRegisterSigning,
    runSheetItem('Recessional', 'Ceremony', { rel: 'C', offset: 60 }, { participantIds: [pGroom, pBride], owner: 'Ceremony Lead', dependencyIds: [rRegisterSigning.id] }),
    runSheetItem('Church family photographs', 'Photography', { rel: 'C', offset: 65 }, { vendorIds: [vPhotoShutter, vVideo], participantIds: [pFamilyPhotoCoordinator], owner: 'Family Photo Coordinator' }),
    runSheetItem('Couple departure from church', 'Church', { rel: 'C', offset: 95 }, { participantIds: [pGroom, pBride], owner: 'Church Lead' }),
    runSheetItem('Reception Shuttle departs church for venue', 'Transport', { rel: 'C', offset: 150 }, { relatedTransportRouteIds: [rReceptionShuttle], owner: 'Transport Dispatch' }),
    runSheetItem('Guest buses depart church for reception venue', 'Transport', { rel: 'C', offset: 120 }, { owner: 'Transport Dispatch' }),
    runSheetItem('Reception venue final walkthrough', 'Décor / Production', { rel: 'C', offset: 130 }, { vendorIds: [vVenue, vDecor], owner: 'Day-of Command Lead', location: 'Grand Celebration Hall' }),
    runSheetItem('Reception Shuttle arrives at venue', 'Transport', { rel: 'C', offset: 180 }, { relatedTransportRouteIds: [rReceptionShuttle], owner: 'Transport Dispatch', location: 'Grand Celebration Hall' }),
    runSheetItem('AV soundcheck at reception', 'Music / AV', { fixedTime: '14:00' }, { vendorIds: [vSound, vDJ], owner: 'Day-of Command Lead', location: 'Grand Celebration Hall' }),
    runSheetItem('Cake delivery and setup', 'Catering', { fixedTime: '14:30' }, { vendorIds: [vCake], owner: 'Vendor Payment Custodian', location: 'Grand Celebration Hall' }),
    runSheetItem('Catering final readiness check', 'Catering', { fixedTime: '15:00' }, { vendorIds: [vCatering], owner: 'Day-of Command Lead', location: 'Grand Celebration Hall' }),
    runSheetItem('Emcee arrival and briefing', 'Reception', { fixedTime: '15:30' }, { vendorIds: [vEmcee], owner: 'Day-of Command Lead', location: 'Grand Celebration Hall' }),
    runSheetItem('Security briefing and post assignment', 'Other', { fixedTime: '16:00' }, { vendorIds: [vSecurity], owner: 'Day-of Command Lead', location: 'Grand Celebration Hall' }),
    runSheetItem('Valet/parking team setup', 'Other', { fixedTime: '16:30' }, { vendorIds: [vValet], owner: 'Parking Coordinator', location: 'Grand Celebration Hall' }),
    runSheetItem('Welcome / registration desk opens', 'Guest Arrival', { fixedTime: '17:00' }, { owner: 'Guest Registration', location: 'Grand Celebration Hall' }),
    runSheetItem('Vendor meal check', 'Vendor', { fixedTime: '17:30' }, { vendorIds: [vCatering], owner: 'Day-of Command Lead', location: 'Grand Celebration Hall' }),
    runSheetItem('Family/VIP arrival at reception', 'Guest Arrival', { rel: 'R', offset: -60 }, { owner: 'Guest Registration', location: 'Grand Celebration Hall' }),
    runSheetItem('DJ/band soundcheck completion deadline', 'Music / AV', { rel: 'R', offset: -30 }, { vendorIds: [vDJ], owner: 'Day-of Command Lead' }),
    runSheetItem('Groom & bride car decoration check', 'Transport', { rel: 'R', offset: -15 }, { vendorIds: [vDecor], owner: 'Transport Dispatch' }),
    runSheetItem('Couple reception arrival / grand entrance', 'Reception', { rel: 'R', offset: 0 }, { participantIds: [pGroom, pBride], owner: 'Day-of Command Lead', cue: 'Emcee announces the couple as they enter.' }),
    runSheetItem('Welcome prayer', 'Reception', { rel: 'R', offset: 10 }, { participantIds: [pClergy], owner: 'Ceremony Lead' }),
    runSheetItem('Speeches', 'Reception', { rel: 'R', offset: 20 }, { vendorIds: [vEmcee], owner: 'Day-of Command Lead' }),
    runSheetItem('Cake cutting', 'Reception', { rel: 'R', offset: 45 }, { participantIds: [pGroom, pBride], owner: 'Day-of Command Lead' }),
    runSheetItem('Meal service opens', 'Catering', { rel: 'R', offset: 60 }, { vendorIds: [vCatering], owner: 'Day-of Command Lead' }),
    runSheetItem('Table rounds and family photographs', 'Photography', { rel: 'R', offset: 90 }, { vendorIds: [vPhotoShutter], owner: 'Family Photo Coordinator' }),
    runSheetItem('First dance', 'Reception', { rel: 'R', offset: 120 }, { participantIds: [pGroom, pBride], vendorIds: [vDJ], owner: 'Day-of Command Lead' }),
    runSheetItem('Guest transport dispatch begins', 'Transport', { rel: 'R', offset: 150 }, { owner: 'Transport Dispatch' }),
    runSheetItem('Gifts / envelopes handover to custodian', 'Gift / Hospitality', { rel: 'R', offset: 180 }, { owner: 'Gift / Cash Custodian' }),
    runSheetItem('Hotel return buses depart', 'Transport', { rel: 'R', offset: 195 }, { owner: 'Transport Dispatch', location: 'Grand Celebration Hall' }),
    runSheetItem('Final vendor settlement checks begin', 'Vendor', { rel: 'R', offset: 210 }, { vendorIds: [vCatering, vDecor, vSound], owner: 'Vendor Payment Custodian' }),
    runSheetItem('Venue closeout walkthrough begins', 'Closeout', { rel: 'R', offset: 240 }, { owner: 'Venue Closeout Lead', location: 'Grand Celebration Hall' }),
    runSheetItem('Lost-and-found handover', 'Closeout', { rel: 'R', offset: 255 }, { owner: 'Lost & Found Custodian' }),
    runSheetItem('Final valuables and cash handover', 'Closeout', { rel: 'R', offset: 270 }, { owner: 'Gift / Cash Custodian' }),
  ];

  // ---------------------------------------------------------------------
  // Live issues.
  // ---------------------------------------------------------------------
  function issue(input: Omit<LiveIssue, 'id' | 'createdAt' | 'updatedAt' | 'followUpRequired'> & Partial<Pick<LiveIssue, 'followUpRequired'>>): LiveIssue {
    return { followUpRequired: false, ...input, id: generateId('issue'), createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  }

  const liveIssues: LiveIssue[] = [
    issue({
      title: "Décor team vendor transport still needs a replacement vehicle",
      description: 'The van assigned to move décor materials went out of service; the route was cancelled and needs a replacement vehicle before wedding week.',
      category: 'Transport',
      severity: 'High',
      status: 'Investigating',
      reportedAt: '2027-01-15T10:00:00.000Z',
      reportedBy: 'Transport Dispatch',
      owner: 'Transport Dispatch',
      backupOwner: 'Day-of Command Lead',
      relatedTransportRouteId: rVendorTransport,
      relatedVendorId: vDecor,
      mitigation: 'Requested a replacement vehicle from Deccan Travels; awaiting confirmation.',
    }),
    issue({
      title: 'Spare umbrellas requested for outdoor photo session',
      description: 'Forecast shows a small chance of light rain during the church family photo session.',
      category: 'Weather',
      severity: 'Medium',
      status: 'Open',
      reportedAt: '2027-01-28T08:00:00.000Z',
      reportedBy: 'Family Photo Coordinator',
      owner: 'Family Photo Coordinator',
    }),
    issue({
      title: 'Guest name misspelled on welcome sign',
      category: 'Guest',
      severity: 'Low',
      status: 'Resolved',
      reportedAt: '2027-01-20T09:00:00.000Z',
      resolvedAt: '2027-01-20T11:00:00.000Z',
      owner: 'Décor Lead',
      resolution: 'Corrected spelling and reprinted the sign panel.',
    }),
    issue({
      title: 'Minor delay in flower delivery',
      category: 'Décor',
      severity: 'Low',
      status: 'Resolved',
      reportedAt: '2027-01-25T07:00:00.000Z',
      resolvedAt: '2027-01-25T08:00:00.000Z',
      owner: 'Décor Lead',
      relatedVendorId: vDecor,
      resolution: 'Vendor rerouted around traffic; delivered within the buffer window.',
    }),
    issue({
      title: 'AV cable connector missing from the church kit',
      category: 'AV / Music',
      severity: 'Medium',
      status: 'Resolved',
      reportedAt: '2027-01-18T09:00:00.000Z',
      resolvedAt: '2027-01-18T10:30:00.000Z',
      owner: 'Church Lead',
      relatedVendorId: vSound,
      mitigation: 'Used the backup connector from the reception AV kit.',
      resolution: 'Backup connector worked; vendor bringing a spare on the day regardless.',
    }),
    issue({
      title: 'Extra chair needed for VIP table',
      category: 'Guest',
      severity: 'Low',
      status: 'Resolved',
      reportedAt: '2027-01-22T09:00:00.000Z',
      resolvedAt: '2027-01-22T09:30:00.000Z',
      owner: 'Guest Registration',
      resolution: 'Venue added an extra chair at no charge.',
    }),
    issue({
      title: 'Valet parking overflow expected at church',
      category: 'Transport',
      severity: 'Medium',
      status: 'Resolved',
      reportedAt: '2027-01-24T09:00:00.000Z',
      resolvedAt: '2027-01-24T12:00:00.000Z',
      owner: 'Parking Coordinator',
      relatedVendorId: vValet,
      resolution: 'Arranged overflow parking at the adjacent community hall.',
    }),
    issue({
      title: 'Dietary preference confusion at catering tasting',
      category: 'Catering',
      severity: 'Low',
      status: 'Resolved',
      reportedAt: '2027-01-10T09:00:00.000Z',
      resolvedAt: '2027-01-10T11:00:00.000Z',
      owner: 'Day-of Command Lead',
      relatedVendorId: vCatering,
      resolution: 'Clarified allergen list directly with the caterer.',
    }),
    issue({
      title: 'Photographer battery pack left at hotel',
      category: 'Photography',
      severity: 'Medium',
      status: 'Resolved',
      reportedAt: '2027-01-05T08:00:00.000Z',
      resolvedAt: '2027-01-05T09:00:00.000Z',
      owner: 'Family Photo Coordinator',
      relatedVendorId: vPhotoShutter,
      mitigation: 'Sent a driver back to the hotel to retrieve it.',
      resolution: 'Retrieved before the shoot began.',
    }),
    issue({
      title: 'Emcee script had a typo in the family names',
      category: 'Other',
      severity: 'Low',
      status: 'Resolved',
      reportedAt: '2027-01-12T09:00:00.000Z',
      resolvedAt: '2027-01-12T09:15:00.000Z',
      owner: 'Day-of Command Lead',
      relatedVendorId: vEmcee,
      resolution: 'Corrected before final script approval.',
    }),
  ];

  // ---------------------------------------------------------------------
  // Duty roster.
  // ---------------------------------------------------------------------
  function duty(input: Omit<DutyAssignment, 'id' | 'createdAt' | 'updatedAt' | 'status'> & Partial<Pick<DutyAssignment, 'status'>>): DutyAssignment {
    return { status: 'Confirmed', ...input, id: generateId('duty'), createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  }

  const dutyAssignments: DutyAssignment[] = [
    duty({ role: 'Day-of Command Lead', personName: 'Ann Sebastian', phone: '+91 90000 70001', backupPersonName: 'Priya Varghese', backupPhone: '+91 90000 70002', startTime: '04:00', endTime: '23:59', location: 'Mobile — all venues', responsibilities: 'Owns the run sheet end to end; final escalation point for all issues.' }),
    duty({ role: 'Church Lead', personName: 'Vinu Jacob', phone: '+91 90000 70003', backupPersonName: 'Jerin Alex', backupPhone: '+91 90000 70004', startTime: '06:30', endTime: '12:00', location: church?.churchName ?? 'Church' }),
    duty({ role: 'Ceremony Lead', personName: 'Priya Varghese', phone: '+91 90000 70002', backupPersonName: 'Divya Joseph', backupPhone: '+91 90000 70005', startTime: '07:00', endTime: '12:30', location: church?.churchName ?? 'Church' }),
    duty({ role: 'Guest Registration', personName: "Nisha (Bride's cousin)", phone: '+91 90000 70006', backupPersonName: "Arjun (Groom's cousin)", backupPhone: '+91 90000 70007', startTime: '16:30', endTime: '20:00', location: 'Grand Celebration Hall — welcome desk' }),
    duty({ role: 'Hotel Welcome Desk', personName: 'Reji (Family volunteer)', phone: '+91 90000 70008', backupPersonName: 'Tessy (Family volunteer)', backupPhone: '+91 90000 70010', startTime: '06:00', endTime: '22:00', location: 'Marigold Grand Hyderabad' }),
    duty({ role: 'Airport Pickup Coordinator', personName: 'Sunil (Family volunteer)', phone: '+91 90000 70009', backupPersonName: 'Bobby (Family volunteer)', backupPhone: '+91 90000 70012', startTime: '00:00', endTime: '23:00', location: 'RGIA (Hyderabad Airport)' }),
    duty({ role: 'Transport Dispatch', personName: 'Deccan Travels Coordinator', phone: '+91 90000 70011', backupPersonName: 'Bobby (Family volunteer)', backupPhone: '+91 90000 70012', startTime: '05:00', endTime: '23:00', location: 'Mobile' }),
    duty({ role: 'Parking Coordinator', personName: 'Golden Hands Valet Lead', phone: '+91 90000 70013', backupPersonName: 'Manoj (Family volunteer)', backupPhone: '+91 90000 70014', startTime: '16:00', endTime: '22:00', location: 'Grand Celebration Hall' }),
    duty({ role: 'Elderly Assistance', personName: 'Susan George Jr (Family volunteer)', phone: '+91 90000 70015', backupPersonName: 'Reena (Family volunteer)', backupPhone: '+91 90000 70016', startTime: '06:00', endTime: '23:00', location: 'Mobile' }),
    duty({ role: 'Child Assistance', personName: 'Neha Varghese', phone: '+91 90000 70017', backupPersonName: 'Divya Joseph', backupPhone: '+91 90000 70018', startTime: '09:00', endTime: '23:00', location: 'Mobile' }),
    duty({ role: 'Clergy Coordinator', personName: 'Jerin Alex', phone: '+91 90000 70019', backupPersonName: 'Renjith Paul', backupPhone: '+91 90000 70020', startTime: '06:00', endTime: '12:00', location: church?.churchName ?? 'Church' }),
    duty({ role: 'Bride-Family Liaison', personName: 'Divya Joseph', phone: '+91 90000 70021', backupPersonName: 'Anoop Kurien', backupPhone: '+91 90000 70022', startTime: '06:00', endTime: '23:00', location: 'Mobile' }),
    duty({ role: 'Groom Personal Assistant', personName: 'Nikhil Thomas', phone: '+91 90000 70023', backupPersonName: 'Renjith Paul', backupPhone: '+91 90000 70024', startTime: '04:00', endTime: '12:00', location: "Groom's residence" }),
    duty({
      role: 'Ceremony Item Custodian',
      personName: 'Aleyamma Thomas',
      phone: '+91 90000 70025',
      // Deliberate scenario: critical role with no backup assigned yet.
      startTime: '06:00',
      endTime: '12:30',
      location: church?.churchName ?? 'Church',
      responsibilities: 'Holds and hands off the rings, minnu, and manthrakodi at the correct sequence points.',
    }),
    duty({ role: 'Gift / Cash Custodian', personName: 'Thomas Varkey', phone: '+91 90000 70026', backupPersonName: 'George Mathew', backupPhone: '+91 90000 70027', startTime: '17:00', endTime: '23:30', location: 'Grand Celebration Hall' }),
    duty({ role: 'Vendor Payment Custodian', personName: 'Susan George', phone: '+91 90000 70028', backupPersonName: 'Thomas Varkey', backupPhone: '+91 90000 70029', startTime: '08:00', endTime: '23:00', location: 'Mobile' }),
    duty({ role: 'Family Photo Coordinator', personName: 'Riya Mathew', phone: '+91 90000 70030', backupPersonName: 'Neha Varghese', backupPhone: '+91 90000 70031', startTime: '07:00', endTime: '21:00', location: 'Mobile' }),
    duty({ role: 'Emergency / Medical Contact', personName: 'Dr. Thampi (Family friend)', phone: '+91 90000 70032', backupPersonName: 'Renjith Paul', backupPhone: '+91 90000 70033', startTime: '00:00', endTime: '23:59', location: 'Mobile' }),
    duty({ role: 'Lost & Found Custodian', personName: 'Manoj Kumar (Family volunteer)', phone: '+91 90000 70034', backupPersonName: 'Ramesh (Family volunteer)', backupPhone: '+91 90000 70035', startTime: '17:00', endTime: '23:59', location: 'Grand Celebration Hall' }),
    duty({ role: 'Venue Closeout Lead', personName: 'George Mathew', phone: '+91 90000 70036', backupPersonName: 'Susan George', backupPhone: '+91 90000 70037', startTime: '21:00', endTime: '23:59', location: 'Grand Celebration Hall' }),
  ];

  // ---------------------------------------------------------------------
  // Vendor day-of status.
  // ---------------------------------------------------------------------
  function vendorDayStatus(input: Omit<VendorDayStatus, 'id' | 'createdAt' | 'updatedAt' | 'primaryContactConfirmed' | 'setupComplete' | 'serviceReady' | 'finalSettlementChecked'> & Partial<Pick<VendorDayStatus, 'primaryContactConfirmed' | 'setupComplete' | 'serviceReady' | 'finalSettlementChecked'>>): VendorDayStatus {
    return {
      primaryContactConfirmed: true,
      setupComplete: false,
      serviceReady: false,
      finalSettlementChecked: false,
      ...input,
      id: generateId('vendorday'),
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const vendorDayStatuses: VendorDayStatus[] = [
    vendorDayStatus({ vendorId: vVenue, expectedArrivalTime: `${WEDDING_DATE}T05:00:00.000Z`, actualArrivalTime: `${WEDDING_DATE}T04:55:00.000Z`, teamSizeExpected: 6, teamSizeActual: 6, setupComplete: true, serviceReady: true, status: 'Ready' }),
    vendorDayStatus({
      vendorId: vCatering,
      // Deliberate scenario: critical vendor running late.
      expectedArrivalTime: `${WEDDING_DATE}T11:00:00.000Z`,
      teamSizeExpected: 25,
      status: 'Delayed',
      notes: 'Team stuck in traffic near the reception venue access road; ETA revised to 12:00.',
    }),
    vendorDayStatus({ vendorId: vDecor, expectedArrivalTime: `${WEDDING_DATE}T05:00:00.000Z`, actualArrivalTime: `${WEDDING_DATE}T05:10:00.000Z`, teamSizeExpected: 8, teamSizeActual: 8, setupComplete: false, status: 'Setting Up' }),
    vendorDayStatus({ vendorId: vSound, expectedArrivalTime: `${WEDDING_DATE}T13:00:00.000Z`, actualArrivalTime: `${WEDDING_DATE}T12:50:00.000Z`, teamSizeExpected: 3, teamSizeActual: 3, setupComplete: true, serviceReady: true, status: 'Ready' }),
    vendorDayStatus({ vendorId: vPhotoShutter, expectedArrivalTime: `${WEDDING_DATE}T07:20:00.000Z`, actualArrivalTime: `${WEDDING_DATE}T07:15:00.000Z`, teamSizeExpected: 3, teamSizeActual: 3, setupComplete: true, serviceReady: true, status: 'In Service' }),
    vendorDayStatus({ vendorId: vVideo, expectedArrivalTime: `${WEDDING_DATE}T08:35:00.000Z`, actualArrivalTime: `${WEDDING_DATE}T08:30:00.000Z`, teamSizeExpected: 2, teamSizeActual: 2, setupComplete: true, serviceReady: true, status: 'In Service' }),
    vendorDayStatus({ vendorId: vChoir, expectedArrivalTime: `${WEDDING_DATE}T08:50:00.000Z`, teamSizeExpected: 12, status: 'Expected' }),
    vendorDayStatus({ vendorId: vDJ, expectedArrivalTime: `${WEDDING_DATE}T13:00:00.000Z`, teamSizeExpected: 2, status: 'Expected' }),
    vendorDayStatus({ vendorId: vEmcee, expectedArrivalTime: `${WEDDING_DATE}T15:30:00.000Z`, teamSizeExpected: 1, status: 'En Route' }),
    vendorDayStatus({ vendorId: vSecurity, expectedArrivalTime: `${WEDDING_DATE}T16:00:00.000Z`, actualArrivalTime: `${WEDDING_DATE}T15:55:00.000Z`, teamSizeExpected: 4, teamSizeActual: 4, setupComplete: true, serviceReady: true, status: 'Ready' }),
    vendorDayStatus({ vendorId: vValet, expectedArrivalTime: `${WEDDING_DATE}T16:30:00.000Z`, actualArrivalTime: `${WEDDING_DATE}T16:20:00.000Z`, teamSizeExpected: 6, teamSizeActual: 5, setupComplete: true, serviceReady: true, status: 'Ready' }),
    vendorDayStatus({ vendorId: vCake, expectedArrivalTime: `${WEDDING_DATE}T14:30:00.000Z`, actualArrivalTime: `${WEDDING_DATE}T14:25:00.000Z`, teamSizeExpected: 2, teamSizeActual: 2, setupComplete: true, serviceReady: true, status: 'Completed', actualDepartureTime: `${WEDDING_DATE}T15:00:00.000Z` }),
  ];

  // ---------------------------------------------------------------------
  // Ceremony item movements.
  // ---------------------------------------------------------------------
  const iBouquet = findItem(ceremonyItems, 'Bridal bouquet');
  const iBoutonniere = findItem(ceremonyItems, "Groom's boutonniere");
  const iProgram = findItem(ceremonyItems, 'Order of service booklets');
  const iOilLamp = findItem(ceremonyItems, 'Nilavilakku (ceremonial oil lamp)');
  const iCross = findItem(ceremonyItems, 'Altar cross');
  const iRingPillow = findItem(ceremonyItems, 'Ring pillow');
  const iBibleStand = findItem(ceremonyItems, 'Family bible for the reading table');
  const iCandle = findItem(ceremonyItems, 'Unity candle set');

  function movement(ceremonyItemId: string, action: CeremonyItemMovement['action'], timestamp: string, opts: Partial<CeremonyItemMovement> = {}): CeremonyItemMovement {
    return { id: generateId('movement'), ceremonyItemId, action, timestamp, createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT, ...opts };
  }

  const ceremonyItemMovements: CeremonyItemMovement[] = [
    movement(iRings, 'Checked Out', '2027-01-30T07:00:00.000Z', { fromLocation: "Best man's safe", toLocation: 'Groom carrying', handedBy: 'Nikhil Thomas', receivedBy: 'Nikhil Thomas' }),
    movement(iBouquet, 'Verified', '2027-01-29T18:00:00.000Z', { fromLocation: 'Petal & Stem Décor workshop' }),
    movement(iBouquet, 'Checked Out', '2027-01-30T06:30:00.000Z', { fromLocation: 'Petal & Stem Décor workshop', toLocation: 'Delivery van', handedBy: 'Décor Lead' }),
    // Deliberate scenario: currently in transit.
    movement(iBouquet, 'In Transit', '2027-01-30T07:00:00.000Z', { fromLocation: 'Petal & Stem Décor workshop', toLocation: 'En route to church' }),
    movement(iMarriageDocs, 'Verified', '2027-01-25T09:00:00.000Z'),
    movement(iMarriageDocs, 'Checked Out', '2027-01-30T06:30:00.000Z', { fromLocation: 'Family document folder', toLocation: 'Groom Father carrying', handedBy: 'Thomas Varkey', receivedBy: 'Thomas Varkey' }),
    movement(iMarriageDocs, 'Received', '2027-01-30T08:30:00.000Z', { fromLocation: 'Groom Father carrying', toLocation: 'Sacristy', receivedBy: 'Church Lead' }),
    movement(iManthrakodi, 'Checked Out', '2027-01-30T07:00:00.000Z', { fromLocation: "Bride's family home", toLocation: 'Bride Mother carrying', handedBy: 'Susan George', receivedBy: 'Susan George' }),
    movement(iChain, 'Verified', '2026-08-05T09:00:00.000Z'),
    movement(iChain, 'Checked Out', '2027-01-30T07:00:00.000Z', { toLocation: 'Groom Mother carrying', handedBy: 'Aleyamma Thomas', receivedBy: 'Aleyamma Thomas' }),
    movement(iReading1, 'Verified', '2026-08-05T09:00:00.000Z'),
    movement(iReading2, 'Verified', '2026-08-05T09:00:00.000Z'),
    movement(iProgram, 'Checked Out', '2027-01-30T06:45:00.000Z', { toLocation: 'En route to church' }),
    movement(iProgram, 'Received', '2027-01-30T08:00:00.000Z', { toLocation: church?.churchName ?? 'Church', receivedBy: 'Ushers' }),
    movement(iOilLamp, 'Secured', '2027-01-29T17:00:00.000Z', { toLocation: church?.churchName ?? 'Church' }),
    movement(iCross, 'Secured', '2027-01-29T17:00:00.000Z', { toLocation: church?.churchName ?? 'Church' }),
    movement(iRingPillow, 'Checked Out', '2027-01-30T07:00:00.000Z', { toLocation: 'Groom carrying' }),
    movement(iRingPillow, 'Received', '2027-01-30T08:00:00.000Z', { toLocation: church?.churchName ?? 'Church', receivedBy: 'Ring Custodian' }),
    movement(iBibleStand, 'Secured', '2027-01-29T17:00:00.000Z', { toLocation: church?.churchName ?? 'Church' }),
    movement(iCandle, 'Checked Out', '2027-01-29T18:00:00.000Z', { toLocation: church?.churchName ?? 'Church' }),
    movement(iBoutonniere, 'Received', '2027-01-30T07:10:00.000Z', { fromLocation: 'Petal & Stem Décor workshop', toLocation: 'Groom carrying', receivedBy: 'Nikhil Thomas' }),
  ];

  // ---------------------------------------------------------------------
  // Emergency contacts.
  // ---------------------------------------------------------------------
  function contact(input: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>): EmergencyContact {
    return { ...input, id: generateId('emcontact'), createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  }

  const emergencyContacts: EmergencyContact[] = [
    contact({ category: 'Hospital', name: 'Sunrise Multispecialty Hospital (fictional)', phone: '+91 90000 79001', location: 'Banjara Hills, Hyderabad', priority: 'Primary' }),
    contact({ category: 'Ambulance', name: 'City Ambulance Service (fictional, 24x7)', phone: '+91 90000 79002', priority: 'Primary' }),
    contact({ category: 'Pharmacy', name: 'Apollo Pharmacy — Banjara Hills (fictional)', phone: '+91 90000 79003', priority: 'Secondary' }),
    contact({ category: 'Police', name: 'Banjara Hills Police Station (fictional)', phone: '+91 90000 79004', priority: 'Secondary' }),
    contact({ category: 'Fire', name: 'Hyderabad Fire Department — Zone 3 (fictional)', phone: '+91 90000 79005', priority: 'Reference' }),
    contact({ category: 'Venue Security', name: 'SecureGuard Services — on-site lead', phone: findVendorContact(vendorContacts, 'Arvind Kumar')?.phone ?? '+91 90000 79006', location: 'Grand Celebration Hall', priority: 'Primary' }),
    contact({ category: 'Hotel', name: 'Marigold Grand Hyderabad — Front Desk', phone: '+91 40 4011 2201', priority: 'Primary' }),
    contact({ category: 'Church', name: church?.churchName ?? 'Church office', phone: church?.churchOfficePhone ?? '+91 90000 79007', priority: 'Primary' }),
    contact({ category: 'Transport', name: 'Deccan Travels — Dispatch', phone: '+91 90000 60017', priority: 'Secondary' }),
    contact({ category: 'Family Emergency', name: "Thomas Varkey (Groom's Father)", phone: '+91 90000 70026', priority: 'Primary' }),
    contact({ category: 'Medical Professional', name: 'Dr. Thampi — Family Physician (fictional)', phone: '+91 90000 70032', priority: 'Secondary' }),
    contact({ category: 'Other', name: 'Wedding Planner Helpline (fictional)', phone: '+91 90000 79008', priority: 'Reference' }),
  ];

  // ---------------------------------------------------------------------
  // Emergency response cards. Operational checklists only — not medical or legal advice.
  // ---------------------------------------------------------------------
  function responseCard(input: Omit<EmergencyResponseCard, 'id' | 'createdAt' | 'updatedAt' | 'immediateActions'> & { immediateActions: string[] }): EmergencyResponseCard {
    return { ...input, id: generateId('emcard'), createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  }

  const emergencyResponseCards: EmergencyResponseCard[] = [
    responseCard({
      type: 'Medical Emergency',
      title: 'Medical Emergency',
      immediateActions: ['Call the primary medical contact and, if needed, the ambulance line immediately.', 'Send someone to guide responders to the exact location.', 'Clear the immediate area and keep the person comfortable.', 'Notify the Day-of Command Lead.'],
      owner: 'Emergency / Medical Contact',
      backupOwner: 'Day-of Command Lead',
      contingency: 'If the venue medical contact is unavailable, escalate directly to the nearest hospital contact.',
    }),
    responseCard({
      type: 'Missing Guest / Child',
      title: 'Missing Guest / Child',
      immediateActions: ['Notify the Day-of Command Lead and venue security immediately.', 'Check the last known location and nearby restrooms/exits first.', 'Announce discreetly to the duty roster — avoid a public announcement unless necessary.', 'Post someone at each venue exit until found.'],
      owner: 'Child Assistance',
      backupOwner: 'Day-of Command Lead',
      relatedVendorId: vSecurity,
    }),
    responseCard({
      type: 'Lost Valuables',
      title: 'Lost Valuables',
      immediateActions: ['Notify the Lost & Found Custodian and Gift/Cash Custodian.', 'Check the last confirmed handover point in the movement log.', 'Ask venue security to review any camera coverage if available.', 'Log the item and last-seen details for follow-up.'],
      owner: 'Lost & Found Custodian',
      backupOwner: 'Gift / Cash Custodian',
    }),
    responseCard({
      type: 'Vendor No Show',
      title: 'Vendor No Show',
      immediateActions: ['Call the vendor and their backup contact.', 'Notify the Day-of Command Lead and Vendor Payment Custodian.', 'Activate a backup/replacement vendor if one was pre-identified.', 'Log the no-show on the vendor day-of record.'],
      owner: 'Day-of Command Lead',
      backupOwner: 'Vendor Payment Custodian',
    }),
    responseCard({
      type: 'Power Failure',
      title: 'Power Failure',
      immediateActions: ['Contact venue facilities/security immediately.', 'Check whether backup generators are available and activate them.', 'Notify AV/sound and catering vendors, who may need to pause equipment-dependent work.', 'Keep guests informed calmly if the outage is prolonged.'],
      owner: 'Day-of Command Lead',
      backupOwner: 'Venue Closeout Lead',
      relatedVendorId: vVenue,
    }),
    responseCard({
      type: 'AV Failure',
      title: 'AV Failure',
      immediateActions: ['Contact the sound/AV vendor immediately.', 'Switch to backup equipment if available.', 'Have the emcee bridge the gap without amplification if needed.', 'Log the incident and resolution time.'],
      owner: 'Day-of Command Lead',
      backupOwner: 'Church Lead',
      relatedVendorId: vSound,
    }),
    responseCard({
      type: 'Transport Breakdown',
      title: 'Transport Breakdown',
      immediateActions: ['Contact the transport vendor for a replacement vehicle.', 'Notify affected guests and reassign to another vehicle if possible.', 'Update the relevant run-sheet transport item with the delay.', 'Escalate to Transport Dispatch for rerouting.'],
      owner: 'Transport Dispatch',
      backupOwner: 'Day-of Command Lead',
      relatedVendorId: findVendor(vendors, 'Deccan Travels'),
    }),
    responseCard({
      type: 'Food Shortage',
      title: 'Food Shortage',
      immediateActions: ['Alert the catering vendor immediately to assess and replenish.', 'Prioritize serving order to manage the shortfall discreetly.', 'Notify the Day-of Command Lead.', 'Document the shortfall for the vendor settlement conversation.'],
      owner: 'Day-of Command Lead',
      backupOwner: 'Vendor Payment Custodian',
      relatedVendorId: vCatering,
    }),
    responseCard({
      type: 'Severe Traffic Delay',
      title: 'Severe Traffic Delay',
      immediateActions: ['Identify which run-sheet items are affected and estimate the delay.', 'Use the Delay Propagation Preview to see downstream impact before changing anything.', 'Notify affected owners and vendors.', 'Consider an alternate route via Transport Dispatch.'],
      owner: 'Transport Dispatch',
      backupOwner: 'Day-of Command Lead',
    }),
    responseCard({
      type: 'Weather Disruption',
      title: 'Weather Disruption',
      immediateActions: ['Check whether any outdoor segments (photos, arrivals) need to move indoors.', 'Notify décor/photography vendors of the change.', 'Have umbrellas/covered walkways staged as a contingency.', 'Update the run sheet with any location changes.'],
      owner: 'Day-of Command Lead',
      backupOwner: 'Family Photo Coordinator',
    }),
    responseCard({
      type: 'Security Issue',
      title: 'Security Issue',
      immediateActions: ['Alert venue security immediately.', 'Keep the affected area clear and calm.', 'Notify the Day-of Command Lead.', 'Call police if the situation requires it.'],
      owner: 'Day-of Command Lead',
      backupOwner: 'Emergency / Medical Contact',
      relatedVendorId: vSecurity,
    }),
  ];

  // ---------------------------------------------------------------------
  // Closeout checklist.
  // ---------------------------------------------------------------------
  function closeout(input: Omit<CloseoutItem, 'id' | 'createdAt' | 'updatedAt' | 'status'> & Partial<Pick<CloseoutItem, 'status'>>): CloseoutItem {
    return { status: 'Pending', ...input, id: generateId('closeout'), createdAt: SEED_CREATED_AT, updatedAt: SEED_CREATED_AT };
  }

  const closeoutItems: CloseoutItem[] = [
    closeout({ category: 'Gifts / Cash', title: 'Secure cash envelopes', owner: 'Gift / Cash Custodian', status: 'Complete', dueTime: '23:00', completedAt: `${WEDDING_DATE}T22:50:00.000Z` }),
    closeout({ category: 'Gifts / Cash', title: 'Secure gifts', owner: 'Gift / Cash Custodian', status: 'Complete', dueTime: '23:00', completedAt: `${WEDDING_DATE}T22:55:00.000Z` }),
    closeout({ category: 'Ceremony Items', title: 'Transfer rings/jewellery to custodian', owner: 'Ceremony Item Custodian', status: 'Complete', dueTime: '12:30', completedAt: `${WEDDING_DATE}T12:25:00.000Z` }),
    closeout({ category: 'Ceremony Items', title: 'Confirm ceremony items returned', owner: 'Ceremony Item Custodian', dueTime: '23:30' }),
    closeout({ category: 'Equipment', title: 'Confirm vendor equipment cleared', owner: 'Venue Closeout Lead', dueTime: '23:30' }),
    closeout({ category: 'Guest Transport', title: 'Confirm final guest buses departed', owner: 'Transport Dispatch', dueTime: '22:30' }),
    closeout({ category: 'Guest Transport', title: 'Confirm hotel return transport complete', owner: 'Transport Dispatch', dueTime: '23:00' }),
    closeout({ category: 'Leftover Food', title: 'Confirm leftover food disposition', owner: 'Day-of Command Lead', dueTime: '23:00', notes: 'Confirm whether leftovers go to a donation partner or family per the plan agreed with the caterer.' }),
    closeout({ category: 'Lost & Found', title: 'Confirm lost-and-found handover', owner: 'Lost & Found Custodian', dueTime: '23:30' }),
    closeout({
      category: 'Vendor Settlement',
      title: 'Confirm vendor settlement envelopes',
      owner: 'Vendor Payment Custodian',
      // Deliberate scenario: one closeout exception.
      status: 'Exception',
      dueTime: '23:00',
      verificationNote: "DJ Rhythm Nation's settlement amount is under dispute (extended after-party set) — pending final agreement before the envelope is sealed.",
    }),
    closeout({ category: 'Rental Return', title: 'Confirm rental items accounted for', owner: 'Venue Closeout Lead', dueTime: '23:45' }),
    closeout({ category: 'Venue Handover', title: 'Confirm venue handover', owner: 'Venue Closeout Lead', dueTime: '23:59' }),
    closeout({ category: 'Venue Handover', title: 'Confirm final room keys / hospitality desk close', owner: 'Hotel Welcome Desk', dueTime: '22:00' }),
    closeout({ category: 'Documents', title: 'Confirm documents secured', owner: 'Groom Personal Assistant', status: 'Complete', dueTime: '12:30', completedAt: `${WEDDING_DATE}T12:20:00.000Z` }),
    closeout({ category: 'Documents', title: 'Confirm photographers have critical files backed up if agreed', owner: 'Family Photo Coordinator', dueTime: '23:59' }),
    closeout({ category: 'Equipment', title: 'Confirm emergency kit returned', owner: 'Emergency / Medical Contact', dueTime: '23:59' }),
  ];

  // ---------------------------------------------------------------------
  // VIP / elderly guest operational statuses.
  // ---------------------------------------------------------------------
  function guestStatus(fullName: string, state: GuestOperationalStatus['state'], isVip: boolean, opts: Partial<GuestOperationalStatus> = {}): GuestOperationalStatus {
    return {
      id: generateId('guestop'),
      guestId: findGuest(guests, fullName),
      state,
      isVip,
      lastUpdatedAt: SEED_CREATED_AT,
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
      ...opts,
    };
  }

  const guestOperationalStatuses: GuestOperationalStatus[] = [
    guestStatus('Kunjumol Thomas', 'Assistance Required', false, { assistanceNote: 'Needs a wheelchair-accessible route from the drop-off point to seating.' }),
    guestStatus('Tomy Zachariah', 'At Hotel', true, { assistanceNote: 'Respected family elder — reserve front-row seating.' }),
    guestStatus('Rosamma Tomy', 'At Hotel', false, { assistanceNote: 'Travels with Tomy Zachariah.' }),
    guestStatus('Jose Mathew', 'Expected', false),
    guestStatus('Aleyamma Jose', 'Expected', false),
  ];

  return {
    runSheetItems,
    liveIssues,
    dutyAssignments,
    vendorDayStatuses,
    ceremonyItemMovements,
    emergencyContacts,
    emergencyResponseCards,
    closeoutItems,
    finalReadinessReviews: [],
    guestOperationalStatuses,
    manifestFreezeStates: [],
  };
}
