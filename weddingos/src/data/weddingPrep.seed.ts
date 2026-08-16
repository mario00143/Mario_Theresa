/**
 * Fictional demo data only. No real churches, clergy, or vendors are used —
 * vendor cross-links reuse the fictional vendors already seeded in
 * finance.seed.ts, and the church/hotel names mirror the fictional
 * placeholders from earlier phases.
 *
 * Deliberately includes the edge cases called out in the Phase 5 spec:
 * three "Confirm with Parish" church requirements, one overdue church
 * requirement, one unverified critical ceremony item (the rings), one
 * unresolved minnu applicability, one documented menu allergen (dietary
 * exception), one catering guaranteed count below RSVP attendance, one
 * décor install-timing conflict at the church, one not-ready attire item,
 * one overdue final fitting, one must-have photo group without a
 * coordinator, an unconfirmed clergy gift, an insufficient guest-favor
 * count, and one welcome kit short of its planned quantity.
 */
import type {
  AttireItem,
  AttireProfile,
  CateringPlan,
  CeremonyItem,
  CeremonyParticipant,
  CeremonySequenceItem,
  ChurchProfile,
  ChurchRequirement,
  DecorDeliverable,
  DecorPlan,
  GiftPlan,
  GroomingAppointment,
  Guest,
  Hotel,
  Household,
  MenuItem,
  MusicAVPlan,
  MusicCue,
  PhotoGroup,
  PhotographyPlan,
  Vendor,
  WelcomeKit,
  WelcomeKitItem,
} from '@/types';
import { generateId } from '@/lib/id';

export interface WeddingPrepSeedBundle {
  churchProfiles: ChurchProfile[];
  churchRequirements: ChurchRequirement[];
  ceremonyParticipants: CeremonyParticipant[];
  ceremonySequenceItems: CeremonySequenceItem[];
  ceremonyItems: CeremonyItem[];
  cateringPlans: CateringPlan[];
  menuItems: MenuItem[];
  decorPlans: DecorPlan[];
  decorDeliverables: DecorDeliverable[];
  attireProfiles: AttireProfile[];
  attireItems: AttireItem[];
  groomingAppointments: GroomingAppointment[];
  photographyPlans: PhotographyPlan[];
  photoGroups: PhotoGroup[];
  musicCues: MusicCue[];
  musicAVPlans: MusicAVPlan[];
  giftPlans: GiftPlan[];
  welcomeKits: WelcomeKit[];
  welcomeKitItems: WelcomeKitItem[];
}

const SEED_CREATED_AT = '2026-07-20T09:00:00.000Z';
const WEDDING_DATE = '2027-01-30';

function findVendor(vendors: Vendor[], name: string): string | undefined {
  return vendors.find((v) => v.name === name)?.id;
}

function findHotel(hotels: Hotel[], name: string): string | undefined {
  return hotels.find((h) => h.name === name)?.id;
}

export function buildSeedWeddingPrep(_households: Household[], _guests: Guest[], vendors: Vendor[], hotels: Hotel[]): WeddingPrepSeedBundle {
  const vCatering = findVendor(vendors, 'Spice Route Caterers');
  const vDecor = findVendor(vendors, 'Petal & Stem Décor');
  const vSound = findVendor(vendors, 'ClearSound AV Solutions');
  const vPhotoShutter = findVendor(vendors, 'Shutter Stories Photography');
  const vChoir = findVendor(vendors, 'Voices of Grace Choir');
  const vDJ = findVendor(vendors, 'DJ Rhythm Nation');
  const vAttire = findVendor(vendors, 'Zoya Bridal Couture');
  const vGrooming = findVendor(vendors, 'Glow Studio Grooming');
  const marigoldHotel = findHotel(hotels, 'Marigold Grand Hyderabad');

  // ---------------------------------------------------------------------
  // Church profile.
  // ---------------------------------------------------------------------
  const church: ChurchProfile = {
    id: generateId('church'),
    event: 'Wedding',
    churchName: "St. Sebastian's Forane Church",
    denomination: 'Syro-Malabar',
    parishName: "St. Sebastian's Forane Parish",
    address: '12 Church Road, Secunderabad',
    city: 'Hyderabad',
    primaryClergyName: 'Fr. Thomas Chacko',
    primaryClergyPhone: '+91 40 2345 6001',
    churchOfficePhone: '+91 40 2345 6001',
    churchOfficeEmail: 'office@stsebastianschurch.example.com',
    ceremonyDate: WEDDING_DATE,
    ceremonyStartTime: '10:00',
    accessStartTime: '07:00',
    rehearsalDate: '2027-01-28',
    rehearsalTime: '17:00',
    seatingCapacity: 400,
    parkingNotes: 'Limited on-site parking (60 cars); overflow at the community hall lot next door.',
    accessibilityNotes: 'Ramp available at the side entrance; no elevator to the choir loft.',
    photographyRestrictions: 'No flash during the sacrament; photographers must stay behind the last pew during vows.',
    videoRestrictions: 'One fixed camera position allowed at the rear; no drone indoors.',
    musicRestrictions: 'Only approved hymns and liturgical music; no secular music inside the church.',
    decorRestrictions: 'Fresh flowers only at the altar; no adhesive decorations on pews; candles must be battery-operated.',
    confettiPetalRestrictions: 'Real rose petals allowed at the exit steps only; must be cleaned up within 30 minutes.',
    notes: 'Family parish — used for three generations.',
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_CREATED_AT,
  };

  // ---------------------------------------------------------------------
  // Church requirements.
  // ---------------------------------------------------------------------
  function requirement(input: Omit<ChurchRequirement, 'id' | 'churchProfileId' | 'createdAt' | 'updatedAt' | 'documentRequired'> & Partial<Pick<ChurchRequirement, 'documentRequired'>>): ChurchRequirement {
    return {
      documentRequired: false,
      ...input,
      id: generateId('churchreq'),
      churchProfileId: church.id,
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const churchRequirements: ChurchRequirement[] = [
    requirement({ title: 'Baptism certificate — groom', category: 'Baptism', applicability: 'Applicable', owner: 'Groom', status: 'Complete', documentRequired: true, documentName: 'Baptism_Certificate_Groom.pdf', requirementSource: 'Parish office checklist' }),
    requirement({ title: 'Baptism certificate — bride', category: 'Baptism', applicability: 'Applicable', owner: 'Bride', status: 'Complete', documentRequired: true, documentName: 'Baptism_Certificate_Bride.pdf', requirementSource: 'Parish office checklist' }),
    requirement({ title: 'Confirmation certificate — groom', category: 'Confirmation', applicability: 'Applicable', owner: 'Groom', status: 'Complete', documentRequired: true, documentName: 'Confirmation_Certificate_Groom.pdf' }),
    requirement({ title: 'Confirmation certificate — bride', category: 'Confirmation', applicability: 'Applicable', owner: 'Bride', status: 'Verified', documentRequired: true, documentName: 'Confirmation_Certificate_Bride.pdf', verifiedDate: '2026-08-01', verifiedBy: 'Fr. Thomas Chacko' }),
    requirement({ title: 'Pre-Cana counseling session 1 of 3', category: 'Marriage Preparation', applicability: 'Applicable', owner: 'Groom', dueDate: '2026-09-15', status: 'Complete' }),
    requirement({ title: 'Pre-Cana counseling session 2 of 3', category: 'Marriage Preparation', applicability: 'Applicable', owner: 'Bride', dueDate: '2026-10-15', status: 'In Progress' }),
    requirement({ title: 'Pre-Cana counseling session 3 of 3', category: 'Marriage Preparation', applicability: 'Applicable', owner: 'Bride', dueDate: '2026-11-15', status: 'Not Started' }),
    requirement({ title: 'Parish membership confirmation — groom home parish', category: 'Parish Membership', applicability: 'Applicable', owner: 'Groom Father', status: 'Complete' }),
    requirement({ title: 'Transfer letter acknowledgement from groom parish', category: 'Parish Membership', applicability: 'Applicable', owner: 'Groom Father', dueDate: '2026-10-01', status: 'Waiting' }),
    requirement({ title: 'Freedom to Marry declaration', category: 'Freedom to Marry', applicability: 'Applicable', owner: 'Groom Father', dueDate: '2026-09-30', status: 'Submitted', documentRequired: true, documentName: 'Affidavit_Freedom_To_Marry.pdf', submittedDate: '2026-08-05' }),
    requirement({ title: 'NOC / transfer letter from bride parish', category: 'NOC / Transfer', applicability: 'Applicable', owner: 'Bride', dueDate: '2026-10-15', status: 'Waiting' }),
    requirement({ title: 'Banns / notice of marriage — three readings', category: 'Banns / Notice', applicability: 'Applicable', owner: 'Fr. Thomas Chacko', status: 'Verified', verifiedDate: '2026-08-10', verifiedBy: 'Fr. Thomas Chacko' }),
    requirement({ title: 'Inter-parish permission (bride parish to groom parish)', category: 'Inter-Parish Permission', applicability: 'Confirm with Parish', status: 'Waiting', notes: 'Parish office says this may or may not be required depending on final banns outcome.' }),
    requirement({ title: 'Inter-denominational permission', category: 'Inter-Denominational Permission', applicability: 'Not Applicable', status: 'Not Applicable', notes: 'Both families are Syro-Malabar.' }),
    requirement({ title: 'Witness identity documents (2 required)', category: 'Witnesses', applicability: 'Applicable', owner: 'Ceremony Coordinator', dueDate: '2026-12-15', status: 'In Progress' }),
    requirement({ title: 'Confirm choir/organist usage fee', category: 'Church Fees', applicability: 'Applicable', owner: 'Groom Mother', dueDate: '2026-11-01', status: 'Waiting' }),
    requirement({ title: 'Church booking and ceremony fee', category: 'Church Fees', applicability: 'Applicable', owner: 'Groom Father', status: 'Complete' }),
    requirement({ title: 'Confirm rehearsal attendance list', category: 'Rehearsal', applicability: 'Applicable', owner: 'Ceremony Coordinator', dueDate: '2027-01-20', status: 'Not Started' }),
    requirement({ title: 'Marriage register entry', category: 'Marriage Register', applicability: 'Applicable', owner: 'Groom Father', dueDate: '2027-01-30', status: 'Not Started' }),
    requirement({ title: 'Marriage certificate issuance', category: 'Marriage Certificate', applicability: 'Applicable', owner: 'Groom Father', dueDate: '2027-02-05', status: 'Not Started' }),
    requirement({ title: 'Civil registration follow-up', category: 'Civil Registration', applicability: 'Confirm with Parish', status: 'Waiting', notes: 'Parish to confirm whether they handle civil registration paperwork or if it is separate.' }),
    requirement({
      title: 'Confirm whether repeat pre-Cana counseling is required',
      category: 'Other',
      applicability: 'Confirm with Parish',
      status: 'Waiting',
      notes: 'Bride completed counseling at her home parish previously — checking if that satisfies this parish.',
    }),
    requirement({
      title: 'Submit updated address proof to parish office',
      category: 'Other',
      applicability: 'Applicable',
      owner: 'Bride',
      dueDate: '2026-07-15',
      status: 'In Progress',
      notes: 'Overdue — follow up with the parish office this week.',
    }),
    requirement({ title: 'Order altar flowers per church-approved vendor list', category: 'Other', applicability: 'Applicable', owner: 'Bride', status: 'Complete' }),
  ];

  // ---------------------------------------------------------------------
  // Ceremony participants.
  // ---------------------------------------------------------------------
  function participant(input: Omit<CeremonyParticipant, 'id' | 'createdAt' | 'updatedAt' | 'confirmed' | 'rehearsalRequired' | 'rehearsalConfirmed'> & Partial<Pick<CeremonyParticipant, 'confirmed' | 'rehearsalRequired' | 'rehearsalConfirmed'>>): CeremonyParticipant {
    return {
      confirmed: true,
      rehearsalRequired: true,
      rehearsalConfirmed: false,
      ...input,
      id: generateId('participant'),
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const pGroom = participant({ role: 'Groom', name: 'Groom', side: 'Groom', rehearsalConfirmed: true });
  const pBride = participant({ role: 'Bride', name: 'Bride', side: 'Bride', rehearsalConfirmed: true });
  const pGroomFather = participant({ role: 'Groom Father', name: 'Thomas Varkey', side: 'Groom' });
  const pGroomMother = participant({ role: 'Groom Mother', name: 'Aleyamma Thomas', side: 'Groom' });
  const pBrideFather = participant({ role: 'Bride Father', name: 'George Mathew', side: 'Bride' });
  const pBrideMother = participant({ role: 'Bride Mother', name: 'Susan George', side: 'Bride' });
  const pWitness1 = participant({ role: 'Witness', name: 'Jerin Alex', side: 'Groom', confirmed: true });
  const pWitness2 = participant({ role: 'Witness', name: 'Neha Varghese', side: 'Bride', confirmed: false });
  const pReader1 = participant({ role: 'Reader', name: 'Anoop Kurien', side: 'Groom' });
  const pReader2 = participant({ role: 'Reader', name: 'Divya Joseph', side: 'Bride' });
  const pBackupReader = participant({ role: 'Backup Reader', name: 'Renjith Paul', side: 'Groom', rehearsalRequired: false });
  const pClergy = participant({ role: 'Clergy', name: 'Fr. Thomas Chacko', rehearsalConfirmed: true });
  const pChoirLead = participant({ role: 'Choir Lead', name: 'Sunitha Abraham', side: 'Groom' });
  const pRingCustodian = participant({ role: 'Ring Custodian', name: 'Nikhil Thomas', side: 'Groom' });
  const pMinnuCustodian = participant({ role: 'Minnu Custodian', name: 'Aleyamma Thomas', side: 'Groom' });
  const pManthrakodiCustodian = participant({ role: 'Manthrakodi Custodian', name: 'Susan George', side: 'Bride' });
  const pBouquetCustodian = participant({ role: 'Bouquet Custodian', name: 'Riya Mathew', side: 'Bride' });
  const pUsher = participant({ role: 'Usher', name: 'Vinu Jacob', side: 'Groom', rehearsalRequired: false });
  const pFamilyPhotoCoordinator = participant({ role: 'Family Photo Coordinator', name: 'Priya Varghese', side: 'Bride' });
  const pCeremonyCoordinator = participant({ role: 'Ceremony Coordinator', name: 'Ann Sebastian', rehearsalConfirmed: true });

  const ceremonyParticipants: CeremonyParticipant[] = [
    pGroom, pBride, pGroomFather, pGroomMother, pBrideFather, pBrideMother,
    pWitness1, pWitness2, pReader1, pReader2, pBackupReader, pClergy, pChoirLead,
    pRingCustodian, pMinnuCustodian, pManthrakodiCustodian, pBouquetCustodian,
    pUsher, pFamilyPhotoCoordinator, pCeremonyCoordinator,
  ];

  // ---------------------------------------------------------------------
  // Ceremony items.
  // ---------------------------------------------------------------------
  function ceremonyItem(input: Omit<CeremonyItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'verificationStatus'> & Partial<Pick<CeremonyItem, 'status' | 'verificationStatus'>>): CeremonyItem {
    return {
      status: 'Not Procured',
      verificationStatus: 'Not Verified',
      ...input,
      id: generateId('ceritem'),
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const iRings = ceremonyItem({ name: 'Wedding rings (pair)', category: 'Rings', applicability: 'Applicable', owner: 'Groom', custodian: 'Nikhil Thomas', storageLocation: "Best man's safe", status: 'Ready', verificationStatus: 'Not Verified' });
  const iMinnu = ceremonyItem({ name: 'Minnu (traditional pendant)', category: 'Minnu', applicability: 'Confirm with Parish / Family', owner: 'Groom Mother', notes: 'Family still deciding on the design and whether it will be presented at this ceremony.' });
  const iChain = ceremonyItem({ name: 'Minnu chain / thread', category: 'Chain / Thread', applicability: 'Applicable', owner: 'Groom Mother', custodian: 'Aleyamma Thomas', status: 'Ordered' });
  const iManthrakodi = ceremonyItem({ name: 'Manthrakodi', category: 'Manthrakodi', applicability: 'Applicable', owner: 'Bride Mother', custodian: 'Susan George', storageLocation: "Bride's family home", status: 'Ordered' });
  const iBouquet = ceremonyItem({ name: 'Bridal bouquet', category: 'Bouquet', applicability: 'Applicable', owner: 'Bride', custodian: 'Riya Mathew', requiredByDate: WEDDING_DATE, relatedVendorId: vDecor });
  const iBoutonniere = ceremonyItem({ name: "Groom's boutonniere", category: 'Boutonniere', applicability: 'Applicable', owner: 'Groom', relatedVendorId: vDecor });
  const iCorsage = ceremonyItem({ name: "Mothers' corsages", category: 'Corsage', applicability: 'Applicable', owner: 'Bride Mother', relatedVendorId: vDecor });
  const iCandle = ceremonyItem({ name: 'Unity candle set', category: 'Candle', applicability: 'Applicable', owner: 'Ceremony Coordinator', status: 'Ordered' });
  const iReading1 = ceremonyItem({ name: 'First reading card', category: 'Scripture / Reading', applicability: 'Applicable', owner: 'Ceremony Coordinator', custodian: 'Anoop Kurien', status: 'Ready', verificationStatus: 'Verified', lastVerifiedAt: '2026-08-05T09:00:00.000Z' });
  const iReading2 = ceremonyItem({ name: 'Second reading card', category: 'Scripture / Reading', applicability: 'Applicable', owner: 'Ceremony Coordinator', custodian: 'Divya Joseph', status: 'Ready', verificationStatus: 'Verified', lastVerifiedAt: '2026-08-05T09:00:00.000Z' });
  const iProgram = ceremonyItem({ name: 'Order of service booklets', category: 'Church Program', applicability: 'Applicable', owner: 'Bride', requiredByDate: WEDDING_DATE, status: 'In Transit' });
  const iMarriageDocs = ceremonyItem({ name: 'Marriage documents folder', category: 'Marriage Documents', applicability: 'Applicable', owner: 'Groom Father', custodian: 'Thomas Varkey', storageLocation: 'Family document folder', status: 'Received' });
  const iRegisterCopy = ceremonyItem({ name: 'Marriage register copy for records', category: 'Marriage Documents', applicability: 'Applicable', owner: 'Groom Father' });
  const iGroomGift = ceremonyItem({ name: "Groom's gift for bride", category: 'Gift', applicability: 'Applicable', owner: 'Groom', custodian: 'Nikhil Thomas', status: 'Ordered' });
  const iBrideGift = ceremonyItem({ name: "Bride's gift for groom", category: 'Gift', applicability: 'Applicable', owner: 'Bride' });
  const iCeremonyAttire = ceremonyItem({ name: "Groom's ceremonial mundu set", category: 'Clothing', applicability: 'Applicable', owner: 'Groom', status: 'Ready', relatedVendorId: vAttire });
  const iVeil = ceremonyItem({ name: "Bride's ceremonial veil", category: 'Clothing', applicability: 'Applicable', owner: 'Bride', status: 'Ready', relatedVendorId: vAttire });
  const iOilLamp = ceremonyItem({ name: 'Nilavilakku (ceremonial oil lamp)', category: 'Other', applicability: 'Applicable', owner: 'Ceremony Coordinator', status: 'At Venue' });
  const iCross = ceremonyItem({ name: 'Altar cross', category: 'Other', applicability: 'Applicable', owner: 'Ceremony Coordinator', status: 'Ready' });
  const iGuestBook = ceremonyItem({ name: 'Guest book and pen', category: 'Other', applicability: 'Applicable', owner: 'Bride', status: 'Ordered' });
  const iRingPillow = ceremonyItem({ name: 'Ring pillow', category: 'Other', applicability: 'Applicable', owner: 'Groom', custodian: 'Nikhil Thomas', status: 'Ready' });
  const iKalasam = ceremonyItem({ name: 'Kalasam (ceremonial vessel)', category: 'Other', applicability: 'Applicable', owner: 'Groom Mother' });
  const iBibleStand = ceremonyItem({ name: 'Family bible for the reading table', category: 'Other', applicability: 'Applicable', owner: 'Ceremony Coordinator', status: 'Ready' });

  const ceremonyItems: CeremonyItem[] = [
    iRings, iMinnu, iChain, iManthrakodi, iBouquet, iBoutonniere, iCorsage, iCandle,
    iReading1, iReading2, iProgram, iMarriageDocs, iRegisterCopy, iGroomGift, iBrideGift,
    iCeremonyAttire, iVeil, iOilLamp, iCross, iGuestBook, iRingPillow, iKalasam, iBibleStand,
  ];

  // ---------------------------------------------------------------------
  // Ceremony sequence.
  // ---------------------------------------------------------------------
  function sequenceItem(
    order: number,
    title: string,
    opts: Partial<Omit<CeremonySequenceItem, 'id' | 'sequenceOrder' | 'title' | 'createdAt' | 'updatedAt' | 'participants' | 'requiredItems' | 'status'>> & {
      participants?: string[];
      requiredItems?: string[];
      status?: CeremonySequenceItem['status'];
    } = {},
  ): CeremonySequenceItem {
    return {
      id: generateId('sequence'),
      sequenceOrder: order,
      title,
      participants: opts.participants ?? [],
      requiredItems: opts.requiredItems ?? [],
      status: opts.status ?? 'Planned',
      description: opts.description,
      plannedTime: opts.plannedTime,
      relativeTime: opts.relativeTime,
      location: opts.location,
      owner: opts.owner,
      musicCueId: opts.musicCueId,
      notes: opts.notes,
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const ceremonySequenceItems: CeremonySequenceItem[] = [
    sequenceItem(1, 'Guest arrival and seating', { plannedTime: '09:15', location: 'Church nave', owner: 'Usher', participants: [pUsher.id], status: 'Confirmed' }),
    sequenceItem(2, 'Bridal party processional', { plannedTime: '09:55', location: 'Church aisle', participants: [pReader1.id, pReader2.id], musicCueId: undefined }),
    sequenceItem(3, "Groom's entrance", { plannedTime: '09:58', location: 'Altar', participants: [pGroom.id, pGroomFather.id] }),
    sequenceItem(4, "Bride's entrance", { plannedTime: '10:00', location: 'Church aisle', participants: [pBride.id, pBrideFather.id], relativeTime: 'Ceremony start' }),
    sequenceItem(5, 'Opening prayer', { plannedTime: '10:05', owner: 'Fr. Thomas Chacko', participants: [pClergy.id] }),
    sequenceItem(6, 'First reading', { plannedTime: '10:10', owner: 'Anoop Kurien', participants: [pReader1.id], requiredItems: [iReading1.id] }),
    sequenceItem(7, 'Responsorial psalm', { plannedTime: '10:14', owner: 'Sunitha Abraham', participants: [pChoirLead.id] }),
    sequenceItem(8, 'Second reading', { plannedTime: '10:18', owner: 'Divya Joseph', participants: [pReader2.id], requiredItems: [iReading2.id] }),
    sequenceItem(9, 'Gospel reading', { plannedTime: '10:22', owner: 'Fr. Thomas Chacko', participants: [pClergy.id], requiredItems: [iBibleStand.id] }),
    sequenceItem(10, 'Homily / sermon', { plannedTime: '10:27', owner: 'Fr. Thomas Chacko', participants: [pClergy.id] }),
    sequenceItem(11, 'Exchange of vows', { plannedTime: '10:40', owner: 'Fr. Thomas Chacko', participants: [pGroom.id, pBride.id, pClergy.id] }),
    sequenceItem(12, 'Blessing and exchange of rings', { plannedTime: '10:48', owner: 'Fr. Thomas Chacko', participants: [pGroom.id, pBride.id, pRingCustodian.id], requiredItems: [iRings.id, iRingPillow.id] }),
    sequenceItem(13, 'Tying of the minnu', { plannedTime: '10:52', owner: 'Fr. Thomas Chacko', participants: [pGroom.id, pBride.id, pMinnuCustodian.id], requiredItems: [iMinnu.id, iChain.id], notes: 'Pending final confirmation of minnu applicability.' }),
    sequenceItem(14, 'Presentation and wearing of the manthrakodi', { plannedTime: '10:56', owner: 'Bride Mother', participants: [pBride.id, pManthrakodiCustodian.id], requiredItems: [iManthrakodi.id] }),
    sequenceItem(15, 'Nuptial blessing', { plannedTime: '11:02', owner: 'Fr. Thomas Chacko', participants: [pClergy.id] }),
    sequenceItem(16, 'Prayers of the faithful', { plannedTime: '11:06', owner: 'Fr. Thomas Chacko', participants: [pClergy.id] }),
    sequenceItem(17, 'Offertory', { plannedTime: '11:10', participants: [pUsher.id] }),
    sequenceItem(18, 'Holy communion', { plannedTime: '11:15', owner: 'Fr. Thomas Chacko', participants: [pClergy.id], notes: 'Applicable per Syro-Malabar rite.' }),
    sequenceItem(19, 'Final blessing', { plannedTime: '11:35', owner: 'Fr. Thomas Chacko', participants: [pClergy.id] }),
    sequenceItem(20, 'Signing of the marriage register', { plannedTime: '11:40', location: 'Sacristy', owner: 'Groom Father', participants: [pGroom.id, pBride.id, pWitness1.id, pWitness2.id, pGroomFather.id], requiredItems: [iMarriageDocs.id, iRegisterCopy.id] }),
    sequenceItem(21, 'Recessional', { plannedTime: '11:45', location: 'Church aisle', participants: [pGroom.id, pBride.id] }),
    sequenceItem(22, 'Photo session at church steps', { plannedTime: '11:50', location: 'Church entrance', owner: 'Priya Varghese', participants: [pFamilyPhotoCoordinator.id], requiredItems: [iBouquet.id] }),
  ];

  // ---------------------------------------------------------------------
  // Catering.
  // ---------------------------------------------------------------------
  const cateringPlan: CateringPlan = {
    id: generateId('catering'),
    event: 'Wedding',
    vendorId: vCatering,
    serviceStyle: 'Kerala Sadya Style',
    guestCountTarget: 450,
    guaranteedCount: 45,
    finalCountDueDate: '2027-01-10',
    bufferCount: 10,
    vegetarianCount: 200,
    nonVegetarianCount: 240,
    veganCount: 5,
    jainCount: 5,
    childCount: 30,
    infantCount: 10,
    vendorMealCount: 30,
    clergyMealCount: 2,
    driverMealCount: 15,
    staffMealCount: 20,
    coupleMealReserved: true,
    leftoverPlan: "Excess food donated to St. Sebastian's community kitchen via the caterer's partnership.",
    notes: 'Sadya-style lunch service with a few Western fusion items for younger guests.',
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_CREATED_AT,
  };

  function menuItem(input: Omit<MenuItem, 'id' | 'cateringPlanId' | 'createdAt' | 'updatedAt' | 'liveCounter' | 'approved' | 'tastingStatus'> & Partial<Pick<MenuItem, 'liveCounter' | 'approved' | 'tastingStatus'>>): MenuItem {
    return {
      liveCounter: false,
      approved: true,
      tastingStatus: 'Completed',
      ...input,
      id: generateId('menuitem'),
      cateringPlanId: cateringPlan.id,
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const menuItems: MenuItem[] = [
    menuItem({ course: 'Welcome Drink', name: 'Fresh tender coconut water', dietaryType: 'Vegan' }),
    menuItem({ course: 'Welcome Drink', name: 'Spiced buttermilk', dietaryType: 'Vegetarian' }),
    menuItem({ course: 'Starter', name: 'Chicken cutlets', dietaryType: 'Non-Vegetarian', liveCounter: true }),
    menuItem({ course: 'Starter', name: 'Banana chips and jackfruit chips', dietaryType: 'Vegan' }),
    menuItem({ course: 'Starter', name: 'Fish fry (Kerala style)', dietaryType: 'Non-Vegetarian' }),
    menuItem({ course: 'Starter', name: 'Paneer sukka', dietaryType: 'Vegetarian' }),
    menuItem({ course: 'Soup', name: 'Sweet corn soup', dietaryType: 'Vegetarian' }),
    menuItem({ course: 'Main Course', name: 'Kerala beef roast', dietaryType: 'Non-Vegetarian', approved: false, tastingStatus: 'Scheduled' }),
    menuItem({ course: 'Main Course', name: 'Chicken curry', dietaryType: 'Non-Vegetarian' }),
    menuItem({ course: 'Main Course', name: 'Avial', dietaryType: 'Vegetarian' }),
    menuItem({ course: 'Main Course', name: 'Sambar', dietaryType: 'Vegetarian' }),
    menuItem({ course: 'Main Course', name: 'Jain-style vegetable kurma', dietaryType: 'Jain' }),
    menuItem({ course: 'Main Course', name: 'Prawn moilee', dietaryType: 'Non-Vegetarian', allergens: 'Contains shellfish', tastingStatus: 'Scheduled', approved: false }),
    menuItem({ course: 'Rice', name: 'Steamed red rice', dietaryType: 'Vegan' }),
    menuItem({ course: 'Rice', name: 'Ghee rice', dietaryType: 'Vegetarian' }),
    menuItem({ course: 'Bread', name: 'Appam', dietaryType: 'Vegan' }),
    menuItem({ course: 'Bread', name: 'Kerala parotta', dietaryType: 'Vegetarian' }),
    menuItem({ course: 'Accompaniment', name: 'Pickle trio', dietaryType: 'Vegan' }),
    menuItem({ course: 'Accompaniment', name: 'Pappadam', dietaryType: 'Vegan' }),
    menuItem({ course: 'Accompaniment', name: 'Coconut chutney', dietaryType: 'Vegetarian' }),
    menuItem({ course: 'Accompaniment', name: 'Banana (Sadya style)', dietaryType: 'Vegan' }),
    menuItem({ course: 'Dessert', name: 'Cashew payasam', dietaryType: 'Vegetarian', allergens: 'Contains tree nuts (cashew) and dairy', tastingStatus: 'Completed' }),
    menuItem({ course: 'Dessert', name: 'Semiya payasam', dietaryType: 'Vegetarian' }),
    menuItem({ course: 'Dessert', name: 'Fresh fruit platter', dietaryType: 'Vegan' }),
    menuItem({ course: 'Cake', name: 'Wedding cake (3-tier)', dietaryType: 'Vegetarian', allergens: 'Contains gluten, dairy, eggs' }),
    menuItem({ course: 'Beverage', name: 'Filter coffee and tea station', dietaryType: 'Vegetarian', liveCounter: true }),
    menuItem({ course: 'Beverage', name: 'Fresh juice station', dietaryType: 'Vegan', liveCounter: true }),
    menuItem({ course: 'Late Night Snack', name: 'Kerala-style shawarma station', dietaryType: 'Mixed', liveCounter: true, tastingStatus: 'Not Scheduled', approved: false }),
  ];

  // ---------------------------------------------------------------------
  // Décor.
  // ---------------------------------------------------------------------
  function decorPlan(
    input: Omit<DecorPlan, 'id' | 'createdAt' | 'updatedAt' | 'event' | 'approvalStatus' | 'finalWalkthroughComplete'> &
      Partial<Pick<DecorPlan, 'event' | 'approvalStatus' | 'finalWalkthroughComplete'>>,
  ): DecorPlan {
    return {
      event: 'Wedding',
      approvalStatus: 'Pending',
      finalWalkthroughComplete: false,
      ...input,
      id: generateId('decor'),
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const dChurchEntrance = decorPlan({ area: 'Church Entrance', theme: 'Ivory and gold florals', colorPalette: 'Ivory, gold, sage green', vendorId: vDecor, installDate: WEDDING_DATE, installStartTime: '07:30', installDeadline: WEDDING_DATE, approvalStatus: 'Approved', approvedBy: 'Bride' });
  const dChurchAisle = decorPlan({ area: 'Church Aisle', theme: 'Petal-lined aisle runner', colorPalette: 'Ivory, blush', vendorId: vDecor, installDate: WEDDING_DATE, installStartTime: '06:30', installDeadline: WEDDING_DATE, approvalStatus: 'Approved', approvedBy: 'Bride', notes: 'Confirm this fits within church access hours.' });
  const dAltar = decorPlan({ area: 'Altar', theme: 'Fresh white lilies', colorPalette: 'White, gold', vendorId: vDecor, installDate: WEDDING_DATE, installStartTime: '07:45', approvalStatus: 'Approved', approvedBy: 'Bride' });
  const dReceptionEntrance = decorPlan({ area: 'Reception Entrance', theme: 'Floral arch with fairy lights', vendorId: vDecor, installDate: '2027-01-29', installStartTime: '18:00', teardownDeadline: '2027-01-31' });
  const dStage = decorPlan({ area: 'Stage', theme: 'Backlit floral wall', colorPalette: 'Blush, gold', vendorId: vDecor, installDate: '2027-01-29', installStartTime: '14:00', teardownDeadline: '2027-01-31' });
  const dCoupleSeating = decorPlan({ area: 'Couple Seating', theme: 'Regal thrones with floral backdrop', vendorId: vDecor, installDate: '2027-01-29', installStartTime: '15:00', teardownDeadline: '2027-01-31' });
  const dDiningTables = decorPlan({ area: 'Dining Tables', theme: 'Low centerpieces, greenery runners', vendorId: vDecor, installDate: '2027-01-29', installStartTime: '16:00', teardownDeadline: '2027-01-31' });
  const dCakeTable = decorPlan({ area: 'Cake Table', theme: 'Floral cake stand backdrop', vendorId: vDecor, installDate: '2027-01-29', installStartTime: '16:30', teardownDeadline: '2027-01-31' });
  const dPhotoBackdrop = decorPlan({ area: 'Photo Backdrop', theme: 'LED marquee letters with florals', installDate: '2027-01-29', installStartTime: '17:00', teardownDeadline: '2027-01-31', notes: 'Vendor not finalized yet — pending quote approval.' });
  const dWelcomeSignage = decorPlan({ area: 'Welcome Signage', theme: 'Hand-painted welcome board', vendorId: vDecor, installDate: '2027-01-29', installStartTime: '13:00', teardownDeadline: '2027-01-31', approvalStatus: 'Approved', approvedBy: 'Groom' });
  const dSeatingChart = decorPlan({ area: 'Seating Chart', theme: 'Framed calligraphy seating chart', vendorId: vDecor, installDate: '2027-01-29', installStartTime: '15:30', teardownDeadline: '2027-01-31' });
  const dGiftCounter = decorPlan({ area: 'Gift Counter', theme: 'Draped table with floral accent', vendorId: vDecor, installDate: '2027-01-29', installStartTime: '16:45', teardownDeadline: '2027-01-31' });

  const decorPlans: DecorPlan[] = [
    dChurchEntrance, dChurchAisle, dAltar, dReceptionEntrance, dStage, dCoupleSeating,
    dDiningTables, dCakeTable, dPhotoBackdrop, dWelcomeSignage, dSeatingChart, dGiftCounter,
  ];

  function deliverable(
    plan: DecorPlan,
    input: Omit<DecorDeliverable, 'id' | 'decorPlanId' | 'createdAt' | 'updatedAt' | 'freshFlowers' | 'powerRequired' | 'status'> &
      Partial<Pick<DecorDeliverable, 'freshFlowers' | 'powerRequired' | 'status'>>,
  ): DecorDeliverable {
    return {
      freshFlowers: false,
      powerRequired: false,
      status: 'Concept',
      ...input,
      id: generateId('decoritem'),
      decorPlanId: plan.id,
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const decorDeliverables: DecorDeliverable[] = [
    deliverable(dChurchEntrance, { name: 'Entrance floral arch', quantity: 1, freshFlowers: true, installationOwner: 'Petal & Stem Décor', status: 'Approved' }),
    deliverable(dChurchEntrance, { name: 'Welcome florals at gate', quantity: 2, freshFlowers: true, status: 'Approved' }),
    deliverable(dChurchAisle, { name: 'Aisle petal runner', quantity: 1, material: 'Rose petals', freshFlowers: true, status: 'Approved' }),
    deliverable(dChurchAisle, { name: 'Pew-end floral clips', quantity: 20, freshFlowers: true, status: 'Quoted' }),
    deliverable(dAltar, { name: 'Altar lily arrangement', quantity: 4, freshFlowers: true, status: 'Approved' }),
    deliverable(dAltar, { name: 'Battery candle set', quantity: 12, status: 'In Production' }),
    deliverable(dReceptionEntrance, { name: 'Fairy-light arch', quantity: 1, powerRequired: true, status: 'Quoted' }),
    deliverable(dReceptionEntrance, { name: 'Welcome florals', quantity: 2, freshFlowers: true, status: 'Concept' }),
    deliverable(dStage, { name: 'Backlit floral wall panels', quantity: 6, powerRequired: true, installationOwner: 'Luminous Events Lighting', status: 'In Production' }),
    deliverable(dStage, { name: 'Stage drapery', quantity: 1, material: 'Silk drape', status: 'Quoted' }),
    deliverable(dCoupleSeating, { name: 'Throne chairs', quantity: 2, material: 'Upholstered wood', status: 'Concept' }),
    deliverable(dCoupleSeating, { name: 'Backdrop floral wall', quantity: 1, freshFlowers: true, status: 'Concept' }),
    deliverable(dDiningTables, { name: 'Table centerpieces', quantity: 45, freshFlowers: true, status: 'Concept' }),
    deliverable(dDiningTables, { name: 'Greenery table runners', quantity: 45, status: 'Concept' }),
    deliverable(dCakeTable, { name: 'Floral cake stand', quantity: 1, freshFlowers: true, status: 'Concept' }),
    deliverable(dCakeTable, { name: 'Backdrop drape', quantity: 1, status: 'Concept' }),
    deliverable(dPhotoBackdrop, { name: 'LED marquee letters', quantity: 2, powerRequired: true, status: 'Concept', approvalNotes: 'Needs a vendor/production link before power can be arranged.' }),
    deliverable(dPhotoBackdrop, { name: 'Floral backdrop panel', quantity: 1, freshFlowers: true, status: 'Concept' }),
    deliverable(dWelcomeSignage, { name: 'Hand-painted welcome board', quantity: 1, status: 'Delivered' }),
    deliverable(dSeatingChart, { name: 'Calligraphy seating chart frame', quantity: 1, status: 'Quoted' }),
    deliverable(dGiftCounter, { name: 'Draped gift table', quantity: 1, status: 'Concept' }),
    deliverable(dGiftCounter, { name: 'Floral accent piece', quantity: 1, freshFlowers: true, status: 'Concept' }),
    deliverable(dChurchAisle, { name: 'Standing floral urns', quantity: 4, freshFlowers: true, status: 'Quoted' }),
    deliverable(dDiningTables, { name: 'Charger plates', quantity: 45, status: 'In Production' }),
  ];

  // ---------------------------------------------------------------------
  // Attire.
  // ---------------------------------------------------------------------
  function attireProfile(
    input: Omit<AttireProfile, 'id' | 'createdAt' | 'updatedAt' | 'event' | 'status'> & Partial<Pick<AttireProfile, 'event' | 'status'>>,
  ): AttireProfile {
    return {
      event: 'Wedding',
      status: 'Researching',
      ...input,
      id: generateId('attire'),
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const aGroomCeremony = attireProfile({ personRole: 'Groom', outfitType: 'Sherwani', vendorId: vAttire, orderedDate: '2026-08-01', firstFittingDate: '2026-08-20', finalFittingDate: '2026-07-25', status: 'Selected', storageLocation: "Groom's family home" });
  const aBrideCeremony = attireProfile({ personRole: 'Bride', outfitType: 'Traditional Kerala', vendorId: vAttire, orderedDate: '2026-08-01', firstFittingDate: '2026-08-18', finalFittingDate: '2026-11-15', status: 'First Fitting', storageLocation: "Bride's family home" });
  const aGroomReception = attireProfile({ personRole: 'Groom', outfitType: 'Reception Outfit', vendorId: vAttire, status: 'Selected' });
  const aBrideReception = attireProfile({ personRole: 'Bride', outfitType: 'Reception Outfit', vendorId: vAttire, status: 'Ordered' });
  const aGroomFather = attireProfile({ personRole: 'Groom Father', outfitType: 'Suit', status: 'Ordered' });
  const aGroomMother = attireProfile({ personRole: 'Groom Mother', outfitType: 'Saree', status: 'Selected' });
  const aBrideFather = attireProfile({ personRole: 'Bride Father', outfitType: 'Suit', status: 'Ordered' });
  const aBrideMother = attireProfile({ personRole: 'Bride Mother', outfitType: 'Saree', status: 'Selected' });
  const aBestMan = attireProfile({ personRole: 'Best Man', outfitType: 'Shirt / Trousers', status: 'Researching' });
  const aMaidOfHonor = attireProfile({ personRole: 'Maid of Honor', outfitType: 'Dress', status: 'Selected' });

  const attireProfiles: AttireProfile[] = [
    aGroomCeremony, aBrideCeremony, aGroomReception, aBrideReception,
    aGroomFather, aGroomMother, aBrideFather, aBrideMother, aBestMan, aMaidOfHonor,
  ];

  function attireItem(
    profile: AttireProfile,
    input: Omit<AttireItem, 'id' | 'attireProfileId' | 'createdAt' | 'updatedAt' | 'required' | 'status' | 'backupAvailable'> &
      Partial<Pick<AttireItem, 'required' | 'status' | 'backupAvailable'>>,
  ): AttireItem {
    return {
      required: true,
      status: 'Not Started',
      backupAvailable: false,
      ...input,
      id: generateId('attireitem'),
      attireProfileId: profile.id,
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const attireItems: AttireItem[] = [
    attireItem(aGroomCeremony, { itemName: 'Sherwani (main outfit)', category: 'Main Outfit', status: 'Ordered' }),
    attireItem(aGroomCeremony, { itemName: 'Formal shirt', category: 'Shirt', status: 'Ordered' }),
    attireItem(aGroomCeremony, { itemName: 'Churidar / trousers', category: 'Trousers', status: 'Ordered' }),
    attireItem(aGroomCeremony, { itemName: 'Formal shoes', category: 'Shoes', status: 'Ordered' }),
    attireItem(aGroomCeremony, { itemName: 'Cufflinks', category: 'Cufflinks', status: 'Not Started' }),
    attireItem(aGroomCeremony, { itemName: 'Turban / headwear', category: 'Other', status: 'Ready' }),
    attireItem(aGroomCeremony, { itemName: 'Formal socks', category: 'Socks', required: false, status: 'Ready' }),
    attireItem(aGroomReception, { itemName: 'Reception suit (main outfit)', category: 'Main Outfit', status: 'Ordered' }),
    attireItem(aGroomReception, { itemName: 'Reception shoes', category: 'Shoes', status: 'Ready', backupAvailable: false }),
    attireItem(aGroomReception, { itemName: 'Reception tie', category: 'Tie / Bow Tie', status: 'Ready' }),
    attireItem(aBrideCeremony, { itemName: 'Kasavu saree (main outfit)', category: 'Main Outfit', status: 'Ordered' }),
    attireItem(aBrideCeremony, { itemName: 'Bridal jewellery set', category: 'Jewellery', status: 'Ready' }),
    attireItem(aBrideCeremony, { itemName: 'Bridal footwear', category: 'Shoes', status: 'Ordered' }),
    attireItem(aBrideCeremony, { itemName: 'Bridal undergarments', category: 'Undergarment', status: 'Ready' }),
    attireItem(aBrideCeremony, { itemName: 'Veil', category: 'Other', status: 'Ready' }),
    attireItem(aBrideReception, { itemName: 'Reception gown (main outfit)', category: 'Main Outfit', status: 'Ordered' }),
    attireItem(aBrideReception, { itemName: 'Reception jewellery', category: 'Jewellery', status: 'Ready' }),
    attireItem(aBrideReception, { itemName: 'Reception footwear', category: 'Shoes', status: 'Not Started' }),
    attireItem(aGroomFather, { itemName: 'Suit (main outfit)', category: 'Main Outfit', status: 'Ordered' }),
    attireItem(aGroomFather, { itemName: 'Formal shoes', category: 'Shoes', required: false, status: 'Ready' }),
    attireItem(aGroomMother, { itemName: 'Saree (main outfit)', category: 'Main Outfit', status: 'Ordered' }),
    attireItem(aGroomMother, { itemName: 'Jewellery', category: 'Jewellery', required: false, status: 'Ready' }),
    attireItem(aBrideFather, { itemName: 'Suit (main outfit)', category: 'Main Outfit', status: 'Ordered' }),
    attireItem(aBrideFather, { itemName: 'Watch', category: 'Watch', required: false, status: 'Ready' }),
    attireItem(aBrideMother, { itemName: 'Saree (main outfit)', category: 'Main Outfit', status: 'Ordered' }),
    attireItem(aBrideMother, { itemName: 'Jewellery', category: 'Jewellery', required: false, status: 'Ready' }),
    attireItem(aBestMan, { itemName: 'Suit (main outfit)', category: 'Main Outfit', status: 'Not Started' }),
    attireItem(aBestMan, { itemName: 'Shoes', category: 'Shoes', status: 'Not Started' }),
    attireItem(aMaidOfHonor, { itemName: 'Dress (main outfit)', category: 'Main Outfit', status: 'Ordered' }),
    attireItem(aMaidOfHonor, { itemName: 'Shoes', category: 'Shoes', status: 'Ready' }),
    attireItem(aMaidOfHonor, { itemName: 'Jewellery', category: 'Jewellery', required: false, status: 'Ready' }),
    attireItem(aGroomCeremony, { itemName: 'Pocket square', category: 'Pocket Square', required: false, status: 'Ready' }),
    attireItem(aBrideCeremony, { itemName: 'Bridal clutch', category: 'Other', required: false, status: 'Ready' }),
    attireItem(aGroomReception, { itemName: 'Belt', category: 'Belt', required: false, status: 'Ready' }),
  ];

  // ---------------------------------------------------------------------
  // Grooming.
  // ---------------------------------------------------------------------
  function grooming(input: Omit<GroomingAppointment, 'id' | 'createdAt' | 'updatedAt' | 'status'> & Partial<Pick<GroomingAppointment, 'status'>>): GroomingAppointment {
    return {
      status: 'Planned',
      ...input,
      id: generateId('grooming'),
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const groomingAppointments: GroomingAppointment[] = [
    grooming({ personRole: 'Groom', type: 'Haircut', vendorId: vGrooming, date: '2027-01-28', time: '10:00', location: 'Glow Studio', status: 'Booked' }),
    grooming({ personRole: 'Groom', type: 'Beard / Shave', vendorId: vGrooming, date: '2027-01-30', time: '06:00', location: 'Groom family home', status: 'Booked' }),
    grooming({ personRole: 'Bride', type: 'Makeup', vendorId: vGrooming, date: '2027-01-30', time: '05:30', location: 'Bride family home', status: 'Confirmed' }),
    grooming({ personRole: 'Bride', type: 'Facial', vendorId: vGrooming, date: '2027-01-25', time: '14:00', location: 'Glow Studio', status: 'Booked' }),
    grooming({ personRole: 'Bride', type: 'Styling', vendorId: vGrooming, date: '2027-01-30', time: '07:00', location: 'Bride family home', status: 'Confirmed' }),
    grooming({ personRole: 'Bride', type: 'Nail / Grooming', vendorId: vGrooming, date: '2027-01-29', time: '11:00', location: 'Glow Studio', status: 'Planned' }),
  ];

  // ---------------------------------------------------------------------
  // Photography / video.
  // ---------------------------------------------------------------------
  const photographyWedding: PhotographyPlan = {
    id: generateId('photoplan'),
    event: 'Wedding',
    vendorId: vPhotoShutter,
    coverageStart: '2027-01-30T05:30',
    coverageEnd: '2027-01-31T00:00',
    photographerCount: 2,
    videographerCount: 1,
    droneRequired: true,
    liveStreamingRequired: true,
    sameDayEditRequired: true,
    rawFilesIncluded: true,
    albumIncluded: true,
    highlightsVideoIncluded: true,
    fullFilmIncluded: true,
    churchRestrictionsConfirmed: true,
    deliveryDueDate: '2027-03-15',
    notes: 'Church restrictions from the parish shared with the studio in advance.',
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_CREATED_AT,
  };
  const photographyEngagement: PhotographyPlan = {
    id: generateId('photoplan'),
    event: 'Engagement',
    coverageStart: '2027-01-11T16:00',
    coverageEnd: '2027-01-11T21:00',
    photographerCount: 1,
    videographerCount: 0,
    droneRequired: false,
    liveStreamingRequired: false,
    sameDayEditRequired: false,
    rawFilesIncluded: true,
    albumIncluded: false,
    highlightsVideoIncluded: false,
    fullFilmIncluded: false,
    churchRestrictionsConfirmed: false,
    notes: 'Vendor still being shortlisted for the Goa engagement.',
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_CREATED_AT,
  };
  const photographyPlans: PhotographyPlan[] = [photographyWedding, photographyEngagement];

  function photoGroup(
    order: number,
    groupName: string,
    priority: PhotoGroup['priority'],
    opts: Partial<Pick<PhotoGroup, 'coordinator' | 'completed' | 'location' | 'notes' | 'participants'>> = {},
  ): PhotoGroup {
    return {
      id: generateId('photogroup'),
      event: 'Wedding',
      groupName,
      sequenceOrder: order,
      priority,
      completed: false,
      participants: opts.participants ?? [],
      coordinator: opts.coordinator,
      location: opts.location,
      notes: opts.notes,
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const photoGroups: PhotoGroup[] = [
    photoGroup(1, 'Couple with both sets of parents', 'Must Have', { coordinator: 'Priya Varghese', location: 'Church steps' }),
    photoGroup(2, "Couple with groom's parents", 'Must Have', { coordinator: 'Priya Varghese' }),
    photoGroup(3, "Couple with bride's parents", 'Must Have', { coordinator: 'Priya Varghese' }),
    photoGroup(4, 'Couple with siblings', 'Important', { coordinator: 'Priya Varghese' }),
    photoGroup(5, 'Couple with grandparents', 'Must Have', { notes: 'Coordinator not yet assigned — follow up.' }),
    photoGroup(6, 'Couple with witnesses', 'Important', { coordinator: 'Priya Varghese' }),
    photoGroup(7, 'Couple with clergy', 'Important', { coordinator: 'Priya Varghese' }),
    photoGroup(8, "Full groom-side family", 'Important', { coordinator: 'Thomas Varkey', location: 'Church lawn' }),
    photoGroup(9, "Full bride-side family", 'Important', { coordinator: 'George Mathew', location: 'Church lawn' }),
    photoGroup(10, 'Groom with parents', 'Must Have', { coordinator: 'Priya Varghese' }),
    photoGroup(11, 'Bride with parents', 'Must Have', { coordinator: 'Priya Varghese' }),
    photoGroup(12, 'Couple with close friends', 'Nice to Have', { coordinator: 'Priya Varghese' }),
    photoGroup(13, 'Couple with the choir', 'Nice to Have' ),
    photoGroup(14, "Bride's college friends group", 'Nice to Have', { coordinator: 'Divya Joseph' }),
    photoGroup(15, "Groom's college friends group", 'Nice to Have', { coordinator: 'Jerin Alex' }),
    photoGroup(16, 'Ring exchange close-up', 'Must Have', { coordinator: 'Priya Varghese', location: 'Altar' }),
  ];

  // ---------------------------------------------------------------------
  // Music / AV.
  // ---------------------------------------------------------------------
  function musicCue(
    order: number,
    cueType: MusicCue['cueType'],
    title: string,
    opts: Partial<Pick<MusicCue, 'performer' | 'linkedVendorId' | 'plannedTime' | 'approved' | 'backupAvailable' | 'notes'>> = {},
  ): MusicCue {
    return {
      id: generateId('cue'),
      event: 'Wedding',
      cueType,
      title,
      sequenceOrder: order,
      approved: opts.approved ?? true,
      backupAvailable: opts.backupAvailable ?? false,
      performer: opts.performer,
      linkedVendorId: opts.linkedVendorId,
      plannedTime: opts.plannedTime,
      notes: opts.notes,
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const musicCues: MusicCue[] = [
    musicCue(1, 'Processional', 'Bridal party processional hymn', { performer: 'Voices of Grace Choir', linkedVendorId: vChoir, plannedTime: '09:55' }),
    musicCue(2, 'Hymn', "Bride's entrance hymn", { performer: 'Voices of Grace Choir', linkedVendorId: vChoir, plannedTime: '10:00' }),
    musicCue(3, 'Psalm', 'Responsorial psalm', { performer: 'Voices of Grace Choir', linkedVendorId: vChoir, plannedTime: '10:14' }),
    musicCue(4, 'Hymn', 'Communion hymn', { performer: 'Voices of Grace Choir', linkedVendorId: vChoir, plannedTime: '11:15', approved: false }),
    musicCue(5, 'Recessional', 'Recessional hymn', { performer: 'Voices of Grace Choir', linkedVendorId: vChoir, plannedTime: '11:45' }),
    musicCue(6, 'Couple Entrance', 'Reception couple entrance track', { performer: 'DJ Rhythm Nation', linkedVendorId: vDJ, plannedTime: '19:00' }),
    musicCue(7, 'Cake Cutting', 'Cake cutting track', { performer: 'DJ Rhythm Nation', linkedVendorId: vDJ, plannedTime: '20:30' }),
    musicCue(8, 'First Dance', "Couple's first dance", { performer: 'DJ Rhythm Nation', linkedVendorId: vDJ, plannedTime: '20:45', approved: false }),
    musicCue(9, 'Dinner', 'Dinner background playlist (set 1)', { performer: 'DJ Rhythm Nation', linkedVendorId: vDJ, plannedTime: '21:00', backupAvailable: true }),
    musicCue(10, 'Dinner', 'Dinner background playlist (set 2)', { performer: 'DJ Rhythm Nation', linkedVendorId: vDJ, plannedTime: '21:45', backupAvailable: true }),
    musicCue(11, 'Speech Transition', 'Speech transition stings', { performer: 'DJ Rhythm Nation', linkedVendorId: vDJ, plannedTime: '20:00' }),
    musicCue(12, 'Closing', 'Closing send-off track', { performer: 'DJ Rhythm Nation', linkedVendorId: vDJ, plannedTime: '23:30', backupAvailable: true }),
  ];

  const musicAVPlan: MusicAVPlan = {
    id: generateId('musicav'),
    event: 'Wedding',
    choirVendorId: vChoir,
    djVendorId: vDJ,
    avVendorId: vSound,
    emceeName: 'Ansh Varma',
    emceePhone: '+91 90000 60015',
    microphoneCount: 4,
    backupMicrophones: 2,
    soundcheckDate: '2027-01-29',
    soundcheckTime: '17:00',
    podiumRequired: true,
    offlinePlaylistReady: false,
    backupBatteriesReady: true,
    notes: 'Pronunciation guide and emcee script drafted; final read-through pending with the couple.',
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_CREATED_AT,
  };
  const musicAVPlans: MusicAVPlan[] = [musicAVPlan];

  // ---------------------------------------------------------------------
  // Gifts, favors, and welcome kits.
  // ---------------------------------------------------------------------
  function giftPlan(input: Omit<GiftPlan, 'id' | 'createdAt' | 'updatedAt' | 'event' | 'status'> & Partial<Pick<GiftPlan, 'event' | 'status'>>): GiftPlan {
    return {
      event: 'Wedding',
      status: 'Planned',
      ...input,
      id: generateId('gift'),
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const giftPlans: GiftPlan[] = [
    giftPlan({ recipientType: 'Bride Parents', recipientName: 'George & Susan Mathew', giftType: 'Silver gift set', quantity: 1, custodian: 'Groom', distributionOwner: 'Groom', status: 'Ordered' }),
    giftPlan({ recipientType: 'Groom Parents', recipientName: 'Thomas & Aleyamma Varkey', giftType: 'Silver gift set', quantity: 1, custodian: 'Bride', distributionOwner: 'Bride', status: 'Ordered' }),
    giftPlan({ recipientType: 'Witnesses', recipientName: 'Jerin Alex & Neha Varghese', giftType: 'Engraved keepsake box', quantity: 2, distributionOwner: 'Ceremony Coordinator', status: 'Planned' }),
    giftPlan({ recipientType: 'Clergy', recipientName: 'Fr. Thomas Chacko', giftType: 'Ceremonial stole and offering', quantity: 1, distributionOwner: 'Groom Father', status: 'Planned' }),
    giftPlan({ recipientType: 'Siblings', giftType: 'Personalized hampers', quantity: 4, distributionOwner: 'Bride', status: 'Planned' }),
    giftPlan({ recipientType: 'Groomsmen / Helpers', giftType: 'Cufflink sets', quantity: 5, distributionOwner: 'Groom', status: 'Ordered' }),
    giftPlan({ recipientType: 'Guests', giftType: 'Return gift favors', quantity: 40, vendorId: vPrinting(vendors), distributionOwner: 'Bride Mother', status: 'Planned', notes: 'Quantity needs review against confirmed attendance plus buffer.' }),
    giftPlan({ recipientType: 'Bride', recipientName: 'Bride', giftType: "Groom's gift to bride", quantity: 1, custodian: 'Groom', distributionOwner: 'Groom', status: 'Ordered' }),
    giftPlan({ recipientType: 'Groom', recipientName: 'Groom', giftType: "Bride's gift to groom", quantity: 1, custodian: 'Bride', distributionOwner: 'Bride', status: 'Planned' }),
    giftPlan({ recipientType: 'Other', recipientName: 'Priya Varghese', giftType: 'Thank-you gift for family photo coordinator', quantity: 1, distributionOwner: 'Bride', status: 'Planned' }),
    giftPlan({ recipientType: 'Other', recipientName: 'Ann Sebastian', giftType: 'Thank-you gift for ceremony coordinator', quantity: 1, distributionOwner: 'Groom', status: 'Planned' }),
    giftPlan({ recipientType: 'Other', recipientName: 'Ushers', giftType: 'Token thank-you gifts', quantity: 3, distributionOwner: 'Groom', status: 'Planned' }),
  ];

  function welcomeKit(input: Omit<WelcomeKit, 'id' | 'createdAt' | 'updatedAt' | 'status'> & Partial<Pick<WelcomeKit, 'status'>>): WelcomeKit {
    return {
      status: 'Planned',
      ...input,
      id: generateId('kit'),
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const kitFamily = welcomeKit({ name: 'Family & Close Relatives Welcome Kit', targetGuestGroup: 'Out-of-town immediate and extended family', hotelId: marigoldHotel, quantityPlanned: 40, quantityPrepared: 25, distributionLocation: 'Hotel front desk', distributionOwner: 'Groom Mother', status: 'Procured' });
  const kitGuests = welcomeKit({ name: 'Out-of-Town Guests Kit', targetGuestGroup: 'Out-of-town wedding guests', hotelId: marigoldHotel, quantityPlanned: 60, quantityPrepared: 60, distributionLocation: 'Hotel front desk', distributionOwner: 'Bride Father', status: 'Packed' });
  const kitVip = welcomeKit({ name: 'VIP / Family Elders Kit', targetGuestGroup: 'Grandparents and senior family members', hotelId: marigoldHotel, quantityPlanned: 10, quantityPrepared: 10, distributionLocation: 'Hotel front desk', status: 'Planned' });

  const welcomeKits: WelcomeKit[] = [kitFamily, kitGuests, kitVip];

  function kitItem(kit: WelcomeKit, itemName: string, quantityPerKit: number, vendorId?: string): WelcomeKitItem {
    return {
      id: generateId('kititem'),
      welcomeKitId: kit.id,
      itemName,
      quantityPerKit,
      vendorId,
      createdAt: SEED_CREATED_AT,
      updatedAt: SEED_CREATED_AT,
    };
  }

  const welcomeKitItems: WelcomeKitItem[] = [
    kitItem(kitFamily, 'Water bottle', 2),
    kitItem(kitFamily, 'Local snacks box', 1),
    kitItem(kitFamily, 'Printed event itinerary', 1, vPrinting(vendors)),
    kitItem(kitFamily, 'Transport contact card', 1),
    kitItem(kitFamily, 'Hotel information card', 1),
    kitItem(kitGuests, 'Water bottle', 2),
    kitItem(kitGuests, 'Local snacks box', 1),
    kitItem(kitGuests, 'Printed event itinerary', 1, vPrinting(vendors)),
    kitItem(kitGuests, 'Local information booklet', 1),
    kitItem(kitGuests, 'Emergency contact card', 1),
    kitItem(kitVip, 'Water bottle', 2),
    kitItem(kitVip, 'Printed event itinerary', 1, vPrinting(vendors)),
    kitItem(kitVip, 'Hotel information card', 1),
    kitItem(kitVip, 'Emergency contact card', 1),
  ];

  return {
    churchProfiles: [church],
    churchRequirements,
    ceremonyParticipants,
    ceremonySequenceItems,
    ceremonyItems,
    cateringPlans: [cateringPlan],
    menuItems,
    decorPlans,
    decorDeliverables,
    attireProfiles,
    attireItems,
    groomingAppointments,
    photographyPlans,
    photoGroups,
    musicCues,
    musicAVPlans,
    giftPlans,
    welcomeKits,
    welcomeKitItems,
  };
}

function vPrinting(vendors: Vendor[]): string | undefined {
  return vendors.find((v) => v.name === 'PrintCraft Invitations')?.id;
}
