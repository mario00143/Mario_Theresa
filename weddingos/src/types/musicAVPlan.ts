import type { EventScope } from './task';

export interface MusicAVPlan {
  id: string;
  event: EventScope;
  choirVendorId?: string;
  djVendorId?: string;
  avVendorId?: string;
  emceeName?: string;
  emceePhone?: string;
  microphoneCount?: number;
  backupMicrophones?: number;
  soundcheckDate?: string;
  soundcheckTime?: string;
  podiumRequired: boolean;
  offlinePlaylistReady: boolean;
  backupBatteriesReady: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
