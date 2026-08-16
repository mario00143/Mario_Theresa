import type { EventScope } from './task';

export const PHOTO_GROUP_PRIORITIES = ['Must Have', 'Important', 'Nice to Have'] as const;
export type PhotoGroupPriority = (typeof PHOTO_GROUP_PRIORITIES)[number];

export interface PhotoGroup {
  id: string;
  event: EventScope;
  groupName: string;
  sequenceOrder: number;
  participants: string[];
  coordinator?: string;
  location?: string;
  priority: PhotoGroupPriority;
  completed: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
