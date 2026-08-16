import type { AppSettings } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured.');
  return client;
}

interface SettingsRow {
  couple: unknown;
  engagement: unknown;
  wedding: unknown;
  wedding_details: unknown;
  finance: unknown;
  wedding_prep: unknown;
  wedding_day: unknown;
}

function rowToSettings(row: SettingsRow): AppSettings {
  return {
    couple: row.couple as AppSettings['couple'],
    engagement: row.engagement as AppSettings['engagement'],
    wedding: row.wedding as AppSettings['wedding'],
    weddingDetails: row.wedding_details as AppSettings['weddingDetails'],
    finance: row.finance as AppSettings['finance'],
    weddingPrep: row.wedding_prep as AppSettings['weddingPrep'],
    weddingDay: row.wedding_day as AppSettings['weddingDay'],
  };
}

function settingsToRow(settings: AppSettings): SettingsRow {
  return {
    couple: settings.couple,
    engagement: settings.engagement,
    wedding: settings.wedding,
    wedding_details: settings.weddingDetails,
    finance: settings.finance,
    wedding_prep: settings.weddingPrep,
    wedding_day: settings.weddingDay,
  };
}

export async function fetchWorkspaceSettings(workspaceId: string): Promise<AppSettings | undefined> {
  const { data, error } = await requireClient()
    .from('workspace_settings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToSettings(data as unknown as SettingsRow) : undefined;
}

export async function saveWorkspaceSettings(workspaceId: string, settings: AppSettings): Promise<void> {
  const { error } = await requireClient()
    .from('workspace_settings')
    .update(settingsToRow(settings) as never)
    .eq('workspace_id', workspaceId);
  if (error) throw error;
}
