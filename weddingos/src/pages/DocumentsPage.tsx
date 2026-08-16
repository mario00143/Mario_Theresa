import { useCallback, useEffect, useRef, useState } from 'react';
import type { DocumentCategory, DocumentRecord } from '@/types';
import { DOCUMENT_CATEGORIES } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermission } from '@/hooks/usePermission';
import { deleteDocument, getDocumentSignedUrl, listDocuments, uploadDocument, validateDocumentFile } from '@/data/supabase/documentRepository';
import { logAuditAction } from '@/data/supabase/auditLogRepository';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, FieldError, Input, Label, Select } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FolderLock } from 'lucide-react';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentsPage() {
  const { supabaseEnabled, profile } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { can, reason } = usePermission();
  const canUpload = can('documents').write;

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'All'>('All');
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('Other');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocumentRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    try {
      const filter = categoryFilter === 'All' ? undefined : { category: categoryFilter };
      setDocuments(await listDocuments(filter));
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, categoryFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!supabaseEnabled) {
    return (
      <EmptyState
        icon={<FolderLock className="size-8" />}
        title="Document storage requires Supabase"
        description="Private file storage for contracts, invoices, and receipts is available once this workspace is connected to Supabase. See Settings for setup — Demo/Local Mode keeps working exactly as before without it."
      />
    );
  }

  if (!currentWorkspace) return null;

  async function handleFileSelected(file: File) {
    setUploadError(null);
    const validationError = validateDocumentFile(file);
    if (validationError) {
      setUploadError(validationError.message);
      return;
    }
    setUploading(true);
    try {
      const doc = await uploadDocument({ file, category: uploadCategory, title: uploadTitle || file.name });
      logAuditAction({
        action: 'document.upload',
        entityType: 'DocumentRecord',
        entityId: doc.id,
        summary: `Uploaded "${doc.title}" (${uploadCategory})`,
      });
      setUploadTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await load();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(doc: DocumentRecord) {
    const url = await getDocumentSignedUrl(doc.storagePath);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function confirmDelete() {
    if (!deleteTarget || !profile) return;
    await deleteDocument(deleteTarget, profile.id);
    logAuditAction({
      action: 'document.delete',
      entityType: 'DocumentRecord',
      entityId: deleteTarget.id,
      summary: `Deleted "${deleteTarget.title}"`,
    });
    setDeleteTarget(null);
    await load();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-ink text-xl font-semibold">Documents</h1>
        <p className="text-ink-faint mt-0.5 text-sm">Contracts, invoices, receipts, and other wedding reference documents — private to this workspace.</p>
      </div>

      {canUpload ? (
        <Card className="space-y-3 p-4">
          <h2 className="text-ink text-sm font-semibold">Upload a document</h2>
          <div className="flex flex-wrap items-end gap-3">
            <Field className="w-40">
              <Label htmlFor="uploadCategory">Category</Label>
              <Select id="uploadCategory" value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </Field>
            <Field className="min-w-48 flex-1">
              <Label htmlFor="uploadTitle">Title (optional)</Label>
              <Input id="uploadTitle" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Defaults to file name" />
            </Field>
            <Field className="w-56">
              <Label htmlFor="uploadFile">File</Label>
              <input
                id="uploadFile"
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.txt"
                disabled={uploading}
                onChange={(e) => e.target.files?.[0] && void handleFileSelected(e.target.files[0])}
                className="text-ink-soft text-sm"
              />
            </Field>
          </div>
          <FieldError>{uploadError}</FieldError>
          <p className="text-ink-faint text-xs">PDF, JPG, PNG, DOCX, XLSX, or TXT — up to 10MB. {uploading && 'Uploading…'}</p>
        </Card>
      ) : (
        <p className="text-ink-faint text-xs">{reason('documents')}</p>
      )}

      <div className="flex items-center gap-2">
        <Label htmlFor="categoryFilter">Filter</Label>
        <Select id="categoryFilter" className="w-48" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as DocumentCategory | 'All')}>
          <option value="All">All categories</option>
          {DOCUMENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <p className="text-ink-faint text-sm">Loading…</p>
      ) : documents.length === 0 ? (
        <EmptyState icon={<FolderLock className="size-8" />} title="No documents yet" description="Upload a contract, invoice, or receipt to get started." />
      ) : (
        <Card className="divide-line-soft divide-y p-0">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="text-ink truncate text-sm font-medium">{doc.title}</p>
                <p className="text-ink-faint truncate text-xs">
                  {doc.category} · {formatFileSize(doc.fileSize)} · {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="secondary" onClick={() => void handleDownload(doc)}>
                  Download
                </Button>
                {canUpload && (
                  <Button size="sm" variant="danger" onClick={() => setDeleteTarget(doc)}>
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete document"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        danger
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
