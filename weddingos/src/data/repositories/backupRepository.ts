import type {
  AppSettings,
  AttireItem,
  AttireProfile,
  BudgetCategory,
  BudgetItem,
  CateringPlan,
  CeremonyItem,
  CeremonyItemMovement,
  CeremonyParticipant,
  CeremonySequenceItem,
  ChurchProfile,
  ChurchRequirement,
  CloseoutItem,
  Contract,
  Decision,
  DecorDeliverable,
  DecorPlan,
  Driver,
  DutyAssignment,
  EmergencyContact,
  EmergencyResponseCard,
  FinalReadinessReview,
  GiftPlan,
  GroomingAppointment,
  Guest,
  GuestEvent,
  GuestOperationalStatus,
  Hotel,
  Household,
  LiveIssue,
  ManifestFreezeState,
  MenuItem,
  MusicAVPlan,
  MusicCue,
  Owner,
  Payment,
  PaymentSchedule,
  PhotoGroup,
  PhotographyPlan,
  Refund,
  Room,
  RoomAssignment,
  RoomType,
  RunSheetItem,
  Task,
  TransportAssignment,
  TransportRoute,
  TravelSegment,
  Vehicle,
  Vendor,
  VendorContact,
  VendorDayStatus,
  VendorQuote,
  WeddingOSBackup,
  WelcomeKit,
  WelcomeKitItem,
} from '@/types';
import {
  AGE_CATEGORIES,
  APPROVAL_STATUSES,
  ATTIRE_ITEM_CATEGORIES,
  ATTIRE_ITEM_STATUSES,
  ATTIRE_OUTFIT_TYPES,
  ATTIRE_STATUSES,
  BACKUP_VERSION,
  CATERING_SERVICE_STYLES,
  CEREMONY_ITEM_APPLICABILITY,
  CEREMONY_ITEM_CATEGORIES,
  CEREMONY_ITEM_MOVEMENT_ACTIONS,
  CEREMONY_ITEM_STATUSES,
  CEREMONY_ITEM_VERIFICATION_STATUSES,
  CEREMONY_PARTICIPANT_ROLES,
  CEREMONY_SEQUENCE_STATUSES,
  CHURCH_APPLICABILITY,
  CHURCH_REQUIREMENT_CATEGORIES,
  CHURCH_REQUIREMENT_STATUSES,
  CLOSEOUT_CATEGORIES,
  CLOSEOUT_STATUSES,
  CONTRACT_STATUSES,
  DECOR_AREAS,
  DECOR_APPROVAL_STATUSES,
  DECOR_DELIVERABLE_STATUSES,
  DENOMINATIONS,
  DECISION_STATUSES,
  DIETARY_PREFERENCES,
  DUTY_ROLES,
  DUTY_STATUSES,
  EMERGENCY_CONTACT_CATEGORIES,
  EMERGENCY_CONTACT_PRIORITIES,
  EMERGENCY_RESPONSE_CARD_TYPES,
  EVENTS,
  GIFT_RECIPIENT_TYPES,
  GIFT_STATUSES,
  GROOMING_STATUSES,
  GROOMING_TYPES,
  GUEST_OPERATIONAL_STATES,
  HOUSEHOLD_SIDES,
  INVITATION_STATUSES,
  LIVE_ISSUE_CATEGORIES,
  LIVE_ISSUE_SEVERITIES,
  LIVE_ISSUE_STATUSES,
  MANIFEST_TYPES,
  MENU_COURSES,
  MENU_DIETARY_TYPES,
  MUSIC_CUE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_SCHEDULE_STATUSES,
  PHOTO_GROUP_PRIORITIES,
  PREFERRED_CONTACT_METHODS,
  PRIORITIES,
  QUOTE_STATUSES,
  REFUND_STATUSES,
  REFUND_TYPES,
  ROOM_ASSIGNMENT_STATUSES,
  ROOM_STATUSES,
  ROUTE_STATUSES,
  ROUTE_TYPES,
  RUN_SHEET_CATEGORIES,
  RUN_SHEET_RELATIVE_REFERENCES,
  RUN_SHEET_STATUSES,
  TASK_STATUSES,
  TRANSPORT_ASSIGNMENT_STATUSES,
  TRAVEL_BOOKING_STATUSES,
  TRAVEL_DIRECTIONS,
  TRAVEL_MODES,
  VEHICLE_STATUSES,
  VEHICLE_TYPES,
  VENDOR_DAY_STATUSES,
  VENDOR_STATUSES,
  WELCOME_KIT_STATUSES,
  DEFAULT_WEDDING_DAY_SETTINGS,
  DEFAULT_WEDDING_PREP_SECTION_WEIGHTS,
} from '@/types';
import { DEFAULT_BUDGET_VARIANCE_WARNING_PERCENT, DEFAULT_CRITICAL_VENDOR_CATEGORIES, DEFAULT_CURRENCY, DEFAULT_LARGE_CASH_WARNING_THRESHOLD } from '@/lib/constants';
import {
  attireItemsStore,
  attireProfilesStore,
  budgetCategoriesStore,
  budgetItemsStore,
  cateringPlansStore,
  ceremonyItemMovementsStore,
  ceremonyItemsStore,
  ceremonyParticipantsStore,
  ceremonySequenceItemsStore,
  churchProfilesStore,
  churchRequirementsStore,
  closeoutItemsStore,
  contractsStore,
  decisionsStore,
  decorDeliverablesStore,
  decorPlansStore,
  driversStore,
  dutyAssignmentsStore,
  emergencyContactsStore,
  emergencyResponseCardsStore,
  finalReadinessReviewsStore,
  giftPlansStore,
  groomingAppointmentsStore,
  guestOperationalStatusesStore,
  guestsStore,
  hotelsStore,
  householdsStore,
  liveIssuesStore,
  manifestFreezeStatesStore,
  menuItemsStore,
  musicAVPlansStore,
  musicCuesStore,
  ownersStore,
  paymentSchedulesStore,
  paymentsStore,
  photoGroupsStore,
  photographyPlansStore,
  refundsStore,
  roomAssignmentsStore,
  roomTypesStore,
  roomsStore,
  runSheetItemsStore,
  settingsStore,
  tasksStore,
  transportAssignmentsStore,
  transportRoutesStore,
  travelSegmentsStore,
  vehiclesStore,
  vendorContactsStore,
  vendorDayStatusesStore,
  vendorQuotesStore,
  vendorsStore,
  welcomeKitItemsStore,
  welcomeKitsStore,
} from '../stores';

export function exportBackup(): WeddingOSBackup {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings: settingsStore.get(),
    tasks: tasksStore.get(),
    decisions: decisionsStore.get(),
    owners: ownersStore.get(),
    households: householdsStore.get(),
    guests: guestsStore.get(),
    travelSegments: travelSegmentsStore.get(),
    hotels: hotelsStore.get(),
    roomTypes: roomTypesStore.get(),
    rooms: roomsStore.get(),
    roomAssignments: roomAssignmentsStore.get(),
    vehicles: vehiclesStore.get(),
    drivers: driversStore.get(),
    transportRoutes: transportRoutesStore.get(),
    transportAssignments: transportAssignmentsStore.get(),
    vendors: vendorsStore.get(),
    vendorContacts: vendorContactsStore.get(),
    vendorQuotes: vendorQuotesStore.get(),
    contracts: contractsStore.get(),
    budgetCategories: budgetCategoriesStore.get(),
    budgetItems: budgetItemsStore.get(),
    paymentSchedules: paymentSchedulesStore.get(),
    payments: paymentsStore.get(),
    refunds: refundsStore.get(),
    churchProfiles: churchProfilesStore.get(),
    churchRequirements: churchRequirementsStore.get(),
    ceremonyParticipants: ceremonyParticipantsStore.get(),
    ceremonySequenceItems: ceremonySequenceItemsStore.get(),
    ceremonyItems: ceremonyItemsStore.get(),
    cateringPlans: cateringPlansStore.get(),
    menuItems: menuItemsStore.get(),
    decorPlans: decorPlansStore.get(),
    decorDeliverables: decorDeliverablesStore.get(),
    attireProfiles: attireProfilesStore.get(),
    attireItems: attireItemsStore.get(),
    groomingAppointments: groomingAppointmentsStore.get(),
    photographyPlans: photographyPlansStore.get(),
    photoGroups: photoGroupsStore.get(),
    musicCues: musicCuesStore.get(),
    musicAVPlans: musicAVPlansStore.get(),
    giftPlans: giftPlansStore.get(),
    welcomeKits: welcomeKitsStore.get(),
    welcomeKitItems: welcomeKitItemsStore.get(),
    runSheetItems: runSheetItemsStore.get(),
    liveIssues: liveIssuesStore.get(),
    dutyAssignments: dutyAssignmentsStore.get(),
    vendorDayStatuses: vendorDayStatusesStore.get(),
    ceremonyItemMovements: ceremonyItemMovementsStore.get(),
    emergencyContacts: emergencyContactsStore.get(),
    emergencyResponseCards: emergencyResponseCardsStore.get(),
    closeoutItems: closeoutItemsStore.get(),
    finalReadinessReviews: finalReadinessReviewsStore.get(),
    guestOperationalStatuses: guestOperationalStatusesStore.get(),
    manifestFreezeStates: manifestFreezeStatesStore.get(),
  };
}

export interface BackupValidationResult {
  valid: boolean;
  errors: string[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidSettings(value: unknown): value is AppSettings {
  if (!isPlainObject(value)) return false;
  const { couple, engagement, wedding, weddingDetails } = value;
  if (!isPlainObject(couple) || typeof couple.groomName !== 'string' || typeof couple.brideName !== 'string') return false;
  if (!isPlainObject(engagement) || typeof engagement.date !== 'string') return false;
  if (!isPlainObject(wedding) || typeof wedding.date !== 'string') return false;
  if (!isPlainObject(weddingDetails) || typeof weddingDetails.currency !== 'string') return false;
  if (!DENOMINATIONS.includes(weddingDetails.denomination as (typeof DENOMINATIONS)[number])) return false;
  return true;
}

function isValidTask(value: unknown): value is Task {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.title !== 'string') return false;
  if (!EVENTS.includes(value.event as (typeof EVENTS)[number])) return false;
  if (!TASK_STATUSES.includes(value.status as (typeof TASK_STATUSES)[number])) return false;
  if (!PRIORITIES.includes(value.priority as (typeof PRIORITIES)[number])) return false;
  if (!Array.isArray(value.dependencies) || !Array.isArray(value.tags) || !Array.isArray(value.subtasks)) return false;
  return true;
}

function isValidDecision(value: unknown): value is Decision {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.title !== 'string') return false;
  if (!DECISION_STATUSES.includes(value.status as (typeof DECISION_STATUSES)[number])) return false;
  if (!Array.isArray(value.options)) return false;
  return true;
}

function isValidOwner(value: unknown): value is Owner {
  return isPlainObject(value) && typeof value.id === 'string' && typeof value.name === 'string';
}

function isValidHousehold(value: unknown): value is Household {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.householdName !== 'string') return false;
  if (!HOUSEHOLD_SIDES.includes(value.side as (typeof HOUSEHOLD_SIDES)[number])) return false;
  if (!INVITATION_STATUSES.includes(value.invitationStatus as (typeof INVITATION_STATUSES)[number])) return false;
  if (!Array.isArray(value.invitedEvents) || !Array.isArray(value.invitationMethod)) return false;
  return true;
}

function isValidGuest(value: unknown): value is Guest {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.householdId !== 'string' || typeof value.fullName !== 'string') return false;
  if (!AGE_CATEGORIES.includes(value.ageCategory as (typeof AGE_CATEGORIES)[number])) return false;
  if (!DIETARY_PREFERENCES.includes(value.dietaryPreference as (typeof DIETARY_PREFERENCES)[number])) return false;
  if (!Array.isArray(value.invitedEvents) || !Array.isArray(value.rsvpResponses)) return false;
  return true;
}

function isValidTravelSegment(value: unknown): value is TravelSegment {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.guestId !== 'string' || typeof value.householdId !== 'string') return false;
  if (!EVENTS.includes(value.event as (typeof EVENTS)[number])) return false;
  if (!TRAVEL_DIRECTIONS.includes(value.direction as (typeof TRAVEL_DIRECTIONS)[number])) return false;
  if (!TRAVEL_MODES.includes(value.travelMode as (typeof TRAVEL_MODES)[number])) return false;
  if (!TRAVEL_BOOKING_STATUSES.includes(value.bookingStatus as (typeof TRAVEL_BOOKING_STATUSES)[number])) return false;
  if (typeof value.origin !== 'string' || typeof value.destination !== 'string') return false;
  return true;
}

function isValidHotel(value: unknown): value is Hotel {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.city !== 'string') return false;
  return true;
}

function isValidRoomType(value: unknown): value is RoomType {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.hotelId !== 'string' || typeof value.name !== 'string') return false;
  if (typeof value.capacity !== 'number') return false;
  return true;
}

function isValidRoom(value: unknown): value is Room {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.hotelId !== 'string' || typeof value.roomTypeId !== 'string') return false;
  if (typeof value.roomNumber !== 'string') return false;
  if (!ROOM_STATUSES.includes(value.status as (typeof ROOM_STATUSES)[number])) return false;
  return true;
}

function isValidRoomAssignment(value: unknown): value is RoomAssignment {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.roomId !== 'string' || typeof value.guestId !== 'string') return false;
  if (typeof value.checkInDate !== 'string' || typeof value.checkOutDate !== 'string') return false;
  if (!ROOM_ASSIGNMENT_STATUSES.includes(value.assignmentStatus as (typeof ROOM_ASSIGNMENT_STATUSES)[number])) return false;
  return true;
}

function isValidVehicle(value: unknown): value is Vehicle {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return false;
  if (!VEHICLE_TYPES.includes(value.vehicleType as (typeof VEHICLE_TYPES)[number])) return false;
  if (!VEHICLE_STATUSES.includes(value.status as (typeof VEHICLE_STATUSES)[number])) return false;
  if (typeof value.passengerCapacity !== 'number') return false;
  return true;
}

function isValidDriver(value: unknown): value is Driver {
  if (!isPlainObject(value)) return false;
  return typeof value.id === 'string' && typeof value.name === 'string' && typeof value.phone === 'string';
}

function isValidTransportRoute(value: unknown): value is TransportRoute {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return false;
  if (!EVENTS.includes(value.event as (typeof EVENTS)[number])) return false;
  if (!ROUTE_TYPES.includes(value.routeType as (typeof ROUTE_TYPES)[number])) return false;
  if (!ROUTE_STATUSES.includes(value.status as (typeof ROUTE_STATUSES)[number])) return false;
  return true;
}

function isValidTransportAssignment(value: unknown): value is TransportAssignment {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.routeId !== 'string' || typeof value.guestId !== 'string') return false;
  if (!TRANSPORT_ASSIGNMENT_STATUSES.includes(value.assignmentStatus as (typeof TRANSPORT_ASSIGNMENT_STATUSES)[number])) return false;
  if (typeof value.seatCount !== 'number') return false;
  return true;
}

function isValidVendor(value: unknown): value is Vendor {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return false;
  if (!VENDOR_STATUSES.includes(value.status as (typeof VENDOR_STATUSES)[number])) return false;
  if (typeof value.gstApplicable !== 'boolean') return false;
  if (typeof value.finalPrimaryContactConfirmed !== 'boolean' || typeof value.finalBackupContactConfirmed !== 'boolean') return false;
  return true;
}

function isValidVendorContact(value: unknown): value is VendorContact {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.vendorId !== 'string' || typeof value.name !== 'string') return false;
  if (!PREFERRED_CONTACT_METHODS.includes(value.preferredContactMethod as (typeof PREFERRED_CONTACT_METHODS)[number])) return false;
  return true;
}

function isValidVendorQuote(value: unknown): value is VendorQuote {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.vendorId !== 'string') return false;
  if (!QUOTE_STATUSES.includes(value.status as (typeof QUOTE_STATUSES)[number])) return false;
  if (typeof value.baseAmount !== 'number' || typeof value.totalAmount !== 'number') return false;
  if (typeof value.isSelected !== 'boolean') return false;
  return true;
}

function isValidContract(value: unknown): value is Contract {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.vendorId !== 'string') return false;
  if (!CONTRACT_STATUSES.includes(value.status as (typeof CONTRACT_STATUSES)[number])) return false;
  return true;
}

function isValidBudgetCategory(value: unknown): value is BudgetCategory {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return false;
  if (typeof value.plannedAmount !== 'number' || typeof value.contingencyAmount !== 'number') return false;
  return true;
}

function isValidBudgetItem(value: unknown): value is BudgetItem {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.categoryId !== 'string' || typeof value.itemName !== 'string') return false;
  if (!APPROVAL_STATUSES.includes(value.approvalStatus as (typeof APPROVAL_STATUSES)[number])) return false;
  if (typeof value.originalBudget !== 'number') return false;
  return true;
}

function isValidPaymentSchedule(value: unknown): value is PaymentSchedule {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.vendorId !== 'string' || typeof value.milestone !== 'string') return false;
  if (!PAYMENT_SCHEDULE_STATUSES.includes(value.status as (typeof PAYMENT_SCHEDULE_STATUSES)[number])) return false;
  if (typeof value.amount !== 'number') return false;
  return true;
}

function isValidPayment(value: unknown): value is Payment {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.vendorId !== 'string' || typeof value.paymentDate !== 'string') return false;
  if (!PAYMENT_METHODS.includes(value.paymentMethod as (typeof PAYMENT_METHODS)[number])) return false;
  if (typeof value.amount !== 'number') return false;
  if (typeof value.invoiceReceived !== 'boolean' || typeof value.receiptReceived !== 'boolean') return false;
  return true;
}

function isValidRefund(value: unknown): value is Refund {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.vendorId !== 'string') return false;
  if (!REFUND_TYPES.includes(value.refundType as (typeof REFUND_TYPES)[number])) return false;
  if (!REFUND_STATUSES.includes(value.status as (typeof REFUND_STATUSES)[number])) return false;
  return true;
}

function isValidChurchProfile(value: unknown): value is ChurchProfile {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.churchName !== 'string') return false;
  if (!DENOMINATIONS.includes(value.denomination as (typeof DENOMINATIONS)[number])) return false;
  return true;
}

function isValidChurchRequirement(value: unknown): value is ChurchRequirement {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.churchProfileId !== 'string' || typeof value.title !== 'string') return false;
  if (!CHURCH_REQUIREMENT_CATEGORIES.includes(value.category as (typeof CHURCH_REQUIREMENT_CATEGORIES)[number])) return false;
  if (!CHURCH_APPLICABILITY.includes(value.applicability as (typeof CHURCH_APPLICABILITY)[number])) return false;
  if (!CHURCH_REQUIREMENT_STATUSES.includes(value.status as (typeof CHURCH_REQUIREMENT_STATUSES)[number])) return false;
  return true;
}

function isValidCeremonyParticipant(value: unknown): value is CeremonyParticipant {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return false;
  if (!CEREMONY_PARTICIPANT_ROLES.includes(value.role as (typeof CEREMONY_PARTICIPANT_ROLES)[number])) return false;
  if (typeof value.confirmed !== 'boolean') return false;
  return true;
}

function isValidCeremonySequenceItem(value: unknown): value is CeremonySequenceItem {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.title !== 'string' || typeof value.sequenceOrder !== 'number') return false;
  if (!CEREMONY_SEQUENCE_STATUSES.includes(value.status as (typeof CEREMONY_SEQUENCE_STATUSES)[number])) return false;
  if (!Array.isArray(value.participants) || !Array.isArray(value.requiredItems)) return false;
  return true;
}

function isValidCeremonyItem(value: unknown): value is CeremonyItem {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return false;
  if (!CEREMONY_ITEM_CATEGORIES.includes(value.category as (typeof CEREMONY_ITEM_CATEGORIES)[number])) return false;
  if (!CEREMONY_ITEM_APPLICABILITY.includes(value.applicability as (typeof CEREMONY_ITEM_APPLICABILITY)[number])) return false;
  if (!CEREMONY_ITEM_STATUSES.includes(value.status as (typeof CEREMONY_ITEM_STATUSES)[number])) return false;
  if (!CEREMONY_ITEM_VERIFICATION_STATUSES.includes(value.verificationStatus as (typeof CEREMONY_ITEM_VERIFICATION_STATUSES)[number])) return false;
  return true;
}

function isValidCateringPlan(value: unknown): value is CateringPlan {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string') return false;
  if (!EVENTS.includes(value.event as (typeof EVENTS)[number])) return false;
  if (!CATERING_SERVICE_STYLES.includes(value.serviceStyle as (typeof CATERING_SERVICE_STYLES)[number])) return false;
  if (typeof value.coupleMealReserved !== 'boolean') return false;
  return true;
}

function isValidMenuItem(value: unknown): value is MenuItem {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.cateringPlanId !== 'string' || typeof value.name !== 'string') return false;
  if (!MENU_COURSES.includes(value.course as (typeof MENU_COURSES)[number])) return false;
  if (!MENU_DIETARY_TYPES.includes(value.dietaryType as (typeof MENU_DIETARY_TYPES)[number])) return false;
  return true;
}

function isValidDecorPlan(value: unknown): value is DecorPlan {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string') return false;
  if (!DECOR_AREAS.includes(value.area as (typeof DECOR_AREAS)[number])) return false;
  if (!DECOR_APPROVAL_STATUSES.includes(value.approvalStatus as (typeof DECOR_APPROVAL_STATUSES)[number])) return false;
  if (typeof value.finalWalkthroughComplete !== 'boolean') return false;
  return true;
}

function isValidDecorDeliverable(value: unknown): value is DecorDeliverable {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.decorPlanId !== 'string' || typeof value.name !== 'string') return false;
  if (!DECOR_DELIVERABLE_STATUSES.includes(value.status as (typeof DECOR_DELIVERABLE_STATUSES)[number])) return false;
  return true;
}

function isValidAttireProfile(value: unknown): value is AttireProfile {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.personRole !== 'string') return false;
  if (!ATTIRE_OUTFIT_TYPES.includes(value.outfitType as (typeof ATTIRE_OUTFIT_TYPES)[number])) return false;
  if (!ATTIRE_STATUSES.includes(value.status as (typeof ATTIRE_STATUSES)[number])) return false;
  return true;
}

function isValidAttireItem(value: unknown): value is AttireItem {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.attireProfileId !== 'string' || typeof value.itemName !== 'string') return false;
  if (!ATTIRE_ITEM_CATEGORIES.includes(value.category as (typeof ATTIRE_ITEM_CATEGORIES)[number])) return false;
  if (!ATTIRE_ITEM_STATUSES.includes(value.status as (typeof ATTIRE_ITEM_STATUSES)[number])) return false;
  return true;
}

function isValidGroomingAppointment(value: unknown): value is GroomingAppointment {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.personRole !== 'string') return false;
  if (!GROOMING_TYPES.includes(value.type as (typeof GROOMING_TYPES)[number])) return false;
  if (!GROOMING_STATUSES.includes(value.status as (typeof GROOMING_STATUSES)[number])) return false;
  return true;
}

function isValidPhotographyPlan(value: unknown): value is PhotographyPlan {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string') return false;
  if (!EVENTS.includes(value.event as (typeof EVENTS)[number])) return false;
  if (typeof value.churchRestrictionsConfirmed !== 'boolean') return false;
  return true;
}

function isValidPhotoGroup(value: unknown): value is PhotoGroup {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.groupName !== 'string') return false;
  if (!PHOTO_GROUP_PRIORITIES.includes(value.priority as (typeof PHOTO_GROUP_PRIORITIES)[number])) return false;
  if (!Array.isArray(value.participants)) return false;
  return true;
}

function isValidMusicCue(value: unknown): value is MusicCue {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.title !== 'string') return false;
  if (!MUSIC_CUE_TYPES.includes(value.cueType as (typeof MUSIC_CUE_TYPES)[number])) return false;
  if (typeof value.approved !== 'boolean') return false;
  return true;
}

function isValidMusicAVPlan(value: unknown): value is MusicAVPlan {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string') return false;
  if (!EVENTS.includes(value.event as (typeof EVENTS)[number])) return false;
  if (typeof value.podiumRequired !== 'boolean' || typeof value.offlinePlaylistReady !== 'boolean') return false;
  return true;
}

function isValidGiftPlan(value: unknown): value is GiftPlan {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.giftType !== 'string' || typeof value.quantity !== 'number') return false;
  if (!GIFT_RECIPIENT_TYPES.includes(value.recipientType as (typeof GIFT_RECIPIENT_TYPES)[number])) return false;
  if (!GIFT_STATUSES.includes(value.status as (typeof GIFT_STATUSES)[number])) return false;
  return true;
}

function isValidWelcomeKit(value: unknown): value is WelcomeKit {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return false;
  if (typeof value.quantityPlanned !== 'number' || typeof value.quantityPrepared !== 'number') return false;
  if (!WELCOME_KIT_STATUSES.includes(value.status as (typeof WELCOME_KIT_STATUSES)[number])) return false;
  return true;
}

function isValidWelcomeKitItem(value: unknown): value is WelcomeKitItem {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.welcomeKitId !== 'string' || typeof value.itemName !== 'string') return false;
  if (typeof value.quantityPerKit !== 'number') return false;
  return true;
}

function isValidRunSheetItem(value: unknown): value is RunSheetItem {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.activity !== 'string' || typeof value.date !== 'string') return false;
  if (!EVENTS.includes(value.event as (typeof EVENTS)[number])) return false;
  if (!RUN_SHEET_RELATIVE_REFERENCES.includes(value.relativeReference as (typeof RUN_SHEET_RELATIVE_REFERENCES)[number])) return false;
  if (!RUN_SHEET_CATEGORIES.includes(value.category as (typeof RUN_SHEET_CATEGORIES)[number])) return false;
  if (!RUN_SHEET_STATUSES.includes(value.status as (typeof RUN_SHEET_STATUSES)[number])) return false;
  if (!Array.isArray(value.participantIds) || !Array.isArray(value.vendorIds) || !Array.isArray(value.requiredItemIds)) return false;
  if (!Array.isArray(value.relatedTaskIds) || !Array.isArray(value.relatedTransportRouteIds) || !Array.isArray(value.dependencyIds)) return false;
  return true;
}

function isValidLiveIssue(value: unknown): value is LiveIssue {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.title !== 'string' || typeof value.reportedAt !== 'string') return false;
  if (!LIVE_ISSUE_CATEGORIES.includes(value.category as (typeof LIVE_ISSUE_CATEGORIES)[number])) return false;
  if (!LIVE_ISSUE_SEVERITIES.includes(value.severity as (typeof LIVE_ISSUE_SEVERITIES)[number])) return false;
  if (!LIVE_ISSUE_STATUSES.includes(value.status as (typeof LIVE_ISSUE_STATUSES)[number])) return false;
  if (typeof value.followUpRequired !== 'boolean') return false;
  return true;
}

function isValidDutyAssignment(value: unknown): value is DutyAssignment {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.personName !== 'string') return false;
  if (!DUTY_ROLES.includes(value.role as (typeof DUTY_ROLES)[number])) return false;
  if (!DUTY_STATUSES.includes(value.status as (typeof DUTY_STATUSES)[number])) return false;
  return true;
}

function isValidVendorDayStatus(value: unknown): value is VendorDayStatus {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.vendorId !== 'string') return false;
  if (!VENDOR_DAY_STATUSES.includes(value.status as (typeof VENDOR_DAY_STATUSES)[number])) return false;
  if (typeof value.primaryContactConfirmed !== 'boolean' || typeof value.setupComplete !== 'boolean') return false;
  if (typeof value.serviceReady !== 'boolean' || typeof value.finalSettlementChecked !== 'boolean') return false;
  return true;
}

function isValidCeremonyItemMovement(value: unknown): value is CeremonyItemMovement {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.ceremonyItemId !== 'string' || typeof value.timestamp !== 'string') return false;
  if (!CEREMONY_ITEM_MOVEMENT_ACTIONS.includes(value.action as (typeof CEREMONY_ITEM_MOVEMENT_ACTIONS)[number])) return false;
  return true;
}

function isValidEmergencyContact(value: unknown): value is EmergencyContact {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.phone !== 'string') return false;
  if (!EMERGENCY_CONTACT_CATEGORIES.includes(value.category as (typeof EMERGENCY_CONTACT_CATEGORIES)[number])) return false;
  if (!EMERGENCY_CONTACT_PRIORITIES.includes(value.priority as (typeof EMERGENCY_CONTACT_PRIORITIES)[number])) return false;
  return true;
}

function isValidEmergencyResponseCard(value: unknown): value is EmergencyResponseCard {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.title !== 'string') return false;
  if (!EMERGENCY_RESPONSE_CARD_TYPES.includes(value.type as (typeof EMERGENCY_RESPONSE_CARD_TYPES)[number])) return false;
  if (!Array.isArray(value.immediateActions)) return false;
  return true;
}

function isValidCloseoutItem(value: unknown): value is CloseoutItem {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.title !== 'string') return false;
  if (!CLOSEOUT_CATEGORIES.includes(value.category as (typeof CLOSEOUT_CATEGORIES)[number])) return false;
  if (!CLOSEOUT_STATUSES.includes(value.status as (typeof CLOSEOUT_STATUSES)[number])) return false;
  return true;
}

function isValidFinalReadinessReview(value: unknown): value is FinalReadinessReview {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.reviewedAt !== 'string' || typeof value.reviewedBy !== 'string') return false;
  if (!Array.isArray(value.readinessSnapshot) || !Array.isArray(value.unresolvedExceptions)) return false;
  return true;
}

function isValidGuestOperationalStatus(value: unknown): value is GuestOperationalStatus {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.guestId !== 'string' || typeof value.lastUpdatedAt !== 'string') return false;
  if (!GUEST_OPERATIONAL_STATES.includes(value.state as (typeof GUEST_OPERATIONAL_STATES)[number])) return false;
  if (typeof value.isVip !== 'boolean') return false;
  return true;
}

function isValidManifestFreezeState(value: unknown): value is ManifestFreezeState {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.frozen !== 'boolean') return false;
  if (!MANIFEST_TYPES.includes(value.manifestType as (typeof MANIFEST_TYPES)[number])) return false;
  return true;
}

/**
 * Accepts version 1 (Phase 1: settings/tasks/decisions/owners only),
 * version 2 (Phase 2: adds households/guests), version 3 (Phase 3: adds
 * travel/accommodation/transport logistics), version 4 (Phase 4: adds
 * vendors/quotes/contracts/budget/payments/refunds), and version 5
 * (Phase 5: adds church/ceremony/catering/décor/attire/photography/music/
 * gifts wedding-preparation records), and version 6 (Phase 6: adds the
 * wedding-day command center — run sheet, live issues, duty roster, vendor
 * day-of status, ceremony item movements, emergency contacts/response
 * cards, closeout checklist, final readiness reviews, guest operational
 * statuses, manifest freeze states). Collections introduced after a
 * file's version are optional in that file and are initialized to empty
 * arrays on import (see normalizeBackup).
 */
export function validateBackup(data: unknown): BackupValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(data)) {
    return { valid: false, errors: ['File does not contain a valid WeddingOS backup object.'] };
  }

  const version = typeof data.version === 'number' ? data.version : null;
  if (version === null) {
    errors.push('Missing or invalid "version" field.');
  }
  if (!isValidSettings(data.settings)) {
    errors.push('Settings section is missing or malformed.');
  }
  if (!Array.isArray(data.tasks) || !data.tasks.every(isValidTask)) {
    errors.push('Tasks section is missing or contains malformed task entries.');
  }
  if (!Array.isArray(data.decisions) || !data.decisions.every(isValidDecision)) {
    errors.push('Decisions section is missing or contains malformed decision entries.');
  }
  if (!Array.isArray(data.owners) || !data.owners.every(isValidOwner)) {
    errors.push('Owners section is missing or contains malformed owner entries.');
  }

  const isV2OrLater = version !== null && version >= 2;
  const householdsProvided = data.households !== undefined;
  const guestsProvided = data.guests !== undefined;

  if (isV2OrLater || householdsProvided) {
    if (!Array.isArray(data.households) || !data.households.every(isValidHousehold)) {
      errors.push('Households section is missing or contains malformed household entries.');
    }
  }
  if (isV2OrLater || guestsProvided) {
    if (!Array.isArray(data.guests) || !data.guests.every(isValidGuest)) {
      errors.push('Guests section is missing or contains malformed guest entries.');
    }
  }

  const isV3OrLater = version !== null && version >= 3;
  const logisticsFields: Array<[key: string, validator: (v: unknown) => boolean, label: string]> = [
    ['travelSegments', (v) => Array.isArray(v) && v.every(isValidTravelSegment), 'Travel segments'],
    ['hotels', (v) => Array.isArray(v) && v.every(isValidHotel), 'Hotels'],
    ['roomTypes', (v) => Array.isArray(v) && v.every(isValidRoomType), 'Room types'],
    ['rooms', (v) => Array.isArray(v) && v.every(isValidRoom), 'Rooms'],
    ['roomAssignments', (v) => Array.isArray(v) && v.every(isValidRoomAssignment), 'Room assignments'],
    ['vehicles', (v) => Array.isArray(v) && v.every(isValidVehicle), 'Vehicles'],
    ['drivers', (v) => Array.isArray(v) && v.every(isValidDriver), 'Drivers'],
    ['transportRoutes', (v) => Array.isArray(v) && v.every(isValidTransportRoute), 'Transport routes'],
    ['transportAssignments', (v) => Array.isArray(v) && v.every(isValidTransportAssignment), 'Transport assignments'],
  ];
  for (const [key, validator, label] of logisticsFields) {
    if ((isV3OrLater || data[key] !== undefined) && !validator(data[key])) {
      errors.push(`${label} section is missing or contains malformed entries.`);
    }
  }

  const isV4OrLater = version !== null && version >= 4;
  const financeFields: Array<[key: string, validator: (v: unknown) => boolean, label: string]> = [
    ['vendors', (v) => Array.isArray(v) && v.every(isValidVendor), 'Vendors'],
    ['vendorContacts', (v) => Array.isArray(v) && v.every(isValidVendorContact), 'Vendor contacts'],
    ['vendorQuotes', (v) => Array.isArray(v) && v.every(isValidVendorQuote), 'Vendor quotes'],
    ['contracts', (v) => Array.isArray(v) && v.every(isValidContract), 'Contracts'],
    ['budgetCategories', (v) => Array.isArray(v) && v.every(isValidBudgetCategory), 'Budget categories'],
    ['budgetItems', (v) => Array.isArray(v) && v.every(isValidBudgetItem), 'Budget items'],
    ['paymentSchedules', (v) => Array.isArray(v) && v.every(isValidPaymentSchedule), 'Payment schedules'],
    ['payments', (v) => Array.isArray(v) && v.every(isValidPayment), 'Payments'],
    ['refunds', (v) => Array.isArray(v) && v.every(isValidRefund), 'Refunds'],
  ];
  for (const [key, validator, label] of financeFields) {
    if ((isV4OrLater || data[key] !== undefined) && !validator(data[key])) {
      errors.push(`${label} section is missing or contains malformed entries.`);
    }
  }

  const isV5OrLater = version !== null && version >= 5;
  const weddingPrepFields: Array<[key: string, validator: (v: unknown) => boolean, label: string]> = [
    ['churchProfiles', (v) => Array.isArray(v) && v.every(isValidChurchProfile), 'Church profiles'],
    ['churchRequirements', (v) => Array.isArray(v) && v.every(isValidChurchRequirement), 'Church requirements'],
    ['ceremonyParticipants', (v) => Array.isArray(v) && v.every(isValidCeremonyParticipant), 'Ceremony participants'],
    ['ceremonySequenceItems', (v) => Array.isArray(v) && v.every(isValidCeremonySequenceItem), 'Ceremony sequence items'],
    ['ceremonyItems', (v) => Array.isArray(v) && v.every(isValidCeremonyItem), 'Ceremony items'],
    ['cateringPlans', (v) => Array.isArray(v) && v.every(isValidCateringPlan), 'Catering plans'],
    ['menuItems', (v) => Array.isArray(v) && v.every(isValidMenuItem), 'Menu items'],
    ['decorPlans', (v) => Array.isArray(v) && v.every(isValidDecorPlan), 'Décor plans'],
    ['decorDeliverables', (v) => Array.isArray(v) && v.every(isValidDecorDeliverable), 'Décor deliverables'],
    ['attireProfiles', (v) => Array.isArray(v) && v.every(isValidAttireProfile), 'Attire profiles'],
    ['attireItems', (v) => Array.isArray(v) && v.every(isValidAttireItem), 'Attire items'],
    ['groomingAppointments', (v) => Array.isArray(v) && v.every(isValidGroomingAppointment), 'Grooming appointments'],
    ['photographyPlans', (v) => Array.isArray(v) && v.every(isValidPhotographyPlan), 'Photography plans'],
    ['photoGroups', (v) => Array.isArray(v) && v.every(isValidPhotoGroup), 'Photo groups'],
    ['musicCues', (v) => Array.isArray(v) && v.every(isValidMusicCue), 'Music cues'],
    ['musicAVPlans', (v) => Array.isArray(v) && v.every(isValidMusicAVPlan), 'Music/AV plans'],
    ['giftPlans', (v) => Array.isArray(v) && v.every(isValidGiftPlan), 'Gift plans'],
    ['welcomeKits', (v) => Array.isArray(v) && v.every(isValidWelcomeKit), 'Welcome kits'],
    ['welcomeKitItems', (v) => Array.isArray(v) && v.every(isValidWelcomeKitItem), 'Welcome kit items'],
  ];
  for (const [key, validator, label] of weddingPrepFields) {
    if ((isV5OrLater || data[key] !== undefined) && !validator(data[key])) {
      errors.push(`${label} section is missing or contains malformed entries.`);
    }
  }

  const isV6OrLater = version !== null && version >= 6;
  const weddingDayFields: Array<[key: string, validator: (v: unknown) => boolean, label: string]> = [
    ['runSheetItems', (v) => Array.isArray(v) && v.every(isValidRunSheetItem), 'Run sheet items'],
    ['liveIssues', (v) => Array.isArray(v) && v.every(isValidLiveIssue), 'Live issues'],
    ['dutyAssignments', (v) => Array.isArray(v) && v.every(isValidDutyAssignment), 'Duty assignments'],
    ['vendorDayStatuses', (v) => Array.isArray(v) && v.every(isValidVendorDayStatus), 'Vendor day statuses'],
    ['ceremonyItemMovements', (v) => Array.isArray(v) && v.every(isValidCeremonyItemMovement), 'Ceremony item movements'],
    ['emergencyContacts', (v) => Array.isArray(v) && v.every(isValidEmergencyContact), 'Emergency contacts'],
    ['emergencyResponseCards', (v) => Array.isArray(v) && v.every(isValidEmergencyResponseCard), 'Emergency response cards'],
    ['closeoutItems', (v) => Array.isArray(v) && v.every(isValidCloseoutItem), 'Closeout items'],
    ['finalReadinessReviews', (v) => Array.isArray(v) && v.every(isValidFinalReadinessReview), 'Final readiness reviews'],
    ['guestOperationalStatuses', (v) => Array.isArray(v) && v.every(isValidGuestOperationalStatus), 'Guest operational statuses'],
    ['manifestFreezeStates', (v) => Array.isArray(v) && v.every(isValidManifestFreezeState), 'Manifest freeze states'],
  ];
  for (const [key, validator, label] of weddingDayFields) {
    if ((isV6OrLater || data[key] !== undefined) && !validator(data[key])) {
      errors.push(`${label} section is missing or contains malformed entries.`);
    }
  }

  // v7's workspace/documents/redactedSections are always optional — present
  // only for a backup exported from an active Supabase workspace — so they
  // are checked structurally only when provided, never required by version.
  if (data.workspace !== undefined) {
    const ws = data.workspace;
    if (!isPlainObject(ws) || typeof ws.name !== 'string' || typeof ws.groomName !== 'string' || typeof ws.brideName !== 'string') {
      errors.push('Workspace metadata section is malformed.');
    }
  }
  if (data.documents !== undefined && !Array.isArray(data.documents)) {
    errors.push('Documents section is malformed.');
  }

  return { valid: errors.length === 0, errors };
}

/** Backfills settings sub-objects introduced in later versions (finance in v4, weddingPrep in v5, weddingDay in v6) for older backups. */
function normalizeSettings(rawSettings: unknown): AppSettings {
  const settings = rawSettings as AppSettings;
  return {
    ...settings,
    finance: settings.finance ?? {
      currency: DEFAULT_CURRENCY,
      largeCashWarningThreshold: DEFAULT_LARGE_CASH_WARNING_THRESHOLD,
      budgetVarianceWarningPercent: DEFAULT_BUDGET_VARIANCE_WARNING_PERCENT,
      criticalVendorCategories: [...DEFAULT_CRITICAL_VENDOR_CATEGORIES],
    },
    weddingPrep: settings.weddingPrep ?? {
      sectionWeights: { ...DEFAULT_WEDDING_PREP_SECTION_WEIGHTS },
    },
    weddingDay: settings.weddingDay ?? { ...DEFAULT_WEDDING_DAY_SETTINGS },
  };
}

/**
 * Normalizes a validated backup (of any supported version) into the current
 * in-memory shape. Version-1 files get empty households/guests arrays —
 * this is the Phase 1 -> Phase 2 migration step.
 */
export function normalizeBackup(data: unknown): WeddingOSBackup {
  const raw = data as Record<string, unknown>;
  return {
    version: typeof raw.version === 'number' ? raw.version : BACKUP_VERSION,
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : new Date().toISOString(),
    workspace: raw.workspace as WeddingOSBackup['workspace'],
    documents: Array.isArray(raw.documents) ? (raw.documents as WeddingOSBackup['documents']) : undefined,
    redactedSections: Array.isArray(raw.redactedSections) ? (raw.redactedSections as string[]) : undefined,
    settings: normalizeSettings(raw.settings),
    tasks: raw.tasks as Task[],
    decisions: raw.decisions as Decision[],
    owners: raw.owners as Owner[],
    households: Array.isArray(raw.households) ? (raw.households as Household[]) : [],
    guests: Array.isArray(raw.guests) ? (raw.guests as Guest[]) : [],
    travelSegments: Array.isArray(raw.travelSegments) ? (raw.travelSegments as TravelSegment[]) : [],
    hotels: Array.isArray(raw.hotels) ? (raw.hotels as Hotel[]) : [],
    roomTypes: Array.isArray(raw.roomTypes) ? (raw.roomTypes as RoomType[]) : [],
    rooms: Array.isArray(raw.rooms) ? (raw.rooms as Room[]) : [],
    roomAssignments: Array.isArray(raw.roomAssignments) ? (raw.roomAssignments as RoomAssignment[]) : [],
    vehicles: Array.isArray(raw.vehicles) ? (raw.vehicles as Vehicle[]) : [],
    drivers: Array.isArray(raw.drivers) ? (raw.drivers as Driver[]) : [],
    transportRoutes: Array.isArray(raw.transportRoutes) ? (raw.transportRoutes as TransportRoute[]) : [],
    transportAssignments: Array.isArray(raw.transportAssignments) ? (raw.transportAssignments as TransportAssignment[]) : [],
    vendors: Array.isArray(raw.vendors) ? (raw.vendors as Vendor[]) : [],
    vendorContacts: Array.isArray(raw.vendorContacts) ? (raw.vendorContacts as VendorContact[]) : [],
    vendorQuotes: Array.isArray(raw.vendorQuotes) ? (raw.vendorQuotes as VendorQuote[]) : [],
    contracts: Array.isArray(raw.contracts) ? (raw.contracts as Contract[]) : [],
    budgetCategories: Array.isArray(raw.budgetCategories) ? (raw.budgetCategories as BudgetCategory[]) : [],
    budgetItems: Array.isArray(raw.budgetItems) ? (raw.budgetItems as BudgetItem[]) : [],
    paymentSchedules: Array.isArray(raw.paymentSchedules) ? (raw.paymentSchedules as PaymentSchedule[]) : [],
    payments: Array.isArray(raw.payments) ? (raw.payments as Payment[]) : [],
    refunds: Array.isArray(raw.refunds) ? (raw.refunds as Refund[]) : [],
    churchProfiles: Array.isArray(raw.churchProfiles) ? (raw.churchProfiles as ChurchProfile[]) : [],
    churchRequirements: Array.isArray(raw.churchRequirements) ? (raw.churchRequirements as ChurchRequirement[]) : [],
    ceremonyParticipants: Array.isArray(raw.ceremonyParticipants) ? (raw.ceremonyParticipants as CeremonyParticipant[]) : [],
    ceremonySequenceItems: Array.isArray(raw.ceremonySequenceItems) ? (raw.ceremonySequenceItems as CeremonySequenceItem[]) : [],
    ceremonyItems: Array.isArray(raw.ceremonyItems) ? (raw.ceremonyItems as CeremonyItem[]) : [],
    cateringPlans: Array.isArray(raw.cateringPlans) ? (raw.cateringPlans as CateringPlan[]) : [],
    menuItems: Array.isArray(raw.menuItems) ? (raw.menuItems as MenuItem[]) : [],
    decorPlans: Array.isArray(raw.decorPlans) ? (raw.decorPlans as DecorPlan[]) : [],
    decorDeliverables: Array.isArray(raw.decorDeliverables) ? (raw.decorDeliverables as DecorDeliverable[]) : [],
    attireProfiles: Array.isArray(raw.attireProfiles) ? (raw.attireProfiles as AttireProfile[]) : [],
    attireItems: Array.isArray(raw.attireItems) ? (raw.attireItems as AttireItem[]) : [],
    groomingAppointments: Array.isArray(raw.groomingAppointments) ? (raw.groomingAppointments as GroomingAppointment[]) : [],
    photographyPlans: Array.isArray(raw.photographyPlans) ? (raw.photographyPlans as PhotographyPlan[]) : [],
    photoGroups: Array.isArray(raw.photoGroups) ? (raw.photoGroups as PhotoGroup[]) : [],
    musicCues: Array.isArray(raw.musicCues) ? (raw.musicCues as MusicCue[]) : [],
    musicAVPlans: Array.isArray(raw.musicAVPlans) ? (raw.musicAVPlans as MusicAVPlan[]) : [],
    giftPlans: Array.isArray(raw.giftPlans) ? (raw.giftPlans as GiftPlan[]) : [],
    welcomeKits: Array.isArray(raw.welcomeKits) ? (raw.welcomeKits as WelcomeKit[]) : [],
    welcomeKitItems: Array.isArray(raw.welcomeKitItems) ? (raw.welcomeKitItems as WelcomeKitItem[]) : [],
    runSheetItems: Array.isArray(raw.runSheetItems) ? (raw.runSheetItems as RunSheetItem[]) : [],
    liveIssues: Array.isArray(raw.liveIssues) ? (raw.liveIssues as LiveIssue[]) : [],
    dutyAssignments: Array.isArray(raw.dutyAssignments) ? (raw.dutyAssignments as DutyAssignment[]) : [],
    vendorDayStatuses: Array.isArray(raw.vendorDayStatuses) ? (raw.vendorDayStatuses as VendorDayStatus[]) : [],
    ceremonyItemMovements: Array.isArray(raw.ceremonyItemMovements) ? (raw.ceremonyItemMovements as CeremonyItemMovement[]) : [],
    emergencyContacts: Array.isArray(raw.emergencyContacts) ? (raw.emergencyContacts as EmergencyContact[]) : [],
    emergencyResponseCards: Array.isArray(raw.emergencyResponseCards) ? (raw.emergencyResponseCards as EmergencyResponseCard[]) : [],
    closeoutItems: Array.isArray(raw.closeoutItems) ? (raw.closeoutItems as CloseoutItem[]) : [],
    finalReadinessReviews: Array.isArray(raw.finalReadinessReviews) ? (raw.finalReadinessReviews as FinalReadinessReview[]) : [],
    guestOperationalStatuses: Array.isArray(raw.guestOperationalStatuses) ? (raw.guestOperationalStatuses as GuestOperationalStatus[]) : [],
    manifestFreezeStates: Array.isArray(raw.manifestFreezeStates) ? (raw.manifestFreezeStates as ManifestFreezeState[]) : [],
  };
}

/** Replaces all WeddingOS data with the given backup. Caller must validate (and normalize) first and confirm with the user. */
export function importBackup(backup: WeddingOSBackup): void {
  settingsStore.set(backup.settings);
  tasksStore.set(backup.tasks);
  decisionsStore.set(backup.decisions);
  ownersStore.set(backup.owners);
  householdsStore.set(backup.households ?? []);
  guestsStore.set(backup.guests ?? []);
  travelSegmentsStore.set(backup.travelSegments ?? []);
  hotelsStore.set(backup.hotels ?? []);
  roomTypesStore.set(backup.roomTypes ?? []);
  roomsStore.set(backup.rooms ?? []);
  roomAssignmentsStore.set(backup.roomAssignments ?? []);
  vehiclesStore.set(backup.vehicles ?? []);
  driversStore.set(backup.drivers ?? []);
  transportRoutesStore.set(backup.transportRoutes ?? []);
  transportAssignmentsStore.set(backup.transportAssignments ?? []);
  vendorsStore.set(backup.vendors ?? []);
  vendorContactsStore.set(backup.vendorContacts ?? []);
  vendorQuotesStore.set(backup.vendorQuotes ?? []);
  contractsStore.set(backup.contracts ?? []);
  budgetCategoriesStore.set(backup.budgetCategories ?? []);
  budgetItemsStore.set(backup.budgetItems ?? []);
  paymentSchedulesStore.set(backup.paymentSchedules ?? []);
  paymentsStore.set(backup.payments ?? []);
  refundsStore.set(backup.refunds ?? []);
  churchProfilesStore.set(backup.churchProfiles ?? []);
  churchRequirementsStore.set(backup.churchRequirements ?? []);
  ceremonyParticipantsStore.set(backup.ceremonyParticipants ?? []);
  ceremonySequenceItemsStore.set(backup.ceremonySequenceItems ?? []);
  ceremonyItemsStore.set(backup.ceremonyItems ?? []);
  cateringPlansStore.set(backup.cateringPlans ?? []);
  menuItemsStore.set(backup.menuItems ?? []);
  decorPlansStore.set(backup.decorPlans ?? []);
  decorDeliverablesStore.set(backup.decorDeliverables ?? []);
  attireProfilesStore.set(backup.attireProfiles ?? []);
  attireItemsStore.set(backup.attireItems ?? []);
  groomingAppointmentsStore.set(backup.groomingAppointments ?? []);
  photographyPlansStore.set(backup.photographyPlans ?? []);
  photoGroupsStore.set(backup.photoGroups ?? []);
  musicCuesStore.set(backup.musicCues ?? []);
  musicAVPlansStore.set(backup.musicAVPlans ?? []);
  giftPlansStore.set(backup.giftPlans ?? []);
  welcomeKitsStore.set(backup.welcomeKits ?? []);
  welcomeKitItemsStore.set(backup.welcomeKitItems ?? []);
  runSheetItemsStore.set(backup.runSheetItems ?? []);
  liveIssuesStore.set(backup.liveIssues ?? []);
  dutyAssignmentsStore.set(backup.dutyAssignments ?? []);
  vendorDayStatusesStore.set(backup.vendorDayStatuses ?? []);
  ceremonyItemMovementsStore.set(backup.ceremonyItemMovements ?? []);
  emergencyContactsStore.set(backup.emergencyContacts ?? []);
  emergencyResponseCardsStore.set(backup.emergencyResponseCards ?? []);
  closeoutItemsStore.set(backup.closeoutItems ?? []);
  finalReadinessReviewsStore.set(backup.finalReadinessReviews ?? []);
  guestOperationalStatusesStore.set(backup.guestOperationalStatuses ?? []);
  manifestFreezeStatesStore.set(backup.manifestFreezeStates ?? []);
}

function csvEscape(value: string | number | undefined | null): string {
  const str = value === undefined || value === null ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function tasksToCSV(tasks: Task[]): string {
  const headers = [
    'Title',
    'Event',
    'Workstream',
    'Owner',
    'Approver',
    'Priority',
    'Status',
    'Start Date',
    'Due Date',
    'Completion Criteria',
    'Tags',
  ];
  const rows = tasks.map((task) =>
    [
      task.title,
      task.event,
      task.workstream,
      task.owner,
      task.approver ?? '',
      task.priority,
      task.status,
      task.startDate ?? '',
      task.dueDate ?? '',
      task.completionCriteria,
      task.tags.join('; '),
    ]
      .map(csvEscape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function householdsToCSV(households: Household[], guests: Guest[]): string {
  const headers = [
    'Household Name',
    'Primary Contact',
    'Phone',
    'Email',
    'Side',
    'Relationship',
    'City',
    'Invitation Priority',
    'Invitation Method',
    'Invitation Status',
    'Member Count',
  ];
  const rows = households.map((household) => {
    const memberCount = guests.filter((g) => g.householdId === household.id).length;
    return [
      household.householdName,
      household.primaryContactName,
      household.primaryPhone,
      household.email ?? '',
      household.side,
      household.relationshipCategory,
      household.city,
      household.invitationPriority,
      household.invitationMethod.join('; '),
      household.invitationStatus,
      memberCount,
    ]
      .map(csvEscape)
      .join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

function guestRsvpForEvent(guest: Guest, event: GuestEvent) {
  return guest.rsvpResponses.find((r) => r.event === event);
}

export function guestsToCSV(guests: Guest[], households: Household[]): string {
  const householdById = new Map(households.map((h) => [h.id, h]));
  const headers = [
    'Guest Name',
    'Household',
    'Side',
    'Age Category',
    'Wedding Invited',
    'Wedding RSVP',
    'Engagement Invited',
    'Engagement RSVP',
    'Dietary Preference',
    'Accommodation Required',
    'Pickup Required',
    'Accessibility Requirement',
  ];
  const rows = guests.map((guest) => {
    const household = householdById.get(guest.householdId);
    const weddingInvited = guest.invitedEvents.includes('Wedding');
    const engagementInvited = guest.invitedEvents.includes('Engagement');
    return [
      guest.fullName,
      household?.householdName ?? '',
      household?.side ?? '',
      guest.ageCategory,
      weddingInvited ? 'Yes' : 'No',
      weddingInvited ? (guestRsvpForEvent(guest, 'Wedding')?.status ?? 'No Response') : '',
      engagementInvited ? 'Yes' : 'No',
      engagementInvited ? (guestRsvpForEvent(guest, 'Engagement')?.status ?? 'No Response') : '',
      guest.dietaryPreference,
      guest.accommodationRequired ? 'Yes' : 'No',
      guest.pickupRequired ? 'Yes' : 'No',
      guest.accessibilityRequirements ?? '',
    ]
      .map(csvEscape)
      .join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

/** One row per guest per invited event. */
export function rsvpReportToCSV(guests: Guest[], households: Household[]): string {
  const householdById = new Map(households.map((h) => [h.id, h]));
  const headers = [
    'Guest Name',
    'Household',
    'Side',
    'Event',
    'RSVP Status',
    'Response Method',
    'Responded At',
    'Dietary Preference',
    'Accommodation Requested',
    'Pickup Requested',
  ];
  const rows: string[] = [];
  for (const guest of guests) {
    const household = householdById.get(guest.householdId);
    for (const event of guest.invitedEvents) {
      const response = guestRsvpForEvent(guest, event);
      rows.push(
        [
          guest.fullName,
          household?.householdName ?? '',
          household?.side ?? '',
          event,
          response?.status ?? 'No Response',
          response?.responseMethod ?? '',
          response?.respondedAt ?? '',
          guest.dietaryPreference,
          response?.accommodationRequested ? 'Yes' : 'No',
          response?.pickupRequested ? 'Yes' : 'No',
        ]
          .map(csvEscape)
          .join(','),
      );
    }
  }
  return [headers.join(','), ...rows].join('\n');
}

export function travelToCSV(segments: TravelSegment[], guests: Guest[], households: Household[]): string {
  const guestById = new Map(guests.map((g) => [g.id, g]));
  const householdById = new Map(households.map((h) => [h.id, h]));
  const headers = [
    'Guest Name', 'Household', 'Event', 'Direction', 'Mode', 'Origin', 'Destination',
    'Carrier', 'Service Number', 'Booking Reference', 'Booking Status', 'Ticket Confirmed',
    'Date', 'Time', 'Pickup Required', 'Drop Required', 'Notes',
  ];
  const rows = segments.map((segment) => {
    const guest = guestById.get(segment.guestId);
    const household = guest ? householdById.get(guest.householdId) : undefined;
    return [
      guest?.fullName ?? '',
      household?.householdName ?? '',
      segment.event,
      segment.direction,
      segment.travelMode,
      segment.origin,
      segment.destination,
      segment.carrier ?? '',
      segment.serviceNumber ?? '',
      segment.bookingReference ?? '',
      segment.bookingStatus,
      segment.ticketConfirmed ? 'Yes' : 'No',
      segment.direction === 'Arrival' ? (segment.arrivalDate ?? '') : (segment.departureDate ?? ''),
      segment.direction === 'Arrival' ? (segment.arrivalTime ?? '') : (segment.departureTime ?? ''),
      segment.pickupRequired ? 'Yes' : 'No',
      segment.dropRequired ? 'Yes' : 'No',
      segment.notes ?? '',
    ]
      .map(csvEscape)
      .join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

export function roomAssignmentsToCSV(
  assignments: RoomAssignment[],
  guests: Guest[],
  rooms: Room[],
  roomTypes: RoomType[],
  hotels: Hotel[],
): string {
  const guestById = new Map(guests.map((g) => [g.id, g]));
  const roomById = new Map(rooms.map((r) => [r.id, r]));
  const roomTypeById = new Map(roomTypes.map((rt) => [rt.id, rt]));
  const hotelById = new Map(hotels.map((h) => [h.id, h]));
  const headers = [
    'Guest Name', 'Hotel', 'Room Number', 'Room Type', 'Check-In', 'Check-Out', 'Status',
    'Accessibility Required', 'Extra Bed Required', 'Child Cot Required', 'Confirmation Number',
  ];
  const rows = assignments.map((assignment) => {
    const guest = guestById.get(assignment.guestId);
    const room = roomById.get(assignment.roomId);
    const roomType = room ? roomTypeById.get(room.roomTypeId) : undefined;
    const hotel = room ? hotelById.get(room.hotelId) : undefined;
    return [
      guest?.fullName ?? '',
      hotel?.name ?? '',
      room?.roomNumber ?? '',
      roomType?.name ?? '',
      assignment.checkInDate,
      assignment.checkOutDate,
      assignment.assignmentStatus,
      assignment.accessibilityRequired ? 'Yes' : 'No',
      assignment.extraBedRequired ? 'Yes' : 'No',
      assignment.childCotRequired ? 'Yes' : 'No',
      assignment.confirmationNumber ?? '',
    ]
      .map(csvEscape)
      .join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

function isPickupRoute(route: TransportRoute): boolean {
  return route.routeType.includes('Pickup');
}

function isDropRoute(route: TransportRoute): boolean {
  return route.routeType.includes('Drop');
}

function manifestRows(
  transportAssignments: TransportAssignment[],
  routeFilter: (route: TransportRoute) => boolean,
  guests: Guest[],
  routes: TransportRoute[],
  vehicles: Vehicle[],
  drivers: Driver[],
): string[] {
  const guestById = new Map(guests.map((g) => [g.id, g]));
  const routeById = new Map(routes.map((r) => [r.id, r]));
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
  const driverById = new Map(drivers.map((d) => [d.id, d]));

  return transportAssignments
    .map((assignment) => {
      const route = routeById.get(assignment.routeId);
      if (!route || !routeFilter(route)) return null;
      const guest = guestById.get(assignment.guestId);
      const vehicle = route.vehicleId ? vehicleById.get(route.vehicleId) : undefined;
      const driver = route.driverId ? driverById.get(route.driverId) : undefined;
      return [
        guest?.fullName ?? '',
        route.name,
        route.origin,
        route.destination,
        assignment.pickupDate ?? route.plannedDepartureDate ?? '',
        assignment.pickupTime ?? route.plannedDepartureTime ?? '',
        vehicle?.name ?? 'Unassigned',
        driver?.name ?? 'Unassigned',
        String(assignment.seatCount),
        assignment.assistanceRequired ? 'Yes' : 'No',
        assignment.assignmentStatus,
      ]
        .map(csvEscape)
        .join(',');
    })
    .filter((row): row is string => row !== null);
}

const MANIFEST_HEADERS = [
  'Guest Name', 'Route', 'Origin', 'Destination', 'Date', 'Time', 'Vehicle', 'Driver', 'Seats', 'Assistance Required', 'Status',
];

export function pickupManifestToCSV(
  transportAssignments: TransportAssignment[],
  routes: TransportRoute[],
  guests: Guest[],
  vehicles: Vehicle[],
  drivers: Driver[],
): string {
  const rows = manifestRows(transportAssignments, isPickupRoute, guests, routes, vehicles, drivers);
  return [MANIFEST_HEADERS.join(','), ...rows].join('\n');
}

export function dropManifestToCSV(
  transportAssignments: TransportAssignment[],
  routes: TransportRoute[],
  guests: Guest[],
  vehicles: Vehicle[],
  drivers: Driver[],
): string {
  const rows = manifestRows(transportAssignments, isDropRoute, guests, routes, vehicles, drivers);
  return [MANIFEST_HEADERS.join(','), ...rows].join('\n');
}

export function vehicleManifestToCSV(vehicles: Vehicle[], routes: TransportRoute[], transportAssignments: TransportAssignment[]): string {
  const headers = [
    'Vehicle', 'Type', 'Registration Number', 'Passenger Capacity', 'Vendor', 'Status', 'Backup Vehicle',
    'Route Count', 'Total Seats Assigned',
  ];
  const rows = vehicles.map((vehicle) => {
    const vehicleRoutes = routes.filter((r) => r.vehicleId === vehicle.id);
    const routeIds = new Set(vehicleRoutes.map((r) => r.id));
    const seatsAssigned = transportAssignments
      .filter((a) => routeIds.has(a.routeId))
      .reduce((sum, a) => sum + a.seatCount, 0);
    return [
      vehicle.name,
      vehicle.vehicleType,
      vehicle.registrationNumber ?? '',
      String(vehicle.passengerCapacity),
      vehicle.vendorName ?? '',
      vehicle.status,
      vehicle.backupVehicle ? 'Yes' : 'No',
      String(vehicleRoutes.length),
      String(seatsAssigned),
    ]
      .map(csvEscape)
      .join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

export function driverDirectoryToCSV(drivers: Driver[], vehicles: Vehicle[], routes: TransportRoute[]): string {
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
  const headers = ['Driver Name', 'Phone', 'Alternate Phone', 'Assigned Vehicle', 'Active Route Count', 'Notes'];
  const rows = drivers.map((driver) => {
    const vehicle = driver.vehicleId ? vehicleById.get(driver.vehicleId) : undefined;
    const activeRouteCount = routes.filter(
      (r) => r.driverId === driver.id && ['Planned', 'Confirmed', 'Dispatched', 'In Progress'].includes(r.status),
    ).length;
    return [driver.name, driver.phone, driver.alternatePhone ?? '', vehicle?.name ?? '', String(activeRouteCount), driver.notes ?? '']
      .map(csvEscape)
      .join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

export function backupFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-backup-${stamp}.json`;
}

export function travelCsvFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-travel-${stamp}.csv`;
}

export function roomAssignmentsCsvFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-room-assignments-${stamp}.csv`;
}

export function pickupManifestCsvFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-pickup-manifest-${stamp}.csv`;
}

export function dropManifestCsvFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-drop-manifest-${stamp}.csv`;
}

export function vehicleManifestCsvFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-vehicle-manifest-${stamp}.csv`;
}

export function driverDirectoryCsvFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-driver-directory-${stamp}.csv`;
}

export function tasksCsvFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-tasks-${stamp}.csv`;
}

export function householdsCsvFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-households-${stamp}.csv`;
}

export function guestsCsvFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-guests-${stamp}.csv`;
}

export function rsvpReportCsvFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `weddingos-rsvp-report-${stamp}.csv`;
}
