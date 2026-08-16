import type { WeddingOSBackup, WorkspaceRole } from '@/types';
import { exportBackup } from '@/data/repositories/backupRepository';
import { canRead } from '@/utils/permissions';
import { listDocuments } from './documentRepository';
import { getWorkspace } from './workspaceRepository';

const FINANCE_COLLECTIONS = ['vendorQuotes', 'contracts', 'budgetCategories', 'budgetItems', 'paymentSchedules', 'payments', 'refunds'] as const;

/**
 * The Supabase-aware v7 export (section 60): starts from the same local
 * snapshot exportBackup() already produces (Demo Mode's export is a
 * subset of this), then adds workspace metadata and document metadata,
 * and redacts finance collections for a role that cannot read finance —
 * a Viewer's export never contains payment/budget data even though the
 * underlying local store technically still has it hydrated in memory.
 */
export async function exportWorkspaceBackup(workspaceId: string, role: WorkspaceRole | undefined): Promise<WeddingOSBackup> {
  const backup = exportBackup();
  const workspace = await getWorkspace(workspaceId);
  const documents = await listDocuments();

  const redactedSections: string[] = [];
  if (!canRead(role, 'finance')) {
    for (const key of FINANCE_COLLECTIONS) {
      (backup as unknown as Record<string, unknown>)[key] = [];
      redactedSections.push(key);
    }
  }

  return {
    ...backup,
    workspace: workspace
      ? {
          name: workspace.name,
          slug: workspace.slug,
          groomName: workspace.groomName,
          brideName: workspace.brideName,
          timezone: workspace.timezone,
          currency: workspace.currency,
          engagementDate: workspace.engagementDate,
          weddingDate: workspace.weddingDate,
        }
      : undefined,
    documents,
    redactedSections: redactedSections.length > 0 ? redactedSections : undefined,
  };
}
