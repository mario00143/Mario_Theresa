import type { AppSettings } from '@/types';
import { settingsStore } from '../stores';

export function updateSettings(patch: Partial<AppSettings>): void {
  settingsStore.set((prev) => ({
    ...prev,
    ...patch,
    couple: { ...prev.couple, ...patch.couple },
    engagement: { ...prev.engagement, ...patch.engagement },
    wedding: { ...prev.wedding, ...patch.wedding },
    weddingDetails: { ...prev.weddingDetails, ...patch.weddingDetails },
  }));
}

export function replaceSettings(next: AppSettings): void {
  settingsStore.set(next);
}
