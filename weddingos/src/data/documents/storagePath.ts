import type { DocumentCategory } from '@/types';

/** `<workspace_id>/<category>/<uuid>-<filename>` — the folder layout the storage RLS policies (section 40) key off of. */
export function buildDocumentStoragePath(workspaceId: string, category: DocumentCategory, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniquePrefix = crypto.randomUUID();
  return `${workspaceId}/${category}/${uniquePrefix}-${safeName}`;
}
