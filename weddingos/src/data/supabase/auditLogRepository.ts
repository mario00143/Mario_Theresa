import type { AuditLog } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getRuntimeSession } from '@/lib/runtimeSession';
import { genericFromRow } from '@/data/adapters/genericMapper';
import type { Json } from '@/lib/supabase/database.types';

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured.');
  return client;
}

export interface LogActionInput {
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata?: Record<string, string | number | boolean | null>;
}

/**
 * Fire-and-forget audit write (section 43). Deliberately swallows errors
 * rather than throwing — an audit-log failure should never block the
 * primary user action it's describing. Silently a no-op outside Supabase
 * mode (nothing to audit locally; Demo Mode has no shared workspace).
 */
export function logAuditAction(input: LogActionInput): void {
  const client = getSupabaseClient();
  const { workspaceId, userId } = getRuntimeSession();
  if (!client || !workspaceId || !userId) return;
  void client
    .from('audit_logs')
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      summary: input.summary,
      metadata: input.metadata ?? null,
    } as never)
    .then(({ error }) => {
      if (error) console.error('Audit log write failed:', error.message);
    });
}

export interface AuditLogFilter {
  userId?: string;
  action?: string;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
}

export async function listAuditLogs(workspaceId: string, filter?: AuditLogFilter): Promise<AuditLog[]> {
  let query = requireClient().from('audit_logs').select('*').eq('workspace_id', workspaceId);
  if (filter?.userId) query = query.eq('user_id', filter.userId);
  if (filter?.action) query = query.eq('action', filter.action);
  if (filter?.entityType) query = query.eq('entity_type', filter.entityType);
  if (filter?.fromDate) query = query.gte('created_at', filter.fromDate);
  if (filter?.toDate) query = query.lte('created_at', filter.toDate);
  const { data, error } = await query.order('created_at', { ascending: false }).limit(500);
  if (error) throw error;
  return (data ?? []).map((row) => genericFromRow<AuditLog>(row as Record<string, Json>));
}
