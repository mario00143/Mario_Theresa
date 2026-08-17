import type { CeremonyItem, CloseoutItem, DutyAssignment, EmergencyContact, LiveIssue, RunSheetItem } from '@/types';
import type {
  GuestArrivalManifestRow,
  HotelRoomingManifestRow,
  ShuttleManifestRow,
  DepartureManifestRow,
  VipElderlyManifestRow,
  VendorContactManifestRow,
  FamilyDutyManifestRow,
} from '@/utils/manifestLogic';

/** Read-only venue/day summary shown offline — never editable from the Offline Pack. */
export interface OfflineVenueDetails {
  churchName?: string;
  churchAddress?: string;
  churchPhone?: string;
  clergyName?: string;
  clergyPhone?: string;
  receptionVenue?: string;
  receptionLocation?: string;
  ceremonyTime?: string;
  receptionTime?: string;
  timezone: string;
}

/**
 * Section 9: a curated, explicitly-generated, read-only snapshot of the
 * "Critical Read-Only Offline Data" categories, stored in IndexedDB (never
 * localStorage — this can be a non-trivial amount of joined data). This is
 * intentionally NOT the same thing as the general localStorage store mirror
 * (which already exists for every entity) — it is a deliberate, dated,
 * freshness-tracked "pack" a Wedding Day operator can trust was generated
 * on purpose, with a visible age, specifically for the day this matters.
 */
export interface OfflineSnapshot {
  /** Fixed id — exactly one snapshot is kept at a time (regenerating replaces it). */
  id: 'current';
  workspaceId: string | null;
  generatedAt: string;
  weddingDate: string;
  /** Latest updatedAt across every record folded into this snapshot — the baseline used for conflict detection when a queued mutation is later replayed. */
  sourceUpdatedAt: string;
  schemaVersion: number;

  runSheet: RunSheetItem[];
  emergencyContacts: EmergencyContact[];
  vendorContacts: VendorContactManifestRow[];
  duties: DutyAssignment[];
  familyDuty: FamilyDutyManifestRow[];
  ceremonyItems: CeremonyItem[];
  manifests: {
    guestArrival: GuestArrivalManifestRow[];
    churchShuttle: ShuttleManifestRow[];
    receptionShuttle: ShuttleManifestRow[];
    departure: DepartureManifestRow[];
  };
  roomingList: HotelRoomingManifestRow[];
  vipAssistance: VipElderlyManifestRow[];
  openCriticalIssues: LiveIssue[];
  closeoutItems: CloseoutItem[];
  venueDetails: OfflineVenueDetails;
}

export const OFFLINE_PACK_STALE_THRESHOLD_HOURS = 6;
