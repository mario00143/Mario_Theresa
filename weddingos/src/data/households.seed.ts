/**
 * Fictional demo data only. Names, phone numbers, and emails below are
 * invented for seeding WeddingOS Phase 2 and do not refer to real people.
 * No government IDs, financial details, or other sensitive data are used.
 */
import type {
  AgeCategory,
  DietaryPreference,
  Guest,
  GuestEvent,
  Household,
  HouseholdSide,
  InvitationMethod,
  InvitationPriority,
  InvitationStatus,
  PlusOneStatus,
  RelationshipCategory,
  RsvpResponse,
  RsvpStatus,
} from '@/types';
import { generateSeedId } from '@/lib/id';

const NOW = new Date('2026-08-15T09:00:00.000Z');
function daysAgoISO(days: number): string {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}
function dateAgo(days: number): string {
  return daysAgoISO(days).slice(0, 10);
}

interface RsvpOverride extends Partial<Omit<RsvpResponse, 'event'>> {
  status?: RsvpStatus;
  /** When true, omits the RSVP entry entirely to simulate a genuine data gap. */
  missing?: boolean;
}

interface GuestSeedDef {
  fullName: string;
  preferredName?: string;
  title?: string;
  ageCategory: AgeCategory;
  relationship?: string;
  phone?: string;
  email?: string;
  invitedEvents?: GuestEvent[];
  dietaryPreference?: DietaryPreference;
  dietaryNotes?: string;
  allergies?: string;
  accessibilityRequirements?: string;
  elderlyAssistanceRequired?: boolean;
  infantRequirements?: string;
  accommodationRequired?: boolean;
  travelDetailsRequired?: boolean;
  pickupRequired?: boolean;
  plusOneStatus?: PlusOneStatus;
  notes?: string;
  rsvp?: Partial<Record<GuestEvent, RsvpOverride>>;
}

interface HouseholdSeedDef {
  key: string;
  householdName: string;
  primaryContactName: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  side: HouseholdSide;
  relationshipCategory: RelationshipCategory;
  relationshipDetail?: string;
  city: string;
  state?: string;
  country: string;
  invitationPriority: InvitationPriority;
  invitedEvents: GuestEvent[];
  invitationMethod: InvitationMethod[];
  invitationStatus: InvitationStatus;
  invitationOwner?: string;
  rsvpFollowUpOwner?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  notes?: string;
  preparedAt?: number;
  sentAt?: number;
  deliveredAt?: number;
  courierTrackingNumber?: string;
  deliveryNotes?: string;
  lastFollowUpAt?: number;
  nextFollowUpAt?: number;
  followUpNotes?: string;
  createdDaysAgo?: number;
  members: GuestSeedDef[];
}

const households: HouseholdSeedDef[] = [
  // ---------------- Groom side ----------------
  {
    key: 'alex-thomas',
    householdName: 'Alex Thomas Family',
    primaryContactName: 'Alex Thomas',
    primaryPhone: '+91 98450 11201',
    email: 'alex.thomas.family@example.com',
    side: 'Groom',
    relationshipCategory: 'Immediate Family',
    relationshipDetail: "Groom's paternal uncle's family",
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    invitationPriority: 'Must Invite',
    invitedEvents: ['Engagement', 'Wedding'],
    invitationMethod: ['Printed', 'WhatsApp'],
    invitationStatus: 'Delivered',
    invitationOwner: 'Guest List Lead',
    rsvpFollowUpOwner: 'Groom Mother',
    sentAt: 60,
    deliveredAt: 55,
    createdDaysAgo: 70,
    members: [
      { fullName: 'Alex Thomas', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', rsvp: { Engagement: { status: 'Attending', responseMethod: 'Phone', respondedAt: dateAgo(50) }, Wedding: { status: 'Attending', responseMethod: 'Phone', respondedAt: dateAgo(50) } } },
      { fullName: 'Rincy Alex', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Vegetarian', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Attending' } } },
      { fullName: 'Nevin Alex', ageCategory: 'Child', relationship: 'Child', dietaryPreference: 'Vegetarian', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Attending' } } },
      { fullName: 'Neha Alex', ageCategory: 'Infant', relationship: 'Child', infantRequirements: 'Crib and baby food warmer', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Attending' } } },
      { fullName: 'Kunjumol Thomas', ageCategory: 'Adult', relationship: 'Parent', dietaryPreference: 'Vegetarian', elderlyAssistanceRequired: true, rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Attending' } } },
    ],
  },
  {
    key: 'varghese',
    householdName: 'Varghese Family',
    primaryContactName: 'Biju Varghese',
    primaryPhone: '+91 90000 11202',
    side: 'Groom',
    relationshipCategory: 'Extended Family',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    invitationPriority: 'Priority',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Printed'],
    invitationStatus: 'Sent',
    invitationOwner: 'Guest List Lead',
    rsvpFollowUpOwner: 'Guest List Lead',
    sentAt: 40,
    createdDaysAgo: 65,
    members: [
      { fullName: 'Biju Varghese', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', rsvp: { Wedding: { status: 'Pending' } } },
      { fullName: 'Sherly Biju', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Non-Vegetarian', rsvp: { Wedding: { status: 'Pending' } } },
      { fullName: 'Jerin Biju', ageCategory: 'Adult', relationship: 'Child', dietaryPreference: 'Not Specified', rsvp: { Wedding: { status: 'No Response' } } },
    ],
  },
  {
    key: 'vargheese-dup',
    householdName: 'Vargheese Family',
    primaryContactName: 'Biju Vargheese',
    primaryPhone: '+91 90000 11203',
    side: 'Groom',
    relationshipCategory: 'Extended Family',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    invitationPriority: 'Standard',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Printed'],
    invitationStatus: 'Not Prepared',
    invitationOwner: 'Guest List Lead',
    notes: 'Possible duplicate of the Varghese Family household — name is one letter off, confirm before sending.',
    createdDaysAgo: 20,
    members: [
      { fullName: 'Bijoy Vergheese', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Not Specified' },
      { fullName: 'Anitha Bijoy', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Not Specified' },
    ],
  },
  {
    key: 'kurian',
    householdName: 'Kurian Family',
    primaryContactName: 'Saji Kurian',
    primaryPhone: '+91 94470 11204',
    email: 'saji.kurian@example.com',
    side: 'Groom',
    relationshipCategory: 'Extended Family',
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    invitationPriority: 'Priority',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Courier'],
    invitationStatus: 'Delivered',
    invitationOwner: 'Guest List Lead',
    rsvpFollowUpOwner: 'Guest List Lead',
    sentAt: 45,
    deliveredAt: 40,
    courierTrackingNumber: 'IND-CR-778812',
    createdDaysAgo: 70,
    members: [
      { fullName: 'Saji Kurian', ageCategory: 'Adult', relationship: 'Head of Household', phone: '+91 94470 11204', dietaryPreference: 'Non-Vegetarian', accommodationRequired: true, travelDetailsRequired: true, rsvp: { Wedding: { status: 'Attending', responseMethod: 'WhatsApp', respondedAt: dateAgo(30), accommodationRequested: true, travelDetailsSubmitted: true } } },
      { fullName: 'Elsy Saji', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Non-Vegetarian', accommodationRequired: true, travelDetailsRequired: true, rsvp: { Wedding: { status: 'Attending', accommodationRequested: true, travelDetailsSubmitted: true } } },
      // Intentional same-name-within-household duplicate warning example.
      { fullName: 'Thomas Kurian', ageCategory: 'Adult', relationship: 'Child', dietaryPreference: 'Vegetarian', rsvp: { Wedding: { status: 'Attending' } } },
      { fullName: 'Thomas Kurian', ageCategory: 'Adult', relationship: 'Other Relative', notes: 'Cousin, shares the same name as Saji\'s son — verify this is not a duplicate entry.', dietaryPreference: 'Not Specified', rsvp: { Wedding: { status: 'No Response' } } },
    ],
  },
  {
    key: 'panicker',
    householdName: 'Panicker Family',
    primaryContactName: 'Renjith Panicker',
    primaryPhone: '+91 98860 11205',
    side: 'Groom',
    relationshipCategory: 'Friend',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    invitationPriority: 'Standard',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Digital'],
    invitationStatus: 'Sent',
    invitationOwner: 'Guest List Lead',
    rsvpFollowUpOwner: 'Guest List Lead',
    sentAt: 35,
    createdDaysAgo: 55,
    members: [
      { fullName: 'Renjith Panicker', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', rsvp: { Wedding: { status: 'Attending', responseMethod: 'Email', respondedAt: dateAgo(20) } } },
      { fullName: 'Divya Renjith', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Vegetarian', rsvp: { Wedding: { status: 'Attending' } } },
      { fullName: 'Adithya Renjith', ageCategory: 'Child', relationship: 'Child', dietaryPreference: 'Vegetarian', rsvp: { Wedding: { status: 'Attending' } } },
    ],
  },
  {
    key: 'panicker-dup',
    householdName: 'Panicker Extended Family',
    primaryContactName: 'Renjith Panicker',
    primaryPhone: '+91 98860 11205',
    side: 'Groom',
    relationshipCategory: 'Relative',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    invitationPriority: 'Optional',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Digital'],
    invitationStatus: 'Not Prepared',
    invitationOwner: 'Guest List Lead',
    notes: 'Same phone number as the Panicker Family household — confirm whether this is a separate household before inviting.',
    createdDaysAgo: 15,
    members: [
      { fullName: 'Ravi Panicker', ageCategory: 'Adult', relationship: 'Other Relative', dietaryPreference: 'Not Specified' },
      { fullName: 'Latha Ravi', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Not Specified' },
    ],
  },
  {
    key: 'chacko',
    householdName: 'Chacko Family',
    primaryContactName: 'Sunil Chacko',
    primaryPhone: '+91 99080 11206',
    side: 'Groom',
    relationshipCategory: 'Colleague',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    invitationPriority: 'Standard',
    invitedEvents: ['Wedding'],
    invitationMethod: ['WhatsApp'],
    invitationStatus: 'Follow-up Required',
    invitationOwner: 'Groom',
    rsvpFollowUpOwner: 'Groom',
    sentAt: 50,
    deliveredAt: 49,
    lastFollowUpAt: 15,
    nextFollowUpAt: 3,
    followUpNotes: 'Messaged on WhatsApp, no reply yet. Try calling.',
    createdDaysAgo: 60,
    members: [
      { fullName: 'Sunil Chacko', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Not Specified', rsvp: { Wedding: { status: 'No Response' } } },
      { fullName: 'Meera Sunil', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Not Specified', rsvp: { Wedding: { status: 'No Response' } } },
    ],
  },
  {
    key: 'zachariah',
    householdName: 'Zachariah Family',
    primaryContactName: 'Tomy Zachariah',
    primaryPhone: '+91 94950 11207',
    email: 'tomy.zachariah@example.com',
    side: 'Groom',
    relationshipCategory: 'Immediate Family',
    relationshipDetail: "Groom's maternal aunt's family",
    city: 'Kottayam',
    state: 'Kerala',
    country: 'India',
    invitationPriority: 'Must Invite',
    invitedEvents: ['Engagement', 'Wedding'],
    invitationMethod: ['Printed', 'Hand Delivered'],
    invitationStatus: 'Complete',
    invitationOwner: 'Groom Mother',
    rsvpFollowUpOwner: 'Groom Mother',
    preparedAt: 75,
    sentAt: 70,
    deliveredAt: 68,
    createdDaysAgo: 90,
    members: [
      { fullName: 'Tomy Zachariah', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', elderlyAssistanceRequired: true, rsvp: { Engagement: { status: 'Attending', respondedAt: dateAgo(60) }, Wedding: { status: 'Attending', respondedAt: dateAgo(60) } } },
      { fullName: 'Rosamma Tomy', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Vegetarian', elderlyAssistanceRequired: true, rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Attending' } } },
      { fullName: 'Jerry Tomy', ageCategory: 'Adult', relationship: 'Child', dietaryPreference: 'Non-Vegetarian', rsvp: { Engagement: { status: 'Declined', notes: 'Work commitment in Goa dates' }, Wedding: { status: 'Attending' } } },
      { fullName: 'Beena Jerry', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Non-Vegetarian', rsvp: { Engagement: { status: 'Declined' }, Wedding: { status: 'Attending' } } },
    ],
  },
  {
    key: 'idiculla',
    householdName: 'Idiculla Family',
    primaryContactName: 'Shibu Idiculla',
    primaryPhone: '+91 90940 11208',
    side: 'Groom',
    relationshipCategory: 'Extended Family',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    invitationPriority: 'Priority',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Courier'],
    invitationStatus: 'Sent',
    invitationOwner: 'Guest List Lead',
    rsvpFollowUpOwner: 'Guest List Lead',
    sentAt: 30,
    courierTrackingNumber: 'IND-CR-881120',
    createdDaysAgo: 50,
    members: [
      { fullName: 'Shibu Idiculla', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', pickupRequired: true, rsvp: { Wedding: { status: 'Attending', pickupRequested: true, travelDetailsSubmitted: false } } },
      { fullName: 'Neenu Shibu', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Vegetarian', pickupRequired: true, rsvp: { Wedding: { status: 'Attending', pickupRequested: true, travelDetailsSubmitted: false } } },
      { fullName: 'Liya Shibu', ageCategory: 'Child', relationship: 'Child', dietaryPreference: 'Vegetarian', rsvp: { Wedding: { status: 'Attending' } } },
      { fullName: 'Baby Shibu', ageCategory: 'Infant', relationship: 'Child', infantRequirements: 'Baby cot required', rsvp: { Wedding: { status: 'Attending' } } },
    ],
  },
  {
    key: 'oommen',
    householdName: 'Oommen Family',
    primaryContactName: 'Dennis Oommen',
    primaryPhone: '+91 98200 11209',
    side: 'Groom',
    relationshipCategory: 'Friend',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    invitationPriority: 'Standard',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Digital'],
    invitationStatus: 'Delivered',
    invitationOwner: 'Guest List Lead',
    rsvpFollowUpOwner: 'Guest List Lead',
    sentAt: 33,
    deliveredAt: 33,
    createdDaysAgo: 40,
    members: [
      { fullName: 'Dennis Oommen', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', plusOneStatus: 'Pending', rsvp: { Wedding: { status: 'Maybe', responseMethod: 'Email', respondedAt: dateAgo(10), notes: 'Depends on work travel schedule.' } } },
      { fullName: 'Anu Dennis', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Vegetarian', rsvp: { Wedding: { status: 'Maybe' } } },
    ],
  },
  {
    key: 'philip',
    householdName: 'Philip Family',
    primaryContactName: 'Vinod Philip',
    primaryPhone: '+91 98110 11210',
    side: 'Groom',
    relationshipCategory: 'Colleague',
    city: 'Delhi',
    country: 'India',
    invitationPriority: 'Optional',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Email'],
    invitationStatus: 'Ready',
    invitationOwner: 'Groom',
    createdDaysAgo: 20,
    members: [
      { fullName: 'Vinod Philip', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Not Specified' },
      { fullName: 'Reshma Vinod', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Not Specified' },
    ],
  },
  {
    key: 'jacob',
    householdName: 'Jacob Family',
    primaryContactName: 'Roy Jacob',
    primaryPhone: '+91 94460 11211',
    side: 'Groom',
    relationshipCategory: 'Extended Family',
    city: 'Thiruvananthapuram',
    state: 'Kerala',
    country: 'India',
    invitationPriority: 'Priority',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Printed'],
    invitationStatus: 'Delivered',
    invitationOwner: 'Guest List Lead',
    rsvpFollowUpOwner: 'Guest List Lead',
    sentAt: 42,
    deliveredAt: 38,
    createdDaysAgo: 55,
    members: [
      { fullName: 'Roy Jacob', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', rsvp: { Wedding: { status: 'Attending', respondedAt: dateAgo(25) } } },
      { fullName: 'Suja Roy', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Non-Vegetarian', rsvp: { Wedding: { status: 'Attending' } } },
      { fullName: 'Alan Roy', ageCategory: 'Adult', relationship: 'Child', dietaryPreference: 'Not Specified', rsvp: { Wedding: { status: 'Attending' } } },
      { fullName: 'Tessy Roy', ageCategory: 'Adult', relationship: 'Other Relative', dietaryPreference: 'Vegetarian', rsvp: { Wedding: { status: 'Pending' } } },
    ],
  },
  {
    key: 'abraham',
    householdName: 'Abraham Family',
    primaryContactName: 'George Abraham',
    primaryPhone: '+971 50 111 2212',
    email: 'george.abraham@example.com',
    side: 'Groom',
    relationshipCategory: 'Relative',
    city: 'Dubai',
    country: 'United Arab Emirates',
    invitationPriority: 'Priority',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Email', 'WhatsApp'],
    invitationStatus: 'Sent',
    invitationOwner: 'Groom Father',
    rsvpFollowUpOwner: 'Groom Father',
    sentAt: 55,
    createdDaysAgo: 60,
    members: [
      { fullName: 'George Abraham', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', accommodationRequired: true, travelDetailsRequired: true, rsvp: { Wedding: { status: 'Attending', accommodationRequested: true, travelDetailsSubmitted: true, respondedAt: dateAgo(18) } } },
      { fullName: 'Susan George', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Vegetarian', accommodationRequired: true, travelDetailsRequired: true, rsvp: { Wedding: { status: 'Attending', accommodationRequested: true, travelDetailsSubmitted: true } } },
      { fullName: 'Tia George', ageCategory: 'Child', relationship: 'Child', dietaryPreference: 'Vegetarian', accommodationRequired: true, rsvp: { Wedding: { status: 'Attending', accommodationRequested: true } } },
      { fullName: 'Leo George', ageCategory: 'Infant', relationship: 'Child', infantRequirements: 'Baby cot and stroller access', accommodationRequired: true, rsvp: { Wedding: { status: 'Attending', accommodationRequested: true } } },
    ],
  },
  {
    key: 'cherian',
    householdName: 'Cherian Family',
    primaryContactName: 'Nikhil Cherian',
    primaryPhone: '+91 90300 11213',
    side: 'Groom',
    relationshipCategory: 'Friend',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    invitationPriority: 'Standard',
    invitedEvents: ['Wedding'],
    invitationMethod: ['WhatsApp'],
    invitationStatus: 'Not Prepared',
    invitationOwner: 'Groom',
    createdDaysAgo: 10,
    members: [
      { fullName: 'Nikhil Cherian', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Not Specified' },
      { fullName: 'Priya Nikhil', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Not Specified' },
    ],
  },
  {
    key: 'mathews',
    householdName: 'Mathews Family',
    primaryContactName: 'Anoop Mathews',
    primaryPhone: '+91 99490 11214',
    side: 'Groom',
    relationshipCategory: 'Immediate Family',
    relationshipDetail: "Groom's elder brother's family",
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    invitationPriority: 'Must Invite',
    invitedEvents: ['Engagement', 'Wedding'],
    invitationMethod: ['Hand Delivered'],
    invitationStatus: 'Complete',
    invitationOwner: 'Groom Father',
    rsvpFollowUpOwner: 'Groom Father',
    preparedAt: 80,
    sentAt: 78,
    deliveredAt: 78,
    createdDaysAgo: 95,
    members: [
      { fullName: 'Anoop Mathews', ageCategory: 'Adult', relationship: 'Sibling', dietaryPreference: 'Non-Vegetarian', rsvp: { Engagement: { status: 'Attending', respondedAt: dateAgo(70) }, Wedding: { status: 'Attending', respondedAt: dateAgo(70) } } },
      { fullName: 'Diya Anoop', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Vegetarian', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Attending' } } },
      { fullName: 'Ethan Anoop', ageCategory: 'Child', relationship: 'Child', dietaryPreference: 'Vegetarian', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Pending', notes: 'Data-quality demo: household marked Complete before this response came in.' } } },
      { fullName: 'Mia Anoop', ageCategory: 'Infant', relationship: 'Child', infantRequirements: 'Crib required', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Attending' } } },
    ],
  },

  // ---------------- Bride side ----------------
  {
    key: 'george',
    householdName: 'George Family',
    primaryContactName: 'George Mathew',
    primaryPhone: '+91 98470 11301',
    email: 'george.mathew.family@example.com',
    side: 'Bride',
    relationshipCategory: 'Immediate Family',
    relationshipDetail: "Bride's elder sister's family",
    city: 'Panaji',
    state: 'Goa',
    country: 'India',
    invitationPriority: 'Must Invite',
    invitedEvents: ['Engagement', 'Wedding'],
    invitationMethod: ['Printed', 'Hand Delivered'],
    invitationStatus: 'Complete',
    invitationOwner: 'Bride',
    rsvpFollowUpOwner: 'Bride',
    preparedAt: 85,
    sentAt: 82,
    deliveredAt: 80,
    createdDaysAgo: 100,
    members: [
      { fullName: 'George Mathew', ageCategory: 'Adult', relationship: 'Head of Household', phone: '+91 98470 11301', email: 'george.mathew.family@example.com', dietaryPreference: 'Non-Vegetarian', rsvp: { Engagement: { status: 'Attending', respondedAt: dateAgo(75) }, Wedding: { status: 'Attending', respondedAt: dateAgo(75) } } },
      { fullName: 'Ancy George', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Vegetarian', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Attending' } } },
      { fullName: 'Kevin George', ageCategory: 'Adult', relationship: 'Child', dietaryPreference: 'Non-Vegetarian', rsvp: { Engagement: { status: 'Declined', notes: 'Exams in Bengaluru' }, Wedding: { status: 'Declined', notes: 'Exams in Bengaluru' } } },
      { fullName: 'Anna George', ageCategory: 'Child', relationship: 'Child', dietaryPreference: 'Vegetarian', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Attending' } } },
      { fullName: 'Baby Mathew', ageCategory: 'Infant', relationship: 'Child', infantRequirements: 'Crib and baby food warmer', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Attending' } } },
    ],
  },
  {
    key: 'verghese',
    householdName: 'Verghese Family',
    primaryContactName: 'Manoj Verghese',
    primaryPhone: '+91 98330 11302',
    side: 'Bride',
    relationshipCategory: 'Extended Family',
    city: 'Margao',
    state: 'Goa',
    country: 'India',
    invitationPriority: 'Priority',
    invitedEvents: ['Engagement', 'Wedding'],
    invitationMethod: ['Printed'],
    invitationStatus: 'Delivered',
    invitationOwner: 'Guest List Lead',
    rsvpFollowUpOwner: 'Guest List Lead',
    sentAt: 65,
    deliveredAt: 60,
    createdDaysAgo: 80,
    members: [
      { fullName: 'Manoj Verghese', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', rsvp: { Engagement: { status: 'Attending', respondedAt: dateAgo(40) }, Wedding: { status: 'Pending' } } },
      { fullName: 'Silpa Manoj', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Vegetarian', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Pending' } } },
      { fullName: 'Riya Manoj', ageCategory: 'Child', relationship: 'Child', dietaryPreference: 'Vegetarian', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Pending' } } },
      { fullName: 'Reuben Manoj', ageCategory: 'Child', relationship: 'Child', dietaryPreference: 'Vegetarian', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Pending' } } },
    ],
  },
  {
    key: 'joseph',
    householdName: 'Joseph Family',
    primaryContactName: 'Thomas Joseph',
    primaryPhone: '+91 94470 11303',
    email: 'thomas.joseph@example.com',
    side: 'Bride',
    relationshipCategory: 'Immediate Family',
    relationshipDetail: "Bride's maternal uncle's family",
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    invitationPriority: 'Must Invite',
    invitedEvents: ['Engagement', 'Wedding'],
    invitationMethod: ['Printed', 'Courier'],
    invitationStatus: 'Sent',
    invitationOwner: 'Bride',
    rsvpFollowUpOwner: 'Bride',
    sentAt: 48,
    courierTrackingNumber: 'IND-CR-663310',
    createdDaysAgo: 65,
    members: [
      { fullName: 'Thomas Joseph', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', elderlyAssistanceRequired: false, rsvp: { Engagement: { status: 'Attending', respondedAt: dateAgo(22) }, Wedding: { status: 'Attending', respondedAt: dateAgo(22) } } },
      { fullName: 'Mercy Thomas', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Vegetarian', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Attending' } } },
      { fullName: 'Nithin Thomas', ageCategory: 'Adult', relationship: 'Child', dietaryPreference: 'Not Specified', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Attending' } } },
      { fullName: 'Ann Thomas', ageCategory: 'Adult', relationship: 'Other Relative', dietaryPreference: 'Vegetarian', rsvp: { Engagement: { status: 'Maybe' }, Wedding: { status: 'Attending' } } },
    ],
  },
  {
    key: 'chandy',
    householdName: 'Chandy Family',
    primaryContactName: 'Bobby Chandy',
    primaryPhone: '+91 90740 11304',
    side: 'Bride',
    relationshipCategory: 'Extended Family',
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    invitationPriority: 'Priority',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Printed'],
    invitationStatus: 'Delivered',
    invitationOwner: 'Guest List Lead',
    rsvpFollowUpOwner: 'Guest List Lead',
    sentAt: 44,
    deliveredAt: 41,
    createdDaysAgo: 55,
    members: [
      { fullName: 'Bobby Chandy', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', rsvp: { Wedding: { status: 'Attending', respondedAt: dateAgo(19) } } },
      { fullName: 'Aleyamma Bobby', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Jain', dietaryNotes: 'No root vegetables, please keep separate serving spoons.', rsvp: { Wedding: { status: 'Attending' } } },
      { fullName: 'Vishnu Bobby', ageCategory: 'Adult', relationship: 'Child', dietaryPreference: 'Non-Vegetarian', rsvp: { Wedding: { status: 'Attending' } } },
    ],
  },
  {
    key: 'thomas',
    householdName: 'Thomas Family',
    primaryContactName: 'Sabu Thomas',
    primaryPhone: '+91 94950 11305',
    side: 'Bride',
    relationshipCategory: 'Relative',
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    invitationPriority: 'Standard',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Digital'],
    invitationStatus: 'Follow-up Required',
    invitationOwner: 'Guest List Lead',
    rsvpFollowUpOwner: 'Guest List Lead',
    sentAt: 38,
    deliveredAt: 37,
    lastFollowUpAt: 10,
    nextFollowUpAt: -2,
    followUpNotes: 'Left a voicemail, awaiting callback.',
    createdDaysAgo: 45,
    members: [
      { fullName: 'Sabu Thomas', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Not Specified', rsvp: { Wedding: { status: 'No Response' } } },
      { fullName: 'Ligy Sabu', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Not Specified', rsvp: { Wedding: { status: 'No Response' } } },
    ],
  },
  {
    key: 'kutty',
    householdName: 'Kutty Family',
    primaryContactName: 'Vinu Kutty',
    primaryPhone: '+91 98450 11306',
    side: 'Bride',
    relationshipCategory: 'Friend',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    invitationPriority: 'Standard',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Digital'],
    invitationStatus: 'Delivered',
    invitationOwner: 'Guest List Lead',
    rsvpFollowUpOwner: 'Guest List Lead',
    sentAt: 32,
    deliveredAt: 32,
    createdDaysAgo: 40,
    members: [
      { fullName: 'Vinu Kutty', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Vegan', dietaryNotes: 'Strictly no dairy or eggs.', rsvp: { Wedding: { status: 'Attending', respondedAt: dateAgo(12) } } },
      { fullName: 'Anjali Vinu', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Vegetarian', rsvp: { Wedding: { status: 'Attending' } } },
      { fullName: 'Kiaan Vinu', ageCategory: 'Child', relationship: 'Child', dietaryPreference: 'Vegetarian', rsvp: { Wedding: { status: 'Attending' } } },
    ],
  },
  {
    key: 'alexander',
    householdName: 'Alexander Family',
    primaryContactName: 'Sonia Alexander',
    primaryPhone: '+91 90080 11307',
    side: 'Bride',
    relationshipCategory: 'Colleague',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    invitationPriority: 'Optional',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Email'],
    invitationStatus: 'Ready',
    invitationOwner: 'Bride',
    createdDaysAgo: 15,
    members: [
      { fullName: 'Sonia Alexander', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Not Specified' },
      { fullName: 'Arun Sonia', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Not Specified' },
    ],
  },
  {
    key: 'mathew',
    householdName: 'Mathew Family',
    primaryContactName: 'Jose Mathew',
    primaryPhone: '+91 94470 11308',
    email: 'jose.mathew@example.com',
    side: 'Bride',
    relationshipCategory: 'Immediate Family',
    relationshipDetail: "Bride's paternal aunt's family",
    city: 'Kottayam',
    state: 'Kerala',
    country: 'India',
    invitationPriority: 'Must Invite',
    invitedEvents: ['Engagement', 'Wedding'],
    invitationMethod: ['Printed'],
    invitationStatus: 'Complete',
    invitationOwner: 'Bride',
    rsvpFollowUpOwner: 'Bride',
    preparedAt: 78,
    sentAt: 74,
    deliveredAt: 70,
    createdDaysAgo: 95,
    members: [
      { fullName: 'Jose Mathew', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', elderlyAssistanceRequired: true, rsvp: { Engagement: { status: 'Attending', respondedAt: dateAgo(65) }, Wedding: { status: 'Attending', respondedAt: dateAgo(65) } } },
      { fullName: 'Aleyamma Jose', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Vegetarian', elderlyAssistanceRequired: true, rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Attending' } } },
      { fullName: 'Anu Jose', ageCategory: 'Adult', relationship: 'Child', dietaryPreference: 'Vegetarian', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Attending' } } },
    ],
  },
  {
    key: 'samuel',
    householdName: 'Samuel Family',
    primaryContactName: 'Binu Samuel',
    primaryPhone: '+91 94000 11309',
    email: 'thomas.joseph@example.com',
    side: 'Bride',
    relationshipCategory: 'Extended Family',
    city: 'Thiruvananthapuram',
    state: 'Kerala',
    country: 'India',
    invitationPriority: 'Priority',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Printed'],
    invitationStatus: 'Sent',
    invitationOwner: 'Guest List Lead',
    rsvpFollowUpOwner: 'Guest List Lead',
    notes: 'Email on file matches the Joseph Family household — likely a data-entry mix-up, confirm the correct address.',
    sentAt: 36,
    createdDaysAgo: 45,
    members: [
      { fullName: 'Binu Samuel', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', rsvp: { Wedding: { status: 'Pending' } } },
      { fullName: 'Deepa Binu', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Not Specified', rsvp: { Wedding: { status: 'Pending' } } },
    ],
  },
  {
    key: 'eapen',
    householdName: 'Eapen Family',
    primaryContactName: 'Rejin Eapen',
    primaryPhone: '+91 90420 11310',
    side: 'Bride',
    relationshipCategory: 'Friend',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    invitationPriority: 'Standard',
    invitedEvents: ['Wedding'],
    invitationMethod: ['WhatsApp'],
    invitationStatus: 'Delivered',
    invitationOwner: 'Guest List Lead',
    rsvpFollowUpOwner: 'Guest List Lead',
    sentAt: 34,
    deliveredAt: 34,
    createdDaysAgo: 42,
    members: [
      { fullName: 'Rejin Eapen', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', pickupRequired: true, rsvp: { Wedding: { status: 'Attending', pickupRequested: true, travelDetailsSubmitted: true, respondedAt: dateAgo(14) } } },
      { fullName: 'Neethu Rejin', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Vegetarian', pickupRequired: true, rsvp: { Wedding: { status: 'Attending', pickupRequested: true, travelDetailsSubmitted: true } } },
      { fullName: 'Baby Rejin', ageCategory: 'Infant', relationship: 'Child', infantRequirements: 'Baby cot and stroller access', rsvp: { Wedding: { status: 'Attending' } } },
    ],
  },
  {
    key: 'skariah',
    householdName: 'Skariah Family',
    primaryContactName: 'Nissy Skariah',
    primaryPhone: '+91 98920 11311',
    side: 'Bride',
    relationshipCategory: 'Relative',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    invitationPriority: 'Standard',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Digital'],
    invitationStatus: 'Not Prepared',
    invitationOwner: 'Guest List Lead',
    createdDaysAgo: 12,
    members: [
      { fullName: 'Nissy Skariah', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Not Specified' },
      { fullName: 'Roshan Nissy', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Not Specified' },
    ],
  },
  {
    key: 'kannampuzha',
    householdName: 'Kannampuzha Family',
    primaryContactName: 'Jino Kannampuzha',
    primaryPhone: '+91 98110 11312',
    side: 'Bride',
    relationshipCategory: 'Extended Family',
    city: 'Delhi',
    country: 'India',
    invitationPriority: 'Standard',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Courier'],
    invitationStatus: 'Sent',
    invitationOwner: 'Guest List Lead',
    rsvpFollowUpOwner: 'Guest List Lead',
    sentAt: 41,
    courierTrackingNumber: 'IND-CR-449981',
    createdDaysAgo: 50,
    members: [
      { fullName: 'Jino Kannampuzha', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', rsvp: { Wedding: { status: 'Declined', respondedAt: dateAgo(9), notes: 'Unable to travel that week.' } } },
      { fullName: 'Elizabeth Jino', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Vegetarian', rsvp: { Wedding: { status: 'Declined' } } },
    ],
  },
  {
    key: 'mani',
    householdName: 'Mani Family',
    primaryContactName: 'Ajit Mani',
    primaryPhone: '+44 7700 911313',
    email: 'ajit.mani@example.com',
    side: 'Bride',
    relationshipCategory: 'Friend',
    city: 'London',
    country: 'United Kingdom',
    invitationPriority: 'Priority',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Email'],
    invitationStatus: 'Sent',
    invitationOwner: 'Bride',
    rsvpFollowUpOwner: 'Bride',
    sentAt: 58,
    createdDaysAgo: 65,
    members: [
      { fullName: 'Ajit Mani', ageCategory: 'Adult', relationship: 'Head of Household', dietaryPreference: 'Non-Vegetarian', accommodationRequired: true, travelDetailsRequired: true, rsvp: { Wedding: { status: 'Attending', accommodationRequested: true, travelDetailsSubmitted: false, respondedAt: dateAgo(16) } } },
      { fullName: 'Kripa Ajit', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Vegetarian', accommodationRequired: true, rsvp: { Wedding: { status: 'Attending', accommodationRequested: true } } },
    ],
  },

  // ---------------- Both sides ----------------
  {
    key: 'sebastian',
    householdName: 'Fr. Sebastian & Family',
    primaryContactName: 'Fr. Sebastian Pynadath',
    primaryPhone: '+91 90300 11401',
    side: 'Both',
    relationshipCategory: 'Community / Church',
    relationshipDetail: 'Family parish priest, close to both families',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    invitationPriority: 'Must Invite',
    invitedEvents: ['Engagement', 'Wedding'],
    invitationMethod: ['Hand Delivered'],
    invitationStatus: 'Complete',
    invitationOwner: 'Church Lead',
    rsvpFollowUpOwner: 'Church Lead',
    preparedAt: 82,
    sentAt: 80,
    deliveredAt: 80,
    createdDaysAgo: 95,
    members: [
      { fullName: 'Fr. Sebastian Pynadath', title: 'Fr.', ageCategory: 'Adult', relationship: 'Other Relative', dietaryPreference: 'Vegetarian', rsvp: { Engagement: { status: 'Attending', respondedAt: dateAgo(72) }, Wedding: { status: 'Attending', respondedAt: dateAgo(72) } } },
      { fullName: 'Sherin Sebastian', ageCategory: 'Adult', relationship: 'Other Relative', dietaryPreference: 'Vegetarian', rsvp: { Engagement: { status: 'Attending' }, Wedding: { status: 'Attending' } } },
    ],
  },
  {
    key: 'rodrigues',
    householdName: 'Rodrigues Family',
    primaryContactName: 'Melvin Rodrigues',
    primaryPhone: '+1 416 555 1402',
    email: 'melvin.rodrigues@example.com',
    side: 'Both',
    relationshipCategory: 'Family Friend',
    city: 'Toronto',
    country: 'Canada',
    invitationPriority: 'Priority',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Email'],
    invitationStatus: 'Delivered',
    invitationOwner: 'Guest List Lead',
    rsvpFollowUpOwner: 'Guest List Lead',
    sentAt: 52,
    deliveredAt: 52,
    createdDaysAgo: 60,
    members: [
      { fullName: 'Melvin Rodrigues', ageCategory: 'Adult', relationship: 'Other Relative', dietaryPreference: 'Non-Vegetarian', accommodationRequired: true, travelDetailsRequired: true, rsvp: { Wedding: { status: 'Attending', accommodationRequested: true, travelDetailsSubmitted: true, respondedAt: dateAgo(21) } } },
      { fullName: 'Carol Melvin', ageCategory: 'Adult', relationship: 'Spouse', dietaryPreference: 'Non-Vegetarian', accommodationRequired: true, rsvp: { Wedding: { status: 'Attending', accommodationRequested: true } } },
    ],
  },
  {
    // Data-quality demo: a rough draft entry jotted down at a family gathering,
    // never completed — exercises "no primary contact" and "no phone/email".
    key: 'unnamed-draft',
    householdName: 'Unnamed Draft Household',
    primaryContactName: '',
    primaryPhone: '',
    side: 'Bride',
    relationshipCategory: 'Other',
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    invitationPriority: 'Optional',
    invitedEvents: ['Wedding'],
    invitationMethod: ['Other'],
    invitationStatus: 'Not Prepared',
    notes: 'Jotted down at a family gathering — contact details still need to be collected.',
    createdDaysAgo: 3,
    members: [
      { fullName: 'To Be Confirmed Guest', ageCategory: 'Adult', relationship: 'Other', dietaryPreference: 'Not Specified' },
    ],
  },
];

// One deliberately orphaned guest (no matching household) to exercise the
// "Guest with no household" data-quality check.
const ORPHAN_GUEST: Guest = {
  id: generateSeedId('guest', 'Unlinked Guest Record'),
  householdId: 'household_does_not_exist',
  fullName: 'Unlinked Guest Record',
  ageCategory: 'Adult',
  relationship: 'Other Relative',
  invitedEvents: ['Wedding'],
  rsvpResponses: [{ event: 'Wedding', status: 'No Response' }],
  dietaryPreference: 'Not Specified',
  elderlyAssistanceRequired: false,
  accommodationRequired: false,
  travelDetailsRequired: false,
  pickupRequired: false,
  plusOneStatus: 'Not Applicable',
  notes: 'Data-quality demo: this guest record references a household that no longer exists.',
  createdAt: daysAgoISO(5),
  updatedAt: daysAgoISO(5),
};

function buildRsvpResponse(event: GuestEvent, override?: RsvpOverride): RsvpResponse | null {
  if (!override || override.missing !== true) {
    return {
      event,
      status: override?.status ?? 'No Response',
      respondedAt: override?.respondedAt,
      responseMethod: override?.responseMethod,
      numberOfAdults: override?.numberOfAdults,
      numberOfChildren: override?.numberOfChildren,
      numberOfInfants: override?.numberOfInfants,
      dietaryConfirmed: override?.dietaryConfirmed,
      travelDetailsSubmitted: override?.travelDetailsSubmitted,
      accommodationRequested: override?.accommodationRequested,
      pickupRequested: override?.pickupRequested,
      notes: override?.notes,
    };
  }
  return null;
}

export interface SeedHouseholdsResult {
  households: Household[];
  guests: Guest[];
}

export function buildSeedHouseholdsAndGuests(): SeedHouseholdsResult {
  const builtHouseholds: Household[] = [];
  const builtGuests: Guest[] = [];

  for (const def of households) {
    const householdId = generateSeedId('household', def.householdName);
    const createdAt = daysAgoISO(def.createdDaysAgo ?? 60);
    const updatedAt = daysAgoISO(
      def.lastFollowUpAt ?? def.deliveredAt ?? def.sentAt ?? def.preparedAt ?? def.createdDaysAgo ?? 60,
    );

    const household: Household = {
      id: householdId,
      householdName: def.householdName,
      primaryContactName: def.primaryContactName,
      primaryPhone: def.primaryPhone,
      secondaryPhone: def.secondaryPhone,
      email: def.email,
      side: def.side,
      relationshipCategory: def.relationshipCategory,
      relationshipDetail: def.relationshipDetail,
      city: def.city,
      state: def.state,
      country: def.country,
      invitationPriority: def.invitationPriority,
      invitedEvents: def.invitedEvents,
      invitationMethod: def.invitationMethod,
      invitationStatus: def.invitationStatus,
      invitationOwner: def.invitationOwner,
      rsvpFollowUpOwner: def.rsvpFollowUpOwner,
      addressLine1: def.addressLine1,
      addressLine2: def.addressLine2,
      postalCode: def.postalCode,
      notes: def.notes,
      preparedAt: def.preparedAt !== undefined ? dateAgo(def.preparedAt) : undefined,
      sentAt: def.sentAt !== undefined ? dateAgo(def.sentAt) : undefined,
      deliveredAt: def.deliveredAt !== undefined ? dateAgo(def.deliveredAt) : undefined,
      courierTrackingNumber: def.courierTrackingNumber,
      deliveryNotes: def.deliveryNotes,
      lastFollowUpAt: def.lastFollowUpAt !== undefined ? dateAgo(def.lastFollowUpAt) : undefined,
      nextFollowUpAt: def.nextFollowUpAt !== undefined ? dateAgo(def.nextFollowUpAt) : undefined,
      followUpNotes: def.followUpNotes,
      createdAt,
      updatedAt,
    };
    builtHouseholds.push(household);

    for (const [memberIndex, member] of def.members.entries()) {
      const invitedEvents = member.invitedEvents ?? def.invitedEvents;
      const rsvpResponses: RsvpResponse[] = [];
      for (const event of invitedEvents) {
        const response = buildRsvpResponse(event, member.rsvp?.[event]);
        if (response) rsvpResponses.push(response);
      }

      const guest: Guest = {
        id: generateSeedId('guest', `${def.householdName}:${memberIndex}:${member.fullName}`),
        householdId,
        fullName: member.fullName,
        preferredName: member.preferredName,
        title: member.title,
        ageCategory: member.ageCategory,
        relationship: member.relationship,
        phone: member.phone,
        email: member.email,
        invitedEvents,
        rsvpResponses,
        dietaryPreference: member.dietaryPreference ?? 'Not Specified',
        dietaryNotes: member.dietaryNotes,
        allergies: member.allergies,
        accessibilityRequirements: member.accessibilityRequirements,
        elderlyAssistanceRequired: member.elderlyAssistanceRequired ?? false,
        infantRequirements: member.infantRequirements,
        accommodationRequired: member.accommodationRequired ?? false,
        travelDetailsRequired: member.travelDetailsRequired ?? false,
        pickupRequired: member.pickupRequired ?? false,
        plusOneStatus: member.plusOneStatus ?? 'Not Applicable',
        notes: member.notes,
        createdAt,
        updatedAt,
      };
      builtGuests.push(guest);
    }
  }

  builtGuests.push(ORPHAN_GUEST);

  // One guest invited to the Wedding with no RSVP entry at all (genuine data gap).
  const guestMissingRsvp = builtGuests.find((g) => g.fullName === 'Vinod Philip');
  if (guestMissingRsvp) {
    guestMissingRsvp.rsvpResponses = guestMissingRsvp.rsvpResponses.filter((r) => r.event !== 'Wedding');
  }

  // One guest attending with dietary preference left unspecified (data-quality demo).
  const guestMissingDiet = builtGuests.find((g) => g.fullName === 'Alan Roy');
  if (guestMissingDiet) {
    guestMissingDiet.dietaryPreference = 'Not Specified';
  }

  return { households: builtHouseholds, guests: builtGuests };
}
