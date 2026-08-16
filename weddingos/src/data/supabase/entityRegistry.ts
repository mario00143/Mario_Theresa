import { genericFromRow, genericToRow } from '@/data/adapters/genericMapper';
import type { EntityRowMap } from '@/data/adapters/rowMap';

/**
 * Every pre-existing v1-v6 collection, paired with its exact Postgres
 * table name from supabase/migrations/. Table names are listed explicitly
 * rather than derived from the key at runtime — `musicAVPlans` is the one
 * collection whose naive camelCase->snake_case derivation would collide
 * ("music_a_v_plans" vs the real `music_av_plans`), and a hardcoded list
 * here is trivially diffable against the SQL files, whereas trusting a
 * regex for an edge case it was only just fixed for is not.
 */
export const LEGACY_ENTITY_TABLES = {
  tasks: 'tasks',
  decisions: 'decisions',
  owners: 'owners',
  households: 'households',
  guests: 'guests',
  travelSegments: 'travel_segments',
  hotels: 'hotels',
  roomTypes: 'room_types',
  rooms: 'rooms',
  roomAssignments: 'room_assignments',
  vehicles: 'vehicles',
  drivers: 'drivers',
  transportRoutes: 'transport_routes',
  transportAssignments: 'transport_assignments',
  vendors: 'vendors',
  vendorContacts: 'vendor_contacts',
  vendorQuotes: 'vendor_quotes',
  contracts: 'contracts',
  budgetCategories: 'budget_categories',
  budgetItems: 'budget_items',
  paymentSchedules: 'payment_schedules',
  payments: 'payments',
  refunds: 'refunds',
  churchProfiles: 'church_profiles',
  churchRequirements: 'church_requirements',
  ceremonyParticipants: 'ceremony_participants',
  ceremonySequenceItems: 'ceremony_sequence_items',
  ceremonyItems: 'ceremony_items',
  cateringPlans: 'catering_plans',
  menuItems: 'menu_items',
  decorPlans: 'decor_plans',
  decorDeliverables: 'decor_deliverables',
  attireProfiles: 'attire_profiles',
  attireItems: 'attire_items',
  groomingAppointments: 'grooming_appointments',
  photographyPlans: 'photography_plans',
  photoGroups: 'photo_groups',
  musicCues: 'music_cues',
  musicAVPlans: 'music_av_plans',
  giftPlans: 'gift_plans',
  welcomeKits: 'welcome_kits',
  welcomeKitItems: 'welcome_kit_items',
  runSheetItems: 'run_sheet_items',
  liveIssues: 'live_issues',
  dutyAssignments: 'duty_assignments',
  vendorDayStatuses: 'vendor_day_statuses',
  ceremonyItemMovements: 'ceremony_item_movements',
  emergencyContacts: 'emergency_contacts',
  emergencyResponseCards: 'emergency_response_cards',
  closeoutItems: 'closeout_items',
  finalReadinessReviews: 'final_readiness_reviews',
  guestOperationalStatuses: 'guest_operational_statuses',
  manifestFreezeStates: 'manifest_freeze_states',
} as const;

export type LegacyEntityKey = keyof typeof LEGACY_ENTITY_TABLES;

/** Builds the generic row-mapper for one legacy collection, keyed by its stores.ts export name. */
export function legacyEntityMap<T extends { id: string }>(key: LegacyEntityKey): EntityRowMap<T> {
  const table = LEGACY_ENTITY_TABLES[key];
  return {
    table,
    toRow: (record, workspaceId, userId) => genericToRow(record as unknown as Record<string, unknown>, workspaceId, userId),
    fromRow: (row) => genericFromRow<T>(row),
  };
}
