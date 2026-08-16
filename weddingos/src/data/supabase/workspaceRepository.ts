import type { NewWorkspaceInput, Workspace } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { genericFromRow, genericToRow } from '@/data/adapters/genericMapper';
import type { Json } from '@/lib/supabase/database.types';

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured.');
  return client;
}

/** Bootstraps a workspace + the creator's Admin membership + default settings atomically via RPC (section 17). */
export async function createWorkspace(input: NewWorkspaceInput): Promise<string> {
  const slug =
    input.slug ??
    input.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
      '-' +
      Math.random().toString(36).slice(2, 7);

  const { data, error } = await requireClient().rpc('create_workspace_with_admin', {
    p_name: input.name,
    p_slug: slug,
    p_groom_name: input.groomName,
    p_bride_name: input.brideName,
    p_timezone: input.timezone,
    p_currency: input.currency,
    p_engagement_date: input.engagementDate ?? null,
    p_wedding_date: input.weddingDate ?? null,
  });
  if (error) throw error;
  return data as string;
}

/** Workspaces the current user has an active membership in (RLS already scopes this — no extra filter needed). */
export async function listMyWorkspaces(): Promise<Workspace[]> {
  const { data, error } = await requireClient().from('workspaces').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => genericFromRow<Workspace>(row as Record<string, Json>));
}

export async function getWorkspace(id: string): Promise<Workspace | undefined> {
  const { data, error } = await requireClient().from('workspaces').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? genericFromRow<Workspace>(data as Record<string, Json>) : undefined;
}

export async function updateWorkspace(id: string, patch: Partial<Workspace>): Promise<Workspace> {
  const row = genericToRow(patch as Record<string, unknown>, '', null);
  delete row.workspace_id; // Workspace IS the scope, not scoped by one
  const { data, error } = await requireClient().from('workspaces').update(row).eq('id', id).select().single();
  if (error) throw error;
  return genericFromRow<Workspace>(data as Record<string, Json>);
}

/**
 * Workspace deletion is deliberately NOT exposed anywhere in the UI this
 * phase (section 70: "if not implemented, mark as unsupported rather than
 * unsafe"). A DB-level delete policy exists (Admin only) as a safety net,
 * but no client call site should ever invoke it without a much more
 * careful confirm-by-typing-the-name flow than this phase has time to
 * build and test properly.
 */
