import type { EventScope } from './task';

export interface PhotographyPlan {
  id: string;
  event: EventScope;
  vendorId?: string;
  coverageStart?: string;
  coverageEnd?: string;
  photographerCount?: number;
  videographerCount?: number;
  droneRequired: boolean;
  liveStreamingRequired: boolean;
  sameDayEditRequired: boolean;
  rawFilesIncluded: boolean;
  albumIncluded: boolean;
  highlightsVideoIncluded: boolean;
  fullFilmIncluded: boolean;
  churchRestrictionsConfirmed: boolean;
  deliveryDueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
