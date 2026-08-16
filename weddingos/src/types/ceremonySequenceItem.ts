export const CEREMONY_SEQUENCE_STATUSES = ['Planned', 'Confirmed', 'Rehearsed', 'Complete'] as const;
export type CeremonySequenceStatus = (typeof CEREMONY_SEQUENCE_STATUSES)[number];

/** Ordering is driven purely by sequenceOrder — reordered via up/down controls, not drag/drop. */
export interface CeremonySequenceItem {
  id: string;
  sequenceOrder: number;
  title: string;
  description?: string;
  plannedTime?: string;
  relativeTime?: string;
  location?: string;
  owner?: string;
  participants: string[];
  requiredItems: string[];
  musicCueId?: string;
  notes?: string;
  status: CeremonySequenceStatus;
  createdAt: string;
  updatedAt: string;
}
