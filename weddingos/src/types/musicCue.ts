import type { EventScope } from './task';

export const MUSIC_CUE_TYPES = [
  'Processional',
  'Hymn',
  'Psalm',
  'Recessional',
  'Couple Entrance',
  'Cake Cutting',
  'First Dance',
  'Dinner',
  'Speech Transition',
  'Closing',
  'Other',
] as const;
export type MusicCueType = (typeof MUSIC_CUE_TYPES)[number];

export interface MusicCue {
  id: string;
  event: EventScope;
  cueType: MusicCueType;
  title: string;
  performer?: string;
  linkedVendorId?: string;
  plannedTime?: string;
  sequenceOrder: number;
  approved: boolean;
  backupAvailable: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
