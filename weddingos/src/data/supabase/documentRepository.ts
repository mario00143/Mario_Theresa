import type { DocumentCategory, DocumentRecord, DocumentRelatedEntityType } from '@/types';
import { ALLOWED_DOCUMENT_MIME_TYPES, DEFAULT_MAX_DOCUMENT_SIZE_BYTES } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getRuntimeSession } from '@/lib/runtimeSession';
import { genericFromRow } from '@/data/adapters/genericMapper';
import type { Json } from '@/lib/supabase/database.types';
import { buildDocumentStoragePath } from '@/data/documents/storagePath';

const BUCKET = 'documents';

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured.');
  return client;
}

function requireWorkspaceId(): string {
  const { workspaceId } = getRuntimeSession();
  if (!workspaceId) throw new Error('No active workspace selected.');
  return workspaceId;
}

export interface DocumentValidationError {
  reason: 'type' | 'size';
  message: string;
}

/** Client-side pre-check only — the storage bucket's own file_size_limit/allowed_mime_types (section 39) is what's actually authoritative. */
export function validateDocumentFile(file: File): DocumentValidationError | null {
  if (!(ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(file.type)) {
    return { reason: 'type', message: `"${file.type || 'unknown'}" files are not allowed. Allowed: PDF, JPG, PNG, DOCX, XLSX, TXT.` };
  }
  if (file.size > DEFAULT_MAX_DOCUMENT_SIZE_BYTES) {
    return { reason: 'size', message: `File is too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum is 10MB.` };
  }
  return null;
}

export interface UploadDocumentInput {
  file: File;
  category: DocumentCategory;
  title: string;
  relatedEntityType?: DocumentRelatedEntityType;
  relatedEntityId?: string;
  notes?: string;
}

export async function uploadDocument(input: UploadDocumentInput): Promise<DocumentRecord> {
  const validationError = validateDocumentFile(input.file);
  if (validationError) throw new Error(validationError.message);

  const client = requireClient();
  const workspaceId = requireWorkspaceId();
  const { userId } = getRuntimeSession();
  if (!userId) throw new Error('Not signed in.');

  const storagePath = buildDocumentStoragePath(workspaceId, input.category, input.file.name);
  const { error: uploadError } = await client.storage.from(BUCKET).upload(storagePath, input.file, {
    contentType: input.file.type,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data, error } = await client
    .from('documents')
    .insert({
      workspace_id: workspaceId,
      category: input.category,
      title: input.title,
      storage_path: storagePath,
      mime_type: input.file.type,
      file_size: input.file.size,
      related_entity_type: input.relatedEntityType ?? null,
      related_entity_id: input.relatedEntityId ?? null,
      uploaded_by: userId,
      notes: input.notes ?? null,
    } as never)
    .select()
    .single();
  if (error) {
    // Best-effort cleanup so a failed metadata insert doesn't leave an orphaned file.
    await client.storage.from(BUCKET).remove([storagePath]);
    throw error;
  }
  return genericFromRow<DocumentRecord>(data as Record<string, Json>);
}

export async function listDocuments(filter?: { category?: DocumentCategory; relatedEntityType?: DocumentRelatedEntityType; relatedEntityId?: string }): Promise<DocumentRecord[]> {
  let query = requireClient().from('documents').select('*').eq('workspace_id', requireWorkspaceId()).is('deleted_at', null);
  if (filter?.category) query = query.eq('category', filter.category);
  if (filter?.relatedEntityType) query = query.eq('related_entity_type', filter.relatedEntityType);
  if (filter?.relatedEntityId) query = query.eq('related_entity_id', filter.relatedEntityId);
  const { data, error } = await query.order('uploaded_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => genericFromRow<DocumentRecord>(row as Record<string, Json>));
}

/** Signed URLs are short-lived (10 minutes) and generated on demand — no permanent public URL is ever created (section 39). */
export async function getDocumentSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await requireClient().storage.from(BUCKET).createSignedUrl(storagePath, 600);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteDocument(document: DocumentRecord, deletedBy: string): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from('documents')
    .update({ deleted_at: new Date().toISOString(), deleted_by: deletedBy } as never)
    .eq('id', document.id);
  if (error) throw error;
  await client.storage.from(BUCKET).remove([document.storagePath]);
}
