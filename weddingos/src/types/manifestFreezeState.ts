export const MANIFEST_TYPES = ['Rooming List', 'Pickup Manifest', 'Shuttle Manifest', 'Drop Manifest', 'Duty Roster'] as const;
export type ManifestType = (typeof MANIFEST_TYPES)[number];

/** One row per manifest type — whether it's frozen, and by whom (section 22). Freezing warns before edits but never blocks them. */
export interface ManifestFreezeState {
  id: string;
  manifestType: ManifestType;
  frozen: boolean;
  frozenAt?: string;
  frozenBy?: string;
  createdAt: string;
  updatedAt: string;
}
