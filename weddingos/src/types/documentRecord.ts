export const DOCUMENT_CATEGORIES = [
  'Contract',
  'Quote',
  'Invoice',
  'Receipt',
  'Church',
  'Venue',
  'Vendor',
  'Travel',
  'Other',
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

/** Entities a document can optionally be linked to (section 42). */
export const DOCUMENT_RELATED_ENTITY_TYPES = [
  'Vendor',
  'VendorQuote',
  'Contract',
  'BudgetItem',
  'Payment',
  'Refund',
  'ChurchRequirement',
  'TravelSegment',
  'WeddingPrepItem',
] as const;
export type DocumentRelatedEntityType = (typeof DOCUMENT_RELATED_ENTITY_TYPES)[number];

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
] as const;

/** Default per-file size limit — configurable via WeddingDaySettings-style app settings, not hardcoded elsewhere. */
export const DEFAULT_MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Metadata only — the binary itself lives in Supabase Storage at
 * `storagePath` (private bucket). Never store file contents in this table
 * or in a localStorage-backed record.
 */
export interface DocumentRecord {
  id: string;
  workspaceId: string;
  category: DocumentCategory;
  title: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  relatedEntityType?: DocumentRelatedEntityType;
  relatedEntityId?: string;
  uploadedBy: string;
  uploadedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deletedBy?: string;
}
