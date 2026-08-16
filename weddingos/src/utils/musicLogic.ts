import type { MusicAVPlan, MusicCue } from '@/types';

const CEREMONY_CUE_TYPES: MusicCue['cueType'][] = ['Processional', 'Hymn', 'Psalm', 'Recessional'];

export function isCeremonyMusicApproved(cues: MusicCue[]): boolean {
  const ceremonyCues = cues.filter((c) => CEREMONY_CUE_TYPES.includes(c.cueType));
  return ceremonyCues.length > 0 && ceremonyCues.every((c) => c.approved);
}

/** Section 28: soundcheck hasn't happened yet and the event is within 48 hours. */
export function isSoundcheckOverdue(plan: MusicAVPlan, eventDateTimeISO: string, referenceDateTimeISO: string = new Date().toISOString()): boolean {
  const eventTime = new Date(eventDateTimeISO).getTime();
  const now = new Date(referenceDateTimeISO).getTime();
  if (Number.isNaN(eventTime) || Number.isNaN(now)) return false;
  const hoursUntilEvent = (eventTime - now) / (1000 * 60 * 60);
  if (hoursUntilEvent > 48 || hoursUntilEvent < -48) return false;

  if (!plan.soundcheckDate) return true;
  const soundcheckTime = new Date(`${plan.soundcheckDate}T${plan.soundcheckTime ?? '00:00'}:00`).getTime();
  return Number.isNaN(soundcheckTime) || soundcheckTime > now;
}

/** Section 28 warnings for the music/AV plan, given the cues that feed into it. */
export function computeMusicAVPlanWarnings(plan: MusicAVPlan, cues: MusicCue[], eventDateTimeISO: string, referenceDateTimeISO: string = new Date().toISOString()): string[] {
  const warnings: string[] = [];

  if (!isCeremonyMusicApproved(cues)) warnings.push('Ceremony music not approved.');
  if (plan.choirVendorId && !cues.some((c) => CEREMONY_CUE_TYPES.includes(c.cueType) && c.approved)) {
    warnings.push('Choir required but not confirmed.');
  }
  if (isSoundcheckOverdue(plan, eventDateTimeISO, referenceDateTimeISO)) warnings.push('Soundcheck incomplete within 48 hours of the event.');
  if (!plan.emceeName) warnings.push('Emcee not assigned.');
  if (!plan.backupMicrophones) warnings.push('Backup microphone unavailable.');
  if (!plan.offlinePlaylistReady) warnings.push('Offline playlist not ready.');
  // No dedicated pronunciation-confirmation field exists; notes being on file is treated as the confirmation record.
  if (plan.emceeName && !plan.notes?.trim()) warnings.push('Name pronunciations/script not confirmed for the emcee.');

  return warnings;
}
